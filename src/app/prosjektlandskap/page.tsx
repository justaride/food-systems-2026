import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { loadProjectLandscape } from '@/lib/data/project-landscape'
import { ProjectLandscapeContent } from './ProjectLandscapeContent'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('projectLandscape.metadata')
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function ProjectLandscapePage() {
  const t = await getTranslations('projectLandscape')
  const landscape = loadProjectLandscape()

  if (!landscape) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
        <InternalBanner label={t('internalLabel')} note={t('internalNote')} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {t.rich('fallback', {
            landscapePath: (chunks) => <code>{chunks}</code>,
            validateCommand: (chunks) => <code>{chunks}</code>,
          })}
        </div>
      </div>
    )
  }

  return <ProjectLandscapeContent landscape={landscape} />
}
