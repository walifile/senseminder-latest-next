import { homeMeta } from "@/app/seo/metadata";
import { defaultFaqItems } from "@/app/home/data/faq-data";

const faqEntities = defaultFaqItems.map((item) => ({
  "@type": "Question",
  name: item.question,
  acceptedAnswer: {
    "@type": "Answer",
    text: item.answer,
  },
}));

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://sensepc.com/#software",
      name: "Sense PC",
      url: "https://sensepc.com/",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Windows 10, Windows 11, Linux",
      description:
        "Build a high-performing cloud computer in minutes. Sense PC offers virtual desktops with no hardware needed, featuring low latency, enterprise-grade security, and flexible usage-based billing.",
      image: "https://sensepc.com/sensepc-logo.png",
      offers: [
        {
          "@type": "Offer",
          name: "Hourly Plan",
          url: "https://sensepc.com/",
          description: "Usage-based pricing while instance is running.",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Daily Plan",
          url: "https://sensepc.com/",
          description: "Usage-based pricing based on selected configuration and runtime.",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Monthly Plan",
          url: "https://sensepc.com/",
          description: "Usage-based pricing based on selected configuration and runtime.",
          availability: "https://schema.org/InStock",
        },
      ],
      featureList: [
        "Cloud-based Virtual Desktop",
        "Scalable GPU/CPU and RAM",
        "Built-in Security & Encryption",
        "99.9% Uptime SLA",
        "Remote collaboration tools",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://sensepc.com/#organization",
      name: "Sense PC",
      url: "https://sensepc.com/",
      logo: "https://sensepc.com/sensepc-logo.png",
      sameAs: [
        "https://www.linkedin.com/company/sensepcofficial/",
        "https://x.com/sensepcofficial/",
        "https://www.instagram.com/sensepcofficial/",
        "https://www.facebook.com/officialsensepc/",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://sensepc.com/contact",
      },
    },
    {
      "@type": "SiteNavigationElement",
      "@id": "https://sensepc.com/#nav-login",
      name: "LogIn",
      url: "https://sensepc.com/auth",
    },
    {
      "@type": "SiteNavigationElement",
      "@id": "https://sensepc.com/#nav-sensepc-pro",
      name: "Sense PC Pro",
      url: "https://sensepc.com/products/sensepc",
    },
    {
      "@type": "SiteNavigationElement",
      "@id": "https://sensepc.com/#nav-build-sensepc",
      name: "Build Sense PC",
      url: "https://sensepc.com/build-sensepc",
    },
    {
      "@type": "SiteNavigationElement",
      "@id": "https://sensepc.com/#nav-tutorials",
      name: "Tutorials",
      url: "https://sensepc.com/tutorials",
    },
    {
      "@type": "SiteNavigationElement",
      "@id": "https://sensepc.com/#nav-how-to-start",
      name: "How to start",
      url: "https://sensepc.com/tutorials",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqEntities,
    },
    {
      "@type": "WebPage",
      "@id": "https://sensepc.com/#webpage",
      url: "https://sensepc.com/",
      name: homeMeta.title,
      isPartOf: { "@id": "https://sensepc.com/#organization" },
      primaryImageOfPage: "https://sensepc.com/sensepc-logo.png",
      description: homeMeta.description,
    },
  ],
};
