import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initVitals } from './utils/analytics';
import './styles/OptimizedImage.css';
import './styles/pages.css';

// Lazy load components for better performance
const Home = React.lazy(() => import('../lib/pages/Home'));
const Categories = React.lazy(() => import('../lib/pages/Categories'));
const BusinessProfile = React.lazy(() => import('../lib/pages/BusinessProfile'));
const ProductList = React.lazy(() => import('../lib/pages/ProductList'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
  </div>
);

function App() {
  useEffect(() => {
    // Initialize web vitals monitoring
    initVitals();
  }, []);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/business/:id" element={<BusinessProfile />} />
          <Route path="/products" element={<ProductList />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;