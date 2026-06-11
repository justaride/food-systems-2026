import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RelatedLinks } from '@/components/ui/RelatedLinks'
import { getKonsernDossier } from '@/lib/queries/ownership'
import { KonsernDossier } from './KonsernDossier'

export default async function KonsernDossierPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const dossier = await getKonsernDossier(slug)
  if (!dossier) return notFound()
  const relatedItems = [
    {
      label: dossier.root.name,
      href: `/selskap/${dossier.root.id}`,
      meta: 'Rotsselskap i konserntreet',
      badge: 'selskap',
    },
    ...dossier.board
      .filter(member => member.hasProfile)
      .map(member => ({
        label: member.personName,
        href: `/personer/${member.personKey}`,
        meta: `${member.konsernCompanies.length} selskapsroller i treet`,
        badge: 'person',
      })),
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Eierskap', href: '/eierskap' }, { label: dossier.root.name }]} />
      <RelatedLinks items={relatedItems} />
      <KonsernDossier dossier={dossier} />
    </div>
  )
}
