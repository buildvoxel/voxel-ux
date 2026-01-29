import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    const id = React.useId();

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            "flex h-8 w-full rounded-md border-2 bg-surface px-3 py-1.5 text-sm text-text-primary transition-all duration-150",
            "border-border placeholder:text-text-tertiary",
            "focus:outline-none focus:border-indigo focus:ring-4 focus:ring-indigo/10",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background",
            error && "border-error focus:border-error focus:ring-error/10",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p
            className={cn(
              "text-xs",
              error ? "text-error" : "text-text-tertiary"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
