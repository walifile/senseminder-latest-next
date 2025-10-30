import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Cpu,
  Plus,
  Moon,
  Trash2,
  Shield,
  MoreVertical,
  CalendarClock,
} from "lucide-react";

import type { DesktopInstance } from "../types";

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
  const plan = pc.billingPlan?.toLowerCase() || "";
  const planRestricted = !plan || plan === "daily" || plan === "monthly";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* Schedule */}
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

        {/* Idle Settings */}
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

        {/* --- Tooltip-enabled restricted actions --- */}
        <TooltipProvider>
          {/* PC Resize */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (planRestricted) return;
                  openPCResizeDialog(pc);
                }}
                className={
                  planRestricted
                    ? "opacity-50 cursor-default select-none"
                    : ""
                }
              >
                <Shield className="h-4 w-4 mr-2" />
                PC Resize
              </DropdownMenuItem>
            </TooltipTrigger>
            {planRestricted && (
              <TooltipContent side="right">
                Available only for PCs on Hourly plan
              </TooltipContent>
            )}
          </Tooltip>

          {/* Add Volume */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (planRestricted) return;
                  openStorageDialog(pc);
                }}
                className={
                  planRestricted
                    ? "opacity-50 cursor-default select-none"
                    : ""
                }
              >
                <Cpu className="h-4 w-4 mr-2" />
                Add Volume (SSD)
              </DropdownMenuItem>
            </TooltipTrigger>
            {planRestricted && (
              <TooltipContent side="right">
                Available only for PCs on Hourly plan
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Assign User */}
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

        {/* Delete */}
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
