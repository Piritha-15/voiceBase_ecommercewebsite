import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated) {
        await fetchWishlist();
      } else {
        setWishlistItems([]);
      }
    };
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/accounts/wishlist/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!token) {
      alert('Please login to add items to wishlist');
      return { success: false };
    }

    try {
      const response = await fetch('http://localhost:8000/api/accounts/wishlist/toggle/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId })
      });

      const data = await response.json();
      
      if (response.ok) {
        await fetchWishlist(); // Refresh wishlist
        return { success: true, inWishlist: data.in_wishlist };
      }
      return { success: false };
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return { success: false };
    }
  };

  const isInWishlist = (productId) => {
    if (!Array.isArray(wishlistItems)) return false;
    return wishlistItems.some(item => item.product.id === productId);
  };

  const removeFromWishlist = async (wishlistItemId) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/accounts/wishlist/${wishlistItemId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        await fetchWishlist();
        return { success: true };
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
    return { success: false };
  };

  const value = {
    wishlistItems,
    loading,
    toggleWishlist,
    isInWishlist,
    removeFromWishlist,
    refreshWishlist: fetchWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
