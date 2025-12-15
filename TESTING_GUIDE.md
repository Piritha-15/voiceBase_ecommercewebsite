# 🧪 VoiceCart Testing Guide

## Overview

This document provides comprehensive testing scenarios, test data, and procedures for validating the VoiceCart platform functionality.

## Testing Strategy

### Test Levels
1. **Unit Tests**: Individual component testing
2. **Integration Tests**: API and component interaction testing
3. **System Tests**: End-to-end workflow testing
4. **Accessibility Tests**: Voice and UI accessibility validation
5. **Performance Tests**: Load and response time testing

### Test Categories
- **Functional Testing**: Core feature validation
- **Voice Recognition Testing**: Speech API functionality
- **Security Testing**: Authentication and data protection
- **Usability Testing**: Senior-friendly interface validation
- **Cross-browser Testing**: Multi-platform compatibility

## Test Environment Setup

### Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend application running on `http://localhost:3000`
- Chrome browser (recommended for voice features)
- Microphone access enabled
- Test database with sample data loaded

### Test Data Setup

#### 1. Load Sample Data
```bash
cd backend
python manage.py loaddata sample_data.json
```

#### 2. Create Test Users
```bash
python manage.py shell -c "
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

# Create test users
users = [
    {'username': 'senior_user', 'email': 'senior@test.com', 'password': 'senior123', 'first_name': 'John', 'last_name': 'Senior', 'phone': '9876543210'},
    {'username': 'caregiver', 'email': 'caregiver@test.com', 'password': 'care123', 'first_name': 'Mary', 'last_name': 'Caregiver', 'phone': '9876543211'},
    {'username': 'admin_user', 'email': 'admin@test.com', 'password': 'admin123', 'first_name': 'Admin', 'last_name': 'User', 'phone': '9876543212'}
]

for user_data in users:
    user = User.objects.create_user(**user_data)
    Token.objects.create(user=user)
    print(f'Created user: {user.username} with token: {user.auth_token.key}')
"
```

## Test Scenarios

### 1. User Authentication Tests

#### Test Case 1.1: User Registration
**Objective**: Verify new user can register successfully

**Test Data**:
```json
{
  "username": "testuser123",
  "email": "test@example.com",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123",
  "first_name": "Test",
  "last_name": "User",
  "phone": "9876543210"
}
```

**Steps**:
1. Navigate to `/register`
2. Fill registration form with test data
3. Submit form
4. Verify success message and redirect to login

**Expected Result**:
- User created successfully
- Token generated
- Redirect to login page
- Success message displayed

**API Test**:
```bash
curl -X POST http://localhost:8000/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "first_name": "Test",
    "last_name": "User",
    "phone": "9876543210"
  }'
```

#### Test Case 1.2: User Login
**Objective**: Verify user can login with valid credentials

**Test Data**:
```json
{
  "username": "senior_user",
  "password": "senior123"
}
```

**Steps**:
1. Navigate to `/login`
2. Enter valid credentials
3. Submit login form
4. Verify successful login and redirect

**Expected Result**:
- Authentication successful
- User token stored
- Redirect to home page
- User name displayed in header

#### Test Case 1.3: Voice Authentication
**Objective**: Verify voice biometric authentication works

**Steps**:
1. Login with regular credentials
2. Navigate to voice authentication setup
3. Record 5 voice phrases
4. Test voice login
5. Verify authentication success

**Expected Result**:
- Voice patterns stored locally
- Voice authentication successful
- Access granted to protected features

### 2. Voice Recognition Tests

#### Test Case 2.1: Basic Voice Commands
**Objective**: Verify core voice commands work correctly

**Test Commands**:
```javascript
const voiceCommands = [
  {
    command: "hello",
    expected: "Voice recognition confirmation",
    action: "Test voice system"
  },
  {
    command: "go to home",
    expected: "Navigate to home page",
    action: "Page navigation"
  },
  {
    command: "show cart",
    expected: "Navigate to cart page",
    action: "Cart access"
  },
  {
    command: "search for vitamins",
    expected: "Search products for vitamins",
    action: "Product search"
  }
];
```

**Steps**:
1. Open browser console (F12)
2. Navigate to any page with voice button
3. Click voice button (🎤)
4. Speak each test command
5. Verify expected action occurs
6. Check console logs for recognition accuracy

