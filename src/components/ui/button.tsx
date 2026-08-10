import { Slot } from "radix-ui";
import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "font-medium select-none",
    "transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-200",
    "ease-[var(--ease-signature)]",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-brand-contrast shadow-sm hover:bg-brand-hover hover:shadow-[var(--shadow-glow)]",
        secondary:
          "bg-elevated text-foreground border border-border hover:border-border-strong hover:bg-sunken",
        outline:
          "border border-border-strong text-foreground hover:bg-elevated hover:border-brand/50",
        ghost: "text-muted hover:bg-elevated hover:text-foreground",
        link: "text-brand underline-offset-4 hover:underline p-0 h-auto",
        danger: "bg-danger text-white hover:opacity-90",
        glass: "glass text-foreground hover:border-brand/40 hover:bg-brand-soft",
      },
      size: {
        sm: "h-9 rounded-[var(--radius-sm)] px-3.5 text-sm",
        md: "h-11 rounded-[var(--radius-md)] px-5 text-sm",
        lg: "h-13 rounded-[var(--radius-md)] px-7 text-base",
        icon: "size-10 rounded-[var(--radius-md)]",
        "icon-sm": "size-9 rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Rend l'enfant direct à la place d'un <button> (utile pour <Link>). */
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
export type { ButtonProps };
