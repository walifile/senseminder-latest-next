/* eslint perfectionist/sort-imports: "off" */

"use client";

import * as React from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import type { Category } from "../types";
import { CATEGORIES } from "../data";

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
      items: cat.items.filter((item: { q: string; a: React.ReactNode | string }) => {
        const text = (
          item.q +
          " " +
          (typeof item.a === "string" ? item.a : "")
        ).toLowerCase();
        return text.includes(q);
      }),
    })).filter((c: Category) => c.items.length > 0);
  }, [query]);

  const results = filtered.reduce((n: number, c: Category) => n + c.items.length, 0);

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
    <Card className="overflow-visible border-muted/50">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">FAQ</CardTitle>
            <CardDescription>Find your expected answer here.</CardDescription>
          </div>
          <span className="text-xs text-muted-foreground">{lastUpdated}</span>
        </div>

        {/* Search + Global expand/collapse */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-lg">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by keyword…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
            <div className="mt-1 text-[11px] text-muted-foreground">
              {results} match{results === 1 ? "" : "es"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAllVisible}>
              Expand all
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAllVisible}>
              Collapse all
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-10">
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
                      variant="ghost"
                      size="sm"
                      onClick={() => expandSection(cat.title, ids)}
                      className="h-8"
                    >
                      Expand section
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => collapseSection(cat.title)}
                      className="h-8"
                    >
                      Collapse section
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
                {cat.items.map((qa: { q: string; a: React.ReactNode | string }, i: number) => (
                  <AccordionItem
                    key={`${cat.title}-${i}`}
                    value={`${cat.title}-${i}`}
                    className="border rounded-xl mb-3"
                  >
                    <AccordionTrigger className="px-4 py-3 text-left text-primary hover:bg-muted/30 rounded-xl [&[data-state=open]]:bg-muted/40">
                      <span className="font-medium">{qa.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {qa.a}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.section>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No results. Try different keywords.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
