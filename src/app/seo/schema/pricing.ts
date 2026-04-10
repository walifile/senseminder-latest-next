import { seoSiteUrl } from "@/app/seo/site-url";

const pricingPageUrl = `${seoSiteUrl}/pricing`;

export const pricingJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${pricingPageUrl}#webpage`,
      name: "Pricing & Plans | Sense PC and Sense Cloud",
      url: pricingPageUrl,
      description:
        "Compare Sense PC configuration billing options and Sense Cloud auto-tier storage billing. Final charges are based on usage shown in the billing dashboard.",
      inLanguage: "en-US",
      isPartOf: {
        "@type": "WebSite",
        name: "SensePC",
        url: seoSiteUrl,
      },
      mainEntity: {
        "@type": "OfferCatalog",
        name: "SensePC Pricing Catalog",
        itemListElement: [
          {
            "@type": "Offer",
            name: "SensePC.Standard11-4Cores.16GBRAM",
            url: pricingPageUrl,
            description:
              "Sense PC configuration with 4 cores and 16GB RAM. Live pricing is shown in calculator and billing dashboard.",
          },
          {
            "@type": "Offer",
            name: "SensePC.Pro11-8Cores.32GBRAM",
            url: pricingPageUrl,
            description:
              "Sense PC configuration with 8 cores and 32GB RAM. Live pricing is shown in calculator and billing dashboard.",
          },
          {
            "@type": "Offer",
            name: "SensePC.Pro11-8Cores.32GBRAM.GPU",
            url: pricingPageUrl,
            description:
              "Sense PC configuration with GPU for accelerated workloads. Live pricing is shown in calculator and billing dashboard.",
          },
          {
            "@type": "Offer",
            name: "SensePC.Ultra11-16Cores.64GBRAM.GPU",
            url: pricingPageUrl,
            description:
              "High-capacity Sense PC configuration with GPU. Live pricing is shown in calculator and billing dashboard.",
          },
          {
            "@type": "Offer",
            name: "Sense Cloud Auto-Tier Billing",
            url: pricingPageUrl,
            description:
              "Storage tier is calculated automatically from highest monthly usage between T-1 (20GB) and T-50 (1000GB).",
          },
        ],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${pricingPageUrl}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How does Sense PC billing work?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Sense PC offers Hourly, Daily, and Monthly plans. You can choose a plan for each machine based on expected usage.",
          },
        },
        {
          "@type": "Question",
          name: "Can I change plans later?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. You can update plan selection as your workload changes, based on the options available in your account.",
          },
        },
        {
          "@type": "Question",
          name: "How is Sense Cloud storage billed?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Sense Cloud billing is auto-tiered. The final tier is calculated from your highest monthly usage and shown in the billing dashboard.",
          },
        },
        {
          "@type": "Question",
          name: "Where can I track my charges?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "You can review usage history and charge details from your account billing section.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pricingPageUrl}#breadcrumb`,
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
          name: "Pricing",
          item: pricingPageUrl,
        },
      ],
    },
  ],
};
