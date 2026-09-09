import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { LocationModal } from './LocationModal';

export const Navbar = ({ onNavigate, onOpenAuth, onOpenCart, onOpenChat, onOpenAddProduct, activePage, onToast }) => {
  const { user, currentLocation, isAuthenticated, logout, switchDemoUser, demoAccounts } = useAuth();
  const { cartCount } = useCart();
  const [searchCategory, setSearchCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onNavigate('search', { q: searchQuery, category: searchCategory !== 'All Categories' ? searchCategory : '' });
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-primary-container shadow-[0_1px_8px_rgba(0,0,0,0.12)]">
      <div className="h-28 max-w-[1280px] mx-auto px-gutter-desktop flex flex-col justify-between py-space-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-space-12">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-space-12 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-space-8 text-left cursor-pointer focus:outline-none"
            >
              <img
                alt="Sharekart Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1UM7nAmAg-wn8ekbV1KgaHp_BP1JrxBbMUvzHpWog8Pt_LKP465A8rT68RxdchMiQk7V9tOcZ3hRgnax2OHH2Hqmh275I_sKTFIeUNCPUiK0_09ZvHhvBt3KFDQr2ziZC4xF6G0K9PvPyu9xXO7n0-PhwliRLHuNwvO0pyOlRvnPZ9R6ynfK7cyyx7p8I1FsdqfBkRiJBS3MsKqWf8nfgDxPwseImCdDa9YtrNll44MiCS3IWyT832xcLpP"
              />
              <span className="font-headline-sm text-headline-sm text-on-primary tracking-tight font-bold">
                Sharekart
              </span>
            </button>

            {/* Location Selector Button with Real-Time Indicator */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="hidden sm:flex items-center gap-space-6 bg-primary/40 hover:bg-primary/70 text-on-primary px-space-10 py-space-6 rounded-lg border border-outline/30 hover:border-secondary-fixed text-body-sm font-body-sm transition-all group shadow-xs cursor-pointer"
              title="Change location & discover nearby hubs in real time"
            >
              <div className="relative flex items-center">
                <span className="material-symbols-outlined text-[17px] text-secondary-fixed group-hover:scale-110 transition-transform">location_on</span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed absolute -top-0.5 -right-0.5 animate-pulse"></span>
              </div>
              <span className="font-label-bold text-label-bold text-on-primary max-w-[140px] truncate">
                {currentLocation || user?.location || 'Gandhinagar, Sector 7'}
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-on-primary transition-colors">keyboard_arrow_down</span>
            </button>
          </div>

          {/* Search Bar with Integrated Category Selector */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-2xl mx-space-8 hidden md:flex items-center bg-surface-container-lowest rounded overflow-hidden shadow-[0_1px_2px_0_rgba(15,23,42,0.06)]"
          >
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-surface-container-low text-on-surface max-w-xs font-body-sm text-body-sm px-space-8 py-space-8 border-none focus:ring-0 cursor-pointer"
            >
              <option>All Categories</option>
              <option value="cameras-audio">Cameras & Audio</option>
              <option value="laptops-mobiles">Laptops & Mobiles</option>
              <option value="power-tools-machinery">Tools & Equipment</option>
              <option value="home-furniture">Furniture</option>
              <option value="bikes-cycles">Bikes & Cycles</option>
              <option value="home-appliances">Home Appliances</option>
            </select>
            <div className="h-6 w-[1px] bg-outline-variant"></div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cameras, laptops, furniture, tools near you..."
              className="flex-1 px-space-12 py-space-8 text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant/70 border-none focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              className="bg-primary text-on-primary px-space-16 py-space-8 flex items-center justify-center hover:bg-inverse-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </form>

          {/* Action CTAs */}
          <div className="flex items-center gap-space-12 shrink-0">
            {/* Sell / Rent CTA Button */}
            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-space-4 bg-secondary text-on-secondary px-space-12 py-space-6 rounded font-label-bold text-label-bold hover:bg-secondary-container hover:text-on-secondary-container transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Sell / Rent</span>
            </button>

            {/* Utility Icons */}
            <div className="flex items-center gap-space-8 text-on-primary">
              <button
                onClick={onOpenChat}
                className="relative p-space-6 hover:text-secondary-fixed transition-colors"
                title="Messages"
              >
                <span className="material-symbols-outlined text-[22px]">forum</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>

              <button
                onClick={() => onNavigate('orders')}
                className="relative p-space-6 hover:text-secondary-fixed transition-colors hidden sm:inline-block"
                title="My Orders & Rentals"
              >
                <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              </button>

              <button
                onClick={onOpenCart}
                className="relative p-space-6 hover:text-secondary-fixed transition-colors"
                title="Cart"
              >
                <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-on-secondary text-badge font-badge rounded-full px-space-4 py-0.5 leading-none">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile & Demo Persona Switcher */}
            <div className="relative pl-space-4 border-l border-outline/30">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-space-8 text-left focus:outline-none"
                  >
                    <div className="relative flex items-center">
                      <img
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border border-secondary-fixed"
                        src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                      />
                      <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-[12px] bg-secondary-container text-on-secondary-container rounded-full p-0.5">
                        verified
                      </span>
                    </div>
                    <div className="hidden lg:flex flex-col">
                      <span className="font-label-bold text-label-bold text-on-primary leading-none">
                        {user?.name || 'Aarav Patel'}
                      </span>
                      <span className="font-badge text-badge text-secondary-fixed leading-tight mt-0.5 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px]">check_circle</span>
                        Aadhaar Verified
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant py-2 z-50 text-on-surface">
                      <div className="px-4 py-2 border-b border-outline-variant">
                        <p className="font-label-bold text-on-surface">{user?.name}</p>
                        <p className="text-xs text-on-surface-variant font-mono">{user?.email}</p>
                        <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-bold mt-1">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          UIDAI Hash: {user?.aadhaar_hash || '#OK-82914'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full px-4 py-2.5 text-left text-body-sm hover:bg-surface-container flex items-center gap-2 font-label-bold text-secondary"
                      >
                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                        <span>Seller / Lender Hub</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('orders');
                        }}
                        className="w-full px-4 py-2 text-left text-body-sm hover:bg-surface-container flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        <span>My Orders & Bookings</span>
                      </button>

                      {/* Demo Persona Switcher */}
                      <div className="border-t border-outline-variant px-4 py-2 bg-surface-container-low/50">
                        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Switch Persona</p>
                        <div className="flex flex-col gap-1">
                          {demoAccounts.map(demo => (
                            <button
                              key={demo.id}
                              onClick={() => {
                                switchDemoUser(demo);
                                setProfileDropdownOpen(false);
                              }}
                              className={`text-xs text-left px-2 py-1 rounded flex items-center justify-between ${user?.id === demo.id ? 'bg-secondary text-on-secondary font-bold' : 'hover:bg-surface-container'
                                }`}
                            >
                              <span>{demo.name}</span>
                              <span className="text-[10px] opacity-80">{demo.id === 1 ? 'Seller' : demo.id === 2 ? 'Lender' : 'Renter'}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-outline-variant pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-body-sm text-error hover:bg-error-container/20 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="bg-primary text-on-primary px-space-12 py-space-6 rounded text-body-sm font-label-bold hover:bg-inverse-surface transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Bar Navigation */}
        <nav className="flex items-center gap-space-8 overflow-x-auto pb-space-2 text-body-sm font-body-sm scrollbar-none">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap px-space-8 py-space-2 rounded transition-colors ${activePage === 'home'
              ? 'bg-surface text-on-surface font-label-bold shadow-xs'
              : 'text-on-primary hover:text-secondary-fixed'
              }`}
          >
            All Categories
          </button>
          {[
            { id: 'laptops-mobiles', label: 'Laptops & Mobiles' },
            { id: 'home-furniture', label: 'Home Furniture' },
            { id: 'power-tools-machinery', label: 'Power Tools & Machinery' },
            { id: 'cameras-audio', label: 'Cameras & Audio' },
            { id: 'bikes-cycles', label: 'Bikes & Cycles' },
            { id: 'home-appliances', label: 'Home Appliances' },
            { id: 'books-sports', label: 'Books & Sports' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate('search', { category: cat.id })}
              className="whitespace-nowrap px-space-8 py-space-2 rounded text-on-primary hover:text-secondary-fixed transition-colors"
            >
              {cat.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Real-time Location & Nearby Hubs Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onToast={onToast}
      />
    </header>
  );
};
