"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  FileText,
  FolderPlus,
  Upload,
  Download,
  Trash2,
  Share2,
  Star,
  Search,
  Grid,
  List,
  Users,
  Copy,
  SortAsc,
  RefreshCw,
  HardDrive,
  FolderIcon,
  GripVertical,
  FolderSync,
  GraduationCap,
  Loader2,
  Filter,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { recentActivity, storagePlans } from "../data";
import StoragePlansDialog from "./storag-plans-dialog";
import ShareDialog from "./share-dialog";
import MoveFilesDialog from "./move-files-dialog";
import CopyFilesDialog from "./copy-files-dialog";
import StorageSyncDialog from "./storage-sync-dialog";
import NewFolderDialog from "./new-folder-dialog";
import { SidebarPanel } from "./storage-sidebar";
import FileTypeIcon from "./file-type-icon";
import { formatDate, formatFileSize, formatTimeAgo } from "../utils";
import UploadDialog from "./upload-dialog";
import {
  useDeleteFilesMutation,
  useLazyDownloadFileQuery,
  useListFilesQuery,
  useUnstarFileMutation,
} from "@/api/fileManagerAPI";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import { useStarFileMutation } from "@/api/fileManagerAPI";
import { FileItem } from "../types";
import { useDebounce } from "@/hooks/useDebounce";

