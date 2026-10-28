import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { getCurrentLocation } from '../services/locationService';

export const ListItemPage = ({ onNavigate, onOpenAadhaarVerification, onToast }) => {
  const { user, currentLocation, updateLocation } = useAuth();
  const { addProduct } = useMarketplace();

  // Form State
  const [title, setTitle] = useState('Bosch Rotary Hammer Drill 800W with 5 drill bits & carry case');
  const [category, setCategory] = useState('power-tools-machinery');
  const [brand, setBrand] = useState('Bosch');
  const [modeRent, setModeRent] = useState(true);
  const [modeSell, setModeSell] = useState(true);

  // Pricing State
  const [dailyRate, setDailyRate] = useState(350);
  const [securityDeposit, setSecurityDeposit] = useState(1500);
  const [weeklyDiscount, setWeeklyDiscount] = useState(true);
  const [salePrice, setSalePrice] = useState(3800);

  // Condition, Bill Checkbox & Custom Accessories
  const [condition, setCondition] = useState('gently_used');
  const [hasInvoice, setHasInvoice] = useState(true);
  const [customAccessories, setCustomAccessories] = useState([
    'Original Hard Carry Case',
    '5x Masonry Drill Bits',
    'Power Cord (3 Meter)'
  ]);
  const [accessoryInput, setAccessoryInput] = useState('');

  // Photos
  const [photos, setPhotos] = useState([
    {
      id: 1,
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3MwnOocyWiZexRTcYF0p-7X91kBdEb9kmojSV52z0kIIOVM-0F2sUxBt9bYXfRwi3w7hz85yR1qyVfgBeotRi7WFY2p8fTT86oaBPUsfpwNc_kMc8KcyC8tzwkFF7ozTYqgJZ-GmOKf9GI4XudEgoknqYITySqOmYD-0KEvlTVFlUCAWDL4g0KwRUlYnYgyXMDidq6m0nzhJM6t1HBlccKH9QSl0andmk8VGJM2vxS91fXJWdT3G2gg',
      label: 'Cover Photo'
    },
    {
      id: 2,
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGIhbkG2RfKhwZVLREgl4TnmL90RAri0AeoKSW0Mau749cT5HVvWbhiXzhccHTV1A7DkkqMcB-E7d0neBaOIosfBuHIZUciFNASt-lHdXsvDQpiNYf6n4KDV3MPUal41fI7ecXuUC79nQPsELx0aKvZibRbzfjHr3cILVr7Sq82uPhIY4GuaxwBlPWU1KFs4aY05wSLEBTy6SG3E4dDtehfMM11_BjpgZ4sfoTn3rAovasvwvb2RApgQ',
      label: ''
    },
    {
      id: 3,
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDNWrmqD-kUO-zHfo9RsBbfQGeT4XatcGXfwUUuvZbh8ljWQFrPP__NHq2Xjvmo6iBjl39w6yuT-CuqLe82NuiyAQ0X8pRdIJ4xUaHQ9sIXVVdZkxg4mXb_FC4BiY0Ct0BBSSXb3Bthb_mSYrOoaGUpFHHCoWX8ZrGjkhaNkYTNb_iI-JpdFHA-SOknmrNhO40kzNeZMEsxvsorUTCbL6KHYpAecaHMTEL66n-HkLi9I0Ok9e3ssiBjg',
      label: 'Bill Attached'
    }
  ]);

  // Handover preferences
  const [pickupLocation, setPickupLocation] = useState(
    currentLocation || user?.location || 'Sector 21, Gandhinagar, Gujarat - 382021'
  );
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [locationMsg, setLocationMsg] = useState('');
  const [selfPickup, setSelfPickup] = useState(true);
  const [doorstepDelivery, setDoorstepDelivery] = useState(true);
  const [legalConsent, setLegalConsent] = useState(true);

  const handleDetectLocation = async (isAuto = false) => {
    setDetectingLocation(true);
    if (!isAuto) {
      setLocationMsg('Requesting browser GPS permission...');
    }
    const res = await getCurrentLocation();
    setDetectingLocation(false);

    if (res.success && res.locationName) {
      setPickupLocation(res.locationName);
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
    // Prompt user for browser location permission and use current live location on form load
    handleDetectLocation(true);
  }, []);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Earnings calculations
  const numDaily = Number(dailyRate) || 0;
  const minMonthly = Math.round(numDaily * 12);
  const maxMonthly = Math.round(numDaily * 16);
  const takeHomePerDay = Math.round(numDaily * 0.95);
  const paybackDays = Math.max(1, Math.round((Number(salePrice) || 6400) / (numDaily || 350)));

  const handleAddAccessory = () => {
    const trimmed = accessoryInput.trim();
    if (!trimmed) return;
    if (!customAccessories.includes(trimmed)) {
      setCustomAccessories((prev) => [...prev, trimmed]);
    }
    setAccessoryInput('');
  };

  const handleRemoveAccessory = (indexToRemove) => {
    setCustomAccessories((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddSuggestion = (text) => {
    if (!customAccessories.includes(text)) {
      setCustomAccessories((prev) => [...prev, text]);
    }
  };

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readFileAsDataUrl = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

    const fileList = Array.from(files);
    const loadedPhotos = await Promise.all(
      fileList.map(async (f, i) => {
        const dataUrl = await readFileAsDataUrl(f);
        return {
          id: Date.now() + i,
          url: dataUrl,
          name: f.name,
          label: ''
        };
      })
    );

    const validPhotos = loadedPhotos.filter((p) => Boolean(p.url));
    setPhotos((prev) => [...prev, ...validPhotos]);
    onToast && onToast(`${validPhotos.length} photo(s) added!`);
  };

  const handlePublish = async (e) => {
    e?.preventDefault();
    if (!user) {
      onNavigate('login');
      return;
    }
    if (!user.is_aadhaar_verified) {
      if (onOpenAadhaarVerification) {
        onOpenAadhaarVerification('list', () => handlePublish());
      } else {
        onNavigate('aadhaar-ekyc');
      }
      return;
    }

    if (!title.trim()) {
      alert('Please provide an item title');
      return;
    }
    if (!modeRent && !modeSell) {
      alert('Please select at least one listing mode (Rent or Sell)');
      return;
    }
    if (!legalConsent) {
      alert('Please accept the Sharekart Standard Neighborhood Agreement');
      return;
    }

    setIsSubmitting(true);
    try {
      const transaction_type = modeRent && modeSell ? 'both' : modeRent ? 'rent' : 'buy';
      const kitItems = [
        ...(hasInvoice ? ['Original GST Tax Invoice / Bill'] : []),
        ...customAccessories
      ];

      const rawImages = photos
        .map((p) => p.url)
        .filter((u) => u && !u.startsWith('blob:'));

      const payload = {
        title,
        category_id: category,
        subcategory: brand || 'Hardware',
        brand,
        description: `${title}. Condition: ${condition.replace('_', ' ')}. Includes: ${kitItems.join(', ')}. Verified neighborhood host.`,
        transaction_type,
        rent_price_daily: Number(dailyRate) || 0,
        rent_price_weekly: Math.round(Number(dailyRate) * 6 * 0.85) || 0,
        sale_price: Number(salePrice) || 0,
        security_deposit: Number(securityDeposit) || 0,
        condition_tag: condition === 'like_new' ? 'Like New' : condition === 'gently_used' ? 'Gently Used' : 'Fair / Working',
        condition_score: condition === 'like_new' ? '9.5 / 10' : condition === 'gently_used' ? '8.5 / 10' : '7 / 10',
        location_name: pickupLocation,
        has_invoice: hasInvoice,
        kit_items: kitItems,
        images: rawImages
      };

      const res = await api.createProduct(payload);
      if (res.success || res.productId) {
        const savedImages = res.images || (Array.isArray(res.product?.images) ? res.product.images : null) || rawImages;
        if (addProduct) {
          addProduct({
            ...payload,
            id: res.productId || Date.now(),
            seller_name: user?.name || 'Local Host',
            seller_rating: '5.0',
            seller_is_verified: true,
            images: savedImages
          });
        }
        onToast && onToast('Item successfully published to Gandhinagar neighborhood!');
        onNavigate('search');
      } else {
        throw new Error(res.message || 'Failed to publish');
      }
    } catch (err) {
      console.warn('Backend create product error notice:', err);
      if (err.message && err.message.toLowerCase().includes('aadhaar')) {
        if (onOpenAadhaarVerification) {
          onOpenAadhaarVerification('list');
        } else {
          alert(err.message);
        }
        return;
      }
      onToast && onToast(err.message || 'Failed to publish listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('sharekart_listing_draft', JSON.stringify({
        title, category, brand, dailyRate, securityDeposit, salePrice, condition, hasInvoice, customAccessories
      }));
      onToast && onToast('Draft saved successfully to your device!');
    } catch {
      onToast && onToast('Draft saved!');
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Breadcrumb & Top Section Header */}
      <div className="flex flex-col gap-space-8 mb-space-24">
        <nav className="flex items-center gap-space-6 text-body-sm font-body-sm text-on-surface-variant">
          <button
            onClick={() => onNavigate('dashboard')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <button
            onClick={() => onNavigate('dashboard')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            My Inventory
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-label-bold">List New Item</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-16 pb-space-8">
          <div>
            <h1 className="font-display-lg text-2xl sm:text-display-lg text-on-surface tracking-tight font-bold">
              List an Item
            </h1>
            <p className="text-body-md text-xs sm:text-body-md text-on-surface-variant mt-1">
              Rent out or sell items to verified neighbors nearby with escrow safety.
            </p>
          </div>
          {user?.is_aadhaar_verified ? (
            <div className="flex items-center gap-space-8 self-start md:self-auto bg-surface-container-low px-space-12 py-space-6 rounded-lg border border-outline-variant/50">
              <span className="material-symbols-outlined text-[20px] text-secondary">verified_user</span>
              <span className="text-body-sm font-label-bold text-on-surface">UIDAI eKYC Verified Host</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onOpenAadhaarVerification) {
                  onOpenAadhaarVerification('list');
                } else {
                  onNavigate('aadhaar-ekyc');
                }
              }}
              className="flex items-center gap-space-8 self-start md:self-auto bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-space-12 py-space-6 rounded-lg cursor-pointer transition text-amber-700 shadow-xs"
            >
              <span className="material-symbols-outlined text-[20px] text-amber-600">warning</span>
              <span className="text-body-sm font-label-bold">Verify Aadhaar to Publish</span>
            </button>
          )}
        </div>
      </div>

      {!user?.is_aadhaar_verified && (
        <div className="w-full mb-space-16 p-3 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0">
              shield_person
            </span>
            <p className="font-bold text-slate-900 text-sm">
              Aadhaar verification is required before publishing listings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onOpenAadhaarVerification) {
                onOpenAadhaarVerification('list');
              } else {
                onNavigate('aadhaar-ekyc');
              }
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg shrink-0 flex items-center justify-center gap-1.5 transition cursor-pointer text-xs"
          >
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span>Verify Aadhaar</span>
          </button>
        </div>
      )}

      {/* Main Grid: Guided Form & Live Calculator Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24 items-start">
        {/* Left Column: Form Progression (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-24">
          {/* Step 1: Basic Information */}
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-24 shadow-sm border border-outline-variant/40 flex flex-col gap-space-16">
            <div className="flex items-center gap-space-12">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-bold text-label-bold">
                1
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Basic Details</h2>
              </div>
            </div>

            <div className="flex flex-col gap-space-16">
              <div className="flex flex-col gap-space-4">
                <label className="font-label-bold text-label-bold text-on-surface" htmlFor="item-title">
                  Item Title / Model Name <span className="text-error">*</span>
                </label>
                <input
                  id="item-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sony Alpha a6400 Mirrorless Camera with 18-135mm Lens"
                  className="w-full bg-surface-container-low px-space-16 py-space-12 rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary transition-all border border-transparent focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-16">
                <div className="flex flex-col gap-space-4">
                  <label className="font-label-bold text-label-bold text-on-surface" htmlFor="category-select">
                    Category <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="category-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none bg-surface-container-low px-space-16 py-space-12 rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary cursor-pointer transition-all border border-transparent focus:border-secondary"
                    >
                      <option value="power-tools-machinery">Power Tools & Hardware</option>
                      <option value="laptops-mobiles">Laptops, Mobiles & Tech</option>
                      <option value="cameras-audio">DSLR, Cameras & Audio</option>
                      <option value="home-appliances">Home Appliances & Inverters</option>
                      <option value="bikes-cycles">Bicycles & Two-Wheelers</option>
                      <option value="home-furniture">Home Furniture & Workstations</option>
                      <option value="books-sports">Outdoor & Camping Equipment</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-space-4">
                  <label className="font-label-bold text-label-bold text-on-surface" htmlFor="brand-select">
                    Brand / Manufacturer
                  </label>
                  <input
                    id="brand-select"
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Bosch, Sony, Apple"
                    className="w-full bg-surface-container-low px-space-16 py-space-12 rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary transition-all border border-transparent focus:border-secondary"
                  />
                </div>
              </div>

              {/* Listing Modes Toggle */}
              <div className="flex flex-col gap-space-8 mt-space-4">
                <span className="font-label-bold text-label-bold text-on-surface">Listing Mode</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-12">
                  <label
                    className={`relative flex items-center gap-space-12 p-3.5 rounded-lg cursor-pointer transition-all border ${
                      modeRent ? 'bg-secondary/5 border-secondary shadow-xs' : 'bg-surface-container-low border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={modeRent}
                      onChange={(e) => setModeRent(e.target.checked)}
                      className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="font-label-bold text-label-bold text-on-surface">Rent Out</span>
                      <span className="bg-secondary text-on-secondary text-badge font-badge px-2 py-0.5 rounded">
                        Daily / Weekly
                      </span>
                    </div>
                  </label>

                  <label
                    className={`relative flex items-center gap-space-12 p-3.5 rounded-lg cursor-pointer transition-all border ${
                      modeSell ? 'bg-primary/5 border-primary shadow-xs' : 'bg-surface-container-low border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={modeSell}
                      onChange={(e) => setModeSell(e.target.checked)}
                      className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="font-label-bold text-label-bold text-on-surface">Sell Outright</span>
                      <span className="bg-surface-container-high text-on-surface text-badge font-badge px-2 py-0.5 rounded">
                        One-Time
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Pricing & Escrow Security Deposit */}
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-24 shadow-sm border border-outline-variant/40 flex flex-col gap-space-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-12">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-bold text-label-bold">
                  2
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Pricing</h2>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-space-4 bg-tertiary-fixed text-on-tertiary-fixed px-space-8 py-space-4 rounded">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span className="text-badge font-badge">Escrow Protected</span>
              </div>
            </div>

            {/* Rental Specific Rates */}
            {modeRent && (
              <div className="flex flex-col gap-space-16 p-space-16 bg-surface-container-low rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-label-bold text-label-bold text-secondary flex items-center gap-space-6">
                    <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
                    Rental Rates
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-16">
                  <div className="flex flex-col gap-space-4">
                    <label className="font-label-bold text-label-bold text-on-surface" htmlFor="daily-rate">
                      Daily Rental Rate <span className="text-error">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 font-headline-sm text-headline-sm text-on-surface">₹</span>
                      <input
                        id="daily-rate"
                        type="number"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(e.target.value)}
                        className="w-full bg-surface-container-lowest pl-10 pr-space-16 py-space-12 rounded-lg font-price-md text-price-md text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
                      />
                      <span className="absolute right-4 text-body-sm font-body-sm text-on-surface-variant">/ day</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-4">
                    <label className="font-label-bold text-label-bold text-on-surface" htmlFor="security-deposit">
                      Refundable Security Deposit <span className="text-error">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 font-headline-sm text-headline-sm text-on-surface">₹</span>
                      <input
                        id="security-deposit"
                        type="number"
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                        className="w-full bg-surface-container-lowest pl-10 pr-space-16 py-space-12 rounded-lg font-price-md text-price-md text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Weekly Discount Checkbox */}
                <label className="flex items-center gap-space-8 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={weeklyDiscount}
                    onChange={(e) => setWeeklyDiscount(e.target.checked)}
                    className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                  />
                  <span className="text-body-sm font-body-sm text-on-surface">
                    Apply <strong>15% discount</strong> for weekly rentals (7+ days)
                  </span>
                </label>
              </div>
            )}

            {/* Outright Sale Price */}
            {modeSell && (
              <div className="flex flex-col gap-space-12 p-space-16 bg-surface-container-low rounded-lg">
                <span className="font-label-bold text-label-bold text-on-surface flex items-center gap-space-6">
                  <span className="material-symbols-outlined text-[18px]">sell</span>
                  Sale Price
                </span>

                <div className="flex flex-col gap-space-4 max-w-md">
                  <label className="font-label-bold text-label-bold text-on-surface" htmlFor="sale-price">
                    Direct Purchase Price <span className="text-error">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-headline-sm text-headline-sm text-on-surface">₹</span>
                    <input
                      id="sale-price"
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full bg-surface-container-lowest pl-10 pr-space-16 py-space-12 rounded-lg font-price-md text-price-md text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Step 3: Item Condition & Verification */}
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-24 shadow-sm border border-outline-variant/40 flex flex-col gap-space-20">
            <div className="flex items-center gap-space-12">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-bold text-label-bold">
                3
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Condition & Accessories</h2>
              </div>
            </div>

            <div className="flex flex-col gap-space-16">
              <div className="flex flex-col gap-space-8">
                <span className="font-label-bold text-label-bold text-on-surface">
                  Condition <span className="text-error">*</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-12">
                  <button
                    type="button"
                    onClick={() => setCondition('like_new')}
                    className={`flex items-center justify-between p-space-12 rounded-lg text-left transition-all border cursor-pointer ${
                      condition === 'like_new'
                        ? 'bg-primary-container text-on-primary border-primary-container shadow-sm'
                        : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="font-label-bold text-label-bold">Like New</span>
                    <span className={`text-badge font-badge ${condition === 'like_new' ? 'text-secondary-fixed' : 'text-secondary'}`}>
                      95-100%
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCondition('gently_used')}
                    className={`flex items-center justify-between p-space-12 rounded-lg text-left transition-all border cursor-pointer ${
                      condition === 'gently_used'
                        ? 'bg-primary-container text-on-primary border-primary-container shadow-sm'
                        : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="font-label-bold text-label-bold">Gently Used</span>
                    <span className={`text-badge font-badge ${condition === 'gently_used' ? 'text-secondary-fixed' : 'text-secondary'}`}>
                      80-94%
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCondition('fair')}
                    className={`flex items-center justify-between p-space-12 rounded-lg text-left transition-all border cursor-pointer ${
                      condition === 'fair'
                        ? 'bg-primary-container text-on-primary border-primary-container shadow-sm'
                        : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="font-label-bold text-label-bold">Fair / Working</span>
                    <span className={`text-badge font-badge ${condition === 'fair' ? 'text-secondary-fixed' : 'text-on-surface-variant'}`}>
                      60-79%
                    </span>
                  </button>
                </div>
              </div>

              {/* 1. Original Tax Invoice / Bill Checkbox (Single dedicated checkbox) */}
              <div className="p-space-16 bg-surface-container-low rounded-xl border border-outline-variant/40">
                <label className="flex items-center gap-space-12 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasInvoice}
                    onChange={(e) => setHasInvoice(e.target.checked)}
                    className="w-5 h-5 rounded text-primary accent-primary cursor-pointer shrink-0"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-label-bold text-label-bold text-on-surface">
                      Original GST Tax Invoice / Bill Available
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary bg-secondary-container/30 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[13px]">receipt_long</span>
                      Bill Check
                    </span>
                  </div>
                </label>
              </div>

              {/* 2. Included Accessories & Extras (Custom Text Input & Dynamic Items) */}
              <div className="flex flex-col gap-space-12">
                <div className="flex items-center justify-between">
                  <span className="font-label-bold text-label-bold text-on-surface">
                    Included Accessories &amp; Extras
                  </span>
                  <span className="text-body-sm text-on-surface-variant font-medium">
                    {customAccessories.length} {customAccessories.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Text input with Add button */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                      add_circle
                    </span>
                    <input
                      type="text"
                      value={accessoryInput}
                      onChange={(e) => setAccessoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAccessory();
                        }
                      }}
                      placeholder="Type accessory (e.g. Carry Bag, Charger, Batteries)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg border border-outline-variant text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAccessory}
                    disabled={!accessoryInput.trim()}
                    className="px-space-16 py-2.5 bg-primary text-on-primary rounded-lg font-label-bold text-body-sm hover:bg-on-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>Add</span>
                  </button>
                </div>

                {/* Display added accessories tags */}
                {customAccessories.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/30 min-h-[50px] items-center">
                    {customAccessories.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant/60 shadow-2xs text-body-sm font-medium animate-scale-up"
                      >
                        <span className="material-symbols-outlined text-secondary text-[16px]">
                          check_circle
                        </span>
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAccessory(idx)}
                          className="w-5 h-5 rounded-full hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-error transition-colors cursor-pointer ml-1"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-body-sm text-outline italic px-3 py-2 bg-surface-container-low/40 rounded-lg border border-dashed border-outline-variant/50">
                    No extra accessories added yet.
                  </div>
                )}

                {/* Quick 1-Click Suggestion Chips */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Quick Suggestions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Original Box',
                      'Power Adapter & Cable',
                      'Protective Carry Case',
                      'Warranty Card',
                      'Rechargeable Battery',
                      'Mounting Clamp'
                    ].map((suggestion) => {
                      const isAdded = customAccessories.includes(suggestion);
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => isAdded ? null : handleAddSuggestion(suggestion)}
                          disabled={isAdded}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                            isAdded
                              ? 'bg-secondary-container/20 text-on-surface-variant border-secondary/30 opacity-60 cursor-default'
                              : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:border-secondary hover:text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {isAdded ? 'done' : 'add'}
                          </span>
                          <span>{suggestion}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Handover Guarantee Card */}
              <div className="flex items-start gap-space-12 p-space-12 bg-secondary-container/20 rounded-lg border border-secondary-container/40">
                <span className="material-symbols-outlined text-[22px] text-secondary shrink-0 mt-0.5">videocam</span>
                <div className="flex flex-col">
                  <span className="font-label-bold text-label-bold text-on-surface">Sharekart Handover Guarantee</span>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Quick 30-sec power test in front of borrower during local pickup before releasing the one-time OTP.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4: Upload Photos */}
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-24 shadow-sm border border-outline-variant/40 flex flex-col gap-space-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-12">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-bold text-label-bold">
                  4
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Photos</h2>
                </div>
              </div>
              <span className="text-badge font-badge bg-surface-container-high text-on-surface px-space-8 py-space-4 rounded">
                {photos.length} of 8 Uploaded
              </span>
            </div>

            <div className="flex flex-col gap-space-16">
              {/* Lender Tip Card */}
              <div className="flex items-center gap-space-8 bg-surface-container-low p-space-12 rounded-lg">
                <span className="material-symbols-outlined text-[20px] text-on-tertiary-container">lightbulb</span>
                <p className="text-body-sm font-body-sm text-on-surface leading-snug">
                  <strong>Lender Tip:</strong> Clear photos showing serial number &amp; purchase bill receive <strong>3x more bookings</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-12">
                {photos.map((p, idx) => (
                  <div key={p.id} className="relative group rounded-lg overflow-hidden bg-surface-container-low shadow-sm aspect-video sm:aspect-square">
                    <img src={p.url} alt="Listing upload" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-primary text-on-primary text-badge font-badge px-space-6 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                    {p.label && idx !== 0 && (
                      <span className="absolute bottom-2 left-2 bg-secondary text-on-secondary text-badge font-badge px-space-4 py-0.5 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">receipt</span> {p.label}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(p.id)}
                      className="absolute top-2 right-2 bg-surface-container-lowest/90 text-error p-1 rounded-full shadow hover:bg-surface-container-lowest transition-colors cursor-pointer"
                      title="Remove photo"
                    >
                      <span className="material-symbols-outlined text-[16px] block">delete</span>
                    </button>
                  </div>
                ))}

                {/* Upload Slot Button */}
                <label className="flex flex-col items-center justify-center aspect-video sm:aspect-square bg-surface-container-low hover:bg-surface-container rounded-lg cursor-pointer transition-colors text-center p-space-12 border-2 border-dashed border-outline-variant">
                  <span className="material-symbols-outlined text-[26px] text-on-surface-variant">add_photo_alternate</span>
                  <span className="text-label-bold font-label-bold text-on-surface mt-1">+ Add Photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Step 5: Pickup Location & Handover Modes */}
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-24 shadow-sm border border-outline-variant/40 flex flex-col gap-space-16">
            <div className="flex items-center gap-space-12">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-bold text-label-bold">
                5
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Pickup Location</h2>
              </div>
            </div>

            <div className="flex flex-col gap-space-16">
              <div className="flex flex-col gap-space-4">
                <div className="flex items-center justify-between">
                  <label className="font-label-bold text-label-bold text-on-surface">Pickup Area / Landmark <span className="text-error">*</span></label>
                  <button
                    type="button"
                    onClick={() => handleDetectLocation(false)}
                    disabled={detectingLocation}
                    className="inline-flex items-center gap-1 text-xs font-label-bold text-secondary hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-[15px] ${detectingLocation ? 'animate-spin' : ''}`}>
                      {detectingLocation ? 'progress_activity' : 'my_location'}
                    </span>
                    <span>{detectingLocation ? 'Detecting...' : 'Use Current GPS'}</span>
                  </button>
                </div>
                <div className="flex items-center bg-surface-container-low px-space-16 py-space-12 rounded-lg gap-space-8 border border-outline-variant/40">
                  <span className="material-symbols-outlined text-[20px] text-secondary">location_on</span>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => {
                      setPickupLocation(e.target.value);
                      setLocationStatus('');
                      setLocationMsg('');
                    }}
                    placeholder="e.g. Infocity, Gandhinagar"
                    className="font-body-md text-body-md text-on-surface flex-1 bg-transparent border-none focus:outline-none"
                  />
                  <span className={`text-badge font-badge ${locationStatus === 'success' ? 'text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded' : 'text-secondary'}`}>
                    {locationStatus === 'success' ? 'GPS Verified' : 'Aadhaar Linked'}
                  </span>
                </div>
                {locationMsg && (
                  <div className={`text-xs flex items-center gap-1.5 ${
                    locationStatus === 'success'
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    <span>{locationMsg}</span>
                  </div>
                )}
              </div>

              {/* Handover Modes */}
              <div className="flex flex-col gap-space-8">
                <span className="font-label-bold text-label-bold text-on-surface">Handover Preferences</span>
                <div className="flex flex-col sm:flex-row gap-space-12">
                  <label className="flex-1 flex items-center gap-space-8 p-3 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container transition-colors border border-outline-variant/30">
                    <input
                      type="checkbox"
                      checked={selfPickup}
                      onChange={(e) => setSelfPickup(e.target.checked)}
                      className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                    />
                    <div>
                      <span className="font-label-bold text-body-sm text-on-surface block">Self-Pickup</span>
                      <span className="text-xs text-on-surface-variant">Renter picks up at your location</span>
                    </div>
                  </label>

                  <label className="flex-1 flex items-center gap-space-8 p-3 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container transition-colors border border-outline-variant/30">
                    <input
                      type="checkbox"
                      checked={doorstepDelivery}
                      onChange={(e) => setDoorstepDelivery(e.target.checked)}
                      className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                    />
                    <div>
                      <span className="font-label-bold text-body-sm text-on-surface block">Doorstep Drop-off (+₹50)</span>
                      <span className="text-xs text-on-surface-variant">Deliver locally within 5 km</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Step 6: Legal & Escrow Consent */}
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-20 shadow-sm border border-outline-variant/40 flex flex-col gap-space-12">
            <label className="flex items-center gap-space-12 cursor-pointer">
              <input
                type="checkbox"
                id="legal-consent"
                checked={legalConsent}
                onChange={(e) => setLegalConsent(e.target.checked)}
                className="w-5 h-5 rounded text-secondary accent-secondary cursor-pointer shrink-0"
              />
              <span className="text-body-sm font-label-bold text-on-surface">
                I confirm this item is in working order and accept the ShareKart community terms &amp; escrow policy.
              </span>
            </label>
          </section>

          {/* Action Bar */}
          <div className="bg-surface-container-lowest p-4 sm:p-space-20 rounded-xl shadow-md border border-outline-variant/50 flex flex-col sm:flex-row items-center justify-between gap-space-12 mb-space-32">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full sm:w-auto px-space-16 py-space-12 rounded-lg bg-surface-container-low text-on-surface font-label-bold text-label-bold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <div className="flex items-center gap-space-12 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="flex-1 sm:flex-none px-space-16 py-space-12 rounded-lg bg-surface-container text-on-surface font-label-bold text-label-bold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Preview Listing
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-space-8 px-space-24 py-space-12 rounded-lg bg-secondary text-on-secondary font-label-bold text-label-bold hover:bg-secondary-container hover:text-on-secondary-container shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isSubmitting ? 'sync' : 'rocket_launch'}
                </span>
                <span>{isSubmitting ? 'Publishing...' : 'Publish Listing'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Income Simulator & Host Safety Shield (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-20 lg:sticky lg:top-32">
          {/* Potential Earnings Card */}
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-20 shadow-sm border border-outline-variant/40 flex flex-col gap-space-16">
            <div className="flex items-center justify-between pb-space-8 border-b border-outline-variant/40">
              <div className="flex items-center gap-space-6">
                <span className="material-symbols-outlined text-[20px] text-secondary">trending_up</span>
                <span className="font-label-bold text-label-bold text-on-surface">Earnings Simulator</span>
              </div>
              <span className="text-badge font-badge bg-secondary-container text-on-secondary-container px-space-6 py-0.5 rounded">
                {pickupLocation || 'Neighborhood'} Hot Item
              </span>
            </div>

            <div className="bg-surface-container-low p-space-12 rounded-lg flex flex-col gap-1">
              <span className="text-body-sm font-body-sm text-on-surface-variant">Estimated Monthly Payout</span>
              <div className="flex items-baseline gap-space-4">
                <span className="font-price-lg text-price-lg text-secondary font-bold">
                  ₹{minMonthly.toLocaleString('en-IN')} - ₹{maxMonthly.toLocaleString('en-IN')}
                </span>
                <span className="text-badge font-badge text-on-surface-variant">/ month</span>
              </div>
              <span className="text-badge font-badge text-on-surface-variant">
                Assumes 12 to 16 rental days @ ₹{dailyRate}/day
              </span>
            </div>

            {/* Mini Visual Chart (Earnings Breakdown) */}
            <div className="flex flex-col gap-space-6">
              <div className="flex justify-between text-body-sm font-body-sm">
                <span className="text-on-surface">Your Take-home</span>
                <span className="font-label-bold text-on-surface">95% (₹{takeHomePerDay} / day)</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                <div className="bg-secondary h-full" style={{ width: '95%' }}></div>
                <div className="bg-primary h-full" style={{ width: '5%' }}></div>
              </div>
              <div className="flex justify-between text-badge font-badge text-on-surface-variant">
                <span>Direct to your UPI</span>
                <span>5% Sharekart platform fee</span>
              </div>
            </div>

            {/* ROI Indicator Card */}
            <div className="p-space-12 bg-surface-container-low rounded-lg flex items-center gap-space-12">
              <span className="material-symbols-outlined text-[28px] text-secondary shrink-0">savings</span>
              <div className="flex flex-col">
                <span className="font-label-bold text-label-bold text-on-surface">100% Asset Payback</span>
                <span className="text-body-sm font-body-sm text-on-surface-variant">
                  This item recovers its full ₹{(Number(salePrice) || 6400).toLocaleString('en-IN')} MRP after just {paybackDays} days of neighborhood rentals.
                </span>
              </div>
            </div>
          </div>

          {/* Trust Pillars Card */}
          <div className="bg-primary-container text-on-primary rounded-xl p-4 sm:p-space-20 shadow-md flex flex-col gap-space-16">
            <div className="flex items-center gap-space-8">
              <span className="material-symbols-outlined text-[24px] text-secondary-fixed">gshield</span>
              <h3 className="font-headline-sm text-headline-sm text-on-primary font-bold">Host Protection Shield</h3>
            </div>

            <div className="flex flex-col gap-space-16">
              <div className="flex items-start gap-space-12">
                <span className="material-symbols-outlined text-[20px] text-secondary-fixed shrink-0 mt-0.5">verified</span>
                <div className="flex flex-col">
                  <span className="font-label-bold text-label-bold text-on-primary">100% Aadhaar Verified Renters</span>
                  <p className="text-body-sm font-body-sm text-surface-container-high mt-0.5">
                    Every borrower verifies identity through UIDAI OTP e-sign before requesting an item.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-12">
                <span className="material-symbols-outlined text-[20px] text-secondary-fixed shrink-0 mt-0.5">account_balance_wallet</span>
                <div className="flex flex-col">
                  <span className="font-label-bold text-label-bold text-on-primary">
                    ₹{Number(securityDeposit || 1500).toLocaleString('en-IN')} Upfront Escrow Deposit
                  </span>
                  <p className="text-body-sm font-body-sm text-surface-container-high mt-0.5">
                    Stored in safe bank escrow. Any broken accessories or loss is automatically compensated.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-12">
                <span className="material-symbols-outlined text-[20px] text-secondary-fixed shrink-0 mt-0.5">bolt</span>
                <div className="flex flex-col">
                  <span className="font-label-bold text-label-bold text-on-primary">Instant UPI Payout</span>
                  <p className="text-body-sm font-body-sm text-surface-container-high mt-0.5">
                    Funds land in your PhonePe, Google Pay, or bank within 2 hours of pickup confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Listing Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/70 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-4 sm:p-space-24 shadow-2xl border border-outline-variant flex flex-col gap-space-16 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-space-12">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Listing Preview</span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {photos[0]?.url && (
              <img src={photos[0].url} alt="Cover preview" className="w-full h-48 object-cover rounded-xl" />
            )}

            <div>
              <span className="text-badge font-badge bg-secondary text-on-secondary px-2 py-0.5 rounded">
                {modeRent && modeSell ? 'Rent or Buy' : modeRent ? 'Rent Out' : 'Direct Buy'}
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold mt-2">{title}</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">Brand: {brand} • Category: {category}</p>
            </div>

            <div className="grid grid-cols-2 gap-space-12 bg-surface-container-low p-space-12 rounded-xl">
              {modeRent && (
                <div>
                  <span className="text-badge text-on-surface-variant block">Rental Rate</span>
                  <span className="font-price-md text-secondary font-bold">₹{dailyRate} / day</span>
                  <span className="text-badge text-on-surface-variant block">₹{securityDeposit} deposit</span>
                </div>
              )}
              {modeSell && (
                <div>
                  <span className="text-badge text-on-surface-variant block">Buy Price</span>
                  <span className="font-price-md text-primary font-bold">₹{salePrice}</span>
                  <span className="text-badge text-secondary block">Immediate settlement</span>
                </div>
              )}
            </div>

            <p className="text-body-sm text-on-surface-variant">Location: {pickupLocation}</p>

            {/* Bill & Included Accessories Preview */}
            <div className="flex flex-col gap-2.5 p-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
              <div className="flex items-center justify-between text-body-sm">
                <span className="font-label-bold text-on-surface">Invoice / Bill:</span>
                {hasInvoice ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary bg-secondary-container/30 px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[13px]">receipt_long</span>
                    Original GST Bill Included
                  </span>
                ) : (
                  <span className="text-[11px] text-outline italic">No Bill attached</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5 pt-1 border-t border-outline-variant/30">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="font-label-bold text-on-surface">
                    Included Accessories &amp; Extras:
                  </span>
                  <span className="text-badge text-on-surface-variant">
                    {customAccessories.length} {customAccessories.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                {customAccessories.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {customAccessories.map((acc, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-badge bg-surface-container-lowest px-2 py-1 rounded-md border border-outline-variant/50 text-on-surface"
                      >
                        <span className="material-symbols-outlined text-secondary text-[12px]">check</span>
                        {acc}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-body-sm text-outline italic">No extra accessories added</span>
                )}
              </div>
            </div>

            <div className="flex gap-space-12 pt-space-8 border-t border-outline-variant/40">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 py-space-12 rounded-lg border border-outline-variant font-label-bold text-on-surface hover:bg-surface-container cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handlePublish();
                }}
                className="flex-1 py-space-12 rounded-lg bg-secondary text-on-secondary font-label-bold hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm cursor-pointer"
              >
                Looks Good, Publish!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export { ListItemPage as SharekartListAnItemForRentOrSalePage };
export default ListItemPage;
