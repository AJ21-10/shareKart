import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useMarketplace } from "../context/MarketplaceContext";

export const HomePage = ({
  onNavigate,
  onOpenAddProduct,
  onQuickRent,
  onToast,
}) => {
  const { currentLocation, updateLocation } = useAuth();
  const {
    products: contextProducts,
    categories,
    featurePillars,
    howItWorks,
    trustBadges,
    valueProps,
    filterProducts,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState("all"); // 'all', 'rent', 'buy'
  const [favorites, setFavorites] = useState({});
  const [apiProducts, setApiProducts] = useState([]);
  const [nearbySuggestions, setNearbySuggestions] = useState([]);
  const [nearestLocations, setNearestLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);

  // Derive source products: use apiProducts if fetched successfully, otherwise contextProducts
  const sourceProducts = (apiProducts && apiProducts.length > 0) ? apiProducts : (contextProducts || []);

  // Format any product consistently (from API or initialData)
  const formatProduct = (p) => {
    if (!p) return null;
    const isRent = p.transaction_type === "rent" || p.type === "rent";
    const isBuy = p.transaction_type === "buy" || p.type === "buy";
    const isBoth = p.transaction_type === "both" || p.type === "both";

    const badge = isBoth ? "Buy or Rent" : isRent ? "For Rent" : "For Sale";
    const badgeColor = isBoth
      ? "bg-primary-container text-on-primary"
      : isRent
      ? "bg-secondary text-on-secondary"
      : "bg-primary text-on-primary";

    const dailyPrice = p.rent_price_daily != null ? p.rent_price_daily : p.price_daily;
    const salePrice = p.sale_price != null ? p.sale_price : p.price_sale;

    const price = dailyPrice != null
      ? `₹${Number(dailyPrice).toLocaleString("en-IN")}`
      : salePrice != null
      ? `₹${Number(salePrice).toLocaleString("en-IN")}`
      : p.price || "₹0";

    const priceSub = isRent
      ? "/ day"
      : isBoth
      ? dailyPrice != null ? `or ₹${dailyPrice}/d` : null
      : (p.security_deposit ? `Deposit: ₹${p.security_deposit}` : null);

    const locationStr = p.distance_km != null
      ? `${p.distance_km} km away`
      : p.location || p.location_name || "Gandhinagar";

    const image = p.images?.[0] || p.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
    const subBadge = p.condition || p.condition_tag || (isBuy ? "Pre-owned" : "Instant Pickup");
    const rating = p.seller_rating || (p.reviews?.length ? "4.9" : null);

    return {
      ...p,
      badge,
      badgeColor,
      badgeClass: badgeColor,
      subBadge,
      rating,
      price,
      priceSub,
      location: locationStr,
      image,
      type: p.transaction_type || p.type,
      bottomChip: p.seller_is_verified || p.bottomChip?.type === "aadhaar"
        ? {
            type: "aadhaar",
            text: "Aadhaar Verified",
            icon: "verified",
            classes: "bg-secondary-container/30 text-on-secondary-container",
          }
        : {
            type: "rating",
            text: `${p.seller_rating || "4.8"} (${p.seller_total_reviews || 12} reviews)`,
            icon: "star",
            classes: "bg-surface-container text-on-surface",
          },
    };
  };

  const heroProducts = (sourceProducts || []).map(formatProduct).filter(Boolean).slice(0, 4);

  // Automatic slider timer for mobile/small screen hero cards
  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroProducts.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  useEffect(() => {
    loadProducts();
  }, [activeTab, currentLocation]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Load products directly from initialData via MarketplaceContext
      const local = filterProducts ? filterProducts({
        type: activeTab !== "all" ? activeTab : "",
        location: currentLocation || "",
        maxDistance: 10,
      }) : { products: contextProducts || [], nearbySuggestions: [] };

      setApiProducts(local.products || []);
      setNearbySuggestions(local.nearbySuggestions || []);
    } catch (err) {
      console.warn("Product load fallback to initialData", err);
      setApiProducts(contextProducts || []);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (e, productId) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const nextState = !prev[productId];
      if (onToast) {
        onToast(
          nextState ? "Added to your saved items" : "Removed from saved items",
        );
      }
      return { ...prev, [productId]: nextState };
    });
  };

  const displayedProducts = (sourceProducts || [])
    .filter((item) => {
      if (!item) return false;
      const type = item.transaction_type || item.type;
      if (activeTab === "rent") return type === "rent" || type === "both";
      if (activeTab === "buy") return type === "buy" || type === "both";
      return true;
    })
    .map(formatProduct)
    .filter(Boolean);

  const aroundYouProducts = displayedProducts.slice(0, 4);

  return (
    <div className="flex flex-col w-full -mt-2 sm:-mt-4">
      {/* 1. HERO SECTION */}
      <section className="w-full bg-surface-container-lowest rounded-2xl p-space-24 lg:p-space-32 shadow-xs border border-outline-variant/30 mb-space-16">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-24 lg:gap-space-32 items-center">
            {/* Hero Left Column */}
            <div className="md:col-span-6 flex flex-col items-start">
              <div className="inline-flex items-center gap-space-6 px-space-12 py-space-4 rounded-full bg-secondary-container/30 text-secondary font-badge text-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Buy • Rent • Sell
              </div>

              <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface mt-space-12 font-bold tracking-tight">
                Things you need. People nearby.
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-8 max-w-lg">
                Buy, rent, or sell with verified neighbors in your area.
              </p>

              <div className="flex flex-wrap items-center gap-space-12 mt-space-24 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const el = document.getElementById("around-you-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    else onNavigate("search");
                  }}
                  className="inline-flex items-center justify-center bg-primary text-on-primary font-label-bold text-label-bold px-space-24 py-space-12 rounded-lg shadow-sm hover:bg-on-surface-variant transition-colors cursor-pointer"
                >
                  Explore Products
                </button>

                <button
                  onClick={onOpenAddProduct}
                  className="inline-flex items-center justify-center bg-surface-container-low text-on-surface font-label-bold text-label-bold px-space-24 py-space-12 rounded-lg hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/30"
                >
                  List an Item
                </button>
              </div>

              <div className="flex items-center gap-space-20 mt-space-24 pt-space-16 text-on-surface-variant font-body-sm text-body-sm">
                <div className="flex items-center gap-space-6">
                  <span className="material-symbols-outlined text-secondary text-base">
                    verified
                  </span>
                  <span className="font-semibold text-on-surface">
                    Verified Members
                  </span>
                </div>
                <div className="flex items-center gap-space-6">
                  <span className="material-symbols-outlined text-secondary text-base">
                    lock
                  </span>
                  <span className="font-semibold text-on-surface">
                    Escrow Protected
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Right Column: Floating on desktop/tablet, Auto-slider on mobile phones */}
            <div className="md:col-span-6 w-full flex flex-col justify-center">
              {/* Mobile View: Automatic Slider (Phones only, hidden on md/tablet and up) */}
              <div className="block md:hidden w-full max-w-sm mx-auto my-3 px-1 sm:px-0">
                <div className="relative rounded-2xl bg-surface-container-lowest p-3 sm:p-4 shadow-lg border border-outline-variant/40">
                  {/* Isolated viewport for slider track */}
                  <div className="overflow-hidden w-full rounded-xl">
                    <div
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${heroSlide * 100}%)` }}
                    >
                      {heroProducts.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => onNavigate("product", { id: card.id })}
                          className="w-full min-w-full shrink-0 cursor-pointer px-4 sm:px-5 box-border overflow-hidden"
                        >
                          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container shadow-xs">
                            <img
                              className="w-full h-full object-cover"
                              alt={card.title}
                              src={card.image}
                            />
                            <span
                              className={`absolute top-2.5 left-2.5 px-space-8 py-space-2 rounded font-badge text-badge ${card.badgeClass}`}
                            >
                              {card.badge}
                            </span>
                            {card.subBadge && (
                              <span className="absolute top-2.5 right-2.5 px-space-6 py-space-2 bg-surface-container-lowest text-on-surface font-badge text-badge rounded">
                                {card.subBadge}
                              </span>
                            )}
                            {card.rating && (
                              <span className="absolute bottom-2.5 right-2.5 px-space-6 py-space-2 bg-surface-container-lowest text-on-surface font-badge text-badge rounded flex items-center gap-space-2 shadow-xs">
                                <span className="material-symbols-outlined text-xs text-on-tertiary-container material-symbols-fill">
                                  star
                                </span>{" "}
                                {card.rating}
                              </span>
                            )}
                            {card.tag && (
                              <span className="absolute bottom-2.5 right-2.5 px-space-6 py-space-2 bg-secondary-container/90 text-on-secondary-container font-badge text-badge rounded shadow-xs">
                                {card.tag}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 px-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-price-md text-price-md text-on-surface font-bold shrink-0">
                                {card.price}{" "}
                                {card.priceSub && (
                                  <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                                    {card.priceSub}
                                  </span>
                                )}
                              </span>
                              <span className="font-body-sm text-xs text-outline flex items-center gap-1 truncate">
                                <span className="material-symbols-outlined text-xs text-secondary shrink-0">
                                  location_on
                                </span>{" "}
                                <span className="truncate">
                                  {card.location}
                                </span>
                              </span>
                            </div>
                            <h3 className="font-headline-sm text-base font-semibold text-on-surface truncate mt-1">
                              {card.title}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slider Controls / Indicators */}
                  <div className="flex items-center justify-between pt-2.5 px-2 border-t border-outline-variant/30 mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroSlide((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
                      }}
                      className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      aria-label="Previous slide"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        chevron_left
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {heroProducts.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHeroSlide(idx);
                          }}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            heroSlide === idx
                              ? "w-6 bg-secondary"
                              : "w-2 bg-outline/40 hover:bg-outline/70"
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroSlide((prev) => (prev + 1) % heroProducts.length);
                      }}
                      className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      aria-label="Next slide"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tablet & Desktop View: Floating Marketplace Product Composition */}
              <div className="hidden md:block relative w-full h-[460px] sm:h-[480px]">
                {heroProducts.map((card, idx) => {
                  const styles = [
                    { pos: "top-2 left-2 sm:left-6 w-64 sm:w-72 z-20", anim: "animate-float-1", imgH: "h-32" },
                    { pos: "top-12 right-2 sm:right-6 w-60 sm:w-64 z-30", anim: "animate-float-2", imgH: "h-28" },
                    { pos: "bottom-4 left-0 sm:left-4 w-56 sm:w-64 z-10", anim: "animate-float-2", imgH: "h-24" },
                    { pos: "bottom-6 right-0 sm:right-4 w-64 sm:w-72 z-20", anim: "animate-float-1", imgH: "h-28" },
                  ];
                  const s = styles[idx] || styles[0];
                  return (
                    <div
                      key={card.id || idx}
                      onClick={() => onNavigate("product", { id: card.id })}
                      className={`${s.anim} absolute ${s.pos} bg-surface-container-lowest p-space-12 rounded-xl shadow-md cursor-pointer border border-outline-variant/40 hover:shadow-xl transition-all`}
                      title={`View ${card.title}`}
                    >
                      <div className={`relative w-full ${s.imgH} rounded-lg overflow-hidden bg-surface-container`}>
                        <img
                          className="w-full h-full object-cover"
                          alt={card.title}
                          src={card.image}
                        />
                        <span className={`absolute top-2 left-2 px-space-8 py-space-2 rounded font-badge text-badge ${card.badgeColor}`}>
                          {card.badge}
                        </span>
                        {card.subBadge && (
                          <span className="absolute top-2 right-2 px-space-6 py-space-2 bg-surface-container-lowest text-on-surface font-badge text-badge rounded">
                            {card.subBadge}
                          </span>
                        )}
                        {card.rating && (
                          <span className="absolute bottom-2 right-2 px-space-6 py-space-2 bg-surface-container-lowest text-on-surface font-badge text-badge rounded flex items-center gap-space-2 shadow-xs">
                            <span className="material-symbols-outlined text-xs text-on-tertiary-container material-symbols-fill">
                              star
                            </span>{" "}
                            {card.rating}
                          </span>
                        )}
                        {card.tag && (
                          <span className="absolute bottom-2 right-2 px-space-6 py-space-2 bg-secondary-container/90 text-on-secondary-container font-badge text-badge rounded shadow-xs">
                            {card.tag}
                          </span>
                        )}
                      </div>
                      <div className="mt-space-8">
                        <div className="flex items-baseline justify-between">
                          <span className="font-price-md text-price-md text-on-surface font-bold">
                            {card.price}{" "}
                            {card.priceSub && (
                              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                                {card.priceSub}
                              </span>
                            )}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline flex items-center gap-space-2">
                            <span className="material-symbols-outlined text-xs text-secondary">
                              location_on
                            </span>{" "}
                            {card.location}
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-body-md font-semibold text-on-surface truncate mt-space-2">
                          {card.title}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="w-full bg-surface-container-low py-space-16 rounded-xl mb-space-24">
        <div className="max-w-[1240px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-12">
            {(valueProps || []).map((prop, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center md:justify-start gap-space-8 py-space-6 px-space-12 rounded bg-surface-container-lowest shadow-xs"
              >
                <span
                  className={`material-symbols-outlined text-lg ${
                    prop.isRating
                      ? "text-on-tertiary-container material-symbols-fill"
                      : "text-secondary"
                  }`}
                >
                  {prop.icon}
                </span>
                <span className="font-label-bold text-label-bold text-on-surface">
                  {prop.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BUY / RENT / SELL SECTION ("SIMPLE ECONOMICS - One place. Three ways.") */}
      <section className="w-full bg-surface py-space-32 lg:py-space-48">
        <div className="max-w-[1240px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="text-center max-w-xl mx-auto mb-space-24">
            <h2 className="font-headline-lg text-headline-lg lg:text-display-lg text-on-surface font-bold">
              Buy • Rent • Sell
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-20">
            {(featurePillars || []).map((pillar, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (pillar.action === "list-item") onOpenAddProduct();
                  else onNavigate("search", { type: pillar.type });
                }}
                className="group bg-surface-container-lowest p-space-24 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer border border-outline-variant/30"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-space-12 py-space-4 rounded font-badge text-badge tracking-wider ${pillar.badgeColor}`}>
                      {pillar.badge}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-2xl">
                      {pillar.icon}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mt-space-16 font-bold">
                    {pillar.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-8">
                    {pillar.description}
                  </p>
                </div>
                <div className="mt-space-24 pt-space-16">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pillar.action === "list-item") onOpenAddProduct();
                      else onNavigate("search", { type: pillar.type });
                    }}
                    className={`inline-flex items-center justify-center w-full font-label-bold text-label-bold py-space-12 rounded-lg transition-colors cursor-pointer ${
                      pillar.type === "buy"
                        ? "bg-primary text-on-primary hover:bg-on-surface-variant"
                        : pillar.type === "rent"
                        ? "bg-secondary text-on-secondary hover:bg-on-secondary-container"
                        : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                    }`}
                  >
                    {pillar.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. NEARBY PRODUCTS SECTION ("Around you") */}
      <section
        id="around-you-section"
        className="w-full bg-surface-container-low py-space-32 lg:py-space-48 rounded-2xl mb-space-24"
      >
        <div className="max-w-[1240px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="flex items-end justify-between mb-space-24 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Around you
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary bg-secondary-container/40 px-2.5 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">location_on</span>
                  <span>{currentLocation || "Gandhinagar"}</span>
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-2">
                {aroundYouProducts.length > 0
                  ? `Verified products available near ${currentLocation || "you"}.`
                  : `No items listed directly in ${currentLocation || "your area"}. Showing nearest locations.`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/30">
                {[
                  { id: "all", label: "All" },
                  { id: "rent", label: "Rent" },
                  { id: "buy", label: "Buy" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded text-body-sm font-label-bold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-secondary text-on-secondary shadow-xs font-bold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onNavigate("search")}
                className="font-label-bold text-label-bold text-secondary hover:text-on-secondary-container flex items-center gap-space-4 cursor-pointer"
              >
                <span>Explore nearby</span>
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {apiProducts.length === 0 && nearbySuggestions.length > 0 && nearestLocations.length > 0 && (
            <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-xl border border-secondary/30 mb-space-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2 text-xs text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">near_me</span>
                <span><strong>No products directly in {currentLocation}.</strong> Available in nearest hubs:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {nearestLocations.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      updateLocation(loc.location);
                      onToast && onToast(`Location updated to ${loc.location}`);
                    }}
                    className="text-[11px] bg-surface-container hover:bg-secondary hover:text-on-secondary px-2.5 py-1 rounded-md font-bold text-on-surface transition-colors cursor-pointer"
                  >
                    📍 {loc.location} ({loc.distance_km} km)
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-16">
            {aroundYouProducts.map((product) => {
              const isFav = !!favorites[product.id];
              return (
                <div
                  key={product.id}
                  onClick={() => onNavigate("product", { id: product.id })}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer border border-outline-variant/30 group"
                >
                  <div>
                    <div className="relative w-full h-44 bg-surface-container overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        alt={product.title}
                        src={product.image}
                      />
                      <span
                        className={`absolute top-2 left-2 px-space-8 py-space-2 rounded font-badge text-badge ${product.badgeColor}`}
                      >
                        {product.badge}
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(e, product.id)}
                        aria-label="Save item"
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors cursor-pointer shadow-xs"
                      >
                        <span
                          className={`material-symbols-outlined text-lg ${isFav ? "text-error material-symbols-fill" : ""}`}
                        >
                          favorite
                        </span>
                      </button>
                    </div>

                    <div className="p-space-12">
                      <div className="flex items-baseline justify-between">
                        <span className="font-price-md text-price-md text-on-surface font-bold">
                          {product.price}
                        </span>
                        {product.tag && (
                          <span className="font-badge text-badge px-space-6 py-space-2 bg-surface-container text-on-surface-variant rounded">
                            {product.tag}
                          </span>
                        )}
                        {product.priceSub && (
                          <span className="font-body-sm text-body-sm text-outline">
                            {product.priceSub}
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline-sm text-body-md font-semibold text-on-surface mt-space-6 line-clamp-1 group-hover:text-secondary transition-colors">
                        {product.title}
                      </h3>
                      <p className="font-body-sm text-body-sm text-outline flex items-center gap-space-2 mt-space-4">
                        <span className="material-symbols-outlined text-sm text-secondary">
                          location_on
                        </span>
                        {product.location}
                      </p>
                    </div>
                  </div>

                  <div className="p-space-12 pt-0">
                    <div
                      className={`inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded font-badge text-badge w-full justify-center ${product.bottomChip?.classes || "bg-surface-container text-on-surface"}`}
                    >
                      <span
                        className={`material-symbols-outlined text-sm ${product.bottomChip?.type === "rating" ? "text-on-tertiary-container material-symbols-fill" : "text-secondary"}`}
                      >
                        {product.bottomChip?.icon || "verified"}
                      </span>
                      {product.bottomChip?.text || "Verified"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {displayedProducts.length > 4 && (
            <div className="mt-space-24 text-center">
              <button
                onClick={() => onNavigate("search")}
                className="inline-flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-bold px-5 py-2.5 rounded-lg border border-outline-variant/50 shadow-xs transition-colors cursor-pointer text-body-sm"
              >
                <span>View all products ({displayedProducts.length})</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION ("Simple as 1–2–3") */}
      <section className="w-full bg-surface-container-lowest py-space-32 lg:py-space-48 rounded-2xl mb-space-24 border border-outline-variant/30">
        <div className="max-w-[1240px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="text-center max-w-lg mx-auto mb-space-24">
            <h2 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface font-bold">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-24">
            {(howItWorks || []).map((step, idx) => (
              <div
                key={idx}
                className="p-space-24 rounded-xl bg-surface-container-low flex flex-col items-start border border-outline-variant/20"
              >
                <div className={`w-12 h-12 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center ${step.iconColor || "text-primary"} mb-space-16`}>
                  <span className="material-symbols-outlined text-2xl">
                    {step.icon}
                  </span>
                </div>
                <span className="font-badge text-badge text-secondary uppercase tracking-wider font-bold">
                  {step.step}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-space-4 font-bold">
                  {step.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-8">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRUST SECTION ("Trade with confidence.") */}
      <section className="w-full bg-surface py-space-32 lg:py-space-48">
        <div className="max-w-[800px] mx-auto px-gutter-mobile lg:px-gutter-desktop text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary mb-space-16">
            <span className="material-symbols-outlined text-3xl">
              verified_user
            </span>
          </div>
          <h2 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface font-bold">
            Trade with confidence.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-8">
            Verified users. Clear ratings. Safer transactions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-space-12 mt-space-24">
            {(trustBadges || []).map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-space-6 px-space-16 py-space-8 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-bold text-label-bold border border-outline-variant/30"
              >
                <span
                  className={`material-symbols-outlined text-base ${
                    badge.isRating
                      ? "text-on-tertiary-container material-symbols-fill"
                      : "text-secondary"
                  }`}
                >
                  {badge.icon}
                </span>
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA SECTION ("Got something unused?") */}
      <section className="w-full bg-surface pb-space-32">
        <div className="max-w-[1240px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="bg-primary-container text-on-primary rounded-2xl p-space-32 lg:p-space-48 flex flex-col md:flex-row items-center justify-between gap-space-24 shadow-md">
            <div className="text-center md:text-left">
              <h2 className="font-display-lg text-display-lg-mobile lg:text-display-lg font-bold text-surface-lowest">
                Got something unused?
              </h2>
              <p className="font-body-lg text-body-lg text-surface-dim mt-space-4">
                Give it another life.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-12 shrink-0">
              <button
                onClick={onOpenAddProduct}
                className="inline-flex items-center justify-center bg-secondary text-on-secondary font-label-bold text-label-bold px-space-24 py-space-12 rounded-lg hover:bg-on-secondary-container transition-colors shadow-sm cursor-pointer"
              >
                List Your Item
              </button>
              <button
                onClick={() => onNavigate("search")}
                className="inline-flex items-center justify-center bg-transparent text-on-primary border border-outline-variant font-label-bold text-label-bold px-space-24 py-space-12 rounded-lg hover:bg-surface-container-low/10 transition-colors cursor-pointer"
              >
                Explore Products
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. COMPACT FOOTER STRIP */}
      <footer className="w-full bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] py-space-24 mt-space-16 border-t border-outline-variant/30 rounded-xl">
        <div className="max-w-[1240px] mx-auto px-gutter-mobile lg:px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-16">
          <div className="flex items-center gap-space-12">
            <img
              alt="Sharekart Logo"
              className="h-7 w-auto object-contain"
              src="/sharekart-logo.png"
              onError={(e) => {
                e.target.src =
                  "https://lh3.googleusercontent.com/aida/AEtjO1VhknTFZdm6xFcIukdmwyVIWdYl6qKlsxXZSCfQsg80lqAgh7pP_2Ry-dxw0_5YUvkR841K_qebczNRSc9U0R5HNzr1LDHC4shNDN5anQzx-RVhORkDXnmcZX8JRhh7UJyAjUqfWNLItx1D5TCn76BqWKaa2eEgoiRUYJM-bvLqCDw0PL1GNSHDjfc88rcqrRdo7ZarUKtUM4tVEHywAXiBgA4ASG8-sTeMwjYAboXgOHOnVBJUo0VLYQmY";
              }}
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              Buy. Rent. Sell. Nearby.
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-space-16 gap-y-space-8">
            <button
              onClick={() => onNavigate("search")}
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => onNavigate("how-it-works")}
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigate("help-center")}
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => onNavigate("contact-us")}
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              onClick={() => onNavigate("terms-of-service")}
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              onClick={() => onNavigate("privacy-policy")}
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              Privacy
            </button>
          </nav>

          <div className="font-body-sm text-body-sm text-outline">
            © 2024 Sharekart India
          </div>
        </div>
      </footer>
    </div>
  );
};
