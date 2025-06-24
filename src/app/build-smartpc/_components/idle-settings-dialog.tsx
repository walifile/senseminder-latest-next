import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type IdleSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPC?: { name: string };
  selectedIdleTimeout: string;
  setSelectedIdleTimeout: (value: string) => void;
  onSave: () => void;
};

const IdleSettingsDialog: React.FC<IdleSettingsDialogProps> = ({
  open,
  onOpenChange,
  editingPC,
  selectedIdleTimeout,
  setSelectedIdleTimeout,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Configure Idle Settings</DialogTitle>
          <DialogDescription>
            Set the idle timeout duration for {editingPC?.name}. The PC will be
            suspended after being idle for the specified duration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Idle Timeout (minutes)</Label>
          <Select
            value={selectedIdleTimeout}
            onValueChange={setSelectedIdleTimeout}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeout duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">none</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="180">3 hours</SelectItem>
              <SelectItem value="240">4 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IdleSettingsDialog;
