import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  CLE_PANIER,
  estLignePanier,
  nombreArticles,
  totalPanier,
  type LignePanier,
} from '@/lib/cart'

interface ValeurPanier {
  lignes: LignePanier[]
  nombre: number
  total: number
  pret: boolean
  ajouter: (ligne: LignePanier) => void
  modifierQuantite: (slug: string, quantite: number) => void
  retirer: (slug: string) => void
  vider: () => void
}

const ContextePanier = createContext<ValeurPanier | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lignes, setLignes] = useState<LignePanier[]>([])
  const [pret, setPret] = useState(false)

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE_PANIER)
      if (brut) {
        const parse: unknown = JSON.parse(brut)
        if (Array.isArray(parse)) {
          setLignes(parse.filter(estLignePanier))
        }
      }
    } catch {
      // Un stockage indisponible ou corrompu ne doit pas bloquer la lecture du catalogue.
    }
    setPret(true)
  }, [])

  useEffect(() => {
    if (!pret) return
    try {
      window.localStorage.setItem(CLE_PANIER, JSON.stringify(lignes))
    } catch {
      // Le panier reste utilisable pendant la session même sans stockage.
    }
  }, [lignes, pret])

  const ajouter = useCallback((ligne: LignePanier) => {
    setLignes((etat) => {
      const existante = etat.find((element) => element.slug === ligne.slug)
      if (!existante) return [...etat, ligne]
      return etat.map((element) =>
        element.slug === ligne.slug
          ? {
              ...element,
              nom: ligne.nom,
              format: ligne.format,
              prixFc: ligne.prixFc,
              quantite: Math.min(99, element.quantite + ligne.quantite),
            }
          : element,
      )
    })
  }, [])

  const modifierQuantite = useCallback((slug: string, quantite: number) => {
    setLignes((etat) =>
      quantite <= 0
        ? etat.filter((ligne) => ligne.slug !== slug)
        : etat.map((ligne) =>
            ligne.slug === slug
              ? { ...ligne, quantite: Math.min(99, Math.floor(quantite)) }
              : ligne,
          ),
    )
  }, [])

  const retirer = useCallback((slug: string) => {
    setLignes((etat) => etat.filter((ligne) => ligne.slug !== slug))
  }, [])

  const vider = useCallback(() => setLignes([]), [])

  const valeur = useMemo<ValeurPanier>(
    () => ({
      lignes,
      nombre: nombreArticles(lignes),
      total: totalPanier(lignes),
      pret,
      ajouter,
      modifierQuantite,
      retirer,
      vider,
    }),
    [lignes, pret, ajouter, modifierQuantite, retirer, vider],
  )

  return <ContextePanier.Provider value={valeur}>{children}</ContextePanier.Provider>
}

export function usePanier(): ValeurPanier {
  const contexte = useContext(ContextePanier)
  if (!contexte) {
    throw new Error('usePanier doit être utilisé dans CartProvider.')
  }
  return contexte
}
