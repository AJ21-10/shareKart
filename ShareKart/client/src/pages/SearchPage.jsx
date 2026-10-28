import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';

export const SearchPage = ({ initialFilters = {}, onNavigate, onToast }) => {
  const { currentLocation, updateLocation } = useAuth();
  const { filterProducts, categories: contextCategories } = useMarketplace();
  const [products, setProducts] = useState([]);
  const [nearbySuggestions, setNearbySuggestions] = useState([]);
  const [nearestLocations, setNearestLocations] = useState([]);
  const [categories, setCategories] = useState(contextCategories || []);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialFilters.q || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'all');
  const [transactionType, setTransactionType] = useState(initialFilters.type || 'all'); // 'all', 'rent', 'buy'
  const [maxDistance, setMaxDistance] = useState(10);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [sortBy, setSortBy] = useState('distance');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    setSelectedCategory(initialFilters.category || 'all');
    setSearchQuery(initialFilters.q || '');
    if (initialFilters.type) {
      setTransactionType(initialFilters.type);
    } else if (!initialFilters.category || initialFilters.category === 'all') {
      setTransactionType('all');
      setMinPrice('');
      setMaxPrice('');
    }
  }, [initialFilters]);

  useEffect(() => {
    fetchResults();
  }, [searchQuery, selectedCategory, transactionType, maxDistance, verifiedOnly, sortBy, currentLocation]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Load and filter products directly from initialData.js via MarketplaceContext
      const local = filterProducts({
        category: selectedCategory,
        type: transactionType,
        query: searchQuery,
        location: currentLocation,
        maxDistance,
        verifiedOnly,
        minPrice,
        maxPrice,
        sort: sortBy
      });

      setProducts(local.products || []);
      setNearbySuggestions(local.nearbySuggestions || []);
      setNearestLocations([]);

      if (contextCategories?.length > 0) {
        setCategories(contextCategories);
      }
    } catch (err) {
      console.error('Search query failed, using marketplace fallback', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setTransactionType('all');
    setMaxDistance(10);
    setVerifiedOnly(false);
    setSortBy('distance');
    setMinPrice('');
    setMaxPrice('');
  };

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) + (transactionType !== 'all' ? 1 : 0) + (verifiedOnly ? 1 : 0) + (maxDistance !== 10 ? 1 : 0);

  // Shared Filter Controls Component
  const FilterControls = () => (
    <div className="flex flex-col gap-space-16">
      {/* 1. Transaction Type */}
      <div className="flex flex-col gap-2">
        <label className="font-label-bold text-on-surface uppercase tracking-wider text-[11px]">
          Transaction Type
        </label>
        <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-lg">
          {['all', 'rent', 'buy'].map((type) => (
            <button
              key={type}
              onClick={() => setTransactionType(type)}
              className={`py-1.5 rounded text-xs sm:text-body-sm font-label-bold transition-all text-center capitalize ${
                transactionType === type
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Distance Radius */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-label-bold text-on-surface uppercase tracking-wider text-[11px]">
            Distance Radius
          </label>
          <span className="text-badge font-badge text-secondary font-bold">📍 &lt; {maxDistance} km</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[2, 5, 10, 25].map((dist) => (
            <button
              key={dist}
              onClick={() => setMaxDistance(dist)}
              className={`py-1.5 px-2.5 rounded text-left text-xs sm:text-body-sm transition-colors flex items-center justify-between ${
                maxDistance === dist
                  ? 'bg-primary text-on-primary font-label-bold shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span>{dist === 25 ? 'Whole City' : `Within ${dist} km`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Category Tree */}
      <div className="flex flex-col gap-2">
        <label className="font-label-bold text-on-surface uppercase tracking-wider text-[11px]">
          Category
        </label>
        <div className="flex flex-col gap-1 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-left text-xs sm:text-body-sm px-2 py-1.5 rounded flex items-center justify-between ${
              selectedCategory === 'all' ? 'bg-secondary text-on-secondary font-bold' : 'text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`text-left text-xs sm:text-body-sm px-2 py-1.5 rounded flex items-center justify-between ${
                selectedCategory === c.id ? 'bg-secondary text-on-secondary font-bold' : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="truncate">{c.name}</span>
              <span className="text-[11px] opacity-75">{c.live_count || c.item_count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Aadhaar Verification Filter */}
      <div className="pt-space-8 border-t border-outline-variant/60 flex items-center justify-between">
        <label htmlFor="verified-toggle" className="text-xs sm:text-body-sm font-label-bold text-on-surface flex items-center gap-1 cursor-pointer">
          <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
          <span>Aadhaar Verified Only</span>
        </label>
        <input
          id="verified-toggle"
          type="checkbox"
          checked={verifiedOnly}
          onChange={(e) => setVerifiedOnly(e.target.checked)}
          className="w-4 h-4 accent-secondary cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-space-16">
      {/* Breadcrumb & Summary Strip */}
      <section className="bg-surface-container-lowest p-3 sm:p-space-16 rounded-xl shadow-xs border border-outline-variant/60 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-space-16">
        <div className="flex flex-col gap-1 sm:gap-space-4">
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-space-8">
            <h1 className="font-headline-lg text-lg sm:text-headline-lg text-on-surface tracking-tight font-bold">
              {searchQuery ? `"${searchQuery}"` : selectedCategory !== 'all' ? categories.find(c => c.id === selectedCategory)?.name || 'Filtered Listings' : 'All Marketplace Products'}
            </h1>
            <span className="text-xs sm:text-body-md text-on-surface-variant font-medium">
              near <strong className="text-on-surface">{currentLocation || 'Gandhinagar'} ({maxDistance} km)</strong>
            </span>
            <span className="bg-secondary-container text-on-secondary-container px-2 sm:px-space-8 py-0.5 rounded text-[10px] sm:text-badge font-badge uppercase tracking-wider">
              {products.length > 0
                ? `${products.length} in area`
                : nearbySuggestions.length > 0
                ? `${nearbySuggestions.length} in nearby hubs`
                : '0 Listings'}
            </span>
          </div>
          <p className="text-xs sm:text-body-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-secondary shrink-0">verified</span>
            <span>Verified peer-to-peer equipment with doorstep handover or local pickup</span>
          </p>
        </div>

        {/* View Switchers & Mobile Filter Trigger */}
        <div className="flex items-center gap-2 self-start lg:self-center shrink-0 w-full sm:w-auto justify-between sm:justify-start">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded text-xs font-label-bold shadow-xs hover:bg-inverse-surface"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-surface-container-low p-1 rounded">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-label-bold transition-all ${
                viewMode === 'grid' ? 'bg-surface-container-lowest text-on-surface shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-label-bold transition-all ${
                viewMode === 'list' ? 'bg-surface-container-lowest text-on-surface shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              <span>List</span>
            </button>
          </div>
        </div>
      </section>

      {/* Applied Filters & Sort Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-body-sm">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-space-8">
          <span className="font-label-bold text-on-surface-variant">Applied:</span>
          {verifiedOnly && (
            <span className="inline-flex items-center gap-1 bg-surface-container-lowest text-on-surface px-2 py-0.5 rounded text-[10px] sm:text-badge font-badge border border-outline-variant/60 shadow-xs">
              <span className="material-symbols-outlined text-[13px] text-secondary">verified_user</span>
              <span>Aadhaar</span>
              <button onClick={() => setVerifiedOnly(false)} className="hover:text-error ml-1 font-bold">×</button>
            </span>
          )}
          <span className="inline-flex items-center gap-1 bg-surface-container-lowest text-on-surface px-2 py-0.5 rounded text-[10px] sm:text-badge font-badge border border-outline-variant/60 shadow-xs">
            <span>&lt; {maxDistance} km</span>
          </span>
          {transactionType !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-surface-container-lowest text-on-surface px-2 py-0.5 rounded text-[10px] sm:text-badge font-badge border border-outline-variant/60 shadow-xs">
              <span>{transactionType.toUpperCase()}</span>
              <button onClick={() => setTransactionType('all')} className="hover:text-error ml-1 font-bold">×</button>
            </span>
          )}
          {activeFiltersCount > 0 && (
            <button onClick={handleResetFilters} className="text-xs font-label-bold text-error hover:underline ml-1">
              Reset All
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 bg-surface-container-lowest px-2.5 py-1 rounded border border-outline-variant/60 shadow-xs self-start sm:self-auto">
          <label className="text-xs font-label-bold text-on-surface-variant shrink-0" htmlFor="sort-select">
            Sort:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-on-surface text-xs font-label-bold focus:outline-none cursor-pointer"
          >
            <option value="distance">Distance (Nearest)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated Lender</option>
            <option value="latest">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column: Filters Left + Products Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-space-16 items-start">
        {/* DESKTOP FILTER PANEL (3 cols) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-space-16 sticky top-36">
          <div className="bg-surface-container-lowest p-space-16 rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-16">
            <div className="flex items-center justify-between pb-space-8 border-b border-outline-variant/50">
              <div className="flex items-center gap-space-6">
                <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Filter Products</h2>
              </div>
              <span className="text-badge font-badge bg-surface-container text-on-surface px-space-6 py-0.5 rounded">
                {products.length} Active
              </span>
            </div>

            <FilterControls />
          </div>
        </aside>

        {/* MOBILE FILTER MODAL / DRAWER */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-primary/60 backdrop-blur-xs p-0 sm:p-4">
            <div className="bg-surface-container-lowest w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 sm:p-space-20 shadow-2xl border border-outline-variant max-h-[85vh] flex flex-col gap-4 animate-scale-up">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
                  <h3 className="font-headline-sm text-base font-bold text-on-surface">Filter Products</h3>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-full text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <FilterControls />
              </div>

              <div className="pt-2 border-t border-outline-variant flex items-center gap-2">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-label-bold text-on-surface"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 bg-secondary text-on-secondary py-2 rounded-lg text-xs font-label-bold text-center shadow-xs"
                >
                  Apply Filters ({products.length} Results)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT PRODUCT FEED (9 cols) */}
        <main className="lg:col-span-9 flex flex-col gap-4 sm:gap-space-16 w-full">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant">
              Loading listings...
            </div>
          ) : products.length === 0 ? (
            nearbySuggestions.length > 0 ? (
              <div className="flex flex-col gap-4 sm:gap-space-16">
                {/* Nearby Suggestions Alert Box */}
                <div className="bg-surface-container-lowest p-4 sm:p-space-20 rounded-2xl border-2 border-secondary/30 shadow-sm flex flex-col gap-space-12 relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px]">near_me</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-secondary/15 text-secondary text-[10px] sm:text-badge font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Nearby Hub Suggestions
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          Radius: &lt; {maxDistance} km
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-base sm:text-headline-sm font-bold text-on-surface mt-1">
                        No products currently listed directly in "{currentLocation || 'your area'}"
                      </h3>
                      <p className="text-xs sm:text-body-sm text-on-surface-variant mt-1">
                        Don't worry! We found verified equipment available in nearby locations around you. You can switch location, expand radius, or browse suggested items below:
                      </p>
                    </div>
                  </div>

                  {/* Nearest Hubs Action Chips */}
                  {nearestLocations && nearestLocations.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/40">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Available in Nearest Hubs:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {nearestLocations.map((loc, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              updateLocation(loc.location);
                              onToast && onToast(`Location updated to ${loc.location}`);
                            }}
                            className="group flex items-center gap-1.5 bg-surface-container-low hover:bg-secondary hover:text-on-secondary px-3 py-1.5 rounded-lg border border-outline-variant/60 text-xs font-label-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[15px] text-secondary group-hover:text-on-secondary">
                              location_on
                            </span>
                            <span>{loc.location}</span>
                            <span className="text-[10px] bg-secondary-container text-on-secondary-container group-hover:bg-on-secondary group-hover:text-secondary px-1.5 py-0.5 rounded font-bold">
                              {loc.distance_km} km • {loc.itemCount} {loc.itemCount === 1 ? 'item' : 'items'}
                            </span>
                          </button>
                        ))}
                        {maxDistance < 25 && (
                          <button
                            onClick={() => setMaxDistance(25)}
                            className="flex items-center gap-1 bg-primary text-on-primary hover:bg-inverse-surface px-3 py-1.5 rounded-lg text-xs font-label-bold transition-all cursor-pointer shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[15px]">radar</span>
                            <span>Expand to Whole City (25 km)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Products Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">explore</span>
                    <h4 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                      Products in Nearest Locations ({nearbySuggestions.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    Sorted by proximity
                  </span>
                </div>

                {/* Render Suggested Products */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-space-16">
                    {nearbySuggestions.map((product) => (
                      <div key={product.id} className="relative flex flex-col">
                        <div className="mb-1 flex items-center justify-between text-[11px] text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">
                          <span className="flex items-center gap-1 font-semibold text-secondary">
                            <span className="material-symbols-outlined text-[13px]">pin_drop</span>
                            <span>{product.location_name}</span>
                          </span>
                          <span className="font-bold">{product.distance_km} km away</span>
                        </div>
                        <ProductCard
                          product={product}
                          onSelectProduct={(id) => onNavigate('product', { id })}
                          onToast={onToast}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 sm:gap-space-12">
                    {nearbySuggestions.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => onNavigate('product', { id: product.id })}
                        className="bg-surface-container-lowest rounded-xl p-2.5 sm:p-space-12 border border-outline-variant/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-3 sm:gap-space-16 items-start"
                      >
                        <img
                          src={Array.isArray(product.images) ? product.images[0] : ''}
                          alt={product.title}
                          className="w-full sm:w-44 h-40 sm:h-36 object-cover rounded-lg bg-surface-container shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between w-full min-w-0 h-full">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-[10px] sm:text-badge font-badge uppercase px-1.5 sm:px-space-6 py-0.5 rounded ${
                                product.transaction_type === 'rent' ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'
                              }`}>
                                {product.transaction_type}
                              </span>
                              <span className="text-[11px] text-on-surface-variant font-medium">
                                {product.condition_tag}
                              </span>
                              <span className="text-[11px] text-secondary font-bold ml-auto flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">near_me</span>
                                {product.distance_km} km away
                              </span>
                            </div>
                            <h3 className="font-headline-sm text-sm sm:text-headline-sm text-on-surface truncate">
                              {product.title}
                            </h3>
                            <p className="text-xs sm:text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                              {product.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 sm:pt-space-8 border-t border-outline-variant/40 mt-2 sm:mt-space-8">
                            <div className="flex items-baseline gap-1">
                              <span className="font-price-md text-sm sm:text-price-md font-bold text-on-surface">
                                ₹{(product.rent_price_daily || product.sale_price).toLocaleString('en-IN')}
                              </span>
                              {product.transaction_type !== 'buy' && (
                                <span className="text-xs text-on-surface-variant">/ day</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-on-surface-variant">
                              <span>📍 {product.location_name}</span>
                              <span className="font-bold text-secondary">{product.distance_km} km</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 sm:p-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col items-center gap-space-8">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">search_off</span>
                <p className="font-headline-sm text-base sm:text-headline-sm text-on-surface">No matching listings found</p>
                <p className="text-xs sm:text-body-sm max-w-md">Try expanding your distance radius, changing transaction filters, or searching for other items.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 bg-primary text-on-primary px-space-16 py-space-8 rounded font-label-bold text-xs sm:text-body-sm"
                >
                  Reset Filters
                </button>
              </div>
            )
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-space-16">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(id) => onNavigate('product', { id })}
                  onToast={onToast}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="flex flex-col gap-2.5 sm:gap-space-12">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onNavigate('product', { id: product.id })}
                  className="bg-surface-container-lowest rounded-xl p-2.5 sm:p-space-12 border border-outline-variant/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-3 sm:gap-space-16 items-start"
                >
                  <img
                    src={Array.isArray(product.images) ? product.images[0] : ''}
                    alt={product.title}
                    className="w-full sm:w-44 h-40 sm:h-36 object-cover rounded-lg bg-surface-container shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between w-full min-w-0 h-full">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] sm:text-badge font-badge uppercase px-1.5 sm:px-space-6 py-0.5 rounded ${
                          product.transaction_type === 'rent' ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'
                        }`}>
                          {product.transaction_type}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          {product.condition_tag}
                        </span>
                        <span className="text-[11px] text-secondary font-bold ml-auto flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          Score {product.inspection_score || 98}/100
                        </span>
                      </div>

                      <h3 className="font-headline-sm text-sm sm:text-headline-sm text-on-surface truncate">
                        {product.title}
                      </h3>
                      <p className="text-xs sm:text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 sm:pt-space-8 border-t border-outline-variant/40 mt-2 sm:mt-space-8">
                      <div className="flex items-baseline gap-1">
                        <span className="font-price-md text-sm sm:text-price-md font-bold text-on-surface">
                          ₹{(product.rent_price_daily || product.sale_price).toLocaleString('en-IN')}
                        </span>
                        {product.transaction_type !== 'buy' && (
                          <span className="text-xs text-on-surface-variant">/ day</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-on-surface-variant">
                        <span>📍 {product.location_name}</span>
                        <span>· {product.distance_km} km</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
