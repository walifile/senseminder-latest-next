import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Shield,
  CalendarClock,
  Moon,
  MoreVertical,
  Cpu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DesktopInstance } from "../types";

type Props = {
  pc: DesktopInstance;
  isMember: boolean;
  setSelectedInstance: (instance: DesktopInstance | null) => void;
  openPCResizeDialog: (pc: DesktopInstance) => void;
  openStorageDialog: (pc: DesktopInstance) => void;
  handleSchedule: () => void;
  handleIdle: () => void;
  handleAssignUser: () => void;
  handleDelete: () => void;
};

const SmartPcDropdownMenu = ({
  pc,
  isMember,
  setSelectedInstance,
  openPCResizeDialog,
  openStorageDialog,
  handleSchedule,
  handleIdle,
  handleAssignUser,
  handleDelete,
}: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            setSelectedInstance(pc);
            handleSchedule();
          }}
        >
          <CalendarClock className="h-4 w-4 mr-2" />
          Schedule
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            setSelectedInstance(pc);
            handleIdle();
          }}
        >
          <Moon className="h-4 w-4 mr-2" />
          Idle Settings
        </DropdownMenuItem>

        {/* NEW: PC Resize (CPU-only) */}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            openPCResizeDialog(pc);
          }}
        >
          <Shield className="h-4 w-4 mr-2" />
          PC Resize
        </DropdownMenuItem>

        {/* NEW: Increase Storage */}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            openStorageDialog(pc);
          }}
        >
          <Cpu className="h-4 w-4 mr-2" />
          Add Volume (SSD)
        </DropdownMenuItem>

        {!isMember && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInstance(pc);
              handleAssignUser();
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign User
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!isMember && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInstance(pc);
              handleDelete();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SmartPcDropdownMenu;
