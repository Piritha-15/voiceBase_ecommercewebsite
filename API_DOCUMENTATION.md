# 📚 VoiceCart API Documentation

## Overview

The VoiceCart API is a RESTful web service built with Django REST Framework that provides comprehensive e-commerce functionality with voice-first design principles.

**Base URL**: `http://localhost:8000/api/`

## Authentication

All authenticated endpoints require a token in the Authorization header:

```
Authorization: Token your_token_here
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "data": {},
  "message": "Success message",
  "status": "success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {},
  "status": "error"
}
```

## Endpoints

### 🔐 Authentication

#### Register User
**POST** `/accounts/register/`

Creates a new user account.

**Request Body:**
```json
{
  "username": "string (required, unique)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "password_confirm": "string (required, must match password)",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "phone": "string (optional, 10 digits)"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "phone": "9876543210",
    "created_at": "2024-12-15T10:30:00Z"
  },
  "token": "abc123def456...",
  "message": "Registration successful"
}
```

#### Login User
**POST** `/accounts/login/`

Authenticates user and returns access token.

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
  },
  "token": "abc123def456...",
  "message": "Login successful"
}
```

#### Logout User
**POST** `/accounts/logout/`

Invalidates the current user token.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

#### Get User Profile
**GET** `/accounts/profile/`

Retrieves current user profile information.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "User",
  "phone": "9876543210",
  "date_of_birth": "1955-01-01",
  "created_at": "2024-12-15T10:30:00Z"
}
```

#### Update User Profile
**PUT** `/accounts/profile/`

Updates user profile information.

**Headers:** `Authorization: Token abc123...`

**Request Body:**
```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "phone": "string (optional)",
  "date_of_birth": "date (optional, YYYY-MM-DD)"
}
```

### 🛍️ Products

#### List Products
**GET** `/products/`

Retrieves paginated list of products.

**Query Parameters:**
- `category`: Filter by category name (string)
- `search`: Search in name and description (string)
- `max_price`: Maximum price filter (decimal)
- `sort`: Sort order (price_low, price_high, rating, name)
- `page`: Page number (integer, default: 1)
- `page_size`: Items per page (integer, default: 20)

**Response (200 OK):**
```json
{
  "count": 49,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Blood Pressure Monitor",
      "description": "Digital BP monitor with voice guidance",
      "price": "2500.00",
      "category": 1,
      "category_name": "Health & Medical",
      "image_emoji": "🩺",
      "features": [
        "Large LCD display",
        "Voice announcement",
        "Memory storage"
      ],
      "in_stock": true,
      "stock_quantity": 25,
      "rating": "4.50",
      "review_count": 128,
      "is_featured": true
    }
  ]
}
```

#### Get Product Details
**GET** `/products/{id}/`

Retrieves detailed information for a specific product.

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Blood Pressure Monitor",
  "description": "Digital blood pressure monitor with large display...",
  "price": "2500.00",
  "category": {
    "id": 1,
    "name": "health",
    "description": "Medical devices and health monitoring equipment"
  },
  "category_name": "Health & Medical",
  "image_emoji": "🩺",
  "features": [
    "Large LCD display with backlight",
    "Voice announcement of readings",
    "Memory for 60 readings"
  ],
  "in_stock": true,
  "stock_quantity": 25,
  "rating": "4.50",
  "review_count": 128,
  "is_featured": true,
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Excellent product for seniors",
      "user_name": "John",
      "created_at": "2024-12-10T15:30:00Z"
    }
  ]
}
```

#### Voice Search Products
**POST** `/products/voice-search/`

Searches products using natural language voice input.

**Request Body:**
```json
{
  "query": "blood pressure monitor for seniors"
}
```

**Response (200 OK):**
```json
{
  "query": "blood pressure monitor for seniors",
  "results": [
    {
      "id": 1,
      "name": "Blood Pressure Monitor",
      "price": "2500.00",
      "category_name": "Health & Medical",
      "relevance_score": 0.95
    }
  ],
  "count": 1
}
```

#### Get Categories
**GET** `/products/categories/`

Retrieves list of product categories.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "health",
    "description": "Medical devices and health monitoring equipment",
    "icon": "🏥",
    "product_count": 15
  },
  {
    "id": 2,
    "name": "nutrition",
    "description": "Vitamins, supplements, and nutritional products",
    "icon": "🥗",
    "product_count": 20
  }
]
```

#### Get Featured Products
**GET** `/products/featured/`

