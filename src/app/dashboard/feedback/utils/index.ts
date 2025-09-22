import type { FeedbackType, FeedbackStatus } from "../types";

export function getStatusColor(status: FeedbackStatus) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-400/20 text-yellow-700";
    case "in-progress":
      return "bg-blue-500/10 text-blue-500";
    case "resolved":
      return "bg-green-500/10 text-green-500";
    case "rejected":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}

export function getTypeBadgeColor(type: FeedbackType) {
  switch (type.toLowerCase()) {
    case "bug":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    case "feature":
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    case "general":
      return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
  }
}
