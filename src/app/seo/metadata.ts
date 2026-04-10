import type { Metadata } from "next";

import { seoSiteUrl } from "@/app/seo/site-url";

const siteUrl = seoSiteUrl;

export const appMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SensePC",
  description:
    "Design your ideal online PC with Sense PC's cloud desktop builder. Select your configuration and see real-time pricing.",
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const defaultMeta = {
  title: "SensePC",
  description:
    "Design your ideal online PC with Sense PC's cloud desktop builder. Select your configuration and see real-time pricing.",
};

export const homeMeta = {
  metadataBase: new URL(siteUrl),
  title: "Cloud Desktop with Sense PC | Flexible Computing Power",
  description:
    "Unlock powerful cloud desktops with Sense PC. Secure, scalable, and accessible from any device, empowering you to work with flexibility and performance.",
  keywords: [
    "Virtual desktop",
    "Cloud desktop",
    "Remote desktop service",
    "Online pc",
    "Cloud desktop pc",
  ],
};

export const sensePcMeta = {
  title: "Cloud VDI Alternative for Secure Desktop Access | Sense PC",
  description:
    "Discover Sense PC, the cloud-based VDI alternative offering scalable, secure desktop computing from any device. No hardware required, pay for what you use.",
  keywords: [
    "Virtual desktop alternative",
    "Shadow PC alternatives",
    "Cloud personal computer",
    "Secure Remote Desktop",
    "cloud desktop",
    "Cloud PC",
    "Cloud workstation",
    "Desktop cloud computing",
    "cloud pc free trial",
    "cloud PC for gaming ",
    "cloud based pc gaming",
  ],
};

export const senseCloudMeta = {
  title: "Integrated Cloud Storage for Businesses | Sense Cloud",
  description:
    "Experience secure, scalable cloud storage with Sense Cloud. Ideal for businesses, it offers cost-effective storage with seamless integration to Sense PC.",
  keywords: [
    "secure cloud storage",
    "cloud storage for business",
    "cloud storage solution",
    "cloud file management",
    "Scalable Cloud Storage",
  ],
};

export const buildSensePcMeta = {
  title: "Build Your Cloud Workstation, Customizable & Secure | Sense PC",
  description:
    "Easily build your cloud workstation with Sense PC. Customize CPU, memory, and storage to suit your needs, with real-time cost estimation and low-latency access.",
  keywords: [
    "build cloud workstation",
    "custom cloud desktop",
    "cloud pc configuration",
    "virtual desktop pricing",
    "sensepc builder",
  ],
};

export const pricingMeta = {
  title: "Pricing & Plans | Sense PC and Sense Cloud",
  description:
    "Compare Sense PC configurations, billing plans, and Sense Cloud auto-tier storage billing, then check live pricing with the calculator.",
  keywords: [
    "SensePC pricing",
    "SensePC configuration pricing",
    "Sense Cloud pricing",
    "cloud desktop pricing",
    "cloud storage pricing",
    "virtual desktop plans",
  ],
};

export const securityMeta = {
  title: "Security & Trust | Sense PC",
  description:
    "Learn how Sense PC protects desktops and storage with encryption, access controls, monitoring, and security-first operations.",
  keywords: [
    "SensePC security",
    "cloud desktop security",
    "cloud storage security",
    "access controls",
    "data encryption",
  ],
};

export const aboutMeta = {
  title: "Powerful Cloud Desktops with Remote Access | Sense PC",
  description:
    "Experience cloud-first computing with Sense PC. Access high-performance desktops from anywhere, with scalable resources and enterprise-grade security.",
  keywords: [
    "simple cloud computing",
    "reliable cloud computing",
    "secure cloud platform",
    "next generation cloud computing",
    "cloud computing innovation",
    "cloud computing for everyone",
    "accessible cloud computing",
    "scalable cloud computing",
    "privacy-focused cloud platform",
    "cloud computing mission",
    "Sustainable IT Solutions",
  ],
};

export const contactMeta = {
  title: "Contact | Sales and Support",
  description:
    "Talk to SensePC sales or support. Get help choosing a plan, onboarding users, billing, and technical issues.",
  keywords: [
    "SensePC contact",
    "cloud desktop support",
    "sales inquiry",
    "technical support",
    "billing help",
  ],
};

export const faqMeta = {
  title: "FAQ | SensePC Support Questions",
  description:
    "Find SensePC FAQ answers for provisioning, device requirements, latency expectations, billing, refunds, and security questions.",
  keywords: [
    "SensePC support",
    "SensePC FAQ",
    "cloud desktop help",
    "billing and cancellation FAQ",
    "cloud desktop latency",
    "SensePC security FAQ",
  ],
};

