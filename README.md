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
| Base de données | PostgreSQL 18 (Neon) via Prisma 7 + adaptateur `@prisma/adapter-pg` |
| Authentification | Auth.js v5 — Credentials + Argon2id, sessions JWT 8 h |
| Images | Adaptateur `StorageProvider` interchangeable : `local` (dev) ou `cloudinary` (production) |
| Validation | Zod v4 (partagée entre formulaires, Server Actions et types) |
| Cache | Cache Components (`use cache` + `cacheTag`), invalidation par `updateTag` |
| Déploiement | Vercel |

---

## Démarrage

```bash
# 1. Dépendances
npm install

# 2. Variables d'environnement
cp .env.example .env      # puis compléter les valeurs

# 3. Base de données
npm run db:deploy         # applique les migrations existantes
npm run db:seed           # injecte le contenu initial + le compte admin

# 4. Développement
npm run dev               # http://localhost:3000
```

> `db:deploy` (et non `db:push`) : le dépôt contient des migrations versionnées.
> `db:push` écrirait le schéma sans les enregistrer, et la base divergerait de
> l'historique.

### Variables d'environnement requises

Voir [`.env.example`](.env.example) pour la liste complète et commentée.
Le minimum pour démarrer : `DATABASE_URL`, `DIRECT_DATABASE_URL`, `AUTH_SECRET`,
`NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

Aucun secret n'est jamais écrit dans le dépôt : `.env` est ignoré par git,
`.env.example` ne contient que des valeurs d'exemple.

---

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run db:deploy` | Applique les migrations en attente (production et premier démarrage) |
| `npm run db:migrate` | Crée et applique une migration (développement) |
| `npm run db:push` | Pousse le schéma sans migration — dépannage uniquement |
| `npm run db:seed` | Injecte les données initiales |
| `npm run db:studio` | Explorateur de base Prisma Studio |

---

## Architecture

```
src/
├─ app/
│  ├─ (site)/          Site public — Server Components, contenu lu en base
│  ├─ (admin)/admin/   Back-office protégé
│  ├─ api/             Téléversement et authentification
│  ├─ sitemap.ts       Plan du site, dérivé de la base
│  ├─ robots.ts        Directives d'exploration
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

## Déploiement (Vercel)

### 1. Préparer la base

Les migrations et l'amorçage se lancent **depuis votre machine**, avant le premier
déploiement — la commande de build de Vercel ne les exécute pas :

```bash
npm run db:deploy
npm run db:seed        # une seule fois
```

Le build interroge la base pour prégénérer les pages : **Neon doit être joignable
pendant le build**.

### 2. Variables d'environnement

À déclarer dans *Project Settings → Environment Variables*, pour les trois
environnements (Production, Preview, Development) :

| Variable | Valeur de production |
|---|---|
| `DATABASE_URL` | chaîne Neon **poolée** (hôte en `-pooler`) |
| `DIRECT_DATABASE_URL` | chaîne Neon **directe** (migrations) |
| `AUTH_SECRET` | secret distinct de celui du local — `npx auth secret` |
| `AUTH_URL` | `https://votre-domaine.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-domaine.com`, sans slash final |
| `STORAGE_PROVIDER` | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | depuis le tableau de bord Cloudinary |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | lues par le seed uniquement |
| `RESEND_API_KEY`, `CONTACT_*` | facultatif |

`NEXT_PUBLIC_SITE_URL` pilote les URL canoniques, le sitemap et l'Open Graph.
Tant qu'elle vaut `localhost`, `robots.txt` interdit toute indexation et les
pages sont marquées `noindex` — c'est volontaire, pour qu'une préproduction ne
concurrence jamais le vrai site.

### 3. Stockage des images — obligatoire

Le système de fichiers de Vercel est **éphémère** : avec `STORAGE_PROVIDER=local`,
toute image téléversée depuis `/admin` disparaîtrait au déploiement suivant.
Cloudinary (ou un autre `StorageProvider`) est donc requis en production.

### 4. Build

Aucune configuration particulière : Vercel détecte Next.js et exécute
`npm run build`, qui lance `prisma generate` avant `next build`.

---

## État de l'implémentation

| Fonctionnalité | État |
|---|---|
| Site public, études de cas, SEO, sitemap, robots, JSON-LD | complet |
| CRUD des 13 ressources de contenu depuis `/admin` | complet |
| Médiathèque et téléversement sécurisé | complet |
| Formulaire de contact (validation, anti-robot, limitation de débit) | complet |
| Édition du **profil** depuis `/admin/profile` (identité, bio, contact, CV, SEO) | complet |
| Boîte de réception des **messages** sur `/admin/messages` (lu, archivé, supprimé) | complet |
| Envoi d'email à la réception d'un message (Resend) | **à faire** — les messages restent consultables dans `/admin/messages` sans lui |
| Internationalisation FR/EN | prévue — champs `i18n` déjà présents au schéma |

---

## Licence

Code sous licence MIT. Le contenu éditorial, les images et le CV sont la propriété de Hamza Fanoune.
