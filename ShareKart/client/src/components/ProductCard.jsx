import React, { useState } from 'react';

export const ProductCard = ({ product, onSelectProduct, onQuickRent, onQuickBuy, onToast }) => {
  const [wishlisted, setWishlisted] = useState(false);

  const images = Array.isArray(product.images) ? product.images : [];
  const thumbnail = images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80';
  const isRent = product.transaction_type === 'rent' || product.transaction_type === 'both';
  const isSale = product.transaction_type === 'buy';

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setWishlisted(!wishlisted);
    onToast && onToast(wishlisted ? 'Removed from saved wishlist' : 'Saved to your wishlist!');
  };

  return (
    <div 
      onClick={() => onSelectProduct(product.id)}
      className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm hover:shadow-md hover:border-outline-variant transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
    >
      {/* Media Canvas 4:3 */}
      <div className="relative w-full aspect-[4/3] bg-surface-container-low overflow-hidden">
        <img 
          src={thumbnail} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />

        {/* Tag Pill: Rent or Sale */}
        <div className="absolute top-space-8 left-space-8 flex items-center gap-1">
          {isRent && (
            <span className="bg-secondary text-on-secondary text-badge font-badge px-space-8 py-0.5 rounded shadow-xs">
              RENT
            </span>
          )}
          {isSale && (
            <span className="bg-primary text-on-primary text-badge font-badge px-space-8 py-0.5 rounded shadow-xs">
              BUY
            </span>
          )}
          {product.transaction_type === 'both' && (
            <span className="bg-primary-container text-on-primary text-[10px] font-bold px-space-6 py-0.5 rounded">
              OR BUY
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-space-8 right-space-8 w-8 h-8 rounded-full bg-surface-container-lowest/90 text-on-surface hover:bg-surface-container-lowest shadow-sm flex items-center justify-center transition-transform hover:scale-110"
        >
          <span className={`material-symbols-outlined text-[18px] ${wishlisted ? 'text-error material-symbols-fill' : 'text-on-surface-variant'}`}>
            favorite
          </span>
        </button>

        {/* Instant pickup indicator */}
        {product.is_instant_pickup ? (
          <span className="absolute bottom-space-8 left-space-8 bg-primary/80 backdrop-blur-xs text-on-primary px-space-6 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-secondary-fixed">bolt</span>
            Instant Handover
          </span>
        ) : null}
      </div>

      {/* Body Content */}
      <div className="p-3 sm:p-space-12 flex flex-col gap-2 sm:gap-space-8 flex-1 justify-between">
        <div className="flex flex-col gap-space-4">
          {/* Price Row */}
          <div className="flex items-baseline justify-between flex-wrap gap-1">
            <div className="flex items-baseline gap-1">
              <span className="font-price-md text-base sm:text-price-md font-bold text-on-surface">
                ₹{(isRent ? product.rent_price_daily : product.sale_price).toLocaleString('en-IN')}
              </span>
              {isRent && (
                <span className="text-xs sm:text-body-sm text-on-surface-variant">/ day</span>
              )}
            </div>
            {isRent && product.security_deposit > 0 && (
              <span className="text-[10px] sm:text-[11px] text-on-surface-variant">
                Deposit: ₹{product.security_deposit.toLocaleString('en-IN')}
              </span>
            )}
            {isSale && product.original_mrp > 0 && (
              <span className="text-[10px] sm:text-[11px] text-on-surface-variant line-through">
                MRP ₹{product.original_mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-label-bold text-xs sm:text-body-md text-on-surface line-clamp-2 leading-snug group-hover:text-secondary transition-colors">
            {product.title}
          </h3>

          {/* Condition Tag */}
          <div className="flex items-center gap-1.5 sm:gap-space-6 mt-0.5 flex-wrap">
            <span className="bg-surface-container text-on-surface px-1.5 sm:px-space-6 py-0.5 rounded text-[10px] sm:text-[11px] font-medium">
              {product.condition_tag || 'Used - Excellent'}
            </span>
            {product.inspection_score && (
              <span className="text-secondary text-[10px] sm:text-[11px] font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px] sm:text-[12px]">verified</span>
                Score {product.inspection_score}/100
              </span>
            )}
          </div>
        </div>

        {/* Location & Seller Verification Strip */}
        <div className="pt-2 sm:pt-space-8 border-t border-outline-variant/50 flex flex-col gap-1.5 sm:gap-space-6">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-1 truncate max-w-[60%] sm:max-w-[65%]">
              <span className="material-symbols-outlined text-[14px] sm:text-[15px] text-secondary shrink-0">pin_drop</span>
              <span className="truncate">{product.location_name || 'Gandhinagar'}</span>
            </span>
            <span className="text-[11px] sm:text-xs font-medium shrink-0">
              {product.distance_km || 2.5} km away
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            {product.seller_is_verified ? (
              <span className="flex items-center gap-1 text-secondary font-medium">
                <span className="material-symbols-outlined text-[12px] sm:text-[13px]">check_circle</span>
                <span className="hidden xs:inline">Aadhaar</span> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[12px] sm:text-[13px]">shield</span>
                <span className="hidden xs:inline">Community</span> Host
              </span>
            )}
            {isRent && onQuickRent ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickRent(product);
                }}
                className="bg-secondary hover:bg-secondary/90 text-on-secondary px-2 py-0.5 rounded text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                Quick Rent
              </button>
            ) : (
              <span className="text-on-surface-variant truncate max-w-[100px] text-right">
                {product.seller_name || 'Verified Lender'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
