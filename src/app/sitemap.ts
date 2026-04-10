import type { MetadataRoute } from "next";

import fs from "fs";
import path from "path";
import { seoSiteUrl } from "@/app/seo/site-url";
// import { Logger } from "@/lib/utils/logger";

export const revalidate = 3600;

const baseUrl = seoSiteUrl;
const baseDir = "src/app";
const excludeDirs = ["api", "fonts"];
const excludedRoutePrefixes = [
  "/dashboard",
  "/pc-viewer",
  "/sense-cloud",
  "/shared-folder-viewer",
  "/welcome",
];

const pageFileNames = new Set(["page.tsx", "page.ts", "page.jsx", "page.js"]);
const layoutFileNames = new Set([
  "layout.tsx",
  "layout.ts",
  "layout.jsx",
  "layout.js",
]);

type RouteMetadata = {
  lastModified: Date;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

function getRoutePriority(route: string): number {
  if (route === "/") return 1.0;
  if (route === "/pricing") return 0.95;
  if (route.startsWith("/products/") || route === "/build-sensepc") return 0.9;
  if (route.startsWith("/use-cases/")) return 0.8;
  if (route === "/business/onboarding") return 0.85;
  if (route === "/faq") return 0.8;
  if (route === "/security") return 0.8;
  if (route === "/tutorials") return 0.8;
  if (route === "/auth") return 0.7;
  if (route === "/about" || route === "/contact") return 0.7;
  if (route === "/terms" || route === "/privacy") return 0.5;
  return 0.6;
}

function getRouteChangeFrequency(
  route: string
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (route === "/terms" || route === "/privacy") return "monthly";
  if (route === "/security") return "monthly";
  if (route === "/faq") return "weekly";
  if (route.startsWith("/use-cases/")) return "weekly";
  if (route === "/about" || route === "/contact") return "monthly";
  if (route === "/business/onboarding") return "weekly";
  if (route === "/auth") return "monthly";
  if (route === "/") return "weekly";
  return "weekly";
}

// function decodeJWT(token: string): any {
//   try {
//     const payload = token.split(".")[1];
//     return JSON.parse(
//       atob(payload + "=".repeat((4 - (payload.length % 4)) % 4))
//     );
//   } catch {
//     return null;
//   }
// }

// async function getCurrentUserFromCookies(): Promise<string | null> {
//   try {
//     const cookieStore = await cookies();
//     const authStateCookie = cookieStore.get("auth.state");

//     if (authStateCookie) {
//       const authData = JSON.parse(decodeURIComponent(authStateCookie.value));

//       if (authData.token) {
//         const tokenPayload = decodeJWT(authData.token);
//         Logger.log(tokenPayload);
//         if (tokenPayload?.sub) return tokenPayload.sub;
//       }
//     }

//     return null;
//   } catch {
//     return null;
//   }
// }

// async function fetchAllUserTickets(): Promise<string[]> {
//   try {
//     const currentUserId = await getCurrentUserFromCookies();
//     if (!currentUserId) return [];

//     const BASE_URL =
//       process.env.NEXT_PUBLIC_SUPPORT_API_BASE ||
//       "https://lvir6hp7hb.execute-api.us-east-1.amazonaws.com/dev";

//     const response = await fetch(`${BASE_URL}/tickets`, {
//       headers: {
//         "Content-Type": "application/json",
//         "x-user-id": currentUserId,
//       },
//       next: { revalidate },
//     });

//     if (!response.ok) return [];

//     const data = await response.json();
//     const tickets = data.tickets || [];

//     return tickets.map((ticket: any) => ticket.ticketId).filter(Boolean);
//   } catch {
//     return [];
//   }
// }

function isDynamicSegment(segment: string): boolean {
  return segment.startsWith("[");
}

function isRouteGroup(segment: string): boolean {
  return segment.startsWith("(") && segment.endsWith(")");
}

function hasPageFile(dir: string): boolean {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    return files.some((f) => f.isFile() && pageFileNames.has(f.name));
  } catch {
    return false;
  }
}

function getRouteLastModified(dir: string): Date {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    const candidateFiles = files.filter(
      (file) =>
        file.isFile() &&
        (pageFileNames.has(file.name) || layoutFileNames.has(file.name)),
    );

    if (candidateFiles.length === 0) {
      return new Date();
    }

    let latest = new Date(0);
    for (const file of candidateFiles) {
      const filePath = path.join(dir, file.name);
      const modifiedAt = fs.statSync(filePath).mtime;
      if (modifiedAt > latest) {
        latest = modifiedAt;
      }
    }

    return latest;
  } catch {
    return new Date();
  }
}

function appendRouteSegment(routePrefix: string, segment: string): string {
  if (!segment) {
    return routePrefix || "/";
  }

  const cleanPrefix = routePrefix && routePrefix !== "/" ? routePrefix : "";
  return `${cleanPrefix}/${segment}`;
}

function shouldIncludeRoute(route: string): boolean {
  if (!route) return false;
  if (route === "/") return true;
  if (route === "/auth") return true;
  if (route.startsWith("/auth/")) return false;
  return !excludedRoutePrefixes.some(
    (prefix) => route === prefix || route.startsWith(`${prefix}/`),
  );
}

function collectRoutes(
  currentDir: string,
  routePrefix: string,
  routes: Map<string, Date>,
): void {
  if (hasPageFile(currentDir)) {
    const route = routePrefix || "/";
    const modifiedAt = getRouteLastModified(currentDir);
    const existingModifiedAt = routes.get(route);

    if (!existingModifiedAt || modifiedAt > existingModifiedAt) {
      routes.set(route, modifiedAt);
    }
  }

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (excludeDirs.includes(entry.name)) continue;
    if (isDynamicSegment(entry.name)) continue;

    const isGroup = isRouteGroup(entry.name);
    const nextSegment = isGroup ? "" : entry.name;
    const nextPrefix = appendRouteSegment(routePrefix, nextSegment);
    const childDir = path.join(currentDir, entry.name);

    collectRoutes(childDir, nextPrefix, routes);
  }
}

async function getRoutes(): Promise<MetadataRoute.Sitemap> {
  const fullPath = path.join(process.cwd(), baseDir);
  const routes = new Map<string, Date>();

  collectRoutes(fullPath, "", routes);

  // Fetch all user tickets and add their routes
  // const ticketIds = await fetchAllUserTickets();
  // ticketIds.forEach((ticketId) => {
  //   const route = `/dashboard/support/ticket/${ticketId}`;
  //   routes.add(route);
  // });

  return Array.from(routes.entries())
    .filter(([route]) => shouldIncludeRoute(route))
    .map(([route, lastModified]) => {
      const routeMetadata: RouteMetadata = {
        lastModified,
        priority: getRoutePriority(route),
        changeFrequency: getRouteChangeFrequency(route),
      };

      return {
        url: `${baseUrl}${route}`,
        lastModified: routeMetadata.lastModified,
        changeFrequency: routeMetadata.changeFrequency,
        priority: routeMetadata.priority,
      };
    })
    .sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.url.localeCompare(b.url);
    });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getRoutes();
}
