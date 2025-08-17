import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

/**
 * OptimizedImage component with lazy loading and responsive handling
 */
export default function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  onLoad,
  onError,
  style,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate srcSet for responsive images
  const generateSrcSet = (url: string) => {
    if (!url) return '';
    
    // For external URLs, we can't generate different sizes
    if (url.startsWith('http')) {
      return url;
    }
    
    // For local images, we would normally use different sizes
    // Since we don't have a real image processing pipeline, we'll just use the same URL
    return `${url} 300w, ${url} 600w, ${url} 900w`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  return (
    <div className={cn(
      'relative overflow-hidden',
      className
    )}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-pulse rounded-md bg-muted-foreground/10 w-full h-full"></div>
        </div>
      )}
      
      {error ? (
        <div className="flex items-center justify-center bg-muted w-full h-full min-h-[200px]">
          <span className="text-muted-foreground">Image not available</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-auto object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={style}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}