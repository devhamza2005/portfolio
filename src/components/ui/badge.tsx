import { Slot } from "radix-ui";
import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
    "transition-colors duration-200",
    "[&_svg]:pointer-events-none [&_svg]:size-3.5",
  ],
  {
    variants: {
      variant: {
        default: "border-border bg-elevated text-muted",
        brand: "border-brand/25 bg-brand-soft text-brand",
        accent: "border-accent/25 bg-accent-soft text-accent",
        ember: "border-ember/25 bg-ember-soft text-ember",
        success: "border-success/25 bg-success/10 text-success",
        warning: "border-warning/25 bg-warning/10 text-warning",
        danger: "border-danger/25 bg-danger/10 text-danger",
        outline: "border-border-strong bg-transparent text-muted",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.6875rem]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3.5 py-1.5 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

export function Badge({ className, variant, size, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span";
  return <Comp className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
