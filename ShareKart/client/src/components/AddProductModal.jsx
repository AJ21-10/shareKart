import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getCurrentLocation } from '../services/locationService';

export const AddProductModal = ({ isOpen, onClose, onProductCreated, onToast }) => {
  const { user, currentLocation, updateLocation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [locationMsg, setLocationMsg] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category_id: 'cameras-audio',
    subcategory: 'Mirrorless & Action Gear',
    transaction_type: 'rent',
    rent_price_daily: 450,
    security_deposit: 2000,
    sale_price: 0,
    original_mrp: 15000,
    description: '',
    condition_tag: 'Used - Excellent',
    condition_score: '9 / 10',
    location_name: currentLocation || user?.location || 'Gandhinagar, Sector 7',
    imageUrl: ''
  });

  const handleDetectLocation = async (isAuto = false) => {
    setDetectingLocation(true);
    if (!isAuto) {
      setLocationMsg('Requesting browser GPS permission...');
    }
    const res = await getCurrentLocation();
    setDetectingLocation(false);

    if (res.success && res.locationName) {
      setFormData(prev => ({ ...prev, location_name: res.locationName }));
      if (updateLocation) {
        updateLocation(res.locationName);
      }
      setLocationStatus('success');
      setLocationMsg(`Live location: ${res.locationName}`);
      if (!isAuto && onToast) {
        onToast(`📍 Current location applied: ${res.locationName}`);
      }
    } else {
      setLocationStatus(res.code === 'PERMISSION_DENIED' ? 'denied' : 'error');
      setLocationMsg(res.message || 'Could not detect location. You can enter it manually.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Prompt user for browser location permission and use current live location
      handleDetectLocation(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to list a product');
      return;
    }
    if (!user.is_aadhaar_verified) {
      alert('Aadhaar verification is required to list products. Please verify your Aadhaar to continue.');
      return;
    }
    setLoading(true);

    try {
      const defaultImg = formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
      
      const payload = {
        ...formData,
        rent_price_daily: Number(formData.rent_price_daily) || 0,
        rent_price_weekly: Number(formData.rent_price_daily) * 6,
        security_deposit: Number(formData.security_deposit) || 0,
        sale_price: Number(formData.sale_price) || 0,
        original_mrp: Number(formData.original_mrp) || 0,
        images: [defaultImg],
        specs: {
          'Condition': formData.condition_tag,
          'Owner Verified': user?.is_aadhaar_verified ? 'Aadhaar eKYC Verified' : 'Community Host'
        },
        kit_items: [formData.title, 'Protective Padded Bag', 'Power Adapter & Cable'],
        pickup_locations: [formData.location_name]
      };

      const res = await api.createProduct(payload);
      if (res.success) {
        onToast && onToast('Item listed live on Sharekart with Escrow protection!');
        onProductCreated && onProductCreated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to create listing', err);
      alert(err.message || 'Failed to list product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-xl max-w-xl w-full p-4 sm:p-space-24 shadow-2xl border border-outline-variant my-4 sm:my-8 flex flex-col gap-3 sm:gap-space-16">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2 sm:pb-space-12">
          <div className="flex items-center gap-2 sm:gap-space-8">
            <span className="material-symbols-outlined text-secondary text-[22px] sm:text-[24px]">add_circle</span>
            <h2 className="font-headline-sm text-base sm:text-headline-sm text-on-surface">List Item for Rent or Sale</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-space-12 text-xs sm:text-body-sm">
          {/* Title */}
          <div>
            <label className="text-badge font-badge text-on-surface-variant block mb-1">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Sony Alpha A6400 or Bosch Hammer Drill..."
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant rounded p-2 sm:p-space-8 text-on-surface focus:ring-1 focus:ring-secondary"
            />
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-space-12">
            <div>
              <label className="text-badge font-badge text-on-surface-variant block mb-1">Category *</label>
              <select
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant rounded p-2 sm:p-space-8 text-on-surface focus:ring-1 focus:ring-secondary cursor-pointer"
              >
                <option value="cameras-audio">Cameras & Audio</option>
                <option value="laptops-mobiles">Laptops & Mobiles</option>
                <option value="power-tools-machinery">Power Tools & Machinery</option>
                <option value="home-furniture">Home Furniture</option>
                <option value="bikes-cycles">Bikes & Cycles</option>
                <option value="home-appliances">Home Appliances</option>
                <option value="books-sports">Books & Sports</option>
              </select>
            </div>
            <div>
              <label className="text-badge font-badge text-on-surface-variant block mb-1">Listing Type *</label>
              <select
                value={formData.transaction_type}
                onChange={e => setFormData({ ...formData, transaction_type: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant rounded p-2 sm:p-space-8 text-on-surface focus:ring-1 focus:ring-secondary cursor-pointer"
              >
                <option value="rent">Rent Only</option>
                <option value="buy">Sale Only</option>
                <option value="both">Both (Rent or Buy)</option>
              </select>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-space-12 bg-surface-container-low p-2.5 sm:p-space-12 rounded-lg">
            {(formData.transaction_type === 'rent' || formData.transaction_type === 'both') && (
              <>
                <div>
                  <label className="text-badge font-badge text-on-surface-variant block mb-1">Rent / Day (₹)</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.rent_price_daily}
                    onChange={e => setFormData({ ...formData, rent_price_daily: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded p-space-8 text-on-surface"
                  />
                </div>
                <div>
                  <label className="text-badge font-badge text-on-surface-variant block mb-1">Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.security_deposit}
                    onChange={e => setFormData({ ...formData, security_deposit: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded p-space-8 text-on-surface"
                  />
                </div>
              </>
            )}
            {(formData.transaction_type === 'buy' || formData.transaction_type === 'both') && (
              <div>
                <label className="text-badge font-badge text-on-surface-variant block mb-1">Sale Price (₹)</label>
                <input
                  type="number"
                  min="50"
                  value={formData.sale_price}
                  onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded p-space-8 text-on-surface"
                />
              </div>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="text-badge font-badge text-on-surface-variant block mb-1">Photo Image URL (or leave blank for stock thumbnail)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant rounded p-space-8 text-on-surface"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-badge font-badge text-on-surface-variant block mb-1">Description & Usage Notes</label>
            <textarea
              rows="3"
              placeholder="Detail kit contents, condition, and any handover instructions..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant rounded p-space-8 text-on-surface"
            ></textarea>
          </div>

          {/* Location & Handover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-space-12">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-badge font-badge text-on-surface-variant block">Pickup Location *</label>
                <button
                  type="button"
                  onClick={() => handleDetectLocation(false)}
                  disabled={detectingLocation}
                  className="inline-flex items-center gap-1 text-[11px] font-label-bold text-secondary hover:text-secondary/80 transition-colors cursor-pointer disabled:opacity-50"
                  title="Request browser permission and use live GPS location"
                >
                  <span className={`material-symbols-outlined text-[13px] ${detectingLocation ? 'animate-spin' : ''}`}>
                    {detectingLocation ? 'progress_activity' : 'my_location'}
                  </span>
                  <span>{detectingLocation ? 'Detecting...' : 'Use Current Loc'}</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2 text-[17px] text-on-surface-variant pointer-events-none">
                  location_on
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kudasan, Gandhinagar 382007"
                  value={formData.location_name}
                  onChange={e => {
                    setFormData({ ...formData, location_name: e.target.value });
                    setLocationStatus('');
                    setLocationMsg('');
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant rounded p-2 pl-7.5 sm:p-space-8 sm:pl-7.5 text-on-surface focus:ring-1 focus:ring-secondary text-xs sm:text-body-sm"
                />
              </div>
              {/* Geolocation status / permission info */}
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
            <div>
              <label className="text-badge font-badge text-on-surface-variant block mb-1">Condition</label>
              <select
                value={formData.condition_tag}
                onChange={e => setFormData({ ...formData, condition_tag: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant rounded p-2 sm:p-space-8 text-on-surface cursor-pointer"
              >
                <option>Used - Like New</option>
                <option>Used - Excellent</option>
                <option>Used - Good</option>
              </select>
            </div>
          </div>

          <div className="pt-space-8 flex items-center justify-end gap-space-12 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-space-16 py-space-8 rounded text-body-sm font-label-bold text-on-surface-variant hover:text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-secondary hover:bg-secondary/90 text-on-secondary px-space-24 py-space-8 rounded font-label-bold flex items-center gap-space-6 shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span>{loading ? 'Publishing...' : 'Post Ad to Sharekart'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
