import type { LanguageKey } from "@/lib/code/highlight";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ARCHITECTURE LAB — modèle de données
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Mise en page : des ÉTAGES, pas des coordonnées ────────────────────────
 *
 * Chaque vue est une pile d'étages, chaque étage contenant un à trois nœuds.
 * Aucune position absolue n'est stockée : le diagramme se dessine avec une
 * grille CSS, et les connecteurs SVG en déduisent leurs points d'ancrage.
 *
 * Deux bénéfices concrets :
 *  • rien à recalculer au redimensionnement, donc aucun débordement possible ;
 *  • sur mobile, les étages s'empilent naturellement en liste de cartes — la
 *    transformation demandée n'exige aucun second rendu.
 *
 * ── Ce qui est traduit, et ce qui ne l'est pas ────────────────────────────
 *
 * Nom, description et responsabilités passent par les dictionnaires (clés
 * `architecture.nodes.<id>` et `architecture.views.<id>`). Les technologies,
 * les routes et les extraits de code restent identiques dans les trois langues :
 * `@PreAuthorize` ou `POST /api/conventions` ne se traduisent pas.
 */

/** Famille d'un nœud — pilote sa couleur et son icône par défaut. */
export type NodeKind = "client" | "gateway" | "security" | "service" | "data" | "infra";

export type ArchitectureNode = {
  id: string;
  kind: NodeKind;
  /** Nom d'icône Lucide. */
  icon: string;
  /** Technologies réelles — jamais traduites. */
  techs: readonly string[];
  /** Routes exposées, quand le nœud en expose. */
  endpoints?: readonly string[];
  /** Extrait illustratif, colorisé côté serveur. */
  code?: { syntax: LanguageKey; snippet: string };
};

export type ArchitectureView = {
  id: string;
  /** Étages, du haut vers le bas. Chaque étage est une rangée du diagramme. */
  tiers: readonly (readonly string[])[];
};

/**
 * Catalogue des nœuds.
 *
 * Un nœud est décrit UNE fois et réutilisé par plusieurs vues : `api` apparaît
 * dans la vue REST comme dans la vue microservices, avec la même description
 * et donc une seule clé de traduction.
 */
