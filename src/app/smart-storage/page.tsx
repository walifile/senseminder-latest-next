"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { useMemo, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

import { motion } from "framer-motion";
import { Clock, Cloud, Shield, Share2, Server } from "lucide-react";

export default function SmartStoragePage() {
  const router = useRouter();

  const [storageTier, setStorageTier] = useState(1);
  const [selectedServer, setSelectedServer] = useState("us-east");
  const [latencyMap, setLatencyMap] = useState<Record<string, number>>({});
  const [latencyLoading, setLatencyLoading] = useState(true);

  const serverLocations = [{ id: "us-east", name: "US East (N. Virginia)" }];

  const PING_TARGETS = useMemo<Record<string, string>>(
    () => ({
      "us-east": "storage",
    }),
    []
  );

  const getStorageSizeFromTier = (tier: number) => `${tier * 20} GB`;
  const PRICE_PER_TIER = 0.5;
  const price = storageTier === 1 ? 0 : (storageTier - 1) * PRICE_PER_TIER;

  useEffect(() => {
    const fetchLatencies = async () => {
      const results: Record<string, number> = {};
      for (const [region, target] of Object.entries(PING_TARGETS)) {
        const start = performance.now();
        try {
          const res = await fetch(`/api/ping?target=${target}`, {
            cache: "no-store",
          });
          if (!res.ok) {
            throw new Error("Ping request failed");
          }
          await res.json();
          const end = performance.now();
          results[region] = Math.round(end - start);
        } catch {
          results[region] = -1;
        }
      }
      setLatencyMap(results);
      setLatencyLoading(false);
    };

    fetchLatencies();
  }, [PING_TARGETS]);

  const handlePurchase = () => {
    // toast({
    //   title: "Authentication Required",
    //   description: "Please sign in to purchase a storage plan.",
    // });
    router.push(routes?.storage);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A1B]">
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-4"
            >
              Sense <span className="gradient-text">Storage</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Store smarter. Access anywhere. Pay only for what you use!
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {[
              {
                icon: Shield,
                title: "Secure Storage",
                description:
                  "Your data is protected with enterprise-grade encryption.",
              },
              {
                icon: Share2,
                title: "Easy Sharing",
                description: "Share files and folders with anyone, anywhere.",
              },
              {
                icon: Clock,
                title: "Image Preview",
                description: "Quickly preview images without downloading.",
              },
              {
                icon: Cloud,
                title: "Cloud Backup",
                description:
                  "Securely back up your computer files and sync them across all your devices.",
              },
            ].map((feature, index) => (
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-foreground" />
              <CardHeader>
                <CardTitle>Welcome to Sense Cloud Intelligent Tier</CardTitle>
                <CardDescription>
                  Start free with 20GB — just pay for your highest tier usage
                  each month, no fixed plans.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Storage Tier</h3>
                    <span className="text-xl font-bold">
                      T-{storageTier} ({getStorageSizeFromTier(storageTier)})
                    </span>
                  </div>
                  <Slider
                    value={[storageTier]}
                    onValueChange={(value) => setStorageTier(value[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>T-1 (20GB)</span>
                    <span>T-50 (1000GB)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Data Center Location</h3>
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
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Server className="h-4 w-4" />
                              <span>{location.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {latencyLoading
                                ? "..."
                                : latencyMap[location.id] > 0
                                ? `~${latencyMap[location.id]}ms`
                                : "N/A"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-semibold">Estimated Monthly Price</h3>
                      <p className="text-sm text-muted-foreground">
                        Based on highest tier used. Billed monthly.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">
                        {storageTier === 1 ? "FREE" : `$${price.toFixed(2)}`}
                      </span>
                      {storageTier !== 1 && (
                        <span className="text-muted-foreground">/month</span>
                      )}
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
