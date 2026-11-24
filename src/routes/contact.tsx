import { useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Champ } from '@/components/Champ'
import { Lien } from '@/components/Lien'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { CLASSE_BOUTON_PRIMAIRE, CLASSE_CHAMP } from '@/lib/classes'
import { EMAIL_CONTACT, POINTS_DE_VENTE, RESEAUX_SOCIAUX } from '@/lib/entreprise'
import { metaPage } from '@/lib/seo'
import { envoyerMessageFn } from '@/lib/server/contact.functions'
import { schemaContact } from '@/lib/validation'

export const Route = createFileRoute('/contact')({
  head: () =>
    metaPage({
      titre: 'Contact',
      description:
        'Contactez Bokhismany Trading SARL par téléphone, email ou formulaire pour vos questions sur nos produits et prix.',
    }),
  component: Contact,
})

interface Formulaire {
  nom: string
  contact: string
  message: string
}

const VIDE: Formulaire = { nom: '', contact: '', message: '' }

function Contact() {
  const [formulaire, setFormulaire] = useState<Formulaire>(VIDE)
  const [erreurs, setErreurs] = useState<Partial<Record<keyof Formulaire, string>>>({})
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'succes' | 'erreur'>('repos')
  const [messageErreur, setMessageErreur] = useState('')

  const changer = (champ: keyof Formulaire, valeur: string) => {
    setFormulaire((etatActuel) => ({ ...etatActuel, [champ]: valeur }))
    setErreurs((etatActuel) => ({ ...etatActuel, [champ]: undefined }))
  }

  const soumettre = async (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    setMessageErreur('')
    const analyse = schemaContact.safeParse(formulaire)

    if (!analyse.success) {
      const nouvellesErreurs: Partial<Record<keyof Formulaire, string>> = {}
      for (const probleme of analyse.error.issues) {
        const champ = String(probleme.path[0]) as keyof Formulaire
        if (champ in VIDE && !nouvellesErreurs[champ]) {
          nouvellesErreurs[champ] = probleme.message
        }
      }
      setErreurs(nouvellesErreurs)
      setEtat('erreur')
      return
    }

    setEtat('envoi')
    try {
      await envoyerMessageFn({ data: analyse.data })
      setFormulaire(VIDE)
      setEtat('succes')
    } catch (error) {
      setMessageErreur(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue. Réessayez dans un instant.',
      )
      setEtat('erreur')
    }
  }

  return (
    <main>
      <PageHero
        surtitre="Nous écrire"
        titre="Contact"
        description="Pour toute question sur nos produits, nos prix ou nos commandes en gros, contactez-nous par téléphone, par email ou via le formulaire ci-dessous. Nous vous répondons dans les meilleurs délais."
      />
      <section className="conteneur-site grid gap-12 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24">
        <Reveal>
          <div>
            <h2 className="text-2xl text-marine">Nos coordonnées</h2>
            <div className="mt-7 space-y-7">
              <div className="border border-encre/10 bg-papier p-6">
                <p className="text-xs font-semibold tracking-[0.25em] text-or uppercase">Email</p>
                <a
                  href={`mailto:${EMAIL_CONTACT}`}
                  className="mt-2 block break-all text-base font-semibold text-marine underline decoration-or underline-offset-4"
                >
                  {EMAIL_CONTACT}
                </a>
              </div>
              <div className="border border-encre/10 bg-papier p-6">
                <p className="text-xs font-semibold tracking-[0.25em] text-or uppercase">
                  Téléphones
                </p>
                <ul className="mt-3 space-y-3">
                  {POINTS_DE_VENTE.map((point) => (
                    <li key={point.nom} className="flex items-baseline justify-between gap-4">
                      <span className="text-sm text-encre-douce">{point.nom}</span>
                      <a
                        href={`tel:${point.tel}`}
                        className="text-sm font-semibold text-marine underline decoration-or underline-offset-4"
                      >
                        {point.telephone}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-encre/10 bg-papier p-6">
                <p className="text-xs font-semibold tracking-[0.25em] text-or uppercase">
                  Réseaux sociaux
                </p>
                <ul className="mt-3 space-y-2 text-sm text-marine">
                  {RESEAUX_SOCIAUX.map((reseau) => (
                    <li key={reseau.nom}>
                      {reseau.nom} : <span className="font-semibold">{reseau.identifiant}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delai={80}>
          <div className="border border-encre/10 bg-papier p-6 sm:p-9">
            <h2 className="text-2xl text-marine">Envoyer un message</h2>
            <p className="mt-2 text-sm text-encre-douce">
              Les champs marqués d’un astérisque sont obligatoires.
            </p>
            {etat === 'succes' ? (
              <div
                role="status"
                className="mt-7 border border-succes/30 bg-succes/10 p-6 text-sm leading-relaxed text-succes"
              >
                Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.
                <button
                  type="button"
                  onClick={() => setEtat('repos')}
                  className="mt-4 block text-sm font-semibold underline underline-offset-4"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={soumettre} noValidate>
                <Champ id="contact-nom" libelle="Nom *" erreur={erreurs.nom}>
                  {(attributs) => (
                    <input
                      {...attributs}
                      type="text"
                      name="nom"
                      autoComplete="name"
                      placeholder="Votre nom"
                      value={formulaire.nom}
                      onChange={(evenement) => changer('nom', evenement.target.value)}
                      className={CLASSE_CHAMP}
                    />
                  )}
                </Champ>
                <Champ
                  id="contact-coordonnees"
                  libelle="Email ou téléphone *"
                  erreur={erreurs.contact}
                  aide="Nous utiliserons cette information uniquement pour vous répondre."
                >
                  {(attributs) => (
                    <input
                      {...attributs}
                      type="text"
                      name="contact"
                      autoComplete="email"
                      placeholder="email@exemple.com ou +243 ..."
                      value={formulaire.contact}
                      onChange={(evenement) => changer('contact', evenement.target.value)}
                      className={CLASSE_CHAMP}
                    />
                  )}
                </Champ>
                <Champ id="contact-message" libelle="Message *" erreur={erreurs.message}>
                  {(attributs) => (
                    <textarea
                      {...attributs}
                      name="message"
                      rows={6}
                      placeholder="Décrivez votre demande"
                      value={formulaire.message}
                      onChange={(evenement) => changer('message', evenement.target.value)}
                      className={`${CLASSE_CHAMP} resize-y py-3`}
                    />
                  )}
                </Champ>
                {etat === 'erreur' && messageErreur ? (
                  <p role="alert" className="text-sm font-medium text-alerte">
                    {messageErreur}
                  </p>
                ) : null}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" disabled={etat === 'envoi'} className={CLASSE_BOUTON_PRIMAIRE}>
                    {etat === 'envoi' ? 'Envoi en cours…' : 'Envoyer le message'}
                  </button>
                  <Lien
                    to="/produits"
                    viewTransition
                    className="text-sm font-semibold text-marine underline decoration-or underline-offset-4"
                  >
                    Voir le catalogue
                  </Lien>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    </main>
  )
}
