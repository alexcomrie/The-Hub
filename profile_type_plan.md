# Profile Type Implementation Plan

## Overview
Implement a new profile type system to differentiate between businesses that want to sell products (Product Sales) and those that just want to showcase their products (Product Listing).

## Profile Types

### 1. Product Sales
- Default profile type
- Maintains all current functionality
- Features:
  - Full product catalog
  - Shopping cart functionality
  - Order processing
  - Add to cart buttons visible
  - Cart icon visible in navigation

### 2. Product Listing
- Showcase-only profile type
- Features:
  - Full product catalog display
  - Product details viewable
  - No shopping cart functionality
  - No add to cart buttons
  - Cart icon hidden in navigation

## Implementation Steps

### 1. Data Structure Updates
- Add "Type" column to business profile sheet
  - Valid values: "Product Sales", "Product Listing"
  - Default value: "Product Sales"

### 2. Backend Changes
- Update business schema to include profile type
- Modify business data parsing to handle new type field
- Update API endpoints to include profile type information

### 3. Frontend Updates
#### Business Profile Screen
- Add profile type indicator
- Implement conditional rendering based on profile type

#### Product List Screen
- Conditionally render "Add to Cart" buttons based on profile type
- Adjust product card layout for listing-only view

#### Navigation
- Hide cart icon for "Product Listing" profiles

### 4. Testing Plan
- Verify profile type parsing from spreadsheet
- Test conditional rendering of cart functionality
- Validate navigation changes
- Test profile switching
- Ensure existing functionality works for "Product Sales" type

## Timeline Estimate
- Data structure updates: 1 day
- Backend changes: 2 days
- Frontend updates: 2-3 days
- Testing and refinement: 1-2 days

Total estimated time: 6-8 days