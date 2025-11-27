"use client";

import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
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
    <section id="faq" className="container relative my-12 md:my-20">
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-24">
        {/* Left: Heading + Illustration */}
        <div className="relative lg:col-span-2 space-y-8 md:space-y-28">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-2.5"
          >
            <h2 className="font-space-grotesk font-semibold text-2xl md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-paragraph text-2xl">
              Everything you need to know about Sense PC
            </p>
          </motion.div>

          <Image
            src="/assets/svg/faq.svg"
            alt="FAQ Illustration"
            width={420}
            height={300}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Right: Accordion */}
        <div className="lg:col-span-3">
          <Accordion
            type="single"
            collapsible
            value={value}
            onValueChange={setValue}
            className="space-y-4 md:space-y-5"
          >
            {faqItems.map((item, idx) => {
              const id = `item-${idx + 1}`;
              const open = value === id;
              return (
                <AccordionItem key={id} value={id} className="border-0">
                  <div
                    className={cn(
                      "rounded-lg transition-colors p-4 md:p-6",
                      "space-y-2 md:space-y-3",
                      "bg-white shadow-[0px_12px_24px_0px_#2530F014] border border-[#2530F033] dark:shadow-none dark:border-none dark:bg-[#000332]",
                      open &&
                        "text-white shadow-[0px_10px_50px_0px_#00000017] bg-[linear-gradient(320deg,rgba(116,0,158,0.37)_5%,#060866_100%)]"
                    )}
                  >
                    <AccordionTrigger className="py-0 text-start hover:no-underline">
                      <div className="flex gap-3">
                        <span className="text-2xl font-bold text-paragraph">
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        <span className="mt-1 font-space-grotesk font-bold text-lg md:text-xl">
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="text-base md:text-lg">
                      {item.answer}
                    </AccordionContent>
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
