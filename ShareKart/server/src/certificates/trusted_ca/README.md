# UIDAI Trusted Root Certificate Store

This directory stores trusted public X.509 root and intermediate certificates used to validate digital signatures on Aadhaar Paperless Offline e-KYC XML and e-Aadhaar PDF files.

## Production Configuration

1. Download the official Controller of Certifying Authorities (CCA) India root certificate and UIDAI public certificates from the official UIDAI portal:
   - Official URL: `https://uidai.gov.in`
   - CCA India Portal: `https://cca.gov.in`
2. Place the `.cer`, `.crt`, or `.pem` public certificates in this directory (`server/src/certificates/trusted_ca/`).
3. Alternatively, specify a custom directory path using the environment variable:
   ```env
   UIDAI_TRUSTED_CERTS_DIR=/path/to/trusted/certs
   ```

## Security Best Practices

- **Never** place private keys (`.key`) in this directory.
- This directory is strictly for public certificate authorities (`.cer`, `.pem`).
- Only valid, unexpired CA certificates issued by authorized digital signature providers should be stored here.
