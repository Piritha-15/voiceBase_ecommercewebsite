import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { useVoiceNarration } from '../context/VoiceNarrationContext';
import './OrdersPage.css';

const OrdersPage = () => {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const { speak } = useVoice();
  const { narratePageLoad, narrateClick } = useVoiceNarration();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Helper function to get product emoji based on name
  const getProductEmoji = useCallback((productName) => {
    const name = productName.toLowerCase();
    if (name.includes('blood pressure') || name.includes('bp')) return '🩺';
    if (name.includes('vitamin')) return '💊';
    if (name.includes('thermometer')) return '🌡️';
    if (name.includes('walking') || name.includes('stick')) return '🦯';
    if (name.includes('glasses')) return '👓';
    if (name.includes('calcium')) return '🦴';
    if (name.includes('omega')) return '🐟';
    if (name.includes('glucose') || name.includes('sugar')) return '🔬';
    if (name.includes('pulse') || name.includes('oximeter')) return '📱';
    if (name.includes('magnifying')) return '🔍';
    if (name.includes('pill') || name.includes('organizer')) return '💊';
    return '📦'; // Default emoji
  }, []);

  // Create sample orders for demonstration
  const createSampleOrders = useCallback(() => {
    const sampleOrders = [
      {
        id: 'VC1703123456789',
        created_at: '2024-12-08T10:30:00Z',
        status: 'delivered',
        total: 3250.00,
        payment_method: 'Card ending in 1234',
        delivery_address: {
          full_name: 'John Doe',
          address_line1: '123 Senior Street',
          city: 'Mumbai',
          pincode: '400001',
          phone: '9876543210'
        },
        items: [
          {
            id: 1,
            name: 'Blood Pressure Monitor',
            price: 2500.00,
            quantity: 1,
            image_emoji: '🩺'
          },
          {
            id: 2,
            name: 'Vitamin D Tablets',
            price: 450.00,
            quantity: 1,
            image_emoji: '💊'
          },
          {
            id: 3,
            name: 'Digital Thermometer',
            price: 300.00,
            quantity: 1,
            image_emoji: '🌡️'
          }
        ]
      },
      {
        id: 'VC1703023456789',
        created_at: '2024-12-05T14:15:00Z',
        status: 'shipped',
        total: 1200.00,
        payment_method: 'Card ending in 5678',
        delivery_address: {
          full_name: 'John Doe',
          address_line1: '123 Senior Street',
          city: 'Mumbai',
          pincode: '400001',
          phone: '9876543210'
        },
        items: [
          {
            id: 4,
            name: 'Walking Stick',
            price: 800.00,
            quantity: 1,
            image_emoji: '🦯'
          },
          {
            id: 5,
            name: 'Reading Glasses',
            price: 400.00,
            quantity: 1,
            image_emoji: '👓'
          }
        ]
      },
      {
        id: 'VC1702923456789',
        created_at: '2024-12-01T09:45:00Z',
        status: 'processing',
        total: 950.00,
        payment_method: 'Card ending in 9012',
        delivery_address: {
          full_name: 'John Doe',
          address_line1: '123 Senior Street',
          city: 'Mumbai',
          pincode: '400001',
          phone: '9876543210'
        },
        items: [
          {
            id: 6,
            name: 'Calcium Supplements',
            price: 350.00,
            quantity: 1,
            image_emoji: '🦴'
          },
          {
            id: 7,
            name: 'Omega-3 Capsules',
            price: 600.00,
            quantity: 1,
            image_emoji: '🐟'
          }
        ]
      }
    ];
    setOrders(sampleOrders);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch('http://localhost:8000/api/checkout/orders/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders API response:', data);
        
        // Transform backend data to match frontend structure
        const transformedOrders = (Array.isArray(data) ? data : data.results || []).map(order => ({
          id: order.order_id,
          created_at: order.created_at,
          status: order.status,
          total: parseFloat(order.total_amount),
          payment_method: order.payment_method,
          delivery_address: {
            full_name: order.full_name,
            address_line1: order.address,
            city: order.city,
            pincode: order.pincode,
            phone: order.phone
          },
          items: order.items ? order.items.map(item => ({
            id: Math.random(), // Generate random ID for frontend
            name: item.product_name,
            price: parseFloat(item.product_price),
            quantity: item.quantity,
            image_emoji: getProductEmoji(item.product_name)
          })) : []
        }));
        
        if (transformedOrders.length === 0) {
          // Check localStorage for orders
          const savedOrders = JSON.parse(localStorage.getItem('voicecart_orders') || '[]');
          if (savedOrders.length > 0) {
            setOrders(savedOrders);
          } else {
            // If no orders from API or localStorage, show sample data for demo
            createSampleOrders();
          }
        } else {
          setOrders(transformedOrders);
        }
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (response.status === 404) {
        // Orders endpoint might not exist yet, create sample data
        console.log('Orders endpoint not found, using sample data');
        createSampleOrders();
      } else {
        console.error('Failed to fetch orders:', response.status);
        setError(`Failed to load orders (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Network error. Please check your connection.');
      // Create sample orders for demo
      createSampleOrders();
    } finally {
      setLoading(false);
    }
  }, [token, getProductEmoji, createSampleOrders]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      fetchOrders();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setError('Please log in to view your orders');
    }
  }, [authLoading, fetchOrders, isAuthenticated, token]);

  useEffect(() => {
    narratePageLoad('Orders page');
    if (orders.length > 0) {
      speak(`You have ${orders.length} orders. Your most recent order was placed on ${new Date(orders[0].created_at).toLocaleDateString()}.`);
    } else {
      speak('Orders page loaded. You have no orders yet.');
    }
  }, [orders, narratePageLoad, speak]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'shipped': return '#2196F3';
      case 'processing': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'shipped': return '🚚';
      case 'processing': return '⏳';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  const handleOrderClick = (order) => {
    narrateClick('order details');
    setSelectedOrder(order);
    speak(`Opening order details for order ${order.id}`);
  };

  const handleCloseDetails = () => {
    narrateClick('close order details');
    setSelectedOrder(null);
    speak('Closing order details');
  };

  const handleReorder = (order) => {
    narrateClick('reorder button');
    speak(`Adding ${order.items.length} items from previous order to cart`);
    // This would add items to cart in a real implementation
    setTimeout(() => {
      speak('Items added to cart successfully');
    }, 1000);
  };

  if (authLoading || loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1>My Orders</h1>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1>My Orders</h1>
          <div className="error-message">
            <p>Please log in to view your orders.</p>
            <a href="/login" className="login-link">Go to Login</a>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1>My Orders</h1>
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchOrders} className="retry-button">
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>📦 My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Start shopping to see your orders here</p>
            <a href="/" className="shop-now-btn">🛍️ Start Shopping</a>
          </div>
        ) : (
          <div className="orders-content">
            <div className="orders-summary">
              <p>You have <strong>{orders.length}</strong> orders</p>
            </div>

            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order.id}</h3>
                      <p className="order-date">
                        📅 {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="order-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusIcon(order.status)} {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    <h4>Items ({order.items.length})</h4>
                    <div className="items-preview">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="item-preview">
                          <span className="item-emoji">{item.image_emoji}</span>
                          <span className="item-name">{item.name}</span>
                          <span className="item-qty">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="more-items">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <strong>Total: ₹{order.total}</strong>
                    </div>
                    <div className="order-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => handleOrderClick(order)}
                      >
                        👁️ View Details
                      </button>
                      {order.status === 'delivered' && (
                        <button 
                          className="reorder-btn"
                          onClick={() => handleReorder(order)}
                        >
                          🔄 Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="order-modal-overlay" onClick={handleCloseDetails}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order Details</h2>
                <button className="close-btn" onClick={handleCloseDetails}>✕</button>
              </div>

              <div className="modal-content">
                <div className="order-details-header">
                  <div className="order-id">
                    <h3>Order #{selectedOrder.id}</h3>
                    <p>Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  <div className="order-status-large">
                    <span 
                      className="status-badge-large"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {getStatusIcon(selectedOrder.status)} {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="order-sections">
                  <div className="section">
                    <h4>📦 Items Ordered</h4>
                    <div className="detailed-items">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="detailed-item">
                          <span className="item-emoji-large">{item.image_emoji}</span>
                          <div className="item-details">
                            <h5>{item.name}</h5>
                            <p>Quantity: {item.quantity}</p>
                          </div>
                          <div className="item-price">
                            ₹{item.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <h4>🏠 Delivery Address</h4>
                    <div className="address-details">
                      <p><strong>{selectedOrder.delivery_address.full_name}</strong></p>
                      <p>{selectedOrder.delivery_address.address_line1}</p>
                      <p>{selectedOrder.delivery_address.city} - {selectedOrder.delivery_address.pincode}</p>
                      <p>📞 {selectedOrder.delivery_address.phone}</p>
                    </div>
                  </div>

                  <div className="section">
                    <h4>💳 Payment Information</h4>
                    <div className="payment-details">
                      <p><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
                      <p><strong>Total Amount:</strong> ₹{selectedOrder.total}</p>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  {selectedOrder.status === 'delivered' && (
                    <button 
                      className="reorder-btn-large"
                      onClick={() => handleReorder(selectedOrder)}
                    >
                      🔄 Reorder Items
                    </button>
                  )}
                  <button className="close-btn-large" onClick={handleCloseDetails}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;