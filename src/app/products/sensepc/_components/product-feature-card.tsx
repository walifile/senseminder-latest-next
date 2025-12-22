

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
        "bg-[rgba(37,48,240,0.1)]",
        "dark:[background:linear-gradient(276.71deg,_rgba(128,134,243,0.5)_-194.99%,_rgba(3,10,135,0.25)_-40.44%,_rgba(186,37,240,0.5)_248.78%)]",
        "before:content-[''] before:absolute before:inset-0 before:rounded-[12px] before:p-px",
        "before:[background:linear-gradient(310deg,_#8086F3_0%,_#4C55F8_54%,_#D971FF_95%)]",
        "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
        "before:[-webkit-mask-composite:xor]",
        "before:[mask-composite:exclude]",
        "before:pointer-events-none before:z-[1]",

        className
      )}
    >
   

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

export default ProductFeatureCard;
