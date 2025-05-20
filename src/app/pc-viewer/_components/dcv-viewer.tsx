import React, { useEffect, useRef, useCallback } from "react";

interface DCVViewerProps {
  sessionId: string;
  authToken: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  quality?: "low" | "medium" | "high" | "auto";
  inputSettings?: {
    keyboard: boolean;
    mouse: boolean;
    touch: boolean;
    audio: boolean;
  };
}

// Specify the type for DCV.Viewer

interface InputSettings {
  keyboard: boolean;
  mouse: boolean;
  touch: boolean;
  audio: boolean;
}

// Specify the type for DCV.Viewer
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
      width: string;
      height: string;
    };
  }) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  setInputEnabled: (type: string, enabled: boolean) => void;
  setQualityLevel: (level: string) => void;
}
interface DCVViewerProps {
  sessionId: string;
  authToken: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  quality?: "low" | "medium" | "high" | "auto";
  inputSettings?: InputSettings;
}

declare global {
  interface Window {
    DCV: {
      Viewer: new () => DCVViewerInstance;
    };
  }
}

const DCVViewer: React.FC<DCVViewerProps> = ({
  sessionId,
  authToken,
  onConnect,
  onDisconnect,
  onError,
  quality = "auto",
  inputSettings = {
    keyboard: true,
    mouse: true,
    touch: true,
    audio: true,
  },
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  // Use the type DCVViewerInstance instead of any
  const dcvViewerRef = useRef<DCVViewerInstance | null>(null);

  const initViewer = useCallback(async () => {
    if (!viewerRef.current || !window.DCV) {
      onError?.(new Error("DCV viewer or container not available"));
      return;
    }

    try {
      // Initialize DCV viewer
      const viewer = new window.DCV.Viewer();

      // Configure the viewer with the updated parameters
      await viewer.init({
        url: "https://mypc.smartpc.cloud",
        sessionId,
        authToken,
        containerElement: viewerRef.current,
        useGateway: true, // Enable gateway usage
        callbacks: {
          onConnectionStateChange: (state: string) => {
            if (state === "CONNECTED") {
              onConnect?.();
            } else if (state === "DISCONNECTED") {
              onDisconnect?.();
            }
          },
          onError: (error: Error) => {
            onError?.(error);
          },
          firstFrame: () => {
            console.log("First frame received");
            // You might want to trigger some UI feedback here
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
          quality: quality,
          codec: "h264",
          width: "100%",
          height: "100%",
        },
      });

      dcvViewerRef.current = viewer;

      // Start the connection
      await viewer.connect();
    } catch (error) {
      console.error("Failed to initialize DCV viewer:", error);
      onError?.(
        error instanceof Error
          ? error
          : new Error("Failed to initialize DCV viewer")
      );
    }
  }, [
    sessionId,
    authToken,
    quality,
    inputSettings,
    onConnect,
    onDisconnect,
    onError,
  ]);

  // Load DCV SDK
  useEffect(() => {
    let mounted = true;
    let script: HTMLScriptElement | null = null;

    const loadDCVSDK = async () => {
      try {
        // Load the DCV SDK from AWS's CDN
        script = document.createElement("script");
        script.src =
          "https://download.nice-dcv.com/latest/web-client/js/dcv-sdk.js";
        script.async = true;

        // Wait for the SDK to load
        await new Promise<void>((resolve, reject) => {
          if (!script) return reject(new Error("Script element not created"));

          script.onload = () => {
            if (mounted) resolve();
          };
          script.onerror = () => reject(new Error("Failed to load DCV SDK"));
          document.body.appendChild(script);
        });

        // Initialize viewer after SDK loads
        if (mounted) {
          await initViewer();
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to load DCV SDK:", error);
          onError?.(
            error instanceof Error ? error : new Error("Failed to load DCV SDK")
          );
        }
      }
    };

    loadDCVSDK();

    return () => {
      mounted = false;
      // Cleanup script if it exists
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Cleanup viewer
      if (dcvViewerRef.current) {
        try {
          dcvViewerRef.current.disconnect();
        } catch (error) {
          console.error("Error during viewer cleanup:", error);
        }
        dcvViewerRef.current = null;
      }
    };
  }, [initViewer, onError]);

  // Handle input settings changes
  useEffect(() => {
    if (dcvViewerRef.current) {
      dcvViewerRef.current.setInputEnabled("keyboard", inputSettings.keyboard);
      dcvViewerRef.current.setInputEnabled("mouse", inputSettings.mouse);
      dcvViewerRef.current.setInputEnabled("touch", inputSettings.touch);
      dcvViewerRef.current.setInputEnabled("audio", inputSettings.audio);
    }
  }, [inputSettings]);

  // Handle quality changes
  useEffect(() => {
    if (dcvViewerRef.current) {
      dcvViewerRef.current.setQualityLevel(quality);
    }
  }, [quality]);

  return (
    <div
      ref={viewerRef}
      id="dcv-display"
      className="w-full h-full relative bg-gray-900"
      style={{ minHeight: "400px" }}
    />
  );
};

export default DCVViewer;
