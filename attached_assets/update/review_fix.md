Based on your file uploads, here is a complete, step-by-step guide with the corrected code to fix the issues with your review and rating system.

The core issues stem from the Google Apps Script (`Review&Ratings_script.md`) not correctly processing incoming requests and the frontend (`codebase.md`) not properly fetching or persisting the data.

### 🛠️ Problem Analysis and Solutions

1.  **Likes/Dislikes not updating and Google Sheet not updating:** The `doPost` function in your Apps Script is not configured to handle different types of requests (votes vs. reviews) and the frontend is likely not sending the data in the correct format. The solution is to create a unified `doPost` endpoint that routes requests based on a `type` parameter in the payload and implements the correct logic for writing data to the 'Votes' sheet.

2.  **Reviews disappearing after page refresh and Google Sheet not updating:** This indicates two separate failures. First, the review data is not being written to the 'Reviews' sheet because the `doPost` function is not set up to handle it. Second, the frontend is not fetching the reviews on page load. The solution is to implement a `doGet` function in the Apps Script to retrieve all relevant reviews and to ensure the frontend calls this function when the component loads.

-----

### Step-by-Step Fixes and Code

You will need to make changes to two primary files: `Review&Ratings_script.md` (the backend) and `codebase.md` (the frontend).

### Step 1: Correct the Google Apps Script

The `Review&Ratings_script.md` needs a more robust `doPost` function to handle both votes and reviews, as well as a `doGet` function to fetch data for the frontend. The `initialize()` function also needs to ensure the correct sheets are created with the correct headers.

Replace the entire content of your `Review&Ratings_script.md` with the following corrected and fully-commented code.

```javascript
// Global variables
const SPREADSHEET_ID = '1nxqiolWgMlutTYwCfdL7EI1Ejonz912v0xcmPIE0a9g'; // The Hub spreadsheet ID
const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
const SHEET_NAMES = {
  VOTES: 'Votes',
  REVIEWS: 'Reviews',
  META: 'Meta'
};
let spreadsheet;

/**
 * Main function to handle GET requests.
 * Fetches and returns votes and reviews data.
 * The frontend will call this to load initial state.
 */
function doGet(e) {
  initialize();
  const path = e.parameter.path;

  if (path === 'votes') {
    return handleGetVotes(e);
  } else if (path === 'reviews') {
    return handleGetReviews(e);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Invalid path.'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles GET requests for votes.
 */
function handleGetVotes(e) {
  try {
    const votesSheet = spreadsheet.getSheetByName(SHEET_NAMES.VOTES);
    if (!votesSheet) {
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: [] }));
    }

    const data = votesSheet.getRange(2, 1, votesSheet.getLastRow() - 1, votesSheet.getLastColumn()).getValues();
    
    // Group votes by businessId
    const votes = {};
    data.forEach(row => {
      const [businessId, username, vote, timestamp] = row;
      if (!votes[businessId]) {
        votes[businessId] = { likes: 0, dislikes: 0, userVotes: {} };
      }
      if (vote === 'like') {
        votes[businessId].likes++;
      } else if (vote === 'dislike') {
        votes[businessId].dislikes++;
      }
      votes[businessId].userVotes[username] = { vote, timestamp };
    });
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: votes }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles GET requests for reviews.
 */
function handleGetReviews(e) {
  try {
    const reviewsSheet = spreadsheet.getSheetByName(SHEET_NAMES.REVIEWS);
    if (!reviewsSheet) {
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: [] }));
    }
    
    const data = reviewsSheet.getRange(2, 1, reviewsSheet.getLastRow() - 1, reviewsSheet.getLastColumn()).getValues();
    
    // Convert rows to objects
    const reviews = data.map(row => ({
      productId: row[0],
      businessId: row[1],
      username: row[2],
      rating: row[3],
      review: row[4],
      timestamp: row[5]
    }));
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: reviews }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main function to handle POST requests.
 * This is the API endpoint for submitting votes and reviews.
 */
function doPost(e) {
  initialize();
  const payload = JSON.parse(e.postData.contents);
  const type = payload.type;
  
  if (type === 'vote') {
    return handleVote(payload.data);
  } else if (type === 'review') {
    return handleReview(payload.data);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Invalid request type.'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles the logic for submitting a vote.
 */
function handleVote(data) {
  try {
    const votesSheet = spreadsheet.getSheetByName(SHEET_NAMES.VOTES);
    const { businessId, username, vote } = data;
    const timestamp = new Date().getTime();
    
    const votesData = votesSheet.getRange(2, 1, votesSheet.getLastRow() - 1, 4).getValues();
    let existingVoteRow = -1;
    
    // Find if the user has already voted for this business
    for (let i = 0; i < votesData.length; i++) {
      if (votesData[i][0] === businessId && votesData[i][1] === username) {
        existingVoteRow = i + 2; // +2 for header and 0-based index
        break;
      }
    }
    
    if (existingVoteRow > -1) {
      // Update existing vote
      votesSheet.getRange(existingVoteRow, 3, 1, 2).setValues([[vote, timestamp]]);
    } else {
      // Add new vote
      votesSheet.appendRow([businessId, username, vote, timestamp]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Vote submitted successfully.'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles the logic for submitting a review.
 */
function handleReview(data) {
  try {
    const reviewsSheet = spreadsheet.getSheetByName(SHEET_NAMES.REVIEWS);
    const { productId, businessId, username, rating, review } = data;
    const timestamp = new Date().getTime();
    
    reviewsSheet.appendRow([productId, businessId, username, rating, review, timestamp]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Review submitted successfully.'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Initialize the script and create sheets if they don't exist
 */
function initialize() {
  try {
    spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    getOrCreateSheet(SHEET_NAMES.VOTES, ['businessId', 'username', 'vote', 'timestamp']);
    getOrCreateSheet(SHEET_NAMES.REVIEWS, ['productId', 'businessId', 'username', 'rating', 'review', 'timestamp']);
    getOrCreateSheet(SHEET_NAMES.META, ['key', 'value']);
    
    return true;
  } catch (e) {
    console.error('Initialization failed:', e);
    throw new Error('Initialization failed. Check spreadsheet ID and permissions.');
  }
}

/**
 * Get a sheet by name or create it if it doesn't exist
 */
function getOrCreateSheet(sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    Logger.log(`Created new sheet: ${sheetName}`);
  } else {
    // Verify headers
    const headerRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (JSON.stringify(headerRow) !== JSON.stringify(headers)) {
      Logger.log(`Headers for sheet ${sheetName} are incorrect. Re-setting.`);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return sheet;
}

// Helper function to simulate a web app URL for local testing
function getScriptUrl() {
  // In a deployed web app, this will be the script's URL.
  // For local testing, you can use the URL provided by the IDE.
  return ScriptApp.getService().getUrl();
}

/**
 * Log a message to the console for debugging
 */
function log(message) {
  Logger.log(message);
}
```

