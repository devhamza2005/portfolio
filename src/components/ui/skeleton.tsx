import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** État de chargement (§21). */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("bg-elevated shimmer rounded-[var(--radius-md)]", className)}
      {...props}
    />
  );
}

type StateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/** État vide (§21) — liste sans contenu. */
export function EmptyState({ icon, title, description, action, className }: StateProps) {
  return (
    <div
      className={cn(
        "border-border flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="bg-elevated text-subtle flex size-12 items-center justify-center rounded-full [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-foreground text-base font-semibold">{title}</p>
      {description ? <p className="text-muted max-w-sm text-sm">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** État d'erreur (§21). */
export function ErrorState({ icon, title, description, action, className }: StateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "border-danger/30 bg-danger/5 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? <div className="text-danger [&_svg]:size-6">{icon}</div> : null}
      <p className="font-display text-foreground text-base font-semibold">{title}</p>
      {description ? <p className="text-muted max-w-sm text-sm">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
