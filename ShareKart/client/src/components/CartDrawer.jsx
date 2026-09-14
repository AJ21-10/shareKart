import React from 'react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ isOpen, onClose, onNavigate }) => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  if (!isOpen) return null;

  const totalFee = cartItems.reduce((sum, item) => sum + (item.price * (item.days || 1)), 0);
  const totalDeposit = cartItems.reduce((sum, item) => sum + (item.deposit || 0), 0);
  const grandTotal = totalFee + totalDeposit + (cartItems.length > 0 ? 99 + 18 : 0);

  const handleCheckoutItem = (item) => {
    onClose();
    onNavigate('checkout', { productId: item.id, days: item.days || 3 });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-primary/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-space-16 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-space-8">
              <span className="material-symbols-outlined text-[24px] text-primary">shopping_bag</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Your Cart ({cartItems.length})</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-space-16 flex flex-col gap-space-12">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-on-surface-variant gap-space-8">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">shopping_cart</span>
                <p className="font-label-bold text-on-surface">Your cart is empty</p>
                <p className="text-body-sm">Explore items to rent or buy from verified neighbors</p>
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div key={`${item.id}-${item.type}-${index}`} className="bg-surface-container-low p-space-12 rounded-lg flex gap-space-12 border border-outline-variant/60">
                  <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded bg-surface-container shrink-0" />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-badge font-badge uppercase px-space-6 py-0.5 rounded ${item.type === 'rent' ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'}`}>
                          {item.type}
                        </span>
                        <button onClick={() => removeFromCart(item.id, item.type)} className="text-error hover:opacity-80 p-1">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                      <h4 className="font-label-bold text-body-sm text-on-surface truncate mt-1">{item.title}</h4>
                      <p className="text-body-sm text-on-surface-variant">
                        {item.type === 'rent' ? `₹${item.price} / day (${item.days} days)` : `₹${item.price}`}
                      </p>
                      {item.deposit > 0 && (
                        <span className="text-[11px] text-secondary font-label-bold">
                          Deposit: ₹{item.deposit} (Refundable)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCheckoutItem(item)}
                      className="text-xs font-label-bold text-secondary hover:underline self-start flex items-center gap-1 mt-1"
                    >
                      <span>Checkout This Item</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cartItems.length > 0 && (
            <div className="p-space-16 border-t border-outline-variant bg-surface-container-low/50 flex flex-col gap-space-12">
              <div className="flex flex-col gap-space-4 text-body-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Items Rental/Purchase Total</span>
                  <span className="font-label-bold text-on-surface">₹{totalFee.toLocaleString('en-IN')}</span>
                </div>
                {totalDeposit > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">shield</span>
                      Refundable Escrow Deposit
                    </span>
                    <span className="font-label-bold">₹{totalDeposit.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant text-xs">
                  <span>Platform Escrow Fee + GST</span>
                  <span>₹117</span>
                </div>
                <div className="h-[1px] bg-outline-variant my-1" />
                <div className="flex justify-between font-label-bold text-body-lg text-on-surface">
                  <span>Total Payable</span>
                  <span className="font-price-md text-price-md font-bold">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-space-8">
                <button
                  onClick={() => handleCheckoutItem(cartItems[0])}
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-on-secondary py-space-12 rounded-lg font-label-bold flex items-center justify-center gap-space-6 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Proceed to Escrow Checkout</span>
                </button>
                <button
                  onClick={clearCart}
                  className="px-space-12 py-space-12 border border-outline-variant rounded-lg text-body-sm font-label-bold text-on-surface-variant hover:text-error"
                  title="Clear Cart"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
