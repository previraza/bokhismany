import { useState } from 'react';
import { createFileRoute, Outlet, redirect, useNavigate, useRouterState } from '@tanstack/react-router';
import { Lien } from '@/components/Lien';
import { Logo } from '@/components/Logo';
import { CLASSE_BOUTON_SECONDAIRE } from '@/lib/classes';
import { metaPage } from '@/lib/seo';
import { deconnecterAdminFn, verifierSessionFn } from '@/lib/server/auth.functions';
export const Route = createFileRoute('/admin')({ beforeLoad: async ({ location }) => { const { authentifie } = await verifierSessionFn(); const surConnexion = location.pathname === '/admin/connexion'; if (surConnexion && authentifie) {
        throw redirect({ to: '/admin' });
    } if (!surConnexion && !authentifie) {
        throw redirect({ to: '/admin/connexion' });
    } return { authentifie }; }, head: () => metaPage({ titre: 'Administration' }), component: Administration,
});
const LIENS_ADMIN = [{ libelle: 'Tableau de bord', to: '/admin' as const }, { libelle: 'Réservations', to: '/admin/reservations' as const }, { libelle: 'Produits', to: '/admin/produits' as const }, { libelle: 'Messages', to: '/admin/messages' as const }, { libelle: 'Équipe dirigeante', to: '/admin/equipe' as const }, { libelle: 'Promotion', to: '/admin/promotion' as const },
];
function Administration() {
    const chemin = useRouterState({ select: (etat) => etat.location.pathname });
    const naviguer = useNavigate();
    const [deconnexion, setDeconnexion] = useState(false);
    const surConnexion = chemin === '/admin/connexion';
    if (surConnexion) {
        return (<main className="min-h-[calc(100vh-20rem)] bg-creme"> <div className="conteneur-site"><Outlet /></div> </main>);
    }
    const surLien = (to: string) => (to === '/admin' ? chemin === '/admin' : chemin === to);
    const seDeconnecter = async () => { setDeconnexion(true); try {
        await deconnecterAdminFn();
        await naviguer({ to: '/admin/connexion', replace: true });
        window.location.reload();
    }
    finally {
        setDeconnexion(false);
    } };
    return (<main className="min-h-[calc(100vh-20rem)] border-t border-encre/8 bg-creme"> <div className="conteneur-site py-10 lg:py-14"> <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-10"> <aside className="lg:sticky lg:top-28 lg:self-start"> <div className=" border border-encre/10 bg-papier p-5 "> <Logo compact className="mb-5"/> <p className="mb-5 text-xs font-semibold tracking-[0.25em] text-or uppercase"> Administration </p> <nav aria-label="Navigation administration" className="space-y-1"> {LIENS_ADMIN.map((lien) => (<Lien key={lien.to} to={lien.to} aria-current={surLien(lien.to) ? 'page' : undefined} className={`flex min-h-11 items-center px-4 text-sm font-semibold transition-colors ${surLien(lien.to) ? 'bg-marine text-creme' : 'text-encre-douce hover:bg-creme hover:text-marine'}`}> {lien.libelle} </Lien>))} </nav> <button type="button" onClick={seDeconnecter} disabled={deconnexion} className={`${CLASSE_BOUTON_SECONDAIRE} mt-5 w-full text-sm`}> {deconnexion ? 'Déconnexion…' : 'Se déconnecter'} </button> <Lien to="/" className="mt-4 block text-center text-xs text-encre-douce underline underline-offset-4 hover:text-marine"> Retour au site public </Lien> </div> </aside> <div className="min-w-0"><Outlet /></div> </div> </div> </main>);
}
