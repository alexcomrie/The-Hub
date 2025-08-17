# Overseas Shipping Implementation Plan

## Overview
This plan outlines the implementation of an "Overseas Shipping" delivery option for The Hub web application. The feature will allow businesses to offer international shipping with flexible pricing models.

## Data Structure Changes

### Profile Sheet Additions
Three new columns will be added to the business profile sheet:

1. **Column U: "Overseas Shipping"**
   - Values: "Yes" or "No"
   - Purpose: Determines if overseas shipping is available for a business
   - Behavior: If "No", the overseas shipping option will be disabled and not visible

2. **Column V: "Overseas Shipping Cost Option"**
   - Values: "Flat Rate" or "Per Pound"
   - Purpose: Defines how shipping costs are calculated
   - Behavior:
     - "Flat Rate": A fixed cost added to the total
     - "Per Pound": Cost calculated based on product weight

3. **Column W: "Overseas Shipping Cost"**
   - Purpose: Stores the cost value used for calculations
   - For Flat Rate: The fixed amount to charge
   - For Per Pound: The cost per pound to multiply by weight

### Product Sheet Additions
1. **Column I: "Weight"**
   - Purpose: Stores the weight of each product in kilograms
   - Used for "Per Pound" shipping calculations

## Implementation Steps

### 1. Schema Updates

#### Business Schema Update
Add the following fields to the `BusinessSchema` in `shared/schema.ts`:

```typescript
export const BusinessSchema = z.object({
  // Existing fields...
  hasOverseasShipping: z.boolean().default(false),
  overseasShippingCostOption: z.enum(['Flat Rate', 'Per Pound']).optional(),
  overseasShippingCost: z.number().nullable(),
});
```

#### Product Schema Update
Add the weight field to the `ProductSchema` in `shared/schema.ts`:

```typescript
export const ProductSchema = z.object({
  // Existing fields...
  weight: z.number().optional(), // Weight in kg
});
```

#### Cart Schema Update
Update the `CartSchema` to include the new delivery option:

```typescript
export const CartSchema = z.object({
  // Existing fields...
  deliveryOption: z.enum(['pickup', 'delivery', 'island_wide', 'overseas']),
});
```

### 2. Business Model Update
Update the Business class in the Flutter app to include the new fields:

```dart
class Business {
  // Existing fields...
  final bool hasOverseasShipping;
  final String overseasShippingCostOption; // "Flat Rate" or "Per Pound"
  final double? overseasShippingCost;
  
  Business({
    // Existing parameters...
    this.hasOverseasShipping = false,
    this.overseasShippingCostOption = '',
    this.overseasShippingCost,
  });
  
  factory Business.fromCsv(List<dynamic> row) {
    return Business(
      // Existing fields...
      hasOverseasShipping: row.length > 20 ? row[20].toString().toLowerCase() == 'yes' : false,
      overseasShippingCostOption: row.length > 21 ? row[21].toString() : '',
      overseasShippingCost: row.length > 22 ? double.tryParse(row[22].toString()) : null,
    );
  }
  
  // Update fromJson and toJson methods similarly
}
```

### 3. Product Model Update
Update the Product class to include the weight field:

```dart
class Product {
  // Existing fields...
  final double? weight; // Weight in kg
  
  Product({
    // Existing parameters...
    this.weight,
  });
  
  factory Product.fromCsv(List<dynamic> row) {
    return Product(
      // Existing fields...
      weight: row.length > 8 ? double.tryParse(row[8].toString()) : null,
    );
  }
  
  // Update fromJson and toJson methods similarly
}
```

### 4. Cart Provider Update
Update the CartProvider to handle the new delivery option:

```dart
class CartProvider extends ChangeNotifier {
  // Existing code...
  
  // Calculate shipping cost based on delivery option
  double calculateShippingCost() {
    if (_selectedBusiness == null) return 0.0;
    
    switch (_deliveryOption) {
      case 'delivery':
        return _selectedBusiness!.deliveryCost ?? 0.0;
      case 'island_wide':
        return _selectedBusiness!.islandWideDeliveryCost ?? 0.0;
      case 'overseas':
        if (_selectedBusiness!.hasOverseasShipping) {
          if (_selectedBusiness!.overseasShippingCostOption == 'Flat Rate') {
            return _selectedBusiness!.overseasShippingCost ?? 0.0;
          } else if (_selectedBusiness!.overseasShippingCostOption == 'Per Pound') {
            // Calculate total weight in kg
            double totalWeightKg = 0.0;
            bool missingWeightFound = false;
            List<String> productsWithoutWeight = [];
            
            for (var order in _orders) {
              final product = order['product'] as Product;
              final quantity = order['quantity'] as int;
              if (product.weight != null) {
                totalWeightKg += product.weight! * quantity;
              } else {
                missingWeightFound = true;
                productsWithoutWeight.add(product.name);
              }
            }
            
            // If any product is missing weight information, show an error
            if (missingWeightFound) {
              throw Exception('The following products do not have weight information and must be removed from your cart for overseas shipping: ${productsWithoutWeight.join(", ")}');
            }
            
            // Convert kg to pounds and round up to whole number
            double totalWeightLbs = totalWeightKg * 2.20462;
            int roundedWeightLbs = totalWeightLbs.ceil(); // Round up to nearest whole pound
            
            // Calculate shipping cost
            return roundedWeightLbs * (_selectedBusiness!.overseasShippingCost ?? 0.0);
          }
        }
        return 0.0;
      default:
        return 0.0;
    }
  }
}
```

