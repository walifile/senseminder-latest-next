"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  faqItems,
  type FaqAnswer,
  type FaqContentItem,
  faqAnswerToPlainText,
} from "@/app/faq/_data/faq-content";

import { ArrowUp } from "lucide-react";

type RankedFaqItem = {
  item: FaqContentItem;
  score: number;
  exact: boolean;
  index: number;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "am",
  "are",
  "was",
  "were",
  "to",
  "for",
  "of",
  "in",
  "on",
  "at",
  "by",
  "with",
  "and",
  "or",
  "do",
  "does",
  "did",
  "how",
  "what",
  "when",
  "where",
  "why",
  "can",
  "could",
  "should",
  "would",
  "i",
  "me",
  "my",
  "you",
  "your",
  "we",
  "our",
  "it",
  "this",
  "that",
  "from",
  "about",
  "into",
  "than",
  "then",
  "be",
  "if",
]);

const TOKEN_EXPANSIONS: Record<string, string[]> = {
  charge: [
    "billing",
    "bill",
    "billed",
    "charged",
    "payment",
    "payments",
    "wallet",
    "recharge",
    "cost",
    "price",
  ],
  charges: [
    "billing",
    "bill",
    "billed",
    "charged",
    "payment",
    "payments",
    "wallet",
    "recharge",
    "cost",
    "price",
  ],
  billing: [
    "charge",
    "charges",
    "bill",
    "payment",
    "payments",
    "wallet",
    "recharge",
    "cost",
    "price",
  ],
  pay: [
    "payment",
    "payments",
    "billing",
    "wallet",
    "recharge",
    "card",
    "cards",
    "charge",
  ],
  payment: [
    "pay",
    "payments",
    "billing",
    "wallet",
    "card",
    "cards",
    "charge",
    "recharge",
  ],
  payments: [
    "pay",
    "payment",
    "billing",
    "wallet",
    "card",
    "cards",
    "charge",
    "recharge",
  ],
  wallet: [
    "payment",
    "payments",
    "billing",
    "recharge",
    "funds",
    "balance",
    "charge",
    "topup",
    "top-up",
  ],
  recharge: [
    "wallet",
    "funds",
    "balance",
    "topup",
    "top-up",
    "payment",
    "charge",
  ],
  refund: ["refunds", "moneyback", "reversal"],
  refunds: ["refund", "moneyback", "reversal"],

  login: ["sign in", "signin", "access", "authentication", "password", "mfa"],
  signin: ["sign in", "login", "access", "authentication", "password", "mfa"],
  access: ["login", "signin", "connect", "launch", "open", "session"],
  connect: ["access", "launch", "session", "open"],

  slow: [
    "latency",
    "lag",
    "delay",
    "performance",
    "responsive",
    "responsiveness",
    "stutter",
  ],
  lag: ["latency", "slow", "delay", "performance", "stutter"],
  latency: ["lag", "slow", "delay", "performance", "responsiveness"],
  performance: ["latency", "lag", "slow", "fps", "responsive", "responsiveness"],

  location: ["region", "closest", "near", "latency"],
  region: ["location", "closest", "near", "latency"],

  pc: ["sensepc", "desktop", "computer"],
  desktop: ["sensepc", "pc", "computer"],
  sensepc: ["desktop", "pc", "computer"],

  team: ["member", "admin", "owner", "organization", "business"],
  security: ["secure", "encrypted", "mfa", "authentication"],
};

function getCategoryId(category: string) {
  return `faq-category-${category
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")}`;
}

function normalizeSearchText(text: string) {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  return normalizeSearchText(text)
    .split(" ")
    .filter((token) => token && !STOP_WORDS.has(token));
}

function expandQueryTokens(tokens: string[]) {
  const expanded = new Set<string>();

  tokens.forEach((token) => {
    expanded.add(token);

    const related = TOKEN_EXPANSIONS[token] ?? [];
    related.forEach((word) => {
      tokenize(word).forEach((part) => expanded.add(part));
    });
  });

  return [...expanded];
}

function tokenMatchScore(queryTokens: string[], targetTokens: string[]) {
  let score = 0;

  for (const queryToken of queryTokens) {
    if (targetTokens.includes(queryToken)) {
      score += 1;
      continue;
    }

    if (
      queryToken.length >= 3 &&
      targetTokens.some(
        (targetToken) =>
          targetToken.startsWith(queryToken) ||
          queryToken.startsWith(targetToken) ||
          targetToken.includes(queryToken) ||
          queryToken.includes(targetToken)
      )
    ) {
      score += 0.65;
    }
  }

  return score;
}

function scoreFaqItem(item: FaqContentItem, rawQuery: string) {
  const normalizedQuery = normalizeSearchText(rawQuery);
  if (!normalizedQuery) return { score: 0, exact: false };

  const questionText = normalizeSearchText(item.question);
  const categoryText = normalizeSearchText(item.category ?? "");
  const answerText = normalizeSearchText(faqAnswerToPlainText(item.answer));

  const baseTokens = tokenize(rawQuery);
  const queryTokens = expandQueryTokens(baseTokens);

  const questionTokens = tokenize(item.question);
  const categoryTokens = tokenize(item.category ?? "");
  const answerTokens = tokenize(faqAnswerToPlainText(item.answer));

  let score = 0;

  const exact =
    questionText.includes(normalizedQuery) ||
    categoryText.includes(normalizedQuery) ||
    answerText.includes(normalizedQuery);

  if (questionText.includes(normalizedQuery)) score += 140;
  if (categoryText.includes(normalizedQuery)) score += 90;
  if (answerText.includes(normalizedQuery)) score += 70;

  score += tokenMatchScore(queryTokens, questionTokens) * 24;
  score += tokenMatchScore(queryTokens, categoryTokens) * 16;
  score += tokenMatchScore(queryTokens, answerTokens) * 10;

  return { score, exact };
}

