import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { CLASSE_BOUTON_OR, CLASSE_BOUTON_SECONDAIRE, CLASSE_CHAMP } from '@/lib/classes'
import type { CouponScope, CouponType } from '@/lib/db/schema'
import { formaterPrix } from '@/lib/format'
import { metaPage } from '@/lib/seo'
import {
  listCouponTargetsFn,
  listCouponsAdminFn,
  saveCouponFn,
} from '@/lib/server/coupons.functions'
import { schemaCoupon } from '@/lib/validation'

type FormulaireCoupon = {
  id?: number
  code: string
  type: CouponType
  value: number | ''
  scope: CouponScope
  targets: string[]
  isActive: boolean
  maxUsages: number | ''
}

const VIDE: FormulaireCoupon = {
  code: '',
  type: 'percentage',
  value: 10,
  scope: 'all',
  targets: [],
  isActive: true,
  maxUsages: '',
}

export const Route = createFileRoute('/admin/coupons')({
  head: () => metaPage({ titre: 'Coupons de réduction' }),
  loader: async () => {
    const [coupons, cibles] = await Promise.all([listCouponsAdminFn(), listCouponTargetsFn()])
    return { coupons, cibles }
  },
  component: CouponsAdmin,
})

function CouponsAdmin() {
  const { coupons, cibles } = Route.useLoaderData()
  const routeur = useRouter()
  const [formulaire, setFormulaire] = useState<FormulaireCoupon>(VIDE)
  const [message, setMessage] = useState('')
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    if (formulaire.scope === 'all') setFormulaire((etat) => ({ ...etat, targets: [] }))
  }, [formulaire.scope])

  const modifier = <C extends keyof FormulaireCoupon>(champ: C, valeur: FormulaireCoupon[C]) => {
    setFormulaire((etat) => ({ ...etat, [champ]: valeur }))
    setErreurs((etat) => ({ ...etat, [champ]: '' }))
  }

  const basculerCible = (slug: string) => {
    setFormulaire((etat) => ({
      ...etat,
      targets: etat.targets.includes(slug)
        ? etat.targets.filter((element) => element !== slug)
        : [...etat.targets, slug],
    }))
  }

  const editer = (coupon: (typeof coupons)[number]) => {
    setFormulaire({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      scope: coupon.scope,
      targets: coupon.targets,
      isActive: coupon.isActive,
      maxUsages: coupon.maxUsages ?? '',
    })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const soumettre = async (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    setMessage('')
    const analyse = schemaCoupon.safeParse({
      id: formulaire.id,
      code: formulaire.code,
      type: formulaire.type,
      value: formulaire.value === '' ? 0 : formulaire.value,
      scope: formulaire.scope,
      targets: formulaire.targets,
      isActive: formulaire.isActive,
      maxUsages: formulaire.maxUsages === '' ? null : formulaire.maxUsages,
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
    setErreurs({})
    setEnvoi(true)
    try {
      await saveCouponFn({ data: analyse.data })
      await routeur.invalidate()
      setMessage(formulaire.id ? 'Coupon mis à jour.' : `Coupon ${analyse.data.code} créé.`)
      setFormulaire(VIDE)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Enregistrement impossible.')
    } finally {
      setEnvoi(false)
    }
  }

  const libelleValeur = (coupon: (typeof coupons)[number]) =>
    coupon.type === 'percentage' ? `-${coupon.value} %` : `-${formaterPrix(coupon.value)}`

  const libellePortee = (coupon: (typeof coupons)[number]) => {
    if (coupon.scope === 'all') return 'Tous les produits'
    return coupon.targets.join(', ') || '—'
  }

  const listeCibles = formulaire.scope === 'products' ? cibles.products : cibles.categories

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">Réductions</p>
        <h1 className="mt-3 text-3xl text-marine sm:text-4xl">Coupons de réduction</h1>
        <p className="mt-3 text-sm text-encre-douce">
          Créez des codes valables sur tout le catalogue, sur des catégories ou sur des produits
          précis. Les clients peuvent en cumuler jusqu’à 5 sur un panier.
        </p>
      </header>

      {message ? (
        <p role="status" className="mb-6 border border-or/30 bg-or-pale/30 p-4 text-sm text-marine">
          {message}
        </p>
      ) : null}

      <section className="border border-encre/10 bg-papier p-6 sm:p-8">
        <h2 className="text-xl text-marine">
          {formulaire.id ? `Modifier ${formulaire.code}` : 'Créer un coupon'}
        </h2>
        <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={soumettre} noValidate>
          <div>
            <label htmlFor="coupon-code" className="text-sm font-semibold text-marine">
              Code
            </label>
            <input
              id="coupon-code"
              value={formulaire.code}
              onChange={(evenement) => modifier('code', evenement.target.value.toUpperCase())}
              placeholder="BIENVENUE10"
              maxLength={30}
              className={`${CLASSE_CHAMP} mt-2`}
            />
            {erreurs.code ? <p className="mt-1 text-xs text-alerte">{erreurs.code}</p> : null}
          </div>
          <div>
            <label htmlFor="coupon-type" className="text-sm font-semibold text-marine">
              Type de réduction
            </label>
            <select
              id="coupon-type"
              value={formulaire.type}
              onChange={(evenement) => modifier('type', evenement.target.value as CouponType)}
              className={`${CLASSE_CHAMP} mt-2`}
            >
              <option value="percentage">Pourcentage</option>
              <option value="amount">Montant fixe (Fc)</option>
            </select>
          </div>
          <div>
            <label htmlFor="coupon-valeur" className="text-sm font-semibold text-marine">
              Valeur {formulaire.type === 'percentage' ? '(%)' : '(Fc)'}
            </label>
            <input
              id="coupon-valeur"
              type="number"
              min={1}
              max={formulaire.type === 'percentage' ? 100 : undefined}
              value={formulaire.value}
              onChange={(evenement) =>
                modifier('value', evenement.target.value === '' ? '' : Number(evenement.target.value))
              }
              className={`${CLASSE_CHAMP} mt-2`}
            />
            {erreurs.value ? <p className="mt-1 text-xs text-alerte">{erreurs.value}</p> : null}
          </div>
          <div>
            <label htmlFor="coupon-portee" className="text-sm font-semibold text-marine">
              Appliqué à
            </label>
            <select
              id="coupon-portee"
              value={formulaire.scope}
              onChange={(evenement) => modifier('scope', evenement.target.value as CouponScope)}
              className={`${CLASSE_CHAMP} mt-2`}
            >
              <option value="all">Tous les produits</option>
              <option value="categories">Catégories sélectionnées</option>
              <option value="products">Produits sélectionnés</option>
            </select>
          </div>
          <div>
            <label htmlFor="coupon-limite" className="text-sm font-semibold text-marine">
              Nombre d’utilisations (facultatif)
            </label>
            <input
              id="coupon-limite"
              type="number"
              min={1}
              value={formulaire.maxUsages}
              onChange={(evenement) =>
                modifier(
                  'maxUsages',
                  evenement.target.value === '' ? '' : Number(evenement.target.value),
                )
              }
              className={`${CLASSE_CHAMP} mt-2`}
            />
            {erreurs.maxUsages ? (
              <p className="mt-1 text-xs text-alerte">{erreurs.maxUsages}</p>
            ) : null}
          </div>
          <label htmlFor="coupon-actif" className="flex min-h-11 items-center gap-3 self-end text-sm text-marine">
            <input
              id="coupon-actif"
              type="checkbox"
              checked={formulaire.isActive}
              onChange={(evenement) => modifier('isActive', evenement.target.checked)}
              className="h-5 w-5 accent-[#2f6b52]"
            />
            Coupon actif
          </label>
          {formulaire.scope !== 'all' ? (
            <div className="sm:col-span-2">
              <p className="text-sm font-semibold text-marine">
                {formulaire.scope === 'products' ? 'Produits' : 'Catégories'} concernés
              </p>
              <div className="mt-3 flex max-h-64 flex-wrap gap-2 overflow-y-auto border border-encre/10 p-3">
                {listeCibles.map((cible) => (
                  <label
                    key={cible.slug}
                    className={`flex min-h-10 cursor-pointer items-center gap-2 border px-3 text-sm ${
                      formulaire.targets.includes(cible.slug)
                        ? 'border-marine bg-marine text-creme'
                        : 'border-encre/15 text-encre-douce'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formulaire.targets.includes(cible.slug)}
                      onChange={() => basculerCible(cible.slug)}
                      className="h-4 w-4 accent-[#2f6b52]"
                    />
                    {'label' in cible ? cible.label : cible.name}
                  </label>
                ))}
              </div>
              {erreurs.targets ? <p className="mt-2 text-xs text-alerte">{erreurs.targets}</p> : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" disabled={envoi} className={CLASSE_BOUTON_OR}>
              {envoi ? 'Enregistrement…' : formulaire.id ? 'Mettre à jour' : 'Créer le coupon'}
            </button>
            <button
              type="button"
              onClick={() => setFormulaire(VIDE)}
              className={CLASSE_BOUTON_SECONDAIRE}
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-xl text-marine">Coupons enregistrés</h2>
        {coupons.length > 0 ? (
          <ul className="mt-5 grid gap-3">
            {coupons.map((coupon) => (
              <li
                key={coupon.id}
                className="flex flex-wrap items-center gap-4 border border-encre/10 bg-papier p-4"
              >
                <div className="min-w-[10rem] flex-1">
                  <p className="font-semibold tracking-wide text-marine">{coupon.code}</p>
                  <p className="mt-1 text-xs text-encre-douce">
                    {libelleValeur(coupon)} · {libellePortee(coupon)} · {coupon.usages} utilisation
                    {coupon.usages > 1 ? 's' : ''}
                    {coupon.maxUsages !== null ? ` / ${coupon.maxUsages}` : ''}
                  </p>
                </div>
                <span
                  className={`inline-flex min-h-7 items-center px-3 text-xs font-semibold ${
                    coupon.isActive
                      ? 'bg-[#2f6b52]/15 text-[#245341] ring-1 ring-[#2f6b52]/30'
                      : 'bg-encre-douce/10 text-encre-douce ring-1 ring-encre-douce/25'
                  }`}
                >
                  {coupon.isActive ? 'Actif' : 'Inactif'}
                </span>
                <button
                  type="button"
                  onClick={() => editer(coupon)}
                  className="min-h-11 border border-marine px-4 text-sm font-semibold text-marine hover:bg-marine hover:text-creme"
                >
                  Modifier
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 border border-dashed border-encre/15 bg-papier p-10 text-center text-sm text-encre-douce">
            Aucun coupon enregistré pour le moment.
          </p>
        )}
      </section>
    </div>
  )
}
