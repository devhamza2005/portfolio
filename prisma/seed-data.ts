/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CONTENU INITIAL DU PORTFOLIO — Hamza Fanoune
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce fichier sert UNIQUEMENT à l'amorçage de la base : il évite de ressaisir
 * à la main les 7 projets, les 2 expériences, les 3 formations et la
 * cinquantaine de technologies au premier lancement.
 *
 * ⚠️ Une fois la base amorcée, ce fichier n'est plus la source de vérité.
 *    Tout se modifie depuis /admin — ne revenez pas éditer ce fichier.
 *
 * Les champs laissés vides (`null`) sont ceux qui demandent une information
 * personnelle non fournie : à compléter depuis le back-office.
 */

// ───────────────────────────────────────────────────────────────────────────
//  PROFIL
// ───────────────────────────────────────────────────────────────────────────

export const profileData = {
  fullName: "Hamza Fanoune",
  headline: "Développeur Full Stack Java",
  subline: "Java · Spring Boot · React",
  tagline:
    "Je conçois des applications web complètes, de la modélisation UML au déploiement conteneurisé.",
  bioShort:
    "Développeur Full Stack Java spécialisé Spring Boot et React. J'ai conçu et livré une " +
    "application de gestion des conventions pour Casa Prestations, société de développement " +
    "local de la Commune de Casablanca.",
  bioLong:
    "Je suis développeur Full Stack Java, formé au développement web et logiciel à SUP2I / SUPEMIR. " +
    "Mon projet de fin d'études — une plateforme de gestion intelligente des conventions et des " +
    "coopérations réalisée pour Casa Prestations — m'a mené de l'analyse des besoins et de la " +
    "modélisation UML jusqu'à la mise en production sous Docker, en passant par la sécurisation " +
    "de l'API avec Spring Security et JWT.\n\n" +
    "Ce que j'aime dans ce métier, c'est la partie architecture : découper un domaine métier " +
    "complexe en modules cohérents, choisir les bonnes abstractions, et livrer un produit que " +
    "des utilisateurs réels vont manipuler tous les jours. Je travaille en Scrum, je documente " +
    "ce que je construis, et je m'intéresse de près à l'automatisation du déploiement " +
    "(Docker, Jenkins, Ansible, Terraform).",
  location: "Casablanca, Maroc",
  email: "devhamza2005@gmail.com",
  phone: null,
  availability: "OPEN_TO_WORK" as const,
  availabilityLabel: "Ouvert aux opportunités",
  /// Début des études en développement (DEUG Réseaux & Développement).
  careerStartYear: 2023,
  cvUrl: null,
  cvLabel: "Télécharger mon CV",
  seoTitle: "Hamza Fanoune — Développeur Full Stack Java | Spring Boot & React",
  seoDescription:
    "Développeur Full Stack Java à Casablanca, spécialisé Spring Boot et React. " +
    "Projets réels, architecture, DevOps. Découvrez mon parcours et mes réalisations.",
};

export const socialLinksData = [
  {
    platform: "github",
    label: "GitHub",
    url: "https://github.com/devhamza2005",
    iconKey: "Github",
    inHero: true,
    order: 1,
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    // ⚠️ À compléter depuis /admin/settings — URL réelle non fournie.
    url: "https://www.linkedin.com/in/",
    iconKey: "Linkedin",
    inHero: true,
    visible: false,
    order: 2,
  },
  {
    platform: "email",
    label: "Email",
    url: "mailto:devhamza2005@gmail.com",
    iconKey: "Mail",
    inHero: true,
    order: 3,
  },
];

export const qualitiesData = [
  { label: "Communication", iconKey: "MessagesSquare" },
  { label: "Esprit d'équipe", iconKey: "Users" },
  { label: "Organisation", iconKey: "ListChecks" },
  { label: "Rigueur", iconKey: "Target" },
  { label: "Esprit d'initiative", iconKey: "Lightbulb" },
  { label: "Gestion des priorités", iconKey: "CalendarClock" },
  { label: "Résolution de problèmes", iconKey: "Puzzle" },
];

