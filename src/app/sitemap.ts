import fs from "fs";
import path from "path";
import { MetadataRoute } from "next";
import { cookies } from "next/headers";

export const revalidate = 3600;

const baseUrl =
  process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || "https://sensepc.com";
const baseDir = "src/app";
const excludeDirs = ["api", "fonts"];

const pageFileNames = new Set(["page.tsx", "page.ts", "page.jsx", "page.js"]);

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
//         console.log(tokenPayload);
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

function collectRoutes(
  currentDir: string,
  routePrefix: string,
  routes: Set<string>
): void {
  if (hasPageFile(currentDir)) {
    routes.add(routePrefix || "/");
  }

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (excludeDirs.includes(entry.name)) continue;
    if (isDynamicSegment(entry.name)) continue;

    const isGroup = isRouteGroup(entry.name);
    const nextSegment = isGroup ? "" : `${entry.name}`;
    const nextPrefix = routePrefix + nextSegment || "/";
    const childDir = path.join(currentDir, entry.name);

    collectRoutes(childDir, nextPrefix, routes);
  }
}

async function getRoutes(): Promise<MetadataRoute.Sitemap> {
  const fullPath = path.join(process.cwd(), baseDir);
  const routes = new Set<string>();

  collectRoutes(fullPath, "", routes);

  // Fetch all user tickets and add their routes
  // const ticketIds = await fetchAllUserTickets();
  // ticketIds.forEach((ticketId) => {
  //   const route = `/dashboard/support/ticket/${ticketId}`;
  //   routes.add(route);
  // });

  const now = new Date();

  return Array.from(routes).map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getRoutes();
}
