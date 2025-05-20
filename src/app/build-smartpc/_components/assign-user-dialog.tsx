import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AssignedUser, PC } from "../types";

type AssignUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPC: PC | null;
  allUsers: AssignedUser[];
  setCloudPCs: (pcs: PC[]) => void;
  cloudPCs: PC[];
};

const AssignUserDialog: React.FC<AssignUserDialogProps> = ({
  open,
  onOpenChange,
  selectedPC,
  allUsers,
  setCloudPCs,
  cloudPCs,
}) => {
  const { toast } = useToast();
  const assignUser = (user: AssignedUser) => {
    if (!selectedPC || !selectedPC.instanceId) return;

    const existingUsers = selectedPC.assignedUsers || [];

    // Prevent duplicates by email
    const alreadyAssigned = existingUsers.some((u) => u.email === user.email);

    if (alreadyAssigned) {
      toast({
        title: "User Already Assigned",
        description: `${user.name} is already assigned to ${selectedPC.name}`,
      });
      onOpenChange(false);
      return;
    }

    const updatedPC: PC = {
      ...selectedPC,
      assignedUsers: [...existingUsers, user],
    } as PC;

    const updatedList: PC[] = cloudPCs.map((pc) =>
      pc.instanceId === updatedPC.instanceId ? updatedPC : pc
    );

    setCloudPCs(updatedList);

    toast({
      title: "User Assigned",
      description: `${user.name} has been assigned to ${selectedPC.name}`,
    });

    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Users to {selectedPC?.name}</DialogTitle>
          <DialogDescription>
            Select users to assign to this SmartPC.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {allUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name && user?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (user) {
                    assignUser(user);
                  }
                }}
              >
                Assign
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUserDialog;
