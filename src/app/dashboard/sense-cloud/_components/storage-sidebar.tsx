import type { RootState } from "@/redux/store";

import { useGetUsageQuery } from "@/api/fileManagerAPI";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

import { useSelector } from "react-redux";

import { Upload, AlertCircle } from "lucide-react";

import { categories } from "../data";
import { formatBytes } from "../utils";

interface SidebarPanelProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  onUploadClick: () => void;
}

export function SidebarPanel({
  selectedCategory,
  onSelectCategory,
  onUploadClick,
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
    <div
      data-testid="dashboard-sense-cloud-sidebar"
      className="w-full lg:w-[265px] p-6 pr-4 border-b md:border-0 md:border-r border-border font-['Space_Grotesk']"
    >
      <header className="inline-flex flex-col items-start gap-1 mb-12">
        <h1 className="w-fit font-['Space_Grotesk'] font-bold text-2xl md:text-3xl mt-[-1.00px] text-[#020816] dark:text-white whitespace-nowrap">
          Sense Cloud
        </h1>
        <p className="w-fit font-['Space_Grotesk'] text-base text-[#454545] dark:text-[#b8c2d5] whitespace-nowrap">
          Manage your files and folders
        </p>
      </header>

      <div className="mb-8">
        <Card className="bg-[rgba(37,48,240,0.07)] border-[rgba(37,48,240,0.10)] dark:bg-[#ffffff08] dark:border-[#ffffff1a] !rounded-[10px] !md:rounded-xl w-full">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-6">
              <span className="font-['Space_Grotesk'] text-base font-semibold">
                Storage
              </span>
              {isLoading ? (
                <span className="font-['Space_Grotesk'] text-base font-semibold">
                  Loading…
                </span>
              ) : error || !data ? (
                <span className="font-['Space_Grotesk'] text-base font-semibold">
                  —
                </span>
              ) : (
                <span className="font-['Space_Grotesk'] text-base font-semibold">
                  {usedFormatted} / {totalFormatted}
                </span>
              )}
            </div>

            {!isLoading && !error && data && (
              <>
                <Progress
                  value={usagePercentage}
                  className={`h-2 ${
                    usagePercentage > 90
                      ? "bg-red-200"
                      : "bg-[#ced1fc] dark:bg-[#FFFFFF1A]"
                  }`}
                />
                {usagePercentage > 90 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-['Space_Grotesk']">
                      Storage almost full
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-2">
          <Button
            size="default"
            variant="default"
            className="w-full font-['Space_Grotesk']"
            onClick={onUploadClick}
            data-testid="storage-upload-button"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div>
        <h3 className="font-['Space_Grotesk'] mb-4 text-base font-semibold">
          Categories
        </h3>
        <div className="pr-2">
          <div className="space-y-2 max-h-[40vh] md:max-h-max overflow-y-auto md:overflow-hidden">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "sidebar" : "ghost"}
                className={`w-full justify-start font-['Space_Grotesk'] ${
                  selectedCategory === category.name
                    ? "text-[#020816] dark:text-white hover:text-[#020816]  border border-[#2530F0] bg-[rgba(37,48,240,0.10)] dark:border-[rgba(255,255,255,0.10)] dark:bg-[#ffffff08]"
                    : "text-[#454545] dark:text-[#B9C2D5] hover:text-[#020816] hover:border hover:border-[#2530F0] hover:bg-[rgba(37,48,240,0.10)] dark:hover:text-white dark:hover:border-transparent dark:hover:bg-[#ffffff08]"
                }`}
                onClick={() => onSelectCategory(category.name)}
              >
                <category.icon className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
