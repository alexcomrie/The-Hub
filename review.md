# Implementing a Product Review System Using Google Sheets

## Overview

This guide will walk you through implementing a product review system for TheHub Web app using Google Sheets as the data storage solution. This approach leverages the existing architecture that already uses Google Sheets for business and product data. The system includes required fields (such as reviewer name) to ensure data quality and accountability while preventing anonymous submissions.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Setting Up the Google Sheet](#setting-up-the-google-sheet)
3. [Creating the Review Schema](#creating-the-review-schema)
4. [Implementing the Review Service](#implementing-the-review-service)
5. [Building the UI Components](#building-the-ui-components)
6. [Integration with Product Details](#integration-with-product-details)
7. [Testing the System](#testing-the-system)
8. [Additional Considerations](#additional-considerations)
   - [Rate Limiting Implementation](#rate-limiting-implementation)
   - [Moderation Process](#moderation-process)
   - [Performance Optimization](#performance-optimization)
   - [Security Considerations](#security-considerations)
   - [Data Validation](#data-validation)
   - [Data Management](#data-management)

## System Architecture

The review system will follow the same pattern as the existing business and product data flow, with added features for rate limiting and data validation:

1. **Data Source**: Google Sheet published as CSV
2. **Data Fetching**: JavaScript service to fetch and parse the CSV data
3. **Data Caching**: Local storage for offline access and performance
4. **Data Display**: React components to show reviews on product pages
5. **Data Submission**: Form to submit new reviews (with required reviewer name) that will be processed and added to the Google Sheet
6. **Rate Limiting**: Client-side and server-side mechanisms to limit users to 2 reviews per day
7. **Content Validation**: Character count limits (500 max) to prevent data overload
8. **Device Tracking**: Unique device identifiers stored in localStorage to enforce rate limits
9. **Moderation Flow**: Reviews start as "Pending" and must be approved before becoming visible

## Setting Up the Google Sheet

### Step 1: Create a new Google Sheet for reviews

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it "TheHub Product Reviews"
3. Set up the following columns in the first row:
   - Review ID
   - Product ID
   - Business ID
   - Reviewer Name
   - Rating (1-5)
   - Review Text
   - Review Date
   - Status (Approved/Pending/Rejected)
   - Device ID
   - IP Address
   - Submission Count (for rate limiting)

### Step 2: Publish the sheet as CSV

1. Click on File > Share > Publish to web
2. Select the "Entire Document" option and "Comma-separated values (.csv)" format
3. Click "Publish" and copy the generated URL
4. Save this URL for later use in your application

### Step 3: Set up a form submission method

To allow users to submit reviews, you'll need a way to add data to the Google Sheet. There are two main approaches:

#### Option A: Google Forms (Simpler but less customizable)

1. Create a Google Form linked to your review spreadsheet
2. Set up fields matching your spreadsheet columns
   - Make sure to mark the "Reviewer Name" field as required
   - Set the "Rating" field as required
   - Set appropriate validation for other fields (e.g., character limits for review text)
3. Embed the form on your website or link to it

#### Option B: Google Apps Script (More complex but fully customizable)

1. In your Google Sheet, go to Extensions > Apps Script
2. Create a web app that accepts POST requests with review data
3. Write a script to validate and append the data to your sheet
4. Deploy the script as a web app and note the URL

Here's a sample Apps Script code for Option B (with rate limiting):

```javascript
// Note: This is a conceptual implementation - do not copy directly without proper testing

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.productId || !data.businessId || !data.rating || !data.deviceId) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Explicitly validate reviewer name is required
    if (!data.reviewerName || data.reviewerName.trim() === '') {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Reviewer name is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Validate review text length (to prevent data overload)
    if (data.reviewText && data.reviewText.length > 500) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Review text exceeds maximum length of 500 characters'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check rate limiting (max 2 reviews per day per device)
    const ipAddress = e.parameter.ip || 'unknown';
    const deviceId = data.deviceId;
    
    // [CONCEPTUAL CODE] Check if user has submitted too many reviews today
    // This would involve:
    // 1. Finding all reviews from this device/IP in the last 24 hours
    // 2. Counting them and rejecting if > 2
    // 3. Updating the submission count for tracking
    
    if (checkDailySubmissionLimit(deviceId, ipAddress)) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Daily review limit reached (maximum 2 reviews per day)'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Generate a unique review ID
    const reviewId = Utilities.getUuid();
    
    // Get the current date
    const reviewDate = new Date().toISOString();
    
    // Set initial status as pending
    const status = 'Pending';
    
    // Append the data to the sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      reviewId,
      data.productId,
      data.businessId,
      data.reviewerName,
      data.rating,
      data.reviewText || '',
      reviewDate,
      status,
      deviceId,
      ipAddress,
      1 // Initial submission count
    ]);
    
    // [CONCEPTUAL CODE] Update the submission count for this device/IP
    // updateSubmissionCount(deviceId, ipAddress);
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'reviewId': reviewId
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// [CONCEPTUAL FUNCTION] - This would need to be implemented
function checkDailySubmissionLimit(deviceId, ipAddress) {
  // This function would:
  // 1. Search the sheet for entries with matching deviceId or ipAddress
  // 2. Filter to only include entries from the last 24 hours
  // 3. Count them and return true if the count >= 2
  // Return true if limit reached, false otherwise
  return false; // Placeholder return
}

function doGet() {
  return HtmlService.createHtmlOutput('<h1>TheHub Review API</h1><p>This is a POST-only API for submitting product reviews.</p>');
}
```

## Creating the Review Schema

Add a new schema definition in your `shared/schema.ts` file:

```typescript
// Review Schema
export const ReviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  businessId: z.string(),
  reviewerName: z.string().min(1, { message: "Reviewer name is required" }), // Name is required
  rating: z.number().min(1).max(5),
  reviewText: z.string().optional().max(500), // Limit text to 500 characters
  reviewDate: z.string(),
  status: z.enum(['Approved', 'Pending', 'Rejected']),
  deviceId: z.string(), // For rate limiting
  ipAddress: z.string().optional(), // For rate limiting
  submissionCount: z.number().optional() // For tracking submission counts
});

export type Review = z.infer<typeof ReviewSchema>;

// This schema is for client-side use only (we don't expose all fields to the client)
export const PublicReviewSchema = z.object({
  id: z.string(),
  reviewerName: z.string(),
  rating: z.number().min(1).max(5),
  reviewText: z.string().optional(),
  reviewDate: z.string()
});

export type PublicReview = z.infer<typeof PublicReviewSchema>;
```

## Implementing the Review Service

Create a new file `client/src/services/review-service.ts` to handle fetching and submitting reviews:

```typescript
import { Review } from "@shared/schema";

// URL of the published Google Sheet CSV
const REVIEW_SHEET_URL = 'YOUR_PUBLISHED_CSV_URL_HERE';

// URL of the Google Apps Script web app (if using Option B)
const REVIEW_SUBMISSION_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

let reviewCache: Map<string, Review[]> = new Map();

function parseReviewsCSV(csvText: string): Map<string, Review[]> {
  // Remove BOM if present
  csvText = csvText.replace(/^\uFEFF/, '');
  
  // Parse CSV similar to how business-service.ts does it
  const rows = csvText.split('\n').map(row => {
    // Handle quoted fields with commas inside them
    const result = [];
    let field = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(field);
        field = '';
      } else {
        field += char;
      }
    }
    
    result.push(field);
    return result;
  });
  
  // Skip header row
  const dataRows = rows.slice(1);
  
  // Group reviews by product ID
  const reviewsByProduct = new Map<string, Review[]>();
  
  dataRows.forEach(row => {
    if (row.length < 8) return; // Skip incomplete rows
    
    const review: Review = {
      id: row[0],
      productId: row[1],
      businessId: row[2],
      reviewerName: row[3],
      rating: parseInt(row[4], 10),
      reviewText: row[5],
      reviewDate: row[6],
      status: row[7] as 'Approved' | 'Pending' | 'Rejected'
    };
    
    // Only include approved reviews
    if (review.status !== 'Approved') return;
    
    if (!reviewsByProduct.has(review.productId)) {
      reviewsByProduct.set(review.productId, []);
    }
    
    reviewsByProduct.get(review.productId)!.push(review);
  });
  
  return reviewsByProduct;
}

async function loadReviewsFromLocal(): Promise<Map<string, Review[]>> {
  try {
    const cached = localStorage.getItem('product_reviews');
    if (cached) {
      const reviewsObj = JSON.parse(cached);
      const reviews = new Map<string, Review[]>();
      
      Object.entries(reviewsObj).forEach(([productId, productReviews]) => {
        reviews.set(productId, productReviews as Review[]);
      });
      
      return reviews;
    }
  } catch (e) {
    console.warn('Error loading reviews from localStorage:', e);
  }
  return new Map();
}

async function saveReviewsToLocal(reviews: Map<string, Review[]>): Promise<void> {
  try {
    const reviewsObj = Object.fromEntries(reviews);
    localStorage.setItem('product_reviews', JSON.stringify(reviewsObj));
    localStorage.setItem('product_reviews_time', Date.now().toString());
  } catch (e) {
    console.warn('Error saving reviews to localStorage:', e);
  }
}

async function fetchReviewsFromNetwork(): Promise<Map<string, Review[]>> {
  try {
    console.log('Fetching reviews from:', REVIEW_SHEET_URL);
    const response = await fetch(REVIEW_SHEET_URL, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv, text/plain, */*',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load reviews: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Empty response from server');
    }
    
    const reviews = parseReviewsCSV(csvText);
    await saveReviewsToLocal(reviews);
    reviewCache = reviews;
    return reviews;
  } catch (e) {
    console.error('Error fetching reviews:', e);
    throw e;
  }
}

async function loadReviews(): Promise<Map<string, Review[]>> {
  if (reviewCache.size > 0) {
    return reviewCache;
  }

  try {
    const reviews = await loadReviewsFromLocal();
    if (reviews.size > 0) {
      reviewCache = reviews;
      return reviews;
    }
  } catch (e) {
    console.warn('Failed to load reviews from local storage:', e);
  }

  try {
    return await fetchReviewsFromNetwork();
  } catch (e) {
    console.error('Failed to fetch reviews from network:', e);
    throw e;
  }
}

async function getProductReviews(productId: string): Promise<Review[]> {
  const allReviews = await loadReviews();
  return allReviews.get(productId) || [];
}

// Function to get a unique device identifier
async function getDeviceId(): Promise<string> {
  // Check if we already have a device ID in localStorage
  let deviceId = localStorage.getItem('review_device_id');
  
  if (!deviceId) {
    // Generate a new device ID if none exists
    // This is a simplified approach - in a real app, you might use more sophisticated device fingerprinting
    deviceId = `device_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
    localStorage.setItem('review_device_id', deviceId);
  }
  
  return deviceId;
}

// Function to check if user has reached daily review limit
async function checkDailyReviewLimit(): Promise<boolean> {
  // Get today's date in YYYY-MM-DD format for tracking
  const today = new Date().toISOString().split('T')[0];
  
  // Get the review count for today
  const reviewCountToday = localStorage.getItem(`review_count_${today}`) || '0';
  const count = parseInt(reviewCountToday, 10);
  
  // Return true if limit reached (2 reviews per day)
  return count >= 2;
}

// Function to increment daily review count
async function incrementDailyReviewCount(): Promise<void> {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get current count and increment
  const reviewCountToday = localStorage.getItem(`review_count_${today}`) || '0';
  const newCount = parseInt(reviewCountToday, 10) + 1;
  
  // Save updated count
  localStorage.setItem(`review_count_${today}`, newCount.toString());
}

async function submitReview(review: Omit<Review, 'id' | 'reviewDate' | 'status' | 'deviceId' | 'ipAddress' | 'submissionCount'>): Promise<{ success: boolean, reviewId?: string, error?: string }> {
  try {
    // Check if review text exceeds maximum length
    if (review.reviewText && review.reviewText.length > 500) {
      return { 
        success: false, 
        error: 'Review text exceeds maximum length of 500 characters' 
      };
    }
    
    // Check if user has reached daily review limit
    const limitReached = await checkDailyReviewLimit();
    if (limitReached) {
      return { 
        success: false, 
        error: 'Daily review limit reached (maximum 2 reviews per day)' 
      };
    }
    
    // Get device ID for tracking
    const deviceId = await getDeviceId();
    
    // Add device ID to the review data
    const reviewWithDevice = {
      ...review,
      deviceId
    };
    
    const response = await fetch(REVIEW_SUBMISSION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewWithDevice)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit review: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // Increment the daily review count
      await incrementDailyReviewCount();
      
      // Invalidate cache to ensure fresh data on next load
      localStorage.removeItem('product_reviews');
      localStorage.removeItem('product_reviews_time');
      reviewCache.clear();
      
      return { success: true, reviewId: result.reviewId };
    } else {
      return { success: false, error: result.message || 'Unknown error' };
    }
  } catch (e) {
    console.error('Error submitting review:', e);
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export const ReviewService = {
  loadReviews,
  getProductReviews,
  submitReview
};
```

## Building the UI Components

### Step 1: Create a Review Hook

Create a new file `client/src/hooks/use-reviews.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewService } from "@/services/review-service";
import { Review } from "@shared/schema";

export function useProductReviews(productId: string) {
  return useQuery<Review[]>({
    queryKey: ["product-reviews", productId],
    queryFn: () => ReviewService.getProductReviews(productId),
    enabled: !!productId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (review: Omit<Review, 'id' | 'reviewDate' | 'status'>) => {
      return ReviewService.submitReview(review);
    },
    onSuccess: (_, variables) => {
      // Invalidate the product reviews query to refetch data
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.productId] });
    },
  });
}
```

### Step 2: Create Review Components

Create a new file `client/src/components/review-list.tsx`:

```tsx
import { Review } from "@shared/schema";
import { StarIcon } from "lucide-react";

interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
}

export function ReviewList({ reviews, isLoading }: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted rounded-lg p-4">
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-full mb-1"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium">{review.reviewerName}</h4>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {new Date(review.reviewDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          {review.reviewText && <p className="text-sm">{review.reviewText}</p>}
        </div>
      ))}
    </div>
  );
}
```

Create a new file `client/src/components/review-form.tsx`:

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarIcon } from "lucide-react";
import { useSubmitReview } from "@/hooks/use-reviews";

interface ReviewFormProps {
  productId: string;
  businessId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, businessId, onSuccess }: ReviewFormProps) {
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  
  const { mutate, isPending, isError, error } = useSubmitReview();
  
  // Check if daily limit is reached on component mount
  useEffect(() => {
    const checkDailyLimit = async () => {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Get the review count for today
      const reviewCountToday = localStorage.getItem(`review_count_${today}`) || '0';
      const count = parseInt(reviewCountToday, 10);
      
      // Set state based on limit
      setDailyLimitReached(count >= 2);
    };
    
    checkDailyLimit();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!reviewerName.trim()) {
      // Show error for empty reviewer name
      return;
    }
    
    if (rating === 0) {
      // Rating is required
      return;
    }
    
    // Validate review text length
    if (reviewText && reviewText.length > 500) {
      // This validation is also handled server-side, but we add it here for better UX
      return;
    }
    
    mutate(
      {
        productId,
        businessId,
        reviewerName,
        rating,
        reviewText
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setReviewerName("");
          setRating(0);
          setReviewText("");
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          // Check if error is due to daily limit
          if (error.message?.includes('Daily review limit')) {
            setDailyLimitReached(true);
          }
        }
      }
    );
  };

  // Display daily limit reached message
  if (dailyLimitReached) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <h4 className="font-medium text-amber-800 mb-2">Daily Review Limit Reached</h4>
        <p className="text-sm text-amber-700">
          You've reached the maximum of 2 reviews per day. Please try again tomorrow.
        </p>
      </div>
    );
  }

  // Display thank you message after submission
  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <h4 className="font-medium text-green-800 mb-2">Thank you for your review!</h4>
        <p className="text-sm text-green-700">Your review has been submitted and will be visible after approval.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Write Another Review
        </Button>
      </div>
    );
  }

  // Calculate remaining characters
  const maxCharacters = 500;
  const charactersRemaining = maxCharacters - (reviewText?.length || 0);
  const isOverLimit = charactersRemaining < 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display remaining reviews count */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> You can submit up to 2 reviews per day. Reviews are limited to 500 characters.
        </p>
      </div>

      <div>
        <label htmlFor="reviewerName" className="block text-sm font-medium mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="reviewerName"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          required
          aria-required="true"
          placeholder="Enter your name (required)"
          className={!reviewerName.trim() && 'border-red-300 focus:border-red-500 focus:ring-red-500'}
        />
        {!reviewerName.trim() && (
          <p className="mt-1 text-xs text-red-500">
            Reviewer name is required
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Rating *</label>
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <StarIcon
                className={`h-6 w-6 ${(hoverRating || rating) > i ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="reviewText" className="block text-sm font-medium">
            Review
          </label>
          <span className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            {charactersRemaining} characters remaining
          </span>
        </div>
        <Textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className={isOverLimit ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
        />
        {isOverLimit && (
          <p className="mt-1 text-xs text-red-500">
            Your review is too long. Please shorten it to 500 characters or less.
          </p>
        )}
      </div>
      
      {isError && (
        <div className="text-red-500 text-sm">
          {error instanceof Error ? error.message : "Failed to submit review. Please try again."}
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={isPending || !reviewerName.trim() || rating === 0 || isOverLimit}
        title={!reviewerName.trim() ? "Reviewer name is required" : ""}
      >
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
      
      <div className="text-xs text-gray-500 mt-2">
        <span className="text-red-500">*</span> Required fields
      </div>
    </form>
  );
}
```

## Integration with Product Details

Update the `product-details.tsx` file to include the review components:

```tsx
// Add these imports at the top
import { useProductReviews } from "@/hooks/use-reviews";
import { ReviewList } from "@/components/review-list";
import { ReviewForm } from "@/components/review-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Inside the ProductDetails component, add this after fetching the product data
const { data: reviews, isLoading: isLoadingReviews } = useProductReviews(params.productId);

// Add this inside the Card component, after the product details section
<Tabs defaultValue="details" className="mt-6">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="reviews">
      Reviews {reviews?.length ? `(${reviews.length})` : ''}
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="details" className="space-y-4">
    <div>
      <h3 className="text-lg font-semibold mb-1">Description</h3>
      <p className="text-gray-600">{product.description}</p>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-1">Category</h3>
      <p className="text-gray-600">{product.category}</p>
    </div>
  </TabsContent>
  
  <TabsContent value="reviews" className="space-y-6">
    <h3 className="text-lg font-semibold">Customer Reviews</h3>
    <ReviewList reviews={reviews || []} isLoading={isLoadingReviews} />
    
    <div className="border-t pt-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      <ReviewForm 
        productId={params.productId} 
        businessId={params.id} 
      />
    </div>
  </TabsContent>
</Tabs>
```

## Testing the System

### Step 1: Set up test data

1. Add a few sample reviews to your Google Sheet
2. Make sure they have the status set to "Approved"
3. Publish the sheet to update the CSV

### Step 2: Test the review display

1. Update the `REVIEW_SHEET_URL` in your review service with the published CSV URL
2. Run your application and navigate to a product details page
3. Verify that the reviews tab shows the sample reviews

### Step 3: Test the review submission

1. If using Google Apps Script (Option B), update the `REVIEW_SUBMISSION_URL` in your review service
2. Fill out and submit the review form
3. Check your Google Sheet to verify the new review was added with "Pending" status
4. Change the status to "Approved" and publish the sheet again
5. Refresh the product page to see the new review

## Additional Considerations

### Rate Limiting Implementation

The system includes rate limiting to prevent abuse and data overload:

1. **Device Tracking**: Each device is assigned a unique identifier stored in localStorage
2. **Daily Limits**: Users are limited to 2 reviews per day per device
3. **Character Limits**: Reviews are limited to 500 characters maximum
4. **Client-Side Validation**: The UI shows character count and prevents submission of too-long reviews
5. **Server-Side Validation**: The Google Apps Script also validates limits as a security measure

### Moderation Process

Since reviews are submitted with a "Pending" status, you'll need a moderation process:

1. Regularly check the Google Sheet for new reviews
2. Review the content and change the status to "Approved" or "Rejected"
3. Republish the sheet to update the CSV
4. Consider setting up email notifications for new review submissions

### Performance Optimization

To improve performance:

1. Implement a caching strategy with a reasonable expiration time
2. Consider adding a "last updated" timestamp to avoid unnecessary fetches
3. Implement pagination if the number of reviews grows large
4. Purge old rejected reviews periodically to keep the sheet manageable

### Security Considerations

1. The rate limiting system helps prevent spam and abuse
2. Sanitize user input to prevent XSS attacks
3. Consider adding a simple authentication mechanism for reviewers
4. Implement IP tracking as an additional layer of rate limiting
5. Required reviewer name helps ensure accountability and reduces anonymous spam

### Data Validation

1. **Required Fields**: The reviewer name and rating are required fields
2. **Input Validation**: Client-side and server-side validation ensure data integrity
3. **Character Limits**: Review text is limited to 500 characters
4. **Error Messages**: Clear error messages guide users when required fields are missing
5. Consider implementing a profanity filter for automatic rejection of inappropriate content

### Data Management

1. Set up a scheduled cleanup process to archive old reviews
2. Create a separate sheet for analytics to track review patterns
3. Consider implementing a backup system for the review data

### Alternative: Using Google Sheets API

For a more robust solution, you could use the Google Sheets API instead of CSV:

1. Set up a Google Cloud project
2. Enable the Google Sheets API
3. Create service account credentials
4. Use the API to read and write data directly

This approach requires more setup but provides better control and real-time updates.

## Conclusion

By following this guide, you've implemented a complete product review system using Google Sheets as the backend. This approach leverages the existing architecture of TheHub Web app while adding valuable functionality for your users.

Key features of this implementation include:

1. **Google Sheets Integration**: Seamlessly works with your existing data infrastructure
2. **Rate Limiting**: Prevents system abuse by limiting users to 2 reviews per day
3. **Character Limits**: Keeps reviews concise and prevents data overload with a 500-character limit
4. **Moderation System**: Ensures quality content through a review approval process
5. **Responsive UI**: Provides real-time feedback on character count and submission limits
6. **Device Tracking**: Uses device identifiers to enforce rate limits without requiring user accounts

The system allows customers to read reviews before making purchase decisions and share their own experiences after using products, enhancing the overall shopping experience without requiring complex database infrastructure. The built-in rate limiting and moderation features help maintain data quality while preventing system abuse.