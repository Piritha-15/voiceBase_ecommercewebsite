# VoiceCart Setup Guide

Complete setup instructions for the VoiceCart voice-first e-commerce platform.

## Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+ and pip
- **Git** for version control
- **Redis** (optional, for caching)

## Project Overview

VoiceCart consists of:
- **Frontend**: React app with Web Speech API integration
- **Backend**: Django REST API with voice processing capabilities

## Quick Setup (Development)

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Load sample data
python manage.py loaddata sample_data.json

# Start backend server
python manage.py runserver
```

Backend will run at `http://localhost:8000`

### 2. Setup Frontend

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run at `http://localhost:3000`

## Detailed Setup

### Backend Configuration

1. **Environment Variables** (create `backend/.env`):
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Payment Gateways (optional for development)
STRIPE_PUBLIC_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Redis (optional)
REDIS_URL=redis://127.0.0.1:6379/1
```

2. **Database Setup**:
```bash
cd backend
python manage.py makemigrations voice_auth
python manage.py makemigrations product_assistant
python manage.py makemigrations cart
python manage.py makemigrations checkout
python manage.py makemigrations payments
python manage.py migrate
```

3. **Admin Access**:
- Create superuser: `python manage.py createsuperuser`
- Access admin at: `http://localhost:8000/admin/`

### Frontend Configuration

1. **Environment Variables** (create `frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_VOICE_ENABLED=true
```

2. **Voice Features**:
- Requires HTTPS in production
- Needs microphone permissions
- Works best in Chrome/Edge browsers

## Testing the Application

### 1. Basic Functionality
1. Open `http://localhost:3000`
2. Browse products by category
3. Add items to cart
4. Complete checkout process

### 2. Voice Commands
1. Click the floating microphone button (🎤)
2. Try these commands:
   - "Search for vitamins"
   - "Go to health category"
   - "Add to cart"
   - "Show cart"
   - "Checkout now"

### 3. Admin Features
1. Access `http://localhost:8000/admin/`
2. Manage products, categories, orders
3. View voice authentication logs

## API Endpoints

### Products
- `GET /api/products/` - List products
- `GET /api/products/categories/` - Categories
- `POST /api/products/search/voice/` - Voice search

### Cart
- `GET /api/cart/` - Get cart
- `POST /api/cart/add/` - Add to cart

### Orders
- `POST /api/checkout/create/` - Create order
- `GET /api/checkout/order/{id}/` - Order details

### Voice
- `POST /api/voice/login/` - Voice authentication
- `POST /api/ai/voice/process/` - Process voice commands

## Production Deployment

### Backend (Django)

1. **Environment Setup**:
```env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://user:pass@host:port/db
```

2. **Database Migration**:
```bash
python manage.py collectstatic
python manage.py migrate
```

3. **WSGI Server**:
```bash
gunicorn voicecart.wsgi:application
```

### Frontend (React)

1. **Build Production**:
```bash
npm run build
```

2. **Deploy Options**:
- **Netlify**: Drag build folder
- **Vercel**: Connect GitHub repo
- **AWS S3**: Upload build files

### HTTPS Requirements

Voice features require HTTPS in production:
- Use SSL certificates
- Configure reverse proxy (Nginx)
- Update CORS settings

## Troubleshooting

### Common Issues

1. **Voice not working**:
   - Check browser compatibility (Chrome/Edge recommended)
   - Ensure microphone permissions granted
   - Verify HTTPS in production

2. **API connection failed**:
   - Check backend server is running
   - Verify CORS settings in Django
   - Confirm API URL in frontend .env

3. **Database errors**:
   - Run migrations: `python manage.py migrate`
   - Check database permissions
   - Verify database URL in settings

4. **Import errors**:
   - Activate virtual environment
   - Install requirements: `pip install -r requirements.txt`
   - Check Python version compatibility

### Performance Optimization

1. **Backend**:
   - Enable Redis caching
   - Use database indexing
   - Optimize API queries

2. **Frontend**:
   - Enable React production build
   - Use code splitting
   - Optimize images and assets

## Development Workflow

### Adding New Features

1. **Backend Changes**:
   - Create/modify Django models
   - Add API endpoints
   - Update serializers
   - Run migrations

2. **Frontend Changes**:
   - Add React components
   - Update voice commands
   - Modify UI/styling
   - Test voice integration

### Voice Command Development

1. **Add Command Pattern** (in `VoiceButton.js`):
```javascript
if (command.includes('new command')) {
  speak('Response message');
  // Handle action
}
```

2. **Test Voice Recognition**:
   - Use different speech patterns
   - Test with background noise
   - Verify cross-browser compatibility

## Support & Resources

### Documentation
- Django REST Framework: https://www.django-rest-framework.org/
- React: https://reactjs.org/docs/
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

### Community
- Django Community: https://www.djangoproject.com/community/
- React Community: https://reactjs.org/community/support.html

### Voice Technology
- Google Speech Services: https://cloud.google.com/speech-to-text
- Azure Speech Services: https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/

## Next Steps

1. **Enhance Voice Processing**:
   - Integrate advanced NLP
   - Add multi-language support
   - Implement voice biometrics

2. **Mobile Optimization**:
   - Create React Native app
   - Optimize for touch + voice
   - Add offline capabilities

3. **AI Features**:
   - Personalized recommendations
   - Health-based product suggestions
   - Predictive ordering

4. **Accessibility**:
   - Screen reader compatibility
   - Keyboard navigation
   - High contrast themes