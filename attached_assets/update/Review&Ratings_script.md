# Review & Rating System - Google Apps Script Implementation

## Overview

This document outlines the implementation of the Google Apps Script backend for TheHub's Review and Rating system. The script will handle data storage and API endpoints for usernames, business votes, and product reviews.

## Google Sheets Structure

The script will create and manage the following sheets in a Google Spreadsheet:

### 1. Votes Sheet

| Column | Description |
|--------|-------------|
| businessId | ID of the business |
| username | Username of the voter |
| vote | "like" or "dislike" |
| timestamp | Timestamp of the vote |

### 3. Reviews Sheet

| Column | Description |
|--------|-------------|
| productId | ID of the product |
| businessId | ID of the business |
| username | Username of the reviewer |
| rating | Star rating (1-5) |
| review | Text review (max 500 chars) |
| timestamp | Timestamp of the review |

### 4. Meta Sheet

| Column | Description |
|--------|-------------|
| key | Configuration key |
| value | Configuration value |

## Google Apps Script Implementation

```javascript
// Global variables
const SPREADSHEET_ID = '1nxqiolWgMlutTYwCfdL7EI1Ejonz912v0xcmPIE0a9g'; // The Hub spreadsheet ID
let spreadsheet;
let usersSheet;
let votesSheet;
let reviewsSheet;
let metaSheet;

/**
 * Initialize the script and create sheets if they don't exist
 */
function initialize() {
  try {
    spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Check if sheets exist, create them if they don't
    usersSheet = getOrCreateSheet('Users', ['username', 'createdAt', 'lastUpdatedAt']);
    votesSheet = getOrCreateSheet('Votes', ['businessId', 'username', 'vote', 'timestamp']);
    reviewsSheet = getOrCreateSheet('Reviews', ['productId', 'businessId', 'username', 'rating', 'review', 'timestamp']);
    metaSheet = getOrCreateSheet('Meta', ['key', 'value']);
    
    // Create indexes for faster lookups
    createNamedRanges();
    
    return true;
  } catch (e) {
    console.error('Initialization failed:', e);
    return false;
  }
}

/**
 * Get a sheet by name or create it if it doesn't exist
 */
function getOrCreateSheet(sheetName, headers) {
  let sheet;
  try {
    sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
  } catch (e) {
    console.error(`Error getting/creating sheet ${sheetName}:`, e);
  }
  return sheet;
}

/**
 * Create named ranges for faster lookups
 */
function createNamedRanges() {
  try {
    // Create named ranges for each sheet
    createNamedRange('UsersData', usersSheet);
    createNamedRange('VotesData', votesSheet);
    createNamedRange('ReviewsData', reviewsSheet);
  } catch (e) {
    console.error('Error creating named ranges:', e);
  }
}

/**
 * Create a named range for a sheet
 */
function createNamedRange(rangeName, sheet) {
  try {
    // Delete existing named range if it exists
    const existingRange = spreadsheet.getRangeByName(rangeName);
    if (existingRange) {
      spreadsheet.removeNamedRange(rangeName);
    }
    
    // Create new named range
    const range = sheet.getDataRange();
    spreadsheet.setNamedRange(rangeName, range);
  } catch (e) {
    console.error(`Error creating named range ${rangeName}:`, e);
  }
}

/**
 * Update named ranges to include new data
 */
function updateNamedRanges() {
  createNamedRanges();
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return HtmlService.createHtmlOutput('')
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type')
    .addHeader('Access-Control-Max-Age', '3600');
}

/**
 * Web app doGet handler - handles GET requests
 */
function doGet(e) {
  try {
    // Initialize sheets
    if (!initialize()) {
      return sendResponse(false, 'Failed to initialize', {}, headers);
    }
    
    // Get action parameter
    const action = e.parameter.action;
    
    if (!action) {
      return sendResponse(false, 'No action specified', {}, headers);
    }
    
    // Route to appropriate handler
    switch (action) {
      case 'checkUsername':
        return handleCheckUsername(e.parameter.username, headers);
      case 'getVotes':
        return handleGetVotes(e.parameter.businessId, e.parameter.username, headers);
      case 'getReviews':
        return handleGetReviews(e.parameter.productId, e.parameter.username, headers);
      case 'getReviewSummary':
        return handleGetReviewSummary(e.parameter.productId, headers);
      default:
        return sendResponse(false, 'Invalid action', {}, headers);
    }
  } catch (e) {
    console.error('doGet error:', e);
    return sendResponse(false, 'Server error', {}, headers);
  }
}

/**
 * Web app doPost handler - handles POST requests
 */
function doPost(e) {
  try {
    // Initialize sheets
    if (!initialize()) {
      return sendResponse(false, 'Failed to initialize', {}, headers);
    }
    
    // Parse request body
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (e) {
      return sendResponse(false, 'Invalid JSON', {}, headers);
    }
    
    // Get action
    const action = data.action;
    
    if (!action) {
      return sendResponse(false, 'No action specified', {}, headers);
    }
    
    // Route to appropriate handler
    switch (action) {
      case 'createUsername':
        return handleCreateUsername(data, headers);
      case 'vote':
        return handleVote(data, headers);
      case 'submitReview':
        return handleSubmitReview(data, headers);
      default:
        return sendResponse(false, 'Invalid action', {}, headers);
    }
  } catch (e) {
    console.error('doPost error:', e);
    return sendResponse(false, 'Server error', {}, headers);
  }
}

/**
 * Handle username availability check
 */
function handleCheckUsername(username, headers) {
  if (!username) {
    return sendResponse(false, 'Username is required', {}, headers);
  }
  
  // Validate username format
  if (!isValidUsername(username)) {
    return sendResponse(false, 'Invalid username format', {}, headers);
  }
  
  // Check if username exists
  const available = !usernameExists(username);
  
  return sendResponse(true, 'Username availability checked', { available }, headers);
}

/**
 * Handle username creation
 */
function handleCreateUsername(data, headers) {
  const { username, timestamp } = data;
  
  if (!username || !timestamp) {
    return sendResponse(false, 'Username and timestamp are required', {}, headers);
  }
  
  // Validate username format
  if (!isValidUsername(username)) {
    return sendResponse(false, 'Invalid username format', {}, headers);
  }
  
  // Check if username exists
  if (usernameExists(username)) {
    return sendResponse(false, 'Username already exists', {}, headers);
  }
  
  // Add username to sheet
  usersSheet.appendRow([username, timestamp, timestamp]);
  updateNamedRanges();
  
  return sendResponse(true, 'Username created', {}, headers);
}

/**
 * Handle getting votes for a business
 */
function handleGetVotes(businessId, username, headers) {
  if (!businessId) {
    return sendResponse(false, 'Business ID is required', {}, headers);
  }
  
  // Get all votes for the business
  const votes = getVotesForBusiness(businessId);
  
  // Count likes and dislikes
  const likes = votes.filter(vote => vote.vote === 'like').length;
  const dislikes = votes.filter(vote => vote.vote === 'dislike').length;
  
  // Get user's vote if username is provided
  let userVote = null;
  if (username) {
    const userVoteObj = votes.find(vote => vote.username === username);
    if (userVoteObj) {
      userVote = userVoteObj.vote;
    }
  }
  
  return sendResponse(true, 'Votes retrieved', { likes, dislikes, userVote }, headers);
}

/**
 * Handle voting for a business
 */
function handleVote(data, headers) {
  const { businessId, username, vote, timestamp } = data;
  
  if (!businessId || !username || !vote || !timestamp) {
    return sendResponse(false, 'Business ID, username, vote, and timestamp are required', {}, headers);
  }
  
  // Validate vote
  if (vote !== 'like' && vote !== 'dislike') {
    return sendResponse(false, 'Vote must be "like" or "dislike"', {}, headers);
  }
  
  // Check if username exists
  if (!usernameExists(username)) {
    return sendResponse(false, 'Username does not exist', {}, headers);
  }
  
  // Check if user has already voted for this business
  const existingVote = getUserVoteForBusiness(businessId, username);
  
  if (existingVote) {
    // Update existing vote
    const rowIndex = existingVote.rowIndex;
    votesSheet.getRange(rowIndex, 3).setValue(vote); // Update vote
    votesSheet.getRange(rowIndex, 4).setValue(timestamp); // Update timestamp
  } else {
    // Add new vote
    votesSheet.appendRow([businessId, username, vote, timestamp]);
  }
  
  updateNamedRanges();
  
  // Get updated vote counts
  const votes = getVotesForBusiness(businessId);
  const likes = votes.filter(vote => vote.vote === 'like').length;
  const dislikes = votes.filter(vote => vote.vote === 'dislike').length;
  
  return sendResponse(true, 'Vote recorded', { likes, dislikes, userVote: vote }, headers);
}

/**
 * Handle getting reviews for a product
 */
function handleGetReviews(productId, username, headers) {
  if (!productId) {
    return sendResponse(false, 'Product ID is required', {}, headers);
  }
  
  // Get all reviews for the product
  const reviews = getReviewsForProduct(productId);
  
  // Calculate average rating
  let averageRating = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    averageRating = Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
  }
  
  // Get user's review if username is provided
  let userReview = null;
  if (username) {
    userReview = reviews.find(review => review.username === username);
  }
  
  return sendResponse(true, 'Reviews retrieved', { reviews, averageRating, reviewCount: reviews.length, userReview }, headers);
}

/**
 * Handle getting review summary for a product
 */
function handleGetReviewSummary(productId, headers) {
  if (!productId) {
    return sendResponse(false, 'Product ID is required', {}, headers);
  }
  
  // Get all reviews for the product
  const reviews = getReviewsForProduct(productId);
  
  // Calculate average rating
  let averageRating = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    averageRating = Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
  }
  
  return sendResponse(true, 'Review summary retrieved', { averageRating, reviewCount: reviews.length }, headers);
}

/**
 * Handle submitting a review for a product
 */
function handleSubmitReview(data, headers) {
  const { productId, businessId, username, rating, review, timestamp } = data;
  
  if (!productId || !businessId || !username || !rating || !review || !timestamp) {
    return sendResponse(false, 'Product ID, business ID, username, rating, review, and timestamp are required', {}, headers);
  }
  
  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return sendResponse(false, 'Rating must be an integer between 1 and 5', {}, headers);
  }
  
  // Validate review length
  if (review.length < 10 || review.length > 500) {
    return sendResponse(false, 'Review must be between 10 and 500 characters', {}, headers);
  }
  
  // Check if username exists
  if (!usernameExists(username)) {
    return sendResponse(false, 'Username does not exist', {}, headers);
  }
  
  // Check if user has already reviewed this product
  const existingReview = getUserReviewForProduct(productId, username);
  
  if (existingReview) {
    // Update existing review
    const rowIndex = existingReview.rowIndex;
    reviewsSheet.getRange(rowIndex, 4).setValue(rating); // Update rating
    reviewsSheet.getRange(rowIndex, 5).setValue(review); // Update review
    reviewsSheet.getRange(rowIndex, 6).setValue(timestamp); // Update timestamp
  } else {
    // Add new review
    reviewsSheet.appendRow([productId, businessId, username, rating, review, timestamp]);
  }
  
  updateNamedRanges();
  
  return sendResponse(true, 'Review submitted', {}, headers);
}

/**
 * Check if a username exists
 */
function usernameExists(username) {
  const data = usersSheet.getDataRange().getValues();
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) {
      return true;
    }
  }
  return false;
}

/**
 * Get all votes for a business
 */
function getVotesForBusiness(businessId) {
  const data = votesSheet.getDataRange().getValues();
  const votes = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === businessId) {
      votes.push({
        businessId: data[i][0],
        username: data[i][1],
        vote: data[i][2],
        timestamp: data[i][3],
        rowIndex: i + 1 // 1-indexed row number
      });
    }
  }
  
  return votes;
}

/**
 * Get a user's vote for a business
 */
function getUserVoteForBusiness(businessId, username) {
  const votes = getVotesForBusiness(businessId);
  return votes.find(vote => vote.username === username);
}

/**
 * Get all reviews for a product
 */
function getReviewsForProduct(productId) {
  const data = reviewsSheet.getDataRange().getValues();
  const reviews = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productId) {
      reviews.push({
        productId: data[i][0],
        businessId: data[i][1],
        username: data[i][2],
        rating: data[i][3],
        review: data[i][4],
        timestamp: data[i][5],
        rowIndex: i + 1 // 1-indexed row number
      });
    }
  }
  
  // Sort reviews by timestamp (newest first)
  reviews.sort((a, b) => b.timestamp - a.timestamp);
  
  return reviews;
}

/**
 * Get a user's review for a product
 */
function getUserReviewForProduct(productId, username) {
  const reviews = getReviewsForProduct(productId);
  return reviews.find(review => review.username === username);
}

/**
 * Validate username format
 */
function isValidUsername(username) {
  // Username must be 3-30 characters, alphanumeric and underscores only
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

/**
 * Send a JSON response
 */
function sendResponse(success, message, data = {}, headers = {}) {
  const response = {
    success: success,
    message: message,
    ...data
  };
  
  const output = HtmlService.createHtmlOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  output.addHeader('Access-Control-Allow-Origin', '*');
  
  // Add any additional headers
  for (const [key, value] of Object.entries(headers)) {
    output.addHeader(key, value);
  }
  
  return output;
}

/**
 * Utility function to clear all data (for testing)
 */
function clearAllData() {
  // Clear data but keep headers
  clearSheetData(usersSheet);
  clearSheetData(votesSheet);
  clearSheetData(reviewsSheet);
  
  updateNamedRanges();
}

/**
 * Clear data from a sheet but keep headers
 */
function clearSheetData(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

/**
 * Test function to add sample data
 */
function addSampleData() {
  // Initialize
  initialize();
  
  // Add sample users
  usersSheet.appendRow(['user1', Date.now(), Date.now()]);
  usersSheet.appendRow(['user2', Date.now(), Date.now()]);
  usersSheet.appendRow(['user3', Date.now(), Date.now()]);
  
  // Add sample votes
  votesSheet.appendRow(['business1', 'user1', 'like', Date.now()]);
  votesSheet.appendRow(['business1', 'user2', 'dislike', Date.now()]);
  votesSheet.appendRow(['business2', 'user1', 'like', Date.now()]);
  
  // Add sample reviews
  reviewsSheet.appendRow(['product1', 'business1', 'user1', 5, 'Great product!', Date.now()]);
  reviewsSheet.appendRow(['product1', 'business1', 'user2', 3, 'Average product.', Date.now()]);
  reviewsSheet.appendRow(['product2', 'business2', 'user1', 4, 'Good product.', Date.now()]);
  
  updateNamedRanges();
}
```