Retrieves list of featured products.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Blood Pressure Monitor",
    "price": "2500.00",
    "category_name": "Health & Medical",
    "image_emoji": "🩺",
    "rating": "4.50"
  }
]
```

### 🛒 Shopping Cart

#### Get Cart
**GET** `/cart/`

Retrieves current user's shopping cart.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "id": 1,
  "user": 1,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Blood Pressure Monitor",
        "price": "2500.00",
        "image_emoji": "🩺"
      },
      "quantity": 2,
      "subtotal": "5000.00"
    }
  ],
  "total_amount": "5000.00",
  "item_count": 2,
  "created_at": "2024-12-15T10:30:00Z",
  "updated_at": "2024-12-15T11:00:00Z"
}
```

#### Add to Cart
**POST** `/cart/add/`

Adds a product to the shopping cart.

**Headers:** `Authorization: Token abc123...`

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "product": {
    "id": 1,
    "name": "Blood Pressure Monitor",
    "price": "2500.00"
  },
  "quantity": 2,
  "subtotal": "5000.00",
  "message": "Product added to cart"
}
```

#### Update Cart Item
**PUT** `/cart/update/{item_id}/`

Updates quantity of a cart item.

**Headers:** `Authorization: Token abc123...`

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "quantity": 3,
  "subtotal": "7500.00",
  "message": "Cart item updated"
}
```

#### Remove from Cart
**DELETE** `/cart/remove/{item_id}/`

Removes an item from the cart.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "message": "Item removed from cart"
}
```

#### Clear Cart
**DELETE** `/cart/clear/`

Removes all items from the cart.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "message": "Cart cleared successfully"
}
```

### 📦 Orders & Checkout

#### Create Order
**POST** `/checkout/create/`

Creates a new order from cart items.

**Headers:** `Authorization: Token abc123...`

**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main Street, Apartment 4B",
  "city": "Mumbai",
  "pincode": "400001",
  "payment_method": "card"
}
```

**Response (201 Created):**
```json
{
  "order_id": "VC1703123456789",
  "full_name": "John Doe",
  "phone": "9876543210",
  "address": "123 Main Street, Apartment 4B",
  "city": "Mumbai",
  "pincode": "400001",
  "status": "pending",
  "payment_method": "card",
  "total_amount": "5000.00",
  "items": [
    {
      "product_name": "Blood Pressure Monitor",
      "product_price": "2500.00",
      "quantity": 2,
      "subtotal": "5000.00"
    }
  ],
  "tracking": {
    "tracking_number": "TRKVC1703123456789",
    "current_status": "order_placed",
    "estimated_delivery": "2024-12-20T10:30:00Z"
  },
  "created_at": "2024-12-15T10:30:00Z"
}
```

#### Get User Orders
**GET** `/checkout/orders/`

Retrieves all orders for the authenticated user.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
[
  {
    "order_id": "VC1703123456789",
    "full_name": "John Doe",
    "status": "delivered",
    "payment_method": "card",
    "total_amount": "5000.00",
    "created_at": "2024-12-15T10:30:00Z"
  }
]
```

#### Get Order Details
**GET** `/checkout/order/{order_id}/`

Retrieves detailed information for a specific order.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "order_id": "VC1703123456789",
  "full_name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main Street, Apartment 4B",
  "city": "Mumbai",
  "pincode": "400001",
  "status": "delivered",
  "payment_method": "card",
  "total_amount": "5000.00",
  "items": [
    {
      "product_name": "Blood Pressure Monitor",
      "product_price": "2500.00",
      "quantity": 2,
      "subtotal": "5000.00"
    }
  ],
  "tracking": {
    "tracking_number": "TRKVC1703123456789",
    "current_status": "delivered",
    "estimated_delivery": "2024-12-20T10:30:00Z",
    "actual_delivery": "2024-12-19T14:30:00Z"
  },
  "created_at": "2024-12-15T10:30:00Z",
  "updated_at": "2024-12-19T14:30:00Z"
}
```

#### Track Order
**GET** `/checkout/track/{order_id}/`

Retrieves tracking information for an order.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "order_id": "VC1703123456789",
  "tracking_number": "TRKVC1703123456789",
  "current_status": "shipped",
  "estimated_delivery": "2024-12-20T10:30:00Z",
  "actual_delivery": null,
  "delivery_notes": "Package is out for delivery"
}
```

### ❤️ Wishlist

#### Get Wishlist
**GET** `/accounts/wishlist/`

Retrieves user's wishlist items.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Blood Pressure Monitor",
        "description": "Digital BP monitor with voice guidance",
        "price": "2500.00",
        "category_name": "Health & Medical",
        "image_emoji": "🩺",
        "rating": "4.50",
        "in_stock": true
      },
      "added_at": "2024-12-15T10:30:00Z"
    }
  ]
}
```

#### Toggle Wishlist Item
**POST** `/accounts/wishlist/toggle/`

Adds or removes a product from wishlist.

**Headers:** `Authorization: Token abc123...`

**Request Body:**
```json
{
  "product_id": 1
}
```

**Response (200 OK):**
```json
{
  "message": "Added to wishlist",
  "in_wishlist": true
}
```

#### Remove from Wishlist
**DELETE** `/accounts/wishlist/{item_id}/`

Removes a specific item from wishlist.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "message": "Item removed from wishlist"
}
```