const CloudStorage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [selectedCategory, setSelectedCategory] = useState("All Files");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [showStoragePlans, setShowStoragePlans] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  // const [newFolderName, setNewFolderName] = useState("");
  // const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileForShare, setSelectedFileForShare] =
    useState<FileItem | null>(null);

  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 10;
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedFolderForMove, setSelectedFolderForMove] = useState<
    string | null
  >(null);
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFilesToDelete, setSelectedFilesToDelete] = useState<string[]>(
    []
  );
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [filters, setFilters] = useState({
    starred: false,
    shared: false,
    modified: "",
  });
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 500);

  console.log(lastSynced);

  const selectedType =
    selectedCategory === "All Files" || selectedFolder
      ? ""
      : selectedCategory.toLowerCase();

  const { data, error, isFetching } = useListFilesQuery({
    userId,
    region: "virginia",
    type: selectedType,
    search: debouncedQuery,
    starred: filters.starred,
    shared: filters.shared,
    modified: filters.modified,
    folder: selectedFolder,
    sortBy,
  });

  const [triggerDownloadFile] = useLazyDownloadFileQuery();
  const [starFile] = useStarFileMutation();
  const [unstarFile] = useUnstarFileMutation();
  const [deleteFiles] = useDeleteFilesMutation();

  console.log({ wali: data?.files });
  const handleUpload = () => {
    setShowUploadDialog(true);
  };

  const handleFolderSelection = (file: FileItem) => {
    if (file.fileType === "folder") {
      setSelectedFolder(file.fileName);
    }
  };

  const handleCloseFolder = () => {
    setSelectedFolder(null);
  };

  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
    handleCloseFolder();
  };

  const handleDownload = async (fileName: string) => {
    if (!userId) return;

    setDownloadingFile(fileName);
    try {
      const { data } = await triggerDownloadFile({
        fileName,
        userId,
        region: "virginia",
      });

      if (data?.downloadUrl) {
        const blobResp = await fetch(data.downloadUrl);
        const blob = await blobResp.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        toast({
          title: "Download Complete",
          description: `${fileName} has been downloaded successfully.`,
        });
      } else {
        toast({
          title: "Download Failed",
          description: "Could not generate download link. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error downloading file:", err);
      toast({
        title: "Download Error",
        description: "Something went wrong while downloading the file.",
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(null);
    }
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
      const filesToDelete = data.files.filter((file: FileItem) =>
        selectedFiles.includes(file.id)
      );

      const { userId, region } = filesToDelete[0];

      const fileNames = filesToDelete.map((file: FileItem) => file.fileName);

      await deleteFiles({
        region,
        userId,
        fileNames,
      }).unwrap();

      toast({
        title: `${fileNames.length} Files Deleted`,
        description: "The selected files have been moved to trash.",
        variant: "destructive",
      });

      setSelectedFiles([]);
    } catch (error) {
      console.error("Error deleting files:", error);
      toast({
        title: "Error",
        description: "Some files could not be deleted.",
        variant: "destructive",
      });
    }
  };

  const handleStar = async (file: FileItem) => {
    if (!userId) return;

    try {
      const action = file.starred ? unstarFile : starFile;

      await action({
        region: "virginia",
        userId,
        fileName: file.fileName,
      }).unwrap();

      toast({
        title: file.starred ? "File Unstarred" : "File Starred",
        description: `"${file.fileName}" was ${
          file.starred ? "removed from" : "added to"
        } your starred items`,
      });
    } catch (err) {
      console.error("Star/unstar error:", err);
      toast({
        title: "Error",
        description: `Failed to ${file.starred ? "unstar" : "star"} the file.`,
        variant: "destructive",
      });
    }
  };

  // const handleViewDetails = (fileId: string) => {
  //   router.push(`/dashboard/files/${fileId}`);
  // };

  const handleSort = (value: string) => {
    const sort = value as "name" | "date" | "size";
    setSortBy(sort);
  };

  // Filter files based on search and category
  // const filteredFiles = files.filter((file) => {
  //   const matchesSearch = file.name
  //     .toLowerCase()
  //     .includes(searchQuery.toLowerCase());
  //   const matchesCategory =
  //     selectedCategory === "All Files" ||
  //     (selectedCategory === "Folders" && file.type === "folder") ||
  //     (selectedCategory === "Documents" && file.type === "document") ||
  //     (selectedCategory === "Images" && file.type === "image") ||
  //     (selectedCategory === "Videos" && file.type === "video") ||
  //     (selectedCategory === "Audio" && file.type === "audio");
  //   return matchesSearch && matchesCategory;
  // });

  // Sort files based on selected criteria
  // const sortedFiles = [...filteredFiles].sort((a, b) => {
  //   // Always put folders on top
  //   if (a.type === "folder" && b.type !== "folder") return -1;
  //   if (a.type !== "folder" && b.type === "folder") return 1;

  //   // If both are folders or both are files, sort by selected criteria
  //   if (sortBy === "name") {
  //     return sortOrder === "asc"
  //       ? a.name.localeCompare(b.name)
  //       : b.name.localeCompare(a.name);
  //   } else if (sortBy === "date") {
  //     return sortOrder === "asc"
  //       ? new Date(a.modified).getTime() - new Date(b.modified).getTime()
  //       : new Date(b.modified).getTime() - new Date(a.modified).getTime();
  //   } else if (sortBy === "size") {
  //     // For folders, compare by number of files
  //     if (a.type === "folder" && b.type === "folder") {
  //       const aSize = parseInt(a.size);
  //       const bSize = parseInt(b.size);
  //       return sortOrder === "asc" ? aSize - bSize : bSize - aSize;
  //     }
  //     // For files, compare by file size
  //     const aSize = parseInt(a.size);
  //     const bSize = parseInt(b.size);
  //     return sortOrder === "asc" ? aSize - bSize : bSize - aSize;
  //   }
  //   return 0;
  // });

  // Paginate files
  // const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);
  // const paginatedFiles = sortedFiles.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  // Handle file selection
  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) => {
      if (prev.includes(fileId)) {
        return prev.filter((id) => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  // Handle select all in current page
  // const handleSelectAllInPage = (checked: boolean) => {
  //   // if (checked) {
  //   //   const pageFileIds = paginatedFiles.map((file) => file.id);
  //   //   setSelectedFiles((prev) => {
  //   //     const otherPages = prev.filter(
  //   //       (id) => !paginatedFiles.find((file) => file.id === id)
  //   //     );
  //   //     return [...otherPages, ...pageFileIds];
  //   //   });
  //   // } else {
  //   //   setSelectedFiles((prev) =>
  //   //     prev.filter((id) => !paginatedFiles.find((file) => file.id === id))
  //   //   );
  //   // }
  // };
  const handleSelectAllInPage = (checked: boolean) => {
    if (checked) {
      const fileIds = visibleFiles.map((file) => file.id);
      setSelectedFiles(fileIds);
    } else {
      setSelectedFiles([]);
    }
  };

  // Check if all files in current page are selected
  // const areAllCurrentPageFilesSelected = paginatedFiles.every((file) =>
  //   selectedFiles.includes(file.id)
  // );

  // Handle page change
  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  // Get file for sharing
  // const fileToShare = selectedFileForShare
  //   ? files.find((f) => f.id === selectedFileForShare)
  //   : null;

  // Handle file drop for upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // Handle external file drops (upload)
    if (e.dataTransfer.types.includes("Files")) {
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        toast({
          title: "Files Uploading",
          description: `Uploading ${files.length} file(s)...`,
        });
      }
      return;
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  // const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (!files?.length) return;

  //   // Simulate upload progress
  //   setUploadProgress(0);
  //   const interval = setInterval(() => {
  //     setUploadProgress((prev) => {
  //       if (prev >= 100) {
  //         clearInterval(interval);
  //         setShowUploadDialog(false);
  //         toast({
  //           title: "Upload Complete",
  //           description: `${files.length} file(s) uploaded successfully`,
  //         });
  //         return 0;
  //       }
  //       return prev + 10;
  //     });
  //   }, 500);
  // };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverFolderId(null);
  };

  // Handle internal file/folder drag start
  const handleItemDragStart = (e: React.DragEvent, fileId: string) => {
    // Set drag data
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        fileIds: selectedFiles.includes(fileId) ? selectedFiles : [fileId],
        operation: e.ctrlKey ? "copy" : "move",
      })
    );

    // Set drag effect
    e.dataTransfer.effectAllowed = e.ctrlKey ? "copy" : "move";

    // Update state
    setDragOperation(e.ctrlKey ? "copy" : "move");
    if (selectedFiles.includes(fileId)) {
      setDraggedFiles(selectedFiles);
    } else {
      setDraggedFiles([fileId]);
    }
  };

  // Handle folder drag over
  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't allow dropping on itself or if dragging external files
    if (
      draggedFiles.includes(folderId) ||
      e.dataTransfer.types.includes("Files")
    ) {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    // Set drop effect based on operation
    e.dataTransfer.dropEffect = dragOperation || (e.ctrlKey ? "copy" : "move");
    setDragOverFolderId(folderId);
  };

  // Handle folder drag leave
  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
  };

  // Handle drop on folder
  const handleFolderDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't allow dropping on itself
    if (draggedFiles.includes(folderId)) {
      return;
    }

    try {
      const dragData = JSON.parse(e.dataTransfer.getData("application/json"));
      const operation = dragData.operation || "move";
      const fileIds = dragData.fileIds || [];

      if (fileIds.length > 0) {
        toast({
          title: `Files ${operation === "copy" ? "Copied" : "Moved"}`,
          description: `${fileIds.length} file(s) ${
            operation === "copy" ? "copied" : "moved"
          } successfully`,
        });

        // Clear selection and drag state
        setSelectedFiles([]);
        setDraggedFiles([]);
        setDragOverFolderId(null);
        setDragOperation(null);
      }
    } catch (error) {
      console.error("Error processing drop:", error);
    }
  };

  // Handle storage service connection
  const handleConnectStorage = (serviceId: string) => {
    router.push(`/dashboard/storage/${serviceId}`);
  };

  // Handle sync start
  const handleSync = (serviceId: string) => {
    setSyncInProgress(true);
    setSelectedStorageService(serviceId);

    // Simulate sync process
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

    try {
      for (const fileId of selectedFiles) {
        const file = (data?.files as FileItem[]).find((f) => f.id === fileId);
        if (!file) continue;

        const { data: downloadData } = await triggerDownloadFile({
          fileName: file.fileName,
          userId,
          region: "virginia",
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
        description: `${selectedFiles.length} file(s) downloaded.`,
      });
    } catch (error) {
      console.error("Bulk download error:", error);
      toast({
        title: "Error",
        description: "Bulk download failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBulkDownloading(false);
    }
  };

  return (
    <>
      <Card className="relative">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Smart Storage</CardTitle>
              <CardDescription>Manage your files and folders</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSyncDialogOpen(true)}
              >
                <FolderSync className="h-4 w-4 mr-2" />
                Sync Storage
              </Button>
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
        </CardHeader>
        <CardContent className="p-0">
          <div
            className={`flex flex-col md:flex-row min-h-[600px] relative ${
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
              onNewFolderClick={() => setShowNewFolderDialog(true)}
            />

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="border-b border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {selectedFolder && (
                    <button
                      onClick={handleCloseFolder}
                      className="flex items-center"
                    >
                      <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                  <h3 className="text-lg font-medium">
                    {selectedFolder ? selectedFolder : selectedCategory}
                  </h3>
                  <div className="flex-1 md:w-64">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedFiles.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setCopyDialogOpen(true)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setMoveDialogOpen(true)}
                      >
                        <FolderIcon className="h-4 w-4 mr-2" />
                        Move
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNewFolderDialog(true)}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>

                      <DropdownMenuCheckboxItem
                        checked={filters.modified === "today"}
                        onCheckedChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            modified: prev.modified === "today" ? "" : "today",
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
                            modified: prev.modified === "week" ? "" : "week",
                          }))
                        }
                      >
                        Uploaded this week
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        {/* {sortOrder === "asc" ? ( */}
                        <SortAsc className="h-4 w-4 mr-2" />
                        {/* // ) : (
                        //   <SortDesc className="h-4 w-4 mr-2" />
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
                  <Button
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
                  </Button>
                  <Button size="sm" variant="ghost">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
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
                        onClick={handleDeleteSelected}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <Tabs defaultValue="files" className="flex-1 flex flex-col">
                <TabsList className="border-b px-4">
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                  <TabsTrigger value="shared">Shared with Me</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  <TabsContent
                    value="files"
                    className="h-full m-0 p-0 data-[state=active]:flex flex-col"
                  >
                    {isFetching && (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">
                          Fetching your files...
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Please wait while we load your smart storage.
                        </p>
                      </div>
                    )}
                    {!isFetching && (
                      <ScrollArea className="flex-1">
                        {error || data?.files.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                            <FileText className="h-8 w-8 text-muted-foreground mb-4" />
                            <h3 className="font-medium mb-2">No files found</h3>
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
                        ) : viewMode === "list" ? (
                          <div className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[40px]">
                                    <Checkbox
                                      checked={
                                        visibleFiles.length > 0 &&
                                        visibleFiles.every((file) =>
                                          selectedFiles.includes(file.id)
                                        )
                                      }
                                      onCheckedChange={(checked) =>
                                        handleSelectAllInPage(!!checked)
                                      }
                                    />
                                  </TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Size</TableHead>
                                  <TableHead>Uploaded</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {data &&
                                  (data?.files as FileItem[]).map((file) => (
                                    <TableRow
                                      key={file.id}
                                      className={`hover:bg-muted/50 ${
                                        dragOverFolderId === file.id
                                          ? "bg-muted ring-2 ring-primary"
                                          : ""
                                      }`}
                                      draggable={true}
                                      onDragStart={(e) =>
                                        handleItemDragStart(e, file.id)
                                      }
                                      onDragOver={(e) =>
                                        file.type === "folder"
                                          ? handleFolderDragOver(e, file.id)
                                          : undefined
                                      }
                                      onDragLeave={(e) =>
                                        file.type === "folder"
                                          ? handleFolderDragLeave(e)
                                          : undefined
                                      }
                                      onDrop={(e) =>
                                        file.type === "folder"
                                          ? handleFolderDrop(e, file.id)
                                          : undefined
                                      }
                                    >
                                      <TableCell>
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
                                      <TableCell>
                                        <div
                                          {...(file.fileType === "folder" && {
                                            title: "Click to open folder",
                                          })}
                                          className={`flex items-center gap-2 ${
                                            file.fileType === "folder" &&
                                            "cursor-pointer"
                                          }`}
                                          onClick={() =>
                                            handleFolderSelection(file)
                                          }
                                        >
                                          <div className="h-8 w-8 flex items-center justify-center">
                                            <FileTypeIcon
                                              fileName={file.fileName}
                                              fileType={file.fileType}
                                              size="small"
                                            />
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-1">
                                              <span>{file.fileName}</span>
                                              {file.starred && (
                                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                              )}
                                            </div>
                                            {file.shared && (
                                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                {/* <Share2 className="h-3 w-3" /> */}
                                                {/* <span>
                                                  Shared with 6 people
                                                  {file.sharedWith.length} people
                                                </span> */}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {formatFileSize(file?.size)}
                                      </TableCell>
                                      <TableCell>
                                        {formatDate(file.createdAt)}
                                      </TableCell>
                                      <TableCell>
                                        {file.shared ? (
                                          <Badge
                                            variant="outline"
                                            className="bg-green-500/10 text-green-500 border-green-500/20"
                                          >
                                            <Share2 className="h-3 w-3 mr-1" />
                                            Shared
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="outline"
                                            className="bg-gray-500/10 text-gray-500 border-gray-500/20"
                                          >
                                            Private
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
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
                                              <DropdownMenuItem
                                                disabled={
                                                  downloadingFile ===
                                                  file.fileName
                                                }
                                                onClick={() =>
                                                  handleDownload(file.fileName)
                                                }
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
                                            )}
                                            <DropdownMenuItem
                                              onClick={() => handleShare(file)}
                                            >
                                              <Share2 className="h-4 w-4 mr-2" />
                                              Share
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => handleStar(file)}
                                            >
                                              <Star className="h-4 w-4 mr-2" />
                                              {file.starred ? "Unstar" : "Star"}
                                            </DropdownMenuItem>
                                            {/* <DropdownMenuItem
                                              onClick={() =>
                                                handleViewDetails(file.id)
                                              }
                                            >
                                              <Info className="h-4 w-4 mr-2" />
                                              View Details
                                            </DropdownMenuItem> */}
                                            <DropdownMenuSeparator />
                                            {selectedFiles.length > 0 && (
                                              <DropdownMenuItem
                                                onClick={() =>
                                                  setMoveDialogOpen(true)
                                                }
                                              >
                                                <FolderIcon className="h-4 w-4 mr-2" />
                                                Move Selected
                                              </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                              className="text-destructive"
                                              onClick={() => {
                                                setSelectedFilesToDelete([
                                                  file.fileName,
                                                ]);
                                                setDeleteDialogOpen(true);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                            {/* <div className="flex items-center justify-between px-4 py-4 border-t">
                              <div className="text-sm text-muted-foreground">
                                Showing{" "}
                                {Math.min(
                                  (currentPage - 1) * itemsPerPage + 1,
                                  sortedFiles.length
                                )}{" "}
                                to{" "}
                                {Math.min(
                                  currentPage * itemsPerPage,
                                  sortedFiles.length
                                )}{" "}
                                of {sortedFiles.length} files
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handlePageChange(currentPage - 1)
                                  }
                                  disabled={currentPage === 1}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                  Previous
                                </Button>
                                <div className="flex items-center space-x-1">
                                  {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                  ).map((page) => (
                                    <Button
                                      key={page}
                                      variant={
                                        currentPage === page
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => handlePageChange(page)}
                                      className="w-8"
                                    >
                                      {page}
                                    </Button>
                                  ))}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handlePageChange(currentPage + 1)
                                  }
                                  disabled={currentPage === totalPages}
                                >
                                  Next
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                            </div> */}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-4">
                            {(data?.files as FileItem[]).map((file) => {
                              const isFile = file.fileType !== "folder";
                              const url = file.previewUrl;
                              const ext =
                                file.fileName.split(".").pop()?.toLowerCase() ??
                                "";

                              let Preview: React.ReactNode;
                              if (
                                isFile &&
                                ["png", "jpg", "jpeg", "gif", "webp"].includes(
                                  ext
                                ) &&
                                url
                              ) {
                                Preview = (
                                  <img
                                    src={url}
                                    alt={file.fileName}
                                    className="max-w-full max-h-12 object-contain mb-2"
                                  />
                                );
                              } else if (isFile && ext === "pdf" && url) {
                                Preview = (
                                  <iframe
                                    src={url}
                                    title={file.fileName}
                                    className="w-full h-12 mb-2"
                                  />
                                );
                              } else if (
                                isFile &&
                                [
                                  "doc",
                                  "docx",
                                  "xls",
                                  "xlsx",
                                  "ppt",
                                  "pptx",
                                ].includes(ext) &&
                                url
                              ) {
                                const officeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                                  url
                                )}`;
                                Preview = (
                                  <iframe
                                    src={officeSrc}
                                    title={file.fileName}
                                    className="w-full h-12 mb-2"
                                  />
                                );
                              } else if (
                                isFile &&
                                ["mp4", "webm", "ogg"].includes(ext) &&
                                url
                              ) {
                                Preview = (
                                  <video
                                    src={url}
                                    controls
                                    className="w-full h-12 mb-2 object-cover"
                                  />
                                );
                              } else if (
                                isFile &&
                                ["mp3", "wav", "ogg"].includes(ext) &&
                                url
                              ) {
                                Preview = (
                                  <audio
                                    src={url}
                                    controls
                                    className="w-full mb-2"
                                  />
                                );
                              } else {
                                Preview = (
                                  <FileTypeIcon
                                    fileName={file.fileName}
                                    fileType={file.fileType}
                                    size="large"
                                  />
                                );
                              }

                              return (
                                <div
                                  key={file.id}
                                  className={`group relative p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors ${
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
                                      ? handleFolderDragOver(e, file.id)
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
                                  {/* drag handle + checkbox */}
                                  <div className="absolute top-2 left-2 flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                    <Checkbox
                                      checked={selectedFiles.includes(file.id)}
                                      onCheckedChange={() =>
                                        handleFileSelect(file.id)
                                      }
                                    />
                                  </div>

                                  {/* preview or icon + filename */}
                                  <div
                                    {...(file.fileType === "folder" && {
                                      title: "Click to open folder",
                                    })}
                                    className={`flex flex-col items-center text-center mb-3 ${
                                      file.fileType === "folder"
                                        ? "cursor-pointer"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      file.fileType === "folder" &&
                                      handleFolderSelection(file)
                                    }
                                  >
                                    <div className="h-12 w-12 mb-2">
                                      {Preview}
                                    </div>
                                    <div className="w-full">
                                      <div className="font-medium truncate text-sm">
                                        {file.fileName}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {formatFileSize(file.size)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* metadata + menu */}
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    {formatDate(file.createdAt)}
                                    <div className="flex items-center gap-1">
                                      {file.shared && (
                                        <Share2 className="h-3.5 w-3.5 text-green-500" />
                                      )}
                                      {file.starred && (
                                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                        {isFile && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleDownload(file.fileName)
                                            }
                                          >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                          onClick={() => handleShare(file)}
                                        >
                                          <Share2 className="h-4 w-4 mr-2" />
                                          Share
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleStar(file)}
                                        >
                                          <Star className="h-4 w-4 mr-2" />
                                          {file.starred ? "Unstar" : "Star"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {selectedFiles.length > 0 && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              setMoveDialogOpen(true)
                                            }
                                          >
                                            <FolderIcon className="h-4 w-4 mr-2" />
                                            Move Selected
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => {
                                            setSelectedFilesToDelete([
                                              file.fileName,
                                            ]);
                                            setDeleteDialogOpen(true);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="recent"
                    className="h-full m-0 p-0 data-[state=active]:flex flex-col"
                  >
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-4">
                        {recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={activity.avatar} />
                              <AvatarFallback>
                                {activity.user.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">
                                  {activity.user}
                                </span>
                                <span className="text-muted-foreground">
                                  {activity.action === "edited" && "edited"}
                                  {activity.action === "shared" && "shared"}
                                  {activity.action === "uploaded" && "uploaded"}
                                  {activity.action === "commented" &&
                                    "commented on"}
                                </span>
                                <span className="font-medium truncate">
                                  {activity.file}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatTimeAgo(activity.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent
                    value="shared"
                    className="h-full m-0 p-0 data-[state=active]:flex flex-col"
                  >
                    <ScrollArea className="flex-1">
                      <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                        <Users className="h-8 w-8 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">No shared files</h3>
                        <p className="text-sm text-muted-foreground">
                          Files shared with you will appear here
                        </p>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedFilesToDelete([]);
        }}
        fileNames={selectedFilesToDelete}
      />

      {/* Storage Plans Dialog */}
      <StoragePlansDialog
        open={showStoragePlans}
        onOpenChange={setShowStoragePlans}
        plans={storagePlans}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        file={selectedFileForShare}
      />

      {/* Move Files Dialog */}
      <MoveFilesDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        files={data?.files}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        selectedFolderId={selectedFolderForMove}
        setSelectedFolderId={setSelectedFolderForMove}
      />
      {/* Copy Files Dialog */}
      <CopyFilesDialog
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
        // files={files}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        selectedFolderId={selectedFolderForMove}
        setSelectedFolderId={setSelectedFolderForMove}
      />

      {/* Storage Sync Dialog */}
      <UploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
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
        // onCreate={handleCreateFolder}
      />
    </>
  );
};

export default CloudStorage;
