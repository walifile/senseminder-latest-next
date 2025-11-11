
"use client";

import React, { useRef, useState, useEffect } from "react";

import { makeGlobalDragManager } from "./file-transfer/utils";
import FileTransferPanel from "./file-transfer/file-transfer-panel";

import type { FileStorageModalProps } from "./file-transfer/types"; 


const NOOP_CLEANUP = () => {};

const FileStorageModal: React.FC<FileStorageModalProps> = ({
  conn,
  open,
  onOpenChange,
  autoOpenOnGlobalDrag = true,
  title = "File storage",
}) => {
  const [isGlobalDrag, setIsGlobalDrag] = useState(false);

  const openRef = useRef(open);
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

  return (
    <>
      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => onOpenChange(false)}
          />
          {/* dialog */}
          <div className="relative w-[920px] max-w-[99vw] max-h-[85vh] rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
            {/* header */}
            <div className="px-4 py-3 border-b dark:border-zinc-800 flex items-center gap-2">
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
            {/* body */}
            <div className="p-0 flex-1 min-h-0 overflow-auto max-h-[60vh]">
              <FileTransferPanel conn={conn} className="h-full max-h-[60vh] overflow-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Global drag overlay (visual only; drops pass through) */}
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
