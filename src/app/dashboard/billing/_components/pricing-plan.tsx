"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, HardDrive, Cpu, Server, Zap } from "lucide-react";
import { billingPlans } from "../data";

const PricingPlan = () => {
  const [selectedService, setSelectedService] = useState("smartpc");

  const [storageTier, setStorageTier] = useState(1);
  const [selectedServer, setSelectedServer] = useState("us-east");

  const serverLocations = [{ id: "us-east", name: "US East (N. Virginia)" }];

  const PRICE_PER_TIER = 0.5;
  const getStorageSizeFromTier = (tier: number) => `${tier * 20} GB`;
  const price = storageTier === 1 ? 0 : (storageTier - 1) * PRICE_PER_TIER;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Only Pay For What You Use
        </CardTitle>
        <CardDescription>
          Choose your service and preferred billing cycle
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs
          defaultValue="smartpc"
          value={selectedService}
          onValueChange={setSelectedService}
          className="w-full"
        >
          {/* Service Selection Tabs */}
          <TabsList className="grid grid-cols-2 h-auto p-1 mb-6">
            {[
              {
                value: "smartpc",
                label: "Sense PC",
                icon: Cpu,
              },
              {
                value: "smartstorage",
                label: "Sense Storage",
                icon: HardDrive,
              },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 py-3 px-4"
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Sense PC Content – Display all plans together */}
          <TabsContent value="smartpc" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {billingPlans.map((plan) => (
                <Card key={plan.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <plan.icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">What's included:</h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <CheckCircle className="h-3.5 w-3.5 text-primary" />
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 📌 SSD Note */}
            <p className="text-xs mt-6 text-yellow-700 dark:text-yellow-300">
              💡 <span className="font-medium">Note:</span> If your PC is on an{" "}
              <strong>Hourly Plan</strong>, SSD storage charges will continue
              even after stopping your Sense PC, since the disk remains
              allocated to preserve your data.
            </p>
          </TabsContent>

          {/* Smart Storage Content */}
          <TabsContent value="smartstorage" className="space-y-6">
            <div className="space-y-6 py-2">
              <div>
                <h3 className="text-sm font-medium">Storage Tier</h3>
                <div className="flex justify-between mt-1 mb-2">
                  <span className="text-muted-foreground text-xs">
                    T-1 (20GB)
                  </span>
                  <span className="text-muted-foreground text-xs">
                    T-50 (1000GB)
                  </span>
                </div>
                <Slider
                  value={[storageTier]}
                  onValueChange={(value) => setStorageTier(value[0])}
                  min={1}
                  max={50}
                  step={1}
                />
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm">
                    Selected: <strong>T-{storageTier}</strong> (
                    {getStorageSizeFromTier(storageTier)})
                  </span>
                  <span className="text-large font-semibold">
                    {price === 0 ? "FREE" : `$${price.toFixed(2)}`} / month
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">
                  Data Center Location
                </h3>
                <Select
                  value={selectedServer}
                  onValueChange={setSelectedServer}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {serverLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4" />
                            <span>{loc.name}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PricingPlan;
