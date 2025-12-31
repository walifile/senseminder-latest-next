"use client";

import React, { useState, useEffect } from "react";
import { FEEDBACK_TRIGGERS } from "@/constants/app-constants";
import {
  useRechargeMutation,
  useGetAutoRechargeQuery,
  useUpdateAutoRechargeMutation,
} from "@/api/billing";

import { cn } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { PencilLine, ArrowUpRight } from "lucide-react";

import { useBoolean } from "@/hooks/use-boolean";
import { useFeedback } from "@/hooks/use-feedback";

import { quickRechargeAmounts } from "../data";

const QuickRecharge = () => {
  const showConfirm = useBoolean();
  const showAutoRechargeConfig = useBoolean();
  const { triggerFeedback } = useFeedback();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<number | null>(null);

  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);
  const [autoRechargeAmount, setAutoRechargeAmount] = useState<number>(20);
  const [tempAutoRechargeAmount, setTempAutoRechargeAmount] =
    useState<number>(20);
  const [addFundsAutoRechargeEnabled, setAddFundsAutoRechargeEnabled] =
    useState(false);

  // confirm dialog state when disabling auto-recharge
  const [showDisableAutoRechargeConfirm, setShowDisableAutoRechargeConfirm] =
    useState(false);

  const [recharge, { isLoading: isRecharging }] = useRechargeMutation();
  const { data: autoRechargeResponse, refetch } = useGetAutoRechargeQuery();
  const [updateAutoRecharge] = useUpdateAutoRechargeMutation();

  useEffect(() => {
    if (autoRechargeResponse) {
      setAutoRechargeEnabled(autoRechargeResponse.autoRecharge);
      if (autoRechargeResponse.autoRechargeAmount) {
        setAutoRechargeAmount(autoRechargeResponse.autoRechargeAmount);
      }
    }
  }, [autoRechargeResponse]);

  const doRecharge = async (amount: number | null) => {
    if (!amount) return;
    try {
      const data = await recharge({
        amount,
        autoRecharge: addFundsAutoRechargeEnabled,
      }).unwrap();

      toast({
        title: "Recharge successful",
        description: `Your wallet balance has been updated successfully. New balance amount is ${data.newBalance}`,
      });
      setCustomAmount(null);
      setAddFundsAutoRechargeEnabled(false);
      const refreshed = await refetch().unwrap();
      setAutoRechargeEnabled(refreshed.autoRecharge);
      showConfirm.onFalse();

      void triggerFeedback({
        trigger: FEEDBACK_TRIGGERS.PAYMENT,
        delayMinutes: 0,
      });
    } catch (error: unknown) {
      Logger.error("Failed to recharge wallet:", error);
      const message =
        error instanceof Error ? error.message : "Could not recharge wallet";
      toast({
        title: "Error recharging wallet",
        description: message,
      });
    }
  };

  const setAutoRecharge = async (
    enabled: boolean,
    amount: number,
    options?: { showAmountUpdatedToast?: boolean }
  ) => {
    try {
      setAutoRechargeEnabled(enabled);
      await updateAutoRecharge({
        autoRecharge: enabled,
        autoRechargeAmount: enabled ? amount : undefined,
      }).unwrap();
      const refreshed = await refetch().unwrap();
      setAutoRechargeEnabled(refreshed.autoRecharge);
      if (refreshed.autoRechargeAmount) {
        setAutoRechargeAmount(refreshed.autoRechargeAmount);
      }

      if (options?.showAmountUpdatedToast) {
        toast({
          title: "Auto-recharge amount updated",
          description: `We'll now add $${amount} whenever your balance drops below $10.`,
        });
      } else {
        toast({
          title: "Auto-recharge updated",
          description: `Auto-recharge has been ${
            enabled ? `enabled with $${amount}` : "disabled"
          }.`,
        });
      }
    } catch (error: unknown) {
      Logger.error("Failed to update auto-recharge:", error);

      // Check for HTTP 400 error
      if (error && typeof error === "object" && "status" in error) {
        const rtkError = error as {
          status: number;
          data?: { message?: string };
        };

        if (rtkError.status === 400 && rtkError.data?.message) {
          toast({
            title: "Error",
            description: rtkError.data.message,
            variant: "destructive",
            duration: 7000,
          });
          setAutoRechargeEnabled(false);
          return;
        }
      }

      // Default error handling
      const message =
        error instanceof Error
          ? error.message
          : "Could not update auto-recharge";
      toast({
        title: "Error updating auto-recharge",
        description: message,
      });
      setAutoRechargeEnabled(false);
    }
  };

  const handleAutoRechargeToggle = () => {
    if (!autoRechargeEnabled) {
      // Enabling → open config dialog
      setTempAutoRechargeAmount(autoRechargeAmount);
      showAutoRechargeConfig.onTrue();
    } else {
      // Disabling → show confirmation dialog, keep checkbox checked until confirmed
      setShowDisableAutoRechargeConfirm(true);
    }
  };

  const confirmAutoRechargeConfig = () => {
    if (tempAutoRechargeAmount < 20) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount (minimum $20).",
        variant: "destructive",
      });
      return;
    }

    const wasEnabled = autoRechargeEnabled;
    setAutoRechargeAmount(tempAutoRechargeAmount);

    void setAutoRecharge(true, tempAutoRechargeAmount, {
      showAmountUpdatedToast: wasEnabled,
    });

    showAutoRechargeConfig.onFalse();
  };

  return (
    <>
      <DashboardCard
        data-testid="dashboard-billing-quick-recharge"
        className={cn("relative overflow-hidden p-0", "font-['Space_Grotesk']")}
      >
        {/* Header */}
        <div className="px-6 pt-5">
          <div className="space-y-1">
            <p className="justify-start text-2xl font-bold leading-8">
              Quick Recharge
            </p>
            <p className="text-[16px] tracking-[-0.3px] text-muted-foreground dark:text-[#B9C2D5]">
              Add funds to your account instantly
            </p>
          </div>
        </div>

        {/* Header divider (Figma line) */}
        <Separator className="mt-4 bg-[rgba(37,48,240,0.2)] dark:bg-[rgba(255,255,255,0.2)]" />

        <div className="px-6 pb-6 pt-5">
          <div className="space-y-6">
            {/* Presets (2x2 like Figma) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {quickRechargeAmounts.map(({ amount, isRecommended }) => (
                <Button
                  key={amount}
                  className="relative"
                  variant="tinted"
                  onClick={() => {
                    setSelectedAmount(amount);
                    showConfirm.onTrue();
                  }}
                  data-testid={
                    amount === 20 ? "billing-quick-recharge-20-button" : undefined
                  }
                >
                  <span className="text-[22px] font-medium leading-8 tracking-[-0.3px]">
                    ${amount}
                  </span>

                  {/* Popular ribbon (for $50 in Figma) */}
                  {isRecommended && (
                    <span className="pointer-events-none absolute -right-1 -top-1 h-[47px] w-[47px] select-none">
                      <span className="relative block h-full w-full">
                        <img src="/assets/dashboard/ribbon.svg" alt="" />
                      </span>
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* Or enter custom amount divider */}
            <div className="flex items-center gap-3.5">
              <div className="h-px flex-1 bg-[rgba(37,48,240,0.2)] dark:bg-[rgba(255,255,255,0.2)]" />
              <span className="text-[16px] tracking-[-0.3px] text-muted-foreground dark:text-[#B9C2D5]">
                Or enter custom amount
              </span>
              <div className="h-px flex-1 bg-[rgba(37,48,240,0.2)] dark:bg-[rgba(255,255,255,0.2)]" />
            </div>

            {/* Custom amount + Add Funds (like Figma row) */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
              <div className="relative w-full md:flex-1">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[22px] font-medium leading-8 tracking-[-0.3px] text-muted-foreground dark:text-[#B9C2D5]">
                  $
                </span>

                <Input
                  type="number"
                  variant="auth"
                  placeholder="Enter amount"
                  value={customAmount ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomAmount(v === "" ? null : parseFloat(v));
                  }}
                  className={cn(
                    "h-14 rounded-[10px] pl-12 pr-5 text-[18px] leading-8 tracking-[-0.3px]",
                    "bg-[rgba(37,48,240,0.07)] dark:bg-[rgba(255,255,255,0.04)]",
                    "border border-[#2530F0]/20 dark:border-white/10",
                    "focus-visible:outline-none focus-visible:border-[#5f4bf6]"
                  )}
                />
              </div>

              <Button
                disabled={isRecharging}
                onClick={() => {
                  if (customAmount && customAmount >= 20) {
                    setSelectedAmount(customAmount);
                    showConfirm.onTrue();
                  } else {
                    toast({
                      title: "Invalid amount",
                      description: "Please enter a valid amount (minimum $20).",
                      variant: "destructive",
                    });
                  }
                }}
                className="h-14 w-full gap-2 rounded-full px-7 md:w-auto"
              >
                <span className="text-[16px] font-medium">Add Funds</span>
                <ArrowUpRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-recharge-enabled"
                  checked={autoRechargeEnabled}
                  onCheckedChange={() => handleAutoRechargeToggle()}
                  size="md"
                  variant="default"
                  className="rounded-[4px]"
                />

                <label
                  htmlFor="auto-recharge-enabled"
                  className="text-[16px] tracking-[-0.3px] text-muted-foreground dark:text-[#B9C2D5] cursor-pointer select-none"
                >
                  Enable auto-recharge when balance drops below $10
                </label>
              </div>

              {autoRechargeEnabled && (
                <div className="flex flex-wrap items-center gap-2 pl-7 text-sm text-muted-foreground dark:text-[#B9C2D5]">
                  <span className="text-[14px] font-semibold tracking-[-0.2px] text-foreground">
                    Current auto-recharge amount:
                  </span>

                  <span className="inline-flex items-center rounded-full bg-background px-3 py-1 text-sm font-medium border">
                    ${autoRechargeAmount}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Edit auto-recharge amount"
                    onClick={() => {
                      setTempAutoRechargeAmount(autoRechargeAmount);
                      showAutoRechargeConfig.onTrue();
                    }}
                  >
                    <PencilLine className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Auto-Recharge Configuration Dialog */}
      <Dialog
        open={showAutoRechargeConfig.value}
        onOpenChange={showAutoRechargeConfig.onToggle}
      >
        <DialogContent data-testid="dashboard-billing-auto-recharge-dialog" className="font-['Space_Grotesk']">
          <DialogHeader>
            <DialogTitle>Configure Auto-Recharge</DialogTitle>
            <DialogDescription>
              Set the amount to automatically recharge when your balance drops
              below $10.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recharge Amount</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </div>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  className="pl-7"
                  value={tempAutoRechargeAmount}
                  onChange={(e) =>
                    setTempAutoRechargeAmount(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum amount: <span className="font-semibold">$20</span>
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={showAutoRechargeConfig.onFalse}>
              Cancel
            </Button>
            <Button onClick={confirmAutoRechargeConfig}>
              Save &amp; Enable
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable Auto-Recharge Confirmation Dialog */}
      <Dialog
        open={showDisableAutoRechargeConfirm}
        onOpenChange={(open) => {
          if (!open) setShowDisableAutoRechargeConfirm(false);
        }}
      >
        <DialogContent data-testid="dashboard-billing-auto-recharge-disable-dialog" className="font-['Space_Grotesk']">
          <DialogHeader>
            <DialogTitle>Turn off auto-recharge?</DialogTitle>
            <DialogDescription>
              Auto-recharge is currently set to add{" "}
              <strong>${autoRechargeAmount}</strong> when your balance drops
              below $10. Turning this off means you&apos;ll need to top up
              manually to avoid service interruption.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDisableAutoRechargeConfirm(false)}
            >
              Keep it on
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDisableAutoRechargeConfirm(false);
                void setAutoRecharge(false, autoRechargeAmount);
              }}
            >
              Turn off auto-recharge
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recharge Confirmation Dialog */}
      <Dialog open={showConfirm.value} onOpenChange={showConfirm.onToggle}>
        <DialogContent data-testid="dashboard-billing-recharge-confirm-dialog" className="font-['Space_Grotesk']">
          <DialogHeader>
            <DialogTitle>Confirm Recharge</DialogTitle>
            <DialogDescription>
              Are you sure you want to add <strong>${selectedAmount ?? 0}</strong>{" "}
              to your wallet?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs">
            <Checkbox
              id="autoRecharge"
              checked={addFundsAutoRechargeEnabled}
              onCheckedChange={(checked) =>
                setAddFundsAutoRechargeEnabled(checked === true)
              }
              variant="default"
              size="sm"
              data-testid="billing-auto-recharge-checkbox"
            />
            <label
              htmlFor="autoRecharge"
              className="cursor-pointer text-xs text-muted-foreground"
            >
              Enable recurring auto-recharge for this amount
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={showConfirm.onFalse}>
              Cancel
            </Button>
            <Button
              onClick={() => doRecharge(selectedAmount)}
              disabled={isRecharging}
              data-testid="billing-yes-recharge-button"
            >
              {isRecharging ? "Recharging..." : "Yes, Recharge"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickRecharge;
