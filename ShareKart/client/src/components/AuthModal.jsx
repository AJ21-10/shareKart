import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, onToast }) => {
  const { login, register, switchDemoUser, demoAccounts } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+91 98765 43210',
    location: 'Gandhinagar, Sector 7'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-4 sm:p-space-24 shadow-2xl border border-outline-variant relative flex flex-col gap-3 sm:gap-space-16 my-4 sm:my-8">
        <button 
          onClick={onClose}
          className="absolute top-space-16 right-space-16 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-space-4">
          <div className="flex items-center gap-space-8">
            <span className="material-symbols-outlined text-secondary text-[24px]">verified_user</span>
            <span className="text-badge font-badge text-secondary bg-secondary-fixed/30 px-space-8 py-0.5 rounded">Aadhaar Secure Network</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            {isRegisterMode ? 'Create Sharekart Account' : 'Welcome to Sharekart'}
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            {isRegisterMode ? 'Join our trusted P2P sharing & rental marketplace' : 'Log in to rent, buy, or manage your listings'}
          </p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="bg-surface-container-low p-space-12 rounded-lg flex flex-col gap-space-8">
          <span className="text-badge font-badge text-on-surface-variant uppercase tracking-wider">Quick Demo Logins (1-Click Test)</span>
          <div className="grid grid-cols-3 gap-space-6">
            {demoAccounts.map(account => (
              <button
                key={account.id}
                type="button"
                onClick={() => handleDemoClick(account)}
                className="bg-surface-container-lowest hover:bg-secondary-container hover:text-on-secondary-container p-space-8 rounded text-left border border-outline-variant transition-all flex flex-col items-center text-center group"
              >
                <img src={account.avatar_url} alt={account.name} className="w-8 h-8 rounded-full object-cover mb-1 border border-secondary-fixed" />
                <span className="font-label-bold text-[12px] leading-tight text-on-surface group-hover:text-on-secondary-container truncate w-full">{account.name.split(' ')[0]}</span>
                <span className="text-[10px] text-secondary font-bold">Demo</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-space-8 rounded text-body-sm flex items-center gap-space-6">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-12">
          {isRegisterMode && (
            <>
              <div>
                <label className="text-badge font-badge text-on-surface-variant block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Patel"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded p-space-8 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="text-badge font-badge text-on-surface-variant block mb-1">Local City & Sector</label>
                <input
                  type="text"
                  placeholder="Gandhinagar, Sector 7"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded p-space-8 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-badge font-badge text-on-surface-variant block mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="aarav@sharekart.in"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant rounded p-space-8 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="text-badge font-badge text-on-surface-variant block mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant rounded p-space-8 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-inverse-surface text-on-primary py-space-12 rounded font-label-bold text-label-bold flex items-center justify-center gap-space-6 shadow-sm mt-space-4 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isRegisterMode ? 'how_to_reg' : 'login'}
            </span>
            <span>{loading ? 'Processing...' : isRegisterMode ? 'Register & Verify Aadhaar' : 'Sign In'}</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-body-sm pt-space-8 border-t border-outline-variant">
          <span className="text-on-surface-variant">
            {isRegisterMode ? 'Already have an account?' : 'New to Sharekart?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
            }}
            className="text-secondary font-label-bold hover:underline"
          >
            {isRegisterMode ? 'Sign In Instead' : 'Create Free Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
