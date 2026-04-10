import type { UseCaseSlug } from "@/app/use-cases/_data/use-cases-content";

import { seoSiteUrl } from "@/app/seo/site-url";
import { getUseCaseContent } from "@/app/use-cases/_data/use-cases-content";

export function buildUseCaseJsonLd(slug: UseCaseSlug) {
  const content = getUseCaseContent(slug);
  const pageUrl = `${seoSiteUrl}${content.canonicalPath}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: content.title,
        url: pageUrl,
        description: content.description,
        inLanguage: "en-US",
        isPartOf: {
          "@type": "WebSite",
          name: "SensePC",
          url: seoSiteUrl,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: content.faqItems.map((faq) => ({
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
            name: content.label,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
