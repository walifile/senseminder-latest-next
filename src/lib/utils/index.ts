import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
