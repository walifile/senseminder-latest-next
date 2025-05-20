"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ChevronRight, Settings, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const notifications = [
  {
    id: 1,
    title: "Storage space running low",
    message:
      "Your cloud storage is nearly full. Consider upgrading your plan to avoid running out of space.",
    time: "10 minutes ago",
    unread: true,
    type: "alert",
  },
  {
    id: 2,
    title: "Weekly report available",
    message:
      "Your weekly usage report is now available. Check how you used your smart PC this week.",
    time: "2 hours ago",
    unread: true,
    type: "info",
  },
  {
    id: 3,
    title: "System maintenance scheduled",
    message:
      "Scheduled maintenance in 48 hours. Your smart PC may be unavailable for approximately 30 minutes during this time.",
    time: "1 day ago",
    unread: false,
    type: "system",
  },
  {
    id: 4,
    title: "New feature available",
    message:
      "We've added new smart storage integration features. Check them out in your dashboard.",
    time: "3 days ago",
    unread: false,
    type: "info",
  },
  {
    id: 5,
    title: "Security alert",
    message:
      "New login detected from an unrecognized device. Please verify if this was you.",
    time: "5 days ago",
    unread: false,
    type: "alert",
  },
];

const NotificationsPage = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    email: false,
    push: true,
    system: true,
    marketing: false,
  });

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [key]: !prev[key] };
      toast({
        title: "Preferences updated",
        description: `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } notifications ${newPrefs[key] ? "enabled" : "disabled"}.`,
      });
      return newPrefs;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Notification Preferences</DialogTitle>
              <DialogDescription>
                Choose how you want to receive notifications. Changes are saved
                automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email"
                  checked={preferences.email}
                  onCheckedChange={() => handlePreferenceChange("email")}
                />
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="push">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in your browser
                  </p>
                </div>
                <Switch
                  id="push"
                  checked={preferences.push}
                  onCheckedChange={() => handlePreferenceChange("push")}
                />
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="system">System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Important system updates and maintenance notifications
                  </p>
                </div>
                <Switch
                  id="system"
                  checked={preferences.system}
                  onCheckedChange={() => handlePreferenceChange("system")}
                />
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="marketing">Marketing Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    New features, promotions, and product updates
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={() => handlePreferenceChange("marketing")}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          <Button variant="ghost" size="sm">
            Mark all as read
          </Button>
        </div>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
            />
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications
            .filter((notification) => notification.unread)
            .map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {notifications
            .filter((notification) => notification.type === "alert")
            .map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
interface Notification {
  id?: number;
  title?: string;
  message?: string;
  time?: string;
  unread?: boolean;
  type?: string; // Add all types you use
}

interface NotificationCardProps {
  notification: Notification;
}

// Component for individual notification cards
const NotificationCard = ({ notification }: NotificationCardProps) => {
  return (
    <Card
      className={`${
        notification.unread ? "border-primary/20 bg-primary/5" : ""
      }`}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex gap-4">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              notification.type === "alert"
                ? "bg-destructive/20 text-destructive"
                : notification.type === "system"
                ? "bg-orange-500/20 text-orange-500"
                : "bg-primary/20 text-primary"
            }`}
          >
            <Bell className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-medium ${
                  notification.unread ? "text-primary" : ""
                }`}
              >
                {notification.title}
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {notification.time}
                </span>
                {notification.unread && (
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
            <div className="pt-2 flex justify-between">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <span>View Details</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPage;
