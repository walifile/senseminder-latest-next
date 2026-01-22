"use client";

import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";

import { makeGlobalDragManager } from "./file-transfer/utils";
import FileTransferPanel from "./file-transfer/file-transfer-panel";

import type { FileStorageModalProps } from "./file-transfer/types";

const NOOP_CLEANUP = () => {};

/** ---------------- Helpers ---------------- */

function isScrollable(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const oy = style.overflowY;
  const ox = style.overflowX;

  const canY = (oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight;
  const canX = (ox === "auto" || ox === "scroll") && el.scrollWidth > el.clientWidth;

  return canY || canX;
}

function findScrollableWithin(root: HTMLElement, start: HTMLElement) {
  let el: HTMLElement | null = start;

  while (el && el !== root) {
    if (isScrollable(el)) return el;
    el = el.parentElement;
  }

  if (isScrollable(root)) return root;
  return null;
}

const FileStorageModal: React.FC<FileStorageModalProps> = ({
  conn,
  open,
  onOpenChange,
  autoOpenOnGlobalDrag = true,
  title = "File storage",
}) => {
  const [isGlobalDrag, setIsGlobalDrag] = useState(false);

  const openRef = useRef(open);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!autoOpenOnGlobalDrag) return NOOP_CLEANUP;

    const mgr = makeGlobalDragManager({
      autoOpenOnGlobalDrag,
      getIsOpen: () => openRef.current,
      setOpen: onOpenChange,
      setIsGlobalDrag,
    });

    mgr.attach();
    return () => mgr.detach();
  }, [autoOpenOnGlobalDrag, onOpenChange]);

  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(() => setIsGlobalDrag(false), 0);
      return () => window.clearTimeout(t);
    }
    return NOOP_CLEANUP;
  }, [open]);

  /**
   * ✅ IMPORTANT:
   * Register the wheel capture handler as EARLY as possible (layout effect),
   * and keep it registered even when modal is closed.
   * Only "do work" when openRef.current === true.
   */
  const wheelCaptureHandler = useCallback((e: WheelEvent) => {
    // only hijack wheel when modal is open
    if (!openRef.current) return;

    const root = dialogRef.current;
    if (!root) return;

    const tgt = e.target as Node | null;
    if (!tgt || !root.contains(tgt)) return;

    // Prefer the panel scroll container if present
    const markedScroller = root.querySelector("[data-ft-scroll]") as HTMLElement | null;

    // Otherwise try nearest scrollable from the event target
    const startEl =
      (tgt instanceof HTMLElement ? tgt : (tgt as Element | null)?.parentElement) ?? null;

    const scroller =
      (markedScroller && isScrollable(markedScroller) ? markedScroller : null) ||
      (startEl ? findScrollableWithin(root, startEl) : null) ||
      markedScroller ||
      root;

    if (!(scroller instanceof HTMLElement)) return;

    // If truly nothing scrollable, don’t interfere
    const canScroll = scroller.scrollHeight > scroller.clientHeight || scroller.scrollWidth > scroller.clientWidth;
    if (!canScroll) return;

    // Apply manual scroll
    const dy = e.deltaY || 0;
    const dx = e.deltaX || 0;
    if (dy) scroller.scrollTop += dy;
    if (dx) scroller.scrollLeft += dx;

    // Beat DCV/global listeners
    e.preventDefault();
    e.stopPropagation();
    (e as unknown as { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.();
  }, []);

  useLayoutEffect(() => {
    // capture + passive:false so we can preventDefault
    const opts: AddEventListenerOptions = { capture: true, passive: false };
    document.addEventListener("wheel", wheelCaptureHandler, opts);
  
    return () => {
      const rmOpts: EventListenerOptions = { capture: true };
      document.removeEventListener("wheel", wheelCaptureHandler, rmOpts);
    };
  }, [wheelCaptureHandler]);  

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center" aria-modal="true" role="dialog">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />

          {/* dialog */}
          <div
            ref={dialogRef}
            className="relative w-[920px] max-w-[99vw] max-h-[85vh] rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col"
          >
            {/* header */}
            <div className="px-4 py-3 border-b dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="text-base font-semibold">{title}</div>
                <div className="ml-auto" />
                <button
                  title="Close"
                  className="rounded px-2 py-1 text-sm border dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  onClick={() => onOpenChange(false)}
                >
                  ✕
                </button>
              </div>

              {/* ✅ Note */}
              <div className="mt-2 rounded-lg border border-amber-300/60 bg-amber-50/70 px-3 py-2 text-[11px] text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/20 dark:text-amber-200">
                <div className="font-semibold">Note</div>
                <div className="mt-0.5 leading-relaxed">
                  File uploads and downloads go to/from the <b>SensePC Desktop</b> directory.
                </div>
              </div>
            </div>

            {/* body: avoid nested scroll conflicts; FileTransferPanel handles scrolling */}
            <div className="p-0 flex-1 min-h-0 overflow-hidden">
              <FileTransferPanel conn={conn} className="h-full" />
            </div>
          </div>
        </div>
      )}

      {/* Global drag overlay */}
      {isGlobalDrag && (
        <div className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center">
          <div className="absolute inset-0 bg-sky-600/10" />
          <div className="relative px-4 py-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200 text-sm shadow-lg">
            Drop files inside the <b>File storage</b> panel to upload
          </div>
        </div>
      )}
    </>
  );
};

export default FileStorageModal;
