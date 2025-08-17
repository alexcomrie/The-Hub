import { Business, Product } from '../models/business';

/**
 * Generate meta title for a business
 */
export function generateMetaTitle(business: Business): string {
  return `${business.name} | TheHub - ${business.category || 'Local Business'}`;
}

/**
 * Generate meta description for a business
 */
export function generateMetaDescription(business: Business): string {
  // Use metaDescription if available, otherwise use bio
  if (business.metaDescription) {
    return business.metaDescription;
  }
  
  if (business.bio && business.bio.length > 10) {
    // Truncate bio if too long
    return business.bio.length > 160 
      ? `${business.bio.substring(0, 157)}...` 
      : business.bio;
  }
  
  // Fallback to a generic description
  return `${business.name} is a ${business.category || 'local business'} located at ${business.address}. Visit our profile on TheHub to learn more.`;
}

/**
 * Generate keywords for a business
 */
export function generateKeywords(business: Business): string {
  // Use predefined keywords if available
  if (business.keywords && business.keywords.length > 0) {
    return business.keywords.join(', ');
  }
  
  // Otherwise generate keywords from available business data
  const keywords = [
    business.name,
    business.category || 'local business',
    // Extract city from address if possible
    business.address.split(',').pop()?.trim() || '',
    'TheHub',
    'business directory'
  ];
  
  return keywords.filter(Boolean).join(', ');
}

/**
 * Generate canonical URL for a business
 */
export function generateCanonicalUrl(business: Business): string {
  return `https://thehub.example.com/business/${business.id}`;
}

/**
 * Generate LocalBusiness schema.org structured data
 */
export function generateLocalBusinessSchema(business: Business): Record<string, any> {
  // Extract location coordinates from mapLocation if available
  let latitude, longitude;
  if (business.mapLocation) {
    const coordinates = business.mapLocation.split(',').map(coord => parseFloat(coord.trim()));
    if (coordinates.length === 2) {
      [latitude, longitude] = coordinates;
    }
  }
  
  // Parse address components
  const addressParts = business.address.split(',');
  const streetAddress = addressParts[0]?.trim() || '';
  const addressLocality = addressParts[1]?.trim() || '';
  const regionAndPostal = addressParts[2]?.trim().split(' ') || [];
  const addressRegion = regionAndPostal[0] || '';
  const postalCode = regionAndPostal[1] || '';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': business.name,
    'description': business.bio || business.metaDescription || '',
    'url': generateCanonicalUrl(business),
    'telephone': business.phoneNumber,
    'email': business.emailAddress,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': streetAddress,
      'addressLocality': addressLocality,
      'addressRegion': addressRegion,
      'postalCode': postalCode,
      'addressCountry': 'SG' // Assuming Singapore as default country
    },
    'geo': latitude && longitude ? {
      '@type': 'GeoCoordinates',
      'latitude': latitude,
      'longitude': longitude
    } : undefined,
    'image': business.profilePictureUrl,
    'priceRange': '$$', // Default price range
    'openingHoursSpecification': business.operationHours ? [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'https://schema.org/Monday',
          'https://schema.org/Tuesday',
          'https://schema.org/Wednesday',
          'https://schema.org/Thursday',
          'https://schema.org/Friday',
          'https://schema.org/Saturday',
          'https://schema.org/Sunday'
        ],
        'opens': business.operationHours.split(' - ')[0],
        'closes': business.operationHours.split(' - ')[1]
      }
    ] : undefined
  };
}

/**
 * Generate Product schema.org structured data
 */
export function generateProductSchema(product: Product, business: Business): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': product.imageUrl,
    'additionalProperty': product.additionalImageUrls && product.additionalImageUrls.length > 0 ? 
      product.additionalImageUrls.map(url => ({
        '@type': 'PropertyValue',
        'name': 'image',
        'value': url
      })) : undefined,
    'sku': product.id,
    'brand': {
      '@type': 'Brand',
      'name': business.name
    },
    'offers': {
      '@type': 'Offer',
      'url': `https://thehub.example.com/business/${business.id}/product/${product.id}`,
      'priceCurrency': 'SGD', // Assuming Singapore Dollar as currency
      'price': product.price,
      'availability': product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': business.name
      }
    }
  };
}

/**
 * Format business hours for schema.org structured data
 * Note: This function is kept for reference but not currently used
 * as we're using a simplified approach with operationHours
 */
function formatHoursForSchema(operationHours: string): Array<Record<string, any>> {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Parse hours like "9:00 AM - 5:00 PM"
  const parts = operationHours.split(' - ');
  const opens = parts[0] || '09:00 AM';
  const closes = parts[1] || '05:00 PM';
  
  // Create a specification for each day with the same hours
  return [{
    '@type': 'OpeningHoursSpecification',
    'dayOfWeek': daysOfWeek.map(day => `https://schema.org/${day}`),
    'opens': opens,
    'closes': closes
  }];
}