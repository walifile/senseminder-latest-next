import { cn } from "@/lib/utils";

export const supportTabs = [
  {
    value: "tickets",
    label: "My Tickets",
    icon: "/assets/svg/support/my-tickets.svg",
  },
  {
    value: "new-ticket",
    label: "New Ticket",
    icon: "/assets/svg/support/new-ticket.svg",
  },
  {
    value: "faq",
    label: "FAQ",
    icon: "/assets/svg/support/faq.svg",
  },
];

export const supportTabTriggerClass =
  "h-full px-4 py-2 rounded-[100px] inline-flex justify-center items-center gap-1.5 text-[#454545] dark:text-[#B9C2D5] data-[state=active]:text-white";

export const supportTabIconProps = (icon: string, sizeClass?: string) => ({
  className: cn(
    "bg-current",
    sizeClass || "w-4 h-4",
    "[mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]",
    "[-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]"
  ),
  style: {
    maskImage: `url(${icon})`,
    WebkitMaskImage: `url(${icon})`,
  } as React.CSSProperties,
});
