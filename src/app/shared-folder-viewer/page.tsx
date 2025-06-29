"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
  FileText,
  Star,
  FolderIcon,
  ChevronRight,
  Home,
  Download,
  Users,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  usePublicSharedListQuery,
  useLazyDownloadFolderQuery,
} from "@/api/fileManagerAPI";

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const FileTypeIcon = ({ fileType }: { fileType: string }) => {
  return fileType === "folder" ? (
    <FolderIcon className="h-6 w-6 text-blue-500" />
  ) : (
    <FileText className="h-6 w-6 text-gray-500" />
  );
};

// Enhanced Breadcrumbs component with duplicate prevention
const EnhancedBreadcrumbs = ({
  path,
  onNavigate,
  currentKey,
}: {
  path: Array<{ id: string; name: string }>;
  onNavigate: (folderPath: string) => void;
  currentKey: string;
}) => {
  const handleClick = (folderPath: string) => {
    // Normalize paths for comparison
    const normalizedCurrent = currentKey.endsWith("/") ? currentKey : currentKey + "/";
    const normalizedTarget = folderPath.endsWith("/") ? folderPath : folderPath + "/";
    
    // Don't navigate if we're already at this path
    if (normalizedCurrent === normalizedTarget) {
      console.log("Already at this path, not navigating");
      return;
    }
    
    onNavigate(folderPath);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/20">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleClick("")}
        className="h-8 px-2"
        disabled={!currentKey} // Disable if already at root
      >
        <Home className="h-4 w-4" />
      </Button>
      {path.map((folder, index) => {
        const isCurrentFolder = index === path.length - 1;
        const isClickable = !isCurrentFolder; // Don't allow clicking on current folder
        
        return (
          <div key={`${folder.id}-${index}`} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => isClickable && handleClick(folder.id)}
              disabled={!isClickable}
              className={`h-8 px-2 ${
                isCurrentFolder
                  ? "font-medium text-foreground cursor-default"
                  : "text-muted-foreground hover:text-foreground cursor-pointer"
              }`}
            >
              {folder.name}
            </Button>
          </div>
        );
      })}
    </div>
  );
};

const StaticStoragePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const key = searchParams.get("key") || "";
  const { data, isLoading } = usePublicSharedListQuery({
    key,
    region: "virginia",
  });
  const [triggerDownloadFolder, { isFetching }] = useLazyDownloadFolderQuery();

  const [breadcrumbPath, setBreadcrumbPath] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Enhanced breadcrumb path calculation
  useEffect(() => {
    if (!key) {
      setBreadcrumbPath([]);
      return;
    }

    const parts = key.split("/").filter(Boolean);
    if (parts.length <= 1) {
      setBreadcrumbPath([]);
      return;
    }

    // Remove the first part (usually the root identifier) and build meaningful path
    const meaningfulParts = parts.slice(1);
    const pathArr = [];
    
    for (let i = 0; i < meaningfulParts.length; i++) {
      const pathUpToHere = parts.slice(0, i + 2).join("/") + "/";
      pathArr.push({
        id: pathUpToHere,
        name: meaningfulParts[i]
      });
    }

    setBreadcrumbPath(pathArr);
  }, [key]);

  // Smart folder navigation that handles both child and sibling navigation
  const handleFolderClick = (file: any) => {
    if (file.fileType !== "folder") return;

    // Clean the current key (remove trailing slash for consistency)
    const cleanKey = key.endsWith("/") ? key.slice(0, -1) : key;
    const keyParts = cleanKey.split("/").filter(Boolean);
    
    // Get the current folder we're in (last part of the path)
    const currentFolder = keyParts[keyParts.length - 1];
    
    // If we're clicking on the same folder we're already in, don't navigate
    if (currentFolder === file.fileName) {
      console.log("Already in this folder, not navigating");
      return;
    }

    // Check if this folder already exists somewhere in our current path
    const folderExistsInPath = keyParts.includes(file.fileName);
    
    let newPath;
    
    if (folderExistsInPath) {
      // This folder exists somewhere in our path - navigate to that level
      // This handles going back to a parent folder
      const folderIndex = keyParts.indexOf(file.fileName);
      const pathToFolder = keyParts.slice(0, folderIndex + 1);
      
      // Rebuild the full path including the root part
      if (keyParts.length > 0) {
        const rootPart = keyParts[0];
        newPath = [rootPart, ...pathToFolder.slice(1)].join("/") + "/";
      } else {
        newPath = pathToFolder.join("/") + "/";
      }
    } else {
      // This is a new folder - determine if it's a child or sibling
      // Since we're showing current directory contents, we need to determine
      // if this should replace the current folder (sibling) or be added (child)
      
      // For now, we'll assume it's a child navigation (standard file browser behavior)
      // If you need sibling detection, you'd need additional logic here
      newPath = key ? `${key}${file.fileName}/` : `${file.fileName}/`;
    }
    
    router.push(`/shared-folder-viewer?key=${encodeURIComponent(newPath)}`);
  };

  // Enhanced breadcrumb navigation with duplicate prevention
  const handleBreadcrumbNavigate = (folderPath: string) => {
    // Normalize paths for comparison
    const normalizedCurrent = key.endsWith("/") ? key : key + "/";
    const normalizedTarget = folderPath.endsWith("/") ? folderPath : folderPath + "/";
    
    // Don't navigate if we're already at this path
    if (normalizedCurrent === normalizedTarget) {
      console.log("Already at this path, not navigating");
      return;
    }

    router.push(
      folderPath
        ? `/shared-folder-viewer?key=${encodeURIComponent(folderPath)}`
        : `/shared-folder-viewer`
    );
  };

  // Alternative: Explicit sibling navigation (uncomment if needed)
  const handleSiblingNavigation = (file: any) => {
    if (file.fileType !== "folder") return;

    const cleanKey = key.endsWith("/") ? key.slice(0, -1) : key;
    const keyParts = cleanKey.split("/").filter(Boolean);
    
    if (keyParts.length === 0) {
      // At root level - just navigate to the folder
      const newPath = `${file.fileName}/`;
      router.push(`/shared-folder-viewer?key=${encodeURIComponent(newPath)}`);
      return;
    }

    // For sibling navigation, replace the last folder in the path
    const parentParts = keyParts.slice(0, -1);
    let newPath;
    
    if (parentParts.length === 0) {
      newPath = `${file.fileName}/`;
    } else {
      newPath = `${parentParts.join("/")}/${file.fileName}/`;
    }
    
    router.push(`/shared-folder-viewer?key=${encodeURIComponent(newPath)}`);
  };

  const handleDownloadFolder = async () => {
    if (!key) {
      alert("You are at root. Please navigate into a folder to download.");
      return;
    }

    try {
      const res = await triggerDownloadFolder({
        region: "virginia",
        key,
      }).unwrap();

      if (res?.downloadUrl) {
        window.location.href = res.downloadUrl;
      } else {
        alert("Download URL not available.");
      }
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download folder.");
    }
  };

  const files = data?.files || [];

  return (
    <Card className="relative my-20 p-3 m-20">
      <CardHeader className="pb-2 flex flex-row justify-between items-center w-full">
        <div>
          <CardTitle>Smart Storage</CardTitle>
          <CardDescription className="mt-3">
            Manage your files and folders
          </CardDescription>
        </div>
        <Button onClick={handleDownloadFolder} disabled={isFetching}>
          <Download className="h-4 w-4 mr-2" />
          {isFetching ? "Preparing..." : "Download Folder"}
        </Button>
      </CardHeader>
      <CardContent className="p-0 mt-3">
        <div className="flex flex-col min-h-[600px]">
          <EnhancedBreadcrumbs
            path={breadcrumbPath}
            onNavigate={handleBreadcrumbNavigate}
            currentKey={key}
          />
          <Tabs defaultValue="files" className="flex-1 flex flex-col">
            <TabsContent
              value="files"
              className="h-full m-0 p-0 data-[state=active]:flex flex-col"
            >
              <ScrollArea className="flex-1 h-full">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    Loading...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">Name</TableHead>
                        <TableHead className="w-[15%]">Size</TableHead>
                        <TableHead className="w-[15%]">Uploaded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file: any) => (
                        <TableRow
                          key={file.id}
                          className={`hover:bg-muted/50 ${
                            file.fileType === "folder" ? "cursor-pointer" : ""
                          }`}
                          onClick={() => handleFolderClick(file)}
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 flex items-center justify-center flex-shrink-0">
                                <FileTypeIcon fileType={file.fileType} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {file.fileName}
                                  </span>
                                  {file.starred && (
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-muted-foreground">
                              {formatFileSize(file.size || 0)}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(file.createdAt)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticStoragePage;