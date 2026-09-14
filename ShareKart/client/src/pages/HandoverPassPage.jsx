import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const HandoverPassPage = ({ params = {}, onNavigate, onToast }) => {
  const { user } = useAuth();

  // Booking & PIN details
  const bookingId = params.bookingId || params.id || '#SK-89241';
  const handoverPin = params.escrow_pin || '6842';
  const itemTitle = params.title || params.product_title || 'Sony Alpha A6400 Mirrorless Camera';
  const itemPrice = params.total_amount ? `₹${params.total_amount}` : '₹2,397';
  const dailyRate = params.daily_rate ? `₹${params.daily_rate}` : '₹799';
  const escrowDeposit = params.deposit_fee ? `₹${params.deposit_fee}` : '₹3,500';

  // 5-Point Checklist state
  const [checklist, setChecklist] = useState({
    sensor: false,
    battery: false,
    shutter: false,
    card: false,
    case: false
  });

  // Handover inspection photos state
  const [inspectionPhotos, setInspectionPhotos] = useState([
    {
      id: 1,
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfXiY_ndlmFkkGRmwQumitR9h0Piefxwqb8lKRQvvoK5z4V9Ld60We5leskfHvAPrTuYpfogk_c_VqXJLADLqdJaCfzLgnaxQBCk_0vD960bq07OoUlO2lj0GNX42H5WJtRLLbIg_QXmxSRIidFqHFO8rUq__PGlQ8Zo1O8cCfrfWeyH9E-l73_iPzg9V5Oi1NW1MrE8IW7N80w3fr3yDH6G9xp2BOgQDEfNGcP-umhLxNuGr5WNBZpQ',
      timestamp: '10:15 AM'
    }
  ]);

  const [copiedPin, setCopiedPin] = useState(false);

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  const toggleCheck = (key) => {
    setChecklist((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      const newCount = Object.values(updated).filter(Boolean).length;
      if (newCount === 5) {
        onToast && onToast('All 5 inspection checks completed! You are ready for PIN handover.');
      }
      return updated;
    });
  };

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(handoverPin);
    setCopiedPin(true);
    onToast && onToast(`Handover PIN ${handoverPin} copied to clipboard!`);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleAddPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newPhoto = {
      id: Date.now(),
      url: URL.createObjectURL(file),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setInspectionPhotos((prev) => [...prev, newPhoto]);
    onToast && onToast('Inspection photo attached to escrow log!');
  };

  return (
    <div className="w-full flex flex-col pb-space-32">
      {/* Top Success Banner */}
      <div className="w-full bg-secondary text-on-secondary rounded-xl p-4 sm:p-space-24 shadow-md mb-space-24 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-16 relative z-10">
          <div className="flex items-start gap-space-12">
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-space-8 flex-wrap">
                <h1 className="font-headline-md text-headline-md font-bold text-on-secondary">
                  Rental Booking Confirmed!
                </h1>
                <span className="bg-secondary-container text-on-secondary-container font-badge text-badge px-space-8 py-0.5 rounded-full uppercase tracking-wider">
                  Escrow Protected
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-secondary/90 mt-space-2">
                Booking ID: <span className="font-label-bold text-label-bold font-mono">{bookingId}</span> • Placed on 24 Oct, 10:14 AM IST
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-8 bg-black/20 rounded-lg px-space-12 py-space-8 shrink-0">
            <span className="material-symbols-outlined text-secondary-fixed text-[20px]">chat</span>
            <div className="text-left">
              <p className="font-badge text-badge text-on-secondary uppercase tracking-wider font-semibold">
                Instant Notification
              </p>
              <p className="font-body-sm text-body-sm text-secondary-fixed font-medium">
                Sent to SMS & WhatsApp (+91 98••• ••210)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Columns Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24">
        {/* Left Column: The Handover Pass & Logistics (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-24">
          {/* Digital Handover Pass Card */}
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-24 shadow-md border border-outline-variant/40 flex flex-col relative">
            <div className="flex items-center justify-between pb-space-16 bg-surface-container-low -mx-4 -mt-4 px-4 sm:-mx-space-24 sm:-mt-space-24 sm:px-space-24 pt-space-16 rounded-t-xl mb-space-16 border-b border-outline-variant/30">
              <div className="flex items-center gap-space-8">
                <span className="material-symbols-outlined text-primary text-[24px]">vpn_key</span>
                <div>
                  <p className="font-label-bold text-label-bold uppercase tracking-wider text-on-surface">
                    Digital Pickup Pass
                  </p>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Present at Sector 7 handover point
                  </p>
                </div>
              </div>
              <span className="bg-secondary/10 text-secondary px-space-8 py-space-2 rounded font-badge text-badge flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span> Live & Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-20 items-center">
              {/* QR Area */}
              <div className="flex flex-col items-center justify-center p-space-16 bg-surface-container-low rounded-xl border border-outline-variant/40">
                {/* Simulated High-Contrast Escrow QR Code */}
                <div className="w-44 h-44 bg-surface-container-lowest p-space-8 rounded-lg shadow-sm flex items-center justify-center">
                  <svg className="w-full h-full text-primary" fill="currentColor" viewBox="0 0 160 160">
                    <rect x="10" y="10" width="40" height="40" rx="4" fill="#131b2e"></rect>
                    <rect x="16" y="16" width="28" height="28" fill="#ffffff"></rect>
                    <rect x="22" y="22" width="16" height="16" fill="#131b2e"></rect>
                    <rect x="110" y="10" width="40" height="40" rx="4" fill="#131b2e"></rect>
                    <rect x="116" y="16" width="28" height="28" fill="#ffffff"></rect>
                    <rect x="122" y="22" width="16" height="16" fill="#131b2e"></rect>
                    <rect x="10" y="110" width="40" height="40" rx="4" fill="#131b2e"></rect>
                    <rect x="16" y="116" width="28" height="28" fill="#ffffff"></rect>
                    <rect x="22" y="122" width="16" height="16" fill="#131b2e"></rect>
                    <rect x="60" y="15" width="10" height="10"></rect>
                    <rect x="80" y="15" width="15" height="10"></rect>
                    <rect x="60" y="35" width="12" height="12"></rect>
                    <rect x="80" y="35" width="20" height="10"></rect>
                    <rect x="15" y="65" width="30" height="10"></rect>
                    <rect x="15" y="85" width="12" height="15"></rect>
                    <rect x="35" y="85" width="15" height="10"></rect>
                    <rect x="60" y="60" width="40" height="40" rx="2" fill="#006c4a"></rect>
                    <circle cx="80" cy="80" r="12" fill="#ffffff"></circle>
                    <rect x="76" y="74" width="8" height="12" rx="1" fill="#006c4a"></rect>
                    <rect x="110" y="65" width="15" height="12"></rect>
                    <rect x="135" y="65" width="15" height="10"></rect>
                    <rect x="110" y="85" width="25" height="12"></rect>
                    <rect x="140" y="85" width="10" height="12"></rect>
                    <rect x="65" y="115" width="25" height="10"></rect>
                    <rect x="100" y="115" width="15" height="20"></rect>
                    <rect x="65" y="135" width="15" height="15"></rect>
                    <rect x="125" y="120" width="25" height="12"></rect>
                    <rect x="125" y="140" width="20" height="10"></rect>
                  </svg>
                </div>
                <p className="font-badge text-badge text-on-surface-variant mt-space-8 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
                  Encrypted Handover Token
                </p>
              </div>

              {/* Pickup OTP and Guidance */}
              <div className="flex flex-col justify-between h-full gap-space-16">
                <div>
                  <span className="font-badge text-badge uppercase text-on-surface-variant tracking-wider">
                    Physical Handover PIN
                  </span>
                  <div className="mt-space-4 p-space-12 bg-primary-container text-on-primary rounded-lg text-center shadow-inner">
                    <span className="text-[36px] font-mono font-bold tracking-[0.4em] leading-none block text-secondary-fixed">
                      {handoverPin}
                    </span>
                    <span className="font-badge text-badge text-on-primary-container mt-1 block uppercase tracking-widest">
                      Single-use OTP
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-high/60 p-space-12 rounded-lg border border-outline-variant/40">
                  <div className="flex items-start gap-space-8">
                    <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">warning</span>
                    <p className="font-body-sm text-body-sm text-on-surface font-medium leading-tight">
                      Do <span className="underline font-bold">NOT</span> disclose this PIN or scan QR until you have physically inspected and powered on the camera kit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-space-16 pt-space-12 flex items-center justify-between bg-surface-container-low px-space-12 py-space-8 rounded-lg border border-outline-variant/30">
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">timer</span> Pass valid for:{' '}
                <strong className="text-on-surface ml-1">48 hours</strong>
              </span>
              <button
                onClick={handleCopyPin}
                className="font-label-bold text-label-bold text-secondary hover:text-on-secondary-container flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedPin ? 'check' : 'content_copy'}
                </span>
                {copiedPin ? 'PIN Copied!' : 'Copy PIN'}
              </button>
            </div>
          </div>

          {/* Item Summary Card */}
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-20 shadow-md border border-outline-variant/40">
            <div className="flex flex-col sm:flex-row gap-space-16">
              <div className="w-full sm:w-36 h-36 rounded-lg overflow-hidden shrink-0 relative bg-surface-container">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxXhFE21KxUD5yxrm5mcn7OX4dDzfCZB-ZEkOe4wEhLTd2WhbJBwLjau-lJt4H96LFfvDxCI_AM0k0GJ5EzN0hSglK0IYFNI_n-R7QsZ76sSBDIc6U3Z6xQYe00gGNs4JWk1wsTOP42XmlhG5kOUAQBdqkyvvQxCoY-ufdxCQIUVjLfORL1VQWOQO8dw31t36Ua1yBRfwKC3GpAp3k6Z8y23ITWgOW8F5solPeEwf21gfIswfByb6XMQ"
                  alt={itemTitle}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-secondary text-on-secondary font-badge text-badge px-space-6 py-0.5 rounded">
                  Rental
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-space-8">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        {itemTitle}
                      </h2>
                      <p className="text-body-sm font-body-sm text-on-surface-variant">
                        Includes 16-50mm OSS Lens + 2x NP-FW50 Batteries + 64GB Extreme Pro Card
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-price-md text-price-md text-primary font-bold block">
                        {itemPrice}
                      </span>
                      <span className="font-badge text-badge text-on-surface-variant">
                        ({dailyRate} / day)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-space-8 mt-space-12 p-space-8 bg-surface-container-low rounded-lg border border-outline-variant/30">
                    <div>
                      <span className="font-badge text-badge text-on-surface-variant block uppercase">
                        Pickup Date
                      </span>
                      <span className="font-label-bold text-label-bold text-on-surface">
                        Fri, 24 Oct • 11:00 AM
                      </span>
                    </div>
                    <div>
                      <span className="font-badge text-badge text-on-surface-variant block uppercase">
                        Return Date
                      </span>
                      <span className="font-label-bold text-label-bold text-on-surface">
                        Mon, 27 Oct • 11:00 AM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Meta */}
                <div className="mt-space-12 flex flex-col sm:flex-row sm:items-center justify-between gap-space-8 pt-space-8 border-t border-outline-variant/30">
                  <div className="flex items-center gap-space-6 text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[20px]">near_me</span>
                    <span className="font-body-sm text-body-sm font-medium">
                      Sector 7, Gandhinagar{' '}
                      <span className="text-on-surface-variant font-normal">(1.8 km away)</span>
                    </span>
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-primary text-on-primary font-label-bold text-label-bold px-space-12 py-space-6 rounded flex items-center justify-center gap-1 hover:bg-inverse-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">directions</span> Open in Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Lender Profile Card */}
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-20 shadow-md border border-outline-variant/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-16">
              <div className="flex items-center gap-space-12">
                <div className="relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3plny0QPdmXD33nvkSuvEKLm45bFU0MTOlGO1Ro2nF0kI93ld5MtY28JsFc3zls0T4bSRqOCTTORwaGpP9UhsUOgmn99r5O_HXmd6paI1GdPk23Ba_Sqn7cZeZswboh_y1ZDFZvqFHM5148Pl9vXPp48bxMM4qbY0kQxLwX5A3ogTT1kqnY_dMTLE062P0HEngFx5gTT3YQNMbLS37BGWPjiyrOxJs9VVsvxfKWD1QXhKALT_mwn5nQ"
                    alt="Aarav Patel"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-secondary"
                  />
                  <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-[16px] bg-secondary text-on-secondary rounded-full p-0.5">
                    verified
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-space-6">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Aarav Patel
                    </h3>
                    <span className="bg-secondary/15 text-secondary px-space-6 py-0.5 rounded font-badge text-badge flex items-center gap-0.5 font-bold">
                      <span className="material-symbols-outlined text-[13px]">shield</span> Aadhaar Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-space-8 text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    <span className="flex items-center text-on-tertiary-container font-label-bold">
                      <span className="material-symbols-outlined text-[16px]">star</span> 4.9
                    </span>
                    <span>•</span>
                    <span>38 successful rentals</span>
                    <span>•</span>
                    <span className="text-secondary font-medium">Super Lender</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-space-8 w-full sm:w-auto">
                <a
                  href="tel:+919876543210"
                  className="flex-1 sm:flex-none bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-space-12 py-space-8 rounded font-label-bold text-label-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span> Call
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container px-space-16 py-space-8 rounded font-label-bold text-label-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Escrow Security Deposit Box */}
          <div className="bg-surface-container-low rounded-xl p-4 sm:p-space-20 shadow-sm border border-outline-variant/40 relative overflow-hidden">
            <div className="flex items-start gap-space-12">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">account_balance</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider">
                    Razorpay RBI Escrow Protection
                  </h4>
                  <span className="font-price-md text-price-md text-secondary font-bold">
                    {escrowDeposit} Locked
                  </span>
                </div>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-space-4">
                  Your refundable security deposit is held safely under RBI-compliant trustee escrow. Funds are never directly paid to the lender beforehand.
                </p>
                <div className="mt-space-12 flex items-center gap-space-8 bg-surface-container-lowest p-space-8 rounded border border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary text-[18px]">cached</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Auto-refunded back to your GPay UPI (<strong className="font-medium">ar***@okhdfcbank</strong>) within 2 hours of return inspection.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pre-Handover Checklist & Steps (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-24">
          {/* 5-Point Mandatory Inspection Card */}
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-20 shadow-md border border-outline-variant/40">
            <div className="flex items-center justify-between mb-space-16">
              <div className="flex items-center gap-space-8">
                <span className="material-symbols-outlined text-secondary text-[22px]">checklist_rtl</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Physical Inspection Check
                </h3>
              </div>
              <span
                className={`text-badge font-badge px-space-6 py-0.5 rounded font-bold ${
                  checkedCount === 5
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {checkedCount} / 5 Steps
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-16">
              Tick off all items during in-person pickup before providing the OTP. These protect your deposit from pre-existing damages.
            </p>

            {/* Checklist items */}
            <div className="flex flex-col gap-space-12">
              {[
                {
                  key: 'sensor',
                  title: '1. Sensor & Lens Glass Scratch Check',
                  desc: 'Check rear & front lens elements under ambient daylight.'
                },
                {
                  key: 'battery',
                  title: '2. Battery & Charger Functional Test',
                  desc: 'Power on camera with both NP-FW50 batteries; verify 80%+ charge.'
                },
                {
                  key: 'shutter',
                  title: '3. Shutter Actuation & LCD Articulation',
                  desc: 'Take 2 test sample frames; tilt and flip flip-out screen.'
                },
                {
                  key: 'card',
                  title: '4. SanDisk 64GB Card Included & Formatted',
                  desc: 'Confirm card read/write icon on viewfinder without card error.'
                },
                {
                  key: 'case',
                  title: '5. Carry Case, Strap & Lens Cap Condition',
                  desc: 'Inspect zipper, shoulder strap seams, and original Sony cap.'
                }
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start gap-space-12 p-space-8 rounded transition-colors cursor-pointer select-none border ${
                    checklist[item.key]
                      ? 'bg-secondary/5 border-secondary/40'
                      : 'bg-transparent border-transparent hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => toggleCheck(item.key)}
                    className="mt-1 w-4 h-4 rounded text-secondary focus:ring-0 cursor-pointer accent-secondary"
                  />
                  <div className="flex-1">
                    <span className="font-label-bold text-label-bold text-on-surface block">
                      {item.title}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {item.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {/* Escrow Photo Uploader */}
            <div className="mt-space-16 pt-space-16 bg-surface-container-low rounded-lg p-space-12 border border-outline-variant/30">
              <div className="flex items-center justify-between mb-space-8">
                <div className="flex items-center gap-space-6">
                  <span className="material-symbols-outlined text-primary text-[18px]">add_a_photo</span>
                  <span className="font-label-bold text-label-bold text-on-surface">
                    Upload Handover Photos
                  </span>
                </div>
                <span className="font-badge text-badge text-on-surface-variant">
                  {inspectionPhotos.length} / 3 photos
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-12">
                Take 3 quick photos of the serial number and body condition to attach to this escrow session.
              </p>

              <div className="grid grid-cols-3 gap-space-8">
                <label className="h-20 bg-surface-container-lowest rounded-lg flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all cursor-pointer border border-dashed border-outline-variant">
                  <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                  <span className="font-badge text-badge">+ Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddPhoto}
                    className="hidden"
                  />
                </label>

                {inspectionPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="h-20 bg-surface-container-high rounded-lg flex items-center justify-center overflow-hidden relative border border-outline-variant/40"
                  >
                    <img src={photo.url} alt="Inspection" className="w-full h-full object-cover" />
                    <span className="material-symbols-outlined absolute top-1 right-1 text-on-primary bg-primary/70 rounded-full text-[14px] p-0.5">
                      check
                    </span>
                  </div>
                ))}

                {inspectionPhotos.length < 2 && (
                  <div className="h-20 bg-surface-container rounded-lg flex flex-col items-center justify-center text-on-surface-variant/50 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                    <span className="font-badge text-badge">Slot 2</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Handover Process Flow */}
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-20 shadow-md border border-outline-variant/40">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-16 flex items-center gap-space-8">
              <span className="material-symbols-outlined text-primary text-[20px]">swap_horizontal_circle</span>{' '}
              Handover Steps
            </h3>
            <div className="flex flex-col gap-space-16 relative">
              <div className="flex items-start gap-space-12">
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-badge text-badge flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Meet Lender Aarav</p>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Arrive at Sector 7 landmark. Share your live arrival via WhatsApp chat.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-12">
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-badge text-badge flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Inspect & Photograph</p>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Turn on camera, check shutter and upload 3 photos to record condition.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-12">
                <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary font-badge text-badge flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Disclose 4-digit PIN</p>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Tell Aarav the code <strong className="font-mono text-secondary">{handoverPin}</strong>. Lender enters this in their app to unlock escrow.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-12">
                <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant font-badge text-badge flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Item Handed Over & Rental Active</p>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Your 3-day countdown begins. Free cancellation ends immediately upon OTP entry.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dispute / Help Box */}
          <div className="bg-surface-container-low rounded-xl p-space-16 shadow-sm border border-outline-variant/40 flex items-center justify-between gap-space-12">
            <div className="flex items-center gap-space-12">
              <span className="material-symbols-outlined text-primary text-[28px]">support_agent</span>
              <div>
                <p className="font-label-bold text-label-bold text-on-surface">Neighborhood Trust Hotline</p>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Toll-free 24x7 Escrow mediation</p>
              </div>
            </div>
            <a
              href="tel:1800742735"
              className="bg-surface-container-highest hover:bg-surface-dim text-on-surface px-space-12 py-space-6 rounded font-label-bold text-label-bold transition-colors"
            >
              1800-SHAREKART
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Actions Bar */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-4 sm:p-space-20 shadow-md mt-space-24 flex flex-col md:flex-row items-center justify-between gap-space-16 border border-outline-variant/40">
        <div className="flex items-center gap-space-12 w-full md:w-auto">
          <button
            onClick={() => onNavigate('orders')}
            className="w-full md:w-auto bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-bold text-label-bold px-space-20 py-space-12 rounded flex items-center justify-center gap-space-8 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Return to Dashboard
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className="w-full md:w-auto bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-bold text-label-bold px-space-20 py-space-12 rounded flex items-center justify-center gap-space-8 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">forum</span> Message Lender
          </button>
        </div>

        <div className="flex items-center gap-space-12 w-full md:w-auto justify-end">
          <button
            onClick={() => window.print()}
            className="w-full md:w-auto bg-primary hover:bg-inverse-surface text-on-primary font-label-bold text-label-bold px-space-24 py-space-12 rounded flex items-center justify-center gap-space-8 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">description</span> Download Tax Invoice & Contract (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};
export { HandoverPassPage as SharekartRentalHandoverConfirmationPassPage };
export default HandoverPassPage;
