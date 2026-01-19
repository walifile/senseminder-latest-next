import { useState, useEffect, useCallback } from "react";
import {
  type StorageRegion,
  resolveStorageRegion,
  DEFAULT_STORAGE_REGION,
} from "@/constants/storage-regions";

const STORAGE_REGION_KEY = "sensecloud-storage-region";
const STORAGE_REGION_LOCK_KEY = "sensecloud-storage-region-locked";

const readStoredRegion = (): StorageRegion | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_REGION_KEY);
  return resolveStorageRegion(raw);
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

export const useStorageRegion = () => {
  const [selectedRegion, setSelectedRegion] = useState<StorageRegion>(
    DEFAULT_STORAGE_REGION
  );
  const [isLocked, setIsLocked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedRegion = readStoredRegion();
    const storedLock = readStoredLock();

    if (storedRegion) {
      setSelectedRegion(storedRegion);
    }
    if (storedLock) {
      setIsLocked(true);
    }

    setIsReady(true);
  }, []);

  const updateRegion = useCallback((region: StorageRegion) => {
    setSelectedRegion(region);
    writeStoredRegion(region);
  }, []);

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
    selectedRegion,
    setSelectedRegion: updateRegion,
    isLocked,
    lockRegion,
    isReady,
  };
};
