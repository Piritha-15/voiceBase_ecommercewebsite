import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { speak } = useVoice();
    const orderInfo = React.useMemo(() => location.state || {}, [location.state]);

    useEffect(() => {
        if (!orderInfo.orderId) {
            navigate('/');
            return;
        }

        // Save order to localStorage for demo purposes
        const savedOrders = JSON.parse(localStorage.getItem('voicecart_orders') || '[]');
        const newOrder = {
            id: orderInfo.orderId,
            created_at: new Date().toISOString(),
            status: 'processing',
            total: orderInfo.total,
            payment_method: orderInfo.paymentMethod || 'Card payment',
            delivery_address: {
                full_name: orderInfo.orderData?.fullName || 'Customer',
                address_line1: orderInfo.orderData?.address || 'Address',
                city: orderInfo.orderData?.city || 'City',
                pincode: orderInfo.orderData?.pincode || '000000',
                phone: orderInfo.orderData?.phone || '0000000000'
            },
            items: [] // Would be populated from cart in real implementation
        };
        
        savedOrders.unshift(newOrder); // Add to beginning of array
        localStorage.setItem('voicecart_orders', JSON.stringify(savedOrders));

        const successMessage = `Order placed successfully! Your order ID is ${orderInfo.orderId}. Total amount paid is ₹${orderInfo.total}.`;
        speak(successMessage);
    }, [orderInfo, speak, navigate]);

    const handleContinueShopping = () => {
        speak('Going back to home page for more shopping');
        navigate('/');
    };

    const handleTrackOrder = () => {
        speak('Order tracking feature will be available soon');
        // This would navigate to order tracking page
    };

    const handleReadOrderSummary = () => {
        const summary = `Order summary: Order ID ${orderInfo.orderId}, delivered to ${orderInfo.orderData?.fullName}, ${orderInfo.orderData?.address}, ${orderInfo.orderData?.city}. Total amount ₹${orderInfo.total}. Expected delivery in 3 to 5 business days.`;
        speak(summary);
    };

    if (!orderInfo.orderId) {
        return null;
    }

    return (
        <div className="order-success-page">
            <div className="container">
                <div className="success-content">
                    <div className="success-icon">✅</div>

                    <h1>Order Placed Successfully!</h1>

                    <div className="order-details">
                        <div className="order-id">
                            <strong>Order ID: {orderInfo.orderId}</strong>
                        </div>

                        <div className="order-amount">
                            Amount Paid: ₹{orderInfo.total}
                        </div>
                    </div>

                    <div className="delivery-info">
                        <h2>Delivery Information</h2>
                        <div className="info-card">
                            <p><strong>Delivering to:</strong></p>
                            <p>{orderInfo.orderData?.fullName}</p>
                            <p>{orderInfo.orderData?.address}</p>
                            <p>{orderInfo.orderData?.city}, {orderInfo.orderData?.pincode}</p>
                            <p>Phone: {orderInfo.orderData?.phone}</p>
                        </div>

                        <div className="delivery-timeline">
                            <p><strong>Expected Delivery:</strong> 3-5 business days</p>
                            <p>You will receive SMS updates on your registered mobile number</p>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button
                            className="track-order-btn"
                            onClick={handleTrackOrder}
                        >
                            📦 Track Your Order
                        </button>

                        <button
                            className="continue-shopping-btn"
                            onClick={handleContinueShopping}
                        >
                            🛍️ Continue Shopping
                        </button>

                        <button
                            className="voice-summary-btn"
                            onClick={handleReadOrderSummary}
                        >
                            🎤 Read Order Summary
                        </button>
                    </div>

                    <div className="thank-you-message">
                        <h3>Thank you for choosing VoiceCart!</h3>
                        <p>We appreciate your trust in our voice-first shopping experience.
                            Your order will be carefully packed and delivered to your doorstep.</p>
                    </div>

                    <div className="support-info">
                        <h4>Need Help?</h4>
                        <p>For any queries about your order, please contact our customer support:</p>
                        <div className="support-contacts">
                            <p>📞 Call: 1800-123-4567 (Toll Free)</p>
                            <p>📧 Email: support@voicecart.com</p>
                            <p>🕒 Available: 9 AM - 9 PM, All days</p>
                        </div>
                    </div>

                    <div className="voice-commands">
                        <h4>Voice Commands:</h4>
                        <p>Try saying: "Read my order summary", "Continue shopping", or "Track order"</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;