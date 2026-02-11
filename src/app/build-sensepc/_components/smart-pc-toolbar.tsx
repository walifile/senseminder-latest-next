"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DashboardSearch from "@/components/ui/dashboard/search";

import { List, LayoutGrid, HammerIcon } from "lucide-react";

type Props = {
  isMember: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  handleShowNewPCDialog: () => void;
};

const SmartPcToolbar = ({
  isMember,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  handleShowNewPCDialog,
}: Props) => (
  <div className="flex flex-col gap-5 font-['Space_Grotesk']">
    {/* Header row: title + subtitle + primary button */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-['Space_Grotesk'] text-[32px] font-semibold tracking-[-0.5px] text-[#020816] dark:text-white">
          Sense PCs
        </h1>
        <p className="font-['Space_Grotesk'] text-[16px] leading-6 tracking-[-0.3px] text-[#454545] dark:text-[#b9c2d5]">
          Manage your Cloud Computer
        </p>
      </div>

      {!isMember && (
        <Button
          onClick={handleShowNewPCDialog}
          className="hidden sm:inline-flex rounded-full px-7 py-4 ml-auto bg-gradient-to-l from-[#a801ba] to-[#2530f0] text-[16px] font-medium leading-6 text-white hover:opacity-95 font-['Space_Grotesk']"
          data-testid="sensepc-build-button"
        >
          <HammerIcon className="h-4 w-4" />
          Build Sense PC
        </Button>
      )}
    </div>

    {/* Divider under header */}
    <div className="h-px w-full bg-black/10 dark:bg-white/10" />

    {/* Search + view toggles row */}
    <div className="flex items-center gap-4">
      {/* 🔍 Reusable dashboard search component */}
      <DashboardSearch
        id="search-pcs"
        name="search-pcs"
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search PCs by name, description, or region..."
      />

      {/* Single view toggle chip */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="p-0 bg-transparent shadow-none border-none hover:bg-transparent"
          aria-label={
            viewMode === "grid"
              ? "Switch to list view"
              : "Switch to grid view"
          }
        >
          <div className="flex h-14 w-14 items-center justify-center">
            <div
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-[18px]",
                "bg-white/20 dark:bg-white/20",
                "before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-full",
                "before:[background:linear-gradient(270deg,rgba(168,1,186,0.85)_0%,rgba(37,48,240,0.85)_100%)]",
                "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
                "before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:pointer-events-none"
              )}
            >
              {viewMode === "grid" ? (
                <LayoutGrid className="relative z-[1] h-5 w-5 text-slate-900 dark:text-white" />
              ) : (
                <List className="relative z-[1] h-5 w-5 text-slate-900 dark:text-white" />
              )}
            </div>
          </div>
        </Button>
      </div>
    </div>

    {/* Bottom divider line */}
    <div className="h-px w-full bg-black/10 dark:bg-white/10" />
  </div>
);

export default SmartPcToolbar;
