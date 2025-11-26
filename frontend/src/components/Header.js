import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import { useVoiceNarration } from '../context/VoiceNarrationContext';
import './Header.css';

const Header = () => {
  const { getItemCount } = useCart();
  const { speak } = useVoice();
  const navigate = useNavigate();
  const { narrateClick, narrateNavigation } = useVoiceNarration();

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

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo" onClick={handleLogoClick}>
            <h1>🛒 VoiceCart</h1>
            <span className="tagline">Voice Shopping Made Easy</span>
          </div>
          
          <nav className="nav-menu">
            <Link 
              to="/category/health" 
              className="nav-link"
              onClick={() => {
                narrateClick('Health category link');
                narrateNavigation('Health category page');
              }}
            >
              Health
            </Link>
            <Link 
              to="/category/nutrition" 
              className="nav-link"
              onClick={() => {
                narrateClick('Nutrition category link');
                narrateNavigation('Nutrition category page');
              }}
            >
              Nutrition
            </Link>
            <Link 
              to="/category/essentials" 
              className="nav-link"
              onClick={() => {
                narrateClick('Essentials category link');
                narrateNavigation('Essentials category page');
              }}
            >
              Essentials
            </Link>
          </nav>

          <div className="header-actions">
            <button className="cart-button" onClick={handleCartClick}>
              🛒 Cart ({getItemCount()})
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;