"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteUserMutation } from "@/api/user";
import { toast } from "@/hooks/use-toast";

const DeleteUserDialog = ({
  open,
  onClose,
  selectedUser,
  setSelectedUser,
  globalReload,
}: any) => {
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const [deleteUser, { isLoading }] = useDeleteUserMutation();

  const { email, role } = selectedUser || {};

  const handleDeleteUser = async () => {
    if (!email || !role) return;
    try {
      await deleteUser({ email, role }).unwrap();
      toast({
        title: "User deleted",
        description: `The user ${email} has been deleted.`,
      });
      globalReload();
      closeDialog();
    } catch (e: any) {
      toast({
        title: "Failed to delete user",
        variant: "destructive",
        description: (e && e.message) || "Failed to delete user.",
      });
    }
  };

  const closeDialog = useCallback(() => {
    setDeleteConfirmInput("");
    setSelectedUser(null);
    onClose();
  }, [onClose, setSelectedUser, setDeleteConfirmInput]);

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            To delete <b>{email}</b>, please type <b>confirm</b> below and click
            "Delete". <br />
            This action is irreversible.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder='Type "confirm" to proceed'
          value={deleteConfirmInput}
          onChange={(e) => setDeleteConfirmInput(e.target.value)}
          disabled={isLoading}
        />
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteUser}
            disabled={deleteConfirmInput !== "confirm" || isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
