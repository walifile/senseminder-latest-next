import type { PC } from "@/app/build-smartpc/types";

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

export const getPcButtonConfig = ({
  pc,
  selectedUserId,
  assignments,
  pcAssigningId,
  assignSmartPC,
  unassignSmartPC,
}: {
  pc: PC;
  selectedUserId: string;
  assignments: Record<string, { instanceId: string }[]>;
  pcAssigningId: string | null;
  assignSmartPC: (pc: PC) => Promise<void>;
  unassignSmartPC: (pc: PC) => Promise<void>;
}) => {
  const assignedToCurrent = (assignments[selectedUserId] ?? []).some(
    (a) => a.instanceId === pc.instanceId
  );

  const isAssignedElsewhere = Object.keys(assignments).some(
    (assignment) =>
      assignment !== selectedUserId &&
      assignments[assignment].some((a) => a.instanceId === pc.instanceId)
  );

  const isAssigning = pcAssigningId === pc.instanceId;

  const buttonConfig: {
    text: string;
    color: string;
    onClick: (() => Promise<void>) | undefined;
    disabled: boolean;
  } = {
    text: isAssigning ? "Assigning..." : "Assign",
    color: "bg-green-500 text-white hover:bg-green-700",
    onClick: async () => {
      await assignSmartPC(pc);
    },
    disabled: isAssigning,
  };

  if (assignedToCurrent) {
    buttonConfig.text = isAssigning ? "Unassigning..." : "Unassign";
    buttonConfig.color = "bg-red-500 text-white hover:bg-red-700";
    buttonConfig.onClick = async () => {
      await unassignSmartPC(pc);
    };
    buttonConfig.disabled = isAssigning;
  } else if (isAssignedElsewhere) {
    buttonConfig.text = "Assigned to Another";
    buttonConfig.color = "bg-gray-400 text-white cursor-not-allowed";
    buttonConfig.onClick = undefined;
    buttonConfig.disabled = true;
  }

  return buttonConfig;
};
