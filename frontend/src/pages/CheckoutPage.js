import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, total, getItemCount } = useCart();
  const { speak } = useVoice();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'card'
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      speak('Your cart is empty. Redirecting to home page.');
      navigate('/');
      return;
    }
    
    speak(`Checkout page. Total amount is ₹${total}. Please fill in your delivery details.`);
  }, [cartItems, total, speak, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      speak('Please fill in all required fields');
      return;
    }

    speak('Proceeding to payment');
    navigate('/payment', { state: { orderData: formData } });
  };

  const handleVoiceAddress = () => {
    speak('Please say your complete address after the beep');
    // This would integrate with voice recognition
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h2>Delivery Information</h2>
                
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    Address *
                    <button 
                      type="button" 
                      className="voice-input-btn"
                      onClick={handleVoiceAddress}
                    >
                      🎤 Voice Input
                    </button>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter your complete address"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pincode">PIN Code *</label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h2>Payment Method</h2>
                
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-label">
                      💳 Credit/Debit Card
                    </span>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-label">
                      📱 UPI Payment
                    </span>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-label">
                      💰 Cash on Delivery
                    </span>
                  </label>
                </div>
              </div>

              <button type="submit" className="place-order-btn">
                🚀 Place Order (₹{total})
              </button>
            </form>
          </div>

          <div className="order-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>
              
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <span className="item-image">{item.image}</span>
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-quantity">Qty: {item.quantity}</div>
                    </div>
                    <div className="item-price">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal ({getItemCount()} items):</span>
                  <span>₹{total}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery:</span>
                  <span>Free</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total:</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>

            <div className="voice-commands">
              <h4>Voice Commands:</h4>
              <p>Try saying: "Use my home address", "Pay with UPI", or "Confirm order"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;