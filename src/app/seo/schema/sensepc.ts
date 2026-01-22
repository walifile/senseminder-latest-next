export const sensePcJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": "https://sensepc.com/products/sensepc#product",
      name: "SensePC Cloud Desktop",
      image:
        "https://sensepc.com/_next/image?url=%2Fsensepc-logo-dark.png&w=128&q=75",
      description:
        "High-performing cloud workstation with 12ms latency, scalable CPU/RAM, and encrypted storage. Built for developers, remote teams, and students to work from any device.",
      brand: {
        "@type": "Brand",
        name: "Sense PC",
      },
      sku: "SPC-CLOUD-DT-2026",
      offers: {
        "@type": "AggregateOffer",
        url: "https://sensepc.com/products/sensepc",
        priceCurrency: "USD",
        lowPrice: "0.00",
        highPrice: "1000.00",
        offerCount: "3",
        availability: "https://schema.org/InStock",
        offers: [
          {
            "@type": "Offer",
            name: "Hourly Plan",
            description: "Pay per hour while running. SSD storage continues while stopped.",
          },
          {
            "@type": "Offer",
            name: "Daily Plan",
            description: "Flat daily rate with up to 10 hours/day included.",
          },
          {
            "@type": "Offer",
            name: "Monthly Plan",
            description: "Flat monthly rate with up to 180 hours/month included.",
          },
        ],
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "150",
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Latency",
          value: "12 ms",
        },
        {
          "@type": "PropertyValue",
          name: "OS Options",
          value: "Windows 10, Windows 11, Linux",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://sensepc.com/products/sensepc#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is SensePC?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "SensePC is a cloud-native workstation that allows you to stream a full desktop instantly from any browser. It handles speed and security in the background so you can work confidently from any device.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need powerful hardware to use it?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "No. You only need a stable internet connection and a modern browser. SensePC handles the heavy computing, allowing you to run demanding software even on budget or low-spec devices.",
          },
        },
        {
          "@type": "Question",
          name: "Can teams use SensePC?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes, teams and small businesses use SensePC to give every member a consistent desktop, manage costs from one place, and onboard new users in minutes without shipping hardware.",
          },
        },
        {
          "@type": "Question",
          name: "How does billing work?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "SensePC uses a wallet-based system. You add funds and choose between Hourly (pay for what you use), Daily (up to 10 hours), or Monthly (up to 180 hours) plans.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://sensepc.com/products/sensepc#breadcrumb",
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
          name: "SensePC",
          item: "https://sensepc.com/products/sensepc",
        },
      ],
    },
  ],
};
