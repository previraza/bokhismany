import { Link } from '@tanstack/react-router';
import type { ComponentProps } from 'react';
type Props = ComponentProps<typeof Link>; /** Lien interne avec transition de vue et repli automatique si l'API n'est pas disponible. */
// TODO : affiner les transitions de vue (rendu actuel jugé insuffisant).
export function Lien(props: Props) {
    return <Link viewTransition {...props}/>;
}
