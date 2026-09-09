import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

export const HomePage = ({ onNavigate, onOpenAddProduct, onToast }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'rent', 'buy'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ type: activeTab !== 'all' ? activeTab : '' }),
        api.getCategories()
      ]);

      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories);
    } catch (err) {
      console.error('Failed to load homepage data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* SECTION 1: Compact Hero & Discovery Banner */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-space-16 sm:p-space-24 shadow-sm flex flex-col gap-space-16 border border-outline-variant/50 mb-space-24">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-16">
          <div className="flex-1 max-w-3xl flex flex-col gap-space-6">
            <div className="inline-flex items-center gap-space-6 self-start bg-secondary-container/60 text-on-secondary-container px-space-8 py-space-2 rounded font-badge text-badge">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>India's Hyperlocal P2P Sharing Network</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
              Buy, Sell, or Rent Pre-Owned Items Near You
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Save money, reduce waste, and transact safely with Aadhaar-verified neighbors across Gandhinagar and beyond.
            </p>
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-space-8 w-full lg:w-auto shrink-0">
            <button
              onClick={() => {
                setActiveTab('buy');
                const el = document.getElementById('marketplace-feed');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-6 bg-primary text-on-primary px-space-16 py-space-12 rounded font-label-bold text-label-bold hover:bg-inverse-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span>Browse Items to Buy</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('rent');
                const el = document.getElementById('marketplace-feed');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-6 bg-secondary text-on-secondary px-space-16 py-space-12 rounded font-label-bold text-label-bold hover:bg-secondary/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span className="flex items-center gap-space-4">
                Explore Items for Rent
                <span className="bg-secondary-fixed text-on-secondary-fixed font-badge text-[11px] px-space-4 py-0.5 rounded leading-none">From ₹50/day</span>
              </span>
            </button>

            <button
              onClick={onOpenAddProduct}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-space-4 bg-surface-container-high text-on-surface px-space-12 py-space-12 rounded font-label-bold text-label-bold hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>List Your Item</span>
            </button>
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div className="pt-space-12 bg-surface-container-low/70 rounded p-space-8 grid grid-cols-1 md:grid-cols-3 gap-space-8 text-body-sm font-body-sm text-on-surface">
          <div className="flex items-center gap-space-6 px-space-8 py-space-4 bg-surface-container-lowest rounded shadow-xs">
            <span className="material-symbols-outlined text-secondary text-[20px] material-symbols-fill">verified_user</span>
            <div>
              <span className="font-label-bold text-label-bold">100% Aadhaar Verified</span>
              <span className="text-on-surface-variant block text-badge font-badge">UIDAI-authenticated seller profiles</span>
            </div>
          </div>
          <div className="flex items-center gap-space-6 px-space-8 py-space-4 bg-surface-container-lowest rounded shadow-xs">
            <span className="material-symbols-outlined text-on-tertiary-container text-[20px] material-symbols-fill">shield_with_heart</span>
            <div>
              <span className="font-label-bold text-label-bold">Razorpay Escrow Safety</span>
              <span className="text-on-surface-variant block text-badge font-badge">Funds released after physical check</span>
            </div>
          </div>
          <div className="flex items-center gap-space-6 px-space-8 py-space-4 bg-surface-container-lowest rounded shadow-xs">
            <span className="material-symbols-outlined text-secondary text-[20px] material-symbols-fill">storefront</span>
            <div>
              <span className="font-label-bold text-label-bold">Doorstep or Local Pickup</span>
              <span className="text-on-surface-variant block text-badge font-badge">Tested within your 5-10 km radius</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Category Cards Grid */}
      <section className="w-full flex flex-col gap-space-12 mb-space-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">Browse by Category</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Over 4,680 items listed within your district</p>
          </div>
          <button 
            onClick={() => onNavigate('search')}
            className="font-label-bold text-label-bold text-secondary hover:underline flex items-center gap-space-2"
          >
            <span>View All Categories</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-space-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('search', { category: cat.id })}
              className="bg-surface-container-lowest rounded-xl p-space-12 flex flex-col items-center text-center gap-space-4 shadow-sm hover:shadow-md border border-outline-variant/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
              </div>
              <span className="font-label-bold text-body-sm text-on-surface leading-tight mt-space-2 truncate w-full">
                {cat.name}
              </span>
              <span className="font-badge text-badge text-on-surface-variant">
                {cat.item_count} items
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 3: Marketplace Feed */}
      <section id="marketplace-feed" className="w-full flex flex-col gap-space-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-12 border-b border-outline-variant/60 pb-space-12">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Featured Verified Listings
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Available for instant pickup or fast delivery in Gandhinagar
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-space-4 bg-surface-container-low p-space-2 rounded-lg self-start">
            {[
              { id: 'all', label: 'All Listings' },
              { id: 'rent', label: 'Items for Rent' },
              { id: 'buy', label: 'Items for Sale' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-space-12 py-space-6 rounded text-body-sm font-label-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-16 py-8 text-center text-on-surface-variant">
            <p className="col-span-full">Loading marketplace products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-16">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={(id) => onNavigate('product', { id })}
                onToast={onToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: Verified Neighborhood Sellers */}
      <section className="mt-space-32 bg-surface-container-low/70 rounded-xl p-space-20 border border-outline-variant/60 flex flex-col gap-space-16">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Top Rated Lenders in Gandhinagar
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              100% Aadhaar Verified with 4.8+ community rating
            </p>
          </div>
          <span className="text-badge font-badge text-secondary bg-secondary-fixed/30 px-space-8 py-1 rounded">
            UIDAI Secure Network
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-16">
          <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-xs border border-outline-variant/60 flex items-center gap-space-12">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvwX0VWpSJeuED4-rB81VPbPA27lNTThgp81lY-ZFyVuVBRwPxI0IFrki4JcG94IeY39-P9xmSiL6G69D5zNkU7w1PPH-QW9cOR-gwQmGnUUhfrc_JkvgLDcsbrmrzoC4MQQN8mo9tSRi8luvZ0d0CHIHD7afE8KkKE18VbU8iwj_RJrYZxHfwxX1t_ZmtMoJMwBL3dP8MvzxQ70ueO-bq5X5qAtYR3Q8zsFZYGLKWMPsefnfoFiu6IQ" 
              alt="Vikram Joshi" 
              className="w-12 h-12 rounded-full object-cover border border-secondary-fixed" 
            />
            <div>
              <p className="font-label-bold text-body-md text-on-surface">Vikram Joshi</p>
              <p className="text-xs text-secondary font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Aadhaar eKYC Verified
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">⭐ 4.9 (42 Rentals) · Infocity</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-xs border border-outline-variant/60 flex items-center gap-space-12">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB545f6ceGmox7wT32Fww8WeepCos-Gc28aQMjSouhaEb6Ww_eJ3i1rjONcK0h9q-ZuPcSGTO4lnll9Ty3EbYhBUn8TjVVJ2U9dLolJIrafUZySH4QPEuh7vqZRVc-Fdfv6TEH45cHms9CiVRYXZVzfQlO0NQJ0WMJZcUMHxsW39Yho2r4T_wh2WGmHew8paWqYAXiHti3Nukk9p66xn7eOVR-1K76oPa-86XoDwC_xOa28FqIuPdS8og" 
              alt="Aarav Patel" 
              className="w-12 h-12 rounded-full object-cover border border-secondary-fixed" 
            />
            <div>
              <p className="font-label-bold text-body-md text-on-surface">Aarav Patel</p>
              <p className="text-xs text-secondary font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Aadhaar eKYC Verified
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">⭐ 4.9 (36 Rentals) · Sector 7</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-xs border border-outline-variant/60 flex items-center gap-space-12">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
              alt="Kavya Patel" 
              className="w-12 h-12 rounded-full object-cover border border-secondary-fixed" 
            />
            <div>
              <p className="font-label-bold text-body-md text-on-surface">Kavya Patel</p>
              <p className="text-xs text-secondary font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Aadhaar eKYC Verified
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">⭐ 5.0 (18 Rentals) · Kudasan</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
