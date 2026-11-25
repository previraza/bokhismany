# Outils à connecter

Cette liste indique les MCP (connecteurs) et les skills utiles à l'IA qui réalise le projet. Les noms exacts et les commandes d'installation évoluent : vérifie-les dans la documentation officielle de chaque outil.

## MCP recommandés

| MCP | Pourquoi | Ce qu'il permet |
|---|---|---|
| **GitHub** | Gérer le dépôt : commits, branches, pull requests. | Pousser le code par étapes, ouvrir des PR pour revue. |
| **Docker Compose** | Lancer PostgreSQL, les migrations et l'application dans une seule pile. | `docker compose up -d --build`, logs, sauvegardes et redémarrages. |
| **Playwright** (ou équivalent navigateur) | Tester le site comme un utilisateur. | Captures d'écran sur mobile, tablette et ordinateur ; test du parcours panier → réservation → admin. |
| **Context7** (ou documentation à jour) | Accéder à la documentation actuelle des bibliothèques. | Éviter les erreurs liées à des API anciennes de TanStack Start, Drizzle ou Tailwind. |

## Skills recommandés

| Skill | Pourquoi |
|---|---|
| **frontend-design** | Donner un rendu distinctif et soigné, éviter les interfaces génériques. Indispensable vu l'exigence de design. |
| **Skill de revue d'accessibilité** (si disponible) | Vérifier contrastes, focus et libellés. |
| **Skill de tests end-to-end** (si disponible) | Écrire et lancer les scénarios de parcours complet. |

## Outils de développement

- Node.js 20 ou plus récent.
- pnpm ou npm.
- Un navigateur moderne pour les tests visuels.

## Points d'attention

- Ne jamais donner les identifiants PostgreSQL ou les mots de passe admin à un outil non nécessaire.
- Les MCP qui écrivent en production doivent être utilisés avec prudence : tester d'abord sur une copie de la base.
- Vérifier les permissions accordées à chaque MCP lors de la connexion.
