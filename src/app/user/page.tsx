"use client";
import { useState } from "react";
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
  Share2,
  Star,
  Users,
  FolderIcon,
  ChevronRight,
  Home,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Enhanced mock data with nested folder structure
const mockFolderStructure: Record<string, any[]> = {
  root: [
    {
      id: "1",
      fileName: "Project Proposal.pdf",
      fileType: "pdf",
      size: 2048576,
      createdAt: "2024-01-15T10:30:00Z",
      starred: true,
      shared: true,
      previewUrl: "/placeholder.svg?height=76&width=76",
    },
    {
      id: "2",
      fileName: "Design Assets",
      fileType: "folder",
      size: 15728640,
      createdAt: "2024-01-14T14:20:00Z",
      starred: false,
      shared: false,
      previewUrl: null,
    },
    {
      id: "3",
      fileName: "Screenshot.png",
      fileType: "image",
      size: 1024000,
      createdAt: "2024-01-13T09:15:00Z",
      starred: false,
      shared: true,
      previewUrl: "/placeholder.svg?height=76&width=76",
    },
    {
      id: "4",
      fileName: "Meeting Notes.docx",
      fileType: "document",
      size: 512000,
      createdAt: "2024-01-12T16:45:00Z",
      starred: false,
      shared: false,
      previewUrl: "/placeholder.svg?height=76&width=76",
    },
    {
      id: "5",
      fileName: "Marketing Materials",
      fileType: "folder",
      size: 8388608,
      createdAt: "2024-01-10T11:30:00Z",
      starred: true,
      shared: true,
      previewUrl: null,
    },
  ],
  "2": [
    // Design Assets folder contents
    {
      id: "2-1",
      fileName: "Logo.svg",
      fileType: "image",
      size: 45056,
      createdAt: "2024-01-14T14:25:00Z",
      starred: false,
      shared: false,
      previewUrl: "/placeholder.svg?height=76&width=76",
    },
    {
      id: "2-2",
      fileName: "Brand Guidelines.pdf",
      fileType: "pdf",
      size: 3145728,
      createdAt: "2024-01-14T14:30:00Z",
      starred: true,
      shared: true,
      previewUrl: "/placeholder.svg?height=76&width=76",
    },
    {
      id: "2-3",
      fileName: "UI Components",
      fileType: "folder",
      size: 5242880,
      createdAt: "2024-01-14T15:00:00Z",
      starred: false,
      shared: false,
      previewUrl: null,
    },
  ],
  "2-3": [
    // UI Components folder contents
    {
      id: "2-3-1",
      fileName: "Button Styles.css",
      fileType: "document",
      size: 12288,
      createdAt: "2024-01-14T15:05:00Z",
      starred: false,
      shared: false,
      previewUrl: "/placeholder.svg?height=76&width=76",
    },
    {
      id: "2-3-2",
      fileName: "Icons.zip",
      fileType: "archive",
      size: 1048576,
      createdAt: "2024-01-14T15:10:00Z",
      starred: false,
      shared: true,
      previewUrl: "/placeholder.svg?height=76&width=76",
    },
  ],
  "5": [
    // Marketing Materials folder contents
    {
      id: "5-1",
      fileName: "Campaign Brief.docx",
      fileType: "document",
      size: 256000,
      createdAt: "2024-01-10T11:35:00Z",
      starred: false,
      shared: true,
      previewUrl: "/placeholder.svg?height=76&width=76",
    },
    {
      id: "5-2",
      fileName: "Social Media Assets",
      fileType: "folder",
      size: 4194304,
      createdAt: "2024-01-10T12:00:00Z",
      starred: false,
      shared: false,
      previewUrl: null,
    },
  ],
  "5-2": [
    // Social Media Assets folder contents
    {
      id: "5-2-1",
      fileName: "Instagram Post.png",
      fileType: "image",
      size: 512000,
      createdAt: "2024-01-10T12:05:00Z",
      starred: true,
      shared: false,
      previewUrl: "/placeholder.svg?height=76&width=76",
    },
    {
      id: "5-2-2",
      fileName: "Facebook Banner.jpg",
      fileType: "image",
      size: 768000,
      createdAt: "2024-01-10T12:10:00Z",
      starred: false,
      shared: true,
      previewUrl: "/placeholder.svg?height=76&width=76",
    },
  ],
};

const mockRecentActivity = [
  {
    id: "1",
    user: "John Doe",
    action: "uploaded",
    file: "Project Proposal.pdf",
    timestamp: "2024-01-15T10:30:00Z",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    user: "Jane Smith",
    action: "shared",
    file: "Design Assets",
    timestamp: "2024-01-14T14:20:00Z",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

// Static utility functions
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

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

// Static FileTypeIcon component
const FileTypeIcon = ({
  fileName,
  fileType,
  size = "small",
}: {
  fileName: string;
  fileType: string;
  size?: "small" | "large";
}) => {
  const iconSize = size === "large" ? "h-12 w-12" : "h-6 w-6";

  if (fileType === "folder") {
    return <FolderIcon className={`${iconSize} text-blue-500`} />;
  }

  return <FileText className={`${iconSize} text-gray-500`} />;
};

// Breadcrumb component
const Breadcrumbs = ({
  path,
  onNavigate,
}: {
  path: Array<{ id: string; name: string }>;
  onNavigate: (folderId: string) => void;
}) => {
  return (
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
};

const StaticStoragePage = () => {
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const currentFiles = mockFolderStructure[currentFolderId] || [];

  const handleFolderClick = (file: any) => {
    if (file.fileType === "folder") {
      setCurrentFolderId(file.id);
      setBreadcrumbPath((prev) => [
        ...prev,
        { id: file.id, name: file.fileName },
      ]);
    }
  };

  const handleBreadcrumbNavigate = (folderId: string) => {
    setCurrentFolderId(folderId);
    if (folderId === "root") {
      setBreadcrumbPath([]);
    } else {
      const folderIndex = breadcrumbPath.findIndex(
        (folder) => folder.id === folderId
      );
      if (folderIndex !== -1) {
        setBreadcrumbPath((prev) => prev.slice(0, folderIndex + 1));
      }
    }
  };

  return (
    <>
      <Card className="relative my-20 p-3 m-20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="">
              <CardTitle>Smart Storage</CardTitle>
              <CardDescription className="mt-2">
                Manage your files and folders
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                      <div className="flex flex-col gap-2 justify-between">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50%]">Name</TableHead>
                              <TableHead className="w-[15%]">Size</TableHead>
                              <TableHead className="w-[20%]">
                                Uploaded
                              </TableHead>
                              <TableHead className="w-[15%]">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentFiles.map((file, index) => (
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
                                      <FileTypeIcon
                                        fileName={file.fileName}
                                        fileType={file.fileType}
                                        size="small"
                                      />
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
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent
                    value="recent"
                    className="h-full m-0 p-0 data-[state=active]:flex flex-col"
                  >
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-4">
                        {mockRecentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage
                                src={activity.avatar || "/placeholder.svg"}
                              />
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
                                  {activity.action}
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
    </>
  );
};

export default StaticStoragePage;
