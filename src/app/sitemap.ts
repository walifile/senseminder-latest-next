import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://senseminder.com";

  // Static routes
  const staticRoutes = [
    "/",
    "/about",
    "/auth",
    "/auth/callback",
    "/auth/change-password",
    "/auth/forgot-password",
    "/auth/mfa-email",
    "/auth/mfa-select",
    "/auth/mfa-totp",
    "/auth/reset-password",
    "/auth/sign-up",
    "/auth/verify-email",
    "/auth/verify-otp",
    "/build-smartpc",
    "/contact",
    "/dashboard",
    "/dashboard/billing",
    "/dashboard/notifications",
    "/dashboard/profile",
    "/dashboard/security",
    "/dashboard/settings",
    "/dashboard/smart-pc",
    "/dashboard/smart-pc/detailed",
    "/dashboard/storage",
    "/dashboard/support",
    "/dashboard/tutorials",
    "/dashboard/users",
    "/first-time-setup",
    "/pc-viewer",
    "/privacy",
    "/shared-folder-viewer",
    "/smart-storage",
    "/terms",
    "/test",
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    // lastModified: new Date(),
  }));

  return staticUrls;
}
