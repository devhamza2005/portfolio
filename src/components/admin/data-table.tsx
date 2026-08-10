"use client";

import {
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Loader2,
  Pencil,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Icon } from "@/components/admin/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/skeleton";
import type { ColumnDef } from "@/resources/types";
import {
  reorderResourceAction,
  toggleResourceFieldAction,
} from "@/server/actions/resource.actions";
import { cn } from "@/lib/utils";

export type TableRow = Record<string, unknown> & { id: string };

type Props = {
  resourceKey: string;
  columns: ColumnDef[];
  rows: TableRow[];
  searchable?: string[];
  sortable?: boolean;
  emptyState?: { title: string; description?: string };
  createHref: string;
  createLabel: string;
};

const HIDE_CLASSES: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

/**
 * Liste générique d'une ressource.
 *
 * Fonctionnalités communes à toutes les entités : recherche instantanée,
 * bascule publié/vedette sans ouvrir la fiche, réordonnancement, suppression
 * protégée par confirmation (dans le formulaire).
 *
 * La recherche est faite en mémoire : les volumes d'un portfolio (quelques
 * dizaines de lignes) ne justifient pas un aller-retour serveur par frappe.
 */
export function DataTable({
  resourceKey,
  columns,
  rows: initialRows,
  searchable = [],
  sortable = false,
  emptyState,
  createHref,
  createLabel,
}: Props) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [movingId, setMovingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term || searchable.length === 0) return rows;

    return rows.filter((row) =>
      searchable.some((key) => {
        const value = row[key];
        return typeof value === "string" && value.toLowerCase().includes(term);
      }),
    );
  }, [rows, query, searchable]);

  const isFiltered = query.trim() !== "";

  function handleToggle(id: string, field: string, next: boolean) {
    // Mise à jour optimiste : l'interface répond immédiatement, et revient en
    // arrière si le serveur refuse.
    const previous = rows;
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: next } : row)),
    );

    startTransition(async () => {
      const result = await toggleResourceFieldAction(resourceKey, id, field, next);
      if (!result.ok) {
        setRows(previous);
        toast.error(result.error);
      }
    });
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);

    const previous = rows;
    setRows(next);
    setMovingId(moved.id);

    startTransition(async () => {
      const result = await reorderResourceAction(
        resourceKey,
        next.map((row) => row.id),
      );
      setMovingId(null);
      if (!result.ok) {
        setRows(previous);
        toast.error(result.error);
      }
    });
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen />}
        title={emptyState?.title ?? "Aucun élément"}
        description={emptyState?.description}
        action={
          <Button asChild size="sm">
            <Link href={createHref}>{createLabel}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {/* Recherche */}
      {searchable.length > 0 ? (
        <div className="relative max-w-sm">
          <Search className="text-subtle pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher…"
            aria-label="Rechercher dans la liste"
            className="pl-9"
          />
          {isFiltered ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
              className="text-subtle hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="Aucun résultat"
          description={`Rien ne correspond à « ${query} ».`}
          action={
            <Button size="sm" variant="secondary" onClick={() => setQuery("")}>
              Effacer la recherche
            </Button>
          }
        />
      ) : (
        <div className="border-border bg-surface overflow-hidden rounded-[var(--radius-lg)] border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Liste des éléments — {filtered.length} résultat
                {filtered.length > 1 ? "s" : ""}
              </caption>
              <thead>
                <tr className="border-border border-b">
                  {sortable && !isFiltered ? <th className="w-12" /> : null}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={cn(
                        "text-subtle px-4 py-3 text-left font-mono text-[0.6875rem] font-medium tracking-wider uppercase",
                        column.align === "right" && "text-right",
                        column.hideBelow && HIDE_CLASSES[column.hideBelow],
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th scope="col" className="w-16 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((row, index) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-border hover:bg-elevated/60 border-b transition-colors last:border-0",
                      movingId === row.id && "bg-brand-soft",
                    )}
                  >
                    {sortable && !isFiltered ? (
                      <td className="pl-3">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleMove(index, -1)}
                            disabled={index === 0 || isPending}
                            aria-label="Monter"
                            className="text-subtle hover:text-brand rounded p-0.5 transition-colors disabled:opacity-30"
                          >
                            <ChevronUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 1)}
                            disabled={index === filtered.length - 1 || isPending}
                            aria-label="Descendre"
                            className="text-subtle hover:text-brand rounded p-0.5 transition-colors disabled:opacity-30"
                          >
                            <ChevronDown className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    ) : null}

                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-3",
                          column.align === "right" && "text-right",
                          column.hideBelow && HIDE_CLASSES[column.hideBelow],
                        )}
                      >
                        <Cell
                          column={column}
                          row={row}
                          onToggle={(field, next) => handleToggle(row.id, field, next)}
                          disabled={isPending}
                        />
                      </td>
                    ))}

                    <td className="px-4 py-3 text-right">
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link
                          href={`/admin/${resourceKey}/${row.id}`}
                          aria-label="Modifier cet élément"
                        >
                          <Pencil />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-subtle text-xs">
        {filtered.length} élément{filtered.length > 1 ? "s" : ""}
        {isFiltered ? ` sur ${rows.length}` : ""}
        {sortable && isFiltered ? " — effacez la recherche pour réordonner." : ""}
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────

