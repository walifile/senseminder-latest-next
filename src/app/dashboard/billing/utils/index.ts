import { formatDateTime } from "@/lib/utils/format-time";

import type { UsageHistory } from "../types";

export const formatInstanceDuration = (
  minutesStr: string,
  billingPlan: string
) => {
  const plan = billingPlan.toLowerCase();
  const minutesNum = Math.max(parseFloat(minutesStr), 0); // ensure it's a non-negative number

  if (plan === "hourly") {
    const hours = Math.floor(minutesNum / 60);
    const minutes = Math.round(minutesNum % 60);

    const hoursPart = hours > 0 ? `${hours} ${hours === 1 ? "hr" : "hrs"}` : "";
    const minutesPart =
      minutes > 0 ? `${minutes} ${minutes === 1 ? "min" : "mins"}` : "";

    return `${hoursPart} ${minutesPart}`.trim() || "0 minutes";
  } else if (plan === "daily") {
    return "24 hours";
  } else if (plan === "monthly") {
    return "1 month";
  } else {
    return `${minutesNum} min`;
  }
};

export const getUsagePeriod = (usage: UsageHistory) => {
  const isInstanceGreater =
    parseFloat(usage.instanceMinutes) > parseFloat(usage.storageMinutes);

  const start = isInstanceGreater
    ? usage.startTime
    : usage.storageBillingStartTime;
  const end = isInstanceGreater ? usage.endTime : usage.storageBillingEndTime;

  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
};

export const formatStorageGB = (bytesString: string) => {
  const bytes = parseFloat(bytesString);
  if (isNaN(bytes)) return "0 GB";
  const gb = bytes / 1024 ** 3;
  return `${gb.toFixed(2)} GB`;
};
