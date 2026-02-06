import type { PC } from "@/app/build-sensepc/types";

import React, { useState, useCallback } from "react";
import {
  useAssignPCMutation,
  useUnassignPCMutation,
} from "@/api/assignpc";
import { useListRemoteDesktopQuery } from "@/api/fileManagerAPI";

import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { toast } from "@/hooks/use-toast";

import { getPcButtonConfig } from "../utils";

import type { ApiUser } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedUser: ApiUser | null;
  setSelectedUser: (user: ApiUser | null) => void;
  globalReload: () => void;
  fetchAssignmentsLoading: boolean;
  assignments: Record<string, { instanceId: string }[]>;
};

const ManagePcDialog = ({
  open,
  onClose,
  selectedUser,
  setSelectedUser,
  globalReload,
  fetchAssignmentsLoading,
  assignments,
}: Props) => {
  const [pcAssigningId, setPCAssigningId] = useState<string | null>(null);
  const [assignPC] = useAssignPCMutation();
  const [unassignPC] = useUnassignPCMutation();

  const { data: smartPCs = [], isLoading: isSmartPCLoading } =
    useListRemoteDesktopQuery(
      selectedUser
        ? { userId: selectedUser.owner_id || selectedUser.id }
        : { userId: undefined },
      { skip: !selectedUser }
    );

  const isLoading = fetchAssignmentsLoading || isSmartPCLoading;

  const assignSmartPC = async (instance: PC) => {
    if (!selectedUser) return;
    setPCAssigningId(instance.instanceId);
    try {
      await assignPC({
        memberId: selectedUser.id,
        instanceId: instance.instanceId,
        systemName: instance.systemName,
      }).unwrap();
      toast({
        title: "PC Assigned",
        description: `${instance.systemName} assigned to ${
          selectedUser.firstName || selectedUser.email
        }`,
      });
      setTimeout(globalReload, 300);
    } catch (e) {
      toast({
        title: "Failed to assign PC",
        variant: "destructive",
        description: getErrorMessage(e, "Failed to assign"),
      });
    } finally {
      setPCAssigningId(null);
    }
  };

  const unassignSmartPC = async (instance: PC) => {
    if (!selectedUser) return;
    setPCAssigningId(instance.instanceId);
    try {
      await unassignPC({
        memberId: selectedUser.id,
        instanceId: instance.instanceId,
      }).unwrap();
      toast({
        title: "PC Unassigned",
        description: `${instance.systemName} unassigned from ${
          selectedUser.firstName || selectedUser.email
        }`,
      });
      setTimeout(globalReload, 300);
    } catch (e) {
      toast({
        title: "Failed to unassign PC",
        variant: "destructive",
        description: getErrorMessage(e, "Failed to unassign"),
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
      <DialogContent
        data-testid="dashboard-users-manage-pc-dialog"
        className="sm:max-w-[540px]"
      >
        <DialogHeader>
          <DialogTitle>
            Manage PCs for
            {selectedUser
              ? ` ${selectedUser.firstName || ""} ${
                  selectedUser.lastName || ""
                } (`
              : ""}
            {selectedUser ? (
              <span className="normal-case">{selectedUser.email}</span>
            ) : null}
            {selectedUser ? ")" : ""}
          </DialogTitle>
          <DialogDescription>
            Assign or unassign SensePC for this member.
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
            <div className="italic">No PCs available to assign.</div>
          ) : (
            <div className="space-y-3">
              {smartPCs.map((pc: PC) => {
                const buttonConfig = getPcButtonConfig({
                  pc,
                  selectedUserId: selectedUser.id,
                  assignments,
                  pcAssigningId,
                  assignSmartPC,
                  unassignSmartPC,
                });

                return (
                  <div
                    key={pc.instanceId}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                    <div className="font-bold">{pc.systemName || "Unnamed PC"}</div>

                    {pc.state ? (
                      <div className="text-xs text-muted-foreground">{pc.state}</div>
                    ) : null}
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
