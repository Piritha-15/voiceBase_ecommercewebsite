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

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('voicecart_wishlist');
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) {
          setWishlistItems(parsed);
        }
      } catch (error) {
        console.error('Error parsing saved wishlist:', error);
      }
    }
  }, []);

  // Fallback function for localStorage wishlist management
  const handleLocalStorageWishlist = async (productId) => {
    try {
      console.log('📦 Using localStorage fallback for wishlist');
      const savedWishlist = JSON.parse(localStorage.getItem('voicecart_wishlist') || '[]');
      const existingIndex = savedWishlist.findIndex(item => 
        item.product && item.product.id === productId
      );

      if (existingIndex >= 0) {
        // Remove from wishlist
        savedWishlist.splice(existingIndex, 1);
        localStorage.setItem('voicecart_wishlist', JSON.stringify(savedWishlist));
        setWishlistItems(savedWishlist);
        return { success: true, inWishlist: false };
      } else {
        // Add to wishlist - we need to fetch product details
        try {
          const productResponse = await fetch(`http://localhost:8000/api/products/${productId}/`);
          if (productResponse.ok) {
            const product = await productResponse.json();
            const newItem = {
              id: Date.now(), // Temporary ID
              product: product,
              added_at: new Date().toISOString()
            };
            savedWishlist.push(newItem);
            localStorage.setItem('voicecart_wishlist', JSON.stringify(savedWishlist));
            setWishlistItems(savedWishlist);
            return { success: true, inWishlist: true };
          }
        } catch (productError) {
          console.error('Error fetching product for wishlist:', productError);
        }
        return { success: false, error: 'Could not add to wishlist' };
      }
    } catch (error) {
      console.error('Error with localStorage wishlist:', error);
      return { success: false, error: error.message };
    }
  };

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
    if (!token) {
      console.log('❌ No token available for fetching wishlist');
      return;
    }
    
    console.log('📥 Fetching wishlist...');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/accounts/wishlist/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      console.log('📥 Wishlist fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Wishlist data received:', data);
        const items = Array.isArray(data) ? data : data.results || [];
        setWishlistItems(items);
        // Save to localStorage
        localStorage.setItem('voicecart_wishlist', JSON.stringify(items));
      } else {
        console.error('❌ Failed to fetch wishlist:', response.status);
        const errorData = await response.text();
        console.error('❌ Error details:', errorData);
        // Fallback to localStorage
        const savedWishlist = JSON.parse(localStorage.getItem('voicecart_wishlist') || '[]');
        setWishlistItems(savedWishlist);
      }
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      // Fallback to localStorage
      const savedWishlist = JSON.parse(localStorage.getItem('voicecart_wishlist') || '[]');
      setWishlistItems(savedWishlist);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    console.log('🛍️ Toggling wishlist for product ID:', productId);
    console.log('🔑 Token available:', !!token);
    console.log('🔐 Is authenticated:', isAuthenticated);
    
    if (!token) {
      console.log('❌ No token available');
      alert('Please login to add items to wishlist');
      return { success: false };
    }

    try {
      console.log('📤 Sending wishlist toggle request...');
      const response = await fetch('http://localhost:8000/api/accounts/wishlist/toggle/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId })
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (response.ok) {
        console.log('✅ Wishlist toggle successful, refreshing wishlist...');
        await fetchWishlist(); // Refresh wishlist
        return { success: true, inWishlist: data.in_wishlist };
      } else {
        console.error('❌ Wishlist toggle failed:', data);
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('❌ Error toggling wishlist:', error);
      // Fallback to localStorage for demo
      return handleLocalStorageWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    if (!Array.isArray(wishlistItems)) return false;
    const found = wishlistItems.some(item => 
      item.product && item.product.id === productId
    );
    console.log(`🔍 Checking if product ${productId} is in wishlist:`, found);
    return found;
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
