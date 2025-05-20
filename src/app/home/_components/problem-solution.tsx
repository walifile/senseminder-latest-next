import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ProblemSolution = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Why Buy Expensive <span className="gradient-text">Hardware</span>
            <br />
            When You Can Rent Smarter?
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 border border-destructive/20 dark:border-destructive/30 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive/40 to-destructive/20 dark:from-destructive/50 dark:to-destructive/30"></div>
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="h-8 w-8 text-destructive" />
              <h3 className="text-2xl font-bold">Problem</h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Physical computers are expensive, inflexible, and hard to upgrade.
            </p>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 border border-primary/20 dark:border-primary/30 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary/20 dark:from-primary/50 dark:to-primary/30"></div>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold">Solution</h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              SmartPC offers flexible, cost-effective cloud computing that
              scales with your needs.
            </p>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8">
            Make the <span className="gradient-text">Smart Move</span> — Switch
            to SmartPC!
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

export default ProblemSolution;
