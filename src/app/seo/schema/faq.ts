import { seoSiteUrl } from "@/app/seo/site-url";
import { faqItems, faqAnswerToPlainText } from "@/app/faq/_data/faq-content";

const faqUrl = `${seoSiteUrl}/faq`;

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["WebPage", "HelpPage"],
      "@id": `${faqUrl}#webpage`,
      name: "FAQ | SensePC Support Questions",
      url: faqUrl,
      description:
        "Browse the SensePC knowledge base for answers about setup, access, connection, performance, plans, billing, refunds, security, team access, and troubleshooting.",
      inLanguage: "en-US",
      isPartOf: {
        "@type": "WebSite",
        name: "SensePC",
        url: seoSiteUrl,
      },
      mainEntity: {
        "@id": `${faqUrl}#faq`,
      },
      breadcrumb: {
        "@id": `${faqUrl}#breadcrumb`,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${faqUrl}#faq`,
      url: faqUrl,
      mainEntity: faqItems.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faqAnswerToPlainText(faq.answer),
        },
      })),
    },
    {
      "@type": "Organization",
      "@id": `${seoSiteUrl}#organization`,
      name: "SensePC",
      url: seoSiteUrl,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contact@sensepc.com",
        availableLanguage: ["en"],
        url: `${seoSiteUrl}/support`,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${faqUrl}#breadcrumb`,
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
          name: "FAQ",
          item: faqUrl,
        },
      ],
    },
  ],
};