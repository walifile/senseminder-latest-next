// src/components/ui/tabs.tsx

import * as React from "react";

import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

type TabsVariant = "default" | "glowing";

type TabsVariantContextValue = {
  variant: TabsVariant;
};

const TabsVariantContext = React.createContext<TabsVariantContextValue>({
  variant: "default",
});

function useTabsVariant(explicit?: TabsVariant) {
  const ctx = React.useContext(TabsVariantContext);
  return explicit ?? ctx.variant ?? "default";
}

const Tabs = ({
  variant = "default",
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
  variant?: TabsVariant;
}) => (
  <TabsVariantContext.Provider value={{ variant }}>
    <TabsPrimitive.Root {...props} />
  </TabsVariantContext.Provider>
);

const tabsListVariants: Record<TabsVariant, string> = {
  default: cn(
    "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
  ),

  glowing: cn(
    "inline-flex w-max items-center rounded-full",
    "p-[7px] gap-[8px]",
    "bg-[rgba(37,48,240,0.07)] dark:bg-[#ffffff08]",
    "border-[none] relative",
    "before:content-[''] before:absolute before:inset-0",
    "before:p-px before:rounded-full",
    "before:[background:linear-gradient(270deg,rgba(168,1,186,0.5)_0%,rgba(37,48,240,0.5)_100%)]",
    "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
    "before:[-webkit-mask-composite:xor]",
    "before:[mask-composite:exclude]",
    "before:z-[1] before:pointer-events-none"
  ),
};

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TabsVariant;
  }
>(({ className, variant, ...props }, ref) => {
  const resolved = useTabsVariant(variant);

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants[resolved], className)}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants: Record<TabsVariant, string> = {
  default: cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
    "ring-offset-background transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "text-[#454545] dark:text-[#B9C2D5]",
    "data-[state=active]:text-white dark:data-[state=active]:text-white",
    "data-[state=active]:bg-[#2530F0] data-[state=active]:shadow-sm"
  ),

  glowing: cn(
    "relative z-[2]",
    "rounded-full px-4 py-1.5",
    "flex items-center justify-center gap-1.5",
    "text-[14px] font-medium leading-[22px] tracking-[-0.2px]",
    "ring-offset-background transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=active]:bg-[#2530F0] data-[state=active]:text-white",
    "data-[state=inactive]:bg-transparent",
    "data-[state=inactive]:text-[#454545] dark:data-[state=inactive]:text-[#B9C2D5]"
  ),
};

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: TabsVariant;
  }
>(({ className, variant, ...props }, ref) => {
  const resolved = useTabsVariant(variant);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants[resolved], className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const tabsContentVariants: Record<TabsVariant, string> = {
  default: cn(
    "mt-2 ring-offset-background",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  ),

  glowing: cn(
    "ring-offset-background",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  ),
};

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    variant?: TabsVariant;
  }
>(({ className, variant, ...props }, ref) => {
  const resolved = useTabsVariant(variant);

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(tabsContentVariants[resolved], className)}
      {...props}
    />
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
