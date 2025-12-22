import * as React from "react";

import { cn } from "@/lib/utils";

type ProductFeatureCardProps = React.HTMLAttributes<HTMLDivElement>;

export function ProductFeatureCard({
  className,
  children,
  ...props
}: ProductFeatureCardProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative isolate overflow-hidden rounded-[12px] p-6",
        "flex flex-col items-start gap-12",

        // light bg
        "bg-[rgba(37,48,240,0.1)]",

        // dark bg
        "dark:[background:linear-gradient(277deg,_rgba(128,134,243,0.5)_-194.99%,_rgba(3,10,135,0.25)_-40.44%,_rgba(186,37,240,0.5)_248.78%)]",

        // border
        "border border-[#8086F3]",

        className
      )}
    >
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

export default ProductFeatureCard;
