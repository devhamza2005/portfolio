"use client";

import { Check, Loader2, Search, Trash2, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { fieldLabel } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";
import {
  deleteTranslationAction,
  upsertTranslationAction,
} from "@/server/actions/translation.actions";
import type { TranslationDashboard, TranslationRow } from "@/server/queries/translation-admin";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GESTION DES TRADUCTIONS — back-office
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Un écran, trois colonnes de lecture : la source française, l'anglais et
 * l'arabe. Le français est en LECTURE SEULE — il vit dans sa colonne d'origine
 * et reste la source de vérité ; l'y modifier depuis cet écran créerait deux
 * chemins d'écriture concurrents pour la même donnée.
 *
 * Ce composant reste francophone, comme tout le back-office.
 *
 * Le filtrage se fait en mémoire : les quelques centaines de lignes sont déjà
 * chargées côté serveur, une requête par frappe serait du gaspillage.
 */

type Statut = "complet" | "partiel" | "manquant";

function statutDe(row: TranslationRow): Statut {
  const en = Boolean(row.en?.trim());
  const ar = Boolean(row.ar?.trim());
  if (en && ar) return "complet";
  if (en || ar) return "partiel";
  return "manquant";
}

const STATUT_BADGE: Record<Statut, { label: string; variant: "success" | "warning" | "danger" }> = {
  complet: { label: "Complet", variant: "success" },
  partiel: { label: "Partiel", variant: "warning" },
  manquant: { label: "Manquant", variant: "danger" },
};

const SELECT_CLASS =
  "border-border bg-surface text-foreground focus-visible:ring-ring h-9 rounded-[var(--radius-sm)] " +
  "border px-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none";

export function TranslationManager({ data }: { data: TranslationDashboard }) {
  const [entite, setEntite] = useState("all");
  const [langue, setLangue] = useState<"all" | "en" | "ar">("all");
  const [statut, setStatut] = useState<"all" | Statut>("all");
  const [recherche, setRecherche] = useState("");
  const [ouvert, setOuvert] = useState<string | null>(null);

  const entites = useMemo(
    () => data.progress.filter((item) => item.total > 0),
    [data.progress],
  );

  const visibles = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return data.rows.filter((row) => {
      if (entite !== "all" && row.entity !== entite) return false;

      // Le filtre de langue isole ce qu'il reste à faire DANS cette langue.
      if (langue !== "all") {
        const valeur = langue === "en" ? row.en : row.ar;
        if (statut === "manquant" && valeur?.trim()) return false;
        if (statut === "complet" && !valeur?.trim()) return false;
      } else if (statut !== "all" && statutDe(row) !== statut) {
        return false;
      }

      if (!terme) return true;
      return (
        row.itemTitle.toLowerCase().includes(terme) ||
        row.fr.toLowerCase().includes(terme) ||
        row.field.toLowerCase().includes(terme) ||
        (row.en ?? "").toLowerCase().includes(terme) ||
        (row.ar ?? "").toLowerCase().includes(terme)
      );
    });
  }, [data.rows, entite, langue, statut, recherche]);

  return (
    <div className="space-y-6">
      <ProgressionGlobale data={data} />

      {/* ── Filtres ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="text-subtle pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder="Rechercher dans le français, l'anglais ou l'arabe…"
            className="pl-9"
            aria-label="Rechercher une traduction"
          />
        </div>

        <select
          value={entite}
          onChange={(event) => setEntite(event.target.value)}
          aria-label="Filtrer par entité"
          className={SELECT_CLASS}
        >
          <option value="all">Toutes les entités</option>
          {entites.map((item) => (
            <option key={item.entity} value={item.entity}>
              {item.label} ({item.total})
            </option>
          ))}
        </select>

        <select
          value={langue}
          onChange={(event) => setLangue(event.target.value as typeof langue)}
          aria-label="Filtrer par langue"
          className={SELECT_CLASS}
        >
          <option value="all">FR · EN · AR</option>
          <option value="en">Anglais</option>
          <option value="ar">Arabe</option>
        </select>

        <select
          value={statut}
          onChange={(event) => setStatut(event.target.value as typeof statut)}
          aria-label="Filtrer par statut"
          className={SELECT_CLASS}
        >
          <option value="all">Tous les statuts</option>
          <option value="complet">Complet</option>
          <option value="partiel">Partiel</option>
          <option value="manquant">Manquant</option>
        </select>
      </div>

      <p aria-live="polite" className="text-subtle text-sm">
        {visibles.length} champ{visibles.length > 1 ? "s" : ""} affiché
        {visibles.length > 1 ? "s" : ""} sur {data.rows.length}
      </p>

      {/* ── Liste ────────────────────────────────────────────────────── */}
      {visibles.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted text-sm">Aucun champ ne correspond à ces filtres.</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {visibles.map((row) => {
            const cle = `${row.entity}|${row.entityId}|${row.field}`;
            return (
              <li key={cle}>
                <LigneTraduction
                  row={row}
                  ouvert={ouvert === cle}
                  onToggle={() => setOuvert(ouvert === cle ? null : cle)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Progression
   ───────────────────────────────────────────────────────────────────────── */

function pourcent(fait: number, total: number): number {
  return total === 0 ? 100 : Math.round((fait / total) * 100);
}

function ProgressionGlobale({ data }: { data: TranslationDashboard }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Card className="p-5">
        <h2 className="font-display mb-4 text-sm font-semibold">Progression globale</h2>

        <Jauge label="Français (source)" fait={data.totals.total} total={data.totals.total} />
        <Jauge label="Anglais" fait={data.totals.en} total={data.totals.total} />
        <Jauge label="العربية" fait={data.totals.ar} total={data.totals.total} />

        <p className="text-subtle mt-4 text-xs leading-relaxed">
          {data.totals.total} champs éditoriaux à traduire par langue. Un champ non traduit
          retombe automatiquement sur le français.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="font-display mb-4 text-sm font-semibold">Indexation par les moteurs</h2>

        <ul className="space-y-3">
          {data.indexability.map((item) => (
            <li key={item.locale} className="text-sm">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-medium uppercase">/{item.locale}</span>
                {item.noindex ? (
                  <Badge variant="warning" size="sm">
                    noindex
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    indexée
                  </Badge>
                )}
              </div>
              <p className="text-subtle text-xs">
                Palier A (SEO) {Math.round(item.seoRatio * 100)} % / 100 % · Palier B{" "}
                {Math.round(item.bodyRatio * 100)} % / 90 %
                {item.eligible ? " — seuils atteints" : ""}
              </p>
            </li>
          ))}
        </ul>

        <p className="text-subtle mt-4 text-xs leading-relaxed">
          Atteindre les seuils ne lève pas le <code>noindex</code> automatiquement : ouvrir une
          langue à l&apos;indexation reste une décision manuelle.
        </p>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <h2 className="font-display mb-4 text-sm font-semibold">Progression par entité</h2>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.progress
            .filter((item) => item.total > 0)
            .map((item) => (
              <div key={item.entity}>
                <p className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-subtle font-mono tabular-nums">
                    EN {pourcent(item.en, item.total)}% · AR {pourcent(item.ar, item.total)}%
                  </span>
                </p>
                <div className="bg-elevated h-1 overflow-hidden rounded-full">
                  <div
                    className="bg-brand h-full rounded-full transition-[width]"
                    style={{ width: `${pourcent(item.en + item.ar, item.total * 2)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}

function Jauge({ label, fait, total }: { label: string; fait: number; total: number }) {
  const valeur = pourcent(fait, total);
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span>{label}</span>
        <span className="text-subtle font-mono tabular-nums">
          {fait} / {total} · {valeur} %
        </span>
      </p>
      <div
        className="bg-elevated h-1.5 overflow-hidden rounded-full"
        role="meter"
        aria-valuenow={valeur}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--hf-gradient-via),var(--hf-gradient-from))]"
          style={{ width: `${valeur}%` }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Ligne + éditeur
   ───────────────────────────────────────────────────────────────────────── */

function LigneTraduction({
  row,
  ouvert,
  onToggle,
}: {
  row: TranslationRow;
  ouvert: boolean;
  onToggle: () => void;
}) {
  const [en, setEn] = useState(row.en ?? "");
  const [ar, setAr] = useState(row.ar ?? "");
  const [enCours, demarrer] = useTransition();

  const statut = statutDe({ ...row, en: en || null, ar: ar || null });
  const badge = STATUT_BADGE[statut];

  function enregistrer(locale: "en" | "ar", value: string) {
    demarrer(async () => {
      const result = await upsertTranslationAction({
        entity: row.entity,
        entityId: row.entityId,
        locale,
        field: row.field,
        value,
      });
      if (result.ok) toast.success(result.message);
      else toast.error(result.error);
    });
  }

  function supprimer(locale: "en" | "ar") {
    demarrer(async () => {
      const result = await deleteTranslationAction({
        entity: row.entity,
        entityId: row.entityId,
        locale,
        field: row.field,
      });
      if (result.ok) {
        if (locale === "en") setEn("");
        else setAr("");
        toast.success(result.message);
      } else toast.error(result.error);
    });
  }

  return (
    <Card className={cn("overflow-hidden p-0", ouvert && "border-brand/40")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={ouvert}
        className="hover:bg-elevated/60 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
      >
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-subtle font-mono">{row.entityLabel}</span>
            <span className="text-subtle">·</span>
            <span className="font-medium">{row.itemTitle}</span>
            <span className="text-subtle font-mono">{fieldLabel(row.field)}</span>
            {row.seoCritical ? (
              <Badge variant="brand" size="sm">
                SEO
              </Badge>
            ) : null}
          </p>
          <p className="text-muted mt-1 truncate text-sm">{row.fr}</p>
        </div>

        <Badge variant={badge.variant} size="sm">
          {badge.label}
        </Badge>
      </button>

      {ouvert ? (
        <div className="border-border grid gap-4 border-t p-4">
          <div className="grid gap-1.5">
            <Label>🇫🇷 Français — source, non modifiable ici</Label>
            <p className="border-border bg-sunken text-muted rounded-[var(--radius-sm)] border px-3 py-2 text-sm whitespace-pre-wrap">
              {row.fr}
            </p>
          </div>

          <ChampTraduction
            drapeau="🇬🇧"
            titre="English"
            id={`en-${row.entityId}-${row.field}`}
            value={en}
            onChange={setEn}
            onSave={() => enregistrer("en", en)}
            onDelete={() => supprimer("en")}
            disabled={enCours}
            present={Boolean(row.en?.trim())}
          />

          <ChampTraduction
            drapeau="🇲🇦"
            titre="العربية"
            id={`ar-${row.entityId}-${row.field}`}
            value={ar}
            onChange={setAr}
            onSave={() => enregistrer("ar", ar)}
            onDelete={() => supprimer("ar")}
            disabled={enCours}
            present={Boolean(row.ar?.trim())}
            rtl
          />
        </div>
      ) : null}
    </Card>
  );
}

function ChampTraduction({
  drapeau,
  titre,
  id,
  value,
  onChange,
  onSave,
  onDelete,
  disabled,
  present,
  rtl = false,
}: {
  drapeau: string;
  titre: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  disabled: boolean;
  present: boolean;
  rtl?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>
        {drapeau} {titre}
        {present ? (
          <span className="text-success ms-2 text-[0.6875rem] font-normal">
            <Check className="inline size-3" /> traduit
          </span>
        ) : (
          <span className="text-subtle ms-2 text-[0.6875rem] font-normal">
            <X className="inline size-3" /> repli sur le français
          </span>
        )}
      </Label>

      <Textarea
        id={id}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        // L'arabe doit être saisi de droite à gauche, et `lang` déclenche la
        // police Noto Sans Arabic déjà chargée par le design system.
        {...(rtl ? { dir: "rtl" as const, lang: "ar" } : {})}
        className={rtl ? "text-base leading-loose" : undefined}
      />

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onSave} disabled={disabled}>
          {disabled ? <Loader2 className="animate-spin" /> : null}
          Enregistrer
        </Button>
        {present ? (
          <Button size="sm" variant="ghost" onClick={onDelete} disabled={disabled}>
            <Trash2 />
            Supprimer
          </Button>
        ) : null}
      </div>
    </div>
  );
}
