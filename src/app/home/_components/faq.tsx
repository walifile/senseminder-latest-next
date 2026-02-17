import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  return (
    <section
      id="faq"
      data-testid="home-faq"
      className="container relative my-12 md:my-20"
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-24">
        <div className="relative lg:col-span-2 space-y-8 md:space-y-28">
          <div className="space-y-2.5">
            <h2 className="font-space-grotesk font-semibold text-2xl md:text-4xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-2xl text-[#454545] dark:text-[#B9C2D5]">
                {subtitle}
              </p>
            ) : null}
          </div>

          <Image
            src="/assets/svg/faq.svg"
            alt="FAQ Illustration"
            width={420}
            height={300}
            className="w-full h-auto"
          />
        </div>

        <div className="lg:col-span-3">
          <Accordion
            type="single"
            collapsible
            defaultValue="item-2"
            className="space-y-4 md:space-y-5"
          >
            {items.map((item, idx) => {
              const id = `item-${idx + 1}`;
              return (
                <AccordionItem
                  key={id}
                  value={id}
                  className={cn(
                    "border-0",
                    "[&[data-state=open]_.faq-card]:text-white",
                    "[&[data-state=open]_.faq-card]:shadow-[0px_10px_50px_0px_#00000017]",
                    "[&[data-state=open]_.faq-card]:bg-[linear-gradient(320deg,rgba(116,0,158,0.37)_5%,#060866_100%)]",
                    "[&[data-state=open]_.faq-index]:text-white"
                  )}
                >
                  <div
                    className={cn(
                      "faq-card rounded-lg transition-colors p-4 md:p-6",
                      "space-y-2 md:space-y-3",
                      "bg-white shadow-[0px_12px_24px_0px_#2530F014] border border-[#2530F033] dark:shadow-none dark:border-none dark:bg-[#000332]"
                    )}
                  >
                    <AccordionTrigger className="py-0 text-start hover:no-underline">
                      <div className="flex gap-3">
                        <span className="faq-index text-2xl font-bold text-paragraph">
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
