# Polished specification — **Review & Rating System**

Below is a corrected, tightened, and enhanced version of your original prompt. You can copy this and use it as the single authoritative spec for a developer or an AI to implement the feature set.

---

# Review & Rating System — Project Brief

**Goal:**
Build a Review & Rating system (with Like / Dislike) that uses **Google Apps Script (GAS)** as a backend and **Google Sheets** as the database. The GAS code must automatically create the necessary Google Sheets and column headings. The front-end is a React / TypeScript app; the files impacted are:

* `business-list.tsx`
* `business-profile.tsx`
* `product-list.tsx`
* `product-details.tsx`
* `settings.tsx`

---

## High-level requirements

1. **Like / Dislike**

   * Each app user may express **one choice per business**: Like **or** Dislike.
   * A user may change their choice (switch like/dislike or remove it) **only once every 8 days** (i.e., 8 \* 24 hours since their last vote change).
   * Likes/dislikes display as thumbs-up / thumbs-down icons with a numeric count.
   * `business-list.tsx`: shows thumbs up/down icons and counts for each business (counts only).
   * `business-profile.tsx`: shows interactive thumbs up/down buttons; pressing updates the counts in real time (optimistic UI + confirm via backend).
   * Backend must enforce one vote per (user, business) and the 8-day change rule.

2. **Reviews & Star Ratings**

   * Each product can have public reviews with an associated star rating (1–5).
   * `product-list.tsx`: add a chat-bubble icon for each product indicating it has reviews, plus the number of reviews (so users can see review counts without opening details).
   * `product-details.tsx`: full review view + a form to submit a review (text + star rating).
   * **Limits**: each user may submit **up to 5 reviews per profile per day** (a “profile” here = business/product profile as appropriate). Backend enforces this.
   * Display: star rating displayed above each review; review counts update when a new review is submitted.
   * Reviews are **public** (visible to all users).

3. **Username**

   * A username is required to post reviews so owners and other users know who posted them.
   * Username is cached in `localStorage`.
   * On app open, the app checks `localStorage`. If no username exists, show a **Create Username** modal prompting the user to enter and save a username (saved to local device).
   * If a username exists, the modal is disabled.
   * In `settings.tsx` the user may edit their username, but **only once every 31 days** (backend should track last username-change date or the app should enforce it with a server-side timestamp check if persisted).

---

## Google Apps Script responsibilities

The GAS code must:

1. **Automatically create** all required Google Sheets and column headings when first deployed (or when a “bootstrap” endpoint is called). It must create at minimum these sheets:

   * `Businesses` — list of businesses.
   * `Products` — list of products.
   * `Users` — optional: store username cache, user IDs, last username-change timestamp (if you want server-side enforcement).
   * `Likes` — store each like/dislike event (one row per user-business vote).
   * `Reviews` — store each review (one row per review).
   * `Meta` — any schema metadata, secrets, or counters (optional).

2. **Expose Web API endpoints** (via `doGet` / `doPost`) to be consumed by the front-end. Examples:

   * `POST /vote` — payload: `{ userId, businessId, vote }` where `vote` is `like` or `dislike`. Returns updated counts, and errors if rate limit/8-day rule prevents change.
   * `GET /counts?businessId=...` — returns `{ likes, dislikes }`.
   * `POST /review` — payload: `{ userId, productId, rating, text }` — returns success/failure and updated review count and average rating.
   * `GET /reviews?productId=...&page=...` — returns paginated reviews.
   * `GET /products` and `GET /businesses` — optional helper endpoints returning product/business lists with counts.
   * Consider `GET /user` and `POST /user/username` if you want to store username server-side.

3. **Enforce rules server-side**:

   * One vote per user/business and only allow change after 8 days.
   * Max 5 reviews per profile per user per day.
   * Validate rating is integer 1–5 and review length range (e.g., 5–1000 chars).
   * Return descriptive errors and consistent JSON.

4. **Security & integration**

   * GAS must support a simple authentication measure: a shared secret passed in a header or query param (store secret in `PropertiesService`); require it in requests to avoid casual misuse. Document how to set the secret.
   * Ensure CORS headers are present so the front end can call the GAS web app.
   * All responses must be JSON with consistent status codes (200 + `{ok:true}` for success; 400/403 with `{ok:false, error:"..."}` for errors).

---

## Suggested Google Sheets schema (column headings)

**Businesses**

* `businessId` (string, unique)
* `name`
* `description`
* `ownerUserId`
* `createdAt` (ISO timestamp)
* `lastUpdatedAt`
* (Optional) `likesCount` (integer) — *derived*, keep updated by GAS
* (Optional) `dislikesCount` (integer) — *derived*

