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
  MoreHorizontal,
  Download,
  Users,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePublicSharedListQuery } from "@/api/fileManagerAPI";

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

const FileTypeIcon = ({
  fileType,
  size = "small",
}: {
  fileType: string;
  size?: "small" | "large";
}) => {
  const iconSize = size === "large" ? "h-12 w-12" : "h-6 w-6";
  if (fileType === "folder") {
    return <FolderIcon className={`${iconSize} text-blue-500`} />;
  }
  return <FileText className={`${iconSize} text-gray-500`} />;
};

const Breadcrumbs = ({
  path,
  onNavigate,
}: {
  path: Array<{ id: string; name: string }>;
  onNavigate: (folderId: string) => void;
}) => (
  <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/20">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onNavigate("root")}
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

  const region = searchParams.get("region") || "virginia";
  const key = searchParams.get("key") || "root";

  const { data, isLoading } = usePublicSharedListQuery({ region, key });

  const [breadcrumbPath, setBreadcrumbPath] = useState<
    Array<{ id: string; name: string }>
  >([]);

  useEffect(() => {
    if (key === "root") {
      setBreadcrumbPath([]);
    } else {
      setBreadcrumbPath((prev) => {
        if (prev.find((p) => p.id === key)) {
          return prev;
        }
        const currentName = key.split("/").filter(Boolean).slice(-1)[0];
        return [...prev, { id: key, name: currentName }];
      });
    }
  }, [key]);

  const handleFolderClick = (file: any) => {
    if (file.fileType === "folder") {
      router.push(`?region=${region}&key=${encodeURIComponent(file.id)}`);
    }
  };

  const handleBreadcrumbNavigate = (folderId: string) => {
    router.push(`?region=${region}&key=${encodeURIComponent(folderId)}`);
  };

  const files = data?.files || [];

  return (
    <Card className="relative my-20 p-3 m-20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Smart Storage</CardTitle>
            <CardDescription className="mt-3">
              Manage your files and folders
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-3">
        <div className="flex flex-col md:flex-row min-h-[600px] relative">
          <div className="flex-1 overflow-hidden flex flex-col">
            <Breadcrumbs
              path={breadcrumbPath}
              onNavigate={handleBreadcrumbNavigate}
            />
            <Tabs defaultValue="files" className="flex-1 flex flex-col">
              <div className="flex-1 overflow-hidden">
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
                            <TableHead className="w-[5%]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {files.map((file: any) => (
                            <TableRow
                              key={file.id}
                              className={`hover:bg-muted/50 ${
                                file.fileType === "folder"
                                  ? "cursor-pointer"
                                  : ""
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
                                  {formatFileSize(file.size)}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(file.createdAt)}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {file.fileType !== "folder" && (
                                      <DropdownMenuItem>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
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
  );
};

export default StaticStoragePage;
