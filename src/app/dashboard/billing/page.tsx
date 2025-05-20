"use client";

import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Search,
  Clock,
  CalendarDays,
  CalendarRange,
  Calendar as CalendarIcon,
  History,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  CheckCircle,
  Monitor,
  HardDrive,
} from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PaymentMethodDialog } from "@/components/ui/payment-method-dialog";
import { toast } from "@/components/ui/use-toast";

// interface Invoice {
//   id: string;
//   date: string;
//   amount: number;
//   status: "paid" | "pending" | "failed";
//   period: string;
// }

// interface RechargeHistory {
//   id: string;
//   date: string;
//   amount: number;
//   method: string;
//   status: "completed" | "pending" | "failed";
// }

// interface UsageHistory {
//   id: string;
//   startTime: string;
//   endTime: string;
//   duration: string;
//   cost: number;
//   type: "hourly" | "daily" | "weekly" | "monthly";
//   resourceType: "SmartPC" | "Storage";
//   status: "completed" | "active";
// }
interface PaymentMethodData {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

const quickRechargeAmounts = [
  {
    amount: 10,
    label: "Basic",
    description: "Quick top-up for short sessions",
  },
  { amount: 25, label: "Standard", description: "Perfect for regular users" },
  { amount: 50, label: "Plus", description: "Extra buffer for longer use" },
  {
    amount: 100,
    label: "Pro",
    description: "Most popular choice",
    isRecommended: true,
  },
  { amount: 200, label: "Business", description: "For professional workloads" },
  {
    amount: 500,
    label: "Enterprise",
    description: "Maximum credit with bonus",
  },
];

const billingPlans = [
  {
    id: "hourly",
    name: "Hourly",
    description: "Perfect for quick tasks and testing",
    price: "0.50",
    unit: "hour",
    icon: Clock,
    features: [
      "Pay only for actual usage",
      "No minimum commitment",
      "Instant start/stop",
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
      "Automated daily backups",
      "Priority email support",
    ],
  },
  {
    id: "weekly",
    name: "Weekly",
    description: "Great for ongoing projects",
    price: "49.99",
    unit: "week",
    icon: CalendarRange,
    features: [
      "7-day uninterrupted access",
      "25% savings vs daily",
      "Enhanced backup frequency",
      "Priority chat support",
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
      "Advanced monitoring tools",
      "24/7 priority support",
    ],
  },
  {
    id: "yearly",
    name: "Yearly",
    description: "Maximum savings for businesses",
    price: "1799.99",
    unit: "year",
    icon: CalendarIcon,
    features: [
      "365-day premium access",
      "45% savings vs monthly",
      "Dedicated resources",
      "Personal account manager",
    ],
  },
];

const BillingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("hourly");
  // const [searchMonth, setSearchMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [date, setDate] = useState<DateRange>();
  const [balance, setBalance] = useState(45.5);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    Array<{
      id: string;
      type: "card";
      last4: string;
      expMonth: number;
      expYear: number;
      brand: string;
      isDefault: boolean;
    }>
  >([
    {
      id: "1",
      type: "card",
      last4: "4242",
      expMonth: 12,
      expYear: 2024,
      brand: "Visa",
      isDefault: true,
    },
  ]);

  // Mock data for invoices
  // const invoices: Invoice[] = [
  //   {
  //     id: "INV-001",
  //     date: "2024-03-01",
  //     amount: 150.0,
  //     status: "paid",
  //     period: "March 2024",
  //   },
  //   {
  //     id: "INV-002",
  //     date: "2024-02-01",
  //     amount: 125.5,
  //     status: "paid",
  //     period: "February 2024",
  //   },
  // ];

  // Get balance color based on amount
  const getBalanceColor = () => {
    if (balance >= 50) return "text-green-500";
    if (balance > 10) return "text-yellow-500";
    return "text-red-500";
  };

  const handleAddPaymentMethod = (data: PaymentMethodData) => {
    // Here you would typically integrate with your payment processor
    const newMethod = {
      id: Math.random().toString(),
      type: "card" as const,
      last4: data.number.slice(-4),
      expMonth: parseInt(data.expiry.split("/")[0]),
      expYear: parseInt("20" + data.expiry.split("/")[1]),
      brand: "Visa", // You would get this from your payment processor
      isDefault: savedPaymentMethods.length === 0,
    };

    setSavedPaymentMethods((prev) => [...prev, newMethod]);
    toast({
      title: "Payment method added",
      description: "Your new payment method has been saved successfully.",
    });
  };

