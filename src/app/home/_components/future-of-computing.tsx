import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const benefitCards = [
  {
    icon: "/assets/icons/future-of-computing-card-icon-1.svg",
    title: "Less E-waste",
    description:
      "Reduce electronic waste by eliminating the need for constant hardware upgrades.",
  },
  {
    icon: "/assets/icons/future-of-computing-card-icon-2.svg",
    title: "Lower Energy Consumption",
    description:
      "Optimize resource usage through shared infrastructure and efficient scaling.",
  },
  {
    icon: "/assets/icons/future-of-computing-card-icon-3.svg",
    title: "Sustainable Scalability",
    description:
      "Grow your computing needs without increasing your environmental footprint.",
  },
];

const FutureOfComputing = () => (
  <div className="relative container my-12 md:my-20">
    <div className="z-0 absolute left-0 right-0 top-0 w-full h-3/4 opacity-10 dark:opacity-100 blur-[200px] bg-[radial-gradient(ellipse_100%_100%_at_50%_100%,#020816_45.67%,#63189D_79.33%,#2530F0_100%)]" />

    <div className="relative space-y-6 md:space-y-12">
      <div className="space-y-2.5 text-center">
        <p className="font-space-grotesk font-bold text-2xl md:text-5xl">
          The Future of Computing{" "}
          <span className="bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] bg-clip-text text-transparent">
            No Hardware Required
          </span>
        </p>
        <p className="text-paragraph text-base md:text-2xl">
          Inspire users with a vision of hardware-free computing powered by the
          cloud. Highlighting the eco-friendly benefits
        </p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {benefitCards.map((card, index) => (
          <Card
            className={cn(
              "px-4 py-8 md:px-10 md:py-24 rounded-2xl border border-cyan-400/30 bg-cover bg-center bg-no-repeat",
              "bg-[url('/assets/svg/future-of-computing-card-bg.svg')]",
              "dark:bg-[url('/assets/svg/future-of-computing-card-bg-dark.svg')]",
              "dark:bg-[#010526] dark:shadow-[0px_17px_44px_rgba(2,97,206,0.32)]",
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
        ))}
      </div>
    </div>
  </div>
);

export default FutureOfComputing;
