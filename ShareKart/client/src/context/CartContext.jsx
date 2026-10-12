import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const getStorageKey = (uid) => (uid ? `sharekart_cart_${uid}` : 'sharekart_cart_guest');

const isMockSeed = (items) => {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.some(
    (item) =>
      item?.title === 'Sony Alpha A6400 Mirrorless Camera' ||
      item?.title === 'Bosch Professional Hammer Drill 800W'
  );
};

const readCartFromStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || isMockSeed(parsed)) {
      localStorage.removeItem(key);
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || null;
  const activeUserIdRef = useRef(currentUserId);
  const isInitialMount = useRef(true);

  // Clean up legacy mock data from old 'sharekart_cart' key if present
  useEffect(() => {
    try {
      const oldRaw = localStorage.getItem('sharekart_cart');
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        if (isMockSeed(oldParsed)) {
          localStorage.removeItem('sharekart_cart');
        }
      }
    } catch {}
  }, []);

  const [cartItems, setCartItems] = useState(() => {
    const key = getStorageKey(currentUserId);
    const saved = readCartFromStorage(key);
    if (saved !== null) return saved;

    // Check legacy key if exists and not mock
    const legacy = readCartFromStorage('sharekart_cart');
    if (legacy !== null && legacy.length > 0) return legacy;

    return [];
  });

  // When active user changes (e.g., newly registered user logs in, persona switches, or logout)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (activeUserIdRef.current !== currentUserId) {
      activeUserIdRef.current = currentUserId;
      const key = getStorageKey(currentUserId);
      const saved = readCartFromStorage(key);
      setCartItems(saved || []);
    }
  }, [currentUserId]);

  // Persist cart items only for the active user that owns these items
  useEffect(() => {
    if (activeUserIdRef.current === currentUserId) {
      const key = getStorageKey(currentUserId);
      localStorage.setItem(key, JSON.stringify(cartItems));
    }
  }, [cartItems, currentUserId]);

  const addToCart = (product, type = 'rent', days = 3) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.type === type);
      if (existing) {
        return prev;
      }
      return [...prev, {
        id: product.id,
        title: product.title,
        type,
        price: type === 'rent' ? product.rent_price_daily : product.sale_price,
        deposit: type === 'rent' ? product.security_deposit : 0,
        days: type === 'rent' ? days : 1,
        image: Array.isArray(product.images) ? product.images[0] : (product.image || '')
      }];
    });
  };

  const removeFromCart = (id, type) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.type === type)));
  };

  const clearCart = () => {
    setCartItems([]);
    const key = getStorageKey(currentUserId);
    localStorage.removeItem(key);
    localStorage.removeItem('sharekart_cart');
    localStorage.removeItem('sharekart_cart_guest');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount: cartItems.length,
      addToCart,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
