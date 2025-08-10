# Profile Type Implementation Plan

## Overview
Implement three distinct profile types with different functionalities:
1. Product Sales (default)
2. Product Listing (showcase only)
3. Job Listing (recruitment)

## Requirements

### 1. Job Listing Data
- Reuse product sheet with different column mappings:
  - Column A: Business Name
  - Column B: Invite Message
  - Column C: Position & Salary
  - Column D: Job Purpose & Responsibility
  - Column E: Qualification & Experience
  - Column F: Additional Information
  - Column G: Instructions to Apply
  - Column H: Address (optional)
  - Column I: Email (optional)
  - Column J: Contact Number (optional)
  - Column K: Business Logo/Image
- Job listing profiles indicate that users can view job postings from different businesses
- No categories for job listings

### 2. Product Listing
- Show prices in product listing profiles
- Maintain product categories
- Additional display fields/changes needed (to be specified in implementation)

### 3. Profile Type Changes
- Allow switching between Product Sales and Product Listing only
- Switching between these types only deactivates/activates the ordering system
- Job Listing requires creating a new profile
- No data migration needed for type switches

## Implementation Plan

### 1. Database/Sheet Updates
- Add "Type" column to business profiles sheet with values:
  - "product_sales"
  - "product_listing"
  - "job_listing"
- Update product sheet to accommodate job listing fields
- Implement validation for different profile types

### 2. Business Service Updates
- Modify business service to:
  - Include profile type in business data
  - Handle different data structures based on profile type
  - Add type-specific data validation
  - Update data fetching logic for job listings
  - Implement profile type switching logic (Product Sales ↔ Product Listing)

### 3. UI Component Updates

#### Business Profile Screen
- Modify based on profile type:
  - Product Sales: Keep current functionality
  - Product Listing: 
    - Maintain current display but hide cart-related elements
    - Keep prices visible
    - Maintain categories
  - Job Listing: 
    - Adapt layout for job information
    - Display job-specific fields
    - Remove product-related elements

#### Product/Job List Screen
- Create conditional rendering based on profile type:
  - Product Sales: Current product list with cart
  - Product Listing: 
    - Product showcase without cart
    - Maintain prices and categories
  - Job Listing: 
    - Job postings list with adapted fields
    - Custom layout for job information

#### Details Screen
- Implement type-specific detail views:
  - Product Sales: Current product details with cart
  - Product Listing: 
    - Product showcase details
    - Hide cart/ordering elements
    - Maintain price display
  - Job Listing: 
    - Comprehensive job posting details
    - Contact information section
    - Application instructions

### 4. Cart System Updates
- Add profile type check in cart provider
- Conditionally render cart UI based on profile type
- Disable cart functionality for Product Listing and Job Listing profiles

### 5. Navigation Updates
- Update navigation based on profile type:
  - Product Sales: No changes
  - Product Listing: Hide cart-related navigation
  - Job Listing: 
    - Change "View Product" to "View Job Listing"
    - Update breadcrumbs and navigation text

### 6. Testing Plan
1. Profile Type Switching:
   - Test switching between Product Sales and Product Listing
   - Verify cart functionality enables/disables correctly
   - Check UI element visibility changes

2. Job Listing Features:
   - Test job data display format
   - Verify all job-specific fields render correctly
   - Test optional contact information handling

3. Product Listing Features:
   - Verify cart removal while maintaining prices
   - Test product showcase display
   - Verify category functionality

4. Integration Testing:
   - Test navigation between different profile types
   - Verify data consistency
   - Check error handling

### 7. Future Considerations
- Enhanced job search functionality
- Job application tracking system
- Profile type analytics
- Type-specific SEO optimization
- Additional product listing display options

## Dependencies
- Google Sheet structure updates
- UI component library
- Business service modifications
- Navigation system updates

## Timeline Estimate
1. Database/Sheet Updates: 1 day
2. Business Service Updates: 2-3 days
3. UI Component Updates: 3-4 days
4. Testing and Bug Fixes: 2-3 days
5. Documentation and Deployment: 1 day

Total Estimated Time: 9-12 days