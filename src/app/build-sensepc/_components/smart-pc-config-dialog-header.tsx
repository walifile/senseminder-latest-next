import React from "react";

import { cn } from "@/lib/utils";
import {
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  drag: { x: number; y: number };
  setDrag: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isResize: boolean;
  isStorageOnly?: boolean;
};

const SmartPcConfigDialogHeader = ({
  drag,
  setDrag,
  isResize,
  isStorageOnly,
}: Props) => {
  const dragStartRef = React.useRef<{ x: number; y: number } | null>(null);

  // ------ Dialog drag (no external dependency) ------
  const onDragStart = React.useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-cancel-drag]")) return;
      dragStartRef.current = { x: e.clientX - drag.x, y: e.clientY - drag.y };

      const onMove = (ev: MouseEvent) => {
        if (!dragStartRef.current) return;
        setDrag({
          x: ev.clientX - dragStartRef.current.x,
          y: ev.clientY - dragStartRef.current.y,
        });
      };
      const onUp = () => {
        dragStartRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [drag.x, drag.y, setDrag]
  );

  return (
    <div
      className="dialog-handle cursor-move select-none px-6 pt-6 pb-3 border-b"
      onMouseDown={onDragStart}
    >
      <DialogHeader data-cancel-drag>
        <div className="flex items-start justify-between pr-12 sm:pr-1">
          <div>
            <DialogTitle className="text-xl">
              {isResize
                ? isStorageOnly
                  ? "Increase Storage (SSD)"
                  : "PC Resize (CPU & Memory)"
                : "Choose Your Computer Configurations"}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {isResize
                ? isStorageOnly
                  ? "Increase your SSD size for this Computer."
                  : "Update CPU & Memory for your existing Computer."
                : "Customize your Computer."}
            </DialogDescription>
          </div>

          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mr-8 sm:mr-12",
              isResize
                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            )}
            data-cancel-drag
          >
            {isResize
              ? isStorageOnly
                ? "Increase Storage"
                : "Resize"
              : "Build"}
          </span>
        </div>

        {isResize && !isStorageOnly && (
          <div
            className="mt-3 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-xs px-3 py-2"
            data-cancel-drag
          >
            CPU/Memory resize requires the PC to be{" "}
            <span className="font-semibold">Stopped</span> and is allowed only
            for <span className="font-semibold">Hourly</span> plans.
          </div>
        )}
        {isResize && isStorageOnly && (
          <div
            className="mt-3 rounded-md border border-blue-200 bg-blue-50 text-blue-800 text-xs px-3 py-2"
            data-cancel-drag
          >
            Storage can only be <span className="font-semibold">increased</span>{" "}
            and requires the PC to be
            <span className="font-semibold"> Running</span> on an{" "}
            <span className="font-semibold">Hourly</span> plan.
          </div>
        )}
      </DialogHeader>
    </div>
  );
};

export default SmartPcConfigDialogHeader;
