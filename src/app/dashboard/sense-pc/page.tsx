
"use client";

import type { RootState } from "@/redux/store";
import type { InstanceDetail } from "@/api/realtime";
import type { PC, DesktopInstance } from "@/app/build-sensepc/types";

import { getAssignments } from "@/api/assignpc";
import React, { useState, useEffect } from "react";
import { fetchInstanceDetails } from "@/api/realtime";
import { stableStates } from "@/app/build-sensepc/data";
import { useListRemoteDesktopQuery } from "@/api/fileManagerAPI";
import SelectedPc from "@/app/build-sensepc/_components/selected-pc";
import ScheduleDialog from "@/app/build-sensepc/_components/schedule-dialog";
import SmartPcToolbar from "@/app/build-sensepc/_components/smart-pc-toolbar";
import { updateSessionHeartbeat, claimSessionIfAvailable } from "@/api/session";
import SmartPCEmptyState from "@/app/build-sensepc/_components/smart-pc-empty-state";
import SmartPcStopButton from "@/app/build-sensepc/_components/smart-pc-stop-button";
import IdleSettingsDialog from "@/app/build-sensepc/_components/idle-settings-dialog";
import SmartPcStartButton from "@/app/build-sensepc/_components/smart-pc-start-button";
import SmartPCConfigDialog from "@/app/build-sensepc/_components/smart-pc-config-dialog";
import SmartPcRebootButton from "@/app/build-sensepc/_components/smart-pc-reboot-button";
import SmartPcDropdownMenu from "@/app/build-sensepc/_components/smart-pc-dropdown-menu";
import SmartPcConnectButton from "@/app/build-sensepc/_components/smart-pc-connect-button";
import { ConfirmDeleteModal } from "@/app/build-sensepc/_components/confirm-delete-pc-diolog";
import {
  getApiUserId,
  getStatusIcon,
  getStatusText,
  formatIdleTime,
  getStatusClasses,
  extractStorageGiB,
  formatScheduleTime,
  isStartingInstance,
} from "@/app/build-sensepc/utils";

