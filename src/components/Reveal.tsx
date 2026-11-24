import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /** Décale l'apparition de quelques millisecondes pour créer un rythme léger. */
  delai?: number
}

export function Reveal({ children, className = '', delai = 0 }: Props) {
  const reference = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const element = reference.current
    if (!element) return

    setVisible(false)
    const observateur = new IntersectionObserver(
      (entre) => {
        if (entre.some((item) => item.isIntersecting)) {
          setVisible(true)
          observateur.disconnect()
        }
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.08 },
    )
    observateur.observe(element)

    return () => observateur.disconnect()
  }, [])

  return (
    <div
      ref={reference}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`}
      style={{ transitionDelay: `${delai}ms` }}
    >
      {children}
    </div>
  )
}
