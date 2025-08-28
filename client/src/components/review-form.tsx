import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { StarRating } from './star-rating';
import { useProductReviews } from '@/hooks/use-reviews';
import { UsernameModal } from './username-modal';

interface ReviewFormProps {
  productId: string;
  businessId: string;
  className?: string;
}

export function ReviewForm({ productId, businessId, className }: ReviewFormProps) {
  const { submitReview, isSubmitting, isUsernameRequired } = useProductReviews(productId, businessId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  
  // Handle rating change
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (error) setError('');
  };
  
  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    if (error) setError('');
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    // Check if username is required
    if (isUsernameRequired) {
      setIsUsernameModalOpen(true);
      return;
    }
    
    // Submit review
    try {
      submitReview(rating, comment);
      // Reset form
      setRating(0);
      setComment('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while submitting your review');
      }
    }
  };
  
  // Close username modal
  const handleCloseUsernameModal = () => {
    setIsUsernameModalOpen(false);
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className={className}>
        <div className="space-y-4">
          <div>
            <label htmlFor="rating" className="block text-sm font-medium mb-1">
              Rating
            </label>
            <StarRating 
              rating={rating} 
              interactive 
              onChange={handleRatingChange} 
              size="lg" 
            />
          </div>
          
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-1">
              Review
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Share your experience with this product..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
      
      {/* Username Modal */}
      <UsernameModal 
        isOpen={isUsernameModalOpen} 
        onClose={handleCloseUsernameModal} 
      />
    </>
  );
}