import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, ShoppingCart, Settings, Grid, Info } from "lucide-react";
import { useBusinesses, useRefreshBusinesses } from "@/hooks/use-businesses";
import { useCart } from "@/providers/cart-provider";
import BusinessCard from "@/components/business-card";

export default function BusinessList() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: businesses, isLoading, error } = useBusinesses();
  const refreshBusinesses = useRefreshBusinesses();
  const { itemCount } = useCart();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  const filteredBusinesses = businesses?.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.address.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBusinesses();
      setLastRefreshTime(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load businesses</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
          <Button onClick={handleRefresh}>
            Try Again
          </Button>
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
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              View Categories
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Business List */}
        {!isLoading && (
          <>
            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'No businesses found' : 'No businesses available'}
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
                    onRefresh={handleRefresh}
                    lastRefreshTime={lastRefreshTime}
                    isRefreshing={isRefreshing}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Social and About Buttons */}
      <div className="p-4 flex flex-col items-center space-y-2">
        <a href="https://www.tiktok.com/@the_hub_ja?_t=ZN-8z4xvGMZONS&_r=1" target="_blank" rel="noopener noreferrer">
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
                  <li><span className="font-semibold">Shopping Cart:</span> Customers can add multiple items from different vendors into one cart. When ready, they can contact each business directly (via phone, WhatsApp, or email) to finalize the order.</li>
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
  );
}