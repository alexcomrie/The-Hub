# Google Apps Script Implementation Guide for TheHub Product Review System

## Overview

This guide provides step-by-step instructions for implementing a Google Apps Script to handle product review submissions for TheHub Web app. The script will serve as a backend API that receives review data, validates it, and adds it to a Google Sheet.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up the Google Sheet](#setting-up-the-google-sheet)
3. [Creating the Google Apps Script](#creating-the-google-apps-script)
4. [Understanding the Script Components](#understanding-the-script-components)
5. [Deploying the Web App](#deploying-the-web-app)
6. [Testing the API](#testing-the-api)
7. [Integrating with TheHub Web App](#integrating-with-thehub-web-app)
8. [Maintenance and Monitoring](#maintenance-and-monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Customizations](#advanced-customizations)

## Prerequisites

Before you begin, make sure you have:

- A Google account
- Basic understanding of JavaScript
- Access to TheHub Web app codebase
- Familiarity with RESTful APIs

## Setting Up the Google Sheet

### Step 1: Create a new Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it "TheHub Product Reviews"

### Step 2: Set up the columns

Add the following column headers in row 1:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Review ID | Product ID | Business ID | Reviewer Name | Rating | Review Text | Review Date | Status | Device ID | IP Address | Submission Count |

### Step 3: Format the sheet (optional)

1. Select row 1 and apply formatting (bold, background color) to make it stand out
2. Freeze the first row: View > Freeze > 1 row
3. Adjust column widths as needed

## Creating the Google Apps Script

### Step 1: Open the Script Editor

1. In your Google Sheet, click on Extensions > Apps Script
2. This will open the Apps Script editor in a new tab
3. Rename the project to "TheHub Review API" (top left of the screen)

### Step 2: Replace the default code

Delete any default code in the editor and paste the following script:

```javascript
/**
 * TheHub Product Review API
 * This script handles review submissions for TheHub Web app
 */

// Handle POST requests (for submitting reviews)
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Log the received data for debugging
    console.log('Received data:', JSON.stringify(data));
    
    // Validate required fields
    if (!data.productId || !data.businessId || !data.rating || !data.deviceId) {
      return createErrorResponse('Missing required fields');
    }
    
    // Explicitly validate reviewer name is required
    if (!data.reviewerName || data.reviewerName.trim() === '') {
      return createErrorResponse('Reviewer name is required');
    }
    
    // Validate review text length (to prevent data overload)
    if (data.reviewText && data.reviewText.length > 500) {
      return createErrorResponse('Review text exceeds maximum length of 500 characters');
    }
    
    // Validate rating is between 1 and 5
    const rating = parseInt(data.rating, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return createErrorResponse('Rating must be between 1 and 5');
    }
    
    // Get IP address from request headers or parameters
    const ipAddress = e.parameter.ip || extractIpFromHeaders(e) || 'unknown';
    
    // Check rate limiting (max 2 reviews per day per device)
    if (checkDailySubmissionLimit(data.deviceId, ipAddress)) {
      return createErrorResponse('Daily review limit reached (maximum 2 reviews per day)');
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
      rating,
      data.reviewText || '',
      reviewDate,
      status,
      data.deviceId,
      ipAddress,
      1 // Initial submission count
    ]);
    
    // Update the submission count for this device/IP
    updateSubmissionCount(data.deviceId, ipAddress);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'reviewId': reviewId
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Error processing request:', error);
    return createErrorResponse(error.toString());
  }
}

// Handle GET requests (for API documentation)
function doGet() {
  return HtmlService.createHtmlOutput(
    '<h1>TheHub Review API</h1>' +
    '<p>This is a POST-only API for submitting product reviews.</p>' +
    '<h2>Usage</h2>' +
    '<p>Send a POST request with the following JSON structure:</p>' +
    '<pre>{' +
    '\n  "productId": "product-123",' +
    '\n  "businessId": "business-456",' +
    '\n  "reviewerName": "John Doe",' +
    '\n  "rating": 5,' +
    '\n  "reviewText": "Great product!",' +
    '\n  "deviceId": "unique-device-identifier"' +
    '\n}</pre>'
  ).setTitle('TheHub Review API Documentation');
}

/**
 * Check if a device/IP has reached the daily submission limit
 * @param {string} deviceId - The device identifier
 * @param {string} ipAddress - The IP address
 * @return {boolean} - True if limit reached, false otherwise
 */
function checkDailySubmissionLimit(deviceId, ipAddress) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  const reviews = data.slice(1);
  
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Count reviews from this device/IP in the last 24 hours
  let count = 0;
  
  for (let i = 0; i < reviews.length; i++) {
    const reviewDeviceId = reviews[i][8]; // Column I (index 8)
    const reviewIpAddress = reviews[i][9]; // Column J (index 9)
    const reviewDate = new Date(reviews[i][6]); // Column G (index 6)
    
    // Check if review was submitted today
    if (reviewDate >= today) {
      // Check if from same device or IP
      if (reviewDeviceId === deviceId || reviewIpAddress === ipAddress) {
        count++;
      }
    }
  }
  
  // Return true if limit reached (2 or more reviews today)
  return count >= 2;
}

/**
 * Update the submission count for a device/IP
 * @param {string} deviceId - The device identifier
 * @param {string} ipAddress - The IP address
 */
function updateSubmissionCount(deviceId, ipAddress) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  const reviews = data.slice(1);
  
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find the row for this device/IP today
  for (let i = 0; i < reviews.length; i++) {
    const reviewDeviceId = reviews[i][8]; // Column I (index 8)
    const reviewIpAddress = reviews[i][9]; // Column J (index 9)
    const reviewDate = new Date(reviews[i][6]); // Column G (index 6)
    
    // Check if review was submitted today and from same device or IP
    if (reviewDate >= today && (reviewDeviceId === deviceId || reviewIpAddress === ipAddress)) {
      // Update the submission count (add 1)
      const currentCount = reviews[i][10] || 0; // Column K (index 10)
      const newCount = currentCount + 1;
      
      // Row index is i+2 (accounting for 0-indexing and header row)
      sheet.getRange(i + 2, 11).setValue(newCount); // Column K (index 11 in spreadsheet)
    }
  }
}

/**
 * Try to extract IP address from request headers
 * @param {Object} e - The request event object
 * @return {string|null} - The IP address or null if not found
 */
function extractIpFromHeaders(e) {
  if (!e || !e.headers) return null;
  
  // Common headers that might contain the client IP
  const ipHeaders = [
    'X-Forwarded-For',
    'X-Real-IP',
    'CF-Connecting-IP',
    'True-Client-IP'
  ];
  
  for (const header of ipHeaders) {
    if (e.headers[header]) {
      // X-Forwarded-For might contain multiple IPs, take the first one
      return e.headers[header].split(',')[0].trim();
    }
  }
  
  return null;
}

/**
 * Create an error response with the given message
 * @param {string} message - The error message
 * @return {Object} - The error response
 */
function createErrorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'error',
    'message': message
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### Step 3: Save the script

Click the disk icon or press Ctrl+S (Cmd+S on Mac) to save your script.

## Understanding the Script Components

### Main Functions

1. **doPost(e)**: Handles incoming POST requests with review data
   - Parses and validates the incoming JSON data
   - Checks for required fields (productId, businessId, reviewerName, rating)
   - Validates review text length (max 500 characters)
   - Checks rate limiting (max 2 reviews per day per device/IP)
   - Generates a unique review ID
   - Appends the review to the Google Sheet
   - Returns a success or error response

2. **doGet()**: Handles GET requests by displaying simple API documentation

### Helper Functions

1. **checkDailySubmissionLimit(deviceId, ipAddress)**: Checks if a device/IP has submitted too many reviews today
   - Counts reviews from the same device or IP in the last 24 hours
   - Returns true if the count is 2 or more

2. **updateSubmissionCount(deviceId, ipAddress)**: Updates the submission count for tracking purposes

3. **extractIpFromHeaders(e)**: Attempts to extract the client's IP address from request headers

4. **createErrorResponse(message)**: Creates a standardized error response

## Deploying the Web App

### Step 1: Set up deployment

1. Click on "Deploy" > "New deployment"
2. Click the gear icon next to "Select type" and choose "Web app"
3. Fill in the following details:
   - Description: "TheHub Review API"
   - Execute as: "Me"
   - Who has access: "Anyone" (for public access) or "Anyone with Google account" (for more security)
4. Click "Deploy"

### Step 2: Authorize the app

1. You'll be prompted to review permissions
2. Click "Authorize access"
3. Choose your Google account
4. You might see a warning that the app isn't verified - click "Advanced" and then "Go to TheHub Review API (unsafe)"
5. Click "Allow"

### Step 3: Copy the web app URL

After deployment, you'll see a URL like:
```
https://script.google.com/macros/s/ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890/exec
```

Copy this URL - you'll need it for your web app integration.

## Testing the API

### Option 1: Using cURL

Test your API with a command like:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"productId":"test-product","businessId":"test-business","reviewerName":"Test User","rating":5,"reviewText":"This is a test review","deviceId":"test-device"}' \
  https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Option 2: Using Postman

1. Open Postman
2. Create a new POST request
3. Enter your web app URL
4. Set the Content-Type header to "application/json"
5. In the request body, select "raw" and "JSON" and enter:
```json
{
  "productId": "test-product",
  "businessId": "test-business",
  "reviewerName": "Test User",
  "rating": 5,
  "reviewText": "This is a test review",
  "deviceId": "test-device"
}
```
6. Click "Send" and check the response

### Option 3: Using the Browser Console

You can test directly from your web app using the browser console:

```javascript
fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productId: 'test-product',
    businessId: 'test-business',
    reviewerName: 'Test User',
    rating: 5,
    reviewText: 'This is a test review',
    deviceId: 'test-device'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Integrating with TheHub Web App

### Step 1: Update the review service

In your `client/src/services/review-service.ts` file, update the `REVIEW_SUBMISSION_URL` constant with your deployed script URL:

```typescript
// URL of the Google Apps Script web app
const REVIEW_SUBMISSION_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

### Step 2: Implement device ID tracking

Make sure your app generates and stores a unique device ID for each user. This can be done using localStorage:

```typescript
// Function to get a unique device identifier
async function getDeviceId(): Promise<string> {
  // Check if we already have a device ID in localStorage
  let deviceId = localStorage.getItem('review_device_id');
  
  if (!deviceId) {
    // Generate a new device ID if none exists
    deviceId = `device_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
    localStorage.setItem('review_device_id', deviceId);
  }
  
  return deviceId;
}
```

### Step 3: Update the review submission function

Ensure your `submitReview` function includes the device ID:

```typescript
async function submitReview(review: Omit<Review, 'id' | 'reviewDate' | 'status'>): Promise<{ success: boolean, reviewId?: string, error?: string }> {
  try {
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
    
    // Process response...
  } catch (e) {
    // Handle errors...
  }
}
```

## Maintenance and Monitoring

### Regular Tasks

1. **Moderate Reviews**: Regularly check the Google Sheet for new reviews with "Pending" status and update to "Approved" or "Rejected"

2. **Publish Updates**: After moderating reviews, republish the sheet as CSV for the frontend to access

3. **Monitor Usage**: Check the Apps Script dashboard for execution logs and errors

4. **Clean Up Data**: Periodically archive or delete old rejected reviews to keep the sheet manageable

### Setting Up Notifications

You can add a trigger to send email notifications when new reviews are submitted:

1. In the Apps Script editor, click on "Triggers" (clock icon)
2. Click "Add Trigger"
3. Configure:
   - Choose function: Select a new function you'll create for notifications
   - Event source: "From spreadsheet"
   - Event type: "On form submit" or "On edit"
4. Click "Save"

Then create a notification function:

```javascript
function sendNotificationEmail() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const newReview = sheet.getRange(lastRow, 1, 1, 8).getValues()[0];
  
  // Send email notification
  MailApp.sendEmail({
    to: "your-email@example.com",
    subject: "New Review Submitted - TheHub",
    body: `A new review has been submitted:
    
Product ID: ${newReview[1]}
Business ID: ${newReview[2]}
Reviewer: ${newReview[3]}
Rating: ${newReview[4]}
Review: ${newReview[5]}
Date: ${newReview[6]}
Status: ${newReview[7]}

Please moderate this review at: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`
  });
}
```

## Troubleshooting

### Common Issues and Solutions

1. **CORS Errors**
   - Problem: Your web app can't make requests to the Apps Script URL
   - Solution: Add CORS headers to your Apps Script response

   ```javascript
   // Add this to your doPost function
   const output = ContentService.createTextOutput(JSON.stringify({
     'status': 'success',
     'reviewId': reviewId
   })).setMimeType(ContentService.MimeType.JSON);
   
   // Add CORS headers
   output.setHeader('Access-Control-Allow-Origin', '*');
   return output;
   ```

2. **Rate Limit Not Working**
   - Problem: Users can submit more than 2 reviews per day
   - Solution: Check the `checkDailySubmissionLimit` function and ensure dates are being compared correctly

3. **Script Execution Timeout**
   - Problem: Script times out when processing large sheets
   - Solution: Optimize your code to process data more efficiently

4. **Authorization Issues**
   - Problem: Users get "Authorization Required" errors
   - Solution: Check your deployment settings and make sure the app is deployed with the right access level

## Advanced Customizations

### Adding Spam Detection

You can enhance the script with basic spam detection:

```javascript
function isSpam(reviewText) {
  if (!reviewText) return false;
  
  // Check for spam indicators
  const spamPatterns = [
    /\b(viagra|cialis|buy now|click here|free money)\b/i,
    /\b(https?:\/\/|www\.)\S+/i, // URLs might indicate spam
    /[\uD800-\uDBFF][\uDC00-\uDFFF]{10,}/ // Excessive emoji use
  ];
  
  return spamPatterns.some(pattern => pattern.test(reviewText));
}

// Then in doPost:
if (isSpam(data.reviewText)) {
  return createErrorResponse('Review contains prohibited content');
}
```

### Adding Profanity Filtering

Implement basic profanity filtering:

```javascript
function containsProfanity(text) {
  if (!text) return false;
  
  const profanityList = ['badword1', 'badword2', 'badword3']; // Add your list
  const textLower = text.toLowerCase();
  
  return profanityList.some(word => textLower.includes(word));
}

// Then in doPost:
if (containsProfanity(data.reviewText)) {
  return createErrorResponse('Review contains inappropriate language');
}
```

### Implementing Review Analytics

Add a function to calculate review statistics:

```javascript
function calculateReviewStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  const reviews = data.slice(1);
  
  // Group by product
  const productStats = {};
  
  reviews.forEach(review => {
    const productId = review[1]; // Column B (index 1)
    const rating = review[4]; // Column E (index 4)
    const status = review[7]; // Column H (index 7)
    
    // Only count approved reviews
    if (status === 'Approved') {
      if (!productStats[productId]) {
        productStats[productId] = {
          count: 0,
          totalRating: 0,
          averageRating: 0
        };
      }
      
      productStats[productId].count++;
      productStats[productId].totalRating += rating;
      productStats[productId].averageRating = 
        productStats[productId].totalRating / productStats[productId].count;
    }
  });
  
  // Create or update a stats sheet
  let statsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Review Stats');
  if (!statsSheet) {
    statsSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Review Stats');
    statsSheet.appendRow(['Product ID', 'Review Count', 'Average Rating', 'Last Updated']);
  } else {
    // Clear existing data (except header)
    if (statsSheet.getLastRow() > 1) {
      statsSheet.deleteRows(2, statsSheet.getLastRow() - 1);
    }
  }
  
  // Add stats data
  Object.keys(productStats).forEach(productId => {
    const stats = productStats[productId];
    statsSheet.appendRow([
      productId,
      stats.count,
      stats.averageRating,
      new Date().toISOString()
    ]);
  });
}
```

---

This guide provides a comprehensive implementation of Google Apps Script for TheHub's product review system. By following these steps, you'll have a fully functional backend for collecting, validating, and storing product reviews using Google Sheets as the database.

Remember to regularly maintain your sheet and monitor the script's performance to ensure it continues to work effectively as your application grows.