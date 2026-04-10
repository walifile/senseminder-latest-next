import { seoSiteUrl } from "@/app/seo/site-url";
import { type ComparisonData } from "@/app/compare/_data/comparisons";

export function makeCompareJsonLd(data: ComparisonData) {
  const pageUrl = `${seoSiteUrl}/compare/${data.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: data.meta.title,
        url: pageUrl,
        description: data.meta.description,
        inLanguage: "en-US",
        isPartOf: {
          "@type": "WebSite",
          name: "SensePC",
          url: seoSiteUrl,
        },
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`,
        },
        mainEntity: {
          "@id": `${pageUrl}#faq`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: data.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
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
            name: "Compare",
            item: `${seoSiteUrl}/compare`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: data.headline,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
