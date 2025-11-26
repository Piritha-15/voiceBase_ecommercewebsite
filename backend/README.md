# VoiceCart Backend - Django REST API

Voice-first e-commerce backend built with Django REST Framework.

## Features

- **Voice Authentication**: Biometric voice login and verification
- **Product Management**: Categories, products, reviews, and recommendations
- **Cart System**: Session-based and user-based cart management
- **Order Processing**: Complete checkout and order management
- **Payment Integration**: Support for multiple payment gateways
- **AI Services**: Voice command processing and speech services

## Quick Start

### 1. Setup Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite by default)
DATABASE_URL=sqlite:///db.sqlite3

# Payment Gateways
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Redis (for caching and Celery)
REDIS_URL=redis://127.0.0.1:6379/1
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0

# Voice Processing
VOICE_PROCESSING_ENABLED=True
```

### 4. Database Setup

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Load Sample Data

```bash
python manage.py loaddata sample_data.json
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Products
- `GET /api/products/` - List products
- `GET /api/products/{id}/` - Product details
- `GET /api/products/categories/` - List categories
- `GET /api/products/featured/` - Featured products
- `GET /api/products/recommendations/` - Personalized recommendations
- `POST /api/products/search/voice/` - Voice search

### Cart
- `GET /api/cart/` - Get cart
- `POST /api/cart/add/` - Add to cart
- `PUT /api/cart/update/{item_id}/` - Update cart item
- `DELETE /api/cart/remove/{item_id}/` - Remove from cart
- `DELETE /api/cart/clear/` - Clear cart

### Checkout
- `POST /api/checkout/create/` - Create order
- `GET /api/checkout/order/{order_id}/` - Get order details
- `GET /api/checkout/orders/` - User orders
- `GET /api/checkout/track/{order_id}/` - Track order

### Payments
- `POST /api/payments/create/` - Create payment
- `POST /api/payments/process/` - Process payment
- `GET /api/payments/status/{payment_id}/` - Payment status

### Voice Authentication
- `POST /api/voice/register/` - Register voice profile
- `POST /api/voice/login/` - Voice login
- `POST /api/voice/verify/` - Voice verification

### AI Services
- `POST /api/ai/voice/process/` - Process voice commands
- `POST /api/ai/tts/` - Text to speech
- `POST /api/ai/stt/` - Speech to text

## Project Structure

```
backend/
├── voicecart/          # Main project settings
├── voice_auth/         # Voice authentication app
├── product_assistant/  # Product management app
├── cart/              # Shopping cart app
├── checkout/          # Order processing app
├── payments/          # Payment handling app
├── ai_services/       # AI and voice processing app
├── requirements.txt   # Python dependencies
└── manage.py         # Django management script
```

## Development

### Running Tests

```bash
python manage.py test
```

### Creating Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Admin Interface

Access the admin interface at `http://localhost:8000/admin/` using your superuser credentials.

## Production Deployment

1. Set `DEBUG=False` in settings
2. Configure proper database (PostgreSQL recommended)
3. Set up Redis for caching and Celery
4. Configure payment gateway credentials
5. Set up proper logging and monitoring
6. Use a production WSGI server like Gunicorn

## Voice Processing Integration

For production voice processing, integrate with:
- **Speech Recognition**: Google Cloud Speech-to-Text, Azure Speech Services
- **Voice Biometrics**: Nuance, SpeechPro, or custom ML models
- **Text-to-Speech**: Google Cloud TTS, Amazon Polly, Azure Cognitive Services