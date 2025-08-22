import React from 'react';
import { useParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import OptimizedImage from '../components/OptimizedImage';

interface Business {
  id: string;
  name: string;
  description: string;
  image: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
}

const BusinessProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // This would typically come from your data source
  const business: Business = {
    id: '1',
    name: 'Sample Business',
    description: 'A sample business description',
    image: '',
    products: [
      { id: '1', name: 'Product 1', price: 100, image: '' },
      { id: '2', name: 'Product 2', price: 200, image: '' }
    ]
  };

  return (
    <div className="business-profile">
      <SEOHead
        title={`${business.name} - TheHub JA`}
        description={business.description}
        keywords={`${business.name}, jamaica business, local business`}
      />
      <main className="main-content">
        <div className="business-header">
          {business.image && (
            <OptimizedImage
              src={business.image}
              alt={business.name}
              className="business-image"
            />
          )}
          <h1>{business.name}</h1>
          <p>{business.description}</p>
        </div>

        <section className="products-section">
          <h2>Products</h2>
          <div className="products-grid">
            {business.products.map(product => (
              <div key={product.id} className="product-card">
                {product.image && (
                  <OptimizedImage
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                )}
                <h3>{product.name}</h3>
                <p className="price">${product.price}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default BusinessProfile;