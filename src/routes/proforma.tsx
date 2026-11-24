import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Champ } from '@/components/Champ'
import { EmptyState } from '@/components/EmptyState'
import { Lien } from '@/components/Lien'
import { PageHero } from '@/components/PageHero'
import { CLASSE_BOUTON_OR, CLASSE_BOUTON_SECONDAIRE } from '@/lib/classes'
import { EMAIL_CONTACT, MARQUE, RAISON_SOCIALE, SIEGE_SOCIAL } from '@/lib/entreprise'
import { formaterPrix, MENTION_ESTIMATION } from '@/lib/format'
import { metaPage } from '@/lib/seo'
import {
  CLIENT_PROFORMA_VIDE,
  CLE_CLIENT_PROFORMA,
  formaterDateProforma,
  genererReference,
  type ClientProforma,
  type DocumentProforma,
} from '@/lib/proforma'
import { genererPdfProforma } from '@/lib/pdf'
import { schemaProformaClient } from '@/lib/validation'
import { usePanier } from '@/context/CartContext'

export const Route = createFileRoute('/proforma')({
  head: () =>
    metaPage({
      titre: 'Proforma',
      description:
        'Exportez votre panier Bokhismany sous forme de proforma : montant estimé, produits sélectionnés et retrait en boutique, sans paiement en ligne.',
    }),
  component: Proforma,
})

