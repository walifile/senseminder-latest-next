
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

type BreadcrumbItem = { label: string; href?: string };

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string; // keep optional for future, but you won’t use it now
};

const DEFAULT_BREADCRUMB_CLASS =
  "mt-0 mb-6 text-sm text-muted-foreground dark:text-muted-foreground " +
  "[&_a]:text-muted-foreground [&_a]:hover:text-foreground [&_a]:transition-colors " +
  "[&_span]:text-foreground";

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn(DEFAULT_BREADCRUMB_CLASS, className)} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
              {!isLast && <span className="text-muted-foreground">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
