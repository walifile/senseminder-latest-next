"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FolderSync, RefreshCw, UploadCloud, Settings2 } from "lucide-react";
import { storageServices } from "../data";

export type StorageService = {
  id: string;
  name: string;
  icon: React.ElementType;
  connected: boolean;
  lastSync: string | null;
};

type StorageSyncDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStorageService: string | null;
  syncInProgress: boolean;
  handleSync: (serviceId: string) => void;
  handleConnectStorage: (serviceId: string) => void;
  formatTimeAgo: (timestamp: string) => string;
};

const StorageSyncDialog: React.FC<StorageSyncDialogProps> = ({
  open,
  onOpenChange,
  selectedStorageService,
  syncInProgress,
  handleSync,
  handleConnectStorage,
  formatTimeAgo,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Storage Integration</DialogTitle>
          <DialogDescription>
            Connect and sync your files from other storage services
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {storageServices.map((service) => (
            <div
              key={service.id}
              className={`p-4 rounded-lg border ${
                service.connected ? "border-primary" : "border-border"
              } hover:bg-muted/50 transition-colors`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <service.icon className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {service.connected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {service.connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(service.id)}
                    disabled={
                      syncInProgress && selectedStorageService === service.id
                    }
                  >
                    {syncInProgress && selectedStorageService === service.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <FolderSync className="h-4 w-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleConnectStorage(service.id)}
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>
              {service.connected && service.lastSync && (
                <p className="text-xs text-muted-foreground">
                  Last synced: {formatTimeAgo(service.lastSync)}
                </p>
              )}
              {service.id === "local" && (
                <div className="mt-2">
                  <Input
                    type="file"
                    className="hidden"
                    id="local-folder-input"
                    multiple
                  />
                  <Label
                    htmlFor="local-folder-input"
                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Select folders to sync
                  </Label>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sync Settings</span>
            </div>
            <Switch id="auto-sync" />
          </div>
          <Label htmlFor="auto-sync" className="text-sm text-muted-foreground">
            Enable automatic synchronization
          </Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StorageSyncDialog;
