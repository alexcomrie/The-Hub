# TheHub Web App - Technical Analysis

## Overview

TheHub is a web application designed to connect small-to-medium businesses, artisans, and skilled individuals with customers in a centralized platform. It serves as an online directory and marketplace that allows businesses to showcase their products and services while enabling customers to browse, discover, and place orders.

## Application Architecture

### Frontend

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: 
  - React Context API for application state (cart)
  - React Query for server state and data fetching
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS
- **Storage**: LocalStorage for cart persistence

### Backend

- **Server**: Minimal Express.js server
- **Primary Function**: Serving the frontend application
- **API Endpoints**: 
  - Health check endpoint
  - Placeholder for potential future expansion
- **Data Source**: Google Sheets (accessed directly from the client)

### Data Flow

1. Client-side application fetches business and product data directly from Google Sheets
2. Data is validated using Zod schemas
3. React Query manages caching and state
4. User interactions update local state (Context API)
5. Cart data is persisted in localStorage

## Core Features

### Category System

- Businesses are organized into predefined categories
- Categories include:
  - Retail Businesses
  - Street & Mobile Vendors
  - Creative Industry & Branding
  - Skilled Trades & Construction
  - Agriculture & Farming
  - Transport & Logistics
  - Repairs & Electronics
  - Service Providers
  - Beauty & Skincare Products
  - Education & Training
  - Social Enterprise & Community Builders
  - Security Services
  - Pharmacy & Health Supplies
  - Private Health & Medical Services
  - Food & Grocery Retailers
  - Travel & Tourism Services
- Each category has an icon and description
- Users can browse businesses by category or view all businesses
- Categories can be sorted alphabetically (A-Z or Z-A)

### Business Profiles

- Each business has a detailed profile with:
  - Basic information (name, owner name)
  - Contact details (phone, WhatsApp, email)
  - Location information (address, map location)
  - Operating hours (regular and special hours)
  - Delivery options and costs
  - Profile picture
  - Bio/description
  - Status indicator (active, coming soon)
  - Profile type (product_sales or product_listing)
- Businesses can be viewed in a list or individually
- Business cards show a preview with key information

### Product Management

- Businesses can list products with:
  - Name and category
  - Price
  - Description
  - Main image and additional images
  - Stock status (in stock or out of stock)
- Products are fetched from Google Sheets
- Products can be viewed in a list or individually with details

### Shopping Cart

- Users can add products to their cart
- Cart is business-specific (switching businesses clears the cart)
- Cart data includes:
  - Products with quantities
  - Customer name
  - Delivery option (pickup, delivery, island-wide)
  - Delivery address
  - Pickup time
- Cart data is persisted in localStorage
- Cart shows item count and total

### User Interface

- Mobile-friendly responsive design
- Image viewer with zoom functionality
- Business cards with status indicators
- Category browsing with sorting options
- Navigation between related screens
- About dialog with application information

## Technical Implementation

### Data Models

#### Business Schema
```typescript
export const BusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerName: z.string(),
  address: z.string(),
  phoneNumber: z.string(),
  whatsAppNumber: z.string(),
  emailAddress: z.string(),
  hasDelivery: z.boolean(),
  deliveryArea: z.string(),
  operationHours: z.string(),
  specialHours: z.string(),
  profilePictureUrl: z.string(),
  productSheetUrl: z.string(),
  status: z.string(),
  bio: z.string(),
  mapLocation: z.string(),
  deliveryCost: z.number().nullable(),
  islandWideDelivery: z.string(),
  islandWideDeliveryCost: z.number().nullable(),
  category: z.string().optional(),
  profileType: z.enum(['product_sales', 'product_listing']).default('product_sales')
});
```

#### Product Schema
```typescript
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  price: z.number(),
  description: z.string(),
  imageUrl: z.string(),
  additionalImageUrls: z.array(z.string()).optional(),
  inStock: z.boolean()
});
```

#### Category Schema
```typescript
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  description: z.string().optional(),
  subcategories: z.array(z.string()).optional()
});
```

#### Cart Schema
```typescript
export const CartSchema = z.object({
  orders: z.array(CartItemSchema),
  customerName: z.string(),
  deliveryOption: z.enum(['pickup', 'delivery', 'island_wide']),
  deliveryAddress: z.string(),
  pickupTime: z.string(),
  selectedBusiness: BusinessSchema.nullable()
});
```

### Key Components

#### Business Card
- Displays business information in a card format
- Shows profile picture, name, owner, and status
- Handles navigation to business profile or products
- Manages cart clearing when switching businesses

#### Image Viewer
- Handles image loading and error states
- Provides zoom functionality
- Supports image refreshing

#### Cart Provider
- Manages cart state using React Context
- Handles adding/removing items
- Persists cart data in localStorage
- Enforces business-specific cart rules

### Routing Structure

- `/` - Category List (home page)
- `/category/:categoryId` - Businesses in a specific category
- `/all-businesses` - List of all businesses
- `/business/:id` - Business profile
- `/business/:id/products` - Products for a specific business
- `/business/:id/product/:productId/:productName` - Product details
- `/cart` - Shopping cart
- `/settings` - Application settings

### Data Fetching

- Business data is fetched from Google Sheets
- Product data is fetched from business-specific Google Sheets
- Data is cached using React Query
- Image URLs are processed to handle direct access

## Progressive Web App Features

- Service worker for offline capabilities
- Manifest for installability
- Mobile-optimized UI
- Local storage for data persistence

## Development and Deployment

### Development Scripts

- `dev`: Runs the development server
- `build`: Builds the production application
- `start`: Starts the production server
- `check`: Type-checks the codebase

### Deployment Options

- Configuration files for Netlify and Vercel
- Support for Replit deployment

## Conclusion

TheHub Web App is a well-structured React application designed to connect businesses with customers. It leverages modern web technologies and a lightweight backend approach, with most functionality handled client-side. The application's focus on categories, business profiles, and product listings creates a comprehensive directory and marketplace for small-to-medium businesses and service providers.

The use of Google Sheets as a data source provides a simple content management solution without requiring a complex backend infrastructure, making it accessible for businesses with limited technical resources.