function Cell({
  column,
  row,
  onToggle,
  disabled,
}: {
  column: ColumnDef;
  row: TableRow;
  onToggle: (field: string, next: boolean) => void;
  disabled: boolean;
}) {
  const value = row[column.key];

  switch (column.render) {
    case "title":
      return (
        <span className="text-foreground line-clamp-1 font-medium">
          {typeof value === "string" ? value : "—"}
        </span>
      );

    case "image": {
      const media = value as { url?: string; alt?: string } | null;
      if (!media?.url) {
        return (
          <span
            className="bg-elevated text-subtle grid size-9 place-items-center rounded-[var(--radius-sm)]"
            aria-label="Aucune image"
          >
            <Icon name="ImageOff" className="size-3.5" />
          </span>
        );
      }
      return (
        <span className="bg-elevated relative block size-9 overflow-hidden rounded-[var(--radius-sm)]">
          <Image
            src={media.url}
            alt={media.alt ?? ""}
            fill
            unoptimized
            sizes="36px"
            className="object-cover"
          />
        </span>
      );
    }

    case "badge": {
      // La valeur peut être une relation chargée (objet avec `name`) ou une
      // simple chaîne (enum, catégorie libre).
      const label =
        typeof value === "string"
          ? value
          : value && typeof value === "object" && "name" in value
            ? String((value as { name: unknown }).name)
            : null;

      if (!label) return <span className="text-subtle">—</span>;
      return (
        <Badge variant="default" size="sm">
          {label}
        </Badge>
      );
    }

    case "count":
      return (
        <span className="text-muted font-mono tabular-nums">
          {Array.isArray(value) ? value.length : 0}
        </span>
      );

    case "date": {
      if (!value) return <span className="text-subtle">—</span>;
      const date = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(date.getTime())) return <span className="text-subtle">—</span>;
      return (
        <time dateTime={date.toISOString()} className="text-muted tabular-nums">
          {date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
        </time>
      );
    }

    case "boolean":
      return value === true ? (
        <Badge variant="success" size="sm">
          Oui
        </Badge>
      ) : (
        <span className="text-subtle">—</span>
      );

    case "toggle":
      return (
        <Switch
          checked={value === true}
          disabled={disabled}
          onCheckedChange={(next) => onToggle(column.key, next)}
          aria-label={column.label}
          className="ml-auto"
        />
      );

    default:
      if (value == null || value === "") return <span className="text-subtle">—</span>;
      return <span className="text-muted line-clamp-1">{String(value)}</span>;
  }
}

/** Indicateur de chargement réutilisé par les états `loading` des listes. */
export function TableLoading() {
  return (
    <div className="text-muted flex items-center justify-center gap-2 py-16 text-sm">
      <Loader2 className="size-4 animate-spin" />
      Chargement…
    </div>
  );
}
