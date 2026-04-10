import { FaqSearchClient } from "@/app/faq/_components/faq-search-client";
import {
  faqItems,
  type FaqAnswer,
  type FaqContentItem,
} from "@/app/faq/_data/faq-content";

import { ArrowUp } from "lucide-react";

function getCategoryId(category: string) {
  return `faq-category-${category
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")}`;
}

function renderAnswer(answer: FaqAnswer) {
  if (typeof answer === "string") {
    return (
      <p className="text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base">
        {answer}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {answer.paragraphs?.map((paragraph, index) => (
        <p
          key={`paragraph-${index}`}
          className="text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base"
        >
          {paragraph}
        </p>
      ))}

      {answer.bullets?.length ? (
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base">
          {answer.bullets.map((bullet, index) => (
            <li key={`bullet-${index}`}>{bullet}</li>
          ))}
        </ul>
      ) : null}

      {answer.note ? (
        <div className="rounded-2xl border border-[#2530F022] bg-white/70 px-4 py-3 text-sm leading-relaxed text-[#2530F0] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#13E1EA]">
          {answer.note}
        </div>
      ) : null}
    </div>
  );
}

function groupFaq(items: FaqContentItem[]) {
  return items.reduce<Record<string, FaqContentItem[]>>(
    (acc, item) => {
      if (!item.category) return acc;
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );
}

const allGroupedFaq = groupFaq(faqItems);
const allCategories = Object.keys(allGroupedFaq);

const FaqSections = () => (
    <section
      id="faq-top"
      className="container mt-4 mb-12 px-4 md:mt-6 md:mb-20 md:px-6"
    >
      <div className="glass-card gradient-outline-border !rounded-3xl !border-0 !shadow-none px-6 py-8 md:px-12 md:py-10">
        <div className="mt-4">
          {/* Static header — always server-rendered, fully crawlable */}
          <div className="max-w-5xl">
            <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <h1 className="font-['Space_Grotesk'] text-3xl font-bold leading-[1.02] text-black dark:text-white md:text-[48px]">
                SensePC knowledge base
              </h1>

              <p className="shrink-0 text-sm font-medium text-[#2530F0] dark:text-[#13E1EA] md:mb-1 md:text-base">
                Deep waters. Clear answers.
              </p>
            </div>

            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-lg">
              Browse the SensePC knowledge base for answers about setup,
              access, connection, performance, plans, billing, refunds,
              security, team access, and troubleshooting.
            </p>
          </div>

          {/*
            FaqSearchClient handles: search input, category jump nav,
            filtered results when searching, "Still need help" footer.
            Children (below) are server-rendered static FAQ content —
            shown when not searching, always present in the initial HTML for SEO.
          */}
          <FaqSearchClient>
            <div className="mt-10 space-y-6 md:mt-14 md:space-y-8">
              {allCategories.map((category) => {
                const items = allGroupedFaq[category];

                return (
                  <section
                    key={category}
                    id={getCategoryId(category)}
                    className="scroll-mt-32 rounded-3xl border border-[#2530F022] bg-white/80 px-5 py-6 dark:border-white/10 dark:bg-white/[0.03] md:px-7 md:py-8"
                    aria-labelledby={`${getCategoryId(category)}-heading`}
                  >
                    <div className="flex flex-col gap-3 border-b border-[#2530F018] pb-5 dark:border-white/10 md:flex-row md:items-end md:justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                          {category}
                        </p>
                        <h2
                          id={`${getCategoryId(category)}-heading`}
                          className="font-['Space_Grotesk'] text-2xl font-semibold text-black dark:text-white md:text-3xl"
                        >
                          {category} questions
                        </h2>
                      </div>

                      <a
                        href="#faq-top"
                        aria-label={`Go to top from ${category}`}
                        title="Go to top"
                        className="inline-flex h-10 w-10 items-center justify-center self-start rounded-full border border-[#2530F033] bg-white text-[#2530F0] transition hover:border-[#2530F0] hover:bg-[#2530F014] dark:border-white/20 dark:bg-white/[0.04] dark:text-[#13E1EA] dark:hover:border-[#13E1EA] dark:hover:bg-white/10 md:self-auto"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </a>
                    </div>

                    <div className="mt-5 grid gap-4">
                      {items.map((item, index) => (
                        <article
                          key={`${category}-${item.question}`}
                          className="rounded-2xl border border-[#2530F022] bg-[#5220DE09] p-5 transition-colors hover:bg-[#5220DE12] dark:border-white/10 dark:bg-[#000332] dark:hover:bg-[#060a44] md:p-6"
                        >
                          <div className="flex gap-3">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-[#2530F0] dark:bg-white/10 dark:text-[#13E1EA]">
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <div className="space-y-2">
                              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-black dark:text-white md:text-xl">
                                {item.question}
                              </h3>

                              {renderAnswer(item.answer)}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </FaqSearchClient>
        </div>
      </div>
    </section>
);

export default FaqSections;
