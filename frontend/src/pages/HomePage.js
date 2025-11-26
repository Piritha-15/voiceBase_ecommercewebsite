import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import { useVoiceNarration } from '../context/VoiceNarrationContext';
import ProductCard from '../components/ProductCard';
import VoiceTest from '../components/VoiceTest';
import './HomePage.css';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);
  const navigate = useNavigate();
  const { speak } = useVoice();
  const { narratePageLoad, narrateSearch, narrateClick, narrateNavigation } = useVoiceNarration();

  // All available products for search (memoized to prevent re-renders)
  const allProducts = useMemo(() => [
    { id: 1, name: 'Blood Pressure Monitor', price: 2500, image: '🩺', category: 'health' },
    { id: 2, name: 'Vitamin D Tablets', price: 450, image: '💊', category: 'nutrition' },
    { id: 3, name: 'Walking Stick', price: 800, image: '🦯', category: 'essentials' },
    { id: 4, name: 'Glucose Monitor', price: 1800, image: '🔬', category: 'health' },
    { id: 5, name: 'Calcium Supplements', price: 350, image: '🦴', category: 'nutrition' },
    { id: 6, name: 'Reading Glasses', price: 600, image: '👓', category: 'essentials' },
    { id: 7, name: 'Digital Thermometer', price: 350, image: '🌡️', category: 'health' },
    { id: 8, name: 'Pulse Oximeter', price: 1200, image: '📱', category: 'health' },
    { id: 9, name: 'Omega-3 Capsules', price: 800, image: '🐟', category: 'nutrition' },
    { id: 10, name: 'Multivitamins', price: 600, image: '🌈', category: 'nutrition' },
    { id: 11, name: 'Magnifying Glass', price: 400, image: '🔍', category: 'essentials' },
    { id: 12, name: 'Pill Organizer', price: 250, image: '💊', category: 'essentials' }
  ], []);

  useEffect(() => {
    // Set featured products (first 3)
    setFeaturedProducts(allProducts.slice(0, 3));
    
    // Set recommendations (next 3)
    setRecommendations(allProducts.slice(3, 6));

    // Narrate page load
    const currentSearch = searchParams.get('search');
    if (currentSearch) {
      narratePageLoad(`Search results for ${currentSearch}`);
      speak(`Showing search results for ${currentSearch}`);
    } else if (!hasSpokenWelcome) {
      narratePageLoad('Home page');
      // Only speak welcome message once per session
      setHasSpokenWelcome(true);
    }
  }, [searchParams, narratePageLoad, allProducts, hasSpokenWelcome, speak]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      narrateSearch(searchTerm);
      speak(`Searching for ${searchTerm}`);
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleCategoryClick = (category) => {
    narrateNavigation(`${category} category`);
    speak(`Opening ${category} category`);
    navigate(`/category/${category}`);
  };

  // Filter products based on search term
  const getSearchResults = () => {
    if (!searchTerm) return [];
    
    const results = allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log('🔍 Search results for "' + searchTerm + '":', results);
    return results;
  };

  const searchResults = getSearchResults();

  return (
    <div className="home-page">
      <VoiceTest />
      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <h1>Welcome to VoiceCart</h1>
          <p>Shop with your voice - Simple, Safe, Senior-Friendly</p>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search for products... (or use voice 🎤)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                🔍 Search
              </button>
            </div>
          </form>
        </section>

        {/* Search Results */}
        {searchTerm && (
          <section className="search-results">
            <h2>Search Results for "{searchTerm}"</h2>
            {searchResults.length > 0 ? (
              <div className="products-grid">
                {searchResults.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No products found for "{searchTerm}". Try searching for:</p>
                <ul>
                  <li>vitamins, supplements, calcium</li>
                  <li>blood pressure, glucose, thermometer</li>
                  <li>walking stick, glasses, magnifier</li>
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Categories - Only show if not searching */}
        {!searchTerm && (
          <section className="categories">
          <h2>Shop by Category</h2>
          <div className="category-grid">
            <div className="category-card" onClick={() => handleCategoryClick('health')}>
              <div className="category-icon">🏥</div>
              <h3>Health</h3>
              <p>Medical devices, monitors, health aids</p>
            </div>
            <div className="category-card" onClick={() => handleCategoryClick('nutrition')}>
              <div className="category-icon">🥗</div>
              <h3>Nutrition</h3>
              <p>Vitamins, supplements, healthy foods</p>
            </div>
            <div className="category-card" onClick={() => handleCategoryClick('essentials')}>
              <div className="category-icon">🏠</div>
              <h3>Essentials</h3>
              <p>Daily needs, mobility aids, comfort items</p>
            </div>
          </div>
          </section>
        )}

        {/* Featured Products - Only show if not searching */}
        {!searchTerm && (
          <section className="featured-products">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          </section>
        )}

        {/* Recommendations - Only show if not searching */}
        {!searchTerm && (
          <section className="recommendations">
          <h2>Recommended for You</h2>
          <div className="products-grid">
            {recommendations.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;