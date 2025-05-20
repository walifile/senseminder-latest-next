import React from "react";
import { motion } from "framer-motion";
import { Monitor, Cpu, DollarSign, Shield, Users, Gauge } from "lucide-react";

const features = [
  {
    icon: <Monitor className="h-10 w-10 text-primary" />,
    title: "Access Anywhere",
    description:
      "Work from your smart monitor, tablet, or phone—no physical PC required.",
  },
  {
    icon: <Cpu className="h-10 w-10 text-primary" />,
    title: "Customizable Configurations",
    description:
      "Build your ideal setup with CPU, GPU, RAM, and Storage options.",
  },
  {
    icon: <DollarSign className="h-10 w-10 text-primary" />,
    title: "Cost-Effective and Scalable",
    description:
      "Pay only for the resources you need—scale up or down anytime.",
  },
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: "Security Built-in",
    description:
      "End-to-end encryption, MFA, and EBS snapshots for backups ensure peace of mind.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Perfect for Everyone",
    description:
      "Gamers, developers, designers, and businesses—customize as you go.",
  },
  {
    icon: <Gauge className="h-10 w-10 text-primary" />,
    title: "High Performance",
    description:
      "Enterprise-grade hardware with 99.9% uptime and ultra-low latency connections.",
  },
];

const WhySettle = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center bg-primary/10 dark:bg-primary/20 rounded-full mb-4 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              Why Choose Us
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Why Settle for <span className="gradient-text">Hardware</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Experience Limitless Computing with SenseMinder SmartPC
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 relative overflow-hidden group hover-scale dark:bg-gray-900/30 dark:border-gray-800/30"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon with glow effect */}
              <div className="mb-4 relative">
                {feature.icon}
                <div className="absolute inset-0 blur-2xl bg-primary/10 -z-10 group-hover:bg-primary/20 transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Gradient border on hover */}
              <div className="absolute inset-0 rounded-lg border border-border/5 group-hover:border-primary/20 dark:border-gray-800/10 dark:group-hover:border-primary/30 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySettle;
