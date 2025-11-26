import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { total, clearCart } = useCart();
  const { speak } = useVoice();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData] = useState(location.state?.orderData || {});

  useEffect(() => {
    if (!orderData.fullName) {
      speak('Missing order information. Redirecting to checkout.');
      navigate('/checkout');
      return;
    }

    speak(`Payment page. Total amount is ₹${total}. Please confirm your payment.`);
  }, [orderData, total, speak, navigate]);

  const handlePayment = async () => {
    setIsProcessing(true);
    speak('Processing your payment. Please wait.');

    // Simulate payment processing
    setTimeout(() => {
      // Clear cart and redirect to success page
      clearCart();
      speak('Payment successful! Your order has been placed.');
      navigate('/order-success', { 
        state: { 
          orderData,
          orderId: 'VC' + Date.now(),
          total 
        }
      });
    }, 3000);
  };

  const handleVoiceAuth = () => {
    speak('Voice authentication started. Please say your name clearly.');
    // This would integrate with voice biometric authentication
    setTimeout(() => {
      speak('Voice authentication successful.');
    }, 2000);
  };

  const handleCancel = () => {
    speak('Payment cancelled. Going back to checkout.');
    navigate('/checkout');
  };

  return (
    <div className="payment-page">
      <div className="container">
        <h1>Payment</h1>
        
        <div className="payment-content">
          <div className="payment-form">
            <div className="order-review">
              <h2>Order Review</h2>
              
              <div className="delivery-info">
                <h3>Delivery Address</h3>
                <p><strong>{orderData.fullName}</strong></p>
                <p>{orderData.address}</p>
                <p>{orderData.city}, {orderData.pincode}</p>
                <p>Phone: {orderData.phone}</p>
              </div>

              <div className="payment-method">
                <h3>Payment Method</h3>
                <div className="selected-method">
                  {orderData.paymentMethod === 'card' && '💳 Credit/Debit Card'}
                  {orderData.paymentMethod === 'upi' && '📱 UPI Payment'}
                  {orderData.paymentMethod === 'cod' && '💰 Cash on Delivery'}
                </div>
              </div>
            </div>

            {orderData.paymentMethod !== 'cod' && (
              <div className="payment-security">
                <h2>Secure Payment</h2>
                
                <div className="voice-auth-section">
                  <h3>Voice Authentication</h3>
                  <p>For added security, please authenticate with your voice</p>
                  <button 
                    className="voice-auth-btn"
                    onClick={handleVoiceAuth}
                  >
                    🎤 Authenticate with Voice
                  </button>
                </div>

                <div className="payment-gateway">
                  <div className="secure-badge">
                    🔒 Secure Payment Gateway
                  </div>
                  <p>Your payment information is encrypted and secure</p>
                </div>
              </div>
            )}

            <div className="payment-actions">
              <button 
                className="confirm-payment-btn"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>⏳ Processing Payment...</>
                ) : (
                  <>✅ Confirm Payment (₹{total})</>
                )}
              </button>
              
              <button 
                className="cancel-btn"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                ❌ Cancel Payment
              </button>
            </div>
          </div>

          <div className="payment-summary">
            <div className="summary-card">
              <h2>Payment Summary</h2>
              
              <div className="amount-breakdown">
                <div className="summary-row">
                  <span>Order Total:</span>
                  <span>₹{total}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Charges:</span>
                  <span>Free</span>
                </div>
                <div className="summary-row">
                  <span>Taxes:</span>
                  <span>Included</span>
                </div>
                <div className="summary-row total-row">
                  <span>Amount to Pay:</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <div className="security-info">
                <h4>🔒 Your payment is secure</h4>
                <ul>
                  <li>256-bit SSL encryption</li>
                  <li>Voice biometric verification</li>
                  <li>PCI DSS compliant</li>
                </ul>
              </div>
            </div>

            <div className="voice-commands">
              <h4>Voice Commands:</h4>
              <p>Try saying: "Confirm payment", "Authenticate with voice", or "Cancel payment"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;