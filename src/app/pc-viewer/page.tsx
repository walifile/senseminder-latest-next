"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useRef,
} from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import DCVViewer from "@/app/pc-viewer/_components/dcv-viewer";
import { useSelector } from "react-redux";
import { selectLaunchVMResponse } from "@/redux/slices/dcv/dcv-slice";
import dcv from "../../../public/dcvjs/dcv";

// Add ConnectionState type
type ConnectionState = "CONNECTED" | "DISCONNECTED" | "RECONNECTING";

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
  const [showKeyboard, setShowKeyboard] = useState(false);
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

  console.log(dcvError);
  const [dcvSession, setDcvSession] = useState<{
    sessionId: string;
    sessionToken: string;
  } | null>(null);

  // Function to start DCV session
  const startDCVSession = useCallback(async () => {
    try {
      setConnectionState("RECONNECTING");
      setTvEffect("on");

      // Call your session manager service to get session details
      const response = await fetch("/api/dcv-session-manager/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pcName: searchParams?.get("name"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create DCV session");
      }

      const sessionData = await response.json();
      setDcvSession({
        sessionId: sessionData.sessionId,
        sessionToken: sessionData.sessionToken,
      });

      setConnectionState("CONNECTED");
      setIsConnected(true);
      setTvEffect(null);
    } catch (error) {
      console.error("Failed to start DCV session:", error);
      setDcvError(error as Error);
      setConnectionState("DISCONNECTED");
      setIsConnected(false);
      setTvEffect(null);
    }
  }, [
    searchParams,
    setConnectionState,
    setTvEffect,
    setDcvSession,
    setIsConnected,
    setDcvError,
  ]);

  useEffect(() => {
    if (!isConnected && !dcvSession) {
      startDCVSession();
    }
  }, [isConnected, dcvSession, startDCVSession]);

  useEffect(() => {
    // Initial connection animation when component mounts
    setConnectionState("RECONNECTING");
    setTimeout(() => {
      setConnectionState("CONNECTED");
      setIsConnected(true);
      setTvEffect(null);
    }, 2000);
  }, []); // This is fine as it's only for initial mount

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

  const connectionStats = {
    latency: "45ms",
    fps: "30",
    quality: "85%",
    dataTransferred: "1.2 GB",
    uptime: "2h 15m",
  };

  // const handleImageError = () => {
  //   console.error("Failed to load preview image");
  //   setImageError(true);
  // };

  // // Add power on/off animation handlers
  // const handlePowerOn = () => {
  //   setPoweringOn(true);
  //   setTimeout(() => {
  //     setPoweringOn(false);
  //     setIsConnected(true);
  //   }, 1500); // Duration of power on animation
  // };

  // const handlePowerOff = () => {
  //   setPoweringOff(true);
  //   setTimeout(() => {
  //     setPoweringOff(false);
  //     setIsConnected(false);
  //   }, 1500); // Duration of power off animation
  // };

  const handleConnect = () => {
    setConnectionState("RECONNECTING");
    setTvEffect("on");
    setTimeout(() => {
      setConnectionState("CONNECTED");
      setIsConnected(true);
      setTvEffect(null);
    }, 2000);
  };

  const handleDisconnect = async () => {
    setTvEffect("off");
    setConnectionState("DISCONNECTED");

    try {
      // Call your session manager service to end the session
      if (dcvSession) {
        await fetch("/api/dcv-session-manager/end", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: dcvSession.sessionId,
          }),
        });
      }
    } catch (error) {
      console.error("Failed to end DCV session:", error);
    }

    setDcvSession(null);
    setIsConnected(false);
    setTvEffect(null);
  };

  const openNewSession = () => {
    const currentUrl = window.location.href;
    const sessionId = searchParams?.get("sessionId") || Date.now().toString();
    const newUrl = new URL(currentUrl);
    newUrl.searchParams.set("sessionId", sessionId);
    window.open(newUrl.toString(), "_blank", "width=1024,height=768");
  };
  // my

  const launchVMResponse = useSelector(selectLaunchVMResponse);
  const connectButtonRef = useRef<HTMLButtonElement | null>(null);
  const sessionId = launchVMResponse?.sessionId;
  const authToken = launchVMResponse?.sessionToken;
  const url = launchVMResponse?.dnsName;

  const [hasClicked, setHasClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connectToDcv = async () => {
    if (sessionId && authToken && !hasClicked) {
      setHasClicked(true);
      setIsLoading(true);

      try {
        const conn = await dcv.connect({
          url: `https://${url}`,
          sessionId,
          authToken,
          useGateway: true,
          divId: "remote-desktop",
          callbacks: {
            firstFrame: () => console.log("First frame received"),
          },
        });
        console.log("Connection established:", conn);
      } catch (error) {
        console.error("Connection failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (connectButtonRef.current && !hasClicked) {
        console.log({ idh: "Dfdf" });
        connectButtonRef.current.click();
      }
    }, 0);
  }, [hasClicked]);

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      <button
        ref={connectButtonRef}
        onClick={() => connectToDcv()}
        className="hidden"
      ></button>
      {/* Main Remote Desktop Area */}
      <div
        id="remote-desktop"
        className="flex-1 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden"
      >
        <button
          ref={connectButtonRef}
          onClick={() => connectToDcv()}
          className="hidden"
        ></button>
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
              onClick={() => setShowKeyboard(!showKeyboard)}
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

        {/* On-screen Keyboard */}
        {showKeyboard && !isFullscreen && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg p-4 z-30">
            <div className="flex flex-col gap-1.5">
              {/* Function Keys Row */}
              <div className="flex gap-1">
                {[
                  "Esc",
                  "F1",
                  "F2",
                  "F3",
                  "F4",
                  "F5",
                  "F6",
                  "F7",
                  "F8",
                  "F9",
                  "F10",
                  "F11",
                  "F12",
                ].map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-8 flex-1 text-sm bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700"
                  >
                    {key}
                  </Button>
                ))}
              </div>
              {/* Number Row */}
              <div className="flex gap-1">
                {[
                  "`",
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "0",
                  "-",
                  "=",
                  "Backspace",
                ].map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className={cn(
                      "h-8 text-sm bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700",
                      key === "Backspace" ? "flex-[1.5]" : "flex-1"
                    )}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
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

      {/* Side Control Panel - Hidden in fullscreen mode */}
      {!isFullscreen && (
        <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-6">
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
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Switch checked={encryption} onCheckedChange={setEncryption} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Usb className="h-4 w-4 text-muted-foreground" />
                  <Label>USB Devices</Label>
                </div>
                <Switch checked={usbEnabled} onCheckedChange={setUsbEnabled} />
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
              >
                <Power className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full"
                onClick={handleConnect}
              >
                <Power className="h-4 w-4 mr-2" />
                Connect
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
