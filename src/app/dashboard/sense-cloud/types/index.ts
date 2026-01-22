import type { StorageRegion } from "@/constants/storage-regions";

export interface FileItem {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  shared?: boolean;
  starred?: boolean;
  sharedWith?: string;
  size?: string;
  type?: string;
  previewUrl?: string;
}

// ✅ New Deduplication types

export interface DuplicateObject {
  id: string;
  fileName: string;
  bucket: string;
  sizeBytes: number;
  folder?: string | null;
  createdAt?: string;
}

export interface DuplicateGroup {
  groupKey: {
    fileName: string;
    sizeBytes: number;
    folder?: string | null;
  };
  primary: DuplicateObject;
  duplicates: DuplicateObject[];
  count?: number;
  totalBytes?: number;
}

export interface DuplicateScanResponse {
  userId: string;
  region: string;
  scope: string;
  stats?: {
    scannedFiles?: number;
    skippedBelowMinSize?: number;
    duplicateGroups?: number;
    duplicateFiles?: number;
    duplicateBytes?: number;
  };
  groups: DuplicateGroup[];
}

export interface DuplicatesProps {
  userId: string;
  region?: StorageRegion;
}

export type DuplicateItemLike = {
  id?: string;
  folder?: string | null;
};

export interface DuplicateMergeResponse {
  freedBytes?: number;
  removedFiles?: number;
}
