import React from "react";

import { cn } from "@/lib/utils";

type ChangePreviewProps = {
  oldValue: React.ReactNode;
  newValue: React.ReactNode;
  hasChanged: boolean;
};

const FieldChangePreview = ({
  oldValue,
  newValue,
  hasChanged,
}: ChangePreviewProps) => (
  <div className="flex items-center gap-1 text-[11px]">
    <span className="rounded-full bg-muted px-2 py-0.5">{oldValue}</span>
    <span className="text-muted-foreground">→</span>
    <span
      className={cn(
        "rounded-full px-2 py-0.5",
        hasChanged
          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
          : "bg-muted text-muted-foreground"
      )}
    >
      {newValue}
    </span>
    {!hasChanged && (
      <span className="ml-2 text-[10px] text-muted-foreground">No change</span>
    )}
  </div>
);

export default FieldChangePreview;
