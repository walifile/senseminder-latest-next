"use client";

import type { RootState } from "@/redux/store";
import type { InstanceDetail } from "@/api/realtime";
import type { PC, DesktopInstance } from "@/app/build-smartpc/types";

import { getAssignments } from "@/api/assignpc";
import React, { useState, useEffect } from "react";
import { fetchInstanceDetails } from "@/api/realtime";
import { updateSessionHeartbeat } from "@/api/session";
import { stableStates } from "@/app/build-smartpc/data";
import { useListRemoteDesktopQuery } from "@/api/fileManagerAPI";
import SelectedPc from "@/app/build-smartpc/_components/selected-pc";
import ScheduleDialog from "@/app/build-smartpc/_components/schedule-dialog";
import SmartPcToolbar from "@/app/build-smartpc/_components/smart-pc-toolbar";
import SmartPCEmptyState from "@/app/build-smartpc/_components/smart-pc-empty-state";
import SmartPcStopButton from "@/app/build-smartpc/_components/smart-pc-stop-button";
import IdleSettingsDialog from "@/app/build-smartpc/_components/idle-settings-dialog";
import SmartPcStartButton from "@/app/build-smartpc/_components/smart-pc-start-button";
import SmartPCConfigDialog from "@/app/build-smartpc/_components/smart-pc-config-dialog";
import SmartPcDropdownMenu from "@/app/build-smartpc/_components/smart-pc-dropdown-menu";
import SmartPcConnectButton from "@/app/build-smartpc/_components/smart-pc-connect-button";
import { ConfirmDeleteModal } from "@/app/build-smartpc/_components/confirm-delete-pc-diolog";
import {
  getApiUserId,
  getStatusIcon,
  getStatusText,
  formatIdleTime,
  getStatusClasses,
  extractStorageGiB,
  formatScheduleTime,
  isStartingInstance,
} from "@/app/build-smartpc/utils";

import { cn } from "@/lib/utils/index";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { useSelector } from "react-redux";

import { Moon, Clock, Shield, Loader2, CalendarClock } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useBoolean } from "@/hooks/use-boolean";

import AssignUserDialog from "../_components/assign-user-dialog";

