"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
// import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  // MonitorOff,
  Power,
  Keyboard,
  Mouse,
  Volume2,
  Shield,
  Maximize2 as Maximize,
  Monitor,
  // RefreshCw,
  Signal,
  MonitorPlay,
  // AlertCircle,
  Minimize,
  Usb,
  Glasses,
  Loader2,
  ChevronLeft,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import DCVViewer from "@/app/pc-viewer/_components/dcv-viewer";
import { useSelector } from "react-redux";
import { selectLaunchVMResponse } from "@/redux/slices/dcv/dcv-slice";
import dcv from "../../../public/dcvjs/dcv";

// Add ConnectionState type
type ConnectionState = "CONNECTED" | "DISCONNECTED" | "RECONNECTING";

// Add DcvConnection type
interface KeyboardShortcutKey {
  key: string;
  location: number;
}

interface DcvConnection {
  requestResolution: (width: number, height: number) => Promise<void>;
  disconnect: () => Promise<void>;
  getStats: () => Promise<{ latency: number; fps: number }>;
  sendKeyboardShortcut: (keys: KeyboardShortcutKey[]) => void;
  setDisplayQuality: (min: number, max: number) => void;
}

// Create a separate client component that uses useSearchParams
const PCViewerContent = () => {
  const searchParams = useSearchParams();
  // const pcName = searchParams?.get("name") || "SmartPC";
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("DISCONNECTED");
  // const [imageError, setImageError] = useState(false);
  const [quality, setQuality] = useState("auto");
  const [bandwidth, setBandwidth] = useState(75);
  const [keyboardEnabled, setKeyboardEnabled] = useState(true);
  const [mouseEnabled, setMouseEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [encryption, setEncryption] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [usbEnabled, setUsbEnabled] = useState(true);
  const [vrEnabled, setVrEnabled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  // const { theme } = useTheme();
  // const poweringOn = false;
  // const poweringOff = false;
  const [tvEffect, setTvEffect] = useState<"on" | "off" | null>("on");
  const [dcvError, setDcvError] = useState<Error | null>(null);
  const dcvConfig = {
    quality: "high",
    keyboard: true,
    mouse: true,
    touch: true,
    audio: true,
  };

  if (dcvError) {
    console.log(dcvError);
  }
  const [dcvSession, setDcvSession] = useState<{
    sessionId: string;
    sessionToken: string;
  } | null>(null);
  const connRef = useRef<DcvConnection | null>(null);

  const [connectionStats, setConnectionStats] = useState({
    latency: "0ms",
    fps: "0",
    quality: "0%",
    dataTransferred: "0 MB",
    uptime: "0m",
  });

  const launchVMResponse = useSelector(selectLaunchVMResponse);
  const sessionId = launchVMResponse?.sessionId;
  const authToken = launchVMResponse?.sessionToken;
  const url = launchVMResponse?.dnsName;
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle quality change
  const handleQualityChange = (value: string) => {
    setQuality(value);

    if (!connRef.current) return;

    switch (value) {
      case "low":
        connRef.current.setDisplayQuality(10, 25);
        break;
      case "medium":
        connRef.current.setDisplayQuality(40, 60);
        break;
      case "high":
        connRef.current.setDisplayQuality(80, 100);
        break;
      case "auto":
      default:
        connRef.current.setDisplayQuality(0, 100);
        break;
    }
  };

  // Adjust resolution
  const updateResolution = () => {
    const container = document.getElementById("remote-desktop");
    if (connRef.current && container) {
      const width = container.clientWidth;
      const height = window.innerHeight;
      console.log("Updating resolution:", width, height);
      connRef.current
        .requestResolution(width, height)
        .catch((e) => console.warn("Failed to request resolution:", e));
    }
  };

  // Function to connect to DCV
  const connectToDcv = async () => {
    if (sessionId && authToken) {
      console.log("checking");
      setTvEffect("on");
      setIsLoading(true);
      setConnectionState("RECONNECTING");

      try {
        const conn = await dcv.connect({
          url: `https://${url}`,
          sessionId,
          authToken,
          useGateway: true,
          divId: "remote-desktop",
          callbacks: {
            firstFrame: () => {
              updateResolution();
              setIsLoading(false);
              setIsConnected(true);
              handleQualityChange("auto");
              setConnectionState("CONNECTED");
              conn.enableDisplayQualityUpdates(true);
              console.log("checking Connection:", conn);
            },
          },
        });

        // Save connection reference
        connRef.current = conn;

        window.addEventListener("resize", updateResolution);
      } catch (error) {
        console.error("Connection failed:", error);
        setDcvError(error as Error);
        setTvEffect("off");
        setIsLoading(false);
        setIsConnected(false);
        setConnectionState("DISCONNECTED");
      }
    }
  };

  useEffect(() => {
    connectToDcv();
  }, []);

  const handleConnect = () => {
    if (!connRef.current && sessionId && authToken) {
      connectToDcv();
    }
  };

  const handleDisconnect = () => {
    if (connRef.current) {
      connRef.current.disconnect();
      connRef.current = null;
      setTvEffect("off");
      setIsConnected(false);
      setConnectionState("DISCONNECTED");
    }
  };

  // Update stats
  const updateStats = async () => {
    if (connRef.current) {
      try {
        const stats = await connRef.current.getStats();
        setConnectionStats((prev) => ({
          ...prev,
          latency: `${Math.round(stats.latency)}ms`,
          fps: `${Math.round(stats.fps)}`,
        }));
      } catch (err) {
        console.warn("Failed to fetch DCV stats:", err);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(updateStats, 3000);
    return () => clearInterval(interval);
  }, []);

  // Open a new session in a new window
  const openNewSession = () => {
    const currentUrl = window.location.href;
    const sessionId = searchParams?.get("sessionId") || Date.now().toString();
    const newUrl = new URL(currentUrl);
    newUrl.searchParams.set("sessionId", sessionId);
    window.open(newUrl.toString(), "_blank", "width=1024,height=768");
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const remoteDesktop = document.getElementById("remote-desktop");
      if (remoteDesktop) {
        remoteDesktop.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Main Remote Desktop Area */}
      <div id="remote-desktop" className="flex-1  relative overflow-hidden">
        {/* TV On/Off Animation */}
        <AnimatePresence>
          {/* tvEffect === "on" */}
          {isLoading && (
            <>
              <motion.div
                initial={{ scaleY: 0, opacity: 1 }}
                animate={{ scaleY: 1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 bg-white dark:bg-blue-50 origin-center z-30"
                style={{
                  backgroundImage:
                    "linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.1) 2%, transparent 3%)",
                  backgroundSize: "100% 3px",
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.3, times: [0, 0.5, 1] }}
                className="absolute inset-0 bg-blue-500/20 z-29"
              />
            </>
          )}
          {tvEffect === "off" && (
            <>
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 bg-black origin-center z-30"
                style={{
                  backgroundImage:
                    "linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.05) 2%, transparent 3%)",
                  backgroundSize: "100% 3px",
                }}
              />
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute inset-0 bg-white/5 z-29"
              />
            </>
          )}
        </AnimatePresence>

        {/* Windows Logo Watermark */}
        <motion.div
          initial={false}
          animate={{
            opacity: isConnected ? 0.1 : 0.05,
            scale: isConnected ? 1 : 0.95,
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-32 h-32 text-white/10">
            <svg viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="currentColor"
                d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.011 41.34-47.318-6.677-.066-34.739z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Disconnected State */}
        {/* <AnimatePresence>
          {!isConnected && !poweringOn && !poweringOff && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm z-20"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-4"
              >
                <MonitorOff className="h-16 w-16 text-white/50" />
                <span className="text-white/70 text-sm">Not Connected</span>
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={handleConnect}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence> */}

        {/* Toolbar - Hidden in fullscreen */}
        {!isFullscreen && (
          <div className="absolute top-4 right-4 flex gap-2 z-[999]">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 border-0 hover:bg-white/90 dark:hover:bg-gray-800/90 backdrop-blur-sm"
              onClick={() => {
                // Toggle network settings functionality can be added here
              }}
            >
              <Signal className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Open in New Window"
              className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 border-0 hover:bg-white/90 dark:hover:bg-gray-800/90 backdrop-blur-sm"
              onClick={openNewSession}
            >
              <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 border-0 hover:bg-white/90 dark:hover:bg-gray-800/90 backdrop-blur-sm"
              onClick={() => {
                if (connRef.current) {
                  connRef.current.sendKeyboardShortcut([
                    { key: "Control", location: 1 },
                    { key: "Meta", location: 1 },
                    { key: "o", location: 0 },
                  ]);
                  console.log("Sent Ctrl + Win + O to open OSK");
                }
              }}
            >
              <Keyboard className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 border-0 hover:bg-white/90 dark:hover:bg-gray-800/90 backdrop-blur-sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Maximize className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
          </div>
        )}

        {/* DCV Viewer */}
        {isConnected && !tvEffect && dcvSession && (
          <DCVViewer
            sessionId={dcvSession.sessionId}
            authToken={dcvSession.sessionToken}
            onConnect={() => {
              setConnectionState("CONNECTED");
              setIsConnected(true);
            }}
            onDisconnect={() => {
              setConnectionState("DISCONNECTED");
              setIsConnected(false);
              setDcvSession(null);
            }}
            onError={(error) => {
              setDcvError(error);
              setConnectionState("DISCONNECTED");
              setIsConnected(false);
              setDcvSession(null);
            }}
            quality={quality as "low" | "medium" | "high" | "auto"}
            inputSettings={{
              keyboard: keyboardEnabled,
              mouse: mouseEnabled,
              touch: dcvConfig.touch,
              audio: audioEnabled,
            }}
          />
        )}

        {/* Error Display */}
        {/* {dcvError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="bg-red-500/10 backdrop-blur-sm p-6 rounded-lg max-w-md text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-500 mb-2">
                Connection Error
              </h3>
              <p className="text-gray-200 mb-4">{dcvError.message}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setDcvError(null);
                  handleConnect();
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        )} */}
      </div>
      {/* sidebar  */}
      <div className="relative flex">
        {!isFullscreen && !isSidebarOpen && (
          <Button
            variant="outline"
            className="absolute right-0 top-4 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            onClick={() => setIsSidebarOpen(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {!isFullscreen && (
          <div
            className={cn(
              "fixed right-0 top-0 h-full min-w-[25%] max-w-[55%] w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-6 overflow-y-auto transform transition-transform duration-300 ease-in-out z-50",
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <Button
              variant="ghost"
              className="self-end"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </Button>

            {/* Connection Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      connectionState === "CONNECTED" ? "default" : "secondary"
                    }
                    className={cn(
                      "font-medium",
                      connectionState === "CONNECTED" &&
                        "bg-green-500/10 text-green-500",
                      connectionState === "DISCONNECTED" &&
                        "bg-red-500/10 text-red-500",
                      connectionState === "RECONNECTING" &&
                        "bg-yellow-500/10 text-yellow-500"
                    )}
                  >
                    {connectionState}
                  </Badge>
                </div>

                {connectionState === "CONNECTED" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Latency
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {connectionStats.latency}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">FPS</span>
                      <Badge variant="outline" className="font-mono">
                        {connectionStats.fps}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Quality
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {connectionStats.quality}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Data Transferred
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {connectionStats.dataTransferred}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Uptime
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {connectionStats.uptime}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quality Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quality Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Quality Preset</Label>
                    {/* <Select value={quality} onValueChange={handleQualityChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select> */}
                    <Badge variant="outline" className="font-mono">
                      Auto
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Bandwidth Limit</Label>
                    <span className="text-sm text-muted-foreground">
                      {bandwidth}%
                    </span>
                  </div>
                  <Slider
                    value={[bandwidth]}
                    onValueChange={(value) => setBandwidth(value[0])}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* Input Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Input Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4 text-muted-foreground" />
                    <Label>Keyboard</Label>
                  </div>
                  <Switch
                    checked={keyboardEnabled}
                    onCheckedChange={setKeyboardEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mouse className="h-4 w-4 text-muted-foreground" />
                    <Label>Mouse</Label>
                  </div>
                  <Switch
                    checked={mouseEnabled}
                    onCheckedChange={setMouseEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Label>Audio</Label>
                  </div>
                  <Switch
                    checked={audioEnabled}
                    onCheckedChange={setAudioEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Label>Encryption</Label>
                  </div>
                  <Switch
                    checked={encryption}
                    onCheckedChange={setEncryption}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Usb className="h-4 w-4 text-muted-foreground" />
                    <Label>USB Devices</Label>
                  </div>
                  <Switch
                    checked={usbEnabled}
                    onCheckedChange={setUsbEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Glasses className="h-4 w-4 text-muted-foreground" />
                    <Label>VR Mode</Label>
                  </div>
                  <Switch checked={vrEnabled} onCheckedChange={setVrEnabled} />
                </div>
              </div>
            </div>

            {/* Connection Actions */}
            <div className="mt-auto space-y-2">
              {isConnected ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Power className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Disconnecting..." : "Disconnect"}
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleConnect}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Power className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Connecting..." : "Connect"}
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={openNewSession}
              >
                <MonitorPlay className="h-4 w-4 mr-2" />
                Open New Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main page component
const PCViewerPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      }
    >
      <PCViewerContent />
    </Suspense>
  );
};

export default PCViewerPage;
