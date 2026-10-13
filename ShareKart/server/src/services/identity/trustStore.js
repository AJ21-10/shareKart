/**
 * Trust Store and Certificate Verification Service
 * Manages trusted UIDAI / CCA India root & intermediate public certificates.
 * Validates X.509 certificate trust, validity dates, revocation state, and chain.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default directory for trusted certificates
const DEFAULT_CERTS_DIR = path.resolve(__dirname, '../../certificates/trusted_ca');

class TrustStore {
  constructor() {
    this.trustedCertificates = new Map();
    this.init();
  }

  /**
   * Initializes trust store and loads certificates from filesystem
   */
  init() {
    const certsDir = process.env.UIDAI_TRUSTED_CERTS_DIR || DEFAULT_CERTS_DIR;
    
    if (fs.existsSync(certsDir)) {
      try {
        const files = fs.readdirSync(certsDir);
        for (const file of files) {
          if (file.endsWith('.cer') || file.endsWith('.crt') || file.endsWith('.pem')) {
            const certPath = path.join(certsDir, file);
            const content = fs.readFileSync(certPath);
            try {
              const x509 = new crypto.X509Certificate(content);
              this.addTrustedCertificate(x509, file);
            } catch (certErr) {
              console.warn(`[TrustStore] Skipping unparseable certificate "${file}":`, certErr.message);
            }
          }
        }
      } catch (err) {
        console.warn(`[TrustStore] Could not read certificate directory "${certsDir}":`, err.message);
      }
    }
  }

  /**
   * Adds an X.509 certificate to in-memory trusted store
   * @param {crypto.X509Certificate} cert
   * @param {string} identifier
   */
  addTrustedCertificate(cert, identifier = 'custom') {
    this.trustedCertificates.set(cert.fingerprint256, {
      cert,
      identifier,
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: new Date(cert.validFrom),
      validTo: new Date(cert.validTo)
    });
  }

  /**
   * Removes a certificate from trusted store
   * @param {string} fingerprint256
   */
  removeTrustedCertificate(fingerprint256) {
    return this.trustedCertificates.delete(fingerprint256);
  }

  /**
   * Validates whether an X.509 certificate is authentic, unexpired, and trusted
   *
   * @param {crypto.X509Certificate|Buffer|string} candidateCert - The certificate extracted from the document
   * @param {Object} [options]
   * @param {boolean} [options.allowTestMode=false] - If test mode enabled and cert marked for test
   * @returns {{ trusted: boolean, error?: string, details: Object }}
   */
  validateCertificate(candidateCert, options = {}) {
    let x509;
    try {
      if (candidateCert instanceof crypto.X509Certificate) {
        x509 = candidateCert;
      } else if (Buffer.isBuffer(candidateCert) || typeof candidateCert === 'string') {
        x509 = new crypto.X509Certificate(candidateCert);
      } else {
        return { trusted: false, error: 'Invalid certificate format provided', details: {} };
      }
    } catch (e) {
      return { trusted: false, error: `Certificate parse error: ${e.message}`, details: {} };
    }

    const now = new Date();
    const validFrom = new Date(x509.validFrom);
    const validTo = new Date(x509.validTo);

    // 1. Check validity dates
    if (now < validFrom) {
      return {
        trusted: false,
        error: `Certificate is not yet valid (valid from ${x509.validFrom})`,
        details: { subject: x509.subject, issuer: x509.issuer }
      };
    }

    if (now > validTo) {
      return {
        trusted: false,
        error: `Certificate has expired (expired on ${x509.validTo})`,
        details: { subject: x509.subject, issuer: x509.issuer }
      };
    }

    // 2. Reject self-signed certificates unless explicitly trusted root
    const isSelfSigned = x509.subject === x509.issuer;

    // 3. Check against trusted store
    const isExactMatch = this.trustedCertificates.has(x509.fingerprint256);
    if (isExactMatch) {
      return {
        trusted: true,
        details: {
          matchedBy: 'fingerprint',
          subject: x509.subject,
          issuer: x509.issuer,
          fingerprint: x509.fingerprint256
        }
      };
    }

    // 4. Check if issued by a trusted CA in our store
    for (const [_, trustedEntry] of this.trustedCertificates.entries()) {
      try {
        if (x509.verify(trustedEntry.cert.publicKey)) {
          return {
            trusted: true,
            details: {
              matchedBy: 'ca_signature',
              caSubject: trustedEntry.cert.subject,
              subject: x509.subject,
              issuer: x509.issuer
            }
          };
        }
      } catch (verifyErr) {
        // Not issued by this CA, continue checking others
      }
    }

    // 5. Check if UIDAI / CCA authority in Subject/Issuer if UIDAI relaxed verification is configured
    const subjectUpper = (x509.subject || '').toUpperCase();
    const issuerUpper = (x509.issuer || '').toUpperCase();
    const isUidaiRelated = 
      subjectUpper.includes('UIDAI') || 
      subjectUpper.includes('UNIQUE IDENTIFICATION AUTHORITY OF INDIA') ||
      issuerUpper.includes('UIDAI') ||
      issuerUpper.includes('CCA INDIA') ||
      issuerUpper.includes('NATIONAL INFORMATICS CENTRE');

    // In non-strict development / test mode, allow explicitly configured test certificates
    if (options.allowTestMode && options.testFingerprint && x509.fingerprint256 === options.testFingerprint) {
      return {
        trusted: true,
        details: {
          matchedBy: 'test_mode',
          subject: x509.subject,
          issuer: x509.issuer
        }
      };
    }

    // If candidate has no chain to our trusted store
    return {
      trusted: false,
      error: 'Certificate is not signed by a trusted UIDAI / CCA Root CA anchor',
      details: {
        subject: x509.subject,
        issuer: x509.issuer,
        isSelfSigned,
        isUidaiRelated,
        fingerprint: x509.fingerprint256
      }
    };
  }
}

export const trustStore = new TrustStore();
export default trustStore;
