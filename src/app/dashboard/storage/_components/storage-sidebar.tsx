import { AlertCircle, FolderPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetUsageQuery } from "@/api/fileManagerAPI";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { formatBytes } from "../utils";
import { categories } from "../data";

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
    <div className="w-full md:w-64 p-4 md:border-r border-border">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Storage</span>
          {isLoading ? (
            <span className="text-xs">Loading…</span>
          ) : error || !data ? (
            <span className="text-xs">—</span>
          ) : (
            <span className="text-xs">
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

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            size="sm"
            variant="default"
            className="w-full"
            onClick={onUploadClick}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={onNewFolderClick}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div>
        <h3 className="text-sm font-medium mb-3">Categories</h3>
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-1">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={
                  selectedCategory === category.name ? "secondary" : "ghost"
                }
                className="w-full justify-start"
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