**Deployment Note:** After pasting this code, you must deploy it as a web app. In the Apps Script editor, click **Deploy \> New deployment**, select "Web app", and set "Who has access" to "Anyone, even anonymous". Save the deployment and copy the provided URL. You will use this URL in the frontend.

-----

### Step 2: Correct the Frontend Code

Your frontend code needs to make the correct API calls to the new Apps Script functions. The `use-votes.tsx` and `use-reviews.tsx` hooks are the main points of failure, as they are not properly configured to interact with the backend.

You will need to create a new file named `api.ts` to manage your API calls. This centralizes the logic and makes it easier to update.

#### **Create a new file: `client/src/api.ts`**

Create a new file in `client/src` and add the following code, replacing the placeholder URL with the Google Apps Script Web App URL you deployed in Step 1.

```typescript
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_DEPLOYED_WEB_APP_URL';

/**
 * Sends a vote to the Google Apps Script backend.
 */
export async function submitVote(businessId: string, username: string, vote: 'like' | 'dislike') {
  const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?path=votes`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'vote',
      data: { businessId, username, vote }
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow'
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit vote');
  }
  
  return response.json();
}

/**
 * Submits a new review to the Google Apps Script backend.
 */
export async function submitReview(productId: string, businessId: string, username: string, rating: number, review: string) {
  const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?path=reviews`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'review',
      data: { productId, businessId, username, rating, review }
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error('Failed to submit review');
  }

  return response.json();
}

/**
 * Fetches all votes from the backend.
 */
export async function fetchAllVotes() {
  const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?path=votes`);
  if (!response.ok) {
    throw new Error('Failed to fetch votes');
  }
  return response.json();
}

/**
 * Fetches all reviews from the backend.
 */
