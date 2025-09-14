import React from "react";

interface Props {
  loading: boolean;
  fetchHistory: (isLoadMore?: boolean) => void;
}

const HistoryLoadMoreButton = ({ loading, fetchHistory }: Props) => (
  <div className="flex justify-center pt-4">
    <button
      className="text-sm px-4 py-2 rounded-md bg-primary text-white disabled:opacity-50"
      onClick={() => fetchHistory(true)}
      disabled={loading}
    >
      {loading ? "Loading..." : "Load More"}
    </button>
  </div>
);

export default HistoryLoadMoreButton;
