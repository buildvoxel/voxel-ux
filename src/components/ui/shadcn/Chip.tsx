import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo/15 text-indigo",
        secondary:
          "border-transparent bg-mint/15 text-mint-dark",
        outline:
          "border-border text-text-secondary",
        success:
          "border-transparent bg-success-bg text-success",
        warning:
          "border-transparent bg-warning-bg text-warning",
        error:
          "border-transparent bg-error-bg text-error",
      },
      size: {
        default: "h-5 text-xs",
        sm: "h-4 text-[10px] px-1.5",
        lg: "h-6 text-sm px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  label?: string;
  onDelete?: () => void;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, size, label, children, onDelete, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(chipVariants({ variant, size }), className)}
        {...props}
      >
        {label || children}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-1 rounded-full p-0.5 hover:bg-black/10 transition-colors"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
