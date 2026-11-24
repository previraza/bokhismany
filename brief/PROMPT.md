# Prompt pour l'IA qui réalise le site

Tu es un développeur full-stack senior. Tu vas réaliser le site web complet de **Bokhismany Trading SARL**, une entreprise de commerce général entre Kinshasa et Brazzaville.

Le dépôt contient un dossier `brief/` avec toutes les informations nécessaires. Lis-le avant d'écrire la moindre ligne de code, dans cet ordre : `PROMPT.md` (ce fichier), `SPEC.md`, `DESIGN.md`, `ENTREPRISE.md`, `PLAN.md`, puis `TOOLS.md`.

## Ce que tu dois construire

Un site moderne, propre et complet, avec :
- un catalogue de produits avec images, catégories et recherche ;
- un panier qui calcule un montant estimé ;
- un système de réservation : le client réserve un panier, reçoit un code valable 24 heures, et vient le retirer et payer en boutique ;
- une interface admin protégée par connexion, pour voir les réservations, changer leur statut et gérer le catalogue ;
- un design soigné, avec animations et transitions de page (View Transitions API), un header de qualité, et un rendu parfait sur mobile, tablette et ordinateur.

## Stack imposée

- **TanStack Start** (React, rendu côté serveur, routes typées). Consulte la documentation officielle pour la version à jour.
- **React** avec TypeScript.
- **Base de données** : Neon (PostgreSQL), avec **Drizzle ORM**.
- **Déploiement** : Vercel (preset Nitro de Vercel pour TanStack Start).
- Styles : Tailwind CSS ou CSS modules, au choix, mais le rendu doit être cohérent avec `DESIGN.md`.

## Contraintes non négociables

1. **Le design est une priorité.** Un rendu brut ou par défaut est inacceptable. Respecte `DESIGN.md` à la lettre, et vérifie visuellement chaque page sur mobile et sur ordinateur.
2. **Responsive partout**, y compris le header (menu mobile), les tableaux (version carte sur mobile), l'admin et le panier.
3. **Le code est public.** Aucun secret dans le dépôt. Toutes les clés et mots de passe passent par les variables d'environnement (voir `ENV.example`).
4. **Aucune information confidentielle** dans le site ou le dépôt : pas de termes de contrats, pas de prix d'achat, pas de noms de fournisseurs. Seuls les informations de `ENTREPRISE.md` peuvent apparaître publiquement.
5. **Réservation** : l'expiration de 24 heures est calculée à la lecture, sans tâche planifiée. Une réservation dépassée passe au statut « expirée ».
6. **Pas de paiement en ligne.** La réservation sert à passer en boutique.
7. **Français uniquement** pour l'instant. Structure le code pour qu'une traduction soit ajoutable plus tard.

## Méthode de travail

- Suis les phases de `PLAN.md` dans l'ordre. Ne passe à la phase suivante qu'après validation de la précédente.
- Un commit par étape logique, avec un message clair en français.
- Avant de terminer une phase, lance le build, les tests et vérifie visuellement les pages concernées.
- Si une information manque, ne l'invente pas : pose la question ou marque-la comme `TODO` dans le code et dans le README.
- Remplace l'ancien fichier `index.html` et les fichiers à la racine du site statique par la nouvelle application. Conserve `brief/`.

## Livrables attendus

- Une application TanStack Start fonctionnelle, qui se construit sans erreur.
- Un `README.md` à la racine expliquant l'installation, les variables d'environnement, les commandes de développement et le déploiement sur Vercel.
- Un script de seed qui crée le compte administrateur et importe `produits.csv`.
- Une liste des points restants ou des décisions à faire valider.

Commence par lire le dossier `brief/`, puis propose-moi le plan de la phase 1 avant de coder.
