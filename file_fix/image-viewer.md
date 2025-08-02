import { useEffect, useState } from 'react';
import { BusinessService } from '@/services/business-service';
import { Dialog } from '@/components/ui/dialog';

interface ImageViewerProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  onError?: () => void;
  refreshKey?: number;
  enableZoom?: boolean;
}

export default function ImageViewer({ 
  imageUrl, 
  alt = '', 
  className = '', 
  onError, 
  refreshKey = 0,
  enableZoom = false 
}: ImageViewerProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Preload the image to check if it's accessible
    if (imageUrl) {
      const directUrl = BusinessService.getDirectImageUrl(imageUrl);
      console.log('Preloading image:', directUrl);
      
      BusinessService.testDirectImageUrl(directUrl).then((success) => {
        if (!success) {
          console.warn('Image preload failed, will try alternative formats');
        }
      });
    }
    
    setError(false);
    setLoading(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl, refreshKey]);

  if (!imageUrl) {
    console.warn('ImageViewer: No image URL provided');
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="w-24 h-24 bg-gray-300 rounded flex items-center justify-center">
          <span className="text-gray-500 text-xs">No Image</span>
        </div>
      </div>
    );
  }

  const handleError = () => {
    console.error('Image failed to load:', imageUrl);
    setError(true);
    setLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setLoading(false);
  };

  // Get the image URL with retry logic
  const getImageUrl = () => {
    const directUrl = BusinessService.getDirectImageUrl(imageUrl);
    return `${directUrl}${directUrl.includes('?') ? '&' : '?'}t=${refreshKey}`;
  };

  const handleZoom = (event: WheelEvent) => {
    if (!enableZoom) return;
    event.preventDefault();
    const delta = event.deltaY * -0.01;
    const newScale = Math.min(Math.max(scale + delta, 0.5), 4);
    setScale(newScale);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!enableZoom || scale === 1) return;
    if (event.buttons === 1) {
      setPosition({
        x: position.x + event.movementX,
        y: position.y + event.movementY
      });
    }
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="w-24 h-24 bg-gray-300 rounded flex items-center justify-center">
          <span className="text-gray-500 text-xs">Failed to Load</span>
        </div>
      </div>
    );
  }

  const imageComponent = (
    <div 
      className={`relative ${className} ${enableZoom ? 'cursor-move' : ''}`}
      onWheel={handleZoom as any}
      onMouseMove={handleMouseMove}
      style={{ overflow: 'hidden' }}
    >
      <img
        src={getImageUrl()}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transition: loading ? 'opacity 0.3s' : 'transform 0.1s'
        }}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        crossOrigin="anonymous"
      />
      {loading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      {enableZoom && (
        <button
          onClick={handleFullscreenToggle}
          className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V9a1 1 0 01-2 0V4zm12 0a1 1 0 00-1-1h-4a1 1 0 000 2h2.586l-2.293 2.293a1 1 0 001.414 1.414L15 6.414V9a1 1 0 002 0V4zM4 16a1 1 0 001 1h4a1 1 0 000-2H6.414l2.293-2.293a1 1 0 00-1.414-1.414L5 13.586V11a1 1 0 00-2 0v5zm12 0a1 1 0 01-1 1h-4a1 1 0 010-2h2.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V11a1 1 0 012 0v5z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5.414l2.293 2.293a1 1 0 11-1.414 1.414L4 6.414V9a1 1 0 01-2 0V4zm12 0a1 1 0 00-1-1h-4a1 1 0 000 2h2.586l-2.293 2.293a1 1 0 001.414 1.414L16 6.414V9a1 1 0 002 0V4zM3 16a1 1 0 001 1h4a1 1 0 000-2H5.414l2.293-2.293a1 1 0 00-1.414-1.414L4 13.586V11a1 1 0 00-2 0v5zm12 0a1 1 0 01-1 1h-4a1 1 0 010-2h2.586l-2.293-2.293a1 1 0 011.414-1.414L16 13.586V11a1 1 0 012 0v5z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      )}
    </div>
  );

  return (
    <>
      {imageComponent}
      {isFullscreen && (
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            {imageComponent}
          </div>
        </Dialog>
      )}
    </>
  );
}