/// Niveaux non précisés : à renseigner depuis /admin.
export const languagesData = [
  { name: "Arabe", level: null, percent: null },
  { name: "Français", level: null, percent: null },
  { name: "Anglais", level: null, percent: null },
];

// ───────────────────────────────────────────────────────────────────────────
//  CATÉGORIES
// ───────────────────────────────────────────────────────────────────────────

export const techCategoriesData = [
  { slug: "languages", name: "Langages", iconKey: "Code2", color: "#5B8CFF" },
  { slug: "backend", name: "Backend", iconKey: "Server", color: "#34D399" },
  { slug: "frontend", name: "Frontend", iconKey: "Layout", color: "#22D3EE" },
  { slug: "databases", name: "Bases de données", iconKey: "Database", color: "#A78BFA" },
  { slug: "security-api", name: "Sécurité & API", iconKey: "ShieldCheck", color: "#FF9B4A" },
  { slug: "devops", name: "DevOps & CI/CD", iconKey: "Container", color: "#60A5FA" },
  { slug: "architecture", name: "Architecture & Méthodes", iconKey: "Network", color: "#F472B6" },
  { slug: "tools", name: "Outils", iconKey: "Wrench", color: "#94A3B8" },
  { slug: "other", name: "Autres technologies", iconKey: "Boxes", color: "#FBBF24" },
];

export const projectCategoriesData = [
  { slug: "web", name: "Application Web", iconKey: "Globe" },
  { slug: "desktop", name: "Application Desktop", iconKey: "MonitorSmartphone" },
  { slug: "devops", name: "DevOps", iconKey: "Container" },
  { slug: "iot", name: "IoT & Systèmes embarqués", iconKey: "Cpu" },
];

// ───────────────────────────────────────────────────────────────────────────
//  TECHNOLOGIES
//  `iconKey` = slug simple-icons (rendu vectoriel, aucun upload nécessaire).
// ───────────────────────────────────────────────────────────────────────────

type TechSeed = {
  name: string;
  slug: string;
  category: string;
  iconKey?: string;
  color?: string;
  featured?: boolean;
};

