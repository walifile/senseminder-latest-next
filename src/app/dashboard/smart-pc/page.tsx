"use client";
import AssignUserDialog from "../_components/assign-user-dialog";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Plus,
  ExternalLink,
  Trash2,
  Shield,
  Clock,
  CalendarClock,
  Moon,
  LayoutGrid,
  List,
  MoreVertical,
  StopCircle,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import SmartPCConfigDialog from "@/app/build-smartpc/_components/smart-pc-config-dialog";
import { ConfirmStopModal } from "@/app/build-smartpc/_components/confirm-stop-pc-dialog";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useLaunchVMMutation,
  useListRemoteDesktopQuery,
  useStartVMMutation,
  useStopVMMutation,
} from "@/api/fileManagerAPI";
import { useDeleteVMMutation } from "@/api/vmManagement";
import { DesktopInstance, PC } from "@/app/build-smartpc/types";
import { mockUsers, stableStates } from "@/app/build-smartpc/data";
import {
  getStatusIcon,
  getStatusText,
  isBusy,
  isStartingInstance,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateSessionHeartbeat } from "@/api/session";
// --- IDLE TIMEOUT API ---
import {
  setIdleTimeout,
  getIdleTimeout,
  deleteIdleTimeout,
} from "@/api/smartPC-Idle-settings";
import {
  addStartingInstance,
  removeStartingInstance,
} from "@/redux/slices/dcv/starting-instances-slice";

const CloudPCPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const config = useSelector((state: RootState) => state.smartPcConfig);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedPCForSchedule, setSelectedPCForSchedule] = useState<PC | null>(
    null
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getApiUserId(user: any) {
    if (!user) return "";
    if (user.role === "member" || user.role === "admin") {
      return user.ownerid;
    }
    console.log("DEBUG: ownerid");
    console.log(user);
    return user.id;
  }
  const apiUserId = getApiUserId(user);

  const [assignments, setAssignments] = useState<
    Record<string, { instanceId: string }[]>
  >({});

  useEffect(() => {
    getAssignments()
      .then((res) => setAssignments(res))
      .catch((err) => {
        console.error("Failed to load assignments", err);
        setAssignments({});
      });
  }, []);
  const isPCAssigned = (instanceId: string): boolean => {
    return Object.values(assignments).some((pcs) =>
      pcs.some((pc) => pc.instanceId === instanceId)
    );
  };

  const isMember = user?.role === "member";
  // --- USER LOGIC END ---
  function formatIdleTime(mins: number): string {
    console.log("DEBUG: formatIdleTime called with", mins);
    if (isNaN(mins)) return "—";
    if (mins < 60) return ` ${mins}m`;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  }

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const startingInstances = useSelector(
    (state: RootState) => state.startVM.startingInstances
  );

  const [shouldPoll, setShouldPoll] = useState(true);
  const [currentModal, setCurrentModal] = useState<
    "schedule" | "delete" | "idle" | null
  >(null);
  const [stoppingInstances, setStoppingInstances] = useState<string[]>([]);
  const [launchingInstances, setLaunchingInstances] = useState<string[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

  const [stopVM, { isLoading: isStopping }] = useStopVMMutation();
  const [startVM] = useStartVMMutation();
  const [launchVM] = useLaunchVMMutation();
  const [deleteVM, { isLoading: isDeleting }] = useDeleteVMMutation();

  const [cloudPCs, setCloudPCs] = useState<PC[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPCDialog, setShowNewPCDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showIdleDialog, setShowIdleDialog] = useState(false);
  const [showAssignUserDialog, setShowAssignUserDialog] = useState(false);
  const [selectedPCForAssign, setSelectedPCForAssign] = useState<PC | null>(
    null
  );
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [selectedPCForStop, setSelectedPCForStop] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // --- NEW: Track which PC Idle dialog is for
  const [selectedPCForIdle, setSelectedPCForIdle] = useState<PC | null>(null);

  const [selectedIdleTimeout, setSelectedIdleTimeout] = useState<string>("30");
  const [realtimePcInfo, setRealtimePcInfo] = useState<
    Record<string, InstanceDetail>
  >({});
  // --- REALTIME PC STATE END ---

  useEffect(() => {
    updateSessionHeartbeat();
  }, []);

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

  useEffect(() => {
    if (isError || !data) return;

    const enriched = data.map((pc: PC, index: number) => ({
      ...pc,
      assignedUsers: mockUsers.slice(0, (index % mockUsers.length) + 1),
    }));

    setCloudPCs(enriched);
  }, [data]);

  useEffect(() => {
    if (config.show) {
      setShowNewPCDialog(true);
    }
  }, [config.show]);

  // --- FETCH REALTIME INSTANCE METRICS ---
  useEffect(() => {
    if (!apiUserId || !Array.isArray(cloudPCs) || cloudPCs.length === 0) return;
    const instanceNames = cloudPCs.map((pc) => pc.systemName);

    fetchInstanceDetails(apiUserId, instanceNames)
      .then((details) => {
        console.log("Realtime details", details);
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

  const handleStop = async (instanceId: string) => {
    setStoppingInstances((prev) => [...prev, instanceId]);
    try {
      await stopVM(instanceId).unwrap();
      toast({
        title: "Computer Stopping",
        description: "The Computer is stopping....",
      });
    } catch (error) {
      console.error("StopVM error:", error);

      let errorMessage =
        "Unable to stop the Computer. Please wait a few moments and try again.";

      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        typeof error.data === "string"
      ) {
        errorMessage = error.data;
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
      toast({
        title: "Computer Starting",
        description: "The Computer is starting .....",
      });
    } catch (error) {
      console.error("StartVM error:", error);

      let errorMessage =
        "Unable to start the Computer. Please wait a few moments and try again.";

      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        typeof error.data === "string"
      ) {
        errorMessage = error.data;
      }

      toast({
        title: "Failed to Start Computer",
        description: errorMessage,
        variant: "destructive",
      });
    }
    // finally {
    //   setStartingInstances((prev) => prev.filter((id) => id !== instanceId));
    // dispatch(removeStartingInstance(instanceId));

    // }
  };

  const handleLaunch = async (instanceId: string, pcName: string) => {
    setLaunchingInstances((prev) => [...prev, instanceId]);
    try {
      const response = await launchVM({
        instanceId: instanceId,
        userId: userId,
      }).unwrap();
      console.log({ response });
      toast({
        title: "Computer Connected",
        description:
          "The Computer has been connected successfully. Redirecting...",
      });
      dispatch(setLaunchVMResponse({ instanceId, response, pcName }));

      const encodedSession = btoa(instanceId);
      window.open(
        `${routes?.pcViewer}?session=${encodedSession}`,
        "_blank",
        "noopener,noreferrer"
      );
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

      const instance = data?.find(
        (item: DesktopInstance) => item.instanceId === instanceId
      );

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

  const filteredPCs = Array.isArray(data)
    ? data.filter((pc: PC) => {
        const query = searchQuery.toLowerCase();
        return (
          pc.systemName?.toLowerCase().includes(query) ||
          pc.description?.toLowerCase().includes(query) ||
          pc.region?.toLowerCase().includes(query)
        );
      })
    : [];

  const handlePCSelection = (index: number) => {
    setSelectedPCs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedPCs.length === filteredPCs.length) {
      setSelectedPCs([]);
    } else {
      setSelectedPCs(filteredPCs.map((_, index) => index));
    }
  };

  const handleScheduleSettings = (pc: PC) => {
    setSelectedPCForSchedule(pc);
    setShowScheduleDialog(true);
  };

  // ----------- REPLACED: match to API! -------------
  // Fetch current idle timeout for the PC from API on open, fallback to "30" on error
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

  // Handle saving idle timeout: if "none" selected, delete entry, else set
  const handleSaveIdleSettings = async () => {
    if (!selectedPCForIdle) {
      setShowIdleDialog(false);
      return;
    }

    // User picked "No idle timeout" (adapt according to your dialog - ""/null/0/"none")
    // Ensure this matches the "no timeout" value in your IdleSettingsDialog!
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
        await setIdleTimeout(
          selectedPCForIdle.instanceId,
          Number(selectedIdleTimeout)
        );
        toast({
          title: "Idle Timeout Saved",
          description: `Timeout set to ${selectedIdleTimeout} minutes for ${selectedPCForIdle.systemName}`,
        });
      }
      // Optionally refresh data here if you want
    } catch (e) {
      console.error("Failed to save idle timeout:", e);
      toast({
        title: "Idle Timeout Change Failed",
        description: "Could not update idle timeout",
      });
    } finally {
      setShowIdleDialog(false);
    }
  };

  // const handleSaveSchedule = () => {
  //   setShowScheduleDialog(false);
  // };

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
                              {/* ✅ Checkbox aligned with text */}
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center"
                              >
                                <Checkbox
                                  checked={selectedPCs.includes(index)}
                                  onCheckedChange={() =>
                                    handlePCSelection(index)
                                  }
                                  className="mt-[2px]" // optional tweak, adjust as needed
                                />
                              </div>

                              <div className="flex-1 min-w-0 flex items-center">
                                <div className="text-primary font-[Rajdhani] text-base font-semibold tracking-wide uppercase">
                                  {pc.systemName}
                                </div>
                                {/* <div className="text-xs text-muted-foreground truncate">
                                  {pc.configId || "High-performance compute instance"}
                                </div> */}
                              </div>
                            </div>

                            {/* ── Middle ── */}
                            <div className="flex-1 min-w-0 grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                              {/* Status (moved here) */}
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
                              <TooltipProvider
                                delayDuration={0}
                                skipDelayDuration={0}
                              >
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
                              <TooltipProvider
                                delayDuration={0}
                                skipDelayDuration={0}
                              >
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
                              <TooltipProvider
                                delayDuration={0}
                                skipDelayDuration={0}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                      <CalendarClock className="h-4 w-4" />
                                      {pcInfo?.schedule?.enabled === false ? (
                                        <span className="truncate">
                                          disabled
                                        </span>
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
                              <TooltipProvider
                                delayDuration={0}
                                skipDelayDuration={0}
                              >
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
                            {/* ✅ Prevent checkbox click from triggering card click */}
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
                              {/* <CardDescription className="mt-2">
                                {pc?.configId || "High-performance compute instance"}
                              </CardDescription> */}
                            </div>
                          </div>

                          {/* Dropdown menu remains unchanged */}
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
                            {/* <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarClock className="h-4 w-4" />
                                <span>09:00 - 17:00</span>
                              </div> */}
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
                              {/* <span>
                                {typeof pcInfo?.idleTimeout === "number"
                                  ? formatIdleTime(pcInfo.idleTimeout)
                                  : "—"}
                              </span> */}

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
                            <div className="flex items-center gap-2">
                              {/* <AlertCircle className="h-4 w-4 text-muted-foreground" /> */}
                              {/* <span className="text-sm">$42.99 this month</span> */}
                            </div>
                            <div className="flex items-center gap-4">
                              <TooltipProvider
                                delayDuration={0}
                                skipDelayDuration={0}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() =>
                                          handleLaunch(
                                            pc.instanceId,
                                            pc.systemName
                                          )
                                        }
                                        disabled={
                                          isBusy(pc.state) ||
                                          pc.state !== "running" ||
                                          (!isMember &&
                                            isPCAssigned(pc.instanceId))
                                        }
                                        className="h-8"
                                      >
                                        <ExternalLink className="h-4 w-4 mr-1.5" />
                                        {launchingInstances.includes(
                                          pc.instanceId
                                        )
                                          ? "Connecting..."
                                          : "Connect"}
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {!isMember && isPCAssigned(pc.instanceId) && (
                                    <TooltipContent>
                                      This PC is assigned to a member, usassign
                                      to launch.
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>

                              {pc.state === "running" ? (
                                <TooltipProvider
                                  delayDuration={0}
                                  skipDelayDuration={0}
                                >
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
                                            stoppingInstances.includes(
                                              pc.instanceId
                                            ) ||
                                            (!isMember &&
                                              isPCAssigned(pc.instanceId))
                                          }
                                        >
                                          <StopCircle className="h-4 w-4 mr-1.5" />
                                          {stoppingInstances.includes(
                                            pc.instanceId
                                          )
                                            ? "Stopping..."
                                            : "Stop"}
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    {!isMember &&
                                      isPCAssigned(pc.instanceId) && (
                                        <TooltipContent className="text-white text-sm font-semibold px-4 py-2 rounded shadow-md border">
                                          This PC is assigned to a member.
                                          Unassign to stop.
                                        </TooltipContent>
                                      )}
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <TooltipProvider
                                  delayDuration={0}
                                  skipDelayDuration={0}
                                >
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleStart(pc.instanceId)
                                          }
                                          className="h-8"
                                          disabled={
                                            isBusy(pc.state) ||
                                            isStartingInstance(
                                              pc.instanceId,
                                              pc.state,
                                              startingInstances
                                            ) ||
                                            (!isMember &&
                                              isPCAssigned(pc.instanceId))
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
                                    {!isMember &&
                                      isPCAssigned(pc.instanceId) && (
                                        <TooltipContent className=" text-white text-sm font-semibold px-4 py-2 rounded shadow-md border">
                                          This PC is assigned to a member.
                                          Unassign to start.
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
    </div>
  );
};

export default CloudPCPage;
