export function getRoleBadgeColor(role: string) {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    case "user":
    case "member":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
  }
}

export function getStatusColor(status?: string) {
  if (!status) return "bg-gray-500/10 text-gray-500";
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-500/10 text-green-500";
    case "pending":
      return "bg-yellow-400/20 text-yellow-700";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}
