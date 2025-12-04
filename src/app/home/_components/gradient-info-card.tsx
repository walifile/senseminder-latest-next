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
      {/* CARD */}
      <div className="relative overflow-hidden flex h-full rounded-[20px] border border-[rgba(37,48,240,0.20)] dark:border-[rgba(255,255,255,0.20)] bg-white dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-[32px] p-6 md:p-8 text-left gap-5">
        {!rightImage && (
          <div className="absolute top-6 right-[-120px] w-[300px] h-[120px] opacity-60 bg-[rgba(13,0,255,0.60)] rounded-[300px] blur-[71px] -z-10" />
        )}
        <div
          className={`relative flex-shrink-0 w-full ${
            rightImage ? "md:w-[55%]" : ""
          }`}
        >
          {icon && <div className="w-20 h-20 mb-4">{icon}</div>}

          <p className="mb-3 font-space-grotesk text-3xl pt-7 font-semibold dark:text-white text-[#020816]">
            {title}
          </p>

          <div className="space-y-3 text-sm md:text-base text-[#C8D3F5]">
            {children}
          </div>
        </div>
        {!rightImage && (
          <div className="absolute bottom-[-90px] left-[-140px] w-[301px] h-[255px] bg-[rgba(77,0,255,0.60)] opacity-60 rounded-[301px] blur-[71px] -z-10" />
        )}

        {rightImage && (
          <div
            className="pointer-events-none absolute -z-10 w-[568.051px] h-[321.133px] rounded-[568.051px] backdrop-blur-[150px]"
            style={{
              background:
                "linear-gradient(270deg, #BA25F0 4.8%, #2530F0 46.15%, #8086F3 100%)",
              transform: "rotate(-11.316deg)",
              bottom: "-120px",
              left: "-140px",
            }}
          />
        )}

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
