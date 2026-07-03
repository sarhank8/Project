import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart on auth change
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const response = await api.get('/cart');
          setCartItems(response.data);
        } catch (error) {
          console.error("Error loading cart from backend", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Load from localStorage for guest users
        const localCart = localStorage.getItem('aab_e_hayat_cart');
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        } else {
          setCartItems([]);
        }
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Sync guest cart to localStorage when it changes
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('aab_e_hayat_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = async (product, quantity = 1, size = '6ml') => {
    if (isAuthenticated) {
      try {
        const response = await api.post('/cart', {
          product_id: product.id,
          quantity,
          size
        });
        // Reload cart to make sure we have clean items list
        const cartRes = await api.get('/cart');
        setCartItems(cartRes.data);
      } catch (error) {
        console.error("Error adding to database cart", error);
        throw error;
      }
    } else {
      // Local storage logic
      setCartItems((prevItems) => {
        const existingIdx = prevItems.findIndex(
          (item) => item.product_id === product.id && item.size === size
        );
        if (existingIdx > -1) {
          const updated = [...prevItems];
          updated[existingIdx].quantity += quantity;
          return updated;
        } else {
          // Mock CartItemResponse structure
          return [
            ...prevItems,
            {
              id: Date.now(), // temporary local ID
              product_id: product.id,
              quantity,
              size,
              product
            }
          ];
        }
      });
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/cart/${itemId}`);
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      } catch (error) {
        console.error("Error deleting from database cart", error);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    if (isAuthenticated) {
      try {
        await api.put(`/cart/${itemId}`, { quantity });
        setCartItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
        );
      } catch (error) {
        console.error("Error updating database cart quantity", error);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
        setCartItems([]);
      } catch (error) {
        console.error("Error clearing database cart", error);
      }
    } else {
      setCartItems([]);
    }
  };

  // Helper calculation functions
  const getItemPrice = (basePrice, size) => {
    if (size === '3ml') return basePrice * 0.7;
    if (size === '12ml') return basePrice * 1.6;
    return basePrice;
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = getItemPrice(item.product.price, item.size);
    return acc + price * item.quantity;
  }, 0);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal: roundToTwo(subtotal),
        cartCount,
        getItemPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const roundToTwo = (num) => {
  return +(Math.round(num + "e+2") + "e-2");
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
