"use client";

import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqItems = [
  {
    question: "What is a Cloud PC?",
    answer:
      "A Sense PC is a virtual computer that runs in a secure data center and can be accessed from anywhere, on any device. It offers the power and functionality of a high-end desktop without requiring expensive hardware on your end.",
  },
  {
    question: "How is Sense PC different from other cloud computing services?",
    answer:
      "Sense PC offers industry-leading performance with ultra-low latency, enterprise-grade security, and a seamless user experience designed for professionals. Our proprietary technology delivers better responsiveness and visual quality than competitors.",
  },
  {
    question: "What kind of internet connection do I need?",
    answer:
      "For optimal performance, we recommend a broadband connection with at least 15 Mbps download and 5 Mbps upload speeds. Sense PC works with most home and office connections, and our adaptive streaming technology adjusts to your connection quality.",
  },
  {
    question: "Can I install my own software on Sense PC?",
    answer:
      "Yes! Your Sense PC works just like a regular Windows PC. You have full administrator rights to install, configure, and run any Windows-compatible software you need.",
  },
  {
    question: "What happens if I lose internet connection?",
    answer:
      "Your Sense PC session remains active for a short period if you disconnect, allowing you to resume exactly where you left off once your connection is restored. Your data is always safely stored in the cloud.",
  },
  {
    question: "Can I use Sense PC for gaming?",
    answer:
      "Yes! Our Professional and Enterprise plans include GPU capabilities suitable for gaming. While we optimize for professional workloads, many games run exceptionally well on our platform.",
  },
  {
    question: "How do I get started with Sense PC?",
    answer:
      "Simply choose a subscription plan, create your account, and you can be up and running with your new Sense PC in minutes. No complex setup or technical knowledge required.",
  },
];

export default function FAQ() {
  const [value, setValue] = React.useState<string | undefined>("item-2");

  return (
    <section id="faq" className="py-16 md:py-24 relative">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: Heading + Illustration */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-3 md:space-y-4"
            >
              <p className="text-sm font-medium text-primary">Frequently Asked Questions</p>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Everything you need to know about Sense PC
              </h2>
              <p className="text-paragraph max-w-[50ch]">
                Quick answers to common questions. Explore details on
                performance, setup, connectivity, and getting started.
              </p>
            </motion.div>

            {/* Illustration with gradient */}
            <div className="relative mt-8 md:mt-12">
              <Image
                src="/assets/svg/faq-gradient.svg"
                alt="FAQ background gradient"
                width={640}
                height={480}
                priority
                className="absolute -inset-x-6 -top-6 md:-inset-x-10 -z-10 select-none pointer-events-none"
              />
              <Image
                src="/assets/svg/faq.svg"
                alt="FAQ Illustration"
                width={520}
                height={400}
                className="w-full h-auto drop-shadow-xl"
                priority
              />
            </div>
          </div>

          {/* Right: Accordion */}
          <div className="w-full">
            <Accordion type="single" collapsible value={value} onValueChange={setValue} className="space-y-3">
              {faqItems.map((item, idx) => {
                const id = `item-${idx + 1}`;
                const open = value === id;
                return (
                  <AccordionItem key={id} value={id} className="border-0">
                    <div
                      className={cn(
                        "rounded-xl border transition-colors",
                        "bg-white/90 border-gray-200 dark:bg-gray-900/40 dark:border-white/10",
                        open && "ring-1 ring-primary/40 bg-primary/5 dark:bg-white/5"
                      )}
                    >
                      <AccordionTrigger
                        className={cn(
                          "px-4 md:px-5 py-4 text-left gap-3 no-underline",
                          open && "text-foreground"
                        )}
                      >
                        <span className="text-xs font-semibold text-primary tabular-nums w-8">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm md:text-base font-medium">
                          {item.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 md:px-5 text-sm text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