export const technologiesData: TechSeed[] = [
  // Langages
  { name: "Java", slug: "java", category: "languages", iconKey: "openjdk", color: "#F89820", featured: true },
  { name: "JavaScript", slug: "javascript", category: "languages", iconKey: "javascript", color: "#F7DF1E", featured: true },
  { name: "Python", slug: "python", category: "languages", iconKey: "python", color: "#3776AB" },
  { name: "C#", slug: "csharp", category: "languages", iconKey: "sharp", color: "#512BD4" },
  { name: "C", slug: "c", category: "languages", iconKey: "c", color: "#A8B9CC" },

  // Backend
  { name: "Spring Boot", slug: "spring-boot", category: "backend", iconKey: "springboot", color: "#6DB33F", featured: true },
  { name: "Spring Security", slug: "spring-security", category: "backend", iconKey: "springsecurity", color: "#6DB33F", featured: true },
  { name: "JEE", slug: "jee", category: "backend", iconKey: "jakartaee", color: "#F89820" },
  { name: "Express.js", slug: "express", category: "backend", iconKey: "express", color: "#000000" },
  { name: "Node.js", slug: "nodejs", category: "backend", iconKey: "nodedotjs", color: "#5FA04E" },
  { name: "Next.js", slug: "nextjs", category: "backend", iconKey: "nextdotjs", color: "#000000" },
  { name: "JPA / Hibernate", slug: "hibernate", category: "backend", iconKey: "hibernate", color: "#59666C" },

  // Frontend
  { name: "React.js", slug: "react", category: "frontend", iconKey: "react", color: "#61DAFB", featured: true },
  { name: "HTML5", slug: "html5", category: "frontend", iconKey: "html5", color: "#E34F26" },
  { name: "CSS3", slug: "css3", category: "frontend", iconKey: "css", color: "#1572B6" },

  // Bases de données
  { name: "PostgreSQL", slug: "postgresql", category: "databases", iconKey: "postgresql", color: "#4169E1", featured: true },
  { name: "MySQL", slug: "mysql", category: "databases", iconKey: "mysql", color: "#4479A1", featured: true },
  { name: "Oracle", slug: "oracle", category: "databases", iconKey: "oracle", color: "#F80000" },
  { name: "SQL", slug: "sql", category: "databases", iconKey: "databricks", color: "#4479A1" },
  { name: "Redis", slug: "redis", category: "databases", iconKey: "redis", color: "#FF4438" },

  // Sécurité & API
  { name: "REST API", slug: "rest-api", category: "security-api", iconKey: "openapiinitiative", color: "#6BA539", featured: true },
  { name: "JWT", slug: "jwt", category: "security-api", iconKey: "jsonwebtokens", color: "#D63AFF", featured: true },
  { name: "Authentication", slug: "authentication", category: "security-api", iconKey: "auth0", color: "#EB5424" },
  { name: "Rôles & permissions", slug: "rbac", category: "security-api", iconKey: "keycloak", color: "#4D4D4D" },

  // DevOps & CI/CD
  { name: "Docker", slug: "docker", category: "devops", iconKey: "docker", color: "#2496ED", featured: true },
  { name: "Jenkins", slug: "jenkins", category: "devops", iconKey: "jenkins", color: "#D24939" },
  { name: "Ansible", slug: "ansible", category: "devops", iconKey: "ansible", color: "#EE0000" },
  { name: "Terraform", slug: "terraform", category: "devops", iconKey: "terraform", color: "#844FBA" },
  { name: "SonarQube", slug: "sonarqube", category: "devops", iconKey: "sonarqube", color: "#4E9BCD" },
  { name: "Linux", slug: "linux", category: "devops", iconKey: "linux", color: "#FCC624" },
  { name: "Kafka", slug: "kafka", category: "devops", iconKey: "apachekafka", color: "#231F20" },

  // Architecture & méthodes
  { name: "MVC", slug: "mvc", category: "architecture", iconKey: "blueprint", color: "#5B8CFF" },
  { name: "UML", slug: "uml", category: "architecture", iconKey: "diagramsdotnet", color: "#F08705" },
  { name: "Design Patterns", slug: "design-patterns", category: "architecture", iconKey: "codeigniter", color: "#A78BFA" },
  { name: "Agile Scrum", slug: "agile-scrum", category: "architecture", iconKey: "jira", color: "#0052CC" },
  { name: "Cascade", slug: "cascade", category: "architecture", iconKey: "waterfall", color: "#94A3B8" },

  // Outils
  { name: "Git", slug: "git", category: "tools", iconKey: "git", color: "#F05032", featured: true },
  { name: "GitHub", slug: "github", category: "tools", iconKey: "github", color: "#181717" },

  // Autres
  { name: ".NET", slug: "dotnet", category: "other", iconKey: "dotnet", color: "#512BD4" },
  { name: "JavaFX", slug: "javafx", category: "other", iconKey: "openjdk", color: "#F89820" },
  { name: "Tkinter", slug: "tkinter", category: "other", iconKey: "python", color: "#3776AB" },
  { name: "RFID", slug: "rfid", category: "other", iconKey: "nfc", color: "#22D3EE" },
];

// ───────────────────────────────────────────────────────────────────────────
//  COMPÉTENCES
//  Les paliers reprennent exactement les rubriques du CV
//  (« Good Knowledge » et « Basics »). Ajustables depuis /admin.
// ───────────────────────────────────────────────────────────────────────────

type SkillSeed = {
  name: string;
  category: string;
  proficiency: "BASICS" | "GOOD_KNOWLEDGE" | "ADVANCED" | "EXPERT";
  /// Slug de la technologie liée : réutilise son logo et sa couleur.
  technology?: string;
  highlighted?: boolean;
};