export const businessOnboardingMeta = {
  title: "Business Onboarding | Set Up Teams on Sense PC",
  description:
    "Set up your business on Sense PC with guided onboarding for team desktops, billing, user invites, and storage workflows.",
  keywords: [
    "SensePC business onboarding",
    "team onboarding cloud desktops",
    "business virtual desktop setup",
    "cloud desktop team rollout",
    "SensePC business setup",
  ],
};

export const compareWindows365Meta = {
  title: "SensePC vs Windows 365 — Cloud Desktop Comparison",
  description:
    "Compare SensePC and Windows 365 on pricing, setup, flexibility, and cloud storage. See why teams choose SensePC over Microsoft's fixed Cloud PC plans.",
  keywords: [
    "SensePC vs Windows 365",
    "Windows 365 alternative",
    "cloud desktop comparison",
    "Windows 365 pricing",
    "cloud PC without Microsoft account",
    "flexible cloud desktop",
  ],
};

export const compareAmazonWorkspacesMeta = {
  title: "SensePC vs Amazon WorkSpaces — Cloud Desktop Comparison",
  description:
    "Compare SensePC and Amazon WorkSpaces on setup complexity, pricing, and ease of use. See why teams choose SensePC over AWS WorkSpaces for simpler cloud desktops.",
  keywords: [
    "SensePC vs Amazon WorkSpaces",
    "Amazon WorkSpaces alternative",
    "cloud desktop without AWS",
    "WorkSpaces pricing comparison",
    "simple cloud desktop",
    "AWS WorkSpaces vs SensePC",
  ],
};

export const compareCitrixDaaSMeta = {
  title: "SensePC vs Citrix DaaS — Cloud Desktop Comparison",
  description:
    "Compare SensePC and Citrix DaaS on cost, setup complexity, and ease of management. See why growing teams choose SensePC over enterprise Citrix deployments.",
  keywords: [
    "SensePC vs Citrix DaaS",
    "Citrix DaaS alternative",
    "cloud desktop without Citrix",
    "Citrix alternative for small teams",
    "simple DaaS solution",
    "Citrix DaaS pricing comparison",
  ],
};

export const compareShadowPCMeta = {
  title: "SensePC vs Shadow PC — Cloud Desktop Comparison",
  description:
    "Compare SensePC and Shadow PC on pricing, flexibility, and team features. See why professionals and teams choose SensePC over Shadow's fixed monthly subscription.",
  keywords: [
    "SensePC vs Shadow PC",
    "Shadow PC alternative",
    "cloud desktop comparison",
    "Shadow PC pricing",
    "cloud PC for professionals",
    "Shadow PC vs SensePC",
  ],
};

export const compareAzureVirtualDesktopMeta = {
  title: "SensePC vs Azure Virtual Desktop — Cloud Desktop Comparison",
  description:
    "Compare SensePC and Azure Virtual Desktop on setup complexity, pricing, and ease of use. See why teams choose SensePC over Microsoft AVD for simpler cloud desktops.",
  keywords: [
    "SensePC vs Azure Virtual Desktop",
    "Azure Virtual Desktop alternative",
    "AVD alternative",
    "cloud desktop without Azure",
    "Azure VDI comparison",
    "simple Azure Virtual Desktop alternative",
  ],
};

export const compareGoogleCloudWorkstationsMeta = {
  title: "SensePC vs Google Cloud Workstations — Cloud Desktop Comparison",
  description:
    "Compare SensePC and Google Cloud Workstations on setup, pricing, and flexibility. See why teams choose SensePC over GCP Workstations for simpler cloud desktops.",
  keywords: [
    "SensePC vs Google Cloud Workstations",
    "Google Cloud Workstations alternative",
    "cloud desktop without GCP",
    "GCP workstation comparison",
    "cloud desktop for non-developers",
    "Google Cloud Workstations pricing",
  ],
};

export const tutorialsMeta = {
  title: "Tutorials | Learn Sense PC and Sense Cloud",
  description:
    "Browse practical Sense PC and Sense Cloud tutorials for setup, billing, storage, security, and team workflows.",
  keywords: [
    "SensePC tutorials",
    "cloud desktop tutorials",
    "Sense Cloud tutorials",
    "virtual desktop setup guide",
    "SensePC help videos",
  ],
};

export const privacyMeta = {
  title: "Privacy Policy",
  description:
    "Learn how SensePC collects, uses, shares, and protects your personal data across Sense PC and Sense Cloud services.",
  keywords: [
    "SensePC privacy policy",
    "cloud desktop privacy",
    "cloud storage privacy",
    "data protection",
    "user data rights",
  ],
};

export const termsMeta = {
  title: "Terms of Service",
  description:
    "Read the SensePC Terms of Service covering account use, subscriptions, billing, acceptable use, and legal obligations.",
  keywords: [
    "SensePC terms of service",
    "cloud desktop terms",
    "subscription billing terms",
    "acceptable use policy",
    "legal terms",
  ],
};
