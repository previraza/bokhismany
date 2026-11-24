import type { ReservationStatus } from '@/lib/db/schema';
const STYLES: Record<ReservationStatus, {
    libelle: string;
    classe: string;
}> = { en_attente: { libelle: 'En attente', classe: 'bg-or/15 text-marine ring-1 ring-or/40', }, retiree: { libelle: 'Retirée', classe: 'bg-[#2f6b52]/15 text-[#245341] ring-1 ring-[#2f6b52]/30', }, expiree: { libelle: 'Expirée', classe: 'bg-encre-douce/10 text-encre-douce ring-1 ring-encre-douce/25', }, annulee: { libelle: 'Annulée', classe: 'bg-[#8c3b2e]/10 text-[#743026] ring-1 ring-[#8c3b2e]/25', },
};
export function StatusBadge({ statut }: {
    statut: ReservationStatus;
}) {
    const info = STYLES[statut] ?? STYLES.en_attente;
    return (<span className={`inline-flex min-h-7 items-center px-3 text-xs font-semibold ${info.classe}`}> {info.libelle} </span>);
}
