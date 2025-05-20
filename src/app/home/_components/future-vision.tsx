import React from "react";
import { motion } from "framer-motion";
import { Recycle, Leaf, Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const benefits = [
  {
    icon: <Recycle className="h-12 w-12 text-primary" />,
    title: "Less e-waste",
    description:
      "Reduce electronic waste by eliminating the need for constant hardware upgrades.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: <Leaf className="h-12 w-12 text-primary" />,
    title: "Lower energy consumption",
    description:
      "Optimize resource usage through shared infrastructure and efficient scaling.",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: <Scale className="h-12 w-12 text-primary" />,
    title: "Sustainable scalability",
    description:
      "Grow your computing needs without increasing your environmental footprint.",
    gradient: "from-teal-500/20 to-green-500/20",
  },
];

const FutureVision = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            The Future of Computing
            <br />
            <span className="gradient-text">No Hardware Required</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Inspire users with a vision of hardware-free computing powered by
            the cloud. Highlighting the eco-friendly benefits:
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="glass-card p-8 relative group dark:bg-gray-900/30 dark:border-gray-800/30"
            >
              {/* Animated Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-10 group-hover:opacity-20 dark:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-500 rounded-lg`}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-6 p-3 rounded-full bg-primary/10 w-fit">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </motion.div>
          ))}
        </div>

        {/* Vision Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            SenseMinder SmartPC—
            <span className="gradient-text">Revolutionizing</span> the Way We
            Compute
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            This summarizes our commitment to innovation.
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group border-primary/20 hover:border-primary/40 dark:border-primary/30 dark:hover:border-primary/50"
          >
            <Link href="/about" className="flex items-center gap-2">
              Learn More About Our Vision
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FutureVision;
