import React from "react";
import Link from "next/link";
import { Monitor, Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
;

type SmartPCEmptyStateProps = {
  searchQuery: string;
  setShowNewPCDialog: (value: boolean) => void;
  isError?: boolean;
};

const SmartPCEmptyState: React.FC<SmartPCEmptyStateProps> = ({
  searchQuery,
  setShowNewPCDialog,
}) => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const isMember = userRole === "member";
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <Monitor className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No SmartPCs Found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {searchQuery
          ? "No SmartPCs match your search criteria. Try adjusting your search terms."
          : "Get started by building your first SmartPC. Check out our tutorials to learn more about SmartPC features."}
      </p>
      <div className="flex gap-4">
        {/* <Button onClick={() => setShowNewPCDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Build SmartPC
        </Button> */}
        {!isMember && (
          <Button onClick={() => setShowNewPCDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Build SmartPC
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
};

export default SmartPCEmptyState;
