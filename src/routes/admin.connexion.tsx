import { useState, type FormEvent } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Champ } from '@/components/Champ'
import { Lien } from '@/components/Lien'
import { CLASSE_BOUTON_PRIMAIRE, CLASSE_CHAMP } from '@/lib/classes'
import { metaPage } from '@/lib/seo'
import { connecterAdminFn } from '@/lib/server/auth.functions'
import { schemaConnexion } from '@/lib/validation'

export const Route = createFileRoute('/admin/connexion')({
  head: () => metaPage({ titre: 'Connexion administration' }),
  component: ConnexionAdmin,
})

function ConnexionAdmin() {
  const naviguer = useNavigate()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreurs, setErreurs] = useState<{ email?: string; motDePasse?: string }>({})
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const soumettre = async (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    setMessage('')
    const analyse = schemaConnexion.safeParse({ email, motDePasse })

    if (!analyse.success) {
      const nouvelles: { email?: string; motDePasse?: string } = {}
      for (const probleme of analyse.error.issues) {
        const champ = String(probleme.path[0]) as 'email' | 'motDePasse'
        if (champ in nouvelles && !nouvelles[champ]) {
          nouvelles[champ] = probleme.message
        }
      }
      setErreurs(nouvelles)
      return
    }

    setErreurs({})
    setEnvoi(true)
    try {
      const resultat = await connecterAdminFn({ data: analyse.data })
      if (!resultat.succes) {
        setMessage(resultat.message)
        return
      }
      await naviguer({ to: '/admin', replace: true })
      window.location.reload()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue. Réessayez dans un instant.',
      )
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="mx-auto max-w-md py-12 sm:py-20">
      <div className="border border-encre/10 bg-papier p-7 sm:p-9">
        <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">Espace réservé</p>
        <h1 className="mt-4 text-3xl text-marine">Connexion administration</h1>
        <p className="mt-3 text-sm leading-relaxed text-encre-douce">
          Cet espace permet de suivre les réservations et de modifier le catalogue. Il est réservé à
          Bokhismany.
        </p>
        <form className="mt-8 space-y-5" onSubmit={soumettre} noValidate>
          <Champ id="admin-email" libelle="Email" erreur={erreurs.email}>
            {(attributs) => (
              <input
                {...attributs}
                type="email"
                autoComplete="username"
                value={email}
                onChange={(evenement) => setEmail(evenement.target.value)}
                placeholder="admin@exemple.com"
                className={CLASSE_CHAMP}
              />
            )}
          </Champ>
          <Champ id="admin-mot-de-passe" libelle="Mot de passe" erreur={erreurs.motDePasse}>
            {(attributs) => (
              <input
                {...attributs}
                type="password"
                autoComplete="current-password"
                value={motDePasse}
                onChange={(evenement) => setMotDePasse(evenement.target.value)}
                placeholder="Votre mot de passe"
                className={CLASSE_CHAMP}
              />
            )}
          </Champ>
          {message ? (
            <p role="alert" className="text-sm font-medium text-alerte">
              {message}
            </p>
          ) : null}
          <button type="submit" disabled={envoi} className={`${CLASSE_BOUTON_PRIMAIRE} w-full`}>
            {envoi ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <Lien
          to="/"
          viewTransition
          className="mt-6 block text-center text-sm text-encre-douce underline decoration-or underline-offset-4 hover:text-marine"
        >
          Retour au site
        </Lien>
      </div>
    </section>
  )
}
