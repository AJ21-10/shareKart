/**
 * XML and XML-DSig Digital Signature Verification Service
 * Secures against XXE injections, validates enveloped XML signatures,
 * verifies X.509 trust chain, and extracts demographic identity fields.
 */

import crypto from 'crypto';
import xpath from 'xpath';
import { DOMParser } from '@xmldom/xmldom';
import { SignedXml } from 'xml-crypto';
import { XMLParser } from 'fast-xml-parser';
import trustStore from './trustStore.js';

export class XmlSecurityError extends Error {
  constructor(message, code = 'INVALID_XML') {
    super(message);
    this.name = 'XmlSecurityError';
    this.code = code;
  }
}

/**
 * Checks for XML external entity (XXE) and billion laughs injection vectors
 * @param {string} xmlString
 */
export function sanitizeXmlInput(xmlString) {
  if (!xmlString || typeof xmlString !== 'string') {
    throw new XmlSecurityError('XML content is empty or invalid', 'EMPTY_XML');
  }

  // Detect DOCTYPE and ENTITY declarations
  const lower = xmlString.toLowerCase();
  if (lower.includes('<!doctype') || lower.includes('<!entity') || lower.includes('system') && lower.includes('http')) {
    throw new XmlSecurityError('XML contains prohibited DOCTYPE or ENTITY declaration (XXE mitigation)', 'XXE_PAYLOAD_DETECTED');
  }

  // Check reasonable size limit (max 5 MB for XML document)
  if (Buffer.byteLength(xmlString, 'utf8') > 5 * 1024 * 1024) {
    throw new XmlSecurityError('XML payload exceeds maximum size limit (5MB)', 'XML_TOO_LARGE');
  }
}

/**
 * Parses and cryptographically validates an Aadhaar Paperless Offline e-KYC XML document
 *
 * @param {string} xmlString - Raw XML content
 * @param {Object} [options]
 * @param {boolean} [options.allowTestMode=false] - For test suites using ephemeral test keys
 * @param {string} [options.testPublicKeyPem]
 * @param {string} [options.testFingerprint]
 * @returns {Promise<{ isValid: boolean, identity: Object, certInfo: Object, errors?: Array<string> }>}
 */
export async function verifyAadhaarXml(xmlString, options = {}) {
  sanitizeXmlInput(xmlString);

  // 1. Fast XML parsing to validate structure
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });

  let parsed;
  try {
    parsed = parser.parse(xmlString);
  } catch (parseErr) {
    throw new XmlSecurityError(`Malformed XML syntax: ${parseErr.message}`, 'MALFORMED_XML');
  }

  const root = parsed.OfflinePaperlessKyc || parsed.KycRes;
  if (!root || !root.UidData) {
    throw new XmlSecurityError('XML does not conform to UIDAI Offline e-KYC structure', 'INVALID_SCHEMA');
  }

  const uidData = root.UidData;
  const poi = uidData.Poi || {};
  const poa = uidData.Poa || {};

  const residentName = poi['@_name'] || poi.name || '';
  const dob = poi['@_dob'] || poi.dob || '';
  const gender = poi['@_gender'] || poi.gender || '';
  const pincode = poa['@_pc'] || poa.pc || '';
  const state = poa['@_state'] || poa.state || '';
  const dist = poa['@_dist'] || poa.dist || '';
  const rawReferenceId = root['@_referenceId'] || root.referenceId || '';

  if (!residentName) {
    throw new XmlSecurityError('Aadhaar XML is missing resident name in Poi block', 'MISSING_NAME');
  }

  // Derive masked Aadhaar from referenceId if available (first 4 digits are last 4 of Aadhaar)
  let last4 = 'XXXX';
  if (rawReferenceId && rawReferenceId.length >= 4) {
    const candidateDigits = rawReferenceId.slice(0, 4);
    if (/^\d{4}$/.test(candidateDigits)) {
      last4 = candidateDigits;
    }
  }
  const maskedAadhaar = `XXXX-XXXX-${last4}`;

  // 2. Locate Signature node via DOMParser & XPath
  const dom = new DOMParser({
    onError: (level, msg) => {
      if (level === 'fatalError') {
        throw new XmlSecurityError(`Fatal XML error: ${msg}`, 'XML_FATAL_ERROR');
      }
    }
  }).parseFromString(xmlString, 'text/xml');

  const select = xpath.useNamespaces({ ds: 'http://www.w3.org/2000/09/xmldsig#' });
  const sigNodes = select('//ds:Signature', dom);

  if (!sigNodes || sigNodes.length === 0) {
    throw new XmlSecurityError('Aadhaar XML contains no digital signature (Signature element missing)', 'MISSING_SIGNATURE');
  }

  const sigNode = sigNodes[0];

  // 3. Extract Certificate from KeyInfo
  const certNodes = select('.//ds:KeyInfo//ds:X509Certificate', sigNode);
  let certificatePem = '';
  let x509Cert = null;

  if (certNodes && certNodes.length > 0) {
    const certBase64 = certNodes[0].textContent.replace(/\s+/g, '');
    certificatePem = `-----BEGIN CERTIFICATE-----\n${certBase64.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----`;
    try {
      x509Cert = new crypto.X509Certificate(Buffer.from(certBase64, 'base64'));
    } catch (certParseErr) {
      throw new XmlSecurityError(`Invalid X.509 certificate in signature: ${certParseErr.message}`, 'MALFORMED_CERTIFICATE');
    }
  } else if (!options.testPublicKeyPem) {
    throw new XmlSecurityError('Signature contains no KeyInfo X509Certificate element', 'MISSING_KEYINFO');
  }

  // 4. Verify Certificate Trust
  let certTrustDetails = {};
  if (x509Cert) {
    const trustResult = trustStore.validateCertificate(x509Cert, {
      allowTestMode: options.allowTestMode,
      testFingerprint: options.testFingerprint
    });

    if (!trustResult.trusted && !options.allowTestMode) {
      throw new XmlSecurityError(`Untrusted signing certificate: ${trustResult.error}`, 'UNTRUSTED_CERTIFICATE');
    }
    certTrustDetails = trustResult.details;
  }

  // 5. Verify XML Digital Signature using xml-crypto
  const signingKey = options.testPublicKeyPem || certificatePem;
  const verifier = new SignedXml({
    publicCert: signingKey
  });

  try {
    verifier.loadSignature(sigNode);
    const isSignatureValid = verifier.checkSignature(xmlString);

    if (!isSignatureValid) {
      throw new XmlSecurityError('XML digital signature validation failed (digest mismatch or tampered data)', 'INVALID_DIGITAL_SIGNATURE');
    }
  } catch (sigErr) {
    if (sigErr instanceof XmlSecurityError) throw sigErr;
    throw new XmlSecurityError(`Cryptographic verification error: ${sigErr.message}`, 'INVALID_DIGITAL_SIGNATURE');
  }

  return {
    isValid: true,
    identity: {
      name: residentName,
      maskedAadhaar,
      dob,
      gender,
      pincode,
      state,
      district: dist,
      referenceId: rawReferenceId
    },
    certInfo: {
      subject: x509Cert?.subject,
      issuer: x509Cert?.issuer,
      fingerprint: x509Cert?.fingerprint256,
      validFrom: x509Cert?.validFrom,
      validTo: x509Cert?.validTo,
      ...certTrustDetails
    }
  };
}