**Expected Results**:
- Voice recognition activates
- Commands processed correctly
- Appropriate actions executed
- Audio feedback provided

#### Test Case 2.2: Voice Search Functionality
**Objective**: Verify voice search returns relevant results

**Test Queries**:
```javascript
const searchQueries = [
  {
    query: "blood pressure monitor",
    expectedProducts: ["Blood Pressure Monitor", "Wrist BP Monitor"],
    category: "Health & Medical"
  },
  {
    query: "vitamins for seniors",
    expectedProducts: ["Vitamin D Tablets", "Multivitamins"],
    category: "Nutrition"
  },
  {
    query: "walking aids",
    expectedProducts: ["Walking Stick", "Walking Frame"],
    category: "Essentials"
  }
];
```

**Steps**:
1. Navigate to home page
2. Use voice search for each query
3. Verify search results accuracy
4. Check product relevance

**Expected Results**:
- Relevant products returned
- Search results match query intent
- Products from appropriate categories
- Voice feedback confirms search

### 3. E-commerce Workflow Tests

#### Test Case 3.1: Complete Purchase Flow
**Objective**: Verify end-to-end purchase process

**Test Scenario**: Senior user purchasing health products

**Steps**:
1. **Browse Products**
   - Navigate to Health category
   - View product details
   - Check product information

2. **Add to Cart**
   - Select "Blood Pressure Monitor"
   - Add to cart using voice or button
   - Verify cart update

3. **Cart Management**
   - View cart contents
   - Update quantities
   - Verify total calculation

4. **Checkout Process**
   - Proceed to checkout (requires login)
   - Verify auto-filled profile data
   - Select/edit delivery address
   - Choose payment method

5. **Payment Processing**
   - Enter card details
   - Complete voice authentication
   - Enter OTP verification
   - Confirm payment

6. **Order Confirmation**
   - Verify order success page
   - Check order details
   - Confirm email/SMS notification

**Expected Results**:
- Smooth workflow without errors
- Profile data auto-populated
- Payment processed successfully
- Order created and confirmed
- User receives confirmation

#### Test Case 3.2: Cart Persistence
**Objective**: Verify cart items persist across sessions

**Steps**:
1. Add items to cart
2. Close browser
3. Reopen application
4. Login with same user
5. Verify cart contents

**Expected Results**:
- Cart items preserved
- Quantities maintained
- Total amount correct

### 4. Accessibility Tests

#### Test Case 4.1: Screen Reader Compatibility
**Objective**: Verify application works with screen readers

**Tools**: NVDA, JAWS, or VoiceOver

**Steps**:
1. Enable screen reader
2. Navigate through application
3. Test form interactions
4. Verify voice announcements
5. Test keyboard navigation

**Expected Results**:
- All content readable by screen reader
- Proper ARIA labels present
- Keyboard navigation functional
- Voice feedback clear and helpful

#### Test Case 4.2: High Contrast Mode
**Objective**: Verify application usability in high contrast

**Steps**:
1. Enable high contrast mode in OS
2. Navigate through application
3. Check text readability
4. Verify button visibility
5. Test color-dependent features

**Expected Results**:
- Text clearly visible
- Buttons distinguishable
- No information lost due to color
- WCAG AA compliance maintained

#### Test Case 4.3: Large Font Support
**Objective**: Verify application scales with large fonts

**Steps**:
1. Increase browser font size to 200%
2. Navigate through pages
3. Check layout integrity
4. Test form usability
5. Verify mobile responsiveness

**Expected Results**:
- Layout remains functional
- Text doesn't overlap
- Forms remain usable
- Mobile view adapts correctly

### 5. Security Tests

#### Test Case 5.1: Authentication Security
**Objective**: Verify authentication mechanisms are secure

**Tests**:
1. **Token Validation**
   - Test with invalid tokens
   - Test with expired tokens
   - Verify proper error handling

2. **Password Security**
   - Test password strength requirements
   - Verify password hashing
   - Test password reset functionality

3. **Session Management**
   - Test session timeout
   - Verify logout functionality
   - Test concurrent sessions

**Expected Results**:
- Invalid tokens rejected
- Strong password enforcement
- Secure session handling
- Proper error messages

#### Test Case 5.2: Input Validation
**Objective**: Verify all inputs are properly validated

