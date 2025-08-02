# Prompt for Trae.ai to Rename All Relevant Files in "The Hub" App

You are tasked with renaming files in the "The Hub" web app, located in the "The Hub" folder, to align with its new purpose as a platform for various local businesses, avoiding confusion with its original "Garden Club" theme. The app is built with React and TypeScript, using .tsx and .ts files, and enables sellers to display products and process orders via WhatsApp using two Google Sheets for data management. Your goal is to rename all files containing "Garden" or "plant" (case-insensitive) to use "Business" or "product" terms, update all references to these files (e.g., in import statements and navigation routes), and preserve all functionality. Trae.ai will open the "The Hub" folder to make these changes.

## Objectives
1. **Rename Files**: Identify and rename all files in the `src` directory (and subdirectories) containing "Garden" or "plant" in their names to use "Business" or "product."
2. **Update References**: Modify all import statements, navigation routes, and other references to reflect the new file names.
3. **Preserve Functionality**: Ensure no changes are made to the app’s functionality, including profile management, product listing, cart system, and WhatsApp integration.

## Step-by-Step Plan

### 1. Identify and Rename Files
Search the `src` directory and its subdirectories (e.g., `src/pages`, `src/components`, `src/hooks`, `src/utils`) for files with "Garden" or "plant" (case-insensitive) in their names. Rename these files to replace "Garden" with "Business" and "plant" with "product," maintaining the same case (e.g., `garden-profile.tsx` becomes `business-profile.tsx`, `PlantDetails.tsx` becomes `ProductDetails.tsx`).

#### Known Files to Rename
Based on the provided context, rename the following files in `src/pages/`:
- `GardenList.tsx` → `BusinessList.tsx`
- `garden-profile.tsx` → `business-profile.tsx`
- `garden-plants.tsx` → `business-products.tsx`
- `plant-details.tsx` → `product-details.tsx`

#### Additional Files to Check
- Search for other files in `src` (e.g., in `src/components`, `src/hooks`, `src/utils`, or other subdirectories) with "Garden" or "plant" in their names. Examples might include:
  - `GardenUtils.ts` → `BusinessUtils.ts`
  - `PlantCard.tsx` → `ProductCard.tsx`
  - `garden-constants.ts` → `business-constants.ts`
  - `PlantTypes.ts` → `ProductTypes.ts`
- For each identified file:
  - Rename by replacing "Garden" with "Business" and "plant" with "product" (case-sensitive to match original).
  - Ensure the file extension (.tsx or .ts) remains unchanged.
- **Note**: The files `App.tsx`, `cart.tsx`, `settings.tsx`, `business-service.ts`, `cart-provider.tsx`, and `order-screen.tsx` do not require renaming, as their names are generic or unrelated to the "Garden" theme. However, they may contain references to renamed files that need updating.

### 2. Update References to Renamed Files
Update all import statements, navigation routes, and other references to reflect the new file names across the codebase.

#### Update `App.tsx`
- **File**: `App.tsx`
- **Changes**:
  - Locate imports for known renamed files:
    ```tsx
    import GardenList from "@/pages/garden-list";
    import GardenProfile from "@/pages/garden-profile";
    import GardenPlants from "@/pages/garden-plants";
    import PlantDetails from "@/pages/plant-details";
    ```
  - Replace with:
    ```tsx
    import BusinessList from "@/pages/business-list";
    import BusinessProfile from "@/pages/business-profile";
    import BusinessProducts from "@/pages/business-products";
    import ProductDetails from "@/pages/product-details";
    ```
  - Update routes in the `Router` function:
    - Locate:
      ```tsx
      <Route path="/" component={GardenList} />
      <Route path="/garden/:id/profile" component={GardenProfile} />
      <Route path="/garden/:id/plants" component={GardenPlants} />
      <Route path="/garden/:id/plant/:plantName" component={PlantDetails} />
      ```
    - Replace with:
      ```tsx
      <Route path="/" component={BusinessList} />
      <Route path="/business/:id/profile" component={BusinessProfile} />
      <Route path="/business/:id/products" component={BusinessProducts} />
      <Route path="/business/:id/product/:productName" component={ProductDetails} />
      ```
- **Purpose**: Updates the main routing configuration to use the new component names and URL paths, aligning with the business context.

