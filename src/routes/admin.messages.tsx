import { useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Lien } from '@/components/Lien';
import { CLASSE_BOUTON_SECONDAIRE } from '@/lib/classes';
import { formaterDate } from '@/lib/format';
import { metaPage } from '@/lib/seo';
import { marquerMessageLuFn, obtenirMessagesAdminFn } from '@/lib/server/admin.functions';
export const Route = createFileRoute('/admin/messages')({ head: () => metaPage({ titre: 'Messages' }), loader: () => obtenirMessagesAdminFn(), component: MessagesAdmin,
});
function MessagesAdmin() {
    const messages = Route.useLoaderData();
    const routeur = useRouter();
    const [message, setMessage] = useState('');
    const marquerLu = async (id: number) => { setMessage(''); try {
        await marquerMessageLuFn({ data: id });
        await routeur.invalidate();
        setMessage('Message marqué comme lu.');
    }
    catch (error) {
        setMessage(error instanceof Error ? error.message : 'Modification impossible.');
    } };
    const nonLus = messages.filter((element) => !element.isRead).length;
    return (<div> <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"> <div> <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">Boîte de réception</p> <h1 className="mt-3 text-3xl text-marine sm:text-4xl">Messages</h1> <p className="mt-3 text-sm text-encre-douce"> {messages.length} message{messages.length > 1 ? 's' : ''} reçu{messages.length > 1 ? 's' : ''}, dont{' '} {nonLus} non lu{nonLus > 1 ? 's' : ''}. </p> </div> <Lien to="/admin" className={CLASSE_BOUTON_SECONDAIRE}> Retour au tableau de bord </Lien> </header> {message ? (<p role="status" className="mb-6 border border-or/30 bg-or-pale/30 p-4 text-sm text-marine"> {message} </p>) : null} {messages.length > 0 ? (<ul className="space-y-4"> {messages.map((element) => (<li key={element.id} className={` border bg-papier p-6 ${element.isRead ? 'border-encre/10' : 'border-or/40'}`}> <div className="flex flex-wrap items-start justify-between gap-4"> <div> <h2 className="text-lg font-semibold text-marine">{element.name}</h2> <p className="mt-1 text-sm text-encre-douce">{element.contact}</p> </div> <div className="text-right"> <p className="text-xs text-encre-douce"> {formaterDate(element.createdAt ?? new Date())} </p> {element.isRead ? (<p className="mt-1 text-xs text-[#245341]">Lu</p>) : (<p className="mt-1 text-xs font-semibold text-or">Non lu</p>)} </div> </div> <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-encre-douce"> {element.message} </p> <div className="mt-5 flex flex-wrap gap-3 border-t border-encre/10 pt-4"> <a href={element.contact.includes('@') ? `mailto:${element.contact}` : `tel:${element.contact.replace(/\s+/g, '')}`} className="min-h-11 inline-flex items-center border border-encre/20 px-5 text-sm font-semibold text-marine transition-colors hover:border-marine"> Répondre </a> {!element.isRead ? (<button type="button" onClick={() => marquerLu(element.id)} className="min-h-11 inline-flex items-center border border-encre/20 px-5 text-sm font-semibold text-marine transition-colors hover:border-marine"> Marquer comme lu </button>) : null} </div> </li>))} </ul>) : (<p className=" border border-dashed border-encre/15 bg-papier p-10 text-center text-sm text-encre-douce"> Aucun message reçu pour le moment. </p>)} </div>);
}
