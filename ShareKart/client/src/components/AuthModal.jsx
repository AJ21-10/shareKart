import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, onToast }) => {
  const { login, register, otpLogin, switchDemoUser, demoAccounts } = useAuth();

  // Auth Modes: 'otp' (Phase 3 Phone/WhatsApp OTP) | 'password' (Email/Password)
  const [authMode, setAuthMode] = useState('otp');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState('9876543210');
  const [channel, setChannel] = useState('whatsapp'); // 'whatsapp' or 'sms'
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['4', '8', '1', '9', '0', '2']);
  const [otpTimer, setOtpTimer] = useState(58);

  // Email/Password state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+91 98765 43210',
    location: 'Gandhinagar, Sector 7'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(t => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpTimer(60);
    onToast && onToast(`6-Digit OTP sent via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} to +91 ${phone}`);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await otpLogin(`+91 ${phone}`, channel);
      onToast && onToast('Authenticated successfully with Sharekart TrustNet!');
      onClose();
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (idx, val) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otpDigits];
    updated[idx] = val;
    setOtpDigits(updated);

    if (val && idx < 5) {
      const next = document.getElementById(`auth-otp-${idx + 1}`);
      next?.focus();
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(formData.name, formData.email, formData.password, formData.phone, formData.location);
        onToast && onToast('Account created & Aadhaar verified successfully!');
      } else {
        await login(formData.email, formData.password);
        onToast && onToast('Logged in successfully!');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
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
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-4 sm:p-space-24 shadow-2xl border border-outline-variant relative flex flex-col gap-space-16 my-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header with TrustNet badge */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">shield_with_heart</span>
            <span className="text-badge font-badge text-secondary bg-secondary-container/60 px-2 py-0.5 rounded">
              Sharekart TrustNet™ Indian Commerce
            </span>
          </div>
          <h2 className="font-headline-md text-xl sm:text-headline-md font-bold text-on-surface mt-1">
            {authMode === 'otp'
              ? 'Phone & WhatsApp OTP Login'
              : isRegisterMode
              ? 'Create Sharekart Account'
              : 'Sign in with Password'}
          </h2>
          <p className="text-xs sm:text-body-sm text-on-surface-variant">
            Every member is authenticated across Indian official credentials before item pickup or handover.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-surface-container-low p-1 rounded-xl text-xs sm:text-body-sm font-label-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
              authMode === 'otp' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Phone / WhatsApp OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
              authMode === 'password' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Email / Password
          </button>
        </div>

        {/* 1-Click Demo Accounts (Fast Testing) */}
        <div className="bg-surface-container-low p-space-12 rounded-xl flex flex-col gap-1 border border-outline-variant/50">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            1-Click Instant Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {demoAccounts.map(account => (
              <button
                key={account.id}
                type="button"
                onClick={() => handleDemoClick(account)}
                className="bg-surface-container-lowest hover:bg-secondary-container hover:text-on-secondary-container p-2 rounded-lg text-left border border-outline-variant/60 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <img
                  src={account.avatar_url}
                  alt={account.name}
                  className="w-8 h-8 rounded-full object-cover mb-1 border border-secondary"
                />
                <span className="font-label-bold text-[11px] leading-tight text-on-surface group-hover:text-on-secondary-container truncate w-full">
                  {account.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-secondary font-bold uppercase">
                  {account.id === 1 ? 'Seller' : account.id === 2 ? 'Lender' : 'Renter'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-space-8 rounded-lg text-xs sm:text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* MODE 1: Phone / WhatsApp OTP */}
        {authMode === 'otp' && (
          <div className="flex flex-col gap-space-16">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-space-12">
                {/* Channel Selector: WhatsApp vs SMS */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      channel === 'whatsapp'
                        ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    <span>WhatsApp OTP (Fast)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      channel === 'sms'
                        ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">sms</span>
                    <span>SMS OTP</span>
                  </button>
                </div>

                {/* Phone Input with +91 Country Flag */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-label-bold text-on-surface">Indian Mobile Number</label>
                  <div className="flex items-center bg-surface-container-low rounded-lg border border-outline-variant overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                    <div className="bg-surface-container px-3 py-2 text-xs sm:text-body-sm font-bold text-on-surface flex items-center gap-1 border-r border-outline-variant shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength="10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      className="w-full bg-transparent px-3 py-2 text-body-sm font-bold font-mono text-on-surface focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-inverse-surface text-on-primary py-2.5 rounded-lg font-label-bold text-xs sm:text-body-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Dispatch One-Time Password</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-space-12">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-on-surface-variant">Code sent to +91 {phone}</span>
                    <p className="text-xs font-bold text-secondary">
                      {channel === 'whatsapp' ? 'Check your WhatsApp message' : 'Check your SMS inbox'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-secondary hover:underline font-bold cursor-pointer"
                  >
                    Change Phone
                  </button>
                </div>

                {/* 6 OTP boxes */}
                <div className="flex justify-between gap-1 sm:gap-2">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`auth-otp-${i}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                      className="w-9 sm:w-11 h-12 text-center bg-surface-container-low font-headline-md text-headline-md font-bold rounded-lg border border-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:outline-none"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Expiring in <strong className="font-mono text-primary">{otpTimer}s</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpTimer(60)}
                    className="font-bold text-on-surface hover:text-secondary cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary py-2.5 rounded-lg font-label-bold text-xs sm:text-body-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>{loading ? 'Authenticating...' : 'Verify & Proceed'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 2: Password Login / Register */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-space-12">
            {isRegisterMode && (
              <>
                <div>
                  <label className="text-xs font-label-bold text-on-surface-variant block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Aarav Patel"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs sm:text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="text-xs font-label-bold text-on-surface-variant block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs sm:text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-label-bold text-on-surface-variant block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="aarav@sharekart.in"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs sm:text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="text-xs font-label-bold text-on-surface-variant block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs sm:text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-inverse-surface text-on-primary py-2.5 rounded-lg font-label-bold text-xs sm:text-body-sm shadow-sm transition-colors cursor-pointer mt-1"
            >
              {loading ? 'Please wait...' : isRegisterMode ? 'Create Account & Verify' : 'Sign In'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs text-secondary hover:underline font-bold cursor-pointer"
              >
                {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
