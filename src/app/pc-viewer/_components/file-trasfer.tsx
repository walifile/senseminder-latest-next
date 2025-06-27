// _components/file-transfer-manager.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Download, 
  X, 
  File, 
  FolderOpen, 
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
  Play,
  RefreshCw,
  Folder,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

// DCV Types based on AWS DCV Web SDK documentation
interface DcvConnection {
  startFileTransfer: (options: FileTransferOptions) => Promise<FileTransferSession>;
  getFileTransferSessions: () => Promise<FileTransferSession[]>;
  cancelFileTransfer: (sessionId: string) => Promise<void>;
  pauseFileTransfer: (sessionId: string) => Promise<void>;
  resumeFileTransfer: (sessionId: string) => Promise<void>;
  listRemoteFiles?: (path: string) => Promise<RemoteFileInfo[]>;
}

interface FileTransferOptions {
  direction: 'upload' | 'download';
  files?: File[];
  remotePath?: string;
  localPath?: string;
  overwriteExisting?: boolean;
  createDirectories?: boolean;
}

interface FileTransferSession {
  id: string;
  direction: 'upload' | 'download';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  files: FileTransferFile[];
  progress: FileTransferProgress;
  startTime: Date;
  endTime?: Date;
  error?: string;
}

interface FileTransferFile {
  name: string;
  path: string;
  size: number;
  transferred: number;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
  error?: string;
}

interface FileTransferProgress {
  totalFiles: number;
  completedFiles: number;
  totalBytes: number;
  transferredBytes: number;
  percentage: number;
  speed: number;
  estimatedTimeRemaining: number;
}

interface RemoteFileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  lastModified: Date;
  permissions?: string;
}

interface FileTransferManagerProps {
  connection: any | null;
  isConnected: boolean;
}

