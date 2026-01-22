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
      <div
        className={`relative overflow-hidden flex h-full rounded-[20px] border border-[rgba(37,48,240,0.20)] dark:border-[rgba(255,255,255,0.20)] ${
          rightImage ? "bg-[#F4F1FF]" : "bg-white"
        } dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-[32px] p-6 md:p-8 text-left gap-5`}
      >
        {!rightImage && (
          // Light theme pill glow behind content
          <div className="absolute top-0 right-[-120px] w-[300px] h-[120px] opacity-[0.2] bg-[rgba(13,0,255,0.60)] rounded-[300px] blur-[71px] -z-10 dark:hidden" />
        )}

        {/* // Dark theme circular gradient glow behind content */}
        <div
          className="absolute top-[-81px] right-[-120px] w-[214px] h-[214px] opacity-[0.7] rounded-full -z-10 hidden dark:block blur-[100px]"
          style={{
            background:
              "linear-gradient(156deg, #0034EB 15.46%, rgba(0,52,235,0) 100%)",
          }}
        />

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
          // Light theme bottom glow
          <div className="absolute top-[270px] left-[-127px] w-[301px] h-[255px] bg-[rgba(77,0,255,0.60)] opacity-[0.3] rounded-[301px] blur-[142px] -z-10 dark:hidden" />
        )}
        {/* // Dark theme bottom circular gradient glow */}
        <div
          className="absolute top-[270px] left-[-127px] w-[310px] h-[310px] opacity-[0.5] rounded-[310px] -z-10 hidden dark:block blur-[100px]"
          style={{
            background: "linear-gradient(156deg, #0034EB 0%, #82E1FB 100%)",
          }}
        />

        {rightImage && (
          <div
            className="pointer-events-none absolute -z-10 w-[568.051px] h-[321.133px] rounded-[568.051px] backdrop-blur-[150px] blur-[150px] opacity-25 dark:hidden"
            style={{
              background:
                "linear-gradient(270deg, #BA25F0 4.8%, #2530F0 46.15%, #8086F3 100%)",
              transform: "rotate(-11.32deg)",
              bottom: "-90px",
              left: "-120px",
              boxShadow: "0 4px 300px 0 rgba(0, 0, 0, 0.25) inset",
            }}
          />
        )}

        {rightImage && (
          <div className="pointer-events-none absolute top-10 right-[150px] w-[313px] h-[313px] rounded-[313px] bg-[rgba(46,45,236,0.53)] backdrop-blur-[100px] -z-10 blur-[100px] opacity-50" />
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
