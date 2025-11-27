"use client";

import React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import {
  Cpu,
  Zap,
  Cloud,
  Users,
  Globe2,
  Wallet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MonitorSmartphone,
} from "lucide-react";

const coreFeatures = [
  {
    icon: Cpu,
    title: "Cloud PCs in Minutes",
    description:
      "Spin up a high-performance Windows or Linux desktop in just a few clicks. No hardware to buy, no drivers to manage.",
  },
  {
    icon: MonitorSmartphone,
    title: "Access from Any Device",
    description:
      "Use your laptop, tablet, or even a basic machine to connect to your SensePC — your real work happens in the cloud.",
  },
  {
    icon: Wallet,
    title: "Pay Only for What You Use",
    description:
      "Hourly, daily, and monthly plans with transparent billing and wallet-based payments designed for real-world usage.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "Isolated cloud desktops, encrypted storage, strict access controls, and audit-friendly logs built in from day one.",
  },
];

const howItWorks = [
  {
    step: "Step 1",
    title: "Build Your SmartPC",
    description:
      "Choose CPU, memory, storage, and OS. Set schedules and idle timeout so your SensePC fits your lifestyle and budget.",
  },
  {
    step: "Step 2",
    title: "Connect in Seconds",
    description:
      "Launch directly from the browser with our remote desktop viewer. Your apps, files, and sessions stay in the cloud.",
  },
  {
    step: "Step 3",
    title: "Scale as You Grow",
    description:
      "Upgrade, pause, or create new SensePCs as your needs evolve. Perfect for individuals, teams, or entire organizations.",
  },
];

const useCases = [
  {
    title: "Remote Work & Freelancers",
    description:
      "Carry your powerful work desktop in the cloud — not in your backpack. Log in from anywhere and pick up exactly where you left off.",
  },
  {
    title: "Teams & Small Businesses",
    description:
      "Standardize desktops for your team, control costs centrally, and onboard new members in minutes, not weeks.",
  },
  {
    title: "Developers & Builders",
    description:
      "Spin up dev-ready environments with the tools you need, without worrying about local specs or OS conflicts.",
  },
  {
    title: "Students & Learners",
    description:
      "Use demanding software and tools from any affordable device, without needing a high-end laptop.",
  },
];

const pricingHighlights = [
  "Hourly, daily, and monthly plans with wallet-based billing.",
  "Transparent usage history and exportable billing records.",
  "Auto-renew options for long-running desktops.",
  "SmartStorage billing for cloud file storage alongside your SensePC.",
];

const securityHighlights = [
  "Isolated cloud desktops per user / instance.",
  "Encrypted storage for your SmartPC volumes.",
  "Fine-grained access control and audit-ready logging.",
  "Session-based access and controlled entry points.",
];

const faqs = [
  {
    question: "What is SensePC?",
    answer:
      "SensePC is a cloud desktop platform that lets you run a full computer in the cloud and access it securely from any compatible device.",
  },
  {
    question: "Do I need powerful hardware to use SensePC?",
    answer:
      "No. Your local device only needs a stable internet connection and a modern browser. All heavy lifting happens in the cloud.",
  },
  {
    question: "Can I use SensePC for my team or company?",
    answer:
      "Yes. SensePC is designed for both individuals and teams, with centralized billing, access control, and admin-friendly dashboards.",
  },
  {
    question: "How does billing work?",
    answer:
      "You recharge your wallet and choose hourly, daily, or monthly plans per SmartPC. Storage is billed based on usage and selected tiers.",
  },
];

