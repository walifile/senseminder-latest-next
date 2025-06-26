"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import {
  Power,
  Keyboard,
  Mouse,
  Volume2,
  Shield,
  Maximize,
  Monitor,
  Signal,
  MonitorPlay,
  Minimize,
  Usb,
  Glasses,
  Loader2,
  ChevronLeft,
  X,
  ChevronRight,
  Menu,
  Settings,
  ChevronsRightLeft,
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
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("DISCONNECTED");
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
  const [isMobile, setIsMobile] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
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
  const [isResizing, setIsResizing] = useState(false);


  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

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
const lastResolutionKeyRef = useRef<string | null>(null);

const updateResolution = useCallback(() => {
  const container = document.getElementById("remote-desktop");
  if (!connRef.current || !container) return;
  
  // Get actual computed dimensions
  const rect = container.getBoundingClientRect();
  const width = Math.floor(rect.width);
  const height = Math.floor(window.innerHeight);
  
  // Only update if dimensions actually changed
  const currentKey = `${width}x${height}`;
  if (lastResolutionKeyRef.current === currentKey) return;
  lastResolutionKeyRef.current = currentKey;
  
  console.log("Updating resolution:", width, height);
  connRef.current
    .requestResolution(width, height)
    .catch((e) => console.warn("Failed to request resolution:", e));
}, []);
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

        const handleResize = () => {
          if (isResizing) return;

          setIsResizing(true);
          updateResolution();

          setTimeout(() => {
            setIsResizing(false);
          }, 100);
        };

        window.addEventListener("resize", handleResize);
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


useEffect(() => {
  let rafId: number;
  
  const handleResize = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      updateResolution();
    });
  };

  window.addEventListener("resize", handleResize, { passive: true });
  
  return () => {
    window.removeEventListener("resize", handleResize);
    cancelAnimationFrame(rafId);
  };
}, [updateResolution]);

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

const openSidebar = useCallback(() => {
  setIsSidebarOpen(true);
  // Immediate resize after sidebar opens
  setTimeout(() => {
    updateResolution();
  }, 0);
}, [updateResolution]);

const closeSidebar = useCallback(() => {
  setIsSidebarOpen(false);
  // Immediate resize after sidebar closes
  setTimeout(() => {
    updateResolution();
  }, 0);
}, [updateResolution]);

// Also, replace the existing useEffect that handles sidebar state changes with this:

useEffect(() => {
  // Trigger immediate resize on sidebar state change
  updateResolution();
}, [isSidebarOpen, updateResolution]);

useEffect(() => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  const handleUpdate = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      updateResolution();
    }, 250); // Wait for CSS transition to complete
  };
  
  // Trigger on sidebar state change
  handleUpdate();
  
  return () => clearTimeout(timeoutId);
}, [isSidebarOpen, updateResolution]);

  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Main Remote Desktop Area */}
       <div
  id="remote-desktop"
  className="flex-1 relative overflow-hidden bg-black transition-all duration-200 ease-out"
  style={{
    marginRight: isSidebarOpen && !isMobile ? '320px' : '0px'
  }}
>
        {/* TV On/Off Animation */}
        <AnimatePresence>
          {isLoading && (
            <>
              <motion.div
                initial={{ scaleY: 0, opacity: 1 }}
                animate={{ scaleY: 1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 bg-white dark:bg-gray-900 origin-center z-30"
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
          className="absolute inset-0 flex items-center  justify-center pointer-events-none"
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

        {/* Mobile Sidebar Toggle - Top Left */}
        {!isFullscreen && !isSidebarOpen && (
          <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
            {/* Left side - Menu button */}
            <Button
              variant="outline"
              size="icon"
              className="bg-white/90 z-50 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white dark:hover:bg-gray-800"
              onClick={openSidebar}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Desktop Toolbar - Left Side */}
        <AnimatePresence>
          {!isMobile && !showQuickActions && !isFullscreen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 flex flex-col gap-2 z-40"
            >
              {/* Network Button */}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-white/90 dark:bg-gray-800/90 border-0 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm shadow-lg"
                title="Network Status"
              >
                <Signal className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </Button>

              {/* New Window Button */}
              <Button
                variant="outline"
                size="icon"
                title="Open in New Window"
                className="h-10 w-10 bg-white/90 dark:bg-gray-800/90 border-0 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm shadow-lg"
                onClick={openNewSession}
              >
                <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </Button>

              {/* Keyboard Button */}
              <Button
                variant="outline"
                size="icon"
                title="Open On-Screen Keyboard"
                className="h-10 w-10 bg-white/90 dark:bg-gray-800/90 border-0 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm shadow-lg"
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

              {/* Fullscreen Toggle Button */}
              <Button
                variant="outline"
                size="icon"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                className="h-10 w-10 bg-white/90 dark:bg-gray-800/90 border-0 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm shadow-lg"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Maximize className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

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
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && !isFullscreen && (
<motion.div
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={{ 
    type: "tween", // Change from spring to tween for predictable timing
    duration: 0.2, // Match CSS transition duration
    ease: "easeOut"
  }}
  className={cn(
    "bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden z-50",
    isMobile
      ? "fixed top-0 right-0 h-full w-80 max-w-[85vw]"
      : "fixed top-0 right-0 h-full w-80"
  )}
>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/90 z-50 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white dark:hover:bg-gray-800"
                  onClick={toggleQuickActions}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">PC Controls</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  closeSidebar();
                  setShowQuickActions(true);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Connection Status */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Connection Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge
                      variant={
                        connectionState === "CONNECTED"
                          ? "default"
                          : "secondary"
                      }
                      className={cn(
                        "font-medium",
                        connectionState === "CONNECTED" &&
                        "bg-green-500/10 text-green-500 border-green-500/20",
                        connectionState === "DISCONNECTED" &&
                        "bg-red-500/10 text-red-500 border-red-500/20",
                        connectionState === "RECONNECTING" &&
                        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
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
                        <span className="text-sm text-muted-foreground">
                          FPS
                        </span>
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
                    <Switch
                      checked={vrEnabled}
                      onCheckedChange={setVrEnabled}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main page component
const PCViewerPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Loading PC Viewer...</span>
          </div>
        </div>
      }
    >
      <PCViewerContent />
    </Suspense>
  );
};
export default PCViewerPage;