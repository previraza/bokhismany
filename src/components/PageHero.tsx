import type { ReactNode } from 'react'

interface Props {
  surtitre: string
  titre: string
  description: string
  image?: string
  imageAlt?: string
  imageLegende?: string
  children?: ReactNode
}

export function PageHero({
  surtitre,
  titre,
  description,
  image,
  imageAlt = '',
  imageLegende,
  children,
}: Props) {
  return (
    <section className="border-b border-encre/10 bg-papier">
      <div className="conteneur-site border-x border-encre/5 pt-16 pb-14 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="etiquette text-or">{surtitre}</p>
          <p className="text-[0.6rem] font-semibold tracking-[0.3em] text-encre-douce uppercase">
            Kinshasa · Brazzaville
          </p>
        </div>
        <h1 className="titre-fluide mt-8 max-w-5xl text-marine">{titre}</h1>
        <div
          className={`mt-12 grid gap-8 border-t border-encre/10 pt-8 ${
            image ? 'lg:grid-cols-[1.05fr_0.95fr] lg:gap-14' : 'lg:grid-cols-[1.4fr_0.6fr] lg:gap-16'
          }`}
        >
          <div className="flex flex-col justify-between gap-8">
            <p className="max-w-2xl text-base leading-relaxed text-encre-douce sm:text-lg">
              {description}
            </p>
            {children ? <div>{children}</div> : null}
          </div>
          {image ? (
            <figure className="relative border border-encre/10 bg-creme p-2">
              <img
                src={image}
                alt={imageAlt}
                className="aspect-[16/9] w-full object-cover lg:aspect-[4/3]"
              />
              {imageLegende ? (
                <figcaption className="mt-2 px-1 pb-1 text-[0.65rem] font-semibold tracking-[0.2em] text-or uppercase">
                  {imageLegende}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  )
}
