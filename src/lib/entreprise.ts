export const RAISON_SOCIALE = 'Bokhismany Trading SARL'
export const MARQUE = 'Daayake Food'
export const EMAIL_CONTACT = 'tradingbokhismany@gmail.com'

export const SIEGE_SOCIAL =
  '45, avenue Busudjano, commune de Kasavubu, Kinshasa, RD Congo'

export interface PointDeVente {
  nom: string
  adresse: string
  telephone: string
  tel: string
  ville: 'Kinshasa' | 'Brazzaville'
}

export const POINTS_DE_VENTE: readonly PointDeVente[] = [
  {
    nom: 'Daayake 1',
    adresse: '45, avenue Busu Djanoa, commune de Kasavubu, Kinshasa',
    telephone: '+243 817 293 796',
    tel: '+243817293796',
    ville: 'Kinshasa',
  },
  {
    nom: 'Daayake 2',
    adresse: '39, avenue Busu Djanoa, commune de Kasavubu, Kinshasa',
    telephone: '+243 818 142 449',
    tel: '+243818142449',
    ville: 'Kinshasa',
  },
  {
    nom: 'Daayake 3',
    adresse: '45, rue Bangui, Ouenzé (5e arrondissement), Brazzaville',
    telephone: '+242 06 579 3872',
    tel: '+242065793872',
    ville: 'Brazzaville',
  },
]

export const RESEAUX_SOCIAUX = [
  { nom: 'Facebook', identifiant: '@daayake-food' },
  { nom: 'Instagram', identifiant: '@daayake-food' },
]

// Information non fournie dans brief/ENTREPRISE.md : à faire valider avant publication.
export const HORAIRES_TODO = 'TODO — horaires d’ouverture à confirmer.'
