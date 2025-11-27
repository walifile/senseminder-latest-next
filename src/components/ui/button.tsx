import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#3A29E7] to-[#A601BA] text-white hover:from-[#2C1FC5] hover:to-[#8C019D]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "outline-border",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sidebar:
          "bg-[#ffffff0f] rounded-[100px] border border-solid border-[#ffffff1a] text-white hover:bg-[#ffffff1a] hover:text-white",
      },
      size: {
        default: "h-12 px-7 py-3 [&_svg]:size-6",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-7 [&_svg]:size-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
