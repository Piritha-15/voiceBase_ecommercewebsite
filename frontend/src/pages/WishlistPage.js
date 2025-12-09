import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './WishlistPage.css';

function WishlistPage() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (product) => {
    await addToCart(product);
  };

  const handleRemove = async (itemId) => {
    await removeFromWishlist(itemId);
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <h1>My Wishlist ❤️</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(wishlistItems) || wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <h1>My Wishlist ❤️</h1>
          <div className="empty-wishlist">
            <div className="empty-icon">💔</div>
            <h2>Your wishlist is empty</h2>
            <p>Add products you love to your wishlist</p>
            <Link to="/" className="browse-button">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1>My Wishlist ❤️</h1>
        <p className="wishlist-count">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</p>

        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlist-card">
              <button 
                className="remove-button"
                onClick={() => handleRemove(item.id)}
                title="Remove from wishlist"
              >
                ✕
              </button>

              <Link to={`/product/${item.product.id}`} className="product-link">
                <div className="product-image">
                  <span className="product-emoji">{item.product.image_emoji}</span>
                </div>

                <div className="product-info">
                  <h3>{item.product.name}</h3>
                  <p className="product-description">{item.product.description}</p>
                  
                  <div className="product-rating">
                    <span className="stars">{'⭐'.repeat(Math.round(item.product.rating))}</span>
                    <span className="rating-text">{item.product.rating} ({item.product.review_count} reviews)</span>
                  </div>

                  <div className="product-footer">
                    <span className="product-price">₹{item.product.price}</span>
                    {item.product.in_stock ? (
                      <span className="stock-status in-stock">In Stock</span>
                    ) : (
                      <span className="stock-status out-of-stock">Out of Stock</span>
                    )}
                  </div>
                </div>
              </Link>

              <button 
                className="add-to-cart-button"
                onClick={() => handleAddToCart(item.product)}
                disabled={!item.product.in_stock}
              >
                {item.product.in_stock ? '🛒 Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WishlistPage;
