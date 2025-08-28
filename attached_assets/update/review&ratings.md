# Review & Rating System Implementation Plan

## Overview

This document outlines the comprehensive implementation plan for adding a Review and Rating system to TheHub web application. The system will include "Like/Dislike" functionality for businesses and "Review & Star Rating" functionality for products, along with a username system for user identification. The username system will be managed entirely in the frontend using localStorage.

## Data Models

### New Schemas

We'll need to add the following schemas to `shared/schema.ts`:

```typescript
// Username Schema
export const UsernameSchema = z.object({
  username: z.string().min(3).max(30),
  createdAt: z.number(), // timestamp
  lastUpdatedAt: z.number(), // timestamp
});

// Business Vote Schema
export const BusinessVoteSchema = z.object({
  businessId: z.string(),
  username: z.string(),
  vote: z.enum(['like', 'dislike']),
  timestamp: z.number(),
});

// Product Review Schema
export const ProductReviewSchema = z.object({
  productId: z.string(),
  businessId: z.string(),
  username: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().max(500),
  timestamp: z.number(),
});

// Export types
export type Username = z.infer<typeof UsernameSchema>;
export type BusinessVote = z.infer<typeof BusinessVoteSchema>;
export type ProductReview = z.infer<typeof ProductReviewSchema>;
```

### Google Sheets Schema

The Google Apps Script will create and manage the following sheets:

1. **Likes Sheet**
   - Columns: `businessId`, `username`, `vote`, `timestamp`

2. **Reviews Sheet**
   - Columns: `productId`, `businessId`, `username`, `rating`, `review`, `timestamp`

3. **Meta Sheet**
   - Columns: `key`, `value` (for storing system metadata)

## Frontend Implementation

### 1. Username System

#### Create Username Provider

Create a new provider in `client/src/providers/username-provider.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UsernameSchema } from '@shared/schema';

interface UsernameContextType {
  username: string | null;
  createdAt: number | null;
  lastUpdatedAt: number | null;
  isFirstVisit: boolean;
  canUpdateUsername: boolean;
  setUsername: (username: string) => void;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

const UsernameContext = createContext<UsernameContextType | undefined>(undefined);

export function useUsername() {
  const context = useContext(UsernameContext);
  if (context === undefined) {
    throw new Error('useUsername must be used within a UsernameProvider');
  }
  return context;
}

interface UsernameProviderProps {
  children: ReactNode;
}

export function UsernameProvider({ children }: UsernameProviderProps) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  
  // Load username from localStorage on mount
  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem('username');
      const savedCreatedAt = localStorage.getItem('username_createdAt');
      const savedLastUpdatedAt = localStorage.getItem('username_lastUpdatedAt');
      
      if (savedUsername) {
        setUsernameState(savedUsername);
        setCreatedAt(savedCreatedAt ? parseInt(savedCreatedAt) : null);
        setLastUpdatedAt(savedLastUpdatedAt ? parseInt(savedLastUpdatedAt) : null);
      } else {
        setIsFirstVisit(true);
      }
    } catch (e) {
      console.warn('Failed to load username from localStorage:', e);
    }
  }, []);
  
  // Calculate if username can be updated (31 days since last update)
  const canUpdateUsername = (): boolean => {
    if (!lastUpdatedAt) return true;
    const daysSinceUpdate = (Date.now() - lastUpdatedAt) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 31;
  };
  
  // Set username and save to localStorage
  const setUsername = (newUsername: string) => {
    const now = Date.now();
    const isNew = !username;
    
    setUsernameState(newUsername);
    
    if (isNew) {
      setCreatedAt(now);
      localStorage.setItem('username_createdAt', now.toString());
    }
    
    setLastUpdatedAt(now);
    setIsFirstVisit(false);
    
    localStorage.setItem('username', newUsername);
    localStorage.setItem('username_lastUpdatedAt', now.toString());
    
    // No need to sync with server as username is only stored in localStorage
  };
  
  // Check if username is available (now only checks localStorage)
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    // Since we're only using localStorage, we just need to check if the username is different from the current one
    return username !== localStorage.getItem('username');
  };
  
  const value: UsernameContextType = {
    username,
    createdAt,
    lastUpdatedAt,
    isFirstVisit,
    canUpdateUsername: canUpdateUsername(),
    setUsername,
    checkUsernameAvailability,
  };
  
  return (
    <UsernameContext.Provider value={value}>
      {children}
    </UsernameContext.Provider>
  );
}
```

