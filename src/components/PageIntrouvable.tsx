import { Lien } from '@/components/Lien';
import { CLASSE_BOUTON_OR } from '@/lib/classes';
export function PageIntrouvable() {
    return (<main className="conteneur-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"> <p className="text-xs font-semibold tracking-[0.3em] text-or uppercase">Erreur 404</p> <h1 className="mt-5 text-4xl text-marine sm:text-5xl">Cette page n’existe pas</h1> <p className="mt-4 max-w-md text-sm leading-relaxed text-encre-douce"> L’adresse demandée est incorrecte ou la page a été déplacée. Retrouvez-nous depuis l’accueil ou le catalogue. </p> <div className="mt-8 flex flex-wrap justify-center gap-3"> <Lien to="/" className={CLASSE_BOUTON_OR}> Retour à l’accueil </Lien> <Lien to="/produits" className="inline-flex min-h-12 items-center border border-encre/20 px-6 text-sm font-semibold text-marine transition-colors hover:border-marine"> Voir les produits </Lien> </div> </main>);
}
