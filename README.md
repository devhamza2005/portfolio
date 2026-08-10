# Portfolio — Hamza Fanoune

Portfolio personnel de **Hamza Fanoune**, développeur Full Stack Java (Spring Boot / React), basé à Casablanca.

Ce dépôt n'est pas un template statique : c'est une **application full-stack** dont le contenu
(projets, expériences, formations, certifications, compétences, technologies, réalisations)
est stocké en base de données et administrable depuis un back-office `/admin`.
Ajouter un projet ne demande **aucune modification de code**.

---

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Server Components + Server Actions) |
| Langage | TypeScript strict (`noUncheckedIndexedAccess`) |
| Styles | Tailwind CSS v4 — design system en tokens CSS natifs |
| Composants | Radix UI (accessibilité) + primitives maison |
| Animations | Motion — respect systématique de `prefers-reduced-motion` |
| Base de données | PostgreSQL (Neon) via Prisma 6 |
| Authentification | Auth.js v5 — Credentials + Argon2id |
| Images | Cloudinary (via un adaptateur `StorageProvider` interchangeable) |
| Validation | Zod (partagée entre formulaires, Server Actions et types) |
| Déploiement | Vercel |

---

## Démarrage

```bash
# 1. Dépendances
npm install

# 2. Variables d'environnement
cp .env.example .env      # puis compléter les valeurs

# 3. Base de données
npm run db:push           # crée les tables
npm run db:seed           # injecte le contenu initial + le compte admin

# 4. Développement
npm run dev               # http://localhost:3000
```

### Variables d'environnement requises

Voir [`.env.example`](.env.example) pour la liste complète et commentée.
Le minimum pour démarrer : `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

---

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run db:push` | Synchronise le schéma Prisma avec la base |
| `npm run db:migrate` | Crée et applique une migration |
| `npm run db:seed` | Injecte les données initiales |
| `npm run db:studio` | Explorateur de base Prisma Studio |

---

## Architecture

```
src/
├─ app/
│  ├─ (site)/          Site public — Server Components, contenu lu en base
│  ├─ (admin)/admin/   Back-office protégé
│  ├─ api/             Upload, authentification, images OG dynamiques
│  └─ globals.css      ⭐ Design system : couleurs, typo, espacements, animations
├─ components/
│  ├─ ui/              Primitives (Button, Card, Badge, Input, Dialog…)
│  ├─ motion/          Composants d'animation réutilisables
│  ├─ layout/          Navbar, Footer, thème, curseur, progression
│  ├─ sections/        Les sections de la page d'accueil
│  └─ admin/           DataTable, ResourceForm, champs génériques
├─ server/
│  ├─ queries/         Lectures mises en cache (revalidation par tag)
│  ├─ actions/         Mutations (Server Actions) — authentifiées + validées
│  └─ storage/         Adaptateur d'upload (Cloudinary | local)
├─ schemas/            Schémas Zod — source unique de vérité des données
├─ resources/          ⭐ Descripteurs CRUD : génèrent les écrans d'administration
└─ lib/                Utilitaires (SEO, dates, slug, env…)
```

### Principe clé — le CRUD déclaratif

Chaque entité administrable est décrite par un fichier de `src/resources/`
(champs, colonnes, validation, libellés). Les composants `DataTable` et
`ResourceForm` lisent ce descripteur et génèrent l'écran correspondant.

**Conséquence :** ajouter une nouvelle entité au back-office (blog, témoignages…)
= 1 modèle Prisma + 1 fichier descripteur. Aucun écran à écrire.

---

## Licence

Code sous licence MIT. Le contenu éditorial, les images et le CV sont la propriété de Hamza Fanoune.
