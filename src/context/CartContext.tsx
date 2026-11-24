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
  CLE_COUPONS_PANIER,
  CLE_PANIER,
  estLignePanier,
  nombreArticles,
  totalPanier,
  type AppliedCoupon,
  type LignePanier,
} from '@/lib/cart'
import { validateCouponsFn } from '@/lib/server/coupons.functions'

export interface CouponResult {
  success: boolean
  message: string
}

interface ValeurPanier {
  lignes: LignePanier[]
  nombre: number
  subtotal: number
  discountFc: number
  total: number
  couponCodes: string[]
  appliedCoupons: AppliedCoupon[]
  couponMessages: string[]
  pret: boolean
  ajouter: (ligne: LignePanier) => void
  modifierQuantite: (slug: string, quantite: number) => void
  retirer: (slug: string) => void
  vider: () => void
  ajouterCoupon: (code: string) => Promise<CouponResult>
  retirerCoupon: (code: string) => void
}

const ContextePanier = createContext<ValeurPanier | null>(null)

function estCodeCoupon(valeur: unknown): valeur is string {
  return typeof valeur === 'string' && valeur.trim().length > 0 && valeur.length <= 30
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lignes, setLignes] = useState<LignePanier[]>([])
  const [couponCodes, setCouponCodes] = useState<string[]>([])
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([])
  const [discountFc, setDiscountFc] = useState(0)
  const [couponMessages, setCouponMessages] = useState<string[]>([])
  const [pret, setPret] = useState(false)

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE_PANIER)
      if (brut) {
        const parse: unknown = JSON.parse(brut)
        if (Array.isArray(parse)) setLignes(parse.filter(estLignePanier))
      }
      const couponsBruts = window.localStorage.getItem(CLE_COUPONS_PANIER)
      if (couponsBruts) {
        const parse: unknown = JSON.parse(couponsBruts)
        if (Array.isArray(parse)) {
          setCouponCodes(
            [...new Set(parse.filter(estCodeCoupon).map((code) => code.trim().toUpperCase()))].slice(
              0,
              5,
            ),
          )
        }
      }
    } catch {
      // Le panier reste utilisable même si le stockage est indisponible.
    }
    setPret(true)
  }, [])

  useEffect(() => {
    if (!pret) return
    try {
      window.localStorage.setItem(CLE_PANIER, JSON.stringify(lignes))
    } catch {
      // Stockage indisponible : l'état en mémoire reste valable.
    }
  }, [lignes, pret])

  useEffect(() => {
    if (!pret) return
    try {
      window.localStorage.setItem(CLE_COUPONS_PANIER, JSON.stringify(couponCodes))
    } catch {
      // Stockage indisponible : l'état en mémoire reste valable.
    }
  }, [couponCodes, pret])

  const subtotal = totalPanier(lignes)
  const articles = useMemo(
    () => lignes.map((ligne) => ({ slug: ligne.slug, quantity: ligne.quantite })),
    [lignes],
  )
  const validationKey = JSON.stringify({ codes: couponCodes, articles })

  useEffect(() => {
    if (!pret || couponCodes.length === 0 || articles.length === 0) {
      setAppliedCoupons([])
      setDiscountFc(0)
      setCouponMessages([])
      return
    }

    let actif = true
    validateCouponsFn({ data: { codes: couponCodes, articles } })
      .then((resultat) => {
        if (!actif) return
        setAppliedCoupons(resultat.coupons)
        setDiscountFc(Math.min(resultat.discountFc, totalPanier(lignes)))
        setCouponMessages(resultat.messages)
      })
      .catch(() => {
        if (!actif) return
        setAppliedCoupons([])
        setDiscountFc(0)
        setCouponMessages(['Impossible de vérifier les coupons pour le moment.'])
      })

    return () => {
      actif = false
    }
    // validationKey couvre les articles et les codes ; lignes est utilisée pour le plafond.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationKey, pret])

  const ajouter = useCallback((ligne: LignePanier) => {
    setLignes((etatActuel) => {
      const existante = etatActuel.find((element) => element.slug === ligne.slug)
      if (!existante) return [...etatActuel, ligne]
      return etatActuel.map((element) =>
        element.slug === ligne.slug
          ? { ...element, quantite: Math.min(99, element.quantite + ligne.quantite) }
          : element,
      )
    })
  }, [])

  const modifierQuantite = useCallback((slug: string, quantite: number) => {
    setLignes((etatActuel) =>
      etatActuel.flatMap((element) => {
        if (element.slug !== slug) return [element]
        if (quantite <= 0) return []
        return [{ ...element, quantite: Math.min(99, Math.floor(quantite)) }]
      }),
    )
  }, [])

  const retirer = useCallback((slug: string) => {
    setLignes((etatActuel) => etatActuel.filter((element) => element.slug !== slug))
  }, [])

  const vider = useCallback(() => {
    setLignes([])
    setCouponCodes([])
    setAppliedCoupons([])
    setDiscountFc(0)
    setCouponMessages([])
  }, [])

  const ajouterCoupon = useCallback(
    async (code: string): Promise<CouponResult> => {
      const codePropre = code.trim().toUpperCase()
      if (!codePropre) return { success: false, message: 'Saisissez un code de réduction.' }
      if (couponCodes.includes(codePropre)) {
        return { success: false, message: 'Ce coupon est déjà appliqué.' }
      }
      if (couponCodes.length >= 5) {
        return {
          success: false,
          message: 'Vous pouvez appliquer au maximum 5 coupons sur un panier.',
        }
      }
      if (articles.length === 0) {
        return { success: false, message: 'Ajoutez d’abord des produits au panier.' }
      }

      const candidats = [...couponCodes, codePropre]
      try {
        const resultat = await validateCouponsFn({
          data: { codes: candidats, articles },
        })
        if (resultat.messages.length > 0) {
          return { success: false, message: resultat.messages[0] }
        }
        if (!resultat.coupons.some((coupon) => coupon.code === codePropre)) {
          return { success: false, message: `Le coupon ${codePropre} n’est pas disponible.` }
        }

        setCouponCodes(candidats)
        setAppliedCoupons(resultat.coupons)
        setDiscountFc(Math.min(resultat.discountFc, totalPanier(lignes)))
        setCouponMessages([])
        return { success: true, message: `Coupon ${codePropre} appliqué.` }
      } catch {
        return { success: false, message: 'Impossible de vérifier ce coupon pour le moment.' }
      }
    },
    [articles, couponCodes, lignes],
  )

  const retirerCoupon = useCallback((code: string) => {
    setCouponCodes((etatActuel) => etatActuel.filter((element) => element !== code))
  }, [])

  const valeur = useMemo<ValeurPanier>(
    () => ({
      lignes,
      nombre: nombreArticles(lignes),
      subtotal,
      discountFc,
      total: Math.max(0, subtotal - discountFc),
      couponCodes,
      appliedCoupons,
      couponMessages,
      pret,
      ajouter,
      modifierQuantite,
      retirer,
      vider,
      ajouterCoupon,
      retirerCoupon,
    }),
    [
      lignes,
      subtotal,
      discountFc,
      couponCodes,
      appliedCoupons,
      couponMessages,
      pret,
      ajouter,
      modifierQuantite,
      retirer,
      vider,
      ajouterCoupon,
      retirerCoupon,
    ],
  )

  return <ContextePanier.Provider value={valeur}>{children}</ContextePanier.Provider>
}

export function usePanier(): ValeurPanier {
  const contexte = useContext(ContextePanier)
  if (!contexte) throw new Error('usePanier doit être utilisé dans CartProvider.')
  return contexte
}
