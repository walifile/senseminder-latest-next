export const senseCloudJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": "https://sensepc.com/products/sensecloud#product",
      name: "Sense Cloud Storage",
      image:
        "https://sensepc.com/_next/image?url=%2Fsensepc-logo-dark.png&w=128&q=75",
      description:
        "Secure, scalable, and cost-aware cloud storage built for Sense PC. Features auto-tiering, encrypted volumes, and seamless integration with Sense PC virtual desktops.",
      brand: {
        "@type": "Brand",
        name: "Sense PC",
      },
      sku: "SENSECLOUD-STORAGE-001",
      offers: {
        "@type": "AggregateOffer",
        url: "https://sensepc.com/products/sensecloud",
        priceCurrency: "USD",
        lowPrice: "0.00",
        highPrice: "500.00",
        offerCount: "2",
        availability: "https://schema.org/InStock",
        offers: [
          {
            "@type": "Offer",
            name: "Auto-Tiered Plan",
            description:
              "Adaptive billing based on highest storage usage during the period.",
          },
          {
            "@type": "Offer",
            name: "Dedicated Plans",
            description:
              "Reserved capacity with consistent pricing for stable workloads.",
          },
        ],
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "95",
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Feature",
          value: "Auto-tiering and Elasticity",
        },
        {
          "@type": "PropertyValue",
          name: "Security",
          value: "Encryption, access controls, and data redundancy",
        },
        {
          "@type": "PropertyValue",
          name: "Integration",
          value: "Native to Sense PC environment",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://sensepc.com/products/sensecloud#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Sense Cloud?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Sense Cloud is a secure, scalable, and cost-aware storage solution built specifically for Sense PC. It allows businesses to set up cloud storage in minutes and stay productive across devices.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need Sense PC to use Sense Cloud?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Right now, Sense Cloud works best when used with Sense PC. In the future, you'll also be able to use it directly with other tools and apps.",
          },
        },
        {
          "@type": "Question",
          name: "How is Sense Cloud billed?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Sense Cloud uses a unified, wallet-based billing system. Pricing is either auto-tiered (reflecting highest usage) or based on dedicated reserved capacity plans.",
          },
        },
        {
          "@type": "Question",
          name: "Is my data encrypted?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. Sense Cloud is built with security at its core, featuring encrypted volumes, access controls, and built-in data redundancy to keep your files safe.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://sensepc.com/products/sensecloud#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://sensepc.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: "https://sensepc.com/products/sensepc",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Sense Cloud",
          item: "https://sensepc.com/products/sensecloud",
        },
      ],
    },
  ],
};
