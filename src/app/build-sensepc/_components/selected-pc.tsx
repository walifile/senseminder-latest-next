//build-smartpc/src/app/build-smartpc/_components/selected-pc.tsx

"use client";

import type { RootState } from "@/redux/store";

import appConfig from "@/config/app-config";
import React, { useState, useEffect } from "react";
import { useAddBillingPlanMutation, useUpdateAutoRenewMutation } from "@/api/billing";

import { Logger } from "@/lib/utils/logger";
import { getErrorMessage } from "@/lib/utils";
// Auto-renew switch is now managed only inside billing-dialog.tsx
// import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getFriendlyOSName } from "@/lib/utils/format-string";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useSelector } from "react-redux";

import { motion } from "framer-motion";
import {
  Cpu,
  Plus,
  Users,
  Shield,
  Activity,
  Settings,
  // RotateCw, // auto-renew icon removed from this page
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

  // 🔹 Derive the currently selected PC and stable identity fields
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
            item.systemName === currentSystemName && item.instanceId
        );

        if (matched) {
          setCloudPCs((prev) => {
            // Use the same selected index against the previous array
            const idx = selectedIndex;
            if (idx == null || !prev[idx]) return prev;

            const prevPC = prev[idx];

            const updatedPC: PC = {
              ...prevPC,
              cpuUsage: parseFloat(matched.cpuUsage.replace("%", "")),
              memoryUsage: isNaN(
                parseFloat(matched.memoryUsage?.replace("%", "") || "")
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
                matched?.monthlyBilling?.total ?? "0"
              ),
              autoRenew: matched.autoRenew,
            };

            // Optional micro-optimization: avoid re-render if nothing changed
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
    // NOTE: no `cloudPCs` and no `setCloudPCs` in deps
  ]);

  const pc = [cloudPCs[selectedIndex!]];
  const { user } = useSelector((state: RootState) => state.auth);
  const isMember = user?.role === "member";
  const [showBillingDialog, setShowBillingDialog] = useState(false);

  // Shared auto-renew handler (now only used by BillingPlanDialog)
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
        description: `Auto-renew has been ${newAutoRenew ? "enabled" : "disabled"
          } for this instance.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(
          error,
          "Failed to update auto-renew setting."
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {selectedPCs.length > 0 && pc[0] && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          className="mt-4 bg-card rounded-lg border border-border overflow-hidden"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Instance Details</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>

            {showDetails && selectedPCs.length === 1 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* CPU Usage */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pc[0]?.cpuUsage ?? 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pc[0]?.cpuUsage ?? 0}%
                  </span>
                </div>

                {/* Memory Usage */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pc[0]?.memoryUsage ?? 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pc[0]?.memoryUsage ?? 0}%
                  </span>
                </div>

                {/* Region */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pc[0]?.region || "-"}
                  </span>
                </div>

                {/* Uptime */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Uptime</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pc[0]?.uptime || "-"}
                  </span>
                </div>

                {/* Monthly Cost */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Cost</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ${pc[0]?.monthlyBillingTotal?.toFixed(2) ?? "0.00"} this
                    month
                  </span>
                </div>

                <div className="col-span-full mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Specifications</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { icon: Cpu, label: "CPU", value: pc[0]?.specs?.cpu },
                      {
                        icon: MemoryStick,
                        label: "RAM",
                        value: pc[0]?.specs?.ram,
                      },
                      {
                        icon: HardDrive,
                        label: "SSD",
                        value: pc[0]?.specs?.storage,
                      },
                      {
                        icon: Activity,
                        label: "GPU",
                        value: pc[0]?.specs?.gpu,
                      },
                      {
                        icon: Settings,
                        label: "OS",
                        value: getFriendlyOSName(pc[0]?.specs?.os ?? ""),
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {!isMember && (
                  <div className="col-span-full mt-4 border-t pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-medium">Assigned User</h4>
                      <div className="flex-1 border-b border-border/50" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignUser();
                          setSelectedInstance(pc[0]);
                        }}
                        className="h-7 px-2 text-xs hover:bg-primary/5 hover:text-primary"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Manage User
                      </Button>
                    </div>
                    {pc[0]?.assignedUser ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>
                            {pc[0].assignedUser.name?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {pc[0].assignedUser.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {pc[0].assignedUser.email}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        No user assigned to this PC.
                      </div>
                    )}
                  </div>
                )}

                {/* Auto-Renew block removed from here – now controlled only via BillingPlanDialog */}

                {!isMember && pc[0]?.billingPlan && (
                  <div className="col-span-full mt-4 border-t pt-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3 flex-wrap">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Current Billing Plan:
                        </span>
                        <span className="text-sm font-semibold text-sky-700 bg-sky-100 border border-sky-200 rounded-md px-2 py-0.5 capitalize">
                          {pc[0].billingPlan}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {pc[0].billingPlanDescription}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBillingDialog(true);
                        }}
                      >
                        Manage Plan
                      </Button>

                      <BillingPlanDialog
                        currentPlan={
                          pc[0].billingPlan as "hourly" | "daily" | "monthly"
                        }
                        open={showBillingDialog}
                        onOpenChange={setShowBillingDialog}
                        configId={pc[0].configId}
                        storageSize={pc[0].specs?.storage}
                        region={pc[0].region}
                        autoRenewEnabled={pc[0].autoRenew}
                        onToggleAutoRenew={handleAutoRenewToggle}
                        onConfirm={async (newPlan) => {
                          try {
                            const response = await addBillingPlan({
                              instanceId: pc[0].instanceId,
                              billingPlan: newPlan,
                            }).unwrap();

                            const change = (response?.change ?? "no_change") as
                              | "no_change"
                              | "upgrade"
                              | "downgrade";

                            const descriptions: Record<
                              "hourly" | "daily" | "monthly",
                              string
                            > = {
                              hourly:
                                "Perfect for quick tasks and testing.",
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
                                  billingPlanDescription:
                                    descriptions[newPlan],
                                };
                                return updated;
                              });
                            } else if (change === "downgrade") {
                              setCloudPCs((prev) => {
                                const updated = [...prev];
                                updated[selectedPCs[0]] = {
                                  ...updated[selectedPCs[0]],
                                  billingPlanDescription:
                                    (updated[selectedPCs[0]]
                                      ?.billingPlanDescription ?? "") +
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
                                "Failed to update billing plan."
                              ),
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default SelectedPc;
