import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export const ProfilePage = ({
  params = {},
  onNavigate,
  onOpenAadhaarVerification,
  onToast,
}) => {
  const { user, updateProfile, changePassword, switchDemoUser, demoAccounts } =
    useAuth();
  const fileInputRef = useRef(null);

  // Active Tab: 'edit' (Account & Details), 'security' (Password & Security), 'seller' (Seller Hub), 'ekyc' (Aadhaar eKYC), 'activity' (Rentals & Bookings)
  const [activeTab, setActiveTab] = useState(params?.tab || "edit");

  useEffect(() => {
    if (params?.tab) {
      setActiveTab(params.tab);
    }
  }, [params?.tab]);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [customAvatarOpen, setCustomAvatarOpen] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState("");
  const [sellerStats, setSellerStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Cartoon vector presets (Friendly vector illustrations - not real people photos)
  const avatarPresets = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Pixel&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=c1e7e3",
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setLocation(user.location || "");
      setCity(user.city || "Gandhinagar");
      setPincode(user.pincode || "382010");
      // Default to cartoon vector if user has no avatar or an old unsplash / google person photo
      const currentAvatar = user.avatar_url;
      if (
        !currentAvatar ||
        currentAvatar.includes("unsplash.com") ||
        currentAvatar.includes("googleusercontent.com")
      ) {
        setAvatarUrl(avatarPresets[0]);
      } else {
        setAvatarUrl(currentAvatar);
      }
    }
  }, [user]);

  // Handle local image file upload from user device
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Selected image is too large (max 10MB). Please select a smaller photo.",
      );
      return;
    }

    setError("");
    setImageUploadStatus("Optimizing image from device...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Offscreen canvas resize to clean 320x320 square
          const canvas = document.createElement("canvas");
          const size = 320;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");

          // Center crop square
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setAvatarUrl(compressedDataUrl);
          setImageUploadStatus(
            'Photo uploaded from device! Click "Save Profile Changes" to save.',
          );
        } catch (err) {
          console.error("Canvas processing error", err);
          setAvatarUrl(event.target.result);
          setImageUploadStatus(
            'Photo selected! Click "Save Profile Changes" to save.',
          );
        }
      };
      img.onerror = () => {
        setError("Failed to process the selected image.");
        setImageUploadStatus("");
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setError("Failed to read image file from your device.");
      setImageUploadStatus("");
    };
    reader.readAsDataURL(file);

    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";
  };

  // Generate random cartoon vector avatar on demand
  const handleRandomCartoon = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    const styles = ["bottts", "adventurer"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const bgColors = [
      "b6e3f4",
      "c0aede",
      "d1d4f9",
      "ffd5dc",
      "ffdfbf",
      "c1e7e3",
    ];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
    const newAvatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}&backgroundColor=${randomBg}`;
    setAvatarUrl(newAvatar);
    setImageUploadStatus(
      'New cartoon vector avatar selected! Click "Save Profile Changes" to save.',
    );
  };

  // Load seller stats if Seller Hub tab is opened
  useEffect(() => {
    if (activeTab === "seller" && !sellerStats) {
      loadSellerStats();
    }
  }, [activeTab]);

  const loadSellerStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setSellerStats(res.stats);
      }
    } catch (err) {
      console.log("Stats loaded default fallback");
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Full Name is required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        avatar_url: avatarUrl.trim(),
      });

      if (res.success) {
        onToast &&
          onToast(
            "Profile details updated successfully in PostgreSQL database!",
          );
      }
    } catch (err) {
      setError(err.message || "Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  // Calculate password strength dynamically
  const calculatePasswordStrength = (pass) => {
    if (!pass)
      return {
        score: 0,
        label: "Empty",
        color: "bg-outline-variant",
        width: "w-0",
      };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 9) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2)
      return { score: 1, label: "Weak", color: "bg-error", width: "w-1/4" };
    if (score <= 3)
      return { score: 2, label: "Fair", color: "bg-amber-500", width: "w-2/4" };
    if (score <= 4)
      return { score: 3, label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return {
      score: 4,
      label: "Strong",
      color: "bg-secondary",
      width: "w-full",
    };
  };

  const passStrength = calculatePasswordStrength(newPassword);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!newPassword) {
      setPasswordError("New password is required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess(res.message || "Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onToast &&
          onToast("Password changed successfully in PostgreSQL database!");
      }
    } catch (err) {
      setPasswordError(
        err.message ||
          "Failed to change password. Please check your current password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderPasswordChangeCard = () => (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-outline-variant/60 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">
              lock_reset
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-on-surface">
                Change Password & Security
              </h3>
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">
                  security
                </span>
                Bcrypt Secured
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Update your account password to protect your escrow transactions
              and rentals.
            </p>
          </div>
        </div>
      </div>

      {passwordSuccess && (
        <div className="bg-secondary-container/50 border border-secondary/40 text-on-secondary-container p-3.5 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">
              check_circle
            </span>
            <span className="font-semibold">{passwordSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setPasswordSuccess("")}
            className="text-on-secondary-container/70 hover:text-on-secondary-container cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {passwordError && (
        <div className="bg-error-container text-on-error-container p-3.5 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-error shrink-0">
              error
            </span>
            <span className="font-semibold">{passwordError}</span>
          </div>
          <button
            type="button"
            onClick={() => setPasswordError("")}
            className="text-on-error-container/70 hover:text-on-error-container cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
        {/* Current Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-label-bold text-on-surface">
              Current Password
            </label>
            <span className="text-[11px] text-on-surface-variant">
              Required for verification
            </span>
          </div>
          <div className="relative">
            <input
              type={showCurrentPass ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Enter your current password"
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPass(!showCurrentPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer p-0.5"
              tabIndex={-1}
            >
              <span className="material-symbols-outlined text-[18px]">
                {showCurrentPass ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {/* New Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label-bold text-on-surface">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="At least 6 characters"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer p-0.5"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showNewPass ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            {/* Password strength bar */}
            {newPassword && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passStrength.color} transition-all duration-300 ${passStrength.width}`}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-medium">
                  <span>
                    Strength:{" "}
                    <strong className="text-on-surface">
                      {passStrength.label}
                    </strong>
                  </span>
                  <span>
                    {newPassword.length >= 6
                      ? "✓ Length OK"
                      : "Min 6 characters"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label-bold text-on-surface">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Re-enter new password"
                className={`w-full bg-surface-container-low border rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-error"
                    : "border-outline-variant"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer p-0.5"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showConfirmPass ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            {confirmPassword && (
              <div className="text-[10px] mt-1 font-medium flex items-center gap-1">
                {confirmPassword === newPassword ? (
                  <span className="text-secondary flex items-center gap-0.5 font-bold">
                    <span className="material-symbols-outlined text-[13px]">
                      check
                    </span>
                    Passwords match
                  </span>
                ) : (
                  <span className="text-error flex items-center gap-0.5 font-bold">
                    <span className="material-symbols-outlined text-[13px]">
                      close
                    </span>
                    Passwords do not match
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security Info Checklist */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/50 text-[11px] text-on-surface-variant flex flex-col gap-1.5">
          <span className="font-label-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-secondary">
              verified_user
            </span>
            Password Security Rules:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Minimum 6 characters with letters, numbers, and symbols
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Never share your password or Aadhaar OTP with anyone
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Encrypted using bcrypt hashing algorithm with 10 salt rounds
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Instant synchronization across all devices
            </span>
          </div>
        </div>

        {/* Submit & Reset Buttons */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setPasswordError("");
              setPasswordSuccess("");
            }}
            className="text-xs text-on-surface-variant hover:text-on-surface font-label-bold px-3 py-2 cursor-pointer transition-colors"
          >
            Clear Fields
          </button>

          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-primary hover:bg-inverse-surface text-on-primary px-6 py-2.5 rounded-xl font-label-bold text-xs sm:text-body-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {passwordLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  key
                </span>
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="py-4 md:py-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Banner / Header Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/60 overflow-hidden">
        {/* Decorative Top Accent Banner */}
        <div className="h-28 sm:h-36 bg-gradient-to-r from-primary via-primary-container to-secondary/80 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-surface/80 backdrop-blur-xs text-on-surface text-badge font-badge px-2.5 py-1 rounded-full border border-white/20 shadow-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              UIDAI & Escrow Protected
            </span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Avatar & Main Titles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative group -mt-12 sm:-mt-14 shrink-0">
              <img
                src={avatarUrl || user?.avatar_url || avatarPresets[0]}
                alt={user?.name || "Profile"}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-surface-container-lowest shadow-lg bg-surface-container"
              />
              {user?.is_aadhaar_verified ? (
                <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-[16px] sm:text-[18px] bg-secondary text-on-secondary rounded-full p-1 shadow-md">
                  verified
                </span>
              ) : (
                <span
                  className="material-symbols-outlined absolute -bottom-1 -right-1 text-[16px] sm:text-[18px] bg-amber-500 text-slate-950 font-bold rounded-full p-1 shadow-md"
                  title="Aadhaar Unverified"
                >
                  priority_high
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 pb-1 pt-2 sm:pt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {user?.name || "Sharekart Member"}
                </h1>
                {user?.is_aadhaar_verified ? (
                  <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[13px]">
                      verified
                    </span>
                    Aadhaar Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAadhaarVerification) {
                        onOpenAadhaarVerification("general");
                      } else {
                        onNavigate("aadhaar-ekyc");
                      }
                    }}
                    className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[13px] text-amber-600">
                      warning
                    </span>
                    Aadhaar Not Verified · Click to Verify
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap font-mono">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">
                    mail
                  </span>
                  {user?.email || "member@sharekart.in"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">
                    location_on
                  </span>
                  {user?.location || "Gandhinagar, Gujarat"}
                </span>
                <span>•</span>
                <span>Member since {user?.member_since || "Oct 2026"}</span>
              </div>
            </div>
          </div>

          {/* Quick Hub Jump Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate("dashboard")}
              className="bg-secondary text-on-secondary hover:bg-secondary/90 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                dashboard
              </span>
              <span>Open Seller Hub</span>
            </button>
            <button
              onClick={() => onNavigate("aadhaar-ekyc")}
              className="bg-surface-container-high hover:bg-surface-container text-on-surface px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-outline-variant/60 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                verified_user
              </span>
              <span>eKYC Portal</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-outline-variant/50 px-6 bg-surface-container-low flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("edit")}
            className={`py-3.5 px-2 text-xs sm:text-body-sm font-label-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "edit"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              manage_accounts
            </span>
            <span>Profile Details & Edit</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`py-3.5 px-2 text-xs sm:text-body-sm font-label-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "security"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              lock_reset
            </span>
            <span>Password & Security</span>
          </button>

          <button
            onClick={() => setActiveTab("seller")}
            className={`py-3.5 px-2 text-xs sm:text-body-sm font-label-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "seller"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              storefront
            </span>
            <span>Seller Hub & Earnings</span>
          </button>

          <button
            onClick={() => setActiveTab("ekyc")}
            className={`py-3.5 px-2 text-xs sm:text-body-sm font-label-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "ekyc"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              shield
            </span>
            <span>Aadhaar eKYC & Trust</span>
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`py-3.5 px-2 text-xs sm:text-body-sm font-label-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              receipt_long
            </span>
            <span>Orders & Bookings</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFILE DETAILS & EDIT */}
      {/* ========================================================================= */}
      {activeTab === "edit" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Edit Form Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-outline-variant/60 flex flex-col gap-5">
              <div>
                <h3 className="text-xl font-bold text-on-surface">
                  Personal Information
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Update your identity details, neighborhood location, and
                  profile picture.
                </p>
              </div>

              {error && (
                <div className="bg-error-container text-on-error-container p-3 rounded-xl text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-error shrink-0">
                    error
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <form
                onSubmit={handleSaveProfile}
                className="flex flex-col gap-4"
              >
                {/* Avatar Selector & Device Upload */}
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/60 flex flex-col gap-3 shadow-xs">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/40">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarUrl || avatarPresets[0]}
                        alt="Avatar Preview"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-secondary shadow-sm bg-surface-container shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-on-surface">
                            Profile Avatar
                          </span>
                          {avatarUrl.startsWith("data:image") ? (
                            <span className="bg-secondary/15 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full border border-secondary/30 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">
                                photo_camera
                              </span>
                              Custom Device Photo
                            </span>
                          ) : (
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">
                                smart_toy
                              </span>
                              Cartoon Vector Avatar
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          Upload your own image from your computer or choose a
                          cartoon vector avatar.
                        </p>
                      </div>
                    </div>

                    {/* Upload from Device Button & Roll Cartoon Button */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-primary hover:bg-inverse-surface text-on-primary px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          upload_file
                        </span>
                        <span>Upload from Device</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRandomCartoon}
                        className="bg-surface-container-high hover:bg-surface-container text-on-surface px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-outline-variant/60 transition-colors cursor-pointer"
                        title="Generate a unique cartoon vector avatar"
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          casino
                        </span>
                        <span>Roll Cartoon</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload Status Toast */}
                  {imageUploadStatus && (
                    <div className="bg-secondary-container/50 border border-secondary/30 text-on-secondary-container px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          check_circle
                        </span>
                        <span>{imageUploadStatus}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUploadStatus("")}
                        className="text-on-secondary-container/70 hover:text-on-secondary-container text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Cartoon Presets Row */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Or Choose a Cartoon Vector
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomAvatarOpen(!customAvatarOpen)}
                        className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
                      >
                        {customAvatarOpen
                          ? "Close URL Input"
                          : "Enter Image URL"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                      {avatarPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatarUrl(preset);
                            setImageUploadStatus(
                              'Cartoon avatar selected! Click "Save Profile Changes" to save.',
                            );
                          }}
                          className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                            avatarUrl === preset
                              ? "border-secondary scale-110 shadow-md ring-2 ring-secondary/30"
                              : "border-outline-variant/60 hover:opacity-80"
                          }`}
                        >
                          <img
                            src={preset}
                            alt={`Cartoon preset ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {customAvatarOpen && (
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://api.dicebear.com/7.x/bottts/svg?seed=your-custom-vector"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary mt-1"
                    />
                  )}
                </div>

                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-label-bold text-on-surface">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-label-bold text-on-surface-variant">
                        Email Address
                      </label>
                      <span className="text-[10px] text-secondary font-bold">
                        UIDAI Locked
                      </span>
                    </div>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-body-sm text-on-surface-variant/70 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Mobile Number & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-label-bold text-on-surface">
                      Indian Mobile Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-label-bold text-on-surface">
                      Neighborhood / Area
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Gandhinagar, Sector 7"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* City & Pincode */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-label-bold text-on-surface">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Gandhinagar"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-label-bold text-on-surface">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="382010"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary hover:bg-inverse-surface text-on-primary px-6 py-2.5 rounded-xl font-label-bold text-xs sm:text-body-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">
                          save
                        </span>
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Trust & Navigation Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Seller Hub Quick Card */}
            <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-5 rounded-2xl border border-outline-variant/60 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">
                    storefront
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">
                    Seller / Lender Hub
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    List gear & earn daily rent
                  </p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Manage your active cameras, drones, tools, incoming rental
                requests, and payouts.
              </p>
              <button
                onClick={() => onNavigate("dashboard")}
                className="w-full bg-secondary text-on-secondary hover:bg-secondary/90 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Go to Seller Dashboard</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Aadhaar eKYC Quick Card */}
            <div
              className={`p-5 rounded-2xl border shadow-lg flex flex-col gap-3 ${
                user?.is_aadhaar_verified
                  ? "bg-gradient-to-br from-surface-container-lowest to-secondary-container/20 border-secondary/30"
                  : "bg-gradient-to-br from-surface-container-lowest to-amber-500/10 border-amber-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      user?.is_aadhaar_verified
                        ? "text-secondary"
                        : "text-amber-600"
                    }`}
                  >
                    {user?.is_aadhaar_verified ? "verified_user" : "shield"}
                  </span>
                  <h4 className="text-sm font-bold text-on-surface">
                    Aadhaar eKYC
                  </h4>
                </div>
                {user?.is_aadhaar_verified ? (
                  <span className="bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-700 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Action Required
                  </span>
                )}
              </div>
              <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40 text-xs font-mono">
                <p className="text-on-surface-variant text-[11px]">
                  Masked UIDAI ID:
                </p>
                <p className="font-bold text-on-surface">
                  {user?.is_aadhaar_verified
                    ? user?.aadhaar_number || "XXXX-XXXX-5212"
                    : "Not Verified Yet"}
                </p>
                <p className="text-on-surface-variant text-[11px] mt-1">
                  Cryptographic Token:
                </p>
                <p
                  className={`font-bold text-[11px] ${
                    user?.is_aadhaar_verified
                      ? "text-secondary"
                      : "text-amber-600"
                  }`}
                >
                  {user?.is_aadhaar_verified
                    ? user?.aadhaar_hash || "#OK-91452"
                    : "Pending Verification"}
                </p>
              </div>
              {user?.is_aadhaar_verified ? (
                <button
                  onClick={() => onNavigate("aadhaar-ekyc")}
                  className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-outline-variant/60 transition-colors cursor-pointer"
                >
                  <span>View Full eKYC Pass</span>
                  <span className="material-symbols-outlined text-[16px]">
                    badge
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (onOpenAadhaarVerification) {
                      onOpenAadhaarVerification("general");
                    } else {
                      onNavigate("aadhaar-ekyc");
                    }
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    verified_user
                  </span>
                  <span>Verify Aadhaar Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: PASSWORD & ACCOUNT SECURITY */}
      {/* ========================================================================= */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            {renderPasswordChangeCard()}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Account Protection Card */}
            <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-5 rounded-2xl border border-outline-variant/60 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">
                    shield
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">
                    Account Protection
                  </h4>
                  <p className="text-[11px] text-secondary font-bold">
                    Escrow & Identity Protected
                  </p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your password secures access to your rental agreements, security
                deposits in Razorpay Escrow, and verified UPI payout routes.
              </p>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-[11px]">
                    Hashing:
                  </span>
                  <span className="font-mono font-bold text-on-surface text-[11px]">
                    bcrypt (10 rounds)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-[11px]">
                    Aadhaar Auth:
                  </span>
                  <span className="font-bold text-secondary text-[11px]">
                    UIDAI Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-[11px]">
                    Escrow Status:
                  </span>
                  <span className="font-bold text-secondary text-[11px]">
                    Trustee Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-surface-container-lowest to-secondary-container/20 p-5 rounded-2xl border border-secondary/30 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  manage_accounts
                </span>
                <h4 className="text-sm font-bold text-on-surface">
                  Profile Details
                </h4>
              </div>
              <p className="text-xs text-on-surface-variant">
                Need to update your avatar, phone number, or neighborhood
                address instead?
              </p>
              <button
                onClick={() => setActiveTab("edit")}
                className="w-full bg-primary text-on-primary py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-inverse-surface transition-colors cursor-pointer"
              >
                <span>Edit Profile Details</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SELLER HUB & INVENTORY */}
      {/* ========================================================================= */}
      {activeTab === "seller" && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-outline-variant/60 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/50 pb-5">
            <div>
              <h3 className="text-xl font-bold text-on-surface">
                Seller & Lender Center
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Overview of your equipment listings, monthly earnings, and
                rental requests.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate("list-item")}
                className="bg-secondary text-on-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-secondary/90 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add_circle
                </span>
                <span>List New Item</span>
              </button>
              <button
                onClick={() => onNavigate("dashboard")}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-inverse-surface transition-colors cursor-pointer"
              >
                <span>Full Dashboard Hub</span>
                <span className="material-symbols-outlined text-[16px]">
                  open_in_new
                </span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                Active Listings
              </span>
              <p className="text-2xl font-bold text-on-surface mt-1">
                {sellerStats?.activeInventory?.total || 3} items
              </p>
              <span className="text-[11px] text-secondary font-bold mt-1 inline-block">
                ● Ready to rent
              </span>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                Pending Requests
              </span>
              <p className="text-2xl font-bold text-primary mt-1">
                {sellerStats?.pendingRequests?.count || 2} requests
              </p>
              <span className="text-[11px] text-on-surface-variant">
                Awaiting approval
              </span>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                Monthly Earnings
              </span>
              <p className="text-2xl font-bold text-on-surface mt-1">
                ₹
                {sellerStats?.earnings?.monthlyTotal?.toLocaleString("en-IN") ||
                  "18,450"}
              </p>
              <span className="text-[11px] text-secondary font-bold">
                Auto T+1 Payout
              </span>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                Trust Tier
              </span>
              <p className="text-2xl font-bold text-secondary mt-1">4.9 ★</p>
              <span className="text-[11px] text-on-surface-variant">
                Super Lender Badge
              </span>
            </div>
          </div>

          {/* Sub-Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => onNavigate("inventory")}
              className="p-3.5 bg-surface-container-low hover:bg-surface-container rounded-xl border border-outline-variant/60 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  inventory_2
                </span>
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    Manage Inventory
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    Edit pricing & availability
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                chevron_right
              </span>
            </button>

            <button
              onClick={() => onNavigate("contracts")}
              className="p-3.5 bg-surface-container-low hover:bg-surface-container rounded-xl border border-outline-variant/60 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  history_edu
                </span>
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    Escrow Contracts
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    Handover PIN & deposits
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                chevron_right
              </span>
            </button>

            <button
              onClick={() => onNavigate("payouts")}
              className="p-3.5 bg-surface-container-low hover:bg-surface-container rounded-xl border border-outline-variant/60 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">
                  account_balance_wallet
                </span>
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    Earnings & Payouts
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    Bank account settlement
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AADHAAR eKYC & TRUST */}
      {/* ========================================================================= */}
      {activeTab === "ekyc" && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-outline-variant/60 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/50 pb-5">
            <div>
              <h3 className="text-xl font-bold text-on-surface">
                UIDAI Aadhaar e-KYC Verification
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Government of India UIDAI verified badge issued for peer-to-peer
                equipment sharing.
              </p>
            </div>
            <button
              onClick={() => onNavigate("aadhaar-ekyc")}
              className="bg-secondary text-on-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-secondary/90 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                qr_code_scanner
              </span>
              <span>Open eKYC Verification Desk</span>
            </button>
          </div>

          {/* Digital ID Card Preview */}
          <div className="max-w-md mx-auto w-full bg-gradient-to-br from-primary via-primary-container to-[#0b1c30] text-on-primary p-6 rounded-2xl shadow-xl border border-white/20 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed text-[22px]">
                  shield_person
                </span>
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  Sharekart TrustNet ID
                </span>
              </div>
              {user?.is_aadhaar_verified ? (
                <span className="bg-secondary-container/50 text-secondary-fixed text-[10px] font-bold px-2 py-0.5 rounded border border-secondary/40">
                  ACTIVE
                </span>
              ) : (
                <span className="bg-amber-500/30 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/40">
                  UNVERIFIED
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 my-4">
              <img
                src={avatarUrl || user?.avatar_url || avatarPresets[0]}
                alt="Profile"
                className="w-16 h-16 rounded-xl object-cover border-2 border-secondary-fixed shadow-md"
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-lg font-bold text-white">
                  {user?.name || "Pushpender Verma"}
                </p>
                <p className="text-xs text-white/70 font-mono">
                  {user?.email || "vermapushpender2003@gmail.com"}
                </p>
                {user?.is_aadhaar_verified ? (
                  <p className="text-xs text-secondary-fixed font-mono font-bold mt-0.5">
                    UIDAI Hash: {user?.aadhaar_hash || "#OK-91452"}
                  </p>
                ) : (
                  <p className="text-xs text-amber-300 font-mono font-bold mt-0.5">
                    UIDAI Hash: Pending eKYC
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-white/15 font-mono text-white/80">
              <div>
                <span className="text-white/50 block text-[9px] uppercase">
                  Masked Aadhaar:
                </span>
                <span>
                  {user?.is_aadhaar_verified
                    ? user?.aadhaar_number || "XXXX-XXXX-5212"
                    : "Not Verified"}
                </span>
              </div>
              <div>
                <span className="text-white/50 block text-[9px] uppercase">
                  Registered Location:
                </span>
                <span className="truncate block">
                  {user?.location || "Gandhinagar, 382010"}
                </span>
              </div>
            </div>
          </div>

          {!user?.is_aadhaar_verified && (
            <div className="max-w-md mx-auto w-full p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <span className="material-symbols-outlined text-[18px]">
                  warning
                </span>
                <span>Aadhaar Verification Required</span>
              </div>
              <p className="text-on-surface-variant">
                You cannot list equipment or book rentals until your Aadhaar
                eKYC is verified.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAadhaarVerification) {
                    onOpenAadhaarVerification("general");
                  } else {
                    onNavigate("aadhaar-ekyc");
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <span className="material-symbols-outlined text-[16px]">
                  verified_user
                </span>
                <span>Verify Aadhaar Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ORDERS & BOOKINGS */}
      {/* ========================================================================= */}
      {activeTab === "activity" && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-outline-variant/60 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/50 pb-5">
            <div>
              <h3 className="text-xl font-bold text-on-surface">
                My Rentals & Orders
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Track your active rental bookings, handover passes, and security
                deposits.
              </p>
            </div>
            <button
              onClick={() => onNavigate("orders")}
              className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-inverse-surface transition-colors cursor-pointer"
            >
              <span>View All Orders</span>
              <span className="material-symbols-outlined text-[16px]">
                receipt_long
              </span>
            </button>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/50 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">
                receipt_long
              </span>
            </div>
            <h4 className="text-base font-bold text-on-surface">
              Orders & Active Bookings Hub
            </h4>
            <p className="text-xs text-on-surface-variant max-w-md">
              View your ongoing rental durations, access 6-digit Handover Escrow
              PINs, and trigger return inspections.
            </p>
            <button
              onClick={() => onNavigate("orders")}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-inverse-surface transition-colors cursor-pointer mt-1"
            >
              <span>Open My Orders & Rentals</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
