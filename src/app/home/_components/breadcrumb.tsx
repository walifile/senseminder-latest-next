


import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

type BreadcrumbItem = { label: string; href?: string };

type BreadcrumbVariant = "default" | "figma";

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
  variant?: BreadcrumbVariant;
  separator?: React.ReactNode;
};

const DEFAULT_BREADCRUMB_CLASS =
  "mt-0 mb-6 text-sm text-muted-foreground dark:text-muted-foreground " +
  "[&_a]:text-muted-foreground [&_a]:hover:text-foreground [&_a]:transition-colors " +
  "[&_span]:text-foreground";

const FIGMA_BREADCRUMB_CLASS =
  "mt-0 mb-0 font-inter text-[16px] font-normal leading-[24px] tracking-[-0.3px] " +
  "text-[#020816] dark:text-[#B9C2D5]";

export function Breadcrumb({
  items,
  className,
  variant = "default",
  separator,
}: BreadcrumbProps) {
  const isFigma = variant === "figma";

  const rootClass = cn(
    isFigma ? FIGMA_BREADCRUMB_CLASS : DEFAULT_BREADCRUMB_CLASS,
    className,
  );

  const sep = separator ?? (isFigma ? " - " : "/");

  return (
    <nav className={rootClass} aria-label="Breadcrumb">
      <ol className={cn("flex flex-wrap items-center", isFigma ? "gap-0" : "gap-2")}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li
              key={`${item.label}-${idx}`}
              className={cn("flex items-center", isFigma ? "gap-0" : "gap-2")}
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    isFigma
                      ? "text-[#2530F0] hover:opacity-90 transition-opacity"
                      : undefined,
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}

              {!isLast &&
                (isFigma ? (
                <span className="mx-1">-</span>
                ) : (
                  <span className="text-muted-foreground">{sep}</span>
                ))}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
