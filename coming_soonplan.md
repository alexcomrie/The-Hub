# Coming Soon Feature Implementation Plan

## Overview
Implement a "coming soon" status for business profiles that allows visibility but restricts functionality, similar to out-of-stock products.

## Current Implementation Status

### Completed Changes
1. Business Service (`business-service.ts`)
   - Updated `parseBusinessesCSV` to include businesses with 'coming_soon' status
   - Modified visibility logic to show both 'active' and 'coming_soon' businesses

2. Business Profile Page (`business-profile.tsx`)
   - Added "Coming Soon" banner for businesses with 'coming_soon' status
   - Disabled product navigation buttons
   - Maintained profile information visibility

3. Product List Page (`product-list.tsx`)
   - Added redirect to business profile for 'coming_soon' businesses
   - Implemented informative message about coming soon status

4. Product Details Page (`product-details.tsx`)
   - Added redirect to business profile for 'coming_soon' businesses
   - Implemented informative message about coming soon status

## Testing Checklist

### Business Profile
- [ ] Verify "Coming Soon" banner displays correctly
- [ ] Confirm product navigation buttons are hidden
- [ ] Check that profile information is visible
- [ ] Test profile image and business details display

### Navigation & Access Control
- [ ] Verify direct URL access to product pages redirects to profile
- [ ] Test that product list page shows coming soon message
- [ ] Confirm product details page shows coming soon message
- [ ] Check that all redirects maintain proper navigation history

### CSV Integration
- [ ] Test parsing of 'coming_soon' status from CSV
- [ ] Verify business visibility in listings
- [ ] Confirm status updates reflect immediately

### UI/UX
- [ ] Check responsive design of coming soon banner
- [ ] Verify consistent messaging across all pages
- [ ] Test accessibility of status indicators
- [ ] Confirm clear user feedback when attempting to access restricted features

## Usage Instructions

1. In the profile sheet:
   - Set business status to "coming soon" in column "M"
   - Ensure all required business information is filled
   - Include profile picture for visibility

2. Business Visibility:
   - Business will appear in listings
   - Profile page will be accessible
   - Products section will be restricted
   - "Coming Soon" status clearly indicated

## Notes
- The implementation maintains existing business functionality while adding the new status
- All changes are non-breaking and backward compatible
- The feature can be easily toggled by changing the status in the profile sheet