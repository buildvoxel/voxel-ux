import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/50 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-indigo to-indigo-light text-white hover:shadow-[var(--shadow-glow-indigo)] shadow-sm",
        secondary:
          "bg-gradient-to-r from-mint to-mint-medium text-white hover:shadow-[var(--shadow-glow-mint)] shadow-sm",
        outline:
          "border-2 border-border bg-white text-text-primary hover:border-indigo hover:bg-background",
        ghost:
          "text-text-secondary hover:bg-background hover:text-text-primary",
        destructive:
          "bg-gradient-to-r from-error to-red-500 text-white hover:shadow-md shadow-sm",
        link:
          "text-indigo underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3 py-1.5 text-sm rounded-md",
        sm: "h-7 px-2 text-xs rounded",
        lg: "h-9 px-4 text-base rounded-md",
        icon: "h-8 w-8 rounded-md",
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
