import React, { useRef, useEffect, useCallback } from "react";

interface InputSettings {
  keyboard: boolean;
  mouse: boolean;
  touch: boolean;
  audio: boolean;
}

interface DisplayHead {
  name: string;
  rect: { x: number; y: number; width: number; height: number };
  primary?: boolean;
  dpi?: number;
}

export interface DCVViewerProps {
  /** Gateway base URL, e.g. https://your-dcv-gateway */
  url: string;
  sessionId: string;
  authToken: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  quality?: "low" | "medium" | "high" | "auto";
  inputSettings?: InputSettings;
}

/** ---- DCV Viewer instance surface (SDK methods vary) ---- */
interface DCVViewerInstance {
  init: (config: {
    url: string;
    sessionId: string;
    authToken: string;
    containerElement: HTMLDivElement;
    useGateway: boolean;
    callbacks: {
      onConnectionStateChange: (state: string) => void;
      onError: (error: Error) => void;
      firstFrame: () => void;
    };
    input: {
      keyboard: boolean;
      mouse: boolean;
      touch: boolean;
      audio: boolean;
      relativeMouse: boolean;
      touchGestures: boolean;
      clipboardForward: boolean;
      clipboardBackward: boolean;
    };
    display: {
      quality: "low" | "medium" | "high" | "auto";
      codec: string;
      width?: number | string;
      height?: number | string;
    };
  }) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;

  setInputEnabled: (type: "keyboard" | "mouse" | "touch" | "audio", enabled: boolean) => void;
  setQualityLevel: (level: "low" | "medium" | "high" | "auto") => void;

  requestResolution?: (w: number, h: number) => Promise<void> | void;
  setMaxDisplayResolution?: (w: number, h: number) => void;
  enableHighPixelDensity?: (enabled: boolean) => void;
  enableDisplayQualityUpdates?: (enabled: boolean) => void;

  connection?: {
    requestResolution?: (w: number, h: number) => Promise<void> | void;
    requestDisplayLayout?: (
      layout: Array<{ name: string; rect: { x: number; y: number; width: number; height: number } }>
    ) => Promise<void> | void;
  };

  setDisplayLayoutCallback?: (
    cb: (serverWidth: number, serverHeight: number, heads: DisplayHead[]) => void
  ) => void;

  _lastHeads?: DisplayHead[];
}

declare global {
  interface Window {
    DCV: {
      Viewer: new () => DCVViewerInstance;
    };
  }
}

/** Debounce helper with typed params */
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms = 120) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}

