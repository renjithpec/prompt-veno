import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn("tap w-full rounded-card border border-border bg-foreground/5 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent/60 focus:ring-2 focus:ring-accent/20", className)}
    {...props}
  />
));

Input.displayName = "Input";
