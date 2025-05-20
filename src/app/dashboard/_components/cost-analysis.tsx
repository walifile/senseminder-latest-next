import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Clock,
  CalendarDays,
  CreditCard,
} from "lucide-react";

// Mock data for demo
const costData = [
  { name: "CPU", value: 45, color: "#8B5CF6" },
  { name: "Memory", value: 25, color: "#0EA5E9" },
  { name: "Storage", value: 15, color: "#F97316" },
  { name: "Network", value: 10, color: "#10B981" },
  { name: "Other", value: 5, color: "#6B7280" },
];

const dailyUsageData = [
  { name: "Mon", cost: 2.35 },
  { name: "Tue", cost: 2.42 },
  { name: "Wed", cost: 3.1 },
  { name: "Thu", cost: 2.85 },
  { name: "Fri", cost: 2.61 },
  { name: "Sat", cost: 1.25 },
  { name: "Sun", cost: 0.95 },
];

const monthlyUsageData = [
  { name: "Jan", cost: 62.5 },
  { name: "Feb", cost: 58.3 },
  { name: "Mar", cost: 65.2 },
  { name: "Apr", cost: 70.3 },
  { name: "May", cost: 75.4 },
  { name: "Jun", cost: 68.9 },
  { name: "Jul", cost: 72.1 },
  { name: "Aug", cost: 74.5 },
  { name: "Sep", cost: 69.8 },
  { name: "Oct", cost: 70.2 },
  { name: "Nov", cost: 72.8 },
  { name: "Dec", cost: 65.6 },
];

// Savings recommendations
const savingsRecommendations = [
  {
    id: 1,
    title: "Use Scheduled Shutdowns",
    description:
      "Automatically shut down your PC during non-working hours to save up to 40%.",
    savingsPercentage: 40,
    implemented: true,
  },
  {
    id: 2,
    title: "Downsize during low usage periods",
    description: "Switch to a smaller PC template during periods of low usage.",
    savingsPercentage: 25,
    implemented: false,
  },
  {
    id: 3,
    title: "Optimize storage usage",
    description: "Remove unused applications and data to reduce storage costs.",
    savingsPercentage: 15,
    implemented: false,
  },
  {
    id: 4,
    title: "Use reserved instances",
    description:
      "Commit to a longer-term usage plan for significant discounts.",
    savingsPercentage: 30,
    implemented: false,
  },
];

const CostAnalysis = () => {
  const [timeRange, setTimeRange] = useState("month");
  // const [billingPeriod, setBillingPeriod] = useState("current");

  // const formatCurrency = (value: number) => {
  //   return `$${value.toFixed(2)}`;
  // };

  // Calculate totals
  const currentMonthTotal = monthlyUsageData[new Date().getMonth()].cost;
  const previousMonthTotal =
    monthlyUsageData[(new Date().getMonth() + 11) % 12].cost;
  const percentChange = (
    ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) *
    100
  ).toFixed(1);

  // Calculate projected monthly total
  const currentDate = new Date();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const currentDay = currentDate.getDate();
  const dailyAverage =
    dailyUsageData.reduce((acc, day) => acc + day.cost, 0) / 7;
  const projectedMonthly = (dailyAverage * daysInMonth).toFixed(2);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Cost Analysis & Optimization</CardTitle>
        <CardDescription>
          Monitor usage costs and find ways to optimize spending
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Month</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {currentMonthTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex items-center px-2 py-1 rounded-full text-xs ${
                    parseFloat(percentChange) > 0
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {parseFloat(percentChange) > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(parseFloat(percentChange))}%
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex items-center">
                <CalendarDays className="h-3 w-3 mr-1" />
                vs Previous Month: ${previousMonthTotal.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Projected Monthly
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {projectedMonthly}
                    </span>
                  </div>
                </div>
                <div className="flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Forecast
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex items-center">
                <CalendarDays className="h-3 w-3 mr-1" />
                Based on {currentDay} days of usage this month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {dailyAverage.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-600">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Per Day
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Hourly rate: ${(dailyAverage / 24).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="history">Usage History</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="h-[300px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartContainer
                config={{
                  cpu: { theme: { light: "#8B5CF6", dark: "#8B5CF6" } },
                  memory: { theme: { light: "#0EA5E9", dark: "#0EA5E9" } },
                  storage: { theme: { light: "#F97316", dark: "#F97316" } },
                  network: { theme: { light: "#10B981", dark: "#10B981" } },
                  other: { theme: { light: "#6B7280", dark: "#6B7280" } },
                }}
              >
                <PieChart>
                  <Pie
                    data={costData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Cost Breakdown</h3>
                {costData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        ${((item.value / 100) * currentMonthTotal).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.value}%
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-4 mt-4 border-t border-border">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>${currentMonthTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="flex justify-end mb-4">
              <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="quarter">Last 90 days</SelectItem>
                  <SelectItem value="year">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-[300px]">
              <ChartContainer
                config={{
                  cost: { theme: { light: "#8B5CF6", dark: "#8B5CF6" } },
                }}
              >
                <BarChart
                  data={
                    timeRange === "week" ? dailyUsageData : monthlyUsageData
                  }
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(tick) => `$${tick}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cost" name="cost" fill="#8B5CF6" />
                </BarChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="optimization">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Cost Saving Recommendations
                </h3>
                <Badge variant="outline" className="text-green-600 bg-green-50">
                  Potential savings: 25%
                </Badge>
              </div>

              {savingsRecommendations.map((recommendation) => (
                <Card
                  key={recommendation.id}
                  className={`${
                    recommendation.implemented
                      ? "bg-green-50 border-green-200"
                      : "bg-card"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {recommendation.title}
                          {recommendation.implemented && (
                            <Badge
                              variant="outline"
                              className="text-green-600 bg-white"
                            >
                              Implemented
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {recommendation.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-muted-foreground">
                          Potential Savings
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {recommendation.savingsPercentage}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CostAnalysis;
