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
    <div className="w-full flex flex-col gap-space-20 max-w-4xl mx-auto pb-space-48">
      <div className="flex items-center justify-between border-b border-outline-variant pb-space-12">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            My Orders & Rentals
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Track active rentals, escrow reserve status, and security deposit releases
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="text-body-sm font-label-bold text-secondary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Explore More</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant">
          Loading your bookings...
        </div>
      ) : rentals.length === 0 ? (
        <div className="p-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col items-center gap-space-12">
          <span className="material-symbols-outlined text-[48px] text-outline-variant">receipt_long</span>
          <p className="font-headline-sm text-headline-sm text-on-surface">No bookings yet</p>
          <p className="text-body-sm">Rent or buy pre-owned gear from verified neighbors nearby.</p>
          <button
            onClick={() => onNavigate('search')}
            className="bg-primary text-on-primary px-space-16 py-space-8 rounded font-label-bold"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-space-16">
          {rentals.map((r) => (
            <div key={r.id} className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/60 shadow-sm flex flex-col gap-space-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-8 border-b border-outline-variant/40 pb-space-12">
                <div>
                  <div className="flex items-center gap-space-8">
                    <span className="font-mono font-bold text-on-surface text-body-md">{r.id}</span>
                    <span className={`text-badge font-badge uppercase px-space-6 py-0.5 rounded ${
                      r.status === 'active' ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-on-surface'
                    }`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">Booked on {new Date(r.created_at).toLocaleDateString()}</p>
                </div>

                {r.escrow_pin && (
                  <div className="bg-secondary-container text-on-secondary-container px-space-12 py-space-6 rounded-lg text-xs font-bold flex items-center gap-space-6">
                    <span className="material-symbols-outlined text-[16px]">pin</span>
                    <span>Escrow Handover PIN: <strong className="font-mono text-sm">{r.escrow_pin}</strong></span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-space-16 items-start">
                <img
                  src={Array.isArray(r.product_images) ? r.product_images[0] : ''}
                  alt={r.product_title}
                  className="w-24 h-24 rounded-lg object-cover bg-surface-container shrink-0"
                />
                <div className="flex-1 flex flex-col gap-space-6 min-w-0">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                    {r.product_title}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-8 text-xs bg-surface-container-low p-space-12 rounded-lg">
                    <div>
                      <span className="text-on-surface-variant block">Duration</span>
                      <span className="font-bold text-on-surface">{r.total_days} Days ({r.start_date} – {r.end_date})</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block">Total Paid</span>
                      <span className="font-bold text-on-surface">₹{r.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block">Escrow Deposit</span>
                      <span className="font-bold text-secondary">₹{r.deposit_fee?.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block">Handover</span>
                      <span className="font-bold text-on-surface capitalize">{r.delivery_type}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escrow Status Tracking */}
              <div className="flex items-center justify-between text-xs pt-space-8 border-t border-outline-variant/40 text-on-surface-variant">
                <div className="flex items-center gap-space-6">
                  <span className="material-symbols-outlined text-secondary text-[16px]">shield</span>
                  <span>Escrow Status: <strong className="text-on-surface capitalize">{r.escrow_status.replace(/_/g, ' ')}</strong></span>
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
