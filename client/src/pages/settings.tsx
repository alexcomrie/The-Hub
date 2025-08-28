import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Store, Github, Info, User, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUsername } from "@/providers/username-provider";
import { UsernameModal } from "@/components/username-modal";
import { format } from "date-fns";
import { useState } from "react";


export default function Settings() {
  const [, setLocation] = useLocation();
  const { username, lastUsernameChange } = useUsername();
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const appVersion = '1.1.0';

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-green-600 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Username</h3>
                  <p className="text-sm text-gray-500">{username || 'Not set'}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUsernameModalOpen(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Change
              </Button>
            </div>
            {lastUsernameChange && (
              <p className="text-sm text-gray-500">
                Last changed: {format(new Date(lastUsernameChange), 'MMM d, yyyy')}
              </p>
            )}

            {/* Username Modal */}
            <UsernameModal
              isOpen={isUsernameModalOpen}
              onClose={() => setIsUsernameModalOpen(false)}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>About The Hub</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center flex-col space-y-4">
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center">
                <Store className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">The Hub</h2>
                <p className="text-gray-600">Version {appVersion}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
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

                <Button
                  variant="outline"
                  onClick={() => window.open('https://github.com/yourusername/the-hub', '_blank')}
                >
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copyright Information */}
        <div className="text-center text-sm text-gray-500 pb-6">
          <p>© 2025 The Hub. All rights reserved.</p>
          <p>Developed by Alexandre Comrie.</p>
        </div>
      </div>
    </div>
  );
}