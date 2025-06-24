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

const Breadcrumbs = ({
  path,
  onNavigate,
}: {
  path: Array<{ id: string; name: string }>;
  onNavigate: (folderPath: string) => void;
}) => (
  <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/20">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onNavigate("")}
      className="h-8 px-2"
    >
      <Home className="h-4 w-4" />
    </Button>
    {path.map((folder, index) => (
      <div key={folder.id} className="flex items-center gap-2">
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate(folder.id)}
          className={`h-8 px-2 ${
            index === path.length - 1
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {folder.name}
        </Button>
      </div>
    ))}
  </div>
);

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

    const meaningfulParts = parts.slice(1);
    const pathArr = meaningfulParts.map((part, idx) => {
      const id = parts.slice(0, idx + 2).join("/") + "/";
      return { id, name: part };
    });

    setBreadcrumbPath(pathArr);
  }, [key]);

  const handleFolderClick = (file: any) => {
    if (file.fileType === "folder") {
      const newPath = key ? `${key}${file.fileName}/` : `${file.fileName}/`;
      router.push(`/shared-folder-viewer?key=${encodeURIComponent(newPath)}`);
    }
  };

  const handleBreadcrumbNavigate = (folderPath: string) => {
    router.push(
      folderPath
        ? `/shared-folder-viewer?key=${encodeURIComponent(folderPath)}`
        : `/shared-folder-viewer`
    );
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
          <Breadcrumbs
            path={breadcrumbPath}
            onNavigate={handleBreadcrumbNavigate}
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
