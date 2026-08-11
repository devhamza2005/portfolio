import { cn } from "@/lib/utils";

/**
 * Fond d'ambiance : dégradés flous animés + grille technique.
 *
 * Entièrement en CSS — aucun canvas, aucun JavaScript, aucune image. Le coût
 * est donc nul sur le fil principal, et le rendu identique dans les deux
 * thèmes puisque les couleurs viennent des variables `--aurora-*`.
 *
 * `aria-hidden` : purement décoratif, rien à annoncer.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="bg-grid mask-fade absolute inset-0" />

      <div
        className="animate-aurora absolute -top-[18%] left-[8%] size-[34rem] rounded-full blur-[120px] will-change-transform"
        style={{ background: "var(--aurora-1)" }}
      />
      <div
        className="animate-aurora absolute -top-[6%] right-[4%] size-[28rem] rounded-full blur-[130px] will-change-transform [animation-delay:-7s]"
        style={{ background: "var(--aurora-2)" }}
      />
      <div
        className="animate-aurora absolute top-[38%] left-[38%] size-[22rem] rounded-full blur-[140px] will-change-transform [animation-delay:-14s]"
        style={{ background: "var(--aurora-3)" }}
      />
    </div>
  );
}