#### Update `BusinessList.tsx` (formerly `GardenList.tsx`)
- **File**: `BusinessList.tsx`
- **Change**:
  - Locate navigation to the list page, e.g., `setLocation('/garden-list')` (if present, typically in a back or settings button).
  - Replace with: `setLocation('/business-list')`
  - **Note**: In the provided `GardenList.tsx`, the settings button uses `setLocation('/settings')`, which remains unchanged. Verify if any other navigation uses `/garden-list`.
- **Purpose**: Ensures navigation reflects the renamed list page.

#### Update `business-profile.tsx` (formerly `garden-profile.tsx`)
- **File**: `business-profile.tsx`
- **Changes**:
  - Locate: `onClick={() => setLocation('/garden/${business.id}/plants')}` (in the "View Plants" or similar button)
  - Replace with: `onClick={() => setLocation('/business/${business.id}/products')}`
  - Locate: `onClick={() => setLocation('/garden/${business.id}/plants')}` (in the Info button, if present)
  - Replace with: `onClick={() => setLocation('/business/${business.id}/products')}`
- **Purpose**: Updates navigation to the renamed products page.

#### Update `business-products.tsx` (formerly `garden-plants.tsx`)
- **File**: `business-products.tsx`
- **Change**:
  - Locate: `onClick={() => setLocation('/garden/${business.id}/profile')}` (in the Info or similar button)
  - Replace with: `onClick={() => setLocation('/business/${business.id}/profile')}`
- **Purpose**: Updates navigation to the renamed profile page.

#### Update `product-details.tsx` (formerly `plant-details.tsx`)
- **File**: `product-details.tsx`
- **Change**:
  - Locate: `<Link href="/restaurant/${restaurant.id}/menu">` or similar navigation
  - Replace with: `<Link href="/business/${restaurant.id}/products">`
  - **Note**: The use of `restaurant` as a variable name is likely a leftover from a previous app. For consistency, consider renaming `restaurant` to `business` (e.g., in route parameters or variables), but this is optional to preserve functionality.
- **Purpose**: Updates navigation to the renamed products page.

#### Update `order-screen.tsx`
- **File**: `order-screen.tsx`
- **Changes**:
  - Locate: `<Link href="/restaurant/${restaurant.id}/menu">`
  - Replace with: `<Link href="/business/${restaurant.id}/products">`
  - Locate: `window.location.href = '/restaurant/${restaurant.id}/menu';` (in `onOrderComplete` or similar)
  - Replace with: `window.location.href = '/business/${restaurant.id}/products';`
  - **Note**: Rename `restaurant` to `business` in variables for clarity if desired, but not required.
- **Purpose**: Updates navigation to the renamed products page.

#### Update Other Files
- **Files to Check**: `cart.tsx`, `settings.tsx`, `business-service.ts`, `cart-provider.tsx`, and any additional files in `src` (e.g., `src/components`, `src/hooks`, `src/utils`).
- **Action**:
  - Search for imports of renamed files, e.g., `import { something } from '@/pages/garden-list'` or `import { something } from '@/components/garden-utils'`.
  - Update to new file names, e.g., `import { something } from '@/pages/business-list'` or `import { something } from '@/components/business-utils'`.
  - Search for navigation references, e.g., `/garden/` or `/plant/` in `setLocation`, `Link`, or `window.location` assignments.
  - Replace with `/business/` or `/product/`, e.g., `/garden/:id/plants` → `/business/:id/products`.
- **Purpose**: Ensures all references to renamed files are updated, maintaining app functionality.

#### Handle Additional Renamed Files
- For any additional files identified (e.g., `GardenUtils.ts`, `PlantCard.tsx`):
  - Update imports in all files that reference them. For example:
    - `import { someFunction } from '@/utils/garden-utils'` → `import { someFunction } from '@/utils/business-utils'`
    - `import PlantCard from '@/components/plant-card'` → `import ProductCard from '@/components/product-card'`
  - Check for navigation or logic references to the old file names and update accordingly.
- **Purpose**: Ensures consistency across the codebase for any additional renamed files.

