# Décisions prises et questions ouvertes

Ce fichier liste les choix déjà faits, pour que l'IA ne les remette pas en cause sans raison. Il liste aussi les points à trancher par Bokhismany.

## Décisions prises

| Sujet | Décision | Raison |
|---|---|---|
| Framework | TanStack Start | Rendu serveur, routes typées, bon support de View Transitions. |
| Base de données | PostgreSQL + Drizzle | Contrôle total, compatible docker-compose. |
| Hébergement | Docker Compose | Base, migrations et application dans une seule pile, déployable sur un serveur Docker. |
| Paiement | Aucun paiement en ligne | Le client paie en boutique. Évite les frais et la gestion de litiges. |
| Panier | Stocké dans le navigateur | Pas de compte client à gérer. |
| Réservation | Code de 6 caractères, valide 24 h | Demande du client. |
| Expiration | Calculée à la lecture | Fonctionne sans tâche planifiée, donc sans coût supplémentaire. |
| Stock | Information seulement, pas de décrément | La boutique reste la référence réelle. |
| Admin | Un seul compte, créé par seed | Pas d'inscription publique, donc pas de risque d'accès non voulu. |
| Langue | Français uniquement | Demande initiale. Code prévu pour une traduction future. |
| Dépôt | Public | Choix actuel. Voir la règle sur les secrets. |

## Questions à trancher par Bokhismany

1. **Horaires d'ouverture** des trois points de vente.
2. **Slogan** et **texte de présentation** pour la page « À propos ».
3. **Logo** au format vectoriel (SVG) ou haute résolution (PNG).
4. **Photos produits** : disponibles ou non ? Si non, on utilise un visuel de remplacement.
5. **Promotion de 5 %** : date de fin, et produits concernés (tous ou certains ?).
6. **Durée de validité** : 24 h est la règle demandée. Faut-il la modifier pour certains produits ?
7. **Quantité maximale** par réservation : faut-il une limite ?
8. **Montant minimum** pour réserver : faut-il un seuil ?
9. **Réception des réservations** : l'admin suffit-il, ou faut-il aussi un email ou un message WhatsApp à chaque réservation ?
10. **Nom de domaine** : veut-on un domaine personnalisé (par exemple bokhismany.cd ou .com) ?
11. **Langue anglaise** : nécessaire ou non ?
12. **Nombre d'administrateurs** : un seul pour l'instant, ou plusieurs comptes plus tard ?

## Hypothèses par défaut si aucune réponse

- Pas de quantité maximale ni de montant minimum.
- Pas d'envoi de notification automatique : l'admin consulte le tableau de bord.
- Domaine personnalisé et certificat HTTPS à prévoir derrière le proxy inverse (`TODO`).
- Un seul compte administrateur.
- Promotion affichée sans date de fin, modifiable depuis l'admin.
