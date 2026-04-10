import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type GetStartedCtaSectionProps = {
  title: string;
  description: string;
  actions: React.ReactNode;

  className?: string;
  ariaLabel?: string;
};

export function GetStartedCtaSection({
  title,
  description,
  actions,
  className,
  ariaLabel = "Get started background",
}: GetStartedCtaSectionProps) {
  return (
    <section className={cn("relative", className)}>
      <div className="relative container my-12 md:my-32">
        <div
          className="relative z-[1] overflow-hidden rounded-2xl bg-[#F4F1FF] px-4 py-12 dark:bg-transparent dark:bg-[linear-gradient(276.71deg,rgba(128,134,243,0.5)_-194.99%,rgba(3,10,135,0.25)_-40.44%,rgba(186,37,240,0.5)_248.78%)] md:px-12 md:py-20"
          role="img"
          aria-label={ariaLabel}
        >
          <div className="relative mx-auto w-fit space-y-4 text-center md:space-y-8">
            <div className="mx-auto flex max-w-[48.50rem] flex-col gap-[30px]">
              <div className="space-y-3">
                <h3 className="self-stretch text-center font-['Space_Grotesk'] text-3xl font-semibold leading-10 text-black dark:text-white md:text-5xl md:leading-[56px]">
                  {title}
                </h3>

                <p className="self-stretch text-center font-['Inter'] text-base font-normal leading-6 text-[#454545] dark:text-paragraph md:text-2xl md:leading-10">
                  {description}
                </p>
              </div>

              {actions}
            </div>
          </div>

          {/* Top decoration */}
          <div className="pointer-events-none">
            <Image
              src="/assets/svg/home2/get-started-cta-top.svg"
              alt=""
              width={320}
              height={320}
              className="absolute left-0 top-0 -z-[1] h-[93px] w-[140px] md:-top-5 md:size-80"
              priority
            />
          </div>

          {/* Bottom decoration */}
          <div className="pointer-events-none">
            <Image
              src="/assets/svg/home2/get-started-cta-bottom.svg"
              alt=""
              width={320}
              height={320}
              className="absolute right-0 -bottom-0 -z-[1] h-[93px] w-[140px] md:-bottom-8 md:size-80"
              priority
            />
          </div>

          {/* Inner glow */}
          <div className="pointer-events-none">
            <div className="absolute bottom-[-378px] left-[135px] h-96 w-[620.02px] origin-top-left rotate-[-11.32deg] rounded-[50%] bg-gradient-to-l from-fuchsia-600 via-blue-700 to-indigo-400 opacity-40 blur-[150px] -z-[1] dark:opacity-100" />
          </div>
        </div>
      </div>
    </section>
  );
}
