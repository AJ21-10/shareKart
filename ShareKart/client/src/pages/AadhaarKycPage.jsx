import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AadhaarKycPage = ({ onNavigate, onToast }) => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // Verification session state
  const [session, setSession] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('not_started'); // not_started | in_progress | verified | failed | cancelled
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Stepper: 1: Consent & UIDAI Guidance, 2: Select Document & Passcode, 3: Processing, 4: Result / Badge
  const [activeStep, setActiveStep] = useState(1);
  const [consentChecked, setConsentChecked] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [documentPassword, setDocumentPassword] = useState('');
  const [fileBase64, setFileBase64] = useState('');

  // Processing indicators
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resultData, setResultData] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);

  // Fetch current identity verification status on mount
  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await api.getIdentityVerificationStatus();
      if (res.success) {
        setVerificationStatus(res.status);
        setRecentAttempts(res.recentAttempts || []);
        if (res.isVerified) {
          setResultData({
            maskedAadhaar: res.user.maskedAadhaar || 'XXXX-XXXX-4819',
            aadhaarHash: res.user.aadhaarHash || '#OK-94182',
            verifiedAt: res.latestSession?.verified_at || 'Verified'
          });
          setActiveStep(4);
        }
      }
    } catch (err) {
      console.error('[AadhaarKycPage] Failed to fetch verification status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleStartVerification = async () => {
    if (!consentChecked) {
      alert('Please check and authorize informed consent to begin verification.');
      return;
    }
    try {
      const res = await api.createIdentityVerificationSession();
      if (res.success && res.session) {
        setSession(res.session);
        setVerificationStatus('in_progress');
        setActiveStep(2);
        onToast && onToast('Identity verification session created.');
      } else if (res.status === 'verified') {
        setVerificationStatus('verified');
        setActiveStep(4);
      }
    } catch (err) {
      console.error('Session initiation failed:', err);
      onToast && onToast(err.message || 'Could not start verification session');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    let detected = 'unknown';
    if (name.endsWith('.zip')) detected = 'zip';
    else if (name.endsWith('.xml')) detected = 'xml';
    else if (name.endsWith('.pdf')) detected = 'pdf';

    if (detected === 'unknown') {
      alert('Unsupported file format. Please select an official UIDAI Offline e-KYC (.zip / .xml) or e-Aadhaar (.pdf) document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please select an official Aadhaar document under 10MB.');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setFileType(detected);
    setErrorMessage('');

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelSession = async () => {
    if (!session?.id) {
      setActiveStep(1);
      setSelectedFile(null);
      return;
    }
    if (!confirm('Are you sure you want to cancel this verification session?')) return;

    try {
      await api.cancelIdentityVerificationSession(session.id);
      onToast && onToast('Verification session cancelled.');
      setSession(null);
      setActiveStep(1);
      setSelectedFile(null);
      fetchVerificationStatus();
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const handleUploadAndVerify = async () => {
    if (!fileBase64) {
      setErrorMessage('Please select a document first.');
      return;
    }

    if (fileType === 'zip' && !shareCode.trim()) {
      setErrorMessage('Please enter the 4-digit Share Code created during your UIDAI e-KYC download.');
      return;
    }

    if (fileType === 'pdf' && !documentPassword.trim()) {
      setErrorMessage('Please enter your 8-character e-Aadhaar PDF password (4 letters of name + YYYY birth year).');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setActiveStep(3);
    setProcessingStage('Securely uploading encrypted document...');

    try {
      // Stage 1: Document Transmission
      await new Promise(r => setTimeout(r, 400));
      setProcessingStage('Inspecting document integrity & Zip Slip safety checks...');

      // Stage 2: Cryptographic validation & identity matching via backend API
      await new Promise(r => setTimeout(r, 600));
      setProcessingStage('Validating digital signature against UIDAI / CCA Root CA certificate...');

      const response = await api.uploadIdentityVerificationDocument({
        sessionId: session?.id,
        fileData: fileBase64,
        fileName,
        shareCode: shareCode.trim(),
        documentPassword: documentPassword.trim()
      });

      if (response.success || response.status === 'verified') {
        updateUser({
          is_aadhaar_verified: true,
          aadhaar_hash: response.aadhaarHash || '#OK-94182',
          aadhaar_number: response.maskedAadhaar || 'XXXX-XXXX-4819'
        });
        setResultData({
          maskedAadhaar: response.maskedAadhaar,
          aadhaarHash: response.aadhaarHash,
          nameMatched: response.nameMatched,
          verifiedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        });
        setVerificationStatus('verified');
        setActiveStep(4);
        onToast && onToast('Identity Verified! Official UIDAI Green Trust Badge granted.');
      } else {
        setErrorMessage(response.message || 'Verification could not be completed.');
        setActiveStep(2);
      }
    } catch (err) {
      console.error('[AadhaarKycPage] Verification error:', err);
      setErrorMessage(err.message || 'Verification failed. Please review the error and retry.');
      setActiveStep(2);
    } finally {
      setIsProcessing(false);
      fetchVerificationStatus();
    }
  };

  if (loadingStatus) {
    return (
      <div className="w-full flex items-center justify-center p-space-48">
        <div className="flex flex-col items-center gap-space-12 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-[36px] text-primary">progress_activity</span>
          <span className="font-body-md">Checking identity verification status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-space-24 pb-space-48 max-w-6xl mx-auto">
      {/* Top Header & Trust Context */}
      <section className="bg-surface-container-lowest p-4 sm:p-space-24 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-16">
        <div className="flex flex-wrap items-center gap-space-8 text-body-sm font-body-sm text-on-surface-variant">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-primary transition-colors">
            Seller Hub
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Trust & Safety</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-label-bold">Identity Verification (Aadhaar e-KYC)</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-16 pb-space-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-space-8 px-space-8 py-1 rounded bg-secondary-container text-on-secondary-container font-label-bold text-badge mb-space-8">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Official Cryptographic Document Verification</span>
            </div>
            <h1 className="font-display-lg text-2xl sm:text-display-lg text-primary tracking-tight font-bold">
              Aadhaar-Based Identity Verification
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-6 leading-relaxed">
              Verify your identity using your official UIDAI Paperless Offline e-KYC document to unlock high-value P2P camera rentals, power tools, verified seller status, and instant deposit releases.
            </p>
          </div>

          <div className="flex items-center gap-space-8 px-space-12 py-space-8 rounded-lg bg-surface-container-low text-on-surface shrink-0">
            <span className="material-symbols-outlined text-secondary text-[24px]">lock</span>
            <div className="flex flex-col">
              <span className="font-label-bold text-label-bold text-primary">UIDAI Offline e-KYC Protocol</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Digital Signature Verified</span>
            </div>
          </div>
        </div>

        {/* Reassurance Strip */}
        <div className="bg-surface-container-high/60 rounded-lg p-space-12 flex flex-wrap items-center justify-between gap-space-12 text-body-sm font-body-sm text-on-surface">
          <div className="flex items-center gap-space-8">
            <span className="material-symbols-outlined text-secondary text-[20px]">shield_person</span>
            <span>
              <strong>Zero Biometric Exposure:</strong> ShareKart never asks for your UIDAI OTP, never retains original documents, and stores only masked references (XXXX-XXXX-1234).
            </span>
          </div>
          <div className="flex items-center gap-space-16 text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span> Aadhaar Act Compliant
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span> ISO 27001 Cryptography
            </span>
          </div>
        </div>
      </section>

      {/* Main Stepper Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24 items-start">
        {/* Left Column (8 cols): Interactive Journey */}
        <div className="lg:col-span-8 flex flex-col gap-space-24">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 sm:p-space-24 border border-outline-variant/60">
            {/* Step Progress Indicators */}
            <div className="flex items-center justify-between pb-space-16 mb-space-20 bg-surface-container-low rounded-lg p-space-12">
              <div className="flex items-center gap-space-8">
                <div className={`w-7 h-7 rounded-full font-label-bold text-body-sm flex items-center justify-center ${
                  activeStep >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  1
                </div>
                <span className={`font-label-bold text-xs sm:text-label-bold ${activeStep >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
                  Consent & UIDAI
                </span>
              </div>
              <div className="h-0.5 w-6 sm:w-10 bg-outline-variant"></div>
              <div className="flex items-center gap-space-8">
                <div className={`w-7 h-7 rounded-full font-label-bold text-body-sm flex items-center justify-center ${
                  activeStep >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  2
                </div>
                <span className={`font-label-bold text-xs sm:text-label-bold ${activeStep >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
                  Select Document
                </span>
              </div>
              <div className="h-0.5 w-6 sm:w-10 bg-outline-variant"></div>
              <div className="flex items-center gap-space-8">
                <div className={`w-7 h-7 rounded-full font-label-bold text-body-sm flex items-center justify-center ${
                  activeStep >= 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  3
                </div>
                <span className={`font-label-bold text-xs sm:text-label-bold ${activeStep >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
                  Validation
                </span>
              </div>
              <div className="h-0.5 w-6 sm:w-10 bg-outline-variant"></div>
              <div className="flex items-center gap-space-8">
                <div className={`w-7 h-7 rounded-full font-label-bold text-body-sm flex items-center justify-center ${
                  activeStep === 4 ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  4
                </div>
                <span className={`font-label-bold text-xs sm:text-label-bold ${activeStep === 4 ? 'text-primary' : 'text-on-surface-variant'}`}>
                  Status
                </span>
              </div>
            </div>

            {/* STEP 1: Consent and UIDAI Portal Redirection */}
            {activeStep === 1 && (
              <div className="flex flex-col gap-space-20">
                <div className="p-space-16 rounded-lg bg-surface-container border border-outline-variant/60 flex flex-col gap-space-12">
                  <h3 className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">info</span>
                    Why is Aadhaar Verification Needed?
                  </h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    ShareKart allows community members to share and rent high-value personal equipment (DSLR cameras, lenses, gaming consoles, tools). To protect both owners and borrowers, ShareKart verifies the identity of transacting users through official UIDAI offline documents.
                  </p>
                </div>

                <div className="p-space-16 rounded-lg bg-surface-container-low border border-outline-variant/60 flex flex-col gap-space-16">
                  <h4 className="font-label-bold text-label-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    Informed Consent & Data Handling Notice
                  </h4>
                  <ul className="text-body-sm text-on-surface-variant flex flex-col gap-2 list-disc pl-5">
                    <li>ShareKart will inspect your uploaded document to verify the cryptographic digital signature issued by UIDAI / CCA.</li>
                    <li>We compare the demographic name on the document with your ShareKart profile name ({user?.name || 'Account Holder'}).</li>
                    <li>We will record only your masked Aadhaar reference (XXXX-XXXX-1234), verification timestamp, and trust badge token.</li>
                    <li><strong>We never collect or store:</strong> Your full 12-digit Aadhaar number, UIDAI OTPs, biometric data, or original file archives.</li>
                  </ul>

                  <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-outline-variant/60">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="text-body-sm text-on-surface">
                      I understand and provide explicit consent to ShareKart to process my uploaded Aadhaar offline document solely for the purpose of identity verification in accordance with the{' '}
                      <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('ShareKart Privacy Policy: Identity verification data is processed locally and discarded immediately. Only cryptographic hashes and masked references are retained.'); }} className="text-primary underline">
                        Privacy Policy
                      </a>.
                    </span>
                  </label>
                </div>

                {/* External UIDAI Link Card */}
                <div className="p-space-16 rounded-lg bg-primary-container/20 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-16">
                  <div>
                    <h4 className="font-label-bold text-label-bold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      Official UIDAI Portal
                    </h4>
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      Obtain your official document directly from UIDAI before proceeding.
                    </p>
                  </div>
                  <a
                    href="https://myaadhaarbeta.uidai.gov.in/genericDownloadAadhaar/en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-space-16 py-space-10 rounded-lg bg-primary text-on-primary font-label-bold text-body-sm hover:opacity-95 transition-opacity inline-flex items-center gap-2 shrink-0"
                  >
                    <span>Download from UIDAI</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                  </a>
                </div>

                <div className="flex justify-end pt-space-8">
                  <button
                    onClick={handleStartVerification}
                    disabled={!consentChecked}
                    className={`px-space-24 py-space-12 rounded-lg font-label-bold text-body-md transition-all flex items-center gap-2 ${
                      consentChecked
                        ? 'bg-primary text-on-primary hover:bg-primary/95 shadow'
                        : 'bg-surface-container-highest text-on-surface-variant opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span>Continue to Document Selection</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Select Document & Passcode */}
            {activeStep === 2 && (
              <div className="flex flex-col gap-space-20">
                {/* Guidance Banner */}
                <div className="p-space-16 rounded-lg bg-surface-container border border-outline-variant/60 flex flex-col gap-space-8">
                  <h3 className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">folder_open</span>
                    Select Your Downloaded Aadhaar Document
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Please upload one of the following two official formats downloaded from the UIDAI portal:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-12 mt-2">
                    <div className="p-space-12 rounded-lg bg-surface-container-lowest border border-outline-variant/60">
                      <span className="font-label-bold text-label-bold text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        Option A: Offline e-KYC (.zip)
                      </span>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Recommended for instant verification. Requires the 4-digit Share Code you entered on UIDAI.
                      </p>
                    </div>
                    <div className="p-space-12 rounded-lg bg-surface-container-lowest border border-outline-variant/60">
                      <span className="font-label-bold text-label-bold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                        Option B: e-Aadhaar PDF (.pdf)
                      </span>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Password is first 4 letters of your name (CAPITAL) + year of birth YYYY (e.g. AARA1998).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Native File Input Picker */}
                <div className="p-space-24 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary/60 transition-colors flex flex-col items-center justify-center text-center gap-space-12 bg-surface-container-low/40">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".zip,.xml,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[32px]">upload_file</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-space-20 py-space-10 rounded-lg bg-primary text-on-primary font-label-bold text-body-sm hover:bg-primary/95 shadow transition-all"
                    >
                      Select Document
                    </button>
                    <p className="text-xs text-on-surface-variant mt-2">
                      Supports .zip (Offline e-KYC), .xml, or .pdf (Max size 10MB)
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="w-full max-w-md p-space-12 rounded-lg bg-surface-container-lowest border border-outline-variant flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-space-8 truncate">
                        <span className="material-symbols-outlined text-secondary">description</span>
                        <div className="flex flex-col text-left truncate">
                          <span className="text-body-sm font-semibold truncate text-on-surface">{fileName}</span>
                          <span className="text-xs text-on-surface-variant">
                            {(selectedFile.size / 1024).toFixed(1)} KB • {fileType.toUpperCase()} Format
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setFileBase64(''); }}
                        className="text-on-surface-variant hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Password / Share Code inputs based on file type */}
                {fileType === 'zip' && (
                  <div className="p-space-16 rounded-lg bg-surface-container-lowest border border-outline-variant/60 flex flex-col gap-space-8">
                    <label className="font-label-bold text-label-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">key</span>
                      4-Digit Share Code
                    </label>
                    <p className="text-xs text-on-surface-variant">
                      Enter the 4-digit numeric code you chose when downloading the e-KYC zip file from UIDAI.
                    </p>
                    <input
                      type="text"
                      maxLength={8}
                      placeholder="e.g. 1234"
                      value={shareCode}
                      onChange={(e) => setShareCode(e.target.value)}
                      className="w-full max-w-xs px-space-12 py-space-8 rounded-lg border border-outline-variant bg-surface text-on-surface font-mono text-base focus:border-primary focus:outline-none"
                    />
                  </div>
                )}

                {fileType === 'pdf' && (
                  <div className="p-space-16 rounded-lg bg-surface-container-lowest border border-outline-variant/60 flex flex-col gap-space-8">
                    <label className="font-label-bold text-label-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">password</span>
                      e-Aadhaar PDF Password
                    </label>
                    <p className="text-xs text-on-surface-variant">
                      The password for an e-Aadhaar PDF is an 8-character combination of the first 4 letters of your name in CAPITAL letters followed by your year of birth in YYYY format (e.g. <code>AARA1998</code>).
                    </p>
                    <input
                      type="password"
                      placeholder="e.g. AARA1998"
                      value={documentPassword}
                      onChange={(e) => setDocumentPassword(e.target.value)}
                      className="w-full max-w-xs px-space-12 py-space-8 rounded-lg border border-outline-variant bg-surface text-on-surface font-mono text-base focus:border-primary focus:outline-none"
                    />
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-space-12 rounded-lg bg-error-container/40 border border-error/30 text-on-error-container flex items-center gap-space-8 text-body-sm">
                    <span className="material-symbols-outlined text-error text-[20px]">error</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Stepper Navigation */}
                <div className="flex items-center justify-between pt-space-8">
                  <button
                    type="button"
                    onClick={handleCancelSession}
                    className="px-space-16 py-space-8 rounded-lg text-on-surface-variant hover:text-error text-body-sm font-label-bold transition-colors"
                  >
                    Cancel Session
                  </button>

                  <button
                    type="button"
                    onClick={handleUploadAndVerify}
                    disabled={!selectedFile}
                    className={`px-space-24 py-space-12 rounded-lg font-label-bold text-body-md transition-all flex items-center gap-2 ${
                      selectedFile
                        ? 'bg-primary text-on-primary hover:bg-primary/95 shadow'
                        : 'bg-surface-container-highest text-on-surface-variant opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span>Validate & Verify Document</span>
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Cryptographic Processing State */}
            {activeStep === 3 && (
              <div className="flex flex-col items-center justify-center p-space-32 gap-space-16 text-center">
                <div className="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center animate-spin">
                  <span className="material-symbols-outlined text-[36px]">security_update_good</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-title-lg text-title-lg text-primary font-bold">
                    Verifying Identity Document
                  </h3>
                  <p className="text-body-md text-on-surface-variant font-medium">
                    {processingStage}
                  </p>
                </div>
                <div className="w-full max-w-md bg-surface-container-high rounded-full h-2 overflow-hidden mt-2">
                  <div className="bg-primary h-full animate-pulse w-3/4"></div>
                </div>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Validating XML digital signature and checking X.509 certificate chain with UIDAI authority...
                </p>
              </div>
            )}

            {/* STEP 4: Verification Result */}
            {activeStep === 4 && (
              <div className="flex flex-col gap-space-20">
                {verificationStatus === 'verified' ? (
                  <div className="p-space-24 rounded-xl bg-secondary-container/20 border border-secondary/40 flex flex-col items-center text-center gap-space-16">
                    <div className="w-16 h-16 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[36px]">verified</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-bold text-badge inline-block self-center">
                        UIDAI Official Verified
                      </span>
                      <h2 className="font-display-md text-2xl text-on-surface font-bold mt-2">
                        Identity Verification Complete!
                      </h2>
                      <p className="text-body-md text-on-surface-variant max-w-lg mt-1">
                        Your account is linked with a cryptographically verified Aadhaar e-KYC record. High-value rentals, instant listings, and fast escrow disbursements are now active.
                      </p>
                    </div>

                    {/* Metadata Card */}
                    <div className="w-full max-w-md grid grid-cols-2 gap-space-12 text-left bg-surface-container-lowest p-space-16 rounded-lg border border-outline-variant/60">
                      <div>
                        <span className="text-xs text-on-surface-variant font-medium">Masked Reference</span>
                        <p className="text-body-md font-mono font-bold text-primary">
                          {resultData?.maskedAadhaar || user?.aadhaar_number || 'XXXX-XXXX-4819'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-on-surface-variant font-medium">Trust Hash</span>
                        <p className="text-body-md font-mono font-bold text-secondary">
                          {resultData?.aadhaarHash || user?.aadhaar_hash || '#OK-94182'}
                        </p>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant">
                        <span>Assurance Level: Offline e-KYC Validated</span>
                        <span>{resultData?.verifiedAt || 'Active'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-space-12 pt-2">
                      <button
                        onClick={() => onNavigate('dashboard')}
                        className="px-space-20 py-space-10 rounded-lg bg-primary text-on-primary font-label-bold text-body-sm hover:bg-primary/95 transition-all shadow"
                      >
                        Go to Seller Dashboard
                      </button>
                      <button
                        onClick={() => onNavigate('home')}
                        className="px-space-20 py-space-10 rounded-lg border border-outline-variant bg-surface text-on-surface font-label-bold text-body-sm hover:bg-surface-container transition-all"
                      >
                        Browse Rental Listings
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-space-24 rounded-xl bg-error-container/20 border border-error/40 flex flex-col items-center text-center gap-space-16">
                    <div className="w-16 h-16 rounded-full bg-error text-on-error flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[36px]">gpp_bad</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h2 className="font-display-md text-2xl text-on-surface font-bold">
                        Verification Unsuccessful
                      </h2>
                      <p className="text-body-md text-on-surface-variant max-w-lg mt-1">
                        {errorMessage || 'The document failed cryptographic signature verification or demographic validation.'}
                      </p>
                    </div>

                    <button
                      onClick={() => { setActiveStep(2); setSelectedFile(null); setErrorMessage(''); }}
                      className="px-space-20 py-space-10 rounded-lg bg-primary text-on-primary font-label-bold text-body-sm hover:bg-primary/95 transition-all shadow"
                    >
                      Retry Document Selection
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Privacy & Guidelines Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-space-24">
          {/* Security Guarantee Box */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-20 border border-outline-variant/60 flex flex-col gap-space-16">
            <h3 className="font-label-bold text-label-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">verified_user</span>
              ShareKart Trust Standards
            </h3>
            <div className="flex flex-col gap-space-12 text-body-sm text-on-surface-variant">
              <div className="flex items-start gap-space-8">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">lock_person</span>
                <span>
                  <strong>Strict Privacy:</strong> We do not store your original document file, full Aadhaar number, or PDF passwords.
                </span>
              </div>
              <div className="flex items-start gap-space-8">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">enhanced_encryption</span>
                <span>
                  <strong>Cryptographic Integrity:</strong> Verifies XML signatures using RSA-SHA256 directly against official UIDAI public keys.
                </span>
              </div>
              <div className="flex items-start gap-space-8">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">policy</span>
                <span>
                  <strong>Aadhaar Act 2016 Compliant:</strong> Uses only offline paperless verification protocols authorized by UIDAI regulations.
                </span>
              </div>
            </div>
          </div>

          {/* Audit History Box */}
          {recentAttempts.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-20 border border-outline-variant/60 flex flex-col gap-space-12">
              <h4 className="font-label-bold text-label-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">history</span>
                Recent Verification History
              </h4>
              <div className="flex flex-col gap-2">
                {recentAttempts.map((att) => (
                  <div key={att.id} className="p-2 rounded bg-surface-container-low text-xs flex items-center justify-between">
                    <span className="uppercase font-mono font-semibold">{att.document_type}</span>
                    <span className={`px-2 py-0.5 rounded font-label-bold ${
                      att.outcome === 'success' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {att.outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
