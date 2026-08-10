"use client";

import { Tabs as TabsPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "bg-elevated border-border inline-flex items-center gap-1 rounded-full border p-1",
        "max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "text-muted relative rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap",
        "transition-colors duration-200 outline-none",
        "hover:text-foreground",
        "focus-visible:ring-ring focus-visible:ring-2",
        "data-[state=active]:bg-surface data-[state=active]:text-foreground",
        "data-[state=active]:shadow-[var(--shadow-sm)]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-6 outline-none",
        "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2",
        "duration-300",
        className,
      )}
      {...props}
    />
  );
}
