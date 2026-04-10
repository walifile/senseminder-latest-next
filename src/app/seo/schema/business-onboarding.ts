import { seoSiteUrl } from "@/app/seo/site-url";

const businessOnboardingUrl = `${seoSiteUrl}/business/onboarding`;

export const businessOnboardingJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${businessOnboardingUrl}#webpage`,
      name: "Business Onboarding | Set Up Teams on Sense PC",
      url: businessOnboardingUrl,
      description:
        "Set up your business on Sense PC with guided onboarding for team desktops, billing, user invites, and storage workflows.",
      inLanguage: "en-US",
      isPartOf: {
        "@type": "WebSite",
        name: "SensePC",
        url: seoSiteUrl,
      },
      mainEntity: {
        "@type": "ItemList",
        name: "Business Onboarding Checklist",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Set up your organization",
            description:
              "Create your workspace, add billing, and define a standard desktop configuration.",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Create your first SensePCs",
            description:
              "Launch pilot desktops and keep device configurations consistent for your team.",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Invite users and assign access",
            description:
              "Add teammates, assign desktops, and go live without local hardware provisioning.",
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Add Sense Cloud for files",
            description:
              "Organize shared files and scale storage under the same billing workflow.",
          },
        ],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${businessOnboardingUrl}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Can my team install our software?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. SensePC works like a full desktop environment, so your team can install and run the tools they need.",
          },
        },
        {
          "@type": "Question",
          name: "Do we need powerful laptops to use it?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "No. A stable internet connection and a modern browser are enough for most workflows.",
          },
        },
        {
          "@type": "Question",
          name: "Is Sense Cloud required?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "No. Sense Cloud is optional, but it is the simplest way to store and organize files for SensePC workflows.",
          },
        },
        {
          "@type": "Question",
          name: "How does billing work for organizations?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Organizations fund one wallet and choose hourly, daily, or monthly billing for SensePC, while storage is tracked in the same billing history.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${businessOnboardingUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${seoSiteUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Business Onboarding",
          item: businessOnboardingUrl,
        },
      ],
    },
  ],
};
