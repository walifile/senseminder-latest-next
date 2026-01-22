"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DEFAULT_STORAGE_REGION } from "@/constants/storage-regions";
import {
  useDedupScanMutation,
  useDedupMergeMutation,
} from "@/api/fileManagerAPI";

import { Logger } from "@/lib/utils/logger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Copy, Trash2, Loader2, FileText, RefreshCw } from "lucide-react";

import {
  formatFileSize,
  getFolderForItem,
  formatDuplicateStats,
  buildDuplicateGroupKey,
} from "../utils";
import {
  paginateGroups,
  DEFAULT_PAGE_SIZE,
  buildPageNumbersWindow,
  areAllPageItemsSelected,
  DEFAULT_MAX_PAGE_BUTTONS,
} from "../utils/pagination";

import type {
  DuplicateGroup,
  DuplicatesProps,
  DuplicateScanResponse,
} from "../types";

const Duplicates: React.FC<DuplicatesProps> = ({
  userId,
  region = DEFAULT_STORAGE_REGION,
}) => {
  const [scan, setScan] = useState<DuplicateScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [merging, setMerging] = useState(false);
  const [dedupScan] = useDedupScanMutation();
  const [dedupMerge] = useDedupMergeMutation();

  const panelClasses =
    "rounded-lg border border-[rgba(37,48,240,0.12)] bg-[rgba(37,48,240,0.07)] dark:border-[#ffffff1a] dark:bg-[#ffffff0a]";
  const cardClasses =
    "rounded-md border border-[rgba(37,48,240,0.12)] bg-[rgba(37,48,240,0.04)] dark:border-[#ffffff14] dark:bg-[#ffffff08]";
  const headingText = "text-[#020816] dark:text-white";
  // const mutedText = "text-[#454545] dark:text-[#B9C2D5]";
  const pillClasses =
    "inline-flex items-center rounded-full bg-[rgba(37,48,240,0.12)] px-2 py-0.5 text-[10px] font-medium text-[#020816] dark:bg-[#ffffff12] dark:text-white";

  // ✅ Font helpers (same font style you’ve been applying elsewhere)
  // const headingFontClass =
  //   "justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8";
  const subheadingFontClass =
    "font-['Space_Grotesk'] font-semibold tracking-[-0.3px] text-[#020816] dark:text-white";
  const bodyFontClass =
    "font-['Inter'] text-[#454545] dark:text-[#B9C2D5]";
  const smallFontClass =
    "font-['Inter']";

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const maxPageButtons = DEFAULT_MAX_PAGE_BUTTONS;

  const { totalGroups, totalPages, startIndex, endIndex, pageGroups } =
    paginateGroups<DuplicateGroup>(scan?.groups, page, pageSize);

  // Page number window (1-10, 11-20, etc.)
  const pageNumbers = buildPageNumbersWindow(page, maxPageButtons, totalPages);

  // "Select all on this page"
  const allOnPageSelected = areAllPageItemsSelected(
    pageGroups,
    selected,
    buildDuplicateGroupKey
  );

  const toggleSelectAllOnPage = () => {
    if (!scan || pageGroups.length === 0) return;

    const pageKeys = pageGroups.map(buildDuplicateGroupKey);

    if (allOnPageSelected) {
      setSelected((prev) => prev.filter((k) => !pageKeys.includes(k)));
    } else {
      setSelected((prev) => {
        const set = new Set(prev);
        pageKeys.forEach((k) => set.add(k));
        return Array.from(set);
      });
    }
  };

  // dY"1 Load duplicates
  const fetchDuplicates = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await dedupScan({ userId, region }).unwrap();
      setScan(response);
      setSelected([]);
      setPage(1); // reset to first page on new scan
    } catch (err: unknown) {
      Logger.error("Duplicate scan failed", err);

      const msg =
        err instanceof Error ? err.message : "Scan failed. Please try again.";
      setError(msg);

      toast({
        title: "Scan failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, region, dedupScan]);

  // dY"1 Merge selected duplicates
  const handleMerge = async () => {
    if (!scan || selected.length === 0) {
      toast({
        title: "Nothing selected",
        description: "Select at least one group to merge.",
      });
      return;
    }

    const groupsToMerge = scan.groups.filter((g) =>
      selected.includes(buildDuplicateGroupKey(g))
    );

    const payload = {
      userId,
      region,
      groups: groupsToMerge.map((g) => ({
        primaryId: g.primary.id,
        duplicates: g.duplicates.map((d) => d.id),
      })),
    };

    try {
      setMerging(true);
      const result = await dedupMerge({
        ...payload,
        deleteFromS3: true,
      }).unwrap();

      const freed = result?.freedBytes ?? 0;
      const removed = result?.removedFiles ?? 0;

      toast({
        title: "Duplicates merged",
        description: `Removed ${removed} files and freed ${formatFileSize(
          freed
        )}.`,
      });

      await fetchDuplicates();
    } catch (err: unknown) {
      Logger.error("Duplicate merge failed", err);

      const msg =
        err instanceof Error ? err.message : "Could not merge duplicates.";

      toast({
        title: "Merge failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setMerging(false);
    }
  };

  // dY"1 Select toggle for a single group
  const toggleGroup = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    void fetchDuplicates();
  }, [fetchDuplicates]);

  return (
    <ScrollArea
      data-testid="dashboard-sense-cloud-duplicate-cleanup"
      className="h-full flex-1"
    >
      <div className="p-4 font-['Inter']">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Header card */}
          <div className={`flex flex-col gap-4 p-4 shadow-sm ${panelClasses}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(37,48,240,0.12)] dark:bg-[#ffffff12]">
                    <Copy className="h-4 w-4 text-[#2530F0] dark:text-white" />
                  </span>

                  <div>
                    <h3 className={subheadingFontClass}>Duplicate files</h3>
                    <p className={`mt-1 text-xs ${bodyFontClass}`}>
                      Find and clean up files with identical names and sizes.
                      The original is kept, duplicates are removed.
                    </p>
                  </div>
                </div>

                {/* Select all + pagination summary */}
                {totalGroups > 0 && (
                  <div
                    className={`flex flex-wrap items-center gap-3 text-xs ${bodyFontClass}`}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(37,48,240,0.22)] bg-[rgba(37,48,240,0.10)] px-2.5 py-1 transition-colors hover:bg-[rgba(37,48,240,0.16)] dark:border-[#ffffff26] dark:bg-[#ffffff12] dark:hover:bg-[#ffffff1f]"
                      onClick={toggleSelectAllOnPage}
                    >
                      <Checkbox
                        checked={allOnPageSelected}
                        onCheckedChange={toggleSelectAllOnPage}
                        className="h-3 w-3 border-[rgba(37,48,240,0.5)] dark:border-[#ffffff3d] data-[state=checked]:border-[#2530F0] data-[state=checked]:bg-[#2530F0] dark:data-[state=checked]:border-white dark:data-[state=checked]:bg-white"
                      />
                      <span className="font-medium text-[#020816] dark:text-white font-['Inter']">
                        Select all groups on this page
                      </span>
                    </button>

                    <span className={`text-[11px] ${smallFontClass}`}>
                      Page {page} of {totalPages} - showing {pageGroups.length} of{" "}
                      {totalGroups} duplicate groups
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDuplicates()}
                  disabled={loading}
                  className="font-['Inter']"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Rescan
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={handleMerge}
                  disabled={merging || selected.length === 0}
                  className="font-['Inter']"
                >
                  {merging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Merge selected
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* High-level stats inline with header for quick glance */}
            {scan?.stats && (
              <div className={`mt-2 flex flex-wrap gap-2 rounded-md bg-[rgba(37,48,240,0.08)] p-3 text-xs ${bodyFontClass} dark:bg-[#ffffff0a]`}>
                {formatDuplicateStats(scan.stats)}
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive font-['Inter']">
                {error}
              </div>
            )}
          </div>

          {/* Main content: loading / empty / list */}
          {loading && (
            <div
              className={`flex h-[260px] flex-col items-center justify-center gap-2 text-xs ${panelClasses} ${bodyFontClass}`}
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className={`font-['Space_Grotesk'] font-semibold ${headingText}`}>
                Scanning your storage for duplicates...
              </p>
              <p className={`max-w-xs text-center text-[11px] ${bodyFontClass}`}>
                This may take a moment if you have a large number of files.
              </p>
            </div>
          )}

          {!loading && scan && scan.groups.length === 0 && (
            <div
              className={`flex h-[260px] flex-col items-center justify-center gap-3 text-center ${panelClasses}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(37,48,240,0.08)] dark:bg-[#ffffff12]">
                <FileText className="h-6 w-6 text-[#2530F0] dark:text-white" />
              </div>
              <div>
                <h3 className={`font-['Space_Grotesk'] font-semibold text-sm ${headingText}`}>
                  No duplicates found
                </h3>
                <p className={`mt-1 text-xs ${bodyFontClass}`}>
                  All your files are unique - nothing to clean up right now.
                </p>
              </div>
            </div>
          )}

          {/* Duplicate groups with pagination */}
          {!loading && scan && scan.groups.length > 0 && (
            <div className={`flex flex-col gap-3 p-3 ${panelClasses}`}>
              {/* List header summary */}
              <div
                className={`flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(37,48,240,0.12)] pb-2 text-[11px] ${bodyFontClass} dark:border-[#ffffff14]`}
              >
                <span>
                  Showing groups {startIndex + 1}-{Math.min(endIndex, totalGroups)} of{" "}
                  {totalGroups}
                </span>
                <span>
                  Selected groups:{" "}
                  <span className="font-semibold font-['Inter']">
                    {selected.length.toString()}
                  </span>
                </span>
              </div>

              {/* Groups list */}
              <div className="space-y-3">
                {pageGroups.map((group) => {
                  const key = buildDuplicateGroupKey(group);
                  const selectedFlag = selected.includes(key);
                  const count = group.count ?? group.duplicates.length + 1;
                  const primaryFolder = getFolderForItem(group.primary, userId);

                  return (
                    <div
                      key={key}
                      className={`${cardClasses} p-3 text-xs shadow-sm transition-colors hover:bg-[rgba(37,48,240,0.08)] dark:hover:bg-[#ffffff10] font-['Inter']`}
                    >
                      {/* Group header row */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-1 items-start gap-2">
                          <Checkbox
                            checked={selectedFlag}
                            onCheckedChange={() => toggleGroup(key)}
                            className="mt-1 border-[rgba(37,48,240,0.5)] dark:border-[#ffffff3d] data-[state=checked]:border-[#2530F0] data-[state=checked]:bg-[#2530F0] dark:data-[state=checked]:border-white dark:data-[state=checked]:bg-white"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`truncate text-sm font-semibold ${headingText} font-['Inter']`}
                              >
                                {group.groupKey.fileName}
                              </span>
                              <Badge
                                variant="outline"
                                className="border-dashed border-[rgba(37,48,240,0.4)] text-[10px] text-[#2530F0] dark:border-[#ffffff33] dark:text-white font-['Inter']"
                              >
                                {count} copies
                              </Badge>
                            </div>
                            <div className={`flex flex-wrap gap-3 text-[11px] ${bodyFontClass}`}>
                              <span>
                                Each: {formatFileSize(group.groupKey.sizeBytes ?? 0)}
                              </span>
                              {group.totalBytes && (
                                <span>
                                  Total space used: {formatFileSize(group.totalBytes)}
                                </span>
                              )}
                            </div>
                            <div className="mt-1">
                              <span className={`${pillClasses} gap-1`}>
                                <span className="mr-1 opacity-70 font-['Inter']">
                                  Primary location:
                                </span>
                                <span className="font-mono text-[10px]">
                                  {primaryFolder === "/" ? "/" : `/${primaryFolder}`}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={`text-right text-[11px] ${bodyFontClass}`}>
                          <span className="font-medium font-['Inter']">Keeping original</span>
                          <div className={`mt-0.5 max-w-[220px] truncate text-xs font-semibold ${headingText} font-['Inter']`}>
                            {group.primary.fileName}
                          </div>
                        </div>
                      </div>

                      {/* Duplicates list */}
                      <div
                        className={`mt-3 space-y-1 border-t border-[rgba(37,48,240,0.12)] pt-2 pl-7 text-[11px] ${bodyFontClass} dark:border-[#ffffff14]`}
                      >
                        {group.duplicates.map((dup) => {
                          const dupFolder = getFolderForItem(dup, userId);
                          return (
                            <div
                              key={dup.id}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="flex min-w-0 flex-col">
                                <div className="flex items-center gap-1">
                                  <Trash2 className="h-3 w-3 opacity-70" />
                                  <span className={`truncate ${headingText} font-['Inter']`}>
                                    {dup.fileName}
                                  </span>
                                </div>
                                <span className={`mt-0.5 w-fit ${pillClasses}`}>
                                  <span className="mr-1 opacity-70 font-['Inter']">
                                    Will be deleted from:
                                  </span>
                                  <span className="font-mono text-[10px]">
                                    {dupFolder === "/" ? "/" : `/${dupFolder}`}
                                  </span>
                                </span>
                              </div>
                              <span className={`whitespace-nowrap ${headingText} font-['Inter']`}>
                                {formatFileSize(dup.sizeBytes ?? group.groupKey.sizeBytes)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div
                  className={`mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(37,48,240,0.12)] pt-2 text-[11px] ${bodyFontClass} dark:border-[#ffffff14]`}
                >
                  <span>
                    Showing {startIndex + 1}-{Math.min(endIndex, totalGroups)} of{" "}
                    {totalGroups} groups
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 font-['Inter']"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>

                    {/* Page number window (max 10 visible) */}
                    <div className="flex items-center gap-1">
                      {pageNumbers.map((p) => (
                        <Button
                          key={p}
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          className="h-7 px-2 text-[11px] font-['Inter']"
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 font-['Inter']"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* (optional) Keeping your global heading style available if you ever need it */}
          {/* <div className={headingFontClass}>Duplicate files</div> */}
          {/* headingFontClass is declared to match your standard heading style */}
        </div>
      </div>
    </ScrollArea>
  );
};

export default Duplicates;
