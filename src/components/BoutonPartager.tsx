import { useState } from 'react'
import { CLASSE_BOUTON_SECONDAIRE } from '@/lib/classes'
import { messagePartage, partager, type DonneesPartage } from '@/lib/partage'

interface Props extends DonneesPartage {
  libelle?: string
  className?: string
}

export function BoutonPartager({
  titre,
  texte,
  url,
  fichier,
  libelle = 'Partager',
  className = CLASSE_BOUTON_SECONDAIRE,
}: Props) {
  const [envoi, setEnvoi] = useState(false)
  const [message, setMessage] = useState('')

  const surPartage = async () => {
    setEnvoi(true)
    setMessage('')
    try {
      const resultat = await partager({ titre, texte, url, fichier })
      setMessage(messagePartage(resultat))
    } catch {
      setMessage('Le partage n’a pas pu aboutir.')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div>
      <button type="button" onClick={surPartage} disabled={envoi} className={className}>
        {envoi ? 'Partage…' : libelle}
      </button>
      {message ? (
        <p role="status" className="mt-2 text-xs text-encre-douce">
          {message}
        </p>
      ) : null}
    </div>
  )
}
