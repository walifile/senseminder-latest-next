"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

const SharedFilesPanel = () => {
  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
        <Users className="h-8 w-8 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No shared files</h3>
        <p className="text-sm text-muted-foreground">
          Files shared with you will appear here
        </p>
      </div>
    </ScrollArea>
  );
};

export default SharedFilesPanel;
