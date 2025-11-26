import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import ProductCard from '../components/ProductCard';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { speak } = useVoice();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  useEffect(() => {
    // Mock product data
    const mockProduct = {
      id: parseInt(id),
      name: 'Blood Pressure Monitor',
      price: 2500,
      image: '🩺',
      description: 'Digital blood pressure monitor with large display, perfect for seniors. Features easy-to-read numbers and voice announcements.',
      features: [
        'Large LCD display with backlight',
        'Voice announcement of readings',
        'Memory for 60 readings',
        'Irregular heartbeat detection',
        'One-touch operation'
      ],
      rating: 4.5,
      reviews: 128,
      inStock: true
    };

    setProduct(mockProduct);

    // Mock suggested products
    setSuggestedProducts([
      { id: 4, name: 'Glucose Monitor', price: 1800, image: '🔬' },
      { id: 7, name: 'Thermometer', price: 350, image: '🌡️' },
      { id: 8, name: 'Pulse Oximeter', price: 1200, image: '📱' }
    ]);

    speak(`Showing details for ${mockProduct.name}. Price is ₹${mockProduct.price}.`);
  }, [id, speak]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      speak(`Added ${quantity} ${product.name} to cart`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      speak('Going to cart for checkout');
      navigate('/cart');
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
      speak(`Quantity set to ${newQuantity}`);
    }
  };

  if (!product) {
    return <div className="loading">Loading product details...</div>;
  }

  return (
    <div className="product-details-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <span onClick={() => navigate('/')}>Home</span> / 
          <span onClick={() => navigate(-1)}>Products</span> / 
          <span className="current">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="product-details">
          <div className="product-image-section">
            <div className="product-image-large">
              {product.image}
            </div>
          </div>

          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              <span className="stars">⭐⭐⭐⭐⭐</span>
              <span className="rating-text">({product.reviews} reviews)</span>
            </div>

            <div className="product-price">₹{product.price}</div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            <div className="product-features">
              <h3>Key Features:</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button onClick={() => handleQuantityChange(quantity + 1)}>
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                >
                  🛒 Add to Cart
                </button>
                <button 
                  className="buy-now-btn"
                  onClick={handleBuyNow}
                >
                  ⚡ Buy Now
                </button>
              </div>
            </div>

            <div className="voice-commands">
              <h4>Voice Commands:</h4>
              <p>Try saying: "Add to cart", "Buy now", or "What are the features?"</p>
            </div>
          </div>
        </div>

        {/* Suggested Products */}
        <section className="suggested-products">
          <h2>You might also like</h2>
          <div className="products-grid">
            {suggestedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetailsPage;