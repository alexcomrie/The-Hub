import React, { useState } from 'react';
import { Link } from 'wouter';
import { CategoryCard } from '@/components/category-card';
import { CategoryService } from '@/services/category-service';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CategoryList() {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const categories = CategoryService.sortCategoriesByName(
    CategoryService.getCategories(),
    sortDirection
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">The Hub</h1>
          <div className="flex items-center gap-2">
            <Link href="/all-businesses">
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                View All Businesses
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Browse by Category</h2>
          <div className="flex items-center space-x-2">
            <Select
              value={sortDirection}
              onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A-Z</SelectItem>
                <SelectItem value="desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/all-businesses">
            <Button className="w-full max-w-md" variant="outline">
              View All Businesses
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}