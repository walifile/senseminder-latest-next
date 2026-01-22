
// src/components/ui/public-card.tsx
import * as React from "react";

import { cn } from "@/lib/utils";

export interface PublicCardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PublicCard = React.forwardRef<HTMLDivElement, PublicCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Light mode (from Figma)
        "bg-public-card-bg-light",
        "border border-solid border-public-card-border-light",
        "shadow-public-card",
        "rounded-[20px]",

        // Dark mode glass card
        "dark:bg-public-card-bg-dark",
        "dark:border-public-card-border-dark",
        "dark:shadow-none",
        "dark:backdrop-blur-[32px] dark:backdrop-filter",

        className,
      )}
      {...props}
    />
  ),
);

PublicCard.displayName = "PublicCard";
