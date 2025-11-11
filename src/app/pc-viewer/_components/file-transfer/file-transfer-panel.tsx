
"use client";

import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";

import {
  useSort,
  useToasts,
  makeRenamedFile,
  nextVersionName,
} from "./utils";
import {
  ROOT, makeFs, toDisplay, uploadsFor,
  formatDate, formatBytes, upsertUpload, removeUpload, getSessionKey,
  subscribeUploads, normalizeFeaturesUpdate
} from "./ft-core";

import type { FsApi } from "./ft-core";
import type { FsEntry, FeatureStatus, FileTransferProps } from "./types";


export default function FileTransferPanel({ conn, className, onError }: FileTransferProps) {
  const fsRef = useRef<FsApi | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const featureStore = useRef<Record<string, FeatureStatus>>({});

  const [curRelPath, setCurRelPath] = useState<string>(ROOT);
  const [entries, setEntries] = useState<FsEntry[]>([]);
  const [busy, setBusy] = useState<"idle" | "listing" | "first-list">("first-list");
  const [err, setErr] = useState<string | null>(null);
  const [canUpload, setCanUpload] = useState(false);
  const [canDownload, setCanDownload] = useState(false);

  // Sorting (from utils)
  const { sortKey, sortDesc, applySort, toggleSort } = useSort("modified", true);

  // Upload persistence in UI
  const sessionKey = useMemo(() => (conn ? getSessionKey(conn) : "default"), [conn]);
  const [inflight, setInflight] = useState(uploadsFor(sessionKey));
  useEffect(() => subscribeUploads(sessionKey, setInflight), [sessionKey]);

  const { toasts, push: pushToast, remove: removeToast } = useToasts();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      try { Notification.requestPermission().catch(() => {}); } catch { /* no-op */ }
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
    e.preventDefault(); e.stopPropagation();
    if (Array.from(e.dataTransfer?.types || []).includes("Files")) setDragDepth((d) => d + 1);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canUploadNow) return;
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canUploadNow) return;
    e.preventDefault(); e.stopPropagation();
    setDragDepth((d) => Math.max(0, d - 1));
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canUploadNow) return;
    e.preventDefault(); e.stopPropagation();
    setDragDepth(0);
    const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
    if (!files.length) return;
    if (!canUpload) {
      const msg = "Upload not permitted by DCV permissions.";
      setErr(msg); onError?.(msg);
      return;
    }
    resolveAndUpload(files);
  };

  /* --------------------------- Listing ----------------------------- */
  const refresh = useCallback(async (relPath: string) => {
    if (!fsRef.current) return;
    setBusy((b) => (b === "first-list" ? "first-list" : "listing"));
    try {
      const rp = relPath ?? ROOT;
      const list = await fsRef.current.list(rp);
      setEntries(applySort(list));
      setCurRelPath(rp);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to list";
      setErr(msg); onError?.(msg);
    } finally {
      setBusy("idle");
    }
  }, [applySort, onError]);

  /* ----------------------- Conflict Prompt ------------------------ */
  type Conflict = { file: File; existingNames: Set<string> };
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [pendingQueue, setPendingQueue] = useState<File[]>([]);

  const openConflictFor = (file: File) => {
    const existing = new Set(entries.filter((e) => !e.isDir).map((e) => e.name));
    if (existing.has(file.name)) { setConflict({ file, existingNames: existing }); return true; }
    return false;
  };

  const enqueueFiles = (files: File[]) => setPendingQueue((q) => [...q, ...files]);

  useEffect(() => {
    if (!conflict && pendingQueue.length) {
      const [f, ...rest] = pendingQueue;
      setPendingQueue(rest);
      if (!openConflictFor(f)) startUpload(f);
    }
  }, [conflict, pendingQueue]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const onSkip = () => { setConflict(null); };

  /* ---------------------------- Upload ----------------------------- */
  const startUpload = useCallback((file: File) => {
    if (!fsRef.current) throw new Error("File explorer is not available.");
    const id = `${Date.now()}-${Math.random()}`;
    upsertUpload(sessionKey, { id, name: file.name, progress: 0, status: "uploading" });

    try {
      const { promise, cancel } = fsRef.current.upload(file, curRelPath, (p) => {
        upsertUpload(sessionKey, { id, name: file.name, progress: p, status: "uploading", cancel });
      });

      // ensure cancel is persisted at 0%
      upsertUpload(sessionKey, { id, name: file.name, progress: 0, status: "uploading", cancel });

      promise
        .then(() => {
          removeUpload(sessionKey, id);
          pushToast("Upload complete", file.name);
          void refresh(curRelPath);
        })
        .catch((err: unknown) => {
          removeUpload(sessionKey, id);
          pushToast("Upload failed", file.name);
          const msg = err instanceof Error ? err.message : "Upload failed";
          setErr(msg); onError?.(msg);
        });
    } catch (e: unknown) {
      removeUpload(sessionKey, id);
      pushToast("Upload failed", file.name);
      const msg = e instanceof Error ? e.message : "Upload failed";
      setErr(msg); onError?.(msg);
    }
  }, [curRelPath, onError, refresh, sessionKey, pushToast]);

  const resolveAndUpload = (files: File[]) => {
    enqueueFiles(files);
    if (!conflict && pendingQueue.length === 0) {
      // trigger queue effect in next tick
      setPendingQueue((q) => [...q]);
    }
  };

  const handlePickUpload = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = ev.target.files ? Array.from(ev.target.files) : [];
    ev.target.value = "";
    if (!files.length) return;
    if (!canUpload) { const msg = "Upload not permitted by DCV permissions."; setErr(msg); onError?.(msg); return; }
    resolveAndUpload(files);
  }, [canUpload, onError]);

  /* --------------------------- Download --------------------------- */
  const doDownloadByPath = useCallback(async (relOrAbsPath: string) => {
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
      } catch { /* no-op */ }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Download failed";
      setErr(msg); onError?.(msg);
    }
  }, [canDownloadNow, onError, pushToast]);

  /* -------------------- Feature gates & boot ---------------------- */
  const KNOWN_FEATURES = ["file-upload", "file-download", "filestorage"] as const;

  const queryFeatureSafe = useCallback(async (name: string) => {
    try {
      // `featureStore` is a ref; mutate locally then we re-read values
      featureStore.current[name] = (await conn?.queryFeature?.(name)) || {};
    } catch {
      /* no-op */
    }
  }, [conn]);

  const handleFeaturesUpdateList = useCallback(async (updated: unknown) => {
    if (!conn?.queryFeature) return;
    const items = normalizeFeaturesUpdate(updated);
    if (items.length === 1 && items[0] === "_bulk") {
      await Promise.all(KNOWN_FEATURES.map(queryFeatureSafe));
    } else {
      for (const f of items) await queryFeatureSafe(f);
    }
    setCanUpload(!!featureStore.current["file-upload"]?.enabled);
    setCanDownload(!!featureStore.current["file-download"]?.enabled);
  }, [conn, queryFeatureSafe]);

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
        const msg = "File transfer API not exposed by this dcv.js bundle.";
        setErr(msg); onError?.(msg);
        return;
      }
      fsRef.current = fs;
      await refresh(ROOT);
    })();

    return () => {
      try { unsubFeatures?.(); } catch { /* no-op */ }
      fsRef.current = null;
    };
  }, [conn, handleFeaturesUpdateList, initialProbe, onError, refresh]);

  /* ------------------------------- UI -------------------------------- */
  const Skeleton = () => (
    <ul>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center px-3 py-2 border-b last:border-b-0 dark:border-zinc-800">
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
        "flex flex-col w-[900px] max-w-[95vw] min-h-[420px] max-h-[70vh]",
        "text-xs rounded-xl border shadow-lg dark:border-zinc-700 bg-white dark:bg-zinc-900",
        "relative overflow-hidden",
        className || ""
      ].join(" ")}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* drag overlay – only when interactive & upload is allowed */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 ring-4 ring-blue-500 bg-blue-50/60 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">Drop files to upload</div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed right-4 top-4 z-[1000] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-zinc-900/95 backdrop-blur text-white text-xs rounded-lg shadow-xl px-4 py-3 flex items-start gap-3 max-w-sm">
            <div className="text-lg">ℹ️</div>
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              {t.desc && <div className="opacity-80 mt-0.5">{t.desc}</div>}
            </div>
            <button className="opacity-70 hover:opacity-100" onClick={() => removeToast(t.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* header */}
      <div className="px-5 py-4 border-b dark:border-zinc-800 flex items-center bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">📁</span>
          <div className="text-sm font-semibold truncate" title={toDisplay(curRelPath)}>
            {toDisplay(curRelPath)}
          </div>
        </div>
        <div className="ml-auto text-[11px] px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          {busy !== "idle" ? "Loading…" : entries.length ? `${entries.length} items` : "Empty"}
        </div>
      </div>

      {/* upload affordance — HIDDEN while loading */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handlePickUpload} />
      {canUploadNow && (
        <div
          className="px-5 py-3 text-center text-[11px] text-zinc-600 dark:text-zinc-400 cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b dark:border-zinc-800"
          onClick={() => canUploadNow && fileInputRef.current?.click()}
          title={canUploadNow ? "Click to choose files" : "Upload disabled"}
        >
          Drag & drop files anywhere, or <span className="underline font-medium text-blue-600 dark:text-blue-400">click to upload</span>
        </div>
      )}

      {/* inflight uploads */}
      {inflight.length > 0 && (
        <div className="px-5 py-2 space-y-2 bg-blue-50/30 dark:bg-blue-950/20 border-b dark:border-zinc-800">
          {inflight.map((u) => (
            <div key={u.id} className="flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 border dark:border-zinc-800">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-base">⏫</span>
                <span className="truncate font-medium">{u.name}</span>
              </div>
              <div className="w-32">
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, u.progress))}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-[11px] font-medium">{u.progress}%</div>
              <button
                className="border border-zinc-300 dark:border-zinc-700 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px]"
                onClick={() => { u.cancel?.(); removeUpload(sessionKey, u.id); }}
                title="Cancel upload"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}

      {/* list */}
      <div className="px-5 py-3 flex-1 min-h-0 overflow-hidden">
        <div className="border dark:border-zinc-700 rounded-lg h-full overflow-auto">
          {/* header row */}
          <div className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 border-b dark:border-zinc-800 px-4 py-2.5 flex items-center select-none text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
            <button
              className="flex-1 text-left hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => toggleSort("name")}
              title="Sort by name"
            >
              Name {sortKey === "name" ? (sortDesc ? "↓" : "↑") : ""}
            </button>
            <div className="w-28 text-right pr-2">Size</div>
            <button
              className="w-40 text-right pr-2 hover:text-blue-600 dark:hover:text-blue-400"
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
            <div className="p-8 text-center text-zinc-500">
              <div className="text-4xl mb-2">📭</div>
              <div>No files here</div>
            </div>
          ) : (
            <ul>
              {entries.map((it) => (
                <li
                  key={`${it.path}|${it.name}`}
                  className="flex items-center px-4 py-3 border-b last:border-b-0 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="text-base">{it.isDir ? "📁" : "📄"}</span>
                    <span className="truncate font-medium" title={it.name}>{it.name}</span>
                  </div>
                  <div className="w-28 text-right pr-2 text-zinc-600 dark:text-zinc-400">
                    {it.isDir ? "—" : formatBytes(it.size)}
                  </div>
                  <div className="w-40 text-right pr-2 text-zinc-600 dark:text-zinc-400">
                    {formatDate(it.lastModified)}
                  </div>
                  <div className="w-24 text-right">
                    {it.isDir ? (
                      <button
                        className="border px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                        onClick={() => refresh(it.path)}
                        disabled={!isInteractive}
                      >
                        Open
                      </button>
                    ) : (
                      <button
                        className="border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* error bar */}
      {err && (
        <div className="px-5 pb-4">
          <div className="text-xs border-l-4 border-rose-500 rounded bg-rose-50 dark:bg-rose-950/20 p-3 text-rose-700 dark:text-rose-400 flex items-start gap-2">
            <span className="text-base">⚠️</span>
            <span>{err}</span>
          </div>
        </div>
      )}

      {/* Conflict modal */}
      {conflict && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 p-4">
          <div className="w-[460px] max-w-full rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-700 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
              <div className="text-base font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>File already exists</span>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="text-sm text-zinc-700 dark:text-zinc-300">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{conflict.file.name}</span> already exists in this folder.
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                What would you like to do?
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-end gap-2 bg-zinc-50 dark:bg-zinc-950/50">
              <button
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={onSkip}
              >
                Skip
              </button>
              <button
                className="px-4 py-2 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={onKeepBoth}
                title="Upload as a new version"
              >
                Keep both
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow"
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
