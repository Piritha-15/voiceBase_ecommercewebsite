import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import ProductCard from '../components/ProductCard';
import './CategoryPage.css';

const CategoryPage = () => {
  const { name } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceFilter, setPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const { speak } = useVoice();

  useEffect(() => {
    // Mock data based on category
    const mockProducts = {
      health: [
        { id: 1, name: 'Blood Pressure Monitor', price: 2500, image: '🩺' },
        { id: 4, name: 'Glucose Monitor', price: 1800, image: '🔬' },
        { id: 7, name: 'Thermometer', price: 350, image: '🌡️' },
        { id: 8, name: 'Pulse Oximeter', price: 1200, image: '📱' }
      ],
      nutrition: [
        { id: 2, name: 'Vitamin D Tablets', price: 450, image: '💊' },
        { id: 5, name: 'Calcium Supplements', price: 350, image: '🦴' },
        { id: 9, name: 'Omega-3 Capsules', price: 800, image: '🐟' },
        { id: 10, name: 'Multivitamins', price: 600, image: '🌈' }
      ],
      essentials: [
        { id: 3, name: 'Walking Stick', price: 800, image: '🦯' },
        { id: 6, name: 'Reading Glasses', price: 600, image: '👓' },
        { id: 11, name: 'Magnifying Glass', price: 400, image: '🔍' },
        { id: 12, name: 'Pill Organizer', price: 250, image: '💊' }
      ]
    };

    const categoryProducts = mockProducts[name] || [];
    setProducts(categoryProducts);
    setFilteredProducts(categoryProducts);

    speak(`Showing ${name} products. You can filter by price or sort by popularity.`);
  }, [name, speak]);

  useEffect(() => {
    let filtered = [...products];

    // Apply price filter
    if (priceFilter) {
      const maxPrice = parseInt(priceFilter);
      filtered = filtered.filter(product => product.price <= maxPrice);
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  }, [products, priceFilter, sortBy]);

  const handlePriceFilter = (maxPrice) => {
    setPriceFilter(maxPrice);
    speak(`Filtering products under ₹${maxPrice}`);
  };

  const handleSort = (sortOption) => {
    setSortBy(sortOption);
    const sortLabels = {
      'relevance': 'relevance',
      'price-low': 'price low to high',
      'price-high': 'price high to low',
      'name': 'name'
    };
    speak(`Sorting by ${sortLabels[sortOption]}`);
  };

  return (
    <div className="category-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <span>Home</span> / <span className="current">{name}</span>
        </nav>

        {/* Page Header */}
        <div className="page-header">
          <h1>{name.charAt(0).toUpperCase() + name.slice(1)} Products</h1>
          <p>Found {filteredProducts.length} products</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Price Filter:</label>
            <div className="filter-buttons">
              <button 
                className={priceFilter === '' ? 'active' : ''}
                onClick={() => handlePriceFilter('')}
              >
                All Prices
              </button>
              <button 
                className={priceFilter === '500' ? 'active' : ''}
                onClick={() => handlePriceFilter('500')}
              >
                Under ₹500
              </button>
              <button 
                className={priceFilter === '1000' ? 'active' : ''}
                onClick={() => handlePriceFilter('1000')}
              >
                Under ₹1000
              </button>
              <button 
                className={priceFilter === '2000' ? 'active' : ''}
                onClick={() => handlePriceFilter('2000')}
              >
                Under ₹2000
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => handleSort(e.target.value)}>
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-section">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No products found matching your filters.</p>
              <button onClick={() => handlePriceFilter('')}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;