"use client";

import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const benefitCards = [
  {
    icon: "/assets/icons/future-of-computing-card-icon-1.svg",
    title: "Impact",
    description:
      "No more hardware updates. Just the performance you need.",
  },
  {
    icon: "/assets/icons/future-of-computing-card-icon-2.svg",
    title: "Energy",
    description:
      "Use energy more efficiently through shared cloud infrastructure.",
  },
  {
    icon: "/assets/icons/future-of-computing-card-icon-3.svg",
    title: "Scale",
    description:
      "Increase your computing power on demand without adding new hardware.",
  },
];

const FutureOfComputing = () => (
  <div
    data-testid="home-future-of-computing"
    className="relative container my-12 md:my-30"
  >
    <div className="z-0 absolute left-0 right-0 top-0 w-full h-3/4 opacity-10 dark:opacity-100 blur-[200px] bg-[radial-gradient(ellipse_100%_100%_at_50%_100%,#020816_45.67%,#63189D_79.33%,#2530F0_100%)]" />

    <div className="relative space-y-6 md:space-y-12">
      {/* Heading block (no animation) */}
      <div className="space-y-2.5 text-center">
        <h2 className="font-space-grotesk font-semibold text-2xl md:text-5xl">
          Computing Without{" "}
          <span className="bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] bg-clip-text text-transparent">
            The Hardware
          </span>
        </h2>
        <p className="text-paragraph text-base md:text-2xl">
          Get a powerful cloud computer — no hardware needed. SensePC cuts e-waste, saves energy, and scales easily.
        </p>
      </div>

      {/* Cards grid (no animation) */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {benefitCards.map((card, index) => (
          <div key={index}>
            <Card
              className={cn(
                "px-4 py-8 md:px-8 md:py-24 rounded-2xl border border-cyan-400/30 bg-cover bg-center bg-no-repeat",
                "bg-[url('/assets/svg/future-of-computing-card-bg.svg')]",
                "dark:bg-[url('/assets/svg/future-of-computing-card-bg-dark.svg')]",
                "dark:bg-[#010526] dark:shadow-[0px_17px_44px_rgba(2,97,206,0.32)] md:h-[-webkit-fill-available]",
                index !== 1 ? "md:mt-10" : "md:mb-10"
              )}
            >
              <CardContent className="p-0 relative">
                <div className="flex flex-col items-center gap-8 md:gap-12">
                  <div className="relative">
                    <div className="z-0 absolute inset-0 opacity-80 blur-[40px] bg-[linear-gradient(151.43deg,_#BA49D0_13.32%,_#84FFF7_80.38%)]" />

                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={80}
                      height={80}
                      className="relative z-10 w-[60px] h-[60px] md:w-[80px] md:h-[80px]"
                    />
                  </div>

                  <div className="space-y-4 text-center">
                    <h3 className="font-space-grotesk text-2xl font-bold">
                      {card.title}
                    </h3>
                    <p className="text-paragraph text-base md:text-lg">
                      {card.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FutureOfComputing;
