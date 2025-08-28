Review and Rating system

A. The goal is to create a review and rating system including Like and Dislike using google app script, and using google sheet as the databade, Google app script will be use to automatically create the neccessary google sheets needed for the Review and Rating system database, the google app script code will also create all the heading in all sheets as well.

This system will focus on a few files
- business-list.tsx
- business-profile.tsx
- product-list.tsx
- product-details.tsx
- settings.tsx

1. Like and Dislike 
This will be for each profile, giving the app user the ability to either like or dislike a business, each user will only be allowed one like or dislike per business, which can be updated every 8 dayes, likes and dislikes will be represented by thumbs up and thumbs down icon respectively.

in the business-list.tsx the amount or likes and dislikes for each business will be displayed with the thumbs up and thumbs down icon with a number representing the the amount of likes and dislike the corresponding profile has recieved. in the business-list.tsx the user will only view the likes or dislikes of each profile.

in the business-profile.tsx the user will have the ability to either like or dislike a business profile by either pressing either the thumbs up or down button, each icon will have a number representing the amount of like and dislike the current profile have, and the amount will update in real time when the like or dislike button is pressed.

2. Review and Rating
in the product-list.tsx a chat bubble icon will be added to each product detailes in addition to the product name, category, price, and instock status, the chat bubble icon will indictae that the product has a review, in addition to the icon there will be a number representing the amount of review the product have, giving the user the ability to view the amount of review each product have without opening product details.

in the product-details.tsx is where the product review and ratings will be submitted and viewed, the user will have the ability to write a review and also add a rating represented by stars to the review, the star rating will be displayed above the corresponding review, each user can only leave a maximum of 5 reviews per profile each day, all review will only be public so all users can view. when a review is submitted the figure indicating the review amount will be updated,

3. Username
because a username will be required for a user to submit a review so the business owner and other users see whow left the review, the app will now now have a username system which will cache the username in local storage.
- when a user open the app the app will check if a user name is already created, if not a "create username" popup dialouge will popup prompting the user to create a username which will be stored on the local device when the use enter a username and press the save button, if the app checks and a username is already created, the "create username" popup dialouge will be disabled, also in the settings.tsx the user will the ability to edit their username but once only every 31 days.

B. the task 
I want you to create a comprensive implimentation to the Review and rating feature without breaking the apps code, first outline a detailed comprensive plan in Review&Rarings.md outlingning the step by step plan to impliment the review and ratings, in the plan you should first impliment all the neccessary codes and features into the app first and make sure all features are added, then create the complete google app script java script code in Review&Rarings_script.md for me to copy and create the google app script to complete the rating and review function. please remember that the google app script should be responsible of automatically creating all needed google sheets to faclitate the database for the review and rating system and also make sure each sheet has the propre column headings,




# Review and Rating system — (edited & enhanced)

A. Overview
The goal is to create a Review and Rating system (including Like and Dislike) using **Google Apps Script** and **Google Sheets** as the database. The Google Apps Script will automatically create the necessary Google Sheets for the Review & Rating system and will also add the required column headings in each sheet.

This system will focus on the following files:

* `business-list.tsx`
* `business-profile.tsx`
* `product-list.tsx`
* `product-details.tsx`
* `settings.tsx`

---

## 1. Like and Dislike

* Each business profile will support one Like or Dislike from each app user. A user may update their choice once every **8 days**.
* Likes and dislikes will be represented by thumbs-up and thumbs-down icons respectively.

**In `business-list.tsx`:**

* Display the counts of likes and dislikes for each business next to the corresponding thumbs-up / thumbs-down icons.
* Users will only see the aggregate counts on the listing page (they will not be able to change their choice from the list view).

**In `business-profile.tsx`:**

* Allow the user to like or dislike the business by pressing the thumbs-up or thumbs-down button.
* Each icon will show the count of likes or dislikes for that profile.
* Counts should update in real time when the user toggles their choice.

---

## 2. Review and Rating

**In `product-list.tsx`:**

* Add a chat-bubble icon next to each product to indicate that the product has reviews.
* Show a number next to the icon representing the total reviews for that product so users can see how many reviews exist without opening the product details.

**In `product-details.tsx`:**

* This is where users submit and view product reviews and ratings.
* Users can write a review and add a star rating; the star rating will be displayed above the corresponding review.
* Each user may leave up to **5 reviews per profile per day**. (All reviews are public and visible to every user.)
* When a review is submitted, the review count displayed next to the product should update immediately.

---

## 3. Username

* A username will be required for submitting reviews so business owners and other users can see who left each review.
* The app will store the username in local storage (cached on the device).

Behavior:

* On app launch, check whether a username already exists in local storage.

  * If no username exists, show a **Create Username** popup dialog prompting the user to create one. When the user enters a username and presses **Save**, store it on the local device.
  * If a username already exists, the **Create Username** popup dialog should be disabled.
* In `settings.tsx` allow the user to edit their username, but only **once every 31 days**.

---

B. The task (deliverables & instructions)
I want a **comprehensive implementation** plan for the Review & Rating feature that will not break the app’s existing code. Deliverables:

1. Create a detailed, step-by-step implementation plan in **`Review&Rarings.md`** that outlines how to add the Review & Rating system into the app. In that plan you should:

   * List and explain all required code and UI changes for each file (`business-list.tsx`, `business-profile.tsx`, `product-list.tsx`, `product-details.tsx`, `settings.tsx`).
   * Describe data models, Google Sheets schema, API endpoints (or functions) that will be used, and how real-time updates will be handled.
   * Include migration steps (if needed), tests to run, and safety checks to ensure the app does not break.

2. Create the complete **Google Apps Script (JavaScript)** code in **`Review&Rarings_script.md`** that:

   * Automatically creates all required Google Sheets for the Review & Rating database.
   * Creates the proper column headings for each sheet.
   * Exposes any helper functions or endpoints needed by the app to read/write reviews, likes, dislikes, usernames, and ratings.

Please ensure the Google Apps Script is self-contained and ready for copying into the Google Apps Script editor. The script must be responsible for creating and initializing all sheets and headings required by the review and rating system.

