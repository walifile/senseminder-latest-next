"use client";

import type { ButtonProps } from "@/components/ui/button";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

import { useGetStartedNav } from "@/hooks/use-get-started";

type GetStartedCTAButtonProps = Pick<ButtonProps, "size" | "variant"> & {
  className?: string;
  label?: string;
  showIcon?: boolean;
  testId?: string;
};

export default function GetStartedCTAButton({
  className = "w-full md:w-fit",
  label = "Switch to Sense PC",
  showIcon = true,
  size = "lg",
  variant,
  testId = "home-get-started-button",
}: GetStartedCTAButtonProps) {
  const onGetStarted = useGetStartedNav();

  return (
    <Button
      data-testid={testId}
      size={size}
      variant={variant}
      className={className}
      onClick={onGetStarted}
    >
      {label}
      {showIcon ? <ArrowUpRight /> : null}
    </Button>
  );
}
