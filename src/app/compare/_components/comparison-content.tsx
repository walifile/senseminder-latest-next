import Link from "next/link";
import { routes } from "@/constants/routes";
import FAQ from "@/app/home/_components/faq";
import { type ComparisonData } from "@/app/compare/_data/comparisons";

import { Button } from "@/components/ui/button";

type Props = {
  data: ComparisonData;
  idPrefix?: string;
  showFaq?: boolean;
  showHero?: boolean;
  showCta?: boolean;
};

function withPrefix(prefix: string | undefined, id: string) {
  if (!prefix) return id;
  return `${id}-${prefix}`;
}

const ComparisonContent = ({
  data,
  idPrefix,
  showFaq = true,
  showHero = true,
  showCta = true,
}: Props) => {
  const tableId = withPrefix(idPrefix, "comparison-table");
  const differencesId = withPrefix(idPrefix, "key-differences");
  const whyId = withPrefix(idPrefix, "why-sensepc");
  const faqId = withPrefix(idPrefix, "faq");

  return (
    <div className={showHero ? "space-y-10 md:space-y-14" : "space-y-8 md:space-y-10"}>
      {showHero ? (
        <section className="glass-card gradient-outline-border !rounded-3xl !border-0 !shadow-none px-6 py-10 md:px-12 md:py-12">
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                Comparison
              </p>

              <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold leading-[1.02] text-black dark:text-white md:text-[52px]">
                {data.headline}
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-lg">
                {data.intro}
              </p>

              <nav
                className="mt-7 flex flex-wrap gap-2"
                aria-label="Comparison page sections"
              >
                <a
                  href={`#${tableId}`}
                  className="rounded-full border border-[#2530F033] px-4 py-2 text-sm text-[#2530F0] transition-colors hover:bg-[#2530F014] dark:border-white/20 dark:text-[#13E1EA] dark:hover:bg-white/10"
                >
                  Feature Comparison
                </a>
                <a
                  href={`#${differencesId}`}
                  className="rounded-full border border-[#2530F033] px-4 py-2 text-sm text-[#2530F0] transition-colors hover:bg-[#2530F014] dark:border-white/20 dark:text-[#13E1EA] dark:hover:bg-white/10"
                >
                  Key Differences
                </a>
                <a
                  href={`#${whyId}`}
                  className="rounded-full border border-[#2530F033] px-4 py-2 text-sm text-[#2530F0] transition-colors hover:bg-[#2530F014] dark:border-white/20 dark:text-[#13E1EA] dark:hover:bg-white/10"
                >
                  Why SensePC
                </a>
                {showFaq ? (
                  <a
                    href={`#${faqId}`}
                    className="rounded-full border border-[#2530F033] px-4 py-2 text-sm text-[#2530F0] transition-colors hover:bg-[#2530F014] dark:border-white/20 dark:text-[#13E1EA] dark:hover:bg-white/10"
                  >
                    FAQ
                  </a>
                ) : null}
              </nav>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

            <aside className="rounded-2xl border border-[#2530F033] bg-[#2530F00A] p-5 dark:border-white/15 dark:bg-white/[0.03] md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                Competitor overview
              </p>
              <h3 className="mt-3 font-['Space_Grotesk'] text-xl font-semibold text-black dark:text-white">
                {data.competitor.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5]">
                {data.competitor.tagline}
              </p>

              <div className="mt-5 border-t border-[#2530F018] pt-5 dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                  SensePC advantages
                </p>
                <ul className="mt-3 space-y-2">
                  {data.whySensePC.slice(0, 3).map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-[#454545] dark:text-[#B9C2D5]"
                    >
                      <span className="mt-0.5 shrink-0 text-[#2530F0] dark:text-[#13E1EA]">
                        +
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-[#2530F022] bg-[#2530F00A] px-5 py-5 dark:border-white/10 dark:bg-white/[0.03] md:px-6">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] md:items-start">
            <div>
              <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-black dark:text-white md:text-3xl">
                {data.headline}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base">
                {data.intro}
              </p>
            </div>
            <div className="rounded-2xl border border-[#2530F022] bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                Best fit
              </p>
              <ul className="mt-3 space-y-2">
                {data.whySensePC.slice(0, 3).map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-sm text-[#454545] dark:text-[#B9C2D5]"
                  >
                    <span className="mt-0.5 shrink-0 text-[#2530F0] dark:text-[#13E1EA]">
                      +
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section
        id={tableId}
        className="glass-card gradient-outline-border !rounded-3xl !border-0 !shadow-none px-6 py-8 md:px-12"
        aria-label="Feature comparison table"
      >
        <h3 className="font-['Space_Grotesk'] text-2xl font-bold leading-8 tracking-tight text-black dark:text-white md:text-3xl">
          Feature comparison
        </h3>
        <p className="mt-2 text-[#454545] dark:text-[#B9C2D5]">
          SensePC vs {data.competitor.name} side by side.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#2530F022] dark:border-white/10">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-[#2530F00D] dark:bg-white/5">
              <tr>
                <th className="w-[34%] px-4 py-3 text-sm font-semibold text-black dark:text-white">
                  Feature
                </th>
                <th className="w-[33%] px-4 py-3 text-sm font-semibold text-[#2530F0] dark:text-[#13E1EA]">
                  SensePC
                </th>
                <th className="w-[33%] px-4 py-3 text-sm font-semibold text-black dark:text-white">
                  {data.competitor.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.tableRows.map((row) => (
                <tr
                  key={row.feature}
                  className="border-t border-[#2530F018] dark:border-white/10"
                >
                  <td className="px-4 py-3 text-sm font-medium text-black dark:text-white md:text-base">
                    {row.feature}
                  </td>
                  <td
                    className={
                      row.sensepcWins
                        ? "bg-[#2530F006] px-4 py-3 text-sm text-[#1a22c4] dark:bg-[#13E1EA08] dark:text-[#13E1EA] md:text-base"
                        : "px-4 py-3 text-sm text-[#454545] dark:text-[#B9C2D5] md:text-base"
                    }
                  >
                    {row.sensepcWins ? (
                      <span className="flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">+</span>
                        {row.sensepc}
                      </span>
                    ) : (
                      row.sensepc
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#454545] dark:text-[#B9C2D5] md:text-base">
                    {row.competitor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        id={differencesId}
        className="grid gap-4 md:grid-cols-3"
        aria-label="Key differences"
      >
        {data.keyDifferences.map((diff) => (
          <article
            key={diff.title}
            className="rounded-2xl border border-[#2530F022] bg-[#5220DE08] p-5 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-black dark:text-white">
              {diff.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base">
              {diff.description}
            </p>
          </article>
        ))}
      </section>

      <section
        id={whyId}
        className="glass-card gradient-outline-border !rounded-3xl !border-0 !shadow-none px-6 py-8 md:px-12"
        aria-label={`Why teams choose SensePC over ${data.competitor.name}`}
      >
        <h3 className="font-['Space_Grotesk'] text-2xl font-bold leading-8 tracking-tight text-black dark:text-white md:text-3xl">
          Why teams choose SensePC over {data.competitor.shortName}
        </h3>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {data.whySensePC.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 rounded-2xl border border-[#2530F022] bg-white/70 px-4 py-3 text-sm leading-relaxed text-[#454545] dark:border-white/10 dark:bg-white/[0.03] dark:text-[#B9C2D5] md:text-base"
            >
              <span className="mt-0.5 shrink-0 font-bold text-[#2530F0] dark:text-[#13E1EA]">
                +
              </span>
              {point}
            </li>
          ))}
        </ul>

        {showCta ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full rounded-full px-7 py-3 sm:w-auto">
              <Link href={routes.buildPc}>Build your SensePC</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full rounded-full px-7 py-3 sm:w-auto"
            >
              <Link href={routes.contact}>Talk to the team</Link>
            </Button>
          </div>
        ) : null}
      </section>

      {showFaq ? (
        <section id={faqId} aria-label={`FAQs for ${data.competitor.name}`}>
          <FAQ
            items={data.faqs}
            title={`SensePC vs ${data.competitor.name} - Common Questions`}
            subtitle={`Answers to the most common questions when comparing SensePC to ${data.competitor.name}.`}
          />
        </section>
      ) : null}
    </div>
  );
};

export default ComparisonContent;
