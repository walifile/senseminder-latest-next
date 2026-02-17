import React from "react";
import Link from "next/link";
import Image from "next/image";
import { routes } from "@/constants/routes";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

const WayWeCompute = () => (
  <div
    data-testid="home-way-we-compute"
    className="container relative my-12 md:my-20"
  >
    <div className="z-0 hidden dark:block absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 size-1/2 blur-[300px] bg-[#6A00FF]" />

    <div className="relative dark:bg-[#FFFFFF08] bg-[#F4F1FF] backdrop-blur-3xl rounded-2xl flex flex-col-reverse md:grid md:grid-cols-2 md:items-center gap-6 md:gap-8 py-4 px-4 md:py-16 md:px-12">
      <div className="flex flex-col gap-6 md:gap-12">
        <div className="flex flex-col gap-2.5">
          <h2 className="font-space-grotesk font-semibold text-2xl md:text-4xl leading-none tracking-tight">
            The Next Generation of Cloud Computing is
            <span className="text-transparent bg-clip-text bg-[linear-gradient(290.5deg,_#8086F3_-80.33%,_#4C55F8_25.08%,_#C421FF_115.42%)]">
              {" "}Here
            </span>
          </h2>

          <p className="text-paragraph text-base md:text-2xl">
            We removed the limits of hardware and unlocked new possibilities in the cloud. Now it’s available to you.
          </p>
        </div>

        <Button asChild size="lg" className="w-full md:w-fit">
          <Link href={routes.about}>
            Learn More
            <ArrowUpRight />
          </Link>
        </Button>
      </div>

      <div>
        <Image
          src="/assets/svg/way-we-compute-icon.svg"
          alt="Way We Compute"
          width={600}
          height={400}
          className="size-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  </div>
);

export default WayWeCompute;
