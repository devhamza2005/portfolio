import { DEFAULT_LOCALE, INTL_LOCALES, type Locale } from "@/lib/i18n/config";

/**
 * Formatage des dates du portfolio.
 *
 * Un seul format par locale et partout le même : les frises chronologiques
 * perdent en lisibilité dès que les formats varient d'une section à l'autre.
 *
 * ── Localisation ───────────────────────────────────────────────────────────
 *
 * Chaque fonction accepte une `Locale` et retombe sur le français si elle n'est
 * pas fournie — les appels du back-office, qui reste francophone, n'ont donc
 * rien à changer.
 *
 * Les formateurs sont mémorisés : construire un `Intl.DateTimeFormat` coûte
 * cher, et une page de parcours en instancierait sinon plusieurs dizaines.
 */

type Style = "monthYear" | "year" | "full";

const OPTIONS: Record<Style, Intl.DateTimeFormatOptions> = {
  monthYear: { month: "long", year: "numeric" },
  year: { year: "numeric" },
  full: { day: "numeric", month: "long", year: "numeric" },
};

const CACHE = new Map<string, Intl.DateTimeFormat>();

function formatter(style: Style, locale: Locale): Intl.DateTimeFormat {
  const key = `${style}:${locale}`;
  let cached = CACHE.get(key);

  if (!cached) {
    cached = new Intl.DateTimeFormat(INTL_LOCALES[locale], OPTIONS[style]);
    CACHE.set(key, cached);
  }

  return cached;
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMonthYear(
  value: Date | string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const date = toDate(value);
  return date ? formatter("monthYear", locale).format(date) : "";
}

export function formatYear(
  value: Date | string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const date = toDate(value);
  return date ? formatter("year", locale).format(date) : "";
}

export function formatFullDate(
  value: Date | string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const date = toDate(value);
  return date ? formatter("full", locale).format(date) : "";
}

/**
 * Période lisible : « janvier 2026 — aujourd'hui », « 2023 — 2025 »…
 *
 * Quand début et fin tombent la même année, on n'affiche l'année qu'une fois
 * plutôt que de répéter « 2026 — 2026 ».
 *
 * `todayLabel` vient du dictionnaire : « aujourd'hui », « present », « الآن ».
 */
export function formatPeriod(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
  current = false,
  locale: Locale = DEFAULT_LOCALE,
  todayLabel = "aujourd'hui",
): string {
  const startDate = toDate(start);
  const endDate = toDate(end);

  if (!startDate) return current ? todayLabel : "";

  const startLabel = formatMonthYear(startDate, locale);

  if (current) return `${startLabel} — ${todayLabel}`;
  if (!endDate) return startLabel;

  const sameMonth =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth();

  if (sameMonth) return startLabel;

  return `${startLabel} — ${formatMonthYear(endDate, locale)}`;
}

/** Période resserrée sur l'année, pour les formations. */
export function formatYearRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const startYear = formatYear(start, locale);
  const endYear = formatYear(end, locale);

  if (!startYear && !endYear) return "";
  if (!endYear) return startYear;
  if (!startYear) return endYear;
  if (startYear === endYear) return startYear;

  return `${startYear} — ${endYear}`;
}
