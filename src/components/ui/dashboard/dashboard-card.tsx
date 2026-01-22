
// src/components/ui/dashboard/dashboard-card.tsx

import * as React from "react";

import { cn } from "@/lib/utils";

export interface DashboardCardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DashboardCard = React.forwardRef<
  HTMLDivElement,
  DashboardCardProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // shape
      "rounded-[20px]",

      // border (same as PublicCard)
      "border border-solid border-public-card-border-light",
      "dark:border-public-card-border-dark",

      // glass effect
      "backdrop-blur-[32px] backdrop-filter",

      // light / dark backgrounds from Figma
      "bg-[rgba(37,48,240,0.07)] dark:bg-[rgba(255,255,255,0.03)]",

      className
    )}
    {...props}
  />
));

DashboardCard.displayName = "DashboardCard";
