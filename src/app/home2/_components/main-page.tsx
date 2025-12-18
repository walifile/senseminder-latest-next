"use client";


import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

import { useGetStartedNav } from "@/hooks/use-get-started";

import { MainLayout } from "./layout";
import GetStartedCTA from "./get-started-cta";

export default function HomePage() {
  const onGetStarted = useGetStartedNav();
  return (
    <MainLayout>
      <div className="px-4 md:px-6 pt-20 md:pt-32 pb-16 md:pb-24 max-w-7xl mx-auto flex flex-col items-center text-center" />
      <GetStartedCTA>
        <div className="max-w-[48.50rem] flex flex-col mx-auto gap-[30px]">
          <div className="space-y-3">
            <h3 className="self-stretch text-center justify-start text-white text-3xl md:text-5xl font-semibold font-['Space_Grotesk'] leading-10 md:leading-[56px]">
              Ready to store with SenseCloud?
            </h3>
            <p className="self-stretch text-center justify-start text-paragraph text-base md:text-2xl font-normal font-['Inter'] leading-6 md:leading-10">
              Explore how SenseCloud can power your files and backups alongside your SensePC environments.
              You can get started today by building a SensePC and attaching storage that fits your needs.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full md:w-fit" onClick={onGetStarted}>
              Get Started with SensePC
            </Button>
            <Button size="lg" variant="outline" className="w-full md:w-fit" onClick={onGetStarted}>
              Contact Sales
              <ArrowUpRight />
            </Button>
          </div>
        </div>
      </GetStartedCTA>
    </MainLayout>
  );
}


