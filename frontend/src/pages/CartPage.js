import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import { useVoiceNarration } from '../context/VoiceNarrationContext';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, total, updateQuantity, removeFromCart, getItemCount } = useCart();
  const { speak } = useVoice();
  const navigate = useNavigate();
  const { narratePageLoad, narrateClick, narrateQuantityChange, narrateRemoveFromCart, narrateCheckout } = useVoiceNarration();

  useEffect(() => {
    const itemCount = getItemCount();
    narratePageLoad('Cart page');
    if (itemCount === 0) {
      speak('Your cart is empty. You can add items by browsing our products.');
    } else {
      speak(`You have ${itemCount} items in your cart. Total is ₹${total}.`);
    }
  }, [cartItems, total, getItemCount, speak, narratePageLoad]);

  const handleQuantityChange = (productId, newQuantity) => {
    const item = cartItems.find(item => item.id === productId);
    narrateClick('quantity change button');
    narrateQuantityChange(item?.name || 'item', newQuantity);
    updateQuantity(productId, newQuantity);
    if (newQuantity === 0) {
      speak('Item removed from cart');
    } else {
      speak(`Quantity updated to ${newQuantity}`);
    }
  };

  const handleRemoveItem = (productId, productName) => {
    narrateClick('remove item button');
    narrateRemoveFromCart(productName);
    removeFromCart(productId);
    speak(`Removed ${productName} from cart`);
  };

  const handleCheckout = () => {
    narrateClick('checkout button');
    if (cartItems.length === 0) {
      speak('Your cart is empty. Please add items before checkout.');
      return;
    }
    narrateCheckout();
    speak('Going to checkout');
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    narrateClick('continue shopping button');
    speak('Going back to shopping');
    navigate('/');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Your Cart</h1>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <button className="continue-shopping-btn" onClick={handleContinueShopping}>
              🛍️ Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Your Cart ({getItemCount()} items)</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.image}
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-price">₹{item.price} each</p>
                </div>
                
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                
                <div className="item-total">
                  ₹{item.price * item.quantity}
                </div>
                
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  title="Remove item"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>
              
              <div className="summary-row">
                <span>Subtotal ({getItemCount()} items):</span>
                <span>₹{total}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              
              <div className="summary-row total-row">
                <span>Total:</span>
                <span>₹{total}</span>
              </div>
              
              <button className="checkout-btn" onClick={handleCheckout}>
                🚀 Proceed to Checkout
              </button>
              
              <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                ← Continue Shopping
              </button>
            </div>
            
            <div className="voice-commands">
              <h4>Voice Commands:</h4>
              <p>Try saying: "Checkout now", "Remove item 1", or "Continue shopping"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;