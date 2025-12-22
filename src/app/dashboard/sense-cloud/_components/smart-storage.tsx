"use client";

import type { RootState } from "@/redux/store";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useListFilesQuery,
  useStarFileMutation,
  useCopyFilesMutation,
  useMoveFilesMutation,
  useUnstarFileMutation,
  useDeleteFilesMutation,
  useCancelShareMutation,
  useLazyDownloadFileQuery,
  useLazyDownloadFolderQuery,
  useLazyGetSharesForObjectQuery,
} from "@/api/fileManagerAPI";

import { Logger } from "@/lib/utils/logger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import {
  Card,
  // CardTitle,
  // CardHeader,
  CardContent,
  // CardDescription,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationContent,
  PaginationEllipsis,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { useSelector } from "react-redux";

import {
  Eye,
  Star,
  Grid,
  List,
  Copy,
  Globe,
  Upload,
  Trash2,
  Share2,
  Filter,
  Pencil,
  Loader2,
  FileText,
  Download,
  RefreshCw,
  HardDrive,
  ArrowLeft,
  FolderPlus,
  FolderIcon,
  ListFilter,
  ArrowUpDown,
  GripVertical,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginationItems } from "@/hooks/usePaginationItems";

import GradientSearchInput from "@/components/shared/inputs/gradient-search-input";

import GridView from "./grid-view";
import ShareDialog from "./share-dialog";
import { recentActivity } from "../data";
import UploadDialog from "./upload-dialog";
import RenameDialog from "./rename-dialog";
import FileTypeIcon from "./file-type-icon";
import Duplicates from "./duplicate-cleanup";
import { SidebarPanel } from "./storage-sidebar";
import MoveFilesDialog from "./move-files-dialog";
import CopyFilesDialog from "./copy-files-dialog";
import NewFolderDialog from "./new-folder-dialog";
import BulkShareDialog from "./bulk-share-dialog";
import SharedFilesPanel from "./shared-files-panel";
import StorageSyncDialog from "./storage-sync-dialog";
import FilePreviewDialog from "./file-preview-dialog";
import StoragePlansDialog from "./storag-plans-dialog";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import RecentActivityPanel from "./recent-activity-panel";
import ConfirmBulkDeleteDialog from "./confirm-bulk-delete-dialog";
import {
  formatDate,
  formatTimeAgo,
  formatFileSize,
  getRelativePath,
} from "../utils";

import type { FileItem } from "../types";

