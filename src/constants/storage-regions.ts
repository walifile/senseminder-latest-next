export type StorageRegion = "virginia" | "oregon";

export type StorageRegionOption = {
  value: StorageRegion;
  label: string;
  shortLabel: string;
};

export const STORAGE_REGIONS: StorageRegionOption[] = [
  {
    value: "virginia",
    label: "US East (N. Virginia)",
    shortLabel: "US East",
  },
  {
    value: "oregon",
    label: "US West (Oregon)",
    shortLabel: "US West",
  },
];

export const DEFAULT_STORAGE_REGION: StorageRegion = STORAGE_REGIONS[0].value;

export function isStorageRegion(
  value: string | null | undefined
): value is StorageRegion {
  return STORAGE_REGIONS.some((region) => region.value === value);
}

export function resolveStorageRegion(
  value?: string | null
): StorageRegion | null {
  if (!value) return null;
  const normalized = value.toLowerCase();

  if (normalized.includes("virginia") || normalized.includes("us-east")) {
    return "virginia";
  }
  if (normalized.includes("oregon") || normalized.includes("us-west")) {
    return "oregon";
  }

  return isStorageRegion(normalized) ? normalized : null;
}

export function getStorageRegionLabel(value: StorageRegion): string {
  return STORAGE_REGIONS.find((region) => region.value === value)?.label ?? value;
}
