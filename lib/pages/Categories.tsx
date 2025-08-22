import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import OptimizedImage from '../components/OptimizedImage';

const Categories: React.FC = () => {
  // This would typically come from your data source
  const categories = [
    { id: 1, name: 'Food & Beverage', image: '' },
    { id: 2, name: 'Retail', image: '' },
    { id: 3, name: 'Services', image: '' }
  ];

  return (
    <div className="categories-container">
      <SEOHead
        title="Business Categories - TheHub JA"
        description="Browse businesses by category on TheHub JA"
        keywords="business categories, jamaica businesses, local services"
      />
      <main className="main-content">
        <h1>Business Categories</h1>
        <div className="categories-grid">
          {categories.map(category => (
            <Link 
              to={`/categories/${category.id}`} 
              key={category.id}
              className="category-card"
            >
              {category.image && (
                <OptimizedImage
                  src={category.image}
                  alt={category.name}
                  className="category-image"
                />
              )}
              <h2>{category.name}</h2>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Categories;