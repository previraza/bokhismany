import type { ReactNode } from 'react'

interface Props {
  id: string
  libelle: string
  erreur?: string
  aide?: string
  children: (attributs: {
    id: string
    'aria-describedby'?: string
    'aria-invalid'?: boolean
  }) => ReactNode
}

export function Champ({ id, libelle, erreur, aide, children }: Props) {
  const description = erreur ? `${id}-erreur` : aide ? `${id}-aide` : undefined

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-marine">
        {libelle}
      </label>
      {children({
        id,
        ...(description ? { 'aria-describedby': description } : {}),
        ...(erreur ? { 'aria-invalid': true } : {}),
      })}
      {aide && !erreur ? (
        <p id={`${id}-aide`} className="text-xs text-encre-douce">
          {aide}
        </p>
      ) : null}
      {erreur ? (
        <p id={`${id}-erreur`} role="alert" className="text-xs font-medium text-alerte">
          {erreur}
        </p>
      ) : null}
    </div>
  )
}
