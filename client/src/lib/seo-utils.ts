import { Business, Product } from "@shared/schema";

/**
 * Generates a meta title for a business
 * @param business The business object
 * @returns A formatted meta title
 */
export function generateMetaTitle(business: Business): string {
  return business.metaTitle || `${business.name} - ${business.category || 'Business'} in ${business.address}`;
}

/**
 * Generates a meta description for a business
 * @param business The business object
 * @returns A formatted meta description
 */
export function generateMetaDescription(business: Business): string {
  if (business.metaDescription) return business.metaDescription;
  
  const bioExcerpt = business.bio ? business.bio.substring(0, 150) + (business.bio.length > 150 ? '...' : '') : '';
  return `${business.name} offers ${bioExcerpt} Visit us in ${business.address} or contact us for more information.`;
}

/**
 * Generates keywords for a business
 * @param business The business object
 * @returns An array of keywords
 */
export function generateKeywords(business: Business): string[] {
  if (business.keywords && business.keywords.length > 0) return business.keywords;
  
  const defaultKeywords = [
    business.name,
    business.category || 'business',
    business.address,
    'Jamaica',
    'local business'
  ];
  
  return defaultKeywords;
}

/**
 * Generates a canonical URL for a business
 * @param business The business object
 * @returns A canonical URL
 */
export function generateCanonicalUrl(business: Business): string {
  if (business.canonicalUrl) return business.canonicalUrl;
  
  const slug = business.slug || business.id;
  return `https://the-hubja.netlify.app/business/${slug}`;
}

/**
 * Generates JSON-LD structured data for a local business
 * @param business The business object
 * @returns JSON-LD object for the business
 */
export function generateLocalBusinessSchema(business: Business): object {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.bio,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address
    },
    "telephone": business.phoneNumber,
    "email": business.emailAddress,
    "url": generateCanonicalUrl(business),
    "image": business.profilePictureUrl,
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": business.operationHours.split(' - ')[0],
      "closes": business.operationHours.split(' - ')[1]
    }
  };
}

/**
 * Generates JSON-LD structured data for a product
 * @param product The product object
 * @param business The business that sells the product
 * @returns JSON-LD object for the product
 */
export function generateProductSchema(product: Product, business: Business): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.imageUrl,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "JMD",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": business.name
      }
    }
  };
}