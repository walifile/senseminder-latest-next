import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Info } from "lucide-react";

interface Props {
  content: string;
  iconClass?: string;
}

const QuickStatsTooltip = ({ content, iconClass }: Props) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Info className={cn("size-4 cursor-pointer", iconClass)} />
    </TooltipTrigger>

    <TooltipPrimitive.Portal>
      <TooltipContent
        side="top"
        sideOffset={8}
        collisionPadding={12}
        className={cn("z-[9999] max-w-xs text-xs", "font-['Space_Grotesk']")}
      >
        {content}
      </TooltipContent>
    </TooltipPrimitive.Portal>
  </Tooltip>
);

export default QuickStatsTooltip;
