import { ProductReview } from '@shared/schema';

// API endpoint for reviews
const REVIEW_API_URL = 'https://script.google.com/macros/s/AKfycbw_hnumK9gmuzxRffQFOF0DgKp2-ehz3PRiFM4LWr6mX7IBXa00Z_CKa92HeLjIXIlM/exec';

// Response interface for review API
export type ReviewResponse = ProductReview[]

// Response interface for review summary API
export interface ReviewSummaryResponse {
  productId: string;
  businessId: string;
  averageRating: number;
  totalReviews: number;
}

/**
 * Fetches reviews for a specific product
 */
export async function getReviews(productId: string): Promise<ReviewResponse> {
  try {
    const url = new URL(REVIEW_API_URL);
    url.searchParams.append('action', 'getReviews');
    url.searchParams.append('productId', productId);
    
    const response = await fetch(url.toString(), {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch reviews');
    }
    return data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    console.error('Error fetching reviews:', error);
    return [];
  }
}

/**
 * Submits a review for a product
 */
export async function submitReview(productId: string, review: Omit<ProductReview, 'id' | 'productId'>): Promise<ReviewResponse> {
  try {
    const url = new URL(REVIEW_API_URL);
    const body = { action: 'submitReview', productId, ...review };
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit review: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to submit review');
    }
    return data.reviews || [];
  } catch (error) {
    console.error('Error submitting review:', error);
    console.error('Error submitting review:', error);
    return [];
  }
}

/**
 * Fetches review summary for a specific product
 */
export async function getProductReviewSummary(productId: string, businessId: string): Promise<ReviewSummaryResponse> {
  try {
    const url = new URL(REVIEW_API_URL);
    url.searchParams.append('action', 'getReviewSummary');
    url.searchParams.append('productId', productId);
    url.searchParams.append('businessId', businessId);
    
    const response = await fetch(url.toString(), {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch review summary: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch review summary');
    }
    return data.summary || {
      productId,
      businessId,
      averageRating: 0,
      totalReviews: 0
    };
  } catch (error) {
    console.error('Error fetching review summary:', error);
    return {
      productId,
      businessId,
      averageRating: 0,
      totalReviews: 0
    };
  }
}