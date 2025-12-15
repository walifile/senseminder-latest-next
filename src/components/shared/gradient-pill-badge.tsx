import React from "react";

import { cn } from "@/lib/utils";

type GradientPillBadgeProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  gradientClassName?: string;
};

const GradientPillBadge = ({
  children,
  className,
  innerClassName,
  gradientClassName,
}: GradientPillBadgeProps) => (
  <div
    className={cn(
      "relative rounded-full p-px bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(0,0,0,0.35))]",
      gradientClassName,
      className
    )}
  >
    <div
      className={cn(
        "rounded-full px-4 py-1 text-white text-base font-medium bg-[rgba(0,0,0,0.28)] backdrop-blur-sm",
        innerClassName
      )}
    >
      {children}
    </div>
  </div>
);

export default GradientPillBadge;