**Products**

* `productId` (string, unique)
* `businessId`
* `name`
* `category`
* `price`
* `inStock` (boolean)
* `createdAt`
* `lastUpdatedAt`
* (Optional) `reviewCount` (integer) — *derived*
* (Optional) `averageRating` (number, 1–5) — *derived*

**Users** (optional, helpful if you want server-side username tracking)

* `userId` (string, unique)
* `username`
* `createdAt`
* `lastUsernameChangeAt` (ISO timestamp)

**Likes**

* `voteId` (string, unique)
* `userId`
* `businessId`
* `vote` (`like` or `dislike`)
* `createdAt` (ISO)
* `lastChangedAt` (ISO) — update when user changes vote (used for 8-day rule)

**Reviews**

* `reviewId` (string, unique)
* `userId`
* `productId`
* `rating` (1–5)
* `text` (string)
* `createdAt` (ISO)
* `updatedAt` (ISO)

**Meta** (optional)

* `key`
* `value`

> The GAS bootstrap must create these sheets and exact column headings if they don't exist.

---

## API contract (examples)

**POST /vote**
Request body:

```json
{
  "userId": "u_123",
  "businessId": "b_456",
  "vote": "like"   // or "dislike"
}
```

Response success:

```json
{ "ok": true, "likes": 12, "dislikes": 3 }
```

Error (example when 8-day change not allowed):

```json
{ "ok": false, "error": "You may change your vote only once every 8 days. Try again on 2025-09-03T12:00:00Z." }
```

**POST /review**
Request body:

```json
{
  "userId": "u_123",
  "productId": "p_789",
  "rating": 4,
  "text": "Great plant, shipped quickly!"
}
```

Success:

```json
{ "ok": true, "reviewId": "r_987", "reviewCount": 7, "averageRating": 4.2 }
```

Error (max reviews reached):

```json
{ "ok": false, "error": "You have reached the maximum of 5 reviews for this profile today." }
```

---

## Front-end behavior (UX & integration notes)

* Use **optimistic UI** for vote and review actions:

  * Update the UI immediately to reflect the new count, then call the backend. If backend rejects, show an error toast and revert.
* For real-time updates:

  * GAS doesn't provide native WebSocket support. Use one of:

    * short polling (e.g., refresh counts every 10–30 seconds), or
    * long-polling / periodic refresh on page focus, or
    * integrate a real-time service (Firebase Realtime DB / Firestore) later.
  * For now, implement optimistic UI + immediate fetch of updated counts after a successful response from GAS.
* `settings.tsx`:

  * Show current username and last changed date.
  * Disable username edit until 31 days from `lastUsernameChangeAt`.
  * If username is only stored in `localStorage`, include the last-change timestamp in `localStorage` too. (Recommend storing server-side if you need robust enforcement.)
* `product-list.tsx`:

  * Add review icon + number near each product title; clicking navigates to `product-details.tsx`.

---

## Error handling & validation (server-side mandatory)

* Validate required fields and types for all endpoints.
* Enforce rate limits and explain precisely why a request was denied.
* Verify `rating` is integer 1–5.
* Enforce review text length (suggest: 5–1000 characters).
* Sanitize input to avoid script injection — strip common HTML tags / escape text.
* Log errors and include basic retry/backoff guidance to the front-end.

---

## Deliverables (what I want you to produce)

1. **`Review&Ratings.md`** — a comprehensive step-by-step implementation plan that details:

   * exact code insertion points in the five TSX files,
   * necessary UI changes and component-level props/state,
   * API endpoints to call and expected payloads,
   * front-end polling/sync strategy,
   * UX for username modal and settings,
   * testing checklist and migration steps (how to enable the GAS web app, set secret, bootstrap sheets),
   * edge cases and rollback plan.

2. **`Review&Ratings_script.md`** — complete Google Apps Script (JavaScript) that:

   * bootstraps the sheets and headings if not present,
   * exposes the `doGet` / `doPost` endpoints described above,
   * implements `vote` and `review` handlers with server-side enforcement of:

     * one vote per user/business, 8-day change rule,
     * max 5 reviews per profile per user per day,
   * returns the JSON responses in the contract format,
   * includes instructions to publish the GAS as a web app and how to set the shared secret (using `PropertiesService`),
   * includes comments and minimal inline docs so it’s copy-paste ready.

> Note: Name the files exactly `Review&Ratings.md` and `Review&Ratings_script.md` when delivering.
