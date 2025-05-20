"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  MonitorPlay,
  Shield,
  CalendarClock,
  Clock,
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
// import { formatUptime } from "../utils";
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

  const pc = [cloudPCs[selectedPCs[0]]];
  return (
    <>
      {selectedPCs.length > 0 && (
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
                {pc.map((pc) => (
                  <React.Fragment key={pc.id}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">CPU Usage</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `45%` }}
                          // style={{ width: `${pc.cpuUsage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        45%
                        {/* {pc?.cpuUsage ?? 0}% */}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Memory Usage
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `60%` }}
                          // style={{ width: `${pc.memoryUsage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        60%
                        {/* {pc.memoryUsage}% */}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Region</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {/* {pc.region} */}
                        us-east
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Schedule</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {/* {pc.schedule
                            ? `${pc.schedule.start}-${pc.schedule.end}`
                            : "No schedule"} */}
                        No schedule
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Idle Time</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {/* {pc.idleTime} */}
                        None
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Uptime</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {/* {formatUptime(pc?.uptime)} */}1d 0h
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Cost</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {/* ${pc.cost.toFixed(2)} this month */}
                        $2.50 this month
                      </span>
                    </div>

                    <div className="col-span-full mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">
                        Specifications
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">CPU</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {/* {pc?.specs?.cpu} */}8 Core
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MemoryStick className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">RAM</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {/* {pc?.specs?.ram} */}
                            16GB
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Storage</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {/* {pc?.specs?.storage} */}
                            512GB SSD
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">GPU</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {/* {pc?.specs?.gpu} */}
                            NVIDIA RTX 3060
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">OS</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {/* {pc?.specs?.os} */}
                            Windows 11 Pro
                          </span>
                        </div>
                      </div>

                      {/* Assigned Users Section */}
                      <div className="col-span-full mt-4 border-t pt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <h4 className="text-sm font-medium">
                            Assigned Users ({pc?.assignedUsers?.length})
                          </h4>
                          <div className="flex-1 border-b border-border/50" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignUser(pc);
                            }}
                            className="h-7 px-2 text-xs hover:bg-primary/5 hover:text-primary"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        </div>

                        {pc &&
                        pc?.assignedUsers &&
                        pc?.assignedUsers?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {pc?.assignedUsers?.map((user) => (
                              <div
                                key={user.id}
                                className="group flex items-center gap-2 bg-muted/30 hover:bg-muted/50 px-2 py-1 rounded-md"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {user.name && user.name.charAt(0)}
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

                                    const updatedPC = {
                                      ...pc,
                                      assignedUsers: (
                                        pc.assignedUsers ?? []
                                      ).filter((u) => u.email !== user.email),
                                    };

                                    if (setCloudPCs) {
                                      setCloudPCs(
                                        cloudPCs.map((p) =>
                                          p.instanceId === pc.instanceId
                                            ? updatedPC
                                            : p
                                        )
                                      );
                                    }

                                    toast({
                                      title: "User Removed",
                                      description: `${user.name} has been removed from ${pc.name}`,
                                    });
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
                  </React.Fragment>
                ))}
              </div>
            )}

            {showDetails && selectedPCs.length > 1 && (
              <div className="text-center py-4 text-muted-foreground">
                Select a single instance to view details
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default SelectedPc;
