/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  COLORATION SYNTAXIQUE — analyseur lexical minimal
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Pourquoi pas une bibliothèque ─────────────────────────────────────────
 *
 * Shiki, Prism ou highlight.js pèsent de 100 Ko à plusieurs mégaoctets pour
 * couvrir des centaines de langages. Le portfolio en affiche six, sur des
 * extraits d'une vingtaine de lignes écrits à la main. Un analyseur de 80
 * lignes suffit, ne coûte rien au navigateur et ne dépend de personne.
 *
 * ── Sûreté ────────────────────────────────────────────────────────────────
 *
 * Purement lexical : le code est DÉCOUPÉ, jamais évalué. Aucun `eval`, aucune
 * construction de fonction, aucune exécution — cette fonction ne fait que
 * classer des sous-chaînes. Elle tourne côté serveur, et seuls des jetons
 * (texte + étiquette) traversent la frontière vers le client.
 *
 * ── Palette ───────────────────────────────────────────────────────────────
 *
 * Les tons reprennent exactement ceux de la fenêtre de code du Hero
 * (`hero-code.tsx`) : les deux blocs doivent se ressembler, ils racontent la
 * même chose.
 */

export type Tone =
  | "keyword"
  | "annotation"
  | "type"
  | "string"
  | "comment"
  | "fn"
  | "number"
  | "plain";

export type Token = { text: string; tone: Tone };

/** Une ligne de code déjà découpée. Un tableau vide = ligne blanche. */
export type CodeLine = Token[];

export type LanguageKey = "java" | "javascript" | "typescript" | "python" | "sql" | "docker";

type LanguageConfig = {
  keywords: readonly string[];
  /** Marqueurs de commentaire de fin de ligne, échappés pour la regex. */
  lineComments: readonly string[];
  /** Le langage utilise-t-il des annotations `@Machin` / décorateurs ? */
  annotations: boolean;
};

const JS_KEYWORDS = [
  "const", "let", "var", "function", "return", "await", "async", "if", "else", "for", "of",
  "in", "new", "try", "catch", "finally", "throw", "import", "from", "export", "default",
  "class", "extends", "typeof", "instanceof", "null", "undefined", "true", "false", "this",
] as const;

const LANGUAGES: Record<LanguageKey, LanguageConfig> = {
  java: {
    keywords: [
      "public", "private", "protected", "class", "interface", "return", "new", "void",
      "static", "final", "if", "else", "for", "while", "try", "catch", "throw", "throws",
      "import", "package", "extends", "implements", "null", "true", "false", "this", "record",
    ],
    lineComments: ["//"],
    annotations: true,
  },
  javascript: { keywords: JS_KEYWORDS, lineComments: ["//"], annotations: false },
  typescript: {
    keywords: [...JS_KEYWORDS, "type", "interface", "implements", "readonly", "satisfies", "as"],
    lineComments: ["//"],
    annotations: true,
  },
  python: {
    keywords: [
      "def", "class", "return", "import", "from", "as", "if", "elif", "else", "for", "while",
      "try", "except", "finally", "raise", "with", "lambda", "None", "True", "False", "self",
      "async", "await", "not", "and", "or", "in", "is", "print",
    ],
    lineComments: ["#"],
    annotations: true,
  },
  sql: {
    keywords: [
      "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INNER", "ON", "GROUP", "BY",
      "ORDER", "HAVING", "LIMIT", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
      "CREATE", "TABLE", "INDEX", "AS", "AND", "OR", "NOT", "NULL", "COUNT", "SUM", "DESC",
      "ASC", "WITH", "DISTINCT", "CASE", "WHEN", "THEN", "END",
    ],
    lineComments: ["--"],
    annotations: false,
  },
  docker: {
    keywords: [
      "FROM", "RUN", "COPY", "ADD", "WORKDIR", "ENV", "EXPOSE", "CMD", "ENTRYPOINT", "ARG",
      "USER", "LABEL", "HEALTHCHECK", "VOLUME", "AS",
    ],
    lineComments: ["#"],
    annotations: false,
  },
};

/** Échappe les caractères spéciaux d'une regex. */
function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Construit l'expression du langage.
 *
 * L'ORDRE des alternatives compte : les chaînes viennent AVANT les
 * commentaires, sinon `"https://exemple.com"` verrait son `//` pris pour le
 * début d'un commentaire et la moitié de la ligne changerait de couleur.
 */
function lexerFor(config: LanguageConfig): RegExp {
  const comments = config.lineComments.map((marker) => `${escapeRe(marker)}[^\\n]*`).join("|");
  const annotation = config.annotations ? `|(?<annotation>@[A-Za-z_]\\w*)` : "";

  return new RegExp(
    `(?<string>"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)` +
      `|(?<comment>${comments})` +
      annotation +
      `|(?<number>\\b\\d+(?:\\.\\d+)?\\b)` +
      `|(?<word>[A-Za-z_$][\\w$]*)`,
    "g",
  );
}

/** Classe un identifiant selon le langage et ce qui le suit. */
function classifyWord(word: string, rest: string, keywords: readonly string[]): Tone {
  if (keywords.includes(word)) return "keyword";
  // Un identifiant immédiatement suivi d'une parenthèse est un appel.
  if (/^\s*\(/.test(rest)) return "fn";
  // Convention partagée par les six langages : les types portent une majuscule.
  if (/^[A-Z]/.test(word)) return "type";
  return "plain";
}

/**
 * Découpe un extrait en lignes de jetons colorés.
 *
 * Le résultat est une structure de données simple — texte et étiquettes — donc
 * sérialisable telle quelle vers un composant client.
 */
export function highlight(code: string, language: LanguageKey): CodeLine[] {
  const config = LANGUAGES[language];
  const lexer = lexerFor(config);

  return code.split("\n").map((line) => {
    const tokens: CodeLine = [];
    let cursor = 0;

    lexer.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = lexer.exec(line)) !== null) {
      if (match.index > cursor) {
        tokens.push({ text: line.slice(cursor, match.index), tone: "plain" });
      }

      const groups = match.groups ?? {};
      let tone: Tone = "plain";

      if (groups["string"] !== undefined) tone = "string";
      else if (groups["comment"] !== undefined) tone = "comment";
      else if (groups["annotation"] !== undefined) tone = "annotation";
      else if (groups["number"] !== undefined) tone = "number";
      else if (groups["word"] !== undefined) {
        tone = classifyWord(match[0], line.slice(match.index + match[0].length), config.keywords);
      }

      tokens.push({ text: match[0], tone });
      cursor = match.index + match[0].length;
    }

    if (cursor < line.length) tokens.push({ text: line.slice(cursor), tone: "plain" });

    return tokens;
  });
}
