import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { getCurrentLocation } from "../services/locationService";

export const AuthModal = ({ isOpen, onClose, onToast, onOpenFullPage }) => {
  const { login, register, switchDemoUser, demoAccounts } = useAuth();
  const { clearCart } = useCart();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "Gandhinagar, Sector 7",
    city: "Gandhinagar",
    pincode: "382010",
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  const handleDetectCurrentLocation = async (isAuto = false) => {
    setDetectingLocation(true);
    if (!isAuto) {
      setLocationMsg("Requesting browser GPS permission...");
    }
    const res = await getCurrentLocation();
    setDetectingLocation(false);
    if (res.success && res.locationName) {
      setFormData((prev) => ({
        ...prev,
        location: res.locationName,
        city: res.address?.city || prev.city || "Gandhinagar",
        pincode: res.address?.postcode || prev.pincode || "382010",
      }));
      setLocationStatus("success");
      setLocationMsg(`Live location: ${res.locationName}`);
      if (!isAuto && onToast) {
        onToast(`📍 Live location detected: ${res.locationName}`);
      }
    } else {
      setLocationStatus(res.code === "PERMISSION_DENIED" ? "denied" : "error");
      setLocationMsg(res.message || "Location permission denied. Enter manually.");
    }
  };

  useEffect(() => {
    if (isOpen && isRegisterMode) {
      // Auto-request live location permission when entering register mode
      handleDetectCurrentLocation(true);
    }
  }, [isOpen, isRegisterMode]);

  // Phone OTP state for Registration
  const [regOtp, setRegOtp] = useState(["", "", "", "", "", ""]);
  const [currentLiveOtp, setCurrentLiveOtp] = useState("123456");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Listen for Phone.Email postMessage event
  useEffect(() => {
    const handlePhoneEmailMessage = async (event) => {
      if (event.data && event.data.user_json_url) {
        try {
          const res = await api.verifyPhoneEmail(event.data.user_json_url);
          if (res && res.success) {
            const rawPhone = res.user?.phone
              ? res.user.phone.replace(/\D/g, "").slice(-10)
              : formData.phone;
            setIsPhoneVerified(true);
            setVerifiedPhone(rawPhone);
            setFormData((prev) => ({ ...prev, phone: rawPhone }));
            setOtpSent(false);
            setOtpError("");
            onToast &&
              onToast("✅ Mobile number verified successfully via Phone.Email!");
          }
        } catch (err) {
          console.error("Phone.Email postMessage failed", err);
        }
      }
    };

    window.addEventListener("message", handlePhoneEmailMessage);
    return () => window.removeEventListener("message", handlePhoneEmailMessage);
  }, [formData.phone, onToast]);

  // [COMMENTED OUT] Backup / Fallback OTP as requested
  // const HARDCODED_OTP = "123456";

  const handleSendPhoneOtp = async () => {
    setOtpError("");
    const cleanPhone = formData.phone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      const msg = "Please enter a valid 10-digit mobile number first.";
      setOtpError(msg);
      onToast && onToast(`⚠️ ${msg}`);
      return;
    }

    setOtpSending(true);

    // Request Real SMS OTP via Phone.Email backend gateway
    try {
      let toastMsg = `📲 SMS OTP sent to +91 ${cleanPhone}! Check your mobile SMS inbox.`;
      try {
        const res = await api.sendRegistrationOtp(cleanPhone);
        if (res && res.message) {
          toastMsg = `📲 ${res.message}`;
        }
      } catch (backendErr) {
        if (
          backendErr.message &&
          backendErr.message.toLowerCase().includes("already exists")
        ) {
          setOtpError(backendErr.message);
          onToast && onToast(`⚠️ ${backendErr.message}`);
          setOtpSending(false);
          return;
        }
      }

      setOtpSent(true);
      setOtpCountdown(30);
      setOtpError("");
      setRegOtp(["", "", "", "", "", ""]);
      onToast && onToast(toastMsg);
    } catch (err) {
      console.error("OTP send error:", err);
      setOtpError("Failed to send SMS OTP. Please check your network and retry.");
      onToast && onToast(`❌ Failed to send SMS OTP.`);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyPhoneOtp = async (inputCode) => {
    setOtpError("");
    const cleanPhone = formData.phone.replace(/\D/g, "").slice(-10);
    const code = (inputCode !== undefined ? inputCode : regOtp.join("")).trim();

    if (!code || code.length !== 6) {
      const msg = "Please enter the 6-digit SMS OTP received on your mobile.";
      setOtpError(msg);
      onToast && onToast(`⚠️ ${msg}`);
      return;
    }

    setVerifyingOtp(true);
    try {
      /*
      // [COMMENTED OUT] Backup / Fallback hardcoded OTP checks
      if (code === HARDCODED_OTP || code === "481902") {
        setIsPhoneVerified(true);
        setVerifiedPhone(cleanPhone);
        setOtpError("");
        onToast && onToast("✅ Mobile number verified successfully!");
        return;
      }
      */

      const res = await api.verifyRegistrationOtp(cleanPhone, code, formData.name);
      if (res && res.success) {
        setIsPhoneVerified(true);
        setVerifiedPhone(cleanPhone);
        setOtpError("");
        onToast && onToast("✅ Mobile number verified successfully!");
      } else {
        throw new Error(res.message || "Invalid OTP code");
      }
    } catch (err) {
      const msg = err.message || "Invalid OTP code. Please check your SMS and enter the 6-digit code received.";
      setOtpError(msg);
      onToast && onToast(`❌ ${msg}`);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpBoxChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...regOtp];
    newOtp[index] = digit;
    setRegOtp(newOtp);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`modal-otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      handleVerifyPhoneOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !regOtp[index] && index > 0) {
      const prevInput = document.getElementById(`modal-otp-box-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...regOtp];
        newOtp[index - 1] = "";
        setRegOtp(newOtp);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!formData.name.trim()) {
          const msg = "Please enter your full name.";
          setError(msg);
          onToast && onToast(`⚠️ ${msg}`);
          setLoading(false);
          return;
        }
        if (!formData.email.trim() || !formData.email.includes("@")) {
          const msg = "Please enter a valid email address.";
          setError(msg);
          onToast && onToast(`⚠️ ${msg}`);
          setLoading(false);
          return;
        }
        const cleanPhone = formData.phone.replace(/\D/g, "").slice(-10);
        if (!cleanPhone || cleanPhone.length !== 10) {
          const msg = "Please enter a valid 10-digit mobile number.";
          setError(msg);
          onToast && onToast(`⚠️ ${msg}`);
          setLoading(false);
          return;
        }
        if (!isPhoneVerified || cleanPhone !== verifiedPhone) {
          const msg = "Please verify your mobile number with the SMS OTP first.";
          setError(msg);
          onToast && onToast(`⚠️ ${msg}`);
          if (!otpSent) handleSendPhoneOtp();
          setLoading(false);
          return;
        }
        if (!formData.password || formData.password.length < 6) {
          const msg = "Password must be at least 6 characters.";
          setError(msg);
          onToast && onToast(`⚠️ ${msg}`);
          setLoading(false);
          return;
        }

        let finalLocation = formData.location ? formData.location.trim() : "Gandhinagar, Sector 7";
        let finalCity = formData.city;
        let finalPincode = formData.pincode;

        if (locationStatus !== "success") {
          try {
            const locRes = await getCurrentLocation({ timeout: 4000 });
            if (locRes.success && locRes.locationName) {
              finalLocation = locRes.locationName;
              finalCity = locRes.address?.city || finalCity;
              finalPincode = locRes.address?.postcode || finalPincode;
            }
          } catch (e) {
            console.warn("Live location on modal submit fallback:", e);
          }
        }

        const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
        await register(
          formData.name.trim(),
          formData.email.trim(),
          formData.password,
          formattedPhone,
          finalLocation,
          finalCity,
          finalPincode,
        );
        clearCart();
        onToast &&
          onToast("Account created successfully! Welcome to Sharekart.");
      } else {
        if (!formData.email.trim() || !formData.password) {
          const msg = "Please enter email/phone and password.";
          setError(msg);
          onToast && onToast(`⚠️ ${msg}`);
          setLoading(false);
          return;
        }
        await login(formData.email.trim(), formData.password);
        onToast && onToast("Logged in successfully!");
      }
      onClose();
    } catch (err) {
      const msg = err.message || "Authentication failed. Please check your credentials.";
      setError(msg);
      onToast && onToast(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (account) => {
    switchDemoUser(account);
    onToast && onToast(`Switched account to ${account.name}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-outline-variant relative flex flex-col gap-4 my-4 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              shield_person
            </span>
            <span className="text-badge font-badge text-secondary bg-secondary-container/60 px-2 py-0.5 rounded">
              Sharekart Secure Access
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface mt-1">
            {isRegisterMode
              ? "Create Sharekart Account"
              : "Sign in to Sharekart"}
          </h2>
          <p className="text-xs text-on-surface-variant">
            {isRegisterMode
              ? "Fill in your details below to join Gujarat’s verified sharing network."
              : "Sign in with your email or mobile number and password."}
          </p>
        </div>

        {/* 1-Click Demo Accounts (Fast Testing) */}
        <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/50">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
            ⚡ 1-Click Instant Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {demoAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => handleDemoClick(account)}
                className="bg-surface-container-lowest hover:bg-secondary-container hover:text-on-secondary-container p-1.5 rounded-lg text-left border border-outline-variant/60 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <img
                  src={account.avatar_url}
                  alt={account.name}
                  className="w-7 h-7 rounded-full object-cover mb-1 border border-secondary"
                />
                <span className="font-label-bold text-[11px] leading-tight text-on-surface group-hover:text-on-secondary-container truncate w-full">
                  {account.name.split(" ")[0]}
                </span>
                <span className="text-[9px] text-secondary font-bold uppercase">
                  {account.id === 1
                    ? "Seller"
                    : account.id === 2
                      ? "Lender"
                      : "Renter"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-2.5 rounded-lg text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-error shrink-0">
              error
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isRegisterMode && (
            <>
              <div>
                <label className="text-xs font-label-bold text-on-surface-variant block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs sm:text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-label-bold text-on-surface-variant">
                    Indian Mobile Number{" "}
                    <span className="text-[10px] text-on-surface-variant">
                      (For Handover PIN)
                    </span>
                  </label>
                  {isPhoneVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <span className="material-symbols-outlined text-[12px]">
                        check_circle
                      </span>
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-surface-container-low rounded-lg border border-outline-variant overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                    <div className="bg-surface-container px-2.5 py-2 text-xs font-bold text-on-surface flex items-center gap-1 border-r border-outline-variant shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      disabled={isPhoneVerified}
                      placeholder="98765 12345"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setFormData({ ...formData, phone: val });
                        if (isPhoneVerified && val !== verifiedPhone) {
                          setIsPhoneVerified(false);
                          setOtpSent(false);
                        }
                      }}
                      className="w-full bg-transparent px-2.5 py-2 text-xs sm:text-body-sm font-bold font-mono text-on-surface focus:outline-none"
                    />
                  </div>
                  {isPhoneVerified ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhoneVerified(false);
                        setOtpSent(false);
                        setRegOtp(["", "", "", "", "", ""]);
                      }}
                      className="px-2.5 py-1.5 text-xs font-bold text-on-surface-variant hover:text-primary bg-surface-container rounded-lg border border-outline-variant transition-colors cursor-pointer shrink-0"
                    >
                      Change
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      disabled={otpSending || (otpSent && otpCountdown > 0)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                        formData.phone.length === 10
                          ? "bg-secondary text-on-secondary border-secondary shadow-xs hover:opacity-90"
                          : "bg-surface-container text-on-surface-variant border-outline-variant"
                      }`}
                    >
                      {otpSending
                        ? "Sending..."
                        : otpSent && otpCountdown > 0
                          ? `${otpCountdown}s`
                          : otpSent
                            ? "Resend"
                            : "Get OTP"}
                    </button>
                  )}
                </div>


                {/* Error message always visible right below phone input */}
                {otpError && !otpSent && (
                  <div className="mt-1 text-[11px] text-error font-medium flex items-center gap-1 bg-error/10 px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[13px]">
                      error
                    </span>
                    <span>{otpError}</span>
                  </div>
                )}

                {/* Real-time OTP section */}
                {otpSent && !isPhoneVerified && (
                  <div className="mt-2 p-2.5 bg-surface-container-low rounded-lg border border-primary/30 flex flex-col gap-2 animate-fade-in">
                    {/* [COMMENTED OUT] Backup / Fallback OTP Display Banner as requested */}
                    {/*
                    <div className="bg-surface-container-lowest border border-secondary/30 rounded p-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-xs text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[18px]">
                          sms
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          OTP Code: <strong className="text-secondary font-mono text-xs">{currentLiveOtp}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRegOtp(currentLiveOtp.split(""));
                          onToast && onToast(`Auto-filled OTP: ${currentLiveOtp}!`);
                        }}
                        className="text-[10px] text-secondary font-bold bg-secondary/10 hover:bg-secondary/20 px-2 py-0.5 rounded border border-secondary/20 transition cursor-pointer"
                      >
                        Auto-Fill {currentLiveOtp}
                      </button>
                    </div>
                    */}
                    <div className="flex items-center justify-between text-xs px-1 text-on-surface-variant">
                      <span className="text-[11px] font-medium flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-[16px]">sms</span>
                        Enter 6-digit OTP sent to +91 {formData.phone.replace(/\D/g, "").slice(-10)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-1">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          id={`modal-otp-box-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={regOtp[index]}
                          onChange={(e) =>
                            handleOtpBoxChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-full h-9 text-center font-mono font-bold text-sm rounded border bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-outline-variant"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] text-on-surface-variant">
                        {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleVerifyPhoneOtp()}
                        disabled={verifyingOtp || regOtp.join("").length !== 6}
                        className="px-2.5 py-1 bg-primary text-on-primary text-xs font-bold rounded cursor-pointer disabled:opacity-50"
                      >
                        {verifyingOtp ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>

                    {otpError && (
                      <div className="text-[11px] text-error font-medium">
                        {otpError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* City / Area Live Location */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-label-bold text-on-surface-variant">
                    City / Neighborhood <span className="text-primary font-bold">(Live Location)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDetectCurrentLocation(false)}
                    disabled={detectingLocation}
                    className="inline-flex items-center gap-1 text-[11px] font-label-bold text-secondary hover:underline cursor-pointer disabled:opacity-50"
                    title="Use device GPS to detect location"
                  >
                    <span className={`material-symbols-outlined text-[13px] ${detectingLocation ? 'animate-spin' : ''}`}>
                      {detectingLocation ? 'progress_activity' : 'my_location'}
                    </span>
                    <span>{detectingLocation ? 'Detecting...' : 'Use Current Loc'}</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[17px] text-on-surface-variant pointer-events-none">
                    location_on
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      setLocationStatus("");
                      setLocationMsg("");
                    }}
                    placeholder="e.g. Gandhinagar, Sector 7"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 pl-8 text-xs sm:text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                {locationMsg && (
                  <div className={`text-[11px] mt-1 flex items-center gap-1 ${
                    locationStatus === 'success'
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : locationStatus === 'denied'
                      ? 'text-amber-600 dark:text-amber-400'
                      : detectingLocation
                      ? 'text-secondary'
                      : 'text-on-surface-variant'
                  }`}>
                    <span className={`material-symbols-outlined text-[13px] shrink-0 ${detectingLocation ? 'animate-spin' : ''}`}>
                      {detectingLocation ? 'progress_activity' : locationStatus === 'success' ? 'check_circle' : locationStatus === 'denied' ? 'lock' : 'info'}
                    </span>
                    <span className="truncate">{locationMsg}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-label-bold text-on-surface-variant block mb-1">
              {isRegisterMode
                ? "Email Address"
                : "Email Address or Mobile Number"}
            </label>
            <input
              type="text"
              required
              placeholder={
                isRegisterMode
                  ? "e.g. johndoe123@gmail.com"
                  : "johndoe123@gmail.com or 9876543210"
              }
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs sm:text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-label-bold text-on-surface-variant">
                Password
              </label>
              {!isRegisterMode && (
                <button
                  type="button"
                  onClick={() => setError("Demo account password: password123")}
                  className="text-[11px] text-secondary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 pr-9 text-xs sm:text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 text-on-surface-variant hover:text-on-surface p-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-inverse-surface text-on-primary py-2.5 rounded-lg font-label-bold text-xs sm:text-body-sm shadow-sm transition-colors cursor-pointer mt-1"
          >
            {loading
              ? "Please wait..."
              : isRegisterMode
                ? "Create Account & Sign In"
                : "Sign In"}
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError("");
              }}
              className="text-xs text-secondary hover:underline font-bold cursor-pointer"
            >
              {isRegisterMode
                ? "Already have an account? Sign In"
                : "Don't have an account? Create one"}
            </button>

            {onOpenFullPage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullPage(isRegisterMode ? "register" : "login");
                }}
                className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1 cursor-pointer font-bold"
              >
                <span>Full Page View</span>
                <span className="material-symbols-outlined text-[14px]">
                  open_in_new
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