### 📍 Addresses

#### List Addresses
**GET** `/accounts/addresses/`

Retrieves user's saved addresses.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "address_type": "home",
    "full_name": "John Doe",
    "phone": "9876543210",
    "address_line1": "123 Main Street",
    "address_line2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "is_default": true,
    "created_at": "2024-12-15T10:30:00Z"
  }
]
```

#### Create Address
**POST** `/accounts/addresses/`

Creates a new address for the user.

**Headers:** `Authorization: Token abc123...`

**Request Body:**
```json
{
  "address_type": "home",
  "full_name": "John Doe",
  "phone": "9876543210",
  "address_line1": "123 Main Street",
  "address_line2": "Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "is_default": true
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "address_type": "home",
  "full_name": "John Doe",
  "phone": "9876543210",
  "address_line1": "123 Main Street",
  "address_line2": "Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "is_default": true,
  "created_at": "2024-12-15T10:30:00Z"
}
```

#### Update Address
**PUT** `/accounts/addresses/{id}/`

Updates an existing address.

**Headers:** `Authorization: Token abc123...`

**Request Body:** Same as create address

#### Delete Address
**DELETE** `/accounts/addresses/{id}/`

Deletes an address.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "message": "Address deleted successfully"
}
```

#### Set Default Address
**POST** `/accounts/addresses/{id}/set_default/`

Sets an address as the default delivery address.

**Headers:** `Authorization: Token abc123...`

**Response (200 OK):**
```json
{
  "message": "Default address updated"
}
```

## Error Codes

### HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Permission denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Custom Error Codes

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "username": ["This field is required"],
    "email": ["Enter a valid email address"]
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_FAILED`: Invalid credentials
- `PERMISSION_DENIED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `CART_EMPTY`: Cannot checkout with empty cart
- `PRODUCT_OUT_OF_STOCK`: Product not available

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **Search endpoints**: 20 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

Paginated responses include:
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/products/?page=3",
  "previous": "http://localhost:8000/api/products/?page=1",
  "results": []
}
```

## Filtering & Sorting

### Products Filtering
- `category`: Filter by category name
- `search`: Search in name and description
- `max_price`: Maximum price filter
- `min_price`: Minimum price filter
- `in_stock`: Filter by availability (true/false)
- `featured`: Filter featured products (true/false)

### Sorting Options
- `price_low`: Price low to high
- `price_high`: Price high to low
- `rating`: Highest rated first
- `name`: Alphabetical order
- `created`: Newest first

Example:
```
GET /api/products/?category=health&max_price=2000&sort=price_low
```

## Voice API Integration

### Voice Search
The voice search endpoint accepts natural language queries and returns relevant products using NLP processing.

**Example queries:**
- "blood pressure monitor for elderly"
- "vitamins for bone health"
- "walking aids for seniors"

### Voice Commands
Voice commands are processed on the frontend but can trigger API calls:

- Navigation commands → No API call
- Search commands → `/products/voice-search/`
- Cart commands → `/cart/` endpoints
- Order commands → `/checkout/` endpoints

## SDK & Libraries

### JavaScript/React Integration
```javascript
// API Client Example
class VoiceCartAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Token ${this.token}` })
      },
      ...options
    };

    const response = await fetch(url, config);
    return response.json();
  }

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products/?${query}`);
  }

  async searchProducts(query) {
    return this.request('/products/voice-search/', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  // Cart
  async addToCart(productId, quantity = 1) {
    return this.request('/cart/add/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity })
    });
  }
}

// Usage
const api = new VoiceCartAPI('http://localhost:8000/api', userToken);
const products = await api.getProducts({ category: 'health' });
```

## Webhooks

### Order Status Updates
Configure webhooks to receive real-time order status updates:

**Endpoint**: `POST /api/webhooks/order-status/`

**Payload**:
```json
{
  "event": "order.status_changed",
  "order_id": "VC1703123456789",
  "old_status": "processing",
  "new_status": "shipped",
  "timestamp": "2024-12-15T10:30:00Z"
}
```

### Payment Notifications
Receive payment status updates:

**Payload**:
```json
{
  "event": "payment.completed",
  "order_id": "VC1703123456789",
  "payment_method": "card",
  "amount": "5000.00",
  "timestamp": "2024-12-15T10:30:00Z"
}
```

---

For more information or support, please contact the development team or create an issue on GitHub.