import * as React from "react";

import { cn } from "@/lib/utils";

type FeatureCardsProps = React.HTMLAttributes<HTMLDivElement>;

export function FeatureCards({ className, children, ...props }: FeatureCardsProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative overflow-hidden rounded-[20px]",
        "backdrop-blur-[32px] bg-[rgba(255,255,255,0.03)]",
        "before:content-[''] before:absolute before:inset-0 before:rounded-[20px] before:p-px",
        "before:opacity-50",
        "before:[background:linear-gradient(310deg,_#8086F3_0%,_#4C55F8_54%,_#D971FF_95%)]",
        "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
        "before:[-webkit-mask-composite:xor]",
        "before:[mask-composite:exclude]",
        "before:pointer-events-none",
        "before:z-[1]",

        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default FeatureCards;
