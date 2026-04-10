import { seoSiteUrl } from "@/app/seo/site-url";

const buildSensePcPageUrl = `${seoSiteUrl}/build-sensepc`;

export const buildSensePcJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${buildSensePcPageUrl}#software`,
      name: "Sense PC Custom Cloud Desktop",
      image: `${seoSiteUrl}/sensepc-logo-dark.png`,
      description:
        "Customizable high-performing cloud computer. Configure your virtual machine with Windows 11, Windows 10, or Linux, up to 16 Cores, 64GB RAM, and 1000GB SSD storage.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Windows 10, Windows 11, Linux",
      brand: {
        "@type": "Brand",
        name: "Sense PC",
      },
      offers: [
        {
          "@type": "Offer",
          name: "SensePC.Ultra11 - 16 Cores, 64GB RAM, GPU",
          url: buildSensePcPageUrl,
          description:
            "Usage-based pricing based on selected resources and runtime.",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "SensePC.Pro11 - 8 Cores, 32GB RAM",
          url: buildSensePcPageUrl,
          description:
            "Usage-based pricing based on selected resources and runtime.",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "SensePC.Standard11 - 4 Cores, 16GB RAM",
          url: buildSensePcPageUrl,
          description:
            "Usage-based pricing based on selected resources and runtime.",
          availability: "https://schema.org/InStock",
        },
      ],
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
      "@id": `${buildSensePcPageUrl}#breadcrumb`,
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
          name: "Build Sense PC",
          item: buildSensePcPageUrl,
        },
      ],
    },
  ],
};
