# CORS Proxy Solution

## Problem

The application was experiencing CORS (Cross-Origin Resource Sharing) issues when making requests from the client-side application hosted at `https://the-hubja.netlify.app` to the Google Apps Script at `https://script.google.com/macros/s/AKfycbwEIF7RANRuC1CFFg6r6gnPolabEyAEFffTdBZHnAt8jiHSdNCLRafw4-pT_gluSJh-/exec`.

Specifically, the browser was blocking these requests with the following error:

```
Access to fetch at 'https://script.google.com/macros/s/AKfycbwEIF7RANRuC1CFFg6r6gnPolabEyAEFffTdBZHnAt8jiHSdNCLRafw4-pT_gluSJh-/exec' from origin 'https://the-hubja.netlify.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

We implemented a proxy solution using Netlify's redirect functionality. This allows us to route requests through our own domain, which eliminates the CORS issue since the browser will be making requests to the same origin.

### Changes Made

1. **Updated `netlify.toml`**:
   - Added a redirect rule that proxies requests from `/api/google-script/*` to the Google Apps Script URL

   ```toml
   [[redirects]]
     from = "/api/google-script/*"
     to = "https://script.google.com/macros/s/AKfycbwEIF7RANRuC1CFFg6r6gnPolabEyAEFffTdBZHnAt8jiHSdNCLRafw4-pT_gluSJh-/exec/:splat"
     status = 200
     force = true
   ```

2. **Updated client-side services**:
   - Modified `review-service.ts` and `vote-service.ts` to use the proxy endpoint instead of directly calling the Google Apps Script URL
   - Changed:
     ```typescript
     const REVIEW_API_URL = 'https://script.google.com/macros/s/AKfycbw_hnumK9gmuzxRffQFOF0DgKp2-ehz3PRiFM4LWr6mX7IBXa00Z_CKa92HeLjIXIlM/exec';
     ```
     to:
     ```typescript
     const REVIEW_API_URL = '/api/google-script';
     ```

## How It Works

1. When the client-side application makes a request to `/api/google-script`, Netlify's redirect engine intercepts the request
2. Netlify forwards the request to the Google Apps Script URL, preserving any path parameters or query strings
3. The Google Apps Script processes the request and returns a response
4. Netlify forwards the response back to the client-side application

Since the request is now being made to the same origin (`https://the-hubja.netlify.app`), the browser doesn't enforce CORS restrictions.

## Deployment

The changes have been committed to the repository and pushed to GitHub. Netlify will automatically deploy these changes when it detects the new commit.

## Testing

After deployment, verify that the application can successfully make requests to the Google Apps Script by:

1. Navigating to a page that uses the review or vote functionality
2. Checking the browser's developer console to ensure there are no CORS errors
3. Confirming that data is being fetched and displayed correctly

## Limitations

- This solution relies on Netlify's redirect functionality, which may have rate limits or other restrictions
- If the Google Apps Script URL changes, the `netlify.toml` file will need to be updated accordingly