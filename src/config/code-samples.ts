import type { LanguageKey } from "@/lib/code/highlight";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  EXEMPLES DE L'ENGINEERING LAB
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Sécurité : rien n'est exécuté ─────────────────────────────────────────
 *
 * Ces extraits sont des CONSTANTES et leurs sorties sont écrites à la main.
 * Cliquer sur « Exécuter » ne compile rien, n'évalue rien et n'appelle aucun
 * processus : le composant se contente d'afficher le résultat déjà associé à
 * l'exemple. Aucun `eval`, aucun `child_process`, aucune entrée du visiteur
 * n'atteint le serveur — il n'existe donc aucune surface d'exécution de code
 * à distance, ni aujourd'hui ni par accident demain.
 *
 * ── Extensibilité ─────────────────────────────────────────────────────────
 *
 * Le contrat `CodeSample` sépare volontairement l'exemple de son exécution
 * (voir src/lib/code/runner.ts). Brancher un jour un vrai bac à sable isolé
 * reviendrait à fournir une autre implémentation de `SampleRunner`, sans
 * toucher ni à l'interface ni aux exemples.
 *
 * ── Ce qui est traduit, et ce qui ne l'est pas ────────────────────────────
 *
 * Le TITRE et le MESSAGE de résultat passent par les dictionnaires (clés
 * `lab.samples.<id>`). Le CODE et la SORTIE TECHNIQUE (JSON, table SQL, trace
 * de build) restent identiques dans les trois langues : traduire un identifiant
 * Java ou une clé JSON produirait du code qui n'existe pas.
 */

/** Nature du statut affiché : une réponse HTTP, ou un code de sortie. */
export type StatusKind = "http" | "exit";

export type CodeSample = {
  id: string;
  /** Nom affiché du langage — jamais traduit. */
  language: string;
  /** Cadre technique, quand il y en a un. */
  framework: string | null;
  /** Clé de coloration syntaxique. */
  syntax: LanguageKey;
  code: string;
  statusKind: StatusKind;
  /** 200, 400… en HTTP ; 0 ou 1 pour un code de sortie. */
  expectedStatus: number;
  /** Libellé court du statut — « OK », « Bad Request », « Exit 0 ». */
  statusLabel: string;
  /** Sortie technique brute : JSON, table, trace. Non traduite. */
  output: string;
  executionTime: string;
};

export const CODE_SAMPLES: readonly CodeSample[] = [
  {
    id: "spring-convention",
    language: "Java",
    framework: "Spring Boot",
    syntax: "java",
    code: `@RestController
@RequestMapping("/api/conventions")
public class ConventionController {

    @PreAuthorize("hasRole('VALIDATEUR')")
    @PostMapping("/{id}/valider")
    public ResponseEntity<Convention> valider(
        @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
            workflow.valider(id)
        );
    }
}`,
    statusKind: "http",
    expectedStatus: 200,
    statusLabel: "OK",
    output: `{
  "id": "8f3c1a2e-…-b47d",
  "statut": "VALIDEE",
  "validePar": "VALIDATEUR",
  "valideLe": "2026-08-13T17:42:08Z"
}`,
    executionTime: "42 ms",
  },
  {
    id: "zod-validation",
    language: "TypeScript",
    framework: "Zod",
    syntax: "typescript",
    code: `const contactSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  message: z.string().min(20),
});

const result = contactSchema.safeParse({
  name: "H",
  email: "pas-un-email",
  message: "trop court",
});`,
    statusKind: "http",
    expectedStatus: 400,
    statusLabel: "Bad Request",
    output: `{
  "success": false,
  "issues": [
    { "path": ["name"],    "code": "too_small" },
    { "path": ["email"],   "code": "invalid_string" },
    { "path": ["message"], "code": "too_small" }
  ]
}`,
    executionTime: "3 ms",
  },
  {
    id: "node-cache",
    language: "JavaScript",
    framework: "Node.js",
    syntax: "javascript",
    code: `async function getProjects(locale) {
  const cached = await cache.get(\`projects:\${locale}\`);
  if (cached) return cached;

  const rows = await db.project.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  await cache.set(\`projects:\${locale}\`, rows, 3600);
  return rows;
}`,
    statusKind: "http",
    expectedStatus: 200,
    statusLabel: "OK",
    output: `cache MISS  projects:fr
query       7 rows in 11 ms
cache SET   projects:fr  ttl=3600s`,
    executionTime: "14 ms",
  },
  {
    id: "python-rfid",
    language: "Python",
    framework: null,
    syntax: "python",
    code: `def lire_badge(port, timeout=2.0):
    lecteur = SerialRFID(port, baudrate=9600)
    uid = lecteur.attendre_badge(timeout)

    if uid is None:
        raise TimeoutError("aucun badge presente")

    return {"uid": uid, "horodatage": time.time()}


badge = lire_badge("/dev/ttyUSB0")
print(badge["uid"])`,
    statusKind: "exit",
    expectedStatus: 0,
    statusLabel: "Exit 0",
    output: `04:A3:19:2F:7B:C1
horodatage : 1786... (epoch)`,
    executionTime: "180 ms",
  },
  {
    id: "sql-stats",
    language: "SQL",
    framework: "PostgreSQL",
    syntax: "sql",
    code: `SELECT c.name AS categorie,
       COUNT(p.id) AS projets
FROM categories c
LEFT JOIN projects p
       ON p.category_id = c.id
      AND p.published = true
WHERE c.kind = 'PROJECT'
GROUP BY c.name
ORDER BY projets DESC;`,
    statusKind: "exit",
    expectedStatus: 0,
    statusLabel: "Exit 0",
    output: `      categorie       | projets
----------------------+---------
 Application web      |       4
 Systeme embarque     |       2
 DevOps               |       1
(3 rows)`,
    executionTime: "9 ms",
  },
  {
    id: "docker-build",
    language: "Docker",
    framework: null,
    syntax: "docker",
    code: `FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
EXPOSE 8080

HEALTHCHECK CMD wget -qO- localhost:8080/health || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]`,
    statusKind: "exit",
    expectedStatus: 0,
    statusLabel: "Exit 0",
    output: `[+] Building 12.4s (11/11) FINISHED
 => exporting layers                          1.8s
 => naming to docker.io/library/conventions   0.0s
image size : 187 MB`,
    executionTime: "12.4 s",
  },
];

/** Retrouve un exemple par son identifiant. */
export function findSample(id: string): CodeSample | undefined {
  return CODE_SAMPLES.find((sample) => sample.id === id);
}