const DCVViewer: React.FC<DCVViewerProps> = ({
  url,
  sessionId,
  authToken,
  onConnect,
  onDisconnect,
  onError,
  quality = "auto",
  inputSettings = { keyboard: true, mouse: true, touch: true, audio: true },
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const dcvViewerRef = useRef<DCVViewerInstance | null>(null);

  /** Fit server resolution/layout to the current container box */
  const fitToContainer = useCallback((): void => {
    const el = viewerRef.current;
    const dcv = dcvViewerRef.current;
    if (!el || !dcv) return;

    const w = el.clientWidth || window.innerWidth;
    const h = el.clientHeight || window.innerHeight;

    try {
      dcv.setMaxDisplayResolution?.(w, h);
    } catch {
      /* optional API */
    }

    try {
      if (dcv.requestResolution) dcv.requestResolution(w, h);
      else dcv.connection?.requestResolution?.(w, h);
    } catch {
      /* best-effort */
    }
  }, []);

  /** Initialize viewer (called after SDK loads) */
  const initViewer = useCallback(async (): Promise<void> => {
    if (!viewerRef.current || !window.DCV) {
      onError?.(new Error("DCV viewer or container not available"));
      return;
    }

    try {
      const viewer = new window.DCV.Viewer();

      const w = viewerRef.current.clientWidth || window.innerWidth;
      const h = viewerRef.current.clientHeight || window.innerHeight;

      await viewer.init({
        url,
        sessionId,
        authToken,
        containerElement: viewerRef.current,
        useGateway: true,
        callbacks: {
          onConnectionStateChange: (state: string) => {
            if (state === "CONNECTED") onConnect?.();
            else if (state === "DISCONNECTED") onDisconnect?.();
          },
          onError: (error: Error) => onError?.(error),
          firstFrame: () => {
            try {
              viewer.enableHighPixelDensity?.(true);
            } catch {
              /* optional API */
            }
            try {
              viewer.enableDisplayQualityUpdates?.(true);
            } catch {
              /* optional API */
            }
            fitToContainer();
          },
        },
        input: {
          keyboard: inputSettings.keyboard,
          mouse: inputSettings.mouse,
          touch: inputSettings.touch,
          audio: inputSettings.audio,
          relativeMouse: true,
          touchGestures: true,
          clipboardForward: true,
          clipboardBackward: true,
        },
        display: {
          quality,
          codec: "h264",
          width: w,
          height: h,
        },
      });

      try {
        viewer.setDisplayLayoutCallback?.((_sw, _sh, heads) => {
          viewer._lastHeads = heads;
          fitToContainer();
        });
      } catch {
        /* optional API */
      }

      dcvViewerRef.current = viewer;
      await viewer.connect();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Failed to initialize DCV viewer"));
    }
  }, [url, sessionId, authToken, quality, inputSettings, onConnect, onDisconnect, onError, fitToContainer]);

  /** Load SDK once and initialize viewer */
  useEffect(() => {
    let mounted = true;
    let script: HTMLScriptElement | null = null;

    const loadDCVSDK = async (): Promise<void> => {
      try {
        script = document.createElement("script");
        script.src = "https://download.nice-dcv.com/latest/web-client/js/dcv-sdk.js";
        script.async = true;

        await new Promise<void>((resolve, reject) => {
          if (!script) {
            reject(new Error("Script element not created"));
            return;
          }
          script.onload = () => {
            if (mounted) resolve();
          };
          script.onerror = () => reject(new Error("Failed to load DCV SDK"));
          document.body.appendChild(script);
        });

        if (mounted) await initViewer();
      } catch (error) {
        if (mounted) {
          onError?.(error instanceof Error ? error : new Error("Failed to load DCV SDK"));
        }
      }
    };

    loadDCVSDK();

    return (): void => {
      mounted = false;
      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
      const v = dcvViewerRef.current;
      dcvViewerRef.current = null;
      try {
        v?.disconnect();
      } catch {
        /* ignore */
      }
    };
  }, [initViewer, onError]);

  /** React to container size changes (more accurate than window resize) */
  useEffect(() => {
    const el = viewerRef.current;
    const noop = (): void => {};
    if (!el) return noop;
  
    const refit = debounce(() => fitToContainer(), 120);
    const ro = new ResizeObserver(() => refit());
    ro.observe(el);
  
    const onFs = (): void => {
      fitToContainer();
    };
    document.addEventListener("fullscreenchange", onFs);
  
    return (): void => {
      ro.disconnect();
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [fitToContainer]);  

  /** Apply input/quality toggles after init */
  useEffect(() => {
    const v = dcvViewerRef.current;
    if (!v) return;
    v.setInputEnabled("keyboard", inputSettings.keyboard);
    v.setInputEnabled("mouse", inputSettings.mouse);
    v.setInputEnabled("touch", inputSettings.touch);
    v.setInputEnabled("audio", inputSettings.audio);
  }, [inputSettings]);

  useEffect(() => {
    const v = dcvViewerRef.current;
    if (!v) return;
    v.setQualityLevel(quality);
  }, [quality]);

  return (
    <div
      ref={viewerRef}
      id="dcv-display"
      className="absolute inset-0 w-full h-full bg-black overflow-hidden"
    />
  );
};

export default DCVViewer;
