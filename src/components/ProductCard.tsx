import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ProductVisual } from '@/components/ProductVisual'
import { usePanier } from '@/context/CartContext'
import { libelleCategorie } from '@/lib/categories'
import { formaterPrix } from '@/lib/format'
import type { Product } from '@/lib/db/schema'

interface Props {
  produit: Product
  prioritaire?: boolean
}

export function ProductCard({ produit, prioritaire = true }: Props) {
  const { ajouter } = usePanier()
  const [ajoute, setAjoute] = useState(false)
  const minuteur = useRef<number | null>(null)
  const indisponible = produit.stockStatus === 'rupture'

  useEffect(() => {
    return () => {
      if (minuteur.current) window.clearTimeout(minuteur.current)
    }
  }, [])

  const surAjout = () => {
    ajouter({
      slug: produit.slug,
      nom: produit.name,
      categorie: produit.category,
      format: produit.format,
      prixFc: produit.priceFc,
      quantite: 1,
    })
    setAjoute(true)
    if (minuteur.current) window.clearTimeout(minuteur.current)
    minuteur.current = window.setTimeout(() => setAjoute(false), 1800)
  }

  return (
    <article className="group flex h-full flex-col border-t border-encre/20 pt-5">
      <button
        type="button"
        onClick={surAjout}
        disabled={indisponible}
        aria-label={`Ajouter ${produit.name} au panier`}
        className="block w-full cursor-pointer text-left disabled:cursor-not-allowed"
      >
        <div className="relative bg-papier">
          <ProductVisual
            slug={produit.slug}
            nom={produit.name}
            categorie={produit.category}
            imageUrl={produit.imageUrl}
            active={prioritaire ? undefined : false}
            className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.025]"
          />
          {indisponible ? (
            <span className="absolute top-4 left-4 bg-alerte px-3 py-1.5 text-[0.65rem] font-semibold tracking-[0.18em] text-white uppercase">
              Rupture
            </span>
          ) : null}
          <span
            className={`absolute right-4 bottom-4 flex min-h-10 items-center gap-2 px-3 text-xs font-semibold tracking-wide transition-colors ${
              ajoute ? 'bg-marine text-creme' : 'bg-or text-creme'
            }`}
            aria-hidden="true"
          >
            {ajoute ? 'Ajouté ✓' : indisponible ? 'Indisponible' : '+ Ajouter au panier'}
          </span>
        </div>
        <div className="mt-5">
          <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-encre-douce uppercase">
            {libelleCategorie(produit.category)}
          </p>
          <h3 className="mt-2 text-xl leading-snug text-marine transition-colors group-hover:text-or">
            {produit.name}
          </h3>
          {produit.format ? <p className="mt-1.5 text-sm text-encre-douce">{produit.format}</p> : null}
          <p className="mt-2 text-lg font-semibold text-marine">{formaterPrix(produit.priceFc)}</p>
        </div>
      </button>
      <div className="mt-5 border-t border-encre/10 pt-4">
        <Link
          to="/produits/$slug"
          params={{ slug: produit.slug }}
          viewTransition
          className="lien-editorial inline-flex min-h-11 items-center text-sm"
          aria-label={`Voir la fiche de ${produit.name}`}
        >
          Voir plus →
        </Link>
      </div>
    </article>
  )
}
