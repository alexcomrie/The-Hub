import React from 'react';
import { Helmet } from 'react-helmet';
import { Business, Product } from '../../client/src/models/business';
import {
  generateMetaTitle,
  generateMetaDescription,
  generateKeywords,
  generateCanonicalUrl,
  generateLocalBusinessSchema,
  generateProductSchema
} from '../../client/src/utils/seo';

interface SEOHeadProps {
  business?: Business;
  product?: Product;
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
}

/**
 * SEOHead component for managing document head metadata
 * Can be used with either business/product data or direct props
 */
export default function SEOHead({
  business,
  product,
  title,
  description,
  keywords,
  canonicalUrl
}: SEOHeadProps) {
  // If business is provided, generate metadata from business data
  const metaTitle = title || (business ? generateMetaTitle(business) : '');
  const metaDescription = description || (business ? generateMetaDescription(business) : '');
  const metaKeywords = keywords || (business ? generateKeywords(business) : '');
  const metaCanonicalUrl = canonicalUrl || (business ? generateCanonicalUrl(business) : '');

  // Generate structured data if business is provided
  let structuredData = null;
  if (business) {
    if (product) {
      structuredData = generateProductSchema(product, business);
    } else {
      structuredData = generateLocalBusinessSchema(business);
    }
  }

  return (
    <Helmet>
      {metaTitle && <title>{metaTitle}</title>}
      {metaDescription && <meta name="description" content={metaDescription} />}
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      {metaCanonicalUrl && <link rel="canonical" href={metaCanonicalUrl} />}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}