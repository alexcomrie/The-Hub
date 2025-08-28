import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  // Size mapping for stars
  const sizeMap = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  // Handle click on star
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index);
    }
  };
  
  // Handle mouse enter on star
  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };
  
  // Handle mouse leave on star container
  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };
  
  return (
    <div 
      className={cn('flex items-center', className)}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating;
        
        return (
          <Star
            key={index}
            className={cn(
              sizeMap[size],
              'transition-colors',
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-300',
              interactive && 'cursor-pointer'
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            data-testid={`star-${starValue}`}
          />
        );
      })}
    </div>
  );
}