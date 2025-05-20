"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Cpu,
  MemoryStick as Memory,
  HardDrive,
  Activity,
  Power,
  Settings,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResourceMetrics {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

interface DetailedCloudPC {
  id: string;
  name: string;
  template: string;
  status: "running" | "stopped" | "idle" | "starting";
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    os: string;
  };
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkStats: {
    download: number;
    upload: number;
    latency: number;
  };
  cost: number;
  costBreakdown: {
    compute: number;
    storage: number;
    network: number;
  };
  schedule?: {
    start: string;
    end: string;
    days: string[];
  };
  idleTimeout: number;
}

const CloudPCDetailsPage = () => {
  const params = useParams();
  const instanceId = typeof params?.id === "string" ? params.id : "";
  const [pc, setPc] = useState<DetailedCloudPC | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ResourceMetrics>({
    cpu: 45,
    memory: 60,
    storage: 75,
    network: 30,
  });

  useEffect(() => {
    const fetchPCDetails = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data for demonstration
      const mockPC: DetailedCloudPC = {
        id: instanceId || "1",
        name: "Development PC",
        template: "performance",
        status: "running",
        specs: {
          cpu: "AMD Ryzen 7 5800X",
          ram: "32 GB DDR4",
          storage: "NVMe SSD",
          os: "Windows 11 Pro",
        },
        cpuUsage: 45,
        memoryUsage: 60,
        diskUsage: 75,
        networkStats: {
          download: 150,
          upload: 50,
          latency: 25,
        },
        cost: 150,
        costBreakdown: {
          compute: 80,
          storage: 40,
          network: 30,
        },
        schedule: {
          start: "09:00",
          end: "18:00",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        },
        idleTimeout: 30,
      };

      setPc(mockPC);
      setLoading(false);
    };

    fetchPCDetails();
  }, [instanceId]);

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        storage: Math.random() * 100,
        network: Math.random() * 100,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !pc) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // const formatUptime = (seconds: number) => {
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   return `${hours}h ${minutes}m`;
  // };

  // const formatBytes = (bytes: number) => {
  //   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  //   if (bytes === 0) return "0 Byte";
  //   const i = Math.floor(Math.log(bytes) / Math.log(1024));
  //   return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  // };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Smart PC Details</h1>
          <p className="text-muted-foreground">Instance ID: {instanceId}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Terminal className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon">
            <Power className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Resource Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "CPU Usage", value: metrics.cpu, icon: Cpu },
          { label: "Memory Usage", value: metrics.memory, icon: Memory },
          { label: "Storage Usage", value: metrics.storage, icon: HardDrive },
          { label: "Network Usage", value: metrics.network, icon: Activity },
        ].map((resource) => (
          <Card key={resource.label} className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <resource.icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{resource.label}</h3>
            </div>
            <div className="space-y-2">
              <Progress value={resource.value} className="h-2" />
              <p className="text-sm text-muted-foreground text-right">
                {resource.value.toFixed(1)}%
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Operating System
                </p>
                <p className="font-medium">{pc.specs.os}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPU Model</p>
                <p className="font-medium">{pc.specs.cpu}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Memory</p>
                <p className="font-medium">{pc.specs.ram}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Type</p>
                <p className="font-medium">{pc.specs.storage}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            {/* Add performance charts and metrics here */}
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Storage Details</h3>
            {/* Add storage information here */}
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Network Configuration
            </h3>
            {/* Add network details here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CloudPCDetailsPage;
