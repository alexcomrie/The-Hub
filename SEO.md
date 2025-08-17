# SEO Optimization Plan for TheHub Web App

## Overview
This document outlines a comprehensive SEO strategy for TheHub Web App, a React-based marketplace connecting businesses with customers. The goal is to optimize business listings for search engines while working within the constraints of our React + TypeScript frontend, minimal Express.js backend, and Google Sheets-based data architecture.

## Current Architecture Considerations
- Frontend: React with TypeScript, Vite, and Wouter for routing
- Backend: Minimal Express.js server primarily serving the frontend
- Data Source: Google Sheets (accessed directly from the client)
- State Management: React Context API and React Query
- Storage: LocalStorage for cart persistence

## SEO Implementation Plan

### 1. Metadata Optimization

#### Business Schema Updates
- Add SEO-specific fields to the `BusinessSchema` in `shared/schema.ts`:
  ```typescript
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional(),
  slug: z.string()
  ```

#### Business Class Updates
- Update the `Business` class to include SEO fields
- Modify `fromCsv` and `fromJson` methods to handle SEO fields
- Update `toJson` method for serialization

### 2. Client-Side SEO Optimization

#### Dynamic Meta Tags
- Implement React Helmet for managing document head:
  ```typescript
  function BusinessProfile({ business }: { business: Business }) {
    return (
      <>
        <Helmet>
          <title>{business.metaTitle}</title>
          <meta name="description" content={business.metaDescription} />
          <meta name="keywords" content={business.keywords.join(', ')} />
          <link rel="canonical" href={business.canonicalUrl} />
        </Helmet>
        {/* Business profile content */}
      </>
    );
  }
  ```

#### SEO Content Generation
- Create utility functions for generating SEO content from business data:
  ```typescript
  function generateMetaTitle(business: Business): string {
    return `${business.name} - ${business.category} in ${business.address}`;
  }
  
  function generateMetaDescription(business: Business): string {
    return `${business.name} offers ${business.bio.substring(0, 150)}... Visit us in ${business.address} or order online.`;
  }
  
  function generateKeywords(business: Business): string[] {
    return [
      business.name,
      business.category,
      business.address,
      ...business.products.map(p => p.name)
    ];
  }
  ```

### 3. Static Site Generation with React

#### Pre-rendering Strategy
- Implement static site generation using Vite's SSG capabilities
- Generate static pages for:
  - Category listings
  - Business profiles
  - Product pages

#### Dynamic Routes
- Update Wouter configuration to support static paths:
  ```typescript
  const routes = [
    '/',
    '/category/:categoryId',
    '/business/:id',
    '/business/:id/products',
    '/business/:id/product/:productId/:productName'
  ];
  ```

### 4. Structured Data Implementation

#### Business Schema Markup
- Add JSON-LD data using existing business fields:
  ```typescript
  function generateLocalBusinessSchema(business: Business): object {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": business.name,
      "description": business.bio,
      "address": business.address,
      "telephone": business.phoneNumber,
      "email": business.emailAddress,
      "url": `http://the-hubja.netlify.app/business/${business.slug}`,
      "image": business.profilePictureUrl,
      "openingHoursSpecification": business.operationHours
    };
  }
  ```

#### Product Schema Markup
- Implement product structured data using existing schema:
  ```typescript
  function generateProductSchema(product: Product, business: Business): object {
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
        "availability": product.inStock ? "InStock" : "OutOfStock"
      }
    };
  }
  ```

### 5. Performance Optimization

#### Image Optimization
- Implement lazy loading for images using React Suspense
- Add responsive image handling:
  ```typescript
  function OptimizedImage({ src, alt }: { src: string; alt: string }) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        srcSet={`${src} 300w, ${src} 600w, ${src} 900w`}
        sizes="(max-width: 300px) 300px, (max-width: 600px) 600px, 900px"
      />
    );
  }
  ```

#### Core Web Vitals
- Implement code splitting using React.lazy()
- Optimize React Query caching strategies
- Add preloading for critical resources

### 6. Sitemap Generation

#### Dynamic Sitemap
- Create a sitemap generator using Google Sheets data:
  ```typescript
  async function generateSitemap(): Promise<string> {
    const businesses = await fetchBusinesses();
    const products = await fetchAllProducts();
    
    return generateSitemapXml([
      '/',
      '/categories',
      ...businesses.map(b => `/business/${b.slug}`),
      ...products.map(p => `/business/${p.businessId}/product/${p.id}/${p.name}`)
    ]);
  }
  ```

### 7. Netlify Optimization

#### Netlify Configuration
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Cache-Control = "public, max-age=3600"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- Update schemas and models with SEO fields
- Implement React Helmet integration
- Set up basic meta tag generation

### Phase 2: Static Generation (Weeks 3-4)
- Configure Vite SSG
- Implement structured data
- Set up sitemap generation

### Phase 3: Performance (Weeks 5-6)
- Optimize images and implement lazy loading
- Improve Core Web Vitals
- Configure Netlify optimizations

## Conclusion
This SEO implementation plan is specifically tailored for TheHub's React-based architecture and Google Sheets data source. It focuses on achievable optimizations within our technical constraints while maximizing search engine visibility for our business listings.