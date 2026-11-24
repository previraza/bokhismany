import { useRouterState } from '@tanstack/react-router'
import type { MouseEvent } from 'react'
import { Lien } from '@/components/Lien'
import { usePanier } from '@/context/CartContext'
import { CLASSE_BOUTON_OR } from '@/lib/classes'
import { formaterPrix } from '@/lib/format'

/**
 * Barre de réservation disponible sur toutes les pages dès que le panier contient des articles.
 * Sur le panier, elle amène devant le formulaire ; ailleurs, elle ouvre la page du panier.
 */
export function BarrePanierMobile() {
  const { lignes, total, pret } = usePanier()
  const chemin = useRouterState({ select: (etat) => etat.location.pathname })

  if (!pret || lignes.length === 0) return null

  const nombreArticles = lignes.reduce((somme, ligne) => somme + ligne.quantite, 0)
  const surPanier = chemin === '/panier'

  const allerAuFormulaire = (evenement: MouseEvent<HTMLAnchorElement>) => {
    evenement.preventDefault()
    const champ = document.getElementById('reservation-nom')
    if (!champ) return
    const reduction = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    champ.scrollIntoView({ behavior: reduction ? 'auto' : 'smooth', block: 'center' })
    champ.focus({ preventScroll: true })
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-or/30 bg-creme py-3 shadow-[0_-8px_24px_rgba(23,21,20,0.12)] lg:hidden">
      <div className="conteneur-site flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-encre-douce">
            {nombreArticles} {nombreArticles > 1 ? 'articles' : 'article'} · Total estimé
          </p>
          <p className="text-lg font-semibold tabular-nums text-marine">{formaterPrix(total)}</p>
        </div>
        {surPanier ? (
          <a href="#reservation-nom" onClick={allerAuFormulaire} className={CLASSE_BOUTON_OR}>
            Réserver
          </a>
        ) : (
          <Lien to="/panier" viewTransition className={CLASSE_BOUTON_OR}>
            Réserver
          </Lien>
        )}
      </div>
    </div>
  )
}
