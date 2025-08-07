import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, MapPin, Phone, Mail, Clock, Truck, Info, ShoppingCart } from "lucide-react";
import { useBusiness } from "@/hooks/use-businesses";
import { useCart } from "@/providers/cart-provider";
import ImageViewer from "@/components/image-viewer";

interface BusinessProfileProps {
  params: { id: string };
}

export default function BusinessProfile({ params }: BusinessProfileProps) {
  const [, setLocation] = useLocation();
  const { data: business, isLoading } = useBusiness(params.id);
  const { itemCount } = useCart();
  const status = business?.status.toLowerCase();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Business not found</h2>
          <Button onClick={() => setLocation('/all-businesses')}>
            Back to Businesses
          </Button>
        </div>
      </div>
    );
  }

  const handleMapClick = () => {
    if (business.mapLocation) {
      let url = business.mapLocation;
      if (!url.startsWith('http')) {
        url = `https://maps.google.com/?q=${business.mapLocation}`;
      }
      window.open(url, '_blank');
    }
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
                onClick={() => setLocation('/')}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Home className="h-5 w-5" />
              </Button>
            </div>
            <h1 className="text-xl font-semibold">{business.name}</h1>
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
            
            {status !== 'coming_soon' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation(`/business/${business.id}/products`)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Info className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      {status === 'coming_soon' && (
        <div className="bg-gray-100 p-4 text-center">
          <p className="text-lg font-semibold text-gray-800">Coming Soon</p>
          <p className="text-sm text-gray-600">This business is preparing to open. Stay tuned!</p>
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Profile Image */}
        {business.profilePictureUrl && (
          <Card>
            <CardContent className="p-4">
              <div className="w-full h-64 overflow-hidden rounded-lg">
                <ImageViewer
                  imageUrl={business.profilePictureUrl}
                  alt={business.name}
                  className="w-full h-full object-cover cursor-pointer"
                  enableZoom={true}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{business.name}</CardTitle>
            <p className="text-lg text-muted-foreground">Owner: {business.ownerName}</p>
          </CardHeader>
          <CardContent>
            {business.bio && (
              <div className="mb-4">
                <p className="text-base leading-relaxed">{business.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        {status !== 'coming_soon' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">{business.address}</p>
                </div>
              </div>

              {business.mapLocation && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 underline"
                      onClick={handleMapClick}
                    >
                      View on Google Maps
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{business.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-muted-foreground">{business.whatsAppNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{business.emailAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Hours */}
        {status !== 'coming_soon' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Operation Hours</p>
                  <p className="text-muted-foreground">{business.operationHours}</p>
                </div>
              </div>

              {business.specialHours && (
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Special Hours</p>
                    <p className="text-muted-foreground">{business.specialHours}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delivery Information */}
        {business.hasDelivery && status !== 'coming_soon' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Delivery Available</p>
                  <p className="text-muted-foreground">Delivery Area: {business.deliveryArea}</p>
                </div>
              </div>

              {business.deliveryCost && (
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery Cost</p>
                    <p className="text-muted-foreground">${business.deliveryCost.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {business.islandWideDelivery && (
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium">Island-Wide Delivery</p>
                    <p className="text-muted-foreground">{business.islandWideDelivery}</p>
                    {business.islandWideDeliveryCost && (
                      <p className="text-muted-foreground">Cost: ${business.islandWideDeliveryCost.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        {status !== 'coming_soon' && (
          <div className="pb-6">
            <Button
              onClick={() => setLocation(`/business/${business.id}/products`)}
              className="w-full"
              size="lg"
            >
              View Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}