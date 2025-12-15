import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import { useAuth } from '../context/AuthContext';
import { useVoiceNarration } from '../context/VoiceNarrationContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, total, getItemCount } = useCart();
  const { speak } = useVoice();
  const { user, isAuthenticated, token, loading: authLoading } = useAuth();
  const { narratePageLoad, narrateClick } = useVoiceNarration();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'card'
  });
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      speak('Please login to proceed with checkout');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    if (cartItems.length === 0) {
      speak('Your cart is empty. Redirecting to home page.');
      navigate('/');
      return;
    }
  }, [authLoading, isAuthenticated, cartItems, speak, navigate]);

  // Auto-fill user profile data and fetch addresses
  useEffect(() => {
    if (isAuthenticated && user && token) {
      loadUserData();
    }
  }, [isAuthenticated, user, token, loadUserData]);

  // Narrate page load
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      narratePageLoad('Checkout page');
      speak(`Checkout page. Total amount is ₹${total}. Your profile details have been pre-filled.`);
    }
  }, [isAuthenticated, authLoading, total, speak, narratePageLoad]);

  const loadUserData = async () => {
    try {
      // Auto-fill user profile data
      const userFullName = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.username;
      
      setFormData(prev => ({
        ...prev,
        fullName: userFullName,
        phone: user.phone || ''
      }));

      // Fetch user addresses
      await fetchAddresses();
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/accounts/addresses/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const addressList = Array.isArray(data) ? data : data.results || [];
        setAddresses(addressList);
        
        // Auto-select default address if available
        const defaultAddress = addressList.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setFormData(prev => ({
            ...prev,
            fullName: defaultAddress.full_name,
            phone: defaultAddress.phone,
            address: defaultAddress.address_line1 + (defaultAddress.address_line2 ? ', ' + defaultAddress.address_line2 : ''),
            city: defaultAddress.city,
            pincode: defaultAddress.pincode
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = (addressId) => {
    narrateClick('address selection');
    const selectedAddress = addresses.find(addr => addr.id === parseInt(addressId));
    if (selectedAddress) {
      setSelectedAddressId(addressId);
      setFormData(prev => ({
        ...prev,
        fullName: selectedAddress.full_name,
        phone: selectedAddress.phone,
        address: selectedAddress.address_line1 + (selectedAddress.address_line2 ? ', ' + selectedAddress.address_line2 : ''),
        city: selectedAddress.city,
        pincode: selectedAddress.pincode
      }));
      speak(`Selected ${selectedAddress.address_type} address for ${selectedAddress.full_name}`);
    }
  };

  const handleEditDetails = () => {
    narrateClick('edit details button');
    setIsEditingDetails(!isEditingDetails);
    speak(isEditingDetails ? 'Details locked' : 'You can now edit your details');
  };

  const handleNewAddress = () => {
    narrateClick('add new address button');
    navigate('/addresses');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      speak('Please fill in all required fields');
      return;
    }

    // Phone number validation
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      speak('Please enter a valid 10-digit phone number');
      return;
    }

    // PIN code validation
    if (!/^\d{6}$/.test(formData.pincode)) {
      speak('Please enter a valid 6-digit PIN code');
      return;
    }

    speak('Proceeding to secure payment');
    navigate('/payment', { 
      state: { 
        orderData: {
          ...formData,
          userId: user.id,
          userEmail: user.email
        }
      } 
    });
  };

  const handleVoiceAddress = () => {
    speak('Please say your complete address after the beep');
    // This would integrate with voice recognition
  };

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1>🛒 Checkout</h1>
          <p>Loading your details...</p>
        </div>
      </div>
    );
  }

  // Redirect handled in useEffect, but show message if somehow reached here
  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1>🛒 Checkout</h1>
          <div className="auth-required">
            <h2>🔐 Login Required</h2>
            <p>Please login to proceed with checkout</p>
            <button onClick={() => navigate('/login')} className="login-btn">
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>🛒 Secure Checkout</h1>
        <p className="welcome-message">Welcome back, {user?.first_name || user?.username}!</p>
        
        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              {/* Address Selection Section */}
              {addresses.length > 0 && (
                <div className="form-section">
                  <h2>📍 Select Delivery Address</h2>
                  <div className="address-selection">
                    <select 
                      value={selectedAddressId} 
                      onChange={(e) => handleAddressSelect(e.target.value)}
                      className="address-select"
                    >
                      <option value="">Choose saved address...</option>
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.address_type.toUpperCase()} - {address.full_name} ({address.city})
                        </option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      className="new-address-btn"
                      onClick={handleNewAddress}
                    >
                      ➕ Add New Address
                    </button>
                  </div>
                </div>
              )}

              <div className="form-section">
                <div className="section-header">
                  <h2>📋 Delivery Information</h2>
                  <button 
                    type="button" 
                    className="edit-btn"
                    onClick={handleEditDetails}
                  >
                    {isEditingDetails ? '🔒 Lock Details' : '✏️ Edit Details'}
                  </button>
                </div>
                
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditingDetails}
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
                    disabled={!isEditingDetails}
                    placeholder="Enter 10-digit mobile number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    Address *
                    {isEditingDetails && (
                      <button 
                        type="button" 
                        className="voice-input-btn"
                        onClick={handleVoiceAddress}
                      >
                        🎤 Voice Input
                      </button>
                    )}
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditingDetails}
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
                      disabled={!isEditingDetails}
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
                      disabled={!isEditingDetails}
                      pattern="[0-9]{6}"
                      placeholder="6-digit PIN code"
                      required
                    />
                  </div>
                </div>

                {!isEditingDetails && (
                  <div className="info-message">
                    <p>ℹ️ Your profile details have been auto-filled. Click "Edit Details" to make changes.</p>
                  </div>
                )}
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

              <div className="checkout-actions">
                <button type="submit" className="place-order-btn">
                  🚀 Secure Checkout (₹{total})
                </button>
                <p className="security-note">
                  🔒 Your information is secure and encrypted
                </p>
              </div>
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