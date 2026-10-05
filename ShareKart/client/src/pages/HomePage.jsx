import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const HomePage = ({ onNavigate, onOpenAddProduct, onQuickRent, onToast }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'rent', 'buy'
  const [favorites, setFavorites] = useState({});
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Spotlight featured products exactly as shown in code copy.html & screen copy.png
  const featuredProducts = [
    {
      id: 3,
      title: 'Dell Latitude 5420 Laptop',
      type: 'buy',
      badge: 'Buy',
      badgeColor: 'bg-primary text-on-primary',
      location: 'Sector 14 • 1.8 km away',
      tag: 'Used - Like New',
      price: '₹24,500',
      priceSub: null,
      bottomChip: {
        type: 'aadhaar',
        text: 'Aadhaar Verified',
        icon: 'verified',
        classes: 'bg-secondary-container/30 text-on-secondary-container'
      },
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsuOdQGJYZntUUSK46dvzI07mZDusjuzFht-lPHvHn4IR0hUQuYby5fE5XoTasXHztJbFgWEFEY4Q4QdiYskp43GA2fkCJfiZs0b23yMsD7HOHpLeot9gE63UaFQ8OiZZpn-YdoYwQHaZjvWjRl_kl0zaVFMIi0qwJPTKkZsbtpU-ycpjMFeXTWgiyhlEgs6HP60oDGHPs-KGyVxtK0g3KWP1RF69bCgrvYm7OHdviPXgUZOZ6hasNjA'
    },
    {
      id: 2,
      title: 'Bosch Rotary Hammer Drill',
      type: 'rent',
      badge: 'Rent',
      badgeColor: 'bg-secondary text-on-secondary',
      location: 'Infocity • 3.2 km away',
      price: '₹350 / day',
      priceSub: 'Deposit: ₹1,500',
      bottomChip: {
        type: 'aadhaar',
        text: 'Aadhaar Verified',
        icon: 'verified',
        classes: 'bg-secondary-container/30 text-on-secondary-container'
      },
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJTG7GkgQYGCi0kwmJY7n8-UZn5Nhd11Jbzsy5lR-jTnX0XlSAjfqvAoeKur6iGYVxAlA3BO-06Cy7e6L7KWFNn-PW07AEWUm71D2otwZmoDg6Cqf9KlhqCdCkv5JIx290aQw_Z0oyJW1KN2B-qXPq_GIDkQefaJ7YjQlydXMtka8x8xtjFr1ghKWL592TKGMXNxhe4iSYYRSMyFnBZAe-_KlByS5RGWpzQwT5BbMX5yjIzXWVBMcpww'
    },
    {
      id: 1,
      title: 'Sony Alpha A6400 Kit',
      type: 'rent',
      badge: 'Rent',
      badgeColor: 'bg-secondary text-on-secondary',
      location: 'Kudasan • 2.5 km away',
      price: '₹850 / day',
      priceSub: 'or Buy ₹48k',
      bottomChip: {
        type: 'rating',
        text: '5.0 (14 rentals)',
        icon: 'star',
        classes: 'bg-surface-container text-on-surface'
      },
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCllUNpLeCA2DoJuevdAZA5D_HkYp7uW5fRFlnkIM2I57OqnBNFu9udnuRyv6ggba2Dwnh4wB49x_vAD_7TJjVn-hZC6uw0fevDYmcv_aNS2zObpEk3OQGP8hS359x6nU_IEPIlH_XJxUzvY22YCHXs5-8uk_z-veuU1XcpQEz6XavekyF8SvQieB1aCLP-7AUecBUoX_qh1LjoFQHL8OYBNxrDzhDUj-6r-QMZ2KOYpTxDZCT4Ep-AoA'
    },
    {
      id: 4,
      title: 'Hero Sprint 21-Speed MTB',
      type: 'both',
      badge: 'Buy or Rent',
      badgeColor: 'bg-primary-container text-on-primary',
      location: 'Sector 21 • 3.5 km away',
      price: '₹4,500',
      priceSub: 'or ₹120/day',
      bottomChip: {
        type: 'aadhaar',
        text: 'Aadhaar Verified',
        icon: 'verified',
        classes: 'bg-secondary-container/30 text-on-secondary-container'
      },
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWBcetbhhtCGQHkRZmc_Ju_jfJUqs6j7t97pxdjR1ene0jl8TXYfjxqBamjbUg-jenZ3lb4C5sZH8EMebbLAxhSY1R3ujxCit1IKwQ_MFJEl4_5k6DfLXL-gD_P5xaNtb5S1rALZn0T3gRD4u46dN1h_nW73e-ViDGmtORuZDK3z0lCWbKkIASA83MWLW2mofujUB62MH7aGii48caCi9FogGUnmGmkRCilzqJyrlnw3jRE_-zxWIlNA'
    }
  ];

  useEffect(() => {
    loadProducts();
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({ type: activeTab !== 'all' ? activeTab : '' });
      if (res.success && res.products) {
        setApiProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load products from API:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (e, productId) => {
    e.stopPropagation();
    setFavorites(prev => {
      const nextState = !prev[productId];
      if (onToast) {
        onToast(nextState ? 'Added to your saved items' : 'Removed from saved items');
      }
      return { ...prev, [productId]: nextState };
    });
  };

  const displayedProducts = featuredProducts.filter(item => {
    if (activeTab === 'rent') return item.type === 'rent' || item.type === 'both';
    if (activeTab === 'buy') return item.type === 'buy' || item.type === 'both';
    return true;
  });

  return (
    <div className="flex flex-col w-full -mt-2 sm:-mt-4">
      {/* 1. HERO SECTION */}
      <section className="w-full bg-surface-container-lowest rounded-2xl p-space-24 lg:p-space-32 shadow-xs border border-outline-variant/30 mb-space-16">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24 lg:gap-space-32 items-center">
            {/* Hero Left Column */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <div className="inline-flex items-center gap-space-6 px-space-12 py-space-4 rounded-full bg-secondary-container/30 text-secondary font-badge text-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Buy • Rent • Sell
              </div>

              <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface mt-space-12 font-bold tracking-tight">
                Things you need. People nearby.
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-8 max-w-lg">
                Buy, rent or sell products around you. High utility, zero friction, verified neighbors.
              </p>

              <div className="flex flex-wrap items-center gap-space-12 mt-space-24 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const el = document.getElementById('around-you-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else onNavigate('search');
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
                  <span className="material-symbols-outlined text-secondary text-base">verified</span>
                  <span className="font-semibold text-on-surface">Verified Members</span>
                </div>
                <div className="flex items-center gap-space-6">
                  <span className="material-symbols-outlined text-secondary text-base">lock</span>
                  <span className="font-semibold text-on-surface">Escrow Protected</span>
                </div>
              </div>
            </div>

            {/* Hero Right Column: Floating Marketplace Product Composition */}
            <div className="lg:col-span-6 relative w-full h-[460px] sm:h-[480px]">
              {/* Card 1: Laptop */}
              <div
                onClick={() => onNavigate('product', { id: 3 })}
                className="animate-float-1 absolute top-2 left-2 sm:left-6 w-64 sm:w-72 bg-surface-container-lowest p-space-12 rounded-xl shadow-md z-20 cursor-pointer border border-outline-variant/40 hover:shadow-xl transition-all"
                title="View Dell Latitude 5420"
              >
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Dell Latitude 5420 i5 11th Gen"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY1-PEG8IEwaBye7YINtDGuzCLhCZQh1hfg55-R1WFWJhYBYhU7S_pn31J9DALQhXly2kXh2i7vrPVM2hQyy4mgzxr9TgM2ETg5KyGHXBsg2nUisSusG_Sf1vz7hhzZ9ub3h6-ban-s6a_eqxpURNfEmBL7A-UW0epmoJDatDo_awjvZDqk0pqyKwZiMZlJ_BB0o5n0FgtVGysmFVuugTLV-gJNEarFqZlsX51hldHL1yFTh3INbTOcQ"
                  />
                  <span className="absolute top-2 left-2 px-space-8 py-space-2 bg-primary text-on-primary rounded font-badge text-badge">
                    For Sale
                  </span>
                  <span className="absolute top-2 right-2 px-space-6 py-space-2 bg-surface-container-lowest text-on-surface font-badge text-badge rounded">
                    Used · Good
                  </span>
                </div>
                <div className="mt-space-8">
                  <div className="flex items-baseline justify-between">
                    <span className="font-price-md text-price-md text-on-surface">₹24,500</span>
                    <span className="font-body-sm text-body-sm text-outline flex items-center gap-space-2">
                      <span className="material-symbols-outlined text-xs text-secondary">location_on</span> 2.5 km away
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-body-md font-semibold text-on-surface truncate mt-space-2">
                    Dell Latitude 5420 i5 11th Gen
                  </h3>
                </div>
              </div>

              {/* Card 2: Sony Camera */}
              <div
                onClick={() => onNavigate('product', { id: 1 })}
                className="animate-float-2 absolute top-12 right-2 sm:right-6 w-60 sm:w-64 bg-surface-container-lowest p-space-12 rounded-xl shadow-md z-30 cursor-pointer border border-outline-variant/40 hover:shadow-xl transition-all"
                title="View Sony Alpha A6400"
              >
                <div className="relative w-full h-28 rounded-lg overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Sony Alpha A6400 Kit"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSucvfcJQNo_qFWB5oHI7pEXJMtslQMPqBEZt3-9nS3_2NI10UswRHV5oamAM_pZx6TVWfumSWs9aPgaqN7YslIuosS14OQ5lxsrEpu_11IvZaAAo5_MTdJOsgXbAOImZzcrGP9th6z8zNv3y9N_KSd1Tg95deb7Ih-pjW-GyusiZBFBjxQgSvmagmR6tcaH1O2Ji2hzLgcqohKSxdxM1bUOvx3iT7BVJtMMUCDmttbFfianb7lJPKPQ"
                  />
                  <span className="absolute top-2 left-2 px-space-8 py-space-2 bg-secondary text-on-secondary rounded font-badge text-badge">
                    For Rent
                  </span>
                  <span className="absolute bottom-2 right-2 px-space-6 py-space-2 bg-surface-container-lowest text-on-surface font-badge text-badge rounded flex items-center gap-space-2">
                    <span className="material-symbols-outlined text-xs text-on-tertiary-container material-symbols-fill">star</span> 4.9
                  </span>
                </div>
                <div className="mt-space-8">
                  <div className="flex items-baseline justify-between">
                    <span className="font-price-md text-price-md text-secondary">
                      ₹850 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">/ day</span>
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface font-semibold truncate mt-space-2">
                    Sony Alpha A6400 Kit
                  </p>
                  <p className="font-body-sm text-body-sm text-outline flex items-center gap-space-2 mt-space-2">
                    <span className="material-symbols-outlined text-xs text-secondary">near_me</span> 1.8 km away
                  </p>
                </div>
              </div>

              {/* Card 3: Drill Machine */}
              <div
                onClick={() => onNavigate('product', { id: 2 })}
                className="animate-float-2 absolute bottom-4 left-0 sm:left-4 w-56 sm:w-64 bg-surface-container-lowest p-space-12 rounded-xl shadow-md z-10 cursor-pointer border border-outline-variant/40 hover:shadow-xl transition-all"
                title="View Bosch Rotary Drill"
              >
                <div className="relative w-full h-24 rounded-lg overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Bosch Rotary Drill Set"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg_5mbBAxo6BN1Y7YZtd6It1ZtWEgV2pP0eGANqiO9dJp99IdyV_JPxiSpDAX8leCDSFPXgkNyrx-FCGPHvw55uqZ15bqZ7ffBcbh4QpEv_ifF84kv9ivkXRJR7lZrRfGMJPb_sBeXiDFWaXJHc5Z873O6bKcbtkJj1ZRGU_PUpgr7XXIcP4CUxCfmlWWMm48SyP2L3BqnBoNhs75luUWDqc6raResHrsBtpg5v_Da-JpU2-Ix03jlnw"
                  />
                  <span className="absolute top-2 left-2 px-space-6 py-space-2 bg-secondary text-on-secondary rounded font-badge text-badge">
                    For Rent
                  </span>
                </div>
                <div className="mt-space-6">
                  <div className="flex items-baseline justify-between">
                    <span className="font-price-md text-price-md text-on-surface">
                      ₹200 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">/ day</span>
                    </span>
                    <span className="font-badge text-badge px-space-6 py-space-2 bg-secondary-container/40 text-on-secondary-container rounded">
                      Ready now
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface font-semibold truncate mt-space-2">
                    Bosch Rotary Drill Set
                  </p>
                  <p className="font-body-sm text-body-sm text-outline mt-space-2">
                    📍 Nearby · Infocity
                  </p>
                </div>
              </div>

              {/* Card 4: Bicycle */}
              <div
                onClick={() => onNavigate('product', { id: 4 })}
                className="animate-float-1 absolute bottom-6 right-0 sm:right-4 w-64 sm:w-72 bg-surface-container-lowest p-space-12 rounded-xl shadow-md z-20 cursor-pointer border border-outline-variant/40 hover:shadow-xl transition-all"
                title="View Hero Sprint MTB"
              >
                <div className="relative w-full h-28 rounded-lg overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Hero Sprint MTB 26T"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaOqraxOhKr04WK54jy3aJntK7q24DXHLpf0Fvdw5wWxxO2F7EZdsPcS2lHfehmqkv8VgPFQHAalSc-gPKpQgP3UKguR4cEnRSaVm3gACMSFiZ2Ouq2ucNDZsVgrB3O1ylmbcYEAHeKQpRAKPN_w0R8U2NvMiTvPh5pIZzNIL38oU0mWT3uuKEfkRc_9O_RakandwfpXlrmJINPUp6q3cvpzMgTBl9fVRE2F1pVpdPWzW-DCgeMIGRtg"
                  />
                  <span className="absolute top-2 left-2 px-space-8 py-space-2 bg-primary-container text-on-primary rounded font-badge text-badge">
                    Buy or Rent
                  </span>
                </div>
                <div className="mt-space-6">
                  <div className="flex items-baseline justify-between">
                    <span className="font-price-md text-price-md text-on-surface">
                      ₹4,500 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">or ₹120/d</span>
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface font-semibold truncate mt-space-2">
                    Hero Sprint MTB 26T
                  </p>
                  <p className="font-body-sm text-body-sm text-outline flex items-center gap-space-2 mt-space-2">
                    <span className="material-symbols-outlined text-xs text-secondary">location_on</span> 3.2 km away · Sector 21
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="w-full bg-surface-container-low py-space-16 rounded-xl mb-space-24">
        <div className="max-w-[1240px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-12">
            <div className="flex items-center justify-center md:justify-start gap-space-8 py-space-6 px-space-12 rounded bg-surface-container-lowest shadow-xs">
              <span className="material-symbols-outlined text-secondary text-lg">verified_user</span>
              <span className="font-label-bold text-label-bold text-on-surface">Verified Users</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-space-8 py-space-6 px-space-12 rounded bg-surface-container-lowest shadow-xs">
              <span className="material-symbols-outlined text-secondary text-lg">shield</span>
              <span className="font-label-bold text-label-bold text-on-surface">Secure Payments</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-space-8 py-space-6 px-space-12 rounded bg-surface-container-lowest shadow-xs">
              <span className="material-symbols-outlined text-secondary text-lg">near_me</span>
              <span className="font-label-bold text-label-bold text-on-surface">Local Products</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-space-8 py-space-6 px-space-12 rounded bg-surface-container-lowest shadow-xs">
              <span className="material-symbols-outlined text-on-tertiary-container text-lg material-symbols-fill">star</span>
              <span className="font-label-bold text-label-bold text-on-surface">Ratings &amp; Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BUY / RENT / SELL SECTION ("SIMPLE ECONOMICS - One place. Three ways.") */}
      <section className="w-full bg-surface py-space-32 lg:py-space-48">
        <div className="max-w-[1240px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="text-center max-w-xl mx-auto mb-space-32">
            <span className="font-badge text-badge tracking-wider text-secondary uppercase bg-secondary-container/20 px-space-12 py-space-4 rounded-full inline-block">
              SIMPLE ECONOMICS
            </span>
            <h2 className="font-headline-lg text-headline-lg lg:text-display-lg text-on-surface mt-space-8 font-bold">
              One place. Three ways.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-20">
            {/* BUY CARD */}
            <div 
              onClick={() => onNavigate('search', { type: 'buy' })}
              className="group bg-surface-container-lowest p-space-24 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer border border-outline-variant/30"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-space-12 py-space-4 rounded bg-primary text-on-primary font-badge text-badge tracking-wider">
                    BUY
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-2xl">shopping_cart</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-space-16 font-bold">Find it. Buy it.</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-8">
                  Own pre-loved items at up to 70% off retail pricing, inspected locally before payment.
                </p>
              </div>
              <div className="mt-space-24 pt-space-16">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('search', { type: 'buy' });
                  }}
                  className="inline-flex items-center justify-center w-full bg-primary text-on-primary font-label-bold text-label-bold py-space-12 rounded-lg hover:bg-on-surface-variant transition-colors cursor-pointer"
                >
                  Shop Now →
                </button>
              </div>
            </div>

            {/* RENT CARD */}
            <div 
              onClick={() => onNavigate('search', { type: 'rent' })}
              className="group bg-surface-container-lowest p-space-24 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer border border-outline-variant/30"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-space-12 py-space-4 rounded bg-secondary text-on-secondary font-badge text-badge tracking-wider">
                    RENT
                  </span>
                  <span className="material-symbols-outlined text-secondary text-2xl">event_repeat</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-space-16 font-bold">Use it. Return it.</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-8">
                  Rent appliances, cameras, tools, and event gear by the day without ownership stress.
                </p>
              </div>
              <div className="mt-space-24 pt-space-16">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('search', { type: 'rent' });
                  }}
                  className="inline-flex items-center justify-center w-full bg-secondary text-on-secondary font-label-bold text-label-bold py-space-12 rounded-lg hover:bg-on-secondary-container transition-colors cursor-pointer"
                >
                  Rent Now 📅
                </button>
              </div>
            </div>

            {/* SELL CARD */}
            <div 
              onClick={onOpenAddProduct}
              className="group bg-surface-container-lowest p-space-24 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer border border-outline-variant/30"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-space-12 py-space-4 rounded bg-surface-container-high text-on-surface font-badge text-badge tracking-wider">
                    SELL
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-2xl">storefront</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-space-16 font-bold">Don't use it? Sell it.</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-8">
                  List unneeded household electronics, bikes, and gadgets in 60 seconds with instant buyer chat.
                </p>
              </div>
              <div className="mt-space-24 pt-space-16">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAddProduct();
                  }}
                  className="inline-flex items-center justify-center w-full bg-surface-container-high text-on-surface font-label-bold text-label-bold py-space-12 rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  List Item ⊕
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEARBY PRODUCTS SECTION ("Around you") */}
      <section id="around-you-section" className="w-full bg-surface-container-low py-space-32 lg:py-space-48 rounded-2xl mb-space-24">
        <div className="max-w-[1240px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="flex items-end justify-between mb-space-24 flex-wrap gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Around you</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-2">Find useful products nearby.</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/30">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'rent', label: 'Rent' },
                  { id: 'buy', label: 'Buy' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded text-body-sm font-label-bold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-secondary text-on-secondary shadow-xs font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onNavigate('search')}
                className="font-label-bold text-label-bold text-secondary hover:text-on-secondary-container flex items-center gap-space-4 cursor-pointer"
              >
                <span>Explore nearby</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-16">
            {displayedProducts.map(product => {
              const isFav = !!favorites[product.id];
              return (
                <div
                  key={product.id}
                  onClick={() => onNavigate('product', { id: product.id })}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer border border-outline-variant/30 group"
                >
                  <div>
                    <div className="relative w-full h-44 bg-surface-container overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        alt={product.title}
                        src={product.image}
                      />
                      <span className={`absolute top-2 left-2 px-space-8 py-space-2 rounded font-badge text-badge ${product.badgeColor}`}>
                        {product.badge}
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(e, product.id)}
                        aria-label="Save item"
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors cursor-pointer shadow-xs"
                      >
                        <span className={`material-symbols-outlined text-lg ${isFav ? 'text-error material-symbols-fill' : ''}`}>
                          favorite
                        </span>
                      </button>
                    </div>

                    <div className="p-space-12">
                      <div className="flex items-baseline justify-between">
                        <span className="font-price-md text-price-md text-on-surface font-bold">{product.price}</span>
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
                        <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
                        {product.location}
                      </p>
                    </div>
                  </div>

                  <div className="p-space-12 pt-0">
                    <div className={`inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded font-badge text-badge w-full justify-center ${product.bottomChip.classes}`}>
                      <span className={`material-symbols-outlined text-sm ${product.bottomChip.type === 'rating' ? 'text-on-tertiary-container material-symbols-fill' : 'text-secondary'}`}>
                        {product.bottomChip.icon}
                      </span>
                      {product.bottomChip.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION ("Simple as 1–2–3") */}
      <section className="w-full bg-surface-container-lowest py-space-32 lg:py-space-48 rounded-2xl mb-space-24 border border-outline-variant/30">
        <div className="max-w-[1240px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="text-center max-w-lg mx-auto mb-space-32">
            <h2 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface font-bold">
              Simple as 1–2–3
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-4">
              Neighborhood commerce with zero ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-24">
            {/* Step 1 */}
            <div className="p-space-24 rounded-xl bg-surface-container-low flex flex-col items-start border border-outline-variant/20">
              <div className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary mb-space-16">
                <span className="material-symbols-outlined text-2xl">search</span>
              </div>
              <span className="font-badge text-badge text-secondary uppercase tracking-wider font-bold">Step 01</span>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-space-4 font-bold">Find</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-8">
                Browse verified tools, bikes, electronics in your neighborhood.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-space-24 rounded-xl bg-surface-container-low flex flex-col items-start border border-outline-variant/20">
              <div className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center text-secondary mb-space-16">
                <span className="material-symbols-outlined text-2xl">handshake</span>
              </div>
              <span className="font-badge text-badge text-secondary uppercase tracking-wider font-bold">Step 02</span>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-space-4 font-bold">Buy or Rent</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-8">
                Chat instantly with owner. Lock deposits securely in escrow before meeting.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-space-24 rounded-xl bg-surface-container-low flex flex-col items-start border border-outline-variant/20">
              <div className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-tertiary-container mb-space-16">
                <span className="material-symbols-outlined text-2xl">sentiment_satisfied</span>
              </div>
              <span className="font-badge text-badge text-secondary uppercase tracking-wider font-bold">Step 03</span>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-space-4 font-bold">Enjoy</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-8">
                Pick up nearby, inspect condition, use it, and save money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST SECTION ("Trade with confidence.") */}
      <section className="w-full bg-surface py-space-32 lg:py-space-48">
        <div className="max-w-[800px] mx-auto px-gutter-mobile lg:px-gutter-desktop text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary mb-space-16">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>
          <h2 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface font-bold">
            Trade with confidence.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-8">
            Verified users. Clear ratings. Safer transactions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-space-12 mt-space-24">
            <div className="flex items-center gap-space-6 px-space-16 py-space-8 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-bold text-label-bold border border-outline-variant/30">
              <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
              Aadhaar &amp; Phone Verified
            </div>
            <div className="flex items-center gap-space-6 px-space-16 py-space-8 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-bold text-label-bold border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-tertiary-container text-base material-symbols-fill">star</span>
              Transparent 5-Star Ratings
            </div>
            <div className="flex items-center gap-space-6 px-space-16 py-space-8 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-bold text-label-bold border border-outline-variant/30">
              <span className="material-symbols-outlined text-secondary text-base">lock</span>
              Escrow-Protected Deposits
            </div>
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
                onClick={() => onNavigate('search')}
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
                e.target.src = "https://lh3.googleusercontent.com/aida/AEtjO1VhknTFZdm6xFcIukdmwyVIWdYl6qKlsxXZSCfQsg80lqAgh7pP_2Ry-dxw0_5YUvkR841K_qebczNRSc9U0R5HNzr1LDHC4shNDN5anQzx-RVhORkDXnmcZX8JRhh7UJyAjUqfWNLItx1D5TCn76BqWKaa2eEgoiRUYJM-bvLqCDw0PL1GNSHDjfc88rcqrRdo7ZarUKtUM4tVEHywAXiBgA4ASG8-sTeMwjYAboXgOHOnVBJUo0VLYQmY";
              }}
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              Buy. Rent. Sell. Nearby.
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-space-16 gap-y-space-8">
            <button onClick={() => onNavigate('search')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">About</button>
            <button onClick={() => onNavigate('how-it-works')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => onNavigate('help-center')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">FAQ</button>
            <button onClick={() => onNavigate('contact-us')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Contact</button>
            <button onClick={() => onNavigate('terms-of-service')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Terms</button>
            <button onClick={() => onNavigate('privacy-policy')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Privacy</button>
          </nav>

          <div className="font-body-sm text-body-sm text-outline">
            © 2024 Sharekart India
          </div>
        </div>
      </footer>
    </div>
  );
};
