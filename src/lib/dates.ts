/**
 * Formatage des dates du portfolio.
 *
 * Une seule locale et un seul format partout : les frises chronologiques
 * perdent en lisibilité dès que les formats varient d'une section à l'autre.
 */

const MONTH_YEAR = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
const YEAR_ONLY = new Intl.DateTimeFormat("fr-FR", { year: "numeric" });
const FULL = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMonthYear(value: Date | string | null | undefined): string {
  const date = toDate(value);
  return date ? MONTH_YEAR.format(date) : "";
}

export function formatYear(value: Date | string | null | undefined): string {
  const date = toDate(value);
  return date ? YEAR_ONLY.format(date) : "";
}

export function formatFullDate(value: Date | string | null | undefined): string {
  const date = toDate(value);
  return date ? FULL.format(date) : "";
}

/**
 * Période lisible : « janvier 2026 — aujourd'hui », « 2023 — 2025 »…
 *
 * Quand début et fin tombent la même année, on n'affiche l'année qu'une fois
 * plutôt que de répéter « 2026 — 2026 ».
 */
export function formatPeriod(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
  current = false,
): string {
  const startDate = toDate(start);
  const endDate = toDate(end);

  if (!startDate) return current ? "Aujourd'hui" : "";

  const startLabel = MONTH_YEAR.format(startDate);

  if (current) return `${startLabel} — aujourd'hui`;
  if (!endDate) return startLabel;

  const sameMonth =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth();

  if (sameMonth) return startLabel;

  return `${startLabel} — ${MONTH_YEAR.format(endDate)}`;
}

/** Période resserrée sur l'année, pour les formations. */
export function formatYearRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
): string {
  const startYear = formatYear(start);
  const endYear = formatYear(end);

  if (!startYear && !endYear) return "";
  if (!endYear) return startYear;
  if (!startYear) return endYear;
  if (startYear === endYear) return startYear;

  return `${startYear} — ${endYear}`;
}
