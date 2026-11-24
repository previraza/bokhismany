# Dossier de projet : site Bokhismany

Ce dossier contient tout ce qu'il faut pour réaliser le site complet de Bokhismany Trading SARL.

| Fichier | Rôle |
|---|---|
| `PROMPT.md` | Le prompt à donner à l'IA qui réalise le site. À lire en premier. |
| `PLAN.md` | Le plan de travail en phases, avec les critères de validation de chaque phase. |
| `SPEC.md` | Le cahier des charges fonctionnel : pages, parcours, règles de réservation, admin, schéma de base de données. |
| `DESIGN.md` | La direction artistique : style, animations, View Transitions, header, responsive. |
| `ENTREPRISE.md` | Les informations sur l'entreprise : nom, adresses, téléphones, email, marques, produits. |
| `produits.csv` | Le catalogue initial, à importer en base. |
| `TOOLS.md` | Les MCP et skills à connecter, et pourquoi. |
| `../CLAUDE.md` | Règles lues automatiquement par Claude Code à chaque session (à la racine du dépôt). |
| `../.claude/agents/` | Trois agents spécialisés : `bokhismany-dev` (implémentation), `bokhismany-reviewer` (revue qualité, sans modification), `bokhismany-db` (schéma, migrations, seed). |
| `ENV.example` | Les variables d'environnement nécessaires (sans valeurs secrètes). |

**Ordre de lecture pour l'IA :** `PROMPT.md`, puis `SPEC.md`, `DESIGN.md`, `ENTREPRISE.md`, `PLAN.md`, puis `TOOLS.md`.

**Règle absolue :** ce dépôt est public. Ne jamais y commiter de secret (mot de passe, URL de base de données, token). Les secrets vont uniquement dans les variables d'environnement Vercel et dans un fichier `.env` local ignoré par git.
