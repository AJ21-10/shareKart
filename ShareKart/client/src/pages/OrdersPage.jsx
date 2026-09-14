import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const OrdersPage = ({ onNavigate }) => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    setLoading(true);
    try {
      const res = await api.getMyRentals();
      if (res.success) {
        setRentals(res.rentals);
      }
    } catch (err) {
      console.error('Failed to load user rentals', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-space-20 max-w-4xl mx-auto pb-16 sm:pb-space-48">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant pb-2 sm:pb-space-12">
        <div>
          <h1 className="font-headline-lg text-lg sm:text-headline-lg text-on-surface font-bold">
            My Orders & Rentals
          </h1>
          <p className="text-xs sm:text-body-sm text-on-surface-variant">
            Track active rentals, escrow reserve status, and security deposit releases
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="text-xs sm:text-body-sm font-label-bold text-secondary hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Explore More</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant">
          Loading your bookings...
        </div>
      ) : rentals.length === 0 ? (
        <div className="p-8 sm:p-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col items-center gap-space-12">
          <span className="material-symbols-outlined text-[48px] text-outline-variant">receipt_long</span>
          <p className="font-headline-sm text-base sm:text-headline-sm text-on-surface">No bookings yet</p>
          <p className="text-xs sm:text-body-sm">Rent or buy pre-owned gear from verified neighbors nearby.</p>
          <button
            onClick={() => onNavigate('search')}
            className="bg-primary text-on-primary px-space-16 py-2 sm:py-space-8 rounded font-label-bold text-xs sm:text-body-sm"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-space-16">
          {rentals.map((r) => (
            <div key={r.id} className="bg-surface-container-lowest rounded-xl p-3.5 sm:p-space-20 border border-outline-variant/60 shadow-sm flex flex-col gap-3 sm:gap-space-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/40 pb-2 sm:pb-space-12">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-on-surface text-xs sm:text-body-md">{r.id}</span>
                    <span className={`text-[10px] sm:text-badge font-badge uppercase px-2 py-0.5 rounded ${
                      r.status === 'active' ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-on-surface'
                    }`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Booked on {new Date(r.created_at).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                  {r.escrow_pin && (
                    <div className="bg-secondary-container text-on-secondary-container px-2.5 sm:px-space-12 py-1 sm:py-space-6 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">pin</span>
                      <span>PIN: <strong className="font-mono text-xs sm:text-sm">{r.escrow_pin}</strong></span>
                    </div>
                  )}
                  <button
                    onClick={() =>
                      onNavigate('handover-pass', {
                        bookingId: r.id,
                        escrow_pin: r.escrow_pin,
                        title: r.product_title,
                        total_amount: r.total_amount,
                        deposit_fee: r.deposit_fee
                      })
                    }
                    className="bg-primary text-on-primary hover:bg-inverse-surface px-2.5 sm:px-space-12 py-1 sm:py-space-6 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="View Digital Pickup Pass & Inspection Checklist"
                  >
                    <span className="material-symbols-outlined text-[15px]">vpn_key</span>
                    <span>Handover Pass</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-space-16 items-start">
                <img
                  src={Array.isArray(r.product_images) ? r.product_images[0] : ''}
                  alt={r.product_title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover bg-surface-container shrink-0"
                />
                <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
                  <h3 className="font-headline-sm text-sm sm:text-headline-sm text-on-surface truncate font-bold">
                    {r.product_title}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-space-8 text-xs bg-surface-container-low p-2.5 sm:p-space-12 rounded-lg">
                    <div>
                      <span className="text-on-surface-variant block text-[10px] sm:text-xs">Duration</span>
                      <span className="font-bold text-on-surface text-xs">{r.total_days} Days ({r.start_date} – {r.end_date})</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block text-[10px] sm:text-xs">Total Paid</span>
                      <span className="font-bold text-on-surface text-xs">₹{r.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block text-[10px] sm:text-xs">Escrow Deposit</span>
                      <span className="font-bold text-secondary text-xs">₹{r.deposit_fee?.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block text-[10px] sm:text-xs">Handover</span>
                      <span className="font-bold text-on-surface capitalize text-xs">{r.delivery_type}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escrow Status Tracking */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs pt-2 border-t border-outline-variant/40 text-on-surface-variant gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[15px]">shield</span>
                  <span>Escrow: <strong className="text-on-surface capitalize">{r.escrow_status.replace(/_/g, ' ')}</strong></span>
                </div>
                <span className="text-secondary font-bold">Deposit automatically reversed upon return</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
