import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface Props {
  content: string;
  iconClass?: string;
}

const QuickStatsTooltip = ({ content, iconClass }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info
          className={cn("size-4 text-yellow-600 cursor-pointer", iconClass)}
        />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs text-xs text-yellow-700 dark:text-yellow-300"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

export default QuickStatsTooltip;
