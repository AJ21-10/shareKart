import React, { useState } from 'react';

export const QuickRentModal = ({ isOpen, product, onClose, onNavigate }) => {
  const [days, setDays] = useState(3);

  if (!isOpen || !product) return null;

  const dailyRate = product.rent_price_daily || 850;
  const deposit = product.security_deposit || 3500;
  const rentTotal = dailyRate * days;
  const totalPayable = rentTotal + deposit;

  const handleProceed = () => {
    onClose();
    onNavigate('checkout', {
      productId: product.id,
      orderType: 'rent',
      totalDays: days,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + days * 86400000).toISOString().split('T')[0],
      rentFee: rentTotal,
      depositFee: deposit,
      totalAmount: totalPayable + 99 + 18,
      title: product.title
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-primary/60 backdrop-blur-xs transition-opacity">
      <div className="bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-4 sm:p-space-20 shadow-2xl border border-outline-variant flex flex-col gap-space-12 animate-slideUp sm:animate-scaleIn">
        {/* Sheet Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-space-8 min-w-0">
            <div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-outline-variant">
              <img
                src={Array.isArray(product.images) ? product.images[0] : (product.images || '')}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-badge text-badge text-secondary font-bold uppercase tracking-wider">
                QUICK ESCROW RESERVATION
              </span>
              <h4 className="font-headline-sm text-base sm:text-headline-sm text-on-surface truncate font-bold">
                {product.title}
              </h4>
              <span className="text-xs text-on-surface-variant">
                Host: {product.seller_name || 'Rajesh K.'} ({product.location_name || 'Gandhinagar'})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Rental Duration Selector */}
        <div className="p-space-12 bg-surface-container-low rounded-xl flex items-center justify-between border border-outline-variant/40">
          <div className="flex items-center gap-space-8">
            <span className="material-symbols-outlined text-[20px] text-secondary">date_range</span>
            <div className="flex flex-col">
              <span className="font-label-bold text-xs sm:text-label-bold text-on-surface">
                {days} Full Days Rental Period
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Today – Return on day {days}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-lg border border-outline-variant">
            <button
              onClick={() => setDays(d => Math.max(1, d - 1))}
              className="w-6 h-6 rounded flex items-center justify-center text-on-surface hover:bg-surface-container font-bold cursor-pointer"
            >
              -
            </button>
            <span className="font-mono font-bold text-xs px-2">{days}d</span>
            <button
              onClick={() => setDays(d => d + 1)}
              className="w-6 h-6 rounded flex items-center justify-center text-on-surface hover:bg-surface-container font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Pricing Breakdown Box */}
        <div className="flex flex-col gap-2 p-space-12 bg-surface rounded-xl border border-outline-variant/40">
          <div className="flex justify-between items-center text-on-surface-variant text-xs sm:text-body-sm">
            <span>Rent (₹{dailyRate} × {days} days)</span>
            <span className="text-on-surface font-label-bold">₹{rentTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant text-xs sm:text-body-sm">
            <span className="flex items-center gap-1">
              Refundable Escrow Deposit
              <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
            </span>
            <span className="text-secondary font-label-bold">+₹{deposit.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-outline-variant/40 text-on-surface">
            <div className="flex flex-col">
              <span className="font-headline-sm text-sm sm:text-headline-sm font-bold">Total Payable Now</span>
              <span className="text-[10px] text-secondary font-bold">
                ₹{deposit.toLocaleString('en-IN')} returned instantly after return check
              </span>
            </div>
            <span className="font-price-lg text-lg sm:text-price-lg text-primary font-bold">
              ₹{totalPayable.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleProceed}
          className="w-full py-space-12 rounded-xl bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-bold text-sm sm:text-body-md flex items-center justify-center gap-space-8 shadow-sm cursor-pointer transition-all active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-[20px]">verified</span>
          <span>Instant Reserve with Escrow</span>
        </button>
      </div>
    </div>
  );
};
