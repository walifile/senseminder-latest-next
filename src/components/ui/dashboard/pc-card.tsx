// src/components/ui/dashboard/pc-card.tsx

import * as React from "react";

import { cn } from "@/lib/utils";

export interface PcCardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export const PcCard = React.forwardRef<HTMLDivElement, PcCardProps>(
  ({ className, selected = false, style, ...props }, ref) => (
    <>
      <div
        ref={ref}
        data-selected={selected ? "true" : "false"}
        style={{
          WebkitBackdropFilter: "blur(32px)",
          backdropFilter: "blur(32px)",
          ...style,
        }}
        className={cn(
          "pc-card relative overflow-hidden",
          "rounded-[20px]",
          selected
            ? "bg-[rgba(202,203,223,0.26)] dark:bg-[#12195E]"
            : "bg-[rgba(255,255,255,0.24)] dark:bg-[rgba(255,255,255,0.06)]",
          "border border-black/30 dark:border-white/10",
          // (optional but helps separation on Safari)
          "shadow-[0_10px_28px_rgba(15,23,42,0.08)]",
          className
        )}
        {...props}
      />

      {/* Local CSS for gradient border */}
      <style>{`
        .pc-card[data-selected='true']::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, #2530f0, #a801ba);

          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;

          pointer-events: none;
        }
      `}</style>
    </>
  )
);

PcCard.displayName = "PcCard";
