export const buildSensePcJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "Sense PC Custom Cloud Desktop",
      image:
        "https://sensepc.com/_next/image?url=%2Fsensepc-logo-dark.png&w=128&q=75",
      description:
        "Customizable high-performing cloud computer. Configure your virtual machine with Windows 11, Windows 10, or Linux, up to 16 Cores, 64GB RAM, and 1000GB SSD storage.",
      sku: "SENSE-PC-CONFIG",
      brand: {
        "@type": "Brand",
        name: "Sense PC",
      },
      offers: {
        "@type": "AggregateOffer",
        url: "https://sensepc.com/build-sensepc",
        priceCurrency: "USD",
        lowPrice: "0.00",
        highPrice: "1000.00",
        offerCount: "6",
        availability: "https://schema.org/InStock",
        offers: [
          {
            "@type": "Offer",
            name: "SensePC.Ultra11 - 16 Cores, 64GB RAM, GPU",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "SensePC.Pro11 - 8 Cores, 32GB RAM",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "SensePC.Standard11 - 4 Cores, 16GB RAM",
            availability: "https://schema.org/InStock",
          },
        ],
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Storage Options",
          value: "220GB to 1000GB SSD",
        },
        {
          "@type": "PropertyValue",
          name: "Region",
          value: "East Coast",
        },
        {
          "@type": "PropertyValue",
          name: "Billing Plans",
          value: "Hourly, Daily, Monthly",
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
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
          name: "Build Sense PC",
          item: "https://sensepc.com/build-sensepc",
        },
      ],
    },
  ],
};
