"use client";

/* ---- Types ---- */
import type { RootState } from "@/redux/store";

/* ---- External (alias first, then next/react) ---- */
import { useSearchParams } from "next/navigation";
import DCVViewer from "@/app/pc-viewer/_components/dcv-viewer";
import { selectLaunchVMResponse } from "@/redux/slices/dcv/dcv-slice";
import React, { useRef, useState, Suspense, useEffect, useCallback } from "react";

/* ---- External: custom-shadcn (must be before custom-redux) ---- */
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ---- External: custom-redux ---- */
import { useSelector } from "react-redux";

/* ---- External: custom-ui ---- */
import { motion, AnimatePresence } from "framer-motion";
import { X ,
  Power,
  Monitor,
  Loader2,
  Keyboard,
  Maximize,
  Minimize,
  FolderDown,
  MonitorPlay,
  ChevronLeft,
} from "lucide-react";

/* ---- Relative ---- */
import dcv from "../../../public/dcvjs/dcv";
import FileStorageModal from "./_components/file-storage-modal";
import { looksLikeDcvConn } from "./_components/file-transfer/types"; // adjust path

/* ---------------- Types ---------------- */

type ConnectionState = "CONNECTED" | "DISCONNECTED" | "RECONNECTING";

interface KeyboardShortcutKey {
  key: string;
  location: number;
}

type Head = {
  name: string;
  rect: { x: number; y: number; width: number; height: number };
  primary?: boolean;
  dpi?: number;
};

interface DcvConnection {
  requestResolution: (width: number, height: number) => Promise<void> | void;
  disconnect: () => Promise<void> | void;
  getStats: () => Promise<{ latency: number; fps: number }>;
  sendKeyboardShortcut: (keys: KeyboardShortcutKey[]) => void;
  setDisplayQuality: (min: number, max: number) => void;

  requestDisplayLayout?: (
    layout: Array<{ name: string; rect: { x: number; y: number; width: number; height: number } }>
  ) => Promise<void> | void;
  setMinDisplayResolution?: (w: number, h: number) => void;
  setMaxDisplayResolution?: (w: number, h: number) => void;
  enableDisplayQualityUpdates?: (enabled: boolean) => void;
  enableHighPixelDensity?: (enabled: boolean) => void;

  // Optional device & transfer APIs (feature-detected at runtime)
  setWebcam?: (enabled: boolean, deviceId?: string) => Promise<void> | void;
  _lastHeads?: Head[];
  _sensepcCleanup?: () => void;
}


/* ---------------- Utils ---------------- */

function debounce<T extends (...args: unknown[]) => void>(fn: T, wait = 120) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), wait);
  };
}

function getContainerSize() {
  const el = document.getElementById("remote-desktop");
  const cw = Math.max(0, el?.clientWidth ?? 0);
  const ch = Math.max(0, el?.clientHeight ?? window.innerHeight);
  return { cw, ch };
}

