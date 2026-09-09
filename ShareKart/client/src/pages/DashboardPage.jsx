import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = ({ onNavigate, onOpenAddProduct, onToast }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, reqRes, invRes, conRes] = await Promise.all([
        api.getDashboardStats(),
        api.getPendingRequests(),
        api.getInventory(),
        api.getContracts()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (reqRes.success) setRequests(reqRes.requests);
      if (invRes.success) setInventory(invRes.inventory);
      if (conRes.success) setContracts(conRes.contracts);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionRequest = async (orderId, status) => {
    try {
      const res = await api.updateRentalStatus(orderId, status);
      if (res.success) {
        onToast && onToast(`Rental request #${orderId} marked as ${status}!`);
        // Remove or update from list
        setRequests(prev => prev.filter(r => r.id !== orderId));
        loadDashboardData();
      }
    } catch (err) {
      console.error('Action failed', err);
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await api.updateProduct(productId, { status: newStatus });
      if (res.success) {
        onToast && onToast(`Listing status updated to ${newStatus}`);
        setInventory(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleWithdrawPayout = async () => {
    setWithdrawing(true);
    try {
      const res = await api.withdrawPayout(stats?.earnings?.withdrawable || 12800, 'aarav.patel@okhdfcbank');
      if (res.success) {
        onToast && onToast(res.message);
      }
    } catch (err) {
      console.error('Withdrawal failed', err);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-on-surface-variant">
        Loading Seller & Lender Hub...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-space-24 pb-space-48">
      {/* Top Welcome & State Strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-16 bg-surface-container-lowest p-space-20 rounded-xl border border-outline-variant/60 shadow-sm">
        <div className="flex flex-col gap-space-4">
          <div className="flex items-center gap-space-8 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Welcome back, {user?.name || 'Aarav Patel'}!
            </h1>
            <span className="inline-flex items-center gap-space-4 bg-secondary-container text-on-secondary-container px-space-8 py-0.5 rounded text-badge font-badge">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Aadhaar Verified Lender & Seller
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage bookings, physical handovers, security deposits, and UPI payouts across Gandhinagar & Ahmedabad.
          </p>
        </div>

        <div className="flex items-center gap-space-12 self-stretch sm:self-auto flex-wrap sm:flex-nowrap">
          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-surface-container-low p-space-4 rounded-full text-body-sm">
            <button
              onClick={() => onNavigate('home')}
              className="px-space-12 py-space-6 rounded-full text-on-surface-variant hover:text-on-surface font-label-bold transition-colors"
            >
              Buyer Mode
            </button>
            <div className="px-space-12 py-space-6 rounded-full bg-primary text-on-primary font-label-bold shadow-sm flex items-center gap-space-4">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
              Lender Mode Active
            </div>
          </div>

          <button
            onClick={onOpenAddProduct}
            className="inline-flex items-center justify-center gap-space-6 bg-primary text-on-primary px-space-16 py-space-8 rounded text-label-bold font-label-bold shadow-sm hover:bg-inverse-surface transition-colors whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>List New Item</span>
          </button>
        </div>
      </div>

      {/* 4 Practical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-16">
        {/* Metric 1: Active Inventory */}
        <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-bold text-label-bold">Active Inventory</span>
            <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
          </div>
          <div className="my-space-12">
            <div className="font-display-lg text-display-lg text-on-surface leading-none font-bold">
              {stats?.activeInventory?.total || inventory.length} Items
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-6">
              {stats?.activeInventory?.rentCount || 5} for Rent · {stats?.activeInventory?.buyCount || 2} for Sale
            </p>
          </div>
          <div className="pt-space-8 flex items-center gap-space-4 text-body-sm font-label-bold text-secondary border-t border-outline-variant/40">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>All catalog slots live</span>
          </div>
        </div>

        {/* Metric 2: Pending Rental Requests */}
        <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-bold text-label-bold">Rental Requests</span>
            <span className="bg-tertiary-fixed text-on-tertiary-fixed text-badge font-badge px-space-6 py-0.5 rounded font-bold">
              Action Needed
            </span>
          </div>
          <div className="my-space-12">
            <div className="font-display-lg text-display-lg text-on-surface leading-none font-bold flex items-baseline gap-space-8">
              {requests.length} Pending
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-6">
              Require confirmation within 6 hrs
            </p>
          </div>
          <div className="pt-space-8 flex items-center gap-space-4 text-body-sm font-label-bold text-on-tertiary-container border-t border-outline-variant/40">
            <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
            <span>Est. Value: ₹{stats?.pendingRequests?.estimatedValue?.toLocaleString('en-IN') || '3,900'}</span>
          </div>
        </div>

        {/* Metric 3: Ongoing Rentals */}
        <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-bold text-label-bold">Ongoing Rentals</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">sync</span>
          </div>
          <div className="my-space-12">
            <div className="font-display-lg text-display-lg text-on-surface leading-none font-bold">
              {contracts.length || 4} Items Out
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-6">
              Deposits safely held in Escrow
            </p>
          </div>
          <div className="pt-space-8 flex items-center gap-space-4 text-body-sm font-label-bold text-secondary border-t border-outline-variant/40">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Razorpay protected</span>
          </div>
        </div>

        {/* Metric 4: Earnings & Payout */}
        <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-bold text-label-bold">Earnings (October)</span>
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
          </div>
          <div className="my-space-12">
            <div className="font-display-lg text-display-lg text-on-surface leading-none font-bold">
              ₹{stats?.earnings?.monthlyTotal?.toLocaleString('en-IN') || '18,450'}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-6">
              Withdrawable: <strong className="text-on-surface font-label-bold">₹{stats?.earnings?.withdrawable?.toLocaleString('en-IN') || '12,800'}</strong>
            </p>
          </div>
          <div className="pt-space-8 flex items-center justify-between border-t border-outline-variant/40">
            <button
              onClick={handleWithdrawPayout}
              disabled={withdrawing}
              className="text-body-sm font-label-bold text-primary hover:text-secondary flex items-center gap-space-4"
            >
              <span>{withdrawing ? 'Transferring...' : 'Withdraw to UPI'}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
            <span className="text-badge font-badge text-on-surface-variant bg-surface-container px-space-6 py-0.5 rounded">
              Auto T+1
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column: Pending Rental Requests (Left) + Ongoing Contracts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24">
        {/* Left Column: Pending Rental Requests (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-space-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-8">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Pending Rental Requests</h2>
              <span className="w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-badge text-badge flex items-center justify-center font-bold">
                {requests.length}
              </span>
            </div>
            <span className="text-body-sm text-on-surface-variant">Aadhaar verified renters only</span>
          </div>

          {requests.length === 0 ? (
            <div className="bg-surface-container-lowest p-space-24 rounded-xl border border-outline-variant/60 text-center text-on-surface-variant">
              No pending rental requests right now. All requests are up to date!
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-surface-container-lowest rounded-xl p-space-16 border border-outline-variant/60 shadow-sm flex flex-col gap-space-16 transition-shadow hover:shadow-md">
                <div className="flex flex-col sm:flex-row gap-space-16">
                  <img
                    src={Array.isArray(req.product_images) ? req.product_images[0] : ''}
                    alt={req.product_title}
                    className="w-full sm:w-24 h-24 object-cover rounded-lg bg-surface-container shrink-0"
                  />
                  <div className="flex flex-col justify-between w-full min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-space-8">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
                          {req.product_title}
                        </h3>
                        <span className="px-space-8 py-0.5 bg-secondary-container text-on-secondary-container text-badge font-badge rounded uppercase">
                          {req.order_type}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant mt-0.5">{req.subcategory || 'Catalog item'}</p>
                    </div>

                    {/* Renter Badge */}
                    <div className="flex items-center flex-wrap gap-space-8 mt-space-8 pt-space-8 bg-surface-container-low px-space-12 py-space-6 rounded">
                      <span className="font-label-bold text-label-bold text-on-surface">{req.renter_name}</span>
                      <span className="inline-flex items-center text-badge font-badge text-secondary gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span> Aadhaar Verified
                      </span>
                      <span className="text-body-sm text-on-surface-variant ml-auto">📍 {req.renter_location || 'Gandhinagar'}</span>
                    </div>
                  </div>
                </div>

                {/* Duration & Earnings Matrix */}
                <div className="grid grid-cols-3 gap-space-8 bg-surface-container-low p-space-12 rounded-lg text-center">
                  <div>
                    <div className="text-body-sm text-on-surface-variant">Dates</div>
                    <div className="font-label-bold text-label-bold text-on-surface">{req.start_date} – {req.end_date}</div>
                    <div className="text-badge font-badge text-on-surface-variant">{req.total_days} Days Total</div>
                  </div>
                  <div>
                    <div className="text-body-sm text-on-surface-variant">Your Net Earning</div>
                    <div className="font-price-md text-price-md text-secondary font-bold">₹{req.rent_fee?.toLocaleString('en-IN')}</div>
                    <div className="text-badge font-badge text-on-surface-variant">Instant Payout</div>
                  </div>
                  <div>
                    <div className="text-body-sm text-on-surface-variant">Held in Escrow</div>
                    <div className="font-label-bold text-label-bold text-on-surface">₹{req.deposit_fee?.toLocaleString('en-IN')}</div>
                    <div className="text-badge font-badge text-secondary">Security Covered</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-space-12 pt-space-4 border-t border-outline-variant/40">
                  <button
                    onClick={() => handleActionRequest(req.id, 'rejected')}
                    className="px-space-16 py-space-8 rounded text-body-sm font-label-bold text-error hover:bg-error-container/20 transition-colors"
                  >
                    Decline Request
                  </button>
                  <button
                    onClick={() => handleActionRequest(req.id, 'active')}
                    className="bg-secondary hover:bg-secondary/90 text-on-secondary px-space-20 py-space-8 rounded font-label-bold flex items-center gap-space-6 shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">done</span>
                    <span>Accept & Share Pickup Slot</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Right Column: Active Ongoing Contracts & Inventory Summary (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-space-16">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Ongoing Rental Contracts</h2>
            <span className="text-body-sm text-secondary font-bold">Live in Escrow</span>
          </div>

          <div className="flex flex-col gap-space-12">
            {contracts.slice(0, 3).map((c) => (
              <div key={c.id} className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-8">
                <div className="flex items-center justify-between">
                  <span className="font-label-bold text-body-sm text-on-surface truncate">{c.product_title}</span>
                  <span className="text-badge font-badge bg-secondary text-on-secondary px-space-6 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                  <span>Renter: <strong className="text-on-surface">{c.renter_name}</strong></span>
                  <span>Return: <strong className="text-on-surface">{c.end_date}</strong></span>
                </div>
                <div className="bg-surface-container-low p-space-8 rounded flex items-center justify-between text-xs">
                  <span className="text-secondary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                    Deposit Held: ₹{c.deposit_fee?.toLocaleString('en-IN')}
                  </span>
                  <span className="font-mono text-on-surface-variant">Handover: Verified</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Inventory Summary Box */}
          <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-12 mt-space-8">
            <div className="flex items-center justify-between">
              <h3 className="font-label-bold text-body-md text-on-surface">Your Listed Inventory ({inventory.length})</h3>
              <button onClick={onOpenAddProduct} className="text-secondary text-body-sm font-label-bold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Item</span>
              </button>
            </div>

            <div className="flex flex-col gap-space-8 max-h-72 overflow-y-auto pr-1">
              {inventory.map(item => (
                <div key={item.id} className="flex items-center justify-between p-space-8 rounded bg-surface-container-low border border-outline-variant/40">
                  <div className="flex items-center gap-space-8 truncate max-w-[70%]">
                    <img src={Array.isArray(item.images) ? item.images[0] : ''} alt={item.title} className="w-10 h-10 rounded object-cover shrink-0" />
                    <div className="truncate">
                      <p className="font-label-bold text-body-sm text-on-surface truncate">{item.title}</p>
                      <p className="text-xs text-on-surface-variant">
                        {item.rent_price_daily > 0 ? `₹${item.rent_price_daily}/day` : `₹${item.sale_price}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleProductStatus(item.id, item.status)}
                    className={`text-xs px-2 py-1 rounded font-bold transition-colors ${
                      item.status === 'active' ? 'bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-container' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {item.status === 'active' ? 'Live' : 'Paused'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
