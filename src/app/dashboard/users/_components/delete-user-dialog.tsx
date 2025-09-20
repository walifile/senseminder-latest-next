"use client";

import { useDeleteUserMutation } from "@/api/user";
import React, { useState, useCallback } from "react";

import { Input } from "@/components/ui/input";
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

import type { ApiUser } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedUser: ApiUser | null;
  setSelectedUser: (user: ApiUser | null) => void;
  globalReload: () => void;
};

const DeleteUserDialog = ({
  open,
  onClose,
  selectedUser,
  setSelectedUser,
  globalReload,
}: Props) => {
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
    } catch (e) {
      toast({
        title: "Failed to delete user",
        variant: "destructive",
        description: getErrorMessage(e, "Failed to delete user."),
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
