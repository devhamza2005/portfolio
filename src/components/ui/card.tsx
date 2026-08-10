import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "relative rounded-[var(--radius-lg)] transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-signature)]",
  {
    variants: {
      variant: {
        default: "bg-surface border border-border",
        elevated: "bg-elevated border border-border shadow-[var(--shadow-md)]",
        glass: "glass",
        outline: "border border-border bg-transparent",
        gradient: "border-gradient bg-surface",
      },
      interactive: {
        true: "hover:border-border-strong hover:shadow-[var(--shadow-lg)] hover:-translate-y-1",
        false: "",
      },
    },
    defaultVariants: { variant: "default", interactive: false },
  },
);

type CardProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, interactive, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, interactive }), className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("font-display text-lg leading-tight font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-muted text-sm leading-relaxed", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />;
}

export { cardVariants };
