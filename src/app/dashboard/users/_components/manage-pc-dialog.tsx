import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { assignPC, unassignPC } from "@/api/assignpc";
import { useListRemoteDesktopQuery } from "@/api/fileManagerAPI";
import { ApiUser } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  mainUser?: ApiUser | undefined;
  selectedUser: ApiUser | null;
  setSelectedUser: (user: any) => void;
  globalReload: () => void;
  fetchAssignmentsLoading: boolean;
  assignments: Record<string, any[]>;
};

const ManagePcDialog = ({
  open,
  onClose,
  mainUser,
  selectedUser,
  setSelectedUser,
  globalReload,
  fetchAssignmentsLoading,
  assignments,
}: Props) => {
  const [pcAssigningId, setPCAssigningId] = useState<string | null>(null);

  const { data: smartPCs = [], isLoading: isSmartPCLoading } =
    useListRemoteDesktopQuery(
      mainUser
        ? { userId: mainUser.owner_id || mainUser.id }
        : { userId: undefined },
      { skip: !mainUser }
    );

  const isLoading = fetchAssignmentsLoading || isSmartPCLoading;

  const assignSmartPC = async (instance: any) => {
    if (!selectedUser) return;
    setPCAssigningId(instance.instanceId);
    try {
      await assignPC({
        memberId: selectedUser.id,
        instanceId: instance.instanceId,
        systemName: instance.systemName,
      });
      toast({
        title: "PC Assigned",
        description: `${instance.systemName} assigned to ${
          selectedUser.firstName || selectedUser.email
        }`,
      });
      setTimeout(globalReload, 300);
    } catch (e: any) {
      toast({
        title: "Failed to assign PC",
        variant: "destructive",
        description: e?.message || "Failed to assign",
      });
    } finally {
      setPCAssigningId(null);
    }
  };

  const unassignSmartPC = async (instance: any) => {
    if (!selectedUser) return;
    setPCAssigningId(instance.instanceId);
    try {
      await unassignPC({
        memberId: selectedUser.id,
        instanceId: instance.instanceId,
      });
      toast({
        title: "PC Unassigned",
        description: `${instance.systemName} unassigned from ${
          selectedUser.firstName || selectedUser.email
        }`,
      });
      setTimeout(globalReload, 300);
    } catch (e: any) {
      toast({
        title: "Failed to unassign PC",
        variant: "destructive",
        description: e?.message || "Failed to unassign",
      });
    } finally {
      setPCAssigningId(null);
    }
  };

  const closeDialog = useCallback(() => {
    setSelectedUser(null);
    onClose();
  }, [onClose, setSelectedUser]);

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>
            Manage PCs for
            {selectedUser
              ? ` ${selectedUser.firstName || ""} ${
                  selectedUser.lastName || ""
                } (${selectedUser.email})`
              : ""}
          </DialogTitle>
          <DialogDescription>
            Assign or unassign SmartPCs for this member.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto mt-4">
          {isLoading ? (
            <div className="text-muted-foreground">Loading PCs...</div>
          ) : !selectedUser ? (
            <div className="italic text-muted-foreground">
              No user selected.
            </div>
          ) : smartPCs.length === 0 ? (
            <div className="italic">No SmartPCs available to assign.</div>
          ) : (
            <div className="space-y-3">
              {smartPCs.map((pc: any) => {
                const assignedToCurrent = (
                  assignments[selectedUser.id] ?? []
                ).some((a: any) => a.instanceId === pc.instanceId);

                const isAssignedElsewhere = Object.keys(assignments).some(
                  (assignment) =>
                    assignment !== selectedUser.id &&
                    assignments[assignment].some(
                      (a: any) => a.instanceId === pc.instanceId
                    )
                );

                const isAssigning = pcAssigningId === pc.instanceId;

                const buttonConfig: any = {
                  text: isAssigning ? "Assigning..." : "Assign",
                  color: "bg-green-500 text-white hover:bg-green-700",
                  onClick: async () => {
                    await assignSmartPC(pc);
                  },
                  disabled: isAssigning,
                };

                if (assignedToCurrent) {
                  buttonConfig.text = isAssigning
                    ? "Unassigning..."
                    : "Unassign";
                  buttonConfig.color = "bg-red-500 text-white hover:bg-red-700";
                  buttonConfig.onClick = async () => {
                    await unassignSmartPC(pc);
                  };
                  buttonConfig.disabled = isAssigning;
                } else if (isAssignedElsewhere) {
                  buttonConfig.text = "Assigned to Another";
                  buttonConfig.color =
                    "bg-gray-400 text-white cursor-not-allowed";
                  buttonConfig.onClick = undefined;
                  buttonConfig.disabled = true;
                }

                return (
                  <div
                    key={pc.instanceId}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <div className="font-bold">
                        {pc.systemName || pc.instanceId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pc.instanceId}
                        {pc.state ? ` · ${pc.state}` : ""}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className={buttonConfig.color}
                      disabled={buttonConfig.disabled}
                      onClick={buttonConfig.onClick}
                    >
                      {buttonConfig.text}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePcDialog;
