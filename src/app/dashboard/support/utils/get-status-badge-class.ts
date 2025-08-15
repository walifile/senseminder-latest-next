export const getStatusBadgeClass = (status: string) => {
  const base = "px-2 py-0.5 text-xs rounded-full font-medium";
  switch (status.toLowerCase()) {
    case "resolved":
      return `${base} bg-yellow-100 text-yellow-800`;
    case "closed":
      return `${base} bg-gray-200 text-gray-700`;
    case "open":
      return `${base} bg-green-100 text-green-700`;
    case "in-progress":
      return `${base} bg-blue-100 text-blue-700`;
    default:
      return `${base} bg-muted text-muted-foreground`;
  }
};
