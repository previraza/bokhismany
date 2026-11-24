import { createFileRoute } from '@tanstack/react-router';
import { PageIntrouvable } from '@/components/PageIntrouvable';
import { metaPage } from '@/lib/seo';
export const Route = createFileRoute('/not-found')({ head: () => metaPage({ titre: 'Page introuvable' }), component: PageIntrouvable,
});
