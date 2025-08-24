"use client";
import AssignUserDialog from "../_components/assign-user-dialog";
import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play, Plus, ExternalLink, Trash2, Shield, Clock, CalendarClock, Moon,
  LayoutGrid, List, MoreVertical, StopCircle, AlertCircle, Search, Loader2, Cpu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import SmartPCConfigDialog from "@/app/build-smartpc/_components/smart-pc-config-dialog";
import { ConfirmStopModal } from "@/app/build-smartpc/_components/confirm-stop-pc-dialog";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useLaunchVMMutation, useListRemoteDesktopQuery, useStartVMMutation, useStopVMMutation,
} from "@/api/fileManagerAPI";
import { useDeleteVMMutation } from "@/api/vmManagement";
import { DesktopInstance, PC } from "@/app/build-smartpc/types";
import { mockUsers, stableStates } from "@/app/build-smartpc/data";
import {
  getStatusIcon, getStatusText, isBusy, isStartingInstance,
} from "@/app/build-smartpc/utils";
import SmartPCEmptyState from "@/app/build-smartpc/_components/smart-pc-empty-state";
import ScheduleDialog from "@/app/build-smartpc/_components/schedule-dialog";
import IdleSettingsDialog from "@/app/build-smartpc/_components/idle-settings-dialog";
import { ConfirmDeleteModal } from "@/app/build-smartpc/_components/confirm-delete-pc-diolog";
import { setLaunchVMResponse } from "@/redux/slices/dcv/dcv-slice";
import { routes } from "@/constants/routes";
import { Checkbox } from "@/components/ui/checkbox";
import SelectedPc from "@/app/build-smartpc/_components/selected-pc";
import { fetchInstanceDetails, InstanceDetail } from "@/api/realtime";
import { getAssignments } from "@/api/assignpc";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateSessionHeartbeat } from "@/api/session";
// --- IDLE TIMEOUT API ---
import {
  setIdleTimeout, getIdleTimeout, deleteIdleTimeout,
} from "@/api/smartPC-Idle-settings";
import {
  addStartingInstance, removeStartingInstance,
} from "@/redux/slices/dcv/starting-instances-slice";

// ---- Configurable API endpoints ----
const INCREASE_VOLUME_URL =
  process.env.NEXT_PUBLIC_INCREASE_VOLUME_API ??
  "https://y2yvok8mk6.execute-api.us-east-1.amazonaws.com/dev/increase-volume"; // fallback guess

