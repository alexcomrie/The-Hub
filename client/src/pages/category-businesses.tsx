import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useBusinesses } from '@/hooks/use-businesses';
import BusinessCard from '@/components/business-card';
import { CategoryService } from '@/services/category-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function CategoryBusinesses() {
  const [, params] = useRoute('/category/:categoryId');
  const categoryId = params?.categoryId || '';
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: businesses, isLoading, error } = useBusinesses();
  const category = CategoryService.getCategoryById(categoryId);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Error loading businesses: {error.message}
      </div>
    );
  }
  
  if (!businesses) {
    return (
      <div className="text-center p-4">
        No businesses found
      </div>
    );
  }
  
  // Filter businesses by category
  const filteredBusinesses = CategoryService.filterBusinessesByCategory(businesses, categoryId);
  
  // Further filter by search query if provided
  const searchFilteredBusinesses = searchQuery
    ? filteredBusinesses.filter(business =>
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.bio.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredBusinesses;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {category ? category.name : 'Category Not Found'}
          </h1>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                Back to Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <p className="text-gray-500">
              {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
            </p>
          </div>
          
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </div>
      
      {searchFilteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchFilteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No businesses found in this category{searchQuery ? ' matching your search' : ''}.</p>
          <Link href="/all-businesses">
            <Button variant="link" className="mt-2">
              View all businesses
            </Button>
          </Link>
        </div>
      )}
      </div>
    </div>
  );
}