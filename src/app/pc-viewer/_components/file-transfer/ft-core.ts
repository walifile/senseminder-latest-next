
"use client";

import { isCommandLike } from "./types";

import type {
  FsEntry,
  CommandLike,
  ListItemRaw,
  DcvConnLike,
  UploadHandle,
  InflightRecord,
  FileExplorerLike,
} from "./types";

/** DCV file storage uses empty string for root (NOT "/"). */
export const ROOT = "";

/* --------------------- path + formatting helpers --------------------- */
export const toDisplay = (rel: string) => (rel ? `/${rel}` : "/");
export const toRelative = (display: string) => {
  const t = (display || "").trim();
  if (t === "" || t === "/") return ROOT;
  return t.replace(/^\/+/, "");
};

export const formatBytes = (n?: number) => {
  if (typeof n !== "number" || !isFinite(n)) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"] as const;
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 2 : 0)} ${u[i]}`;
};

export const formatDate = (ts?: number) => {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    // “YYYY-MM-DD HH:mm”
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "—";
  }
};

/** Accept any flavor of featuresUpdate and normalize to a list of names. */
export const normalizeFeaturesUpdate = (arg: unknown): string[] => {
  if (!arg) return [];
  if (Array.isArray(arg)) return arg.filter((x): x is string => typeof x === "string");
  if (typeof arg === "string") return [arg];

  // { list: [...] }
  if (typeof arg === "object" && arg !== null && "list" in arg) {
    const list = (arg as { list?: unknown }).list;
    if (Array.isArray(list)) return list.filter((x): x is string => typeof x === "string");
  }

  // Iterable<string>
  try {
    const iter = (arg as { [Symbol.iterator]?: () => Iterable<unknown> })?.[Symbol.iterator];
    if (typeof iter === "function") {
      return Array.from(iter.call(arg) as Iterable<unknown>).filter((x): x is string => typeof x === "string");
    }
  } catch {
    /* ignore */
  }
  // Fall back to a sentinel the caller understands
  return ["_bulk"];
};

const joinRel = (base: string, leaf: string) => {
  if (!base) return leaf ?? "";
  if (!leaf) return base;
  return `${base.replace(/\/+$/g, "")}/${leaf.replace(/^\/+/g, "")}`;
};

const pickAbsolutePath = (raw: unknown): string | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as ListItemRaw;
  const cands = [r.pathname, r.path, r.absolutePath, r.fullPath, r.target, r.realPath];
  for (const c of cands) if (typeof c === "string" && c.trim()) return c.trim();
  return undefined;
};

/* -------------------------- upload registry -------------------------- */
/** Persist inflight uploads per DCV session so progress survives modal close/open. */
type Listener = (rows: InflightRecord[]) => void;

const _stores = new Map<string, { rows: InflightRecord[]; subs: Set<Listener> }>();

export const getSessionKey = (conn: unknown): string => {
  const cfg =
    (conn as { _config?: unknown })?._config ??
    (conn as { config?: unknown })?.config ??
    (conn as { getConfig?: () => unknown })?.getConfig?.() ??
    {};
  const id =
    (cfg as { sessionId?: unknown }).sessionId ??
    (cfg as { id?: unknown }).id ??
    "default";
  return String(id);
};

export const uploadsFor = (key: string) => _stores.get(key)?.rows ?? [];

export const subscribeUploads = (key: string, fn: Listener) => {
  let s = _stores.get(key);
  if (!s) { s = { rows: [], subs: new Set() }; _stores.set(key, s); }
  s.subs.add(fn);
  fn(s.rows);
  return () => { s?.subs.delete(fn); };
};

export const upsertUpload = (key: string, rec: InflightRecord) => {
  let s = _stores.get(key);
  if (!s) { s = { rows: [], subs: new Set() }; _stores.set(key, s); }
  const i = s.rows.findIndex(r => r.id === rec.id);
  if (i >= 0) s.rows[i] = { ...s.rows[i], ...rec };
  else s.rows.unshift(rec);
  s.subs.forEach(cb => cb([...s!.rows]));
};

export const removeUpload = (key: string, id: string) => {
  const s = _stores.get(key); if (!s) return;
  s.rows = s.rows.filter(r => r.id !== id);
  s.subs.forEach(cb => cb([...s.rows]));
};

/* -------------------------- FS adapter (event) ------------------------ */
export interface FsApi {
  list: (relPath: string) => Promise<FsEntry[]>;
  upload: (file: File, destRelDir: string, onProgress?: (pct: number) => void) => UploadHandle;
  downloadByPath: (relOrAbsPath: string) => Promise<void>;
  _fe: FileExplorerLike;
}

export async function makeFs(conn: DcvConnLike | null): Promise<FsApi | null> {
  if (!conn) return null;

  const fe: FileExplorerLike | null = await (async () => {
    if (typeof conn.getFileExplorer === "function") {
      try { return await conn.getFileExplorer(); } catch { /* no-op */ }
    }
    if (conn.fileTransfer) return conn.fileTransfer;
    if (typeof conn.getFileTransfer === "function") {
      try { return await conn.getFileTransfer(); } catch { /* no-op */ }
    }
    return null;
  })();

  if (!fe) return null;

  const list: FsApi["list"] = async (relPath) => {
    const rp = relPath ?? ROOT;
    const ret = fe.list?.(rp);

    if (isCommandLike(ret)) {
      const rows: ListItemRaw[] = [];
      return await new Promise<FsEntry[]>((resolve, reject) => {
        try {
          ret
            .on("newItems", (items: unknown) => {
              if (Array.isArray(items)) rows.push(...(items.filter(Boolean) as ListItemRaw[]));
            })
            .on("success", () => {
              const mapped = rows
                .map((it) => {
                  const name = it.displayName ?? it.name ?? "item";
                  if (!name) return null;
                  const entry: FsEntry = {
                    name,
                    path: joinRel(rp, name),
                    isDir: (it.type ?? "").toLowerCase() === "folder",
                    size: it.size,
                    lastModified: it.lastModified,
                    serverPath: pickAbsolutePath(it),
                    _raw: it,
                  };
                  return entry;
                })
                .filter(Boolean) as FsEntry[];
              resolve(mapped);
            })
            .on("error", (e: unknown) => {
              const msg = e instanceof Error ? e.message : "list failed";
              reject(new Error(msg));
            })
            .run();
        } catch (e) {
          const msg = e instanceof Error ? e.message : "list failed";
          reject(new Error(msg));
        }
      });
    }

    // array-style fallback
    const arr = Array.isArray(ret) ? (ret as ListItemRaw[]) : [];
    return arr
      .filter(Boolean)
      .map((e) => {
        const name = e.displayName ?? e.name ?? "item";
        if (!name) return null;
        const entry: FsEntry = {
          name,
          path: joinRel(rp, name),
          isDir: (e.type ?? "").toLowerCase() === "folder",
          size: e.size,
          lastModified: e.lastModified,
          serverPath: pickAbsolutePath(e),
          _raw: e,
        };
        return entry;
      })
      .filter(Boolean) as FsEntry[];
  };

  const upload: FsApi["upload"] = (file, destRelDir, onProgress) => {
    const dir = destRelDir ?? ROOT;
    const cmd = fe.storeFile?.(file, dir);
    if (!isCommandLike(cmd)) throw new Error("storeFile command API not available");
    let finished = false;

    const promise = new Promise<unknown>((resolve, reject) => {
      try {
        cmd
          .on("progress", (sent: unknown, total: unknown) => {
            const s = typeof sent === "number" ? sent : 0;
            const t = typeof total === "number" ? total : 0;
            onProgress?.(t > 0 ? Math.round((s / t) * 100) : 0);
          })
          .on("success", (res: unknown) => { finished = true; resolve(res); })
          .on("error", (e: unknown) => {
            finished = true;
            const msg = e instanceof Error ? e.message : "upload failed";
            reject(new Error(msg));
          })
          .run();
      } catch (e) {
        finished = true;
        const msg = e instanceof Error ? e.message : "upload failed";
        reject(new Error(msg));
      }
    });

    const cancel = () => {
      try {
        if (!finished && typeof cmd.cancel === "function") cmd.cancel();
        else if (!finished && typeof cmd.abort === "function") cmd.abort();
      } catch {
        /* no-op */
      }
    };

    return { promise, cancel };
  };

  const downloadByPath: FsApi["downloadByPath"] = async (relOrAbsPath) => {
    const p = relOrAbsPath ?? ROOT;

    // useful for debugging in your UI
    try {
      (window as unknown as { __dcv_lastRequestedPath?: string }).__dcv_lastRequestedPath = p;
    } catch {
      /* no-op */
    }

    let ret = fe.retrieveFile?.(p);
    if (
      !ret ||
      (typeof (ret as CommandLike).on !== "function" &&
        typeof (ret as Promise<unknown>)?.then !== "function")
    ) {
      ret = fe.retrieveFile?.({ pathname: p });
    }
    if (!ret) throw new Error("retrieveFile API not available");

    if (isCommandLike(ret)) {
      await new Promise<void>((resolve, reject) => {
        ret
          .on("success", () => resolve())
          .on("error", (e: unknown) => {
            const msg = e instanceof Error ? e.message : "download failed";
            reject(new Error(msg));
          })
          .run();
      });
      return;
    }

    await ret; // Promise<unknown>
  };

  return { list, upload, downloadByPath, _fe: fe };
}
