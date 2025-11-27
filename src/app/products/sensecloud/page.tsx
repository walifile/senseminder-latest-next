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
  Cloud,
  Globe2,
  Database,
  HardDrive,
  ArrowRight,
  FolderTree,
  RefreshCcw,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const coreFeatures = [
  {
    icon: Cloud,
    title: "Cloud Storage Built for SensePC",
    description:
      "Store project files, media, backups, and workspaces in a storage layer that’s tightly integrated with your SensePC desktops.",
  },
  {
    icon: FolderTree,
    title: "Organized & Searchable",
    description:
      "Keep everything structured by desktops, workspaces, or teams, with metadata and tagging ready for future smart search.",
  },
  {
    icon: HardDrive,
    title: "Elastic Capacity",
    description:
      "Scale from gigabytes to terabytes without migrations or hardware upgrades — SenseCloud expands with your usage.",
  },
  {
    icon: RefreshCcw,
    title: "Versioning & Recovery",
    description:
      "Enable object versioning and recovery workflows so accidental deletes or overwrites don’t have to be disasters.",
  },
];

const howItWorks = [
  {
    step: "Step 1",
    title: "Connect SensePC with SenseCloud",
    description:
      "When you build or manage a SmartPC, simply attach SenseCloud storage and choose your starting capacity and tier.",
  },
  {
    step: "Step 2",
    title: "Store & Sync Your Data",
    description:
      "Save work, assets, and backups directly to SenseCloud from your SensePC or via APIs and integrations.",
  },
  {
    step: "Step 3",
    title: "Scale & Optimize Automatically",
    description:
      "Let usage-based tiers and lifecycle rules optimize cost over time, while you stay focused on your work.",
  },
];

const useCases = [
  {
    title: "Project & Workspace Storage",
    description:
      "Keep each project or team workspace backed by its own storage namespace, with predictable access patterns and cost.",
  },
  {
    title: "Backups & Snapshots",
    description:
      "Use SenseCloud as the backbone for desktop snapshots, file backups, and long-term archives.",
  },
  {
    title: "Media & Asset Libraries",
    description:
      "Store large design files, marketing assets, and media libraries centrally so they’re always available from any SensePC.",
  },
  {
    title: "Data for Analytics & AI",
    description:
      "Give your analytics or AI workloads a consistent place to read from and write to, alongside your SensePC compute.",
  },
];

const pricingHighlights = [
  "Auto-tiered pricing based on your highest usage in the billing window.",
  "Dedicated storage plans for predictable workloads and reserved capacity.",
  "Unified wallet and billing with SensePC, no separate invoices.",
  "Transparent usage history with exportable records for compliance.",
];

const durabilityAvailabilityHighlights = [
  "Backed by highly durable cloud object storage primitives.",
  "Multi-AZ awareness and fault-tolerant design at the platform layer.",
  "Data integrity checks and monitoring for silent corruption risks.",
  "Planned future support for cross-region backup and disaster recovery.",
];

const faqs = [
  {
    question: "What is SenseCloud (SenseStorage)?",
    answer:
      "SenseCloud, also referred to as SenseStorage, is the cloud storage layer behind SensePC. It stores your files, projects, backups, and data with tight integration to your cloud desktops.",
  },
  {
    question: "Do I need SensePC to use SenseCloud?",
    answer:
      "SenseCloud is designed to work best with SensePC, but the long-term vision includes direct access via APIs and integrations for broader workloads.",
  },
  {
    question: "How is SenseCloud billed?",
    answer:
      "Storage is billed based on your usage, auto-tiers, and any dedicated storage plans you enable. All charges are visible in your SensePC wallet and billing history.",
  },
  {
    question: "Is my data encrypted?",
    answer:
      "Yes. Data at rest is encrypted, and access is governed by strict authentication, authorization, and audit-ready logging at the platform level.",
  },
];

