import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useState } from "react";

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

const QuickStatsTooltip = ({ content, iconClass }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen} delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center"
          aria-label="More info"
        >
          <Info className={cn("size-4 cursor-pointer", iconClass)} />
        </button>
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
};

export default QuickStatsTooltip;
