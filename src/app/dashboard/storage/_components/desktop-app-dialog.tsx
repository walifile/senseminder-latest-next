"use client";

import React, { useEffect } from "react";
import { Zap, FolderOpen, HardDrive, Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function DesktopAppDialog() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    if (pathname === "/dashboard/storage") {
      const hasSeenDialog = localStorage.getItem("desktopAppDialogShown");
      if (!hasSeenDialog) {
        localStorage.setItem("desktopAppDialogShown", "true");
        setIsOpen(true);
      }
    }
  }, [pathname]);

  const handleClose = () => {
    localStorage.setItem("desktopAppDialogShown", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] gap-10 py-12">
        <div className="flex gap-10 justify-between items-center">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-blue-400 text-sm font-medium mb-2 tracking-wide uppercase">
                WORK FASTER, SMARTER
              </p>
              <div className="text-2xl font-bold text-white">
                Get the desktop app
              </div>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">
                  Faster uploads for large or multiple files
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <FolderOpen className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">
                  Organize files right from your desktop
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <HardDrive className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">
                  Free up hard drive space on your computer
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center h-96 flex-1 bg-primary/10 p-10 rounded-2xl">
            <motion.div
              className="w-64 h-auto bg-[#2e2b4f] rounded-md shadow-lg"
              initial={{
                scale: 0.95,
                boxShadow: "0 0 0px rgba(59, 130, 246, 0.2)",
              }}
              animate={{
                scale: [0.95, 1, 0.95],
                boxShadow: [
                  "0 0 10px rgba(59, 130, 246, 0.2)",
                  "0 0 30px rgba(59, 130, 246, 0.2)",
                  "0 0 10px rgba(59, 130, 246, 0.2)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src="https://drive.proton.me/assets/static/empty-devices.5c663dd4e8a37b3eaea7.svg"
                alt="Laptop illustration"
                className="size-full"
              />
            </motion.div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-none"
          >
            Install later
          </Button>
          <Button onClick={handleClose}>
            <Download className="w-4 h-4" />
            <span>Install and continue</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
