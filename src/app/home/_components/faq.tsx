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

import { type FAQItem, defaultFaqItems } from "../data/faq-data";


type FAQProps = {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
};


export default function FAQ({
  items = defaultFaqItems,
  title = "Frequently Asked Questions",
  subtitle,
}: FAQProps) {
  const [value, setValue] = React.useState<string | undefined>("item-2");

  return (
    <section
      id="faq"
      data-testid="home-faq"
      className="container relative my-12 md:my-20"
    >
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
              {title}
            </h2>
            {subtitle ? (
              <p className="text-2xl text-[#454545] dark:text-[#B9C2D5]">
                {subtitle}
              </p>
            ) : null}
          </motion.div>

          <Image
            src="/assets/svg/faq.svg"
            alt="FAQ Illustration"
            width={420}
            height={300}
            className="w-full h-auto"
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
            {items.map((item, idx) => {
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
