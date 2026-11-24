# Cahier des charges fonctionnel

## 1. Pages publiques

| Route | Contenu |
|---|---|
| `/` | Accueil : héro, activités de l'entreprise, produits phares, promotion en cours, appel à l'action vers le catalogue, adresses. |
| `/produits` | Catalogue complet : filtres par catégorie, recherche par nom, tri par prix, cartes produit avec image. |
| `/produits/$slug` | Fiche produit : image, prix, format, description, bouton « Ajouter au panier ». |
| `/panier` | Liste des produits, quantités modifiables, total estimé, boutons « Réserver » et « Continuer les achats ». |
| `/reservation/$code` | Confirmation de réservation : code, produits, montant estimé, date limite de retrait, adresse de la boutique, statut. |
| `/adresses` | Les trois points de vente, avec téléphone, adresse et lien d'appel. |
| `/contact` | Coordonnées et formulaire de contact simple (nom, email ou téléphone, message). Le message est enregistré en base. |
| `/a-propos` | Présentation de l'entreprise (texte fourni dans `ENTREPRISE.md`). |

## 2. Panier et estimation

- Le panier est stocké côté client (localStorage), car il n'y a pas de compte client.
- Chaque ligne affiche le prix unitaire, la quantité et le sous-total. Le total est mis à jour instantanément.
- Le montant est une **estimation** : la mention « Montant estimé, à confirmer en boutique » est obligatoire.
- Si un produit n'est plus disponible en base au moment de la réservation, le client est prévenu avant la validation.

## 3. Réservation

### Parcours
1. Le client clique sur « Réserver » dans le panier.
2. Il renseigne son nom et un numéro de téléphone (obligatoires), et un commentaire facultatif.
3. Le serveur crée la réservation et génère un **code** à 6 caractères (lettres majuscules et chiffres, sans caractères ambigus comme 0, O, 1, I).
4. La page de confirmation affiche le code, le montant estimé et l'heure limite.
5. Le client se présente en boutique avec le code.

### Règles
- Validité : **24 heures** à partir de la création.
- **Expiration** : calculée à chaque lecture. Si `now > expires_at` et que le statut est encore `en_attente`, le statut passe à `expiree` au moment de la lecture. Aucune tâche planifiée n'est nécessaire.
- Statuts possibles : `en_attente`, `retiree` (payée et récupérée en boutique), `expiree`, `annulee` (annulée par l'admin).
- Un code ne peut être utilisé qu'une fois : passer en `retiree` est irréversible sauf action admin explicite.
- Les stocks ne sont pas décrémentés à la réservation (la boutique reste la référence). Un champ `stock` existe en base pour information, avec un affichage « en stock / rupture ».

## 4. Administration

### Accès
- Page `/admin/connexion` : email et mot de passe.
- Pas d'inscription publique. Le compte administrateur est créé par le script de seed à partir des variables d'environnement `ADMIN_EMAIL` et `ADMIN_PASSWORD`.
- Mots de passe hachés (bcrypt ou argon2). Session par cookie httpOnly, sécurisé en production, avec expiration.
- Toutes les routes `/admin/*` sont protégées côté serveur, pas seulement dans l'interface.

### Fonctions
- **Tableau de bord** : nombre de réservations du jour, en attente, retirées, expirées ; liste des réservations récentes.
- **Réservations** : liste filtrable par statut et par date, recherche par code ou nom, détail d'une réservation, changement de statut, annulation.
- **Produits** : liste, création, modification, suppression logique (désactivation), upload ou URL de l'image, gestion du stock et du prix.
- **Messages de contact** : liste et marquage comme lu.

## 5. Schéma de base de données (Drizzle, PostgreSQL)

```
products
  id            serial primary key
  slug          text unique not null
  name          text not null
  category      text not null            -- huiles, riz, semoules, farines, autres
  format        text                      -- ex. "25 kg", "5 L"
  price_fc      integer not null          -- prix en Francs CFA, entier
  description   text
  image_url     text
  stock_status  text not null default 'disponible'  -- disponible | rupture
  is_active     boolean not null default true
  created_at    timestamptz default now()

reservations
  id            serial primary key
  code          text unique not null      -- 6 caractères
  customer_name text not null
  customer_phone text not null
  comment       text
  total_fc      integer not null          -- montant estimé au moment de la réservation
  status        text not null default 'en_attente'  -- en_attente | retiree | expiree | annulee
  created_at    timestamptz default now()
  expires_at    timestamptz not null      -- created_at + 24 h

reservation_items
  id              serial primary key
  reservation_id  integer references reservations(id) on delete cascade
  product_id      integer references products(id)
  product_name    text not null           -- copie du nom au moment de la réservation
  unit_price_fc   integer not null        -- copie du prix au moment de la réservation
  quantity        integer not null check (quantity > 0)

admins
  id            serial primary key
  email         text unique not null
  password_hash text not null
  created_at    timestamptz default now()

contact_messages
  id          serial primary key
  name        text not null
  contact     text not null
  message     text not null
  is_read     boolean not null default false
  created_at  timestamptz default now()
```

Les prix et noms sont copiés dans `reservation_items` pour que l'historique reste exact même si le catalogue change.

## 6. Exigences techniques

- Validation des entrées côté serveur (schémas de validation, par exemple Zod).
- Limitation du nombre de réservations par numéro de téléphone et par heure (protection contre l'abus).
- Messages d'erreur clairs en français.
- Données de référence (`produits.csv`) importées par le script de seed.
- Accessibilité : contrastes suffisants, navigation au clavier, textes alternatifs sur les images, libellés des champs.
- Référencement : titres, descriptions, balises Open Graph sur chaque page publique.
- Pas de dépendance à un service payant.