export const ARCHITECTURE_NODES: Record<string, ArchitectureNode> = {
  frontend: {
    id: "frontend",
    kind: "client",
    icon: "MonitorSmartphone",
    techs: ["React", "Next.js", "TypeScript"],
  },

  controller: {
    id: "controller",
    kind: "gateway",
    icon: "Route",
    techs: ["Spring MVC", "Thymeleaf"],
    code: {
      syntax: "java",
      snippet: `@Controller
@RequestMapping("/conventions")
public class ConventionViewController {

    @GetMapping
    public String liste(Model model) {
        model.addAttribute("conventions", service.toutes());
        return "conventions/liste";
    }
}`,
    },
  },

  serviceLayer: {
    id: "serviceLayer",
    kind: "service",
    icon: "Cog",
    techs: ["Spring Boot", "Java 21"],
    code: {
      syntax: "java",
      snippet: `@Service
@Transactional
public class ConventionWorkflow {

    public Convention valider(UUID id) {
        Convention convention = repository.findById(id)
            .orElseThrow(ConventionIntrouvable::new);

        convention.valider(utilisateurCourant());
        return repository.save(convention);
    }
}`,
    },
  },

  repository: {
    id: "repository",
    kind: "data",
    icon: "Database",
    techs: ["Spring Data JPA", "Hibernate"],
    code: {
      syntax: "java",
      snippet: `public interface ConventionRepository
        extends JpaRepository<Convention, UUID> {

    List<Convention> findByStatut(Statut statut);

    @Query("select c from Convention c where c.echeance < :date")
    List<Convention> expirantAvant(LocalDate date);
}`,
    },
  },

  api: {
    id: "api",
    kind: "gateway",
    icon: "Webhook",
    techs: ["Spring Boot", "REST", "OpenAPI"],
    endpoints: [
      "GET    /api/conventions",
      "POST   /api/conventions",
      "POST   /api/conventions/{id}/valider",
      "GET    /api/conventions/{id}/documents",
    ],
    code: {
      syntax: "java",
      snippet: `@RestController
@RequestMapping("/api/conventions")
public class ConventionController {

    @PreAuthorize("hasRole('VALIDATEUR')")
    @PostMapping("/{id}/valider")
    public ResponseEntity<Convention> valider(@PathVariable UUID id) {
        return ResponseEntity.ok(workflow.valider(id));
    }
}`,
    },
  },

  security: {
    id: "security",
    kind: "security",
    icon: "ShieldCheck",
    techs: ["Spring Security", "RBAC", "BCrypt"],
    code: {
      syntax: "java",
      snippet: `@Bean
SecurityFilterChain filtres(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/**").authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}`,
    },
  },

  jwt: {
    id: "jwt",
    kind: "security",
    icon: "KeyRound",
    techs: ["JWT", "HS256", "Refresh token"],
    code: {
      syntax: "java",
      snippet: `public String emettre(Utilisateur utilisateur) {
    return Jwts.builder()
        .subject(utilisateur.getEmail())
        .claim("roles", utilisateur.getRoles())
        .issuedAt(new Date())
        .expiration(Date.from(now().plus(8, HOURS)))
        .signWith(cle)
        .compact();
}`,
    },
  },


  conventionService: {
    id: "conventionService",
    kind: "service",
    icon: "FileCheck",
    techs: ["Spring Boot", "PostgreSQL"],
    endpoints: [
      "GET  /conventions",
      "POST /conventions/{id}/valider",
      "GET  /conventions/{id}/historique",
    ],
  },

  documentService: {
    id: "documentService",
    kind: "service",
    icon: "Files",
    techs: ["Spring Boot", "Stockage objet"],
    endpoints: ["POST /documents", "GET  /documents/{id}", "DELETE /documents/{id}"],
  },

  postgres: {
    id: "postgres",
    kind: "data",
    icon: "Database",
    techs: ["PostgreSQL", "Index", "Transactions"],
    code: {
      syntax: "sql",
      snippet: `CREATE TABLE conventions (
    id          UUID PRIMARY KEY,
    reference   TEXT NOT NULL UNIQUE,
    statut      TEXT NOT NULL,
    valide_par  UUID REFERENCES utilisateurs(id),
    valide_le   TIMESTAMPTZ
);

CREATE INDEX conventions_statut_idx ON conventions(statut);`,
    },
  },

  cicd: {
    id: "cicd",
    kind: "infra",
    icon: "GitBranch",
    techs: ["GitHub Actions", "Maven", "SonarQube"],
    code: {
      syntax: "docker",
      snippet: `RUN mvn -B verify
RUN mvn -B sonar:sonar -Dsonar.qualitygate.wait=true`,
    },
  },

  dockerImage: {
    id: "dockerImage",
    kind: "infra",
    icon: "Container",
    techs: ["Docker", "Multi-stage", "Alpine"],
    code: {
      syntax: "docker",
      snippet: `FROM maven:3.9-eclipse-temurin-21 AS build
COPY . .
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre-alpine AS runtime
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]`,
    },
  },

  appContainer: {
    id: "appContainer",
    kind: "service",
    icon: "Box",
    techs: ["Docker Compose", "Healthcheck"],
  },

  dbContainer: {
    id: "dbContainer",
    kind: "data",
    icon: "Database",
    techs: ["postgres:16-alpine"],
  },

  volume: {
    id: "volume",
    kind: "infra",
    icon: "HardDrive",
    techs: ["Docker volume", "Sauvegarde"],
  },
};

/**
 * Les quatre vues.
 *
 * La vue « microservices » reproduit exactement le schéma de référence :
 * Frontend → REST API / JWT → { Convention, Documents } → PostgreSQL.
 */
export const ARCHITECTURE_VIEWS: readonly ArchitectureView[] = [
  {
    id: "monolith",
    tiers: [["frontend"], ["controller"], ["serviceLayer"], ["repository"], ["postgres"]],
  },
  {
    id: "rest",
    tiers: [["frontend"], ["api"], ["security", "jwt"], ["serviceLayer"], ["postgres"]],
  },
  {
    id: "microservices",
    tiers: [
      ["frontend"],
      ["api"],
      ["conventionService", "documentService"],
      ["postgres"],
    ],
  },
  {
    id: "deployment",
    tiers: [["cicd"], ["dockerImage"], ["appContainer", "dbContainer"], ["volume"]],
  },
];

/** Nœuds réellement utilisés par au moins une vue — sert aux traductions. */
export const USED_NODE_IDS = [
  ...new Set(ARCHITECTURE_VIEWS.flatMap((view) => view.tiers.flat())),
];
