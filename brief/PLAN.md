# Plan de travail

Chaque phase a un objectif, des livrables et des critères de validation. Ne passe à la suivante qu'une fois la précédente validée.

## Phase 0 : préparation
- Lire tout le dossier `brief/`.
- Vérifier la version actuelle de TanStack Start et du preset Vercel dans leur documentation officielle.
- Créer le projet Neon et récupérer l'URL de connexion (à mettre dans `.env` local, jamais dans git).
- **Validation** : projet vide qui se lance en local.

## Phase 1 : socle technique
- Initialiser TanStack Start avec TypeScript et le preset Vercel.
- Mettre en place Tailwind ou le système de styles choisi, les variables de couleurs et de typographie de `DESIGN.md`.
- Configurer Drizzle, la connexion à Neon, et la première migration.
- Créer la structure de dossiers et le fichier `ENV.example`.
- Supprimer l'ancien site statique (`index.html`, `vercel.json` à la racine) et adapter le `README.md`.
- **Validation** : `build` sans erreur, `dev` fonctionnel, base connectée, migration appliquée.

## Phase 2 : layout et header
- Layout global, header sticky, menu mobile animé, footer.
- Logo textuel réutilisable.
- Transitions de page avec View Transitions API.
- **Validation** : header propre sur 375, 768 et 1440 px, navigation au clavier, `prefers-reduced-motion` respecté.

## Phase 3 : accueil et pages statiques
- Accueil complet (héro, activités, promotion, aperçu des produits, adresses).
- Pages « Adresses », « À propos », « Contact » (formulaire enregistré en base).
- **Validation** : pages complètes et responsives, textes conformes à `ENTREPRISE.md`.

## Phase 4 : catalogue
- Script de seed qui importe `produits.csv`.
- Page `/produits` avec filtres, recherche, tri.
- Page `/produits/$slug`.
- **Validation** : tous les produits affichés, filtres fonctionnels, images avec repli élégant.

## Phase 5 : panier et réservation
- Panier local (localStorage), quantités, total estimé, mention « à confirmer en boutique ».
- Création de réservation côté serveur, génération du code, expiration 24 h calculée à la lecture.
- Page de confirmation `/reservation/$code`.
- Limitation anti-abus.
- **Validation** : une réservation créée reste valide 24 h, passe à `expiree` au-delà, et les prix sont copiés dans `reservation_items`.

## Phase 6 : administration
- Seed du compte admin à partir des variables d'environnement.
- Connexion, session sécurisée, protection des routes côté serveur.
- Tableau de bord, liste et détail des réservations, changement de statut.
- Gestion des produits et des messages de contact.
- **Validation** : aucune route admin accessible sans connexion, changements de statut enregistrés, interface responsive.

## Phase 7 : finition
- Revue visuelle de toutes les pages sur les trois largeurs.
- Accessibilité (contrastes, focus, libellés, textes alternatifs).
- Référencement (titres, descriptions, Open Graph).
- Gestion des erreurs et états vides partout.
- TODO : revoir les animations et la view-transition (rendu actuel jugé insuffisant).
- TODO : prix non fournis et donc absents du catalogue public : riz 5 kg, riz 10 kg, lait en poudre en sac, lait Bom-dia, lait bel hollandaise, lait Nido.
- **Validation** : aucune erreur console, Lighthouse accessibilité et performance satisfaisants.

## Phase 8 : déploiement
- Connecter le dépôt à Vercel, configurer les variables d'environnement (`DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, secret de session).
- Lancer les migrations et le seed en production.
- Vérifier le parcours complet en production : catalogue, panier, réservation, expiration, connexion admin.
- **Validation** : site en ligne, parcours complet fonctionnel.

## Points à faire valider par Bokhismany avant la phase 3
- Logo.
- Horaires d'ouverture.
- Slogan et texte de présentation.
- Photos produits (ou accord pour des emplacements vides).
- Texte de la promotion.
