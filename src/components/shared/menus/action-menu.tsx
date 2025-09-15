import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";

type ActionItem = {
  label: string;
  icon?: LucideIcon;
  isDestructive?: boolean;
  onClick: () => void;
};

interface MoreActionsMenuProps {
  actions: ActionItem[];
}

export default function ActionsMenu({ actions }: MoreActionsMenuProps) {
  console.log(actions);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            className={cn(action.isDestructive && "text-destructive")}
          >
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
