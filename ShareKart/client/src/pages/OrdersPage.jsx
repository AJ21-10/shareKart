import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const OrdersPage = ({ onNavigate }) => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'pending_approval', 'completed'

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

  const filteredRentals = rentals.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="w-full flex flex-col gap-space-20 max-w-5xl mx-auto pb-16 sm:pb-space-48">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-12 bg-surface-container-lowest p-4 sm:p-space-20 rounded-xl border border-outline-variant/60 shadow-sm">
        <div>
          <div className="flex items-center gap-space-8">
            <h1 className="font-headline-lg text-lg sm:text-headline-lg text-on-surface font-bold">
              My Orders & Rental Activity
            </h1>
            <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-badge font-badge uppercase font-bold">
              Live Escrow Protected
            </span>
          </div>
          <p className="text-xs sm:text-body-sm text-on-surface-variant mt-0.5">
            Track ongoing rentals, pickup passes, physical inspection handovers, and UPI escrow refunds.
          </p>
        </div>

        <div className="flex items-center gap-space-8">
          <button
            onClick={() => onNavigate('disputes')}
            className="text-xs font-label-bold text-error hover:bg-error-container/20 px-3 py-1.5 rounded border border-error/40 transition-colors cursor-pointer"
          >
            Mediation Center
          </button>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs font-label-bold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Browse More</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-body-sm">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 sm:px-4 py-1.5 rounded-lg font-label-bold transition-colors cursor-pointer ${
            filter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          All Bookings ({rentals.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 sm:px-4 py-1.5 rounded-lg font-label-bold transition-colors cursor-pointer ${
            filter === 'active' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Active Rentals ({rentals.filter(r => r.status === 'active').length})
        </button>
        <button
          onClick={() => setFilter('pending_approval')}
          className={`px-3 sm:px-4 py-1.5 rounded-lg font-label-bold transition-colors cursor-pointer ${
            filter === 'pending_approval' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Pending Handover ({rentals.filter(r => r.status === 'pending_approval').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 sm:px-4 py-1.5 rounded-lg font-label-bold transition-colors cursor-pointer ${
            filter === 'completed' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant">
          Loading your bookings...
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="p-8 sm:p-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col items-center gap-space-12">
          <span className="material-symbols-outlined text-[48px] text-outline-variant">receipt_long</span>
          <p className="font-headline-sm text-base sm:text-headline-sm text-on-surface font-bold">No bookings in this tab</p>
          <p className="text-xs sm:text-body-sm">Rent or buy verified pre-owned gear from neighbors nearby.</p>
          <button
            onClick={() => onNavigate('search')}
            className="bg-primary text-on-primary px-space-16 py-2 rounded font-label-bold text-xs sm:text-body-sm cursor-pointer"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-space-16">
          {filteredRentals.map((r) => (
            <div
              key={r.id}
              className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-20 border border-outline-variant/60 shadow-sm flex flex-col gap-space-16"
            >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/40 pb-space-12">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-primary text-xs sm:text-body-md">{r.id}</span>
                    <span
                      className={`text-[10px] sm:text-badge font-badge uppercase px-2 py-0.5 rounded font-bold ${
                        r.status === 'active'
                          ? 'bg-secondary text-on-secondary'
                          : r.status === 'completed'
                          ? 'bg-surface-container-highest text-on-surface'
                          : 'bg-tertiary-fixed text-on-tertiary-fixed'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Lender: <strong className="text-on-surface">{r.seller_name || 'Vikram Joshi'}</strong> (Aadhaar Verified)
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Booked on {new Date(r.created_at).toLocaleDateString()} · Gandhinagar Sector 7
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                  {r.escrow_pin && (
                    <div className="bg-surface-container-high px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-[15px] text-secondary">pin</span>
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
                    className="bg-primary text-on-primary hover:bg-inverse-surface px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">vpn_key</span>
                    <span>Handover Pass</span>
                  </button>
                </div>
              </div>

              {/* Order Info Body */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-space-16 items-start">
                <img
                  src={Array.isArray(r.product_images) ? r.product_images[0] : ''}
                  alt={r.product_title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover bg-surface-container shrink-0 border border-outline-variant"
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
                      <span className="text-on-surface-variant block text-[10px] sm:text-xs">Rent Fee</span>
                      <span className="font-bold text-on-surface text-xs">₹{r.rent_fee?.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block text-[10px] sm:text-xs">Escrow Deposit</span>
                      <span className="font-bold text-secondary text-xs">
                        ₹{r.deposit_fee?.toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block text-[10px] sm:text-xs">Deposit Status</span>
                      <span className="font-bold text-xs text-on-surface">
                        {r.escrow_status === 'deposit_refunded' ? 'Refunded to UPI' : 'Held in Escrow'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-space-12 pt-2 border-t border-outline-variant/40">
                <div className="flex items-center gap-1 text-xs text-secondary font-bold">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Axis Trustee Escrow Protected</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      onNavigate('disputes', {
                        rentalId: r.id,
                        title: r.product_title
                      })
                    }
                    className="px-3 py-1.5 rounded text-xs font-label-bold text-error hover:bg-error-container/20 border border-error/30 cursor-pointer"
                  >
                    Raise Dispute Claim
                  </button>
                  <button
                    onClick={() =>
                      onNavigate('return-pass', {
                        bookingId: r.id,
                        title: r.product_title,
                        deposit_fee: r.deposit_fee
                      })
                    }
                    className="bg-secondary hover:bg-secondary/90 text-on-secondary px-4 py-1.5 rounded text-xs font-label-bold flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                    <span>Return & Escrow Refund</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
