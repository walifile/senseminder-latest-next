"use client";

import { StripeProvider } from "@/providers/StripeProvider";
import { PaymentMethodDialog } from "@/app/dashboard/billing/_components/payment-method-dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

type BillingSetupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function BillingSetupDialog({
  open,
  onOpenChange,
  onPrevious,
  onNext,
}: BillingSetupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[calc(100vw-1rem)] sm:w-[min(94vw,76rem)] max-w-none max-h-[90dvh] lg:min-h-[520px] p-0 overflow-y-auto md:overflow-hidden",
          "bg-white dark:bg-[#000624]",
        )}
      >
        <div className="grid h-full grid-cols-1 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="p-6 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/10 bg-[#F5FAFE] dark:bg-white/5">
            <DialogHeader className="text-left space-y-3">
              <div className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs md:text-sm bg-[#2530F0]/10 text-[#2530F0] dark:bg-white/10 dark:text-[#B9C2D5]">
                Business onboarding
              </div>
              <DialogTitle className="!text-2xl md:!text-3xl !leading-tight">
                Set up billing for your team
              </DialogTitle>
              <DialogDescription className="!text-sm md:!text-base text-paragraph">
                Add and manage a payment method before launching. You can continue
                onboarding after this step.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-3">
              {[
                "Securely add your team payment method",
                "Set a default card for wallet top-ups",
                "Continue to invite your team right after setup",
              ].map((item) => (
                <div
                  key={item}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm md:text-base",
                    "bg-white dark:bg-[#FFFFFF08]",
                    "border border-black/5 dark:border-white/10",
                  )}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10 flex lg:min-h-[360px] flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-[460px] space-y-5 text-center">
                <p className="text-[14px] font-semibold uppercase tracking-[-0.2px] text-[#2530F0] dark:text-[#8EA2FF]">
                  Manage payment methods
                </p>
                <p className="text-[16px] leading-6 tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5]">
                  Open the billing dialog to add, remove, or set a default payment
                  method for your workspace.
                </p>
                <div className="pt-4 flex justify-center">
                  <StripeProvider>
                    <PaymentMethodDialog />
                  </StripeProvider>
                </div>
              </div>
            </div>
            <div className="pt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={onPrevious}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-l from-[#a801ba] to-[#2530f0]"
                onClick={onNext}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
