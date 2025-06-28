// _components/enhanced-file-transfer-manager.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  FileText,
  Trash2,
  Eye,
  Settings,
  HardDrive,
  CloudUpload,
  CloudDownload,
  Wifi,
  WifiOff,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

// Enhanced DCV Types
interface DcvConnection {
  startFileTransfer: (options: FileTransferOptions) => Promise<FileTransferSession>;
  getFileTransferSessions: () => Promise<FileTransferSession[]>;
  cancelFileTransfer: (sessionId: string) => Promise<void>;
  pauseFileTransfer: (sessionId: string) => Promise<void>;
  resumeFileTransfer: (sessionId: string) => Promise<void>;
  listRemoteFiles?: (path: string) => Promise<RemoteFileInfo[]>;
  createRemoteDirectory?: (path: string) => Promise<void>;
  deleteRemoteFile?: (path: string) => Promise<void>;
  getRemoteFileInfo?: (path: string) => Promise<RemoteFileInfo>;
}

interface FileTransferOptions {
  direction: 'upload' | 'download';
  files?: File[];
  remotePath?: string;
  localPath?: string;
  overwriteExisting?: boolean;
  createDirectories?: boolean;
  preserveTimestamps?: boolean;
  compression?: boolean;
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
  options: FileTransferOptions;
}

interface FileTransferFile {
  name: string;
  path: string;
  size: number;
  transferred: number;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled' | 'skipped';
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

interface FileTransferProgress {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  totalBytes: number;
  transferredBytes: number;
  percentage: number;
  speed: number;
  averageSpeed: number;
  estimatedTimeRemaining: number;
  currentFile?: string;
}

interface RemoteFileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  lastModified: Date;
  permissions?: string;
  owner?: string;
  group?: string;
  isHidden?: boolean;
}

interface FileTransferSettings {
  maxConcurrentTransfers: number;
  chunkSize: number;
  retryAttempts: number;
  overwriteExisting: boolean;
  createDirectories: boolean;
  preserveTimestamps: boolean;
  compression: boolean;
  showHiddenFiles: boolean;
}

interface FileTransferManagerProps {
  connection: any | null;
  isConnected: boolean;
}

