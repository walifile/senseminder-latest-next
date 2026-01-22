import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAvatarFallback = (user?: {
  firstName?: string;
  lastName?: string;
}) => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user?.firstName) {
    return `${user.firstName[0]}`.toUpperCase();
  }
  return "U";
};

export const sanitizeFilename = (filename: string) => {
  let name = filename.split("/").pop() || "file";
  name = name.replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_");
  return name.slice(0, 50);
};

export function filterNonNullable<T>(items: (T | null | undefined)[]): T[] {
  return items.filter((item): item is T => item != null);
}

export function maskEmail(email: string): string {
  const [u, d] = email.split("@");
  if (!u || !d) return email;
  const maskedUser =
    u.length <= 2
      ? u[0] + "*"
      : u[0] + "*".repeat(Math.max(1, u.length - 2)) + u[u.length - 1];
  return `${maskedUser}@${d}`;
}
