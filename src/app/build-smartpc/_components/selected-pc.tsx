"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  MonitorPlay,
  Shield,
  AlertCircle,
  Activity,
  Settings,
  Users,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SelectedPcProps } from "../types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const SelectedPc: React.FC<SelectedPcProps> = ({
  selectedPCs,
  showDetails,
  setShowDetails,
  cloudPCs,
  setCloudPCs,
  handleAssignUser,
}) => {
  const { toast } = useToast();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!selectedPCs.length) return;

      const currentPC = cloudPCs[selectedPCs[0]];
      if (!currentPC?.userId || !currentPC?.systemName) return;

      try {
        const res = await fetch(
          `https://4oacxj1xyk.execute-api.us-east-1.amazonaws.com/instance-details?userId=${currentPC.userId}&instanceName=${currentPC.systemName}`
        );
        const data = await res.json();
        if (data && data.instanceId) {
          const updatedPC = {
            ...currentPC,
            cpuUsage: parseFloat(data.cpuUsage.replace("%", "")),
            memoryUsage: 0,
            region: data.region,
            uptime: data.uptime,
            specs: data.specs, // ✅ Use the correct nested object from backend
          };

          const updatedCloudPCs = [...cloudPCs];
          updatedCloudPCs[selectedPCs[0]] = updatedPC;
          setCloudPCs(updatedCloudPCs);
        }
      } catch (err) {
        console.error("Failed to load real-time metrics:", err);
      }
    };

    fetchMetrics();
  }, [selectedPCs]);

  const pc = [cloudPCs[selectedPCs[0]]];

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">CPU Usage</span>
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

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Memory Usage</span>
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

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Region</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pc[0]?.region || "-"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Uptime</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pc[0]?.uptime || "-"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Cost</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ${pc[0]?.cost?.toFixed(2) ?? "0.00"} this month
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
                        label: "Storage",
                        value: pc[0]?.specs?.storage,
                      },
                      {
                        icon: Activity,
                        label: "GPU",
                        value: pc[0]?.specs?.gpu,
                      },
                      { icon: Settings, label: "OS", value: pc[0]?.specs?.os },
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

                {/* Assigned Users */}
                <div className="col-span-full mt-4 border-t pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">
                      Assigned Users ({pc[0]?.assignedUsers?.length ?? 0})
                    </h4>
                    <div className="flex-1 border-b border-border/50" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignUser(pc[0]);
                      }}
                      className="h-7 px-2 text-xs hover:bg-primary/5 hover:text-primary"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Assign
                    </Button>
                  </div>

                  {pc[0]?.assignedUsers && pc[0]?.assignedUsers?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {pc[0].assignedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="group flex items-center gap-2 bg-muted/30 hover:bg-muted/50 px-2 py-1 rounded-md"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium leading-none">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {user.email}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (pc[0]?.assignedUsers) {
                                const updatedPC = {
                                  ...pc[0],
                                  assignedUsers: pc[0].assignedUsers.filter(
                                    (u) => u.email !== user.email
                                  ),
                                };
                                setCloudPCs(
                                  cloudPCs.map((p) =>
                                    p.instanceId === pc[0].instanceId
                                      ? updatedPC
                                      : p
                                  )
                                );
                                toast({
                                  title: "User Removed",
                                  description: `${user.name} has been removed from ${pc[0].name}`,
                                });
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 ml-1"
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                      <Users className="h-4 w-4" />
                      No assigned users
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default SelectedPc;
