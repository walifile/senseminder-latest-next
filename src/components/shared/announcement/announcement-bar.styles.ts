import type { LucideIcon } from "lucide-react";

import { Info, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

import type { AnnouncementSeverity } from "./announcement-bar.types";

export type SeverityStyle = {
  icon: LucideIcon;
  dotClass: string;
  iconClass: string;
  bannerClass: string;
  overlayClass: string;
  ctaClass: string;
  dismissClass: string;
};

export const styleBySeverity: Record<AnnouncementSeverity, SeverityStyle> = {
  normal: {
    icon: Info,
    dotClass: "bg-[#BA25F0] dark:bg-[#8086F3]",
    iconClass: "text-[#4C55F8] dark:text-[#C7CDFF]",
    bannerClass:
      "border-b border-[rgba(37,48,240,0.16)] bg-[rgba(255,255,255,0.96)] dark:border-[rgba(255,255,255,0.1)] dark:bg-[rgba(1,5,38,0.92)]",
    overlayClass:
      "bg-[linear-gradient(270deg,rgba(186,37,240,0.08)_0%,rgba(37,48,240,0.06)_46%,rgba(128,134,243,0.1)_100%)] dark:bg-[linear-gradient(270deg,rgba(186,37,240,0.14)_0%,rgba(37,48,240,0.12)_46%,rgba(128,134,243,0.12)_100%)]",
    ctaClass:
      "bg-[linear-gradient(270deg,#BA25F0_0%,#2530F0_46%,#8086F3_100%)] text-white shadow-[0_6px_20px_rgba(37,48,240,0.35)]",
    dismissClass:
      "border-[#4C55F8]/35 text-[#3D47D8] hover:bg-[#4C55F8]/10 hover:text-[#2530F0] dark:border-[#8086F3]/35 dark:text-[#C7CDFF] dark:hover:bg-[#8086F3]/15 dark:hover:text-[#E5E8FF]",
  },
  info: {
    icon: Info,
    dotClass: "bg-[#0EA5E9]",
    iconClass: "text-[#036A91] dark:text-[#BFEFFF]",
    bannerClass:
      "border-b border-[#0EA5E9]/28 bg-[rgba(236,249,255,0.96)] dark:border-[#38BDF8]/35 dark:bg-[rgba(6,36,56,0.86)]",
    overlayClass:
      "bg-[linear-gradient(90deg,rgba(14,165,233,0.18)_0%,rgba(14,165,233,0)_45%,rgba(56,189,248,0.24)_100%)] dark:bg-[linear-gradient(90deg,rgba(56,189,248,0.22)_0%,rgba(56,189,248,0)_45%,rgba(14,165,233,0.32)_100%)]",
    ctaClass:
      "bg-[linear-gradient(90deg,#0EA5E9_0%,#38BDF8_55%,#0284C7_100%)] text-[#062338] shadow-[0_6px_20px_rgba(14,165,233,0.35)] dark:text-[#05263C]",
    dismissClass:
      "border-[#0EA5E9]/35 text-[#036A91] hover:bg-[#0EA5E9]/10 hover:text-[#075985] dark:border-[#38BDF8]/35 dark:text-[#BFEFFF] dark:hover:bg-[#38BDF8]/15 dark:hover:text-[#DBF5FF]",
  },
  success: {
    icon: CheckCircle2,
    dotClass: "bg-[#22C55E]",
    iconClass: "text-[#166534] dark:text-[#CFFFD9]",
    bannerClass:
      "border-b border-[#22C55E]/28 bg-[rgba(238,253,241,0.96)] dark:border-[#4ADE80]/35 dark:bg-[rgba(6,46,24,0.86)]",
    overlayClass:
      "bg-[linear-gradient(90deg,rgba(34,197,94,0.18)_0%,rgba(34,197,94,0)_45%,rgba(74,222,128,0.24)_100%)] dark:bg-[linear-gradient(90deg,rgba(74,222,128,0.22)_0%,rgba(74,222,128,0)_45%,rgba(34,197,94,0.32)_100%)]",
    ctaClass:
      "bg-[linear-gradient(90deg,#22C55E_0%,#4ADE80_55%,#16A34A_100%)] text-[#08331A] shadow-[0_6px_20px_rgba(34,197,94,0.35)] dark:text-[#082A16]",
    dismissClass:
      "border-[#22C55E]/35 text-[#166534] hover:bg-[#22C55E]/10 hover:text-[#14532D] dark:border-[#4ADE80]/35 dark:text-[#CFFFD9] dark:hover:bg-[#4ADE80]/15 dark:hover:text-[#E5FFEB]",
  },
  warning: {
    icon: AlertTriangle,
    dotClass: "bg-[#D97706]",
    iconClass: "text-[#B45309] dark:text-[#FFD79B]",
    bannerClass:
      "border-b border-[#D97706]/35 bg-[#FFF8E8]/95 dark:border-[#F6B45F]/30 dark:bg-[rgba(48,34,9,0.82)]",
    overlayClass:
      "bg-[linear-gradient(90deg,rgba(245,158,11,0.2)_0%,rgba(245,158,11,0)_45%,rgba(217,119,6,0.25)_100%)] dark:bg-[linear-gradient(90deg,rgba(246,180,95,0.25)_0%,rgba(246,180,95,0)_45%,rgba(217,119,6,0.3)_100%)]",
    ctaClass:
      "bg-[linear-gradient(90deg,#F59E0B_0%,#FBBF24_55%,#D97706_100%)] text-[#2A1600] shadow-[0_6px_20px_rgba(217,119,6,0.35)] dark:text-[#261500]",
    dismissClass:
      "border-[#D97706]/35 text-[#9A5A08] hover:bg-[#D97706]/10 hover:text-[#7A4500] dark:border-[#F6B45F]/35 dark:text-[#FFD79B] dark:hover:bg-[#F6B45F]/15 dark:hover:text-[#FFE4B6]",
  },
  critical: {
    icon: ShieldAlert,
    dotClass: "bg-[#EF4444]",
    iconClass: "text-[#991B1B] dark:text-[#FFD2D2]",
    bannerClass:
      "border-b border-[#EF4444]/30 bg-[rgba(255,240,240,0.96)] dark:border-[#F87171]/35 dark:bg-[rgba(72,10,10,0.86)]",
    overlayClass:
      "bg-[linear-gradient(90deg,rgba(239,68,68,0.18)_0%,rgba(239,68,68,0)_45%,rgba(248,113,113,0.24)_100%)] dark:bg-[linear-gradient(90deg,rgba(248,113,113,0.22)_0%,rgba(248,113,113,0)_45%,rgba(239,68,68,0.33)_100%)]",
    ctaClass:
      "bg-[linear-gradient(90deg,#EF4444_0%,#F87171_55%,#DC2626_100%)] text-[#3A0B0B] shadow-[0_6px_20px_rgba(239,68,68,0.35)] dark:text-[#330909]",
    dismissClass:
      "border-[#EF4444]/35 text-[#991B1B] hover:bg-[#EF4444]/10 hover:text-[#7F1D1D] dark:border-[#F87171]/35 dark:text-[#FFD2D2] dark:hover:bg-[#F87171]/15 dark:hover:text-[#FFE1E1]",
  },
};
