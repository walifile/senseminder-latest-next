"use client";

import type {
  AnnouncementItem,
} from "@/components/shared/announcement/announcement-bar.types";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { selectIsAuthenticated } from "@/redux/slices/auth/auth-slice";
import {
  useGetAnnouncementsQuery,
  isAnnouncementsApiConfigured,
} from "@/api/announcementsAPI";

import { Button } from "@/components/ui/button";

import { useSelector } from "react-redux";

import { ArrowRight } from "lucide-react";

import { styleBySeverity } from "@/components/shared/announcement/announcement-bar.styles";
import {
  getAnnouncementPlacement,
  getAnnouncementDismissKey,
  shouldHideAnnouncementBar,
} from "@/components/shared/announcement/announcement-bar.helpers";

export default function AnnouncementBar() {
  const pathname = usePathname() || "/";
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const isPcViewerPage = shouldHideAnnouncementBar(pathname);
  const placement = getAnnouncementPlacement(pathname);

  const { data } = useGetAnnouncementsQuery(
    {
      path: pathname,
      placement,
      auth: isAuthenticated,
    },
    {
      skip: isPcViewerPage || !isAnnouncementsApiConfigured,
    },
  );

  const items = useMemo<AnnouncementItem[]>(() => {
    const rows = data?.items;
    return Array.isArray(rows) ? rows : [];
  }, [data?.items]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextState: Record<string, boolean> = {};
    items.forEach((item) => {
      if (window.localStorage.getItem(getAnnouncementDismissKey(item))) {
        nextState[item.announcement_id] = true;
      }
    });

    setDismissed(nextState);
  }, [items]);

  const visible = useMemo(
    () =>
      items.find((item) => !(item.dismissible !== false && dismissed[item.announcement_id])),
    [items, dismissed],
  );

  if (!visible || isPcViewerPage) return null;

  const severityConfig =
    styleBySeverity[visible.severity || "normal"] || styleBySeverity.normal;
  const SeverityIcon = severityConfig.icon;
  const categoryLabel = visible.category?.trim() || "";

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(getAnnouncementDismissKey(visible), "1");
    }
    setDismissed((prev) => ({ ...prev, [visible.announcement_id]: true }));
  };

  return (
    <section className="relative z-40 w-full" role="status">
      <div
        className={`relative overflow-hidden backdrop-blur-[17px] ${severityConfig.bannerClass}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-[length:200%_200%] motion-safe:animate-gradient-flow ${severityConfig.overlayClass}`}
        />
        <div className="container relative py-0.5 md:py-1">
          <div className="flex items-start justify-between gap-2 md:items-center">
            <div className="min-w-0 flex items-start gap-1.5 md:items-center">
              <span
                className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full motion-safe:animate-pulse md:mt-0 ${severityConfig.dotClass}`}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="min-w-0 flex items-start gap-1.5 md:items-center">
                  {categoryLabel ? (
                    <span className="hidden sm:inline-flex rounded-full border border-current/15 bg-white/50 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-[0.14em] text-foreground/70 dark:bg-white/5 dark:text-white/70">
                      {categoryLabel}
                    </span>
                  ) : null}
  
                  <SeverityIcon className={`mt-0.5 h-3 w-3 shrink-0 md:mt-0 ${severityConfig.iconClass}`} />
  
                  <p className="min-w-0 whitespace-normal break-words text-[11px] leading-3 text-foreground sm:truncate sm:whitespace-nowrap sm:text-[12px]">
                    <span className="font-semibold">{visible.title}</span>
                    {visible.message ? (
                      <span className="text-muted-foreground">
                        {" - "}
                        {visible.message}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
  
            <div className="hidden shrink-0 items-center gap-1 md:flex">
              {visible.cta_label && visible.cta_url ? (
                <Button
                  asChild
                  size="sm"
                  className={`h-6 rounded-full bg-[length:200%_200%] px-2 text-[10px] font-medium transition-opacity hover:opacity-95 motion-safe:animate-gradient-flow ${severityConfig.ctaClass}`}
                >
                  <Link href={visible.cta_url} className="inline-flex items-center gap-1">
                    <span>{visible.cta_label}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              ) : null}
  
              {visible.dismissible !== false ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={dismiss}
                  aria-label="Dismiss announcement"
                  className={`h-6 rounded-full border px-2 text-[10px] ${severityConfig.dismissClass}`}
                >
                  Dismiss
                </Button>
              ) : null}
            </div>
          </div>
  
          {(visible.cta_label && visible.cta_url) || visible.dismissible !== false ? (
            <div className="mt-1 flex items-center gap-1 md:hidden">
              {visible.cta_label && visible.cta_url ? (
                <Button
                  asChild
                  size="sm"
                  className={`h-6 rounded-full bg-[length:200%_200%] px-2 text-[10px] font-medium motion-safe:animate-gradient-flow ${severityConfig.ctaClass}`}
                >
                  <Link href={visible.cta_url} className="inline-flex items-center gap-1">
                    <span>{visible.cta_label}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              ) : null}
  
              {visible.dismissible !== false ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={dismiss}
                  aria-label="Dismiss announcement"
                  className={`h-6 rounded-full border px-2 text-[10px] ${severityConfig.dismissClass}`}
                >
                  Dismiss
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
