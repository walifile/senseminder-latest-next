"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info, Check } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Configuration options with detailed descriptions and features
const options = {
  operatingSystems: [
    {
      id: "windows11",
      name: "Windows 11 Pro",
      price: 0.15,
      features: ["DirectStorage Support", "Windows Hello", "TPM 2.0"],
      description: "Latest Windows with enhanced security and performance",
    },
    {
      id: "windows10",
      name: "Windows 10 Pro",
      price: 0.12,
      features: ["BitLocker", "Remote Desktop", "Domain Join"],
      description: "Stable and widely compatible Windows version",
    },
    {
      id: "ubuntu",
      name: "Ubuntu 22.04 LTS",
      price: 0.08,
      features: [
        "Long Term Support",
        "Snap Package Support",
        "Enhanced Security",
      ],
      description: "Enterprise-grade Linux distribution",
    },
  ],
  cpus: [
    {
      id: "basic",
      name: "2 vCPU / 4GB RAM",
      price: 0.12,
      performance: "Good for basic tasks and development",
      suitable: ["Web Browsing", "Document Editing", "Light Development"],
    },
    {
      id: "standard",
      name: "4 vCPU / 8GB RAM",
      price: 0.24,
      performance: "Balanced performance for most workloads",
      suitable: ["Multi-tasking", "Development IDEs", "Light Gaming"],
    },
    {
      id: "premium",
      name: "8 vCPU / 16GB RAM",
      price: 0.48,
      performance: "High-performance computing",
      suitable: ["Heavy Development", "Video Editing", "Gaming"],
    },
  ],
  locations: [
    {
      id: "us-east",
      name: "US East (N. Virginia)",
      price: 0,
      latency: "< 20ms",
      features: [
        "Lowest Latency for East Coast",
        "Multiple Availability Zones",
      ],
    },
    {
      id: "us-west",
      name: "US West (Oregon)",
      price: 0.02,
      latency: "< 30ms",
      features: ["Best for West Coast Users", "Green Energy Powered"],
    },
    {
      id: "eu-central",
      name: "Europe (Frankfurt)",
      price: 0.03,
      latency: "< 25ms",
      features: ["GDPR Compliant", "High Availability"],
    },
  ],
  hardDrives: [
    {
      id: "ssd-256",
      name: "256 GB SSD",
      price: 0.03,
      speed: "3,000 MB/s",
      type: "NVMe SSD",
    },
    {
      id: "ssd-512",
      name: "512 GB SSD",
      price: 0.06,
      speed: "3,500 MB/s",
      type: "NVMe SSD",
    },
    {
      id: "ssd-1024",
      name: "1 TB SSD",
      price: 0.12,
      speed: "4,000 MB/s",
      type: "NVMe SSD",
    },
  ],
};