const CloudStorage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [selectedCategory, setSelectedCategory] = useState("All Files");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");
  const [showStoragePlans, setShowStoragePlans] = useState(false);
  const [showBulkShareDialog, setShowBulkShareDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [dropSession, setDropSession] = useState(0);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [selectedFileForShare, setSelectedFileForShare] =
    useState<FileItem | null>(null);

  // table
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<string[]>([]);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [dragOperation, setDragOperation] = useState<"copy" | "move" | null>(
    null
  );
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedStorageService, setSelectedStorageService] = useState<
    string | null
  >(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFilesToDelete, setSelectedFilesToDelete] = useState<string[]>(
    []
  );
  const [cancelShare] = useCancelShareMutation();
  const [triggerGetShares] = useLazyGetSharesForObjectQuery();
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [filters, setFilters] = useState({
    starred: false,
    shared: false,
    modified: "",
  });
  const [selectedFolder, setSelectedFolder] = useState<FileItem | null>(null);
  const [path, setPath] = useState<FileItem[]>([]);

  const [filePreview, setFilePreview] = useState<FileItem | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 500);

  Logger.log(lastSynced);

  // Cancel share (files or folders) using API hooks
  const cancelShareForObject = async (objectKey: string) => {
    try {
      const data = await triggerGetShares({ key: objectKey }).unwrap();
      const shareId = data?.items?.[0]?.shareId;
      if (!shareId) {
        toast({ title: "No active share", description: "Nothing to cancel." });
        return;
      }
      await cancelShare({ shareId }).unwrap();
      toast({ title: "Share cancelled" });
    } catch (e) {
      Logger.error("Cancel from list failed", e);
      toast({
        title: "Cancel failed",
        description: "Could not cancel share. Try again.",
        variant: "destructive",
      });
    }
  };

  const folderPath =
    path.length > 0 ? getRelativePath(path[path.length - 1].id) : "";

  Logger.log({ ">>>>>>>>>>>>": folderPath, path });

  const selectedType = (() => {
    if (selectedCategory === "All Files") {
      // Fallback to modified filter when no category is selected so older backends (type-only) still work.
      return filters.modified || "";
    }
    if (selectedCategory === "Folders") return "folder";
    if (selectedCategory === "Duplicates") {
      // We don't actually use this because we skip the query for duplicates,
      // but keep a safe fallback value.
      return filters.modified || "";
    }
    return selectedCategory.toLowerCase();
  })();

  const { data, error, isFetching, refetch } = useListFilesQuery(
    {
      userId,
      region: "virginia",
      type: selectedType,
      search: debouncedQuery,
      starred: filters.starred,
      shared: filters.shared,
      modified: filters.modified,
      folder: folderPath,
      sortBy,
      limit,
      page,
    },
    {
      // 🔹 Don't call list files API when viewing Duplicates
      skip: selectedCategory === "Duplicates",
    }
  );

  const files = data?.files || [];
  const pagination = data?.pagination || {};
  const paginationItems = usePaginationItems({
    currentPage: pagination.page || page,
    totalPages: pagination.pages || 0,
  });

  const [triggerDownloadFile] = useLazyDownloadFileQuery();
  const [triggerFolderDownload] = useLazyDownloadFolderQuery();
  const [starFile] = useStarFileMutation();
  const [unstarFile] = useUnstarFileMutation();
  const [deleteFiles] = useDeleteFilesMutation();
  const [copyFiles] = useCopyFilesMutation();
  const [moveFiles] = useMoveFilesMutation();

  Logger.log({ wali: files });

  const paths = path.map((f) => f.fileName).join("/");
  Logger.log({ paths });

  const handleFolderDownload = async (file: FileItem) => {
    if (!userId) return;

    const folderPath = getRelativePath(file.id);

    try {
      const { downloadUrl } = await triggerFolderDownload({
        userId,
        region: "virginia",
        folder: folderPath,
      }).unwrap();

      window.location.href = downloadUrl;
    } catch (err) {
      Logger.error("Folder download failed", err);
      toast({
        title: "Download Error",
        description: "Failed to download folder",
        variant: "destructive",
      });
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleUpload = () => {
    setShowUploadDialog(true);
  };

  const handleFolderSelection = (file: FileItem) => {
    if (file.fileType !== "folder") return;

    setPath((prev) => [...prev, file]);
    setSelectedFolder(file);
    setSelectedFiles([]);
  };

  const handleCloseFolder = () => {
    const newPath = path.slice(0, -1);
    setPath(newPath);
    setSelectedFolder(newPath[newPath.length - 1] || null);
    setSelectedFiles([]);
  };
  const handleCloseFolderback = () => {
    setPath([]);
    setSelectedFolder(null);
    setSelectedFiles([]);
  };

  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
    handleCloseFolderback();
    setPage(1);
  };

  const handleMoveSelected = (file: FileItem) => {
    setSelectedFiles([file.id]);
    setMoveDialogOpen(true);
  };

  const handleCopySelected = (file: FileItem) => {
    setSelectedFiles([file.id]);
    setCopyDialogOpen(true);
  };

  const handleRenameSelected = (file: FileItem) => {
    setFileToRename(file);
    setRenameDialogOpen(true);
  };

  const handleDownload = async (file: FileItem) => {
    if (!userId) return;

    setDownloadingFile(file.fileName);
    try {
      const { data } = await triggerDownloadFile({
        fileName: file.fileName,
        userId,
        region: "virginia",
        folder: selectedFolder?.fileName || "",
        key: file.id,
      });

      if (data?.downloadUrl) {
        const blobResp = await fetch(data.downloadUrl);
        const blob = await blobResp.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        toast({
          title: "Download Complete",
          description: `${file.fileName} has been downloaded successfully.`,
        });
      } else {
        toast({
          title: "Download Failed",
          description: "Could not generate download link. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      Logger.error("Error downloading file:", err);
      toast({
        title: "Download Error",
        description: "Something went wrong while downloading the file.",
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleBulkShare = () => {
    setShowBulkShareDialog(true);
  };

  const handleShare = (file: FileItem) => {
    setSelectedFileForShare(file);
    setShowShareDialog(true);
  };
  const visibleFiles = (data?.files as FileItem[]) || [];

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;

    if (selectedFiles.length > 20) {
      toast({
        title: "Too Many Files Selected",
        description: "You can delete a maximum of 20 files at once.",
        variant: "destructive",
      });
      return;
    }

    try {
      setBulkDeleteLoading(true);
      const filesToDelete = data.files.filter((file: FileItem) =>
        selectedFiles.includes(file.id)
      );

      const { userId, region } = filesToDelete[0];

      const fileNames = filesToDelete.map((file: FileItem) => {
        const isFolder = file.fileType === "folder";
        return {
          ...(file.id && { key: file.id }),
          fileName: file.fileName,
          ...(selectedFolder &&
            !file.id && { folder: selectedFolder.fileName }),
          ...(isFolder && !file.id && { folder: file.fileName }),
        };
      });

      await deleteFiles({
        region,
        userId,
        fileNames,
      }).unwrap();

      toast({
        title: `${fileNames.length} ${
          fileNames.length === 1 ? "item" : "items"
        } deleted`,
        description: "The selected files and folders have been moved to trash.",
        variant: "destructive",
      });

      setSelectedFiles([]);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      Logger.error("Error deleting files:", error);
      toast({
        title: "Error",
        description: "Some items could not be deleted.",
        variant: "destructive",
      });
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleStar = async (file: FileItem) => {
    if (!userId) return;

    try {
      const action = file.starred ? unstarFile : starFile;

      await action({
        region: selectedRegion,
        userId,
        key: file.id,
      }).unwrap();

      toast({
        title: file.starred ? "Unstarred" : "Starred",
        description: `"${file.fileName}" was ${
          file.starred ? "removed from" : "added to"
        } your starred items`,
      });
    } catch (err) {
      Logger.error("Star/unstar error:", err);
      toast({
        title: "Error",
        description: `Failed to ${file.starred ? "unstar" : "star"} the item.`,
        variant: "destructive",
      });
    }
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
  };

  const handleSort = (value: string) => {
    const sort = value as "name" | "date" | "size";
    setSortBy(sort);
    setPage(1);
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) => {
      if (prev.includes(fileId)) {
        return prev.filter((id) => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const handleSelectAllInPage = (checked: boolean) => {
    if (checked) {
      const fileIds = visibleFiles.map((file) => file.id);
      setSelectedFiles(fileIds);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.types.includes("Files")) {
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length > 0) {
        setDroppedFiles(files);
        setDropSession((prev) => prev + 1);
        setShowUploadDialog(true);
        toast({
          title: "Files ready to upload",
          description: `Added ${files.length} file(s) to the uploader.`,
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverFolderId(null);
  };

  const handleItemDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        fileIds: selectedFiles.includes(fileId) ? selectedFiles : [fileId],
        operation: e.ctrlKey ? "copy" : "move",
      })
    );

    e.dataTransfer.effectAllowed = e.ctrlKey ? "copy" : "move";

    setDragOperation(e.ctrlKey ? "copy" : "move");
    if (selectedFiles.includes(fileId)) {
      setDraggedFiles(selectedFiles);
    } else {
      setDraggedFiles([fileId]);
    }
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      draggedFiles.includes(folderId) ||
      e.dataTransfer.types.includes("Files")
    ) {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.dataTransfer.dropEffect = dragOperation || (e.ctrlKey ? "copy" : "move");
    setDragOverFolderId(folderId);
  };

  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
  };

  const handleFolderDrop = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedFiles.includes(folderId)) {
      return;
    }

    try {
      const dragData = JSON.parse(e.dataTransfer.getData("application/json"));
      const operation = dragData.operation || "move";
      const fileIds = dragData.fileIds || [];

      if (fileIds.length > 0) {
        const sourceFileNames = fileIds.map((id: string) =>
          getRelativePath(id)
        );

        const destinationFolder = getRelativePath(folderId);

        const filesData = {
          region: "virginia",
          userId,
          sourceFileNames,
          destinationFolder,
        };

        if (operation === "copy") {
          await copyFiles(filesData).unwrap();
        } else {
          await moveFiles(filesData).unwrap();
        }

        toast({
          title: `Files ${operation === "copy" ? "Copied" : "Moved"}`,
          description: `${fileIds.length} file(s) ${
            operation === "copy" ? "copied" : "moved"
          } successfully`,
        });

        setSelectedFiles([]);
        setDraggedFiles([]);
        setDragOverFolderId(null);
        setDragOperation(null);
      }
    } catch (error) {
      Logger.error("Error processing drop:", error);
    }
  };

  const handleConnectStorage = (serviceId: string) => {
    router.push(`/dashboard/sense-cloud/${serviceId}`);
  };

  const handleSync = (serviceId: string) => {
    setSyncInProgress(true);
    setSelectedStorageService(serviceId);

    setTimeout(() => {
      setSyncInProgress(false);
      setLastSynced(new Date().toISOString());
      toast({
        title: "Sync Complete",
        description: "Files synchronized successfully",
      });
    }, 2000);
  };

  const handleBulkDownload = async () => {
    if (!userId || selectedFiles.length === 0) return;

    setIsBulkDownloading(true);

    const filesToDownload = files.filter(
      (file: FileItem) =>
        selectedFiles.includes(file.id) && file.fileType !== "folder"
    );

    if (selectedFiles.length !== filesToDownload.length) {
      toast({
        title: "Invalid Selection",
        description: "Only files will be downloaded. Folders were skipped.",
        variant: "destructive",
      });
    }

    try {
      for (const file of filesToDownload) {
        const { data: downloadData } = await triggerDownloadFile({
          fileName: file.fileName,
          userId,
          region: "virginia",
          key: file.id,
        });

        if (downloadData?.downloadUrl) {
          const blobResp = await fetch(downloadData.downloadUrl);
          const blob = await blobResp.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = file.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } else {
          toast({
            title: "Download Failed",
            description: `Could not download ${file.fileName}.`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Bulk Download Complete",
        description: `${filesToDownload.length} file(s) downloaded.`,
      });
    } catch (error) {
      Logger.error("Bulk download error:", error);
      toast({
        title: "Error",
        description: "Bulk download failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <>
      <Card
        data-testid="dashboard-sense-cloud-smart-storage"
        className="relative !border-0 gradient-outline-border bg-[rgba(37,48,240,0.07)] dark:bg-[rgba(255,255,255,0.03)]"
      >
        {/* <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Sense Cloud</CardTitle>
              <CardDescription>Manage your files and folders</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStoragePlans(true)}
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Storage Plans
              </Button>
            </div>
          </div>
        </CardHeader> */}

        <CardContent className="p-0">
          <div
            data-testid="dashboard-sense-cloud-content"
            className={`flex flex-col lg:flex-row min-h-[600px] relative ${
              isDragging ? "bg-muted/50" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Drop files here</h3>
                  <p className="text-sm text-muted-foreground">
                    Drop files to upload them to this folder
                  </p>
                </div>
              </div>
            )}

            <SidebarPanel
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelection}
              onUploadClick={handleUpload}
            />

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="border-b border-border p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full overflow-x-auto scrollbar-hide">
                  {selectedFolder && (
                    <button
                      onClick={handleCloseFolder}
                      className="flex items-center"
                    >
                      <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                  <h3 className="flex-shrink-0 text-2xl font-semibold">
                    {selectedFolder
                      ? selectedFolder?.fileName
                      : selectedCategory}
                  </h3>

                  {selectedCategory !== "Duplicates" && (
                    <GradientSearchInput
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search files..."
                      id="searchstorage"
                      name="searchstorage"
                    />
                  )}

                  {/* <Button
                    variant="outline"
                    size="default"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync Storage
                  </Button> */}
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setShowStoragePlans(true)}
                    className="md:ml-auto h-[-webkit-fill-available]"
                  >
                    <HardDrive className="h-4 w-4" />
                    <span>Storage Plans</span>
                  </Button>
                </div>
              </div>
              {selectedCategory !== "Duplicates" && (
                <div className="p-4 flex flex-col lg:flex-row gap-4 items-center justify-between overflow-x-auto scrollbar-hide">
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    {selectedFiles.length > 0 && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCopyDialogOpen(true)}
                          className="text-base [&_svg]:size-5 gap-2"
                        >
                          <Copy className="h-5 w-5" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMoveDialogOpen(true)}
                          className="text-base [&_svg]:size-5 gap-2"
                        >
                          <FolderIcon className="h-5 w-5" />
                          Move
                        </Button>
                      </>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNewFolderDialog(true)}
                      className="text-base [&_svg]:size-5 gap-2"
                    >
                      <FolderPlus className="h-5 w-5" />
                      New
                    </Button>
                    {/* Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-base [&_svg]:size-5 text-[#454545] dark:text-[#B9C2D5] gap-2"
                        >
                          <Filter className="h-5 w-5" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                          checked={filters.modified === ""}
                          onCheckedChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              modified: "",
                            }))
                          }
                        >
                          All uploads
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filters.modified === "today"}
                          onCheckedChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              modified: "today",
                            }))
                          }
                        >
                          Uploaded today
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filters.modified === "week"}
                          onCheckedChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              modified: "week",
                            }))
                          }
                        >
                          Uploaded this week
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filters.modified === "month"}
                          onCheckedChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              modified: "month",
                            }))
                          }
                        >
                          Uploaded this month
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Region */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-base [&_svg]:size-5 text-[#454545] dark:text-[#B9C2D5] gap-2"
                        >
                          <Globe className="h-5 w-5" />
                          Region
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Select Location</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={selectedRegion}
                          onValueChange={handleRegionChange}
                        >
                          <DropdownMenuRadioItem value="us-east-1">
                            East Coast
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-base [&_svg]:size-5 text-[#454545] dark:text-[#B9C2D5] gap-2"
                        >
                          {/* {sortOrder === "asc" ? ( */}
                          <ArrowUpDown className="h-5 w-5" />
                          {/* // ) : (
                        //   <SortDesc className="h-4 w-4" />
                        // )} */}
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={sortBy}
                          onValueChange={handleSort}
                        >
                          <DropdownMenuRadioItem value="name">
                            Name
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="date">
                            Date
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="size">
                            Size
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* View toggle */}
                    {/* <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setViewMode(viewMode === "list" ? "grid" : "list")
                      }
                    >
                      {viewMode === "list" ? (
                        <Grid className="h-4 w-4" />
                      ) : (
                        <List className="h-4 w-4" />
                      )}
                    </Button> */}

                    {/* Refresh */}
                    {/* <Button size="sm" variant="ghost" onClick={() => refetch()}>
                      <RefreshCw className="h-4 w-4" />
                    </Button> */}

                    {/* More menu */}
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                <DropdownMenuItem
                                  onClick={handleBulkShare}
                                  disabled={selectedFiles.length !== 1}
                                  className={
                                    selectedFiles.length !== 1
                                      ? "cursor-not-allowed opacity-50 pointer-events-none w-full"
                                      : "w-full"
                                  }
                                >
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                              </div>
                            </TooltipTrigger>
                            {selectedFiles.length !== 1 && (
                              <TooltipContent side="left">
                                You can only share one file at a time
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>

                        <DropdownMenuItem
                          onClick={handleBulkDownload}
                          disabled={
                            selectedFiles.length === 0 || isBulkDownloading
                          }
                        >
                          {isBulkDownloading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (selectedFiles.length !== 0) {
                              setBulkDeleteDialogOpen(true);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                  </div>
                  <div className="flex w-full justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-base [&_svg]:size-5 gap-2"
                      onClick={() =>
                        setViewMode(viewMode === "list" ? "grid" : "list")
                      }
                    >
                      {viewMode === "list" ? (
                        <Grid className="h-5 w-5 text-[#2530F0] dark:text-white" />
                      ) : (
                        <List className="h-5 w-5 text-[#2530F0] dark:text-white" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-base [&_svg]:size-5 gap-2"
                      onClick={() => refetch()}
                    >
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-base [&_svg]:size-5 gap-2"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                <DropdownMenuItem
                                  onClick={handleBulkShare}
                                  disabled={selectedFiles.length !== 1}
                                  className={
                                    selectedFiles.length !== 1
                                      ? "cursor-not-allowed opacity-50 pointer-events-none w-full gap-2"
                                      : "w-full gap-2"
                                  }
                                  // className={"w-full"}
                                >
                                  <Share2 className="h-4 w-4" />
                                  Share
                                </DropdownMenuItem>
                              </div>
                            </TooltipTrigger>

                            {selectedFiles.length !== 1 && (
                              <TooltipContent side="left">
                                You can only share one file at a time
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>

                        <DropdownMenuItem
                          onClick={handleBulkDownload}
                          disabled={
                            selectedFiles.length === 0 || isBulkDownloading
                          }
                          className="gap-2"
                        >
                          {isBulkDownloading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              Download
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive gap-2"
                          onClick={() => {
                            if (selectedFiles.length !== 0) {
                              setBulkDeleteDialogOpen(true);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Selected
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
              {/* Tabs */}
              <Tabs defaultValue="files" className="flex-1 flex flex-col">
                {/* <TabsList className="border-b px-4" /> */}

                <div className="flex-1 overflow-hidden">
                  {selectedCategory === "Duplicates" ? (
                    !userId ? (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                        <FileText className="h-8 w-8 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">
                          Sign in to view duplicates
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          You need to be logged in to scan and merge duplicate
                          files.
                        </p>
                      </div>
                    ) : (
                      <Duplicates userId={userId} region="virginia" />
                    )
                  ) : (
                    <>
                      {/* ✅ Normal Files Tab */}
                      <TabsContent
                        value="files"
                        className="h-full m-0 p-0 data-[state=active]:flex flex-col"
                      >
                        {isFetching ? (
                          <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                            <h3 className="font-medium mb-2">
                              Fetching your files...
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Please wait while we load your sense cloud.
                            </p>
                          </div>
                        ) : (
                          // <ScrollArea className="flex-1 h-full">
                          <div className="flex-1 h-full">
                            {error || files.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                                <FileText className="h-8 w-8 text-muted-foreground mb-4" />
                                <h3 className="font-medium mb-2">
                                  No files found
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                  {searchQuery
                                    ? "Try adjusting your search query"
                                    : "Upload files or create a new folder to get started"}
                                </p>
                                {!searchQuery && (
                                  <div className="flex gap-4">
                                    <Button onClick={handleUpload}>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload Files
                                    </Button>
                                    <Button variant="outline" asChild>
                                      <Link href="/dashboard/tutorials">
                                        <GraduationCap className="h-4 w-4 mr-2" />
                                        View Tutorials
                                      </Link>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2 justify-between px-8">
                                {viewMode === "list" ? (
                                  <div className="rounded-2xl border border-[#ffffff1a] overflow-hidden bg-[#ffffff05]">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-blue-700/10 dark:bg-[#ffffff0f] hover:bg-blue-700/10 dark:hover:bg-[#ffffff0f]">
                                          <TableHead className="w-[40px] rounded-tl-xl border-r-0">
                                            <Checkbox
                                              checked={
                                                visibleFiles.length > 0 &&
                                                visibleFiles.every((file) =>
                                                  selectedFiles.includes(
                                                    file.id
                                                  )
                                                )
                                              }
                                              onCheckedChange={(checked) =>
                                                handleSelectAllInPage(!!checked)
                                              }
                                            />
                                          </TableHead>
                                          <TableHead className="border-l-0">
                                            Name
                                          </TableHead>
                                          <TableHead>Size</TableHead>
                                          <TableHead>Uploaded</TableHead>
                                          <TableHead className="border-r-0">
                                            Status
                                          </TableHead>
                                          <TableHead className="rounded-tr-xl border-l-0" />
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {(files as FileItem[]).map(
                                          (file, index) => (
                                            <TableRow
                                              key={file.id}
                                              className={`hover:bg-muted/50 ${
                                                dragOverFolderId === file.id
                                                  ? "bg-muted ring-2 ring-primary"
                                                  : ""
                                              }`}
                                              draggable
                                              onDragStart={(e) =>
                                                handleItemDragStart(e, file.id)
                                              }
                                              onDragOver={(e) =>
                                                file.fileType === "folder"
                                                  ? handleFolderDragOver(
                                                      e,
                                                      file.id
                                                    )
                                                  : undefined
                                              }
                                              onDragLeave={(e) =>
                                                file.fileType === "folder"
                                                  ? handleFolderDragLeave(e)
                                                  : undefined
                                              }
                                              onDrop={(e) =>
                                                file.fileType === "folder"
                                                  ? handleFolderDrop(e, file.id)
                                                  : undefined
                                              }
                                            >
                                              <TableCell className="border-r-0">
                                                <div className="flex items-center gap-2">
                                                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                                  <Checkbox
                                                    checked={selectedFiles.includes(
                                                      file.id
                                                    )}
                                                    onCheckedChange={() =>
                                                      handleFileSelect(file.id)
                                                    }
                                                  />
                                                </div>
                                              </TableCell>
                                              <TableCell className="border-l-0">
                                                <div
                                                  {...(file.fileType ===
                                                    "folder" && {
                                                    title:
                                                      "Click to open folder",
                                                  })}
                                                  className={`flex items-center gap-2 ${
                                                    file.fileType ===
                                                      "folder" &&
                                                    "cursor-pointer"
                                                  }`}
                                                  onClick={() => {
                                                    if (
                                                      file.fileType === "folder"
                                                    ) {
                                                      handleFolderSelection(
                                                        file
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div className="h-8 w-8 flex items-center justify-center">
                                                    <FileTypeIcon
                                                      index={index}
                                                      fileName={file.fileName}
                                                      fileType={file.fileType}
                                                      size="small"
                                                    />
                                                  </div>
                                                  <div>
                                                    <div className="flex items-center gap-1">
                                                      <span>
                                                        {file.fileName}
                                                      </span>
                                                      {file.starred && (
                                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                      )}
                                                    </div>
                                                    {file.shared && (
                                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        {/* reserved for shared-with count */}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </TableCell>
                                              <TableCell className="whitespace-nowrap">
                                                {formatFileSize(file?.size)}
                                              </TableCell>
                                              <TableCell className="whitespace-nowrap">
                                                {formatDate(file.createdAt)}
                                              </TableCell>
                                              <TableCell className="border-r-0">
                                                {file.shared ? (
                                                  <Badge
                                                    variant="outline"
                                                    className="bg-green-500/10 text-green-500 border-0 text-base font-normal px-4"
                                                  >
                                                    Shared
                                                  </Badge>
                                                ) : (
                                                  <Badge
                                                    variant="outline"
                                                    className="bg-amber-500/20 text-amber-500 border-0 text-base font-normal px-4"
                                                  >
                                                    Private
                                                  </Badge>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-right border-l-0">
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-8 w-8"
                                                    >
                                                      <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                    {file.type !== "folder" && (
                                                      <>
                                                        <DropdownMenuItem
                                                          onClick={() =>
                                                            setFilePreview(file)
                                                          }
                                                        >
                                                          <Eye className="h-4 w-4 mr-2" />
                                                          View
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                          disabled={
                                                            downloadingFile ===
                                                            file.fileName
                                                          }
                                                          onClick={() => {
                                                            if (
                                                              file.fileType ===
                                                              "folder"
                                                            ) {
                                                              handleFolderDownload(
                                                                file
                                                              );
                                                            } else {
                                                              handleDownload(
                                                                file
                                                              );
                                                            }
                                                          }}
                                                        >
                                                          {downloadingFile ===
                                                          file.fileName ? (
                                                            <>
                                                              <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                                                              Downloading...
                                                            </>
                                                          ) : (
                                                            <>
                                                              <Download className="h-4 w-4 mr-2" />
                                                              Download
                                                            </>
                                                          )}
                                                        </DropdownMenuItem>
                                                      </>
                                                    )}
                                                    <TooltipProvider>
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <div className="w-full">
                                                            <DropdownMenuItem
                                                              onClick={() =>
                                                                handleShare(
                                                                  file
                                                                )
                                                              }
                                                            >
                                                              <Share2 className="h-4 w-4 mr-2" />
                                                              Share
                                                            </DropdownMenuItem>
                                                          </div>
                                                        </TooltipTrigger>

                                                        {selectedFiles.length !==
                                                          1 && (
                                                          <TooltipContent side="left">
                                                            You can only share
                                                            one file at a time
                                                          </TooltipContent>
                                                        )}
                                                      </Tooltip>
                                                    </TooltipProvider>

                                                    {file.shared && (
                                                      <DropdownMenuItem
                                                        onClick={() =>
                                                          cancelShareForObject(
                                                            file.id
                                                          )
                                                        }
                                                      >
                                                        <Share2 className="h-4 w-4 mr-2" />
                                                        Cancel Share
                                                      </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                      onClick={() =>
                                                        handleStar(file)
                                                      }
                                                    >
                                                      <Star className="h-4 w-4 mr-2" />
                                                      {file.starred
                                                        ? "Unstar"
                                                        : "Star"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                      onClick={() =>
                                                        handleRenameSelected(
                                                          file
                                                        )
                                                      }
                                                    >
                                                      <Pencil className="h-4 w-4 mr-2" />
                                                      Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {file.fileType !==
                                                      "folder" && (
                                                      <DropdownMenuItem
                                                        onClick={() =>
                                                          handleMoveSelected(
                                                            file
                                                          )
                                                        }
                                                      >
                                                        <FolderIcon className="h-4 w-4 mr-2" />
                                                        Move Selected
                                                      </DropdownMenuItem>
                                                    )}
                                                    {file.fileType !==
                                                      "folder" && (
                                                      <DropdownMenuItem
                                                        onClick={() =>
                                                          handleCopySelected(
                                                            file
                                                          )
                                                        }
                                                      >
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy Selected
                                                      </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                      className="text-destructive"
                                                      onClick={() => {
                                                        setSelectedFilesToDelete(
                                                          [file.fileName]
                                                        );
                                                        setDeleteDialogOpen(
                                                          true
                                                        );
                                                      }}
                                                    >
                                                      <Trash2 className="h-4 w-4 mr-2" />
                                                      Delete
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              </TableCell>
                                            </TableRow>
                                          )
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                ) : (
                                  <GridView
                                    files={files as FileItem[]}
                                    selectedFiles={selectedFiles}
                                    dragOverFolderId={dragOverFolderId}
                                    setFilePreview={setFilePreview}
                                    handleItemDragStart={handleItemDragStart}
                                    handleFolderDragOver={handleFolderDragOver}
                                    handleFolderDragLeave={
                                      handleFolderDragLeave
                                    }
                                    handleFolderDrop={handleFolderDrop}
                                    handleFolderSelection={
                                      handleFolderSelection
                                    }
                                    handleFileSelect={handleFileSelect}
                                    handleShare={handleShare}
                                    cancelShareForObject={cancelShareForObject}
                                    handleStar={handleStar}
                                    handleMoveSelected={handleMoveSelected}
                                    handleCopySelected={handleCopySelected}
                                    setSelectedFilesToDelete={
                                      setSelectedFilesToDelete
                                    }
                                    setDeleteDialogOpen={setDeleteDialogOpen}
                                    handleDownload={handleDownload}
                                    formatFileSize={formatFileSize}
                                    formatDate={formatDate}
                                    handleRenameSelected={handleRenameSelected}
                                  />
                                )}

                                {/* ✅ Pagination */}
                                <div className="flex flex-col md:flex-row items-center justify-between overflow-x-auto scrollbar-hide px-4 py-4 gap-4">
                                  <div className="w-full md:w-auto text-sm text-muted-foreground whitespace-nowrap">
                                    Showing{" "}
                                    {pagination.total === 0
                                      ? 0
                                      : (pagination.page - 1) *
                                          pagination.limit +
                                        1}{" "}
                                    to{" "}
                                    {Math.min(
                                      pagination.page * pagination.limit,
                                      pagination.total
                                    )}{" "}
                                    of {pagination.total} files
                                  </div>

                                  <div className="w-full md:w-auto flex items-center space-x-4">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="ghost">
                                          <ListFilter className="h-4 w-4 mr-2" />
                                          Items per page
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                          Items per page
                                        </DropdownMenuLabel>
                                        <DropdownMenuRadioGroup
                                          value={String(limit)}
                                          onValueChange={(value) => {
                                            setLimit(Number(value));
                                            handlePageChange(1);
                                          }}
                                        >
                                          {[5, 10, 25].map((value) => (
                                            <DropdownMenuRadioItem
                                              key={value}
                                              value={String(value)}
                                            >
                                              {value}
                                            </DropdownMenuRadioItem>
                                          ))}
                                        </DropdownMenuRadioGroup>
                                      </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Pagination className="w-auto">
                                      <PaginationContent>
                                        <PaginationItem>
                                          <PaginationPrevious
                                            href="#"
                                            onClick={(event) => {
                                              event.preventDefault();
                                              if (pagination?.hasPrevious) {
                                                handlePageChange(page - 1);
                                              }
                                            }}
                                            className={
                                              pagination?.hasPrevious
                                                ? ""
                                                : "pointer-events-none opacity-50"
                                            }
                                          />
                                        </PaginationItem>
                                        {paginationItems.map((item, index) => {
                                          if (item === "ellipsis") {
                                            return (
                                              <PaginationItem
                                                key={`ellipsis-${index}`}
                                              >
                                                <PaginationEllipsis />
                                              </PaginationItem>
                                            );
                                          }

                                          return (
                                            <PaginationItem key={item}>
                                              <PaginationLink
                                                href="#"
                                                isActive={
                                                  pagination.page === item
                                                }
                                                onClick={(event) => {
                                                  event.preventDefault();
                                                  handlePageChange(item);
                                                }}
                                              >
                                                {item}
                                              </PaginationLink>
                                            </PaginationItem>
                                          );
                                        })}
                                        <PaginationItem>
                                          <PaginationNext
                                            href="#"
                                            onClick={(event) => {
                                              event.preventDefault();
                                              if (pagination?.hasNext) {
                                                handlePageChange(page + 1);
                                              }
                                            }}
                                            className={
                                              pagination?.hasNext
                                                ? ""
                                                : "pointer-events-none opacity-50"
                                            }
                                          />
                                        </PaginationItem>
                                      </PaginationContent>
                                    </Pagination>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </TabsContent>

                      {/* ✅ Recent Activity */}
                      <TabsContent
                        value="recent"
                        className="h-full m-0 p-0 data-[state=active]:flex flex-col"
                      >
                        <RecentActivityPanel
                          recentActivity={recentActivity}
                          formatTimeAgo={formatTimeAgo}
                        />
                      </TabsContent>

                      {/* ✅ Shared Files */}
                      <TabsContent
                        value="shared"
                        className="h-full m-0 p-0 data-[state=active]:flex flex-col"
                      >
                        <SharedFilesPanel />
                      </TabsContent>
                    </>
                  )}
                </div>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <FilePreviewDialog
        file={filePreview}
        onClose={() => setFilePreview(null)}
        handleDownload={handleDownload}
        isDownloading={
          !!filePreview && downloadingFile === filePreview.fileName
        }
      />

      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          setRenameDialogOpen(open);
          if (!open) setFileToRename(null);
        }}
        file={fileToRename}
        onRenamed={({ oldKey, newKey, newName }) => {
          const oldRoot = oldKey.endsWith("/") ? oldKey : `${oldKey}/`;
          const newRoot = newKey.endsWith("/") ? newKey : `${newKey}/`;

          setPath((prev) =>
            prev.map((entry) => {
              if (entry.id === oldKey) {
                return { ...entry, id: newKey, fileName: newName };
              }
              if (entry.id.startsWith(oldRoot)) {
                const updatedId = `${newRoot}${entry.id.slice(oldRoot.length)}`;
                const updatedName =
                  updatedId.split("/").filter(Boolean).pop() || entry.fileName;
                return { ...entry, id: updatedId, fileName: updatedName };
              }
              return entry;
            })
          );

          setSelectedFolder((prev) => {
            if (!prev) return prev;
            if (prev.id === oldKey) {
              return { ...prev, id: newKey, fileName: newName };
            }
            if (prev.id.startsWith(oldRoot)) {
              const updatedId = `${newRoot}${prev.id.slice(oldRoot.length)}`;
              const updatedName =
                updatedId.split("/").filter(Boolean).pop() || prev.fileName;
              return { ...prev, id: updatedId, fileName: updatedName };
            }
            return prev;
          });

          refetch();
        }}
      />

      {/* <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedFilesToDelete([]);
        }}
        fileNames={selectedFilesToDelete}
        selectedFolder={selectedFolder}
      /> */}

      {/* here it is */}

      <ConfirmBulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onClose={() => {
          setBulkDeleteDialogOpen(false);
          setBulkDeleteLoading(false);
        }}
        isLoading={bulkDeleteLoading}
        selectedFiles={selectedFiles}
        onDeleteSelected={handleDeleteSelected}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedFilesToDelete([]);
        }}
        file={
          files.find(
            (f: FileItem) => f.fileName === selectedFilesToDelete[0]
          ) || null
        }
        selectedFolder={selectedFolder}
        onDeleteComplete={() => {
          setSelectedFiles((prev) =>
            prev.filter((id) => id !== selectedFilesToDelete[0])
          );
          setSelectedFilesToDelete([]);
        }}
      />

      {/* Storage Plans Dialog */}
      <StoragePlansDialog
        open={showStoragePlans}
        onOpenChange={setShowStoragePlans}
      />

      {/* Bulk Share Dialog */}
      <BulkShareDialog
        open={showBulkShareDialog}
        onOpenChange={setShowBulkShareDialog}
        files={files}
        selectedFiles={selectedFiles}
        selectedFolder={selectedFolder}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        file={selectedFileForShare}
        selectedFolder={selectedFolder}
      />

      {/* Move Files Dialog */}
      <MoveFilesDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        selectedFolder={selectedFolder}
      />
      {/* Copy Files Dialog */}
      <CopyFilesDialog
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        selectedFolder={selectedFolder}
      />

      {/* Storage Sync Dialog */}
      <UploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        folderPath={folderPath}
        prefillFiles={droppedFiles}
        prefillToken={dropSession}
        // handleFileUpload={handleFileUpload}
        // uploadProgress={uploadProgress}
      />

      {/* Storage Sync Dialog */}
      <StorageSyncDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        selectedStorageService={selectedStorageService}
        syncInProgress={syncInProgress}
        handleSync={handleSync}
        handleConnectStorage={handleConnectStorage}
        formatTimeAgo={formatTimeAgo}
      />

      {/* New Folder Dialog */}
      <NewFolderDialog
        open={showNewFolderDialog}
        onOpenChange={setShowNewFolderDialog}
        folderPath={folderPath}
        // onCreate={handleCreateFolder}
      />
    </>
  );
};

export default CloudStorage;
