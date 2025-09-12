import fs from "fs";
import path from "path";
import { MetadataRoute } from "next";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sensepc.com";
const baseDir = "src/app";
const excludeDirs = ["api", "fonts"];

const pageFileNames = new Set(["page.tsx", "page.ts", "page.jsx", "page.js"]);

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
  // If this directory has a page file, add the current route prefix
  if (hasPageFile(currentDir)) {
    routes.add(routePrefix || "/");
  }

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (excludeDirs.includes(entry.name)) continue;
    if (isDynamicSegment(entry.name)) continue;

    const isGroup = isRouteGroup(entry.name);
    const nextSegment = isGroup ? "" : `/${entry.name}`;
    const nextPrefix = routePrefix + nextSegment || "/";
    const childDir = path.join(currentDir, entry.name);

    collectRoutes(childDir, nextPrefix, routes);
  }
}

async function getRoutes(): Promise<MetadataRoute.Sitemap> {
  const fullPath = path.join(process.cwd(), baseDir);
  const routes = new Set<string>();

  collectRoutes(fullPath, "", routes);

  const now = new Date();

  return Array.from(routes).map((route) => ({
    url: `${baseUrl}${route}`,
    // lastModified: now,
    // changeFrequency: "weekly",
    // priority: 1.0,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getRoutes();
}
