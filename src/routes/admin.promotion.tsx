import { useEffect, useState, type FormEvent } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Lien } from '@/components/Lien';
import { CLASSE_BOUTON_OR, CLASSE_BOUTON_SECONDAIRE, CLASSE_CHAMP } from '@/lib/classes';
import { metaPage } from '@/lib/seo';
import { enregistrerPromotionAdminFn, obtenirPromotionFn, } from '@/lib/server/admin.functions';
import { schemaPromotion } from '@/lib/validation';
export const Route = createFileRoute('/admin/promotion')({ head: () => metaPage({ titre: 'Promotion' }), loader: () => obtenirPromotionFn(), component: PromotionAdmin,
});
function PromotionAdmin() {
    const promotion = Route.useLoaderData();
    const routeur = useRouter();
    const [active, setActive] = useState(promotion.active);
    const [message, setMessage] = useState(promotion.message);
    const [erreur, setErreur] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [envoi, setEnvoi] = useState(false);
    useEffect(() => {
        setActive(promotion.active);
        setMessage(promotion.message);
    }, [promotion.active, promotion.message]);
    const soumettre = async (evenement: FormEvent<HTMLFormElement>) => { evenement.preventDefault(); setErreur(''); setConfirmation(''); const analyse = schemaPromotion.safeParse({ active, message }); if (!analyse.success) {
        setErreur(analyse.error.issues[0]?.message ?? 'Vérifiez les champs du formulaire.');
        return;
    } setEnvoi(true); try {
        await enregistrerPromotionAdminFn({ data: analyse.data });
        await routeur.invalidate();
        setConfirmation('Promotion mise à jour. Elle est visible immédiatement sur l’accueil.');
    }
    catch (error) {
        setErreur(error instanceof Error ? error.message : 'Enregistrement impossible.');
    }
    finally {
        setEnvoi(false);
    } };
    return (<div> <header className="mb-8"> <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">Accueil</p> <h1 className="mt-3 text-3xl text-marine sm:text-4xl">Promotion en cours</h1> <p className="mt-3 text-sm text-encre-douce"> Le message est affiché sur l’accueil lorsqu’une promotion est active. Aucune date de fin n’est définie : désactivez la promotion quand elle se termine. </p> </header> <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"> <section className=" border border-encre/10 bg-papier p-6 sm:p-8"> <form onSubmit={soumettre} noValidate> <label className="flex items-start gap-4 border border-encre/10 bg-creme p-4"> <input type="checkbox" checked={active} onChange={(evenement) => setActive(evenement.target.checked)} className="mt-1 h-5 w-5 accent-or"/> <span> <span className="block text-sm font-semibold text-marine"> Afficher la promotion sur l’accueil </span> <span className="mt-1 block text-xs text-encre-douce"> Lorsque cette case est décochée, aucun bandeau promotionnel n’est affiché. </span> </span> </label> <div className="mt-6"> <label htmlFor="promotion-message" className="text-sm font-semibold text-marine"> Message promotionnel </label> <textarea id="promotion-message" rows={4} value={message} onChange={(evenement) => setMessage(evenement.target.value)} aria-invalid={Boolean(erreur)} className={`${CLASSE_CHAMP} mt-2 resize-y py-3`}/> <p className="mt-1 text-xs text-encre-douce"> Le message ne doit annoncer que des informations validées par Bokhismany. </p> </div> {erreur ? (<p role="alert" className="mt-5 text-sm font-medium text-[#8c3b2e]"> {erreur} </p>) : null} {confirmation ? (<p role="status" className="mt-5 text-sm font-medium text-[#245341]"> {confirmation} </p>) : null} <div className="mt-7 flex flex-wrap gap-3"> <button type="submit" disabled={envoi} className={CLASSE_BOUTON_OR}> {envoi ? 'Enregistrement…' : 'Enregistrer la promotion'} </button> <Lien to="/" className={CLASSE_BOUTON_SECONDAIRE}> Voir l’accueil public </Lien> </div> </form> </section> <aside className="h-fit border border-or/25 bg-or-pale/30 p-6"> <p className="text-xs font-semibold tracking-[0.25em] text-encre-douce uppercase"> Aperçu </p> <div className={`mt-5 border border-marine/10 bg-papier/70 p-5 ${active ? '' : 'opacity-60'}`}> <p className="flex items-start gap-3 text-sm font-semibold text-marine"> <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-marine text-or-pale"> % </span> {message} </p> <p className="mt-4 text-xs text-encre-douce"> {active ? 'Bandeau visible en accueil.' : 'Bandeau masqué.'} </p> </div> <p className="mt-5 text-xs leading-relaxed text-encre-douce"> Cette promotion est une information commerciale visible publiquement : le texte doit être validé avant publication. </p> </aside> </div> </div>);
}
