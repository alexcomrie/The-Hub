import React from 'react';
import SEOHead from '../components/SEOHead';
import OptimizedImage from '../components/OptimizedImage';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  business: {
    id: string;
    name: string;
  };
}

const ProductList: React.FC = () => {
  // This would typically come from your data source
  const products: Product[] = [
    {
      id: '1',
      name: 'Sample Product 1',
      description: 'A sample product description',
      price: 100,
      image: '',
      business: { id: '1', name: 'Business 1' }
    },
    {
      id: '2',
      name: 'Sample Product 2',
      description: 'Another sample product description',
      price: 200,
      image: '',
      business: { id: '2', name: 'Business 2' }
    }
  ];

  return (
    <div className="products-container">
      <SEOHead
        title="Products - TheHub JA"
        description="Browse products from local businesses in Jamaica"
        keywords="jamaica products, local products, marketplace"
      />
      <main className="main-content">
        <h1>Products</h1>
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              {product.image && (
                <OptimizedImage
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
              )}
              <div className="product-info">
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <p className="price">${product.price}</p>
                <p className="business-name">By {product.business.name}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProductList;