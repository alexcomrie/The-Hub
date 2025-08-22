# Additional SEO Features to Implement

## 1. Static Site Generation (SSG)

### Required Changes
- Configure Vite for SSG support
- Update `vite.config.ts` to include:
  ```typescript
  build: {
    ssr: true,
    prerender: {
      routes: [
        '/',
        '/categories',
        // Dynamic routes will be added during build
      ]
    }
  }
  ```
- Add build script for route generation

## 2. Image Optimization

### Implementation Plan
- Create an OptimizedImage component that works with Google Drive links:
  ```typescript
  // components/OptimizedImage.tsx
  interface OptimizedImageProps {
    src: string; // Google Drive URL
    alt: string;
    className?: string;
  }

  function OptimizedImage({
    src,
    alt,
    className
  }: OptimizedImageProps) {
    // Handle Google Drive image URL
    const imageUrl = src.includes('drive.google.com') 
      ? src.replace(/\/view.*$/, '/preview') // Convert to preview URL if needed
      : src;

    return (
      <div className={`image-container ${className || ''}`}>
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          onError={(e) => {
            // Fallback handling for Google Drive rate limits
            console.error('Image load error:', e);
            // You can implement retry logic or fallback image here
          }}
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block'
          }}
        />
      </div>
    );
  }
  ```

### Integration Points
- Replace standard img tags while maintaining Google Drive URLs:
  - Business profile images
  - Product galleries
  - Category icons
- Add CSS for image container:
  ```css
  .image-container {
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  ```

## 3. Core Web Vitals Optimization

### Performance Monitoring Setup

#### 1. Lighthouse CI Integration
- Add GitHub Action workflow:
  ```yaml
  # .github/workflows/lighthouse.yml
  name: Lighthouse CI
  on: [push, pull_request]
  jobs:
    lighthouse:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - name: Lighthouse
          uses: treosh/lighthouse-ci-action@v9
          with:
            urls: |
              https://the-hubja.netlify.app/
              https://the-hubja.netlify.app/categories
            uploadArtifacts: true
            temporaryPublicStorage: true
  ```

#### 2. Real User Monitoring (RUM)
- Implement web-vitals library:
  ```typescript
  // utils/analytics.ts
  import { getCLS, getFID, getLCP } from 'web-vitals';

  function sendToAnalytics({ name, delta, id }) {
    // Send to your analytics service
    console.log(`Metric: ${name} ID: ${id} Value: ${delta}`);
  }

  export function initVitals() {
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getLCP(sendToAnalytics);
  }
  ```

#### 3. Performance Dashboard
- Set up Netlify Analytics for:
  - Page load times
  - Time to First Byte (TTFB)
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)

#### 4. Monitoring Thresholds
- Set up alerts for:
  - LCP > 2.5 seconds
  - FID > 100 milliseconds
  - CLS > 0.1
  - TTFB > 0.6 seconds

### Code Optimization
- Implement React.lazy() for route-based code splitting:
  ```typescript
  // App.tsx
  const BusinessProfile = React.lazy(() => import('./pages/BusinessProfile'));
  const ProductList = React.lazy(() => import('./pages/ProductList'));
  ```

### React Query Optimization
- Update caching strategies:
  ```typescript
  // hooks/useBusinessData.ts
  export function useBusinessData(businessId: string) {
    return useQuery([
      'business',
      businessId
    ], 
    () => fetchBusiness(businessId),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false
    });
  }
  ```

### Resource Optimization
- Implement resource hints:
  ```html
  <!-- index.html -->
  <link rel="preconnect" href="https://drive.google.com">
  <link rel="dns-prefetch" href="https://drive.google.com">
  ```

## 4. Implementation Timeline

### Week 1-2: SSG Implementation
- Configure Vite SSG
- Set up route generation
- Test build process

### Week 3-4: Image Optimization
- Create OptimizedImage component
- Update existing image implementations
- Test responsive behavior

### Week 5-6: Core Web Vitals
- Set up monitoring tools
- Implement code splitting
- Optimize React Query
- Add resource hints

## 5. Success Metrics

- Lighthouse scores > 90 for all categories
- Core Web Vitals passing threshold
- Reduced Time to First Byte (TTFB)
- Improved Largest Contentful Paint (LCP)