#### Update App.tsx

Add the UsernameProvider to the application:

```typescript
// In App.tsx
import { UsernameProvider } from "@/providers/username-provider";

// Inside the App component
return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <UsernameProvider>
          {/* Rest of the app */}
        </UsernameProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
```

#### Create Username Modal Component

Create a new component in `client/src/components/username-modal.tsx`:

```typescript
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUsername } from "@/providers/username-provider";
import { useToast } from "@/hooks/use-toast";

export function UsernameModal() {
  const { username, isFirstVisit, canUpdateUsername, setUsername, checkUsernameAvailability } = useUsername();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState("");

  // Show modal on first visit or when explicitly opened
  useEffect(() => {
    if (isFirstVisit) {
      setOpen(true);
    }
  }, [isFirstVisit]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUsername(e.target.value);
    setError("");
    setIsAvailable(true);
  };

  const validateUsername = () => {
    if (inputUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (inputUsername.length > 30) {
      setError("Username must be less than 30 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(inputUsername)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateUsername()) return;

    // Since we're only using localStorage, we can directly set the username
    setUsername(inputUsername);
    setOpen(false);
    toast({
      title: "Username set",
      description: `Your username has been set to ${inputUsername}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Username</DialogTitle>
          <DialogDescription>
            Create a username to like businesses and review products. You can only change your username once every 31 days.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={inputUsername}
              onChange={handleUsernameChange}
              className="col-span-3"
              placeholder="Enter a username"
            />
          </div>
          {error && <p className="text-sm text-red-500 col-span-3 col-start-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isChecking || !!error}>
            {isChecking ? "Checking..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Update Settings Page

Update `client/src/pages/settings.tsx` to include username management:

```typescript
// In settings.tsx
import { useUsername } from "@/providers/username-provider";
import { UsernameModal } from "@/components/username-modal";

// Inside the Settings component
const { username, canUpdateUsername } = useUsername();
const [showUsernameModal, setShowUsernameModal] = useState(false);

// Inside the User Settings card
<CardContent>
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-medium">Username</h3>
        <p className="text-sm text-gray-500">
          {username || "No username set"}
        </p>
      </div>
      <Button 
        onClick={() => setShowUsernameModal(true)}
        disabled={!canUpdateUsername && !!username}
      >
        {username ? "Change" : "Set"} Username
      </Button>
    </div>
    {!canUpdateUsername && username && (
      <p className="text-xs text-amber-600">
        You can only change your username once every 31 days.
      </p>
    )}
  </div>
</CardContent>

// At the end of the component
<UsernameModal open={showUsernameModal} onOpenChange={setShowUsernameModal} />
```

### 2. Business Like/Dislike System

#### Create Vote Service

Create a new service in `client/src/services/vote-service.ts`:

```typescript
import { BusinessVote } from "@shared/schema";

const VOTE_API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

interface VoteResponse {
  success: boolean;
  message?: string;
  likes?: number;
  dislikes?: number;
  userVote?: 'like' | 'dislike' | null;
}

export const VoteService = {
  async getVotes(businessId: string): Promise<VoteResponse> {
    try {
      const username = localStorage.getItem('username');
      const url = `${VOTE_API_URL}?action=getVotes&businessId=${encodeURIComponent(businessId)}&username=${encodeURIComponent(username || '')}`;      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to get votes: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (e) {
      console.error('Error getting votes:', e);
      return { success: false, message: 'Failed to get votes' };
    }
  },
  
  async vote(businessId: string, vote: 'like' | 'dislike'): Promise<VoteResponse> {
    try {
      const username = localStorage.getItem('username');
      
      if (!username) {
        return { success: false, message: 'Username required' };
      }
      
      const data = {
        action: 'vote',
        businessId,
        username, // Username from localStorage
        vote,
        timestamp: Date.now(),
      };
      
      const response = await fetch(VOTE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to vote: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (e) {
      console.error('Error voting:', e);
      return { success: false, message: 'Failed to vote' };
    }
  }
};
```

#### Create Vote Hook

Create a new hook in `client/src/hooks/use-votes.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VoteService } from "@/services/vote-service";

export function useBusinessVotes(businessId: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["business-votes", businessId],
    queryFn: () => VoteService.getVotes(businessId),
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
  });
  
  const voteMutation = useMutation({
    mutationFn: ({ vote }: { vote: 'like' | 'dislike' }) => 
      VoteService.vote(businessId, vote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-votes", businessId] });
    },
  });
  
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    vote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
}
```

#### Create Vote Component

Create a new component in `client/src/components/business-vote.tsx`:

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useBusinessVotes } from "@/hooks/use-votes";
import { useUsername } from "@/providers/username-provider";
import { UsernameModal } from "@/components/username-modal";
import { useToast } from "@/hooks/use-toast";

interface BusinessVoteProps {
  businessId: string;
}

export function BusinessVote({ businessId }: BusinessVoteProps) {
  const { data, isLoading, vote, isVoting } = useBusinessVotes(businessId);
  const { username } = useUsername();
  const { toast } = useToast();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  
  // Optimistic UI state
  const [optimisticUserVote, setOptimisticUserVote] = useState<'like' | 'dislike' | null>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<number | null>(null);
  const [optimisticDislikes, setOptimisticDislikes] = useState<number | null>(null);
  
  // Use optimistic values if available, otherwise use server data
  const userVote = optimisticUserVote !== null ? optimisticUserVote : data?.userVote;
  const likes = optimisticLikes !== null ? optimisticLikes : data?.likes || 0;
  const dislikes = optimisticDislikes !== null ? optimisticDislikes : data?.dislikes || 0;
  
  const handleVote = (voteType: 'like' | 'dislike') => {
    if (!username) {
      setShowUsernameModal(true);
      return;
    }
    
    // Calculate optimistic updates
    let newLikes = likes;
    let newDislikes = dislikes;
    
    // Remove previous vote if exists
    if (userVote === 'like') newLikes--;
    if (userVote === 'dislike') newDislikes--;
    
    // Add new vote
    if (voteType === 'like') newLikes++;
    if (voteType === 'dislike') newDislikes++;
    
    // Update optimistic state
    setOptimisticUserVote(voteType);
    setOptimisticLikes(newLikes);
    setOptimisticDislikes(newDislikes);
    
    // Send to server
    vote({ vote: voteType }, {
      onError: () => {
        // Revert optimistic updates on error
        setOptimisticUserVote(data?.userVote || null);
        setOptimisticLikes(data?.likes || 0);
        setOptimisticDislikes(data?.dislikes || 0);
        
        toast({
          title: "Vote failed",
          description: "There was an error processing your vote",
          variant: "destructive",
        });
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-4 animate-pulse">
        <div className="h-10 w-20 bg-gray-200 rounded"></div>
        <div className="h-10 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex items-center space-x-4">
        <Button
          variant={userVote === 'like' ? "default" : "outline"}
          size="sm"
          className="flex items-center space-x-2"
          onClick={() => handleVote('like')}
          disabled={isVoting}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{likes}</span>
        </Button>
        
        <Button
          variant={userVote === 'dislike' ? "default" : "outline"}
          size="sm"
          className="flex items-center space-x-2"
          onClick={() => handleVote('dislike')}
          disabled={isVoting}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>{dislikes}</span>
        </Button>
      </div>
      
      <UsernameModal open={showUsernameModal} onOpenChange={setShowUsernameModal} />
    </>
  );
}
```

#### Update Business List and Profile Pages

Update `client/src/pages/business-list.tsx` to include the vote component in the business card:

```typescript
// In business-list.tsx
import { BusinessVote } from "@/components/business-vote";

// Inside the BusinessCard component
<div className="mt-4">
  <BusinessVote businessId={business.id} />
</div>
```

Update `client/src/pages/business-profile.tsx` to include the vote component:

```typescript
// In business-profile.tsx
import { BusinessVote } from "@/components/business-vote";

// Inside the business info section
<div className="mt-4">
  <BusinessVote businessId={business.id} />
</div>
```

### 3. Product Review and Rating System

#### Create Review Service

Create a new service in `client/src/services/review-service.ts`:

```typescript
import { ProductReview } from "@shared/schema";

const REVIEW_API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

interface ReviewResponse {
  success: boolean;
  message?: string;
  reviews?: ProductReview[];
  averageRating?: number;
  reviewCount?: number;
  userReview?: ProductReview | null;
}

interface SubmitReviewParams {
  productId: string;
  businessId: string;
  rating: number;
  review: string;
}

export const ReviewService = {
  async getReviews(productId: string): Promise<ReviewResponse> {
    try {
      const username = localStorage.getItem('username');
      const url = `${REVIEW_API_URL}?action=getReviews&productId=${encodeURIComponent(productId)}&username=${encodeURIComponent(username || '')}`;      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to get reviews: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (e) {
      console.error('Error getting reviews:', e);
      return { success: false, message: 'Failed to get reviews' };
    }
  },
  
  async submitReview(params: SubmitReviewParams): Promise<ReviewResponse> {
    try {
      const username = localStorage.getItem('username');
      
      if (!username) {
        return { success: false, message: 'Username required' };
      }
      
      const data = {
        action: 'submitReview',
        productId: params.productId,
        businessId: params.businessId,
        username,
        rating: params.rating,
        review: params.review,
        timestamp: Date.now()
      };
      
      const response = await fetch(REVIEW_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit review: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (e) {
      console.error('Error submitting review:', e);
      return { success: false, message: 'Failed to submit review' };
    }
  },
  
  async getProductReviewSummary(productId: string): Promise<ReviewResponse> {
    try {
      const url = `${REVIEW_API_URL}?action=getReviewSummary&productId=${encodeURIComponent(productId)}`;      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to get review summary: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (e) {
      console.error('Error getting review summary:', e);
      return { success: false, message: 'Failed to get review summary' };
    }
  }
};
```

#### Create Review Hooks

Create a new hook in `client/src/hooks/use-reviews.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewService } from "@/services/review-service";

export function useProductReviews(productId: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => ReviewService.getReviews(productId),
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
  });
  
  const submitReviewMutation = useMutation({
    mutationFn: (params: {
      businessId: string;
      rating: number;
      review: string;
    }) => ReviewService.submitReview({
      productId,
      businessId: params.businessId,
      rating: params.rating,
      review: params.review,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product-review-summary", productId] });
    },
  });
  
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    submitReview: submitReviewMutation.mutate,
    isSubmitting: submitReviewMutation.isPending,
  };
}

export function useProductReviewSummary(productId: string) {
  return useQuery({
    queryKey: ["product-review-summary", productId],
    queryFn: () => ReviewService.getProductReviewSummary(productId),
    refetchInterval: 60000, // Poll every minute for updates
  });
}
```

#### Create Star Rating Component

Create a new component in `client/src/components/star-rating.tsx`:

```typescript
import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ value, onChange, readOnly = false, size = "md" }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];
  
  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverValue(index);
  };
  
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(0);
  };
  
  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    onChange(index);
  };
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((index) => {
        const filled = (hoverValue || value) >= index;
        
        return (
          <Star
            key={index}
            className={`${sizeClass} ${filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} ${!readOnly ? "cursor-pointer" : ""}`}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  );
}
```

#### Create Review List Component

Create a new component in `client/src/components/review-list.tsx`:

```typescript
import { StarRating } from "@/components/star-rating";
import { ProductReview } from "@shared/schema";

interface ReviewListProps {
  reviews: ProductReview[];
  isLoading?: boolean;
}

export function ReviewList({ reviews, isLoading }: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={`${review.username}-${review.timestamp}`} className="border-b pb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">{review.username}</div>
            <div className="text-sm text-gray-500">
              {new Date(review.timestamp).toLocaleDateString()}
            </div>
          </div>
          <div className="mb-2">
            <StarRating value={review.rating} readOnly size="sm" />
          </div>
          <p className="text-gray-700">{review.review}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Create Review Form Component

Create a new component in `client/src/components/review-form.tsx`:

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { useUsername } from "@/providers/username-provider";
import { UsernameModal } from "@/components/username-modal";

interface ReviewFormProps {
  onSubmit: (rating: number, review: string) => void;
  isSubmitting?: boolean;
  userReview?: {
    rating: number;
    review: string;
  } | null;
}

export function ReviewForm({ onSubmit, isSubmitting, userReview }: ReviewFormProps) {
  const { username } = useUsername();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [review, setReview] = useState(userReview?.review || "");
  const [error, setError] = useState("");
  
  const handleSubmit = () => {
    if (!username) {
      setShowUsernameModal(true);
      return;
    }
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    
    if (review.trim().length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }
    
    if (review.trim().length > 500) {
      setError("Review must be less than 500 characters");
      return;
    }
    
    setError("");
    onSubmit(rating, review);
  };
  
  return (
    <>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Your Rating</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Your Review</label>
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here..."
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            {review.length}/500 characters
          </p>
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
        </Button>
      </div>
      
      <UsernameModal open={showUsernameModal} onOpenChange={setShowUsernameModal} />
    </>
  );
}
```

#### Create Review Summary Component

Create a new component in `client/src/components/review-summary.tsx`:

```typescript
import { StarRating } from "@/components/star-rating";
import { MessageCircle } from "lucide-react";

interface ReviewSummaryProps {
  averageRating: number;
  reviewCount: number;
  isLoading?: boolean;
}

export function ReviewSummary({ averageRating, reviewCount, isLoading }: ReviewSummaryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="h-5 w-20 bg-gray-200 rounded"></div>
        <div className="h-5 w-10 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      <StarRating value={averageRating} readOnly />
      <div className="text-sm text-gray-500">
        ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
      </div>
    </div>
  );
}

export function ReviewBadge({ reviewCount }: { reviewCount: number }) {
  return (
    <div className="flex items-center space-x-1 text-sm">
      <MessageCircle className="h-4 w-4" />
      <span>{reviewCount}</span>
    </div>
  );
}
```

#### Update Product Details Page

Update `client/src/pages/product-details.tsx` to include the review components:

```typescript
// In product-details.tsx
import { useProductReviews } from "@/hooks/use-reviews";
import { ReviewSummary } from "@/components/review-summary";
import { ReviewList } from "@/components/review-list";
import { ReviewForm } from "@/components/review-form";
import { useUsername } from "@/providers/username-provider";
import { UsernameModal } from "@/components/username-modal";

// Inside the ProductDetails component
const { data: reviewData, isLoading: isLoadingReviews, submitReview, isSubmitting } = useProductReviews(params.productId);
const { username } = useUsername();
const [showUsernameModal, setShowUsernameModal] = useState(false);

// Inside the product details section, after the product description
<div className="mt-6">
  <h3 className="text-lg font-semibold mb-2">Reviews</h3>
  <ReviewSummary 
    averageRating={reviewData?.averageRating || 0} 
    reviewCount={reviewData?.reviewCount || 0}
    isLoading={isLoadingReviews}
  />
</div>

// After the add to cart button
<div className="mt-8 border-t pt-6">
  <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
  {username ? (
    <ReviewForm 
      onSubmit={(rating, review) => {
        submitReview({
          businessId: business.id,
          rating,
          review
        });
      }}
      isSubmitting={isSubmitting}
      userReview={reviewData?.userReview}
    />
  ) : (
    <div className="text-center py-4 border rounded-md">
      <p className="mb-2">You need a username to write a review</p>
      <Button onClick={() => setShowUsernameModal(true)}>
        Create Username
      </Button>
    </div>
  )}
</div>

<div className="mt-8">
  <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
  <ReviewList 
    reviews={reviewData?.reviews || []} 
    isLoading={isLoadingReviews}
  />
</div>

// At the end of the component
<UsernameModal open={showUsernameModal} onOpenChange={setShowUsernameModal} />
```

#### Update Product List Page

Update `client/src/pages/product-list.tsx` to include the review badge:

```typescript
// In product-list.tsx
import { useProductReviewSummary } from "@/hooks/use-reviews";
import { ReviewBadge } from "@/components/review-summary";

// Inside the product card
const { data: reviewSummary } = useProductReviewSummary(product.id);

// After the product price
<div className="flex items-center justify-between mt-1">
  <div className="text-sm text-gray-500">
    {product.inStock ? "In Stock" : "Out of Stock"}
  </div>
  {reviewSummary?.reviewCount > 0 && (
    <ReviewBadge reviewCount={reviewSummary.reviewCount} />
  )}
</div>
```

## API Endpoints

The Google Apps Script will expose the following endpoints:

### 1. Vote Endpoints

- `GET /?action=getVotes&businessId={businessId}&username={username}`
  - Gets vote counts for a business
  - Username is passed from localStorage
  - Returns: `{ success: true, likes: number, dislikes: number, userVote: 'like'/'dislike'/null }`

- `POST /`
  - Body: `{ action: 'vote', businessId: string, username: string, vote: 'like'/'dislike', timestamp: number }`
  - Submits a vote for a business
  - Username is retrieved from localStorage
  - Returns: `{ success: true, likes: number, dislikes: number, userVote: 'like'/'dislike' }`

### 2. Review Endpoints

- `GET /?action=getReviews&productId={productId}&username={username}`
  - Gets reviews for a product
  - Username is passed from localStorage
  - Returns: `{ success: true, reviews: ProductReview[], averageRating: number, reviewCount: number, userReview: ProductReview|null }`

- `GET /?action=getReviewSummary&productId={productId}`
  - Gets review summary for a product
  - Returns: `{ success: true, averageRating: number, reviewCount: number }`

- `POST /`
  - Body: `{ action: 'submitReview', productId: string, businessId: string, username: string, rating: number, review: string, timestamp: number }`
  - Submits a review for a product
  - Username is retrieved from localStorage
  - Returns: `{ success: true, message: 'Review submitted' }`

## Real-time Updates Strategy

The application will use a polling strategy to keep the UI updated in real-time:

1. **Short Polling**: The application will use React Query's `refetchInterval` to periodically fetch updated data:
   - Business votes: Every 30 seconds
   - Product reviews: Every 30 seconds
   - Product review summaries: Every 60 seconds

2. **Optimistic Updates**: The UI will update immediately when a user takes an action, without waiting for the server response:
   - When a user votes, the UI will update the vote counts immediately
   - When a user submits a review, the UI will add the review to the list immediately

3. **Error Handling**: If an API request fails, the optimistic updates will be rolled back and an error message will be displayed.

## Migration Steps

1. **Schema Updates**:
   - Add new schemas to `shared/schema.ts`

2. **Provider Implementation**:
   - Create the `UsernameProvider` and update `App.tsx`

3. **Component Implementation**:
   - Create all required components
   - Update existing pages to include the new components

4. **API Integration**:
   - Create the services and hooks for API integration
   - Update the Google Apps Script URL in the services once deployed

5. **Testing**:
   - Test all functionality locally
   - Deploy the Google Apps Script
   - Test the integration with the Google Apps Script

## Testing Checklist

1. **Username System**:
   - First-time users see the username modal
   - Username is saved to localStorage only (no server-side storage)
   - Username can only be changed after 31 days
   - Username is displayed in the settings page

2. **Business Vote System**:
   - Users can like and dislike businesses
   - Vote counts are displayed correctly
   - Users can only vote once per business
   - Votes are updated in real-time

3. **Product Review System**:
   - Users can submit reviews with ratings
   - Reviews are displayed correctly
   - Review counts and average ratings are displayed correctly
   - Users can only submit one review per product
   - Reviews are updated in real-time

4. **Error Handling**:
   - API errors are handled gracefully
   - Optimistic updates are rolled back on error
   - Appropriate error messages are displayed

## Edge Cases and Safety Checks

1. **Rate Limiting**:
   - Limit users to 5 reviews per day
   - Add server-side validation for all inputs

2. **Data Validation**:
   - Validate username format client-side (3-30 characters, alphanumeric and underscores only)
   - Validate review length (10-500 characters)
   - Validate rating (1-5 stars)

3. **Offline Support**:
   - Cache vote and review data in localStorage
   - Queue offline votes and reviews for submission when online

4. **Security**:
   - Sanitize all user inputs to prevent XSS attacks
   - Validate all API requests on the server side
   - Implement rate limiting (100 requests per hour per IP)
   - Store IP addresses and timestamps in the Meta sheet for rate limiting
   - Configure CORS headers to allow requests only from TheHub domain

5. **Performance**:
   - Optimize API requests to minimize data transfer
   - Use pagination for reviews if the number of reviews becomes large

## Rollback Plan

If issues are encountered during deployment, the following rollback steps can be taken:

1. Revert the frontend changes
2. Disable the Google Apps Script endpoints
3. Clear localStorage data related to the new features

## Conclusion

This implementation plan provides a comprehensive approach to adding a Review and Rating system to TheHub web application. The system includes username management, business voting, and product reviews, with real-time updates and optimistic UI updates for a smooth user experience.