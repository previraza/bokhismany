import type { ReactNode } from 'react';
interface Props {
    surtitre?: string;
    titre: string;
    description?: string;
    clair?: boolean;
    action?: ReactNode;
}
export function SectionTitre({ surtitre, titre, description, clair = false, action, }: Props) {
    return (<div className="mb-12 flex flex-col gap-8 border-t border-encre/15 pt-8 md:mb-16 md:flex-row md:items-end md:justify-between"> <div className="max-w-3xl"> {surtitre ? (<p className={`etiquette mb-5 ${clair ? 'text-or-pale' : 'text-encre-douce'}`}> {surtitre} </p>) : null} <h2 className={`titre-section ${clair ? 'text-creme' : 'text-marine'}`}>{titre}</h2> {description ? (<p className={`mt-5 max-w-2xl text-base leading-relaxed ${clair ? 'text-creme/75' : 'text-encre-douce'}`}> {description} </p>) : null} </div> {action ? <div className="shrink-0">{action}</div> : null} </div>);
}
