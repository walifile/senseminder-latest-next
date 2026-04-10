export const sensePcJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://sensepc.com/products/sensepc#product",
      name: "SensePC Cloud Desktop",
      image: "https://sensepc.com/sensepc-logo-dark.png",
      description:
        "High-performing cloud workstation with 12ms latency, scalable CPU/RAM, and encrypted storage. Built for developers, remote teams, and students to work from any device.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Windows 10, Windows 11, Linux",
      brand: {
        "@type": "Brand",
        name: "Sense PC",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Hourly Plan",
          url: "https://sensepc.com/products/sensepc",
          description: "Usage-based pricing while instance is running.",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Daily Plan",
          url: "https://sensepc.com/products/sensepc",
          description: "Usage-based pricing based on selected configuration and runtime.",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Monthly Plan",
          url: "https://sensepc.com/products/sensepc",
          description: "Usage-based pricing based on selected configuration and runtime.",
          availability: "https://schema.org/InStock",
        },
      ],
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
          name: "SensePC",
          item: "https://sensepc.com/products/sensepc",
        },
      ],
    },
  ],
};