  const handleRemovePaymentMethod = (id: string) => {
    setSavedPaymentMethods((prev) => prev.filter((method) => method.id !== id));
    toast({
      title: "Payment method removed",
      description: "Your payment method has been removed successfully.",
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing & Payments</h1>
        <PaymentMethodDialog
          savedMethods={savedPaymentMethods}
          onAddMethod={handleAddPaymentMethod}
          onRemoveMethod={handleRemovePaymentMethod}
          onSetDefault={handleSetDefaultPaymentMethod}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Current Balance
              </span>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  getBalanceColor()
                )}
              >
                ${balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last recharged on March 15, 2024
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Monthly Spending
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">$324.50</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Usage History
              </span>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">156 hrs</div>
              <p className="text-xs text-muted-foreground">
                Total usage this month
              </p>
            </div>
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
                      onClick={() => setBalance((prev) => prev + amount)}
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

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </div>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    className="pl-7"
                  />
                </div>
                <Button className="flex-shrink-0">Add Funds</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Section */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Only Pay For What You Need
            </CardTitle>
            <CardDescription>
              Choose your preferred billing cycle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="hourly"
              value={selectedPlan}
              onValueChange={setSelectedPlan}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 h-auto p-1">
                {billingPlans.map((plan) => (
                  <TabsTrigger
                    key={plan.id}
                    value={plan.id}
                    className="flex flex-col items-center gap-1.5 py-2 px-1"
                  >
                    <plan.icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{plan.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {billingPlans.map((plan) => (
                <TabsContent
                  key={plan.id}
                  value={plan.id}
                  className="mt-6 space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        per {plan.unit}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <Separator />

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

                  <Button className="w-full">Select {plan.name} Plan</Button>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Billing History Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Account History</CardTitle>
          <CardDescription>
            View your recharge and usage history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recharge" className="space-y-4">
            <TabsList>
              <TabsTrigger value="recharge">Recharge History</TabsTrigger>
              <TabsTrigger value="usage">Usage History</TabsTrigger>
            </TabsList>

            <TabsContent value="recharge" className="space-y-4">
              {/* Search and Filter for Recharge */}
              <div className="flex flex-col sm:flex-row gap-4">
                <DatePickerWithRange date={date} setDate={setDate} />
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Recharge History List */}
              <div className="rounded-lg border divide-y">
                {[
                  {
                    id: "TXN-001",
                    date: "2024-03-15 14:30",
                    amount: 100.0,
                    method: "Visa •••• 4242",
                    status: "completed",
                  },
                  {
                    id: "TXN-002",
                    date: "2024-03-01 09:15",
                    amount: 50.0,
                    method: "PayPal",
                    status: "completed",
                  },
                  {
                    id: "TXN-003",
                    date: "2024-02-15 16:45",
                    amount: 25.0,
                    method: "Mastercard •••• 5555",
                    status: "completed",
                  },
                ].map((recharge) => (
                  <div
                    key={recharge.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{recharge.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {recharge.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {recharge.method}
                      </span>
                      <Badge variant="outline" className="font-medium">
                        +${recharge.amount.toFixed(2)}
                      </Badge>
                      <Badge variant="default">{recharge.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              {/* Search and Filter for Usage */}
              <div className="flex flex-col sm:flex-row gap-4">
                <DatePickerWithRange date={date} setDate={setDate} />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value="smartpc">SmartPC</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Billing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Usage History List */}
              <div className="rounded-lg border divide-y">
                {[
                  {
                    id: "USE-001",
                    startTime: "2024-03-15 10:00",
                    endTime: "2024-03-15 14:30",
                    duration: "4h 30m",
                    cost: 2.25,
                    type: "hourly",
                    resourceType: "SmartPC",
                    status: "completed",
                  },
                  {
                    id: "USE-002",
                    startTime: "2024-03-14 00:00",
                    endTime: "2024-03-14 23:59",
                    duration: "24h",
                    cost: 9.99,
                    type: "daily",
                    resourceType: "SmartPC",
                    status: "completed",
                  },
                  {
                    id: "USE-003",
                    startTime: "2024-03-01 00:00",
                    endTime: "2024-03-31 23:59",
                    duration: "1 month",
                    cost: 5.99,
                    type: "monthly",
                    resourceType: "Storage",
                    status: "active",
                  },
                ].map((usage) => (
                  <div
                    key={usage.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        {usage.resourceType === "SmartPC" ? (
                          <Monitor className="h-4 w-4 text-primary" />
                        ) : (
                          <HardDrive className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{usage.resourceType}</p>
                          <Badge variant="outline" className="text-xs">
                            {usage.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {usage.startTime} -{" "}
                          {usage.status === "active"
                            ? "Present"
                            : usage.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {usage.duration}
                      </span>
                      <Badge variant="secondary" className="font-medium">
                        ${usage.cost.toFixed(2)}
                      </Badge>
                      <Badge
                        variant={
                          usage.status === "active" ? "default" : "outline"
                        }
                        className={
                          usage.status === "active"
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : ""
                        }
                      >
                        {usage.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= 3}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;