export const EnhancedFileTransferManager: React.FC<FileTransferManagerProps> = ({ 
  connection, 
  isConnected 
}) => {
  // State management
  const [sessions, setSessions] = useState<FileTransferSession[]>([]);
  const [remoteFiles, setRemoteFiles] = useState<RemoteFileInfo[]>([]);
  const [currentRemotePath, setCurrentRemotePath] = useState('/home');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoadingRemoteFiles, setIsLoadingRemoteFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('excellent');
  
  // Settings state
  const [settings, setSettings] = useState<FileTransferSettings>({
    maxConcurrentTransfers: 3,
    chunkSize: 1024 * 1024, // 1MB
    retryAttempts: 3,
    overwriteExisting: true,
    createDirectories: true,
    preserveTimestamps: false,
    compression: true,
    showHiddenFiles: false
  });

  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning';
    message: string;
    timestamp: Date;
  }>>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return '0 B/s';
    return formatFileSize(bytesPerSecond) + '/s';
  };

  const isFileTransferSupported = useCallback(() => {
  return connection && 
         typeof connection.startFileTransfer === 'function' &&
         typeof connection.getFileTransferSessions === 'function';
}, [connection]);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds <= 0) return '∞';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const addNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Connection quality monitoring
  const checkConnectionQuality = useCallback(async () => {
    if (!connection || !isConnected) {
      setConnectionQuality('offline');
      return;
    }

    try {
      const startTime = Date.now();
      await connection.getFileTransferSessions();
      const latency = Date.now() - startTime;
      
      if (latency < 100) setConnectionQuality('excellent');
      else if (latency < 300) setConnectionQuality('good');
      else setConnectionQuality('poor');
    } catch {
      setConnectionQuality('poor');
    }
  }, [connection, isConnected]);

  // Load file transfer sessions with enhanced error handling
  const loadSessions = useCallback(async () => {
    if (!connection || !isConnected) return;
    
    try {
      const activeSessions = await connection.getFileTransferSessions();
      setSessions(activeSessions);
      setError(null);
    } catch (error) {
      console.error('Failed to load file transfer sessions:', error);
      setError('Failed to load transfer sessions');
      addNotification('error', 'Failed to load transfer sessions');
    }
  }, [connection, isConnected]);

  // Enhanced remote file loading with better error handling
  const loadRemoteFiles = useCallback(async (path: string = '/home') => {
    if (!connection || !isConnected) return;
    
    setIsLoadingRemoteFiles(true);
    setError(null);
    
    try {
      let files: RemoteFileInfo[] = [];
      
      if (connection.listRemoteFiles) {
        files = await connection.listRemoteFiles(path);
      } else {
        // Enhanced mock data for better testing
        files = [
          {
            name: '..', path: path.split('/').slice(0, -1).join('/') || '/', 
            size: 0, isDirectory: true, lastModified: new Date()
          },
          {
            name: 'Documents', path: `${path}/Documents`, size: 0, 
            isDirectory: true, lastModified: new Date(), permissions: 'drwxr-xr-x'
          },
          {
            name: 'Downloads', path: `${path}/Downloads`, size: 0, 
            isDirectory: true, lastModified: new Date(), permissions: 'drwxr-xr-x'
          },
          {
            name: 'Pictures', path: `${path}/Pictures`, size: 0, 
            isDirectory: true, lastModified: new Date(), permissions: 'drwxr-xr-x'
          },
        
          {
            name: 'large_file.zip', path: `${path}/large_file.zip`, size: 50 * 1024 * 1024, 
            isDirectory: false, lastModified: new Date(), permissions: '-rw-r--r--'
          },
          {
            name: '.hidden_file', path: `${path}/.hidden_file`, size: 512, 
            isDirectory: false, lastModified: new Date(), permissions: '-rw-------', isHidden: true
          }
        ];
      }
      
      // Filter based on settings
      if (!settings.showHiddenFiles) {
        files = files.filter(file => !file.isHidden && !file.name.startsWith('.'));
      }
      
      // Filter based on search
      if (searchQuery) {
        files = files.filter(file => 
          file.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setRemoteFiles(files);
      setCurrentRemotePath(path);
      addNotification('success', `Loaded ${files.length} items from ${path}`);
    } catch (error) {
      console.error('Failed to load remote files:', error);
      setError(`Failed to load files from ${path}`);
      addNotification('error', `Failed to load files from ${path}`);
    } finally {
      setIsLoadingRemoteFiles(false);
    }
  }, [connection, isConnected, settings.showHiddenFiles, searchQuery]);

  // Enhanced session monitoring with better progress tracking
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
          
          // Notify on completion
          if (session.status === 'completed') {
            addNotification('success', 
              `${session.direction === 'upload' ? 'Upload' : 'Download'} completed: ${session.files.length} files`
            );
            clearInterval(interval);
          } else if (session.status === 'failed') {
            addNotification('error', 
              `${session.direction === 'upload' ? 'Upload' : 'Download'} failed: ${session.error || 'Unknown error'}`
            );
            clearInterval(interval);
          } else if (session.status === 'cancelled') {
            addNotification('warning', 
              `${session.direction === 'upload' ? 'Upload' : 'Download'} cancelled`
            );
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Failed to monitor session:', error);
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup after 10 minutes
    setTimeout(() => clearInterval(interval), 600000);
    
    return interval;
  }, [connection, isConnected]);

  // Enhanced file upload with validation
  const handleFileUpload = async (files: File[]) => {
    if (!connection || !isConnected || files.length === 0) return;

    // Validate files
    const maxFileSize = 5 * 1024 * 1024 * 1024; // 5GB
    const invalidFiles = files.filter(file => file.size > maxFileSize);
    
    if (invalidFiles.length > 0) {
      addNotification('error', `Some files exceed the 5GB limit: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    try {
      const session = await connection.startFileTransfer({
        direction: 'upload',
        files: files,
        remotePath: currentRemotePath,
        overwriteExisting: settings.overwriteExisting,
        createDirectories: settings.createDirectories,
        preserveTimestamps: settings.preserveTimestamps,
        compression: settings.compression
      });

      setSessions(prev => [...prev, session]);
      monitorSession(session.id);
      addNotification('success', `Started upload: ${files.length} files`);
    } catch (error) {
      console.error('Failed to start file upload:', error);
      addNotification('error', `Failed to start upload: ${error}`);
    }
  };

  // Enhanced file download
  const handleFileDownload = async (remotePath: string, fileName?: string) => {
    if (!connection || !isConnected) return;

    try {
      const session = await connection.startFileTransfer({
        direction: 'download',
        remotePath: remotePath,
        overwriteExisting: settings.overwriteExisting,
        preserveTimestamps: settings.preserveTimestamps,
        compression: settings.compression
      });

      setSessions(prev => [...prev, session]);
      monitorSession(session.id);
      addNotification('success', `Started download: ${fileName || remotePath}`);
    } catch (error) {
      console.error('Failed to start file download:', error);
      addNotification('error', `Failed to start download: ${error}`);
    }
  };

  // Enhanced session control
  const handleSessionControl = async (sessionId: string, action: 'pause' | 'resume' | 'cancel') => {
    if (!connection || !isConnected) return;

    try {
      switch (action) {
        case 'pause':
          await connection.pauseFileTransfer(sessionId);
          addNotification('warning', 'Transfer paused');
          break;
        case 'resume':
          await connection.resumeFileTransfer(sessionId);
          addNotification('success', 'Transfer resumed');
          break;
        case 'cancel':
          await connection.cancelFileTransfer(sessionId);
          addNotification('warning', 'Transfer cancelled');
          break;
      }
      loadSessions();
    } catch (error) {
      console.error(`Failed to ${action} transfer:`, error);
      addNotification('error', `Failed to ${action} transfer`);
    }
  };

  // File input handlers
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(Array.from(files));
    }
    if (event.target) event.target.value = '';
  };

  const handleFolderInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(Array.from(files));
    }
    if (event.target) event.target.value = '';
  };

  // Navigation
  const navigateToDirectory = (path: string) => {
    if (path === currentRemotePath) return;
    loadRemoteFiles(path);
  };

  // Bulk operations
 const handleBulkDownload = async () => {
  if (selectedFiles.length === 0) {
    addNotification('warning', 'No files selected for download');
    return;
  }

  if (!isFileTransferSupported()) {
    addNotification('error', 'Bulk download is not supported by this connection');
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const filePath of selectedFiles) {
    const file = remoteFiles.find(f => f.path === filePath);
    if (file && !file.isDirectory) {
      try {
        await handleFileDownload(filePath, file.name);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to download ${file.name}:`, error);
      }
    }
  }
  
  if (successCount > 0) {
    addNotification('success', `Started ${successCount} downloads`);
  }
  if (errorCount > 0) {
    addNotification('error', `Failed to start ${errorCount} downloads`);
  }
  
  setSelectedFiles([]);
};

  // Status icons
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

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <Wifi className="h-4 w-4 text-red-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  // Initialize and cleanup
  useEffect(() => {
    if (isConnected) {
      loadSessions();
      loadRemoteFiles();
      checkConnectionQuality();
      
      // Start polling for connection quality
      pollingIntervalRef.current = setInterval(checkConnectionQuality, 30000);
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isConnected, loadSessions, loadRemoteFiles, checkConnectionQuality]);

  if (!isConnected) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <WifiOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg mb-2">Connection Required</p>
        <p className="text-sm">Connect to remote desktop to enable file transfer</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">File Transfer</h3>
          {getConnectionIcon()}
          <Badge variant="outline" className="text-xs">
            {connectionQuality}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.slice(0, 3).map(notification => (
            <Alert key={notification.id} className={cn(
              "py-2",
              notification.type === 'error' && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
              notification.type === 'warning' && "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
              notification.type === 'success' && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            )}>
              <AlertDescription className="text-sm">
                {notification.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Transfer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Max Concurrent Transfers</Label>
                <Input
                  type="number"
                  value={settings.maxConcurrentTransfers}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    maxConcurrentTransfers: parseInt(e.target.value) || 1
                  }))}
                  min={1}
                  max={10}
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Retry Attempts</Label>
                <Input
                  type="number"
                  value={settings.retryAttempts}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    retryAttempts: parseInt(e.target.value) || 0
                  }))}
                  min={0}
                  max={10}
                  className="h-8"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Overwrite Existing Files</Label>
                <Switch
                  checked={settings.overwriteExisting}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    overwriteExisting: checked
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Create Directories</Label>
                <Switch
                  checked={settings.createDirectories}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    createDirectories: checked
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Preserve Timestamps</Label>
                <Switch
                  checked={settings.preserveTimestamps}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    preserveTimestamps: checked
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Compression</Label>
                <Switch
                  checked={settings.compression}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    compression: checked
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Hidden Files</Label>
                <Switch
                  checked={settings.showHiddenFiles}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, showHiddenFiles: checked }));
                    loadRemoteFiles(currentRemotePath);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="transfers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transfers" className="text-xs">
            Active Transfers
            {sessions.filter(s => ['pending', 'active', 'paused'].includes(s.status)).length > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs">
                {sessions.filter(s => ['pending', 'active', 'paused'].includes(s.status)).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs">
            <CloudUpload className="h-3 w-3 mr-1" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="download" className="text-xs">
            <CloudDownload className="h-3 w-3 mr-1" />
            Download
          </TabsTrigger>
        </TabsList>
        
        {/* Active Transfers Tab */}
        <TabsContent value="transfers" className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Active Transfers</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={loadSessions}>
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setSessions(prev => prev.filter(s => 
                  !['completed', 'failed', 'cancelled'].includes(s.status)
                ))}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {sessions.map(session => (
                <Card key={session.id} className="p-3">
                  <div className="space-y-3">
                    {/* Session Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {session.direction === 'upload' ? 
                          <CloudUpload className="h-4 w-4 text-blue-500" /> :
                          <CloudDownload className="h-4 w-4 text-green-500" />
                        }
                        {getStatusIcon(session.status)}
                        <span className="text-sm font-medium">
                          {session.direction === 'upload' ? 'Upload' : 'Download'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {session.files.length} files
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {session.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {session.status === 'active' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSessionControl(session.id, 'pause')}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        {session.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSessionControl(session.id, 'resume')}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        {!['completed', 'failed', 'cancelled'].includes(session.status) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSessionControl(session.id, 'cancel')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <Progress value={session.progress.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {formatFileSize(session.progress.transferredBytes)} / {formatFileSize(session.progress.totalBytes)}
                        </span>
                        <span>{session.progress.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    {/* Current File and Stats */}
                    {session.progress.currentFile && (
                      <div className="text-xs text-muted-foreground truncate">
                        Current: {session.progress.currentFile}
                      </div>
                    )}
                    
                    {session.status === 'active' && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Speed: {formatSpeed(session.progress.speed)}</span>
                        <span>ETA: {formatTime(session.progress.estimatedTimeRemaining)}</span>
                      </div>
                    )}
                    
                    {/* Error Display */}
                    {session.error && (
                      <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">
                        {session.error}
                      </div>
                    )}
                    
                    {/* Session Summary */}
                    {['completed', 'failed', 'cancelled'].includes(session.status) && (
                      <div className="text-xs text-muted-foreground">
                        Completed: {session.progress.completedFiles}/{session.progress.totalFiles} files
                        {session.progress.failedFiles > 0 && (
                          <span className="text-red-500 ml-2">
                            ({session.progress.failedFiles} failed)
                          </span>
                        )}
                        {session.endTime && session.startTime && (
                          <span className="ml-2">
                            Duration: {formatTime((session.endTime.getTime() - session.startTime.getTime()) / 1000)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <HardDrive className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">No Active Transfers</p>
                  <p className="text-sm">Start uploading or downloading files to see progress here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Upload to Remote</h4>
              <Badge variant="outline" className="text-xs">
                Target: {currentRemotePath}
              </Badge>
            </div>
            
            {/* Upload Options */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="h-24 flex-col gap-3 border-dashed border-2 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <File className="h-8 w-8 text-blue-500" />
                <div className="text-center">
                  <div className="text-sm font-medium">Select Files</div>
                  <div className="text-xs text-muted-foreground">Choose individual files</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => folderInputRef.current?.click()}
                className="h-24 flex-col gap-3 border-dashed border-2 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950"
              >
                <Folder className="h-8 w-8 text-green-500" />
                <div className="text-center">
                  <div className="text-sm font-medium">Select Folder</div>
                  <div className="text-xs text-muted-foreground">Upload entire directory</div>
                </div>
              </Button>
            </div>
            
            {/* Drag & Drop Area */}
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  handleFileUpload(files);
                }
              }}
            >
              <CloudUpload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">Drag & Drop Files Here</p>
              <p className="text-sm text-muted-foreground">
                Or use the buttons above to select files/folders
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Maximum file size: 5GB per file
              </p>
            </div>
            
            {/* Upload Settings Quick Access */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
              <div className="text-xs font-medium mb-2">Quick Settings</div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Overwrite existing files</Label>
                <Switch
                  checked={settings.overwriteExisting}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    overwriteExisting: checked
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Create directories if needed</Label>
                <Switch
                  checked={settings.createDirectories}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    createDirectories: checked
                  }))}
                />
              </div>
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
          <div className="space-y-4">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Remote Files</h4>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => loadRemoteFiles(currentRemotePath)}
                  disabled={isLoadingRemoteFiles}
                >
                  <RefreshCw className={cn("h-3 w-3", isLoadingRemoteFiles && "animate-spin")} />
                </Button>
                {selectedFiles.length > 0 && (
                  <Button size="sm" onClick={handleBulkDownload}>
                    <Download className="h-3 w-3 mr-1" />
                    Download ({selectedFiles.length})
                  </Button>
                )}
              </div>
            </div>
            
            {/* Search and Path */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    loadRemoteFiles(currentRemotePath);
                  }}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded flex items-center gap-2">
                <FolderOpen className="h-3 w-3" />
                <span>Path: {currentRemotePath}</span>
              </div>
            </div>
            
            {/* File Browser */}
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-2">
                {isLoadingRemoteFiles ? (
                  <div className="text-center text-muted-foreground py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading files...</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {/* Parent Directory */}
                    {currentRemotePath !== '/' && currentRemotePath !== '/home' && (
                      <div
                        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer group"
                        onClick={() => {
                          const parentPath = currentRemotePath.split('/').slice(0, -1).join('/') || '/';
                          navigateToDirectory(parentPath);
                        }}
                      >
                        <FolderOpen className="h-4 w-4 mr-3 text-blue-500" />
                        <span className="text-sm font-medium">.. (parent directory)</span>
                      </div>
                    )}
                    
                    {/* File List */}
                    {remoteFiles.map(file => (
                      <div
                        key={file.path}
                        className={cn(
                          "flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded group",
                          selectedFiles.includes(file.path) && "bg-blue-50 dark:bg-blue-950"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Checkbox for selection */}
                          {!file.isDirectory && (
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes(file.path)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFiles(prev => [...prev, file.path]);
                                } else {
                                  setSelectedFiles(prev => prev.filter(p => p !== file.path));
                                }
                              }}
                              className="rounded"
                            />
                          )}
                          
                          {/* File Icon */}
                          {file.isDirectory ? (
                            <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          )}
                          
                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {!file.isDirectory && (
                                <span>{formatFileSize(file.size)} • </span>
                              )}
                              {file.lastModified.toLocaleDateString()}
                              {file.permissions && (
                                <span className="ml-2 font-mono">{file.permissions}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {file.isDirectory ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigateToDirectory(file.path)}
                            >
                              <FolderOpen className="h-3 w-3" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleFileDownload(file.path, file.name)}
                                title="Download file"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="File details"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {remoteFiles.length === 0 && !isLoadingRemoteFiles && (
                      <div className="text-center text-muted-foreground py-8">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg mb-2">No Files Found</p>
                        <p className="text-sm">
                          {searchQuery ? 
                            `No files match "${searchQuery}"` : 
                            "This directory is empty"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Selection Summary */}
            {selectedFiles.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">{selectedFiles.length} files selected</span>
                    <span className="text-muted-foreground ml-2">
                      Total size: {formatFileSize(
                        selectedFiles.reduce((total, path) => {
                          const file = remoteFiles.find(f => f.path === path);
                          return total + (file?.size || 0);
                        }, 0)
                      )}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFiles([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};