import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('sharekart_cart');
      return saved ? JSON.parse(saved) : [
        // Seed default items from UI design (2 items in badge)
        {
          id: 1,
          title: 'Sony Alpha A6400 Mirrorless Camera',
          type: 'rent',
          price: 850,
          deposit: 3500,
          days: 3,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9l8s94eHGoE5SEWQdGdOGHhgKajHzqfX_gDrZlbFQNbWjaZgx4xlDfSjspD46yrrdmCSUPfZ_b0-kUjK2lVvM03JSrkH96mVUZmeokyrAPAUgOQIRVkn8OxFOlfiUL88oykuWH83dT8_k4sF-ahnhoTsXXoK-WBlOOj1gaKZE2Jhpllbe2ivrt1F1tMAdWsNpWGgqzb_d-18Br2X5TwKxJUMTJCUcqaJYgvNWemO5f4JSkoxFYThGGg'
        },
        {
          id: 2,
          title: 'Bosch Professional Hammer Drill 800W',
          type: 'rent',
          price: 350,
          deposit: 1500,
          days: 2,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBFDSQ5IBN7WBs2FdMYV60uVkfVwA90SyISdGPuvYQnJmaThMfwT_UEq7DmQNAv1BjMEfpS6fBZez8gqaZ-hIsHX8b0CWkSWoivb-fEDJUOT05DuN8BF54Hmk-jWiJ9W4aGx3txOOh2eenRpDj3Bzs8Eqvnt_wjFATaZvyvlnbig0gY9Ue1tmmkiTE3Jl3g3EZur6Ct4RjYCuOQu9EPgtNw7BEBJb2Ecc-EJj3h2ZIeKusEHoOVSZKww'
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sharekart_cart', JSON.stringify(cartItems));
  }, [cartItems]);

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
