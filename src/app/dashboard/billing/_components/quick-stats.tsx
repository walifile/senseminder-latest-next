"use client";

import giftAnimation from "@/lottie/gift.json";
import React, { useState, useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { redeemPromo, getPromoInfo } from "@/api/promocashback";
import {
  useGetCurrentBalanceQuery,
  useGetMonthlySpendingQuery,
} from "@/api/billing";

import { Button } from "@/components/ui/button";
import { cn, getErrorMessage } from "@/lib/utils";
import { fCurrency } from "@/lib/utils/format-number";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { Wallet, TrendingUp, CheckCircle2 } from "lucide-react";

import { promotionsAndCashback } from "../data";
import QuickStatsTooltip from "../_components/quick-stats-tooltip";
import QuickStatsLoading from "../_components/quick-stats-loading";

type PromoInfoType = {
  eligible: boolean;
  promoBalance: number;
} | null;

const QuickStats = () => {
  const { data: balanceData, isLoading: balanceLoading } =
    useGetCurrentBalanceQuery();
  const { data: spendingData, isLoading: spendingLoading } =
    useGetMonthlySpendingQuery();

  const balance = balanceData?.balance ?? null;
  const lastRechargeTimestamp = balanceData?.lastRecharge?.timestamp ?? null;
  const currentMonthSpending = spendingData?.currentMonth ?? null;
  const monthSpendingPercentChange = spendingData?.percentChange ?? 0.0;
  const [redeemedAmount, setRedeemedAmount] = useState<number | null>(null);
  const [promoLoading, setPromoLoading] = useState(true);

  const [promoInfo, setPromoInfo] = useState<PromoInfoType>(null);
  const [open, setOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [step, setStep] = useState<"confirm" | "success">("confirm");

  useEffect(() => {
    (async () => {
      setPromoLoading(true);
      try {
        const info = await getPromoInfo();
        setPromoInfo(info);
      } catch (e) {
        console.error("Failed to load promo info:", e);
      } finally {
        setPromoLoading(false); // set false when done
      }
    })();
  }, []);

  const getBalanceColor = () => {
    if (balance !== null && balance >= 20) return "text-green-500";
    if (balance !== null && balance >= 10) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Wallet Balance */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Wallet Balance
              </span>
              <QuickStatsTooltip
                content="This is your available wallet balance. It is used for all
                    active services, including Sense PC and Sense Storage
                    charges. Keep it funded to avoid service interruptions"
              />
            </div>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div
              className={cn(
                "text-2xl font-bold tracking-tight",
                getBalanceColor()
              )}
            >
              {balanceLoading ? <QuickStatsLoading /> : fCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastRechargeTimestamp
                ? `Last recharged on ${new Date(
                    lastRechargeTimestamp
                  ).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`
                : "No recharge history yet"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Spending */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Monthly Spending
              </span>
              <QuickStatsTooltip
                content="This shows your total charges for Sense PC and Sense Storage
                    services this month. Spending includes compute time, storage
                    usage, and any other billable activity."
              />
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight">
              {spendingLoading ? (
                <QuickStatsLoading />
              ) : (
                fCurrency(currentMonthSpending)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {!spendingLoading &&
                `${monthSpendingPercentChange}% from last month`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Promo & Cashback */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-sky-500" />
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Promotion & Cashback
            </span>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 px-2 py-1">
            {promoInfo?.eligible ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Claim your free credits to start using SensePC today!
                </p>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={() => setOpen(true)}
                    >
                      Redeem Your Credits
                    </Button>
                    <Player
                      autoplay
                      loop
                      src={giftAnimation}
                      style={{ height: "40px", width: "40px" }}
                    />
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                      Cashback
                    </span>
                    <span className="text-base font-semibold text-purple-500">
                      $0.00
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm text-muted-foreground font-medium">
                {[
                  {
                    label: "Promotion",
                    tooltip:
                      "Promotional balance is a limited-time credit added to your account (e.g., from offers or referrals). It can only be used for service usage and holds no real-world cash value.",
                    value: promoInfo?.promoBalance || 0,
                    color: "text-sky-500",
                  },
                  ...promotionsAndCashback.filter(
                    (item) => item.label !== "Promotion"
                  ),
                ].map((item, idx, arr) => (
                  <React.Fragment key={item.label}>
                    <div className="flex flex-col items-start gap-0.5 leading-tight">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                          {item.label}
                        </span>
                        <QuickStatsTooltip
                          content={item.tooltip}
                          iconClass="size-3.5 text-muted-foreground"
                        />
                      </div>

                      <span className={`text-base font-semibold ${item.color}`}>
                        {promoLoading && item.label === "Promotion" ? (
                          <QuickStatsLoading />
                        ) : (
                          fCurrency(item.value)
                        )}
                      </span>
                    </div>

                    {idx < arr.length - 1 && (
                      <div className="w-px bg-border mx-3" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setStep("confirm");
        }}
      >
        <DialogContent className="sm:max-w-sm">
          {step === "confirm" ? (
            <>
              <DialogHeader className="flex flex-col items-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <DialogTitle>Confirm Redemption</DialogTitle>
                <DialogDescription className="text-center">
                  Are you sure you want to claim your free SmartPC credits?{" "}
                  <br />
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={redeeming}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={async () => {
                    setRedeeming(true);
                    try {
                      const res = await redeemPromo();
                      setRedeemedAmount(res.amountAdded);
                      // toast.success(`Promo redeemed: +${fCurrency(res.amountAdded)} credits`);
                      const info = await getPromoInfo();
                      setPromoInfo(info);
                      setStep("success");
                    } catch (e) {
                      toast.error(getErrorMessage(e, "Failed to redeem promo"));
                    } finally {
                      setRedeeming(false);
                    }
                  }}
                >
                  Redeem Credits
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* <DialogHeader className="flex flex-col items-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
          <DialogTitle>Credits Redeemed!</DialogTitle>
          <DialogDescription className="text-center">
            You’ve received{" "}
            <span className="font-semibold text-green-600">
              {fCurrency(redeemedAmount)}
            </span>{" "}
            in your SensePC wallet.
          </DialogDescription>
        </DialogHeader> */}
              <DialogHeader className="flex flex-col items-center space-y-3">
                <Player
                  autoplay
                  loop={false}
                  src={giftAnimation}
                  style={{ height: "80px", width: "80px" }}
                />
                <DialogTitle>Credits Redeemed!</DialogTitle>
                <DialogDescription className="text-center">
                  You’ve received{" "}
                  <span className="font-semibold text-green-600">
                    {fCurrency(redeemedAmount)}
                  </span>{" "}
                  in your SensePC wallet.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setOpen(false);
                    setStep("confirm");
                  }}
                >
                  OK
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickStats;