function headsBBox(heads: Head[]) {
  const minX = Math.min(...heads.map((h) => h.rect.x));
  const minY = Math.min(...heads.map((h) => h.rect.y));
  const maxX = Math.max(...heads.map((h) => h.rect.x + h.rect.width));
  const maxY = Math.max(...heads.map((h) => h.rect.y + h.rect.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function buildFittedLayout(heads: Head[], containerW: number, containerH: number) {
  if (!heads.length || containerW <= 0 || containerH <= 0) return null;
  const bbox = headsBBox(heads);
  const scale = Math.min(containerW / bbox.width, containerH / bbox.height) || 1;

  const layoutWidth = Math.round(bbox.width * scale);
  const layoutHeight = Math.round(bbox.height * scale);
  const offsetX = Math.floor((containerW - layoutWidth) / 2) - Math.round(bbox.x * scale);
  const offsetY = Math.floor((containerH - layoutHeight) / 2) - Math.round(bbox.y * scale);

  const layout = heads.map((h) => ({
    name: h.name,
    rect: {
      x: Math.round(h.rect.x * scale + offsetX),
      y: Math.round(h.rect.y * scale + offsetY),
      width: Math.max(1, Math.round(h.rect.width * scale)),
      height: Math.max(1, Math.round(h.rect.height * scale)),
    },
    primary: h.primary ?? false,
    dpi: h.dpi,
  }));

  return { layout, scaledBBox: { width: layoutWidth, height: layoutHeight } };
}

function isChromium(): boolean {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
  return typeof window !== "undefined" && (!!(window as { chrome?: unknown }).chrome || ua.includes("edg/"));
}
function triggerBrowserDownload(url: string, filename?: string) {
  if (!url) return;
  try {
    const a = document.createElement("a");
    a.href = filename
      ? `${url}${url.includes("?") ? "&" : "?"}filename=${encodeURIComponent(filename)}`
      : url;
    a.download = filename ?? "";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.open(url, "_blank", "noopener");
  }
}


/* ---------------- Page ---------------- */

const DCViewerContent: React.FC = () => {
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  const instanceId = sessionParam ? atob(sessionParam) : null;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>("DISCONNECTED");
  const [quality, setQuality] = useState("auto");
  const [keyboardEnabled] = useState(true);
  const [mouseEnabled] = useState(true);
  const [audioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [tvEffect, setTvEffect] = useState<"on" | "off" | null>("on");
  const [_dcvError, setDcvError] = useState<Error | null>(null); // used via no-op below

  const dcvConfig = { quality: "high", keyboard: true, mouse: true, touch: true, audio: true };

  const [dcvSession] = useState<{ sessionId: string; sessionToken: string } | null>(null);
  const connRef = useRef<DcvConnection | null>(null);

  const [connectionStats, setConnectionStats] = useState({
    latency: "0ms",
    fps: "0",
    quality: "0%",
    dataTransferred: "0 MB",
    uptime: "0m",
  });

  // Tooltips / notices
  const NOT_SUPPORTED_TIP =
    "This capability isn’t available in the web viewer. Please use the NICE DCV desktop client to access it.";
  const CAMERA_LIMIT_TIP =
    "Webcam redirection in the web viewer requires Chrome or Edge and a Windows-based DCV server. Safari/Firefox aren’t supported.";

  // Camera state
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [_webcamDeviceId, setWebcamDeviceId] = useState<string | undefined>(undefined); // used via no-op below
  const [webcamError, setWebcamError] = useState<string | null>(null);


  const launchVMResponse = useSelector((state: RootState) =>
    instanceId ? selectLaunchVMResponse(state, instanceId) : null
  );

  const sessionId = launchVMResponse?.sessionId;
  const authToken = launchVMResponse?.sessionToken;
  const url = launchVMResponse?.dnsName;

  const [isLoading, setIsLoading] = useState(false);

  // Ensure “unused” state vars are consumed (no-op reads to satisfy eslint)
  void _dcvError;
  void _webcamDeviceId;

  // Mobile detector
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  const handleQualityChange = (value: string) => {
    setQuality(value);
    const c = connRef.current;
    if (!c) return;
    switch (value) {
      case "low":
        c.setDisplayQuality(10, 25);
        break;
      case "medium":
        c.setDisplayQuality(40, 60);
        break;
      case "high":
        c.setDisplayQuality(80, 100);
        break;
      case "auto":
      default:
        c.setDisplayQuality(0, 100);
        break;
    }
  };

  const updateResolution = useCallback(() => {
    const c = connRef.current;
    if (!c) return;
    const { cw, ch } = getContainerSize();
    try {
      c.setMaxDisplayResolution?.(cw, ch);
    } catch {
      /* no-op */
    }
    try {
      c.requestResolution?.(cw, ch);
    } catch {
      /* no-op */
    }
  }, []);

  useEffect(() => {
    const el = document.getElementById("remote-desktop");
    const noop = (): void => {};
    if (!el) return noop;

    const debounced = debounce(() => updateResolution(), 120);
    const ro = new ResizeObserver(() => debounced());
    ro.observe(el);

    const onFs = (): void => {
      updateResolution();
    };
    document.addEventListener("fullscreenchange", onFs);

    return (): void => {
      ro.disconnect();
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [updateResolution]);

  // ---- Camera helpers ----
  async function requestAndEnableWebcam() {
    const c = connRef.current;
    if (!c?.setWebcam) throw new Error("DCV webcam API not available.");
    if (!isChromium()) throw new Error("Use Chrome/Edge to enable webcam.");

    await navigator.mediaDevices.getUserMedia({ video: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter((d) => d.kind === "videoinput");
    if (!cams.length) throw new Error("No camera detected.");

    const preferred = cams[0];
    await c.setWebcam(true, preferred.deviceId);
    setWebcamDeviceId(preferred.deviceId);
    setWebcamEnabled(true);
    setWebcamError(null);
  }

  async function disableWebcam() {
    const c = connRef.current;
    if (!c?.setWebcam) return;
    await c.setWebcam(false);
    setWebcamEnabled(false);
  }

  async function handleToggleWebcam() {
    try {
      if (!connRef.current) throw new Error("Not connected.");
      if (webcamEnabled) await disableWebcam();
      else await requestAndEnableWebcam();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setWebcamError(msg);
    }
  }


  // ---- Connect & auto-fit ----
  const connectToDcv = async (): Promise<void> => {
    const assetsPath = "/dcvjs";           // matches /public/dcvjs/*
    const gatewayBase = `https://${url}`;  // DCV Gateway host (no manual port)

    if (connRef.current) return;
    if (!(sessionId && authToken)) return;

    setTvEffect("on");
    setIsLoading(true);
    setConnectionState("RECONNECTING");

    const fitToContainer = async (heads?: Head[]): Promise<void> => {
      const c = connRef.current;
      if (!c) return;
      const { cw, ch } = getContainerSize();
      if (cw <= 0 || ch <= 0) return;

      try {
        c.setMinDisplayResolution?.(0, 0);
      } catch {
        /* no-op */
      }
      try {
        c.setMaxDisplayResolution?.(cw, ch);
      } catch {
        /* no-op */
      }

      try {
        await c.requestResolution(cw, ch);
      } catch {
        /* no-op */
      }

      if (heads && heads.length > 1 && c.requestDisplayLayout) {
        const built = buildFittedLayout(heads, cw, ch);
        if (built?.layout) {
          try {
            await c.requestDisplayLayout(
              built.layout as Array<{
                name: string;
                rect: { x: number; y: number; width: number; height: number };
              }>
            );
          } catch {
            /* no-op */
          }
        }
      }
    };

    try {
      const isHiDpi = typeof window !== "undefined" && window.devicePixelRatio > 1;
      const conn = (await dcv.connect({
        url: `https://${url}`,
        sessionId,
        authToken,
        useGateway: true,
        divId: "remote-desktop",
        clientHiDpiScaling: !isHiDpi ? true : false,
        assetsBaseUrl: assetsPath,
        baseUrl: assetsPath,
        resourceBaseUrl: gatewayBase,
    callbacks: {
  firstFrame: () => {
    try { conn.enableDisplayQualityUpdates?.(true); } catch {/* no-op */}
    try { conn.enableHighPixelDensity?.(!(window?.devicePixelRatio > 1)); } catch { /* no-op */}
    setIsLoading(false);
    setIsConnected(true);
    handleQualityChange("auto");
    setConnectionState("CONNECTED");
    void fitToContainer(conn._lastHeads); 
    void fitToContainer();
  },

  // moved from observers.displayLayout
  displayLayout: (_serverWidth: number, _serverHeight: number, heads: Head[]) => {
    conn._lastHeads = heads;
    // void fitToContainer(heads);
  },

  // moved from observers.disconnect
  disconnect: () => {
    setIsConnected(false);
    setConnectionState("DISCONNECTED");
    setTvEffect("off");
    setWebcamEnabled(false);
    setWebcamDeviceId(undefined);
    setWebcamError(null);
  },

  // keep these for FileStorage & feature probing
  fileDownload: (_c: unknown, file: { url?: string; filename?: string }) => {
    if (file?.url) triggerBrowserDownload(file.url, file.filename);
  },
  filePrinted: () => {},
  featuresUpdate: () => {},
},

        })) as DcvConnection;

      connRef.current = conn;

      const onResize = debounce(() => {
        void fitToContainer(conn._lastHeads);
      }, 120);
      window.addEventListener("resize", onResize);

      const fsHandler = () => {
        void fitToContainer(conn._lastHeads);
      };
      document.addEventListener("fullscreenchange", fsHandler);

      const cleanup = () => {
        window.removeEventListener("resize", onResize);
        document.removeEventListener("fullscreenchange", fsHandler);
      };
      conn._sensepcCleanup = cleanup;
    } catch (error) {
      setDcvError(error as Error);
      setTvEffect("off");
      setIsLoading(false);
      setIsConnected(false);
      setConnectionState("DISCONNECTED");
    }
  };

  useEffect(() => {
    void connectToDcv();
    return () => {
      const c = connRef.current;
    
      try {
        c?._sensepcCleanup?.();
      } catch {
        /* no-op */
      }
      try {
        c?.disconnect?.();
      } catch {
        /* no-op */
      }
      // Reset device/file-transfer state
      setWebcamEnabled(false);
      setWebcamDeviceId(undefined);
      setWebcamError(null);
      connRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = () => {
    if (!connRef.current && sessionId && authToken) void connectToDcv();
  };

  const handleDisconnect = () => {
    const c = connRef.current;
    if (c) {
      try {
        c._sensepcCleanup?.();
      } catch {
        /* no-op */
      }
      try {
        void c.disconnect();
      } catch {
        /* no-op */
      }
      connRef.current = null;
      setTvEffect("off");
      setIsConnected(false);
      setConnectionState("DISCONNECTED");
      // Reset device/file-transfer state
      setWebcamEnabled(false);
      setWebcamDeviceId(undefined);
      setWebcamError(null);
    }
  };

  // Stats
  const updateStats = async () => {
    if (connRef.current) {
      try {
        const stats = await connRef.current.getStats();
        setConnectionStats((prev) => ({
          ...prev,
          latency: `${Math.round(stats.latency)}ms`,
          fps: `${Math.round(stats.fps)}`,
        }));
      } catch {
        /* no-op */
      }
    }
  };
  useEffect(() => {
    const interval = window.setInterval(updateStats, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const openNewSession = () => {
    const currentUrl = window.location.href;
    const sid = searchParams?.get("sessionId") || Date.now().toString();
    const newUrl = new URL(currentUrl);
    newUrl.searchParams.set("sessionId", sid);
    window.open(newUrl.toString(), "_blank", "width=1024,height=768");
  };

  // Fullscreen the desktop container
  const toggleFullscreen = () => {
    const stage = document.getElementById("pcv-stage");
    if (!stage) return;

    if (!document.fullscreenElement) {
      stage.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { /* no-op */ });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { /* no-op */ });
    }
  };

  // Sidebar open/close -> ask DCV to refit now that the container width changed
  const openSidebar = () => {
    setIsSidebarOpen(true);
    window.setTimeout(() => updateResolution(), 0);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    window.setTimeout(() => updateResolution(), 0);
  };

  // Hover-to-open rail (desktop)
  const autoCloseTimer = useRef<number | null>(null);
  const armAutoClose = () => {
    if (isMobile) return;
    if (autoCloseTimer.current) window.clearTimeout(autoCloseTimer.current);
    autoCloseTimer.current = window.setTimeout(() => setIsSidebarOpen(false), 140);
  };
  const cancelAutoClose = () => {
    if (autoCloseTimer.current) window.clearTimeout(autoCloseTimer.current);
    autoCloseTimer.current = null;
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Fullscreen stage contains BOTH the viewer and the drawer */}
      <div id="pcv-stage" className="fixed inset-0">
        {/* Viewer */}
        <div
          id="remote-desktop"
          className="absolute inset-0 w-[100vw] h-[100dvh] overflow-hidden bg-black z-0"
        />
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

        {/* DCV Viewer (optional path) */}
        {isConnected && !tvEffect && dcvSession && url && (
          <DCVViewer
            url={`https://${url}`}
            sessionId={dcvSession.sessionId}
            authToken={dcvSession.sessionToken}
            onConnect={() => {
              setConnectionState("CONNECTED");
              setIsConnected(true);
            }}
            onDisconnect={() => {
              setConnectionState("DISCONNECTED");
              setIsConnected(false);
            }}
            onError={(error) => {
              setDcvError(error);
              setConnectionState("DISCONNECTED");
              setIsConnected(false);
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

        {/* Chevron rail (inside pcv-stage for fullscreen) */}
        {!isSidebarOpen && (
          <div
            className="pointer-events-auto fixed right-0 top-0 h-full group z-50"
            style={{ width: 8 }}
            onMouseEnter={() => {
              cancelAutoClose();
              openSidebar();
            }}
          >
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full border border-gray-300 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 shadow px-1.5 py-1 text-[10px] font-semibold opacity-80 group-hover:opacity-100">
              <ChevronLeft className="h-3 w-3" />
            </div>
          </div>
        )}

        {/* Mobile overlay (inside pcv-stage for fullscreen) */}
        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeSidebar} />
        )}

        {/* Side Panel (inside pcv-stage for fullscreen) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              id="sidebar-drawer"
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className={cn(
                "pointer-events-auto fixed top-0 right-0 h-full w-56 max-w-[85vw] z-50 flex flex-col overflow-hidden border-l",
                connectionState === "DISCONNECTED"
                  ? "bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 border-zinc-300 dark:border-zinc-700"
                  : "backdrop-blur-md bg-gradient-to-b from-zinc-200/35 via-zinc-300/25 to-zinc-500/20 dark:from-zinc-800/35 dark:via-zinc-700/25 dark:to-zinc-900/20 border-zinc-300/50 dark:border-zinc-700/50"
              )}
              style={
                connectionState === "DISCONNECTED"
                  ? {
                      backgroundImage:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 12%), linear-gradient(180deg, var(--tw-gradient-from), var(--tw-gradient-to))",
                      backgroundBlendMode: "screen, normal",
                    }
                  : {
                      backgroundImage:
                        "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 10%, rgba(255,255,255,0) 25%), linear-gradient(180deg, var(--tw-gradient-from), var(--tw-gradient-to))",
                      backgroundBlendMode: "screen, normal",
                    }
              }
              onMouseLeave={armAutoClose}
              onMouseEnter={cancelAutoClose}
            >
              {/* Header */}
              <div
                className={cn(
                  "flex items-start justify-between p-3 border-b",
                  connectionState === "DISCONNECTED"
                    ? "border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-900/60"
                    : "border-zinc-300/50 dark:border-zinc-700/50 bg-zinc-50/25 dark:bg-zinc-900/20"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-md border flex items-center justify-center shadow-sm",
                      connectionState === "DISCONNECTED"
                        ? "bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                        : "bg-zinc-50/60 dark:bg-zinc-800/60 border-zinc-300/60 dark:border-zinc-700/60"
                    )}
                  >
                    <Monitor className="h-4 w-4" />
                  </div>
                </div>
                <div className="min-w-0 mr-auto ml-2">
                  <div className="text-[10px] uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                    Name
                  </div>
                  <h2
                    className="text-[11px] font-semibold leading-snug uppercase tracking-widest max-w-[9.5rem] line-clamp-2 text-zinc-900 dark:text-zinc-100"
                    title={launchVMResponse?.pcName || ""}
                  >
                    {launchVMResponse?.pcName || "—"}
                  </h2>
                </div>

                <button
                  type="button"
                  aria-label="Close"
                  onClick={closeSidebar}
                  className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center",
                    connectionState === "DISCONNECTED"
                      ? "hover:bg-zinc-200/70 dark:hover:bg-zinc-800/70"
                      : "hover:bg-zinc-200/40 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 space-y-4">
                  {/* Connection Status */}
                  <div
                    className={cn(
                      "rounded-lg border p-3",
                      connectionState === "DISCONNECTED"
                        ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                        : "border-zinc-300/60 dark:border-zinc-700/60 bg-white/55 dark:bg-zinc-900/35"
                    )}
                  >
                    <h3 className="text-sm font-semibold mb-3">Connection Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">Status</span>
                        <Badge
                          variant={connectionState === "CONNECTED" ? "default" : "secondary"}
                          className={cn(
                            "h-5 px-2 text-[11px]",
                            connectionState === "CONNECTED" &&
                              "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20",
                            connectionState === "DISCONNECTED" &&
                              "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
                            connectionState === "RECONNECTING" &&
                              "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                          )}
                        >
                          {connectionState}
                        </Badge>
                      </div>

                      {connectionState === "CONNECTED" && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">Latency</span>
                            <Badge variant="outline" className="font-mono h-5 px-2 text-[11px]">
                              {connectionStats.latency}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">FPS</span>
                            <Badge variant="outline" className="font-mono h-5 px-2 text-[11px]">
                              {connectionStats.fps}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">Quality</span>
                            <Badge variant="outline" className="font-mono h-5 px-2 text-[11px]">
                              {connectionStats.quality}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">Data</span>
                            <Badge variant="outline" className="font-mono h-5 px-2 text-[11px]">
                              {connectionStats.dataTransferred}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">Uptime</span>
                            <Badge variant="outline" className="font-mono h-5 px-2 text-[11px]">
                              {connectionStats.uptime}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>


                  

                  {/* Quality Settings */}
                  <div
                    className={cn(
                      "rounded-lg border p-3",
                      connectionState === "DISCONNECTED"
                        ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                        : "border-zinc-300/60 dark:border-zinc-700/60 bg-white/55 dark:bg-zinc-900/35"
                    )}
                  >
                    <h3 className="text-sm font-semibold mb-3">Quality Settings</h3>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Quality Preset</Label>
                      <Badge variant="outline" className="font-mono h-5 px-2 text-[11px]">
                        Auto
                      </Badge>
                    </div>
                  </div>

                  {/* Input & Devices */}
                  <div
                    className={cn(
                      "rounded-lg border",
                      connectionState === "DISCONNECTED"
                        ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                        : "border-zinc-300/60 dark:border-zinc-700/60 bg-white/55 dark:bg-zinc-900/35"
                    )}
                  >
                    <div className="p-3 border-b border-zinc-300/60 dark:border-zinc-700/60">
                      <h3 className="text-sm font-semibold">Input &amp; Devices</h3>
                    </div>
                    <div className="max-h-48 overflow-auto p-3 space-y-3">
                      {/* Camera (single dynamic button with tooltip) */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs" title={CAMERA_LIMIT_TIP}>Camera</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[11px]"
                          onClick={handleToggleWebcam}
                          disabled={!isConnected}
                          aria-pressed={webcamEnabled}
                          title={CAMERA_LIMIT_TIP}
                        >
                          {webcamEnabled ? "Disable" : "Enable"}
                        </Button>
                      </div>
                      {webcamError && (
                        <div className="text-[11px] text-red-600 dark:text-red-400">
                          {webcamError}
                        </div>
                      )}

                      {/* Items with requested labels & statuses (USB/VR disabled + tooltip) */}
                      {[
                        { label: "Keyboard", key: "keyboard", status: "Enabled" },
                        { label: "Mouse", key: "mouse", status: "Enabled" },
                        { label: "Audio", key: "audio", status: "Enabled" },
                        { label: "Touch", key: "touch", status: "Enabled" },
                        { label: "USB", key: "usb", status: "Disabled", tip: NOT_SUPPORTED_TIP },
                        { label: "VR", key: "vr", status: "Disabled", tip: NOT_SUPPORTED_TIP },
                        { label: "Clipboard Sync", key: "clipboard", status: "Enabled" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <Label className="text-xs" title={item.tip || ""}>{item.label}</Label>
                          <Badge
                            title={item.tip || ""}
                            variant={item.status === "Enabled" ? "default" : "secondary"}
                            className={cn(
                              "h-5 px-2 text-[11px]",
                              item.status === "Enabled"
                                ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20"
                                : "bg-zinc-300/40 text-zinc-700 dark:text-zinc-300 border-zinc-400/30"
                            )}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


                {/* File Transfer (simple box with text + icon) */}
<div
  className={cn(
    "rounded-lg border p-3",
    connectionState === "DISCONNECTED"
      ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
      : "border-zinc-300/60 dark:border-zinc-700/60 bg-white/55 dark:bg-zinc-900/35"
  )}
>
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-semibold">File Transfer</h3>

    <Button
      variant="outline"
      size="icon"
      className={cn(
        "h-7 w-7",
        !isConnected && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => setFileModalOpen(true)}
      disabled={!isConnected}
      title="Open File Storage"
      aria-label="Open File Storage"
    >
      <FolderDown className="h-4 w-4" />
    </Button>
  </div>
</div>


                {/* Bottom Session Control */}
                <div className="relative">
                  <div
                    className={cn(
                      "px-3 py-3 border-t",
                      connectionState === "DISCONNECTED"
                        ? "border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-900/60"
                        : "border-zinc-300/50 dark:border-zinc-700/50 bg-zinc-50/40 dark:bg-zinc-900/40 backdrop-blur"
                    )}
                  >

                    <div className="rounded-lg border p-2 bg-white/70 dark:bg-zinc-900/70 border-zinc-300 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Session Control</span>
                      </div>

            
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <Button variant="outline" className="h-8" title="Open in New Window" onClick={openNewSession}>
                          <MonitorPlay className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="h-8"
                          title="On-Screen Keyboard"
                          onClick={() => {
                            const c = connRef.current;
                            if (c) {
                              c.sendKeyboardShortcut([
                                { key: "Control", location: 1 },
                                { key: "Meta", location: 1 },
                                { key: "o", location: 0 },
                              ]);
                            }
                          }}
                        >
                          <Keyboard className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="h-8"
                          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                      </div>

                      {isConnected ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full h-9"
                          onClick={handleDisconnect}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Power className="h-4 w-4 mr-2" />}
                          {isLoading ? "Disconnecting..." : "Disconnect"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full h-9"
                          onClick={handleConnect}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Power className="h-4 w-4 mr-2" />}
                          {isLoading ? "Connecting..." : "Connect"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
             {/* File Storage Modal (uses live DCV connection) */}
        <FileStorageModal
          conn={looksLikeDcvConn(connRef.current) ? connRef.current : null}
          open={fileModalOpen}
          onOpenChange={setFileModalOpen}
         autoOpenOnGlobalDrag
         title="File storage"
        />
      </div>

      {/* Force every DCV wrapper node to fill the viewport */}
      <style>{`
        #remote-desktop,
        #remote-desktop * {
          box-sizing: border-box;
        }

        /* DCV often injects nested wrappers with fixed px sizes (e.g., 320x240).
           Force all wrappers and the canvas/video to stretch to the viewport. */
        #remote-desktop > div,
        #remote-desktop > div * {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
        }

        #remote-desktop canvas,
        #remote-desktop video {
          object-fit: contain !important; /* use 'cover' if you prefer to crop and truly fill */
          background: transparent !important;
          image-rendering: pixelated; /* scaled small streams look crisper */
        }
      `}</style>
    </div>
  );
};

/* Main page component */
const DCVViewerPage = () => (
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
    <DCViewerContent />
  </Suspense>
);

export default DCVViewerPage;