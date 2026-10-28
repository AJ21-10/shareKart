import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { getCurrentLocation } from "../services/locationService";

export const AuthPage = ({ initialMode = "login", onNavigate, onToast }) => {
  const {
    login,
    register,
    switchDemoUser,
    demoAccounts,
    isAuthenticated,
    user,
  } = useAuth();
  const { clearCart } = useCart();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState(initialMode);

  // Form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regLocation, setRegLocation] = useState("Gandhinagar, Sector 7");
  const [regCity, setRegCity] = useState("Gandhinagar");
  const [regPincode, setRegPincode] = useState("382010");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleDetectCurrentLocation = async (isAuto = false) => {
    setDetectingLocation(true);
    if (!isAuto) {
      setLocationMsg("Requesting browser GPS permission...");
    }
    const res = await getCurrentLocation();
    setDetectingLocation(false);
    if (res.success && res.locationName) {
      setRegLocation(res.locationName);
      if (res.address?.city) setRegCity(res.address.city);
      if (res.address?.postcode) setRegPincode(res.address.postcode);
      setLocationStatus("success");
      setLocationMsg(`Live location: ${res.locationName}`);
      if (!isAuto && onToast) {
        onToast(`📍 Live location detected: ${res.locationName}`);
      }
    } else {
      setLocationStatus(res.code === "PERMISSION_DENIED" ? "denied" : "error");
      setLocationMsg(res.message || "Could not detect location.");
      if (!isAuto && onToast) {
        onToast(res.message || "Could not detect location.");
      }
    }
  };

  useEffect(() => {
    if (mode === "register") {
      // Auto-request live location when user views registration form
      handleDetectCurrentLocation(true);
    }
  }, [mode]);

  // Phone OTP state for Registration
  const [regOtp, setRegOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");

  const handleOpenPhoneEmail = () => {
    const clientId =
      import.meta.env.VITE_PHONE_EMAIL_CLIENT_ID || "11753610740663059476";
    const redirectUrl = encodeURIComponent(window.location.origin);
    const authUrl = `https://auth.phone.email/log-in?client_id=${clientId}&redirect_url=${redirectUrl}&auth_type=2`;
    const width = 500;
    const height = 560;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);

    const popup = window.open(
      authUrl,
      "peLoginWindow",
      `toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=${width},height=${height},top=${top},left=${left}`,
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      onToast &&
        onToast(
          "⚠️ Popup blocked! Please allow popups to verify your phone via Phone.Email.",
        );
    } else {
      onToast &&
        onToast(
          "📲 Phone.Email verification window opened. Complete OTP verification in the popup.",
        );
    }
  };

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setMode(initialMode);
    setError("");
    setSuccessMsg("");
  }, [initialMode]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Handle phone changes and invalidate OTP if altered
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setRegPhone(val);
    if (isPhoneVerified && val !== verifiedPhone) {
      setIsPhoneVerified(false);
      setOtpSent(false);
      setRegOtp(["", "", "", "", "", ""]);
    }
  };

  // Listen for Phone.Email postMessage event
  useEffect(() => {
    const handlePhoneEmailMessage = async (event) => {
      if (event.data && event.data.user_json_url) {
        try {
          const res = await api.verifyPhoneEmail(event.data.user_json_url);
          if (res && res.success) {
            const rawPhone = res.user?.phone
              ? res.user.phone.replace(/\D/g, "").slice(-10)
              : regPhone;
            setIsPhoneVerified(true);
            setVerifiedPhone(rawPhone);
            setRegPhone(rawPhone);
            setOtpSent(false);
            setOtpError("");
            onToast &&
              onToast(
                "✅ Mobile number verified successfully via Phone.Email!",
              );
          }
        } catch (err) {
          console.error("Phone.Email postMessage failed", err);
        }
      }
    };

    window.addEventListener("message", handlePhoneEmailMessage);
    return () => window.removeEventListener("message", handlePhoneEmailMessage);
  }, [regPhone, onToast]);

  // Send SMS OTP
  const handleSendPhoneOtp = async () => {
    setOtpError("");
    const cleanPhone = regPhone.replace(/\D/g, "").slice(-10);
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
      setOtpError(
        "Failed to send SMS OTP. Please check your network and retry.",
      );
      onToast && onToast(`❌ Failed to send SMS OTP.`);
    } finally {
      setOtpSending(false);
    }
  };

  // Verify Real SMS OTP code
  const handleVerifyPhoneOtp = async (inputCode) => {
    setOtpError("");
    const cleanPhone = regPhone.replace(/\D/g, "").slice(-10);
    const code = (inputCode !== undefined ? inputCode : regOtp.join("")).trim();

    if (!code || code.length !== 6) {
      const msg = "Please enter the 6-digit SMS OTP received on your mobile.";
      setOtpError(msg);
      onToast && onToast(`⚠️ ${msg}`);
      return;
    }

    setVerifyingOtp(true);
    try {
      // Check with Phone.Email backend
      const res = await api.verifyRegistrationOtp(cleanPhone, code, regName);
      if (res && res.success) {
        setIsPhoneVerified(true);
        setVerifiedPhone(cleanPhone);
        setOtpError("");
        onToast &&
          onToast("✅ Mobile number verified successfully via Phone.Email!");
      } else {
        throw new Error(res.message || "Invalid OTP code");
      }
    } catch (err) {
      const msg =
        err.message ||
        "Invalid OTP code. Please check your SMS and enter the 6-digit code received.";
      setOtpError(msg);
      onToast && onToast(`❌ ${msg}`);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Individual 6-digit OTP input handler
  const handleOtpBoxChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...regOtp];
    newOtp[index] = digit;
    setRegOtp(newOtp);

    // Auto-advance
    if (digit && index < 5) {
      const nextInput = document.getElementById(`reg-otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-verify if all 6 digits entered
    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      handleVerifyPhoneOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !regOtp[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-box-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...regOtp];
        newOtp[index - 1] = "";
        setRegOtp(newOtp);
      }
    }
  };

  // If already authenticated and not loading, give option to go to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      // Optional auto-redirect if needed, but let's allow manual or smooth redirect
    }
  }, [isAuthenticated, user]);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "None", color: "bg-outline-variant" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-error" };
    if (score === 2) return { score: 50, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 75, label: "Good", color: "bg-primary" };
    return { score: 100, label: "Strong", color: "bg-secondary" };
  };

  const strength = getPasswordStrength(regPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!loginIdentifier.trim() || !loginPassword) {
      setError("Please provide your Email/Phone and Password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginIdentifier.trim(), loginPassword);
      if (res.success) {
        onToast && onToast(`Welcome back, ${res.user?.name || "User"}!`);
        onNavigate && onNavigate("home");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!regName.trim()) {
      const msg = "Please enter your full name.";
      setError(msg);
      onToast && onToast(`⚠️ ${msg}`);
      return;
    }

    if (!regEmail.trim() || !regEmail.includes("@")) {
      const msg = "Please enter a valid email address.";
      setError(msg);
      onToast && onToast(`⚠️ ${msg}`);
      return;
    }

    const cleanPhone = regPhone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      const msg = "Please enter a valid 10-digit Indian mobile number.";
      setError(msg);
      onToast && onToast(`⚠️ ${msg}`);
      return;
    }

    if (!isPhoneVerified || cleanPhone !== verifiedPhone) {
      const msg = "Please verify your mobile number with the SMS OTP first.";
      setError(msg);
      onToast && onToast(`⚠️ ${msg}`);
      if (!otpSent) {
        handleSendPhoneOtp();
      }
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setError(msg);
      onToast && onToast(`⚠️ ${msg}`);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      const msg = "Passwords do not match. Please verify your password.";
      setError(msg);
      onToast && onToast(`⚠️ ${msg}`);
      return;
    }

    if (!agreeTerms) {
      const msg =
        "Please agree to the Sharekart Terms & P2P Escrow Policy to proceed.";
      setError(msg);
      onToast && onToast(`⚠️ ${msg}`);
      return;
    }

    setLoading(true);
    try {
      let finalLocation = regLocation
        ? regLocation.trim()
        : "Gandhinagar, Sector 7";
      let finalCity = regCity;
      let finalPincode = regPincode;

      // Ensure live location is captured if not already verified
      if (locationStatus !== "success") {
        try {
          const locRes = await getCurrentLocation({ timeout: 4000 });
          if (locRes.success && locRes.locationName) {
            finalLocation = locRes.locationName;
            finalCity = locRes.address?.city || finalCity;
            finalPincode = locRes.address?.postcode || finalPincode;
            setRegLocation(finalLocation);
          }
        } catch (e) {
          console.warn("Live location on page register fallback:", e);
        }
      }

      const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
      const res = await register(
        regName.trim(),
        regEmail.trim(),
        regPassword,
        formattedPhone,
        finalLocation,
        finalCity,
        finalPincode,
      );

      if (res.success) {
        clearCart();
        setSuccessMsg("Account created successfully! Redirecting...");
        onToast &&
          onToast("Account created successfully! Welcome to Sharekart.");
        setTimeout(() => {
          onNavigate && onNavigate("home");
        }, 1000);
      }
    } catch (err) {
      setError(
        err.message ||
          "Registration failed. An account with this email or phone may already exist.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (account) => {
    switchDemoUser(account);
    onToast && onToast(`Switched account to ${account.name}!`);
    onNavigate && onNavigate("home");
  };

  return (
    <div className="py-4 md:py-8 max-w-5xl mx-auto">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate && onNavigate("home")}
          className="flex items-center gap-1.5 text-xs sm:text-body-sm font-label-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>UIDAI & Escrow Protected Network</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* LEFT COLUMN: Brand Hero, Trust Factors & Testimonial (Desktop) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary via-primary-container to-[#0b1c30] text-on-primary p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-secondary/15 pointer-events-none blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary-fixed text-[24px]">
                  shield_person
                </span>
              </div>
              <div>
                <h1 className="font-headline-md text-xl font-bold tracking-tight text-white">
                  Sharekart
                </h1>
                <p className="text-xs text-white/75 font-mono">
                  Hyperlocal P2P Rental Network
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 bg-secondary-container/40 text-secondary-fixed text-badge font-badge px-2.5 py-1 rounded-full w-fit border border-secondary/30">
                <span className="material-symbols-outlined text-[14px]">
                  verified
                </span>
                100% Aadhaar Verified Members
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white">
                Borrow what you need. <br />
                <span className="text-secondary-fixed">
                  Earn from what you own.
                </span>
              </h2>

              <p className="text-xs sm:text-body-sm text-white/80 leading-relaxed">
                Connect with verified neighbors to rent Sony cameras, DJI
                drones, camping gear, laptops, and power tools with secure
                escrow protection.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-start gap-3 bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px] mt-0.5">
                  lock
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Escrow Payment Security
                  </h4>
                  <p className="text-[11px] text-white/70">
                    Your deposit remains locked until item is verified and
                    returned undamaged.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px] mt-0.5">
                  pin
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    6-Digit Handover PIN
                  </h4>
                  <p className="text-[11px] text-white/70">
                    Seamless in-person handover authentication before any rental
                    begins.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gandhinagar Local Community Quote */}
          {/* <div className="relative z-10 pt-6 mt-6 border-t border-white/15">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Community Member"
                className="w-9 h-9 rounded-full object-cover border border-secondary-fixed"
              />
              <div className="text-xs">
                <p className="font-bold text-white">Kavya Patel</p>
                <p className="text-[11px] text-white/70">
                  Kudasan, Gandhinagar • 18 Rentals
                </p>
              </div>
            </div>
            <p className="text-[11px] italic text-white/80 mt-2">
              "Rented a Sony A6400 camera for a weekend trip to Gir. Smooth
              handover, exact deposit refund right on time!"
            </p>
          </div> */}
        </div>

        {/* RIGHT COLUMN: Dedicated Auth Card (Tabs & Form) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex bg-surface-container-low p-1 rounded-xl mb-6 border border-outline-variant/40">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2 rounded-lg font-label-bold text-xs sm:text-body-sm transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2 rounded-lg font-label-bold text-xs sm:text-body-sm transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-5">
              <h3 className="text-xl sm:text-2xl font-bold text-on-surface">
                {mode === "login"
                  ? "Sign in to your account"
                  : "Create your Sharekart profile"}
              </h3>
              <p className="text-xs sm:text-body-sm text-on-surface-variant mt-1">
                {mode === "login"
                  ? "Enter your registered email address or phone number and password."
                  : "Join Gujarat’s verified peer-to-peer equipment sharing community."}
              </p>
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="mb-4 bg-error-container text-on-error-container p-3 rounded-xl text-xs sm:text-body-sm flex items-start gap-2.5 animate-fadeIn">
                <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">
                  error
                </span>
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 bg-secondary-container text-on-secondary-container p-3 rounded-xl text-xs sm:text-body-sm flex items-center gap-2.5 animate-fadeIn">
                <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">
                  check_circle
                </span>
                <span className="font-bold">{successMsg}</span>
              </div>
            )}

            {/* ======================= LOGIN FORM ======================= */}
            {mode === "login" && (
              <form
                onSubmit={handleLoginSubmit}
                className="flex flex-col gap-4"
              >
                {/* Email or Phone Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label-bold text-on-surface">
                    Email Address or Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant">
                      mail
                    </span>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. aarav@sharekart.in or 9876543210"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-label-bold text-on-surface">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          "For demo accounts, the password is: password123",
                        )
                      }
                      className="text-[11px] text-secondary hover:underline font-label-bold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant">
                      lock
                    </span>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 text-on-surface-variant hover:text-on-surface cursor-pointer p-0.5"
                      title={
                        showLoginPassword ? "Hide password" : "Show password"
                      }
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showLoginPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs text-on-surface-variant py-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.value)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
                    />
                    <span>Remember this browser</span>
                  </label>
                  <span className="text-[11px] text-secondary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">
                      shield
                    </span>
                    SSL Encrypted
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-inverse-surface text-on-primary py-3 rounded-xl font-label-bold text-xs sm:text-body-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-1"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <span className="material-symbols-outlined text-[18px]">
                        login
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================= REGISTER FORM ======================= */}
            {mode === "register" && (
              <form
                onSubmit={handleRegisterSubmit}
                className="flex flex-col gap-3.5"
              >
                {/* Full Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-label-bold text-on-surface">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant">
                      person
                    </span>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-9 pr-3 py-2 text-xs sm:text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-label-bold text-on-surface">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. johndoe123@gmail.com"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-9 pr-3 py-2 text-xs sm:text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Mobile Number (+91) with OTP Verification */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-label-bold text-on-surface">
                      Mobile Number{" "}
                      <span className="text-[11px] text-on-surface-variant font-normal">
                        (Used for rental pickup & handover PIN)
                      </span>
                    </label>
                    {isPhoneVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-green bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="material-symbols-outlined text-[13px]">
                          check_circle
                        </span>
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                      <div className="bg-surface-container px-3 py-2 text-xs font-bold text-on-surface flex items-center gap-1 border-r border-outline-variant shrink-0">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength="10"
                        value={regPhone}
                        onChange={handlePhoneChange}
                        disabled={isPhoneVerified}
                        placeholder="98765 12345"
                        className={`w-full bg-transparent px-3 py-2 text-xs sm:text-body-sm font-bold font-mono text-on-surface focus:outline-none ${
                          isPhoneVerified ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                      />
                    </div>

                    {/* Send / Change Button */}
                    {isPhoneVerified ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsPhoneVerified(false);
                          setOtpSent(false);
                          setRegOtp(["", "", "", "", "", ""]);
                        }}
                        className="px-3 py-2 text-xs font-bold text-on-surface-variant hover:text-primary bg-surface-container rounded-xl border border-outline-variant transition-colors shrink-0 cursor-pointer"
                        title="Change phone number"
                      >
                        Change
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={otpSending || (otpSent && otpCountdown > 0)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl border shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                          regPhone.length === 10
                            ? "bg-secondary text-on-secondary border-secondary shadow-xs hover:opacity-90"
                            : "bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high"
                        } ${
                          otpSending || (otpSent && otpCountdown > 0)
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {otpSending ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                            <span>Sending...</span>
                          </>
                        ) : otpSent && otpCountdown > 0 ? (
                          <>
                            <span className="material-symbols-outlined text-[14px]">
                              schedule
                            </span>
                            <span>Resend in {otpCountdown}s</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[14px]">
                              sms
                            </span>
                            <span>{otpSent ? "Resend OTP" : "Get OTP"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Error message always visible right below phone input */}
                  {otpError && !otpSent && (
                    <div className="mt-1 text-[11px] text-error font-medium flex items-center gap-1 bg-error/10 px-2.5 py-1.5 rounded-lg border border-error/20 animate-fade-in">
                      <span className="material-symbols-outlined text-[14px]">
                        error
                      </span>
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* OTP Entry Field */}
                  {otpSent && !isPhoneVerified && (
                    <div className="mt-1.5 p-3.5 bg-surface-container-low rounded-xl border border-primary/30 flex flex-col gap-2.5 animate-fade-in">
                      {/* 6-Digit OTP Input Boxes */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-label-bold text-on-surface">
                            Enter 6-Digit Verification Code:
                          </label>
                          <span className="text-[10px] text-on-surface-variant">
                            Valid for 10 minutes
                          </span>
                        </div>
                        <div className="flex justify-between gap-1.5">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                              key={index}
                              id={`reg-otp-box-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength="1"
                              value={regOtp[index]}
                              onChange={(e) =>
                                handleOtpBoxChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className={`w-full h-10 text-center font-mono font-bold text-base rounded-lg border bg-surface-container-lowest text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                                regOtp[index]
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-outline-variant"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* OTP Action Row */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          disabled={otpCountdown > 0 || otpSending}
                          className={`text-[11px] font-bold ${
                            otpCountdown > 0
                              ? "text-on-surface-variant cursor-not-allowed"
                              : "text-secondary hover:underline cursor-pointer"
                          }`}
                        >
                          {otpCountdown > 0
                            ? `Resend code in ${otpCountdown}s`
                            : "Resend Code"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVerifyPhoneOtp()}
                          disabled={
                            verifyingOtp || regOtp.join("").length !== 6
                          }
                          className="px-3.5 py-1.5 bg-primary hover:bg-inverse-surface text-on-primary font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {verifyingOtp ? (
                            <>
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[14px]">
                                verified
                              </span>
                              <span>Verify OTP</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* OTP Specific Error */}
                      {otpError && (
                        <div className="text-[11px] text-error font-medium flex items-center gap-1 bg-error/10 px-2 py-1 rounded">
                          <span className="material-symbols-outlined text-[13px]">
                            error
                          </span>
                          <span>{otpError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confirmed Banner */}
                  {isPhoneVerified && (
                    <div className="p-2 bg-emerald-500/10 border border-primary/20 rounded-lg flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px] text-primary">
                        verified_user
                      </span>
                      <span>
                        Phone number <strong>+91 {regPhone}</strong> verified.
                        Rental handover PIN will be securely sent here.
                      </span>
                    </div>
                  )}
                </div>

                {/* City / Area Location */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-label-bold text-on-surface">
                      City / Neighborhood{" "}
                      <span className="text-primary font-bold">
                        (Live Location)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDetectCurrentLocation(false)}
                      disabled={detectingLocation}
                      className="inline-flex items-center gap-1 text-[11px] font-label-bold text-secondary hover:underline cursor-pointer disabled:opacity-50"
                      title="Use device GPS to detect location"
                    >
                      <span
                        className={`material-symbols-outlined text-[13px] ${detectingLocation ? "animate-spin" : ""}`}
                      >
                        {detectingLocation
                          ? "progress_activity"
                          : "my_location"}
                      </span>
                      <span>
                        {detectingLocation ? "Detecting..." : "Use Current Loc"}
                      </span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant">
                      location_on
                    </span>
                    <input
                      type="text"
                      value={regLocation}
                      onChange={(e) => {
                        setRegLocation(e.target.value);
                        setLocationStatus("");
                        setLocationMsg("");
                      }}
                      placeholder="e.g. Gandhinagar, Sector 7"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-9 pr-3 py-2 text-xs sm:text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  {locationMsg && (
                    <div
                      className={`text-[11px] flex items-center gap-1 mt-0.5 ${
                        locationStatus === "success"
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : locationStatus === "denied"
                            ? "text-amber-600 dark:text-amber-400"
                            : detectingLocation
                              ? "text-secondary"
                              : "text-on-surface-variant"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[13px] shrink-0 ${detectingLocation ? "animate-spin" : ""}`}
                      >
                        {detectingLocation
                          ? "progress_activity"
                          : locationStatus === "success"
                            ? "check_circle"
                            : locationStatus === "denied"
                              ? "lock"
                              : "info"}
                      </span>
                      <span>{locationMsg}</span>
                    </div>
                  )}
                </div>

                {/* Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-label-bold text-on-surface">
                      Create Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs sm:text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer p-0.5"
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          {showRegPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-label-bold text-on-surface">
                      Confirm Password
                    </label>
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full bg-surface-container-low border rounded-xl px-3 py-2 text-xs sm:text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:outline-none transition-all ${
                        regConfirmPassword && regConfirmPassword !== regPassword
                          ? "border-error ring-1 ring-error"
                          : "border-outline-variant focus:ring-2 focus:ring-primary"
                      }`}
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {regPassword && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-on-surface-variant">
                        Password Strength:
                      </span>
                      <span className="font-bold text-on-surface">
                        {strength.label}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Terms agreement */}
                <label className="flex items-start gap-2 text-xs text-on-surface-variant cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant mt-0.5 shrink-0"
                  />
                  <span>
                    I accept Sharekart's{" "}
                    <strong className="text-on-surface">
                      P2P Escrow Guarantee Terms
                    </strong>{" "}
                    and agree to authenticate items honestly before handover.
                  </span>
                </label>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-inverse-surface text-on-primary py-3 rounded-xl font-label-bold text-xs sm:text-body-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-1"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <span className="material-symbols-outlined text-[18px]">
                        how_to_reg
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Toggle Between Login and Register */}
            <div className="text-center mt-5 pt-4 border-t border-outline-variant/50">
              <p className="text-xs sm:text-body-sm text-on-surface-variant">
                {mode === "login"
                  ? "Don't have an account yet?"
                  : "Already registered with Sharekart?"}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-secondary hover:underline font-bold ml-1.5 cursor-pointer"
                >
                  {mode === "login" ? "Create a free account" : "Sign in here"}
                </button>
              </p>
            </div>
          </div>

          {/* 1-Click Instant Demo Persona Bar for Frictionless Testing */}
          {/* <div className="mt-6 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  bolt
                </span>
                Instant 1-Click Demo Testing
              </span>
              <span className="text-[10px] text-on-surface-variant">
                Click to login directly
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {demoAccounts.slice(0, 4).map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleDemoClick(account)}
                  className="bg-surface-container-lowest hover:bg-secondary-container hover:text-on-secondary-container p-2 rounded-lg text-left border border-outline-variant/60 transition-all flex flex-col items-center text-center group cursor-pointer shadow-xs"
                >
                  <img
                    src={account.avatar_url}
                    alt={account.name}
                    className="w-8 h-8 rounded-full object-cover mb-1 border border-secondary"
                  />
                  <span className="font-label-bold text-[11px] leading-tight text-on-surface group-hover:text-on-secondary-container truncate w-full">
                    {account.name.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-secondary font-bold uppercase mt-0.5 truncate w-full">
                    {account.id === 1
                      ? "Host (Laptops)"
                      : account.id === 2
                        ? "Host (Appliances)"
                        : account.id === 3
                          ? "Student Renter"
                          : "Citizen"}
                  </span>
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};
