import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import UltraSimpleVoice from './components/UltraSimpleVoice';
import ButtonCommands from './components/ButtonCommands';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import AddressPage from './pages/AddressPage';
import { VoiceProvider } from './context/VoiceContext';
import { CartProvider } from './context/CartContext';
import { VoiceBiometricProvider } from './context/VoiceBiometricContext';
import { RecommendationProvider } from './context/RecommendationContext';
import { CaregiverProvider } from './context/CaregiverContext';
import { VoiceNarrationProvider } from './context/VoiceNarrationContext';
import { SpeechCoordinationProvider } from './context/SpeechCoordinationContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

function App() {
  return (
    <SpeechCoordinationProvider>
      <VoiceNarrationProvider>
        <VoiceProvider>
          <VoiceBiometricProvider>
            <RecommendationProvider>
              <CaregiverProvider>
                <AuthProvider>
                  <WishlistProvider>
                    <CartProvider>
                      <Router>
                        <div className="App">
                          <Header />
                          <main>
                            <Routes>
                              <Route path="/" element={<HomePage />} />
                              <Route path="/category/:name" element={<CategoryPage />} />
                              <Route path="/product/:id" element={<ProductDetailsPage />} />
                              <Route path="/cart" element={<CartPage />} />
                              <Route path="/checkout" element={<CheckoutPage />} />
                              <Route path="/payment" element={<PaymentPage />} />
                              <Route path="/order-success" element={<OrderSuccessPage />} />
                              <Route path="/orders" element={<OrdersPage />} />
                              <Route path="/login" element={<LoginPage />} />
                              <Route path="/register" element={<RegisterPage />} />
                              <Route path="/wishlist" element={<WishlistPage />} />
                              <Route path="/profile" element={<ProfilePage />} />
                              <Route path="/addresses" element={<AddressPage />} />
                            </Routes>
                      </main>
                      <ButtonCommands />
                      <UltraSimpleVoice />
                    </div>
                  </Router>
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </CaregiverProvider>
        </RecommendationProvider>
      </VoiceBiometricProvider>
    </VoiceProvider>
  </VoiceNarrationProvider>
    </SpeechCoordinationProvider>
  );
}

export default App;