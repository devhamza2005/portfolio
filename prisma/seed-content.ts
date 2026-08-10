/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CONTENU INITIAL — Projets, expériences, formation, réalisations
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Comme `seed-data.ts` : uniquement pour l'amorçage. Tout est ensuite éditable
 * depuis /admin, y compris le moindre paragraphe des case studies.
 */

type ProjectSeed = {
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  category: string;
  status: "COMPLETED" | "IN_PROGRESS" | "MAINTAINED" | "ARCHIVED";
  year?: number;
  startDate?: string;
  endDate?: string;
  role?: string;
  teamSize?: number;
  client?: string;
  context?: string;
  demoUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  overview?: string;
  problem?: string;
  solution?: string;
  architecture?: string;
  results?: string;
  learnings?: string;
  technologies: string[];
  features?: { title: string; description?: string; iconKey?: string }[];
  challenges?: { title: string; problem: string; solution: string }[];
  metrics?: { label: string; value: string; unit?: string; iconKey?: string }[];
};

export const projectsData: ProjectSeed[] = [
  // ═════════════════════════════════════════════════════════════════════════
  //  PROJET PHARE
  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: "convention-management-casa-prestations",
    title: "Convention Management",
    subtitle: "Casa Prestations — SDL de la Commune de Casablanca",
    summary:
      "Plateforme web de gestion intelligente des conventions et des coopérations : suivi du cycle " +
      "de vie complet d'une convention, gestion documentaire, workflow de validation, pilotage " +
      "budgétaire et tableau de bord décisionnel.",
    category: "web",
    status: "COMPLETED",
    year: 2026,
    role: "Développeur Full Stack — conception, backend, frontend, déploiement",
    teamSize: 2,
    client: "Casa Prestations — Société de Développement Local de la Commune de Casablanca",
    context: "Projet de Fin d'Études",
    featured: true,

    overview:
      "Convention Management est l'application que j'ai conçue et développée en binôme dans le " +
      "cadre de mon Projet de Fin d'Études, pour Casa Prestations, la société de développement " +
      "local de la Commune de Casablanca.\n\n" +
      "L'objectif : donner aux équipes un outil unique pour piloter l'ensemble des conventions " +
      "signées avec leurs partenaires — de la rédaction initiale à la clôture, en passant par la " +
      "validation hiérarchique, le suivi des financements et l'archivage des pièces justificatives.",

    problem:
      "Le suivi des conventions et des coopérations reposait sur des fichiers bureautiques et des " +
      "échanges par email. Trois conséquences directes :\n\n" +
      "• **Aucune vision d'ensemble.** Impossible de savoir rapidement combien de conventions " +
      "étaient actives, avec quels partenaires, pour quels montants.\n" +
      "• **Un circuit de validation informel.** Les étapes d'approbation n'étaient pas tracées : " +
      "en cas de contrôle, reconstituer qui avait validé quoi, et quand, demandait un travail " +
      "manuel considérable.\n" +
      "• **Des documents dispersés.** Les pièces justificatives étaient réparties entre plusieurs " +
      "postes et boîtes mail, sans version de référence.",

    solution:
      "J'ai conçu une application web centralisée, structurée autour du cycle de vie de la " +
      "convention. Chaque convention devient un objet unique, identifié par une référence générée " +
      "automatiquement, auquel se rattachent ses partenaires, ses financements, ses documents et " +
      "son historique de validation.\n\n" +
      "Le circuit d'approbation est modélisé sous forme de workflow : chaque transition d'état est " +
      "soumise à une permission, notifiée aux acteurs concernés et inscrite dans un journal " +
      "d'audit immuable. Un tableau de bord agrège les indicateurs clés, et un assistant " +
      "intelligent aide à retrouver l'information dans le corpus documentaire.",

    architecture:
      "**Backend — Spring Boot**\n" +
      "API REST organisée en couches (controller → service → repository) selon une architecture " +
      "MVC. La persistance passe par Spring Data JPA sur PostgreSQL. Spring Security assure " +
      "l'authentification par JWT et le contrôle d'accès par rôle sur chaque endpoint.\n\n" +
      "**Frontend — React**\n" +
      "Application monopage consommant l'API REST. Routage protégé selon le rôle de " +
      "l'utilisateur : l'interface ne présente que les actions réellement autorisées côté serveur.\n\n" +
      "**Base de données — PostgreSQL**\n" +
      "Modèle relationnel normalisé, conçu à partir des diagrammes UML (cas d'utilisation, " +
      "classes, séquences) réalisés en phase d'analyse.\n\n" +
      "**Déploiement — Docker**\n" +
      "Backend, frontend et base de données conteneurisés, ce qui rend l'environnement " +
      "reproductible et le déploiement indépendant de la machine hôte.\n\n" +
      "**Méthode — Agile Scrum**\n" +
      "Développement itératif en sprints, avec démonstrations régulières auprès de l'encadrant " +
      "métier pour valider les fonctionnalités au fur et à mesure.",

    results:
      "L'application couvre les douze modules fonctionnels prévus au cahier des charges et a été " +
      "soutenue devant le jury de fin d'études, qui l'a validée avec la mention **Très Bien " +
      "(17/20)**.\n\n" +
      "Au-delà de la note, le projet m'a mis en situation professionnelle réelle : recueil des " +
      "besoins auprès d'utilisateurs métier, arbitrages de conception, travail en binôme sur une " +
      "base de code partagée, et livraison d'un produit destiné à être utilisé.",

    learnings:
      "Ce projet m'a appris que la difficulté d'une application de gestion n'est presque jamais " +
      "technique : elle est dans la modélisation du domaine. Les semaines passées sur les " +
      "diagrammes UML avant d'écrire la première ligne de code ont été les plus rentables du " +
      "projet.\n\n" +
      "J'y ai aussi mesuré l'importance de la sécurité par défaut : concevoir les permissions dès " +
      "le modèle de données, plutôt que de les ajouter après coup dans l'interface.",

    technologies: [
      "java",
      "spring-boot",
      "spring-security",
      "react",
      "postgresql",
      "jwt",
      "rest-api",
      "docker",
      "git",
      "uml",
      "hibernate",
      "agile-scrum",
      "mvc",
    ],

    features: [
      {
        title: "Gestion des conventions",
        description:
          "Cycle de vie complet : création, qualification, suivi des échéances, renouvellement et clôture.",
        iconKey: "FileSignature",
      },
      {
        title: "Gestion des partenaires",
        description:
          "Répertoire des organismes partenaires et de leurs conventions, avec historique des collaborations.",
        iconKey: "Handshake",
      },
      {
        title: "Gestion des financements",
        description:
          "Suivi des engagements budgétaires rattachés à chaque convention et à chaque partenaire.",
        iconKey: "Wallet",
      },
      {
        title: "Gestion documentaire (GED)",
        description:
          "Dépôt, classement et consultation des pièces justificatives, rattachées à la convention concernée.",
        iconKey: "FolderTree",
      },
      {
        title: "Workflow de validation",
        description:
          "Circuit d'approbation multi-niveaux : chaque transition d'état est soumise à autorisation et tracée.",
        iconKey: "GitPullRequestArrow",
      },
      {
        title: "Authentification JWT",
        description:
          "Connexion sécurisée par jeton signé, sans état côté serveur, gérée par Spring Security.",
        iconKey: "KeyRound",
      },
      {
        title: "Rôles et permissions",
        description:
          "Contrôle d'accès granulaire : chaque endpoint et chaque écran dépend du rôle de l'utilisateur.",
        iconKey: "ShieldCheck",
      },
      {
        title: "Notifications",
        description:
          "Alertes automatiques sur les demandes de validation, les échéances et les changements d'état.",
        iconKey: "BellRing",
      },
      {
        title: "Tableau de bord KPI",
        description:
          "Indicateurs consolidés : volumes, répartition par partenaire, montants engagés, états d'avancement.",
        iconKey: "LayoutDashboard",
      },
      {
        title: "Journal d'audit",
        description:
          "Historique inaltérable de toutes les actions sensibles : qui a fait quoi, sur quel objet, et quand.",
        iconKey: "ScrollText",
      },
      {
        title: "Assistant intelligent",
        description:
          "Aide à la recherche et à l'exploitation de l'information contenue dans le corpus des conventions.",
        iconKey: "Sparkles",
      },
      {
        title: "Références automatiques",
        description:
          "Génération d'un identifiant unique et normalisé pour chaque convention, dès sa création.",
        iconKey: "Hash",
      },
    ],

    challenges: [
      {
        title: "Modéliser un workflow de validation évolutif",
        problem:
          "Le circuit d'approbation devait pouvoir évoluer sans réécriture : coder les transitions " +
          "en dur dans les services aurait figé le processus métier.",
        solution:
          "J'ai modélisé les états et les transitions comme des données, avec une permission " +
          "associée à chaque transition. Le service de validation lit cette configuration au lieu " +
          "de l'imposer, ce qui permet d'ajuster le circuit sans toucher au code.",
      },
      {
        title: "Sécuriser l'API de bout en bout",
        problem:
          "Masquer un bouton dans l'interface React ne protège rien : l'endpoint reste appelable " +
          "directement. Chaque règle métier devait être appliquée côté serveur.",
        solution:
          "Spring Security contrôle systématiquement les autorisations au niveau des endpoints, et " +
          "le frontend consomme les permissions renvoyées par l'API pour adapter l'affichage. " +
          "L'interface reflète la sécurité, elle ne la remplace pas.",
      },
      {
        title: "Garantir la traçabilité sans alourdir le code métier",
        problem:
          "Journaliser chaque action sensible en appelant explicitement un service d'audit dans " +
          "chaque méthode aurait dispersé la logique et multiplié les oublis.",
        solution:
          "La journalisation a été centralisée et déclenchée de façon transverse aux opérations " +
          "sensibles, ce qui garantit un historique complet tout en gardant les services métier " +
          "concentrés sur leur responsabilité.",
      },
      {
        title: "Travailler à deux sur une base de code partagée",
        problem:
          "En binôme sur backend et frontend simultanément, le risque de conflits et de " +
          "régressions était permanent.",
        solution:
          "Découpage strict des responsabilités par module, travail par branches Git avec " +
          "intégration régulière, et contrat d'API défini avant l'implémentation des deux côtés.",
      },
    ],

    metrics: [
      { label: "Modules fonctionnels", value: "12", iconKey: "Blocks" },
      { label: "Note de soutenance", value: "17", unit: "/20", iconKey: "Award" },
      { label: "Développeurs", value: "2", iconKey: "Users" },
      { label: "Services conteneurisés", value: "3", iconKey: "Container" },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  //  AUTRES PROJETS
  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: "parking-management-rfid",
    title: "Parking Management RFID",
    subtitle: "Gestion de parking par badge RFID",
    summary:
      "Système de gestion de parking bâti sur la technologie RFID, avec matériel réel : " +
      "identification des véhicules par badge, contrôle des accès et suivi des places.",
    category: "iot",
    status: "COMPLETED",
    role: "Développeur — équipe de 5 personnes",
    teamSize: 5,
    context: "Projet académique présenté comme produit",
    technologies: ["rfid", "agile-scrum", "java", "mysql"],

    overview:
      "Projet mené en équipe de cinq, associant développement logiciel et matériel RFID réel. " +
      "Le système identifie les véhicules à l'entrée via un badge, autorise ou refuse l'accès, " +
      "et tient à jour l'état d'occupation du parking.",
    problem:
      "La gestion manuelle d'un parking ne permet ni de contrôler finement les accès, ni de " +
      "connaître en temps réel les places disponibles.",
    solution:
      "Chaque véhicule autorisé est associé à un badge RFID. À la lecture du badge, le système " +
      "vérifie les droits, déclenche l'ouverture et met à jour le compteur de places. " +
      "Le projet a été développé en Scrum, avec des démonstrations régulières.",
    results:
      "Le système a été présenté comme un produit devant des entreprises, dont **Capgemini**.",

    features: [
      { title: "Identification par badge RFID", iconKey: "ScanLine" },
      { title: "Contrôle des accès", iconKey: "DoorOpen" },
      { title: "Suivi des places en temps réel", iconKey: "SquareParking" },
      { title: "Intégration matérielle réelle", iconKey: "Cpu" },
    ],
    metrics: [
      { label: "Membres de l'équipe", value: "5", iconKey: "Users" },
      { label: "Méthode", value: "Scrum", iconKey: "Repeat" },
    ],
  },

  {
    slug: "cabinet-medical",
    title: "Cabinet Médical",
    subtitle: "Application desktop de gestion de cabinet",
    summary:
      "Application de bureau pour la gestion d'un cabinet médical : dossiers patients, " +
      "planification des rendez-vous et suivi des consultations.",
    category: "desktop",
    status: "COMPLETED",
    role: "Développeur — binôme",
    teamSize: 2,
    context: "Projet académique",
    technologies: ["java", "javafx", "mysql", "mvc"],

    overview:
      "Application desktop développée en binôme, destinée au personnel d'un cabinet médical. " +
      "L'interface JavaFX privilégie la rapidité de saisie, contrainte principale d'un usage " +
      "en accueil de cabinet.",
    problem:
      "Un cabinet a besoin d'un accès immédiat au dossier d'un patient et à son historique, " +
      "sans dépendre d'une connexion internet.",
    solution:
      "Une application native s'appuyant sur une base MySQL locale, structurée en MVC : " +
      "gestion des patients, des rendez-vous et des dossiers médicaux dans un outil unique.",

    features: [
      { title: "Gestion des patients", iconKey: "UserRound" },
      { title: "Gestion des rendez-vous", iconKey: "CalendarDays" },
      { title: "Dossiers médicaux", iconKey: "FileHeart" },
    ],
  },

  {
    slug: "todo-list-avancee",
    title: "To-Do List Avancée",
    subtitle: "Application web de gestion de tâches",
    summary:
      "Application web de gestion de tâches avec authentification, organisation avancée des " +
      "tâches et interface dynamique.",
    category: "web",
    status: "COMPLETED",
    context: "Projet personnel",
    technologies: ["react", "express", "mysql", "nodejs", "javascript", "rest-api"],

    overview:
      "Application full stack JavaScript : frontend React, API Express, persistance MySQL. " +
      "Chaque utilisateur dispose de son propre espace, protégé par authentification.",
    solution:
      "Le frontend consomme une API REST Express. L'interface se met à jour sans rechargement " +
      "de page, ce qui rend la manipulation des tâches immédiate.",

    features: [
      { title: "Authentification utilisateur", iconKey: "KeyRound" },
      { title: "Gestion avancée des tâches", iconKey: "ListTodo" },
      { title: "Interface dynamique", iconKey: "Zap" },
    ],
  },

  {
    slug: "devops-cicd-chatbot",
    title: "Pipeline CI/CD — Automatisation d'un ChatBot",
    subtitle: "Chaîne d'intégration et de déploiement continus",
    summary:
      "Mise en place d'une chaîne CI/CD complète pour un ChatBot : analyse de qualité du code, " +
      "conteneurisation, provisionnement d'infrastructure et déploiement automatisé.",
    category: "devops",
    status: "COMPLETED",
    context: "Projet personnel",
    technologies: [
      "docker",
      "jenkins",
      "sonarqube",
      "ansible",
      "terraform",
      "github",
      "git",
      "linux",
    ],

    overview:
      "Projet personnel centré sur l'automatisation. L'objectif n'était pas le ChatBot lui-même, " +
      "mais la chaîne qui le construit, le contrôle et le déploie sans intervention manuelle.",
    problem:
      "Un déploiement manuel est lent, non reproductible, et laisse passer des régressions de " +
      "qualité qu'aucune étape ne contrôle.",
    solution:
      "Un commit sur GitHub déclenche le pipeline Jenkins : analyse statique du code par " +
      "SonarQube, construction de l'image Docker, provisionnement de l'infrastructure par " +
      "Terraform, puis configuration et déploiement par Ansible.",
    architecture:
      "**GitHub** (source) → **Jenkins** (orchestration) → **SonarQube** (qualité) → " +
      "**Docker** (image) → **Terraform** (infrastructure) → **Ansible** (configuration et " +
      "déploiement).",

    features: [
      { title: "Pipeline CI/CD Jenkins", iconKey: "Workflow" },
      { title: "Analyse qualité SonarQube", iconKey: "ShieldCheck" },
      { title: "Conteneurisation Docker", iconKey: "Container" },
      { title: "Infrastructure as Code Terraform", iconKey: "Boxes" },
      { title: "Automatisation Ansible", iconKey: "Settings2" },
    ],
  },

  {
    slug: "annuaire-telephonique",
    title: "Annuaire Téléphonique",
    subtitle: "Gestion de contacts — mission freelance",
    summary:
      "Application web de gestion de contacts avec CRUD complet, développée dans le cadre " +
      "d'une mission freelance.",
    category: "web",
    status: "COMPLETED",
    context: "Mission freelance",
    technologies: ["react", "spring-boot", "mysql", "html5", "css3", "javascript", "rest-api"],

    overview:
      "Première mission freelance : une application de gestion de contacts, avec un frontend " +
      "React et une API Spring Boot adossée à MySQL.",
    solution:
      "CRUD complet sur les contacts, exposé par une API REST Spring Boot et consommé par une " +
      "interface React.",

    features: [
      { title: "Création et modification de contacts", iconKey: "UserPlus" },
      { title: "Recherche et consultation", iconKey: "Search" },
      { title: "Suppression sécurisée", iconKey: "Trash2" },
    ],
  },

  {
    slug: "refonte-abs-competence",
    title: "Refonte du site ABS Compétence",
    subtitle: "Projet de compétition académique",
    summary:
      "Refonte complète du site web d'ABS Compétence, réalisée dans le cadre d'une compétition " +
      "académique — projet sélectionné parmi les trois premiers.",
    category: "web",
    status: "COMPLETED",
    context: "Compétition académique",
    technologies: ["html5", "css3", "javascript"],

    overview:
      "Compétition académique consistant à repenser entièrement le site d'ABS Compétence : " +
      "structure de l'information, identité visuelle et expérience de navigation.",
    results: "Projet **sélectionné parmi les trois premiers** de la compétition.",

    metrics: [{ label: "Classement", value: "Top 3", iconKey: "Trophy" }],
  },
];