const SensePCPage = () => (
  <main className="flex-grow pt-24 pb-16">
    <div className="container mx-auto px-4 md:px-6">
      {/* Breadcrumb */}
      <div className="mb-8 mt-4">
        <Link
          href="/products"
          className="text-primary hover:text-primary/80 flex items-center text-sm"
        >
          <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
          Back to Products
        </Link>
      </div>

      {/* Hero Section */}
      <section className="grid gap-10 lg:grid-cols-[1.4fr,1fr] items-center mb-16">
        <div>
          <Badge variant="outline" className="mb-4 rounded-full px-3 py-1">
            SensePC · Cloud Desktop by SenseMinder
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            SensePC – Your Cloud Computer, Anywhere.
          </h1>

          <p className="text-base md:text-lg text-foreground/90 max-w-2xl leading-relaxed mb-6">
            Spin up secure, high-performance cloud desktops in minutes. Work,
            create, and play from any device — while SensePC handles the
            hardware, security, and uptime behind the scenes.
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            <Button asChild size="lg">
              <Link href="/build-sensepc">Start Building Your SensePC</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/contact">Talk to Our Team</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No long-term contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Pay only for what you use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Secure, cloud-first by design</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Live Preview
                </p>
                <h3 className="font-semibold text-lg">Your SensePC</h3>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe2 className="h-3 w-3" />
                Cloud Desktop
              </Badge>
            </div>

            <div className="relative mb-4 rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border text-xs text-muted-foreground">
                <span>SensePC-Workspace</span>
                <span>Connected · 12 ms</span>
              </div>
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Cpu className="h-10 w-10" />
                  <p className="text-sm text-muted-foreground">
                    Stream a full desktop from the cloud — instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-border bg-background/60 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="font-medium text-xs">Performance</span>
                </div>
                <p className="text-muted-foreground">
                  Scalable CPU, RAM, and SSD tuned for your workloads.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  <span className="font-medium text-xs">Security</span>
                </div>
                <p className="text-muted-foreground">
                  Encrypted storage and controlled entry points, by default.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Why teams choose SensePC
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {coreFeatures.map((feature) => (
            <Card key={feature.title} className="glass-card h-full">
              <CardHeader className="pb-3">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            How SensePC works
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {howItWorks.map((item) => (
            <Card key={item.title} className="glass-card h-full">
              <CardHeader className="pb-2">
                <p className="text-xs uppercase tracking-wide text-primary mb-1">
                  {item.step}
                </p>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Designed for real-world use
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="glass-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  {useCase.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{useCase.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing & Billing Overview */}
      <section className="mb-16 grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <div className="glass-card rounded-xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Flexible plans & smart billing
          </h2>
          <p className="text-muted-foreground mb-4 max-w-2xl">
            SensePC is built around transparent, wallet-driven billing. You
            choose how each SmartPC is billed — hourly, daily, or monthly — and
            you always see where your balance is going.
          </p>

          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs font-semibold text-primary mb-1">Hourly</p>
              <p className="text-sm font-medium mb-1">On-demand compute</p>
              <p className="text-xs text-muted-foreground">
                Ideal for bursty workloads, experiments, or occasional access.
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs font-semibold text-primary mb-1">Daily</p>
              <p className="text-sm font-medium mb-1">Frequent usage</p>
              <p className="text-xs text-muted-foreground">
                Great for regular workdays and predictable schedules.
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs font-semibold text-primary mb-1">Monthly</p>
              <p className="text-sm font-medium mb-1">Always-on desktops</p>
              <p className="text-xs text-muted-foreground">
                Perfect for primary workstations and long-running setups.
              </p>
            </div>
          </div>
        </div>

        <Card className="glass-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-primary" />
              Billing Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {pricingHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Security & Reliability */}
      <section className="mb-16 grid gap-8 lg:grid-cols-[1.1fr,1fr]">
        <Card className="glass-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Security & Reliability
            </CardTitle>
            <CardDescription>
              SensePC is built with security and control at the core — not as an
              afterthought.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {securityHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cloud className="h-4 w-4 text-primary" />
              SenseStorage Integration
            </CardTitle>
            <CardDescription>
              Your desktops and your storage, managed together.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              SensePC works hand-in-hand with SenseStorage so your files,
              backups, and project data follow you between sessions.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  SmartStorage tiers that adapt to your usage patterns.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Seamless access from your SensePC desktops.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Centralized billing for compute and storage.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-border bg-background/60 p-4 md:p-5"
            >
              <p className="font-medium mb-1">{item.question}</p>
              <p className="text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mb-6">
        <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Ready to experience SensePC?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl">
              Build your first cloud desktop in minutes — or reach out to us to
              design a rollout plan for your team or organization.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/build-sensepc">Build a SensePC</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  </main>
);

export default SensePCPage;
