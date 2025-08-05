import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, ShoppingCart, Plus, Package } from "lucide-react";
import { useBusiness, useBusinessProducts, useRefreshBusinesses } from "@/hooks/use-businesses";
import { useCart } from "@/providers/cart-provider";
import { Product } from "@shared/schema";
import ImageViewer from "@/components/image-viewer";

interface ProductListProps {
  params: { id: string };
}

export default function ProductList({ params }: ProductListProps) {
  const [, setLocation] = useLocation();
  const { data: business, isLoading: isLoadingBusiness } = useBusiness(params.id);
  const { data: productsMap, isLoading: isLoadingProducts, refetch } = useBusinessProducts(params.id);
  const { itemCount, addToCart } = useCart();
  const refreshBusinesses = useRefreshBusinesses();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Get unique categories from products
  const categories = productsMap ? Array.from(productsMap.keys()) : [];

  const getCategoryIcon = () => {
    return <Package className="h-4 w-4 mr-2" />;
  };

  const handleRefresh = async () => {
    await refreshBusinesses();
    refetch();
    setLastRefreshTime(Date.now());
  };



  if (isLoadingBusiness || isLoadingProducts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business || !productsMap) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Business not found</h2>
          <Button onClick={() => setLocation('/')}>
            Back to Businesses
          </Button>
        </div>
      </div>
    );
  }

  const filteredProducts = selectedCategory
    ? (productsMap.get(selectedCategory) || [])
    : Array.from(productsMap.values()).flat();

  const searchedProducts = searchQuery.trim()
    ? filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation(`/business/${business.id}`)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/all-businesses')}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Home className="h-5 w-5" />
              </Button>
            </div>
            <h1 className="text-xl font-semibold">{business.name}</h1>
          </div>
          
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
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto pb-2 mb-4 gap-2 hide-scrollbar">
          <Button
            variant={selectedCategory === null ? "secondary" : "ghost"}
            onClick={() => setSelectedCategory(null)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            All Products
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              onClick={() => setSelectedCategory(category)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <div className="flex items-center">
                {getCategoryIcon()}
                {category}
              </div>
            </Button>
          ))}
        </div>

        {/* Search Products */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-primary-foreground/10 text-black placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {searchedProducts.map((product: Product) => (
            <div
              key={`${product.name}-${product.category}`}
              className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              onClick={() => setLocation(`/business/${business.id}/product/${encodeURIComponent(product.name)}`)}
            >
              {product.imageUrl && (
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <ImageViewer
                    imageUrl={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    refreshKey={lastRefreshTime}
                    onError={() => console.error('Failed to load product image:', product.name, product.imageUrl)}
                  />
                </div>
              )}
              <div className="p-3">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  {getCategoryIcon()}
                  <span>{product.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <Badge
                    variant={product.inStock ? "default" : "secondary"}
                    className={product.inStock ? "bg-green-100 text-green-800" : ""}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <Button
        className="fixed bottom-4 right-4 shadow-lg"
        onClick={handleRefresh}
      >
        Refresh Products
      </Button>

      {/* Full Screen Image Viewer */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
          <ImageViewer
            imageUrl={selectedImage}
            className="max-w-[90vw] max-h-[90vh]"
            enableZoom
          />
        </div>
      )}
    </div>
  );
}