import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CheckoutPage = ({ params = {}, onNavigate, onToast }) => {
  const { user } = useAuth();
  const { productId = 1, orderType = 'rent', days = 3, startDate = '2025-10-24', endDate = '2025-10-27' } = params;

  const [product, setProduct] = useState(null);
  const [deliveryType, setDeliveryType] = useState('pickup'); // 'pickup' or 'delivery'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'netbanking', 'card'
  const [upiApp, setUpiApp] = useState('gpay');
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (product) {
      computeCosts();
    }
  }, [product, deliveryType]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await api.getProductById(productId);
      if (res.success) {
        setProduct(res.product);
      }
    } catch (err) {
      console.error('Failed to load product', err);
    } finally {
      setLoading(false);
    }
  };

  const computeCosts = async () => {
    try {
      const res = await api.calculateRentalCost({
        productId,
        startDate,
        endDate,
        deliveryType,
        orderType
      });
      if (res.success) {
        setCostBreakdown(res);
      }
    } catch (err) {
      console.error('Cost breakdown failed', err);
    }
  };

  const handleTriggerPayment = async () => {
    setPaying(true);

    try {
      // Simulate Razorpay Escrow gateway network roundtrip
      await new Promise(r => setTimeout(r, 1200));

      const res = await api.checkout({
        productId,
        orderType,
        startDate,
        endDate,
        totalDays: costBreakdown?.totalDays || days,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? 'Kudasan Swagat Gate, Gandhinagar' : 'Infocity Gate 2 Self Pickup',
        paymentMethod
      });

      if (res.success) {
        setCompletedOrder(res.order);
        onToast && onToast('Payment held in Razorpay Escrow reserve! Order booked.');
      }
    } catch (err) {
      console.error('Payment checkout failed', err);
      alert(err.message || 'Payment simulation failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="p-16 text-center text-on-surface-variant">
        Loading checkout details...
      </div>
    );
  }

  const thumbnail = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '';
  const isRent = orderType === 'rent';
  const totalAmount = costBreakdown?.totalAmount || (isRent ? 6167 : product.sale_price + 117);
  const netCost = costBreakdown?.netCost || (isRent ? 2667 : product.sale_price + 117);

  return (
    <div className="w-full flex flex-col gap-space-16 pb-space-32">
      {/* Progress Stepper */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-3.5 sm:p-space-16 border border-outline-variant/60 shadow-sm mb-space-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-space-16">
          <div>
            <span className="font-badge text-[10px] sm:text-badge text-secondary font-bold uppercase tracking-wider">
              Checkout Workflow
            </span>
            <h1 className="font-headline-lg text-base sm:text-headline-lg text-on-surface tracking-tight font-bold mt-0.5 sm:mt-space-2">
              {isRent ? 'Rental Checkout & Escrow Booking' : 'Direct Purchase & Escrow Protection'}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-space-8 text-xs sm:text-body-sm font-body-sm overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {/* Step 1 Done */}
            <div className="flex items-center gap-1.5 sm:gap-space-8 shrink-0">
              <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-secondary text-on-secondary font-label-bold text-xs">
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">check</span>
              </span>
              <span className="font-label-bold text-on-surface">1. Dates</span>
            </div>
            <span className="w-4 sm:w-8 h-[2px] bg-secondary shrink-0"></span>
            {/* Step 2 Active */}
            <div className="flex items-center gap-1.5 sm:gap-space-8 shrink-0">
              <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary-container text-on-primary font-label-bold text-xs ring-2 sm:ring-4 ring-secondary-container">
                2
              </span>
              <span className="font-label-bold text-primary font-bold">2. Identity & Handover</span>
            </div>
            <span className="w-4 sm:w-8 h-[2px] bg-surface-container-high shrink-0"></span>
            {/* Step 3 Upcoming */}
            <div className="flex items-center gap-1.5 sm:gap-space-8 shrink-0 text-on-surface-variant/60">
              <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-surface-container text-on-surface-variant font-label-bold text-xs">
                3
              </span>
              <span className="text-on-surface-variant/70">3. Escrow Pay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24 items-start">
        {/* LEFT COLUMN: Verification, Handover, Payment Methods (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-24">
          {/* Section 1: Aadhaar UIDAI Verification Status */}
          <section className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/60 shadow-sm flex flex-col gap-space-12">
            <div className="flex items-start justify-between gap-space-12">
              <div className="flex items-center gap-space-8">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Renter Identity Verification</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">eKYC authorization via UIDAI Digital India Gateway</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-space-4 bg-secondary-container text-on-secondary-container px-space-12 py-space-4 rounded-full font-badge text-badge">
                <span className="material-symbols-outlined text-[15px] material-symbols-fill">verified</span>
                Verified Citizen
              </span>
            </div>

            <div className="bg-surface-container-low rounded-lg p-space-16 border border-outline-variant/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-12">
                <div className="flex items-center gap-space-12">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">fingerprint</span>
                  </div>
                  <div>
                    <p className="font-label-bold text-label-bold text-on-surface">
                      Aadhaar Verified Citizen: {user?.name || 'Aarav Patel'}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                      UIDAI Linked: {user?.aadhaar_number || 'XXXX-XXXX-4819'} • Gandhinagar Resident
                    </p>
                  </div>
                </div>
                <span className="text-secondary font-label-bold text-label-bold text-xs bg-surface-container-lowest px-space-8 py-space-4 rounded border border-outline-variant/40">
                  UIDAI Hash: {user?.aadhaar_hash || '#OK-82914'}
                </span>
              </div>
              <div className="mt-space-12 pt-space-12 border-t border-outline-variant/40 flex items-start gap-space-8 text-on-surface-variant font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">check_circle</span>
                <p>Your verified status allows <strong className="text-on-surface font-label-bold">instant booking approval</strong> without physical paper deposits or in-person KYC paperwork.</p>
              </div>
            </div>
          </section>

          {/* Section 2: Handover Preference */}
          <section className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/60 shadow-sm flex flex-col gap-space-16">
            <div className="flex items-center gap-space-8">
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Handover Preference</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Select how you want to collect and return the equipment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-16">
              {/* Option 1: Self Pickup */}
              <div
                onClick={() => setDeliveryType('pickup')}
                className={`relative cursor-pointer rounded-xl p-space-16 transition-all border-2 ${
                  deliveryType === 'pickup'
                    ? 'border-secondary bg-surface-container-low shadow-sm'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-start justify-between gap-space-8 mb-space-8">
                  <div className="flex items-center gap-space-8">
                    <input
                      type="radio"
                      name="handover"
                      checked={deliveryType === 'pickup'}
                      onChange={() => setDeliveryType('pickup')}
                      className="accent-secondary w-4 h-4 cursor-pointer"
                    />
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Self Pickup (Lender)</span>
                  </div>
                  <span className="bg-secondary text-on-secondary font-badge text-badge px-space-8 py-space-2 rounded">
                    FREE
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-12">
                  Collect in person, test gear on-site with lender.
                </p>
                <div className="bg-surface-container-lowest rounded-lg p-space-12 flex flex-col gap-space-8 text-body-sm border border-outline-variant/40">
                  <div className="flex items-start gap-space-8">
                    <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">pin_drop</span>
                    <div>
                      <span className="font-label-bold text-on-surface">{product.location_name || 'Infocity, Gandhinagar'}</span>
                      <p className="text-on-surface-variant text-xs">Pickup hub verified by Sharekart</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-8 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">schedule</span>
                    <span>Pickup Window: <strong className="text-on-surface font-label-bold">Today, 4:00 PM – 7:00 PM</strong></span>
                  </div>
                </div>
              </div>

              {/* Option 2: Doorstep Delivery */}
              <div
                onClick={() => setDeliveryType('delivery')}
                className={`relative cursor-pointer rounded-xl p-space-16 transition-all border-2 ${
                  deliveryType === 'delivery'
                    ? 'border-secondary bg-surface-container-low shadow-sm'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-start justify-between gap-space-8 mb-space-8">
                  <div className="flex items-center gap-space-8">
                    <input
                      type="radio"
                      name="handover"
                      checked={deliveryType === 'delivery'}
                      onChange={() => setDeliveryType('delivery')}
                      className="accent-secondary w-4 h-4 cursor-pointer"
                    />
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Doorstep Concierge</span>
                  </div>
                  <span className="bg-surface-container text-on-surface font-badge text-badge px-space-8 py-space-2 rounded">
                    +₹150
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-12">
                  Sharekart concierge delivers directly to your doorstep and collects on return.
                </p>
                <div className="bg-surface-container-lowest rounded-lg p-space-12 flex flex-col gap-space-6 text-body-sm border border-outline-variant/40">
                  <div className="flex items-center gap-space-6 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                    <span>Includes physical handover return inspection slip</span>
                  </div>
                  <div className="flex items-center gap-space-6 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-secondary">speed</span>
                    <span>Dispatched within 2 hours of payment confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Rental Schedule Timeline */}
          {isRent && (
            <section className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/60 shadow-sm flex flex-col gap-space-16">
              <div className="flex items-center gap-space-8">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[20px]">date_range</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Rental Period & Schedule</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Continuous billing window with 72-hour coverage</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-12 items-center bg-surface-container-low rounded-lg p-space-16 border border-outline-variant/40">
                <div className="flex flex-col gap-space-4">
                  <span className="font-badge text-badge text-on-surface-variant uppercase">Start Handover</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{startDate}</span>
                  <span className="font-body-sm text-body-sm text-secondary font-label-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">alarm</span> 5:00 PM
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center py-space-8 md:py-0">
                  <span className="font-label-bold text-label-bold text-on-surface px-space-12 py-space-4 rounded-full bg-surface-container-highest shadow-sm">
                    {costBreakdown?.totalDays || days} Days Coverage
                  </span>
                  <div className="w-24 h-1 bg-secondary rounded-full mt-space-6"></div>
                </div>
                <div className="flex flex-col gap-space-4 md:items-end md:text-right">
                  <span className="font-badge text-badge text-on-surface-variant uppercase">Scheduled Return</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{endDate}</span>
                  <span className="font-body-sm text-body-sm text-secondary font-label-bold flex items-center md:justify-end gap-1">
                    <span className="material-symbols-outlined text-[16px]">alarm</span> 5:00 PM
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Section 4: Payment Methods */}
          <section className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/60 shadow-sm flex flex-col gap-space-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-8">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Select Payment Method</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Protected by RBI-regulated Razorpay Escrow</p>
                </div>
              </div>
              <span className="text-badge font-badge text-secondary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                256-Bit SSL
              </span>
            </div>

            <div className="flex flex-col gap-space-8">
              {/* UPI Option */}
              <label 
                onClick={() => setPaymentMethod('upi')}
                className={`flex items-center justify-between p-space-16 rounded-xl cursor-pointer transition-all border-2 ${
                  paymentMethod === 'upi' ? 'border-secondary bg-surface-container-low' : 'border-outline-variant/60 bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-center gap-space-12">
                  <input
                    type="radio"
                    name="payMethod"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="accent-secondary w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-label-bold text-label-bold text-on-surface text-body-md">Instant UPI (Recommended)</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Google Pay, PhonePe, Paytm, BHIM</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-secondary bg-secondary-fixed/30 px-2 py-1 rounded">
                  <span>Fast Deposit Refund</span>
                </div>
              </label>

              {/* Cards Option */}
              <label 
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-between p-space-16 rounded-xl cursor-pointer transition-all border-2 ${
                  paymentMethod === 'card' ? 'border-secondary bg-surface-container-low' : 'border-outline-variant/60 bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-center gap-space-12">
                  <input
                    type="radio"
                    name="payMethod"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-secondary w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-label-bold text-label-bold text-on-surface text-body-md">Credit / Debit Cards</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Visa, MasterCard, RuPay</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[22px] text-on-surface-variant">credit_card</span>
              </label>

              {/* Net Banking */}
              <label 
                onClick={() => setPaymentMethod('netbanking')}
                className={`flex items-center justify-between p-space-16 rounded-xl cursor-pointer transition-all border-2 ${
                  paymentMethod === 'netbanking' ? 'border-secondary bg-surface-container-low' : 'border-outline-variant/60 bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-center gap-space-12">
                  <input
                    type="radio"
                    name="payMethod"
                    checked={paymentMethod === 'netbanking'}
                    onChange={() => setPaymentMethod('netbanking')}
                    className="accent-secondary w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-label-bold text-label-bold text-on-surface text-body-md">Net Banking</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">SBI, HDFC Bank, ICICI, Axis Bank & others</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[22px] text-on-surface-variant">account_balance</span>
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Order Summary (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-16 lg:sticky lg:top-36">
          <div className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/60 shadow-md flex flex-col gap-space-16">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold pb-space-8 border-b border-outline-variant/60">
              {isRent ? 'Rental Order Summary' : 'Purchase Order Summary'}
            </h3>

            {/* Product Thumbnail */}
            <div className="flex items-center gap-space-12 pb-space-12 border-b border-outline-variant/60">
              <img
                src={thumbnail}
                alt={product.title}
                className="w-20 h-20 rounded-lg object-cover bg-surface-container shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="bg-primary text-on-primary font-badge text-badge px-space-6 py-0.5 rounded w-max mb-1">
                  {orderType.toUpperCase()}
                </span>
                <h4 className="font-label-bold text-body-sm text-on-surface truncate">{product.title}</h4>
                <p className="text-xs text-on-surface-variant truncate">{product.location_name}</p>
                <span className="text-xs text-secondary font-label-bold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  Verified Listing
                </span>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="flex flex-col gap-space-10 text-body-sm font-body-sm">
              {isRent ? (
                <div className="flex justify-between items-center text-on-surface">
                  <span>Rental ({costBreakdown?.totalDays || days} Days @ ₹{product.rent_price_daily}/day)</span>
                  <span className="font-label-bold">₹{costBreakdown?.rentFee?.toLocaleString('en-IN') || 0}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-on-surface">
                  <span>Product Sale Price</span>
                  <span className="font-label-bold">₹{product.sale_price?.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Platform & Escrow Fee</span>
                <span>₹99</span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant">
                <span>GST (18% on platform fee)</span>
                <span>₹18</span>
              </div>

              {deliveryType === 'delivery' && (
                <div className="flex justify-between items-center text-secondary font-label-bold">
                  <span>Doorstep Concierge Delivery</span>
                  <span>+₹150</span>
                </div>
              )}

              {/* Refundable Deposit Highlight */}
              {isRent && product.security_deposit > 0 && (
                <div className="bg-secondary-container/40 p-space-12 rounded-lg flex items-center justify-between border border-secondary-fixed">
                  <div className="flex items-center gap-space-6">
                    <span className="material-symbols-outlined text-[18px] text-secondary">shield</span>
                    <span className="font-label-bold text-on-secondary-container">Refundable Deposit</span>
                  </div>
                  <span className="font-label-bold text-secondary">₹{product.security_deposit?.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Total Payable Box */}
            <div className="pt-space-12 border-t border-outline-variant/60 flex flex-col gap-space-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold block">
                    Amount Payable Now
                  </span>
                  {isRent && (
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      (Includes ₹{product.security_deposit?.toLocaleString('en-IN')} Refundable Deposit)
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-price-lg text-price-lg text-on-surface font-bold">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {isRent && (
                <div className="p-space-12 rounded bg-surface-container-high flex items-center justify-between">
                  <span className="font-label-bold text-body-sm text-on-surface">Net Rental Cost to You:</span>
                  <span className="font-label-bold text-secondary text-base">
                    ₹{netCost.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Trigger Button */}
            <button
              onClick={handleTriggerPayment}
              disabled={paying}
              className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary font-headline-sm text-headline-sm py-space-16 px-space-24 rounded-lg shadow-md flex items-center justify-center gap-space-8 transition-transform active:scale-[0.99] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span>{paying ? 'Holding Funds in Escrow...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} via Razorpay`}</span>
            </button>

            <p className="text-center text-xs text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
              <span>Escrow release pin generated instantly on SMS & App</span>
            </p>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-4 sm:p-space-24 shadow-2xl border border-secondary-fixed flex flex-col gap-3 sm:gap-space-16 text-center animate-scale-up my-4">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>

            <div>
              <span className="text-badge font-badge text-secondary uppercase tracking-wider font-bold">
                Escrow Reserve Activated
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">
                Booking Confirmed!
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Order ID: <strong className="text-on-surface font-mono">{completedOrder.id}</strong>
              </p>
            </div>

            {/* Escrow PIN Display Box */}
            <div className="bg-secondary-fixed/30 p-space-16 rounded-xl border border-secondary-fixed flex flex-col gap-1 items-center">
              <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">Your Handover Escrow PIN</span>
              <span className="font-headline-lg text-3xl font-bold font-mono text-secondary tracking-widest">
                {completedOrder.escrow_pin || 'PIN-9923'}
              </span>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Share this PIN with {completedOrder.seller_name} ONLY after inspecting the item during physical handover.
              </p>
            </div>

            <div className="bg-surface-container-low p-space-12 rounded-lg text-body-sm text-left flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Product:</span>
                <span className="font-label-bold text-on-surface truncate max-w-xs">{completedOrder.product_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Amount in Escrow:</span>
                <span className="font-label-bold text-on-surface">₹{completedOrder.total_amount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Refundable Deposit:</span>
                <span className="font-label-bold">₹{completedOrder.deposit_fee?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-space-12 mt-2">
              <button
                onClick={() =>
                  onNavigate('handover-pass', {
                    bookingId: completedOrder.id,
                    escrow_pin: completedOrder.escrow_pin,
                    title: completedOrder.product_title,
                    total_amount: completedOrder.total_amount,
                    deposit_fee: completedOrder.deposit_fee
                  })
                }
                className="flex-1 bg-secondary text-on-secondary py-space-12 px-space-16 rounded-lg font-label-bold shadow-sm hover:bg-secondary-container hover:text-on-secondary-container transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                <span>View Handover Pass</span>
              </button>
              <button
                onClick={() => onNavigate('orders')}
                className="px-space-16 py-space-12 border border-outline-variant rounded-lg font-label-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
