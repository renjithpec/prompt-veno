"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({ value, onValueChange, children }: SelectPrimitive.SelectProps) {
  return <SelectPrimitive.Root value={value} onValueChange={onValueChange}>{children}</SelectPrimitive.Root>;
}

export function SelectTrigger({ className, children }: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger className={cn("tap flex w-full items-center justify-between rounded-card border border-border bg-foreground/5 px-3 text-sm text-foreground outline-none focus:border-accent/60", className)}>
      {children}
      <SelectPrimitive.Icon><ChevronDown className="h-4 w-4" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export const SelectValue = SelectPrimitive.Value;

export function SelectContent({ className, children }: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className={cn("z-50 min-w-40 overflow-hidden rounded-card border border-border bg-panel p-1 text-foreground shadow-xl", className)}>
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, value }: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item value={value} className={cn("relative flex min-h-10 cursor-pointer select-none items-center rounded-md px-8 text-sm outline-none hover:bg-foreground/10 data-[highlighted]:bg-foreground/10", className)}>
      <SelectPrimitive.ItemIndicator className="absolute left-2"><Check className="h-4 w-4 text-accent" /></SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
