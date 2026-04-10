"use client";

import { useRef, useState, useEffect, type MouseEvent } from "react";

import type { LegalSection } from "../data/sections";

type LegalSidebarProps = {
  title: string;
  sections: LegalSection[];
  lastUpdated: string;
  trackingMode?: "scroll" | "intersection";
  scrollOffset?: number;
};

const baseLinkClasses =
  "relative w-full pr-9 whitespace-normal break-words text-black dark:text-white p-4 rounded-lg border md:hover:text-white md:hover:bg-gradient-to-r md:hover:from-[#3A29E7] md:hover:to-[#A601BA]";
const activeLinkClasses =
  "!border-0 text-white bg-gradient-to-r from-[#3A29E7] to-[#A601BA] " +
  "md:before:content-[''] md:before:absolute md:before:right-[-23px] md:before:bottom-0 " +
  "md:before:w-[10px] md:before:h-full md:before:bg-[#A601BA] md:before:rounded-l-[12px]";

const LegalSidebar = ({
  title,
  sections,
  lastUpdated,
  trackingMode = "intersection",
  scrollOffset = 140,
}: LegalSidebarProps) => {
  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.id ?? "",
  );
  const pendingSectionRef = useRef<string | null>(null);
  const pendingClearTimerRef = useRef<number | null>(null);

  const clearPendingSection = () => {
    if (pendingClearTimerRef.current) {
      window.clearTimeout(pendingClearTimerRef.current);
      pendingClearTimerRef.current = null;
    }
    pendingSectionRef.current = null;
  };

  const scrollToSection = (id: string) => {
    const sectionElement = document.getElementById(id);
    if (!sectionElement) {
      clearPendingSection();
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    sectionElement.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", `#${id}`);

    if (pendingClearTimerRef.current) {
      window.clearTimeout(pendingClearTimerRef.current);
    }
    pendingClearTimerRef.current = window.setTimeout(() => {
      pendingSectionRef.current = null;
      pendingClearTimerRef.current = null;
    }, 1500);
  };

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setActiveSection(id);
    pendingSectionRef.current = id;
    scrollToSection(id);
  };

  useEffect(() => {
    const sectionIds = sections.map((section) => section.id);

    const setSectionFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (sectionIds.includes(hash)) {
        setActiveSection(hash);
      }
    };

    setSectionFromHash();

    if (trackingMode === "scroll") {
      const sectionElements = sectionIds
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => Boolean(element));
      let rafId = 0;

      const updateActiveSectionFromScroll = () => {
        let nextActiveId = sectionIds[0] ?? "";

        for (const sectionElement of sectionElements) {
          const sectionTop = sectionElement.getBoundingClientRect().top;
          if (sectionTop - scrollOffset <= 0) {
            nextActiveId = sectionElement.id;
          } else {
            break;
          }
        }

        if (!nextActiveId) {
          return;
        }

        if (
          pendingSectionRef.current &&
          nextActiveId !== pendingSectionRef.current
        ) {
          return;
        }

        setActiveSection(nextActiveId);
        if (pendingSectionRef.current === nextActiveId) {
          clearPendingSection();
        }
      };

      const onScroll = () => {
        if (rafId) {
          return;
        }
        rafId = window.requestAnimationFrame(() => {
          updateActiveSectionFromScroll();
          rafId = 0;
        });
      };

      updateActiveSectionFromScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      window.addEventListener("hashchange", setSectionFromHash);

      return () => {
        clearPendingSection();
        if (rafId) {
          window.cancelAnimationFrame(rafId);
        }
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        window.removeEventListener("hashchange", setSectionFromHash);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length === 0) {
          return;
        }

        const topVisibleId = visibleEntries[0].target.id;
        if (!topVisibleId) {
          return;
        }

        if (
          pendingSectionRef.current &&
          topVisibleId !== pendingSectionRef.current
        ) {
          return;
        }

        setActiveSection(topVisibleId);
        if (pendingSectionRef.current === topVisibleId) {
          clearPendingSection();
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    sectionIds.forEach((id) => {
      const sectionElement = document.getElementById(id);
      if (sectionElement) {
        observer.observe(sectionElement);
      }
    });

    window.addEventListener("hashchange", setSectionFromHash);

    return () => {
      clearPendingSection();
      observer.disconnect();
      window.removeEventListener("hashchange", setSectionFromHash);
    };
  }, [scrollOffset, sections, trackingMode]);

  return (
    <div className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 overflow-hidden">
      <div className="space-y-2 p-6 md:p-8">
        <h1 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
          {title}
        </h1>
        <p className="text-paragraph text-sm">Last Updated: {lastUpdated}</p>
      </div>
      <hr />
      <div className="px-4 py-4 md:px-6 md:py-6 overflow-x-hidden overflow-y-visible md:max-h-[calc(100vh-12rem)] md:overflow-y-auto scrollbar-hide">
        <div className="space-y-3 flex flex-col">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`${baseLinkClasses} ${
                activeSection === id ? activeLinkClasses : ""
              }`}
              aria-current={activeSection === id ? "location" : undefined}
              onClick={(event) => handleNavClick(event, id)}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalSidebar;
