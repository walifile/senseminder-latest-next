
export type FsEntry = {
  name: string;
  path: string;          // '' is root
  isDir: boolean;
  size?: number;
  lastModified?: number;
  serverPath?: string;
  _raw?: unknown;        // intentionally opaque
};

export type FeatureStatus = { enabled?: boolean; [k: string]: unknown };

export type InflightRecord = {
  id: string;
  name: string;
  progress: number;
  cancel?: () => void;
  status: "uploading" | "error" | "done" | "canceled";
};

export type UploadHandle = { promise: Promise<unknown>; cancel: () => void };

export interface CommandLike {
  on(event: string, handler: (...args: unknown[]) => void): this;
  run(): void;
  cancel?(): void;
  abort?(): void;
}

export interface FileExplorerLike {
  list?(relPath: string): CommandLike | Array<ListItemRaw>;
  storeFile?(file: File, destRelDir: string): CommandLike;
  retrieveFile?(path: string | { pathname: string }): CommandLike | Promise<unknown>;
}

export type ListItemRaw = {
  displayName?: string;
  name?: string;
  type?: string;
  size?: number;
  lastModified?: number;

  pathname?: string;
  path?: string;
  absolutePath?: string;
  fullPath?: string;
  target?: string;
  realPath?: string;

  [k: string]: unknown;
};

export interface DcvConnLike {
  queryFeature?(name: string): Promise<FeatureStatus>;
  on?(event: "featuresUpdate", handler: (ev: unknown) => void): void;
  off?(event: "featuresUpdate", handler: (ev: unknown) => void): void;
  addEventListener?(event: "featuresUpdate", handler: (ev: unknown) => void): void;
  removeEventListener?(event: "featuresUpdate", handler: (ev: unknown) => void): void;

  getFileExplorer?(): Promise<FileExplorerLike>;
  getFileTransfer?(): Promise<FileExplorerLike>;
  fileTransfer?: FileExplorerLike;

  _config?: unknown;
  config?: unknown;
  getConfig?(): unknown;
}


export interface FileStorageModalProps {
  conn: DcvConnLike | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoOpenOnGlobalDrag?: boolean;
  title?: string;
}

export interface FileTransferProps {
  conn: DcvConnLike | null;
  className?: string;
  onError?: (message: string) => void;
}

export const isCommandLike = (x: unknown): x is CommandLike =>
  !!x &&
  typeof x === "object" &&
  typeof (x as CommandLike).on === "function" &&
  typeof (x as CommandLike).run === "function";


export const looksLikeDcvConn = (x: unknown): x is DcvConnLike => {
  if (!x || typeof x !== "object") return false;
  const o = x as Partial<DcvConnLike>;
  return (
    typeof o.getFileExplorer === "function" ||
    typeof o.getFileTransfer === "function" ||
    typeof o.queryFeature === "function" ||
    typeof o.addEventListener === "function" ||
    typeof o.on === "function" ||
    (o.fileTransfer !== undefined && typeof o.fileTransfer === "object")
  );
};
