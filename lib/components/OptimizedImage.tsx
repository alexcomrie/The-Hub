import React from 'react';

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

export default OptimizedImage;