export const FileTransferManager: React.FC<FileTransferManagerProps> = ({ 
  connection, 
  isConnected 
}) => {
  const [sessions, setSessions] = useState<FileTransferSession[]>([]);
  const [remoteFiles, setRemoteFiles] = useState<RemoteFileInfo[]>([]);
  const [currentRemotePath, setCurrentRemotePath] = useState('/');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoadingRemoteFiles, setIsLoadingRemoteFiles] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format speed
  const formatSpeed = (bytesPerSecond: number): string => {
    return formatFileSize(bytesPerSecond) + '/s';
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  // Load file transfer sessions
  const loadSessions = useCallback(async () => {
    if (!connection || !isConnected) return;
    
    try {
      const activeSessions = await connection.getFileTransferSessions();
      setSessions(activeSessions);
    } catch (error) {
      console.error('Failed to load file transfer sessions:', error);
    }
  }, [connection, isConnected]);

  // Load remote files
  const loadRemoteFiles = useCallback(async (path: string = '/') => {
    if (!connection || !isConnected) return;
    
    setIsLoadingRemoteFiles(true);
    try {
      if (connection.listRemoteFiles) {
        const files = await connection.listRemoteFiles(path);
        setRemoteFiles(files);
      } else {
        // Mock data for demonstration
        const mockFiles: RemoteFileInfo[] = [
          {
            name: 'Documents',
            path: `${path}Documents`,
            size: 0,
            isDirectory: true,
            lastModified: new Date(),
            permissions: 'rwxr--r--'
          },
          {
            name: 'Downloads',
            path: `${path}Downloads`,
            size: 0,
            isDirectory: true,
            lastModified: new Date(),
            permissions: 'rwxr--r--'
          },
          {
            name: 'example.txt',
            path: `${path}example.txt`,
            size: 1024,
            isDirectory: false,
            lastModified: new Date(),
            permissions: 'rw-r--r--'
          }
        ];
        setRemoteFiles(mockFiles);
      }
      setCurrentRemotePath(path);
    } catch (error) {
      console.error('Failed to load remote files:', error);
    } finally {
      setIsLoadingRemoteFiles(false);
    }
  }, [connection, isConnected]);

  // Monitor session progress
  const monitorSession = useCallback((sessionId: string) => {
    const interval = setInterval(async () => {
      if (!connection || !isConnected) {
        clearInterval(interval);
        return;
      }

      try {
        const activeSessions = await connection.getFileTransferSessions();
        const session = activeSessions.find((s: FileTransferSession) => s.id === sessionId);
        
        if (session) {
          setSessions(prev => prev.map(s => s.id === sessionId ? session : s));
          
          // Stop monitoring if session is complete
          if (['completed', 'failed', 'cancelled'].includes(session.status)) {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Failed to monitor session:', error);
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  }, [connection, isConnected]);

  // Initialize component
  useEffect(() => {
    if (isConnected) {
      loadSessions();
      loadRemoteFiles();
    }
  }, [isConnected, loadSessions, loadRemoteFiles]);

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (!connection || !isConnected || files.length === 0) return;

    try {
      const session = await connection.startFileTransfer({
        direction: 'upload',
        files: files,
        overwriteExisting: true,
        createDirectories: true
      });

      setSessions(prev => [...prev, session]);
      monitorSession(session.id);
    } catch (error) {
      console.error('Failed to start file upload:', error);
    }
  };

  // Handle file download
  const handleFileDownload = async (remotePath: string) => {
    if (!connection || !isConnected) return;

    try {
      const session = await connection.startFileTransfer({
        direction: 'download',
        remotePath: remotePath
      });

      setSessions(prev => [...prev, session]);
      monitorSession(session.id);
    } catch (error) {
      console.error('Failed to start file download:', error);
    }
  };

  // Handle session control
  const handleSessionControl = async (sessionId: string, action: 'pause' | 'resume' | 'cancel') => {
    if (!connection || !isConnected) return;

    try {
      switch (action) {
        case 'pause':
          await connection.pauseFileTransfer(sessionId);
          break;
        case 'resume':
          await connection.resumeFileTransfer(sessionId);
          break;
        case 'cancel':
          await connection.cancelFileTransfer(sessionId);
          break;
      }
      loadSessions();
    } catch (error) {
      console.error(`Failed to ${action} transfer:`, error);
    }
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(Array.from(files));
    }
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Handle folder input change
  const handleFolderInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(Array.from(files));
    }
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Navigate to directory
  const navigateToDirectory = (path: string) => {
    loadRemoteFiles(path);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'active':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Connect to enable file transfer
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="transfers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
        </TabsList>
        
        {/* Active Transfers Tab */}
        <TabsContent value="transfers" className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Active Transfers</h4>
            <Button size="sm" variant="outline" onClick={loadSessions}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {sessions.map(session => (
                <Card key={session.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(session.status)}
                        <span className="text-sm font-medium">
                          {session.direction === 'upload' ? 'Upload' : 'Download'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {session.files.length} files
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {session.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSessionControl(session.id, 'pause')}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        {session.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSessionControl(session.id, 'resume')}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        {!['completed', 'failed', 'cancelled'].includes(session.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSessionControl(session.id, 'cancel')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <Progress value={session.progress.percentage} className="h-2" />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(session.progress.transferredBytes)} / {formatFileSize(session.progress.totalBytes)}</span>
                      <span>{session.progress.percentage.toFixed(1)}%</span>
                    </div>
                    
                    {session.status === 'active' && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatSpeed(session.progress.speed)}</span>
                        <span>ETA: {formatTime(session.progress.estimatedTimeRemaining)}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No active transfers
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Upload Files</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="h-20 flex-col gap-2"
              >
                <File className="h-6 w-6" />
                <span className="text-sm">Select Files</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => folderInputRef.current?.click()}
                className="h-20 flex-col gap-2"
              >
                <Folder className="h-6 w-6" />
                <span className="text-sm">Select Folder</span>
              </Button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore - webkitdirectory is not in TypeScript types
            webkitdirectory=""
            className="hidden"
            onChange={handleFolderInputChange}
          />
        </TabsContent>
        
        {/* Download Tab */}
        <TabsContent value="download" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Remote Files</h4>
            <Button size="sm" variant="outline" onClick={() => loadRemoteFiles(currentRemotePath)}>
              <RefreshCw className={cn("h-3 w-3", isLoadingRemoteFiles && "animate-spin")} />
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
            Path: {currentRemotePath}
          </div>
          
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {currentRemotePath !== '/' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigateToDirectory(currentRemotePath.split('/').slice(0, -2).join('/') + '/')}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  .. (parent directory)
                </Button>
              )}
              
              {remoteFiles.map(file => (
                <div key={file.path} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                  <div className="flex items-center gap-2 flex-1">
                    {file.isDirectory ? (
                      <FolderOpen className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm truncate">{file.name}</span>
                    {!file.isDirectory && (
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    )}
                  </div>
                  
                  {file.isDirectory ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigateToDirectory(file.path)}
                    >
                      <FolderOpen className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFileDownload(file.path)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              
              {remoteFiles.length === 0 && !isLoadingRemoteFiles && (
                <div className="text-center text-muted-foreground py-8">
                  No files found
                </div>
              )}
              
              {isLoadingRemoteFiles && (
                <div className="text-center text-muted-foreground py-8">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Loading files...
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};