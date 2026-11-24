import { useEffect, useRef, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Lien } from '@/components/Lien'
import { Logo } from '@/components/Logo'
import { usePanier } from '@/context/CartContext'

const LIENS = [
  { libelle: 'Accueil', to: '/' },
  { libelle: 'Produits', to: '/produits' },
  { libelle: 'Adresses', to: '/adresses' },
  { libelle: 'À propos', to: '/a-propos' },
  { libelle: 'Contact', to: '/contact' },
] as const

export function Header() {
  const [ouvert, setOuvert] = useState(false)
  const [scrolle, setScrolle] = useState(false)
  const [pulse, setPulse] = useState(false)
  const boutonRef = useRef<HTMLButtonElement>(null)
  const panneauRef = useRef<HTMLDivElement>(null)
  const nombrePrecedent = useRef(0)
  const { nombre } = usePanier()
  const chemin = useRouterState({ select: (etat) => etat.location.pathname })

  useEffect(() => {
    const aScroller = () => setScrolle(window.scrollY > 12)
    aScroller()
    window.addEventListener('scroll', aScroller, { passive: true })
    return () => window.removeEventListener('scroll', aScroller)
  }, [])

  useEffect(() => {
    setOuvert(false)
  }, [chemin])

  useEffect(() => {
    if (nombre > nombrePrecedent.current) {
      setPulse(true)
      const minuteur = window.setTimeout(() => setPulse(false), 650)
      nombrePrecedent.current = nombre
      return () => window.clearTimeout(minuteur)
    }
    nombrePrecedent.current = nombre
  }, [nombre])

  useEffect(() => {
    if (!ouvert) return

    const panneau = panneauRef.current
    if (!panneau) return
    const precedent = document.activeElement as HTMLElement | null
    const elements = () =>
      Array.from(
        panneau.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter((element) => element.tabIndex >= 0)

    elements()[0]?.focus()
    const ancienOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') {
        setOuvert(false)
        boutonRef.current?.focus()
        return
      }
      if (evenement.key !== 'Tab') return
      const items = elements()
      if (items.length === 0) return
      const premier = items[0]!
      const dernier = items[items.length - 1]!
      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault()
        dernier.focus()
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault()
        premier.focus()
      }
    }

    document.addEventListener('keydown', surTouche)
    return () => {
      document.removeEventListener('keydown', surTouche)
      document.body.style.overflow = ancienOverflow
      precedent?.focus()
    }
  }, [ouvert])

  const estActif = (to: string) =>
    to === '/' ? chemin === '/' : chemin === to || chemin.startsWith(`${to}/`)

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b bg-papier/95 backdrop-blur transition-colors duration-300 ${
          scrolle ? 'border-encre/20' : 'border-encre/10'
        }`}
      >
        <div className="conteneur-site flex h-[4.5rem] items-center justify-between gap-4 sm:h-20">
          <Logo />

          <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
            {LIENS.map((lien) => (
              <Lien
                key={lien.to}
                to={lien.to}
                aria-current={estActif(lien.to) ? 'page' : undefined}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                  estActif(lien.to) ? 'text-or' : 'text-encre-douce hover:text-marine'
                }`}
              >
                {lien.libelle}
                {estActif(lien.to) ? (
                  <span className="absolute inset-x-4 bottom-0 h-px bg-or" aria-hidden="true" />
                ) : null}
              </Lien>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Lien
              to="/panier"
              aria-label={`Panier, ${nombre} article${nombre > 1 ? 's' : ''}`}
              className={`group inline-flex min-h-11 items-center gap-2 border px-4 text-sm font-semibold transition-colors ${
                chemin === '/panier'
                  ? 'border-or bg-or text-creme'
                  : 'border-encre/20 text-marine hover:border-or hover:text-or'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L20 8H6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1.2" fill="currentColor" />
                <circle cx="17" cy="20" r="1.2" fill="currentColor" />
              </svg>
              <span className="hidden sm:inline">Panier</span>
              <span
                className={`inline-flex h-6 min-w-6 items-center justify-center px-1.5 text-xs font-bold tabular-nums ${
                  chemin === '/panier' ? 'bg-papier text-or' : 'bg-or text-creme'
                } ${pulse ? 'badge-pulse' : ''}`}
                aria-hidden="true"
              >
                {nombre}
              </span>
            </Lien>

            <button
              ref={boutonRef}
              type="button"
              onClick={() => setOuvert((etat) => !etat)}
              aria-expanded={ouvert}
              aria-controls="menu-mobile"
              aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="inline-flex h-11 w-11 items-center justify-center border border-encre/20 text-marine transition-colors hover:border-or hover:text-or lg:hidden"
            >
              <span className="relative block h-4 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 block h-px w-full bg-current transition-transform duration-300 ${ouvert ? 'top-2 rotate-45' : 'top-1'}`}
                />
                <span
                  className={`absolute left-0 top-2 block h-px w-full bg-current transition-opacity duration-200 ${ouvert ? 'opacity-0' : 'opacity-100'}`}
                />
                <span
                  className={`absolute left-0 top-2 block h-px w-full bg-current transition-transform duration-300 ${ouvert ? 'top-2 -rotate-45' : 'top-3'}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="menu-mobile"
        ref={panneauRef}
        role={ouvert ? 'dialog' : undefined}
        aria-modal={ouvert || undefined}
        aria-label={ouvert ? 'Menu de navigation' : undefined}
        aria-hidden={!ouvert}
        className={`fixed inset-0 z-40 flex flex-col bg-papier px-6 pt-24 pb-10 transition-[opacity,transform] duration-300 lg:hidden ${
          ouvert
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-3 opacity-0'
        }`}
      >
        <nav aria-label="Navigation mobile" className="flex flex-1 flex-col justify-center">
          {LIENS.map((lien, index) => (
            <Lien
              key={lien.to}
              to={lien.to}
              tabIndex={ouvert ? 0 : -1}
              onClick={() => setOuvert(false)}
              aria-current={estActif(lien.to) ? 'page' : undefined}
              className={`flex min-h-14 items-center justify-between border-b border-encre/10 py-4 font-display text-3xl transition-colors ${
                estActif(lien.to) ? 'text-or' : 'text-marine hover:text-or'
              }`}
            >
              {lien.libelle}
              <span className="text-xs font-sans tracking-widest text-or/70" aria-hidden="true">
                0{index + 1}
              </span>
            </Lien>
          ))}
        </nav>
        <p className="mt-8 text-sm text-encre-douce">
          Réservez en ligne, retirez et payez en boutique.
        </p>
      </div>
    </>
  )
}
