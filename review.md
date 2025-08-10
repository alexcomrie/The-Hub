# TheHub Web App Review System Implementation Guide

## Overview

This guide details the implementation of a comprehensive review system for TheHub Web app using Google Sheets as the data storage solution. The system includes:

1. Username Management System
2. Product Review System
3. Business Rating System (Likes/Dislikes)
4. Category Filtering by Most Liked

## System Architecture

### Google Sheets Setup

#### Reviews Sheet
- Sheet Name: "Reviews"
- Required Fields:
  - Reviewer Username (string)
  - Product ID (string)
  - Business ID (string)
  - Rating (number, 1-5)
  - Review Text (string)
  - Review Date (timestamp)
  - Status (string: "Pending", "Approved", "Rejected")
  - Device ID (string)
  - IP Address (string)

#### UserSettings Sheet
- Sheet Name: "UserSettings"
- Required Fields:
  - Device ID (string)
  - Username (string)
  - Username Set Date (timestamp)
  - Username Change Date (timestamp)
  - Last Review Date (timestamp)

#### BusinessRatings Sheet
- Sheet Name: "BusinessRatings"
- Required Fields:
  - Business ID (string)
  - Device ID (string)
  - Rating Type (string: "like", "dislike")
  - Rating Date (timestamp)

## Data Schemas

### User Schema
```typescript
interface User {
  deviceId: string;
  username: string;
  usernameSetDate: Date;
  usernameChangeDate: Date | null;
  lastReviewDate: Date | null;
}

interface PublicUser {
  username: string;
}
```

### Review Schema
```typescript
interface Review {
  id: string;
  username: string;
  productId: string;
  businessId: string;
  rating: number;
  reviewText: string;
  reviewDate: Date;
  status: "Pending" | "Approved" | "Rejected";
  deviceId: string;
  ipAddress: string;
}

interface PublicReview {
  id: string;
  username: string;
  rating: number;
  reviewText: string;
  reviewDate: Date;
}
```

### BusinessRating Schema
```typescript
interface BusinessRating {
  businessId: string;
  deviceId: string;
  ratingType: "like" | "dislike";
  ratingDate: Date;
}

interface BusinessRatingCount {
  businessId: string;
  likes: number;
  dislikes: number;
}
```

## Service Implementation

### User Service (client/src/services/user-service.ts)

```typescript
class UserService {
  private static SETTINGS_URL = "[Your Google Apps Script URL]";
  private static DEVICE_ID_KEY = "thehub_device_id";
  private static USERNAME_KEY = "thehub_username";
  private static USERNAME_SET_DATE_KEY = "thehub_username_set_date";

  static async getDeviceId(): Promise<string> {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  static async getUsername(): Promise<string | null> {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  static async setUsername(username: string): Promise<void> {
    const lastSetDate = localStorage.getItem(this.USERNAME_SET_DATE_KEY);
    if (lastSetDate) {
      const daysSinceLastChange = (Date.now() - new Date(lastSetDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastChange < 35) {
        throw new Error("Username can only be changed every 35 days");
      }
    }

    const response = await fetch(this.SETTINGS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "setUsername",
        deviceId: await this.getDeviceId(),
        username: username
      })
    });

    if (!response.ok) {
      throw new Error("Failed to set username");
    }

    localStorage.setItem(this.USERNAME_KEY, username);
    localStorage.setItem(this.USERNAME_SET_DATE_KEY, new Date().toISOString());
  }
}
```

### Business Rating Service (client/src/services/business-rating-service.ts)

```typescript
class BusinessRatingService {
  private static RATING_URL = "[Your Google Apps Script URL]";

  static async getRatingCounts(businessId: string): Promise<BusinessRatingCount> {
    const response = await fetch(
      `${this.RATING_URL}?action=getRatingCounts&businessId=${businessId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch rating counts");
    }
    return response.json();
  }

  static async submitRating(
    businessId: string,
    ratingType: "like" | "dislike"
  ): Promise<void> {
    const deviceId = await UserService.getDeviceId();
    const response = await fetch(this.RATING_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "submitRating",
        businessId,
        deviceId,
        ratingType
      })
    });

    if (!response.ok) {
      throw new Error("Failed to submit rating");
    }
  }

  static async getMostLikedBusinesses(): Promise<string[]> {
    const response = await fetch(
      `${this.RATING_URL}?action=getMostLikedBusinesses`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch most liked businesses");
    }
    return response.json();
  }
}
```

## UI Components

### Username Dialog

Implement a modal dialog that appears when a user attempts to submit a review without a username:

```typescript
interface UsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => Promise<void>;
}

function UsernameDialog({ isOpen, onClose, onSubmit }: UsernameDialogProps) {
  // Implementation details in the UI components section
}
```

### Business Rating Component

Implement a rating component for business profiles:

```typescript
interface BusinessRatingProps {
  businessId: string;
  initialCounts: BusinessRatingCount;
}

function BusinessRating({ businessId, initialCounts }: BusinessRatingProps) {
  // Implementation details in the UI components section
}
```

## Integration Points

1. Update ReviewForm to check for username before allowing submission
2. Add BusinessRating component to business-list.tsx and business-profile.tsx
3. Add most-liked filter to category-list.tsx
4. Implement UsernameDialog in settings.tsx

## Security Considerations

1. Rate limit username changes (35-day restriction)
2. Validate usernames for length and allowed characters
3. Prevent duplicate usernames per device
4. Implement CORS and request validation
5. Sanitize all user inputs

## Testing Steps

1. Username Management:
   - Test username creation
   - Verify 35-day change restriction
   - Test username persistence

2. Review System:
   - Test review submission with username
   - Verify username display in reviews
   - Test review expansion/collapse

3. Business Ratings:
   - Test like/dislike submission
   - Verify rating counts display
   - Test most-liked filter

## Performance Optimization

1. Cache rating counts with reasonable TTL
2. Implement pagination for reviews and ratings
3. Optimize queries for most-liked businesses
4. Use local storage for username and device ID

## Data Management

1. Regular cleanup of old ratings
2. Archive historical username changes
3. Monitor sheet size and performance
4. Implement backup strategy

## Maintenance

1. Monitor rate limits
2. Review username change patterns
3. Track rating trends
4. Regular data validation

## Future Enhancements

1. Username verification system
2. Advanced rating analytics
3. User reputation system
4. Enhanced moderation tools