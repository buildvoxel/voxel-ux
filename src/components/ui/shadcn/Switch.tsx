import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    size?: "default" | "small";
  }
>(({ className, size = "default", ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/50 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-indigo data-[state=unchecked]:bg-border",
      size === "default" ? "h-5 w-9" : "h-4 w-7",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform",
        size === "default"
          ? "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
          : "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
