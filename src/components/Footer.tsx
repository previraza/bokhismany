import { Lien } from '@/components/Lien'
import { Logo } from '@/components/Logo'
import { EMAIL_CONTACT, MARQUE, POINTS_DE_VENTE } from '@/lib/entreprise'

const LIENS = [
  { libelle: 'Accueil', to: '/' as const },
  { libelle: 'Nos produits', to: '/produits' as const },
  { libelle: 'Proforma', to: '/proforma' as const },
  { libelle: 'Nos adresses', to: '/adresses' as const },
  { libelle: 'À propos', to: '/a-propos' as const },
  { libelle: 'Contact', to: '/contact' as const },
]

export function Footer() {
  return (
    <footer className="bg-marine text-creme">
      <div className="conteneur-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-24">
        <div className="lg:col-span-1">
          <Logo surFondSombre />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-creme/65">
            Commerce général et distribution de produits alimentaires de première nécessité entre
            Kinshasa et Brazzaville.
          </p>
          <img
            src="/images/marque/daayake-food.png"
            alt={`Logo ${MARQUE}`}
            className="mt-7 h-20 w-20 object-contain"
          />
        </div>

        <div>
          <h2 className="etiquette mb-6 text-or-pale">Navigation</h2>
          <ul className="space-y-3 text-sm">
            {LIENS.map((lien) => (
              <li key={lien.to}>
                <Lien to={lien.to} viewTransition className="text-creme/75 hover:text-or-pale">
                  {lien.libelle}
                </Lien>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="etiquette mb-6 text-or-pale">Points de vente</h2>
          <ul className="space-y-3 text-sm text-creme/75">
            {POINTS_DE_VENTE.map((point) => (
              <li key={point.ville}>
                <span className="font-semibold text-creme">{point.ville}</span>
                <span className="block">{point.adresse}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="etiquette mb-6 text-or-pale">Nous contacter</h2>
          <a href={`mailto:${EMAIL_CONTACT}`} className="block text-sm text-creme/75 hover:text-or-pale">
            {EMAIL_CONTACT}
          </a>
          <Lien
            to="/contact"
            viewTransition
            className="mt-4 inline-block border-b border-or pb-1 text-sm font-semibold text-creme hover:text-or-pale"
          >
            Envoyer un message
          </Lien>
        </div>
      </div>
      <div className="conteneur-site flex flex-col gap-3 border-t border-creme/15 py-6 text-xs text-creme/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Bokhismany Trading SARL</p>
        <p>Kinshasa · Brazzaville</p>
      </div>
    </footer>
  )
}
