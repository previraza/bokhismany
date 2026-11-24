import { Lien } from '@/components/Lien'

interface Props {
  className?: string
  compact?: boolean
  surFondSombre?: boolean
}

export function Logo({ className = '', compact = false, surFondSombre = false }: Props) {
  const visuel = surFondSombre
    ? '/images/marque/bokhismany-logo.png'
    : '/images/marque/banniere.png'

  return (
    <Lien
      to="/"
      aria-label="Bokhismany Trading SARL, retour à l’accueil"
      className={`group inline-flex items-center leading-none ${className}`}
    >
      <img
        src={visuel}
        alt=""
        className={
          surFondSombre
            ? compact
              ? 'h-11 w-auto object-contain'
              : 'h-12 w-auto object-contain sm:h-14'
            : compact
              ? 'h-7 w-auto max-w-full object-contain'
              : 'h-8 w-auto max-w-[52vw] object-contain sm:h-10 sm:max-w-[20rem]'
        }
      />
    </Lien>
  )
}
