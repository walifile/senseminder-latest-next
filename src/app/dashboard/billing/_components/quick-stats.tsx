"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { getCurrentBalance, getMonthlySpending } from "@/api/billing";
import { promotionsAndCashback } from "../data";
import { MonthlyChangeSummary } from "../types";
import QuickStatsTooltip from "../_components/quick-stats-tooltip";
import { fCurrency } from "@/lib/utils/format-number";
import QuickStatsLoading from "../_components/quick-stats-loading";

interface Props {
  balance: number | null;
  setBalance: (balance: number | null) => void;
}

const QuickStats = ({ balance, setBalance }: Props) => {
  const [lastRechargeTimestamp, setLastRechargeTimestamp] = useState<
    string | null
  >(null);
  const [currentMonthSpending, setCurrentMonthSpending] = useState<
    number | null
  >(null);
  const [monthSpendingPercentChange, setMonthSpendingPercentChange] =
    useState(0.0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [spendingLoading, setSpendingLoading] = useState(true);

  const fetchCurrentBalance = async () => {
    try {
      setBalanceLoading(true); // 👈 Start loading
      const data = await getCurrentBalance();
      setBalance(data.balance);
      if (data?.lastRecharge?.timestamp) {
        setLastRechargeTimestamp(data.lastRecharge.timestamp);
      }
    } catch (error) {
      console.error("Failed to get wallet balance:", error);
      toast({
        title: "Error loading wallet balance",
        description:
          error instanceof Error
            ? error.message
            : "Could not fetch wallet balance",
      });
    } finally {
      setBalanceLoading(false); // 👈 Stop loading
    }
  };

  const fetchMonthlySpending = async () => {
    try {
      setSpendingLoading(true);
      const data: MonthlyChangeSummary = await getMonthlySpending();
      setCurrentMonthSpending(data.currentMonth);
      setMonthSpendingPercentChange(data.percentChange);
    } catch (error: unknown) {
      console.error("Failed to get monthly spending:", error);
      toast({
        title: "Error loading monthly spending",
        description:
          error instanceof Error
            ? error.message
            : "Could not fetch monthly spending",
      });
    } finally {
      setSpendingLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentBalance();
    fetchMonthlySpending();
  }, []);

  // Get balance color based on amount
  const getBalanceColor = () => {
    if (balance !== null && balance >= 20) return "text-green-500";
    if (balance !== null && balance >= 10) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Balance Card */}
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
                    charges. Keep it funded to avoid service interruptions."
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
          <div className="flex justify-between px-2 py-1 text-sm text-muted-foreground font-medium">
            {promotionsAndCashback.map((item, idx) => (
              <React.Fragment key={item.label}>
                <div
                  className={`flex flex-col ${item.align} gap-0.5 leading-tight`}
                >
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
                    {fCurrency(item.value)}
                  </span>
                </div>

                {idx < promotionsAndCashback.length - 1 && (
                  <div className="w-px bg-border mx-3" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
