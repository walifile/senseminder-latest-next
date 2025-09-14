import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Plus, List, Search, LayoutGrid } from "lucide-react";

type Props = {
  isMember: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  handleShowNewPCDialog: () => void;
};

const SmartPcToolbar = ({
  isMember,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  handleShowNewPCDialog,
}: Props) => (
  <div className="flex flex-col gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold">Sense PCs</h1>
      <p className="text-muted-foreground">Manage your Cloud Computer</p>
    </div>
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search PCs by name, description, or region..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center border rounded-lg">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="sm"
          className="rounded-r-none"
          onClick={() => setViewMode("grid")}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="sm"
          className="rounded-l-none"
          onClick={() => setViewMode("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      {!isMember && (
        <Button onClick={handleShowNewPCDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Build Sense PC
        </Button>
      )}
    </div>
  </div>
);

export default SmartPcToolbar;
