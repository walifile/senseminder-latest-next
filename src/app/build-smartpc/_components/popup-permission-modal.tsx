"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MousePointer2, AlertCircle } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const PopupPermissionModal = ({ open, onClose }: Props) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
      {/* Header */}
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            Allow pop-ups and redirects for SensePC
          </DialogTitle>
        </div>
      </DialogHeader>

      {/* Tutorial Content */}
      <div className="space-y-8">
        <p className="text-muted-foreground text-base">
          To continue using SensePC, please allow pop-ups and redirects in your browser.
          Follow these quick steps to enable them.
        </p>

        {/* Visual Guide */}
        <div className="bg-muted/50 rounded-lg p-6 border border-border">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {/* Browser Mockup */}
              <div className="w-full max-w-md h-16 bg-background rounded-lg shadow-md border border-border flex items-center px-4 gap-3">
                {/* Browser Controls */}
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>

                {/* URL Bar */}
                <div className="flex-1 bg-muted rounded px-3 py-1.5 text-sm text-muted-foreground">
                  https://sensepc.com
                </div>

                {/* Blocked Icon */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white animate-pulse">
                    <svg
                      className="w-5 h-5"
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
                    className="absolute -top-2 -right-2 text-primary animate-bounce"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm font-medium">
            Click the{" "}
            <span className="font-semibold">
              blocked pop-up icon or "view site information" icon
            </span>{" "}
            in your browser’s address bar.
          </p>
        </div>

        {/* Step-by-step Tutorial */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            Enable pop-ups in three steps:
          </h3>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">
                  Click the pop-up blocked icon
                </p>
                <p className="text-sm text-muted-foreground">
                  It appears at the top-right corner of your browser, beside
                  the address bar.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">
                  Choose “Always allow pop-ups and redirects from this site”
                </p>
                <p className="text-sm text-muted-foreground">
                  This ensures SensePC can open your desktop viewer properly.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Click “Done” or “Allow”</p>
                <p className="text-sm text-muted-foreground">
                  Once confirmed, SensePC will automatically open the viewer
                  window.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Method */}
        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Alternative method (if icon not visible):
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Go to your browser <strong>Settings</strong> →{" "}
            <strong>Privacy and Security</strong> →{" "}
            <strong>Site Settings</strong> →{" "}
            <strong>Pop-ups and redirects</strong> → Add{" "}
            <span className="font-medium text-foreground">
              https://sensepc.com
            </span>{" "}
            to the “Allowed” list.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onClose}
            variant="default"
            size="lg"
            className="px-8"
          >
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default PopupPermissionModal;
