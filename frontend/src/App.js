import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BasicVoiceButton from './components/BasicVoiceButton';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { VoiceProvider } from './context/VoiceContext';
import { CartProvider } from './context/CartContext';
import { VoiceBiometricProvider } from './context/VoiceBiometricContext';
import { RecommendationProvider } from './context/RecommendationContext';
import { CaregiverProvider } from './context/CaregiverContext';
import { VoiceNarrationProvider } from './context/VoiceNarrationContext';
import { SpeechCoordinationProvider } from './context/SpeechCoordinationContext';

function App() {
  return (
    <SpeechCoordinationProvider>
      <VoiceNarrationProvider>
        <VoiceProvider>
          <VoiceBiometricProvider>
            <RecommendationProvider>
              <CaregiverProvider>
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
                        </Routes>
                      </main>
                      <BasicVoiceButton />
                    </div>
                  </Router>
                </CartProvider>
              </CaregiverProvider>
            </RecommendationProvider>
          </VoiceBiometricProvider>
        </VoiceProvider>
      </VoiceNarrationProvider>
    </SpeechCoordinationProvider>
  );
}

export default App;