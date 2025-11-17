"use client";

import React, { useState, useEffect } from "react";
import { FEEDBACK_TRIGGERS } from "@/constants/app-constants";
import {
  useRechargeMutation,
  useGetAutoRechargeQuery,
  useUpdateAutoRechargeMutation,
} from "@/api/billing";

import { Logger } from "@/lib/utils/logger";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { PencilLine, ArrowUpRight, RefreshCcw } from "lucide-react";

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

      // 🎯 New / conditional toasts
      if (options?.showAmountUpdatedToast) {
        toast({
          title: "Auto-recharge amount updated",
          description: `We'll now add $${amount} whenever your balance drops below $10.`,
        });
      } else {
        toast({
          title: "Auto-recharge updated",
          description: `Auto-recharge has been ${enabled ? `enabled with $${amount}` : "disabled"
            }.`,
        });
      }
    } catch (error: unknown) {
      Logger.error("Failed to update auto-recharge:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not update auto-recharge";
      toast({
        title: "Error updating auto-recharge",
        description: message,
      });
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
      showAmountUpdatedToast: wasEnabled, // show special toast only when updating existing amount
    });

    showAutoRechargeConfig.onFalse();
  };

  return (
    <>
      <Card className="relative overflow-hidden border border-border/80 shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              <span>Quick Recharge</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Secure • Instant • Stripe
            </span>
          </CardTitle>
          <CardDescription>
            Add funds to your account instantly
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Quick recharge presets – pill layout like screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickRechargeAmounts.map(
                ({ amount, label: _label, description, isRecommended }) => {
                  const isSelected = selectedAmount === amount;
                  return (
                    <Button
                      key={amount}
                      variant="outline"
                      className={`group relative flex h-[76px] w-full items-center justify-between rounded-full border-2 px-6 text-left transition-all
                        ${isRecommended
                          ? "border-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg hover:brightness-105"
                          : "border-primary/60 bg-transparent text-foreground hover:bg-primary/5"
                        }
                        ${isSelected
                          ? "ring-2 ring-primary/70"
                          : "hover:border-primary"
                        }`}
                      onClick={() => {
                        setSelectedAmount(amount);
                        showConfirm.onTrue();
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold tracking-tight">
                          ${amount}
                        </span>
                        {description && (
                          <span
                            className={`mt-1 text-xs ${isRecommended
                                ? "text-white/80"
                                : "text-muted-foreground"
                              }`}
                          >
                            {description}
                          </span>
                        )}
                      </div>

                      {isRecommended && (
                        <span className="inline-flex items-center rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                          Popular
                        </span>
                      )}
                    </Button>
                  );
                }
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <Separator />
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-card">
                <span className="text-xs text-muted-foreground">
                  Or enter custom amount
                </span>
              </div>
            </div>

            {/* Custom amount + Add funds */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </div>
                  <Input
                    type="number"
                    placeholder="Enter amount (min $20)"
                    className="pl-7 text-sm"
                    value={customAmount ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCustomAmount(
                        v === "" ? null : parseFloat(e.target.value)
                      );
                    }}
                  />
                </div>
                <Button
                  className="flex-shrink-0 sm:w-36"
                  disabled={isRecharging}
                  onClick={() => {
                    if (customAmount && customAmount >= 20) {
                      setSelectedAmount(customAmount);
                      showConfirm.onTrue();
                    } else {
                      toast({
                        title: "Invalid amount",
                        description:
                          "Please enter a valid amount (minimum $20).",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  {isRecharging ? "Processing..." : "Add Funds"}
                </Button>
              </div>

              {/* Auto-recharge config block */}
              <div className="mt-3 rounded-lg border bg-muted/30 px-3 py-3 space-y-2">
                <label className="flex items-start gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-primary"
                    checked={autoRechargeEnabled}
                    onChange={handleAutoRechargeToggle}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span>Auto-recharge when balance is low</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      When your balance drops below <span>$10</span>, we’ll
                      automatically add funds so your SensePC never stops
                      unexpectedly.
                    </span>
                  </span>
                </label>

                {autoRechargeEnabled && (
                  <div className="flex flex-wrap items-center gap-2 pl-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      {/* 🔄 Auto-recharge icon */}
                      <RefreshCcw className="h-3.5 w-3.5 text-primary" />
                      <span>Current auto-recharge amount:</span>
                    </div>

                    <span className="inline-flex items-center rounded-full bg-background px-3 py-1 text-sm font-medium border">
                      ${autoRechargeAmount}
                    </span>

                    {/* Edit button */}
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
        </CardContent>
      </Card>

      {/* Auto-Recharge Configuration Dialog */}
      <Dialog
        open={showAutoRechargeConfig.value}
        onOpenChange={showAutoRechargeConfig.onToggle}
      >
        <DialogContent>
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
                    setTempAutoRechargeAmount(
                      parseFloat(e.target.value) || 0
                    )
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
        <DialogContent>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Recharge</DialogTitle>
            <DialogDescription>
              Are you sure you want to add{" "}
              <strong>${selectedAmount ?? 0}</strong> to your wallet?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs">
            <input
              type="checkbox"
              id="autoRecharge"
              className="h-4 w-4 accent-primary"
              checked={addFundsAutoRechargeEnabled}
              onChange={() =>
                setAddFundsAutoRechargeEnabled(!addFundsAutoRechargeEnabled)
              }
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
