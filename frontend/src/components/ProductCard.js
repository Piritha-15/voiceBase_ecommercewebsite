import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import { useVoiceNarration } from '../context/VoiceNarrationContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { speak } = useVoice();
  const { narrateClick, narrateAddToCart, narrateNavigation } = useVoiceNarration();

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

  return (
    <div className="product-card" onClick={handleProductClick}>
      <div className="product-image">
        {product.image}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
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