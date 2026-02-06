"use client";

import type { RootState } from "@/redux/store";

import appConfig from "@/config/app-config";
import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import {
  useAddBillingPlanMutation,
  useUpdateAutoRenewMutation,
} from "@/api/billing";

import { Logger } from "@/lib/utils/logger";
import { getErrorMessage } from "@/lib/utils";
import { getIdTokenSafe } from "@/lib/auth/token";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getFriendlyOSName } from "@/lib/utils/format-string";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { useSelector } from "react-redux";

import { motion } from "framer-motion";
import {
  Cpu,
  Info,
  Plus,
  Users,
  Shield,
  Activity,
  Settings,
  HardDrive,
  ChevronUp,
  MemoryStick,
  MonitorPlay,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import { clampPercent } from "../utils";
import { BillingPlanDialog } from "./billing-dialog";

import type { PC, SelectedPcProps } from "../types";

const { INSTANCE_DETAILS_URL } = appConfig;

const STAT_CARD_BASE =
  "rounded-[10px] p-4 text-sm bg-[rgba(37,48,240,0.1)] text-[#020816] " +
  "dark:bg-[rgba(255,255,255,0.04)] dark:text-white";

type PcKey = { instanceId?: string; systemName?: string };

const getFriendlyLocation = (region?: string) => {
  if (!region) return "—";

  const r = region.trim().toLowerCase();

  const map: Record<string, string> = {
    "us-east-1": "New York",
    "us-east-2": "Central USA",
    "us-west-1": "West USA",
    "us-west-2": "California",
  };

  return map[r] ?? region; // fallback to raw region if unknown
};

const isGpuPc = (gpu?: string) => {
  if (!gpu) return false;
  const g = gpu.trim().toLowerCase();
  return g !== "none" && g !== "n/a" && g !== "unknown";
};

const GPU_TEMP_SSD_TOOLTIP =
  "GPU instances include temporary high-speed storage for graphics workloads. Data in this temporary storage won’t persist if your PC stops or restarts.";

const SelectedPc: React.FC<SelectedPcProps> = ({
  selectedPCs,
  showDetails,
  setShowDetails,
  cloudPCs,
  setCloudPCs,
  handleAssignUser,
  setSelectedInstance,
}) => {
  const [addBillingPlan] = useAddBillingPlanMutation();
  const [updateAutoRenew] = useUpdateAutoRenewMutation();

  const { user } = useSelector((state: RootState) => state.auth);
  const isMember = user?.role === "member";

  const selectedIndex = selectedPCs[0];

  const [stickyKey, setStickyKey] = useState<PcKey | null>(null);
  const selectedKeyRef = useRef<PcKey | null>(null);

  const findIdxByKey = useCallback((arr: PC[], key: PcKey | null) => {
    if (!key) return -1;
    return arr.findIndex((p) => {
      if (key.instanceId && p.instanceId) return p.instanceId === key.instanceId;
      if (key.systemName && p.systemName) return p.systemName === key.systemName;
      return false;
    });
  }, []);

  // Prefer index selection; fall back to sticky key selection
  const effectiveIndex = useMemo(() => {
    if (selectedIndex != null && cloudPCs[selectedIndex]) return selectedIndex;

    const key = selectedKeyRef.current ?? stickyKey;
    const found = findIdxByKey(cloudPCs, key);

    return found >= 0 ? found : null;
  }, [selectedIndex, cloudPCs, stickyKey, findIdxByKey]);

  const currentPC = effectiveIndex != null ? cloudPCs[effectiveIndex] : undefined;

  useEffect(() => {
    // Parent selection by index
    if (selectedIndex != null && cloudPCs[selectedIndex]) {
      const pcAtIndex = cloudPCs[selectedIndex];
      const nextKey: PcKey = {
        instanceId: pcAtIndex.instanceId,
        systemName: pcAtIndex.systemName,
      };
      selectedKeyRef.current = nextKey;
      setStickyKey(nextKey);
      return;
    }

    // Recovered selection by key
    if (currentPC) {
      const nextKey: PcKey = {
        instanceId: currentPC.instanceId,
        systemName: currentPC.systemName,
      };
      selectedKeyRef.current = nextKey;
      setStickyKey(nextKey);
    }
  }, [selectedIndex, cloudPCs, currentPC]);

  const currentUserId = currentPC?.userId;
  const currentSystemName = currentPC?.systemName;

  const [showBillingDialog, setShowBillingDialog] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchMetrics = async () => {
      if (!currentUserId || !currentSystemName) return;

      try {
        const idToken = await getIdTokenSafe();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (idToken) headers.Authorization = `Bearer ${idToken}`;

        const res = await fetch(INSTANCE_DETAILS_URL, {
          method: "POST",
          headers,
          body: JSON.stringify({
            userId: currentUserId,
            instanceNames: [currentSystemName],
          }),
        });

        const data = await res.json();
        const matched = data.find(
          (item: PC) => item.systemName === currentSystemName && item.instanceId,
        );

        if (cancelled || !matched) return;

        setCloudPCs((prev) => {
          const key = selectedKeyRef.current ?? stickyKey;
          const idx = findIdxByKey(prev, key);
          if (idx < 0 || !prev[idx]) return prev;

          const prevPC = prev[idx];

          const updatedPC: PC = {
            ...prevPC,
            cpuUsage: parseFloat(matched.cpuUsage?.replace("%", "") || "0"),
            memoryUsage: isNaN(parseFloat(matched.memoryUsage?.replace("%", "") || ""))
              ? 0
              : parseFloat(matched.memoryUsage!.replace("%", "")),
            region: matched.region,
            uptime: matched.uptime,
            specs: matched.specs,
            billingPlan: matched.billingPlan,
            billingPlanDescription: matched.billingPlanDescription,
            billingCycle: matched.billingCycle ?? null,

            assignedUser: matched.assignedUser,
            monthlyBillingTotal: parseFloat(matched?.monthlyBilling?.total ?? "0"),
            autoRenew: matched.autoRenew,
          };

          // Avoid unnecessary rerenders
          const isSame =
            prevPC.cpuUsage === updatedPC.cpuUsage &&
            prevPC.memoryUsage === updatedPC.memoryUsage &&
            prevPC.region === updatedPC.region &&
            prevPC.uptime === updatedPC.uptime &&
            prevPC.billingPlan === updatedPC.billingPlan &&
            prevPC.billingPlanDescription === updatedPC.billingPlanDescription &&
            prevPC.monthlyBillingTotal === updatedPC.monthlyBillingTotal &&
            JSON.stringify(prevPC.billingCycle ?? null) === JSON.stringify(updatedPC.billingCycle ?? null) &&
            prevPC.autoRenew === updatedPC.autoRenew;

          if (isSame) return prev;

          const next = [...prev];
          next[idx] = updatedPC;
          return next;
        });
      } catch (err) {
        Logger.error("Failed to load real-time metrics:", err);
      }
    };

    fetchMetrics();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, currentSystemName, setCloudPCs, stickyKey, findIdxByKey]);

  const handleAutoRenewToggle = async (newAutoRenew: boolean) => {
    const key = selectedKeyRef.current ?? stickyKey;
    const idx = findIdxByKey(cloudPCs, key);
    const instanceId = idx >= 0 ? cloudPCs[idx]?.instanceId : undefined;

    if (!instanceId) return;

    try {
      await updateAutoRenew({ instanceId, autoRenew: newAutoRenew }).unwrap();

      setCloudPCs((prev) => {
        const i = findIdxByKey(prev, key);
        if (i < 0 || !prev[i]) return prev;

        const next = [...prev];
        next[i] = { ...next[i], autoRenew: newAutoRenew };
        return next;
      });

      toast({
        title: "Auto-Renew Updated",
        description: `Auto-renew has been ${newAutoRenew ? "enabled" : "disabled"} for this instance.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to update auto-renew setting."),
        variant: "destructive",
      });
    }
  };

  // ✅ Only hide if we truly cannot resolve a PC at all
  if (!currentPC) return null;

  const current = currentPC;
  const formattedOS = current?.specs?.os ? getFriendlyOSName(current.specs.os) : undefined;

  const cpuPercent = clampPercent(current.cpuUsage);
  const memPercent = clampPercent(current.memoryUsage);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mt-14 overflow-hidden font-['Space_Grotesk']"
    >
      <DashboardCard className="w-full overflow-hidden p-4 md:p-5 lg:p-6 font-['Space_Grotesk']">
        <div className="flex items-center justify-between">
          <h3 className="font-['Space_Grotesk'] text-base font-medium text-[#020816] md:text-lg dark:text-white">
            Computer Metrics
          </h3>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {showDetails && (
          <div className="mt-5 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {/* CPU */}
              <div className={`${STAT_CARD_BASE} flex flex-col justify-between`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                      CPU
                    </span>
                  </div>
                  <span className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-muted-foreground">
                    {cpuPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-auto h-[10px] overflow-hidden rounded-full bg-[rgba(37,48,240,0.1)] dark:bg-[#040c2f]">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[#a801ba] to-[#2530f0]"
                    style={{ width: `${cpuPercent}%` }}
                  />
                </div>
              </div>

              {/* Memory */}
              <div className={`${STAT_CARD_BASE} flex flex-col justify-between`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                      Memory
                    </span>
                  </div>
                  <span className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-muted-foreground">
                    {memPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-auto h-[10px] overflow-hidden rounded-full bg-[rgba(37,48,240,0.1)] dark:bg-[#040c2f]">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[#a801ba] to-[#2530f0]"
                    style={{ width: `${memPercent}%` }}
                  />
                </div>
              </div>

              {/* Region */}
              <div className={`${STAT_CARD_BASE} flex flex-col justify-center`}>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                    Location
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/10"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Location info"
                        >
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>

                      <TooltipContent side="top" align="center" className="max-w-[260px]">
                        This shows the approximate area where your computer is hosted, based on nearby available data centers to help reduce latency.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="font-['Space_Grotesk'] mt-2 text-sm text-[#454545] dark:text-muted-foreground">
                  {getFriendlyLocation(current.region)}
                </span>
              </div>

              {/* Uptime */}
              <div className={`${STAT_CARD_BASE} flex flex-col justify-center`}>
                <div className="flex items-center gap-2">
                  <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                  <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                    Uptime (current)
                  </span>
                </div>
                <span className="font-['Space_Grotesk'] mt-2 text-sm text-[#454545] dark:text-muted-foreground">
                  {current.uptime?.trim() && current.uptime.trim().toLowerCase() !== "n/a"
                    ? current.uptime
                    : "PC is currently stopped"}
                </span>
              </div>

              {/* Cost */}
              <div className={`${STAT_CARD_BASE} flex flex-col justify-center`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                    Cost
                  </span>
                </div>
                <span className="font-['Space_Grotesk'] mt-2 text-sm text-[#454545] dark:text-muted-foreground">
                  ${current.monthlyBillingTotal?.toFixed(2) ?? "0.00"} this month
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-[rgba(37,48,240,0.1)] dark:bg-white/10" />

            <div>
              <h4 className="font-['Space_Grotesk'] text-sm font-medium text-[#020816] dark:text-white">
                Specifications
              </h4>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {[
                  { icon: Cpu, label: "CPU", value: current.specs?.cpu },
                  { icon: MemoryStick, label: "Memory", value: current.specs?.ram },
                  { icon: HardDrive, label: "SSD", value: current.specs?.storage },
                  { icon: Activity, label: "GPU", value: current.specs?.gpu },
                  { icon: Settings, label: "OS", value: formattedOS },
                ].map(({ icon: Icon, label, value }) => {
                  const showSsdTooltip = label === "SSD" && isGpuPc(current.specs?.gpu);

                  return (
                    <div key={label} className={`${STAT_CARD_BASE} space-y-1`}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                          {label}
                        </span>

                        {showSsdTooltip && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/10"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label="SSD info"
                                >
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </TooltipTrigger>

                              <TooltipContent side="top" align="center" className="max-w-[280px]">
                                {GPU_TEMP_SSD_TOOLTIP}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>

                      <span className="font-['Space_Grotesk'] block text-sm text-[#454545] dark:text-muted-foreground">
                        {value || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {!isMember && (
              <div className={`${STAT_CARD_BASE} flex flex-col justify-between gap-3 md:flex-row md:items-center`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                      Assigned User
                    </h4>
                  </div>

                  {current.assignedUser ? (
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="font-['Space_Grotesk']">
                          {current.assignedUser.name?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-0.5 text-sm">
                        <div className="font-['Space_Grotesk'] font-medium text-[#020816] dark:text-white">
                          {current.assignedUser.name}
                        </div>
                        <div className="font-['Space_Grotesk'] text-xs text-[#454545] dark:text-muted-foreground">
                          {current.assignedUser.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-muted-foreground">
                      No user assigned to this PC.
                    </p>
                  )}
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssignUser();
                    setSelectedInstance(current);
                  }}
                  className="h-9 rounded-full bg-gradient-to-l from-[#a801ba] to-[#2530f0] px-6 text-sm text-white hover:opacity-90 font-['Space_Grotesk']"
                >
                  {current.assignedUser ? (
                    <>
                      <Users className="mr-1 h-4 w-4" />
                      Manage user
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1 h-4 w-4" />
                      Assign user
                    </>
                  )}
                </Button>
              </div>
            )}

            {!isMember && current.billingPlan && (
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="max-w-xl space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                      Current Billing Plan:
                    </span>
                    <span className="font-['Space_Grotesk'] inline-flex items-center rounded-full bg-[rgba(219,135,0,0.15)] px-4 py-1 text-sm text-[#db8700] dark:bg-[rgba(243,156,18,0.15)] dark:text-[#f39c12]">
                      {current.billingPlan.charAt(0).toUpperCase() + current.billingPlan.slice(1)}
                    </span>
                  </div>

                  {current.billingPlanDescription && (
                    <p className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-muted-foreground">
                      {current.billingPlanDescription}
                    </p>
                  )}
                  {(current.billingPlan === "daily" || current.billingPlan === "monthly") &&
                  current.billingCycle?.endTime && (
                    <p className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-muted-foreground">
                      Current plan ends (UTC):{" "}
                      {new Date(current.billingCycle.endTime).toLocaleString("en-US", {
                        timeZone: "UTC",
                      })}
                    </p>
                  )}

                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 rounded-full px-6 text-sm text-[#020816] dark:text-white font-['Space_Grotesk']"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBillingDialog(true);
                  }}
                >
                  Manage Plan
                </Button>

                <BillingPlanDialog
                  currentPlan={current.billingPlan as "hourly" | "daily" | "monthly"}
                  open={showBillingDialog}
                  onOpenChange={setShowBillingDialog}
                  configId={current.configId}
                  storageSize={current.specs?.storage}
                  region={current.region}
                  autoRenewEnabled={current.autoRenew}
                  onToggleAutoRenew={handleAutoRenewToggle}
                  billingCycle={current.billingCycle ?? null}

                  onConfirm={async (newPlan) => {
                    const key = selectedKeyRef.current ?? stickyKey;

                    try {
                      const response = await addBillingPlan({
                        instanceId: current.instanceId,
                        billingPlan: newPlan,
                      }).unwrap();

                      const change = (response?.change ?? "no_change") as
                        | "no_change"
                        | "upgrade"
                        | "downgrade";

                      const descriptions: Record<"hourly" | "daily" | "monthly", string> = {
                        hourly:
                          "Unlimited usage — pay per hour while running. Great for quick tasks.",
                        daily: "Ideal for day-long projects. ~Savings up to 10% vs Hourly.",
                        monthly: "Best value for regular users. ~Saving up to 15% vs Hourly.",
                      };

                      let title = "Billing Plan";
                      let message = "";

                      if (change === "no_change") {
                        title = "No Changes Made";
                        message = "You selected the same billing plan. Nothing was changed.";
                      } else if (change === "upgrade") {
                        title = "Billing Plan Updated";
                        message = `You've switched to the ${newPlan} plan.`;
                      } else if (change === "downgrade") {
                        title = "Downgrade Scheduled";
                        message =
                          `Your request to downgrade to the ${newPlan} plan has been saved. ` +
                          `The new plan will take effect after the current billing cycle.`;
                      }

                      toast({ title, description: message });

                      if (change === "upgrade") {
                        setCloudPCs((prev) => {
                          const idx = findIdxByKey(prev, key);
                          if (idx < 0 || !prev[idx]) return prev;

                          const next = [...prev];
                          next[idx] = {
                            ...next[idx],
                            billingPlan: newPlan,
                            billingPlanDescription: descriptions[newPlan],
                          };
                          return next;
                        });
                      } else if (change === "downgrade") {
                        setCloudPCs((prev) => {
                          const idx = findIdxByKey(prev, key);
                          if (idx < 0 || !prev[idx]) return prev;

                          const next = [...prev];
                          next[idx] = {
                            ...next[idx],
                            billingPlanDescription:
                              (next[idx]?.billingPlanDescription ?? "") + " (Downgrade scheduled)",
                          };
                          return next;
                        });
                      }

                      setShowBillingDialog(false);
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: getErrorMessage(error, "Failed to update billing plan."),
                        variant: "destructive",
                      });
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </DashboardCard>
    </motion.div>
  );
};

export default SelectedPc;
