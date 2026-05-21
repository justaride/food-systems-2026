import type { ReactNode } from 'react'
import { marked } from 'marked'
import { parseChapter } from './parser'
import { getEmbed, EMBEDDABLE_CHARTS } from './embeds'
import { KeyFigureBox } from '@/components/hvitbok/KeyFigureBox'
import { CalloutBox } from '@/components/hvitbok/CalloutBox'
import { RelatedVisuals } from '@/components/hvitbok/RelatedVisuals'
import { EmbeddedChart } from '@/components/hvitbok/EmbeddedChart'

function renderEmbed(
  chapterSlug: string,
  tokenType: string,
  tokenId: string,
  key: string,
): ReactNode {
  const embed = getEmbed(chapterSlug, tokenId)
  if (!embed || embed.kind !== tokenType) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div
          key={key}
          className="my-4 rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700"
        >
          Mangler embed-definisjon: {tokenType}:{tokenId}
        </div>
      )
    }
    return null
  }

  if (embed.kind === 'nokkeltall') {
    return <KeyFigureBox key={key} embed={embed} />
  }
  if (embed.kind === 'callout') {
    return <CalloutBox key={key} embed={embed} />
  }
  if (embed.kind === 'relatert') {
    return <RelatedVisuals key={key} links={embed.lenker} />
  }
  // embed.kind === 'viz'
  if (embed.chartId && EMBEDDABLE_CHARTS.has(embed.chartId)) {
    return <EmbeddedChart key={key} chartId={embed.chartId} />
  }
  return (
    <RelatedVisuals
      key={key}
      links={[
        {
          href: embed.href,
          label: embed.label,
          description: embed.description,
        },
      ]}
    />
  )
}

export function renderChapter(
  markdown: string,
  chapterSlug: string,
): ReactNode[] {
  return parseChapter(markdown).map((seg, i) => {
    const key = `seg-${i}`
    if (seg.kind === 'markdown') {
      const html = marked(seg.content, { gfm: true }) as string
      return (
        <article
          key={key}
          className="prose prose-stone max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline prose-table:text-xs"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    }
    return renderEmbed(chapterSlug, seg.tokenType, seg.tokenId, key)
  })
}
