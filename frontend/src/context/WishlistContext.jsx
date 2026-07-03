import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist on auth change
  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const response = await api.get('/wishlist');
          setWishlistItems(response.data);
        } catch (error) {
          console.error("Error loading wishlist from backend", error);
        } finally {
          setLoading(false);
        }
      } else {
        const localWish = localStorage.getItem('aab_e_hayat_wishlist');
        if (localWish) {
          setWishlistItems(JSON.parse(localWish));
        } else {
          setWishlistItems([]);
        }
      }
    };

    loadWishlist();
  }, [isAuthenticated]);

  // Sync guest wishlist to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('aab_e_hayat_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  const addToWishlist = async (product) => {
    if (isAuthenticated) {
      try {
        await api.post('/wishlist', { product_id: product.id });
        // Reload
        const res = await api.get('/wishlist');
        setWishlistItems(res.data);
      } catch (error) {
        console.error("Error adding to database wishlist", error);
      }
    } else {
      setWishlistItems((prev) => {
        const exists = prev.some((item) => item.product_id === product.id);
        if (exists) return prev;
        return [
          ...prev,
          {
            id: Date.now(),
            product_id: product.id,
            product
          }
        ];
      });
    }
  };

  const removeFromWishlist = async (itemId) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/wishlist/${itemId}`);
        setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
      } catch (error) {
        console.error("Error removing from database wishlist", error);
      }
    } else {
      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product_id === productId);
  };

  const getWishlistItemId = (productId) => {
    const item = wishlistItems.find((item) => item.product_id === productId);
    return item ? item.id : null;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistItemId
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
