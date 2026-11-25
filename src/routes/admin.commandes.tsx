import { createFileRoute, Outlet } from '@tanstack/react-router'
import { metaPage } from '@/lib/seo'

export const Route = createFileRoute('/admin/commandes')({
  head: () => metaPage({ titre: 'Bons de commande' }),
  component: () => <Outlet />,
})
