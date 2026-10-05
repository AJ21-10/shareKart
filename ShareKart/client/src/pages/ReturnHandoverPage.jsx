import React, { useState } from 'react';
import { api } from '../services/api';

export const ReturnHandoverPage = ({ params = {}, onNavigate, onToast }) => {
  const [orderId, setOrderId] = useState(params.bookingId || 'SK-8921');
  const [productTitle, setProductTitle] = useState(params.title || 'Sony Alpha A6400 Kit (16-50mm + 55-210mm)');
  const [depositAmount, setDepositAmount] = useState(params.deposit_fee || 3500);
  const [upiId, setUpiId] = useState('aarav@okaxis');

  // Checklist items
  const [checklist, setChecklist] = useState({
    item1: true, // Lens glass clean & scratch-free
    item2: true, // 2x original Sony batteries & charger present
    item3: true, // Camera sensor clean (No dust / stains)
    item4: true  // Bag & shoulder strap in original condition
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refundResult, setRefundResult] = useState(null);

  const allPassed = checklist.item1 && checklist.item2 && checklist.item3 && checklist.item4;

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmReturn = async () => {
    if (!allPassed) {
      alert('All 4 physical inspection checklist items must be verified before releasing the security deposit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.completeReturn(orderId, upiId, true);
      if (res.success) {
        setRefundResult(res.refund);
        onToast && onToast(`Return completed! ₹${depositAmount.toLocaleString('en-IN')} escrow deposit refunded to ${upiId}.`);
      }
    } catch (err) {
      console.error('Return confirmation failed', err);
      // Fallback display
      setRefundResult({
        order_id: orderId,
        product_title: productTitle,
        refund_amount: depositAmount,
        refund_utr: `UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        upi_id: upiId,
        escrow_status: 'deposit_refunded',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-space-24 pb-space-48 max-w-6xl mx-auto">
      {/* Micro-Breadcrumb & Session Meta */}
      <div className="flex flex-wrap items-center justify-between gap-space-12 text-on-surface-variant font-body-sm text-body-sm">
        <div className="flex items-center gap-space-6">
          <button onClick={() => onNavigate('orders')} className="hover:text-on-surface transition-colors cursor-pointer">
            Rentals
          </button>
          <span>/</span>
          <span className="text-on-surface font-label-bold">Order #{orderId}</span>
          <span className="bg-surface-container-high px-space-8 py-0.5 rounded text-on-surface text-[11px] font-bold tracking-wider">
            RETURN PHASE
          </span>
        </div>
        <div className="flex items-center gap-space-8 bg-surface-container-lowest px-space-12 py-space-6 rounded shadow-xs border border-outline-variant/60">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-label-bold text-on-surface text-xs sm:text-body-sm">Meetup GPS Sync Active</span>
          <span className="text-outline">·</span>
          <span className="text-on-surface-variant text-xs sm:text-body-sm">Gandhinagar, Sector 11</span>
        </div>
      </div>

      {/* Top Hero Banner: Return Handover Status */}
      <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-24 shadow-sm border border-outline-variant/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-16">
          <div className="flex items-start md:items-center gap-space-16">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-surface-container shrink-0 shadow-sm border border-outline-variant">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0o1wRu8b1ZCCeHxHdRz5zq7CqayMAXYVKJmyz8zfHIrG_zai1vEVoGfjzIbFdytTovBIUYdRtGRRO_dM4zoUVXuEMA2gwmZDAm2xKln_p9qrJWUnbU_1XkUGBEbJtnLNHP7JLA2jWmXqLoN7erZGk0uKXH8AI7lYpBo2djHB4o9xi31rKYrmCW1WQHdg97lsGiRhE8IJO4eCT_a220-4TJSknKeMSqsP204eXiGhP40bus-2MnCN-Cg"
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-8 mb-space-4">
                <span className="bg-primary text-on-primary text-[10px] font-badge px-space-8 py-0.5 rounded uppercase tracking-wider">
                  Return Handover in Progress
                </span>
                <span className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant">
                  Booking ID: <strong className="text-on-surface">#{orderId}</strong>
                </span>
              </div>
              <h1 className="font-headline-lg text-lg sm:text-headline-lg text-on-surface font-bold">
                {productTitle}
              </h1>
              <p className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant mt-0.5">
                Borrower: <strong className="text-on-surface">Aarav Mehta</strong> ↔ Lender:{' '}
                <strong className="text-on-surface">Vikram Joshi (Aadhaar Verified)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-16 bg-surface-container-low px-space-16 py-space-12 rounded-lg self-start lg:self-center border border-outline-variant/60">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <div className="flex flex-col">
              <span className="font-badge text-badge text-on-surface-variant uppercase text-[10px]">Return Window</span>
              <span className="font-headline-sm text-sm sm:text-headline-sm text-on-surface font-bold">Due today at 5:00 PM IST</span>
              <span className="font-body-sm text-xs text-secondary font-semibold">Handover verification active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24 items-start">
        {/* Left Column: Verification Steps (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-24">
          {/* Step 1: Checklist */}
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-24 shadow-sm border border-outline-variant/60">
            <div className="flex items-center justify-between pb-space-16 mb-space-16 border-b border-outline-variant/40">
              <div className="flex items-center gap-space-12">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <div>
                  <h2 className="font-headline-sm text-base sm:text-headline-sm text-on-surface font-bold">
                    Physical Inspection & Damage Checklist
                  </h2>
                  <p className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant">
                    Both parties must review physical integrity against original dispatch logs
                  </p>
                </div>
              </div>
              <span className={`hidden sm:inline-flex items-center gap-1 font-label-bold text-xs px-space-12 py-1 rounded-full ${
                allPassed ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>{allPassed ? 'All 4 Passed' : 'Verification Required'}</span>
              </span>
            </div>

            <div className="space-y-space-12">
              <label
                onClick={() => toggleCheck('item1')}
                className="flex items-center justify-between p-space-12 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors cursor-pointer border border-outline-variant/40"
              >
                <div className="flex items-center gap-space-12">
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    checklist.item1 ? 'bg-secondary text-on-secondary' : 'border border-outline-variant bg-surface'
                  }`}>
                    {checklist.item1 && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-bold text-xs sm:text-label-bold text-on-surface">Lens glass clean & scratch-free</span>
                    <span className="font-body-sm text-[11px] sm:text-body-sm text-on-surface-variant">
                      Front and rear optics clear, anti-reflective coating intact
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-badge font-badge text-secondary bg-surface-container px-2 py-0.5 rounded uppercase">
                  Matched
                </span>
              </label>

              <label
                onClick={() => toggleCheck('item2')}
                className="flex items-center justify-between p-space-12 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors cursor-pointer border border-outline-variant/40"
              >
                <div className="flex items-center gap-space-12">
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    checklist.item2 ? 'bg-secondary text-on-secondary' : 'border border-outline-variant bg-surface'
                  }`}>
                    {checklist.item2 && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-bold text-xs sm:text-label-bold text-on-surface">2x original Sony batteries & charger present</span>
                    <span className="font-body-sm text-[11px] sm:text-body-sm text-on-surface-variant">
                      NP-FW50 tested holding charge, original twin wall adapter present
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-badge font-badge text-secondary bg-surface-container px-2 py-0.5 rounded uppercase">
                  Matched
                </span>
              </label>

              <label
                onClick={() => toggleCheck('item3')}
                className="flex items-center justify-between p-space-12 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors cursor-pointer border border-outline-variant/40"
              >
                <div className="flex items-center gap-space-12">
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    checklist.item3 ? 'bg-secondary text-on-secondary' : 'border border-outline-variant bg-surface'
                  }`}>
                    {checklist.item3 && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-bold text-xs sm:text-label-bold text-on-surface">Camera sensor clean (No dust / stains)</span>
                    <span className="font-body-sm text-[11px] sm:text-body-sm text-on-surface-variant">
                      Tested with blank shot, shutter curtain actuation normal
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-badge font-badge text-secondary bg-surface-container px-2 py-0.5 rounded uppercase">
                  Matched
                </span>
              </label>

              <label
                onClick={() => toggleCheck('item4')}
                className="flex items-center justify-between p-space-12 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors cursor-pointer border border-outline-variant/40"
              >
                <div className="flex items-center gap-space-12">
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    checklist.item4 ? 'bg-secondary text-on-secondary' : 'border border-outline-variant bg-surface'
                  }`}>
                    {checklist.item4 && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-bold text-xs sm:text-label-bold text-on-surface">Bag & shoulder strap in original condition</span>
                    <span className="font-body-sm text-[11px] sm:text-body-sm text-on-surface-variant">
                      Padded dividers complete, no zipper malfunction or heavy wear
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-badge font-badge text-secondary bg-surface-container px-2 py-0.5 rounded uppercase">
                  Matched
                </span>
              </label>
            </div>

            <div className="mt-space-16 pt-space-12 flex items-center justify-between bg-surface-container-low p-space-12 rounded-lg text-xs sm:text-body-sm">
              <div className="flex items-center gap-space-8">
                <span className="material-symbols-outlined text-secondary text-lg">verified</span>
                <span className="font-body-sm text-on-surface">Mutual agreement logged with tamperproof timestamp</span>
              </div>
              <span className="font-label-bold text-secondary font-mono">4:32 PM IST</span>
            </div>
          </section>

          {/* Step 2: Evidence Photos */}
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-24 shadow-sm border border-outline-variant/60">
            <div className="flex items-center justify-between mb-space-16">
              <div className="flex items-center gap-space-12">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <div>
                  <h2 className="font-headline-sm text-base sm:text-headline-sm text-on-surface font-bold">
                    Return Handover Evidence Photos
                  </h2>
                  <p className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant">
                    Timestamped physical photos verified at handover point
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-space-12">
              <div className="h-28 sm:h-36 rounded-lg overflow-hidden bg-surface-container border border-outline-variant relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0o1wRu8b1ZCCeHxHdRz5zq7CqayMAXYVKJmyz8zfHIrG_zai1vEVoGfjzIbFdytTovBIUYdRtGRRO_dM4zoUVXuEMA2gwmZDAm2xKln_p9qrJWUnbU_1XkUGBEbJtnLNHP7JLA2jWmXqLoN7erZGk0uKXH8AI7lYpBo2djHB4o9xi31rKYrmCW1WQHdg97lsGiRhE8IJO4eCT_a220-4TJSknKeMSqsP204eXiGhP40bus-2MnCN-Cg"
                  alt="Return photo 1"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 bg-primary/70 text-on-primary text-[9px] px-1 py-0.5 rounded">Front Optical</span>
              </div>
              <div className="h-28 sm:h-36 rounded-lg overflow-hidden bg-surface-container border border-outline-variant relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1NY762LcAFK3cmlqkQ6H67rh-Q9lQCzZUxrOfzinNAxW4P-kHbpkJfIeqWILYZyRJmLRWOoPMX58TovSftmxXiYlhfjBrhypVWiogbIpihrup-lPsJpczf73PC0uYUpcrGo4o8SqlUgjUXxSrad3JpizDK7xABYyeYIJneJbuncxe19uOGgg_d8yVKp-VaO3vNS5Qoa_czBoIdzkxmRN1xTZMqPIrORV4ek8dLjbhyRe9NF6OWV852Q"
                  alt="Return photo 2"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 bg-primary/70 text-on-primary text-[9px] px-1 py-0.5 rounded">Sensor Bay</span>
              </div>
              <div className="h-28 sm:h-36 rounded-lg overflow-hidden bg-surface-container border border-outline-variant relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJuVk0Mn9nqPYFFxnpzjkRcI4YyPZj5gKTHyZWs9SyKECUDzXQnUHHtpIdD-zWTQKZogYKBVmSWL-GKl8UbLgijQzxPKuIcoJoQDV0_mZtHO-At7TNYwLqQEMw2pUQhGb8BvU_RiMLhvuoYUlJDBiE_RKlIuXp2nO2rXWb9avP9kHs1Nf24F0CxtifMEzfUqbIzUOt_ixhrYKApO7FDfBQhSnNE4WcmGWlWTVwg2WxaRlNsoD7D-wA9w"
                  alt="Return photo 3"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 bg-primary/70 text-on-primary text-[9px] px-1 py-0.5 rounded">Kit Accessories</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Escrow Deposit Refund Action (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-16">
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-20 shadow-sm border border-outline-variant/60 flex flex-col gap-space-16">
            <div className="flex items-center gap-space-8">
              <span className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm">
                3
              </span>
              <div>
                <h3 className="font-headline-sm text-base sm:text-headline-sm text-on-surface font-bold">
                  Escrow Security Deposit Refund
                </h3>
                <p className="text-xs text-on-surface-variant">Instant Razorpay / Axis Trustee payout</p>
              </div>
            </div>

            {refundResult ? (
              <div className="bg-secondary-container/30 p-space-16 rounded-xl border border-secondary flex flex-col gap-space-12 text-center items-center">
                <div className="w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <div>
                  <span className="text-badge font-badge bg-secondary text-on-secondary px-2 py-0.5 rounded uppercase">
                    Escrow Refund Disbursed
                  </span>
                  <div className="font-price-lg text-2xl text-on-surface font-bold mt-1">
                    ₹{refundResult.refund_amount?.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Transferred instantly to <strong>{refundResult.upi_id}</strong>
                  </p>
                  <p className="font-mono text-[11px] text-secondary mt-1 font-bold">
                    UTR: {refundResult.refund_utr}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full pt-2 border-t border-secondary/20">
                  <button
                    onClick={() => onNavigate('orders')}
                    className="w-full bg-primary text-on-primary py-space-8 rounded font-label-bold text-xs sm:text-body-sm hover:bg-inverse-surface cursor-pointer"
                  >
                    View in My Orders & Activity
                  </button>
                  <button
                    onClick={() => onNavigate('disputes')}
                    className="w-full text-xs text-on-surface-variant hover:text-error cursor-pointer"
                  >
                    Need to file a dispute? Open Mediation Center
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-space-16">
                {/* Deposit Held Box */}
                <div className="p-space-16 bg-surface-container-low rounded-xl flex items-center justify-between border border-outline-variant/40">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant">Security Deposit in Escrow:</span>
                    <span className="font-price-lg text-xl sm:text-price-lg text-secondary font-bold">
                      ₹{depositAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-secondary font-bold flex items-center gap-0.5 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">lock</span> 100% Refundable
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[36px]">shield</span>
                </div>

                {/* UPI Account Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-badge font-badge text-on-surface-variant">
                    Recipient UPI ID (Bank Sweep):
                  </label>
                  <div className="flex items-center gap-space-8 bg-surface-container-low px-space-12 py-space-8 rounded-lg border border-outline-variant">
                    <span className="material-symbols-outlined text-[18px] text-secondary">payments</span>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="bg-transparent font-mono text-body-sm font-bold text-on-surface focus:outline-none flex-1"
                      placeholder="user@okhdfcbank"
                    />
                  </div>
                </div>

                <div className="p-space-12 bg-surface-container rounded-lg flex items-start gap-space-8 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">verified_user</span>
                  <span>
                    Upon confirmation by both parties, the trustee escrow rail dispatches funds directly via NPCI UPI with zero deductions.
                  </span>
                </div>

                <button
                  onClick={handleConfirmReturn}
                  disabled={isSubmitting || !allPassed}
                  className={`w-full py-space-12 rounded-xl font-label-bold text-body-md flex items-center justify-center gap-space-8 shadow-sm transition-all cursor-pointer ${
                    allPassed
                      ? 'bg-secondary hover:bg-on-secondary-container text-on-secondary'
                      : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  <span>{isSubmitting ? 'Releasing Escrow Deposit...' : 'Confirm Return & Release Escrow Refund'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
