import { Business, Product } from '../../client/src/models/business';
import { generateCanonicalUrl } from '../../client/src/utils/seo';

/**
 * Interface for sitemap URL entry
 */
export interface SitemapURL {
  url: string;
  lastmod?: string;
  priority: number;
  changefreq: string;
}

/**
 * Generate sitemap URLs for static pages
 */
export function generateStaticPageUrls(): SitemapURL[] {
  const baseUrl = 'https://the-hubja.netlify.app';
  
  return [
    {
      url: `${baseUrl}/`,
      lastmod: new Date().toISOString(),
      priority: 1.0,
      changefreq: 'weekly'
    },
    {
      url: `${baseUrl}/all-businesses`,
      lastmod: new Date().toISOString(),
      priority: 0.9,
      changefreq: 'weekly'
    }
  ];
}

/**
 * Generate sitemap URLs for category pages
 */
export function generateCategoryUrls(businesses: Business[]): SitemapURL[] {
  const baseUrl = 'https://the-hubja.netlify.app';
  const categories = Array.from(new Set(businesses.map(b => b.category).filter(Boolean)));
  
  return categories.map(category => ({
    url: `${baseUrl}/category/${encodeURIComponent(category?.toLowerCase() || '')}`,
    lastmod: new Date().toISOString(),
    priority: 0.8,
    changefreq: 'weekly'
  }));
}

/**
 * Generate sitemap URLs for business pages
 */
export function generateBusinessUrls(businesses: Business[]): SitemapURL[] {
  const baseUrl = 'https://the-hubja.netlify.app';
  
  return businesses.map(business => {
    const slug = business.slug || business.id;
    return {
      url: `${baseUrl}/business/${slug}`,
      lastmod: new Date().toISOString(),
      priority: 0.8,
      changefreq: 'weekly'
    };
  });
}

/**
 * Generate sitemap URLs for product pages
 */
export function generateProductUrls(businesses: Business[], productsMap: Map<string, Product[]>): SitemapURL[] {
  const baseUrl = 'https://the-hubja.netlify.app';
  const urls: SitemapURL[] = [];
  
  for (const business of businesses) {
    if (business.productSheetUrl) {
      const products = productsMap.get(business.id) || [];
      
      for (const product of products) {
        urls.push({
          url: `${baseUrl}/business/${business.id}/product/${product.id}/${encodeURIComponent(product.name)}`,
          lastmod: new Date().toISOString(),
          priority: 0.7,
          changefreq: 'weekly'
        });
      }
    }
  }
  
  return urls;
}

/**
 * Generate all sitemap URLs
 */
export function generateSitemapUrls(businesses: Business[], productsMap: Map<string, Product[]>): SitemapURL[] {
  const staticUrls = generateStaticPageUrls();
  const categoryUrls = generateCategoryUrls(businesses);
  const businessUrls = generateBusinessUrls(businesses);
  const productUrls = generateProductUrls(businesses, productsMap);
  
  // Combine all URLs and ensure they're all valid SitemapURL objects (no nulls)
  const allUrls = [...staticUrls, ...categoryUrls, ...businessUrls, ...productUrls];
  return allUrls.filter((url): url is SitemapURL => url !== null);
}

/**
 * Type guard for SitemapURL
 */
function isValidSitemapURL(url: SitemapURL | null): url is SitemapURL {
  return url !== null;
}

/**
 * Generate sitemap XML string
 */
export function generateSitemapXml(urls: SitemapURL[]): string {
  const urlElements = urls.map(url => {
    let element = `
  <url>
    <loc>${url.url}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>`;
    
    if (url.lastmod) {
      element += `
    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    element += `
  </url>`;
    
    return element;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlElements}
</urlset>`;
}