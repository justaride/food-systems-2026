import { createHash } from 'node:crypto'

export const WHITEPAPER_SOURCE_PATH = 'research/whitepaper/food-systems-2026-synthesis-v2.md'

export type ProjectedHeading = { level: number; title: string; anchor: string; line: number }
export type ProjectedChapter = {
  slug: string; number: string; title: string; body: string
  startLine: number; endLine: number; contentHash: string; headings: ProjectedHeading[]
}
export type WhitepaperProjection = {
  schemaVersion: 1; generatedOn: string; sourcePath: string; sourceDate: string
  sourceStatus: string; externalReady: false; sourceHash: string
  projectionHash: string; chapters: ProjectedChapter[]
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function headingAnchor(title: string): string {
  return title.toLocaleLowerCase('nb-NO').normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function frontmatterValue(source: string, key: string): string {
  const match = source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  if (!match) throw new Error(`Mangler frontmatter-felt: ${key}`)
  return match[1].trim().replace(/^"|"$/g, '')
}

export function buildWhitepaperProjection(source: string, generatedOn = '2026-09-09'): WhitepaperProjection {
  const lines = source.split('\n')
  const starts = lines.map((line, index) => ({ line, index }))
    .filter(({ line }) => /^## (?:Leserveiledning|\d+\.)/.test(line))
  const chapters = starts.map(({ line, index }, chapterIndex) => {
    const endIndex = starts[chapterIndex + 1]?.index ?? lines.length
    const body = lines.slice(index, endIndex).join('\n').trimEnd() + '\n'
    const rawTitle = line.replace(/^##\s+/, '')
    const numbered = rawTitle.match(/^(\d+)\.\s+(.+)$/)
    const number = numbered?.[1] ?? '0'
    const title = numbered?.[2] ?? rawTitle
    const slug = numbered ? `${number}-${headingAnchor(title)}` : headingAnchor(title)
    const headings = lines.slice(index, endIndex).map((headingLine, offset) => ({ headingLine, offset }))
      .filter(({ headingLine }) => /^#{2,4}\s+/.test(headingLine))
      .map(({ headingLine, offset }) => {
        const match = headingLine.match(/^(#{2,4})\s+(.+)$/)!
        return { level: match[1].length, title: match[2], anchor: headingAnchor(match[2]), line: index + offset + 1 }
      })
    return { slug, number, title, body, startLine: index + 1, endLine: endIndex, contentHash: sha256(body), headings }
  })
  if (chapters.length !== 16) throw new Error(`Forventet leserveiledning + 15 kapitler, fant ${chapters.length}`)
  const sourceHash = sha256(source)
  const projectionHash = sha256(chapters.map(({ slug, contentHash }) => `${slug}:${contentHash}`).join('\n'))
  return {
    schemaVersion: 1, generatedOn, sourcePath: WHITEPAPER_SOURCE_PATH,
    sourceDate: frontmatterValue(source, 'dato'), sourceStatus: frontmatterValue(source, 'status'),
    externalReady: false, sourceHash, projectionHash, chapters,
  }
}
