import type { UseCaseSlug } from "@/app/use-cases/_data/use-cases-content";

import Link from "next/link";
import { routes } from "@/constants/routes";
import FAQ from "@/app/home/_components/faq";
import { MainLayout } from "@/app/home/_components/main-layout";
import { getUseCaseContent } from "@/app/use-cases/_data/use-cases-content";

import { Button } from "@/components/ui/button";

type UseCasePageProps = {
  slug: UseCaseSlug;
};

const UseCasePage = ({ slug }: UseCasePageProps) => {
  const content = getUseCaseContent(slug);

  return (
    <MainLayout>
      <div className="flex-grow pb-16 pt-24 font-['Inter'] md:pt-28">
        <div className="container mx-auto space-y-10 px-4 md:space-y-14 md:px-6">
          <section className="glass-card gradient-outline-border !rounded-3xl !border-0 !shadow-none px-6 py-10 md:px-12 md:py-12">
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
              <div>
                <h1 className="font-['Space_Grotesk'] text-3xl font-bold leading-[1.02] text-black dark:text-white md:text-[52px]">
                  {content.heroTitle}
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-lg">
                  {content.heroDescription}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="w-full rounded-full px-7 py-3 sm:w-auto"
                  >
                    <Link href={routes.pricing}>Review pricing</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full px-7 py-3 sm:w-auto"
                  >
                    <Link href={routes.contact}>Talk to sales</Link>
                  </Button>
                </div>
              </div>

              <aside className="rounded-2xl border border-[#2530F033] bg-[#2530F00A] p-5 dark:border-white/15 dark:bg-white/[0.03] md:p-6">
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-black dark:text-white">
                  Why this use case matters
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base">
                  {content.summaryCards.map((card) => (
                    <li
                      key={card.title}
                      className="rounded-2xl border border-[#2530F022] bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <p className="font-['Space_Grotesk'] text-base font-semibold text-black dark:text-white">
                        {card.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5]">
                        {card.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-3xl border border-[#2530F022] bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.03] md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                {content.sectionTitle}
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-lg">
                {content.sectionIntro}
              </p>
              <ul className="mt-6 space-y-3">
                {content.problemPoints.map((point) => (
                  <li
                    key={point}
                    className="rounded-2xl border border-[#2530F022] bg-[#2530F00A] px-4 py-4 text-sm leading-relaxed text-[#1D2144] dark:border-white/10 dark:bg-white/[0.03] dark:text-[#D4DBF5] md:text-base"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-[#2530F022] bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.03] md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2530F0] dark:text-[#13E1EA]">
                {content.recommendedPlan.title}
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-lg">
                {content.recommendedPlan.summary}
              </p>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base">
                {content.recommendedPlan.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="glass-card gradient-outline-border !rounded-3xl !border-0 !shadow-none px-6 py-8 md:px-12">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold leading-8 tracking-tight text-black dark:text-white md:text-3xl">
              Getting started with {content.label.toLowerCase()}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-lg">
              Start with the workflow that matters most, confirm the setup with a
              smaller group, and expand once the experience is working well for
              your team.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {content.setupSteps.map((step) => (
                <article
                  key={step.title}
                  className="rounded-2xl border border-[#2530F022] bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-black dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base">
                    {step.copy}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section
            className="grid gap-4 md:grid-cols-3"
            aria-label={`Why ${content.label} teams choose SensePC`}
          >
            {content.whySensePc.map((point, index) => (
              <article
                key={point}
                className="rounded-2xl border border-[#2530F022] bg-[#5220DE08] p-6 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2530F00D] text-sm font-semibold text-[#2530F0] dark:bg-white/10 dark:text-[#13E1EA]">
                  {index + 1}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-base">
                  {point}
                </p>
              </article>
            ))}
          </section>

          <FAQ
            items={content.faqItems}
            title={`Common questions from ${content.label.toLowerCase()} teams`}
            subtitle="Review the practical questions teams usually ask when evaluating this workflow on SensePC."
          />

          <section className="glass-card gradient-outline-border !rounded-3xl !border-0 !shadow-none px-6 py-8 text-center md:px-12 md:py-12">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-black dark:text-white md:text-4xl">
              Plan your next step with SensePC
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[#454545] dark:text-[#B9C2D5] md:text-lg">
              Compare plans, contact the team, or move into onboarding once the
              right use case and configuration are clear.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                className="w-full rounded-full px-7 py-3 sm:w-auto"
              >
                <Link href={routes.pricing}>See plans</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full px-7 py-3 sm:w-auto"
              >
                <Link href={routes.businessOnboarding}>Business onboarding</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default UseCasePage;
