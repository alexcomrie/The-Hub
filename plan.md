# Plan for Modifying Garden Club App into The Hub

## Overview
This plan outlines the steps to transform the Garden Club app into The Hub while maintaining all existing functionality. The modifications will focus on:
1. Renaming the app
2. Implementing dynamic categories
3. Updating the color scheme

## Step 1: Update App Name

### Files to Modify:

#### settings.tsx
- Change "Garden Club" to "The Hub" in:
  - Page title
  - About section header
  - App description
  - GitHub repository link
- Update description from "local plant nurseries" to "local businesses"

#### garden-list.tsx
- Rename header from "Garden Club" to "The Hub"
- Update navigation paths if necessary

## Step 2: Implement Dynamic Categories

### Files to Modify:

#### garden-plants.tsx
1. Remove hardcoded categories:
```typescript
const categories = ['Flowers', 'Fruit Trees', 'Herbs', 'Others'];
```

2. Replace with dynamic categories from product data:
```typescript
const categories = Array.from(productsMap.keys());
```

3. Remove hardcoded category icons:
```typescript
const categoryIcons: Record<string, string> = {
  'Flowers': '🌸',
  'Fruit Trees': '🌳',
  'Herbs': '🌿',
  'Others': '🌱'
};
```

4. Update category buttons to display without icons:
```typescript
<div className="flex gap-2 mb-6 overflow-x-auto pb-2">
  {categories.map((category) => (
    <Button
      key={category}
      variant={selectedCategory === category ? "default" : "outline"}
      onClick={() => setSelectedCategory(category)}
      className="whitespace-nowrap"
    >
      {category}
    </Button>
  ))}
</div>
```

5. Update initial category selection:
```typescript
const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || '');
```

6. Add error handling for empty categories:
```typescript
if (!productsMap || categories.length === 0) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium mb-2">No products available</h3>
      <p className="text-muted-foreground">Please check back later</p>
    </div>
  );
}
```

## Step 3: Update Color Scheme

### Files to Modify:

#### settings.tsx
- Change green color classes to blue:
  - `bg-green-600` → `bg-blue-600`
  - Update icon background colors

#### garden-plants.tsx
- Update primary color references:
  - `bg-primary` → `bg-blue-600`
  - `text-primary-foreground` → `text-white`

#### garden-profile.tsx
- Update icon colors from green to blue
- Update header background color

#### App.tsx
- Review and update any global color classes

## Verification Steps

1. Profile Management
- Verify Google Sheets integration still works
- Check profile loading and display
- Ensure profile activation status works

2. Product Display
- Verify products load correctly
- Test dynamic category system
- Check product images display properly

3. Cart System
- Test adding products to cart
- Verify cart count display
- Check WhatsApp integration
- Test order message generation

4. UI/UX
- Verify new color scheme consistency
- Check responsive design
- Test navigation flow

## Important Notes

1. Preserve Core Functionality:
- Google Sheets integration
- WhatsApp order processing
- Cart system
- Image display

2. Data Structure:
- No changes to Google Sheets format
- Maintain existing column structure
- Keep product sheet URL in profile sheet

3. Testing:
- Test with various category names
- Verify order flow with new categories
- Check all color updates
- Ensure no regression in functionality