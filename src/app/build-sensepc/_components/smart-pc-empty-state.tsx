"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import React, { useState, useEffect } from "react";
import {
  useRedeemPromoMutation,
  useLazyGetPromoInfoQuery,
} from "@/api/promocashback";

import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fCurrency } from "@/lib/utils/format-number";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { Gift, Monitor, HammerIcon, GraduationCap } from "lucide-react";

type SmartPCEmptyStateProps = {
  isMember: boolean;
  searchQuery: string;
  handleShowNewPCDialog: () => void;
};

const SmartPCEmptyState: React.FC<SmartPCEmptyStateProps> = ({
  isMember,
  searchQuery,
  handleShowNewPCDialog,
}) => {
  const router = useRouter();

  const [promoEligible, setPromoEligible] = useState(false);
  const [triggerGetPromoInfo] = useLazyGetPromoInfoQuery();
  const [triggerRedeemPromo] = useRedeemPromoMutation();
  const [open, setOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemedAmount, setRedeemedAmount] = useState<number | null>(null);
  const [step, setStep] = useState<"confirm" | "success">("confirm");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const info = await triggerGetPromoInfo().unwrap();
        if (active) setPromoEligible(Boolean(info?.eligible));
      } catch {
        if (active) setPromoEligible(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [triggerGetPromoInfo]);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <Monitor className="h-8 w-8 text-primary" />
      </div>

      <h3 className="text-lg font-semibold mb-2">No Sense PCs Found</h3>

      <p className="text-muted-foreground mb-6 max-w-md">
        {searchQuery
          ? "No Sense PCs match your search criteria. Try adjusting your search terms."
          : "Get started by building your first Sense PC. Check out our tutorials to learn more about Sense PC features."}
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        {!isMember && (
          <Button
            onClick={handleShowNewPCDialog}
            data-testid="sensepc-build-button"
          >
            <HammerIcon className="h-4 w-4 mr-2" />
            Build Sense PC
          </Button>
        )}

        {!searchQuery && (
          <Button variant="outline" asChild>
            <Link href="/dashboard/tutorials">
              <GraduationCap className="h-4 w-4 mr-2" />
              View Tutorials
            </Link>
          </Button>
        )}

        {promoEligible && (
          <Button
            variant="white"
            data-testid="sensepc-redeem-promo-button"
            className="rounded-full px-6 relative overflow-hidden group shadow-lg hover:shadow-xl border-purple-200/50 dark:border-purple-400/30 hover:border-purple-300 dark:hover:border-purple-400 transition-all duration-500 ease-out hover:scale-105 active:scale-95 bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-white dark:via-white dark:to-purple-100/20 backdrop-blur-sm"
            onClick={() => setOpen(true)}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

            <Gift className="h-4 w-4 mr-2 relative z-10 animate-[bounce_3s_infinite] group-hover:animate-none group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 ease-in-out text-purple-600 dark:text-purple-700" />

            <span className="relative z-10 font-semibold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent dark:from-gray-800 dark:via-purple-800 dark:to-gray-800">
              Redeem Promotion
            </span>

            <span className="absolute top-1 right-3 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </Button>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setStep("confirm");
            setRedeemedAmount(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {step === "confirm" ? (
            <>
              <DialogHeader className="flex flex-col items-center space-y-2">
                <Image
                  src="/assets/dashboard/checklist.svg"
                  alt="Checklist"
                  width={60}
                  height={50}
                />
                <DialogTitle className="text-center">
                  Confirm Redemption
                </DialogTitle>
                <DialogDescription className="text-center">
                  Are you sure you want to claim your free{" "}
                  <span className="whitespace-nowrap">SensePC credits?</span>
                  <br />
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto"
                  disabled={redeeming}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={async () => {
                    setRedeeming(true);
                    try {
                      const res = await triggerRedeemPromo().unwrap();
                      setRedeemedAmount(res?.amountAdded ?? null);

                      const info = await triggerGetPromoInfo().unwrap();
                      setPromoEligible(Boolean(info?.eligible));

                      setStep("success");
                    } catch (e) {
                      toast.error(getErrorMessage(e, "Failed to redeem promo"));
                    } finally {
                      setRedeeming(false);
                    }
                  }}
                  disabled={redeeming}
                  className="w-full sm:w-auto"
                >
                  {redeeming ? "Redeeming..." : "Redeem Credits"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="mx-auto flex w-full flex-col items-center gap-6 text-center">
              <Image
                src="/assets/dashboard/gift.svg"
                alt="Gift"
                width={60}
                height={50}
              />

              <DialogTitle className="w-full text-center">
                Credits Redeemed!
              </DialogTitle>

              <DialogDescription className="mt-1 w-full text-center">
                You&apos;ve received{" "}
                <span className="font-medium text-[#4CC26B]">
                  {fCurrency(redeemedAmount)}
                </span>{" "}
                in your SensePC wallet.
              </DialogDescription>

              <div className="flex w-full justify-center pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setStep("confirm");
                    router.push(routes.billing);
                  }}
                  className="h-12 w-[180px]"
                >
                  Go to Billing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartPCEmptyState;
