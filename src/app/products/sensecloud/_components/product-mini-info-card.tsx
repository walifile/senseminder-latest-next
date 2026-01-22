

"use client";

import React from "react";

import { cn } from "@/lib/utils";

type ProductMiniInfoCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const ProductMiniInfoCard = ({
  className,
  children,
  ...props
}: ProductMiniInfoCardProps) => (
    <div
      {...props}
      className={cn(
        "relative rounded-[8px] border-[none]",
        // IMPORTANT: keep fill transparent so no “white band” appears
        "bg-transparent",

        // gradient border ring (your preferred technique)
        "before:content-[''] before:absolute before:inset-0",
        "before:p-px before:rounded-[8px]",
        // 2-stop gradient only (no middle/light stop)
        "before:[background:linear-gradient(90deg,rgba(37,48,240,1)_0%,rgba(168,1,186,1)_100%)]",
        "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
        "before:[-webkit-mask-composite:xor]",
        "before:[mask-composite:exclude]",
        "before:pointer-events-none",

        className
      )}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );

export default ProductMiniInfoCard;
