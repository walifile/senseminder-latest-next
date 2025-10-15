"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function GetStartedCTA() {
  return (
    <section className="py-10 md:py-14">
      <div
        className="container"
      >
        <div
          className="rounded-3xl px-6 md:px-10 py-10 md:py-14 bg-[url('/assets/svg/bg-get-started.svg')] dark:bg-[url('/assets/svg/dark-bg-get-started.svg')] bg-cover bg-center shadow-sm"
          role="img"
          aria-label="Get started background"
        >
          <div className="flex flex-col items-center justify-center text-center gap-6">
            <h3 className="text-2xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-white">
              Make the Smart Move -
              <br />
              Switch to Sense PC!
            </h3>
            <Button>
              Get Started Now
              <ArrowUpRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

