import { formatDateTime } from "@/lib/utils/format-time";

import type { UsageHistory } from "../types";

export const getUsagePeriod = (usage: UsageHistory) => {
  const start = usage.startTime;
  const end = usage.endTime;

  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
};

export const formatStorageGB = (bytesString: string) => {
  const bytes = parseFloat(bytesString);
  if (isNaN(bytes)) return "0 GB";
  const gb = bytes / 1024 ** 3;
  return `${gb.toFixed(2)} GB`;
};
