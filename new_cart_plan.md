# Cart Enhancement Implementation Plan

## Clarifying Questions

## Requirements (Based on Clarifying Questions)

1. Quantity Selection:
   - No minimum/maximum quantity limit
   - Show total price in the quantity selector popup
   - Only whole numbers allowed (no decimal quantities)

2. Cart Updates:
   - Minimum quantity is 0 (item will be removed)
   - Show confirmation when removing item by reducing quantity to 0
   - Show real-time subtotal updates as quantities change

3. Toast Notifications:
   - Message: "Item added to cart"
   - Visibility duration: 1.5 seconds
   - Use different messages for new items vs quantity updates

## Implementation Plan

### 1. Quantity Selector Component
- Create a new `QuantitySelector` component
  - Input field for whole numbers only
  - Plus/minus buttons for incremental changes
  - Confirm and Cancel buttons
  - Show total price for selected quantity
  - No minimum/maximum limits
  - Prevent decimal input

### 2. Cart Provider Updates
- Modify `cart-provider.tsx` to:
  - Update addToCart function to handle quantity merging
  - Add updateQuantity function for in-cart modifications
  - Add removeItem function when quantity reaches 0
  - Maintain single instance of items with quantity tracking

### 3. Product Details Updates
- Modify `product-details.tsx` to:
  - Show quantity selector popup on "Add to Cart" click
  - Update handleAddToCart to use new quantity parameter
  - Add toast notification (1.5s duration)
    - New items: "Item added to cart"
    - Updated items: "Cart updated"
  - Show loading state during cart updates

### 4. Shopping Cart Updates
- Modify `cart.tsx` to:
  - Add quantity controls for each cart item
  - Update price calculations to reflect quantity changes
  - Show real-time subtotal updates
  - Show confirmation dialog when quantity reduced to 0
  - Remove item when confirmed at quantity 0
  - Improve visual feedback for quantity changes

### 5. UI Components
- Create/update necessary UI components:
  - Quantity selector popup dialog
  - Toast notification component
  - Cart item quantity controls
  - Loading indicators

### 6. Testing Plan
1. Quantity Selection:
   - Test minimum/maximum limits
   - Test decimal vs whole number validation
   - Test price calculation accuracy

2. Cart Management:
   - Test adding new items with quantities
   - Test updating existing item quantities
   - Test merging same items
   - Test removing items via quantity reduction

3. UI/UX Testing:
   - Test toast notifications
   - Test loading states
   - Test responsive design
   - Test keyboard accessibility

### 7. Future Considerations
- Performance optimization for large carts
- Accessibility improvements
- Offline support
- Analytics tracking for cart interactions

## Dependencies
- Existing UI components library
- Toast notification system
- Cart state management
- Product data management

## Timeline Estimate
1. Component Development: 2-3 days
2. Cart Logic Updates: 1-2 days
3. Testing and Bug Fixes: 1-2 days
4. UI Polish and Refinements: 1 day

Total Estimated Time: 5-8 days