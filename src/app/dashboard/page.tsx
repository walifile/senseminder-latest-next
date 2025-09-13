"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  HardDrive,
  Cpu,
  MemoryStick,
  Upload,
  Download,
  Clock,
} from "lucide-react";

interface ResourceUsage {
  used: number;
  total: number;
  percentage: number;
}

interface ResourceCard {
  title: string;
  icon: React.ElementType;
  usage: ResourceUsage;
  unit: string;
}

export default function DashboardPage() {
  const resources: ResourceCard[] = [
    {
      title: "Storage Used",
      icon: HardDrive,
      usage: { used: 256, total: 1024, percentage: 25 },
      unit: "GB",
    },
    {
      title: "CPU Usage",
      icon: Cpu,
      usage: { used: 35, total: 100, percentage: 35 },
      unit: "%",
    },
    {
      title: "Memory Usage",
      icon: MemoryStick,
      usage: { used: 8.5, total: 16, percentage: 53 },
      unit: "GB",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {resource.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <resource.icon className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">
                    {resource.usage.used}
                    {resource.unit}
                  </span>
                </div>
                <span className="text-muted-foreground text-sm">
                  of {resource.usage.total}
                  {resource.unit}
                </span>
              </div>
              <Progress
                value={resource.usage.percentage}
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your smart PC resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="h-6 w-6" />
                <span>Upload Files</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center space-y-2"
              >
                <Download className="h-6 w-6" />
                <span>Download Files</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center space-y-2"
              >
                <Cpu className="h-6 w-6" />
                <span>Upgrade CPU</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center space-y-2"
              >
                <Clock className="h-6 w-6" />
                <span>Session History</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
