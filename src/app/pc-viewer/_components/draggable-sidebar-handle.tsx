
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { ChevronLeft } from "lucide-react";

type Props = {
  visible: boolean;        // show when sidebar is closed
  onOpen: () => void;      // click (not drag) => open sidebar
  storageKey?: string;     // optional per instance
  className?: string;
};

const DRAG_THRESHOLD_PX = 6;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function DraggableSidebarHandle({
  visible,
  onOpen,
  storageKey = "sensepc.sidebar.handleY",
  className,
}: Props) {
  const btnRef = React.useRef<HTMLButtonElement | null>(null);

  const [y, setY] = React.useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = window.localStorage.getItem(storageKey);
    return saved ? Number(saved) : Math.round(window.innerHeight * 0.5);
  });

  const drag = React.useRef({
    dragging: false,
    pointerId: -1,
    startClientY: 0,
    startY: 0,
    moved: false,
  });

  const clampY = React.useCallback((val: number) => {
    if (typeof window === "undefined") return val;
    return clamp(val, 56, window.innerHeight - 56);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, String(y));
  }, [y, storageKey]);

  React.useEffect(() => {
    const onResize = () => setY((prev) => clampY(prev));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampY]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const el = btnRef.current;
    if (!el) return;

    drag.current.dragging = true;
    drag.current.pointerId = e.pointerId;
    drag.current.startClientY = e.clientY;
    drag.current.startY = y;
    drag.current.moved = false;

    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = drag.current;
    if (!s.dragging || e.pointerId !== s.pointerId) return;

    const dy = e.clientY - s.startClientY;

    if (!s.moved && Math.abs(dy) >= DRAG_THRESHOLD_PX) s.moved = true;
    if (!s.moved) return;

    setY(clampY(s.startY + dy));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = drag.current;
    if (e.pointerId !== s.pointerId) return;

    const el = btnRef.current;
    s.dragging = false;

    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }

    // Click behavior only if user didn't drag
    if (!s.moved) onOpen();
  };

  if (!visible) return null;

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label="Open side panel"
      title="Open side panel"
      className={cn(
        "pointer-events-auto fixed right-0 z-50 -translate-y-1/2 select-none touch-none",
        className
      )}
      style={{ top: y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* keep your current pill size/look exactly */}
     <div
    className={cn(
        "mr-2 rounded-full px-1.5 py-1 text-[10px] font-semibold",
        "bg-white/95 dark:bg-gray-900/80 backdrop-blur",
        "border border-gray-400/70 dark:border-white/25",          // stronger border
        "shadow-lg shadow-black/25",                               // stronger shadow
        "opacity-95 hover:opacity-100",
        "transition",
        "ring-0 hover:ring-2 hover:ring-white/40 dark:hover:ring-white/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    )}
    >
  <ChevronLeft className="h-3 w-3 text-gray-900 dark:text-white" />
</div>

    </button>
  );
}