function getRankedFaqResults(items: FaqContentItem[], rawQuery: string) {
  const normalizedQuery = normalizeSearchText(rawQuery);

  if (!normalizedQuery) {
    return items.map((item, index) => ({
      item,
      score: 0,
      exact: false,
      index,
    }));
  }

  const ranked: RankedFaqItem[] = items
    .map((item, index) => {
      const result = scoreFaqItem(item, rawQuery);
      return {
        item,
        score: result.score,
        exact: result.exact,
        index,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score || Number(b.exact) - Number(a.exact) || a.index - b.index
    );

  const strongMatches = ranked.filter((entry) => entry.score >= 8);

  if (strongMatches.length > 0) {
    return strongMatches.slice(0, 24);
  }

  return ranked.slice(0, 6);
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
  return items.reduce<Record<string, FaqContentItem[]>>((acc, item) => {
    if (!item.category) return acc;
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

const allGroupedFaq = groupFaq(faqItems);
const allCategories = Object.keys(allGroupedFaq);

type Props = {
  children: React.ReactNode;
};

export function FaqSearchClient({ children }: Props) {
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;

  const rankedResults = useMemo(() => getRankedFaqResults(faqItems, search), [search]);

  const filteredItems = useMemo(() => {
    if (!isSearching) return faqItems;
    return rankedResults.map((result) => result.item);
  }, [isSearching, rankedResults]);

  const hasExactMatch = useMemo(
    () => rankedResults.some((result) => result.exact),
    [rankedResults]
  );

  const isSuggestionMode = isSearching && filteredItems.length > 0 && !hasExactMatch;

  const groupedFaq = useMemo(
    () => (isSearching ? groupFaq(filteredItems) : {}),
    [isSearching, filteredItems]
  );
  const categories = useMemo(() => Object.keys(groupedFaq), [groupedFaq]);

  return (
    <>
      {/* Search box */}
      <div className="mt-6 rounded-2xl border border-[#2530F022] bg-white/60 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
        <label
          htmlFor="faq-search"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]"
        >
          Search the knowledge base
        </label>

        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            id="faq-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by question, answer, category, or related meaning"
            className="w-full rounded-2xl border border-[#2530F022] bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#2530F0] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-[#13E1EA]"
          />

          {isSearching ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-2xl border border-[#2530F033] bg-white px-4 py-3 text-sm font-medium text-[#2530F0] transition hover:bg-[#2530F014] dark:border-white/20 dark:bg-white/[0.04] dark:text-[#13E1EA] dark:hover:bg-white/10"
            >
              Clear
            </button>
          ) : null}
        </div>

        {!isSearching ? (
          <>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
              Jump to a topic
            </p>

            <nav
              className="mt-3 flex flex-wrap gap-2"
              aria-label="FAQ category shortcuts"
            >
              {allCategories.map((category) => (
                <a
                  key={category}
                  href={`#${getCategoryId(category)}`}
                  className="rounded-full border border-[#2530F033] bg-white px-4 py-2 text-sm font-medium text-[#2530F0] transition-colors hover:border-[#2530F0] hover:bg-[#2530F014] dark:border-white/20 dark:bg-white/[0.04] dark:text-[#13E1EA] dark:hover:border-[#13E1EA] dark:hover:bg-white/10"
                >
                  {category}
                </a>
              ))}
            </nav>
          </>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5]">
            {isSuggestionMode ? (
              <>
                No exact match for{" "}
                <span className="font-semibold text-black dark:text-white">
                  {search}
                </span>
                . Showing the closest answers instead.
              </>
            ) : (
              <>
                Showing {filteredItems.length} result
                {filteredItems.length === 1 ? "" : "s"} for{" "}
                <span className="font-semibold text-black dark:text-white">
                  {search}
                </span>
                .
              </>
            )}
          </p>
        )}
      </div>

      {/* Content area: server-rendered children when idle, filtered results when searching */}
      {isSearching ? (
        filteredItems.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-[#2530F022] bg-white/80 px-6 py-8 text-center dark:border-white/10 dark:bg-white/[0.03] md:mt-14">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-black dark:text-white">
              No results found
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base">
              Try a different keyword, or clear the search to browse all topics.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-6 md:mt-14 md:space-y-8">
            {categories.map((category) => {
              const items = groupedFaq[category];

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
        )
      ) : (
        // Server-rendered static FAQ content — all questions/answers in initial HTML for SEO
        children
      )}

      {/* Still need help */}
      <div className="mt-10 rounded-3xl border border-[#2530F022] bg-white/80 px-6 py-6 dark:border-white/10 dark:bg-white/[0.03] md:mt-14 md:px-8 md:py-8">
        <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-black dark:text-white">
          Still need help?
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base">
          If you could not find the answer you need, contact the SensePC support
          team or review the tutorials for step-by-step guidance.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/support"
            className="rounded-full bg-[#2530F0] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Contact support
          </Link>

          <Link
            href="/tutorials"
            className="rounded-full border border-[#2530F033] bg-white px-5 py-2.5 text-sm font-semibold text-[#2530F0] transition hover:bg-[#2530F014] dark:border-white/20 dark:bg-white/[0.04] dark:text-[#13E1EA] dark:hover:bg-white/10"
          >
            View tutorials
          </Link>
        </div>
      </div>
    </>
  );
}
