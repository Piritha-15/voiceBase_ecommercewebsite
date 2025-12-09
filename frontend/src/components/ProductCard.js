import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import { useVoiceNarration } from '../context/VoiceNarrationContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { speak } = useVoice();
  const { narrateClick, narrateAddToCart, narrateNavigation } = useVoiceNarration();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleProductClick = () => {
    narrateClick(`${product.name} product card`);
    narrateNavigation(`${product.name} details page`);
    speak(`Opening ${product.name} details`);
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    narrateClick('Add to cart button');
    narrateAddToCart(product.name);
    addToCart(product);
    speak(`Added ${product.name} to cart`);
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      speak('Please login to add items to wishlist');
      navigate('/login');
      return;
    }
    const result = await toggleWishlist(product.id);
    if (result.success) {
      const message = result.inWishlist ? 'Added to wishlist' : 'Removed from wishlist';
      speak(message);
    }
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="product-card" onClick={handleProductClick}>
      {isAuthenticated && (
        <button
          className={`wishlist-icon ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
      )}

      <div className="product-image">
        {product.image_emoji || product.image || '📦'}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {product.rating && (
          <div className="product-rating">
            <span className="stars">{'⭐'.repeat(Math.round(product.rating))}</span>
            <span className="rating-text">{product.rating}</span>
          </div>
        )}

        <p className="product-price">₹{product.price}</p>

        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
        >
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;