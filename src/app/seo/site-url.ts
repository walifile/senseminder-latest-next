import appConfig from "@/config/app-config";

const FALLBACK_SITE_URL = "https://sensepc.com";

function normalizeSiteUrl(rawUrl: string): string {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) {
    return FALLBACK_SITE_URL;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(trimmedUrl)
      ? trimmedUrl
      : `https://${trimmedUrl}`;
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

const rawSeoSiteUrl = appConfig.AUTH_REDIRECT_URL;

export const seoSiteUrl = normalizeSiteUrl(rawSeoSiteUrl);
