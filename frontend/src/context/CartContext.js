import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    setCart(cart.map(item => 
      item._id === itemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartCount, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};