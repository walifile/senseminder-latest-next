"use client";

import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type GradientInfoCardProps = {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
  rightImage?: string;
};

export function GradientInfoCard({
  icon,
  title,
  children,
  className,
  rightImage = "",
}: GradientInfoCardProps) {
  return (
    <div className={cn("relative h-full", className)}>
      {/* BACK GLOW */}
      {/* <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_#5B2FFF_0%,_#0B1020_45%,_transparent_70%)] opacity-70" /> */}

      {/* CARD */}
      <div className="relative flex h-full glass-card !rounded-3xl border border-white/5 p-6 md:p-8 text-left gap-5">
        <div className="absolute top-0 right-0 w-52 h-52 opacity-70 bg-gradient-to-br from-blue-700 to-sky-300 rounded-full blur-[100px]" />
        <div
          className={`relative flex-shrink-0 w-full ${
            rightImage ? "md:w-[55%]" : ""
          }`}
        >
          {icon && <div className="w-20 h-20 mb-4">{icon}</div>}

          <h3 className="mb-3 font-space-grotesk text-2xl font-semibold text-white">
            {title}
          </h3>

          <div className="space-y-3 text-sm md:text-base text-[#C8D3F5]">
            {children}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-52 h-52 opacity-70 bg-gradient-to-br from-blue-700 to-sky-300 rounded-full blur-[100px]" />

        {/* Conditional Rendering of the Right Image */}
        {rightImage && (
          <div className="relative w-full md:w-[40%]">
            <Image
              src={rightImage} // Use the passed image path
              alt="Illustration"
              width={581}
              height={468}
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
