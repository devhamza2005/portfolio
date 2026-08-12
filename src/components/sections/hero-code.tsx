"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Visuel du Hero : une fenêtre de code flottante.
 *
 * Le choix est délibéré — plutôt qu'une illustration générique, un extrait de
 * contrôleur Spring Boot dit immédiatement au visiteur quel développeur il a
 * en face. Le code affiché correspond réellement à la stack du portfolio.
 *
 * L'extrait est décoratif (`aria-hidden`) : il ne porte aucune information que
 * le texte du Hero ne donne déjà.
 */

type Line = { indent: number; parts: { text: string; tone?: Tone }[] };
type Tone = "keyword" | "annotation" | "type" | "string" | "comment" | "fn";

/**
 * Coloration syntaxique de la fenêtre.
 *
 * Les deux tons qui étaient bleus (`type`, `fn`) passent dans la famille
 * chaude pour rejoindre l'identité rouge. Les autres restent inchangés :
 * un thème de code a besoin de teintes distinctes pour rester lisible, et
 * l'ambre, le vert et le violet ne relèvent pas de l'identité bleue.
 */
const TONE_CLASS: Record<Tone, string> = {
  keyword: "text-[#c792ea]",
  annotation: "text-[#ffcb6b]",
  type: "text-[#ff8a80]",
  string: "text-[#c3e88d]",
  comment: "text-subtle italic",
  fn: "text-[#f48fb1]",
};

const CODE: Line[] = [
  { indent: 0, parts: [{ text: "@RestController", tone: "annotation" }] },
  {
    indent: 0,
    parts: [
      { text: "@RequestMapping", tone: "annotation" },
      { text: "(" },
      { text: '"/api/conventions"', tone: "string" },
      { text: ")" },
    ],
  },
  {
    indent: 0,
    parts: [
      { text: "public class ", tone: "keyword" },
      { text: "ConventionController", tone: "type" },
      { text: " {" },
    ],
  },
  { indent: 1, parts: [{ text: "" }] },
  {
    indent: 1,
    parts: [
      { text: "@PreAuthorize", tone: "annotation" },
      { text: "(" },
      { text: '"hasRole(\'VALIDATEUR\')"', tone: "string" },
      { text: ")" },
    ],
  },
  {
    indent: 1,
    parts: [
      { text: "@PostMapping", tone: "annotation" },
      { text: "(" },
      { text: '"/{id}/valider"', tone: "string" },
      { text: ")" },
    ],
  },
  {
    indent: 1,
    parts: [
      { text: "public ", tone: "keyword" },
      { text: "ResponseEntity", tone: "type" },
      { text: "<" },
      { text: "Convention", tone: "type" },
      { text: "> " },
      { text: "valider", tone: "fn" },
      { text: "(" },
      { text: "@PathVariable", tone: "annotation" },
      { text: " UUID id) {" },
    ],
  },
  {
    indent: 2,
    parts: [
      { text: "return ", tone: "keyword" },
      { text: "ResponseEntity", tone: "type" },
      { text: "." },
      { text: "ok", tone: "fn" },
      { text: "(workflow." },
      { text: "valider", tone: "fn" },
      { text: "(id));" },
    ],
  },
  { indent: 1, parts: [{ text: "}" }] },
  { indent: 0, parts: [{ text: "}" }] },
];

export function HeroCode({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div className={cn("relative", className)} aria-hidden>
      {/* Halo sous la fenêtre */}
      <div
        className="absolute -inset-6 rounded-[var(--radius-3xl)] blur-3xl"
        style={{ background: "var(--aurora-1)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "glass relative overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)]",
          !reduced && "animate-float",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Barre de titre */}
        <div className="border-border/60 flex items-center gap-2 border-b px-4 py-3">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="text-subtle ml-2 font-mono text-xs">ConventionController.java</span>
        </div>

        {/* Code */}
        <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.6875rem] leading-[1.9] sm:px-5 sm:text-xs">
          <code>
            {CODE.map((line, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, x: reduced ? 0 : -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: reduced ? 0 : 0.6 + index * 0.075,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex"
              >
                <span className="text-subtle/50 w-6 shrink-0 select-none">{index + 1}</span>
                <span style={{ paddingLeft: `${line.indent * 1.25}rem` }}>
                  {line.parts.map((part, position) => (
                    <span key={position} className={part.tone ? TONE_CLASS[part.tone] : "text-muted"}>
                      {part.text}
                    </span>
                  ))}
                </span>
              </motion.span>
            ))}

            {/* Curseur clignotant */}
            <span className="flex">
              <span className="text-subtle/50 w-6 shrink-0 select-none">{CODE.length + 1}</span>
              <span className="bg-brand animate-caret inline-block h-3.5 w-[7px] translate-y-0.5" />
            </span>
          </code>
        </pre>
      </motion.div>
    </div>
  );
}
