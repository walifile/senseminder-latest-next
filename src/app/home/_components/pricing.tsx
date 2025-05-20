import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const PricingCard = ({
  name,
  price,
  features,
  isPrimary = false,
}: {
  name: string;
  price: string;
  features: string[];
  isPrimary?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="relative group"
  >
    {/* 3D elevation shadows - reduced blur for better performance */}
    <div
      className={`absolute -inset-0.5 rounded-2xl blur-[2px] opacity-20 group-hover:opacity-70 transition duration-500 
      ${
        isPrimary
          ? "bg-gradient-to-br from-primary to-primary/30"
          : "bg-gradient-to-br from-foreground/20 to-foreground/10"
      }`}
    />

    {/* Card */}
    <div
      className={`relative h-full flex flex-col rounded-xl p-6 
      ${
        isPrimary
          ? "bg-card border border-primary/20 dark:border-primary/40"
          : "bg-card border border-border/50 dark:border-gray-700/50"
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <div
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium mb-3
          ${
            isPrimary
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }
        `}
        >
          {name}
        </div>

        <div className="flex items-end gap-2">
          <div
            className={`text-4xl font-bold ${isPrimary ? "text-primary" : ""}`}
          >
            {price}
          </div>
          <div className="text-sm text-muted-foreground pb-1">/month</div>
        </div>
      </div>

      {/* Features */}
      <div className="flex-grow mb-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-x-3">
              <div
                className={`flex-none mt-0.5 h-4 w-4 flex items-center justify-center rounded-full ${
                  isPrimary
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-foreground/70"
                }`}
              >
                <Check className="h-2.5 w-2.5" />
              </div>
              <span className="text-sm text-foreground/80">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <Link href="/auth/sign-up" className="w-full">
        <Button
          variant={isPrimary ? "default" : "outline"}
          className={`w-full ${
            isPrimary ? "bg-primary hover:bg-primary/90" : "hover:bg-muted/50"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            {isPrimary ? "Get started" : "Choose plan"}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Button>
      </Link>

      {/* Popular tag */}
      {isPrimary && (
        <div className="absolute -top-2.5 -right-2.5">
          <div className="bg-primary text-primary-foreground text-xs font-medium py-1 px-2.5 rounded-full shadow-sm">
            Popular
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

const Pricing = () => {
  const [pricingType, setPricingType] = useState<
    "subscription" | "pay-as-you-go"
  >("pay-as-you-go");

  const subscriptionPlans = [
    {
      name: "Basic",
      price: "$29",
      features: ["2 CPU Cores", "8 GB RAM", "100 GB Storage"],
    },
    {
      name: "Pro",
      price: "$59",
      features: ["4 CPU Cores", "16 GB RAM", "250 GB Storage"],
      isPrimary: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      features: ["8 CPU Cores", "32 GB RAM", "500 GB Storage"],
    },
  ];

  const payAsYouGoPlans = [
    {
      name: "Free",
      price: "$0",
      features: ["20 GB Storage Space", "Basic Support", "1 User Account"],
    },
    {
      name: "Unlimited",
      price: "$100",
      features: [
        "On-Demand (Pay-as-you-Go)",
        "Unlimited Storage",
        "Priority Support",
      ],
      isPrimary: true,
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center bg-primary/10 dark:bg-primary/20 rounded-full mb-4 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              Pricing Plans
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your needs. No hidden fees, no
            surprises.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-muted/80 dark:bg-gray-800/80 p-1 rounded-full border border-border/20 dark:border-gray-700/50 shadow-sm">
            <div className="relative flex items-center">
              <button
                onClick={() => setPricingType("pay-as-you-go")}
                className={`relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
                  pricingType === "pay-as-you-go"
                    ? "text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                Pay as you go
              </button>
              <button
                onClick={() => setPricingType("subscription")}
                className={`relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
                  pricingType === "subscription"
                    ? "text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                Subscription Based
              </button>

              {/* Animated background */}
              <div
                className={`absolute top-0 h-full rounded-full bg-primary shadow-md shadow-primary/20 dark:shadow-primary/40 transition-all duration-500 ease-in-out ${
                  pricingType === "subscription"
                    ? "right-1 left-[calc(50%-4px)]"
                    : "left-1 right-[calc(50%-4px)]"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div
          className={`grid gap-6 mx-auto ${
            pricingType === "subscription"
              ? "grid-cols-1 md:grid-cols-3 max-w-6xl"
              : "grid-cols-1 md:grid-cols-2 max-w-4xl"
          }`}
        >
          {pricingType === "subscription"
            ? subscriptionPlans.map((plan) => (
                <PricingCard key={plan.name} {...plan} />
              ))
            : payAsYouGoPlans.map((plan) => (
                <PricingCard key={plan.name} {...plan} />
              ))}
        </div>

        {/* Footer */}
        <div className="mt-14 text-center max-w-2xl mx-auto">
          <p className="text-muted-foreground">
            {pricingType === "subscription"
              ? "All plans include 24/7 support, automatic backups, and security updates."
              : "With our pay-as-you-go option, you only pay for what you use. No hidden fees, no long-term commitments."}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
