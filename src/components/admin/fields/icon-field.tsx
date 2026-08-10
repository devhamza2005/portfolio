"use client";

import { Check, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Icon } from "@/components/admin/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { FieldShell } from "./field-shell";

/**
 * Sélecteur d'icône.
 *
 * La liste proposée est volontairement restreinte à un jeu d'icônes pertinent
 * pour un portfolio : parcourir les ~1 500 icônes de Lucide alourdirait la page
 * sans rendre le choix plus facile. La saisie libre reste possible pour
 * utiliser n'importe quelle autre icône.
 */
const SUGGESTED_ICONS = [
  // Développement
  "Code2", "Terminal", "Braces", "GitBranch", "GitPullRequestArrow", "Bug", "Blocks", "Component",
  // Backend et données
  "Server", "Database", "Cloud", "Network", "Cpu", "HardDrive", "Layers", "Boxes",
  // Frontend
  "Layout", "MonitorSmartphone", "Smartphone", "Palette", "Figma", "MousePointerClick",
  // Sécurité
  "ShieldCheck", "KeyRound", "Lock", "Fingerprint", "UserCheck", "ScrollText",
  // DevOps
  "Container", "Workflow", "Settings2", "Rocket", "Gauge", "Activity", "RefreshCw",
  // Métier et documents
  "FileSignature", "FolderTree", "FileText", "Files", "Wallet", "Receipt", "Hash", "ClipboardCheck",
  // Interface
  "LayoutDashboard", "ChartNoAxesColumn", "ChartPie", "TrendingUp", "BellRing", "Inbox", "Search",
  // Réussites
  "Trophy", "Award", "Medal", "Star", "Sparkles", "Target", "Flame", "BadgeCheck", "GraduationCap",
  // Humain
  "Users", "UserRound", "Handshake", "MessagesSquare", "Presentation", "Lightbulb", "Puzzle",
  // Divers
  "Globe", "MapPin", "CalendarDays", "CalendarClock", "Clock", "Mail", "Phone", "Link2",
  "ListChecks", "ListTodo", "SquareParking", "ScanLine", "DoorOpen", "Nfc", "Wrench", "Tags",
] as const;

export function IconFieldInput({
  id,
  label,
  hint,
  error,
  required,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return SUGGESTED_ICONS as readonly string[];
    return SUGGESTED_ICONS.filter((name) => name.toLowerCase().includes(term));
  }, [query]);

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <div className="flex items-center gap-2">
        <span
          className="border-border bg-elevated text-muted grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] border"
          aria-hidden
        >
          {value ? <Icon name={value} className="size-5" /> : <span className="text-xs">—</span>}
        </span>

        <Input
          id={id}
          value={value}
          disabled={disabled}
          placeholder="Nom d'icône Lucide"
          aria-describedby={hint ? `${id}-hint` : undefined}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="font-mono text-[0.8125rem]"
        />

        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={() => onChange("")}
            aria-label="Retirer l'icône"
          >
            <X />
          </Button>
        ) : null}

        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          Parcourir
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choisir une icône</DialogTitle>
            <DialogDescription>
              Sélection d&apos;icônes adaptées à un portfolio. Vous pouvez aussi saisir le nom de
              n&apos;importe quelle icône Lucide dans le champ.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="text-subtle pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrer les icônes…"
              className="pl-9"
              aria-label="Filtrer les icônes"
            />
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {results.length === 0 ? (
              <EmptyState
                title="Aucune icône trouvée"
                description="Essayez un autre terme, ou saisissez directement le nom de l'icône."
              />
            ) : (
              <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {results.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(name);
                        setOpen(false);
                      }}
                      title={name}
                      className={cn(
                        "border-border hover:border-brand hover:bg-brand-soft relative flex w-full flex-col",
                        "items-center gap-1.5 rounded-[var(--radius-md)] border px-2 py-3 transition-colors",
                        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                        value === name && "border-brand bg-brand-soft",
                      )}
                    >
                      {value === name ? (
                        <Check className="text-brand absolute top-1 right-1 size-3" />
                      ) : null}
                      <Icon name={name} className="size-5" />
                      <span className="text-subtle w-full truncate text-center text-[0.625rem]">
                        {name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </FieldShell>
  );
}
