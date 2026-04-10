"use client";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

import { useGetStartedNav } from "@/hooks/use-get-started";

type GetStartedCtaActionsProps = {
  primaryLabel: string;
  secondaryLabel?: string;
};

export function GetStartedCtaActions({
  primaryLabel,
  secondaryLabel,
}: GetStartedCtaActionsProps) {
  const onGetStarted = useGetStartedNav();

  return (
    <div className="flex flex-col justify-center gap-4 md:flex-row">
      <Button size="lg" className="w-full md:w-fit" onClick={onGetStarted}>
        {primaryLabel}
      </Button>

      {secondaryLabel ? (
        <Button
          size="lg"
          variant="outline"
          className="w-full md:w-fit"
          onClick={onGetStarted}
        >
          {secondaryLabel}
          <ArrowUpRight />
        </Button>
      ) : null}
    </div>
  );
}
