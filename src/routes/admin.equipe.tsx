import { useState, type FormEvent } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Champ } from '@/components/Champ'
import {
  CLASSE_BOUTON_OR,
  CLASSE_BOUTON_SECONDAIRE,
  CLASSE_CHAMP,
} from '@/lib/classes'
import { metaPage } from '@/lib/seo'
import {
  enregistrerMembreFn,
  obtenirEquipeAdminFn,
  supprimerMembreFn,
} from '@/lib/server/equipe.functions'
import { schemaMembreEquipe } from '@/lib/validation'

export const Route = createFileRoute('/admin/equipe')({
  head: () => metaPage({ titre: 'Équipe dirigeante' }),
  loader: () => obtenirEquipeAdminFn(),
  component: EquipeAdmin,
})

interface Formulaire {
  id?: number
  nom: string
  fonction: string
  biographie: string
  photoUrl: string
  ordre: number
  isActive: boolean
}

const VIDE: Formulaire = {
  nom: '',
  fonction: '',
  biographie: '',
  photoUrl: '',
  ordre: 0,
  isActive: true,
}

function EquipeAdmin() {
  const membres = Route.useLoaderData()
  const routeur = useRouter()
  const [formulaire, setFormulaire] = useState<Formulaire>(VIDE)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const changer = (champ: keyof Formulaire, valeur: string | boolean) => {
    setFormulaire((etat) => ({ ...etat, [champ]: valeur }))
    setErreurs((etat) => ({ ...etat, [champ]: '' }))
  }

  const editer = (membre: (typeof membres)[number]) => {
    setFormulaire({
      id: membre.id,
      nom: membre.nom,
      fonction: membre.fonction,
      biographie: membre.biographie ?? '',
      photoUrl: membre.photoUrl ?? '',
      ordre: membre.ordre,
      isActive: membre.isActive,
    })
    setMessage('')
  }

  const soumettre = async (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    setMessage('')
    const analyse = schemaMembreEquipe.safeParse({
      ...formulaire,
      id: formulaire.id ?? undefined,
    })

    if (!analyse.success) {
      const nouvelles: Record<string, string> = {}
      for (const probleme of analyse.error.issues) {
        const champ = String(probleme.path[0])
        if (!nouvelles[champ]) nouvelles[champ] = probleme.message
      }
      setErreurs(nouvelles)
      return
    }

    setEnvoi(true)
    try {
      await enregistrerMembreFn({ data: analyse.data })
      setFormulaire(VIDE)
      setMessage(formulaire.id ? 'Membre mis à jour.' : 'Membre ajouté.')
      await routeur.invalidate()
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

  const supprimer = async (id: number) => {
    setEnvoi(true)
    try {
      await supprimerMembreFn({ data: { id } })
      if (formulaire.id === id) setFormulaire(VIDE)
      setMessage('Membre retiré de l’équipe.')
      await routeur.invalidate()
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'La suppression a échoué.',
      )
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">
          Contenu du site
        </p>
        <h1 className="mt-3 text-3xl text-marine sm:text-4xl">Équipe dirigeante</h1>
        <p className="mt-3 text-sm text-encre-douce">
          Les membres renseignés ici apparaissent sur la page « À propos ». Aucun nom n’est
          inventé : tant que la liste est vide, la page affiche un TODO.
        </p>
      </header>

      {message ? (
        <p role="status" className="mb-6 border border-or/30 bg-or-pale/30 p-4 text-sm text-marine">
          {message}
        </p>
      ) : null}

      <section className="mb-9 border border-encre/10 bg-papier p-6 sm:p-8">
        <h2 className="text-xl text-marine">
          {formulaire.id ? `Modifier ${formulaire.nom}` : 'Ajouter un membre'}
        </h2>
        <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={soumettre} noValidate>
          <Champ id="equipe-nom" libelle="Nom et prénom *" erreur={erreurs.nom}>
            {(attributs) => (
              <input
                {...attributs}
                value={formulaire.nom}
                onChange={(evenement) => changer('nom', evenement.target.value)}
                className={`${CLASSE_CHAMP} mt-2`}
                placeholder="Nom du membre"
              />
            )}
          </Champ>
          <Champ id="equipe-fonction" libelle="Fonction *" erreur={erreurs.fonction}>
            {(attributs) => (
              <input
                {...attributs}
                value={formulaire.fonction}
                onChange={(evenement) => changer('fonction', evenement.target.value)}
                className={`${CLASSE_CHAMP} mt-2`}
                placeholder="Directeur commercial, gérante…"
              />
            )}
          </Champ>
          <div className="sm:col-span-2">
            <Champ id="equipe-biographie" libelle="Présentation" erreur={erreurs.biographie}>
              {(attributs) => (
                <textarea
                  {...attributs}
                  rows={3}
                  value={formulaire.biographie}
                  onChange={(evenement) => changer('biographie', evenement.target.value)}
                  className={`${CLASSE_CHAMP} mt-2 resize-y py-2`}
                  placeholder="Deux phrases sur son parcours, à valider avant publication."
                />
              )}
            </Champ>
          </div>
          <Champ id="equipe-photo" libelle="URL de la photo" erreur={erreurs.photoUrl}>
            {(attributs) => (
              <input
                {...attributs}
                type="url"
                value={formulaire.photoUrl}
                onChange={(evenement) => changer('photoUrl', evenement.target.value)}
                className={`${CLASSE_CHAMP} mt-2`}
                placeholder="https://…"
              />
            )}
          </Champ>
          <div>
            <label htmlFor="equipe-ordre" className="text-sm font-semibold text-marine">
              Ordre d’affichage
            </label>
            <input
              id="equipe-ordre"
              type="number"
              min={0}
              max={999}
              value={formulaire.ordre}
              onChange={(evenement) => changer('ordre', evenement.target.value)}
              className={`${CLASSE_CHAMP} mt-2`}
            />
            {erreurs.ordre ? <p className="mt-1 text-xs text-alerte">{erreurs.ordre}</p> : null}
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-marine sm:col-span-2">
            <input
              type="checkbox"
              checked={formulaire.isActive}
              onChange={(evenement) => changer('isActive', evenement.target.checked)}
              className="h-5 w-5 [accent-color:var(--color-or)]"
            />
            Afficher sur le site public
          </label>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" disabled={envoi} className={CLASSE_BOUTON_OR}>
              {formulaire.id ? 'Enregistrer les modifications' : 'Ajouter le membre'}
            </button>
            {formulaire.id ? (
              <button
                type="button"
                onClick={() => {
                  setFormulaire(VIDE)
                  setErreurs({})
                }}
                className={CLASSE_BOUTON_SECONDAIRE}
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="border border-encre/10 bg-papier p-6 sm:p-8">
        <h2 className="text-xl text-marine">Membres enregistrés</h2>
        {membres.length === 0 ? (
          <p className="mt-4 border border-dashed border-or/40 bg-or-pale/25 p-5 text-sm text-encre-douce">
            TODO — renseignez l’équipe dirigeante avec le formulaire ci-dessus.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-encre/10">
            {membres.map((membre) => (
              <li key={membre.id} className="flex flex-wrap items-center gap-4 py-4">
                {membre.photoUrl ? (
                  <img
                    src={membre.photoUrl}
                    alt=""
                    className="h-14 w-14 border border-encre/10 object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center border border-encre/10 bg-creme font-display text-lg text-marine">
                    {membre.nom.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-marine">{membre.nom}</p>
                  <p className="text-sm text-encre-douce">{membre.fonction}</p>
                  {!membre.isActive ? (
                    <p className="mt-1 text-xs font-semibold text-alerte">Masqué du site</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => editer(membre)}
                    className="min-h-11 border border-encre/20 px-4 text-sm font-semibold text-marine hover:border-marine"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => supprimer(membre.id)}
                    disabled={envoi}
                    className="min-h-11 border border-alerte/40 px-4 text-sm font-semibold text-alerte hover:bg-alerte/10"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