const CostCalculator = () => {
  const [config, setConfig] = useState({
    os: "",
    cpu: "",
    location: "",
    storage: "",
  });

  // const [monthlyEstimate, setMonthlyEstimate] = useState<number | null>(null);

  // Calculate costs
  const calculateCosts = () => {
    if (!config.os || !config.cpu || !config.location || !config.storage) {
      return { hourly: null, monthly: null };
    }

    const osPrice =
      options.operatingSystems.find((os) => os.id === config.os)?.price || 0;
    const cpuPrice =
      options.cpus.find((cpu) => cpu.id === config.cpu)?.price || 0;
    const locationPrice =
      options.locations.find((loc) => loc.id === config.location)?.price || 0;
    const storagePrice =
      options.hardDrives.find((hd) => hd.id === config.storage)?.price || 0;

    const hourly = osPrice + cpuPrice + locationPrice + storagePrice;
    const monthly = hourly * 24 * 30; // Approximate monthly cost

    return { hourly: hourly.toFixed(2), monthly: monthly.toFixed(2) };
  };

  const { hourly, monthly } = calculateCosts();

  // Get selected item details
  const selectedOS = options.operatingSystems.find((os) => os.id === config.os);
  const selectedCPU = options.cpus.find((cpu) => cpu.id === config.cpu);
  const selectedLocation = options.locations.find(
    (loc) => loc.id === config.location
  );
  const selectedStorage = options.hardDrives.find(
    (hd) => hd.id === config.storage
  );

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-primary/10 dark:bg-primary/20 rounded-full mb-4 px-4 py-1.5"
          >
            <span className="text-sm font-medium text-primary">
              Cost Calculator
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Check Your <span className="gradient-text">SmartPC Cost</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Configure your perfect smart PC and get instant pricing
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <div className="glass-card p-6 rounded-xl space-y-6 dark:bg-gray-900/30 dark:border-gray-800/30">
                <h3 className="text-xl font-semibold mb-2">
                  Choose Configurations
                </h3>

                {/* Operating System */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium block">
                        Operating System
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Choose your preferred operating system
                      </p>
                    </div>
                    {selectedOS && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">
                              {selectedOS.description}
                            </p>
                            <ul className="mt-2 space-y-1">
                              {selectedOS.features.map((feature, index) => (
                                <li
                                  key={index}
                                  className="flex items-center text-sm"
                                >
                                  <Check className="h-3 w-3 mr-1 text-primary" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Select
                    value={config.os}
                    onValueChange={(value) =>
                      setConfig({ ...config, os: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Operating System" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.operatingSystems.map((os) => (
                        <SelectItem key={os.id} value={os.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{os.name}</span>
                            <span className="text-muted-foreground">
                              ${os.price}/hr
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* CPU */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium block">
                        CPU & Memory
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select processing power and memory
                      </p>
                    </div>
                    {selectedCPU && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">
                              {selectedCPU.performance}
                            </p>
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">
                                Suitable for:
                              </p>
                              <ul className="space-y-1">
                                {selectedCPU.suitable.map((use, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center text-sm"
                                  >
                                    <Check className="h-3 w-3 mr-1 text-primary" />
                                    {use}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Select
                    value={config.cpu}
                    onValueChange={(value) =>
                      setConfig({ ...config, cpu: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select CPU & Memory" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.cpus.map((cpu) => (
                        <SelectItem key={cpu.id} value={cpu.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{cpu.name}</span>
                            <span className="text-muted-foreground">
                              ${cpu.price}/hr
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium block">
                        Location
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pick your server location
                      </p>
                    </div>
                    {selectedLocation && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">
                              Latency: {selectedLocation.latency}
                            </p>
                            <ul className="mt-2 space-y-1">
                              {selectedLocation.features.map(
                                (feature, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center text-sm"
                                  >
                                    <Check className="h-3 w-3 mr-1 text-primary" />
                                    {feature}
                                  </li>
                                )
                              )}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Select
                    value={config.location}
                    onValueChange={(value) =>
                      setConfig({ ...config, location: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{location.name}</span>
                            <span className="text-muted-foreground">
                              {location.price === 0
                                ? "Free"
                                : `+$${location.price}/hr`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Storage */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium block">
                        Storage
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Choose storage capacity
                      </p>
                    </div>
                    {selectedStorage && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">
                              {selectedStorage.type}
                            </p>
                            <p className="text-sm mt-1">
                              Read/Write Speed: {selectedStorage.speed}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Select
                    value={config.storage}
                    onValueChange={(value) =>
                      setConfig({ ...config, storage: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Storage" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.hardDrives.map((hd) => (
                        <SelectItem key={hd.id} value={hd.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{hd.name}</span>
                            <span className="text-muted-foreground">
                              ${hd.price}/hr
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Note about pricing */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    * All prices are in USD and billed by the hour. Monthly
                    estimates are based on 24/7 usage.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Configuration Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="lg:sticky lg:top-24 space-y-6"
            >
              <div className="glass-card p-6 rounded-xl dark:bg-gray-900/30 dark:border-gray-800/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">Your Configuration</h3>
                  {hourly && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary">
                      <Check className="h-3 w-3 mr-1" />
                      Ready
                    </span>
                  )}
                </div>

                {/* Configuration Items in a more compact grid */}
                <div className="grid gap-2 mb-3">
                  {/* OS */}
                  <div className="rounded-lg border bg-card dark:bg-gray-800/50 p-2.5 transition-colors hover:bg-accent/5 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Operating System
                        </div>
                        <div className="font-medium text-sm mt-0.5">
                          {selectedOS?.name || (
                            <span className="text-muted-foreground">
                              Not selected
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedOS && (
                        <span className="text-xs font-medium text-primary">
                          ${selectedOS.price}/hr
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CPU */}
                  <div className="rounded-lg border bg-card dark:bg-gray-800/50 p-2.5 transition-colors hover:bg-accent/5 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          CPU & Memory
                        </div>
                        <div className="font-medium text-sm mt-0.5">
                          {selectedCPU?.name || (
                            <span className="text-muted-foreground">
                              Not selected
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedCPU && (
                        <span className="text-xs font-medium text-primary">
                          ${selectedCPU.price}/hr
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Region */}
                  <div className="rounded-lg border bg-card dark:bg-gray-800/50 p-2.5 transition-colors hover:bg-accent/5 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Region
                        </div>
                        <div className="font-medium text-sm mt-0.5">
                          {selectedLocation?.name || (
                            <span className="text-muted-foreground">
                              Not selected
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedLocation && selectedLocation.price > 0 && (
                        <span className="text-xs font-medium text-primary">
                          +${selectedLocation.price}/hr
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="rounded-lg border bg-card dark:bg-gray-800/50 p-2.5 transition-colors hover:bg-accent/5 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Storage
                        </div>
                        <div className="font-medium text-sm mt-0.5">
                          {selectedStorage?.name || (
                            <span className="text-muted-foreground">
                              Not selected
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedStorage && (
                        <span className="text-xs font-medium text-primary">
                          ${selectedStorage.price}/hr
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total Cost - More compact */}
                <div className="rounded-lg border bg-primary/5 dark:bg-primary/10 p-2.5 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Total Cost
                      </div>
                      <div className="text-lg font-bold text-primary mt-0.5">
                        {hourly ? `$${hourly}/hr` : "-"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Est. Monthly*
                      </div>
                      <div className="text-sm font-medium mt-0.5">
                        ${monthly}/month
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-3">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={!hourly}
                  >
                    View Estimate
                  </Button>

                  <Button className="flex-1" disabled={!hourly} asChild>
                    <Link href="/auth/sign-up">
                      Deploy
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                {/* Included features - Even more compact */}
                <div className="border-t pt-2">
                  <h4 className="text-xs font-medium mb-1.5">
                    Included with every plan:
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      "Free data transfer",
                      "Automated backups",
                      "99.9% uptime SLA",
                      "24/7 support",
                      "Security monitoring",
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center text-xs text-muted-foreground"
                      >
                        <Check className="h-2.5 w-2.5 mr-1 text-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile version of Included features */}
              <div className="glass-card p-6 rounded-xl lg:hidden dark:bg-gray-900/30 dark:border-gray-800/30">
                <h4 className="font-medium mb-3">Included with every plan:</h4>
                <ul className="space-y-2">
                  {[
                    "Free data transfer",
                    "Automated backups",
                    "99.9% uptime SLA",
                    "24/7 technical support",
                    "Security monitoring",
                  ].map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CostCalculator;
