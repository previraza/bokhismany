import type { ReactNode } from 'react';
import { Lien } from '@/components/Lien';
interface Props {
    titre: string;
    description: string;
    action?: {
        libelle: string;
        to: '/' | '/produits' | '/panier' | '/contact';
    };
    children?: ReactNode;
}
export function EmptyState({ titre, description, action, children }: Props) {
    return (<div className="flex flex-col items-center border border-dashed border-encre/15 bg-creme/60 px-6 py-16 text-center"> <span className="mb-5 flex h-14 w-14 items-center justify-center bg-or/15 text-marine" aria-hidden="true"> <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7"> <path d="M4 7h16v12H4V7Zm0 0 2-3h12l2 3M9 11h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/> </svg> </span> <h2 className="text-xl text-marine sm:text-2xl">{titre}</h2> <p className="mt-3 max-w-md text-sm leading-relaxed text-encre-douce">{description}</p> {action ? (<Lien to={action.to} className="mt-7 inline-flex min-h-11 items-center bg-marine px-6 text-sm font-semibold text-creme transition-colors hover:bg-encre"> {action.libelle} </Lien>) : null} {children} </div>);
}
