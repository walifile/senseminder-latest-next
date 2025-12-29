import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  loading: boolean;
  fetchHistory: (isLoadMore?: boolean) => void;
}

const HistoryLoadMoreButton = ({ loading, fetchHistory }: Props) => (
  <div className="flex justify-center pt-4">
    <Button
      size="sm"
      data-testid="dashboard-billing-history-load-more"
      className="w-full gap-2 font-['Space_Grotesk'] text-sm font-bold sm:w-auto"
      onClick={() => fetchHistory(true)}
      disabled={loading}
    >
      {loading ? "Loading..." : "Load More"}
    </Button>
  </div>
);

export default HistoryLoadMoreButton;
