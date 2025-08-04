# Implementation Plan for Category Feature in The Hub App

## Overview
This plan outlines the steps to implement a new category feature in The Hub app, allowing users to browse businesses by category. The implementation will add a new Category Screen as the app's entry point, displaying main categories as cards. When a user selects a category, they will be directed to the Business List Screen showing only businesses in that category.

## Requirements
1. Add a "Category" column to the Profile sheet to identify which business categories each entry belongs to
2. Create a new Category Screen as the app's entry point
3. Update the routing to include the Category Screen
4. Implement filtering on the Business List Screen by category
5. Ensure all existing functionality remains intact

## Data Structure Changes

### 1. Schema Update
Update the `BusinessSchema` in `shared/schema.ts` to include a category field:

```typescript
export const BusinessSchema = z.object({
  // Existing fields...
  category: z.string().optional(), // New field for category
});
```

### 2. CSV Parsing Update
Update the `businessFromCsv` function in `business-service.ts` to parse the new category column:

```typescript
function businessFromCsv(row: string[]): Business {
  // Existing code...
  return {
    // Existing fields...
    category: row.length > 18 ? row[18] || '' : '', // New category field
  };
}
```

## Component Implementation

### 1. Create Category Model
Create a new model to represent categories:

```typescript
// shared/schema.ts
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(), // SVG icon path
  description: z.string().optional(),
  subcategories: z.array(z.string()).optional()
});

export type Category = z.infer<typeof CategorySchema>;
```

### 2. Create Category Service
Create a service to manage categories:

```typescript
// services/category-service.ts
import { Category } from "@shared/schema";

const CATEGORIES: Category[] = [
  {
    id: "retail",
    name: "Retail Businesses",
    icon: "/icons/retail.svg", // Custom SVG icon path
    description: "Brick-and-mortar shops, structured home-based stores, and micro-retailers"
  },
  // Add all other categories from category.md
];

export const CategoryService = {
  getCategories: () => CATEGORIES,
  getCategoryById: (id: string) => CATEGORIES.find(cat => cat.id === id),
  getActiveCategories: (businessCategories: string[]) => {
    // Return only categories that are assigned to at least one business
    return CATEGORIES.filter(category => 
      businessCategories.some(bc => bc.includes(category.name))
    );
  },
  // Add sorting function for categories
  sortCategories: (categories: Category[], sortBy: 'name' | 'id' = 'name') => {
    return [...categories].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return a.id.localeCompare(b.id);
    });
  }
};
```

### 3. Create SVG Icons for Categories
Create SVG icons for each category in the public directory:

```typescript
// Example SVG icon for Retail category
// public/icons/retail.svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  <polyline points="9 22 9 12 15 12 15 22"></polyline>
</svg>
```

### 4. Create Category Screen Component
Create a new component for the Category Screen:

```typescript
// pages/category-list.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBusinesses } from "@/hooks/use-businesses";
import { CategoryService } from "@/services/category-service";
import { ShoppingCart, Settings } from "lucide-react";
import { useCart } from "@/providers/cart-provider";

export default function CategoryList() {
  const [, setLocation] = useLocation();
  const { data: businesses, isLoading, error } = useBusinesses();
  const { itemCount } = useCart();
  const [sortBy, setSortBy] = useState<'name' | 'id'>('name');
  
  // Get all unique categories from businesses
  const businessCategories = businesses
    ? [...new Set(businesses.map(b => b.category).filter(Boolean))]
    : [];
  
  // Get only active categories
  const activeCategories = CategoryService.getActiveCategories(businessCategories);
  
  // Sort categories
  const sortedCategories = CategoryService.sortCategories(activeCategories, sortBy);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setLocation(`/category/${categoryId}`);
  };
  
  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load categories</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">The Hub</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/cart')}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {itemCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/settings')}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Browse by Category</h2>
          <Button variant="outline" onClick={() => setLocation('/all-businesses')}>
            View All Businesses
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="flex gap-2">
            <Button 
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('name')}
            >
              Sort by Name
            </Button>
            <Button 
              variant={sortBy === 'id' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('id')}
            >
              Sort by Default
            </Button>
          </div>
        </div>
        
        {sortedCategories.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No categories available</h3>
            <p className="text-muted-foreground">Please check back later</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCategories.map((category) => (
              <Card 
                key={category.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src={category.icon} 
                      alt={category.name} 
                      className="w-10 h-10 text-primary"
                    />
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5. Create Category-Filtered Business List Component
Create a component to display businesses filtered by category:

```typescript
// pages/category-businesses.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, ShoppingCart, Settings } from "lucide-react";
import { useBusinesses } from "@/hooks/use-businesses";
import { useCart } from "@/providers/cart-provider";
import BusinessCard from "@/components/business-card";
import { CategoryService } from "@/services/category-service";

interface CategoryBusinessesProps {
  params: { categoryId: string };
}

export default function CategoryBusinesses({ params }: CategoryBusinessesProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: businesses, isLoading, error } = useBusinesses();
  const { itemCount } = useCart();
  
  const category = CategoryService.getCategoryById(params.categoryId);
  
  // Filter businesses by category and search query
  const filteredBusinesses = businesses
    ? businesses.filter(business => 
        business.category?.includes(category?.name || '') &&
        (searchQuery === "" || 
         business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         business.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         business.address.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];
  
  // Loading and error states (similar to business-list.tsx)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load businesses</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{category?.name || 'Category'}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/cart')}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {itemCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/settings')}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Business List */}
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'No businesses found' : `No businesses in ${category?.name || 'this category'}`}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search terms' : 'Please check back later'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 6. Update App Routing
Update the routing in `App.tsx` to include the new Category Screen:

```typescript
function Router() {
  return (
    <Switch>
      <Route path="/" component={CategoryList} />
      <Route path="/category/:categoryId" component={CategoryBusinesses} />
      <Route path="/all-businesses" component={BusinessList} />
      <Route path="/business/:id" component={BusinessProfile} />
      <Route path="/business/:id/products" component={ProductList} />
      <Route path="/business/:id/product/:productName" component={ProductDetails} />
      <Route path="/cart" component={Cart} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

### 7. Update Business List Component
Update the Business List component to include a link to view all categories:

```typescript
// In business-list.tsx
<div className="p-4">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-semibold">All Businesses</h2>
    <Button variant="outline" onClick={() => setLocation('/')}>
      View Categories
    </Button>
  </div>
  
  {/* Rest of the component */}
</div>
```

## Testing Plan

1. Verify that the Category Screen displays correctly as the app's entry point
2. Verify that only categories assigned to businesses appear in the Category Screen
3. Verify that clicking a category shows only businesses in that category
4. Verify that the search functionality works within a category
5. Verify that all existing functionality (business profiles, products, cart) works correctly
6. Test sorting functionality for categories

## Implementation Steps

1. Update the `BusinessSchema` in `shared/schema.ts`
2. Create the `CategorySchema` in `shared/schema.ts`
3. Update the `businessFromCsv` function in `business-service.ts`
4. Create SVG icons for each category in the public directory
5. Create the `category-service.ts` file
6. Create the `category-list.tsx` component
7. Create the `category-businesses.tsx` component
8. Update the routing in `App.tsx`
9. Update the `business-list.tsx` component
10. Test all functionality

## Potential Challenges

1. Ensuring backward compatibility with existing data
2. Handling businesses with multiple categories (comma-separated)
3. Ensuring proper filtering and search functionality
4. Maintaining performance with additional data processing
5. Creating appropriate SVG icons for all categories