"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Mail,
  Key,
  Shield,
  AlertTriangle,
  Smartphone,
  QrCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ProfilePage = () => {
  const { toast } = useToast();
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [sessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, USA",
      ip: "192.158.1.38",
      lastActive: "Active Now",
      isCurrentSession: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "New York, USA",
      ip: "192.158.1.38",
      lastActive: "2 days ago",
      isCurrentSession: false,
    },
  ]);
  const [mfaMethod, setMfaMethod] = useState<"app" | "sms" | "email" | null>(
    null
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [preferredEmail, setPreferredEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    if (cooldown > 0) {
      timer = setInterval(() => {
        if (mounted) {
          setCooldown((prev) => {
            if (prev <= 0) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const validatePhoneNumber = (phone: string) => {
    // Basic phone validation - can be made more robust
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ""));
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setPhoneNumber(phone);
    setIsPhoneValid(validatePhoneNumber(phone));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setPreferredEmail(email);
    setIsEmailValid(validateEmail(email));
  };

  const sendVerificationCode = async () => {
    try {
      // Prevent multiple sends
      if (cooldown > 0) return;

      setIsCodeSent(false);
      // In a real app, this would make an API call to send the code
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call

      setIsCodeSent(true);
      setCooldown(60); // Start 60-second cooldown
      setVerificationCode(""); // Reset verification code
    } catch (error) {
      console.error("Failed to send verification code:", error);
      // Handle error appropriately
    }
  };

  const handleRevokeSession = (sessionId: number) => {
    console.log(sessionId);
    toast({
      title: "Session Revoked",
      description: "The selected session has been terminated.",
    });
  };

  // const handle2FASetup = () => {
  //   if (!is2FAEnabled) {
  //     setShow2FADialog(true);
  //   } else {
  //     setIs2FAEnabled(false);
  //     toast({
  //       title: "2FA Disabled",
  //       description: "Two-factor authentication has been disabled.",
  //     });
  //   }
  // };

  const complete2FASetup = () => {
    setIs2FAEnabled(true);
    setShow2FADialog(false);
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been successfully enabled.",
    });
  };

  const handleMFAMethodChange = (method: "app" | "sms" | "email") => {
    setMfaMethod(method);
    setShow2FADialog(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/avatar-placeholder.jpg" alt="User" />
                    <AvatarFallback className="text-xl">JD</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 flex-1">
                  <h3 className="font-medium">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Upload
                    </Button>
                    <Button size="sm" variant="outline">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value="john@example.com"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed. Please contact support if you need
                    to update your email address.
                  </p>
                </div>
              </div>

              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Update Password
              </CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Password Updated",
                    description: "Your password has been changed successfully.",
                  });
                }}
                className="space-y-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" />
                </div>
                <Button type="submit" className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>
                Choose your preferred authentication method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">
                    {is2FAEnabled
                      ? "Two-factor authentication is enabled"
                      : "Use an authenticator app to generate one-time codes"}
                  </p>
                </div>
                <Button
                  variant={is2FAEnabled ? "destructive" : "outline"}
                  onClick={() => handleMFAMethodChange("app")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {is2FAEnabled ? "Disable" : "Setup"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">SMS Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Receive codes via text message
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleMFAMethodChange("sms")}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Setup
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Email Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Receive codes via email
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleMFAMethodChange("email")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Setup
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{session.device}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.location} • IP: {session.ip}
                    </p>
                    <p
                      className={`text-xs ${
                        session.isCurrentSession ? "text-primary" : ""
                      }`}
                    >
                      {session.lastActive}
                    </p>
                  </div>
                  {!session.isCurrentSession && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mfaMethod === "app" && "Setup Authenticator App"}
              {mfaMethod === "sms" && "Setup SMS Authentication"}
              {mfaMethod === "email" && "Setup Email Authentication"}
            </DialogTitle>
            <DialogDescription>
              {mfaMethod === "app" &&
                "Scan the QR code below with your authenticator app"}
              {mfaMethod === "sms" &&
                "Enter your phone number to receive verification codes"}
              {mfaMethod === "email" &&
                "We'll send verification codes to your email"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {mfaMethod === "app" && (
              <>
                <div className="border border-border p-4 rounded-lg">
                  <QrCode className="h-32 w-32 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Can't scan the QR code? Enter this code manually:
                  <br />
                  <code className="font-mono bg-muted px-2 py-1 rounded mt-2 inline-block">
                    ABCD EFGH IJKL MNOP
                  </code>
                </p>
              </>
            )}

            {mfaMethod === "sms" && (
              <div className="space-y-4 w-full">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      className={
                        !isPhoneValid && phoneNumber ? "border-destructive" : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={sendVerificationCode}
                      disabled={!isPhoneValid || cooldown > 0}
                    >
                      {cooldown > 0
                        ? `Resend (${cooldown}s)`
                        : isCodeSent
                        ? "Resend"
                        : "Send Code"}
                    </Button>
                  </div>
                  {!isPhoneValid && phoneNumber && (
                    <p className="text-sm text-destructive">
                      Please enter a valid phone number
                    </p>
                  )}
                  {isCodeSent && (
                    <p className="text-sm text-muted-foreground">
                      A verification code has been sent to your phone
                    </p>
                  )}
                </div>
                {isCodeSent && (
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {mfaMethod === "email" && (
              <div className="space-y-4 w-full">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your preferred email"
                      value={preferredEmail}
                      onChange={handleEmailChange}
                      className={
                        !isEmailValid && preferredEmail
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={sendVerificationCode}
                      disabled={!isEmailValid || cooldown > 0}
                    >
                      {cooldown > 0
                        ? `Resend (${cooldown}s)`
                        : isCodeSent
                        ? "Resend"
                        : "Send Code"}
                    </Button>
                  </div>
                  {!isEmailValid && preferredEmail && (
                    <p className="text-sm text-destructive">
                      Please enter a valid email address
                    </p>
                  )}
                  {isCodeSent && (
                    <p className="text-sm text-muted-foreground">
                      A verification code has been sent to {preferredEmail}
                    </p>
                  )}
                </div>
                {isCodeSent && (
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShow2FADialog(false);
                setMfaMethod(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={complete2FASetup}>Enable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
