# VoiceCart Frontend - React Application

Voice-first e-commerce frontend built with React and Web Speech API.

## Features

- **Voice Navigation**: Navigate the entire app using voice commands
- **Voice Search**: Search for products using natural speech
- **Voice Cart Management**: Add, remove, and modify cart items with voice
- **Voice Checkout**: Complete purchases using voice commands
- **Senior-Friendly UI**: Large fonts, high contrast, simple navigation
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_VOICE_ENABLED=true
```

### 3. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## Voice Commands

### Navigation
- "Go to home" / "Home page"
- "Go to cart" / "Show cart"
- "Go to checkout" / "Checkout now"
- "Go to category health/nutrition/essentials"

### Search & Browse
- "Search for [product name]"
- "Filter by price under [amount]"
- "Sort by price/name/popularity"
- "Show more like this"

### Cart Management
- "Add to cart"
- "Remove item [number]"
- "Increase quantity"
- "Clear cart"

### Checkout & Payment
- "Use my home address"
- "Pay with UPI/card/cash on delivery"
- "Confirm order"
- "Authenticate with voice"

### Help
- "Help" / "What can I say?" / "Show commands"

## Project Structure

```
frontend/
├── public/
│   └── index.html          # Main HTML template
├── src/
│   ├── components/         # Reusable components
│   │   ├── Header.js       # Navigation header
│   │   ├── VoiceButton.js  # Floating voice button
│   │   └── ProductCard.js  # Product display card
│   ├── context/           # React context providers
│   │   ├── VoiceContext.js # Voice functionality
│   │   └── CartContext.js  # Cart management
│   ├── pages/             # Page components
│   │   ├── HomePage.js     # Landing page
│   │   ├── CategoryPage.js # Product category listing
│   │   ├── ProductDetailsPage.js # Product details
│   │   ├── CartPage.js     # Shopping cart
│   │   ├── CheckoutPage.js # Order checkout
│   │   ├── PaymentPage.js  # Payment processing
│   │   └── OrderSuccessPage.js # Order confirmation
│   ├── App.js             # Main app component
│   ├── index.js           # App entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Voice Integration

### Web Speech API

The app uses the browser's built-in Web Speech API for:
- **Speech Recognition**: Converting speech to text
- **Speech Synthesis**: Converting text to speech

### Browser Support

Voice features work in:
- ✅ Chrome (desktop & mobile)
- ✅ Edge (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ❌ Firefox (limited support)

### Voice Context

The `VoiceContext` provides:
- `startListening()` - Start voice recognition
- `stopListening()` - Stop voice recognition
- `speak(text)` - Text-to-speech output
- `isListening` - Current listening state

### Cart Context

The `CartContext` manages:
- Cart items and quantities
- Add/remove/update operations
- Local storage persistence
- Total calculations

## Styling & Accessibility

### Senior-Friendly Design
- **Large Fonts**: 18px+ base font size
- **High Contrast**: Dark text on light backgrounds
- **Simple Navigation**: Clear, large buttons
- **Voice Hints**: Contextual voice command suggestions

### Color Scheme
- **Primary Teal**: #008080
- **Secondary Navy**: #1a365d
- **Light Gray**: #f7fafc
- **White**: #ffffff

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Development

### Available Scripts

```bash
npm start          # Start development server
npm build          # Build for production
npm test           # Run tests
npm eject          # Eject from Create React App
```

### Adding New Voice Commands

1. Update `VoiceButton.js` with new command patterns
2. Add corresponding actions in the component
3. Update voice hints and help text
4. Test with different speech patterns

### API Integration

The app communicates with the Django backend via:
- Axios for HTTP requests
- RESTful API endpoints
- JSON data exchange

## Production Build

### Build Optimization

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Deployment

The built app can be deployed to:
- **Netlify**: Drag and drop the build folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Upload build files to S3 bucket
- **Traditional Hosting**: Upload build files via FTP

### Environment Variables

For production, set:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_VOICE_ENABLED=true
```

## Browser Compatibility

### Minimum Requirements
- Chrome 25+
- Firefox 44+
- Safari 14.1+
- Edge 79+

### Voice Features
- Requires HTTPS in production
- Microphone permissions needed
- Works best with clear audio input

## Troubleshooting

### Voice Not Working
1. Check browser compatibility
2. Ensure HTTPS (required for production)
3. Grant microphone permissions
4. Test with different browsers

### API Connection Issues
1. Verify backend is running
2. Check CORS configuration
3. Confirm API URL in environment variables
4. Check network connectivity

### Performance Issues
1. Enable React DevTools Profiler
2. Check for unnecessary re-renders
3. Optimize large component trees
4. Consider code splitting for large apps