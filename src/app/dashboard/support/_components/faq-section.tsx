/* eslint perfectionist/sort-imports: "off" */

"use client";

import * as React from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { Category } from "../types";
import { CATEGORIES } from "../data";
import GradientSearchInput from "@/components/shared/inputs/gradient-search-input";
import { supportTabIconProps } from "../utils/tab-config";

export default function FAQSection() {
  const lastUpdated = "Updated Oct 1, 2025";
  const [query, setQuery] = React.useState("");

  // Track which items are expanded per section
  const [openMap, setOpenMap] = React.useState<Record<string, string[]>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((cat: Category) => ({
      ...cat,
      items: cat.items.filter(
        (item: { q: string; a: React.ReactNode | string }) => {
          const text = (
            item.q +
            " " +
            (typeof item.a === "string" ? item.a : "")
          ).toLowerCase();
          return text.includes(q);
        }
      ),
    })).filter((c: Category) => c.items.length > 0);
  }, [query]);

  // const results = filtered.reduce((n: number, c: Category) => n + c.items.length, 0);

  // Helpers for expanding/collapsing
  const getItemIds = (cat: Category) =>
    cat.items.map((_, i) => `${cat.title}-${i}`);
  const expandSection = (title: string, ids: string[]) =>
    setOpenMap((m) => ({ ...m, [title]: ids }));
  const collapseSection = (title: string) =>
    setOpenMap((m) => ({ ...m, [title]: [] }));

  const expandAllVisible = () => {
    const updated: Record<string, string[]> = {};
    filtered.forEach((c: Category) => (updated[c.title] = getItemIds(c)));
    setOpenMap(updated);
  };
  const collapseAllVisible = () => setOpenMap({});

  return (
    <>
      <div className="p-[30px] pt-0 space-y-5 border-b border-black/10 dark:border-border">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8">
              FAQ
            </div>
            <div className="justify-start text-[#454545] dark:text-paragraph text-base font-normal font-['Inter'] leading-6">
              Find your expected answer here.
            </div>
          </div>
          <span className="text-right justify-start text-[#454545] dark:text-paragraph text-base font-normal font-['Inter'] leading-6">
            {lastUpdated}
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <GradientSearchInput
            wrapperClassName="w-full max-w-md"
            id="support-ticket-search"
            name="support-ticket-search"
            placeholder="Search Requests"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* Status Filter */}
          <div className="flex self-end gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={expandAllVisible}
              className="text-[#020816] dark:text-white"
            >
              <div
                {...supportTabIconProps(
                  "/assets/svg/support/expand.svg",
                  "w-6 h-6"
                )}
              />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={collapseAllVisible}
              className="text-[#020816] dark:text-white"
            >
              <div
                {...supportTabIconProps(
                  "/assets/svg/support/collapse.svg",
                  "w-6 h-6"
                )}
              />
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      <div className="p-[30px] space-y-6 overflow-auto">
        {filtered.map((cat: Category, idx: number) => {
          const ids = getItemIds(cat);
          const openValues = openMap[cat.title] ?? [];
          const allOpen = openValues.length === ids.length && ids.length > 0;

          return (
            <motion.section
              key={cat.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{cat.title}</h2>
                <div className="flex gap-2">
                  {!allOpen ? (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => expandSection(cat.title, ids)}
                      className="h-8 text-black dark:text-white underline"
                    >
                      Expand Section
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => collapseSection(cat.title)}
                      className="h-8 text-black dark:text-white underline"
                    >
                      Collapse Section
                    </Button>
                  )}
                </div>
              </div>

              <Accordion
                type="multiple"
                className="w-full"
                value={openValues}
                onValueChange={(vals: string[]) =>
                  setOpenMap((m) => ({ ...m, [cat.title]: vals }))
                }
              >
                {cat.items.map(
                  (
                    qa: { q: string; a: React.ReactNode | string },
                    i: number
                  ) => (
                    <AccordionItem
                      key={`${cat.title}-${i}`}
                      value={`${cat.title}-${i}`}
                      className="border rounded-xl mb-3"
                    >
                      <AccordionTrigger className="p-5 text-left bg-blue-700/5 dark:bg-white/5 hover:bg-blue-700/10 dark:hover:bg-muted/30 text-[#454545] dark:text-paragraph [&[data-state=open]]:text-black dark:[&[data-state=open]]:text-white rounded-[10px] [&[data-state=open]]:rounded-b-none [&[data-state=open]]:bg-blue-700/5 dark:[&[data-state=open]]:bg-white/5 outline outline-1 outline-blue-700/10 dark:outline-white/10">
                        <span className="justify-start text-base font-medium font-['Inter'] leading-6">
                          {qa.q}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-5 bg-blue-700/5 dark:bg-white/5 rounded-b-[10px]">
                        <div className="justify-start text-paragraph text-base font-normal font-['Inter'] leading-6">
                          {qa.a}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </Accordion>
            </motion.section>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No results. Try different keywords.
          </div>
        )}
      </div>
    </>
  );
}
