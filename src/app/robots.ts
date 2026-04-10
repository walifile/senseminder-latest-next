import type { MetadataRoute } from "next";

import { seoSiteUrl } from "@/app/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/pc-viewer", "/sense-cloud"],
    },
    sitemap: [`${seoSiteUrl}/sitemap.xml`],
  };
}
