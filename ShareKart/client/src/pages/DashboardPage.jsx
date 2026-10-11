import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const DashboardPage = ({ initialTab = "overview", params = {}, onNavigate, onOpenAddProduct, onOpenAadhaarVerification, onToast }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(params?.tab || initialTab); // 'overview', 'inventory', 'contracts', 'payouts'

  useEffect(() => {
    if (params?.tab) {
      setActiveTab(params.tab);
    }
  }, [params?.tab]);
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(12800);
  const [upiInput, setUpiInput] = useState("aarav.patel@okhdfcbank");

  // Filters for sub-tabs
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("All");
  const [contractFilter, setContractFilter] = useState("all"); // 'all', 'active', 'pending', 'completed'

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
        api.getContracts(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        if (statsRes.stats?.earnings?.withdrawable) {
          setWithdrawAmount(statsRes.stats.earnings.withdrawable);
        }
      }
      if (reqRes.success) setRequests(reqRes.requests);
      if (invRes.success) setInventory(invRes.inventory);
      if (conRes.success) setContracts(conRes.contracts);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionRequest = async (orderId, status) => {
    try {
      const res = await api.updateRentalStatus(orderId, status);
      if (res.success) {
        onToast && onToast(`Rental request #${orderId} marked as ${status}!`);
        setRequests((prev) => prev.filter((r) => r.id !== orderId));
        loadDashboardData();
      }
    } catch (err) {
      console.error("Action failed", err);
      alert(err.message || "Action failed");
    }
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      const res = await api.updateProduct(productId, { status: newStatus });
      if (res.success) {
        onToast && onToast(`Listing status updated to ${newStatus}`);
        setInventory((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, status: newStatus } : p,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleWithdrawPayout = async () => {
    setWithdrawing(true);
    try {
      const res = await api.withdrawPayout(withdrawAmount, upiInput);
      if (res.success) {
        onToast && onToast(res.message);
        setWithdrawModalOpen(false);
        loadDashboardData();
      }
    } catch (err) {
      console.error("Withdrawal failed", err);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant max-w-6xl mx-auto">
        Loading Seller Hub...
      </div>
    );
  }

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      !inventorySearch ||
      item.title.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesCat =
      inventoryCategory === "All" || item.subcategory?.includes(inventoryCategory);
    return matchesSearch && matchesCat;
  });

  // Filtered contracts
  const filteredContracts = contracts.filter((c) => {
    if (contractFilter === "all") return true;
    return c.status === contractFilter;
  });

  return (
    <div className="w-full flex flex-col gap-space-20 pb-space-48 max-w-7xl mx-auto">
      {/* Seller Hub Navigation & Welcome Bar */}
      <div className="bg-surface-container-lowest p-4 sm:p-space-20 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-space-16">
          <div className="flex flex-col gap-1 sm:gap-space-4">
            <div className="flex items-center gap-2 sm:gap-space-8 flex-wrap">
              <h1 className="font-headline-lg text-lg sm:text-headline-lg text-on-surface font-bold">
                Seller Hub · {user?.name || "Aarav Patel"}
              </h1>
              {user?.is_aadhaar_verified ? (
                <span className="inline-flex items-center gap-1 sm:gap-space-4 bg-secondary-container text-on-secondary-container px-2 sm:px-space-8 py-0.5 rounded text-[10px] sm:text-badge font-badge font-bold">
                  <span className="material-symbols-outlined text-[13px] sm:text-[14px]">
                    verified
                  </span>
                  Aadhaar Verified Merchant
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAadhaarVerification) {
                      onOpenAadhaarVerification("list");
                    } else {
                      onNavigate("aadhaar-ekyc");
                    }
                  }}
                  className="inline-flex items-center gap-1 sm:gap-space-4 bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border border-amber-500/30 px-2 sm:px-space-8 py-0.5 rounded text-[10px] sm:text-badge font-badge font-bold cursor-pointer transition shadow-xs"
                >
                  <span className="material-symbols-outlined text-[13px] sm:text-[14px] text-amber-600">
                    warning
                  </span>
                  Aadhaar Unverified · Verify Now
                </button>
              )}
            </div>
            <p className="text-xs sm:text-body-sm text-on-surface-variant">
              UIDAI e-sign enforced peer rentals, Razorpay Trustee Escrow protection & UPI auto-sweeps.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 sm:gap-space-12 self-stretch sm:self-auto flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                if (!user?.is_aadhaar_verified && onOpenAadhaarVerification) {
                  onOpenAadhaarVerification("list");
                } else {
                  onNavigate("aadhaar-ekyc");
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-secondary text-secondary hover:bg-secondary-container/40 text-xs font-label-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>Aadhaar eKYC</span>
            </button>
            <button
              onClick={onOpenAddProduct}
              className="inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary px-3 sm:px-space-16 py-1.5 rounded text-xs sm:text-label-bold font-label-bold shadow-sm hover:bg-inverse-surface transition-colors whitespace-nowrap cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Add New Product</span>
            </button>
          </div>
        </div>

        {/* Unified Hub Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-outline-variant/40 pt-space-12 text-body-sm font-body-sm scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-label-bold text-xs sm:text-body-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-label-bold text-xs sm:text-body-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "inventory"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            <span>My Inventory</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "inventory" ? "bg-surface-container-high text-primary" : "bg-surface-container text-on-surface-variant"
            }`}>
              {inventory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("contracts")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-label-bold text-xs sm:text-body-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "contracts"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">handshake</span>
            <span>Rental Contracts</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "contracts" ? "bg-surface-container-high text-primary" : "bg-surface-container text-on-surface-variant"
            }`}>
              {contracts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-label-bold text-xs sm:text-body-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "payouts"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            <span>Escrow & Payouts</span>
            <span className="bg-secondary-container text-on-secondary-container px-1.5 py-0.2 rounded text-[10px] font-bold">
              Ready
            </span>
          </button>

          <button
            onClick={() => onNavigate("disputes")}
            className="px-3 sm:px-4 py-2 rounded-lg font-label-bold text-xs sm:text-body-sm flex items-center gap-1.5 text-error hover:bg-error-container/20 transition-colors ml-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            <span>Mediation Center</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-space-24">
          {/* 4 Overview Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-space-16">
            <div className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant text-xs sm:text-body-sm">
                <span className="font-label-bold uppercase">Active Items</span>
                <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
              </div>
              <div className="my-2">
                <div className="text-xl sm:text-2xl lg:text-display-lg text-on-surface font-bold">
                  {stats?.activeInventory?.total || inventory.length} Items
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Live in neighborhood</p>
              </div>
              <button
                onClick={() => setActiveTab("inventory")}
                className="pt-2 text-xs font-label-bold text-secondary hover:underline text-left border-t border-outline-variant/40"
              >
                Manage Inventory →
              </button>
            </div>

            <div className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant text-xs sm:text-body-sm">
                <span className="font-label-bold uppercase">Pending Requests</span>
                <span className="bg-tertiary-fixed text-on-tertiary-fixed text-badge font-badge px-1.5 py-0.5 rounded font-bold">
                  Action
                </span>
              </div>
              <div className="my-2">
                <div className="text-xl sm:text-2xl lg:text-display-lg text-on-surface font-bold">
                  {requests.length} Pending
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Needs confirmation</p>
              </div>
              <div className="pt-2 text-xs text-on-surface-variant border-t border-outline-variant/40">
                Aadhaar verified renters
              </div>
            </div>

            <div className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant text-xs sm:text-body-sm">
                <span className="font-label-bold uppercase">Live Contracts</span>
                <span className="material-symbols-outlined text-secondary text-[20px]">handshake</span>
              </div>
              <div className="my-2">
                <div className="text-xl sm:text-2xl lg:text-display-lg text-on-surface font-bold">
                  {contracts.length} Out
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Deposits locked in escrow</p>
              </div>
              <button
                onClick={() => setActiveTab("contracts")}
                className="pt-2 text-xs font-label-bold text-secondary hover:underline text-left border-t border-outline-variant/40"
              >
                View Contracts →
              </button>
            </div>

            <div className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant text-xs sm:text-body-sm">
                <span className="font-label-bold uppercase">Withdrawable</span>
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
              </div>
              <div className="my-2">
                <div className="text-xl sm:text-2xl lg:text-display-lg text-on-surface font-bold">
                  ₹{stats?.earnings?.withdrawable?.toLocaleString("en-IN") || "12,800"}
                </div>
                <p className="text-xs text-secondary font-bold mt-1">Ready for UPI sweep</p>
              </div>
              <button
                onClick={() => setWithdrawModalOpen(true)}
                className="pt-2 text-xs font-label-bold text-primary hover:text-secondary flex items-center justify-between border-t border-outline-variant/40"
              >
                <span>Instant Payout</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Pending Rental Requests Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24">
            <section className="lg:col-span-7 flex flex-col gap-space-16">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-8">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    Pending Rental Requests
                  </h2>
                  <span className="w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs flex items-center justify-center font-bold">
                    {requests.length}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant">Aadhaar verified renters only</span>
              </div>

              {requests.length === 0 ? (
                <div className="bg-surface-container-lowest p-space-24 rounded-xl border border-outline-variant/60 text-center text-on-surface-variant">
                  No pending requests right now. All bookings are up to date!
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-16 border border-outline-variant/60 shadow-sm flex flex-col gap-space-12"
                  >
                    <div className="flex flex-col sm:flex-row gap-space-16">
                      <img
                        src={Array.isArray(req.product_images) ? req.product_images[0] : ""}
                        alt={req.product_title}
                        className="w-full sm:w-20 h-20 object-cover rounded-lg bg-surface-container shrink-0"
                      />
                      <div className="flex flex-col justify-between w-full min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-space-8">
                            <h3 className="font-headline-sm text-sm sm:text-headline-sm text-on-surface font-bold truncate">
                              {req.product_title}
                            </h3>
                            <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-badge font-badge rounded uppercase">
                              {req.order_type}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            Renter: <strong className="text-on-surface">{req.renter_name}</strong> · 📍 Gandhinagar
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs mt-2 bg-surface-container-low p-2 rounded">
                          <span>{req.start_date} – {req.end_date} ({req.total_days} Days)</span>
                          <span className="font-price-md text-secondary font-bold">Net: ₹{req.rent_fee?.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-space-8 pt-2 border-t border-outline-variant/40">
                      <button
                        onClick={() => handleActionRequest(req.id, "rejected")}
                        className="px-3 py-1.5 rounded text-xs font-label-bold text-error hover:bg-error-container/20 cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleActionRequest(req.id, "active")}
                        className="bg-secondary hover:bg-secondary/90 text-on-secondary px-4 py-1.5 rounded text-xs font-label-bold flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">done</span>
                        <span>Accept & Share Pickup Pass</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Quick Ongoing Contracts Column */}
            <section className="lg:col-span-5 flex flex-col gap-space-16">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Ongoing Rental Agreements
                </h2>
                <span className="text-xs text-secondary font-bold">Live Escrow</span>
              </div>

              <div className="flex flex-col gap-space-12">
                {contracts.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-bold text-body-sm text-on-surface truncate font-bold">
                        {c.product_title}
                      </span>
                      <span className="text-badge font-badge bg-secondary text-on-secondary px-2 py-0.5 rounded">
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span>Renter: <strong className="text-on-surface">{c.renter_name}</strong></span>
                      <span>Return: <strong className="text-on-surface">{c.end_date}</strong></span>
                    </div>
                    <div className="bg-surface-container-low p-2 rounded flex items-center justify-between text-xs mt-1">
                      <span className="text-secondary font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">shield</span>
                        Deposit: ₹{c.deposit_fee?.toLocaleString("en-IN")}
                      </span>
                      <span className="font-mono text-on-surface-variant">e-Sign: Enforced</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: MY INVENTORY (From phase3/sharekart_seller_my_inventory) */}
      {activeTab === "inventory" && (
        <div className="flex flex-col gap-space-20">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-space-12">
            <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm border border-outline-variant/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Active Listings</span>
                <div className="text-2xl font-bold text-on-surface mt-1">{inventory.filter(i => i.status === 'active').length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">storefront</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm border border-outline-variant/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Currently on Rent</span>
                <div className="text-2xl font-bold text-on-surface mt-1">{contracts.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">sync_alt</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm border border-outline-variant/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Permanent Sale</span>
                <div className="text-2xl font-bold text-on-surface mt-1">2</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">sell</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm border border-outline-variant/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Inspection Pass</span>
                <div className="text-2xl font-bold text-secondary mt-1">100%</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm border border-outline-variant/60 flex flex-col md:flex-row items-center gap-space-12 justify-between">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search item title, serial number, tag..."
                className="w-full bg-surface-container-low pl-10 pr-space-12 py-2 rounded-xl text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={onOpenAddProduct}
                className="bg-secondary text-on-secondary px-space-16 py-2 rounded-xl text-xs sm:text-label-bold font-label-bold shadow-sm hover:bg-secondary/90 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>List New Item</span>
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/60">
                  <tr>
                    <th className="p-space-12">Product</th>
                    <th className="p-space-12">Type</th>
                    <th className="p-space-12">Pricing / Deposit</th>
                    <th className="p-space-12">Condition</th>
                    <th className="p-space-12">Status</th>
                    <th className="p-space-12 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="p-space-12">
                        <div className="flex items-center gap-space-12">
                          <img
                            src={Array.isArray(item.images) ? item.images[0] : ""}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-surface-container shrink-0 border border-outline-variant"
                          />
                          <div className="min-w-0">
                            <p className="font-label-bold text-on-surface truncate max-w-xs font-bold">{item.title}</p>
                            <p className="text-xs text-on-surface-variant font-mono">{item.serial_number || "S/N: 4729188-IN"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-space-12">
                        <span className="bg-surface-container px-2 py-0.5 rounded text-badge font-badge uppercase font-bold text-on-surface">
                          {item.transaction_type}
                        </span>
                      </td>
                      <td className="p-space-12">
                        <div className="flex flex-col">
                          <span className="font-label-bold text-on-surface">
                            {item.rent_price_daily > 0 ? `₹${item.rent_price_daily}/day` : `₹${item.sale_price}`}
                          </span>
                          <span className="text-[11px] text-secondary font-bold">
                            Dep: ₹{item.security_deposit || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-space-12">
                        <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                          <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
                          {item.condition_tag || "Used - Pristine"}
                        </span>
                      </td>
                      <td className="p-space-12">
                        <span className={`px-2 py-0.5 rounded-full text-badge font-badge uppercase font-bold ${
                          item.status === "active" ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-on-surface-variant"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-space-12 text-right">
                        <button
                          onClick={() => handleToggleProductStatus(item.id, item.status)}
                          className={`text-xs px-3 py-1 rounded font-bold transition-colors cursor-pointer ${
                            item.status === "active"
                              ? "bg-surface-container hover:bg-surface-container-high text-on-surface"
                              : "bg-secondary text-on-secondary hover:bg-secondary/90"
                          }`}
                        >
                          {item.status === "active" ? "Pause" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RENTAL CONTRACTS (From phase3/sharekart_seller_rental_contracts) */}
      {activeTab === "contracts" && (
        <div className="flex flex-col gap-space-20">
          {/* Contracts Metric Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-16">
            <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Deposits in Escrow</span>
                <div className="text-2xl font-bold text-on-surface mt-1">₹5,000</div>
                <span className="text-[11px] text-secondary font-bold flex items-center gap-0.5 mt-1">
                  <span className="material-symbols-outlined text-[13px]">lock</span> Razorpay Trustee Vault
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Dispute-Free Rate</span>
                <div className="text-2xl font-bold text-on-surface mt-1">100%</div>
                <span className="text-[11px] text-secondary font-bold flex items-center gap-0.5 mt-1">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span> Zero Mediation Claims
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-secondary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">thumb_up</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Avg Rental Tenure</span>
                <div className="text-2xl font-bold text-on-surface mt-1">3.2 Days</div>
                <span className="text-[11px] text-on-surface-variant mt-1 block">Return Punctuality: 99.2%</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">calendar_month</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-space-12 bg-surface-container-lowest p-space-12 rounded-xl border border-outline-variant/60 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setContractFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-label-bold cursor-pointer ${
                  contractFilter === "all" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                All Contracts ({contracts.length})
              </button>
              <button
                onClick={() => setContractFilter("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-label-bold cursor-pointer ${
                  contractFilter === "active" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setContractFilter("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-label-bold cursor-pointer ${
                  contractFilter === "completed" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Completed
              </button>
            </div>
            <button
              onClick={() => onToast && onToast("Digital peer audit ledger exported successfully.")}
              className="text-xs font-label-bold text-primary hover:text-secondary flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Download Audit Ledger</span>
            </button>
          </div>

          {/* Contracts List */}
          <div className="flex flex-col gap-space-16">
            {filteredContracts.map((c) => (
              <div
                key={c.id}
                className="bg-surface-container-lowest rounded-xl p-4 sm:p-space-20 border border-outline-variant/60 shadow-sm flex flex-col gap-space-12"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/40 pb-space-12">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">#{c.id}</span>
                    <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-badge font-badge">
                      UIDAI e-Sign Enforced
                    </span>
                    <span className="text-xs text-on-surface-variant">Indian Contract Act 1872 Compliant</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-badge font-badge uppercase font-bold bg-secondary text-on-secondary self-start sm:self-auto">
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-space-12 bg-surface-container-low p-space-12 rounded-lg text-xs sm:text-body-sm">
                  <div>
                    <span className="text-on-surface-variant block text-[11px]">Product</span>
                    <span className="font-label-bold text-on-surface font-bold">{c.product_title}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block text-[11px]">Renter (Borrower)</span>
                    <span className="font-label-bold text-on-surface font-bold">{c.renter_name}</span>
                    <span className="text-[10px] text-secondary font-bold block">Aadhaar Verified</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block text-[11px]">Rental Window</span>
                    <span className="font-label-bold text-on-surface">{c.start_date} – {c.end_date}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block text-[11px]">Deposit in Escrow</span>
                    <span className="font-price-md text-secondary font-bold">₹{c.deposit_fee?.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-space-8 pt-1">
                  <button
                    onClick={() =>
                      onNavigate("return-pass", {
                        bookingId: c.id,
                        title: c.product_title,
                        deposit_fee: c.deposit_fee,
                      })
                    }
                    className="px-3 py-1.5 rounded text-xs font-label-bold text-secondary hover:bg-secondary-container/30 border border-secondary transition-colors cursor-pointer"
                  >
                    Initiate Return & Refund Check
                  </button>
                  <button
                    onClick={() =>
                      onNavigate("handover-pass", {
                        bookingId: c.id,
                        title: c.product_title,
                        escrow_pin: c.escrow_pin,
                      })
                    }
                    className="bg-primary text-on-primary px-4 py-1.5 rounded text-xs font-label-bold hover:bg-inverse-surface transition-colors cursor-pointer"
                  >
                    View Handover Pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ESCROW & PAYOUTS (From phase3/sharekart_seller_escrow_payouts) */}
      {activeTab === "payouts" && (
        <div className="flex flex-col gap-space-20">
          {/* 4 Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-16">
            <div className="bg-surface-container-lowest p-space-20 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Withdrawable Balance</span>
                <div className="text-3xl font-bold text-on-surface mt-1">
                  ₹{stats?.earnings?.withdrawable?.toLocaleString("en-IN") || "12,800"}
                </div>
                <p className="text-xs text-secondary font-bold mt-1">Ready for auto-sweep</p>
              </div>
              <button
                onClick={() => setWithdrawModalOpen(true)}
                className="mt-4 w-full bg-secondary hover:bg-secondary/90 text-on-secondary py-2 rounded text-xs font-label-bold shadow-sm transition-colors cursor-pointer"
              >
                Instant Withdraw to UPI
              </button>
            </div>

            <div className="bg-surface-container-lowest p-space-20 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Escrow Under Custody</span>
                <div className="text-3xl font-bold text-on-surface mt-1">₹5,000</div>
                <p className="text-xs text-on-surface-variant mt-1">Locked across 2 active rentals</p>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs text-secondary font-bold">
                <span>Safe Trustee Hold</span>
                <span>Axis Trustee Protected</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-20 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Lifetime Earnings</span>
                <div className="text-3xl font-bold text-on-surface mt-1">₹42,650</div>
                <p className="text-xs text-on-surface-variant mt-1">From 38 successful rentals</p>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant/40 text-xs text-on-surface-variant">
                +18% MoM in Sector 7
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-20 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">Default Sweep Account</span>
                <div className="font-mono text-sm font-bold text-on-surface mt-1 truncate">
                  aarav.patel@okhdfcbank
                </div>
                <p className="text-xs text-secondary font-bold mt-1">NPCI UPI 2.0 Active</p>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant/40 text-xs text-on-surface-variant flex items-center justify-between">
                <span>Payout SLA:</span>
                <span className="font-bold text-on-surface">T+15 Mins</span>
              </div>
            </div>
          </div>

          {/* Escrow Release Cycle Flowchart */}
          <div className="bg-surface-container-lowest p-space-20 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-12">
            <h3 className="font-headline-sm text-base text-on-surface font-bold">
              Escrow Protection & Release Lifecycle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-12 text-xs">
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
                <span className="font-bold text-primary block mb-1">1. Booking Confirmed</span>
                <span className="text-on-surface-variant">Borrower pays rent + deposit. Funds held in Axis Trustee Escrow account.</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
                <span className="font-bold text-primary block mb-1">2. Handover Check</span>
                <span className="text-on-surface-variant">Both parties verify pre-rental condition via 6-digit OTP pass.</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
                <span className="font-bold text-primary block mb-1">3. Return Inspection</span>
                <span className="text-on-surface-variant">4-point damage check signed off on mutual agreement.</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-secondary/50">
                <span className="font-bold text-secondary block mb-1">4. Instant Settlement</span>
                <span className="text-on-surface-variant">Deposit unlocked to borrower, net earnings swept to your UPI.</span>
              </div>
            </div>
          </div>

          {/* Settlement History Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/60 overflow-hidden">
            <div className="p-space-16 border-b border-outline-variant/60 flex items-center justify-between">
              <h3 className="font-headline-sm text-base text-on-surface font-bold">
                Settlement History Ledger
              </h3>
              <span className="text-xs text-on-surface-variant">RBI Regulated Escrow Rails</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low text-xs text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="p-space-12">UTR Reference</th>
                    <th className="p-space-12">Order</th>
                    <th className="p-space-12">Date</th>
                    <th className="p-space-12">Gross</th>
                    <th className="p-space-12">Platform Fee</th>
                    <th className="p-space-12">Net Swept</th>
                    <th className="p-space-12">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-xs sm:text-body-sm">
                  <tr className="hover:bg-surface-container-low/40">
                    <td className="p-space-12 font-mono font-bold text-secondary">UPI-982410982341</td>
                    <td className="p-space-12">SK-8921 (Sony Kit)</td>
                    <td className="p-space-12">18 Mar 2025</td>
                    <td className="p-space-12">₹2,550</td>
                    <td className="p-space-12">-₹99</td>
                    <td className="p-space-12 font-bold text-on-surface">₹2,451</td>
                    <td className="p-space-12"><span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold">SETTLED</span></td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/40">
                    <td className="p-space-12 font-mono font-bold text-secondary">UPI-871920817293</td>
                    <td className="p-space-12">SK-7740 (DJI Drone)</td>
                    <td className="p-space-12">15 Mar 2025</td>
                    <td className="p-space-12">₹3,900</td>
                    <td className="p-space-12">-₹99</td>
                    <td className="p-space-12 font-bold text-on-surface">₹3,801</td>
                    <td className="p-space-12"><span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold">SETTLED</span></td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/40">
                    <td className="p-space-12 font-mono font-bold text-secondary">UPI-661902819283</td>
                    <td className="p-space-12">SK-6510 (Bosch Drill)</td>
                    <td className="p-space-12">12 Mar 2025</td>
                    <td className="p-space-12">₹1,200</td>
                    <td className="p-space-12">-₹49</td>
                    <td className="p-space-12 font-bold text-on-surface">₹1,151</td>
                    <td className="p-space-12"><span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold">SETTLED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Instant Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant flex flex-col gap-space-16 animate-scaleIn">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-base text-on-surface font-bold">
                Instant UPI Payout Sweep
              </h3>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant">Withdrawal Amount (₹)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg font-headline-sm text-on-surface font-bold border border-outline-variant"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant">Target UPI Handle (Verified)</label>
              <input
                type="text"
                value={upiInput}
                onChange={(e) => setUpiInput(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg font-mono text-sm font-bold text-on-surface border border-outline-variant"
              />
            </div>

            <div className="p-space-12 bg-surface-container rounded-lg text-xs text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
              <span>NPCI Real-time settlement rails with zero transaction fee.</span>
            </div>

            <button
              onClick={handleWithdrawPayout}
              disabled={withdrawing}
              className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary py-2.5 rounded-lg font-label-bold text-body-sm shadow-sm transition-colors cursor-pointer"
            >
              {withdrawing ? "Processing Sweep..." : `Confirm & Sweep ₹${withdrawAmount.toLocaleString("en-IN")}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
