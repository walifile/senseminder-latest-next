import {
  format,
  isToday,
  parseISO,
  isYesterday,
  formatDistanceToNow,
} from "date-fns";

export const formatTimeLabel = (date: Date | string | number): string => {
  const parsedDate = date instanceof Date ? date : new Date(date);
  return format(parsedDate, "p");
};

export const formatDateLabel = (dateStr: string): string => {
  const date = parseISO(dateStr);

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d");
};

export const formatRelativeTime = (
  date: Date | string | number,
  addSuffix: boolean = true
): string => {
  const parsedDate = date instanceof Date ? date : new Date(date);
  return formatDistanceToNow(parsedDate, { addSuffix });
};

export const formatDate = (date: Date | string | number): string => {
  const parsedDate = date instanceof Date ? date : new Date(date);
  return format(parsedDate, "dd/MM/yyyy");
};

export const formatDateTime = (
  date: Date | string | number,
  pattern: string = "yyyy-MM-dd HH:mm"
): string => {
  if (!date) return "";
  const parsedDate = date instanceof Date ? date : new Date(date);
  return format(parsedDate, pattern);
};

export function formatAsYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
