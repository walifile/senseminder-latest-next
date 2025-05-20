"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Share2, Clock, Cloud, Server } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const serverLocations = [
  { id: "us-east", name: "US East (N. Virginia)", latency: "~20ms" },
  { id: "us-west", name: "US West (Oregon)", latency: "~60ms" },
  { id: "eu-central", name: "Europe (Frankfurt)", latency: "~100ms" },
  { id: "ap-south", name: "Asia Pacific (Mumbai)", latency: "~140ms" },
  { id: "ap-southeast", name: "Asia Pacific (Singapore)", latency: "~120ms" },
];

// const storagePlans = [
//   {
//     name: "Basic",
//     price: 4.99,
//     storage: "100",
//     features: [
//       "100 GB Storage",
//       "End-to-end encryption",
//       "File sharing",
//       "Access on all devices",
//       "24/7 support",
//     ],
//   },
//   {
//     name: "Professional",
//     price: 9.99,
//     storage: "500",
//     features: [
//       "500 GB Storage",
//       "End-to-end encryption",
//       "Advanced file sharing",
//       "Access on all devices",
//       "Priority support",
//       "File version history",
//     ],
//   },
//   {
//     name: "Enterprise",
//     price: 19.99,
//     storage: "2000",
//     features: [
//       "2 TB Storage",
//       "End-to-end encryption",
//       "Team file sharing",
//       "Access on all devices",
//       "Priority support",
//       "Extended file version history",
//       "Admin controls",
//     ],
//   },
// ];

const features = [
  {
    icon: Shield,
    title: "Secure Storage",
    description: "Your data is protected with enterprise-grade encryption",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share files and folders with anyone, anywhere",
  },
  {
    icon: Clock,
    title: "Version History",
    description: "Access and restore previous versions of your files",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description: "Automatically sync your files across all devices",
  },
];

const calculatePrice = (sizeGB: number) => {
  if (sizeGB <= 20) return 2.99;
  if (sizeGB <= 100) return 4.99;
  if (sizeGB <= 500) return 9.99;
  if (sizeGB <= 2000) return 19.99;
  return Math.round((19.99 + (sizeGB - 2000) * 0.008) * 100) / 100;
};

export default function SmartStoragePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [storageSize, setStorageSize] = useState(20);
  const [selectedServer, setSelectedServer] = useState("us-east");

  const price = calculatePrice(storageSize);

  const handlePurchase = () => {
    toast({
      title: "Authentication Required",
      description: "Please sign in to purchase storage plan.",
    });
    router.push("/auth");
  };

  const formatStorageSize = (size: number) => {
    if (size >= 1000) {
      return `${size / 1000} TB`;
    }
    return `${size} GB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A1B]">
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-4"
            >
              Smart <span className="gradient-text">Storage</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Secure, reliable, and fast cloud storage for all your needs.
              Access your files anywhere, anytime.
            </motion.p>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Configuration Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-foreground" />
              <CardHeader>
                <CardTitle>Configure Your Storage</CardTitle>
                <CardDescription>
                  Choose your storage size and preferred server location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Storage Size Selector */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Storage Size</h3>
                    <span className="text-2xl font-bold">
                      {formatStorageSize(storageSize)}
                    </span>
                  </div>
                  <Slider
                    value={[storageSize]}
                    onValueChange={(value) => setStorageSize(value[0])}
                    min={20}
                    max={5000}
                    step={20}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>20 GB</span>
                    <span>5 TB</span>
                  </div>
                </div>

                {/* Server Location Selector */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Server Location</h3>
                  <Select
                    value={selectedServer}
                    onValueChange={setSelectedServer}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select server location" />
                    </SelectTrigger>
                    <SelectContent>
                      {serverLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4" />
                            <div>
                              <span>{location.name}</span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {location.latency}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price and Purchase */}
                <div className="pt-6 border-t">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-semibold">Total Price</h3>
                      <p className="text-sm text-muted-foreground">
                        Billed monthly
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-bold">${price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </div>
                  <Button className="w-full" size="lg" onClick={handlePurchase}>
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
