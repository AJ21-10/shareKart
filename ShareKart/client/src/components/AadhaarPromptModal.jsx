import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AadhaarPromptModal = ({
  isOpen,
  onClose,
  reason = 'general', // 'list' | 'buy' | 'general'
  onSuccess,
  onNavigate,
  onToast
}) => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [documentPassword, setDocumentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    let detected = 'unknown';
    if (lower.endsWith('.zip')) detected = 'zip';
    else if (lower.endsWith('.xml')) detected = 'xml';
    else if (lower.endsWith('.pdf')) detected = 'pdf';

    if (detected === 'unknown') {
      setErrorMessage('Please select a .zip (Offline e-KYC), .xml, or .pdf (e-Aadhaar) file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size cannot exceed 10MB.');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setFileType(detected);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleVerify = async () => {
    if (!fileBase64) {
      setErrorMessage('Please select a supported document.');
      return;
    }

    if (fileType === 'zip' && !shareCode.trim()) {
      setErrorMessage('Please enter the 4-digit Share Code chosen during UIDAI download.');
      return;
    }

    if (fileType === 'pdf' && !documentPassword.trim()) {
      setErrorMessage('Please enter your 8-character e-Aadhaar PDF password (4 letters of name + birth year).');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.uploadIdentityVerificationDocument({
        fileData: fileBase64,
        fileName,
        shareCode: shareCode.trim(),
        documentPassword: documentPassword.trim()
      });

      if (res.success || res.status === 'verified') {
        updateUser({
          is_aadhaar_verified: true,
          aadhaar_hash: res.aadhaarHash || '#OK-94182',
          aadhaar_number: res.maskedAadhaar || 'XXXX-XXXX-4819'
        });
        if (onToast) {
          onToast('Aadhaar e-KYC Verified Successfully! UIDAI Green Badge granted.');
        }
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.message || 'Verification could not be completed.');
      }
    } catch (err) {
      console.error('[AadhaarPromptModal] Verification error:', err);
      setErrorMessage(err.message || 'Verification failed. Please check the document and passcode.');
    } finally {
      setLoading(false);
    }
  };

  const reasonTitle = 
    reason === 'list' 
      ? 'Aadhaar Verification Required to List Items' 
      : (reason === 'buy' || reason === 'rent' 
          ? 'Identity Verification Required for High-Value Rentals' 
          : 'Aadhaar-Based Identity Verification');

  const reasonDesc =
    reason === 'list'
      ? 'To ensure community safety and prevent fraud, ShareKart requires all sellers and lenders to verify their identity before publishing listings.'
      : 'To protect high-value peer-to-peer equipment and prevent unauthorized bookings, identity verification is required before completing checkout.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">verified_user</span>
            <span className="font-label-bold text-label-bold text-primary">UIDAI Identity Verification</span>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors rounded-full p-1 hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <div>
            <h3 className="font-title-lg text-lg text-on-surface font-bold">
              {reasonTitle}
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1 leading-relaxed">
              {reasonDesc}
            </p>
          </div>

          {/* Quick Guidance Strip */}
          <div className="p-3 rounded-lg bg-surface-container text-xs text-on-surface-variant flex flex-col gap-1 border border-outline-variant/60">
            <div className="flex items-center justify-between font-semibold text-primary">
              <span>Need your document?</span>
              <a
                href="https://myaadhaarbeta.uidai.gov.in/genericDownloadAadhaar/en"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline text-secondary hover:text-secondary/80"
              >
                Download from UIDAI ↗
              </a>
            </div>
            <span>Download either <strong>Paperless Offline e-KYC (.zip)</strong> or <strong>e-Aadhaar (.pdf)</strong>.</span>
          </div>

          {/* File Picker */}
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-xs text-on-surface">
              Upload Aadhaar Document (.zip / .xml / .pdf)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".zip,.xml,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer p-4 rounded-xl border border-dashed border-outline-variant hover:border-primary/80 transition-colors flex items-center justify-between bg-surface-container-low/50"
            >
              <div className="flex items-center gap-3 truncate">
                <span className="material-symbols-outlined text-primary text-[24px]">upload_file</span>
                <span className="text-body-sm truncate text-on-surface font-medium">
                  {selectedFile ? fileName : 'Click to select document from your device'}
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-label-bold shrink-0"
              >
                Browse
              </button>
            </div>
          </div>

          {/* Share Code / Password */}
          {fileType === 'zip' && (
            <div className="flex flex-col gap-1">
              <label className="font-label-bold text-xs text-on-surface">
                4-Digit Share Code
              </label>
              <input
                type="text"
                maxLength={8}
                placeholder="e.g. 1234"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value)}
                className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface font-mono text-sm focus:border-primary focus:outline-none"
              />
              <span className="text-[11px] text-on-surface-variant">The 4-digit code chosen during UIDAI download.</span>
            </div>
          )}

          {fileType === 'pdf' && (
            <div className="flex flex-col gap-1">
              <label className="font-label-bold text-xs text-on-surface">
                e-Aadhaar PDF Password
              </label>
              <input
                type="password"
                placeholder="e.g. AARA1998"
                value={documentPassword}
                onChange={(e) => setDocumentPassword(e.target.value)}
                className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface font-mono text-sm focus:border-primary focus:outline-none"
              />
              <span className="text-[11px] text-on-surface-variant">First 4 letters of your name (CAPITAL) + year of birth (YYYY).</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigate) onNavigate('aadhaar-ekyc');
              }}
              className="text-xs text-primary font-label-bold hover:underline"
            >
              Open Full e-KYC Portal →
            </button>

            <button
              type="button"
              onClick={handleVerify}
              disabled={!selectedFile || loading}
              className={`px-5 py-2.5 rounded-lg font-label-bold text-body-sm flex items-center gap-2 transition-all ${
                selectedFile && !loading
                  ? 'bg-primary text-on-primary hover:bg-primary/95 shadow'
                  : 'bg-surface-container-highest text-on-surface-variant opacity-60 cursor-not-allowed'
              }`}
            >
              {loading && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
              <span>{loading ? 'Validating...' : 'Verify Identity'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
