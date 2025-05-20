import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select defaultValue="utc-5">
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-8">
                        Pacific Time (UTC-8)
                      </SelectItem>
                      <SelectItem value="utc-7">
                        Mountain Time (UTC-7)
                      </SelectItem>
                      <SelectItem value="utc-6">
                        Central Time (UTC-6)
                      </SelectItem>
                      <SelectItem value="utc-5">
                        Eastern Time (UTC-5)
                      </SelectItem>
                      <SelectItem value="utc+0">UTC</SelectItem>
                      <SelectItem value="utc+1">
                        Central European Time (UTC+1)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activity-status">Activity Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Show when you're active
                    </p>
                  </div>
                  <Switch id="activity-status" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-effects">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for notifications and actions
                    </p>
                  </div>
                  <Switch id="sound-effects" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Settings</CardTitle>
              <CardDescription>Manage your session preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Select defaultValue="30">
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Your smart PC will hibernate after this period of inactivity
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-reconnect">Automatic Reconnect</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically reconnect if connection is lost
                  </p>
                </div>
                <Switch id="auto-reconnect" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup
                  defaultValue="dark"
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="dark"
                      id="theme-dark"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="theme-dark"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="rounded-md border border-border mb-3 w-full h-20 bg-background"></div>
                      Dark
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="light"
                      id="theme-light"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="theme-light"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="rounded-md border border-border mb-3 w-full h-20 bg-white"></div>
                      Light
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="system"
                      id="theme-system"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="theme-system"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="rounded-md border border-border mb-3 w-full h-20 bg-gradient-to-r from-background to-white"></div>
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Accent Color</Label>
                <RadioGroup
                  defaultValue="blue"
                  className="grid grid-cols-6 gap-2"
                >
                  <div>
                    <RadioGroupItem
                      value="blue"
                      id="color-blue"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="color-blue"
                      className="flex aspect-square items-center justify-center rounded-full border-2 border-muted bg-blue-500 text-blue-900 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    ></Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="purple"
                      id="color-purple"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="color-purple"
                      className="flex aspect-square items-center justify-center rounded-full border-2 border-muted bg-purple-500 text-purple-900 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    ></Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="green"
                      id="color-green"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="color-green"
                      className="flex aspect-square items-center justify-center rounded-full border-2 border-muted bg-green-500 text-green-900 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    ></Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="orange"
                      id="color-orange"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="color-orange"
                      className="flex aspect-square items-center justify-center rounded-full border-2 border-muted bg-orange-500 text-orange-900 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    ></Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="pink"
                      id="color-pink"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="color-pink"
                      className="flex aspect-square items-center justify-center rounded-full border-2 border-muted bg-pink-500 text-pink-900 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    ></Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="red"
                      id="color-red"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="color-red"
                      className="flex aspect-square items-center justify-center rounded-full border-2 border-muted bg-red-500 text-red-900 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    ></Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce the amount of animations
                  </p>
                </div>
                <Switch id="reduced-motion" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduce-transparency">
                    Reduce Transparency
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce the transparency of background elements
                  </p>
                </div>
                <Switch id="reduce-transparency" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Login Verification</Label>
                <RadioGroup defaultValue="email" className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="login-email" />
                    <Label htmlFor="login-email">Email Verification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2fa" id="login-2fa" />
                    <Label htmlFor="login-2fa">Two-Factor Authentication</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="login-none" />
                    <Label htmlFor="login-none">
                      No Additional Verification
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="login-notification">
                    Login Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new logins to your account
                  </p>
                </div>
                <Switch id="login-notification" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trusted-devices">
                    Remember Trusted Devices
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Skip verification on devices you've previously used
                  </p>
                </div>
                <Switch id="trusted-devices" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data Syncing</Label>
                <Select defaultValue="realtime">
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select sync frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="hardware-acceleration">
                    Hardware Acceleration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use your device's GPU to improve performance
                  </p>
                </div>
                <Switch id="hardware-acceleration" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smart-backup">Automatic Cloud Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Regularly backup your data to the cloud
                  </p>
                </div>
                <Switch id="smart-backup" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                These actions are irreversible and should be used with caution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-destructive/20 rounded-lg p-4">
                <h3 className="font-medium mb-1">Reset smart PC</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will reset your smart PC to its default state. All
                  installed applications and configurations will be lost.
                </p>
                <Button variant="destructive" size="sm">
                  Reset smart PC
                </Button>
              </div>

              <div className="border border-destructive/20 rounded-lg p-4">
                <h3 className="font-medium mb-1">Delete Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
