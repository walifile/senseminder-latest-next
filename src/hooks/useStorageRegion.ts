import { useState, useEffect, useCallback, useMemo } from "react";
import { useGetRegionsQuery, useGetUserRegionQuery } from "@/api/fileManagerAPI";
import {
  type StorageRegion,
  type StorageRegionOption,
  resolveStorageRegion,
  STORAGE_REGIONS,
  DEFAULT_STORAGE_REGION,
} from "@/constants/storage-regions";

const STORAGE_REGION_KEY = "sensecloud-storage-region";
const STORAGE_REGION_LOCK_KEY = "sensecloud-storage-region-locked";

const readStoredRegion = (
  options?: StorageRegionOption[]
): StorageRegion | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_REGION_KEY);
  return resolveStorageRegion(raw, options);
};

const readStoredLock = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_REGION_LOCK_KEY) === "true";
};

const writeStoredRegion = (region: StorageRegion) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_REGION_KEY, region);
};

const writeStoredLock = (locked: boolean) => {
  if (typeof window === "undefined") return;
  if (locked) {
    window.localStorage.setItem(STORAGE_REGION_LOCK_KEY, "true");
  } else {
    window.localStorage.removeItem(STORAGE_REGION_LOCK_KEY);
  }
};

const normalizeRegionOption = (item: {
  region?: string;
  value?: string;
  label?: string;
  shortLabel?: string;
  order?: number;
}): StorageRegionOption | null => {
  const value = (item.value || item.region || "").trim();
  if (!value) return null;
  const label = (item.label || value).trim();
  return {
    value,
    label,
    shortLabel: (item.shortLabel || label).trim(),
    order: item.order,
  };
};

export const useStorageRegion = (userId?: string) => {
  const { data, isFetching: isRegionsFetching, isError: isRegionsError } =
    useGetRegionsQuery();
  const regions = useMemo(() => {
    const apiRegions = (data?.regions || [])
      .map(normalizeRegionOption)
      .filter((region): region is StorageRegionOption => Boolean(region));

    if (apiRegions.length > 0) {
      return apiRegions;
    }

    return STORAGE_REGIONS;
  }, [data?.regions]);

  const [selectedRegion, setSelectedRegion] = useState<StorageRegion>(
    DEFAULT_STORAGE_REGION
  );
  const [isLocked, setIsLocked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { data: userRegionData, isFetching } = useGetUserRegionQuery(
    { userId: userId || "" },
    { skip: !userId }
  );

  useEffect(() => {
    const storedRegion = readStoredRegion(regions);
    const storedLock = readStoredLock();

    if (storedRegion) {
      setSelectedRegion(storedRegion);
    }
    if (storedLock) {
      setIsLocked(true);
    }
  }, [regions]);

  useEffect(() => {
    if (!regions.length) return;
    const backendRegionValue =
      userRegionData?.region ||
      userRegionData?.storedRegion ||
      userRegionData?.activeRegion;
    if (backendRegionValue) return;
    const hasRegion = regions.some(
      (option) => option.value === selectedRegion
    );
    if (!hasRegion) {
      const fallback = regions[0].value;
      setSelectedRegion(fallback);
      writeStoredRegion(fallback);
    }
  }, [regions, selectedRegion, userRegionData]);

  useEffect(() => {
    if (!userId) {
      setIsReady(true);
      return;
    }

    if (!userRegionData && isFetching) {
      return;
    }

    const backendRegion = resolveStorageRegion(
      userRegionData?.region ||
        userRegionData?.storedRegion ||
        userRegionData?.activeRegion ||
        null,
      regions
    );

    const locked = Boolean(userRegionData?.locked);
    setIsLocked(locked);
    writeStoredLock(locked);

    if (locked && backendRegion) {
      setSelectedRegion(backendRegion);
      writeStoredRegion(backendRegion);
    } else if (!locked && backendRegion) {
      const localRegion = readStoredRegion(regions);
      if (!localRegion) {
        setSelectedRegion(backendRegion);
        writeStoredRegion(backendRegion);
      }
    }

    setIsReady(true);
  }, [userId, userRegionData, isFetching, regions]);

  const updateRegion = useCallback(
    (region: StorageRegion) => {
      setSelectedRegion(region);
      writeStoredRegion(region);
      return null;
    },
    []
  );

  const lockRegion = useCallback(
    (region?: StorageRegion) => {
      const nextRegion = region ?? selectedRegion;
      setSelectedRegion(nextRegion);
      setIsLocked(true);
      writeStoredRegion(nextRegion);
      writeStoredLock(true);
    },
    [selectedRegion]
  );

  return {
    regions,
    isRegionsFetching,
    isRegionsError,
    selectedRegion,
    setSelectedRegion: updateRegion,
    isLocked,
    lockRegion,
    isReady,
  };
};