## Deployment Instructions

1. **Create a New Google Spreadsheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Note the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

2. **Create a New Google Apps Script Project**
   - In the spreadsheet, go to Extensions > Apps Script
   - Replace the default code with the script above
   - Update the `SPREADSHEET_ID` constant with your spreadsheet ID
   - Save the project with a name like "TheHub Review System"

3. **Deploy as Web App**
   - Click on Deploy > New deployment
   - Select type: Web app
   - Description: "TheHub Review System API"
   - Execute as: Me
   - Who has access: Anyone
   - Click Deploy
   - Copy the web app URL

4. **Update Frontend Services**
   - Update the API URLs in the frontend services with the web app URL:
     - In `vote-service.ts`, update `VOTE_API_URL`
     - In `review-service.ts`, update `REVIEW_API_URL`

5. **Initialize the System**
   - Run the `initialize` function from the Apps Script editor
   - Optionally, run `addSampleData` to add test data

## Security Considerations

1. **Rate Limiting**
   - Implement a rate limiting system to prevent abuse
   - Store IP addresses and timestamps in the Meta sheet
   - Limit requests to 100 per hour per IP

2. **Input Validation**
   - Validate all inputs on the server side
   - Sanitize text inputs to prevent XSS attacks
   - Enforce character limits on usernames and reviews