import { cn } from "@/lib/utils/index";
import { Logger } from "@/lib/utils/logger";
import { Checkbox } from "@/components/ui/checkbox";
import { PcCard } from "@/components/ui/dashboard/pc-card";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";
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

  const apiUserId = getApiUserId(user);

  const [assignments, setAssignments] = useState<
    Record<string, { instanceId: string }[]>
  >({});
  useEffect(() => {
    getAssignments()
      .then((res) => setAssignments(res))
      .catch((err) => {
        Logger.error("Failed to load assignments", err);
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
      pollingInterval: shouldPoll ? 30000 : 0,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );

  const [cloudPCs, setCloudPCs] = useState<PC[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [realtimePcInfo, setRealtimePcInfo] = useState<
    Record<string, InstanceDetail>
  >({});

  useEffect(() => {
    const initClientSession = async () => {
      try {
        await claimSessionIfAvailable();
        await updateSessionHeartbeat();
      } catch (err) {
        Logger.error("Failed to initialize client session / heartbeat:", err);
      }
    };

    void initClientSession();
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
    if (storageDialog.value || resizeDialog.value) setShouldPoll(false);
    else setShouldPoll(true);
  }, [storageDialog.value, resizeDialog.value]);

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
        Logger.error("Failed to fetch real-time PC info", err);
      });
  }, [apiUserId, data, isError]);

  useEffect(() => {
    if (config.show) newPCDialog.onTrue();
  }, [config.show, newPCDialog]);

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

  const handlePCSelection = (index: number) => {
    setSelectedPCs((prev) => (prev.includes(index) ? [] : [index]));
  };

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
    <div className="flex h-full flex-col overflow-x-hidden">
      <DashboardCard
        className={cn(
          "flex-1 flex flex-col",
          "p-4 md:p-6 lg:p-8",
          "min-h-[480px] md:min-h-[640px] xl:min-h-[804px]",
          // ✅ critical: prevent inner flex children from forcing horizontal scroll
          "w-full min-w-0 overflow-x-hidden"
        )}
      >
        {/* ✅ keep toolbar from forcing width */}
        <div className="min-w-0">
          <SmartPcToolbar
            isMember={isMember}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            handleShowNewPCDialog={newPCDialog.onTrue}
          />
        </div>

        {/* body */}
        <div className="mt-4 flex min-w-0 flex-1 flex-col overflow-x-hidden">
          {isLoading && (
            <div className="flex flex-1 items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

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
 
                <div className="space-y-3 min-w-0">
                  {(filteredPCs as PC[]).map((pc, index) => {
                    const pcInfo = realtimePcInfo[pc.systemName];
                    const isStarting = isStartingInstance(
                      pc.instanceId,
                      pc.state,
                      startingInstances
                    );
                    const statusText = getStatusText(pc.state, isStarting);
                    const isSelected = selectedPCs.includes(index);

                    return (
                      <div
                        key={pc.instanceId || pc.systemName || index}
                        className="flex min-w-0 justify-start"
                      >
                        <PcCard
                          selected={isSelected}
                          className={cn(
                            "relative w-full min-w-0 cursor-pointer",
                            "flex flex-col gap-3 px-4 py-4",
                            "md:flex-row md:items-center md:justify-between md:gap-6"
                          )}
                          onClick={() => handlePCSelection(index)}
                        >
                          {/* LEFT + MIDDLE */}
                          <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-6">
                            {/* Name + status (DO NOT TOUCH) */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center"
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handlePCSelection(index)}
                                  className="mt-[2px]"
                                />
                              </div>

                              <div className="flex items-center gap-3">
                                <p className="whitespace-nowrap text-[18px] font-medium leading-[27px] tracking-[-0.3px] text-foreground">
                                  {pc.systemName}
                                </p>

                                <div
                                  className={cn(
                                    "inline-flex items-center gap-[6px] rounded-full px-4 py-[6px] text-[11px] leading-5 tracking-[-0.2px] uppercase",
                                    getStatusClasses(pc.state, isStarting)
                                  )}
                                >
                                  {getStatusIcon(pc.state)}
                                  <span>{statusText}</span>
                                </div>
                              </div>
                            </div>

                            {/* ✅ Meta row: grid (stable on zoom) */}
                            <div
                              className={cn(
                                "min-w-0 flex-1",
                                "grid grid-cols-2 gap-x-6 gap-y-2",
                                "md:grid-cols-4 md:gap-x-8",
                                "text-[14px] leading-5 tracking-[-0.2px] text-foreground"
                              )}
                            >
                              {/* Uptime */}
                              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="min-w-0 flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                      <span className="truncate">{pcInfo?.uptime || "—"}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Uptime</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {/* Region */}
                              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="min-w-0 flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                                      <span className="truncate">{pcInfo?.region || "—"}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Region</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {/* Schedule */}
                              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="min-w-0 flex items-center gap-2">
                                      <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
                                      {pcInfo?.schedule?.enabled === false ? (
                                        <span className="truncate">disabled</span>
                                      ) : pcInfo?.schedule?.autoStartTime ||
                                        pcInfo?.schedule?.autoStopTime ? (
                                        <span className="truncate">{formatScheduleTime(pcInfo)}</span>
                                      ) : (
                                        <span className="truncate italic">No schedule</span>
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
                                    <div className="min-w-0 flex items-center gap-2">
                                      <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
                                      <span className="truncate">
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
                          </div>

                          {/* RIGHT actions (keep as you had, already responsive) */}
                          <div
                            className={cn(
                              "flex w-full items-center gap-2",
                              "flex-wrap justify-start",
                              "md:w-auto md:flex-nowrap md:justify-end"
                            )}
                          >
                            <SmartPcConnectButton
                              pc={pc}
                              isMember={isMember}
                              userId={userId}
                              isPCAssigned={isPCAssigned}
                            />

                            {pc.state === "running" ? (
                              <>
                                <SmartPcStopButton
                                  pc={pc}
                                  isMember={isMember}
                                  isPCAssigned={isPCAssigned}
                                />
                                <SmartPcRebootButton
                                  pc={pc}
                                  isMember={isMember}
                                  isStarting={isStarting}
                                  isPCAssigned={isPCAssigned}
                                />
                              </>
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
                        </PcCard>
                      </div>
                    );
                  })}
                </div>

              ) : (
                /* --- GRID VIEW --- */
                <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(filteredPCs as PC[]).map((pc, index) => {
                    const pcInfo = realtimePcInfo[pc.systemName];
                    const isStarting = isStartingInstance(
                      pc.instanceId,
                      pc.state,
                      startingInstances
                    );
                    const statusText = getStatusText(pc.state, isStarting);
                    const isSelected = selectedPCs.includes(index);

                    return (
                      <div
                        key={pc.instanceId || pc.systemName || index}
                        className="flex min-w-0 justify-start"
                      >
                        <PcCard
                          selected={isSelected}
                          className={cn(
                            "relative flex w-full min-w-0 flex-col gap-[18px] px-4 py-6"
                          )}
                          onClick={() => handlePCSelection(index)}
                        >
                          {/* header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center"
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    handlePCSelection(index)
                                  }
                                  className="mt-[2px]"
                                />
                              </div>

                              <div className="flex flex-col gap-[14px]">
                                <div className="flex flex-wrap items-center gap-3">
                                  <p className="text-[18px] font-medium leading-[27px] tracking-[-0.3px] text-foreground">
                                    {pc?.systemName}
                                  </p>

                                  <div
                                    className={cn(
                                      "inline-flex items-center gap-[6px] rounded-full px-4 py-[6px] text-[11px] leading-5 tracking-[-0.2px] uppercase",
                                      getStatusClasses(pc.state, isStarting)
                                    )}
                                  >
                                    {getStatusIcon(pc.state)}
                                    <span>{statusText}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

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

                          {/* info grid */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-[14px] text-[14px] leading-5 tracking-[-0.2px]">
                            <div className="flex items-center gap-2 text-foreground">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{pcInfo?.uptime || "—"}</span>
                            </div>

                            <div className="flex items-center gap-2 text-foreground">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span>{pcInfo?.region || "—"}</span>
                            </div>

                            <div className="flex items-center gap-2 text-foreground">
                              <CalendarClock className="h-4 w-4 text-muted-foreground" />
                              {pcInfo?.schedule?.autoStartTime ||
                              pcInfo?.schedule?.autoStopTime ? (
                                <span>
                                  {formatScheduleTime(pcInfo)}
                                  {!pcInfo.schedule.enabled && " (disabled)"}
                                </span>
                              ) : (
                                <span>No schedule configured</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-foreground">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {typeof pcInfo?.idleTimeout === "number"
                                  ? `Idle Timeout: ${formatIdleTime(
                                      pcInfo.idleTimeout
                                    )}`
                                  : "—"}
                              </span>
                            </div>
                          </div>

                          {/* actions */}
                          <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
                            <div />

                            {/* ✅ key fix: wrap actions so Reboot never goes outside */}
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
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
                                      This PC is assigned to a member, unassign to
                                      launch.
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>

                              {pc.state === "running" ? (
                                <>
                                  <TooltipProvider delayDuration={0} skipDelayDuration={0}>
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
                                      {!isMember && isPCAssigned(pc.instanceId) && (
                                        <TooltipContent className="text-white text-sm font-semibold px-4 py-2 rounded shadow-md border">
                                          This PC is assigned to a member. Unassign
                                          to stop.
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <SmartPcRebootButton
                                            pc={pc}
                                            isMember={isMember}
                                            isStarting={isStarting}
                                            isPCAssigned={isPCAssigned}
                                          />
                                        </span>
                                      </TooltipTrigger>
                                      {!isMember && isPCAssigned(pc.instanceId) && (
                                        <TooltipContent className="text-white text-sm font-semibold px-4 py-2 rounded shadow-md border">
                                          This PC is assigned to a member. Unassign
                                          to reboot.
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              ) : (
                                <TooltipProvider delayDuration={0} skipDelayDuration={0}>
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
                                    {!isMember && isPCAssigned(pc.instanceId) && (
                                      <TooltipContent className="text-white text-sm font-semibold px-4 py-2 rounded shadow-md border">
                                        This PC is assigned to a member. Unassign to
                                        start.
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                        </PcCard>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Details Panel */}
          <div className="min-w-0 overflow-x-hidden">
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
        </div>
      </DashboardCard>

      <ScheduleDialog
        open={scheduleDialog.value}
        onClose={scheduleDialog.onFalse}
        instanceId={selectedInstance?.instanceId || ""}
        onSuccess={refetchRemoteDesktops}
      />

      <IdleSettingsDialog
        open={idleDialog.value}
        onClose={idleDialog.onFalse}
        realtimePcInfo={realtimePcInfo}
        selectedInstance={selectedInstance}
        onSuccess={refetchRemoteDesktops}
      />

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

      <SmartPCConfigDialog
        open={newPCDialog.value}
        onClose={newPCDialog.onFalse}
        onSuccess={refetchRemoteDesktops}
      />

      <SmartPCConfigDialog
        isResize
        open={resizeDialog.value}
        onClose={closePCResizeDialog}
        userId={apiUserId}
        selectedInstance={selectedInstance}
        onSuccess={refetchRemoteDesktops}
      />

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
