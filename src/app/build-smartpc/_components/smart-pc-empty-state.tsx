import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Plus, Monitor, GraduationCap } from "lucide-react";

type SmartPCEmptyStateProps = {
  isMember: boolean;
  searchQuery: string;
  handleShowNewPCDialog: () => void;
};

const SmartPCEmptyState: React.FC<SmartPCEmptyStateProps> = ({
  isMember,
  searchQuery,
  handleShowNewPCDialog,
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="rounded-full bg-primary/10 p-4 mb-4">
      <Monitor className="h-8 w-8 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No Sense PCs Found</h3>
    <p className="text-muted-foreground mb-6 max-w-md">
      {searchQuery
        ? "No Sense PCs match your search criteria. Try adjusting your search terms."
        : "Get started by building your first Sense PC. Check out our tutorials to learn more about Sense PC features."}
    </p>
    <div className="flex gap-4">
      {!isMember && (
        <Button onClick={handleShowNewPCDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Build Sense PC
        </Button>
      )}

      {!searchQuery && (
        <Button variant="outline" asChild>
          <Link href="/dashboard/tutorials">
            <GraduationCap className="h-4 w-4 mr-2" />
            View Tutorials
          </Link>
        </Button>
      )}
    </div>
  </div>
);

export default SmartPCEmptyState;
