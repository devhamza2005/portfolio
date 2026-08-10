import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const fieldBase = [
  "w-full bg-surface text-foreground placeholder:text-subtle",
  "border border-border rounded-[var(--radius-md)]",
  "transition-[border-color,box-shadow] duration-200",
  "outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/25",
];

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldBase,
        "h-11 px-3.5 text-sm",
        "file:text-foreground file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldBase, "min-h-28 resize-y px-3.5 py-3 text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-foreground flex items-center gap-1.5 text-sm font-medium",
        "peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({ className, children, ...props }: ComponentProps<"p">) {
  if (!children) return null;
  return (
    <p role="alert" className={cn("text-danger text-xs font-medium", className)} {...props}>
      {children}
    </p>
  );
}

export function FieldHint({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-subtle text-xs", className)} {...props} />;
}

export { fieldBase };
