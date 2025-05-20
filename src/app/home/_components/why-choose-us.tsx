import React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Scale,
  Globe,
  Wrench,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const comparisons = [
  {
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    feature: "Upfront Cost",
    traditional: "High",
    smartpc: "Low (Pay-as-you-go)",
    highlight: true,
  },
  {
    icon: <Scale className="h-8 w-8 text-primary" />,
    feature: "Scalability",
    traditional: "Limited",
    smartpc: "Instant Scaling",
    highlight: false,
  },
  {
    icon: <Globe className="h-8 w-8 text-primary" />,
    feature: "Portability",
    traditional: "Physical Access Only",
    smartpc: "Accessible Anywhere",
    highlight: true,
  },
  {
    icon: <Wrench className="h-8 w-8 text-primary" />,
    feature: "Maintenance",
    traditional: "Expensive Repairs",
    smartpc: "Automated Updates",
    highlight: false,
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    feature: "Security",
    traditional: "Local Security Only",
    smartpc: "Cloud Security + Encryption",
    highlight: true,
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center bg-primary/10 dark:bg-primary/20 rounded-full mb-4 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              Compare & Choose
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Why Choose SmartPC Over{" "}
            <span className="gradient-text">Traditional Computers</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Traditional computers come with their share of challenges: high
            upfront costs, limited scalability, and ongoing maintenance.
            SenseMinder SmartPC offers a refreshing alternative. With a
            pay-as-you-go model, instant scaling, and robust cloud security,
            it's designed for the modern user.
          </motion.p>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="glass-card overflow-hidden rounded-xl dark:bg-gray-900/30 dark:border-gray-800/30">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_1fr] gap-4 p-6 bg-primary/5 dark:bg-primary/10 border-b border-primary/10 dark:border-primary/20">
              <div className="w-12"></div>
              <div className="font-semibold text-center">Traditional PCs</div>
              <div className="font-semibold text-center text-primary">
                SenseMinder SmartPC
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-primary/10">
              {comparisons.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  className={`grid grid-cols-[auto_1fr_1fr] gap-4 p-6 items-center group ${
                    item.highlight ? "bg-primary/5 dark:bg-primary/10" : ""
                  }`}
                >
                  <div className="w-12 flex justify-center">{item.icon}</div>
                  <div className="space-y-1">
                    <div className="font-medium">{item.feature}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.traditional}
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="font-medium text-primary">
                      {item.smartpc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8">
            Experience the <span className="gradient-text">Freedom</span> of
            Cloud Computing Today!
          </h3>
          <Button
            asChild
            size="lg"
            className="relative group bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link href="/auth/sign-up" className="flex items-center gap-2">
              Get Started Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/0 via-primary-foreground/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
