export const getStatusBadgeClass = (status: string) => {
  const base = "px-4 py-[6px] text-base rounded-full font-medium";
  switch (status.toLowerCase()) {
    case "resolved":
      return `${base} bg-[rgba(243,156,18,0.15)] text-[#F39C12]`;
    case "closed":
      return `${base} bg-gray-200 text-gray-700`;
    case "open":
      return `${base} bg-[rgba(39,174,96,0.15)] text-[#27AE60]`;
    case "in-progress":
      return `${base} bg-blue-100 text-blue-700`;
    default:
      return `${base} bg-muted text-muted-foreground`;
  }
};
