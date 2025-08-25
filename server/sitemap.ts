import { BusinessService } from '../client/src/services/business-service';
import { Business, Product } from '../shared/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Generate a sitemap XML string from a list of URLs
 * @param urls List of URLs to include in the sitemap
 * @returns XML string
 */
function generateSitemapXml(urls: string[]): string {
  const baseUrl = 'https://the-hubja.netlify.app';
  
  const urlElements = urls.map(url => {
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    return `
  <url>
    <loc>${fullUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlElements}
</urlset>`;
}

/**
 * Generate a sitemap from business and product data
 */
async function generateSitemap(): Promise<string> {
  try {
    // Load businesses
    const businesses = await BusinessService.loadBusinesses();
    
    // Generate URLs for static pages
    const staticUrls = [
      '/',
      '/all-businesses',
    ];
    
    // Generate URLs for category pages
    const categories = Array.from(new Set(businesses.map(b => b.category).filter(Boolean)));
    const categoryUrls = categories.map(category => `/category/${encodeURIComponent(category?.toLowerCase() || '')}`);
    
    // Generate URLs for business pages
    const businessUrls = businesses.map(business => {
      const slug = business.slug || business.id;
      return `/business/${slug}`;
    });
    
    // Generate URLs for product pages
    const productUrls: string[] = [];
    
    for (const business of businesses) {
      if (business.productSheetUrl) {
        try {
          const productsMap = await BusinessService.loadProducts(business.productSheetUrl);
          
          for (const [category, products] of Array.from(productsMap.entries())) {
            for (const product of products) {
              productUrls.push(`/business/${business.id}/product/${product.id}/${encodeURIComponent(product.name)}`);
            }
          }
        } catch (error) {
          console.error(`Error loading products for business ${business.id}:`, error);
        }
      }
    }
    
    // Combine all URLs
    const allUrls = [...staticUrls, ...categoryUrls, ...businessUrls, ...productUrls];
    
    // Generate sitemap XML
    return generateSitemapXml(allUrls);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

/**
 * Write sitemap to file
 */
async function writeSitemap(): Promise<void> {
  try {
    const sitemap = await generateSitemap();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const outputPath = path.resolve(__dirname, '../client/public/sitemap.xml');
    
    fs.writeFileSync(outputPath, sitemap);
    console.log(`Sitemap written to ${outputPath}`);
  } catch (error) {
    console.error('Error writing sitemap:', error);
    throw error;
  }
}

export { generateSitemap, writeSitemap };