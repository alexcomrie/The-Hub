# The Hub Web App

A modern, progressive web application (PWA) designed to connect users with a wide range of local businesses, services, and products. This application functions as a directory and e-commerce platform, allowing users to browse business profiles, view product catalogs, and manage a shopping cart.

A unique aspect of this application is its "database-less" architecture. Instead of a traditional database, it sources all its data directly from publicly shared Google Sheets, making it incredibly easy for non-technical users to manage business and product information.

## Features

-   **Business Directory:** Browse a list of all available businesses or view them by category.
-   **Business Profiles:** View detailed profiles for each business, including contact information, location, and operating hours.
-   **Product Catalogs:** Explore the products offered by each business, complete with images, descriptions, and pricing.
-   **Shopping Cart:** Add products from various businesses to a universal shopping cart.
-   **Client-Side Caching:** Utilizes `localStorage` to cache data, providing a fast and offline-capable experience.
-   **Responsive Design:** A mobile-first design that works seamlessly across all devices.
-   **PWA Ready:** Can be "installed" on a user's device for a native-like experience.

## Architecture

The application uses a unique client-server architecture where the frontend is responsible for all data fetching and processing, and the backend is a minimal server primarily for serving the application.

```
                           +-----------------+
                           |   User's Browser|
                           +-----------------+
                                    |
                                    | Renders
                                    v
+-------------------------------------------------------------------------+
|                                                                         |
|                        Frontend (React PWA)                             |
|                                                                         |
|  +-----------------+  +-----------------+  +-----------------+          |
|  |   UI Components |  |   Pages/Views   |  |     Services    |          |
|  +-----------------+  +-----------------+  +-----------------+          |
|  | - Business Cards|  | - Business List |  | - Business Svc  |          |
|  | - Product Cards |  | - Product List  |  | - Category Svc  |          |
|  | - Cart          |  | - Cart View     |  | - Refresh Svc   |          |
|  +-----------------+  +-----------------+  +-----------------+          |
|                                    |                                    |
|                                    | Fetches data from                  |
|                                    v                                    |
|  +-------------------------------------------------------------------+  |
|  |                        Data Layer                                 |  |
|  |                                                                   |  |
|  |  +-----------------+  +----------------------------------------+  |  |
|  |  | localStorage    |  | Fetches CSV data from Google Sheets    |  |  |
|  |  | (for Caching)   |  |                                        |  |  |
|  |  +-----------------+  +----------------------------------------+  |  |
|  |                                                                   |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
+-------------------------------------------------------------------------+
       |
       | Served by
       v
+-----------------+      +----------------------+      +----------------------+
|   Backend       |----->|   Google Sheets API  |----->|  Google Sheets       |
| (Node/Express)  |      |                      |      |                      |
+-----------------+      +----------------------+      +----------------------+
| - Serves static |      | - pub?output=csv     |      | - Business Profiles  |
|   React app     |      |                      |      | - Product Lists      |
| - Health check  |      |                      |      |                      |
+-----------------+      +----------------------+      +----------------------+
```

## Tech Stack

### Frontend

-   **Framework:** [React](https://reactjs.org/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Routing:** [wouter](https://github.com/molefrog/wouter)
-   **Data Fetching:** [TanStack Query](https://tanstack.com/query/v5)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)

### Backend

-   **Framework:** [Express.js](https://expressjs.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Runtime:** [Node.js](https://nodejs.org/)

### Data Source

-   [Google Sheets](https://www.google.com/sheets/about/)

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the development server:**
    The application will be available at `http://localhost:3000`.
    ```bash
    npm run dev
    ```

3.  **Build for production:**
    This command builds both the client and server for production.
    ```bash
    npm run build
    ```

## Deployment

This project is configured for deployment on platforms like Vercel or Replit.

1.  Push your code to a Git repository (e.g., GitHub).
2.  Import your repository into your hosting provider of choice.
3.  The provider should automatically detect the `npm run build` command and deploy the application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
