import type { ReactNode } from 'react'
import { marked } from 'marked'
import { parseChapter } from './parser'
import { getEmbed, EMBEDDABLE_CHARTS } from './embeds'
import { KeyFigureBox } from '@/components/hvitbok/KeyFigureBox'
import { CalloutBox } from '@/components/hvitbok/CalloutBox'
import { RelatedVisuals } from '@/components/hvitbok/RelatedVisuals'
import { EmbeddedChart } from '@/components/hvitbok/EmbeddedChart'
import { headingAnchor } from './projection'

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
      const anchored = seg.content.replace(
        /^(#{2,4})\s+(.+)$/gm,
        (_line, hashes: string, title: string) =>
          `<span id="${headingAnchor(title)}"></span>\n${hashes} ${title}`,
      )
      const html = marked(anchored, { gfm: true }) as string
      return (
        <article
          key={key}
          className="whitepaper-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    }
    return renderEmbed(chapterSlug, seg.tokenType, seg.tokenId, key)
  })
}
