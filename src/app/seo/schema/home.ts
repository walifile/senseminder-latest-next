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
      image:
        "https://sensepc.com/_next/image?url=%2Fsensepc-logo-dark.png&w=128&q=75",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        offers: [
          {
            "@type": "Offer",
            name: "Hourly Plan",
            description: "Pay only for the time you use Sense PC.",
          },
          {
            "@type": "Offer",
            name: "Daily Plan",
            description: "Flat daily rate including up to 10 hours of usage.",
          },
          {
            "@type": "Offer",
            name: "Monthly Plan",
            description: "Flat monthly rate including up to 180 hours of usage.",
          },
        ],
      },
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
      logo: "https://sensepc.com/_next/image?url=%2Fsensepc-logo-dark.png&w=128&q=75",
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
      "@type": "FAQPage",
      mainEntity: faqEntities,
    },
    {
      "@type": "WebPage",
      "@id": "https://sensepc.com/#webpage",
      url: "https://sensepc.com/",
      name: homeMeta.title,
      isPartOf: { "@id": "https://sensepc.com/#organization" },
      primaryImageOfPage:
        "https://sensepc.com/_next/image?url=%2Fsensepc-logo-dark.png&w=128&q=75",
      description: homeMeta.description,
    },
  ],
};