**Test Inputs**:
```javascript
const maliciousInputs = [
  "<script>alert('xss')</script>",
  "'; DROP TABLE users; --",
  "../../../etc/passwd",
  "javascript:alert('xss')",
  "<img src=x onerror=alert('xss')>"
];
```

**Steps**:
1. Test each input in forms
2. Verify server-side validation
3. Check for XSS vulnerabilities
4. Test SQL injection prevention

**Expected Results**:
- Malicious inputs rejected
- Proper error messages
- No code execution
- Data integrity maintained

### 6. Performance Tests

#### Test Case 6.1: Page Load Performance
**Objective**: Verify acceptable page load times

**Metrics**:
- First Contentful Paint < 2s
- Largest Contentful Paint < 4s
- Time to Interactive < 5s
- Cumulative Layout Shift < 0.1

**Tools**: Chrome DevTools, Lighthouse

**Steps**:
1. Open Chrome DevTools
2. Navigate to Performance tab
3. Record page load
4. Analyze metrics
5. Run Lighthouse audit

**Expected Results**:
- Performance score > 80
- All Core Web Vitals pass
- Acceptable load times for seniors

#### Test Case 6.2: Voice Recognition Performance
**Objective**: Verify voice recognition response times

**Metrics**:
- Recognition start time < 500ms
- Processing time < 1s
- Response generation < 500ms
- Total interaction time < 2s

**Steps**:
1. Enable performance monitoring
2. Test voice commands
3. Measure response times
4. Analyze bottlenecks

**Expected Results**:
- Fast voice recognition
- Responsive user experience
- Minimal latency

### 7. Cross-Browser Tests

#### Test Case 7.1: Browser Compatibility
**Objective**: Verify functionality across browsers

**Test Matrix**:
| Browser | Version | Voice Support | Expected Result |
|---------|---------|---------------|-----------------|
| Chrome | 80+ | Full | ✅ Complete functionality |
| Edge | 80+ | Full | ✅ Complete functionality |
| Safari | 14+ | Full | ✅ Complete functionality |
| Firefox | 70+ | Limited | ⚠️ Basic functionality |

**Steps**:
1. Test core functionality in each browser
2. Verify voice features work
3. Check responsive design
4. Test form submissions

**Expected Results**:
- Core features work in all browsers
- Voice features work in supported browsers
- Graceful degradation in unsupported browsers

### 8. Mobile Device Tests

#### Test Case 8.1: Mobile Responsiveness
**Objective**: Verify mobile device compatibility

**Test Devices**:
- iPhone (iOS Safari)
- Android (Chrome Mobile)
- iPad (Safari)
- Android Tablet

**Steps**:
1. Test on each device type
2. Verify touch interactions
3. Check voice functionality
4. Test form usability
5. Verify navigation

**Expected Results**:
- Responsive design works
- Touch targets appropriate size
- Voice features functional
- Easy navigation for seniors

## Automated Testing

### Unit Tests

#### Frontend Tests (Jest + React Testing Library)
```javascript
// Example test for ProductCard component
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../components/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Blood Pressure Monitor',
    price: '2500.00',
    image_emoji: '🩺',
    rating: 4.5
  };

  test('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Blood Pressure Monitor')).toBeInTheDocument();
    expect(screen.getByText('₹2500.00')).toBeInTheDocument();
    expect(screen.getByText('🩺')).toBeInTheDocument();
  });

  test('adds product to cart when button clicked', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} addToCart={mockAddToCart} />);
    
    fireEvent.click(screen.getByText('🛒 Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
```

#### Backend Tests (Django TestCase)
```python
# Example test for Product API
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from product_assistant.models import Product, Category

User = get_user_model()

class ProductAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='health',
            description='Health products'
        )
        self.product = Product.objects.create(
            name='Blood Pressure Monitor',
            description='Digital BP monitor',
            price=2500.00,
            category=self.category
        )

    def test_list_products(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Blood Pressure Monitor')

    def test_search_products(self):
        response = self.client.get('/api/products/?search=blood pressure')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
```

### Integration Tests

#### API Integration Test
```python
class CheckoutIntegrationTestCase(TestCase):
    def test_complete_checkout_flow(self):
        # 1. Create user and login
        user = User.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=user)
        
        # 2. Add product to cart
        response = self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'quantity': 1
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 3. Create order
        response = self.client.post('/api/checkout/create/', {
            'full_name': 'Test User',
            'phone': '9876543210',
            'address': '123 Test St',
            'city': 'Test City',
            'pincode': '123456',
            'payment_method': 'card'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 4. Verify order created
        order_id = response.data['order_id']
        self.assertTrue(order_id.startswith('VC'))
```

