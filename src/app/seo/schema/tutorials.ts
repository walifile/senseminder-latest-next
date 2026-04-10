import { tutorials } from "@/constants/tutorials";

const tutorialsUrl = "https://sensepc.com/tutorials";

export const tutorialsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${tutorialsUrl}#collection`,
      name: "Sense PC and Sense Cloud Tutorials",
      url: tutorialsUrl,
      description:
        "Step-by-step tutorial videos for Sense PC and Sense Cloud covering setup, billing, security, storage, and daily workflows.",
      inLanguage: "en-US",
      isPartOf: {
        "@type": "WebSite",
        name: "SensePC",
        url: "https://sensepc.com",
      },
      mainEntity: {
        "@type": "ItemList",
        name: "Tutorial Library",
        numberOfItems: tutorials.length,
        itemListElement: tutorials.map((tutorial, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: tutorialsUrl,
          item: {
            "@type": "VideoObject",
            name: tutorial.title,
            description: tutorial.description,
            contentUrl: tutorial.videoUrl,
            thumbnailUrl: `https://sensepc.com${tutorial.thumbnail}`,
            uploadDate: tutorial.uploadDate,
          },
        })),
      },
    },
  ],
};
