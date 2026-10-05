import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

export const ProductDetailsPage = ({ productId = 1, onNavigate, onOpenChat, onToast }) => {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'tips', 'handover'
  const [pricingMode, setPricingMode] = useState('rent'); // 'rent' or 'buy'
  const [startDate, setStartDate] = useState('2025-10-24');
  const [endDate, setEndDate] = useState('2025-10-27');
  const [calculatedCost, setCalculatedCost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (product) {
      calculateCost();
    }
  }, [product, startDate, endDate, pricingMode]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await api.getProductById(productId);
      if (res.success) {
        setProduct(res.product);
        setReviews(res.reviews || []);
        if (res.product.transaction_type === 'buy') {
          setPricingMode('buy');
        }
      }
    } catch (err) {
      console.error('Failed to load product details', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = async () => {
    try {
      const res = await api.calculateRentalCost({
        productId: product.id,
        startDate,
        endDate,
        orderType: pricingMode
      });
      if (res.success) {
        setCalculatedCost(res);
      }
    } catch (err) {
      console.error('Cost calculation failed', err);
    }
  };

  const handleProceedRent = () => {
    onNavigate('checkout', {
      productId: product.id,
      orderType: 'rent',
      startDate,
      endDate,
      totalDays: calculatedCost?.totalDays || 3
    });
  };

  const handleBuyNow = () => {
    onNavigate('checkout', {
      productId: product.id,
      orderType: 'buy'
    });
  };

  const handleAddToCart = () => {
    addToCart(product, pricingMode, calculatedCost?.totalDays || 3);
    onToast && onToast(`Added "${product.title}" to cart!`);
  };

  const scrollToPricing = () => {
    const el = document.getElementById('pricing-action-panel');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading || !product) {
    return (
      <div className="p-16 text-center text-on-surface-variant">
        Loading product details...
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-space-16 pb-16 lg:pb-0">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 sm:gap-space-8 py-1 sm:py-space-4 text-xs sm:text-body-sm font-body-sm text-on-surface-variant overflow-x-auto whitespace-nowrap">
        <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">home</span>
          <span>Home</span>
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('search', { category: product.category_id })} className="hover:text-primary transition-colors">
          {product.category_name}
        </button>
        <span>/</span>
        <span className="text-on-surface-variant">{product.subcategory || 'Gear'}</span>
        <span>/</span>
        <span className="font-label-bold text-label-bold text-on-surface truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-space-24 items-start">
        {/* LEFT COLUMN: Gallery, Assessment, Tabs, Reviews (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-space-20">
          {/* Main Photo Canvas with Thumbnails */}
          <div className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-3 sm:gap-space-12">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low flex items-center justify-center">
              <img 
                src={images[activePhotoIdx]} 
                alt={product.title} 
                className="w-full h-full object-cover transition-all duration-300" 
              />

              <div className="absolute top-2 sm:top-space-12 left-2 sm:left-space-12 flex items-center gap-1 bg-secondary text-on-secondary text-[10px] sm:text-badge font-badge px-2 sm:px-space-8 py-0.5 sm:py-space-4 rounded-full shadow-sm">
                <span className="material-symbols-outlined text-[12px] sm:text-[14px]">bolt</span>
                <span>{product.transaction_type === 'both' ? 'RENT OR BUY' : product.transaction_type.toUpperCase()}</span>
              </div>

              <div className="absolute bottom-2 sm:bottom-space-12 left-2 sm:left-space-12 bg-primary/85 backdrop-blur-md text-on-primary px-2 sm:px-space-8 py-0.5 sm:py-space-4 rounded flex items-center gap-1 sm:gap-space-6 text-[10px] sm:text-badge font-badge">
                <span className="material-symbols-outlined text-[12px] sm:text-[14px] text-secondary-fixed">verified</span>
                <span>Aadhaar Handover Safe</span>
              </div>

              <button 
                onClick={() => {
                  setWishlisted(!wishlisted);
                  onToast && onToast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist!');
                }}
                className="absolute top-2 sm:top-space-12 right-2 sm:right-space-12 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest text-on-surface shadow-md flex items-center justify-center hover:scale-105 transition-transform"
                title="Save to wishlist"
              >
                <span className={`material-symbols-outlined text-[18px] sm:text-[20px] ${wishlisted ? 'text-error material-symbols-fill' : 'text-on-surface-variant'}`}>
                  favorite
                </span>
              </button>
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-space-8">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`aspect-square rounded-lg overflow-hidden bg-surface-container-low transition-all border-2 ${
                      activePhotoIdx === idx ? 'border-primary ring-2 ring-primary/30 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Physical Inspection Pass Guarantee Banner */}
          <div className="bg-secondary-fixed/30 p-3 sm:p-space-12 rounded-xl flex items-center justify-between gap-3 sm:gap-space-12 border border-secondary-fixed shadow-xs">
            <div className="flex items-center gap-3 sm:gap-space-12">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">verified_user</span>
              </div>
              <div>
                <p className="font-label-bold text-xs sm:text-label-bold text-on-surface flex items-center gap-1">
                  <span>Physical Inspection Passed</span>
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-secondary">check_circle</span>
                </p>
                <p className="text-xs sm:text-body-sm text-on-surface-variant">
                  Inspected by Sharekart Field Partner · {product.serial_number} Verified
                </p>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end shrink-0">
              <span className="text-badge font-badge text-secondary bg-surface-container-lowest px-space-8 py-space-2 rounded-full shadow-xs">
                Score {product.inspection_score}/100
              </span>
              <span className="text-badge font-badge text-on-surface-variant mt-0.5">
                Tested {product.inspection_tested_date || '18 Mar 2025'}
              </span>
            </div>
          </div>

          {/* Condition Assessment Report */}
          <div className="bg-surface-container-lowest p-3.5 sm:p-space-20 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-3 sm:gap-space-16">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-sm sm:text-headline-sm text-on-surface font-bold">
                Condition Assessment Report
              </h2>
              <span className="bg-surface-container text-on-surface px-2.5 sm:px-space-12 py-0.5 sm:py-space-4 rounded-full font-label-bold text-xs sm:text-label-bold">
                {product.condition_score} · {product.condition_tag}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-space-12">
              <div className="bg-surface-container-low p-2.5 sm:p-space-12 rounded-lg flex flex-col gap-1 sm:gap-space-4">
                <span className="text-[10px] sm:text-badge font-badge text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">tune</span> Body
                </span>
                <span className="font-headline-sm text-xs sm:text-headline-sm text-on-surface font-bold">Flawless</span>
                <span className="text-[10px] sm:text-badge font-badge text-secondary">0 scratches</span>
              </div>
              <div className="bg-surface-container-low p-2.5 sm:p-space-12 rounded-lg flex flex-col gap-1 sm:gap-space-4">
                <span className="text-[10px] sm:text-badge font-badge text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">lens</span> Optics
                </span>
                <span className="font-headline-sm text-xs sm:text-headline-sm text-on-surface font-bold">100% OK</span>
                <span className="text-[10px] sm:text-badge font-badge text-secondary">Clean glass</span>
              </div>
              <div className="bg-surface-container-low p-2.5 sm:p-space-12 rounded-lg flex flex-col gap-1 sm:gap-space-4">
                <span className="text-[10px] sm:text-badge font-badge text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">battery_charging_full</span> Battery
                </span>
                <span className="font-headline-sm text-xs sm:text-headline-sm text-on-surface font-bold">95% Peak</span>
                <span className="text-[10px] sm:text-badge font-badge text-on-surface-variant">Full charge</span>
              </div>
              <div className="bg-surface-container-low p-2.5 sm:p-space-12 rounded-lg flex flex-col gap-1 sm:gap-space-4">
                <span className="text-[10px] sm:text-badge font-badge text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">speed</span> Ports
                </span>
                <span className="font-headline-sm text-xs sm:text-headline-sm text-on-surface font-bold">Verified</span>
                <span className="text-[10px] sm:text-badge font-badge text-secondary">All functional</span>
              </div>
            </div>

            {/* What's Inside Kit Box */}
            {Array.isArray(product.kit_items) && product.kit_items.length > 0 && (
              <div className="flex flex-col gap-2 sm:gap-space-8 pt-2 sm:pt-space-12 bg-surface-container-low/50 p-2.5 sm:p-space-12 rounded-lg">
                <h3 className="font-label-bold text-xs sm:text-label-bold text-on-surface">What's Inside the Kit Box:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-space-16 gap-y-1 sm:gap-y-space-6 text-xs sm:text-body-sm font-body-sm text-on-surface">
                  {product.kit_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[15px] sm:text-[16px]">check</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Specifications, Notes & Handover Tabs */}
          <div className="bg-surface-container-lowest p-3.5 sm:p-space-20 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-3 sm:gap-space-16">
            <div className="flex border-b border-outline-variant/50 gap-2 sm:gap-space-16 overflow-x-auto pb-1 text-xs sm:text-body-sm">
              <button 
                onClick={() => setActiveTab('specs')}
                className={`font-label-bold pb-2 border-b-2 transition-colors whitespace-nowrap px-1 ${
                  activeTab === 'specs' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Tech Specifications
              </button>
              <button 
                onClick={() => setActiveTab('tips')}
                className={`font-label-bold pb-2 border-b-2 transition-colors whitespace-nowrap px-1 ${
                  activeTab === 'tips' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Owner Notes
              </button>
              <button 
                onClick={() => setActiveTab('handover')}
                className={`font-label-bold pb-2 border-b-2 transition-colors whitespace-nowrap px-1 ${
                  activeTab === 'handover' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Pickup Points
              </button>
            </div>

            {activeTab === 'specs' && (
              <div className="flex flex-col gap-2 sm:gap-space-12 text-xs sm:text-body-sm font-body-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-space-12">
                  {Object.entries(product.specs || {}).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-on-surface-variant text-[10px] sm:text-badge font-badge uppercase">{key}</p>
                      <p className="text-on-surface font-label-bold">{val}</p>
                    </div>
                  ))}
                </div>
                <p className="text-on-surface-variant pt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="flex flex-col gap-2 sm:gap-space-8 text-xs sm:text-body-sm font-body-sm">
                <p className="font-label-bold text-on-surface">Note from {product.seller_name} (Owner):</p>
                <p className="text-on-surface-variant leading-relaxed">
                  "I keep all my equipment thoroughly sanitized, calibrated, and charged before any handover. Feel free to reach out via Sharekart chat if you need tips or accessories. Please return the items in the protective carry pouch provided."
                </p>
              </div>
            )}

            {activeTab === 'handover' && (
              <div className="flex flex-col gap-2 sm:gap-space-12 text-xs sm:text-body-sm font-body-sm">
                <p className="text-on-surface-variant">Available for in-person handoff and physical testing at:</p>
                <ul className="flex flex-col gap-2 text-on-surface">
                  {(product.pickup_locations || []).map((loc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
                      <span className="font-label-bold">{loc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Verified Renter Reviews */}
          <div className="bg-surface-container-lowest p-3.5 sm:p-space-20 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-3 sm:gap-space-16">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-headline-sm text-sm sm:text-headline-sm text-on-surface font-bold">Verified Renter Reviews</h2>
                <p className="text-xs sm:text-body-sm text-on-surface-variant">Gandhinagar & Ahmedabad rentals</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-space-6 bg-surface-container-low px-2 sm:px-space-12 py-1 sm:py-space-6 rounded-lg">
                <span className="material-symbols-outlined text-[16px] sm:text-[20px] text-amber-500 material-symbols-fill">star</span>
                <span className="font-price-md text-sm sm:text-price-md text-on-surface font-bold">4.9</span>
                <span className="text-xs sm:text-body-sm text-on-surface-variant">({reviews.length + 22})</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-space-16">
              {reviews.map(r => (
                <div key={r.id} className="bg-surface-container-low/40 p-2.5 sm:p-space-12 rounded-lg flex flex-col gap-1.5 sm:gap-space-8 border border-outline-variant/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={r.user_avatar} alt={r.user_name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-secondary-fixed" />
                      <div>
                        <p className="font-label-bold text-xs sm:text-label-bold text-on-surface flex items-center gap-1">
                          {r.user_name}
                          <span className="material-symbols-outlined text-secondary text-[13px]">verified</span>
                        </p>
                        <p className="text-[10px] sm:text-badge font-badge text-on-surface-variant">{r.rental_context}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(r.rating || 5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[14px] sm:text-[16px] material-symbols-fill">star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-body-sm font-body-sm text-on-surface">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Pricing & Action Panel (5 cols) */}
        <div id="pricing-action-panel" className="lg:col-span-5 flex flex-col gap-4 sm:gap-space-20 lg:sticky lg:top-36">
          <div className="bg-surface-container-lowest p-3.5 sm:p-space-20 rounded-xl border border-outline-variant/60 shadow-md flex flex-col gap-3 sm:gap-space-16">
            <div>
              <div className="flex items-center justify-between text-xs sm:text-body-sm text-on-surface-variant mb-1">
                <span className="flex items-center gap-1 text-secondary font-label-bold">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Available for Instant Pickup
                </span>
                <span className="text-[10px] sm:text-badge font-badge bg-surface-container px-2 py-0.5 rounded">ID #SK-{product.id}</span>
              </div>
              <h1 className="font-headline-lg text-lg sm:text-headline-lg text-on-surface font-bold leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-2 sm:gap-space-12 mt-1 sm:mt-space-8 text-xs sm:text-body-sm font-body-sm flex-wrap">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[14px] text-amber-500 material-symbols-fill">star</span>
                  <span className="font-label-bold">4.9</span>
                  <span className="text-on-surface-variant">(24)</span>
                </div>
                <span className="text-outline-variant">•</span>
                <span className="text-on-surface-variant">18 rentals</span>
                <span className="text-outline-variant">•</span>
                <span className="text-secondary font-label-bold">0 complaints</span>
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs sm:text-body-sm text-on-surface-variant bg-surface-container-low p-2 rounded-lg">
                <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
                <span className="font-label-bold text-on-surface">{product.location_name}</span>
                <span>· {product.distance_km} km</span>
                <span className="text-secondary font-label-bold ml-auto">Ready in 2 hrs</span>
              </div>
            </div>

            {/* Mode Switcher Buttons */}
            {product.transaction_type === 'both' && (
              <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1 rounded-lg">
                <button
                  onClick={() => setPricingMode('rent')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded font-label-bold text-xs sm:text-label-bold transition-all ${
                    pricingMode === 'rent'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">cached</span>
                  <span>Rent Item</span>
                </button>
                <button
                  onClick={() => setPricingMode('buy')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded font-label-bold text-xs sm:text-label-bold transition-all ${
                    pricingMode === 'buy'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                  <span>Buy Outright</span>
                </button>
              </div>
            )}

            {/* RENT PANEL */}
            {pricingMode === 'rent' && (
              <div className="flex flex-col gap-3 sm:gap-space-16 bg-surface-container-low/60 p-3 sm:p-space-16 rounded-xl border border-outline-variant/60">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-price-lg text-lg sm:text-price-lg text-on-surface font-bold">
                      ₹{product.rent_price_daily?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs sm:text-body-sm text-on-surface-variant"> / day</span>
                  </div>
                  <span className="text-[10px] sm:text-badge font-badge text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded">
                    Weekly: ₹{(product.rent_price_daily * 6)?.toLocaleString('en-IN')} (Save 15%)
                  </span>
                </div>

                {/* Rental Duration Date Picker */}
                <div className="flex flex-col gap-2 bg-surface-container-lowest p-2.5 sm:p-space-12 rounded-lg border border-outline-variant/50">
                  <div className="flex items-center justify-between text-xs sm:text-body-sm">
                    <span className="text-on-surface-variant font-label-bold">Rental Duration:</span>
                    <span className="font-label-bold text-secondary">
                      {calculatedCost?.totalDays || 3} Days (Selected)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-space-8">
                    <div className="flex flex-col">
                      <label className="text-[10px] sm:text-badge font-badge text-on-surface-variant">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-surface-container-low text-xs sm:text-body-sm p-1.5 sm:p-space-6 rounded border border-outline-variant/60 focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] sm:text-badge font-badge text-on-surface-variant">Return Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-surface-container-low text-xs sm:text-body-sm p-1.5 sm:p-space-6 rounded border border-outline-variant/60 focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="flex flex-col gap-1.5 sm:gap-space-6 text-xs sm:text-body-sm font-body-sm pt-1">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Rental Fee ({calculatedCost?.totalDays || 3} days × ₹{product.rent_price_daily})</span>
                    <span className="text-on-surface font-label-bold">
                      ₹{calculatedCost?.rentFee?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      Refundable Deposit
                      <span className="material-symbols-outlined text-[13px] text-outline" title="Returned upon handover verification">info</span>
                    </span>
                    <span className="text-on-surface font-label-bold">
                      ₹{product.security_deposit?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Razorpay Escrow & SafeCover</span>
                    <span className="text-secondary font-label-bold">FREE</span>
                  </div>
                  <div className="h-[1px] bg-outline-variant/40 my-1"></div>
                  <div className="flex justify-between text-sm sm:text-body-lg font-body-lg">
                    <span className="font-label-bold text-on-surface">Total Payable Now</span>
                    <span className="font-price-md text-base sm:text-price-md text-on-surface font-bold">
                      ₹{(calculatedCost?.rentFee + (product.security_deposit || 0) + 117)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-badge font-badge text-on-surface-variant">
                    *(Includes ₹{product.security_deposit?.toLocaleString('en-IN')} deposit refunded instantly to your UPI)
                  </p>
                </div>

                <div className="flex flex-row gap-2">
                  <button
                    onClick={handleProceedRent}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-on-secondary py-2.5 sm:py-space-12 px-3 rounded-lg font-label-bold text-xs sm:text-label-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Proceed to Rent</span>
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="bg-surface-container-lowest hover:bg-surface-container text-on-surface px-3 py-2.5 rounded-lg font-label-bold flex items-center justify-center shadow-sm border border-outline-variant/60"
                    title="Add to Cart"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            )}

            {/* BUY PANEL */}
            {pricingMode === 'buy' && (
              <div className="flex flex-col gap-3 sm:gap-space-16 bg-surface-container-low/60 p-3 sm:p-space-16 rounded-xl border border-outline-variant/60">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-price-lg text-lg sm:text-price-lg text-on-surface font-bold">
                    ₹{product.sale_price?.toLocaleString('en-IN')}
                  </span>
                  {product.original_mrp > 0 && (
                    <span className="text-xs text-on-surface-variant line-through">
                      MRP ₹{product.original_mrp?.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-[10px] font-badge bg-error-container text-on-error-container px-1.5 py-0.5 rounded font-bold">
                    VERIFIED DEAL
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-2.5 rounded-lg flex flex-col gap-1 text-xs text-on-surface-variant border border-outline-variant/50">
                  <div className="flex items-center gap-1 text-secondary font-label-bold">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Includes 7-Day Buyer Protection</span>
                  </div>
                  <p>Escrow payment hold until you test item works.</p>
                </div>

                <div className="flex flex-row gap-2">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-primary hover:bg-inverse-surface text-on-primary py-2.5 px-3 rounded-lg font-label-bold text-xs sm:text-label-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span>Buy Now · ₹{product.sale_price?.toLocaleString('en-IN')}</span>
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="bg-surface-container-lowest hover:bg-surface-container text-on-surface px-3 py-2.5 rounded-lg font-label-bold flex items-center justify-center shadow-sm border border-outline-variant/60"
                    title="Add to Cart"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            )}

            {/* Escrow Pillars */}
            <div className="flex items-center justify-between text-[10px] sm:text-badge font-badge text-on-surface-variant pt-2 border-t border-outline-variant/50">
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px] text-secondary">lock</span>
                Razorpay Escrow
              </span>
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px] text-secondary">handshake</span>
                Physical Check
              </span>
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px] text-secondary">replay</span>
                Instant Refund
              </span>
            </div>
          </div>

          {/* Seller Profile Card */}
          <div className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-2.5 sm:gap-space-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-space-12">
                <div className="relative">
                  <img
                    src={product.seller_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={product.seller_name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-secondary-fixed"
                  />
                  <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-[13px] sm:text-[16px] bg-secondary text-on-secondary rounded-full p-0.5">
                    verified
                  </span>
                </div>
                <div>
                  <p className="font-headline-sm text-xs sm:text-headline-sm text-on-surface font-bold">{product.seller_name}</p>
                  <p className="text-[10px] sm:text-badge font-badge text-secondary flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">id_card</span>
                    Aadhaar Verified Citizen
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end text-[10px] sm:text-badge">
                <span className="text-on-surface-variant">Member since</span>
                <span className="font-label-bold text-on-surface">{product.seller_member_since || 'Aug 2023'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2 rounded-lg text-xs">
              <div>
                <span className="text-[10px] text-on-surface-variant block">Completed</span>
                <span className="font-label-bold text-on-surface">{product.seller_reviews_count || 42} Rentals</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant block">Response Time</span>
                <span className="font-label-bold text-secondary">&lt; 15 mins</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenChat}
                className="flex items-center justify-center gap-1.5 bg-primary text-on-primary py-2 px-2.5 rounded font-label-bold text-xs hover:bg-inverse-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>Chat</span>
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center justify-center gap-1.5 bg-secondary-container text-on-secondary-container py-2 px-2.5 rounded font-label-bold text-xs hover:bg-secondary hover:text-on-secondary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>Trust Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY ACTION BAR (Visible on Mobile/Tablet only) */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/60 px-3 py-2 shadow-lg flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="font-price-md text-base font-bold text-on-surface">
              ₹{(pricingMode === 'rent' ? product.rent_price_daily : product.sale_price)?.toLocaleString('en-IN')}
            </span>
            {pricingMode === 'rent' && <span className="text-xs text-on-surface-variant">/ day</span>}
          </div>
          {pricingMode === 'rent' && (
            <span className="text-[10px] text-secondary font-bold">
              Deposit: ₹{product.security_deposit?.toLocaleString('en-IN')} (Refundable)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={scrollToPricing}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-2.5 py-2 rounded-lg text-xs font-label-bold"
          >
            Config
          </button>
          <button
            onClick={pricingMode === 'rent' ? handleProceedRent : handleBuyNow}
            className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-xs font-label-bold flex items-center gap-1 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>{pricingMode === 'rent' ? 'Rent Now' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