export const skillsData: SkillSeed[] = [
  // Cœur de stack — utilisé en conditions réelles sur le projet Casa Prestations
  { name: "Java", category: "languages", proficiency: "ADVANCED", technology: "java", highlighted: true },
  { name: "Spring Boot", category: "backend", proficiency: "ADVANCED", technology: "spring-boot", highlighted: true },
  { name: "Spring Security", category: "backend", proficiency: "ADVANCED", technology: "spring-security", highlighted: true },
  { name: "React.js", category: "frontend", proficiency: "ADVANCED", technology: "react", highlighted: true },
  { name: "PostgreSQL", category: "databases", proficiency: "ADVANCED", technology: "postgresql", highlighted: true },
  { name: "REST API", category: "security-api", proficiency: "ADVANCED", technology: "rest-api", highlighted: true },
  { name: "JWT", category: "security-api", proficiency: "ADVANCED", technology: "jwt", highlighted: true },
  { name: "Docker", category: "devops", proficiency: "ADVANCED", technology: "docker", highlighted: true },

  { name: "JavaScript", category: "languages", proficiency: "ADVANCED", technology: "javascript" },
  { name: "MySQL", category: "databases", proficiency: "ADVANCED", technology: "mysql" },
  { name: "HTML5", category: "frontend", proficiency: "ADVANCED", technology: "html5" },
  { name: "CSS3", category: "frontend", proficiency: "ADVANCED", technology: "css3" },
  { name: "JEE", category: "backend", proficiency: "ADVANCED", technology: "jee" },
  { name: "Git", category: "tools", proficiency: "ADVANCED", technology: "git" },
  { name: "GitHub", category: "tools", proficiency: "ADVANCED", technology: "github" },
  { name: "MVC", category: "architecture", proficiency: "ADVANCED", technology: "mvc" },
  { name: "UML", category: "architecture", proficiency: "ADVANCED", technology: "uml" },
  { name: "Design Patterns", category: "architecture", proficiency: "ADVANCED", technology: "design-patterns" },
  { name: "Agile Scrum", category: "architecture", proficiency: "ADVANCED", technology: "agile-scrum" },
  { name: "Gestion des rôles et permissions", category: "security-api", proficiency: "ADVANCED", technology: "rbac" },

  // « Good Knowledge » — rubrique du CV
  { name: "JPA / Hibernate", category: "backend", proficiency: "GOOD_KNOWLEDGE", technology: "hibernate" },
  { name: "Linux", category: "devops", proficiency: "GOOD_KNOWLEDGE", technology: "linux" },
  { name: "Node.js", category: "backend", proficiency: "GOOD_KNOWLEDGE", technology: "nodejs" },
  { name: "Next.js", category: "backend", proficiency: "GOOD_KNOWLEDGE", technology: "nextjs" },
  { name: "Express.js", category: "backend", proficiency: "GOOD_KNOWLEDGE", technology: "express" },
  { name: "Oracle", category: "databases", proficiency: "GOOD_KNOWLEDGE", technology: "oracle" },
  { name: "Python", category: "languages", proficiency: "GOOD_KNOWLEDGE", technology: "python" },

  // « Basics » — rubrique du CV
  { name: "SonarQube", category: "devops", proficiency: "BASICS", technology: "sonarqube" },
  { name: "Jenkins", category: "devops", proficiency: "BASICS", technology: "jenkins" },
  { name: "Terraform", category: "devops", proficiency: "BASICS", technology: "terraform" },
  { name: "Ansible", category: "devops", proficiency: "BASICS", technology: "ansible" },
  { name: "Kafka", category: "devops", proficiency: "BASICS", technology: "kafka" },
  { name: "Redis", category: "databases", proficiency: "BASICS", technology: "redis" },
  { name: "C#", category: "languages", proficiency: "BASICS", technology: "csharp" },
  { name: ".NET", category: "other", proficiency: "BASICS", technology: "dotnet" },
  { name: "C", category: "languages", proficiency: "BASICS", technology: "c" },
  { name: "JavaFX", category: "other", proficiency: "BASICS", technology: "javafx" },
  { name: "Tkinter", category: "other", proficiency: "BASICS", technology: "tkinter" },
];
