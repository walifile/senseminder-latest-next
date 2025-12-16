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
        style={style}
        className={cn(
          "pc-card relative", // ✅ add relative so ::before positions correctly
          "rounded-[20px] backdrop-blur-[32px] backdrop-filter",
          "border border-transparent",
          selected
            ? "bg-[rgba(202,203,223,0.15)] dark:bg-[#12195E]"
            : "bg-[rgba(37,48,240,0.01)] dark:bg-[rgba(255,255,255,0.03)]",
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
