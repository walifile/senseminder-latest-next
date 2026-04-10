import { seoSiteUrl } from "@/app/seo/site-url";

const securityPageUrl = `${seoSiteUrl}/security`;

export const securityJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${securityPageUrl}#webpage`,
      name: "Security & Trust | Sense PC",
      url: securityPageUrl,
      description:
        "Learn how Sense PC protects desktops and storage with encryption, access controls, monitoring, and security-first operations.",
      inLanguage: "en-US",
      isPartOf: {
        "@type": "WebSite",
        name: "SensePC",
        url: seoSiteUrl,
      },
      mainEntity: {
        "@type": "ItemList",
        name: "Security Controls",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Encryption",
            description:
              "Data protection in transit and at rest using modern encryption controls.",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Access Management",
            description:
              "Role-aware permissions and account-level controls for safer access.",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Monitoring",
            description:
              "Continuous platform monitoring and logs to help detect unusual activity.",
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Operational Security",
            description:
              "Security-focused operations and platform safeguards across Sense PC services.",
          },
        ],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${securityPageUrl}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How is data protected on Sense PC?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Sense PC uses layered controls designed to help protect data in transit and at rest across desktop and storage workflows.",
          },
        },
        {
          "@type": "Question",
          name: "Can I manage team access securely?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. You can manage account-level access and user permissions to align with your internal security policies.",
          },
        },
        {
          "@type": "Question",
          name: "Do you monitor for suspicious activity?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. Sense PC uses platform monitoring and logs to help identify unusual behavior and support response workflows.",
          },
        },
        {
          "@type": "Question",
          name: "Where can I report a security concern?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Please contact our team through the Contact page and include relevant details so we can review the issue quickly.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${securityPageUrl}#breadcrumb`,
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
          name: "Security",
          item: securityPageUrl,
        },
      ],
    },
  ],
};
