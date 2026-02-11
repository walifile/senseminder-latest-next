import type { PC } from "@/app/build-sensepc/types";

import React, { useState, useCallback } from "react";
import { useListRemoteDesktopQuery } from "@/api/fileManagerAPI";
import { useAssignPCMutation, useUnassignPCMutation } from "@/api/assignpc";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    | { type: "assign"; pc: PC }
    | { type: "unassign"; pc: PC }
    | { type: "blocked"; message: string }
    | null
  >(null);

  const { data: smartPCs = [], isLoading: isSmartPCLoading } =
    useListRemoteDesktopQuery(
      selectedUser
        ? { userId: selectedUser.owner_id || selectedUser.id }
        : { userId: undefined },
      { skip: !selectedUser },
    );

  const isLoading = fetchAssignmentsLoading || isSmartPCLoading;
  const isAssignedToAny = (instanceId: string) =>
    Object.values(assignments).some((list) =>
      list.some((assignment) => assignment.instanceId === instanceId),
    );

  const assignSmartPC = async (instance: PC) => {
    if (!selectedUser) return;
    const state = instance.state?.toLowerCase();
    if (state && state !== "stopped" && state !== "running") {
      setConfirmAction({
        type: "blocked",
        message:
          "This PC is currently changing state. Please wait until it finishes before continuing.",
      });
      setConfirmOpen(true);
      return;
    }
    if (state === "running" && !isAssignedToAny(instance.instanceId)) {
      setConfirmAction({
        type: "blocked",
        message: "This PC is running. Please stop it before assigning access.",
      });
      setConfirmOpen(true);
      return;
    }
    if (state !== "stopped") {
      setConfirmAction({ type: "assign", pc: instance });
      setConfirmOpen(true);
      return;
    }
    await assignSmartPCDirect(instance);
  };

  const assignSmartPCDirect = async (instance: PC) => {
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
    const state = instance.state?.toLowerCase();
    if (state && state !== "stopped" && state !== "running") {
      setConfirmAction({
        type: "blocked",
        message:
          "This PC is currently changing state. Please wait until it finishes before continuing.",
      });
      setConfirmOpen(true);
      return;
    }
    if (state !== "stopped") {
      setConfirmAction({ type: "unassign", pc: instance });
      setConfirmOpen(true);
      return;
    }
    await unassignSmartPCDirect(instance);
  };

  const unassignSmartPCDirect = async (instance: PC) => {
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
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [onClose, setSelectedUser]);

  const confirmDescription =
    confirmAction?.type === "blocked"
      ? confirmAction.message
      : confirmAction?.type === "assign"
        ? "This PC is running. Assigning access will stop the PC. Continue?"
        : "This PC is running. Unassigning will stop the PC. Continue?";

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setConfirmOpen(false);
    const action = confirmAction;
    setConfirmAction(null);
    if (action.type === "blocked") {
      return;
    }
    if (action.type === "assign") {
      await assignSmartPCDirect(action.pc);
    } else {
      await unassignSmartPCDirect(action.pc);
    }
  };

  return (
    <>
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
                        <div className="font-bold">
                          {pc.systemName || "Unnamed PC"}
                        </div>

                        {pc.state ? (
                          <div className="text-xs text-muted-foreground">
                            {pc.state}
                          </div>
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
      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!next) {
            setConfirmOpen(false);
            setConfirmAction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>{confirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmOpen(false);
                setConfirmAction(null);
              }}
            >
              {confirmAction?.type === "blocked" ? "Close" : "Cancel"}
            </Button>
            {confirmAction?.type !== "blocked" && (
              <Button onClick={handleConfirm}>Continue</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManagePcDialog;
