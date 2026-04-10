import type { Metadata } from "next";

import Link from "next/link";
import { routes } from "@/constants/routes";
import { comparisons } from "@/app/compare/_data/comparisons";
import { MainLayout } from "@/app/home/_components/main-layout";
import ComparisonContent from "@/app/compare/_components/comparison-content";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Comparisons | SensePC",
  description:
    "Compare SensePC with leading cloud desktop providers. Review key differences, pricing approach, and why teams choose SensePC.",
  alternates: {
    canonical: "/compare",
  },
  openGraph: {
    title: "Comparisons | SensePC",
    description:
      "Compare SensePC with leading cloud desktop providers. Review key differences, pricing approach, and why teams choose SensePC.",
    url: "/compare",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC comparisons",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comparisons | SensePC",
    description:
      "Compare SensePC with leading cloud desktop providers. Review key differences, pricing approach, and why teams choose SensePC.",
    images: [{ url: "/sensepc-logo-dark.png", alt: "SensePC comparisons" }],
  },
};

const comparisonList = Object.values(comparisons);

const comparisonFaqItems = comparisonList.flatMap((item) =>
  item.faqs.map((faq) => ({
    competitor: item.competitor.shortName,
    question: faq.question,
    answer: faq.answer,
  }))
);


const ComparePage = () => (
  <MainLayout>
    <main className="flex-grow pb-16 pt-24 font-['Inter'] md:pt-28">
      <div className="container mx-auto space-y-10 px-4 md:space-y-14 md:px-6">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section
          id="compare-top"
          className="glass-card gradient-outline-border !rounded-3xl !border-0 !shadow-none px-6 py-10 md:px-12 md:py-12"
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                Comparison hub
              </p>
              <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold leading-[1.02] text-black dark:text-white md:text-[52px]">
                SensePC vs the competition
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-lg">
                Compare SensePC against {comparisonList.length} leading cloud desktop
                providers — pricing, setup, flexibility, and day-to-day management —
                all in one place.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="w-full rounded-full px-7 py-3 sm:w-auto">
                  <Link href={routes.buildPc}>Build your SensePC</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full px-7 py-3 sm:w-auto"
                >
                  <Link href={routes.pricing}>View pricing</Link>
                </Button>
              </div>
            </div>

            {/* Jump nav */}
            <aside className="rounded-2xl border border-[#2530F033] bg-[#2530F00A] p-5 dark:border-white/15 dark:bg-white/[0.03] md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                Jump to competitor
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {comparisonList.map((item) => (
                  <a
                    key={item.slug}
                    href={`#compare-${item.slug}`}
                    className="rounded-full border border-[#2530F033] px-4 py-2 text-sm text-[#2530F0] transition-colors hover:bg-[#2530F014] dark:border-white/20 dark:text-[#13E1EA] dark:hover:bg-white/10"
                  >
                    {item.competitor.shortName}
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* ── MAIN CONTENT ─────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">

          {/* Sticky sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:rounded-3xl">
            <div className="glass-card gradient-outline-border !rounded-3xl !border-0 !shadow-none p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                Compare directory
              </p>
              <h2 className="mt-2 font-['Space_Grotesk'] text-xl font-semibold text-black dark:text-white">
                All comparisons
              </h2>

              <div className="mt-4 grid gap-2">
                {comparisonList.map((item, index) => (
                  <a
                    key={item.slug}
                    href={`#compare-${item.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-[#2530F022] bg-white/80 px-4 py-3 text-sm text-[#1D2144] transition-colors hover:bg-[#2530F014] dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.competitor.shortName}</p>
                      <p className="mt-0.5 text-xs text-[#454545] dark:text-[#B9C2D5]">
                        Open comparison
                      </p>
                    </div>
                    <span className="ml-3 shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-[#2530F0] dark:text-[#13E1EA]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </a>
                ))}
                <a
                  href="#compare-faq"
                  className="flex items-center justify-between rounded-2xl border border-[#2530F022] bg-white/80 px-4 py-3 text-sm text-[#1D2144] transition-colors hover:bg-[#2530F014] dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
                >
                  <div>
                    <p className="font-medium">FAQ</p>
                    <p className="mt-0.5 text-xs text-[#454545] dark:text-[#B9C2D5]">
                      Common questions
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-[#2530F0] dark:text-[#13E1EA]">
                    End
                  </span>
                </a>
              </div>
            </div>
          </aside>

          {/* Comparison sections */}
          <div className="space-y-6 md:space-y-8">
            {comparisonList.map((item, index) => (
                <section
                  key={item.slug}
                  id={`compare-${item.slug}`}
                  className="scroll-mt-32"
                  aria-label={`${item.headline} comparison`}
                >
                  <details
                    open={index === 0}
                    className="group rounded-[28px] border border-[#2530F022] bg-white/80 p-4 shadow-[0_16px_60px_rgba(17,24,39,0.04)] dark:border-white/10 dark:bg-white/[0.03] md:p-6"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 marker:content-none">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#2530F033] bg-[#2530F00A] text-sm font-bold text-[#2530F0] dark:border-white/20 dark:bg-white/[0.04] dark:text-[#13E1EA]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-['Space_Grotesk'] text-xl font-semibold text-black dark:text-white md:text-2xl">
                            {item.headline}
                          </p>
                          <p className="mt-0.5 text-sm text-[#454545] dark:text-[#B9C2D5]">
                            {item.competitor.tagline}
                          </p>
                        </div>
                      </div>

                      <span className="text-xl font-light text-[#2530F0] transition-transform duration-200 group-open:rotate-45 dark:text-[#13E1EA]">
                        +
                      </span>
                    </summary>

                    <div className="mt-6 border-t border-[#2530F018] pt-6 dark:border-white/10">
                      <ComparisonContent
                        data={item}
                        idPrefix={item.slug}
                        showFaq={false}
                        showHero={false}
                        showCta={false}
                      />

                      <div className="mt-6 flex justify-end border-t border-[#2530F018] pt-4 dark:border-white/10">
                        <a
                          href="#compare-top"
                          className="rounded-full border border-[#2530F033] px-4 py-2 text-sm text-[#2530F0] transition-colors hover:bg-[#2530F014] dark:border-white/20 dark:text-[#13E1EA] dark:hover:bg-white/10"
                        >
                          Back to top
                        </a>
                      </div>
                    </div>
                  </details>
                </section>
            ))}
          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section
          id="compare-faq"
          className="glass-card gradient-outline-border !rounded-3xl !border-0 !shadow-none px-6 py-10 md:px-12 md:py-12"
          aria-label="Comparison frequently asked questions"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
              Comparison FAQ
            </p>
            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold leading-[1.02] text-black dark:text-white md:text-[44px]">
              Common questions across all comparisons
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-lg">
              The most important comparison questions, grouped by competitor.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {comparisonFaqItems.map((faq) => (
              <details
                key={`${faq.competitor}-${faq.question}`}
                className="group rounded-2xl border border-[#2530F022] bg-white/80 px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 marker:content-none">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                      {faq.competitor}
                    </p>
                    <h3 className="mt-1.5 font-['Space_Grotesk'] text-base font-semibold text-black dark:text-white md:text-lg">
                      {faq.question}
                    </h3>
                  </div>
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2530F033] text-sm font-semibold text-[#2530F0] transition-transform duration-200 group-open:rotate-45 dark:border-white/20 dark:text-[#13E1EA]">
                    +
                  </span>
                </summary>
                <p className="mt-4 border-t border-[#2530F018] pt-4 text-sm leading-relaxed text-[#454545] dark:border-white/10 dark:text-[#B9C2D5] md:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

      </div>
    </main>
  </MainLayout>
);

export default ComparePage;
