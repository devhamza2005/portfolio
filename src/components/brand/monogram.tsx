import { cn } from "@/lib/utils";

/**
 * Monogramme « HF » — signature visuelle du portfolio.
 * Tracé vectoriel : les deux montants du H et la barre du F partagent la même
 * grille, et le chevron `</>` rappelle le métier sans surcharger la forme.
 */
export function Monogram({
  className,
  title = "Hamza Fanoune",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={title}
      className={cn("size-9", className)}
    >
      <defs>
        <linearGradient id="hf-monogram" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>

      <rect
        x="1.25"
        y="1.25"
        width="45.5"
        height="45.5"
        rx="12"
        stroke="url(#hf-monogram)"
        strokeWidth="1.5"
        opacity="0.55"
      />

      {/* H */}
      <path
        d="M12 13v22M12 24h9M21 13v22"
        stroke="url(#hf-monogram)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* F */}
      <path
        d="M28 35V13h9M28 24h7"
        stroke="url(#hf-monogram)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Monogramme accompagné du nom — utilisé dans la navbar et le footer. */
export function BrandMark({ className, name }: { className?: string; name: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Monogram className="size-8" title={name} />
      <span className="font-display text-[0.9375rem] leading-none font-semibold tracking-tight">
        {name}
      </span>
    </span>
  );
}
