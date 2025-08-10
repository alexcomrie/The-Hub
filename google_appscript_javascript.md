// Utility function to validate username
function validateUsername(username) {
  if (!username || username.trim().length < 3 || username.trim().length > 30) {
    throw new Error("Username must be between 3 and 30 characters");
  }
  
  // Check for allowed characters (alphanumeric and underscores)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error("Username can only contain letters, numbers, and underscores");
  }
  
  return username.trim();
}

// Utility function to check username change eligibility
function checkUsernameChangeEligibility(deviceId) {
  const userSettings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UserSettings");
  const deviceData = findDeviceData(userSettings, deviceId);
  
  if (deviceData && deviceData.changeDate) {
    const daysSinceChange = (new Date() - new Date(deviceData.changeDate)) / (1000 * 60 * 60 * 24);
    if (daysSinceChange < 35) {
      throw new Error("Username can only be changed every 35 days");
    }
  }
}

// Utility function to check daily review limit
function checkDailyReviewLimit(deviceId) {
  const reviews = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reviews");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reviewData = reviews.getDataRange().getValues();
  const todayReviews = reviewData.filter(row => {
    const reviewDate = new Date(row[6]); // Review Date column
    reviewDate.setHours(0, 0, 0, 0);
    return row[8] === deviceId && reviewDate.getTime() === today.getTime();
  });
  
  if (todayReviews.length >= 2) {
    throw new Error("Daily review limit reached (maximum 2 reviews per day)");
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch (action) {
      case "setUsername":
        return handleSetUsername(data);
      case "submitReview":
        return handleReviewSubmission(data);
      case "submitRating":
        return handleRatingSubmission(data);
      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch (action) {
      case "getRatingCounts":
        return handleGetRatingCounts(e.parameter.businessId);
      case "getMostLikedBusinesses":
        return handleGetMostLikedBusinesses();
      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleSetUsername(data) {
  const { deviceId, username } = data;
  const validatedUsername = validateUsername(username);
  
  checkUsernameChangeEligibility(deviceId);
  
  const userSettings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UserSettings");
  const now = new Date().toISOString();
  
  // Check if device already has a username
  const deviceRow = findDeviceRow(userSettings, deviceId);
  
  if (deviceRow > 0) {
    userSettings.getRange(deviceRow, 2, 1, 3).setValues([
      [validatedUsername, now, now]
    ]);
  } else {
    userSettings.appendRow([deviceId, validatedUsername, now, now]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    username: validatedUsername
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleRatingSubmission(data) {
  const { businessId, deviceId, ratingType } = data;
  
  if (!businessId || !deviceId || !ratingType) {
    throw new Error("Missing required fields");
  }
  
  if (ratingType !== "like" && ratingType !== "dislike") {
    throw new Error("Invalid rating type");
  }
  
  const ratings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("BusinessRatings");
  const now = new Date().toISOString();
  
  // Remove any existing rating from this device for this business
  const existingRating = findExistingRating(ratings, businessId, deviceId);
  if (existingRating > 0) {
    ratings.deleteRow(existingRating);
  }
  
  // Add new rating
  ratings.appendRow([businessId, deviceId, ratingType, now]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success"
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleGetRatingCounts(businessId) {
  if (!businessId) {
    throw new Error("Business ID is required");
  }
  
  const ratings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("BusinessRatings");
  const ratingData = ratings.getDataRange().getValues();
  
  const counts = ratingData.reduce((acc, row) => {
    if (row[0] === businessId) {
      row[2] === "like" ? acc.likes++ : acc.dislikes++;
    }
    return acc;
  }, { likes: 0, dislikes: 0 });
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    counts: counts
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleGetMostLikedBusinesses() {
  const ratings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("BusinessRatings");
  const ratingData = ratings.getDataRange().getValues();
  
  // Calculate likes per business
  const likeCounts = ratingData.reduce((acc, row) => {
    if (row[2] === "like") {
      acc[row[0]] = (acc[row[0]] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Sort businesses by likes
  const sortedBusinesses = Object.entries(likeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([businessId]) => businessId);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    businesses: sortedBusinesses
  })).setMimeType(ContentService.MimeType.JSON);
}