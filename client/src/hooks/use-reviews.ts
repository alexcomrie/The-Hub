import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ReviewService from '../services/review-service';
import { useUsername } from '../providers/username-provider';
import { ProductReviewSchema } from '../../../shared/schema';
import { z } from 'zod';

// Hook for managing product reviews
export function useProductReviews(productId: string, businessId: string) {
  const queryClient = useQueryClient();
  const { username, isUsernameSet } = useUsername();
  
  // Query to fetch reviews for a product
  const reviewsQuery = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => ReviewService.getReviews(productId),
    refetchInterval: 30000, // Poll every 30 seconds for new reviews
    staleTime: 10000, // Consider data stale after 10 seconds
  });
  
  // Mutation to submit a new review
  const reviewMutation = useMutation({
    mutationFn: (reviewData: z.infer<typeof ProductReviewSchema>) => {
      return ReviewService.submitReview(productId, reviewData);
    },
    onMutate: async (newReview) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reviews', productId] });
      
      // Snapshot the previous value
      const previousReviews = queryClient.getQueryData(['reviews', productId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['reviews', productId], (old: any) => {
        const optimisticReview = {
          ...newReview,
          id: `temp-${Date.now()}`,
          createdAt: Date.now(),
        };
        
        return old ? [...old, optimisticReview] : [optimisticReview];
      });
      
      // Also update the review summary
      queryClient.invalidateQueries({ queryKey: ['reviewSummary', productId] });
      
      // Return a context object with the previous value
      return { previousReviews };
    },
    onError: (err, newReview, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousReviews) {
        queryClient.setQueryData(['reviews', productId], context.previousReviews);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviewSummary', productId] });
    },
  });
  
  // Submit a new review
  const submitReview = (rating: number, comment: string) => {
    if (!isUsernameSet) {
      throw new Error('Username is required to submit a review');
    }
    
    const timestamp = Date.now();
    return reviewMutation.mutate({
      id: `temp-${timestamp}`,
      productId,
      businessId,
      username: username!,
      rating,
      comment,
      createdAt: timestamp,
      timestamp
    });
  };
  
  return {
    reviews: reviewsQuery.data || [],
    isLoading: reviewsQuery.isLoading,
    isError: reviewsQuery.isError,
    error: reviewsQuery.error,
    submitReview,
    isSubmitting: reviewMutation.isPending,
    isUsernameRequired: !isUsernameSet,
  };
}

// Hook for getting review summary for a product
export function useProductReviewSummary(productId: string, businessId: string) {
  // Query to fetch review summary
  const summaryQuery = useQuery({
    queryKey: ['reviewSummary', productId, businessId],
    queryFn: () => ReviewService.getProductReviewSummary(productId, businessId),
    staleTime: 60000, // Consider data stale after 1 minute
  });
  
  return {
    summary: summaryQuery.data,
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError,
    error: summaryQuery.error,
  };
}