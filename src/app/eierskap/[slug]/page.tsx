import { notFound } from 'next/navigation'
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
  return <KonsernDossier dossier={dossier} />
}
