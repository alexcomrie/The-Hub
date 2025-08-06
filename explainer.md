# The Hub Web App: An Explainer

This document provides a comprehensive guide to The Hub Web App, with sections tailored for both end-users and developers.

---

## For Users: How to Use the App

Welcome to The Hub! This guide will walk you through the main features of the application.

### 1. Browsing Businesses

When you first open the app, you'll see a list of business categories.

-   **To view businesses in a category:** Tap on any category to see all the businesses that belong to it.
-   **To view all businesses:** If you want to see a list of all businesses regardless of category, you can find an "All Businesses" option in the navigation.

### 2. Viewing a Business Profile

From the business list, tap on any business to view its profile. Here you'll find:

-   **Contact Information:** Phone number, WhatsApp, and email.
-   **Location:** The business's address.
-   **Hours:** Regular and special operating hours.
-   **Bio:** A short description of the business.

### 3. Exploring Products

On a business's profile page, you'll find a button to view their products (e.g., "View Products"). Tapping this will take you to their product catalog.

-   **Product Details:** You can tap on any product to see more details, including a larger image, a full description, and price.

### 4. Using the Shopping Cart

-   **Adding Products:** On a product's detail page, you can add it to your cart.
-   **Viewing the Cart:** You can access your cart at any time from the navigation bar. The cart will show you all the items you've added, grouped by business.
-   **Placing an Order:** Currently, the app allows you to assemble your order in the cart. To finalize the order, you will need to contact the business directly using the information provided in their profile.

---

## For Developers: A Guide to the Codebase

This section provides a technical overview of the application for developers.

### 1. Core Architecture

As detailed in the `README.md`, this is a "database-less" application.

-   **Frontend:** A React PWA that handles all data fetching and rendering.
-   **Backend:** A minimal Express.js server that only serves the frontend application and provides a health check.
-   **Data Source:** All data is sourced from public Google Sheets, which are fetched as CSV files.

### 2. Data Flow

1.  **Initial Load:** When a user opens the app, the `BusinessService` is responsible for fetching data.
2.  **Caching:** The service first checks `localStorage` for cached data. If found, it's used immediately.
3.  **Network Fetch:** If no cache exists, the service makes a `fetch` request to the public Google Sheet URL for business profiles.
4.  **Parsing:** The fetched CSV text is parsed into a `Business[]` array on the client.
5.  **Caching:** The parsed data is then stored in `localStorage` for future visits.
6.  **Product Loading:** A similar flow occurs when a user views a business's products, using the `productSheetUrl` from the business's data.

### 3. Managing Data (The "Admin Panel")

The "admin panel" for this application is Google Sheets.

-   **Business Profiles Sheet:** To add, remove, or update a business, you must edit the main Google Sheet linked in `client/src/services/business-service.ts`.
-   **Product Sheets:** To manage a business's products, you must edit the separate Google Sheet linked in that business's row in the main sheet.

**Important:** When you make changes to a sheet, ensure you **re-publish** it to the web (`File > Share > Publish to web`). The application fetches the *published* version of the sheet.

### 4. Codebase Structure

-   `client/`: The React frontend.
    -   `src/pages/`: Contains the top-level components for each page/route.
    -   `src/components/`: Contains reusable UI components.
    -   `src/services/`: Contains the logic for fetching and processing data (e.g., `business-service.ts`).
    -   `src/hooks/`: Contains custom React hooks.
    -   `src/providers/`: Contains React context providers (e.g., `cart-provider.tsx`).
-   `server/`: The Node.js backend.
    -   `index.ts`: The main server entry point.
    -   `routes.ts`: Defines the API routes (currently just a health check).
-   `shared/`:
    -   `schema.ts`: Contains the `zod` schemas for all data models, ensuring type safety between the client and any potential future backend logic.

### 5. How to Contribute

1.  **Fork the repository.**
2.  **Make your changes** in a new branch.
3.  **Follow the existing code style.**
4.  **If you add new data dependencies,** update the relevant schemas in `shared/schema.ts`.
5.  **Submit a pull request** with a clear description of your changes.
