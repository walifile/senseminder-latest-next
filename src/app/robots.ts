import type { MetadataRoute } from "next";

import appConfig from "@/config/app-config";

const { AUTH_REDIRECT_URL } = appConfig;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${AUTH_REDIRECT_URL}/sitemap.xml`,
  };
}
