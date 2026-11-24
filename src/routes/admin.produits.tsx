import { useState, type FormEvent } from 'react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Lien } from '@/components/Lien';
import { ProductVisual } from '@/components/ProductVisual';
import { CATEGORIES, LIBELLES_CATEGORIES } from '@/lib/categories';
import { CLASSE_BOUTON_OR, CLASSE_BOUTON_SECONDAIRE, CLASSE_CHAMP } from '@/lib/classes';
import { formaterPrix } from '@/lib/format';
import { metaPage } from '@/lib/seo';
import { basculerProduitFn, enregistrerProduitFn, obtenirProduitsAdminFn, } from '@/lib/server/admin.functions';
import { schemaProduit, type DonneesProduit } from '@/lib/validation';
import type { Product } from '@/lib/db/schema';
export const Route = createFileRoute('/admin/produits')({ head: () => metaPage({ titre: 'Produits' }), loader: () => obtenirProduitsAdminFn(), component: ProduitsAdmin,
});
const FORMULAIRE_VIDE: DonneesProduit & {
    id?: number;
} = { slug: '', nom: '', categorie: 'riz', format: '', prixFc: 0, description: '', imageUrl: '', stockStatus: 'disponible', isActive: true,
};
function ProduitsAdmin() {
    const produits = Route.useLoaderData();
    const routeur = useRouter();
    const [formulaire, setFormulaire] = useState<DonneesProduit & {
        id?: number;
    }>(FORMULAIRE_VIDE);
    const [erreurs, setErreurs] = useState<Record<string, string>>({});
    const [message, setMessage] = useState('');
    const [envoi, setEnvoi] = useState(false);
    const [recherche, setRecherche] = useState('');
    const modifier = <C extends keyof typeof formulaire>(champ: C, valeur: (typeof formulaire)[C]) => { setFormulaire((etat) => ({ ...etat, [champ]: valeur })); setErreurs((etat) => ({ ...etat, [champ]: '' })); };
    const editer = (produit: Product) => { setFormulaire({ id: produit.id, slug: produit.slug, nom: produit.name, categorie: produit.category, format: produit.format ?? '', prixFc: produit.priceFc, description: produit.description ?? '', imageUrl: produit.imageUrl ?? '', stockStatus: produit.stockStatus, isActive: produit.isActive, }); setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const reinitialiser = () => { setFormulaire(FORMULAIRE_VIDE); setErreurs({}); };
    const soumettre = async (evenement: FormEvent<HTMLFormElement>) => { evenement.preventDefault(); setMessage(''); const analyse = schemaProduit.safeParse({ ...formulaire, format: formulaire.format || undefined, description: formulaire.description || undefined, imageUrl: formulaire.imageUrl || undefined, }); if (!analyse.success) {
        const nouvelles: Record<string, string> = {};
        for (const probleme of analyse.error.issues) {
            const champ = String(probleme.path[0]);
            if (!nouvelles[champ])
                nouvelles[champ] = probleme.message;
        }
        setErreurs(nouvelles);
        return;
    } setErreurs({}); setEnvoi(true); try {
        await enregistrerProduitFn({ data: { ...analyse.data, id: formulaire.id } });
        await routeur.invalidate();
        setMessage(formulaire.id ? 'Produit mis à jour.' : 'Produit ajouté au catalogue.');
        reinitialiser();
    }
    catch (error) {
        setMessage(error instanceof Error ? error.message : 'Enregistrement impossible.');
    }
    finally {
        setEnvoi(false);
    } };
    const basculer = async (produit: Product) => { setMessage(''); try {
        await basculerProduitFn({ data: { id: produit.id, actif: !produit.isActive } });
        await routeur.invalidate();
        setMessage(produit.isActive ? `${produit.name} est masqué du catalogue public.` : `${produit.name} est de nouveau visible.`);
    }
    catch (error) {
        setMessage(error instanceof Error ? error.message : 'Modification impossible.');
    } };
    const visibles = produits.filter((produit) => produit.name.toLocaleLowerCase('fr-FR').includes(recherche.trim().toLocaleLowerCase('fr-FR')));
    return (<div> <header className="mb-8"> <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">Catalogue</p> <h1 className="mt-3 text-3xl text-marine sm:text-4xl">Produits</h1> <p className="mt-3 text-sm text-encre-douce"> Ajoutez un produit, modifiez un prix ou masquez une référence temporairement indisponible. </p> </header> {message ? (<p role="status" className="mb-6 border border-or/30 bg-or-pale/30 p-4 text-sm text-marine"> {message} </p>) : null} <section className=" border border-encre/10 bg-papier p-6 sm:p-8"> <h2 className="text-xl text-marine"> {formulaire.id ? `Modifier ${formulaire.nom}` : 'Ajouter un produit'} </h2> <p className="mt-2 text-sm text-encre-douce"> Les prix sont exprimés en francs CFA et restent indicatifs. </p> <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={soumettre} noValidate> <div className="sm:col-span-2"> <label htmlFor="produit-nom" className="text-sm font-semibold text-marine"> Nom du produit </label> <input id="produit-nom" value={formulaire.nom} onChange={(evenement) => modifier('nom', evenement.target.value)} aria-invalid={Boolean(erreurs.nom)} className={`${CLASSE_CHAMP} mt-2`}/> {erreurs.nom ? <p className="mt-1 text-xs text-[#8c3b2e]">{erreurs.nom}</p> : null} </div> <div> <label htmlFor="produit-slug" className="text-sm font-semibold text-marine"> Identifiant (slug) </label> <input id="produit-slug" value={formulaire.slug} onChange={(evenement) => modifier('slug', evenement.target.value)} aria-invalid={Boolean(erreurs.slug)} className={`${CLASSE_CHAMP} mt-2`} placeholder="riz-lion-50kg"/> {erreurs.slug ? <p className="mt-1 text-xs text-[#8c3b2e]">{erreurs.slug}</p> : null} </div> <div> <label htmlFor="produit-categorie" className="text-sm font-semibold text-marine"> Catégorie </label> <select id="produit-categorie" value={formulaire.categorie} onChange={(evenement) => modifier('categorie', evenement.target.value as DonneesProduit['categorie'])} className={`${CLASSE_CHAMP} mt-2`}> {CATEGORIES.map((categorie) => (<option key={categorie} value={categorie}> {LIBELLES_CATEGORIES[categorie]} </option>))} </select> </div> <div> <label htmlFor="produit-format" className="text-sm font-semibold text-marine"> Format </label> <input id="produit-format" value={formulaire.format ?? ''} onChange={(evenement) => modifier('format', evenement.target.value)} placeholder="Sac de 50 kg" className={`${CLASSE_CHAMP} mt-2`}/> </div> <div> <label htmlFor="produit-prix" className="text-sm font-semibold text-marine"> Prix indicatif (Fc) </label> <input id="produit-prix" type="number" min={1} step={1} value={formulaire.prixFc || ''} onChange={(evenement) => modifier('prixFc', Number(evenement.target.value))} aria-invalid={Boolean(erreurs.prixFc)} className={`${CLASSE_CHAMP} mt-2`}/> {erreurs.prixFc ? <p className="mt-1 text-xs text-[#8c3b2e]">{erreurs.prixFc}</p> : null} </div> <div className="sm:col-span-2"> <label htmlFor="produit-description" className="text-sm font-semibold text-marine"> Description </label> <textarea id="produit-description" rows={3} value={formulaire.description ?? ''} onChange={(evenement) => modifier('description', evenement.target.value)} className={`${CLASSE_CHAMP} mt-2 resize-y py-3`}/> </div> <div className="sm:col-span-2"> <label htmlFor="produit-image" className="text-sm font-semibold text-marine"> URL de l’image (facultatif) </label> <input id="produit-image" type="url" value={formulaire.imageUrl ?? ''} onChange={(evenement) => modifier('imageUrl', evenement.target.value)} placeholder="https://exemple.com/image.jpg" aria-invalid={Boolean(erreurs.imageUrl)} className={`${CLASSE_CHAMP} mt-2`}/> {erreurs.imageUrl ? (<p className="mt-1 text-xs text-[#8c3b2e]">{erreurs.imageUrl}</p>) : null} <p className="mt-1 text-xs text-encre-douce"> Sans image, un visuel de remplacement est affiché automatiquement. </p> </div> <div> <label htmlFor="produit-stock" className="text-sm font-semibold text-marine"> Disponibilité </label> <select id="produit-stock" value={formulaire.stockStatus} onChange={(evenement) => modifier('stockStatus', evenement.target.value as DonneesProduit['stockStatus'])} className={`${CLASSE_CHAMP} mt-2`}> <option value="disponible">Disponible</option> <option value="rupture">Rupture de stock</option> </select> </div> <label className="flex min-h-12 items-end gap-3 pb-2 text-sm font-semibold text-marine"> <input type="checkbox" checked={formulaire.isActive} onChange={(evenement) => modifier('isActive', evenement.target.checked)} className="h-5 w-5 accent-or"/> Visible dans le catalogue public </label> <div className="flex flex-wrap gap-3 sm:col-span-2"> <button type="submit" disabled={envoi} className={CLASSE_BOUTON_OR}> {envoi ? 'Enregistrement…' : formulaire.id ? 'Enregistrer les modifications' : 'Ajouter le produit'} </button> <button type="button" onClick={reinitialiser} className={CLASSE_BOUTON_SECONDAIRE}> Réinitialiser le formulaire </button> </div> </form> </section> <section className="mt-9 border border-encre/10 bg-papier p-6 sm:p-8"> <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <h2 className="text-xl text-marine">Catalogue ({produits.length})</h2> <input type="search" aria-label="Rechercher un produit" placeholder="Rechercher un produit" value={recherche} onChange={(evenement) => setRecherche(evenement.target.value)} className={`${CLASSE_CHAMP} sm:w-72`}/> </div> {visibles.length > 0 ? (<ul className="mt-6 divide-y divide-encre/10"> {visibles.map((produit) => (<li key={produit.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center"> <ProductVisual slug={produit.slug} nom={produit.name} categorie={produit.category} active={false} className="h-16 w-16 shrink-0"/> <div className="min-w-0 flex-1"> <p className="font-semibold text-marine">{produit.name}</p> <p className="mt-1 text-xs text-encre-douce"> {LIBELLES_CATEGORIES[produit.category]} · {formaterPrix(produit.priceFc)} ·{' '} {produit.stockStatus === 'rupture' ? 'Rupture' : 'Disponible'} </p> <p className="mt-1 break-all text-xs text-encre-douce/70">/{produit.slug}</p> </div> <div className="flex flex-wrap gap-2"> <button type="button" onClick={() => editer(produit)} className="min-h-11 border border-encre/20 px-4 text-sm font-semibold text-marine transition-colors hover:border-marine"> Modifier </button> <button type="button" onClick={() => basculer(produit)} className="min-h-11 border border-encre/20 px-4 text-sm font-semibold text-marine transition-colors hover:border-marine"> {produit.isActive ? 'Masquer' : 'Afficher'} </button> <Link to="/produits/$slug" params={{ slug: produit.slug }} className="inline-flex min-h-11 items-center border border-encre/20 px-4 text-sm font-semibold text-marine transition-colors hover:border-marine"> Voir </Link> </div> </li>))} </ul>) : (<p className="mt-6 border border-dashed border-encre/15 p-8 text-center text-sm text-encre-douce"> Aucun produit ne correspond à cette recherche. </p>)} </section> </div>);
}
