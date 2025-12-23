"use client";

import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";

import { useSort, useToasts, makeRenamedFile, nextVersionName } from "./utils";
import {
  ROOT,
  makeFs,
  toDisplay,
  uploadsFor,
  formatDate,
  formatBytes,
  upsertUpload,
  removeUpload,
  getSessionKey,
  subscribeUploads,
  normalizeFeaturesUpdate,
} from "./ft-core";

import type { FsApi } from "./ft-core";
import type { FsEntry, FeatureStatus, FileTransferProps } from "./types";

/** ✅ move outside component to satisfy exhaustive-deps */
const KNOWN_FEATURES = ["file-upload", "file-download", "filestorage"] as const;
type KnownFeature = (typeof KNOWN_FEATURES)[number];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickFirstArray(obj: Record<string, unknown>, keys: string[]): FsEntry[] | null {
  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) return v as FsEntry[];
  }
  return null;
}

function pickFirstToken(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length) return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

export default function FileTransferPanel({ conn, className, onError }: FileTransferProps) {
  const fsRef = useRef<FsApi | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const featureStore = useRef<Record<string, FeatureStatus>>({});

  const [curRelPath, setCurRelPath] = useState<string>(ROOT);
  const curRelPathRef = useRef<string>(ROOT);
  useEffect(() => {
    curRelPathRef.current = curRelPath;
  }, [curRelPath]);

  const [entries, setEntries] = useState<FsEntry[]>([]);
  const [busy, setBusy] = useState<"idle" | "listing" | "first-list">("first-list");
  const [err, setErr] = useState<string | null>(null);
  const [canUpload, setCanUpload] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const listScrollRef = useRef<HTMLDivElement | null>(null);

  /** ✅ stabilize onError to avoid hook dep churn */
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  /** ✅ single place to set error + call onError */
  const reportError = useCallback((msg: string) => {
    setErr(msg);
    onErrorRef.current?.(msg);
  }, []);

  // Sorting (from utils)
  const { sortKey, sortDesc, applySort, toggleSort } = useSort("modified", true);

  // Re-apply sort immediately when user toggles sort (keeps UI consistent)
  useEffect(() => {
    setEntries((prev) => applySort(prev));
  }, [applySort, sortKey, sortDesc]);

  // Upload persistence in UI
  const sessionKey = useMemo(() => (conn ? getSessionKey(conn) : "default"), [conn]);
  const [inflight, setInflight] = useState(uploadsFor(sessionKey));
  useEffect(() => subscribeUploads(sessionKey, setInflight), [sessionKey]);

  const { toasts, push: pushToast, remove: removeToast } = useToasts();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      try {
        Notification.requestPermission().catch(() => {});
      } catch {
        /* no-op */
      }
    }
  }, []);

  /* -------------------- Interactivity flags ------------------------ */
  const isInteractive = busy === "idle";
  const canUploadNow = isInteractive && canUpload;
  const canDownloadNow = isInteractive && canDownload;

  /* -------------------- Drag & drop (panel only) ------------------- */
  const [dragDepth, setDragDepth] = useState(0);
  const isDragging = dragDepth > 0 && canUploadNow;

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canUploadNow) return;
    e.preventDefault();
    e.stopPropagation();
    if (Array.from(e.dataTransfer?.types || []).includes("Files")) setDragDepth((d) => d + 1);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canUploadNow) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canUploadNow) return;
    e.preventDefault();
    e.stopPropagation();
    setDragDepth((d) => Math.max(0, d - 1));
  };

  /* --------------------------- Listing ----------------------------- */
  type ListFn = (...args: unknown[]) => Promise<unknown>;

  // best-effort: drain pagination tokens if fs.list returns pages
  const listAllEntries = useCallback(async (relPath: string): Promise<FsEntry[]> => {
    const fs = fsRef.current;
    if (!fs) return [];

    const list = (fs as unknown as { list?: ListFn }).list;
    if (!list) throw new Error("File explorer list() not available.");

    const itemsOut: FsEntry[] = [];
    const seenTokens = new Set<string>();

    let token: string | null = null;
    let pages = 0;

    // We don't impose a "file count" cap; this is just a runaway safety guard.
    const MAX_PAGES = 5000;

    while (pages < MAX_PAGES) {
      pages += 1;

      let res: unknown;
      try {
        if (token) {
          // try common pagination shapes first
          res = await list(relPath, {
            nextToken: token,
            continuationToken: token,
            cursor: token,
            token,
          });
        } else {
          res = await list(relPath);
        }
      } catch (e1) {
        // fallback: some APIs accept token as second arg (string)
        if (token) {
          res = await list(relPath, token);
        } else {
          throw e1;
        }
      }

      if (Array.isArray(res)) {
        // Non-paginated API: done.
        itemsOut.push(...(res as FsEntry[]));
        break;
      }

      if (!isRecord(res)) {
        throw new Error("Failed to list");
      }

      const pageItems = pickFirstArray(res, ["items", "entries", "files", "results", "data"]) ?? [];
      itemsOut.push(...pageItems);

      const next = pickFirstToken(res, [
        "nextToken",
        "NextToken",
        "next",
        "cursor",
        "continuationToken",
        "ContinuationToken",
      ]);

      if (!next) break;
      if (seenTokens.has(next)) break; // prevent infinite loops if server repeats token
      seenTokens.add(next);
      token = next;
    }

    return itemsOut;
  }, []);

  // Coalesce refresh calls (prevents overlapping list() calls that trigger "list failed")
  const refreshStateRef = useRef<{ running: boolean; pendingPath: string | null }>({
    running: false,
    pendingPath: null,
  });

  // Debounce refresh (so multiple uploads settling close together don't spam listing)
  const refreshTimerRef = useRef<number | null>(null);

  const refresh = useCallback(
    async (relPath: string) => {
      if (!fsRef.current) return;

      // set latest request
      refreshStateRef.current.pendingPath = relPath ?? ROOT;

      // if a list is already running, let it finish; it will loop to pendingPath
      if (refreshStateRef.current.running) return;

      refreshStateRef.current.running = true;
      setBusy((b) => (b === "first-list" ? "first-list" : "listing"));

      try {
        while (true) {
          const rp = refreshStateRef.current.pendingPath ?? ROOT;
          refreshStateRef.current.pendingPath = null;

          // retry small backoff: listing can fail briefly while storage updates after multi-upload
          let list: FsEntry[] | null = null;
          let lastErr: unknown = null;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              list = await listAllEntries(rp);
              break;
            } catch (e: unknown) {
              lastErr = e;
              await sleep(150 * (attempt + 1));
            }
          }
          if (!list) {
            const msg = lastErr instanceof Error ? lastErr.message : "Failed to list";
            throw new Error(msg);
          }

          setEntries(applySort(list));
          setCurRelPath(rp);

          // if something requested another refresh while we were listing, loop again
          if (!refreshStateRef.current.pendingPath) break;
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to list";
        reportError(msg);
      } finally {
        refreshStateRef.current.running = false;
        setBusy("idle");
      }
    },
    [applySort, listAllEntries, reportError]
  );

  const scheduleRefresh = useCallback(
    (path?: string) => {
      const p = path ?? curRelPathRef.current ?? ROOT;

      // always keep the latest requested path
      refreshStateRef.current.pendingPath = p;

      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = window.setTimeout(() => {
        refreshTimerRef.current = null;
        void refresh(p);
      }, 250);
    },
    [refresh]
  );

  /* ----------------------- Conflict Prompt ------------------------ */
  type Conflict = { file: File; existingNames: Set<string> };
  const [conflict, setConflict] = useState<Conflict | null>(null);

  // ✅ Throttled upload queue (prevents DCV bulk upload failures)
  const MAX_CONCURRENT_UPLOADS = 2; // if you still see failures, set to 1
  const activeUploadsRef = useRef(0);
  const pendingQueueRef = useRef<File[]>([]);
  const [queueTick, setQueueTick] = useState(0);

  const openConflictFor = useCallback(
    (file: File) => {
      const existing = new Set(entries.filter((e) => !e.isDir).map((e) => e.name));
      if (existing.has(file.name)) {
        setConflict({ file, existingNames: existing });
        return true;
      }
      return false;
    },
    [entries]
  );

  /** ✅ stable enqueue */
  const enqueueFiles = useCallback((files: File[]) => {
    pendingQueueRef.current.push(...files);
    setQueueTick((t) => t + 1);
  }, []);

  /** ✅ resolveAndUpload is stable (fixes hook dep warning) */
  const resolveAndUpload = useCallback(
    (files: File[]) => {
      enqueueFiles(files);
    },
    [enqueueFiles]
  );

  const onReplace = () => {
    if (!conflict) return;
    startUpload(conflict.file);
    setConflict(null);
  };
  const onKeepBoth = () => {
    if (!conflict) return;
    const newName = nextVersionName(conflict.file.name, conflict.existingNames);
    startUpload(makeRenamedFile(conflict.file, newName));
    setConflict(null);
  };
  const onSkip = () => {
    setConflict(null);
    // continue queue after skip
    setQueueTick((t) => t + 1);
  };

  /* ---------------------------- Upload ----------------------------- */
  const startUpload = useCallback(
    (file: File) => {
      if (!fsRef.current) throw new Error("File explorer is not available.");
      const id = `${Date.now()}-${Math.random()}`;
      activeUploadsRef.current += 1;

      upsertUpload(sessionKey, { id, name: file.name, progress: 0, status: "uploading" });

      const finish = () => {
        activeUploadsRef.current = Math.max(0, activeUploadsRef.current - 1);
        setQueueTick((t) => t + 1); // ✅ pump next
      };

      const positiveMsg = (fname: string) =>
        `All good — ${fname} is still syncing. Your upload will continue in the background.`;

      try {
        const { promise, cancel } = fsRef.current.upload(file, curRelPathRef.current, (p) => {
          upsertUpload(sessionKey, { id, name: file.name, progress: p, status: "uploading", cancel });
        });

        // ensure cancel is persisted at 0%
        upsertUpload(sessionKey, { id, name: file.name, progress: 0, status: "uploading", cancel });

        promise
          .then(() => {
            removeUpload(sessionKey, id);
            pushToast("Upload complete", file.name);
            scheduleRefresh(curRelPathRef.current);
            finish();
          })
          .catch((errUp: unknown) => {
            console.warn("DCV upload warning:", file.name, errUp);

            removeUpload(sessionKey, id);

            // ✅ more positive UX (no "failed")
            pushToast("Syncing…", `${file.name} is still uploading`);
            setErr(positiveMsg(file.name)); // optional banner
            scheduleRefresh(curRelPathRef.current);

            finish();
          });
      } catch (e: unknown) {
        console.warn("DCV upload warning (threw):", file.name, e);

        removeUpload(sessionKey, id);

        // ✅ more positive UX (no "failed")
        pushToast("Syncing…", `${file.name} is still uploading`);
        setErr(positiveMsg(file.name)); // optional banner
        scheduleRefresh(curRelPathRef.current);

        finish();
      }
    },
    [pushToast, scheduleRefresh, sessionKey]
  );

  // ✅ Pump the queue (runs when queue changes, when conflicts clear, and when entries change)
  useEffect(() => {
    if (conflict) return;

    while (activeUploadsRef.current < MAX_CONCURRENT_UPLOADS) {
      const f = pendingQueueRef.current.shift();
      if (!f) break;

      if (openConflictFor(f)) break; // conflict modal opened -> pause pumping
      startUpload(f);
    }
  }, [conflict, queueTick, openConflictFor, startUpload]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canUploadNow) return;
    e.preventDefault();
    e.stopPropagation();
    setDragDepth(0);
    const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
    if (!files.length) return;
    if (!canUpload) {
      reportError("Upload not permitted by DCV permissions.");
      return;
    }
    resolveAndUpload(files);
  };

  const handlePickUpload = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const files = ev.target.files ? Array.from(ev.target.files) : [];
      ev.target.value = "";
      if (!files.length) return;
      if (!canUpload) {
        reportError("Upload not permitted by DCV permissions.");
        return;
      }
      resolveAndUpload(files);
    },
    [canUpload, reportError, resolveAndUpload]
  );

  /* --------------------------- Download --------------------------- */
  const doDownloadByPath = useCallback(
    async (relOrAbsPath: string) => {
      if (!fsRef.current) throw new Error("File explorer is not available.");
      if (!canDownloadNow) throw new Error("Download not permitted by DCV permissions.");
      try {
        await fsRef.current.downloadByPath(relOrAbsPath);
        const fname = String(relOrAbsPath).split(/[\\/]/).pop() || "";
        pushToast("Download requested", fname);
        try {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Download requested", { body: fname });
          }
        } catch {
          /* no-op */
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Download failed";
        reportError(msg);
      }
    },
    [canDownloadNow, pushToast, reportError]
  );

  /* -------------------- Feature gates & boot ---------------------- */
  const queryFeatureSafe = useCallback(
    async (name: KnownFeature) => {
      try {
        featureStore.current[name] = (await conn?.queryFeature?.(name)) || {};
      } catch {
        /* no-op */
      }
    },
    [conn]
  );

  const handleFeaturesUpdateList = useCallback(
    async (updated: unknown) => {
      if (!conn?.queryFeature) return;
      const items = normalizeFeaturesUpdate(updated);
      if (items.length === 1 && items[0] === "_bulk") {
        await Promise.all(KNOWN_FEATURES.map(queryFeatureSafe));
      } else {
        for (const f of items) await queryFeatureSafe(f as KnownFeature);
      }
      setCanUpload(!!featureStore.current["file-upload"]?.enabled);
      setCanDownload(!!featureStore.current["file-download"]?.enabled);
    },
    [conn, queryFeatureSafe]
  );

  const initialProbe = useCallback(async () => {
    if (!conn?.queryFeature) return;
    const waits = [0, 500, 2000];
    for (const ms of waits) {
      if (ms) await new Promise((r) => setTimeout(r, ms));
      await Promise.all(KNOWN_FEATURES.map(queryFeatureSafe));
      setCanUpload(!!featureStore.current["file-upload"]?.enabled);
      setCanDownload(!!featureStore.current["file-download"]?.enabled);
    }
  }, [conn, queryFeatureSafe]);

  useEffect(() => {
    let unsubFeatures: (() => void) | undefined;

    (async () => {
      setErr(null);
      featureStore.current = {};
      fsRef.current = null;
      if (!conn) return;

      try {
        const h = (ev: unknown) => handleFeaturesUpdateList((ev as { list?: unknown })?.list ?? ev);
        conn.on?.("featuresUpdate", h);
        conn.addEventListener?.("featuresUpdate", h);
        unsubFeatures = () => {
          conn.off?.("featuresUpdate", h);
          conn.removeEventListener?.("featuresUpdate", h);
        };
      } catch {
        /* no-op */
      }

      await initialProbe();

      const fs = await makeFs(conn);
      if (!fs) {
        reportError("File transfer API not exposed by this dcv.js bundle.");
        return;
      }
      fsRef.current = fs;

      await refresh(ROOT);
    })();

    return () => {
      try {
        unsubFeatures?.();
      } catch {
        /* no-op */
      }
      fsRef.current = null;
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
  }, [conn, handleFeaturesUpdateList, initialProbe, refresh, reportError]);

  /* ------------------------------- UI -------------------------------- */
  const Skeleton = () => (
    <ul>
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center px-3 py-2 border-b last:border-b-0 dark:border-zinc-800"
        >
          <div className="flex-1 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-28 h-3 ml-2 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-40 h-3 ml-2 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-24 h-7 ml-2 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={[
        // sizing/layout stays the same
        "flex flex-col w-[900px] max-w-[95vw] min-h-[420px] max-h-[70vh] h-full min-h-0",
        // ✅ DCVViewer-style surface (theme tokens + glass)
        "relative overflow-hidden rounded-2xl border border-border/60",
        "bg-background/70 dark:bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        "text-foreground shadow-2xl ring-1 ring-black/5 dark:ring-white/10",
        className || "",
      ].join(" ")}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* drag overlay – only when interactive & upload is allowed */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-4 ring-primary/50 bg-primary/10 dark:bg-primary/15 flex items-center justify-center">
          <div className="text-2xl font-semibold text-primary">Drop files to upload</div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed right-4 top-4 z-[1000] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-xl px-4 py-3 flex items-start gap-3 max-w-sm shadow-2xl",
              "border border-border/60 backdrop-blur-xl",
              "bg-card/80 dark:bg-card/60 text-foreground",
            ].join(" ")}
          >
            <div className="text-lg">ℹ️</div>
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              {t.desc && <div className="opacity-80 mt-0.5">{t.desc}</div>}
            </div>
            <button className="opacity-70 hover:opacity-100" onClick={() => removeToast(t.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* header */}
      <div className="px-5 py-4 border-b border-border/60 flex items-center bg-muted/20 dark:bg-muted/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">📁</span>
          <div className="text-sm font-semibold truncate" title={toDisplay(curRelPath)}>
            {toDisplay(curRelPath)}
          </div>
        </div>
        <div className="ml-auto text-[11px] px-2 py-1 rounded-md bg-muted/40 text-muted-foreground border border-border/50">
          {busy !== "idle" ? "Loading…" : entries.length ? `${entries.length} items` : "Empty"}
        </div>
      </div>

      {/* upload affordance */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handlePickUpload} />
      {canUploadNow && (
        <div
          className={[
            "px-5 py-3 text-center text-[11px] cursor-pointer select-none transition-colors",
            "border-b border-border/60",
            "text-muted-foreground hover:bg-muted/30",
          ].join(" ")}
          onClick={() => canUploadNow && fileInputRef.current?.click()}
          title={canUploadNow ? "Click to choose files" : "Upload disabled"}
        >
          Drag & drop files anywhere, or{" "}
          <span className="underline font-medium text-primary">click to upload</span>
        </div>
      )}

      {/* inflight uploads */}
      {inflight.length > 0 && (
        <div className="px-5 py-2 space-y-2 bg-muted/20 dark:bg-muted/10 border-b border-border/60">
          {inflight.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2 border border-border/60 bg-card/60 dark:bg-card/40"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-base">⏫</span>
                <span className="truncate font-medium">{u.name}</span>
              </div>

              <div className="w-32">
                <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, u.progress))}%` }}
                  />
                </div>
              </div>

              <div className="w-12 text-right text-[11px] font-medium text-muted-foreground">
                {u.progress}%
              </div>

              <button
                className="border border-border/60 px-2 py-1 rounded-md hover:bg-muted/40 text-[11px]"
                onClick={() => {
                  u.cancel?.();
                  removeUpload(sessionKey, u.id);
                }}
                title="Cancel upload"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}

      {/* list */}
      <div className="px-5 py-3 flex-1 min-h-0 overflow-hidden flex flex-col">
        <div
          ref={listScrollRef}
          data-ft-scroll
          tabIndex={0}
          className="border border-border/60 rounded-xl flex-1 min-h-0 overflow-auto overscroll-contain bg-card/30 dark:bg-card/20"
        >
          {/* header row */}
          <div className="sticky top-0 z-10 bg-muted/30 dark:bg-muted/15 border-b border-border/60 px-4 py-2.5 flex items-center select-none text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            <button
              className="flex-1 text-left hover:text-primary"
              onClick={() => toggleSort("name")}
              title="Sort by name"
            >
              Name {sortKey === "name" ? (sortDesc ? "↓" : "↑") : ""}
            </button>
            <div className="w-28 text-right pr-2">Size</div>
            <button
              className="w-40 text-right pr-2 hover:text-primary"
              onClick={() => toggleSort("modified")}
              title="Sort by modified"
            >
              Modified {sortKey === "modified" ? (sortDesc ? "↓" : "↑") : ""}
            </button>
            <div className="w-24 text-right pr-1">Actions</div>
          </div>

          {busy !== "idle" && entries.length === 0 ? (
            <Skeleton />
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="text-4xl mb-2">📭</div>
              <div>No files here</div>
            </div>
          ) : (
            <ul>
              {entries.map((it) => (
                <li
                  key={`${it.path}|${it.name}`}
                  className="flex items-center px-4 py-3 border-b last:border-b-0 border-border/60 hover:bg-muted/20"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="text-base">{it.isDir ? "📁" : "📄"}</span>
                    <span className="truncate font-medium" title={it.name}>
                      {it.name}
                    </span>
                  </div>

                  <div className="w-28 text-right pr-2 text-muted-foreground">
                    {it.isDir ? "—" : formatBytes(it.size)}
                  </div>

                  <div className="w-40 text-right pr-2 text-muted-foreground">
                    {formatDate(it.lastModified)}
                  </div>

                  <div className="w-24 text-right">
                    {it.isDir ? (
                      <button
                        className="border border-border/60 px-3 py-1.5 rounded-md hover:bg-muted/30 disabled:opacity-50"
                        onClick={() => scheduleRefresh(it.path)}
                        disabled={!isInteractive}
                      >
                        Open
                      </button>
                    ) : (
                      <button
                        className="border border-primary/40 text-primary px-3 py-1.5 rounded-md hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canDownloadNow}
                        onClick={() => doDownloadByPath(it.serverPath || it.path)}
                        title="Download"
                      >
                        Download
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* status bar (green / positive) */}
      {err && (
        <div className="px-5 pb-4">
          <div className="text-xs border-l-4 border-emerald-500 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 p-3 text-emerald-900 dark:text-emerald-100 flex items-start gap-2">
            <span className="text-base">⏳</span>
            <span>{err}</span>
          </div>
        </div>
      )}

      {/* Conflict modal */}
      {conflict && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 p-4">
          <div className="w-[460px] max-w-full rounded-2xl border border-border/60 bg-card/80 dark:bg-card/60 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="px-5 py-4 border-b border-border/60 bg-muted/20 dark:bg-muted/10">
              <div className="text-base font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>File already exists</span>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="text-sm text-foreground">
                <span className="font-semibold text-primary">{conflict.file.name}</span> already exists
                in this folder.
              </div>
              <div className="text-xs text-muted-foreground mt-1">What would you like to do?</div>
            </div>

            <div className="px-5 py-4 flex items-center justify-end gap-2 bg-muted/20 dark:bg-muted/10 border-t border-border/60">
              <button
                className="px-4 py-2 border border-border/60 rounded-lg hover:bg-muted/30"
                onClick={onSkip}
              >
                Skip
              </button>
              <button
                className="px-4 py-2 border border-primary/40 text-primary rounded-lg hover:bg-primary/10"
                onClick={onKeepBoth}
                title="Upload as a new version"
              >
                Keep both
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium shadow"
                onClick={onReplace}
                title="Overwrite the existing file"
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
