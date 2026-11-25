# Bokhismany Trading SARL — site web

Application TanStack Start pour Bokhismany Trading SARL et sa marque de points de vente Daayake Food. Le site permet de consulter le catalogue, de composer un panier et de réserver un panier avec un code valable 24 heures, à retirer et à payer en boutique. Aucun paiement en ligne n'est effectué.

## Stack

- TanStack Start, React et TypeScript
- Tailwind CSS v4 pour le système de design
- Drizzle ORM avec PostgreSQL (pilote `pg`)
- Nitro pour le serveur de production
- Docker Compose pour PostgreSQL, les migrations et l'application
- Playwright pour les tests de parcours et les vérifications visuelles

## Fonctionnalités

- Catalogue filtrable et recherchable, avec visuels de remplacement si aucune photo n'est fournie.
- Fiches produits avec prix indicatif et quantité.
- Panier conservé dans le navigateur et récapitulatif du montant estimé.
- Réservation en ligne : code à 6 caractères, valable 24 heures, calculé à la lecture.
- Suivi de réservation par code et retrait en boutique, sans paiement en ligne.
- Administration protégée : tableau de bord, réservations, bons de commande, registre des factures avec validation manuelle du paiement, coupons, export CSV, produits, messages, promotion et équipe dirigeante.
- Formulaires de contact et de réservation validés côté client et côté serveur.
- Visuels officiels dérivés de `brief/images` : bannière, logos, favicon et image de partage.
- Métadonnées de partage complètes, avec le nom complet de l'entreprise.
- Proforma du panier, bons de commande et confirmation de réservation exportables en PDF.

## Prérequis

- Docker et Docker Compose (local et serveur de production)
- Node.js 20 ou plus récent et pnpm pour le développement hors conteneur

## Installation et lancement

```bash
cp .env.example .env
```

Renseigne les variables dans `.env` (fichier local, ignoré par git). Les valeurs réelles ne doivent jamais être écrites dans le dépôt.

| Variable | Rôle |
|---|---|
| `POSTGRES_DB` | Nom de la base créée par le conteneur (`bokhismany` par défaut). |
| `POSTGRES_USER` | Utilisateur PostgreSQL du conteneur (`bokhismany` par défaut). |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL, obligatoire et secret. |
| `DB_PORT` | Port PostgreSQL exposé sur l'hôte (`5433` par défaut). |
| `APP_PORT` | Port HTTP de l'application (`3000` par défaut). |
| `DATABASE_URL` | URL utilisée par `pnpm dev` et les scripts hors conteneur ; pointe vers `127.0.0.1:${DB_PORT}`. Compose construit automatiquement l'URL interne `db:5432` pour ses conteneurs. |
| `ADMIN_EMAIL` | Email du compte administrateur créé par le seed. |
| `ADMIN_PASSWORD` | Mot de passe fort du compte administrateur, haché avant stockage. |
| `SESSION_SECRET` | Secret de signature des sessions, au moins 32 caractères aléatoires. |

Puis lancer toute la pile :

```bash
docker compose up -d --build
```

Compose attend que PostgreSQL soit prêt, applique les migrations et le seed dans le conteneur `migrate`, puis démarre l'application. Le site est disponible sur `http://localhost:${APP_PORT:-3000}` et l'administration sur `/admin/connexion`.

## Développement sans conteneur applicatif

```bash
docker compose up -d db
pnpm install
pnpm db:migrate && pnpm db:seed
pnpm dev
```

La `DATABASE_URL` du `.env` doit alors utiliser `127.0.0.1:${DB_PORT}`.

## Commandes

| Commande | Action |
|---|---|
| `docker compose up -d --build` | Construit les images, prépare la base et lance le site. |
| `docker compose logs -f app` | Affiche les logs de l'application. |
| `docker compose down` | Arrête la pile ; les données restent dans le volume `db-data`. |
| `pnpm dev` | Lance le serveur de développement sur le port 3000. |
| `pnpm build` | Construit l'application et vérifie les types. |
| `pnpm typecheck` | Vérifie uniquement les types. |
| `pnpm db:generate` | Génère une migration à partir du schéma Drizzle. |
| `pnpm db:migrate` | Applique les migrations à la base configurée. |
| `pnpm db:check` | Vérifie la connexion à la base. |
| `pnpm db:seed` | Importe `brief/produits.csv`, les réglages de promotion et le compte administrateur. |
| `pnpm test:e2e` | Lance les scénarios Playwright sur les 4 configurations. |

## Base de données

Le schéma est décrit dans `src/lib/db/schema.ts` et suit le cahier des charges. Les migrations générées sont versionnées dans `drizzle/`. Elles couvrent les produits, les réservations, les articles réservés, les administrateurs, les messages de contact, les sessions d'administration, les réglages du site, la limitation des tentatives de connexion, les membres de l'équipe dirigeante, les commandes et les coupons.

Le seed est idempotent : il conserve les prix, la disponibilité et l'état actif déjà définis depuis l'administration. Il crée le compte administrateur à partir de `ADMIN_EMAIL` et `ADMIN_PASSWORD` uniquement s'il n'existe pas, et le met à jour si ces variables changent.

Avant toute migration sur la base utilisée en production :

1. Faire une sauvegarde : `docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > sauvegarde.sql`.
2. Tester la migration sur une copie de la base (autre volume ou autre base de test).
3. Vérifier la connexion avec `pnpm db:check` ou `docker compose exec db pg_isready -U "$POSTGRES_USER"`.
4. Appliquer seulement ensuite sur la base de production via `docker compose up -d --build`.

Après une migration sur une base vide, le conteneur `migrate` exécute automatiquement le seed.

## Déploiement

Le déploiement se fait sur un serveur Docker, sans Vercel :

1. Copier le dépôt sur le serveur et créer le `.env` avec des valeurs fortes (hors git).
2. Lancer `docker compose up -d --build`. Le service `migrate` prépare la base avant l'application.
3. Placer un reverse proxy HTTPS devant le port `APP_PORT` (nom de domaine et certificat : `TODO`).
4. Vérifier les logs (`docker compose logs -f app`) et le parcours complet : catalogue, panier, réservation, proforma, connexion admin, commandes et coupons.

## Règles du dépôt

Le dépôt est public : aucun secret, URL de base réelle, token ou mot de passe ne doit y être commité. Seules les informations de `brief/ENTREPRISE.md` peuvent être publiées sur le site. Les informations manquantes sont marquées `TODO` et listées dans ce fichier plutôt qu'inventées.

## Points à faire valider

- Noms, fonctions, portraits et biographies de l'équipe dirigeante (section `TODO` sur « À propos » tant que la table est vide).
- Histoire de l'entreprise et date de création (`TODO` sur « À propos »).
- Descriptions détaillées des produits dont la fiche est encore vide (`TODO` sur la fiche produit).
- Horaires d'ouverture des trois points de vente (`TODO` sur « Adresses »).
- Slogan définitif.
- Photos produits réelles ou accord pour conserver les visuels de remplacement.
- Textes promotionnels et date de fin éventuelle, modifiables depuis l'administration.
- Quantité maximale et montant minimum pour une réservation.
- Notification par email ou WhatsApp à chaque réservation.
- Nom de domaine personnalisé et certificat HTTPS.
- Besoin d'une version anglaise.
- Nombre d'administrateurs prévu.
- Serveur Docker de production et procédure de sauvegarde automatisée.
