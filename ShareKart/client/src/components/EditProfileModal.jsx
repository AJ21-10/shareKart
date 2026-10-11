import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export const EditProfileModal = ({ isOpen, onClose, onToast }) => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customAvatarOpen, setCustomAvatarOpen] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState('');

  // Cartoon vector presets (Friendly vector illustrations - not real people photos)
  const avatarPresets = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Pixel&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=c1e7e3'
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setCity(user.city || 'Gandhinagar');
      setPincode(user.pincode || '382010');
      const currentAvatar = user.avatar_url;
      if (!currentAvatar || currentAvatar.includes('unsplash.com') || currentAvatar.includes('googleusercontent.com')) {
        setAvatarUrl(avatarPresets[0]);
      } else {
        setAvatarUrl(currentAvatar);
      }
      setError('');
      setImageUploadStatus('');
    }
  }, [user, isOpen]);

  // Handle local image file upload from user device
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Selected image is too large (max 10MB). Please select a smaller photo.');
      return;
    }

    setError('');
    setImageUploadStatus('Optimizing image...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 320;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAvatarUrl(compressedDataUrl);
          setImageUploadStatus('Photo uploaded from device!');
        } catch (err) {
          setAvatarUrl(event.target.result);
          setImageUploadStatus('Photo loaded from device!');
        }
      };
      img.onerror = () => {
        setError('Failed to process the selected image.');
        setImageUploadStatus('');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setError('Failed to read image file from your device.');
      setImageUploadStatus('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRandomCartoon = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    const styles = ['bottts', 'adventurer'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'c1e7e3'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
    const newAvatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}&backgroundColor=${randomBg}`;
    setAvatarUrl(newAvatar);
    setImageUploadStatus('New cartoon vector avatar selected!');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        avatar_url: avatarUrl.trim()
      });

      if (res.success) {
        onToast && onToast('Profile details updated successfully in PostgreSQL!');
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-outline-variant relative flex flex-col gap-4 my-4 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-outline-variant/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-on-surface">Edit Profile & Account</h3>
            <p className="text-xs text-on-surface-variant">Update your public name, phone, and neighborhood location</p>
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-2.5 rounded-lg text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Avatar Section & Device Upload */}
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/50 flex flex-col gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="flex items-center justify-between gap-3 pb-2 border-b border-outline-variant/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={avatarUrl || avatarPresets[0]}
                    alt="Profile"
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-secondary shadow-xs bg-surface-container"
                  />
                  <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-[13px] bg-secondary text-on-secondary rounded-full p-0.5 shadow-xs">
                    verified
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-bold text-on-surface">Profile Avatar</p>
                    {avatarUrl.startsWith('data:image') ? (
                      <span className="bg-secondary/15 text-secondary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        Device Photo
                      </span>
                    ) : (
                      <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        Cartoon Vector
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Upload your photo or choose a cartoon vector</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary hover:bg-inverse-surface text-on-primary px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">upload_file</span>
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleRandomCartoon}
                  className="bg-surface-container-high hover:bg-surface-container text-on-surface p-1.5 rounded-lg text-xs font-bold border border-outline-variant/60 cursor-pointer"
                  title="Roll random cartoon"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">casino</span>
                </button>
              </div>
            </div>

            {imageUploadStatus && (
              <div className="bg-secondary-container/40 text-on-secondary-container px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-secondary">check_circle</span>
                <span>{imageUploadStatus}</span>
              </div>
            )}

            {/* Avatar Preset Grid */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Cartoon Vector Options</span>
              <button
                type="button"
                onClick={() => setCustomAvatarOpen(!customAvatarOpen)}
                className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
              >
                {customAvatarOpen ? 'Close URL' : 'Enter URL'}
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              {avatarPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(preset);
                    setImageUploadStatus('Cartoon avatar selected!');
                  }}
                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform cursor-pointer shrink-0 ${
                    avatarUrl === preset ? 'border-secondary scale-110 shadow-sm ring-1 ring-secondary' : 'border-outline-variant/60 hover:opacity-80'
                  }`}
                >
                  <img src={preset} alt={`preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {customAvatarOpen && (
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://api.dicebear.com/7.x/bottts/svg?seed=your-custom"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary mt-1"
              />
            )}
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-bold text-on-surface">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Email (Read-Only) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-bold text-on-surface-variant flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-secondary font-bold">UIDAI Linked</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-xs sm:text-body-sm text-on-surface-variant/70 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Contact & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-bold text-on-surface">Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Neighborhood / Location */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-bold text-on-surface">Neighborhood / Area</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Gandhinagar, Sector 7"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* City & Pincode Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-bold text-on-surface">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Gandhinagar"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-bold text-on-surface">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="382010"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs sm:text-body-sm text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Aadhaar Trust Card */}
          <div className={`${user?.is_aadhaar_verified ? 'bg-secondary-container/30 border-secondary/20' : 'bg-amber-500/15 border-amber-500/30'} border rounded-xl p-3 flex items-center justify-between text-xs`}>
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[22px] ${user?.is_aadhaar_verified ? 'text-secondary' : 'text-amber-600'}`}>
                {user?.is_aadhaar_verified ? 'verified_user' : 'warning'}
              </span>
              <div>
                <p className="font-bold text-on-surface">UIDAI Trust Status</p>
                <p className="text-[11px] text-on-surface-variant font-mono">
                  {user?.is_aadhaar_verified
                    ? `${user?.aadhaar_number || 'XXXX-XXXX-5212'} • Hash: ${user?.aadhaar_hash || '#OK-91452'}`
                    : 'Aadhaar Not Verified • eKYC Pending'}
                </p>
              </div>
            </div>
            {user?.is_aadhaar_verified ? (
              <span className="bg-secondary/15 text-secondary text-[11px] font-bold px-2 py-0.5 rounded-full">
                Verified
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                Unverified
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-body-sm font-label-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs sm:text-body-sm font-label-bold bg-primary hover:bg-inverse-surface text-on-primary shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[17px]">save</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
