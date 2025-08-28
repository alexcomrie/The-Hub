business/shadea'z_na…beauty_essentials:1 Access to fetch at 'https://script.google.com/macros/s/AKfycbzHe0uNOxH9SJd61XqU-92Xs41wmS184IZI…ction=vote&businessId=shadea%27z_natural_beauty_essentials&username=alexc1' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
Explanation

Understanding the problem
This error indicates that your browser, running code from http://localhost:3000, is trying to make a request to a different origin (https://script.google.com). This is a "cross-origin" request, and for security reasons, browsers restrict these types of requests unless the server receiving the request explicitly allows them.

The error specifically mentions "preflight request" and "doesn't pass access control check: It does not have HTTP ok status". Before making the actual request (a fetch in this case), the browser sends a "preflight" OPTIONS request to the server to check if the server will allow the actual request. The preflight request failed because the server at https://script.google.com/macros/... did not respond with a successful HTTP status code (an "HTTP ok status", typically in the 2xx range). This means the server, in this case a Google Apps Script, is not set up to handle the necessary CORS preflight checks correctly for requests coming from your origin.

Suggested fix
The issue is on the server side (the Google Apps Script). You need to modify the Apps Script to handle the OPTIONS preflight request and respond with the appropriate CORS headers. Google Apps Script provides a doOptions(e) function that can handle this.

Add the following function to your Google Apps Script:

function doOptions(e) {
  // This function handles CORS preflight requests.
  // It's necessary for complex cross-origin requests (like POST requests
  // with custom headers) from a browser.

  // Return a successful response with CORS headers.
  // The `Access-Control-Allow-Origin` should be set to the origin(s) you want to allow.
  // Using '*' allows requests from any origin, which is suitable for testing
  // or publicly accessible APIs, but consider specifying your exact origin(s)
  // in production for better security.
  // The `Access-Control-Allow-Methods` should list the HTTP methods you will
  // allow in the actual request (e.g., 'GET', 'POST').
  // The `Access-Control-Allow-Headers` should list any custom headers you are
  // sending with your actual request.
  var headers = {
    'Access-Control-Allow-Origin': '*', // Or specify your domain: 'http://localhost:3000'
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type', // Add any other headers you are sending
    'Access-Control-Max-Age': 86400 // Cache preflight response for 24 hours
  };

  var response = ContentService.createTextOutput('');
  for (var h in headers) {
    response.setHeader(h, headers[h]);
  }
  return response;
}

// Ensure your doPost or doGet function also includes the
// Access-Control-Allow-Origin header in its response.
function doPost(e) {
  // ... your existing doPost code ...

  var output = ContentService.createTextOutput(JSON.stringify({ success: true }));
  output.setHeader('Access-Control-Allow-Origin', '*'); // Ensure this header is also present
  return output;
}

Make sure you deploy your Apps Script as a web app with the correct permissions after adding the doOptions function and updating your doPost (or doGet) function to include the Access-Control-Allow-Origin header in the response.

Summary
The CORS error occurs because the Google Apps Script, acting as a server, is not configured to handle the browser's preflight OPTIONS request, which is required for cross-origin fetch requests. Adding a doOptions function to your Apps Script that returns a successful response with the appropriate Access-Control-Allow-Origin, Access-Control-Allow-Methods, and Access-Control-Allow-Headers is the standard way to fix this. You also need to ensure your main request handler (doPost or doGet) includes the Access-Control-Allow-Origin header in its response.

Sources and related content
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
https://discuss.google.dev/t/google-apps-script-form-to-sheets-cors-issue/184486
Data used to understand this message
Use search instead
AI tools may generate inaccurate info that doesn't represent Google's views. Data sent to Google may be seen by human reviewers to improve this feature. Open settings or learn more
