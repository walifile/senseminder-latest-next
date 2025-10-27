"use client";

import React from "react";

import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";

import PCCostCalculator from "./pc-cost-calculator";
import StorageCostCalculator from "./storage-cost-calculator";

export default function SensePCCost() {
  const [selectedTab, setSelectedTab] = React.useState<"sensepc" | "storage">(
    "sensepc"
  );

  return (
    <section
      className="container my-12 md:my-20"
      aria-label="SensePC Cost Estimator"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="bg-[#F4F1FF] dark:bg-[#000332] rounded-2xl px-4 py-14 space-y-6 md:px-12 md:py-20 md:space-y-12"
      >
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <div className="space-y-2.5">
            <h2 className="font-space-grotesk font-bold text-2xl md:text-5xl">
              Check Your Sense PC Cost
            </h2>
            <p className="text-paragraph text-base md:text-2xl">
              Configure your perfect Sense PC and get instant pricing
            </p>
          </div>
        </motion.div>

        {/* Tabs (visual only) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto w-fit space-x-2.5 rounded-full bg-[#E0D9FC] dark:bg-[#000624]"
        >
          <Button
            size="lg"
            variant={selectedTab === "sensepc" ? "default" : null}
            onClick={() => setSelectedTab("sensepc")}
            className="transition-all"
          >
            Sense PC
          </Button>
          <Button
            size="lg"
            variant={selectedTab === "storage" ? "default" : null}
            onClick={() => setSelectedTab("storage")}
            className="transition-all"
          >
            Storage
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6 md:space-y-12"
        >
          {selectedTab === "sensepc" && <PCCostCalculator />}
          {selectedTab === "storage" && <StorageCostCalculator />}
        </motion.div>
      </motion.div>
    </section>
  );
}
