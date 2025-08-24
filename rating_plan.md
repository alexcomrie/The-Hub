# Rating Submission Issue Resolution Plan

## Problem Analysis
- User clicks thumbs up, sees success toast "rating submitted successfully".
- Google Sheet (BusinessRatings) not updated.
- Client code in `google-apps.service.ts` sends POST to Google Apps Script URL with action 'submitRating'.
- Script (from javascript.md) handles 'submitRating': checks for existing rating, enforces 7-day update limit, appends/updates row in 'BusinessRatings' sheet, invalidates cache, returns success.
- Success message appears, so API responds, but sheet unchanged – possible causes:
  1. Script not deployed correctly or wrong deployment ID in URL.
  2. Sheet permissions: Script lacks edit access to the Google Sheet.
  3. Wrong sheet name or column structure mismatch (compare with BusinessRatings.xlsx).
  4. Client-side: Incorrect URL, CORS issues, or params not matching script expectations.
  5. Runtime errors in script not caught, still returning success.

## Resolution Steps
1. **Verify Google Apps Script Deployment:**
   - Open the script in Google Apps Script editor.
   - Deploy as web app, ensure 'Execute as: Me' and 'Who has access: Anyone'.
   - Update the URL in client code with the new deployment ID.

2. **Check Sheet Permissions and Structure:**
   - Confirm sheet name is 'BusinessRatings'.
   - Verify structure matches BusinessRatings.xlsx (columns: businessId, deviceId, ratingType, date).
   - Ensure the Google account running the script has edit access to the spreadsheet.

3. **Test Script Directly:**
   - Use Postman to send POST request to the script URL with sample data.
   - Check script logs in Google Apps Script dashboard for errors.
   - Add Logger.log statements in handleRatingSubmission for debugging.

4. **Client-Side Checks:**
   - Console.log the response in submitRating function to verify actual API response.
   - Ensure deviceId and businessId are correctly passed.
   - Handle errors properly in axios catch block, show failure toast if status != 'success'.

5. **Update Script if Needed:**
   - Add try-catch around sheet operations.
   - If issue persists, update script to return more detailed status.

6. **Test End-to-End:**
   - After fixes, test thumbs up click and verify sheet update.
   - Clear cache and test 7-day limit enforcement.

## Clarifying Questions
- What is the exact Google Apps Script URL used in the client?
- Can you share any console errors or network tab details from browser dev tools when submitting rating?
- Is the spreadsheet ID correctly set in the script (SpreadsheetApp.getActiveSpreadsheet())?