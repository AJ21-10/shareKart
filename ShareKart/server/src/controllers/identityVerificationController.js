/**
 * Identity Verification Controller
 * Handles verification sessions, document upload and validation, status retrieval, and session cancellation.
 */

import db from '../config/db.js';
import { processVerificationDocument } from '../services/identity/documentProcessor.js';

/**
 * Creates a new identity verification session
 * POST /api/identity-verification/sessions
 */
export const createSession = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user is already verified
    const user = await db.get('SELECT is_aadhaar_verified, aadhaar_hash, aadhaar_number FROM users WHERE id = ?', [userId]);
    if (user?.is_aadhaar_verified) {
      return res.status(200).json({
        success: true,
        status: 'verified',
        message: 'Account is already verified with UIDAI Aadhaar',
        aadhaar_hash: user.aadhaar_hash,
        aadhaar_number: user.aadhaar_number
      });
    }

    // Expire any dangling uncompleted sessions older than 30 minutes
    await db.run(`
      UPDATE identity_verifications
      SET status = 'cancelled', failure_reason = 'Session timed out'
      WHERE user_id = ? AND status IN ('not_started', 'in_progress', 'pending')
        AND created_at < NOW() - INTERVAL '30 minutes'
    `, [userId]);

    // Create a new verification session
    const insertResult = await db.run(`
      INSERT INTO identity_verifications (user_id, status, expires_at)
      VALUES (?, 'in_progress', NOW() + INTERVAL '30 minutes')
      RETURNING id, user_id, status, created_at, expires_at
    `, [userId]);

    const session = insertResult.rows?.[0] || await db.get(`
      SELECT id, user_id, status, created_at, expires_at
      FROM identity_verifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    res.status(201).json({
      success: true,
      message: 'Identity verification session initiated',
      session: {
        id: session.id,
        status: session.status,
        expiresAt: session.expires_at,
        instructions: {
          officialPortalUrl: 'https://myaadhaarbeta.uidai.gov.in/genericDownloadAadhaar/en',
          supportedFormats: ['Offline Paperless e-KYC (.zip containing .xml)', 'e-Aadhaar (.pdf)'],
          shareCodeHint: '4-digit code set during UIDAI download',
          pdfPasswordHint: 'First 4 letters of your name in CAPITAL + Year of Birth YYYY (e.g. AARA1998)'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the authenticated user's current identity verification status
 * GET /api/identity-verification/status
 */
export const getStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await db.get(
      'SELECT id, name, is_aadhaar_verified, aadhaar_hash, aadhaar_number FROM users WHERE id = ?',
      [userId]
    );

    const latestVerification = await db.get(`
      SELECT id, status, verification_method, document_type, reference_id,
             masked_aadhaar, aadhaar_hash, name_matched, extracted_name,
             name_match_score, failure_reason, verified_at, created_at, updated_at
      FROM identity_verifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    const recentAttempts = await db.all(`
      SELECT id, document_type, outcome, error_code, error_message, created_at
      FROM identity_verification_attempts
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]);

    const effectiveStatus = user.is_aadhaar_verified 
      ? 'verified' 
      : (latestVerification ? latestVerification.status : 'not_started');

    res.json({
      success: true,
      status: effectiveStatus,
      isVerified: Boolean(user.is_aadhaar_verified),
      user: {
        id: user.id,
        name: user.name,
        maskedAadhaar: user.aadhaar_number || latestVerification?.masked_aadhaar || null,
        aadhaarHash: user.aadhaar_hash || latestVerification?.aadhaar_hash || null,
      },
      latestSession: latestVerification || null,
      recentAttempts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Uploads an Aadhaar identity document for cryptographic verification
 * POST /api/identity-verification/document
 */
export const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fileData, fileName, sessionId, shareCode, documentPassword } = req.body;

    if (!fileData) {
      return res.sendError(400, 'File data is required (base64 encoded string)', null, 'MISSING_FILE');
    }

    // Rate-limiting check: max 10 attempts in last 15 minutes per user
    const recentAttempts = await db.get(`
      SELECT COUNT(*) as count FROM identity_verification_attempts
      WHERE user_id = ? AND created_at > NOW() - INTERVAL '15 minutes'
    `, [userId]);

    if (recentAttempts && Number(recentAttempts.count) >= 10) {
      return res.sendError(429, 'Too many verification attempts. Please wait 15 minutes before retrying.', null, 'RATE_LIMITED');
    }

    // Decode base64 buffer
    let fileBuffer;
    try {
      const cleanBase64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      fileBuffer = Buffer.from(cleanBase64, 'base64');
    } catch (decodeErr) {
      return res.sendError(400, 'Invalid base64 document encoding', null, 'INVALID_BASE64');
    }

    // Ensure session exists or create one
    let activeSessionId = sessionId;
    if (activeSessionId) {
      const existingSession = await db.get(
        'SELECT id, status FROM identity_verifications WHERE id = ? AND user_id = ?',
        [activeSessionId, userId]
      );
      if (!existingSession) {
        return res.sendError(404, 'Verification session not found or does not belong to you', null, 'SESSION_NOT_FOUND');
      }
      if (existingSession.status === 'cancelled') {
        return res.sendError(400, 'This verification session was cancelled. Please start a new session.', null, 'SESSION_CANCELLED');
      }
    } else {
      const newSession = await db.run(`
        INSERT INTO identity_verifications (user_id, status)
        VALUES (?, 'in_progress')
        RETURNING id
      `, [userId]);
      activeSessionId = newSession.rows?.[0]?.id || newSession.lastInsertRowid;
    }

    // Process document through secure pipeline
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const result = await processVerificationDocument({
      user: req.user,
      sessionId: activeSessionId,
      fileBuffer,
      fileName: fileName || 'document',
      shareCode,
      documentPassword,
      ipAddress: clientIp
    });

    res.json({
      success: result.success,
      status: result.status,
      message: result.message,
      maskedAadhaar: result.maskedAadhaar,
      aadhaarHash: result.aadhaarHash,
      nameMatched: result.nameMatched,
      nameMatchScore: result.nameMatchScore,
      verificationMethod: result.verificationMethod
    });

  } catch (error) {
    if (error.status && error.code) {
      return res.sendError(error.status, error.message, null, error.code);
    }
    next(error);
  }
};

/**
 * Finalizes a verified session
 * POST /api/identity-verification/sessions/:id/complete
 */
export const completeSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const session = await db.get(
      'SELECT id, status, masked_aadhaar, aadhaar_hash FROM identity_verifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!session) {
      return res.sendError(404, 'Verification session not found', null, 'NOT_FOUND');
    }

    if (session.status !== 'verified') {
      return res.sendError(400, `Cannot complete session in state "${session.status}". A verified document is required.`, null, 'NOT_VERIFIED');
    }

    res.json({
      success: true,
      message: 'Verification complete. Welcome to ShareKart Verified Trust Network!',
      maskedAadhaar: session.masked_aadhaar,
      aadhaarHash: session.aadhaar_hash
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancels an ongoing verification session
 * DELETE /api/identity-verification/sessions/:id
 */
export const cancelSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const session = await db.get(
      'SELECT id, status FROM identity_verifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!session) {
      return res.sendError(404, 'Verification session not found', null, 'NOT_FOUND');
    }

    if (session.status === 'verified') {
      return res.sendError(400, 'Cannot cancel an already completed and verified session', null, 'ALREADY_VERIFIED');
    }

    await db.run(`
      UPDATE identity_verifications
      SET status = 'cancelled', failure_reason = 'Cancelled by user', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [id, userId]);

    res.json({
      success: true,
      message: 'Verification session cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};