### 5. Cart Screen Update
Update the CartScreen to display the overseas shipping option when available:

```dart
// In the SegmentedButton widget
SegmentedButton<String>(
  segments: [
    const ButtonSegment(
      value: 'pickup',
      label: Text('Pickup'),
    ),
    if (cart.selectedBusiness?.hasDelivery == true)
      const ButtonSegment(
        value: 'delivery',
        label: Text('Delivery'),
      ),
    if (cart.selectedBusiness?.islandWideDelivery.isNotEmpty == true)
      const ButtonSegment(
        value: 'island_wide',
        label: Text('Island Wide Delivery'),
      ),
    if (cart.selectedBusiness?.hasOverseasShipping == true)
      const ButtonSegment(
        value: 'overseas',
        label: Text('Overseas Shipping'),
      ),
  ],
  selected: {cart.deliveryOption},
  onSelectionChanged: (Set<String> newSelection) {
    _cartProvider.updateCustomerInfo(deliveryOption: newSelection.first);
  },
),
```

### 6. Order Summary Update
Update the _buildOrderSummary method to include overseas shipping costs:

```dart
String _buildOrderSummary() {
  // Existing code...
  
  if (_cartProvider.deliveryOption == 'overseas' && _cartProvider.selectedBusiness?.hasOverseasShipping == true) {
    summary.write('\nOverseas Shipping');
    
    double shippingCost = 0.0;
    if (_cartProvider.selectedBusiness!.overseasShippingCostOption == 'Flat Rate') {
      shippingCost = _cartProvider.selectedBusiness!.overseasShippingCost ?? 0.0;
      summary.write(' (Flat Rate)');
    } else if (_cartProvider.selectedBusiness!.overseasShippingCostOption == 'Per Pound') {
      try {
        // Calculate total weight in kg
        double totalWeightKg = 0.0;
        bool missingWeightFound = false;
        List<String> productsWithoutWeight = [];
        
        for (var order in _cartProvider.orders) {
          final product = order['product'] as Product;
          final quantity = order['quantity'] as int;
          if (product.weight != null) {
            totalWeightKg += product.weight! * quantity;
          } else {
            missingWeightFound = true;
            productsWithoutWeight.add(product.name);
          }
        }
        
        // If any product is missing weight information, show an error
        if (missingWeightFound) {
          throw Exception('The following products do not have weight information and must be removed from your cart for overseas shipping: ${productsWithoutWeight.join(", ")}');
        }
        
        // Convert kg to pounds and round up to whole number
        double totalWeightLbs = totalWeightKg * 2.20462;
        int roundedWeightLbs = totalWeightLbs.ceil();
        
        shippingCost = roundedWeightLbs * (_cartProvider.selectedBusiness!.overseasShippingCost ?? 0.0);
        summary.write(' (Per Pound: $roundedWeightLbs lbs @ \$${_cartProvider.selectedBusiness!.overseasShippingCost!.toStringAsFixed(2)}/lb)');
      } catch (e) {
        // Handle the case where products are missing weight information
        summary.write('\n\nError: ${e.toString()}');
        return summary.toString(); // Return early with the error message
      }
    }
    
    summary.write('\nShipping Cost: \$${shippingCost.toStringAsFixed(2)}');
    totalPrice += shippingCost;
  }
  
  summary.write('\n\nFinal Total: \$${totalPrice.toStringAsFixed(2)}');
  return summary.toString();
}
```

## Implementation Notes Based on Clarification

1. **Switching Between Options**: The code will include the ability to switch between "Flat Rate" and "Per Pound" options, controlled by the value in Column V of the profile sheet.

2. **Weight Limits**: No minimum or maximum weight limits will be implemented at this time.

3. **Weight Validation**: No specific validation will be implemented for weight values.

4. **UI Placement**: The overseas shipping option will appear alongside other delivery options in the same section, not in a separate section.

5. **UI Requirements**: No specific UI requirements beyond standard presentation consistent with other delivery options.

6. **Additional Information**: No additional information about overseas shipping (like estimated delivery times) will be displayed.

7. **Products Without Weight**: If a product doesn't have weight information when using "Per Pound" shipping, the application will inform the user that the item must be removed from the cart.

8. **Product-Specific Disabling**: The option for overseas shipping will be set in code but left disabled until a future update.

9. **Weight Visibility**: The weight of products should not be visible to users; it will only be used for price calculation.

## Implementation Plan

1. Implement the schema changes as outlined above
2. Update the Business and Product models
3. Implement the Cart Provider updates for handling overseas shipping
4. Update the Cart Screen to display the overseas shipping option alongside other delivery options
5. Implement the order summary updates to include overseas shipping costs
6. Add validation to handle products without weight information when using "Per Pound" shipping

With the clarifications received, we can now proceed with implementing the overseas shipping feature according to this plan. The implementation will follow the steps outlined above, incorporating all the specified requirements and design decisions.