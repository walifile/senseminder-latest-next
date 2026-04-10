"use client";

import type { ReactNode, ElementType } from "react";

import Link from "next/link";
import { routes } from "@/constants/routes";
import GetStartedCTA from "@/app/home/_components/get-started-cta";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { motion } from "framer-motion";
import { Users, Wrench, ArrowUpRight } from "lucide-react";

import {
  quickLinks,
  valueCards,
  onboardingSteps,
  ONBOARDING_LINKS,
} from "../data/onboarding-content";

function GradientIcon({ Icon }: { Icon: ElementType }) {
  return (
    <div className="relative">
      <div className="z-0 absolute inset-0 opacity-80 blur-[40px] bg-[linear-gradient(151.43deg,_#BA49D0_13.32%,_#84FFF7_80.38%)]" />
      <div className="relative z-10 size-12 md:size-14 rounded-2xl flex items-center justify-center bg-white dark:bg-[#0B0F2A] border border-black/5 dark:border-white/10">
        <Icon className="size-6 md:size-7" />
      </div>
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="space-y-2.5 text-center">
      {kicker ? (
        <div
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs md:text-sm",
            "bg-[#2530F0]/10 text-[#2530F0] dark:bg-white/10 dark:text-[#B9C2D5]",
          )}
        >
          {kicker}
        </div>
      ) : null}
      <p className="font-space-grotesk font-semibold text-2xl md:text-5xl">
        {title}
      </p>
      {subtitle ? (
        <p className="text-paragraph text-base md:text-2xl max-w-4xl mx-auto">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function TeamOnboardingHero({
  onGetStarted,
}: {
  onGetStarted: () => void;
}) {
  return (
    <section>
      <div className="container z-10 relative pt-[20px] md:pt-[36px]">
        <div className="container flex flex-col-reverse gap-8 px-0 py-10 md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start md:gap-14 md:pt-16 md:pb-32">
          <div className="flex w-full max-w-[720px] flex-col gap-6 md:gap-10">
            {/* <div className="mb-1">
              <Breadcrumb
                variant="figma"
                items={[
                  { label: "Home", href: routes.home },
                  { label: "Business Onboarding" },
                ]}
              />
            </div> */}

            <div className="flex flex-col gap-4 md:gap-5">
              <h1 className="w-full max-w-[680px] font-space-grotesk text-3xl font-bold leading-[1.06] tracking-[-0.03em] md:text-[58px]">
                <span className="bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] bg-clip-text text-transparent">
                  Onboard your team to Sense PC - fast, secure, and ready to
                  work
                </span>
              </h1>

              <p className="max-w-[620px] text-lg leading-[1.45] text-paragraph md:text-[22px]">
                Standardize cloud desktops for your organization, invite users
                in minutes, and keep billing and storage simple with one unified
                experience.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button className="w-full sm:w-fit" onClick={onGetStarted}>
                Create Business Account <ArrowUpRight />
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-fit">
                <Link href={ONBOARDING_LINKS.startHere}>
                  Log In <ArrowUpRight />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-fit">
                <Link href={routes.pricing}>
                  Pricing <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] md:justify-self-end">
            <div className="overflow-hidden rounded-2xl border border-black/10 shadow-[0_14px_48px_rgba(37,48,240,0.15)] dark:border-white/10 dark:shadow-[0_14px_48px_rgba(19,225,234,0.08)]">
              <video
                src="https://dj27q01b9pdam.cloudfront.net/SENSE%20PC%2012.mp4"
                controls
                playsInline
                preload="metadata"
                poster="/assets/tutorials/lat-video-12.png"
                className="h-auto w-full"
              />
            </div>
            <p className="mt-2.5 text-center text-xs text-[#454545] dark:text-[#B9C2D5]">
              Watch: Business Onboarding Flow · 1:46
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function QuickLinksSection() {
  return (
    <section className="container my-12 md:my-20">
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden",
          "bg-[#F4F1FF] dark:bg-transparent",
          "dark:bg-[linear-gradient(276.71deg,rgba(128,134,243,0.35)_-194.99%,rgba(3,10,135,0.22)_-40.44%,rgba(186,37,240,0.35)_248.78%)]",
          "p-4 md:p-12",
        )}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-2">
            <p className="font-space-grotesk font-semibold text-2xl md:text-4xl">
              Start fast with the right links
            </p>
            <p className="text-paragraph text-base md:text-lg max-w-2xl">
              If you do not have an account yet, please sign up now-then follow
              the Start Here guide to onboard your team smoothly.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button asChild size="sm">
              <Link href={ONBOARDING_LINKS.signup}>
                Create Business Account <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={ONBOARDING_LINKS.startHere}>
                Log In <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {quickLinks.map(({ title, description, href, Icon }) => (
            <Link
              key={title}
              href={href}
              className={cn(
                "group rounded-2xl p-5 md:p-6",
                "bg-white/70 hover:bg-white transition-colors",
                "dark:bg-white/5 dark:hover:bg-white/10",
                "border border-black/5 dark:border-white/10",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <GradientIcon Icon={Icon} />
                </div>
                <div className="space-y-1">
                  <p className="font-space-grotesk font-semibold text-lg md:text-xl">
                    {title}
                  </p>
                  <p className="text-paragraph text-sm md:text-base">
                    {description}
                  </p>
                  <div className="pt-2 text-sm text-[#2530F0] dark:text-[#B9C2D5] opacity-90 group-hover:opacity-100">
                    Open <ArrowUpRight className="inline size-4 -mt-0.5 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="dark:hidden z-0 absolute -right-64 -bottom-64 size-1/2 w-[568.05px] h-[321.13px] opacity-25 blur-[140px] bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] -rotate-[11.32deg]" />
      </div>
    </section>
  );
}

export function ValuePropsSection() {
  return (
    <section className="relative container my-12 md:my-20">
      <div className="z-0 absolute left-0 right-0 top-0 w-full h-3/4 opacity-10 dark:opacity-100 blur-[200px] bg-[radial-gradient(ellipse_100%_100%_at_50%_100%,#020816_45.67%,#63189D_79.33%,#2530F0_100%)]" />
      <div className="relative space-y-6 md:space-y-12">
        <SectionHeading
          kicker="SensePC for Business"
          title={
            <>
              Onboard your team{" "}
              <span className="bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] bg-clip-text text-transparent">
                in minutes
              </span>
            </>
          }
          subtitle={
            <>
              Give every team member a consistent cloud desktop, manage costs in
              one place, and eliminate local setup friction.
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {valueCards.map(({ title, description, Icon }, index) => (
            <Card
              key={title}
              className={cn(
                "rounded-2xl border border-cyan-400/30 bg-cover bg-center bg-no-repeat",
                "bg-[url('/assets/svg/future-of-computing-card-bg.svg')]",
                "dark:bg-[url('/assets/svg/future-of-computing-card-bg-dark.svg')]",
                "dark:bg-[#010526] dark:shadow-[0px_17px_44px_rgba(2,97,206,0.32)]",
                index !== 1 ? "md:mt-10" : "md:mb-10",
              )}
            >
              <CardContent className="p-0 px-4 py-8 md:px-8 md:py-12">
                <div className="flex flex-col items-start gap-6">
                  <GradientIcon Icon={Icon} />
                  <div className="space-y-2">
                    <p className="font-space-grotesk text-xl md:text-2xl font-bold">
                      {title}
                    </p>
                    <p className="text-paragraph text-base md:text-lg">
                      {description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OnboardingStepsSection() {
  return (
    <section className="container my-12 md:my-20 relative">
      <div className="z-0 hidden dark:block absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 size-1/2 blur-[300px] bg-[#6A00FF]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className={cn(
          "relative rounded-2xl overflow-hidden p-4 md:p-12",
          "bg-[#F5FAFE] dark:bg-transparent",
          "dark:bg-[radial-gradient(70.39%_50.81%_at_35.28%_-15.16%,_rgba(215,94,255,0.22)_0%,_rgba(9,2,51,0.55)_100%)]",
        )}
      >
        <SectionHeading
          kicker="Business onboarding"
          title={
            <>
              What you will accomplish in{" "}
              <span className="text-transparent bg-clip-text bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]">
                30 minutes
              </span>
            </>
          }
          subtitle={
            <>
              Standardize desktops, invite users, and get your organization
              working-without hardware provisioning.
            </>
          }
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {onboardingSteps.map(({ title, bullets, Icon }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={cn(
                "relative rounded-2xl p-5 md:p-6 overflow-hidden",
                "bg-white/70 dark:bg-white/5",
                "border border-black/5 dark:border-white/10",
              )}
            >
              <div className="flex items-start gap-4">
                <GradientIcon Icon={Icon} />
                <div className="space-y-3">
                  <p className="font-space-grotesk font-semibold text-lg md:text-2xl">
                    {title}
                  </p>
                  <ul className="space-y-1.5 text-paragraph text-sm md:text-base">
                    {bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-2 size-1.5 rounded-full bg-[#2530F0]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="dark:hidden z-0 absolute -right-24 -bottom-24 w-[260px] h-[160px] opacity-15 blur-[120px] bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] -rotate-[11.32deg]" />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div
            className={cn(
              "rounded-2xl p-5 md:p-8",
              "bg-white/70 dark:bg-white/5",
              "border border-black/5 dark:border-white/10",
            )}
          >
            <div className="flex items-center gap-3">
              <GradientIcon Icon={Wrench} />
              <p className="font-space-grotesk font-semibold text-lg md:text-2xl">
                Admin setup checklist
              </p>
            </div>
            <ul className="mt-4 space-y-2 text-paragraph text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-[#2530F0]" />
                Choose a standard SensePC config (or tiers)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-[#2530F0]" />
                Fund the wallet and pick a billing plan
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-[#2530F0]" />
                Create pilot PCs and invite users
              </li>
            </ul>
          </div>

          <div
            className={cn(
              "rounded-2xl p-5 md:p-8",
              "bg-white/70 dark:bg-white/5",
              "border border-black/5 dark:border-white/10",
            )}
          >
            <div className="flex items-center gap-3">
              <GradientIcon Icon={Users} />
              <p className="font-space-grotesk font-semibold text-lg md:text-2xl">
                Team member Day-1 checklist
              </p>
            </div>
            <ul className="mt-4 space-y-2 text-paragraph text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-[#2530F0]" />
                Log in and launch your SensePC
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-[#2530F0]" />
                Install tools and sign in to apps
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-[#2530F0]" />
                Use Sense Cloud for project files (optional)
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function TeamOnboardingCtaSection({
  onGetStarted,
}: {
  onGetStarted: () => void;
}) {
  return (
    <GetStartedCTA>
      <h3 className="font-space-grotesk font-semibold text-2xl md:text-5xl">
        Ready to onboard your organization?
      </h3>
      <p className="text-paragraph text-base md:text-xl max-w-3xl mx-auto">
        Launch a pilot in minutes, standardize cloud desktops, and scale without
        hardware limits.
      </p>
      <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button className="w-full sm:w-fit" onClick={onGetStarted}>
          Get Started Now <ArrowUpRight />
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-fit">
          <Link href={ONBOARDING_LINKS.startHere}>
            Log In <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </GetStartedCTA>
  );
}
