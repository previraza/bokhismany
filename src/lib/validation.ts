import { z } from 'zod'

const telephone = z
  .string()
  .trim()
  .min(8, 'Saisissez un numéro de téléphone valide.')
  .max(24, 'Le numéro de téléphone est trop long.')
  .regex(/^\+?[0-9 ().-]+$/, 'Utilisez uniquement des chiffres et les signes +, espace, parenthèse ou tiret.')
  .refine((valeur) => valeur.replace(/\D/g, '').length >= 8, {
    message: 'Saisissez un numéro de téléphone valide.',
  })

export const schemaReservation = z.object({
  nom: z
    .string()
    .trim()
    .min(2, 'Indiquez votre nom (au moins 2 caractères).')
    .max(100, 'Le nom est trop long.'),
  telephone,
  commentaire: z.string().trim().max(500, 'Le commentaire est trop long.').optional(),
  articles: z
    .array(
      z.object({
        slug: z.string().trim().min(1),
        quantite: z.number().int().min(1).max(99),
      }),
    )
    .min(1, 'Ajoutez au moins un produit au panier.')
    .max(50, 'Une réservation ne peut pas contenir plus de 50 lignes.'),
})

export type DonneesReservation = z.infer<typeof schemaReservation>

export const schemaContact = z.object({
  nom: z.string().trim().min(2, 'Indiquez votre nom.').max(100),
  contact: z
    .string()
    .trim()
    .min(5, 'Indiquez un email ou un numéro de téléphone.')
    .max(150),
  message: z
    .string()
    .trim()
    .min(10, 'Votre message doit contenir au moins 10 caractères.')
    .max(2000),
})

export type DonneesContact = z.infer<typeof schemaContact>

export const schemaProformaClient = z.object({
  nom: z.string().trim().min(2, 'Indiquez votre nom.').max(100),
  telephone,
  societe: z.string().trim().max(100).optional(),
  email: z.string().trim().email('Indiquez une adresse email valide.').optional().or(z.literal('')),
})

export type DonneesProformaClient = z.infer<typeof schemaProformaClient>

export const schemaConnexion = z.object({
  email: z.string().trim().toLowerCase().email('Indiquez une adresse email valide.'),
  motDePasse: z.string().min(1, 'Saisissez votre mot de passe.'),
})

export const schemaProduit = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets.'),
  nom: z.string().trim().min(2).max(120),
  categorie: z.enum(['huiles', 'riz', 'semoules', 'farines', 'sucre', 'autres']),
  format: z.string().trim().max(60).optional(),
  prixFc: z.number().int().positive('Le prix doit être supérieur à zéro.'),
  description: z.string().trim().max(1000).optional(),
  imageUrl: z.string().trim().url('Saisissez une URL valide.').optional(),
  stockStatus: z.enum(['disponible', 'rupture']),
  isActive: z.boolean(),
})

export type DonneesProduit = z.infer<typeof schemaProduit>

export const schemaStatut = z.object({
  code: z.string().trim().min(6).max(6),
  statut: z.enum(['en_attente', 'retiree', 'expiree', 'annulee']),
})

export const schemaPromotion = z.object({
  active: z.boolean(),
  message: z.string().trim().min(5).max(200),
})

export const schemaMembreEquipe = z.object({
  id: z.number().int().positive().optional(),
  nom: z.string().trim().min(2, 'Indiquez le nom du membre.').max(100),
  fonction: z.string().trim().min(2, 'Indiquez la fonction.').max(100),
  biographie: z.string().trim().max(500).optional(),
  photoUrl: z
    .string()
    .trim()
    .url('Saisissez une URL de photo valide.')
    .optional()
    .or(z.literal('')),
  ordre: z.number().int().min(0).max(999),
  isActive: z.boolean(),
})

export type DonneesMembreEquipe = z.infer<typeof schemaMembreEquipe>

export const schemaSuppressionMembre = z.object({
  id: z.number().int().positive(),
})
