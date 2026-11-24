import { useMemo, useState } from 'react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Lien } from '@/components/Lien';
import { StatusBadge } from '@/components/StatusBadge';
import { CLASSE_BOUTON_SECONDAIRE, CLASSE_CHAMP } from '@/lib/classes';
import { formaterDate, formaterPrix } from '@/lib/format';
import { metaPage } from '@/lib/seo';
import { changerStatutReservationFn, exporterReservationsFn, obtenirReservationsAdminFn, } from '@/lib/server/admin.functions';
import { createOrderFromReservationFn } from '@/lib/server/orders.functions';
import type { ReservationStatus } from '@/lib/db/schema';
export const Route = createFileRoute('/admin/reservations')({ head: () => metaPage({ titre: 'Réservations' }), loader: () => obtenirReservationsAdminFn(), component: ReservationsAdmin,
});
const STATUTS: ReservationStatus[] = ['en_attente', 'retiree', 'expiree', 'annulee'];
const LIBELLES_STATUT: Record<ReservationStatus, string> = { en_attente: 'En attente', retiree: 'Retirée', expiree: 'Expirée', annulee: 'Annulée',
};
function ReservationsAdmin() {
    const reservations = Route.useLoaderData();
    const routeur = useRouter();
    const [recherche, setRecherche] = useState('');
    const [statut, setStatut] = useState<'tous' | ReservationStatus>('tous');
    const [date, setDate] = useState('');
    const [message, setMessage] = useState('');
    const [exportEnCours, setExportEnCours] = useState(false);
    const visibles = useMemo(() => { const terme = recherche.trim().toLocaleLowerCase('fr-FR'); return reservations.filter((reservation) => { const dansStatut = statut === 'tous' || reservation.status === statut; const dateLocale = reservation.createdAt ? new Date(reservation.createdAt.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10) : ''; const dansDate = !date || dateLocale === date; const dansRecherche = !terme || reservation.code.toLocaleLowerCase('fr-FR').includes(terme) || reservation.customerName.toLocaleLowerCase('fr-FR').includes(terme) || reservation.customerPhone.includes(terme); return dansStatut && dansDate && dansRecherche; }); }, [reservations, recherche, statut, date]);
    const changerStatut = async (code: string, nouveauStatut: ReservationStatus) => { setMessage(''); try {
        await changerStatutReservationFn({ data: { code, statut: nouveauStatut } });
        await routeur.invalidate();
        setMessage(`Statut de la réservation ${code} mis à jour.`);
    }
    catch (error) {
        setMessage(error instanceof Error ? error.message : 'Impossible de modifier ce statut.');
    } };
    const creerBon = async (code: string) => { setMessage(''); try {
        const bon = await createOrderFromReservationFn({ data: { code } });
        await routeur.invalidate();
        setMessage(bon.dejaCree ? `Bon ${bon.reference} déjà créé pour cette réservation.` : `Bon de commande ${bon.reference} créé.`);
    }
    catch (error) {
        setMessage(error instanceof Error ? error.message : 'Impossible de créer le bon de commande.');
    } };
    const telechargerCsv = async () => { setExportEnCours(true); setMessage(''); try {
        const csv = await exporterReservationsFn();
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = `reservations-${new Date().toISOString().slice(0, 10)}.csv`;
        lien.click();
        URL.revokeObjectURL(url);
    }
    catch (error) {
        setMessage(error instanceof Error ? error.message : 'Export impossible.');
    }
    finally {
        setExportEnCours(false);
    } };
    return (<div> <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"> <div> <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">Suivi</p> <h1 className="mt-3 text-3xl text-marine sm:text-4xl">Réservations</h1> <p className="mt-3 text-sm text-encre-douce"> {reservations.length} réservation{reservations.length > 1 ? 's' : ''} enregistrée {reservations.length > 1 ? 's' : ''}. </p> </div> <div className="flex flex-wrap gap-3"> <button type="button" onClick={telechargerCsv} disabled={exportEnCours} className={CLASSE_BOUTON_SECONDAIRE}> {exportEnCours ? 'Export…' : 'Exporter en CSV'} </button> <Lien to="/admin" className={CLASSE_BOUTON_SECONDAIRE}> Retour au tableau de bord </Lien> </div> </header> {message ? (<p role="status" className="mb-6 border border-or/30 bg-or-pale/30 p-4 text-sm text-marine"> {message} </p>) : null} <div className=" border border-encre/10 bg-papier p-5 sm:p-6"> <div className="grid gap-4 sm:grid-cols-3"> <div> <label htmlFor="filtre-recherche" className="text-sm font-semibold text-marine"> Rechercher </label> <input id="filtre-recherche" type="search" value={recherche} onChange={(evenement) => setRecherche(evenement.target.value)} placeholder="Code, nom ou téléphone" className={`${CLASSE_CHAMP} mt-2`}/> </div> <div> <label htmlFor="filtre-statut" className="text-sm font-semibold text-marine"> Statut </label> <select id="filtre-statut" value={statut} onChange={(evenement) => setStatut(evenement.target.value as 'tous' | ReservationStatus)} className={`${CLASSE_CHAMP} mt-2`}> <option value="tous">Tous les statuts</option> {STATUTS.map((element) => (<option key={element} value={element}> {LIBELLES_STATUT[element]} </option>))} </select> </div> <div> <label htmlFor="filtre-date" className="text-sm font-semibold text-marine"> Date de création </label> <input id="filtre-date" type="date" value={date} onChange={(evenement) => setDate(evenement.target.value)} className={`${CLASSE_CHAMP} mt-2`}/> </div> </div> </div> <p className="mt-6 text-sm text-encre-douce" aria-live="polite"> {visibles.length} résultat{visibles.length > 1 ? 's' : ''} </p> {visibles.length > 0 ? (<div className="mt-4 overflow-x-auto border border-encre/10 bg-papier "> <table className="w-full min-w-[52rem] border-collapse text-left text-sm"><thead className="bg-creme/70"><tr className="text-xs tracking-wider text-encre-douce uppercase"><th scope="col" className="px-5 py-4 font-semibold">Code</th><th scope="col" className="px-5 py-4 font-semibold">Client</th><th scope="col" className="px-5 py-4 font-semibold">Créée le</th><th scope="col" className="px-5 py-4 font-semibold">Expire le</th><th scope="col" className="px-5 py-4 font-semibold">Montant</th><th scope="col" className="px-5 py-4 font-semibold">Statut</th><th scope="col" className="px-5 py-4 font-semibold">Action</th></tr></thead><tbody className="divide-y divide-encre/10">{visibles.map((reservation) => (<tr key={reservation.id}><td className="px-5 py-4 font-semibold tabular-nums text-marine"> <Link to="/reservation/$code" params={{ code: reservation.code }} className="underline decoration-or underline-offset-4"> {reservation.code} </Link> </td><td className="px-5 py-4"> <p className="font-semibold text-marine">{reservation.customerName}</p> <p className="mt-1 text-xs text-encre-douce">{reservation.customerPhone}</p> </td><td className="px-5 py-4 text-encre-douce"> {formaterDate(reservation.createdAt ?? reservation.expiresAt)} </td><td className="px-5 py-4 text-encre-douce"> {formaterDate(reservation.expiresAt)} </td><td className="px-5 py-4 font-semibold tabular-nums text-marine"> {formaterPrix(reservation.totalFc)} </td><td className="px-5 py-4"><StatusBadge statut={reservation.status}/></td><td className="px-5 py-4"> <div className="flex flex-col gap-2"> <select aria-label={`Modifier le statut de ${reservation.code}`} value={reservation.status} onChange={(evenement) => changerStatut(reservation.code, evenement.target.value as ReservationStatus)} className="min-h-10 border border-encre/15 bg-papier px-3 text-sm text-marine focus:border-or focus:outline-none"> {STATUTS.map((element) => (<option key={element} value={element}> {LIBELLES_STATUT[element]} </option>))} </select> <button type="button" onClick={() => creerBon(reservation.code)} className="min-h-10 border border-marine px-3 text-xs font-semibold text-marine hover:bg-marine hover:text-creme"> Créer un bon de commande </button> </div> </td></tr>))}</tbody></table> </div>) : (<p className="mt-4 border border-dashed border-encre/15 bg-papier p-10 text-center text-sm text-encre-douce"> Aucune réservation ne correspond à ces filtres. </p>)} <p className="mt-6 text-xs leading-relaxed text-encre-douce"> Le statut « Expirée » est calculé automatiquement à la lecture, 24 heures après la création. Le montant affiché est une estimation à confirmer en boutique. </p> </div>);
}