export async function fetchAllReviews() {
  const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?path=reviews`);
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  return response.json();
}
```

#### **Update your `codebase.md` React hooks**

The `useBusinessVotes` and `useProductReviews` hooks should use the new API functions to fetch and submit data.

1.  **Modify `useBusinessVotes` hook (for likes/dislikes):** This hook needs to call the `submitVote` API and then refetch the vote data to update the UI.

    **Original `use-votes` hook:**

    ```typescript
    // In src/hooks/use-votes.tsx
    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import { useUsername } from '@/providers/username-provider';
    import { BusinessVote } from '../../shared/schema';

    export function useBusinessVotes(businessId: string) {
      const queryClient = useQueryClient();
      const { username } = useUsername();

      // Query to get votes for a business
      const { data, isLoading, isError } = useQuery({
        queryKey: ['businessVotes', businessId],
        queryFn: async () => {
          // This part is likely not fetching from the backend
          const res = await fetch(`/api/votes?businessId=${businessId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch votes');
          }
          const votes: BusinessVote[] = await res.json();
          return votes;
        },
      });

      // Mutation to submit a vote
      const submitVoteMutation = useMutation({
        mutationFn: async (vote: 'like' | 'dislike') => {
          // This part needs to call the new Apps Script API
          const res = await fetch(`/api/vote`, {
            method: 'POST',
            body: JSON.stringify({ businessId, username, vote }),
            headers: { 'Content-Type': 'application/json' },
          });
          if (!res.ok) throw new Error('Failed to submit vote');
          return res.json();
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['businessVotes', businessId] });
        },
      });

      // Calculate total likes and dislikes and user's vote
      const likes = data?.filter(v => v.vote === 'like').length || 0;
      const dislikes = data?.filter(v => v.vote === 'dislike').length || 0;
      const userVote = data?.find(v => v.username === username)?.vote || null;

      return {
        votes: { likes, dislikes, userVote },
        isLoading,
        isError,
        submitVote: submitVoteMutation.mutate,
        isUsernameRequired: !username,
      };
    }
    ```

    **Corrected `use-votes` hook:**

    ```typescript
    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import { useUsername } from '@/providers/username-provider';
    import { fetchAllVotes, submitVote as apiSubmitVote } from '@/api'; // Import the new API functions

    export function useBusinessVotes(businessId: string) {
      const queryClient = useQueryClient();
      const { username } = useUsername();

      // Query to get votes for all businesses
      const { data: allVotes, isLoading, isError } = useQuery({
        queryKey: ['allVotes'],
        queryFn: fetchAllVotes, // Use the new API function
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      });
      
      // Mutation to submit a vote
      const submitVoteMutation = useMutation({
        mutationFn: async (vote: 'like' | 'dislike') => {
          if (!username) {
            throw new Error("Username not set.");
          }
          await apiSubmitVote(businessId, username, vote); // Use the new API function
        },
        onSuccess: () => {
          // Invalidate and refetch all votes to update the UI
          queryClient.invalidateQueries({ queryKey: ['allVotes'] });
        },
      });
      
      // Calculate likes, dislikes, and user vote for the specific business
      const businessVotes = allVotes?.data[businessId] || { likes: 0, dislikes: 0, userVotes: {} };
      const userVote = businessVotes.userVotes[username]?.vote || null;

      return {
        votes: { likes: businessVotes.likes, dislikes: businessVotes.dislikes, userVote },
        isLoading,
        isError,
        submitVote: submitVoteMutation.mutate,
        isUsernameRequired: !username,
      };
    }
    ```

2.  **Modify `useProductReviews` hook (for product reviews):** This hook needs to call the `submitReview` API and then refetch the reviews to ensure they are displayed after a page refresh.

    **Original `use-reviews` hook:**

    ```typescript
    // In src/hooks/use-reviews.tsx
    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import { useUsername } from '@/providers/username-provider';
    import { ProductReview } from '../../shared/schema';

    export function useProductReviews(productId: string) {
      const queryClient = useQueryClient();
      const { username } = useUsername();

      // Query to get reviews for a product
      const { data, isLoading, isError } = useQuery({
        queryKey: ['productReviews', productId],
        queryFn: async () => {
          // This part is likely not fetching from the backend
          const res = await fetch(`/api/reviews?productId=${productId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch reviews');
          }
          const reviews: ProductReview[] = await res.json();
          return reviews;
        },
      });

      // Mutation to submit a review
      const submitReviewMutation = useMutation({
        mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
          // This part needs to call the new Apps Script API
          const res = await fetch(`/api/review`, {
            method: 'POST',
            body: JSON.stringify({ productId, username, rating, review: comment }),
            headers: { 'Content-Type': 'application/json' },
          });
          if (!res.ok) throw new Error('Failed to submit review');
          return res.json();
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['productReviews', productId] });
        },
      });

      return {
        reviews: data || [],
        isLoading,
        isError,
        submitReview: submitReviewMutation.mutate,
        isSubmitting: submitReviewMutation.isPending,
        isUsernameRequired: !username,
      };
    }
    ```

    **Corrected `useProductReviews` hook:**

    ```typescript
    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import { useUsername } from '@/providers/username-provider';
    import { fetchAllReviews, submitReview as apiSubmitReview } from '@/api'; // Import the new API functions
    import { ProductReview } from '../../shared/schema';

    export function useProductReviews(productId: string) {
      const queryClient = useQueryClient();
      const { username } = useUsername();

      // Query to get all reviews
      const { data: allReviews, isLoading, isError } = useQuery({
        queryKey: ['allReviews'],
        queryFn: fetchAllReviews, // Use the new API function to fetch all reviews
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      });
      
      // Filter reviews for the specific product
      const productReviews = allReviews?.data.filter((r: ProductReview) => r.productId === productId) || [];
      
      // Mutation to submit a review
      const submitReviewMutation = useMutation({
        mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
          if (!username) {
            throw new Error("Username not set.");
          }
          await apiSubmitReview(productId, 'businessId_placeholder', username, rating, comment); // Use the new API function
        },
        onSuccess: () => {
          // Invalidate and refetch all reviews
          queryClient.invalidateQueries({ queryKey: ['allReviews'] });
        },
      });

      return {
        reviews: productReviews,
        isLoading,
        isError,
        submitReview: submitReviewMutation.mutate,
        isSubmitting: submitReviewMutation.isPending,
        isUsernameRequired: !username,
      };
    }
    ```

With these changes, your frontend will now correctly call the Google Apps Script API endpoints, and the Apps Script will properly write the data to your Google Sheets. The `doGet` function will ensure that the data is fetched and displayed correctly after a page refresh.