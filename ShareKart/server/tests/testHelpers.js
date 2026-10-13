/**
 * Test Helpers for Synthetic Aadhaar Document Generation
 * Creates synthetic cryptographic certificates, signed XML documents, and ZIP archives.
 * NEVER uses real personal data or production keys.
 */

import crypto from 'crypto';
import AdmZip from 'adm-zip';
import { SignedXml } from 'xml-crypto';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Generates an RSA key pair and a self-signed X.509 certificate for testing
 */
export function generateTestCertAndKey(commonName = 'UIDAI Test Signer CA') {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048
  });

  const privKeyPem = privateKey.export({ type: 'pkcs1', format: 'pem' });
  const pubKeyPem = publicKey.export({ type: 'pkcs1', format: 'pem' });

  // Generate self-signed X.509 certificate using Node crypto or openssl
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cert-test-'));
  const keyPath = path.join(tempDir, 'key.pem');
  const certPath = path.join(tempDir, 'cert.pem');

  fs.writeFileSync(keyPath, privKeyPem);
  execFileSync('openssl', [
    'req',
    '-new',
    '-x509',
    '-key', keyPath,
    '-out', certPath,
    '-days', '365',
    '-subj', `/C=IN/O=Unique Identification Authority of India/CN=${commonName}`
  ]);

  const certPem = fs.readFileSync(certPath, 'utf8');
  const x509 = new crypto.X509Certificate(certPem);

  // Clean up
  fs.rmSync(tempDir, { recursive: true, force: true });

  return {
    privateKeyPem: privKeyPem,
    publicKeyPem: pubKeyPem,
    certPem,
    x509Cert: x509
  };
}

/**
 * Creates an enveloped-signed synthetic Aadhaar Offline e-KYC XML
 */
export function createSignedAadhaarXml({
  name = 'Aarav Patel',
  referenceId = '48192026101312000000',
  dob = '01-01-1995',
  gender = 'M',
  pincode = '382010',
  privateKeyPem,
  certPem
}) {
  const rawXml = `<OfflinePaperlessKyc referenceId="${referenceId}">` +
    `<UidData>` +
      `<Poi dob="${dob}" gender="${gender}" name="${name}"/>` +
      `<Poa country="India" dist="Gandhinagar" pc="${pincode}" state="Gujarat"/>` +
    `</UidData>` +
  `</OfflinePaperlessKyc>`;

  const certBase64 = certPem
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s+/g, '');

  const sig = new SignedXml({
    privateKey: privateKeyPem,
    publicCert: certPem,
    canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
  });

  sig.addReference({
    xpath: '/*',
    transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256'
  });

  sig.computeSignature(rawXml);
  return sig.getSignedXml();
}

/**
 * Creates a synthetic ZIP file from an XML string
 */
export function createTestZip({ xmlString, shareCode = '', fileName = 'offlineaadhaar.xml' }) {
  if (!shareCode) {
    const zip = new AdmZip();
    zip.addFile(fileName, Buffer.from(xmlString, 'utf8'));
    return zip.toBuffer();
  }

  // Use 7z for password-encrypted ZIP
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zipgen-'));
  const xmlPath = path.join(tempDir, fileName);
  const zipPath = path.join(tempDir, 'output.zip');

  try {
    fs.writeFileSync(xmlPath, xmlString, 'utf8');
    execFileSync('7z', ['a', `-p${shareCode}`, zipPath, xmlPath], { stdio: 'ignore' });
    return fs.readFileSync(zipPath);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
