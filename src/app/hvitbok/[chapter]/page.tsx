import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  chapters,
  getChapterBySlug,
  getAdjacentChapters,
} from '@/lib/hvitbok/chapters'
import { readChapterMarkdown, countChapterWords } from '@/lib/hvitbok/loader'
import { renderChapter } from '@/lib/hvitbok/render-chapter'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export function generateStaticParams() {
  return chapters.map((c) => ({ chapter: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>
}) {
  const { chapter: slug } = await params
  const ch = getChapterBySlug(slug)
  if (!ch) return { title: 'Ikke funnet' }
  return { title: `${ch.title} — Hvitbok`, description: ch.subtitle }
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>
}) {
  const { chapter: slug } = await params
  const ch = getChapterBySlug(slug)
  if (!ch) notFound()

  const markdown = readChapterMarkdown(ch.filePath)
  const words = countChapterWords(ch.filePath)
  const { prev, next } = getAdjacentChapters(slug)

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <Breadcrumbs items={[{ label: 'Hvitbok', href: '/hvitbok' }, { label: `Kapittel ${ch.number}` }]} />

      <header className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-5">
        <p className="text-[10px] uppercase tracking-wider text-emerald-600">
          Kapittel {ch.number}
        </p>
        <h1 className="text-xl font-bold leading-snug text-stone-900">
          {ch.title}
        </h1>
        {ch.subtitle && (
          <p className="mt-1 text-sm text-stone-500">{ch.subtitle}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-400">
          {ch.audience && (
            <span>
              <span className="font-medium text-stone-500">Målgruppe:</span>{' '}
              {ch.audience}
            </span>
          )}
          {ch.status && (
            <span>
              <span className="font-medium text-stone-500">Status:</span>{' '}
              {ch.status}
            </span>
          )}
          <span>~{words.toLocaleString('nb-NO')} ord</span>
        </div>
      </header>

      <div>{renderChapter(markdown, ch.slug)}</div>

      <nav className="flex items-center justify-between gap-4 border-t border-stone-200 pt-4">
        <div className="flex-1">
          {prev ? (
            <Link
              href={`/hvitbok/${prev.slug}`}
              className="group flex flex-col rounded-lg border border-stone-200 bg-white p-3 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                ← Forrige
              </span>
              <span className="text-xs font-medium text-stone-700 group-hover:text-emerald-700">
                {prev.title}
              </span>
            </Link>
          ) : (
            <Link
              href="/hvitbok"
              className="group flex flex-col rounded-lg border border-stone-200 bg-white p-3 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                ← Tilbake
              </span>
              <span className="text-xs font-medium text-stone-700 group-hover:text-emerald-700">
                Innholdsfortegnelse
              </span>
            </Link>
          )}
        </div>
        <div className="flex flex-1 justify-end">
          {next ? (
            <Link
              href={`/hvitbok/${next.slug}`}
              className="group flex flex-col items-end rounded-lg border border-stone-200 bg-white p-3 text-right hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                Neste →
              </span>
              <span className="text-xs font-medium text-stone-700 group-hover:text-emerald-700">
                {next.title}
              </span>
            </Link>
          ) : (
            <Link
              href="/hvitbok"
              className="group flex flex-col items-end rounded-lg border border-stone-200 bg-white p-3 text-right hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                Tilbake →
              </span>
              <span className="text-xs font-medium text-stone-700 group-hover:text-emerald-700">
                Innholdsfortegnelse
              </span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
