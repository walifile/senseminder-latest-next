import { seoSiteUrl } from "@/app/seo/site-url";

const senseCloudPageUrl = `${seoSiteUrl}/sense-cloud`;

export const senseCloudPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${senseCloudPageUrl}#service`,
      name: "Sense Cloud Intelligent Tier",
      image: `${seoSiteUrl}/sensepc-logo-dark.png`,
      description:
        "Auto-tier cloud storage for Sense PC with secure data handling, simple setup, and usage-based monthly billing.",
      serviceType: "Cloud Storage Service",
      areaServed: "Global",
      provider: {
        "@type": "Organization",
        name: "SensePC",
        url: seoSiteUrl,
      },
      brand: {
        "@type": "Brand",
        name: "Sense PC",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Intelligent Tier",
          url: senseCloudPageUrl,
          description:
            "Auto-tiered monthly billing based on highest storage tier used.",
          availability: "https://schema.org/InStock",
        },
      ],
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Tier Range",
          value: "T-1 (20GB) to T-50 (1000GB)",
        },
        {
          "@type": "PropertyValue",
          name: "Pricing Model",
          value: "Monthly based on highest tier used",
        },
        {
          "@type": "PropertyValue",
          name: "Data Center",
          value: "US East (N. Virginia)",
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${senseCloudPageUrl}#breadcrumb`,
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
          name: "Sense Cloud",
          item: senseCloudPageUrl,
        },
      ],
    },
  ],
};