### 3. Preserve Existing Functionality
- **Requirement**: The app’s core features must remain unchanged:
  - **Profile Management**: Uses a hardcoded Google Sheet URL for business profiles.
  - **Product Listing**: Fetches products from the product sheet URL in the profile sheet.
  - **Cart System**: Supports adding products to a cart and sending orders via WhatsApp.
  - **WhatsApp Integration**: Generates order details without modification.
- **Action**: Only rename files and update references as specified. Do not modify logic in `business-service.ts`, `cart.tsx`, `cart-provider.tsx`, or other files unless related to imports or navigation routes.
- **Verification**: Test the app to ensure:
  - Profiles load from the Google Sheet.
  - Products display correctly.
  - Cart and WhatsApp functionality work as before.
  - Navigation routes (e.g., `/business/:id/products`) function correctly.

### Additional Notes
- **File System**: Ensure renamed files are updated in the file system (e.g., `src/pages/garden-list.tsx` → `src/pages/business-list.tsx`).
- **Search Strategy**: Use a case-insensitive search for "Garden" and "plant" in file names across `src` to catch all variations (e.g., `Garden`, `garden`, `Plant`, `plant`).
- **Variable Names**: The use of `restaurant` in `product-details.tsx` and `order-screen.tsx` is inconsistent. Renaming to `business` is optional but recommended for clarity, without altering functionality.
- **Testing**: After renaming, test all routes, imports, and navigation to confirm no broken links or missing components.
- **Scope**: This prompt focuses only on file renaming and reference updates, as requested.

### Table of Changes
| **File**                     | **Current Name/Content**                                                   | **New Name/Content**                                                       | **Purpose**                                                                 |
|------------------------------|---------------------------------------------------------------------------|---------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| **File Renames**             | `GardenList.tsx`                                                          | `BusinessList.tsx`                                                        | Aligns with business context.                                               |
|                              | `garden-profile.tsx`                                                      | `business-profile.tsx`                                                    | Aligns with business context.                                               |
|                              | `garden-plants.tsx`                                                       | `business-products.tsx`                                                   | Aligns with business context.                                               |
|                              | `plant-details.tsx`                                                       | `product-details.tsx`                                                     | Aligns with business context.                                               |
|                              | `GardenUtils.ts` (if exists)                                              | `BusinessUtils.ts`                                                        | Aligns with business context.                                               |
|                              | `PlantCard.tsx` (if exists)                                               | `ProductCard.tsx`                                                         | Aligns with business context.                                               |
| **App.tsx**                  | `import GardenList from "@/pages/garden-list";` etc.                      | `import BusinessList from "@/pages/business-list";` etc.                  | Updates imports for renamed files.                                          |
|                              | `/garden/:id/profile` etc.                                                | `/business/:id/profile` etc.                                              | Updates routes for renamed files.                                           |
| **BusinessList.tsx**         | `setLocation('/garden-list')` (if present)                                | `setLocation('/business-list')`                                           | Updates navigation to list page.                                            |
| **business-profile.tsx**     | `setLocation('/garden/${business.id}/plants')`                            | `setLocation('/business/${business.id}/products')`                        | Updates navigation to products page.                                        |
| **business-products.tsx**    | `setLocation('/garden/${business.id}/profile')`                           | `setLocation('/business/${business.id}/profile')`                         | Updates navigation to profile page.                                         |
| **product-details.tsx**      | `<Link href="/restaurant/${restaurant.id}/menu">`                         | `<Link href="/business/${restaurant.id}/products">`                      | Updates navigation to products page.                                        |
| **order-screen.tsx**         | `<Link href="/restaurant/${restaurant.id}/menu">`                         | `<Link href="/business/${restaurant.id}/products">`                      | Updates navigation to products page.                                        |
|                              | `window.location.href = '/restaurant/${restaurant.id}/menu';`             | `window.location.href = '/business/${restaurant.id}/products';`           | Updates navigation in order completion.                                     |
| **Other Files**              | `import { something } from '@/components/garden-utils'` (example)         | `import { something } from '@/components/business-utils'`                 | Updates imports for additional renamed files.                               |

### Conclusion
By following this plan, you will rename all files containing "Garden" or "plant" in the "The Hub" app, update all references, and ensure no functionality is altered. The changes align the file names with the new business-focused context, improving clarity. After implementing the changes, test the app thoroughly to confirm that profiles, products, cart, navigation routes, and all features work as expected.