const CloudPCPage = () => {
  // --- Redux / UI hooks
  const dispatch = useDispatch();
  const { toast } = useToast();

  const config = useSelector((state: RootState) => state.smartPcConfig);
  const { user } = useSelector((state: RootState) => state.auth);

  // Derive API userId
   
  function getApiUserId(u: any) {
    if (!u) return "";
    if (u.role === "member" || u.role === "admin") return u.ownerid;
    return u.id;
  }
  const apiUserId = getApiUserId(user);

  // Assignments map to control actions for member-assigned PCs
  const [assignments, setAssignments] = useState<Record<string, { instanceId: string }[]>>({});
  useEffect(() => {
    getAssignments()
      .then((res) => setAssignments(res))
      .catch((err) => {
        console.error("Failed to load assignments", err);
        setAssignments({});
      });
  }, []);
  const isPCAssigned = (instanceId: string): boolean =>
    Object.values(assignments).some((pcs) => pcs.some((pc) => pc.instanceId === instanceId));

  const isMember = user?.role === "member";

  // Helpers
  function formatIdleTime(mins: number): string {
    if (isNaN(mins)) return "—";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  }

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const startingInstances = useSelector((state: RootState) => state.startVM.startingInstances);

  // Query remote desktops
  const [shouldPoll, setShouldPoll] = useState(true);
  const [currentModal, setCurrentModal] = useState<"schedule" | "delete" | "idle" | null>(null);
  const [stoppingInstances, setStoppingInstances] = useState<string[]>([]);
  const [launchingInstances, setLaunchingInstances] = useState<string[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<{ id: string; name: string } | null>(null);

  const [selectedPCs, setSelectedPCs] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(true);

  const {
    isError,
    error,
    data,
    isLoading,
    refetch: refetchRemoteDesktops,
  } = useListRemoteDesktopQuery(
    { userId },
    {
      skip: !userId,
      pollingInterval: shouldPoll ? 5000 : 0,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );

  // VM actions
  const [stopVM, { isLoading: isStopping }] = useStopVMMutation();
  const [startVM] = useStartVMMutation();
  const [launchVM] = useLaunchVMMutation();
  const [deleteVM, { isLoading: isDeleting }] = useDeleteVMMutation();

  // Local UI state
  const [cloudPCs, setCloudPCs] = useState<PC[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPCDialog, setShowNewPCDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [showPCResizeDialog, setShowPCResizeDialog] = useState(false);
  const [selectedPCForCPUResize, setSelectedPCForCPUResize] = useState<PCForCPUResize | null>(null);

  // NEW: Increase Storage
  const [showStorageIncreaseDialog, setShowStorageIncreaseDialog] = useState(false);
  const [selectedPCForStorage, setSelectedPCForStorage] = useState<PCForCPUResize | null>(null);

  // Dialogs
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showIdleDialog, setShowIdleDialog] = useState(false);
  const [showAssignUserDialog, setShowAssignUserDialog] = useState(false);
  const [selectedPCForAssign, setSelectedPCForAssign] = useState<PC | null>(null);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [selectedPCForStop, setSelectedPCForStop] = useState<{ id: string; name: string } | null>(null);
  const [selectedPCForSchedule, setSelectedPCForSchedule] = useState<PC | null>(null);

  // Idle settings
  const [selectedPCForIdle, setSelectedPCForIdle] = useState<PC | null>(null);
  const [selectedIdleTimeout, setSelectedIdleTimeout] = useState<string>("30");

  // Realtime info
  const [realtimePcInfo, setRealtimePcInfo] = useState<Record<string, InstanceDetail>>({});

  // Heartbeat
  useEffect(() => {
    updateSessionHeartbeat();
  }, []);

  // Polling control (stable-state heuristic)
  useEffect(() => {
    if (isError) {
      setShouldPoll(false);
      return;
    }
    if (!data || data.length === 0) {
      setShouldPoll(false);
      return;
    }
    const allStable = data.every(
      (instance: DesktopInstance) =>
        instance.state !== undefined && stableStates.includes(instance.state)
    );
    setShouldPoll(!allStable);
  }, [data, isError, error]);

  // Pause polling while CPU Resize dialog is open (prevents re-hydrates)
  useEffect(() => {
    if (showPCResizeDialog) setShouldPoll(false);
    else setShouldPoll(true);
  }, [showPCResizeDialog]);

  // Enrich list for UI badges, etc.
  useEffect(() => {
    if (isError || !data) return;
    const enriched = data.map((pc: PC, index: number) => ({
      ...pc,
      assignedUsers: mockUsers.slice(0, (index % mockUsers.length) + 1),
    }));
    setCloudPCs(enriched);
  }, [data, isError]);

  // Open create dialog based on global trigger
  useEffect(() => {
    if (config.show) setShowNewPCDialog(true);
  }, [config.show]);

  // Realtime instance metrics
  useEffect(() => {
    if (!apiUserId || !Array.isArray(cloudPCs) || cloudPCs.length === 0) return;
    const instanceNames = cloudPCs.map((pc) => pc.systemName);
    fetchInstanceDetails(apiUserId, instanceNames)
      .then((details) => {
        const map: Record<string, InstanceDetail> = {};
        details.forEach((d) => {
          if (d.systemName) map[d.systemName] = d;
        });
        setRealtimePcInfo(map);
      })
      .catch((err) => {
        setRealtimePcInfo({});
        console.error("Failed to fetch real-time PC info", err);
      });
  }, [apiUserId, cloudPCs]);

  // List filters
  const filteredPCs = Array.isArray(data)
    ? data.filter((pc: PC) => {
        const q = searchQuery.toLowerCase();
        return (
          pc.systemName?.toLowerCase().includes(q) ||
          pc.description?.toLowerCase().includes(q) ||
          pc.region?.toLowerCase().includes(q)
        );
      })
    : [];

  // Selection helpers
  const handlePCSelection = (index: number) => {
    setSelectedPCs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedPCs.length === filteredPCs.length) setSelectedPCs([]);
    else setSelectedPCs(filteredPCs.map((_, index) => index));
  };

  // Schedule dialog
  const handleScheduleSettings = (pc: PC) => {
    setSelectedPCForSchedule(pc);
    setShowScheduleDialog(true);
  };

  // Idle settings
  const handleIdleSettings = async (pc: PC) => {
    setSelectedPCForIdle(pc);
    try {
      const res = await getIdleTimeout(pc.instanceId);
      setSelectedIdleTimeout(String(res.timeout));
    } catch (error) {
      console.error("Failed to fetch idle timeout:", error);
      setSelectedIdleTimeout("30");
    }
    setShowIdleDialog(true);
  };

  const handleAssignUser = (pc: PC) => {
    setSelectedPCForAssign(pc);
    setShowAssignUserDialog(true);
  };

  const handleSaveIdleSettings = async () => {
    if (!selectedPCForIdle) {
      setShowIdleDialog(false);
      return;
    }
    const noneValues = ["", "none", "0"];
    const trimmed = String(selectedIdleTimeout).trim().toLowerCase();
    try {
      if (noneValues.includes(trimmed)) {
        await deleteIdleTimeout(selectedPCForIdle.instanceId);
        toast({
          title: "Idle Timeout Removed",
          description: `Idle timeout was cleared for ${selectedPCForIdle.systemName}`,
        });
      } else {
        await setIdleTimeout(selectedPCForIdle.instanceId, Number(selectedIdleTimeout));
        toast({
          title: "Idle Timeout Saved",
          description: `Timeout set to ${selectedIdleTimeout} minutes for ${selectedPCForIdle.systemName}`,
        });
      }
    } catch (e) {
      console.error("Failed to save idle timeout:", e);
      toast({
        title: "Idle Timeout Change Failed",
        description: "Could not update idle timeout",
        variant: "destructive",
      });
    } finally {
      setShowIdleDialog(false);
    }
  };

  // VM actions
  const handleStop = async (instanceId: string) => {
    setStoppingInstances((prev) => [...prev, instanceId]);
    try {
      await stopVM(instanceId).unwrap();
      toast({ title: "Computer Stopping", description: "The Computer is stopping...." });
    } catch (error) {
      console.error("StopVM error:", error);
      let errorMessage =
        "Unable to stop the Computer. Please wait a few moments and try again.";
      if (error && typeof error === "object" && "data" in error && typeof (error as any).data === "string") {
        errorMessage = (error as any).data;
      }
      toast({
        title: "Failed to Stop Instance",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setStoppingInstances((prev) => prev.filter((id) => id !== instanceId));
      dispatch(removeStartingInstance(instanceId));
    }
  };

  const handleStart = async (instanceId: string) => {
    dispatch(addStartingInstance(instanceId));
    try {
      await startVM(instanceId).unwrap();
      toast({ title: "Computer Starting", description: "The Computer is starting ....." });
    } catch (error) {
      console.error("StartVM error:", error);
      let errorMessage =
        "Unable to start the Computer. Please wait a few moments and try again.";
      if (error && typeof error === "object" && "data" in error && typeof (error as any).data === "string") {
        errorMessage = (error as any).data;
      }
      toast({
        title: "Failed to Start Computer",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleLaunch = async (instanceId: string, pcName: string) => {
    setLaunchingInstances((prev) => [...prev, instanceId]);
    try {
      const response = await launchVM({ instanceId, userId }).unwrap();
      toast({
        title: "Computer Connected",
        description: "The Computer has been connected successfully. Redirecting...",
      });
      dispatch(setLaunchVMResponse({ instanceId, response, pcName }));
      const encodedSession = btoa(instanceId);
      window.open(`${routes?.pcViewer}?session=${encodedSession}`, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.log(error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to the Computer. Connection aborted.",
        variant: "destructive",
      });
    } finally {
      setLaunchingInstances((prev) => prev.filter((id) => id !== instanceId));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedInstance) return;
    try {
      const { id: instanceId, name: instanceName } = selectedInstance;
      const instance = data?.find((item: DesktopInstance) => item.instanceId === instanceId);
      if (instance?.state === "running") {
        await stopVM(instanceId).unwrap();
      }
      if (!instance?.region) {
        console.warn("Region is missing from Computer metadata:", instance);
        throw new Error("Missing region for selected Computer");
      }
      await deleteVM({ instanceId, region: instance.region }).unwrap();
      await refetchRemoteDesktops();
      toast({
        title: "Computer Deleted",
        description: `Computer "${instanceName}" has been deleted successfully.`,
      });
      dispatch(removeStartingInstance(instanceId));
    } catch (error) {
      console.log("Delete Error:", error);
      toast({
        title: "Deletion Failed",
        description: `Failed to delete this Computer". Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSelectedInstance(null);
    }
  };

  // ============================
  // PC RESIZE (CPU-only) - Option A only
  // ============================

  /** Minimal PC shape for CPU resize */
  type PCForCPUResize = {
    instanceId: string;
    systemName: string;
    region: string;
    state: string;
    operatingSystem?: string;
    configId?: string;
    storageGiB?: number;
  };

  function extractStorageGiB(pc: any): number | undefined {
    const candidates = [
      pc.storageGiB,
      pc.storage,
      pc.storageSize,
      pc.volumeSize,
      pc.rootVolumeSize,
      pc.diskSize,
      pc.ssdSize,
    ];
    const val = candidates.find((v) => typeof v === "number" && v > 0);
    return typeof val === "number" ? val : undefined;
  }

  /** Dialog payload for CPU-only */
  type CPUResizeDraft = { cpu: string };

  /** Only allow CPU resize when PC is fully stopped */
  function isPCResizeAllowed(pc: { state?: string }) {
    return (pc?.state ?? "").toLowerCase() === "stopped";
  }

  /** Open the CPU-resize dialog with current PC values */
  function openPCResizeDialog(pc: PC) {
    if (!pc.state || pc.state.toLowerCase() !== "stopped") {
      toast({
        title: "PC must be stopped",
        description: "Stop the PC before applying CPU/Memory resize.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Guard region so TypeScript knows it's a string
    if (!pc.region) {
      toast({
        title: "Region missing",
        description: "This PC has no region metadata. Please refresh or try again.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPCForCPUResize({
      instanceId: pc.instanceId,
      systemName: pc.systemName,
      region: pc.region, // now guaranteed string
      state: pc.state,
      operatingSystem: (pc as any).operatingSystem ?? undefined,
      configId: (pc as any).configId ?? undefined,
      storageGiB: extractStorageGiB(pc),
    });
    setShowPCResizeDialog(true);
  }

  function openStorageIncreaseDialog(pc: PC) {
    if (!pc.state || pc.state.toLowerCase() !== "running") {
      toast({
        title: "PC must be running",
        description: "Start the PC before increasing storage.",
        variant: "destructive",
      });
      return;
    }
    if (!pc.region) {
      toast({
        title: "Region missing",
        description: "This PC has no region metadata. Please refresh or try again.",
        variant: "destructive",
      });
      return;
    }
    setSelectedPCForStorage({
      instanceId: pc.instanceId,
      systemName: pc.systemName,
      region: pc.region,
      state: pc.state,
      operatingSystem: (pc as any).operatingSystem ?? undefined,
      configId: (pc as any).configId ?? undefined,
      storageGiB: extractStorageGiB(pc),
    });
    setShowStorageIncreaseDialog(true);
  }

  function closeStorageIncreaseDialog() {
    setShowStorageIncreaseDialog(false);
    setSelectedPCForStorage(null);
  }

  const loadPcForStorageIncrease = React.useCallback(async () => {
    if (!selectedPCForStorage?.systemName) return undefined;
    return await fetchPcConfig(apiUserId, selectedPCForStorage.systemName);
  }, [apiUserId, selectedPCForStorage?.systemName]);

  /** Close & clear selection */
  function closePCResizeDialog() {
    setShowPCResizeDialog(false);
    setSelectedPCForCPUResize(null);
  }

  /** Client-side guard */
  function validateCPUResizeDraft(draft: CPUResizeDraft): string | null {
    if (!selectedPCForCPUResize) return "No PC selected.";
    if (!draft.cpu) return "Choose a CPU size.";
    return null;
  }

  /** Provide initial values to the dialog (CPU is editable) */
  const pcResizeInitialDefaults = React.useMemo(() => {
    if (!selectedPCForCPUResize) return null;
    return {
      pcName: selectedPCForCPUResize.systemName,
      operatingSystem: selectedPCForCPUResize.operatingSystem ?? "Windows",
      cpu: selectedPCForCPUResize.configId ?? "",
      region: selectedPCForCPUResize.region,
      billingPlan: "hourly" as const,
      storage: selectedPCForCPUResize.storageGiB
        ? String(selectedPCForCPUResize.storageGiB)
        : undefined,
    };
  }, [selectedPCForCPUResize]);

  /**
   * Loader for the dialog to fetch the latest PC config from your new API:
   * POST https://y2yvok8mk6.execute-api.us-east-1.amazonaws.com/dev/resize
   * body: { userId, computerName }
   */
  async function fetchPcConfig(
    userId: string,
    computerName: string
  ): Promise<{
    pcName: string;
    operatingSystem: string;
    cpu: string;
    region: string;
    billingPlan: "hourly" | "daily" | "monthly";
    storage?: string;
  } | undefined> {
    try {
      if (!userId || !computerName) return undefined;

      const res = await fetch(
        "https://y2yvok8mk6.execute-api.us-east-1.amazonaws.com/dev/resize",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, computerName }),
        }
      );

      if (!res.ok) {
        console.error("fetchPcConfig http error:", res.status, res.statusText);
        return undefined;
      }

      const json = await res.json();
      const payload = json?.data ?? json;
      if (!payload) return undefined;

      return {
        pcName: payload.computerName ?? computerName,
        operatingSystem: payload.operatingSystem ?? "Linux",
        cpu: payload.configId ?? "",
        region: payload.location ?? payload.region ?? "us-east-1",
        billingPlan: (payload.billingPlan ?? "hourly") as "hourly" | "daily" | "monthly",
        storage: String(
          payload.storage ??
            payload.storageGiB ??
            payload.storageSize ??
            payload.volumeSize ??
            payload.rootVolumeSize ??
            payload.diskSize ??
            payload.ssdSize ??
            ""
        ),
      };
    } catch (e) {
      console.error("fetchPcConfig failed:", e);
      return undefined;
    }
  }

  // 🔒 Memoize locked fields to avoid new array identity every render
  const resizeLockedFields = React.useMemo(
    () => ["pcName", "operatingSystem", "region", "billingPlan", "storage"] as const,
    []
  );
  // (No "cpu" here; keys must match dialog's allowed union)
  const storageOnlyLockedFields = React.useMemo(
    () => ["pcName", "operatingSystem", "region", "billingPlan"] as const,
    []
  );

  // 🔒 Memoize dialog loader to avoid re-hydrates on parent re-render
  const loadPcForResize = React.useCallback(async () => {
    if (!selectedPCForCPUResize?.systemName) return undefined;
    return await fetchPcConfig(apiUserId, selectedPCForCPUResize.systemName);
  }, [apiUserId, selectedPCForCPUResize?.systemName]);

  /** Submit resize via POST /dev/resize (Option A) */
  const handleConfirmPCResize = React.useCallback(
    async (draft: { cpu: string }) => {
      const err = validateCPUResizeDraft(draft);
      if (err || !selectedPCForCPUResize) {
        toast({
          title: "Invalid selection",
          description: err || "No PC selected.",
          variant: "destructive",
        });
        return false;
      }

      try {
        console.log("[Resize] POST → /dev/resize", {
          userId: apiUserId,
          computerName: selectedPCForCPUResize.systemName,
          targetConfigId: draft.cpu,
        });

        const res = await fetch(
          "https://y2yvok8mk6.execute-api.us-east-1.amazonaws.com/dev/resize",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: apiUserId,
              computerName: selectedPCForCPUResize.systemName,
              targetConfigId: draft.cpu,
            }),
          }
        );

        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const body = await res.json();
            msg = body?.message || msg;
          } catch { /* ignore */ }
          throw new Error(msg);
        }

        toast({
          title: "Resize submitted",
          description: `${selectedPCForCPUResize.systemName} is updating its CPU & Memory. It does not take more than 60 seconds.`,
        });

        await refetchRemoteDesktops();
        closePCResizeDialog();
        return true;
      } catch (e: any) {
        toast({
          title: "Resize failed",
          description: e?.message || "Failed to resize this PC. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    [apiUserId, selectedPCForCPUResize, refetchRemoteDesktops]
  );

  const handleConfirmStorageIncrease = React.useCallback(
    async (draft: { storage: string }) => {
      if (!selectedPCForStorage) {
        toast({
          title: "Invalid selection",
          description: "No PC selected.",
          variant: "destructive",
        });
        return false;
      }

      const size = parseInt(String(draft.storage), 10);
      if (!size || size <= 0) {
        toast({
          title: "Invalid size",
          description: "Please choose a valid storage size.",
          variant: "destructive",
        });
        return false;
      }

      try {
        console.log("[Increase Volume] POST →", INCREASE_VOLUME_URL, {
          userId: apiUserId,
          computerName: selectedPCForStorage.systemName,
          newVolumeSizeGiB: size,
        });

        const res = await fetch(INCREASE_VOLUME_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: apiUserId,
            computerName: selectedPCForStorage.systemName,
            newVolumeSizeGiB: size,
          }),
        });

        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const body = await res.json();
            msg = body?.message || msg;
          } catch {}
          throw new Error(msg);
        }

        toast({
          title: "Storage increase submitted",
          description: `${selectedPCForStorage.systemName} storage is being increased to ${size} GiB.`,
        });

        await refetchRemoteDesktops();
        closeStorageIncreaseDialog();
        return true;
      } catch (e: any) {
        toast({
          title: "Increase failed",
          description: e?.message || "Failed to increase volume (ssd). Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    [apiUserId, selectedPCForStorage, refetchRemoteDesktops]
  );

  // ---- Derived flags for dialogs ----
  const cpuDialogIsStopped =
    selectedPCForCPUResize?.state?.toLowerCase() === "stopped";
  const storageDialogIsRunning =
    selectedPCForStorage?.state?.toLowerCase() === "running";

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sense PCs</h1>
          <p className="text-muted-foreground">Manage your Cloud Computer</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search PCs by name, description, or region..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {!isMember && (
            <Button onClick={() => setShowNewPCDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Build Sense PC
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {/* Empty State */}
        {!isLoading &&
          (!filteredPCs || filteredPCs.length === 0 || isError) && (
            <SmartPCEmptyState
              searchQuery={searchQuery}
              setShowNewPCDialog={setShowNewPCDialog}
              isError={isError}
            />
          )}
        {!isError && filteredPCs && filteredPCs.length > 0 && (
          <>
            {/* --- LIST VIEW --- */}
            {viewMode === "list" ? (
              <div className="bg-card rounded-lg border border-border">
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Checkbox
                      checked={selectedPCs.length === filteredPCs.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedPCs.length} selected
                    </span>
                  </div>

                  <div className="space-y-1">
                    {(filteredPCs as PC[]).map((pc, index) => {
                      const pcInfo = realtimePcInfo[pc.systemName];
                      const isStarting = isStartingInstance(
                        pc.instanceId,
                        pc.state,
                        startingInstances
                      );
                      return (
                        <div
                          key={pc.id}
                          className={`p-3 rounded-lg border cursor-pointer ${
                            selectedPCs.includes(index)
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                          onClick={() => handlePCSelection(index)}
                        >
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            {/* ── Left ── */}
                            <div className="flex-shrink-0 w-full md:w-72 flex items-center gap-3 overflow-hidden">
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center"
                              >
                                <Checkbox
                                  checked={selectedPCs.includes(index)}
                                  onCheckedChange={() => handlePCSelection(index)}
                                  className="mt-[2px]"
                                />
                              </div>

                              <div className="flex-1 min-w-0 flex items-center">
                                <div className="text-primary font-[Rajdhani] text-base font-semibold tracking-wide uppercase">
                                  {pc.systemName}
                                </div>
                              </div>
                            </div>

                            {/* ── Middle ── */}
                            <div className="flex-1 min-w-0 grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(pc.state)}
                                <div
                                  className={`px-2 py-0.5 rounded-md text-xs font-medium truncate ${
                                    isStarting
                                      ? "bg-yellow-500/10 text-yellow-500"
                                      : pc.state === "running"
                                      ? "bg-green-500/10 text-green-500"
                                      : pc.state === "stopped"
                                      ? "bg-red-500/10 text-red-500"
                                      : pc.state === "initializing" ||
                                        pc.state === "initialization" ||
                                        pc.state === "pending"
                                      ? "bg-yellow-500/10 text-yellow-500"
                                      : pc.state === "stopping"
                                      ? "bg-orange-500/10 text-orange-500"
                                      : pc.state === "idle"
                                      ? "bg-blue-500/10 text-blue-500"
                                      : "bg-gray-500/10 text-gray-500"
                                  }`}
                                >
                                  {getStatusText(pc.state, isStarting)}
                                </div>
                              </div>

                              {/* Uptime */}
                              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      <span>{pcInfo?.uptime || "—"}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Uptime</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {/* Region */}
                              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="hidden lg:flex items-center gap-2">
                                      <Shield className="h-4 w-4" />
                                      <span>{pcInfo?.region || "—"}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Region</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {/* Schedule */}
                              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                      <CalendarClock className="h-4 w-4" />
                                      {pcInfo?.schedule?.enabled === false ? (
                                        <span className="truncate">disabled</span>
                                      ) : pcInfo?.schedule?.autoStartTime ||
                                        pcInfo?.schedule?.autoStopTime ? (
                                        <span className="truncate">
                                          {pcInfo.schedule.autoStartTime &&
                                          pcInfo.schedule.autoStopTime
                                            ? `${pcInfo.schedule.autoStartTime} – ${pcInfo.schedule.autoStopTime}`
                                            : pcInfo.schedule.autoStartTime
                                            ? `Starts at ${pcInfo.schedule.autoStartTime}`
                                            : `Stops at ${pcInfo.schedule.autoStopTime}`}
                                        </span>
                                      ) : (
                                        <span className="italic truncate">
                                          No schedule
                                        </span>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Schedule</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {/* Idle Timeout */}
                              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="hidden lg:flex items-center gap-2">
                                      <Moon className="h-4 w-4" />
                                      <span>
                                        {typeof pcInfo?.idleTimeout === "number"
                                          ? formatIdleTime(pcInfo.idleTimeout)
                                          : "—"}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Idle Timeout</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>

                            {/* ── Right ── */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  handleLaunch(pc.instanceId, pc.systemName)
                                }
                                disabled={
                                  isBusy(pc.state) ||
                                  pc.state !== "running" ||
                                  (!isMember && isPCAssigned(pc.instanceId))
                                }
                                className="h-8"
                              >
                                <ExternalLink className="h-4 w-4 mr-1.5" />
                                {launchingInstances.includes(pc.instanceId)
                                  ? "Connecting..."
                                  : "Connect"}
                              </Button>

                              {pc.state === "running" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPCForStop({
                                      id: pc.instanceId,
                                      name: pc.systemName,
                                    });
                                    setShowStopDialog(true);
                                  }}
                                  disabled={
                                    isBusy(pc.state) ||
                                    stoppingInstances.includes(pc.instanceId)
                                  }
                                  className="h-8"
                                >
                                  <StopCircle className="h-4 w-4 mr-1.5" />
                                  Stop
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStart(pc.instanceId)}
                                  disabled={
                                    isBusy(pc.state) ||
                                    isStartingInstance(
                                      pc.instanceId,
                                      pc.state,
                                      startingInstances
                                    )
                                  }
                                  className="h-8"
                                >
                                  <Play className="h-4 w-4 mr-1.5" />
                                  Start
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleScheduleSettings(pc);
                                    }}
                                  >
                                    <CalendarClock className="h-4 w-4 mr-2" />
                                    Schedule
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await handleIdleSettings(pc);
                                    }}
                                  >
                                    <Moon className="h-4 w-4 mr-2" />
                                    Idle Settings
                                  </DropdownMenuItem>

                                  {/* NEW: PC Resize (CPU-only) */}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openPCResizeDialog(pc);
                                    }}
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    PC Resize
                                  </DropdownMenuItem>

                                  {/* NEW: Increase Storage */}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openStorageIncreaseDialog(pc);
                                    }}
                                  >
                                    <Cpu className="h-4 w-4 mr-2" />
                                    Add Volume (SSD)
                                  </DropdownMenuItem>

                                  {!isMember && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAssignUser(pc);
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Assign User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {!isMember && (
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => {
                                        setSelectedInstance({
                                          id: pc.instanceId,
                                          name: pc.systemName,
                                        });
                                        setCurrentModal("delete");
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // --- GRID VIEW ---
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(filteredPCs as PC[]).map((pc, index) => {
                  const pcInfo = realtimePcInfo[pc.systemName];
                  const isStarting = isStartingInstance(
                    pc.instanceId,
                    pc.state,
                    startingInstances
                  );

                  return (
                    <Card
                      key={pc.id}
                      className={`relative ${
                        selectedPCs.includes(index) ? "border-primary" : ""
                      }`}
                      onClick={() => handlePCSelection(index)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center"
                            >
                              <Checkbox
                                checked={selectedPCs.includes(index)}
                                onCheckedChange={() => handlePCSelection(index)}
                                className="mt-[6px]"
                              />
                            </div>

                            <div>
                              <CardTitle className="text-primary font-[Rajdhani] text-base tracking-wide uppercase">
                                {pc?.systemName}
                              </CardTitle>
                              <div
                                className={`px-2 py-1 rounded-md inline-flex items-center gap-2 ${
                                  isStarting
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : pc.state === "running"
                                    ? "bg-green-500/10 text-green-500"
                                    : pc.state === "stopped"
                                    ? "bg-red-500/10 text-red-500"
                                    : pc.state === "initializing"
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : pc.state === "initialization"
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : pc.state === "pending"
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : pc.state === "stopping"
                                    ? "bg-orange-500/10 text-orange-500"
                                    : pc.state === "idle"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "bg-gray-500/10 text-gray-500"
                                }`}
                              >
                                {getStatusIcon(pc.state)}
                                <span className="text-sm font-medium">
                                  {getStatusText(pc.state, isStarting)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Dropdown menu (extended with PC Resize) */}
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScheduleSettings(pc);
                                }}
                              >
                                <CalendarClock className="h-4 w-4 mr-2" />
                                Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await handleIdleSettings(pc);
                                }}
                              >
                                <Moon className="h-4 w-4 mr-2" />
                                Idle Settings
                              </DropdownMenuItem>

                              {/* NEW: PC Resize */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPCResizeDialog(pc);
                                }}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                PC Resize
                              </DropdownMenuItem>

                              {/* NEW: Increase Storage */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openStorageIncreaseDialog(pc);
                                }}
                              >
                                <Cpu className="h-4 w-4 mr-2" />
                                Add Volume (SSD)
                              </DropdownMenuItem>

                              {!isMember && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssignUser(pc);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Assign User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {!isMember && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedInstance({
                                      id: pc.instanceId,
                                      name: pc.systemName,
                                    });
                                    setCurrentModal("delete");
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* --- REALTIME INFO --- */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{pcInfo?.uptime || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span>{pcInfo?.region || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarClock className="h-4 w-4" />
                              {pcInfo?.schedule?.autoStartTime ||
                              pcInfo?.schedule?.autoStopTime ? (
                                <span>
                                  {pcInfo.schedule.autoStartTime &&
                                  pcInfo.schedule.autoStopTime
                                    ? `${pcInfo.schedule.autoStartTime} - ${pcInfo.schedule.autoStopTime}`
                                    : pcInfo.schedule.autoStartTime
                                    ? `Starts at ${pcInfo.schedule.autoStartTime}`
                                    : pcInfo.schedule.autoStopTime
                                    ? `Stops at ${pcInfo.schedule.autoStopTime}`
                                    : null}
                                  {!pcInfo.schedule.enabled && " (disabled)"}
                                </span>
                              ) : (
                                <span className="italic text-muted-foreground">
                                  No schedule configured
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {typeof pcInfo?.idleTimeout === "number"
                                  ? `Idle Timeout: ${formatIdleTime(
                                      pcInfo.idleTimeout
                                    )}`
                                  : "—"}
                              </span>
                            </div>
                          </div>
                          {/* --- END REALTIME INFO --- */}

                          <div className="flex items-center justify-between border-t pt-4 mt-2">
                            <div className="flex items-center gap-2">{/* meta */}</div>
                            <div className="flex items-center gap-4">
                              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() =>
                                          handleLaunch(pc.instanceId, pc.systemName)
                                        }
                                        disabled={
                                          isBusy(pc.state) ||
                                          pc.state !== "running" ||
                                          (!isMember && isPCAssigned(pc.instanceId))
                                        }
                                        className="h-8"
                                      >
                                        <ExternalLink className="h-4 w-4 mr-1.5" />
                                        {launchingInstances.includes(pc.instanceId)
                                          ? "Connecting..."
                                          : "Connect"}
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {!isMember && isPCAssigned(pc.instanceId) && (
                                    <TooltipContent>
                                      This PC is assigned to a member, usassign to launch.
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>

                              {pc.state === "running" ? (
                                <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setSelectedPCForStop({
                                              id: pc.instanceId,
                                              name: pc.systemName,
                                            });
                                            setShowStopDialog(true);
                                          }}
                                          className="h-8"
                                          disabled={
                                            isBusy(pc.state) ||
                                            stoppingInstances.includes(pc.instanceId) ||
                                            (!isMember && isPCAssigned(pc.instanceId))
                                          }
                                        >
                                          <StopCircle className="h-4 w-4 mr-1.5" />
                                          {stoppingInstances.includes(pc.instanceId)
                                            ? "Stopping..."
                                            : "Stop"}
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    {!isMember && isPCAssigned(pc.instanceId) && (
                                      <TooltipContent className="text-white text-sm font-semibold px-4 py-2 rounded shadow-md border">
                                        This PC is assigned to a member. Unassign to stop.
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleStart(pc.instanceId)}
                                          className="h-8"
                                          disabled={
                                            isBusy(pc.state) ||
                                            isStartingInstance(
                                              pc.instanceId,
                                              pc.state,
                                              startingInstances
                                            ) ||
                                            (!isMember && isPCAssigned(pc.instanceId))
                                          }
                                        >
                                          <Play className="h-4 w-4 mr-1.5" />
                                          {isStartingInstance(
                                            pc.instanceId,
                                            pc.state,
                                            startingInstances
                                          )
                                            ? "Starting..."
                                            : "Start"}
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    {!isMember && isPCAssigned(pc.instanceId) && (
                                      <TooltipContent className=" text-white text-sm font-semibold px-4 py-2 rounded shadow-md border">
                                        This PC is assigned to a member. Unassign to start.
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
        {/* Details Panel */}
        <SelectedPc
          selectedPCs={selectedPCs}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          cloudPCs={cloudPCs}
          setCloudPCs={setCloudPCs}
          handleAssignUser={handleAssignUser}
        />
      </div>

      <SmartPCConfigDialog
        setShowNewPCDialog={setShowNewPCDialog}
        showNewPCDialog={showNewPCDialog}
      />

      {/* Add Schedule Dialog */}
      {selectedPCForSchedule && (
        <ScheduleDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          instanceId={selectedPCForSchedule.instanceId}
          refreshSchedule={refetchRemoteDesktops}
        />
      )}

      {/* Add Idle Settings Dialog */}
      <IdleSettingsDialog
        open={showIdleDialog}
        onOpenChange={setShowIdleDialog}
        selectedIdleTimeout={selectedIdleTimeout}
        setSelectedIdleTimeout={setSelectedIdleTimeout}
        onSave={handleSaveIdleSettings}
      />

      {currentModal === "delete" && selectedInstance && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setCurrentModal(null)}
          onConfirm={handleConfirmDelete}
          desktopName={selectedInstance.name}
          isDeleting={isDeleting || isLoading || isStopping}
        />
      )}

      {/* Assign User Dialog */}
      <AssignUserDialog
        open={showAssignUserDialog}
        onOpenChange={setShowAssignUserDialog}
        pc={selectedPCForAssign}
        onSuccess={refetchRemoteDesktops}
      />

      {showStopDialog && selectedPCForStop && (
        <ConfirmStopModal
          isOpen={true}
          onClose={() => {
            setShowStopDialog(false);
            setSelectedPCForStop(null);
          }}
          onConfirm={async () => {
            setShowStopDialog(false);
            await handleStop(selectedPCForStop.id);
            setSelectedPCForStop(null);
          }}
          desktopName={selectedPCForStop.name}
          isStopping={stoppingInstances.includes(selectedPCForStop.id)}
        />
      )}

      {/* CPU Resize dialog */}
      <SmartPCConfigDialog
        mode="resize"
        showNewPCDialog={showPCResizeDialog}
        setShowNewPCDialog={setShowPCResizeDialog}
        loadExisting={loadPcForResize}
        pcIsStopped={cpuDialogIsStopped}
        onConfirm={({ cpu }) => handleConfirmPCResize({ cpu })}
      />

      {/* Increase Storage dialog (reuse same component) */}
      <SmartPCConfigDialog
        mode="resize"
        showNewPCDialog={showStorageIncreaseDialog}
        setShowNewPCDialog={setShowStorageIncreaseDialog}
        loadExisting={loadPcForStorageIncrease}
        isStorageOnly
        pcIsRunning={storageDialogIsRunning}
        onConfirmStorage={({ storage }) =>
          handleConfirmStorageIncrease({ storage })
        }
      />
    </div>
  );
};

export default CloudPCPage;
