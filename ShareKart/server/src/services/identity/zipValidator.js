/**
 * Secure ZIP Archive Validator and Extractor
 * Provides robust Zip Slip protection, ZIP bomb limits, password handling, and isolated extraction.
 */

import AdmZip from 'adm-zip';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const MAX_UNCOMPRESSED_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const MAX_ENTRIES_COUNT = 5;                           // UIDAI zip contains 1 XML file

export class ZipSecurityError extends Error {
  constructor(message, code = 'INVALID_ARCHIVE') {
    super(message);
    this.name = 'ZipSecurityError';
    this.code = code;
  }
}

/**
 * Validates zip buffer headers and structure
 * @param {Buffer} buffer
 */
export function validateZipBuffer(buffer) {
  if (!buffer || buffer.length < 4) {
    throw new ZipSecurityError('Uploaded file is empty or corrupted', 'EMPTY_FILE');
  }

  // Magic bytes check for PKZIP (PK\x03\x04)
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
    throw new ZipSecurityError('File does not have a valid ZIP signature', 'INVALID_ZIP_MAGIC');
  }
}

/**
 * Inspects archive entries for Zip Slip (path traversal) and ZIP bomb vulnerabilities
 * @param {AdmZip} zip
 * @returns {Array<import('adm-zip').IZipEntry>}
 */
export function inspectZipEntries(zip) {
  const entries = zip.getEntries();

  if (entries.length === 0) {
    throw new ZipSecurityError('ZIP archive contains no files', 'EMPTY_ARCHIVE');
  }

  if (entries.length > MAX_ENTRIES_COUNT) {
    throw new ZipSecurityError(`ZIP archive contains too many files (${entries.length} > ${MAX_ENTRIES_COUNT})`, 'ZIP_BOMB_EXCESSIVE_ENTRIES');
  }

  let totalUncompressedSize = 0;
  let hasXmlFile = false;

  for (const entry of entries) {
    // Check path traversal / Zip Slip
    const entryName = entry.entryName;
    if (entryName.includes('..') || entryName.startsWith('/') || entryName.startsWith('\\') || path.isAbsolute(entryName)) {
      throw new ZipSecurityError(`Potential path traversal detected in archive entry: "${entryName}"`, 'ZIP_SLIP_ATTACK');
    }

    // Cumulative uncompressed size check (ZIP bomb mitigation)
    totalUncompressedSize += entry.header.size;
    if (totalUncompressedSize > MAX_UNCOMPRESSED_SIZE_BYTES) {
      throw new ZipSecurityError(`Decompressed size exceeds safety limit of 10MB`, 'ZIP_BOMB_OVERSIZED');
    }

    if (entryName.toLowerCase().endsWith('.xml')) {
      hasXmlFile = true;
    }
  }

  if (!hasXmlFile) {
    throw new ZipSecurityError('No XML identity document found in the ZIP archive', 'NO_XML_ENTRY');
  }

  return entries;
}

/**
 * Safely extracts XML content from an Aadhaar Offline e-KYC ZIP archive
 *
 * @param {Buffer} zipBuffer - Raw ZIP file bytes
 * @param {string} [shareCode] - 4-character Share Code
 * @returns {{ xmlContent: string, entryName: string, sizeBytes: number }}
 */
export function extractAadhaarXmlFromZip(zipBuffer, shareCode = '') {
  validateZipBuffer(zipBuffer);

  let zip;
  try {
    zip = new AdmZip(zipBuffer);
  } catch (err) {
    throw new ZipSecurityError(`Corrupted archive: ${err.message}`, 'MALFORMED_ZIP');
  }
  const entries = inspectZipEntries(zip);

  const xmlEntry = entries.find(e => e.entryName.toLowerCase().endsWith('.xml'));
  if (!xmlEntry) {
    throw new ZipSecurityError('No valid XML entry found in archive', 'NO_XML_ENTRY');
  }

  // If entry is not encrypted, read directly via AdmZip
  if (!xmlEntry.header.isEncrypted && !xmlEntry.header.encrypted) {
    try {
      const decompressed = zip.readAsText(xmlEntry);
      if (decompressed && decompressed.trim().length > 0) {
        return {
          xmlContent: decompressed,
          entryName: xmlEntry.entryName,
          sizeBytes: xmlEntry.header.size
        };
      }
    } catch (e) {
      // Continue to external decryption if standard read fails
    }
  }

  // Encrypted ZIP: UIDAI requires the 4-digit share code
  const cleanCode = (shareCode || '').trim();
  if (!cleanCode) {
    throw new ZipSecurityError('A 4-character share code is required to open this e-KYC archive', 'SHARE_CODE_REQUIRED');
  }

  // Isolated temp directory for decryption
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sharekart-ekyc-'));
  const tempZipPath = path.join(tempDir, 'archive.zip');

  try {
    fs.writeFileSync(tempZipPath, zipBuffer);

    // Use 7z to extract directly to stdout (-so) using safe argument array (no shell injection)
    try {
      const stdout = execFileSync('7z', [
        'e',
        `-p${cleanCode}`,
        '-so',
        tempZipPath,
        xmlEntry.entryName
      ], {
        maxBuffer: MAX_UNCOMPRESSED_SIZE_BYTES,
        timeout: 5000,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      const extractedText = stdout.toString('utf8');
      if (!extractedText || extractedText.trim().length === 0) {
        throw new ZipSecurityError('Decrypted XML document is empty', 'EMPTY_DECRYPTED_XML');
      }

      return {
        xmlContent: extractedText,
        entryName: xmlEntry.entryName,
        sizeBytes: Buffer.byteLength(extractedText)
      };
    } catch (execErr) {
      const stderr = (execErr.stderr || '').toString();
      if (execErr.status === 2 || stderr.includes('Wrong password') || stderr.includes('Can not open encrypted')) {
        throw new ZipSecurityError('Incorrect share code provided for this e-KYC archive', 'INVALID_SHARE_CODE');
      }
      throw new ZipSecurityError(`Failed to decrypt archive: ${execErr.message}`, 'DECRYPTION_FAILED');
    }
  } finally {
    // Guarantees thorough cleanup of temporary files
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.warn('[ZipValidator] Temp cleanup warning:', cleanupErr.message);
    }
  }
}
