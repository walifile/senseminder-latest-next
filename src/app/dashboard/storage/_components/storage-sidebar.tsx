import type { RootState } from "@/redux/store";

import { useGetUsageQuery } from "@/api/fileManagerAPI";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useSelector } from "react-redux";

import { Upload, FolderPlus, AlertCircle } from "lucide-react";

import { categories } from "../data";
import { formatBytes } from "../utils";

interface SidebarPanelProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  onUploadClick: () => void;
  onNewFolderClick: () => void;
}

export function SidebarPanel({
  selectedCategory,
  onSelectCategory,
  onUploadClick,
  onNewFolderClick,
}: SidebarPanelProps) {
  const userId = useSelector((s: RootState) => s.auth.user?.id)!;
  const { data, isLoading, error } = useGetUsageQuery({ userId });

  const totalBytes = 1024 ** 4;
  const usedBytes = data?.totalBytes ?? 0;
  const usedFormatted = formatBytes(usedBytes);
  const totalFormatted = formatBytes(totalBytes);
  const usagePercentage = data
    ? Math.min(100, (usedBytes / totalBytes) * 100)
    : 0;

  return (
    <div className="w-full md:w-[265px] p-6 pr-4 md:border-r border-border">
      <header className="inline-flex flex-col items-start gap-1 mb-12">
        <h1 className="w-fit font-space-grotesk font-bold text-2xl md:text-3xl mt-[-1.00px] text-white whitespace-nowrap">
          Sense Cloud
        </h1>
        <p className="w-fit text-base text-[#b8c2d5] whitespace-nowrap">
          Manage your files and folders
        </p>
      </header>
      <div className="mb-8">
        <Card className="bg-[#ffffff08] border-[#ffffff1a] !rounded-[10px] !md:rounded-xl w-full">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-6">
              <span className="text-base font-semibold">Storage</span>
              {isLoading ? (
                <span className="text-base font-semibold">Loading…</span>
              ) : error || !data ? (
                <span className="text-base font-semibold">—</span>
              ) : (
                <span className="text-base font-semibold">
                  {usedFormatted} / {totalFormatted}
                </span>
              )}
            </div>

            {!isLoading && !error && data && (
              <>
                <Progress
                  value={usagePercentage}
                  className={`h-2 ${usagePercentage > 90 ? "bg-red-200" : ""}`}
                />
                {usagePercentage > 90 && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>Storage almost full</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2 mt-6">
          <Button
            size="default"
            variant="default"
            className="w-full"
            onClick={onUploadClick}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button
            size="default"
            variant="outline"
            className="w-full"
            onClick={onNewFolderClick}
          >
            <FolderPlus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div>
        <h3 className="text-base font-semibold mb-4">Categories</h3>
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={
                  selectedCategory === category.name ? "sidebar" : "ghost"
                }
                className={`w-full justify-start ${selectedCategory === category.name ? 'text-white' : 'text-[#B9C2D5]'}`}
                onClick={() => onSelectCategory(category.name)}
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
