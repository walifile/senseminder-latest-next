// src/components/ui/select.tsx

import * as React from "react";

import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@/lib/utils";

import { Check, ChevronUp, ChevronDown } from "lucide-react";


type SelectVariant = "default" | "form" | "glowingSelector" | "pill";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const selectTriggerVariants: Record<SelectVariant, string> = {
  default: cn(
    "flex w-full h-[60px] items-center justify-between rounded-lg px-5 py-4 text-base",
    "bg-[#F2EFFF] dark:bg-[#191748]",
    "ring-offset-background placeholder:text-paragraph",
    "border border-transparent",
    "focus:outline-none focus:ring-0 focus:border-[#9370db]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "[&>span]:line-clamp-1"
  ),

  pill: cn(
    "flex w-full h-14 px-5 items-center justify-between rounded-[1000px] text-base font-normal font-['Inter'] leading-6",
    "ring-offset-background placeholder:text-paragraph",
    "focus:outline-none",
    "border border-[rgba(37,48,240,0.10)] bg-[rgba(37,48,240,0.07)]",
    "dark:border-[rgba(255,255,255,0.20)] dark:bg-[rgba(255,255,255,0.04)]",
    "focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "[&>span]:line-clamp-1"
  ),

  form: cn(
    "flex w-full h-[52px] items-center justify-between rounded-[10px] pr-4",
    "text-[16px] [&>span]:line-clamp-1",
    "bg-[#F4F1FF] dark:bg-[#ffffff0f]",
    "border border-[#2530F0]/20 dark:border-[#ffffff1a]",
    "text-slate-900 dark:text-white",
    "focus-visible:outline-none focus-visible:border-[#5f4bf6]",
    "disabled:cursor-not-allowed disabled:opacity-50"
  ),


  glowingSelector: cn(
    "relative flex w-full items-center justify-between",
    "min-h-[54px] rounded-[8px] px-[20px] py-[15px]",
    "text-[16px] [&>span]:line-clamp-1",
    "bg-[rgba(37,48,240,0.07)] text-[color:var(--black,#020816)]",
    "dark:bg-[#2A2067] dark:text-white",
    "border border-[#2530F0]/20 dark:border-white/10",
    "focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "before:content-[''] before:absolute before:inset-0 before:rounded-[8px]",
    "before:pointer-events-none",
    "before:p-px",
    "before:[background:linear-gradient(135deg,#8086F3,#4C55F8,#D971FF)]",
    "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
    "before:[-webkit-mask-composite:xor]",
    "before:[mask-composite:exclude]",
    "before:opacity-0",
    "focus-visible:before:opacity-100",
    "data-[state=open]:before:opacity-100"
  ),
};

const selectContentVariants: Record<SelectVariant, string> = {
  default: cn(
    "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border",
    "bg-[#F2EFFF] dark:bg-[#191748]",
    "shadow-md",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
  ),

  pill: cn(
    "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border",
    "bg-[#F2EFFF] dark:bg-[#191748]",
    "shadow-md",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
  ),

  form: cn(
    "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-[10px] border",
    "bg-[#F4F1FF] dark:bg-[#191748]",
    "border border-[#2530F0]/20 dark:border-[#ffffff1a]",
    "shadow-md",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
  ),

  glowingSelector: cn(
    "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-[8px] border",
    "bg-[#F4F1FF] dark:bg-[#191748]",
    "border border-[#2530F0]/20 dark:border-white/10",
    "shadow-md",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
  ),
};

type SelectTriggerProps =
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    variant?: SelectVariant;
  };

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, variant = "default", ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(selectTriggerVariants[variant], className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      {/* explicit color so it matches develop behavior everywhere */}
      <ChevronDown className="size-6 text-[#020816] dark:text-[#B9C2D5]" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

type SelectContentProps =
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    variant?: SelectVariant;
  };

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", variant = "default", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        selectContentVariants[variant],
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      "focus:bg-[#e1dcf8] dark:focus:bg-[#0d0b36] focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectValue,
  SelectContent,
  SelectTrigger,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
