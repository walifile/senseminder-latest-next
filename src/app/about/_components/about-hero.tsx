import Link from "next/link";
import Image from "next/image";
import { routes } from "@/constants/routes";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

export function AboutHero() {
  return (
    <section data-testid="about-hero">
      <div className="container relative z-10 pt-[20px] md:pt-[36px]">
        <div className="container flex flex-col-reverse gap-4 px-0 py-10 md:grid md:grid-cols-2 md:items-center md:gap-[90px] md:pb-32 md:pt-16">
          <div className="flex w-full flex-col gap-6 md:gap-12">
            <div className="w-full min-w-0 md:min-w-[683px]">
              {/* <div className="mb-6 md:mb-8">
                <Breadcrumb
                  variant="figma"
                  items={[{ label: "Home", href: "/" }, { label: "About Us" }]}
                />
              </div> */}

              <h1 className="w-full font-space-grotesk text-xl font-bold leading-[1.10] md:w-[85%] md:text-[50px]">
                <span className="bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] bg-clip-text text-transparent">
                  SensePC gives you premium computing power without the cost.
                </span>
              </h1>

              <p className="mt-4 w-full text-base text-paragraph md:w-[85%] md:text-xl">
                Get the advanced workstation experience without the hardware or
                the cost. Sense PC gives you a cloud-native remote desktop that
                you can access whenever you want, from any device.
              </p>
            </div>

            <div className="relative md:w-fit">
              <div className="absolute left-1/2 top-2.5 z-0 h-[40px] w-[50%] -translate-x-1/2 bg-[linear-gradient(270deg,_#A801BA_0%,_#2530F0_100%)]" />
              <Button
                asChild
                size="lg"
                className="relative z-10 w-full"
                data-testid="landing-get-started-button"
              >
                <Link href={routes.signUp}>
                  Get Started Now
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <Image
              src="/assets/svg/about-hero-dark.svg"
              alt="About illustration"
              width={300}
              height={100}
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="size-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
