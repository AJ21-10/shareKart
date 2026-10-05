import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const DisputeMediationPage = ({ onNavigate, onToast }) => {
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'damage', 'delay'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.getDisputes();
      if (res.success) {
        setDisputes(res.disputes);
        if (res.disputes.length > 0) {
          setSelectedDispute(res.disputes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load disputes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (actionType) => {
    if (!selectedDispute) return;
    setActionLoading(true);
    try {
      const res = await api.resolveDispute(selectedDispute.id, actionType, `Settled via arbitration: ${actionType}`);
      if (res.success) {
        onToast && onToast(res.message);
        setDisputes(prev =>
          prev.map(d => (d.id === selectedDispute.id ? { ...d, status: 'resolved' } : d))
        );
        setSelectedDispute(prev => ({ ...prev, status: 'resolved' }));
      }
    } catch (err) {
      console.error('Resolution failed', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDisputes = disputes.filter(d => {
    if (filter === 'all') return true;
    return d.issue_type === filter;
  });

  const activeCount = disputes.filter(d => d.status === 'active').length;
  const lockedEscrow = disputes
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + (d.deposit_amount || 0), 0);

  return (
    <div className="w-full flex flex-col gap-space-24 pb-space-48 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-12 pb-space-8 bg-surface-container-lowest p-4 sm:p-space-20 rounded-xl border border-outline-variant/60 shadow-sm">
        <div className="flex items-center gap-space-12">
          <div className="p-space-8 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[24px]">gavel</span>
          </div>
          <div>
            <div className="flex items-center gap-space-8">
              <span className="font-headline-md text-lg sm:text-headline-md tracking-tight font-bold text-on-surface">
                Mediation & Damage Center
              </span>
              <span className="bg-secondary text-on-secondary px-space-6 py-0.5 rounded text-badge font-badge uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse"></span>
                Live Escrow
              </span>
            </div>
            <p className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant">
              Arbitration desk for Aadhaar-verified rental claims and deposit settlements under Indian Contract Act 1872
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-8 self-end sm:self-auto">
          <div className="hidden md:flex items-center bg-surface-container-high px-space-8 py-space-4 rounded text-body-sm font-body-sm text-on-surface-variant gap-space-4">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>SLA Target: &lt; 6.0 hrs</span>
          </div>
          <button
            onClick={loadDisputes}
            className="flex items-center gap-space-4 bg-primary text-on-primary px-space-12 py-space-6 rounded shadow-sm text-label-bold font-label-bold hover:bg-inverse-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Sync Queue</span>
          </button>
        </div>
      </div>

      {/* 4 Overview Bento Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-space-16">
        <div className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl shadow-sm border border-outline-variant/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-space-8">
            <span className="font-label-bold text-xs sm:text-label-bold uppercase">Active Claims</span>
            <span className="p-1 bg-error-container text-on-error-container rounded">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </span>
          </div>
          <div className="flex items-baseline gap-space-8">
            <span className="font-display-lg text-2xl sm:text-display-lg font-bold text-on-surface leading-none">{activeCount}</span>
            <span className="text-[10px] sm:text-badge font-badge text-error bg-error-container/60 px-space-4 py-0.5 rounded">High Priority</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-12 overflow-hidden">
            <div className="bg-error h-full rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl shadow-sm border border-outline-variant/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-space-8">
            <span className="font-label-bold text-xs sm:text-label-bold uppercase">Escrow On Hold</span>
            <span className="p-1 bg-surface-container-highest text-primary rounded">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </span>
          </div>
          <div className="flex items-baseline gap-space-8">
            <span className="font-display-lg text-2xl sm:text-display-lg font-bold text-on-surface leading-none">₹{lockedEscrow.toLocaleString('en-IN') || '18,400'}</span>
            <span className="text-[10px] sm:text-badge font-badge text-secondary bg-secondary-container/50 px-space-4 py-0.5 rounded">Locked</span>
          </div>
          <p className="font-body-sm text-[11px] sm:text-body-sm text-on-surface-variant mt-space-8 truncate">
            {activeCount} rental security pools locked
          </p>
        </div>

        <div className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl shadow-sm border border-outline-variant/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-space-8">
            <span className="font-label-bold text-xs sm:text-label-bold uppercase">Resolved Today</span>
            <span className="p-1 bg-secondary-container text-on-secondary-container rounded">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </span>
          </div>
          <div className="flex items-baseline gap-space-8">
            <span className="font-display-lg text-2xl sm:text-display-lg font-bold text-on-surface leading-none">7</span>
            <span className="text-[10px] sm:text-badge font-badge text-secondary font-bold">+2 today</span>
          </div>
          <p className="font-body-sm text-[11px] sm:text-body-sm text-on-surface-variant mt-space-8 truncate">
            ₹54,200 disbursed seamlessly
          </p>
        </div>

        <div className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl shadow-sm border border-outline-variant/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-space-8">
            <span className="font-label-bold text-xs sm:text-label-bold uppercase">Avg Resolution</span>
            <span className="p-1 bg-surface-container text-primary rounded">
              <span className="material-symbols-outlined text-[18px]">timelapse</span>
            </span>
          </div>
          <div className="flex items-baseline gap-space-8">
            <span className="font-display-lg text-2xl sm:text-display-lg font-bold text-on-surface leading-none">
              4.2<span className="font-headline-sm text-sm font-normal text-on-surface-variant ml-1">hrs</span>
            </span>
            <span className="text-[10px] sm:text-badge font-badge text-secondary bg-secondary-container/50 px-space-4 py-0.5 rounded">-28m SLA</span>
          </div>
          <p className="font-body-sm text-[11px] sm:text-body-sm text-on-surface-variant mt-space-8 truncate">
            Top tier tier-1 speed
          </p>
        </div>
      </section>

      {/* Main 2-Column: Left Queue (4 cols) & Right Dispute Details (8 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-24 items-start">
        {/* Left: Queue Column */}
        <div className="xl:col-span-4 flex flex-col gap-space-16">
          <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm border border-outline-variant/60">
            <div className="flex items-center justify-between pb-space-12 border-b border-outline-variant/40">
              <div className="flex items-center gap-space-8">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Queue</span>
                <span className="bg-primary text-on-primary text-badge font-badge rounded-full px-2 py-0.5">
                  {filteredDisputes.length}
                </span>
              </div>
              <div className="flex items-center gap-space-4 bg-surface-container-low px-1.5 py-1 rounded">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2 py-0.5 rounded text-badge font-badge cursor-pointer ${
                    filter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('damage')}
                  className={`px-2 py-0.5 rounded text-badge font-badge cursor-pointer ${
                    filter === 'damage' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Damage
                </button>
                <button
                  onClick={() => setFilter('delay')}
                  className={`px-2 py-0.5 rounded text-badge font-badge cursor-pointer ${
                    filter === 'delay' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Delay
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-space-8 mt-space-12">
              {filteredDisputes.map(d => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDispute(d)}
                  className={`p-space-12 rounded-lg border transition-all cursor-pointer ${
                    selectedDispute?.id === d.id
                      ? 'bg-surface-container-high border-primary shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/40 hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between text-badge font-badge mb-1">
                    <span className={`font-bold flex items-center gap-1 ${d.status === 'active' ? 'text-error' : 'text-secondary'}`}>
                      <span className={`w-2 h-2 rounded-full ${d.status === 'active' ? 'bg-error animate-pulse' : 'bg-secondary'}`}></span>
                      #{d.id}
                    </span>
                    <span className="text-on-surface-variant text-[11px]">{d.status === 'active' ? 'Under Review' : 'Resolved'}</span>
                  </div>
                  <p className="font-label-bold text-label-bold text-on-surface line-clamp-1">{d.product_title}</p>
                  <div className="flex items-center justify-between mt-space-8 pt-space-6 text-body-sm font-body-sm border-t border-outline-variant/30">
                    <span className="text-on-surface-variant text-xs">Deposit ₹{d.deposit_amount?.toLocaleString('en-IN')}</span>
                    <span className="text-badge font-badge bg-error-container text-on-error-container px-space-6 py-0.5 rounded">
                      {d.tag_label || 'Damage Claim'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Inspection & Resolution Workspace (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-space-20">
          {selectedDispute ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 sm:p-space-24 border border-outline-variant/60 flex flex-col gap-space-20">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-12 pb-space-16 border-b border-outline-variant/50">
                <div>
                  <div className="flex items-center gap-space-8 flex-wrap">
                    <span className="font-mono text-sm font-bold text-primary">#{selectedDispute.id}</span>
                    <span className="text-badge font-badge bg-error-container text-on-error-container px-2 py-0.5 rounded uppercase">
                      {selectedDispute.issue_type} Claim
                    </span>
                    <span className="text-xs text-on-surface-variant">Order: {selectedDispute.rental_id}</span>
                  </div>
                  <h2 className="font-headline-lg text-lg sm:text-headline-lg text-on-surface font-bold mt-1">
                    {selectedDispute.product_title}
                  </h2>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-on-surface-variant">Claimed Deduction</span>
                  <span className="font-price-lg text-xl sm:text-price-lg text-error font-bold">
                    ₹{selectedDispute.claim_amount?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Out of ₹{selectedDispute.deposit_amount?.toLocaleString('en-IN')} deposit
                  </span>
                </div>
              </div>

              {/* Complainant vs Respondent Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-12 bg-surface-container-low p-space-12 rounded-lg text-xs sm:text-body-sm">
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Claimant (Lender):</span>
                  <span className="font-label-bold text-on-surface">{selectedDispute.complainant_name}</span>
                  <span className="inline-flex items-center text-secondary text-[11px] ml-2 gap-0.5">
                    <span className="material-symbols-outlined text-[13px]">verified</span> UIDAI Verified
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Respondent (Borrower):</span>
                  <span className="font-label-bold text-on-surface">{selectedDispute.respondent_name}</span>
                  <span className="inline-flex items-center text-secondary text-[11px] ml-2 gap-0.5">
                    <span className="material-symbols-outlined text-[13px]">verified</span> UIDAI Verified
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <h4 className="font-label-bold text-body-sm text-on-surface font-bold">Claim Description & Incident Report:</h4>
                <p className="text-body-sm text-on-surface-variant bg-surface-container-low p-space-12 rounded-lg leading-relaxed">
                  {selectedDispute.description}
                </p>
              </div>

              {/* Before vs After Photo Comparator */}
              <div className="flex flex-col gap-space-8">
                <h4 className="font-label-bold text-body-sm text-on-surface font-bold">
                  Physical Evidence Comparison (Handover vs Return):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-12">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-label-bold text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span> Pre-Handover Condition (Clean)
                    </span>
                    <div className="h-48 rounded-lg overflow-hidden bg-surface-container border border-outline-variant relative">
                      <img
                        src={selectedDispute.pre_photo || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJuVk0Mn9nqPYFFxnpzjkRcI4YyPZj5gKTHyZWs9SyKECUDzXQnUHHtpIdD-zWTQKZogYKBVmSWL-GKl8UbLgijQzxPKuIcoJoQDV0_mZtHO-At7TNYwLqQEMw2pUQhGb8BvU_RiMLhvuoYUlJDBiE_RKlIuXp2nO2rXWb9avP9kHs1Nf24F0CxtifMEzfUqbIzUOt_ixhrYKApO7FDfBQhSnNE4WcmGWlWTVwg2WxaRlNsoD7D-wA9w'}
                        alt="Pre-handover"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-primary/80 text-on-primary text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                        DISPATCH LOG #SK-1
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-label-bold text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">warning</span> Return Inspection Condition (Discrepancy)
                    </span>
                    <div className="h-48 rounded-lg overflow-hidden bg-surface-container border border-error/50 relative">
                      <img
                        src={selectedDispute.post_photo || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0o1wRu8b1ZCCeHxHdRz5zq7CqayMAXYVKJmyz8zfHIrG_zai1vEVoGfjzIbFdytTovBIUYdRtGRRO_dM4zoUVXuEMA2gwmZDAm2xKln_p9qrJWUnbU_1XkUGBEbJtnLNHP7JLA2jWmXqLoN7erZGk0uKXH8AI7lYpBo2djHB4o9xi31rKYrmCW1WQHdg97lsGiRhE8IJO4eCT_a220-4TJSknKeMSqsP204eXiGhP40bus-2MnCN-Cg'}
                        alt="Post-handover"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-error/90 text-on-error text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                        RETURN LOG #SK-2
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escrow Arbitration Settlement Panel */}
              <div className="bg-surface-container-low p-4 sm:p-space-16 rounded-xl border border-outline-variant/60 flex flex-col gap-space-12">
                <div className="flex items-center justify-between">
                  <span className="font-label-bold text-body-sm text-on-surface">Escrow Settlement Rails</span>
                  <span className="text-badge font-badge text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span> Axis Trustee Escrow Protected
                  </span>
                </div>

                {selectedDispute.status === 'resolved' ? (
                  <div className="bg-secondary-container/40 border border-secondary p-space-12 rounded-lg flex items-center gap-space-8 text-secondary font-label-bold text-body-sm">
                    <span className="material-symbols-outlined text-[20px]">task_alt</span>
                    <span>This dispute has been arbitrated and settled. Escrow funds disbursed per mutual confirmation.</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-space-8 pt-2">
                    <button
                      onClick={() => handleResolve('full_refund_to_renter')}
                      disabled={actionLoading}
                      className="px-space-16 py-space-8 rounded font-label-bold text-xs sm:text-body-sm border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer text-center"
                    >
                      Release Full Deposit to Borrower
                    </button>
                    <button
                      onClick={() => handleResolve('deduct_claim_to_lender')}
                      disabled={actionLoading}
                      className="bg-secondary hover:bg-secondary/90 text-on-secondary px-space-16 py-space-8 rounded font-label-bold text-xs sm:text-body-sm shadow-sm transition-colors cursor-pointer text-center"
                    >
                      Deduct ₹{selectedDispute.claim_amount?.toLocaleString('en-IN')} Claim to Lender
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-16 text-center text-on-surface-variant border border-outline-variant">
              Select a dispute claim from the queue to review evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
