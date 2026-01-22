
import { useState, useCallback } from "react";

export type GlobalDragManager = {
  attach(): void;
  detach(): void;
  clearOverlay(): void;
};

type MakeGlobalDragManagerArgs = {
  autoOpenOnGlobalDrag: boolean;
  getIsOpen: () => boolean;
  setOpen: (open: boolean) => void;
  setIsGlobalDrag: (v: boolean) => void;
  safeSetDropEffect?: (
    dt: DataTransfer | null | undefined,
    effect: "copy" | "move"
  ) => void;
  hemostasisMs?: number;
};

export function makeGlobalDragManager({
  autoOpenOnGlobalDrag,
  getIsOpen,
  setOpen,
  setIsGlobalDrag,
  safeSetDropEffect = (dt, effect) => {
    try {
      if (dt) dt.dropEffect = effect;
    } catch {
      /* no-op */
    }
  },
  hemostasisMs = 200,
}: MakeGlobalDragManagerArgs): GlobalDragManager {
  let heartBeatTimer: number | null = null;
  let lastBeatAt = 0;

  const hasFiles = (e: DragEvent) =>
    !!e?.dataTransfer &&
    Array.from(e.dataTransfer.items || []).some((it) => it.kind === "file");

  const clearOverlay = () => {
    if (heartBeatTimer) {
      window.clearTimeout(heartBeatTimer);
      heartBeatTimer = null;
    }
    setIsGlobalDrag(false);
  };

  const scheduleHemostasis = (ms = hemostasisMs) => {
    if (heartBeatTimer) window.clearTimeout(heartBeatTimer);
    heartBeatTimer = window.setTimeout(() => {
      const age = Date.now() - lastBeatAt;
      if (age >= ms) clearOverlay();
    }, ms) as unknown as number;
  };

  const onDragEnter = (e: DragEvent) => {
    if (!hasFiles(e)) return;
    lastBeatAt = Date.now();
    setIsGlobalDrag(true);
    if (autoOpenOnGlobalDrag && !getIsOpen()) setOpen(true);
    scheduleHemostasis();
  };

  const onDragOver = (e: DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault(); // allow drop + show proper cursor
    if (!getIsOpen() && autoOpenOnGlobalDrag) setOpen(true);
    setIsGlobalDrag(true);
    lastBeatAt = Date.now();
    safeSetDropEffect(e.dataTransfer, "copy");
    scheduleHemostasis();
  };

  const onDragLeave = () => {
    scheduleHemostasis();
  };

  const onDrop = () => {
    // let the actual drop target handle it
    clearOverlay();
  };

  const onDragEnd = () => clearOverlay();

  const onVisibilityChange = () => {
    if (document.hidden) clearOverlay();
  };

  const attach = () => {
    window.addEventListener("dragenter", onDragEnter, true);
    window.addEventListener("dragover", onDragOver, true);
    window.addEventListener("dragleave", onDragLeave, true);
    window.addEventListener("drop", onDrop, true);
    window.addEventListener("dragend", onDragEnd, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
  };

  const detach = () => {
    window.removeEventListener("dragenter", onDragEnter, true);
    window.removeEventListener("dragover", onDragOver, true);
    window.removeEventListener("dragleave", onDragLeave, true);
    window.removeEventListener("drop", onDrop, true);
    window.removeEventListener("dragend", onDragEnd, true);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    clearOverlay();
  };

  return { attach, detach, clearOverlay };
}



export type Toast = { id: string; title: string; desc?: string };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((title: string, desc?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((xs) => [{ id, title, desc }, ...xs].slice(0, 5));
    setTimeout(() => setToasts((xs) => xs.filter((t) => t.id !== id)), 4200);
  }, []);

  const remove = useCallback(
    (id: string) => setToasts((xs) => xs.filter((t) => t.id !== id)),
    []
  );

  return { toasts, push, remove };
}



export const splitName = (n: string) => {
  const idx = n.lastIndexOf(".");
  return idx > 0 ? [n.slice(0, idx), n.slice(idx)] : [n, ""];
};

export const nextVersionName = (base: string, existing: Set<string>): string => {
  const [stem, ext] = splitName(base);
  let v = 2;
  while (existing.has(`${stem} (v${v})${ext}`)) v++;
  return `${stem} (v${v})${ext}`;
};

export const makeRenamedFile = (f: File, newName: string) =>
  new File([f], newName, { type: f.type, lastModified: f.lastModified });



export type SortKey = "name" | "modified";

export function useSort(initialKey: SortKey = "modified", initialDesc = true) {
  const [sortKey, setSortKey] = useState<SortKey>(initialKey);
  const [sortDesc, setSortDesc] = useState<boolean>(initialDesc);

  const applySort = useCallback(
    <T extends { name: string; lastModified?: number }>(rows: T[]) => {
      const files = [...rows];
      files.sort((a, b) => {
        if (sortKey === "name") {
          const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
          return sortDesc ? -cmp : cmp;
        }
        const am = a.lastModified ?? 0;
        const bm = b.lastModified ?? 0;
        return sortDesc ? bm - am : am - bm;
      });
      return files;
    },
    [sortKey, sortDesc]
  );

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) setSortDesc((d) => !d);
      else {
        setSortKey(key);
        setSortDesc(key === "modified"); // default to desc for modified
      }
    },
    [sortKey]
  );

  return { sortKey, sortDesc, setSortKey, setSortDesc, applySort, toggleSort };
}
