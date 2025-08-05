import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, ShoppingCart } from "lucide-react";
import { useBusiness, useBusinessProducts } from "@/hooks/use-businesses";
import { useCart } from "@/providers/cart-provider";
import { Product } from "@shared/schema";
import ImageViewer from "@/components/image-viewer";

interface ProductDetailsProps {
  params: { id: string; productName: string };
}

export default function ProductDetails({ params }: ProductDetailsProps) {
  const [, setLocation] = useLocation();
  const { data: business, isLoading: isLoadingBusiness } = useBusiness(params.id);
  const { data: productsMap, isLoading: isLoadingProducts } = useBusinessProducts(params.id);
  const { itemCount, addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Find the product
  const product = productsMap
    ? Array.from(productsMap.values())
        .flat()
        .find((p) => p.name === decodeURIComponent(params.productName))
    : undefined;

  if (isLoadingBusiness || isLoadingProducts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Button onClick={() => setLocation('/')}>
            Back to Businesses
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, business, 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation(`/business/${business.id}/products`)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/')}
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
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {/* Product Image */}
            {(product.imageUrl || (product.additionalImageUrls && product.additionalImageUrls.length > 0)) && (
              <div className="mb-6">
                <div 
                  className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 cursor-pointer" 
                  onClick={() => setSelectedImage(product.imageUrl)}
                >
                  <ImageViewer
                    imageUrl={product.imageUrl}
                    additionalImageUrls={product.additionalImageUrls}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    enableZoom
                    onError={() => console.error('Failed to load product image:', product.name, product.imageUrl)}
                    onImageChange={(index) => {
                      const images = [product.imageUrl, ...(product.additionalImageUrls || [])];
                      setSelectedImage(images[index]);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                <Badge 
                  variant={product.inStock ? "default" : "secondary"}
                  className={product.inStock ? "bg-green-100 text-green-800" : ""}
                >
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Price</h3>
                <p className="text-2xl font-bold text-green-600">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Category</h3>
                <p className="text-gray-600">{product.category}</p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
                additionalImageUrls={product.additionalImageUrls}
                className="max-w-[90vw] max-h-[90vh]"
                enableZoom
                onImageChange={(index) => {
                  const images = [product.imageUrl, ...(product.additionalImageUrls || [])];
                  setSelectedImage(images[index]);
                }}
              />
        </div>
      )}
    </div>
  );
}