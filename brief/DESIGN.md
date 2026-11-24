# Direction artistique et design

Le design est la priorité du projet. Le site doit paraître professionnel, soigné et moderne, pas générique. Chaque page est vérifiée visuellement sur mobile (375 px), tablette (768 px) et ordinateur (1440 px).

## Identité visuelle

Les couleurs viennent des flyers de l'entreprise : tons bruns foncés, or et crème. Elles évoquent le commerce, la qualité et la chaleur.

| Rôle | Valeur indicative |
|---|---|
| Fond principal | crème `#FBF6EC` |
| Fond sombre (header, footer, héro) | brun très foncé `#1C1510` |
| Accent | or `#D9A441` |
| Accent clair | or pâle `#F3D98F` |
| Texte | `#2A2118` |
| Texte secondaire | `#6E6255` |

Ces valeurs sont des points de départ. Vérifie le contraste (WCAG AA minimum) avant de les figer.

**Typographie** : une police d'affichage élégante pour les titres (par exemple Playfair Display ou équivalent) et une police de texte très lisible (par exemple Inter). Hiérarchie claire, tailles fluides avec `clamp()`.

**Logo** : il n'est pas encore disponible. Utilise pour l'instant un logo textuel « Bokhismany » en police d'affichage, dans un composant `Logo` réutilisable, afin qu'il soit remplaçable facilement.

## Header (navigation)

Le header doit être de qualité professionnelle :
- Sticky, avec une transition de fond et d'ombre au défilement.
- Logo à gauche, navigation au centre ou à droite, bouton « Panier » avec badge du nombre d'articles, animé au moment de l'ajout.
- Sur mobile : menu hamburger qui ouvre un panneau plein écran animé, avec focus piégé, fermeture à la touche Échap et fermeture au clic sur un lien.
- Indicateur visuel de la page active.
- Accessible au clavier, avec des libellés `aria` corrects.

## Animations et transitions

- **View Transitions API** pour la navigation entre pages (fondu ou glissement léger). Repli propre si le navigateur ne la supporte pas.
- Apparition progressive des sections au défilement (IntersectionObserver), sans bloquer la lecture.
- Images produits : transition vers la fiche produit (l'image « se déplace » vers la page détail quand c'est possible avec View Transitions).
- Micro-interactions : survol des cartes (élévation légère), bouton « Ajouter » qui confirme l'action, badge panier qui pulse.
- **Respect de `prefers-reduced-motion`** : désactiver ou réduire toutes les animations si l'utilisateur le demande.
- Les animations restent fluides (transform et opacity uniquement) et ne ralentissent pas le chargement.

## Composants à soigner

- **Cartes produit** : image dominante, catégorie, nom, format, prix bien visible, bouton d'ajout. Image de remplacement élégante si la photo manque.
- **Panier** : sur mobile, les lignes deviennent des cartes ; le total reste visible en bas (barre fixe).
- **Tableaux** (admin et catalogue) : sur mobile, transformés en cartes empilées.
- **États vides, chargement et erreurs** : toujours stylés, jamais un texte brut.
- **Formulaires** : libellés visibles, messages d'erreur près du champ, états de focus marqués.
- **Badges de statut** des réservations : couleur et libellé distincts pour chaque statut.

## Responsive

- Approche mobile first.
- Grille du catalogue : 1 colonne sur mobile, 2 sur tablette, 3 ou 4 sur ordinateur.
- Espacements et tailles de texte fluides, sans rupture à aucune largeur intermédiaire.
- Zones tactiles de 44 px minimum.
- Pas de défilement horizontal de la page (les tableaux défilent dans leur propre conteneur si besoin).

## Ce qu'il faut éviter

- Les templates génériques, les dégradés criards, les ombres lourdes partout.
- Les effets décoratifs qui n'apportent rien.
- Les pages blanches sans hiérarchie ni images.
- Les textes en majuscules partout.
- Les animations qui retardent la lecture ou l'achat.

## Vérification visuelle

Avant de valider une page, vérifie-la sur les trois largeurs, en mode clair. Vérifie aussi le fonctionnement sans animation (`prefers-reduced-motion`) et au clavier seul.
