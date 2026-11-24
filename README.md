# Bokhismany Trading SARL — site web

Application TanStack Start pour Bokhismany Trading SARL et sa marque de points de vente Daayake Food. Le site permet de consulter le catalogue, de composer un panier et de réserver un panier avec un code valable 24 heures, à retirer et à payer en boutique. Aucun paiement en ligne n'est effectué.

## Stack

- TanStack Start, React et TypeScript
- Tailwind CSS v4 pour le système de design
- Drizzle ORM avec PostgreSQL (Neon en production)
- Nitro avec le preset Vercel
- Playwright pour les tests de parcours et les vérifications visuelles

## Fonctionnalités

- Catalogue filtrable et recherchable, avec visuels de remplacement si aucune photo n'est fournie.
- Fiches produits avec prix indicatif et quantité.
- Panier conservé dans le navigateur et récapitulatif du montant estimé.
- Réservation en ligne : code à 6 caractères, valable 24 heures, calculé à la lecture.
- Suivi de réservation par code et retrait en boutique, sans paiement en ligne.
- Administration protégée : tableau de bord, réservations, export CSV, produits, messages, promotion et équipe dirigeante.
- Formulaires de contact et de réservation validés côté client et côté serveur.
- Visuels officiels dérivés de `brief/images` : bannière, logos, favicon et image de partage.
- Métadonnées de partage complètes, avec le nom complet de l'entreprise.
- Proforma du panier et confirmation de réservation exportables en PDF avec la bannière officielle.

## Prérequis

- Node.js 20 ou plus récent
- pnpm
- PostgreSQL : une base Neon ou une base locale pour le développement

## Installation

```bash
pnpm install
cp .env.example .env
```

Renseigne les variables dans `.env` (fichier local, ignoré par git). Le tableau ci-dessous décrit leur rôle ; les valeurs réelles ne doivent jamais être écrites dans le dépôt.

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL, avec `sslmode=require` pour Neon. |
| `ADMIN_EMAIL` | Email du compte administrateur créé par le seed. |
| `ADMIN_PASSWORD` | Mot de passe fort du compte administrateur, haché avant stockage. |
| `SESSION_SECRET` | Secret de signature des sessions, au moins 32 caractères aléatoires. |

Pour un développement sans Neon, un PostgreSQL local peut être lancé avec Docker, puis référencé dans `DATABASE_URL` :

```bash
docker run --detach --name bokhismany-db-dev \
  -e POSTGRES_USER=bokhismany \
  -e POSTGRES_DB=bokhismany \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -p 127.0.0.1:5432:5432 \
  postgres:16-alpine
```

## Commandes

| Commande | Action |
|---|---|
| `pnpm dev` | Lance le serveur de développement sur le port 3000. |
| `pnpm build` | Construit l'application et vérifie les types. |
| `pnpm typecheck` | Vérifie uniquement les types. |
| `pnpm db:generate` | Génère une migration à partir du schéma Drizzle. |
| `pnpm db:migrate` | Applique les migrations à la base configurée. |
| `pnpm db:check` | Vérifie la connexion à la base. |
| `pnpm db:seed` | Importe `brief/produits.csv`, les réglages de promotion et le compte administrateur. |
| `pnpm test:e2e` | Lance les scénarios Playwright sur les 4 configurations. |

## Base de données

Le schéma est décrit dans `src/lib/db/schema.ts` et suit le cahier des charges. Les migrations générées sont versionnées dans `drizzle/`. Elles couvrent les produits, les réservations, les articles réservés, les administrateurs, les messages de contact, les sessions d'administration, les réglages du site, la limitation des tentatives de connexion et les membres de l'équipe dirigeante.

Le seed est idempotent : il conserve les prix, la disponibilité et l'état actif déjà définis depuis l'administration. Il crée le compte administrateur à partir de `ADMIN_EMAIL` et `ADMIN_PASSWORD` uniquement s'il n'existe pas, et le met à jour si ces variables changent.

Avant toute migration en production :

1. Créer une branche de sauvegarde dans Neon.
2. Tester la migration sur cette branche avec `pnpm db:migrate`.
3. Vérifier la connexion avec `pnpm db:check`.
4. Appliquer seulement ensuite sur la base de production.

Après une migration sur une base vide, exécuter `pnpm db:seed` pour rendre le catalogue et l'administration utilisables.

## Déploiement sur Vercel

1. Importer le dépôt dans Vercel.
2. Définir les variables d'environnement dans **Settings → Environment Variables**.
3. Laisser Vercel détecter TanStack Start ; le build utilise `pnpm build` et le plugin Nitro.
4. Lancer les migrations manuellement après vérification sur une branche Neon de test.
5. Vérifier les logs du déploiement et le parcours complet en production.

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
- Nom de domaine personnalisé.
- Besoin d'une version anglaise.
- Nombre d'administrateurs prévu.
- Accès au projet Vercel et variables d'environnement de production pour le déploiement réel.
