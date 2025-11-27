/* eslint perfectionist/sort-imports: "off" */

"use client";

import React, { useState } from "react";
import { X, MousePointer2 } from "lucide-react";
import PopupPermissionModal from "@/app/build-sensepc/_components/popup-permission-modal";
import { useDraggablePopup } from "@/app/build-sensepc/hooks/use-draggable-pop-up";

type SlidePopupProps = {
  open: boolean;
  onClose: () => void;
};

const SlidePopup: React.FC<SlidePopupProps> = ({ open, onClose }) => {
  const [showModal, setShowModal] = useState(false);

  const { popupRef, handleMouseDown, isDragging } = useDraggablePopup(open);

  // === Handlers ===
  const handleOpenDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
    onClose(); 
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      {/* === MAIN SLIDE POPUP === */}
      <div
        ref={popupRef}
        onClick={(e) => e.stopPropagation()}
        className={[
          "fixed bottom-40 right-0 z-[9999]",
          "transition-transform transition-opacity duration-700 ease-in-out",
          "will-change-transform will-change-opacity",
          open
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-[120%] opacity-0 pointer-events-none",
        ].join(" ")}
        style={{
          transform: open ? "translate3d(0, 0, 0)" : "translate3d(120%, 0, 0)",
          cursor: isDragging.current ? "grabbing" : "default",
        }}
      >
        {/* CARD */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={[
            "w-[90vw] max-w-[440px] min-h-[230px] overflow-hidden select-none rounded-xl border",
            "border-violet-200/40 dark:border-violet-500/20",
            "bg-white dark:bg-[#1E222D]",
            "shadow-xl dark:shadow-2xl",
          ].join(" ")}
          style={{
            boxShadow:
              "0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.08)",
          }}
        >
          {/* HEADER with violet-blue gradient */}
          <div
            onMouseDown={handleMouseDown}
            className={[
              "flex items-center justify-between px-4 py-2 cursor-grab active:cursor-grabbing",
              "bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 dark:from-blue-700 dark:via-violet-700 dark:to-purple-700",
            ].join(" ")}
          >
            <h3 className="text-sm font-semibold text-white">
              Allow Pop-up and redirect
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close popup"
              className="rounded-md p-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60 transition-colors"
            >
              <X size={16} className="text-white/80 hover:text-white" />
            </button>
          </div>

          {/* === MAIN VISUAL CONTENT === */}
          <div className="flex flex-col justify-start gap-3 px-5 py-4">
            <div className="rounded-lg p-4 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-violet-50/30 dark:from-[#252A36] dark:to-[#2A2440]">
              <div className="flex items-center justify-center mb-3">
                <div className="relative">
                  <div className="w-[320px] h-14 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 bg-white dark:bg-[#1C2028] shadow-sm">
                    {/* Browser Dots */}
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>

                    {/* URL Bar */}
                    <div className="flex-1 rounded px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#2B2F3A]">
                      https://sensepc.com
                    </div>

                    {/* Blocked Icon */}
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white animate-pulse">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                      </div>
                      <MousePointer2
                        className="absolute -top-2 -right-2 text-violet-600 dark:text-violet-400 animate-bounce drop-shadow-lg"
                        size={18}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                Click the <span className="font-semibold">blocked</span>{" "}
                icon in your address bar and allow pop-ups and redirect to
                continue SensePC.
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-violet-50/20 dark:from-[#252A36] dark:to-[#2A2440]/50 px-4 py-2">
            <button
              onClick={handleOpenDetails}
              className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>

      {/* === DETAILS MODAL === */}
      <PopupPermissionModal open={showModal} onClose={handleCloseModal} />
    </>
  );
};

export default SlidePopup;
