"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { recharge } from "@/api/billing";
import { quickRechargeAmounts } from "../data";
import { useBoolean } from "@/hooks/use-boolean";

interface Props {
  setBalance: (balance: number) => void;
}

const QuickRecharge = ({ setBalance }: Props) => {
  const showConfirm = useBoolean();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [isRecharging, setIsRecharging] = useState(false);

  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);

  const doRecharge = async (amount: number | null) => {
    if (!amount) return;
    try {
      setIsRecharging(true);
      const data = await recharge(amount);
      setBalance(data.newBalance);
      toast({
        title: "Recharge successful",
        description: `Your wallet balance has been updated successfully. New balance amount is ${data.newBalance}`,
      });
      setCustomAmount(null);
      showConfirm.onFalse();
    } catch (error: unknown) {
      console.error("Failed to recharge wallet:", error);
      const message =
        error instanceof Error ? error.message : "Could not recharge wallet";
      toast({
        title: "Error recharging wallet",
        description: message,
      });
    } finally {
      setIsRecharging(false);
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Quick Recharge
          </CardTitle>
          <CardDescription>Add funds to your account instantly</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {quickRechargeAmounts.map(
                ({ amount, label, description, isRecommended }) => (
                  <Button
                    key={amount}
                    variant={isRecommended ? "default" : "outline"}
                    className="h-auto relative group p-4 flex flex-col items-start gap-1"
                    onClick={() => {
                      setSelectedAmount(amount);
                      showConfirm.onTrue();
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{label}</span>
                      {isRecommended && (
                        <Badge variant="secondary" className="text-[10px]">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <span className="text-2xl font-bold">${amount}</span>
                    <span className="text-xs text-muted-foreground">
                      {description}
                    </span>
                  </Button>
                )
              )}
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-card">
                <span className="text-xs text-muted-foreground">
                  Or enter custom amount
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </div>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    className="pl-7"
                    value={customAmount ?? ""}
                    onChange={(e) =>
                      setCustomAmount(parseFloat(e.target.value))
                    }
                  />
                </div>
                <Button
                  className="flex-shrink-0"
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

              {/* ✅ Auto Recharge Checkbox */}
              <label className="flex items-center text-sm font-medium cursor-pointer text-primary dark:text-primary">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 accent-primary"
                  checked={autoRechargeEnabled}
                  onChange={() => setAutoRechargeEnabled(!autoRechargeEnabled)}
                />
                Enable auto-recharge when balance drops below $10
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirm.value} onOpenChange={showConfirm.onToggle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Recharge</DialogTitle>
            <DialogDescription>
              Are you sure you want to add <strong>${selectedAmount}</strong> to
              your wallet?
            </DialogDescription>
          </DialogHeader>

          {/* ✅ New checkbox */}
          <div className="flex items-center text-sm font-medium cursor-pointer text-primary dark:text-primary">
            <input
              type="checkbox"
              id="autoRecharge"
              className="mr-2 h-4 w-4 accent-primary"
              checked={autoRechargeEnabled}
              onChange={() => setAutoRechargeEnabled(!autoRechargeEnabled)}
            />
            <label htmlFor="autoRecharge">Enable automatic reoccurring</label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={showConfirm.onFalse}>
              Cancel
            </Button>
            <Button onClick={() => doRecharge(selectedAmount)}>
              Yes, Recharge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickRecharge;
