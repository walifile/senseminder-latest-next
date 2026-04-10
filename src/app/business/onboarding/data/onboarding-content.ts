import type { ElementType } from "react";
import type { FAQItem } from "@/app/home/data/faq-data";

import { routes } from "@/constants/routes";

import {
  Clock,
  Users,
  Layers,
  Wallet,
  LifeBuoy,
  Building2,
  BadgeCheck,
  ShieldCheck,
  FolderClosed,
} from "lucide-react";

type OnboardingCard = {
  title: string;
  description: string;
  href: string;
  Icon: ElementType;
};

type ValueCard = {
  title: string;
  description: string;
  Icon: ElementType;
};

type OnboardingStep = {
  title: string;
  bullets: string[];
  Icon: ElementType;
};

export const ONBOARDING_LINKS = {
  signup: routes.businessSignUp,
  startHere: routes.tutorials,
  contactSales: routes.contact,
  senseCloud: routes.smartStorage,
} as const;

export const quickLinks: OnboardingCard[] = [
  {
    title: "Sign up",
    description: "Create your business workspace and start a pilot.",
    href: ONBOARDING_LINKS.signup,
    Icon: BadgeCheck,
  },
  {
    title: "Start here",
    description: "Follow the onboarding guide step-by-step.",
    href: ONBOARDING_LINKS.startHere,
    Icon: LifeBuoy,
  },
  {
    title: "Sense Cloud",
    description: "A simple file system to store and organize your data.",
    href: ONBOARDING_LINKS.senseCloud,
    Icon: FolderClosed,
  },
  {
    title: "Contact sales",
    description: "Talk to us about team rollout, use cases, and support.",
    href: ONBOARDING_LINKS.contactSales,
    Icon: Users,
  },
];

export const valueCards: ValueCard[] = [
  {
    title: "Security & control",
    description:
      "Isolated desktops per user, encrypted storage, and business-friendly controls-built in.",
    Icon: ShieldCheck,
  },
  {
    title: "Simple billing for teams",
    description:
      "Fund one wallet and run hourly, daily, or monthly-transparent tracking across the organization.",
    Icon: Wallet,
  },
  {
    title: "Fast onboarding",
    description:
      "Standardize environments and onboard new hires in minutes-no imaging, no shipping, no local setup headaches.",
    Icon: Clock,
  },
];

export const onboardingSteps: OnboardingStep[] = [
  {
    title: "1) Set up your organization",
    Icon: Building2,
    bullets: [
      "Create your workspace",
      "Add billing method and fund the wallet",
      "Pick a standard configuration (or tiers)",
    ],
  },
  {
    title: "2) Create your first SensePCs",
    Icon: Layers,
    bullets: [
      "Start with a small pilot (3-10 users)",
      "Launch role-based desktops (Standard / Pro / GPU)",
      "Keep configs consistent for smoother onboarding",
    ],
  },
  {
    title: "3) Invite users and assign access",
    Icon: Users,
    bullets: [
      "Invite teammates and set access",
      "Assign SensePCs to users",
      "Go live without hardware provisioning",
    ],
  },
  {
    title: "4) Add Sense Cloud for files",
    Icon: FolderClosed,
    bullets: [
      "Keep work files organized and accessible",
      "Scale storage as your team grows",
      "Use the same wallet for compute + storage",
    ],
  },
];

export const businessFaqItems: FAQItem[] = [
  {
    question: "Can my team install our software?",
    answer:
      "Yes. SensePC works like a full desktop environment-install and run the tools you need.",
  },
  {
    question: "Do we need powerful laptops to use it?",
    answer:
      "No. A stable internet connection and a modern browser is enough for most workflows.",
  },
  {
    question: "Is Sense Cloud required?",
    answer:
      "No-but it is the easiest way to store and organize files for your SensePC workflows.",
  },
  {
    question: "How does billing work for organizations?",
    answer:
      "Fund one wallet. Choose hourly, daily, or monthly for SensePC. Storage is tracked under the same billing history.",
  },
];
