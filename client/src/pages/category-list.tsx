import React, { useState } from 'react';
import { Link } from 'wouter';
import { CategoryCard } from '@/components/category-card';
import { CategoryService } from '@/services/category-service';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info } from 'lucide-react';

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

        <div className="mt-8 flex flex-col items-center space-y-2">
          <a href="https://www.tiktok.com/@jamappz?_t=ZN-8yc6BiyK5uI&_r=1" target="_blank" rel="noopener noreferrer">
            <Button className="w-full max-w-md" variant="outline">
              Follow The Hub on TikTok
            </Button>
          </a>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full max-w-md" variant="outline">
                <Info className="mr-2 h-4 w-4" />
                About The Hub
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>About The Hub</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p>
                  The Hub is an online directory platform designed to connect small‑to‑medium businesses, artisans, and skilled individuals with customers in a centralized, convenient location. Whether you're selling homemade crafts, professional services, or unique goods and talents—this is your space to shine.
                </p>
                <div className="space-y-2">
                  <h3 className="font-semibold">Key features include:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><span className="font-semibold">Business & Individual Profiles:</span> Showcase your contact info, location, hours, and a short bio so customers get to know who you are.</li>
                    <li><span className="font-semibold">Product Catalogs:</span> Display images and details of your products—each product can feature a large image, description, and price.</li>
                    <li><span className="font-semibold">Service Listings:</span> If you offer a service, use your profile to display what you do and highlight your skills with photos and descriptions.</li>
                    <li><span className="font-semibold">Browse or Discover:</span> Users can explore all businesses under categories or view the entire directory of participants.</li>
                    <li><span className="font-semibold">Shopping Cart:</span> Customers can add items from their favourite vendors into their cart. When ready, they can send order directly (Via WhatsApp) to finalize the order.</li>
                  </ul>
                </div>
                <p>
                  The Hub is built to empower anyone—from individual craftspeople and freelancers to small businesses—giving you an accessible, public platform to display your inventory or services, attract customers, and grow your presence online.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}