const SenseCloudPage = () => (
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
            SenseCloud · SenseStorage for SensePC
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            SenseCloud – Storage That Lives With Your Cloud PCs.
          </h1>

          <p className="text-base md:text-lg text-foreground/90 max-w-2xl leading-relaxed mb-6">
            SenseCloud (SenseStorage) is the cloud storage layer built for
            SensePC. Secure, scalable, and cost-aware — it keeps your files,
            projects, backups, and data right where your cloud desktops live.
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            <Button asChild size="lg">
              <Link href="/build-sensepc">Get Started with SensePC</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/contact">Talk to Our Team</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Designed for SensePC workloads</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Elastic capacity, no hardware</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Auto-tiered billing options</span>
            </div>
          </div>
        </div>

        {/* Hero Side Card */}
        <div className="relative">
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Storage Snapshot
                </p>
                <h3 className="font-semibold text-lg">SenseCloud Volume</h3>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                Storage
              </Badge>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 mb-4">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-muted-foreground">
                  Workspace-Storage-01
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <Globe2 className="h-3 w-3" />
                  Attached to SensePC
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Used</span>
                  <span>320 GB / 1 TB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[32%] bg-primary" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Auto-tiering enabled · monitoring growth and adjusting billing
                  accordingly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-border bg-background/60 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="h-3 w-3 text-primary" />
                  <span className="font-medium text-xs">Performance</span>
                </div>
                <p className="text-muted-foreground">
                  SSD-backed performance tuned for desktop workloads, assets,
                  and project files.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  <span className="font-medium text-xs">Protection</span>
                </div>
                <p className="text-muted-foreground">
                  Encryption, access controls, and versioning support for safer
                  storage.
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
            Why SenseCloud for storage
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
            How SenseCloud works
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
            Built for real data scenarios
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="glass-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-primary" />
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
            SmartStorage pricing & plans
          </h2>
          <p className="text-muted-foreground mb-4 max-w-2xl">
            SenseCloud follows the SensePC billing philosophy: simple,
            transparent, and wallet-driven. Auto-tiered plans help optimize
            cost, while dedicated storage plans give you predictable pricing and
            reserved capacity when you need it.
          </p>

          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs font-semibold text-primary mb-1">
                Auto-Tiered
              </p>
              <p className="text-sm font-medium mb-1">Adaptive billing</p>
              <p className="text-xs text-muted-foreground">
                Monthly billing based on maximum observed usage in the period.
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs font-semibold text-primary mb-1">
                Dedicated Plans
              </p>
              <p className="text-sm font-medium mb-1">Reserved capacity</p>
              <p className="text-xs text-muted-foreground">
                Locked-in capacity and pricing for workloads with predictable
                storage needs.
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs font-semibold text-primary mb-1">
                Unified Billing
              </p>
              <p className="text-sm font-medium mb-1">One wallet, all usage</p>
              <p className="text-xs text-muted-foreground">
                Storage and compute usage flow into a single SensePC wallet and
                invoice history.
              </p>
            </div>
          </div>
        </div>

        <Card className="glass-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-primary" />
              Storage Billing Highlights
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

      {/* Durability & Availability */}
      <section className="mb-16 grid gap-8 lg:grid-cols-[1.1fr,1fr]">
        <Card className="glass-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Durability & Availability
            </CardTitle>
            <CardDescription>
              SenseCloud is designed on top of proven cloud storage building
              blocks, with durability and availability as first-class goals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {durabilityAvailabilityHighlights.map((item) => (
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
              <FolderTree className="h-4 w-4 text-primary" />
              SensePC Integration
            </CardTitle>
            <CardDescription>
              Storage that feels native to your cloud desktops.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              SenseCloud is deeply integrated with SensePC so that your files,
              folders, and backups behave like a natural extension of your cloud
              desktops.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  Attach storage to SmartPCs with clear visibility of size and
                  cost.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  Future-friendly design for snapshots, lifecycle policies, and
                  backup workflows.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  Centralized management across compute and storage from a
                  single dashboard.
                </span>
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
              Ready to store with SenseCloud?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl">
              Explore how SenseCloud can power your files and backups alongside
              your SensePC environments. You can get started today by building a
              SensePC and attaching storage that fits your needs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/build-sensepc">Get Started with SensePC</Link>
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

export default SenseCloudPage;
