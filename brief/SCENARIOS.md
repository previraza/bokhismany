# Scénarios de test et critères d'acceptation

Chaque scénario doit être vérifié avant la mise en production. Les tests automatisés (Playwright) couvrent au minimum les scénarios marqués **[E2E]**.

## 1. Catalogue

- **[E2E]** Le visiteur ouvre `/produits` et voit tous les produits actifs de `produits.csv`.
- **[E2E]** Le filtre par catégorie n'affiche que les produits de cette catégorie.
- La recherche par nom trouve « Lion » et renvoie les deux formats (50 kg et 25 kg).
- Le tri par prix croissant puis décroissant fonctionne.
- Un produit désactivé dans l'admin n'apparaît plus dans le catalogue.
- Un produit sans image affiche le visuel de remplacement, sans image cassée.
- Une URL de produit inconnue renvoie une page « produit introuvable » stylée, pas une erreur brute.

## 2. Panier

- **[E2E]** Ajouter un produit change le badge du panier.
- Modifier une quantité met à jour le sous-total et le total.
- Le total est toujours accompagné de la mention « montant estimé, à confirmer en boutique ».
- Le panier survit à un rechargement de la page.
- Vider le panier remet le badge à zéro.
- Un produit passé en rupture pendant que le client a le panier ouvert est signalé avant la réservation.

## 3. Réservation

- **[E2E]** Une réservation valide crée un code de 6 caractères, affiche la page de confirmation et enregistre les prix du moment.
- Le code ne contient aucun des caractères ambigus : 0, O, 1, I.
- Les champs nom et téléphone sont obligatoires, avec un message d'erreur clair.
- Un numéro de téléphone invalide est refusé.
- La page `/reservation/$code` affiche le statut et l'heure limite.
- Une réservation consultée après 24 h passe au statut « expirée » et ne peut plus être retirée.
- Une réservation déjà retirée ne peut pas repasser en attente.
- Plusieurs réservations rapides depuis le même numéro sont limitées (protection anti-abus).
- Modifier le prix d'un produit après réservation ne change pas le montant de la réservation.

## 4. Administration

- **[E2E]** Accéder à `/admin` sans connexion redirige vers `/admin/connexion`.
- **[E2E]** Une connexion avec un mauvais mot de passe affiche un message d'erreur générique (sans indiquer si l'email existe).
- Après connexion, le tableau de bord affiche les compteurs exacts.
- Le changement de statut d'une réservation est enregistré et visible immédiatement.
- La recherche par code retrouve la bonne réservation.
- La session expire après la durée prévue.
- Le bouton de déconnexion invalide la session côté serveur.
- Un visiteur ne peut appeler aucune action admin, même en envoyant directement la requête.

## 5. Contact

- Le formulaire enregistre le message et affiche une confirmation.
- Un message vide est refusé.
- Le message apparaît dans l'admin et peut être marqué comme lu.

## 6. Responsive et accessibilité

- Chaque page publique est vérifiée à 375, 768 et 1440 px, sans défilement horizontal.
- Le menu mobile s'ouvre, se ferme avec Échap et au clic sur un lien.
- Toute la navigation est possible au clavier, avec un focus visible.
- Les contrastes respectent WCAG AA.
- Avec `prefers-reduced-motion`, les animations sont désactivées ou réduites.

## 7. Déploiement

- Le build de production réussit sans erreur ni avertissement bloquant.
- Les migrations et le seed s'exécutent sans erreur sur une base vide.
- Le parcours complet fonctionne en production : catalogue, panier, réservation, connexion admin, changement de statut.
- Aucune erreur dans la console du navigateur sur les pages principales.
