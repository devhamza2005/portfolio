import type { ReactNode } from "react";

import { FieldError, FieldHint, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Enveloppe commune à tous les champs : libellé, indication, message d'erreur.
 *
 * Centraliser cette structure garantit que chaque champ du back-office est
 * relié à son libellé (`htmlFor`), annonce ses erreurs aux lecteurs d'écran
 * (`role="alert"` + `aria-describedby`) et présente la même mise en forme (§20).
 */
export function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
  labelAddon,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  labelAddon?: ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>
          {label}
          {required ? (
            <span className="text-danger" aria-hidden>
              *
            </span>
          ) : null}
        </Label>
        {labelAddon}
      </div>

      {children}

      {hint && !error ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

/** Attributs d'accessibilité à répandre sur le contrôle lui-même. */
export function a11yProps(id: string, hint?: string, error?: string) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  } as const;
}
