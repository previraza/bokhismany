import { useState, type CSSProperties } from 'react';
import { libelleCategorie } from '@/lib/categories';
interface Props {
    slug: string;
    nom: string;
    categorie: string;
    imageUrl?: string | null;
    className?: string; /** active=false évite les noms de transition dupliqués lorsqu'un produit apparaît deux fois sur une page. */
    active?: boolean;
}
function Illustration({ categorie }: {
    categorie: string;
}) {
    const traits = { stroke: '#626870', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none', };
    if (categorie === 'huiles') {
        return (<svg viewBox="0 0 160 160" className="h-full w-full" aria-hidden="true"> <path d="M67 30h26v14l10 12v76a8 8 0 0 1-8 8H65a8 8 0 0 1-8-8V56l10-12V30Z" {...traits}/> <path d="M70 30V20h20v10M57 70h46M72 88h16" {...traits}/> <circle cx="80" cy="105" r="13" fill="#b3471f" opacity="0.25"/> <path d="M80 96c5 6 7 9 7 12a7 7 0 0 1-14 0c0-3 2-6 7-12Z" fill="#b3471f"/> </svg>);
    }
    if (categorie === 'autres') {
        return (<svg viewBox="0 0 160 160" className="h-full w-full" aria-hidden="true"> <path d="M48 62 80 46l32 16v58L80 136l-32-16V62Z" {...traits}/> <path d="m48 62 32 16 32-16M80 78v58M62 54l32 16M98 54 66 70" {...traits}/> <circle cx="80" cy="104" r="10" fill="#b3471f" opacity="0.25"/> </svg>);
    }
    return (<svg viewBox="0 0 160 160" className="h-full w-full" aria-hidden="true"> <path d="M56 54c0-8 11-14 24-14s24 6 24 14l8 78c1 8-12 14-32 14s-33-6-32-14l8-78Z" {...traits}/> <path d="M56 54c0 8 11 14 24 14s24-6 24-14M52 82c4 7 15 12 28 12s24-5 28-12" {...traits}/> <path d="M72 40V28h16v12" {...traits}/> {categorie === 'semoules' || categorie === 'farines' || categorie === 'sucre' ? (<> <circle cx="80" cy="108" r="14" fill="#f3d8bd" opacity="0.5"/> <path d="M74 108h12M80 102v12" stroke="#626870" strokeWidth="2" strokeLinecap="round"/> </>) : (<> <circle cx="80" cy="108" r="14" fill="#b3471f" opacity="0.25"/> <path d="M73 109c4-7 7-10 7-13s3 6 7 13" fill="#b3471f"/> </>)} </svg>);
}
export function ProductVisual({ slug, nom, categorie, imageUrl, className = '', active = true, }: Props) {
    const style: CSSProperties = active ? { viewTransitionName: `produit-${slug}` } : {};
    const [imageValide, setImageValide] = useState(Boolean(imageUrl));
    return (<div role="img" aria-label={imageUrl && imageValide ? `${nom}` : `Visuel de remplacement pour ${nom}`} style={style} className={`relative flex items-center justify-center overflow-hidden border border-encre/5 bg-[radial-gradient(circle_at_25%_20%,#ffffff,transparent_55%),linear-gradient(145deg,#faf9f6,#f4f2ed)] p-6 ${className}`}> <span className="absolute inset-x-0 bottom-0 h-16 bg-[repeating-linear-gradient(135deg,transparent,transparent_9px,rgba(28,21,16,0.035)_9px,rgba(28,21,16,0.035)_10px)]" aria-hidden="true"/> <span className="absolute top-3 left-4 z-10 text-[0.58rem] font-semibold tracking-[0.24em] text-encre-douce/80 uppercase"> {libelleCategorie(categorie)} </span> {imageUrl && imageValide ? (<img src={imageUrl} alt="" onError={() => setImageValide(false)} className="absolute inset-0 h-full w-full object-cover"/>) : (<div className="relative h-3/4 max-h-40 w-3/4 max-w-40 text-encre-douce"> <Illustration categorie={categorie}/> </div>)} </div>);
}