// ───────────────────────────────────────────────────────────────────────────
//  EXPÉRIENCES
// ───────────────────────────────────────────────────────────────────────────

export const experiencesData = [
  {
    company: "Casa Prestations — SDL de la Commune de Casablanca",
    role: "Développeur Full Stack — Projet de Fin d'Études",
    employmentType: "PROJECT" as const,
    workMode: "HYBRID" as const,
    location: "Casablanca, Maroc",
    startDate: "2026-01-01",
    endDate: null,
    current: false,
    description:
      "Conception et développement, en binôme, d'une application web de gestion intelligente " +
      "des conventions et des coopérations pour la société de développement local de la " +
      "Commune de Casablanca.",
    highlights: [
      "Analyse des besoins métier et modélisation UML (cas d'utilisation, classes, séquences)",
      "Développement de l'API REST en Spring Boot, organisée selon une architecture MVC",
      "Sécurisation de l'application avec Spring Security et authentification par JWT",
      "Mise en place du contrôle d'accès par rôles et permissions sur l'ensemble des endpoints",
      "Développement de l'interface React : tableaux de bord, workflow de validation, GED",
      "Conception du schéma relationnel PostgreSQL à partir du modèle de domaine",
      "Conteneurisation des services avec Docker pour un déploiement reproductible",
      "Travail en Agile Scrum avec démonstrations régulières auprès de l'encadrant métier",
    ],
    technologies: [
      "java",
      "spring-boot",
      "spring-security",
      "react",
      "postgresql",
      "jwt",
      "rest-api",
      "docker",
      "git",
      "uml",
    ],
  },
  {
    company: "Exxelia Maroc",
    role: "Stagiaire — Administration et Maintenance Informatique",
    employmentType: "INTERNSHIP" as const,
    workMode: "ONSITE" as const,
    location: "Mohammedia, Maroc",
    startDate: "2024-01-01",
    endDate: null,
    current: false,
    description:
      "Stage en administration système et maintenance de l'infrastructure informatique du site " +
      "industriel.",
    highlights: [
      "Administration de systèmes Linux",
      "Maintenance du matériel réseau, notamment des switchs",
      "Diagnostic et maintenance du parc matériel",
    ],
    technologies: ["linux"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
//  FORMATION
// ───────────────────────────────────────────────────────────────────────────

export const educationData = [
  {
    school: "SUP2I / SUPEMIR",
    degree: "Licence en Développement Web et Logiciel",
    field: "Développement Web et Logiciel",
    grade: "17/20",
    mention: "Très Bien",
    honors: "Soutenance de Projet de Fin d'Études validée",
    status: "PENDING_DIPLOMA" as const,
    location: "Casablanca, Maroc",
    description:
      "Projet de Fin d'Études réalisé pour Casa Prestations, société de développement local de " +
      "la Commune de Casablanca. Diplôme actuellement en attente de délivrance.",
  },
  {
    school: "SUP2I",
    degree: "DEUG en Réseaux et Développement",
    field: "Réseaux et Développement",
    status: "COMPLETED" as const,
    startDate: "2023-09-01",
    endDate: "2025-07-01",
    location: "Casablanca, Maroc",
    description:
      "Formation couvrant les fondamentaux du développement logiciel, des bases de données et " +
      "des réseaux.",
  },
  {
    school: "Baccalauréat",
    degree: "Baccalauréat Sciences Physiques",
    field: "Sciences Physiques",
    mention: "Bien",
    status: "COMPLETED" as const,
    startDate: "2022-09-01",
    endDate: "2023-07-01",
    location: "Maroc",
  },
];

// ───────────────────────────────────────────────────────────────────────────
//  RÉALISATIONS
// ───────────────────────────────────────────────────────────────────────────

export const achievementsData = [
  {
    title: "Projet de Fin d'Études validé avec mention Très Bien",
    description:
      "Soutenance du PFE « Gestion intelligente des conventions et des coopérations », réalisé " +
      "pour Casa Prestations, validée avec la note de 17/20 et la mention Très Bien.",
    category: "Distinction académique",
    organisation: "SUP2I / SUPEMIR",
    year: 2026,
    iconKey: "Award",
    featured: true,
  },
  {
    title: "Projet RFID présenté devant Capgemini",
    description:
      "Le système de gestion de parking RFID, développé en équipe de cinq, a été présenté comme " +
      "un produit devant des entreprises, dont Capgemini.",
    category: "Présentation professionnelle",
    iconKey: "Presentation",
    featured: true,
  },
  {
    title: "Top 3 — Compétition de refonte web ABS Compétence",
    description:
      "Projet de refonte du site d'ABS Compétence sélectionné parmi les trois premiers de la " +
      "compétition académique.",
    category: "Compétition",
    iconKey: "Trophy",
    featured: true,
  },
];

// ───────────────────────────────────────────────────────────────────────────
//  SERVICES — « What I do »
// ───────────────────────────────────────────────────────────────────────────

export const servicesData = [
  {
    title: "Développement Backend Java",
    description:
      "Conception et développement d'API REST robustes avec Spring Boot : modélisation du " +
      "domaine, persistance JPA, sécurité et documentation.",
    iconKey: "Server",
    features: [
      "API REST Spring Boot",
      "Spring Security & JWT",
      "Modélisation PostgreSQL / MySQL",
      "Architecture MVC en couches",
    ],
  },
  {
    title: "Développement Frontend React",
    description:
      "Interfaces web modernes, réactives et accessibles, connectées à vos API et pensées pour " +
      "un usage quotidien.",
    iconKey: "Layout",
    features: [
      "Applications React",
      "Interfaces responsive",
      "Consommation d'API REST",
      "Tableaux de bord et visualisations",
    ],
  },
  {
    title: "Applications Full Stack sur mesure",
    description:
      "Prise en charge du projet de bout en bout : analyse du besoin, modélisation UML, " +
      "développement, tests et mise en production.",
    iconKey: "Layers",
    features: [
      "Analyse et modélisation UML",
      "Développement full stack",
      "Gestion des rôles et permissions",
      "Méthode Agile Scrum",
    ],
  },
  {
    title: "DevOps & Automatisation",
    description:
      "Conteneurisation et automatisation du déploiement pour rendre vos livraisons " +
      "reproductibles et fiables.",
    iconKey: "Container",
    features: [
      "Conteneurisation Docker",
      "Pipelines CI/CD Jenkins",
      "Analyse qualité SonarQube",
      "Infrastructure as Code",
    ],
  },
];

// ───────────────────────────────────────────────────────────────────────────
//  STATISTIQUES — toutes calculées à partir des données réelles (§25)
// ───────────────────────────────────────────────────────────────────────────

export const statCardsData = [
  { label: "Projets réalisés", source: "PROJECTS_COUNT" as const, iconKey: "FolderKanban" },
  { label: "Technologies maîtrisées", source: "TECHNOLOGIES_COUNT" as const, iconKey: "Boxes" },
  { label: "Années de formation", source: "YEARS_SINCE_START" as const, iconKey: "GraduationCap" },
  { label: "Expériences", source: "EXPERIENCES_COUNT" as const, iconKey: "Briefcase" },
];
