"use client";

import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Calendar,
  CalendarDays,
  Calendar as CalendarIcon,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  CheckCircle,
  HardDrive,
  Cpu,
  Server,
  Zap,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PaymentMethodDialog } from "@/components/ui/payment-method-dialog";
import { toast } from "@/components/ui/use-toast";
import { getCurrentBalance, getMonthlySpending, getPaymentMethods, recharge } from "@/api/billing";
import { PaymentMethod } from "@stripe/stripe-js";
import { StripeProvider } from "@/components/ui/StripeProvider";
import { RechargeHistoryTab } from "./recharge-tab";
import { SmartPCUsageHistoryTab } from "./smartpc-usage-history-tab";
import { SmartStorageUsageHistoryTab } from "./smartstorage-usage-history-tab";

const quickRechargeAmounts = [
  {
    amount: 20,
    label: ""
  },
  { amount: 50, 
    label: "", 
    description: "", 
    isRecommended: true, 
  },
  {
    amount: 100,
    label: "",
    description: "",
  },
  { amount: 200, 
    label: "", 
    description: "" },
  
];


const billingPlans = [
  {
    id: "hourly",
    name: "Hourly",
    description: "Perfect for quick tasks and testing",
    icon: Clock,
    features: [
      "Pay only for actual usage",
      "No minimum commitment",
      "Basic support included",
    ],
  },
  {
    id: "daily",
    name: "Daily",
    description: "Ideal for day-long projects",
    price: "9.99",
    unit: "day",
    icon: CalendarDays,
    features: [
      "24-hour continuous access",
      "15% savings vs hourly",
      "Basic support included",
    ],
  },
  {
    id: "monthly",
    name: "Monthly",
    description: "Best value for regular users",
    price: "179.99",
    unit: "month",
    icon: Calendar,
    features: [
      "30-day continuous access",
      "35% savings vs weekly",
      "Basic support included",
    ],
  }
];

// const smartStoragePlans = [
//   {
//       id: "hourly",
//       name: "Hourly",
//       icon: Clock,
//       price: "0.15",
//       unit: "GB/hour",
//       description: "Flexible storage for temporary needs",
//       features: [
//         "High-speed SSD storage",
//         "Pay per GB used",
//         "Instant provisioning",
//         "Data redundancy",
//         "No minimum commitment"
//       ]
//     },
//     {
//       id: "daily",
//       name: "Daily",
//       icon: Calendar,
//       price: "2.50",
//       unit: "GB/day",
//       description: "Optimized for daily workflows",
//       features: [
//         "All hourly features",
//         "30% cost savings vs hourly",
//         "Batch processing optimization",
//         "Enhanced performance",
//         "Daily usage analytics"
//       ]
//     },{
//       id: "monthly",
//       name: "Monthly",
//       icon: CalendarDays,
//       price: "50.00",
//       unit: "GB/month",
//       description: "Cost-effective for persistent storage",
//       features: [
//         "All daily features",
//         "40% cost savings vs daily",
//         "Enterprise-grade reliability",
//         "Advanced backup options",
//         "Volume discounts available"
//       ]
//     }
//   ];

export type ExtendedPaymentMethod = PaymentMethod & {
    isDefault?: boolean;
};

const BillingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [setSelectedStoragePlan] = useState("monthly");
  const [selectedService, setSelectedService] = useState("smartpc");

  const [balance, setBalance] = useState<number | null>(null);
  const [currentMonthSpending, setCurrentMonthSpending] = useState<number | null>(null);
  const [lastMonthSpending, setLastMonthSpending] = useState(0.0);
  const [monthSpendingPercentChange, setMonthSpendingPercentChange] = useState(0.0);
  const [loading, setLoading] = useState(true);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<ExtendedPaymentMethod[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [isRecharging, setIsRecharging] = useState(false);
  const [lastRechargeTimestamp, setLastRechargeTimestamp] = useState<string | null>(null);
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);

  const [balanceLoading, setBalanceLoading] = useState(true);
  const [spendingLoading, setSpendingLoading] = useState(true); 

  const [storageTier, setStorageTier] = useState(1);
  const [selectedServer, setSelectedServer] = useState("us-east");

  const serverLocations = [
    { id: "us-east", name: "US East (N. Virginia)" },
  ];

  const PRICE_PER_TIER = 0.5;
  const getStorageSizeFromTier = (tier: number) => `${tier * 20} GB`;
  const price = storageTier === 1 ? 0 : (storageTier - 1) * PRICE_PER_TIER;
  
  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await getPaymentMethods();
      const mapped = mapPaymentMethodsFromAPI(data);
      setSavedPaymentMethods(mapped);
    } catch (error: unknown) {
      console.error("Failed to load payment methods:", error);
      const message =
          error instanceof Error
            ? error.message
            : "Could not fetch payment methods.";
      toast({
        title: "Error loading payment methods",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const mapPaymentMethodsFromAPI = (apiResponse: any): ExtendedPaymentMethod[] => {
    const defaultId = apiResponse.defaultPaymentMethod?.id;
    return apiResponse.paymentMethods.map((pm: any) => ({
      id: pm.id,
      type: "card",
      card: {
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
        brand: pm.card.brand,
      },
      isDefault: pm.id === defaultId,
    }));
  };

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

  type MonthlyChangeSummary = {
    currentMonth: number;
    lastMonth: number;   
    percentChange: number;
    trend: 'increase' | 'decrease' | 'no change';
  };

  const fetchMonthlySpending = async () => {
    try {
      setSpendingLoading(true);
      const data: MonthlyChangeSummary = await getMonthlySpending();
      setCurrentMonthSpending(data.currentMonth);
      setLastMonthSpending(data.lastMonth);
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
    fetchPaymentMethods();
    fetchCurrentBalance();
    fetchMonthlySpending();
  }, []);
  
  
  const doRecharge = async(amount: number)=> {
    try {
      setLoading(true);
      setIsRecharging(true);
      const data = await recharge(amount);
      setBalance(data.newBalance);
      toast({
        title: "Recharge successful",
        description: `Your wallet balance has been updated successfully. New balance amount is ${data.newBalance}`,
      });
      setCustomAmount(null)
    } catch (error: unknown) {
      console.error("Failed to recharge wallet:", error);
      const message =
          error instanceof Error
            ? error.message
            : "Could not recharge wallet";
      toast({
        title: "Error recharging wallet",
        description: message,
      });
    } finally {
      setLoading(false);
      setIsRecharging(false);
    }
  };

  // Get balance color based on amount
  const getBalanceColor = () => {
    if (balance !== null && balance >= 20) return "text-green-500";
    if (balance !== null && balance >= 10) return "text-yellow-500";    
    return "text-red-500";
  };

  const handleAddPaymentMethod = (data: ExtendedPaymentMethod) => {
    setSavedPaymentMethods((prev) => [...prev, data]);
    toast({
      title: "Payment method added",
      description: "Your new payment method has been saved successfully.",
    });
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    setSavedPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated successfully.",
    });
  };

  const getCurrentPlans = () => {
    // Only Sense PC plans are returned; SmartStorage uses dynamic slider instead
    return billingPlans;
  };
  
  const getCurrentSelectedPlan = () => {
    return selectedPlan; // Sense Storage plan selection is disabled
  };

  // const setCurrentSelectedPlan = (plan:any) => {
  //   if (selectedService === "smartpc") {
  //     setSelectedPlan(plan);
  //   } else {
  //     setSelectedStoragePlan(plan);
  //   }
  // };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing & Payments</h1>
        <StripeProvider>
          <PaymentMethodDialog
            onAddMethod={handleAddPaymentMethod}
            onSetDefault={handleSetDefaultPaymentMethod}
            savedMethods={savedPaymentMethods}
          />
        </StripeProvider>
      </div>

      {/* Quick Stats */}
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-yellow-600 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs text-xs text-yellow-700 dark:text-yellow-300"
                  >
                    This is your available wallet balance. It is used for all active services,
                    including Sense PC and Sense Storage charges. Keep it funded to avoid service
                    interruptions.
                  </TooltipContent>
                </Tooltip>
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
                {balanceLoading ? (
                  <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  `$${Number(balance).toFixed(2)}`
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastRechargeTimestamp
                  ? `Last recharged on ${new Date(lastRechargeTimestamp).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}`
                  : 'No recharge history yet'}
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-yellow-600 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs text-xs text-yellow-700 dark:text-yellow-300"
                  >
                    This shows your total charges for Sense PC and Sense Storage
                    services this month. Spending includes compute time, storage usage,
                    and any other billable activity.
                  </TooltipContent>
                </Tooltip>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight">
                {spendingLoading ? (
                  <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  `$${Number(currentMonthSpending).toFixed(2)}`
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {spendingLoading ? "" : `${monthSpendingPercentChange}% from last month`}
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
            <TooltipProvider>
              <div className="flex justify-between px-2 py-1 text-sm text-muted-foreground font-medium">
                {/* Promotion */}
                <div className="flex flex-col items-start gap-0.5 leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                      Promotion
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs text-xs text-yellow-700 dark:text-yellow-300"
                      >
                        Promotional balance is a limited-time credit added to your account
                        (e.g., from offers or referrals). It can only be used for service
                        usage and holds no real-world cash value.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-base text-sky-600 font-semibold">$0.00</span>
                </div>

                <div className="w-px bg-border mx-3" />

                {/* Cashback */}
                <div className="flex flex-col items-end gap-0.5 leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                      Cashback
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs text-xs text-yellow-700 dark:text-yellow-300"
                      >
                        Cashback balance is earned from qualifying activity and is only
                        valid toward service usage. It is not withdrawable or redeemable
                        as real money.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-base text-indigo-600 font-semibold">$0.00</span>
                </div>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Recharge Section */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              Quick Recharge
            </CardTitle>
            <CardDescription>
              Add funds to your account instantly
            </CardDescription>
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
                        setShowConfirm(true);
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
                      value={customAmount ?? ''}
                      onChange={(e) => setCustomAmount(parseFloat(e.target.value))}
                    />
                  </div>
                  <Button
                    className="flex-shrink-0"
                    disabled={isRecharging}
                    onClick={() => {
                      if (customAmount && customAmount >= 20) {
                        setSelectedAmount(customAmount);
                        setShowConfirm(true);
                      } else {
                        toast({
                          title: "Invalid amount",
                          description: "Please enter a valid amount (minimum $20).",
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

        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Recharge</DialogTitle>
              <DialogDescription>
                Are you sure you want to add <strong>${selectedAmount}</strong> to your wallet?
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
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedAmount) {
                    doRecharge(selectedAmount);
                    // future: save autoRechargeEnabled to backend
                  }
                  setShowConfirm(false);
                }}
              >
                Yes, Recharge
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Plans Section */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Only Pay For What You Use
            </CardTitle>
            <CardDescription>
              Choose your service and preferred billing cycle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="smartpc"
              value={selectedService}
              onValueChange={setSelectedService}
              className="w-full"
            >
              {/* Service Selection Tabs */}
              <TabsList className="grid grid-cols-2 h-auto p-1 mb-6">
                <TabsTrigger
                  value="smartpc"
                  className="flex items-center gap-2 py-3 px-4"
                >
                  <Cpu className="h-4 w-4" />
                  <span className="font-medium">Sense PC</span>
                </TabsTrigger>
                <TabsTrigger
                  value="smartstorage"
                  className="flex items-center gap-2 py-3 px-4"
                >
                  <HardDrive className="h-4 w-4" />
                  <span className="font-medium">Sense Storage</span>
                </TabsTrigger>
              </TabsList>

              {/* Sense PC Content – Display all plans together */}
              <TabsContent value="smartpc" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {billingPlans.map((plan) => (
                    <Card key={plan.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <plan.icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">What's included:</h4>
                          <ul className="space-y-3">
                            {plan.features.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2 text-sm"
                              >
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                </div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 📌 SSD Note */}
                <p className="text-xs mt-6 text-yellow-700 dark:text-yellow-300">
                  💡 <span className="font-medium">Note:</span> If your PC is on an <strong>Hourly Plan</strong>, 
                  SSD storage charges will continue even after stopping your Sense PC, 
                  since the disk remains allocated to preserve your data.
                </p>
              </TabsContent>

            {/* Smart Storage Content */}
            <TabsContent value="smartstorage" className="space-y-6">
            <div className="space-y-6 py-2">
              <div>
                <h3 className="text-sm font-medium">Storage Tier</h3>
                <div className="flex justify-between mt-1 mb-2">
                  <span className="text-muted-foreground text-xs">T-1 (20GB)</span>
                  <span className="text-muted-foreground text-xs">T-50 (1000GB)</span>
                </div>
                <Slider
                  value={[storageTier]}
                  onValueChange={(value) => setStorageTier(value[0])}
                  min={1}
                  max={50}
                  step={1}
                />
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm">
                    Selected: <strong>T-{storageTier}</strong> ({getStorageSizeFromTier(storageTier)})
                  </span>
                  <span className="text-large font-semibold">
                    {price === 0 ? "FREE" : `$${price.toFixed(2)}`} / month
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Data Center Location</h3>
                <Select value={selectedServer} onValueChange={setSelectedServer}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {serverLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4" />
                            <span>{loc.name}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>

      {/* Billing History Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Recharge and Billing History:</CardTitle>
          <CardDescription>
            View your recharge and usage history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recharge" className="space-y-4">
            {/* Wrap TabsList in a scrollable container */}
            <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
              <TabsList className="flex w-fit min-w-full gap-2">
                <TabsTrigger value="recharge">Wallet Recharge</TabsTrigger>
                <TabsTrigger value="usage">Sense PC Billing</TabsTrigger>
                <TabsTrigger value="storage-usage">Sense Storage Billing</TabsTrigger>
              </TabsList>
            </div>

            <RechargeHistoryTab />
            <SmartPCUsageHistoryTab />
            <SmartStorageUsageHistoryTab />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;