const CloudPCPage = () => {
  const { toast } = useToast();

  const config = useSelector((state: RootState) => state.smartPcConfig);
  const { user } = useSelector((state: RootState) => state.auth);
  const isMember = user?.role === "member";

  // Derive API userId
  const apiUserId = getApiUserId(user);

  // Assignments map to control actions for member-assigned PCs
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

  const isPCAssigned = (instanceId: string): boolean =>
    Object.values(assignments).some((pcs) =>
      pcs.some((pc) => pc.instanceId === instanceId)
    );

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const startingInstances = useSelector(
    (state: RootState) => state.startVM.startingInstances
  );

  // Query remote desktops
  const [shouldPoll, setShouldPoll] = useState(true);
  const [selectedInstance, setSelectedInstance] =
    useState<DesktopInstance | null>(null);

  const [selectedPCs, setSelectedPCs] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(true);

  const newPCDialog = useBoolean();
  const scheduleDialog = useBoolean();
  const idleDialog = useBoolean();
  const resizeDialog = useBoolean();
  const storageDialog = useBoolean();
  const assignUserDialog = useBoolean();
  const deleteDialog = useBoolean();

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

  // Local UI state
  const [cloudPCs, setCloudPCs] = useState<PC[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Realtime info
  const [realtimePcInfo, setRealtimePcInfo] = useState<
    Record<string, InstanceDetail>
  >({});

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
    if (storageDialog.value || resizeDialog.value) setShouldPoll(false);
    else setShouldPoll(true);
  }, [storageDialog.value, resizeDialog.value]);

  // Realtime instance metrics
  useEffect(() => {
    if (isError || !data || !apiUserId) return;
    const instanceNames = data.map((pc: PC) => pc.systemName);
    fetchInstanceDetails(apiUserId, instanceNames)
      .then((details) => {
        const map: Record<string, InstanceDetail> = {};
        details.forEach((d) => {
          if (d.systemName) map[d.systemName] = d;
        });
        setRealtimePcInfo(map);
        setCloudPCs(data);
      })
      .catch((err) => {
        setRealtimePcInfo({});
        console.error("Failed to fetch real-time PC info", err);
      });
  }, [apiUserId, data, isError]);

  // Open create dialog based on global trigger
  useEffect(() => {
    if (config.show) newPCDialog.onTrue();
  }, [config.show]);

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

  // ============================
  // PC RESIZE
  // ============================

  /** Open the CPU-resize dialog with current PC values */
  function openPCResizeDialog(pc: DesktopInstance) {
    if (!pc.state || pc.state.toLowerCase() !== "stopped") {
      toast({
        title: "PC must be stopped",
        description: "Stop the PC before applying CPU/Memory resize.",
        variant: "destructive",
      });
      return;
    }

    setSelectedInstance({
      ...pc,
      storageGiB: extractStorageGiB(pc),
    });
    resizeDialog.onTrue();
  }
  function closePCResizeDialog() {
    setSelectedInstance(null);
    resizeDialog.onFalse();
  }

  function openStorageDialog(pc: DesktopInstance) {
    if (!pc.state || pc.state.toLowerCase() !== "running") {
      toast({
        title: "PC must be running",
        description: "Start the PC before increasing storage.",
        variant: "destructive",
      });
      return;
    }

    setSelectedInstance({
      ...pc,
      storageGiB: extractStorageGiB(pc),
    });

    storageDialog.onTrue();
  }

  function closeStorageDialog() {
    setSelectedInstance(null);
    storageDialog.onFalse();
  }

  return (
    <div className="flex flex-col h-full">
      <SmartPcToolbar
        isMember={isMember}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleShowNewPCDialog={newPCDialog.onTrue}
      />

      <div className="flex-1 flex flex-col">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (filteredPCs.length === 0 || isError) && (
          <SmartPCEmptyState
            isMember={isMember}
            searchQuery={searchQuery}
            handleShowNewPCDialog={newPCDialog.onTrue}
          />
        )}

        {!isError && filteredPCs.length > 0 && (
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
                                  onCheckedChange={() =>
                                    handlePCSelection(index)
                                  }
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
                                  className={cn(
                                    `px-2 py-0.5 rounded-md text-xs font-medium truncate`,
                                    getStatusClasses(pc.state, isStarting)
                                  )}
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
                                          {formatScheduleTime(pcInfo)}
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
                              <SmartPcConnectButton
                                pc={pc}
                                isMember={isMember}
                                userId={userId}
                                isPCAssigned={isPCAssigned}
                              />

                              {pc.state === "running" ? (
                                <SmartPcStopButton
                                  pc={pc}
                                  isMember={isMember}
                                  isPCAssigned={isPCAssigned}
                                />
                              ) : (
                                <SmartPcStartButton
                                  pc={pc}
                                  isMember={isMember}
                                  isStarting={isStarting}
                                  isPCAssigned={isPCAssigned}
                                />
                              )}

                              <SmartPcDropdownMenu
                                pc={pc}
                                isMember={isMember}
                                setSelectedInstance={setSelectedInstance}
                                openPCResizeDialog={openPCResizeDialog}
                                openStorageDialog={openStorageDialog}
                                handleSchedule={scheduleDialog.onTrue}
                                handleIdle={idleDialog.onTrue}
                                handleAssignUser={assignUserDialog.onTrue}
                                handleDelete={deleteDialog.onTrue}
                              />
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
                                className={cn(
                                  `px-2 py-1 rounded-md inline-flex items-center gap-2`,
                                  getStatusClasses(pc.state, isStarting)
                                )}
                              >
                                {getStatusIcon(pc.state)}
                                <span className="text-sm font-medium">
                                  {getStatusText(pc.state, isStarting)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Dropdown menu (extended with PC Resize) */}
                          <SmartPcDropdownMenu
                            pc={pc}
                            isMember={isMember}
                            setSelectedInstance={setSelectedInstance}
                            openPCResizeDialog={openPCResizeDialog}
                            openStorageDialog={openStorageDialog}
                            handleSchedule={scheduleDialog.onTrue}
                            handleIdle={idleDialog.onTrue}
                            handleAssignUser={assignUserDialog.onTrue}
                            handleDelete={deleteDialog.onTrue}
                          />
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
                                  {formatScheduleTime(pcInfo)}
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
                            <div className="flex items-center gap-2">
                              {/* meta */}
                            </div>
                            <div className="flex items-center gap-4">
                              <TooltipProvider
                                delayDuration={0}
                                skipDelayDuration={0}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <SmartPcConnectButton
                                        pc={pc}
                                        isMember={isMember}
                                        userId={userId}
                                        isPCAssigned={isPCAssigned}
                                      />
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
                                        <SmartPcStopButton
                                          pc={pc}
                                          isMember={isMember}
                                          isPCAssigned={isPCAssigned}
                                        />
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
                                        <SmartPcStartButton
                                          pc={pc}
                                          isMember={isMember}
                                          isStarting={isStarting}
                                          isPCAssigned={isPCAssigned}
                                        />
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
          handleAssignUser={assignUserDialog.onTrue}
          setSelectedInstance={setSelectedInstance}
        />
      </div>

      {/* Add Schedule Dialog */}
      <ScheduleDialog
        open={scheduleDialog.value}
        onClose={scheduleDialog.onFalse}
        instanceId={selectedInstance?.instanceId || ""}
        onSuccess={refetchRemoteDesktops}
      />

      {/* Add Idle Settings Dialog */}
      <IdleSettingsDialog
        open={idleDialog.value}
        onClose={idleDialog.onFalse}
        realtimePcInfo={realtimePcInfo}
        selectedInstance={selectedInstance}
        onSuccess={refetchRemoteDesktops}
      />

      {/* Assign User Dialog */}
      <AssignUserDialog
        open={assignUserDialog.value}
        onClose={assignUserDialog.onFalse}
        pc={selectedInstance}
        onSuccess={refetchRemoteDesktops}
      />

      <ConfirmDeleteModal
        open={deleteDialog.value}
        onClose={deleteDialog.onFalse}
        selectedInstance={selectedInstance}
        setSelectedInstance={setSelectedInstance}
        onSuccess={refetchRemoteDesktops}
      />

      {/* New PC dialog */}
      <SmartPCConfigDialog
        open={newPCDialog.value}
        onClose={newPCDialog.onFalse}
        onSuccess={refetchRemoteDesktops}
      />

      {/* CPU Resize dialog */}
      <SmartPCConfigDialog
        isResize
        open={resizeDialog.value}
        onClose={closePCResizeDialog}
        userId={apiUserId}
        selectedInstance={selectedInstance}
        onSuccess={refetchRemoteDesktops}
      />

      {/* Storage Increase dialog */}
      <SmartPCConfigDialog
        isResize
        isStorageOnly
        open={storageDialog.value}
        onClose={closeStorageDialog}
        userId={apiUserId}
        selectedInstance={selectedInstance}
        onSuccess={refetchRemoteDesktops}
      />
    </div>
  );
};

export default CloudPCPage;
