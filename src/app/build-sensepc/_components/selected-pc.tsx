


// build-smartpc/src/app/build-smartpc/_components/selected-pc.tsx

"use client";

import type { RootState } from "@/redux/store";

import appConfig from "@/config/app-config";
import React, { useState, useEffect } from "react";
import {
  useAddBillingPlanMutation,
  useUpdateAutoRenewMutation,
} from "@/api/billing";

import { Logger } from "@/lib/utils/logger";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getFriendlyOSName } from "@/lib/utils/format-string";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";

import { useSelector } from "react-redux";

import { motion } from "framer-motion";
import {
  Cpu,
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

import { BillingPlanDialog } from "./billing-dialog";

import type { PC, SelectedPcProps } from "../types";

const { INSTANCE_DETAILS_URL } = appConfig;

// Shared styles for the small glass cards (metrics + specs + assigned user + billing)
// const STAT_CARD_BASE =
//   "rounded-[10px] p-4 text-sm bg-[rgba(37,48,240,0.1)] text-[#020816] " + // light
//   "dark:bg-[rgba(255,255,255,0.04)] dark:text-white"; // dark



const STAT_CARD_BASE =
  "rounded-[10px] p-4 text-sm bg-[rgba(37,48,240,0.1)] text-[#020816] " + // light
  "dark:bg-[rgba(255,255,255,0.04)] dark:text-white"; // dark

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

  const selectedIndex = selectedPCs[0];
  const currentPC = selectedIndex != null ? cloudPCs[selectedIndex] : undefined;
  const currentUserId = currentPC?.userId;
  const currentSystemName = currentPC?.systemName;

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!selectedPCs.length) return;
      if (!currentUserId || !currentSystemName) return;

      try {
        const res = await fetch(INSTANCE_DETAILS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUserId,
            instanceNames: [currentSystemName],
          }),
        });

        const data = await res.json();
        const matched = data.find(
          (item: PC) =>
            item.systemName === currentSystemName && item.instanceId,
        );

        if (matched) {
          setCloudPCs((prev) => {
            const idx = selectedIndex;
            if (idx == null || !prev[idx]) return prev;

            const prevPC = prev[idx];

            const updatedPC: PC = {
              ...prevPC,
              cpuUsage: parseFloat(matched.cpuUsage.replace("%", "")),
              memoryUsage: isNaN(
                parseFloat(matched.memoryUsage?.replace("%", "") || ""),
              )
                ? 0
                : parseFloat(matched.memoryUsage!.replace("%", "")),
              region: matched.region,
              uptime: matched.uptime,
              specs: matched.specs,
              billingPlan: matched.billingPlan,
              billingPlanDescription: matched.billingPlanDescription,
              assignedUser: matched.assignedUser,
              monthlyBillingTotal: parseFloat(
                matched?.monthlyBilling?.total ?? "0",
              ),
              autoRenew: matched.autoRenew,
            };

            const isSame =
              prevPC.cpuUsage === updatedPC.cpuUsage &&
              prevPC.memoryUsage === updatedPC.memoryUsage &&
              prevPC.region === updatedPC.region &&
              prevPC.uptime === updatedPC.uptime &&
              prevPC.billingPlan === updatedPC.billingPlan &&
              prevPC.billingPlanDescription ===
                updatedPC.billingPlanDescription &&
              prevPC.monthlyBillingTotal === updatedPC.monthlyBillingTotal &&
              prevPC.autoRenew === updatedPC.autoRenew;

            if (isSame) return prev;

            const next = [...prev];
            next[idx] = updatedPC;
            return next;
          });
        }
      } catch (err) {
        Logger.error("Failed to load real-time metrics:", err);
      }
    };

    fetchMetrics();
  }, [
    selectedIndex,
    currentUserId,
    currentSystemName,
    // NOTE: no cloudPCs / setCloudPCs in deps
  ]);

  const pc = [cloudPCs[selectedIndex!]];
  const { user } = useSelector((state: RootState) => state.auth);
  const isMember = user?.role === "member";
  const [showBillingDialog, setShowBillingDialog] = useState(false);

  const handleAutoRenewToggle = async (newAutoRenew: boolean) => {
    if (!pc[0]?.instanceId) return;

    try {
      await updateAutoRenew({
        instanceId: pc[0].instanceId,
        autoRenew: newAutoRenew,
      }).unwrap();

      setCloudPCs((prev) => {
        const updated = [...prev];
        updated[selectedPCs[0]] = {
          ...updated[selectedPCs[0]],
          autoRenew: newAutoRenew,
        };
        return updated;
      });

      toast({
        title: "Auto-Renew Updated",
        description: `Auto-renew has been ${
          newAutoRenew ? "enabled" : "disabled"
        } for this instance.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(
          error,
          "Failed to update auto-renew setting.",
        ),
        variant: "destructive",
      });
    }
  };

  if (!selectedPCs.length || !pc[0]) return null;

  const current = pc[0];
  const formattedOS = current?.specs?.os
    ? getFriendlyOSName(current.specs.os)
    : undefined;

  const cpuPercent = Math.max(0, Math.min(100, current.cpuUsage ?? 0));
  const memPercent = Math.max(0, Math.min(100, current.memoryUsage ?? 0));

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mt-14"
    >
      <DashboardCard className="w-full overflow-hidden p-4 md:p-5 lg:p-6">
        {/* ========= SIMPLE HEADER (FIGMA) ========= */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-[#020816] md:text-lg dark:text-white">
            Instance Details
          </h3>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* ========= BODY: DETAILS ========= */}
        {showDetails && selectedPCs.length === 1 && (
          <div className="mt-5 space-y-6">
            {/* ---- METRICS ROW (5 SMALL CARDS) ---- */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {/* CPU */}
              <div
                className={`${STAT_CARD_BASE} flex flex-col justify-between`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-[#020816] dark:text-white">
                      CPU
                    </span>
                  </div>
                  <span className="text-sm text-[#454545] dark:text-muted-foreground">
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
              <div
                className={`${STAT_CARD_BASE} flex flex-col justify-between`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-[#020816] dark:text-white">
                      Memory
                    </span>
                  </div>
                  <span className="text-sm text-[#454545] dark:text-muted-foreground">
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
                  <span className="text-sm font-semibold text-[#020816] dark:text-white">
                    Region
                  </span>
                </div>
                <span className="mt-2 text-sm text-[#454545] dark:text-muted-foreground">
                  {current.region || "—"}
                </span>
              </div>

              {/* Uptime */}
              <div className={`${STAT_CARD_BASE} flex flex-col justify-center`}>
                <div className="flex items-center gap-2">
                  <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-[#020816] dark:text-white">
                    Uptime
                  </span>
                </div>
                <span className="mt-2 text-sm text-[#454545] dark:text-muted-foreground">
                  {current.uptime || "N/A"}
                </span>
              </div>

              {/* Cost */}
              <div className={`${STAT_CARD_BASE} flex flex-col justify-center`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-[#020816] dark:text-white">
                    Cost
                  </span>
                </div>
                <span className="mt-2 text-sm text-[#454545] dark:text-muted-foreground">
                  ${current.monthlyBillingTotal?.toFixed(2) ?? "0.00"} this
                  month
                </span>
              </div>
            </div>

            {/* ---- DIVIDER ---- */}
            <div className="h-px w-full bg-[rgba(37,48,240,0.1)] dark:bg-white/10" />

            {/* ---- SPECIFICATIONS ---- */}
            <div>
              <h4 className="text-sm font-medium text-[#020816] dark:text-white">
                Specifications
              </h4>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {[
                  { icon: Cpu, label: "CPU", value: current.specs?.cpu },
                  {
                    icon: MemoryStick,
                    label: "Memory",
                    value: current.specs?.ram,
                  },
                  {
                    icon: HardDrive,
                    label: "SSD",
                    value: current.specs?.storage,
                  },
                  { icon: Activity, label: "GPU", value: current.specs?.gpu },
                  {
                    icon: Settings,
                    label: "OS",
                    value: formattedOS,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className={`${STAT_CARD_BASE} space-y-1`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-[#020816] dark:text-white">
                        {label}
                      </span>
                    </div>
                    <span className="block text-sm text-[#454545] dark:text-muted-foreground">
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- ASSIGNED USER ---- */}
            {!isMember && (
              <div
                className={`${STAT_CARD_BASE} flex flex-col justify-between gap-3 md:flex-row md:items-center`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-[#020816] dark:text-white">
                      Assigned User
                    </h4>
                  </div>
                  {current.assignedUser ? (
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {current.assignedUser.name?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5 text-sm">
                        <div className="font-medium text-[#020816] dark:text-white">
                          {current.assignedUser.name}
                        </div>
                        <div className="text-xs text-[#454545] dark:text-muted-foreground">
                          {current.assignedUser.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#454545] dark:text-muted-foreground">
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
                  className="h-9 rounded-full bg-gradient-to-l from-[#a801ba] to-[#2530f0] px-6 text-sm text-white hover:opacity-90"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Assign
                </Button>
              </div>
            )}

            {/* ---- BILLING PLAN (BOTTOM) ---- */}
          {/* ---- BILLING PLAN (BOTTOM) ---- */}
{!isMember && current.billingPlan && (
  <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
    <div className="max-w-xl space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-[#020816] dark:text-white">
          Current Billing Plan:
        </span>
        <span className="inline-flex items-center rounded-full bg-[rgba(219,135,0,0.15)] px-4 py-1 text-sm text-[#db8700] dark:bg-[rgba(243,156,18,0.15)] dark:text-[#f39c12]">
          {current.billingPlan.charAt(0).toUpperCase() +
            current.billingPlan.slice(1)}
        </span>
      </div>
      {current.billingPlanDescription && (
        <p className="text-sm text-[#454545] dark:text-muted-foreground">
          {current.billingPlanDescription}
        </p>
      )}
    </div>

    <Button
      variant="outline"
      size="sm"
      className="h-11 rounded-full px-6 text-sm text-[#020816] dark:text-white"
      onClick={(e) => {
        e.stopPropagation();
        setShowBillingDialog(true);
      }}
    >
      Change Plan
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
      onConfirm={async (newPlan) => {
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
              "Perfect for quick tasks and testing. No commitment, instant start/stop.",
            daily:
              "Ideal for day-long projects. ~15% savings vs hourly.",
            monthly:
              "Best value for regular users. ~35% savings vs weekly.",
          };

          let title = "Billing Plan";
          let message = "";

          if (change === "no_change") {
            title = "No Changes Made";
            message =
              "You selected the same billing plan. Nothing was changed.";
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
              const updated = [...prev];
              updated[selectedPCs[0]] = {
                ...updated[selectedPCs[0]],
                billingPlan: newPlan,
                billingPlanDescription: descriptions[newPlan],
              };
              return updated;
            });
          } else if (change === "downgrade") {
            setCloudPCs((prev) => {
              const updated = [...prev];
              updated[selectedPCs[0]] = {
                ...updated[selectedPCs[0]],
                billingPlanDescription:
                  (updated[selectedPCs[0]]?.billingPlanDescription ?? "") +
                  " (Downgrade scheduled)",
              };
              return updated;
            });
          }

          setShowBillingDialog(false);
        } catch (error) {
          toast({
            title: "Error",
            description: getErrorMessage(
              error,
              "Failed to update billing plan.",
            ),
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
