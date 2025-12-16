import * as React from "react";

import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

// Define the TabsTrigger component with correct types for className, value, and variant props
interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  variant?: "default" | "gradient"; // Custom variant prop
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, variant = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50  text-[#454545] dark:text-[#B9C2D5]";
    
    const variantClasses = variant === "gradient" 
      ? "px-4 py-1.5 text-[#71758A] bg-blue-700/5 hover:bg-blue-700/10 dark:text-[#91939B] dark:bg-white/10 dark:hover:bg-white/20 rounded-full text-base font-normal data-[state=active]:font-medium data-[state=active]:bg-gradient-to-l data-[state=active]:from-blue-700 data-[state=active]:to-fuchsia-700 data-[state=active]:text-white dark:data-[state=active]:text-white" 
      : "data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-[#2530F0] data-[state=active]:shadow-sm";

    return (
      <TabsPrimitive.Trigger
        ref={ref}
        value={value}
        className={cn(baseClasses, variantClasses, className)}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
