import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import { useVoiceNarration } from '../context/VoiceNarrationContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import './Header.css';

const Header = () => {
  const { getItemCount } = useCart();
  const { speak } = useVoice();
  const navigate = useNavigate();
  const { narrateClick, narrateNavigation } = useVoiceNarration();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogoClick = () => {
    narrateClick('VoiceCart logo');
    narrateNavigation('home page');
    speak('Going to home page');
    navigate('/');
  };

  const handleCartClick = () => {
    const itemCount = getItemCount();
    narrateClick('cart button');
    narrateNavigation('cart page');
    speak(`Going to cart. You have ${itemCount} items in your cart`);
    navigate('/cart');
  };

  const handleWishlistClick = () => {
    narrateClick('wishlist button');
    narrateNavigation('wishlist page');
    speak(`Going to wishlist. You have ${wishlistItems.length} items in your wishlist`);
    navigate('/wishlist');
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    speak('You have been logged out');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        {/* Top Row: Logo, Wishlist, Cart, Profile */}
        <div className="header-top">
          <div className="logo" onClick={handleLogoClick}>
            <h1>🛒 VoiceCart</h1>
            <span className="tagline">Voice Shopping Made Easy</span>
          </div>

          <div className="header-actions">
            {isAuthenticated && (
              <button className="wishlist-button" onClick={handleWishlistClick}>
                ❤️ Wishlist ({wishlistItems.length})
              </button>
            )}
            
            <button className="cart-button" onClick={handleCartClick}>
              🛒 Cart ({getItemCount()})
            </button>

            {isAuthenticated ? (
              <div className="user-menu">
                <button 
                  className="user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  👤 {user?.first_name || user?.username}
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                      👤 Profile
                    </Link>
                    <Link to="/addresses" onClick={() => setShowUserMenu(false)}>
                      📍 Addresses
                    </Link>
                    <Link to="/orders" onClick={() => setShowUserMenu(false)}>
                      📦 My Orders
                    </Link>
                    <button onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-button">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Row: Navigation Menu */}
        <div className="header-bottom">
          <nav className="nav-menu">
            <Link 
              to="/" 
              className="nav-link home-link"
              onClick={() => {
                narrateClick('Home link');
                narrateNavigation('Home page');
                speak('Going to home page');
              }}
            >
              🏠 Home
            </Link>
            <Link 
              to="/category/health" 
              className="nav-link"
              onClick={() => {
                narrateClick('Health category link');
                narrateNavigation('Health category page');
              }}
            >
              🏥 Health
            </Link>
            <Link 
              to="/category/nutrition" 
              className="nav-link"
              onClick={() => {
                narrateClick('Nutrition category link');
                narrateNavigation('Nutrition category page');
              }}
            >
              🥗 Nutrition
            </Link>
            <Link 
              to="/category/essentials" 
              className="nav-link"
              onClick={() => {
                narrateClick('Essentials category link');
                narrateNavigation('Essentials category page');
              }}
            >
              🏠 Essentials
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;