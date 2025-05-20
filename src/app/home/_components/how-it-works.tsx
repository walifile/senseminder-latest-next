import React from "react";
import { motion } from "framer-motion";
import { Settings, Play, Laptop, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    icon: <Settings className="h-12 w-12 text-primary" />,
    title: "Choose Your Configuration",
    description: "Select your ideal resources (CPU, RAM, Storage).",
    wireframe: (
      <div className="w-full aspect-video bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30 p-4 relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
        <div className="space-y-3">
          <div className="h-3 w-24 bg-primary/20 rounded" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-primary/10 rounded flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-primary/20" />
            </div>
            <div className="h-20 bg-primary/10 rounded flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-primary/20" />
            </div>
            <div className="h-20 bg-primary/10 rounded flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-primary/20" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <Play className="h-12 w-12 text-primary" />,
    title: "Launch Your SmartPC",
    description:
      "Access your virtual computer instantly via browser or smart monitor.",
    wireframe: (
      <div className="w-full aspect-video bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30 p-4 relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
        <div className="h-full flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <Laptop className="h-12 w-12 text-primary" />,
    title: "Work, Play, and Create",
    description:
      "Enjoy seamless performance and flexibility anytime, anywhere.",
    wireframe: (
      <div className="w-full aspect-video bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30 p-4 relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
        <div className="space-y-3">
          <div className="h-3 w-full bg-primary/10 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="h-3 w-3/4 bg-primary/20 rounded" />
              <div className="h-3 w-1/2 bg-primary/20 rounded" />
            </div>
            <div className="h-24 bg-primary/10 rounded" />
          </div>
        </div>
      </div>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center bg-primary/10 dark:bg-primary/20 rounded-full mb-4 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              Simple Process
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Get Started in <span className="gradient-text">3 Easy Steps</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="glass-card p-6 relative group dark:bg-gray-900/30 dark:border-gray-800/30"
            >
              <div className="absolute -inset-px rounded-lg bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Step Number */}
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/20 dark:border-primary/40">
                <span className="text-sm font-bold text-primary">
                  {index + 1}
                </span>
              </div>

              {/* Icon */}
              <div className="mb-6">{step.icon}</div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground mb-6">{step.description}</p>

              {/* Wireframe Illustration */}
              {step.wireframe}
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Button
            asChild
            size="lg"
            className="relative group bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link href="/signup" className="flex items-center gap-2">
              Build Your SmartPC Now!
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/0 via-primary-foreground/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
