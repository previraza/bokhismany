# CLAUDE.md : instructions pour le projet Bokhismany

Ce fichier est lu automatiquement à chaque session. Il résume les règles du projet. Le détail est dans `brief/`.

## Projet

Site complet de **Bokhismany Trading SARL** (commerce général, Kinshasa et Brazzaville), marque de points de vente Daayake Food.
Stack : TanStack Start, React, TypeScript, Drizzle ORM, Neon (PostgreSQL), déploiement Vercel.

## Où trouver quoi

- `brief/PROMPT.md` : mission et contraintes générales.
- `brief/SPEC.md` : pages, règles de réservation, admin, schéma de base.
- `brief/DESIGN.md` : direction artistique et responsive.
- `brief/ENTREPRISE.md` : informations publiables sur l'entreprise.
- `brief/produits.csv` : catalogue initial.
- `brief/PLAN.md` : phases à suivre dans l'ordre.
- `brief/TOOLS.md` : MCP et skills recommandés.
- `brief/ENV.example` : variables d'environnement.

## Règles non négociables

1. **Dépôt public** : aucun secret (mot de passe, URL de base, token) dans le code, les commits ou les fichiers versionnés. Utiliser `.env` local (ignoré par git) et les variables Vercel.
2. **Confidentialité** : ne jamais faire apparaître les termes de contrats, prix d'achat ou de cession, volumes, ristournes, noms de fournisseurs, numéros d'immatriculation. Seul le contenu de `brief/ENTREPRISE.md` est publiable.
3. **Design soigné** : pas de rendu générique. Vérifier chaque page sur 375, 768 et 1440 px, et avec `prefers-reduced-motion`.
4. **Français** : interface, messages d'erreur et commits en français.
5. **Pas d'invention** : une information manquante est marquée `TODO`, jamais inventée (horaires, slogan, prix).
6. **Pas de paiement en ligne** : la réservation sert à passer en boutique.
7. **Expiration des réservations** : calculée à la lecture (24 h), sans tâche planifiée.

## Méthode

- Suivre `brief/PLAN.md` phase par phase. Ne pas passer à la phase suivante sans validation.
- Un commit par étape logique.
- Avant de finir une phase : build, tests et vérification visuelle.
- Ne jamais pousser directement une migration de base sur la production sans l'avoir testée sur une branche Neon.

## Commits

Terminer chaque message de commit par :

```
Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01HdrVeZsqWb3wKSCWqrQZns
```
