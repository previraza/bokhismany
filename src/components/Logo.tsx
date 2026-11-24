import { Lien } from '@/components/Lien'

interface Props {
  className?: string
  compact?: boolean
  surFondSombre?: boolean
  avecDaayake?: boolean
}

export function Logo({
  className = '',
  compact = false,
  surFondSombre = false,
  avecDaayake = false,
}: Props) {
  return (
    <Lien
      to="/"
      aria-label="Bokhismany Trading SARL, retour à l’accueil"
      className={`group inline-flex items-center leading-none ${className}`}
    >
      <img
        src="/images/marque/bokhismany-logo-officiel.png"
        alt=""
        className={`shrink-0 object-contain ${
          compact ? 'h-8 w-8' : 'h-10 w-10 sm:h-11 sm:w-11'
        }`}
      />
      <span className="ml-3 hidden sm:block">
        <span
          className={`block font-display text-lg leading-none ${
            surFondSombre ? 'text-creme' : 'text-marine'
          }`}
        >
          Bokhismany
        </span>
        <span
          className={`mt-1 block text-[0.58rem] font-semibold tracking-[0.2em] uppercase ${
            surFondSombre ? 'text-creme/65' : 'text-encre-douce'
          }`}
        >
          Trading SARL
        </span>
      </span>
      {avecDaayake ? (
        <>
          <span
            className={`mx-3 hidden h-8 w-px md:block ${
              surFondSombre ? 'bg-creme/20' : 'bg-encre/15'
            }`}
            aria-hidden="true"
          />
          <img
            src="/images/marque/daayake-food.png"
            alt=""
            className="hidden h-9 w-9 object-contain md:block"
          />
        </>
      ) : null}
    </Lien>
  )
}
