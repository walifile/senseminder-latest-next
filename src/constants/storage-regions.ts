export type StorageRegion = string;

export type StorageRegionOption = {
  value: StorageRegion;
  label: string;
  shortLabel: string;
  order?: number;
};

export const STORAGE_REGIONS: StorageRegionOption[] = [
  {
    value: "us-east-1",
    label: "US East (N. Virginia)",
    shortLabel: "N. Virginia",
  },
  {
    value: "us-west-2",
    label: "US West (Oregon)",
    shortLabel: "Oregon",
  },
];

export const DEFAULT_STORAGE_REGION: StorageRegion = STORAGE_REGIONS[0].value;

export function isStorageRegion(
  value: string | null | undefined,
  options: StorageRegionOption[] = STORAGE_REGIONS
): value is StorageRegion {
  return options.some((region) => region.value === value);
}

export function resolveStorageRegion(
  value?: string | null,
  options: StorageRegionOption[] = STORAGE_REGIONS
): StorageRegion | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  if (isStorageRegion(normalized, options)) return normalized;

  const matched = options.find(
    (region) =>
      region.value.toLowerCase() === normalized ||
      region.label.toLowerCase() === normalized ||
      region.shortLabel.toLowerCase() === normalized
  );

  if (matched) return matched.value;

  return normalized;
}

export function getStorageRegionLabel(
  value: StorageRegion,
  options: StorageRegionOption[] = STORAGE_REGIONS
): string {
  return options.find((region) => region.value === value)?.label ?? value;
}
