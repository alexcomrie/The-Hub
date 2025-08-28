import React from 'react';
import { StarRating } from './star-rating';
import { useProductReviews } from '@/hooks/use-reviews';
import { format } from 'date-fns';
import { type ProductReview } from '../../../shared/schema';

interface ReviewListProps {
  productId: string;
  businessId: string;
  className?: string;
}

export function ReviewList({ productId, businessId, className }: ReviewListProps) {
  const { reviews, isLoading, isError } = useProductReviews(productId, businessId);
  
  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border rounded-md animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className={className}>
        <p className="text-sm text-red-500">Failed to load reviews</p>
      </div>
    );
  }
  
  if (reviews.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="space-y-4">
        {reviews.map((review: ProductReview) => (
          <div key={review.id} className="p-4 border rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="font-medium">{review.username}</span>
              </div>
              <span className="text-xs text-gray-500">
                {format(review.createdAt, 'MMM d, yyyy')}
              </span>
            </div>
            <p className="text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}