### Running Tests

#### Frontend Tests
```bash
cd frontend
npm test                    # Run all tests
npm test -- --coverage     # Run with coverage
npm test -- --watch        # Run in watch mode
```

#### Backend Tests
```bash
cd backend
python manage.py test                           # Run all tests
python manage.py test accounts                  # Run specific app tests
python manage.py test --verbosity=2            # Verbose output
python manage.py test --keepdb                 # Keep test database
```

#### Coverage Reports
```bash
# Frontend coverage
cd frontend
npm test -- --coverage --watchAll=false

# Backend coverage
cd backend
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## Manual Testing Checklist

### Pre-Testing Setup
- [ ] Backend server running
- [ ] Frontend application running
- [ ] Test data loaded
- [ ] Browser microphone permissions enabled
- [ ] Console open for debugging

### Core Functionality
- [ ] User registration works
- [ ] User login/logout works
- [ ] Voice authentication works
- [ ] Product browsing works
- [ ] Search functionality works
- [ ] Voice search works
- [ ] Add to cart works
- [ ] Cart management works
- [ ] Checkout process works
- [ ] Payment processing works
- [ ] Order confirmation works

### Voice Features
- [ ] Voice button activates
- [ ] Speech recognition works
- [ ] Voice commands processed
- [ ] Audio feedback provided
- [ ] Voice search functional
- [ ] Auto-narration works
- [ ] Speech coordination works

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] High contrast mode works
- [ ] Large font scaling works
- [ ] WCAG AA compliance
- [ ] Mobile accessibility

### Security
- [ ] Authentication required for protected pages
- [ ] Invalid tokens rejected
- [ ] Input validation works
- [ ] XSS prevention works
- [ ] SQL injection prevention works
- [ ] Secure data transmission

### Performance
- [ ] Page load times acceptable
- [ ] Voice recognition responsive
- [ ] Search results fast
- [ ] Mobile performance good
- [ ] No memory leaks
- [ ] Efficient API calls

## Bug Reporting Template

### Bug Report Format
```markdown
## Bug Report

**Title**: Brief description of the issue

**Environment**:
- Browser: Chrome 91.0.4472.124
- OS: Windows 10
- Device: Desktop
- Screen Resolution: 1920x1080

**Steps to Reproduce**:
1. Navigate to...
2. Click on...
3. Enter...
4. Observe...

**Expected Behavior**:
Description of what should happen

**Actual Behavior**:
Description of what actually happens

**Screenshots/Videos**:
Attach relevant media

**Console Logs**:
```
Error messages from browser console
```

**Additional Information**:
Any other relevant details

**Priority**: High/Medium/Low
**Severity**: Critical/Major/Minor
```

## Test Data Reference

### Sample Users
```json
{
  "senior_user": {
    "username": "senior_user",
    "password": "senior123",
    "email": "senior@test.com",
    "first_name": "John",
    "last_name": "Senior",
    "phone": "9876543210",
    "age": 68
  },
  "caregiver": {
    "username": "caregiver",
    "password": "care123",
    "email": "caregiver@test.com",
    "first_name": "Mary",
    "last_name": "Caregiver",
    "phone": "9876543211"
  }
}
```

### Sample Products
```json
{
  "health_products": [
    {
      "name": "Blood Pressure Monitor",
      "price": 2500.00,
      "category": "Health & Medical",
      "description": "Digital BP monitor with voice guidance"
    },
    {
      "name": "Glucose Monitor",
      "price": 1800.00,
      "category": "Health & Medical",
      "description": "Blood sugar monitoring device"
    }
  ]
}
```

### Voice Commands Test Set
```javascript
const voiceTestCommands = [
  // Navigation
  "go to home",
  "show cart",
  "go to health category",
  
  // Search
  "search for vitamins",
  "find blood pressure monitor",
  
  // Cart operations
  "add to cart",
  "remove from cart",
  "checkout now",
  
  // Authentication
  "voice login",
  "authenticate",
  
  // General
  "hello",
  "help",
  "repeat"
];
```

---

This testing guide ensures comprehensive validation of the VoiceCart platform across all functionality, accessibility, and performance requirements.