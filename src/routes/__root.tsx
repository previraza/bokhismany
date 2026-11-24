import { useEffect, type ReactNode } from 'react'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import '../styles/theme.css'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { CartProvider } from '@/context/CartContext'
import { PageIntrouvable } from '@/components/PageIntrouvable'
import { metaRacine } from '@/lib/seo'

export const Route = createRootRoute({
  // Paramètre de recherche global optionnel : le filtre du catalogue peut être partagé par URL.
  validateSearch: (recherche: Record<string, unknown>): { categorie?: string } => ({
    categorie:
      typeof recherche.categorie === 'string' && recherche.categorie.length > 0
        ? recherche.categorie
        : undefined,
  }),
  head: () => ({
    ...metaRacine(),
    links: [
      { rel: 'icon', type: 'image/png', href: '/images/marque/favicon.png' },
      { rel: 'preload', as: 'image', href: '/images/marque/bokhismany-logo-officiel.png' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: PageIntrouvable,
})

function RootComponent() {
  useEffect(() => {
    document.documentElement.dataset.hydrate = 'true'
  }, [])

  return <RootDocument><Outlet /></RootDocument>
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <div
          aria-hidden="true"
          className="fixed inset-y-0 left-0 z-50 hidden w-12 flex-col items-center justify-between bg-[#6d7278] py-6 text-white lg:flex"
        >
          <span className="text-[0.55rem] font-semibold tracking-[0.32em] [writing-mode:vertical-rl] rotate-180">
            DAAYAKE FOOD
          </span>
          <span className="h-20 w-px bg-white/45" />
          <span className="text-[0.5rem] font-semibold tracking-[0.18em]">KIN · BZV</span>
        </div>
        <CartProvider>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-or focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-creme"
          >
            Aller au contenu
          </a>
          <Header />
          <div id="contenu">{children}</div>
          <Footer />
        </CartProvider>
        <Scripts />
      </body>
    </html>
  )
}