3. **CORS Configuration**
   - Configure CORS headers to allow requests only from TheHub domain
   - For production, replace `'*'` with your domain in `Access-Control-Allow-Origin`

## Monitoring and Maintenance

1. **Error Logging**
   - Log all errors to a dedicated sheet
   - Implement email notifications for critical errors

2. **Performance Monitoring**
   - Track API response times
   - Optimize queries for large datasets

3. **Backup Strategy**
   - Schedule regular backups of the spreadsheet
   - Implement a data export function

## Scaling Considerations

1. **Sheet Size Limits**
   - Google Sheets has a limit of 5 million cells
   - Monitor sheet size and implement archiving for old data

2. **Execution Time Limits**
   - Apps Script has a 6-minute execution time limit
   - Optimize code for efficiency
   - Implement pagination for large datasets

3. **Quota Limits**
   - Apps Script has daily quotas for various services
   - Monitor usage and implement fallbacks

## Testing Plan

1. **Unit Testing**
   - Test each function individually
   - Verify input validation
   - Test error handling

2. **Integration Testing**
   - Test API endpoints with sample requests
   - Verify data is correctly stored and retrieved

3. **Load Testing**
   - Simulate multiple concurrent requests
   - Measure response times under load

## Conclusion

This Google Apps Script implementation provides a simple but effective backend for TheHub's Review and Rating system. It leverages Google Sheets as a database and Google Apps Script as an API server, making it easy to deploy and maintain without requiring a dedicated server infrastructure.