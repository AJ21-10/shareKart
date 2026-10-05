import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PublicTrustProfilePage = ({ userId, onNavigate, onToast }) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getUserProfile(userId || currentUser?.id || 1);
      if (res.success) {
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    onToast && onToast('Profile link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant max-w-5xl mx-auto">
        Loading verified public trust profile...
      </div>
    );
  }

  const p = profile || {
    name: currentUser?.name || 'Aarav Patel',
    avatar_url: currentUser?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB545f6ceGmox7wT32Fww8WeepCos-Gc28aQMjSouhaEb6Ww_eJ3i1rjONcK0h9q-ZuPcSGTO4lnll9Ty3EbYhBUn8TjVVJ2U9dLolJIrafUZySH4QPEuh7vqZRVc-Fdfv6TEH45cHms9CiVRYXZVzfQlO0NQJ0WMJZcUMHxsW39Yho2r4T_wh2WGmHew8paWqYAXiHti3Nukk9p66xn7eOVR-1K76oPa-86XoDwC_xOa28FqIuPdS8og',
    aadhaar_hash: currentUser?.aadhaar_hash || '#OK-82914',
    rating: 4.9,
    reviews_count: 84,
    location: currentUser?.location || 'Gandhinagar Sector 7, Gujarat',
    member_since: 'Jan 2023',
    trustStats: {
      score: 99.8,
      disputeFreeRate: '100%',
      completedRentals: 84,
      onTimeReturnRate: '100%',
      tierLevel: 'Level 3 Super Lender'
    },
    inventory: [],
    reviews: []
  };

  return (
    <div className="w-full flex flex-col gap-space-24 pb-space-48 max-w-6xl mx-auto">
      {/* Top Bio & Credential Section */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-16 items-stretch">
          {/* Primary Bio Card (8 cols) */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-4 sm:p-space-24 shadow-sm border border-outline-variant/60 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-20 mb-space-20">
                <div className="relative shrink-0">
                  <img
                    src={p.avatar_url}
                    alt={p.name}
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl object-cover shadow-sm border-2 border-secondary"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary rounded-lg px-space-6 py-0.5 flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[13px]">verified_user</span>
                    <span className="font-badge text-[10px] tracking-wider uppercase">eKYC</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-space-8 mb-space-4">
                    <h1 className="font-headline-lg text-xl sm:text-headline-lg text-on-surface font-bold truncate">
                      {p.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-space-8 py-1 rounded-lg font-label-bold text-xs sm:text-label-bold">
                      <span className="material-symbols-outlined text-[15px]">shield</span>
                      Aadhaar Verified
                    </span>
                    <span className="bg-surface-container-high text-on-surface-variant font-label-bold text-xs sm:text-label-bold px-space-8 py-1 rounded-lg">
                      {p.trustStats?.tierLevel || 'Level 3 Super Lender'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-space-16 gap-y-1 text-on-surface-variant text-xs sm:text-body-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">star</span>
                      <span className="font-label-bold text-on-surface">{p.rating || 4.9}</span>
                      <span>({p.reviews_count || 84} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
                      <span>{p.location || 'Gandhinagar, Gujarat'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      <span>Member since {p.member_since || 'Jan 2023'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Trust Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-space-8 py-space-12 my-space-8 bg-surface-container-low rounded-lg px-2 sm:px-space-12">
                <div className="flex items-center gap-2 sm:gap-space-8">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-bold text-xs sm:text-label-bold text-on-surface leading-tight">100%</p>
                    <p className="text-[11px] text-on-surface-variant truncate">On-Time Returns</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-space-8">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-bold text-xs sm:text-label-bold text-on-surface leading-tight">UIDAI</p>
                    <p className="text-[11px] text-on-surface-variant truncate">Aadhaar eKYC</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-space-8">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-tertiary-container shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-bold text-xs sm:text-label-bold text-on-surface leading-tight">Top 1%</p>
                    <p className="text-[11px] text-on-surface-variant truncate">Local Lender</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-space-8">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-bold text-xs sm:text-label-bold text-on-surface leading-tight">0 Disputes</p>
                    <p className="text-[11px] text-on-surface-variant truncate">Clean Record</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-space-12 pt-space-16 mt-space-8 border-t border-outline-variant/40">
              <div className="flex items-center gap-space-12">
                <button
                  onClick={() => onNavigate('chat')}
                  className="bg-primary text-on-primary hover:bg-inverse-surface px-space-20 py-space-8 rounded-lg font-label-bold text-xs sm:text-label-bold flex items-center gap-space-6 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Message Lender</span>
                </button>
                <button
                  onClick={handleShare}
                  className="bg-surface-container-high text-on-surface hover:bg-surface-container px-space-16 py-space-8 rounded-lg font-label-bold text-xs sm:text-label-bold flex items-center gap-space-6 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  <span>{copied ? 'Copied!' : 'Share Profile'}</span>
                </button>
              </div>
              <div className="flex items-center gap-space-6 text-on-surface-variant text-xs sm:text-body-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span>Active in Sector 7 now</span>
              </div>
            </div>
          </div>

          {/* Right Escrow Assurance Card (4 cols) */}
          <div className="lg:col-span-4 bg-primary-container text-on-primary rounded-xl p-4 sm:p-space-24 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-space-16">
                <span className="text-secondary-fixed font-badge text-badge tracking-wider uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Sharekart TrustNet
                </span>
                <span className="bg-surface-container-low/20 text-secondary-fixed text-badge font-badge px-space-8 py-0.5 rounded">
                  Grade A+
                </span>
              </div>
              <h2 className="font-headline-md text-base sm:text-headline-md text-on-primary mb-space-8 font-bold">
                100% Escrow Backed
              </h2>
              <p className="font-body-sm text-xs sm:text-body-sm text-surface-container-highest/80 mb-space-20">
                Security deposits stay safely secured in Razorpay Trustee Escrow until both parties confirm item inspection condition via OTP.
              </p>

              {/* Progress Donut */}
              <div className="bg-primary/40 rounded-xl p-space-12 flex items-center gap-space-16">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-surface-container-high/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                    <path className="text-secondary-fixed" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="99.8, 100" strokeLinecap="round" strokeWidth="3.5"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-label-bold text-xs text-secondary-fixed">
                    99.8%
                  </div>
                </div>
                <div>
                  <p className="font-label-bold text-body-sm text-on-primary font-bold">Dispute-Free Rate</p>
                  <p className="text-xs text-surface-container-highest/70">{p.trustStats?.completedRentals || 84} completed handovers</p>
                </div>
              </div>
            </div>

            <div className="mt-space-16 pt-space-12 border-t border-surface-container-high/20 flex items-center justify-between text-xs text-surface-container-highest/70">
              <span>Aadhaar Hash:</span>
              <span className="font-mono text-secondary-fixed font-bold">{p.aadhaar_hash}</span>
            </div>
          </div>
        </div>
      </section>

      {/* User's Active Catalog Feed */}
      <section className="w-full flex flex-col gap-space-16 mt-space-8">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-base sm:text-headline-md text-on-surface font-bold">
            Items Available from {p.name.split(' ')[0]} ({p.inventory?.length || 0})
          </h2>
          <span className="text-body-sm text-secondary font-bold">Aadhaar Inspected Gear</span>
        </div>

        {p.inventory && p.inventory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-16">
            {p.inventory.map(item => (
              <div
                key={item.id}
                onClick={() => onNavigate('product', { id: item.id })}
                className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-44 bg-surface-container">
                  <img
                    src={Array.isArray(item.images) ? item.images[0] : ''}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 bg-secondary text-on-secondary font-badge text-badge rounded">
                      {item.transaction_type === 'both' ? 'Rent / Buy' : item.transaction_type}
                    </span>
                    <span className="px-2 py-0.5 bg-surface-container-lowest/90 text-on-surface font-badge text-badge rounded backdrop-blur-xs">
                      {item.condition_tag || 'Used - Pristine'}
                    </span>
                  </div>
                </div>

                <div className="p-space-12 flex flex-col gap-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-price-md text-price-md text-on-surface font-bold">
                      {item.rent_price_daily > 0 ? `₹${item.rent_price_daily}/day` : `₹${item.sale_price}`}
                    </span>
                    <span className="text-xs text-on-surface-variant">📍 {item.location_name || 'Sector 7'}</span>
                  </div>
                  <h3 className="font-label-bold text-body-sm text-on-surface line-clamp-1 font-bold">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant">
            No active listings right now.
          </div>
        )}
      </section>

      {/* Verified Neighbor Community Reviews */}
      <section className="w-full flex flex-col gap-space-16 mt-space-8">
        <h2 className="font-headline-md text-base sm:text-headline-md text-on-surface font-bold">
          Verified Neighbor Reviews ({p.reviews?.length || 3})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-16">
          <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-8">
            <div className="flex items-center justify-between">
              <span className="font-label-bold text-body-sm text-on-surface font-bold">Karan Trivedi</span>
              <div className="flex text-tertiary-fixed-dim">
                <span className="material-symbols-outlined text-[16px]">star</span>
                <span className="text-xs font-bold ml-1 text-on-surface">5.0</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant italic">
              "Rented the Sony camera kit for 3 days. Item was in immaculate condition. Seamless OTP pickup at Sector 7 gate."
            </p>
            <span className="text-[10px] text-secondary font-bold flex items-center gap-1 mt-auto">
              <span className="material-symbols-outlined text-[12px]">verified</span> 3-Day Wedding Rental
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-8">
            <div className="flex items-center justify-between">
              <span className="font-label-bold text-body-sm text-on-surface font-bold">Pooja Sharma</span>
              <div className="flex text-tertiary-fixed-dim">
                <span className="material-symbols-outlined text-[16px]">star</span>
                <span className="text-xs font-bold ml-1 text-on-surface">5.0</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant italic">
              "Super punctual and friendly neighbor. Deposit was unlocked to my UPI immediately upon return check."
            </p>
            <span className="text-[10px] text-secondary font-bold flex items-center gap-1 mt-auto">
              <span className="material-symbols-outlined text-[12px]">verified</span> Bosch Rotary Drill
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-8">
            <div className="flex items-center justify-between">
              <span className="font-label-bold text-body-sm text-on-surface font-bold">Devang Shah</span>
              <div className="flex text-tertiary-fixed-dim">
                <span className="material-symbols-outlined text-[16px]">star</span>
                <span className="text-xs font-bold ml-1 text-on-surface">4.9</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant italic">
              "Extremely transparent lender. Showed me how to swap batteries and adjust gimbal before handover."
            </p>
            <span className="text-[10px] text-secondary font-bold flex items-center gap-1 mt-auto">
              <span className="material-symbols-outlined text-[12px]">verified</span> DJI Drone Handover
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
