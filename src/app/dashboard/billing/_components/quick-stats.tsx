"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { redeemPromo, getPromoInfo } from "@/api/promocashback";
import {
  useGetCurrentBalanceQuery,
  useGetMonthlySpendingQuery,
} from "@/api/billing";

import { Logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";
import { cn, getErrorMessage } from "@/lib/utils";
import { fCurrency } from "@/lib/utils/format-number";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";

import { promotionsAndCashback } from "../data";
import QuickStatsTooltip from "./quick-stats-tooltip";
import QuickStatsLoading from "./quick-stats-loading";
import { useBillingRefresh } from "../_context/billing-refresh-context";

type PromoInfoType = {
  eligible?: boolean;
  promoBalance?: number;
  cashback?: number;
} | null;

type BalanceDataWithPromo =
  | {
      balance?: number;
      lastRecharge?: { timestamp?: string | null } | null;
      promoBalance?: number;
      cashback?: number;
    }
  | null
  | undefined;

type QuickStatsProps = {
  blurValues?: boolean;
};

const QuickStats = ({ blurValues = false }: QuickStatsProps) => {
  const { refreshKey } = useBillingRefresh();

  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useGetCurrentBalanceQuery();

  const {
    data: spendingData,
    isLoading: spendingLoading,
    refetch: refetchSpending,
  } = useGetMonthlySpendingQuery();

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

  const balanceDataWithPromo = balanceData as BalanceDataWithPromo;

  const promoBalanceValue =
    balanceDataWithPromo?.promoBalance ?? promoInfo?.promoBalance ?? 0;

  const cashbackValue =
    balanceDataWithPromo?.cashback ?? promoInfo?.cashback ?? 0;

  useEffect(() => {
    (async () => {
      setPromoLoading(true);
      try {
        const info = await getPromoInfo();
        setPromoInfo(info);
      } catch (e) {
        Logger.error("Failed to load promo info:", e);
      } finally {
        setPromoLoading(false);
      }
    })();
  }, [refreshKey]);

  useEffect(() => {
    refetchBalance();
    refetchSpending();
  }, [refreshKey, refetchBalance, refetchSpending]);

  const hasPromoAmounts = promoBalanceValue > 0 || cashbackValue > 0;

  const isInitialPromoLoad =
    promoLoading &&
    !promoInfo &&
    balanceDataWithPromo?.promoBalance == null &&
    balanceDataWithPromo?.cashback == null;

  return (
    <>
      {/* md+: 4 columns, promo spans 2 => all 3 cards in one row */}
      <div
        data-testid="dashboard-billing-quick-stats"
        className="grid grid-cols-1 gap-6 md:grid-cols-4 font-['Space_Grotesk']"
      >
        <DashboardCard
          className={cn(
            "relative min-h-[180px] overflow-hidden md:col-span-2",
            "border-none p-[20px] md:p-6",
            "bg-[linear-gradient(156deg,#2530F0_10%,#4C55F8_48%,#D971FF_105%)]",
            "text-white"
          )}
        >
          {/* Content sits on top of illustration */}
          <div className="relative z-10 flex h-full flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-1 flex-col justify-between gap-4">
              {promoInfo?.eligible && !hasPromoAmounts ? (
                <>
                  <div className="space-y-1">
                    <p className="text-xl font-semibold tracking-tight md:text-2xl">
                      Get up to $10.00 in promotional credit!
                    </p>
                    <p className="text-sm text-white/90 md:text-base">
                      Claim your free credits to start using SensePC today!
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      size="lg"
                      variant="white"
                      onClick={() => setOpen(true)}
                      className="rounded-full px-6"
                    >
                      Redeem Your Credits
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold tracking-tight md:text-xl">
                      Promotion &amp; Cashback
                    </p>
                    <QuickStatsTooltip
                      content="These balances include any promotional credits and cashback you’ve received. They are automatically used for SensePC and Sense Cloud usage."
                      iconClass="size-4 text-white/80"
                    />
                  </div>

                  <div className="flex w-full max-w-[326px] items-stretch justify-between">
                    {[
                      {
                        label: "Promotion",
                        tooltip:
                          "Promotional balance is a limited-time credit added to your account (e.g., from offers or referrals). It can only be used for service usage and holds no real-world cash value.",
                        value: promoBalanceValue,
                        color: "text-sky-200",
                        kind: "promotion",
                      },
                      ...promotionsAndCashback
                        .filter((item) =>
                          item.label.toLowerCase().includes("cashback")
                        )
                        .map((item) => ({
                          ...item,
                          value: cashbackValue,
                          kind: "cashback",
                        })),
                    ].map((item, idx, arr) => {
                      const showLoading = isInitialPromoLoad;

                      return (
                        <React.Fragment key={item.label}>
                          <div className="flex flex-col gap-px">
                            <span
                              className={cn(
                                "text-white text-[32px] font-bold leading-[42px] tracking-[-0.5px]",
                                blurValues && "blur-[6px] select-none"
                              )}
                            >
                              {showLoading ? (
                                <QuickStatsLoading />
                              ) : (
                                fCurrency(item.value)
                              )}
                            </span>

                            <div className="flex items-center gap-1">
                              <span className="text-[14px] leading-5 tracking-[-0.2px] text-white/70">
                                {item.label}
                              </span>
                              <QuickStatsTooltip
                                content={item.tooltip}
                                iconClass="size-3.5 text-white/80"
                              />
                            </div>
                          </div>

                          {idx < arr.length - 1 && (
                            <div
                              className="w-px self-stretch bg-white/20"
                              aria-hidden
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Illustration pinned to bottom-right like Figma */}
          <div className="pointer-events-none absolute bottom-0 right-0 hidden md:block">
            <Image
              src="/assets/dashboard/cashback.svg"
              alt="Promotion & Cashback illustration"
              width={193}
              height={144}
              className="h-[144px] w-[193px] object-contain translate-x-[25px] translate-y-[16px]"
              priority
            />
          </div>
        </DashboardCard>

        <DashboardCard className="relative flex min-h-[180px] flex-col overflow-hidden p-5">
          {/* Ellipse 3 (same placement style as PublicDarkBackground) */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-0"
            aria-hidden
          >
            <img
              src="/assets/dashboard/Ellipse%203.svg"
              alt=""
              className="h-full w-auto max-w-none object-contain"
            />
          </div>

          {/* ✅ text spacing like Figma, responsive (no fixed height) */}
          <div className="relative z-10 flex flex-1 flex-col justify-between">
            <p className="text-[18px] font-semibold leading-[1.78] tracking-[-0.017em] text-[#020816] dark:text-[#B9C2D5]">
              Wallet Balance
            </p>

            <div className="flex flex-col gap-px">
              <div
                className={cn(
                  "text-[28px] font-bold leading-[1.3125] tracking-[-0.016em] md:text-[32px] text-[#020816] dark:text-white",
                  blurValues && "blur-[6px] select-none"
                )}
                data-testid="billing-wallet-balance"
              >
                {balanceLoading ? <QuickStatsLoading /> : fCurrency(balance)}
              </div>

              <p className="text-sm font-normal leading-[1.43] tracking-[-0.014em] text-[#454545] dark:text-[#B9C2D5]">
                {blurValues
                  ? ""
                  : lastRechargeTimestamp
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
          </div>

          {/* illustration pinned bottom-right */}
          <div className="pointer-events-none absolute bottom-0 right-0 hidden md:block">
            <Image
              src="/assets/dashboard/wallet.svg"
              alt="Wallet balance illustration"
              width={154}
              height={160}
              className="h-[160px] w-[154px] object-contain translate-x-[25px] translate-y-[20px]"
            />
          </div>
        </DashboardCard>

        <DashboardCard className="relative flex min-h-[180px] flex-col overflow-hidden p-5">
          {/* Ellipse 3 (same placement style as PublicDarkBackground) */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-0"
            aria-hidden
          >
            <img
              src="/assets/dashboard/Ellipse%203.svg"
              alt=""
              className="h-full w-auto max-w-none object-contain"
            />
          </div>

          {/* ✅ text spacing like Figma, responsive (no fixed height) */}
          <div className="relative z-10 flex flex-1 flex-col justify-between">
            <p className="text-[18px] font-semibold leading-[1.78] tracking-[-0.017em] text-[#020816] dark:text-[#B9C2D5]">
              Monthly Spending
            </p>

            <div className="flex flex-col gap-px">
              <div
                className={cn(
                  "text-[28px] font-bold leading-[1.3125] tracking-[-0.016em] md:text-[32px] text-[#020816] dark:text-white",
                  blurValues && "blur-[6px] select-none"
                )}
              >
                {spendingLoading ? (
                  <QuickStatsLoading />
                ) : (
                  fCurrency(currentMonthSpending)
                )}
              </div>

              <p
                className={cn(
                  "text-sm font-normal leading-[1.43] tracking-[-0.014em] text-[#454545] dark:text-[#B9C2D5]",
                  blurValues && "blur-[6px] select-none"
                )}
              >
                {!spendingLoading &&
                  `${monthSpendingPercentChange}% from last month`}
              </p>
            </div>
          </div>

          {/* illustration pinned bottom-right */}
          <div className="pointer-events-none absolute bottom-0 right-0 hidden md:block">
            <Image
              src="/assets/dashboard/monthly.svg"
              alt="Monthly spending illustration"
              width={200}
              height={160}
              className="h-[160px] w-[200px] object-contain translate-x-[25px] translate-y-[20px]"
            />
          </div>
        </DashboardCard>
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setStep("confirm");
        }}
      >
        <DialogContent
          data-testid="dashboard-billing-promo-dialog"
          className={cn(
            "font-['Space_Grotesk']", // ✅ apply font inside modal (portal)
            "sm:max-w-md",
            step === "success" &&
              "sm:max-w-md p-0 px-6 pt-10 pb-8 sm:px-[40px] sm:pt-[50px] sm:pb-[40px]"
          )}
        >
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
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={async () => {
                    setRedeeming(true);
                    try {
                      const res = await redeemPromo();
                      setRedeemedAmount(res.amountAdded);
                      const info = await getPromoInfo();
                      setPromoInfo(info);
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
            <>
              {/* ✅ Success dialog layout like Figma */}
              <div className="mx-auto flex w-full flex-col items-center gap-6 text-center">
                <Image
                  src="/assets/dashboard/gift.svg"
                  alt="Gift"
                  width={60}
                  height={50}
                />

                <div className="w-full max-w-[379px]">
                  <DialogTitle className="w-full text-center">
                    Credits Redeemed!
                  </DialogTitle>

                  <DialogDescription className="mt-1 w-full text-center">
                    You&apos;ve received{" "}
                    <span className="font-medium text-[#4CC26B]">
                      {fCurrency(redeemedAmount)}
                    </span>{" "}
                    in your SensePC wallet
                  </DialogDescription>
                </div>

                {/* ✅ centered button (don’t use DialogFooter here) */}
                <div className="flex w-full justify-center pt-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setStep("confirm");
                    }}
                    className="h-14 w-[140px]"
                  >
                    OK
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickStats;