function Proforma() {
  const { lignes, total, pret } = usePanier()
  const [client, setClient] = useState<ClientProforma>(CLIENT_PROFORMA_VIDE)
  const [erreurs, setErreurs] = useState<Partial<Record<keyof ClientProforma, string>>>({})
  const [documentProforma, setDocumentProforma] = useState<DocumentProforma | null>(null)
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE_CLIENT_PROFORMA)
      if (brut) {
        const donnees: unknown = JSON.parse(brut)
        if (donnees && typeof donnees === 'object') {
          const values = donnees as Partial<ClientProforma>
          setClient({
            nom: typeof values.nom === 'string' ? values.nom : '',
            telephone: typeof values.telephone === 'string' ? values.telephone : '',
            societe: typeof values.societe === 'string' ? values.societe : '',
            email: typeof values.email === 'string' ? values.email : '',
          })
        }
      }
    } catch {
      // Un stockage indisponible ne bloque pas la génération du document.
    }
  }, [])

  const changer = (champ: keyof ClientProforma, valeur: string) => {
    setClient((etat) => ({ ...etat, [champ]: valeur }))
    setErreurs((etat) => ({ ...etat, [champ]: undefined }))
    setDocumentProforma(null)
  }

  const generer = (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    setMessage('')
    const analyse = schemaProformaClient.safeParse(client)

    if (!analyse.success) {
      const nouvelles: Partial<Record<keyof ClientProforma, string>> = {}
      for (const probleme of analyse.error.issues) {
        const champ = String(probleme.path[0]) as keyof ClientProforma
        if (!nouvelles[champ]) nouvelles[champ] = probleme.message
      }
      setErreurs(nouvelles)
      return
    }

    try {
      window.localStorage.setItem(CLE_CLIENT_PROFORMA, JSON.stringify(analyse.data))
    } catch {
      // Le document reste générable sans mémorisation des coordonnées.
    }
    setDocumentProforma({
      reference: genererReference(),
      date: new Date(),
      client: {
        nom: analyse.data.nom,
        telephone: analyse.data.telephone,
        societe: analyse.data.societe ?? '',
        email: analyse.data.email ?? '',
      },
      lignes,
      total,
    })
  }

  const telechargerPdf = async () => {
    if (!documentProforma) return
    setEnvoi(true)
    setMessage('')
    try {
      await genererPdfProforma(documentProforma)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Le PDF n’a pas pu être généré. Réessayez dans un instant.',
      )
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <main>
      <PageHero
        surtitre="Document commercial"
        titre="Proforma de votre panier"
        description="Obtenez une proforma avec vos produits, vos quantités et le montant estimé. Elle est à présenter en boutique : aucun paiement en ligne n’est effectué."
      />

      {!pret ? (
        <section className="conteneur-site py-20">
          <p className="text-encre-douce">Chargement du panier…</p>
        </section>
      ) : lignes.length === 0 ? (
        <section className="conteneur-site py-16 lg:py-24">
          <EmptyState
            titre="Aucun panier à exporter"
            description="Ajoutez d’abord des produits à votre panier pour générer une proforma."
            action={{ libelle: 'Voir les produits', to: '/produits' }}
          />
        </section>
      ) : (
        <section className="conteneur-site grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:py-20">
          <div>
            <h2 className="text-2xl text-marine">Vos coordonnées</h2>
            <p className="mt-3 text-sm leading-relaxed text-encre-douce">
              Elles apparaîtront uniquement sur votre proforma. Les champs marqués d’un astérisque
              sont obligatoires.
            </p>
            <form className="mt-8 space-y-5" onSubmit={generer} noValidate>
              <Champ id="proforma-nom" libelle="Nom *" erreur={erreurs.nom}>
                {(attributs) => (
                  <input
                    {...attributs}
                    type="text"
                    name="nom"
                    autoComplete="name"
                    value={client.nom}
                    onChange={(evenement) => changer('nom', evenement.target.value)}
                    className="border-b border-encre/25 bg-transparent pb-2 text-base text-marine focus:border-or focus:outline-none"
                    placeholder="Votre nom"
                  />
                )}
              </Champ>
              <Champ id="proforma-telephone" libelle="Téléphone *" erreur={erreurs.telephone}>
                {(attributs) => (
                  <input
                    {...attributs}
                    type="tel"
                    name="telephone"
                    autoComplete="tel"
                    value={client.telephone}
                    onChange={(evenement) => changer('telephone', evenement.target.value)}
                    className="border-b border-encre/25 bg-transparent pb-2 text-base text-marine focus:border-or focus:outline-none"
                    placeholder="+243 ..."
                  />
                )}
              </Champ>
              <Champ id="proforma-societe" libelle="Société (facultatif)" erreur={erreurs.societe}>
                {(attributs) => (
                  <input
                    {...attributs}
                    type="text"
                    name="societe"
                    autoComplete="organization"
                    value={client.societe}
                    onChange={(evenement) => changer('societe', evenement.target.value)}
                    className="border-b border-encre/25 bg-transparent pb-2 text-base text-marine focus:border-or focus:outline-none"
                    placeholder="Nom de votre structure"
                  />
                )}
              </Champ>
              <Champ id="proforma-email" libelle="Email (facultatif)" erreur={erreurs.email}>
                {(attributs) => (
                  <input
                    {...attributs}
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={client.email}
                    onChange={(evenement) => changer('email', evenement.target.value)}
                    className="border-b border-encre/25 bg-transparent pb-2 text-base text-marine focus:border-or focus:outline-none"
                    placeholder="email@exemple.com"
                  />
                )}
              </Champ>
              <button type="submit" className={CLASSE_BOUTON_OR}>
                Générer la proforma
              </button>
            </form>
            {message ? (
              <p role="alert" className="mt-5 text-sm font-medium text-alerte">
                {message}
              </p>
            ) : null}
            <Lien
              to="/panier"
              viewTransition
              className="mt-7 inline-flex min-h-11 items-center text-sm font-semibold text-marine underline decoration-or underline-offset-4"
            >
              ← Retour au panier
            </Lien>
          </div>

          <div>
            {documentProforma ? (
              <>
                <article className="proforma-document border border-encre/15 bg-papier">
                  <img
                    src="/images/marque/banniere.png"
                    alt={`Bannière ${RAISON_SOCIALE}`}
                    className="proforma-banniere block w-full"
                  />
                  <div className="p-5 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.65rem] font-semibold tracking-[0.24em] text-or uppercase">
                          {MARQUE}
                        </p>
                        <h3 className="mt-2 text-3xl text-marine">Proforma</h3>
                      </div>
                      <div className="text-right text-xs text-encre-douce">
                        <p>Réf. {documentProforma.reference}</p>
                        <p className="mt-1">{formaterDateProforma(documentProforma.date)}</p>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-6 border-y border-encre/10 py-6 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-[0.6rem] font-semibold tracking-[0.2em] text-or uppercase">
                          Fournisseur
                        </p>
                        <p className="mt-2 font-semibold text-marine">{RAISON_SOCIALE}</p>
                        <p className="mt-1 text-encre-douce">{SIEGE_SOCIAL}</p>
                        <p className="mt-1 text-encre-douce">{EMAIL_CONTACT}</p>
                      </div>
                      <div>
                        <p className="text-[0.6rem] font-semibold tracking-[0.2em] text-or uppercase">
                          Client
                        </p>
                        <p className="mt-2 font-semibold text-marine">{documentProforma.client.nom}</p>
                        {documentProforma.client.societe ? (
                          <p className="mt-1 text-encre-douce">{documentProforma.client.societe}</p>
                        ) : null}
                        <p className="mt-1 text-encre-douce">{documentProforma.client.telephone}</p>
                        {documentProforma.client.email ? (
                          <p className="mt-1 text-encre-douce">{documentProforma.client.email}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-8 overflow-x-auto">
                      <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-marine text-xs uppercase">
                            <th scope="col" className="py-3 pr-3 font-semibold">Produit</th>
                            <th scope="col" className="py-3 pr-3 font-semibold">Format</th>
                            <th scope="col" className="py-3 pr-3 text-right font-semibold">PU</th>
                            <th scope="col" className="py-3 pr-3 text-right font-semibold">Qté</th>
                            <th scope="col" className="py-3 text-right font-semibold">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-encre/10">
                          {documentProforma.lignes.map((ligne) => (
                            <tr key={ligne.slug}>
                              <td className="py-3 pr-3 font-semibold text-marine">{ligne.nom}</td>
                              <td className="py-3 pr-3 text-encre-douce">{ligne.format ?? '—'}</td>
                              <td className="py-3 pr-3 text-right tabular-nums">{formaterPrix(ligne.prixFc)}</td>
                              <td className="py-3 pr-3 text-right tabular-nums">{ligne.quantite}</td>
                              <td className="py-3 text-right tabular-nums">
                                {formaterPrix(ligne.prixFc * ligne.quantite)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <div className="w-full max-w-xs border border-encre/15 bg-creme p-4">
                        <p className="text-xs text-encre-douce">Total estimé</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-marine">
                          {formaterPrix(documentProforma.total)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 border border-or/40 bg-or-pale/25 p-4 text-xs leading-relaxed text-marine">
                      <p className="font-semibold">{MENTION_ESTIMATION}</p>
                      <p className="mt-2">
                        Aucun paiement en ligne. Ce document ne constitue pas une facture : le prix
                        définitif est confirmé en boutique au moment du règlement.
                      </p>
                    </div>
                  </div>
                </article>

                <div className="mt-6 flex flex-wrap gap-3 proforma-actions">
                  <button
                    type="button"
                    onClick={telechargerPdf}
                    disabled={envoi}
                    className={CLASSE_BOUTON_OR}
                  >
                    {envoi ? 'Génération du PDF…' : 'Télécharger le PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className={CLASSE_BOUTON_SECONDAIRE}
                  >
                    Imprimer / enregistrer en PDF
                  </button>
                </div>
              </>
            ) : (
              <div className="border border-dashed border-encre/20 p-10 text-center text-sm text-encre-douce">
                Renseignez vos coordonnées pour prévisualiser la proforma. Le document reprend
                automatiquement les {lignes.length} lignes de votre panier.
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}
