import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import { useVoiceNarration } from '../context/VoiceNarrationContext';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { total, clearCart } = useCart();
  const { speak } = useVoice();
  const { narrateClick, narrateFormSubmit } = useVoiceNarration();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData] = useState(location.state?.orderData || {});
  const [paymentStep, setPaymentStep] = useState('details'); // 'details', 'otp', 'processing', 'success'
  const [showOTP, setShowOTP] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    otp: ''
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  const [isVoiceAuthenticated, setIsVoiceAuthenticated] = useState(false);

  useEffect(() => {
    if (!orderData.fullName) {
      speak('Missing order information. Redirecting to checkout.');
      navigate('/checkout');
      return;
    }

    speak(`Payment page. Total amount is ₹${total}. Please enter your card details to proceed.`);
  }, [orderData, total, speak, navigate]);

  // OTP Timer
  useEffect(() => {
    let timer;
    if (showOTP && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showOTP, otpTimer]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Max 16 digits + 3 spaces
    }

    // Format expiry inputs
    if (name === 'expiryMonth' && value.length > 2) return;
    if (name === 'expiryYear' && value.length > 4) return;
    if (name === 'cvv' && value.length > 3) return;
    if (name === 'otp' && value.length > 6) return;

    setPaymentForm(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate payment form
  const validateForm = () => {
    const newErrors = {};

    if (!paymentForm.cardNumber || paymentForm.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!paymentForm.expiryMonth || paymentForm.expiryMonth < 1 || paymentForm.expiryMonth > 12) {
      newErrors.expiryMonth = 'Invalid month';
    }

    if (!paymentForm.expiryYear || paymentForm.expiryYear < new Date().getFullYear()) {
      newErrors.expiryYear = 'Invalid year';
    }

    if (!paymentForm.cvv || paymentForm.cvv.length !== 3) {
      newErrors.cvv = 'Please enter 3-digit CVV';
    }

    if (!paymentForm.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle payment form submission
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    narrateClick('payment form submit');
    
    if (!validateForm()) {
      speak('Please correct the errors in the form');
      return;
    }

    narrateFormSubmit('payment details');
    speak('Payment details validated. Sending OTP to your registered mobile number.');
    
    setPaymentStep('otp');
    setShowOTP(true);
    setOtpTimer(30);
    
    // Simulate OTP sending
    setTimeout(() => {
      speak('OTP sent successfully. Please enter the 6-digit code.');
    }, 1000);
  };

  // Handle OTP verification
  const handleOTPSubmit = (e) => {
    e.preventDefault();
    
    if (!paymentForm.otp || paymentForm.otp.length !== 6) {
      setErrors({ otp: 'Please enter 6-digit OTP' });
      speak('Please enter the complete 6-digit OTP');
      return;
    }

    setPaymentStep('processing');
    setIsProcessing(true);
    speak('Verifying OTP and processing payment. Please wait.');

    // Simulate payment processing
    setTimeout(() => {
      setPaymentStep('success');
      clearCart();
      speak('Payment successful! Your order has been placed successfully.');
      
      // Redirect to success page after a short delay
      setTimeout(() => {
        navigate('/order-success', { 
          state: { 
            orderData,
            orderId: 'VC' + Date.now(),
            total,
            paymentMethod: 'Card ending in ' + paymentForm.cardNumber.slice(-4)
          }
        });
      }, 2000);
    }, 3000);
  };

  // Resend OTP
  const handleResendOTP = () => {
    setOtpTimer(30);
    speak('OTP resent successfully');
  };

  const handleVoiceAuth = () => {
    narrateClick('voice authentication button');
    speak('Voice authentication started. Please say your full name clearly.');
    
    // Simulate voice authentication
    setTimeout(() => {
      setIsVoiceAuthenticated(true);
      speak('Voice authentication successful. You can now proceed with payment.');
    }, 2000);
  };

  const handleCancel = () => {
    speak('Payment cancelled. Going back to checkout.');
    navigate('/checkout');
  };

  return (
    <div className="payment-page">
      <div className="container">
        <h1>💳 Secure Payment Gateway</h1>
        
        <div className="payment-progress">
          <div className={`progress-step ${paymentStep === 'details' ? 'active' : paymentStep !== 'details' ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Card Details</span>
          </div>
          <div className={`progress-step ${paymentStep === 'otp' ? 'active' : paymentStep === 'processing' || paymentStep === 'success' ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">OTP Verification</span>
          </div>
          <div className={`progress-step ${paymentStep === 'processing' || paymentStep === 'success' ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Payment Processing</span>
          </div>
        </div>
        
        <div className="payment-content">
          <div className="payment-form">
            {/* Step 1: Card Details */}
            {paymentStep === 'details' && (
              <div className="card-details-section">
                <h2>💳 Enter Card Details</h2>
                
                <form onSubmit={handlePaymentSubmit} className="payment-form-fields">
                  <div className="form-group">
                    <label>Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentForm.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className={errors.cardNumber ? 'error' : ''}
                    />
                    {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Month *</label>
                      <input
                        type="number"
                        name="expiryMonth"
                        value={paymentForm.expiryMonth}
                        onChange={handleInputChange}
                        placeholder="MM"
                        min="1"
                        max="12"
                        className={errors.expiryMonth ? 'error' : ''}
                      />
                      {errors.expiryMonth && <span className="error-text">{errors.expiryMonth}</span>}
                    </div>

                    <div className="form-group">
                      <label>Expiry Year *</label>
                      <input
                        type="number"
                        name="expiryYear"
                        value={paymentForm.expiryYear}
                        onChange={handleInputChange}
                        placeholder="YYYY"
                        min={new Date().getFullYear()}
                        className={errors.expiryYear ? 'error' : ''}
                      />
                      {errors.expiryYear && <span className="error-text">{errors.expiryYear}</span>}
                    </div>

                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        type="password"
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="3"
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={paymentForm.cardholderName}
                      onChange={handleInputChange}
                      placeholder="Enter name as on card"
                      className={errors.cardholderName ? 'error' : ''}
                    />
                    {errors.cardholderName && <span className="error-text">{errors.cardholderName}</span>}
                  </div>

                  <div className="voice-auth-section">
                    <h3>🎤 Voice Authentication</h3>
                    <p>For added security, please authenticate with your voice</p>
                    <button 
                      type="button"
                      className={`voice-auth-btn ${isVoiceAuthenticated ? 'authenticated' : ''}`}
                      onClick={handleVoiceAuth}
                      disabled={isVoiceAuthenticated}
                    >
                      {isVoiceAuthenticated ? '✅ Voice Authenticated' : '🎤 Authenticate with Voice'}
                    </button>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="proceed-btn"
                      disabled={!isVoiceAuthenticated}
                    >
                      🔒 Proceed to OTP Verification
                    </button>
                    <button 
                      type="button"
                      className="cancel-btn"
                      onClick={handleCancel}
                    >
                      ❌ Cancel Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {paymentStep === 'otp' && (
              <div className="otp-section">
                <h2>📱 OTP Verification</h2>
                <p>We've sent a 6-digit OTP to your registered mobile number</p>
                <p className="masked-phone">+91 ******* {orderData.phone?.slice(-2) || '**'}</p>

                <form onSubmit={handleOTPSubmit} className="otp-form">
                  <div className="form-group">
                    <label>Enter OTP *</label>
                    <input
                      type="text"
                      name="otp"
                      value={paymentForm.otp}
                      onChange={handleInputChange}
                      placeholder="Enter 6-digit OTP"
                      className={`otp-input ${errors.otp ? 'error' : ''}`}
                      maxLength="6"
                    />
                    {errors.otp && <span className="error-text">{errors.otp}</span>}
                  </div>

                  <div className="otp-timer">
                    {otpTimer > 0 ? (
                      <span>Resend OTP in {otpTimer}s</span>
                    ) : (
                      <button type="button" className="resend-btn" onClick={handleResendOTP}>
                        🔄 Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="verify-btn">
                      ✅ Verify & Pay ₹{total}
                    </button>
                    <button 
                      type="button"
                      className="back-btn"
                      onClick={() => setPaymentStep('details')}
                    >
                      ← Back to Card Details
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Processing */}
            {paymentStep === 'processing' && (
              <div className="processing-section">
                <div className="processing-animation">
                  <div className="spinner"></div>
                  <h2>🔄 Processing Payment...</h2>
                  <p>Please do not refresh or close this page</p>
                  <p>Your payment is being processed securely</p>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {paymentStep === 'success' && (
              <div className="success-section">
                <div className="success-animation">
                  <div className="success-icon">✅</div>
                  <h2>🎉 Payment Successful!</h2>
                  <p>Your order has been placed successfully</p>
                  <p>Redirecting to order confirmation...</p>
                </div>
              </div>
            )}
          </div>

          <div className="payment-summary">
            <div className="summary-card">
              <h2>💰 Payment Summary</h2>
              
              <div className="order-info">
                <h3>📦 Delivery Address</h3>
                <p><strong>{orderData.fullName}</strong></p>
                <p>{orderData.address}</p>
                <p>{orderData.city}, {orderData.pincode}</p>
                <p>📞 {orderData.phone}</p>
              </div>
              
              <div className="amount-breakdown">
                <div className="summary-row">
                  <span>Order Total:</span>
                  <span>₹{total}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Charges:</span>
                  <span className="free">Free</span>
                </div>
                <div className="summary-row">
                  <span>Taxes & Fees:</span>
                  <span>Included</span>
                </div>
                <div className="summary-row total-row">
                  <span><strong>Amount to Pay:</strong></span>
                  <span><strong>₹{total}</strong></span>
                </div>
              </div>

              <div className="security-badges">
                <h4>🔒 100% Secure Payment</h4>
                <div className="badges">
                  <span className="badge">🛡️ SSL Encrypted</span>
                  <span className="badge">🎤 Voice Verified</span>
                  <span className="badge">📱 OTP Protected</span>
                </div>
              </div>
            </div>

            <div className="voice-commands">
              <h4>🎤 Voice Commands:</h4>
              <p>Try saying: "Proceed to payment", "Authenticate voice", or "Cancel payment"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;