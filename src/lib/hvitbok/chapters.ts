import projectionData from './generated/whitepaper-chapters.json'

export type Chapter = (typeof projectionData.chapters)[number] & {
  subtitle: string
  audience: string
  status: string
}

export const whitepaperProjection = projectionData
export const chapters: Chapter[] = projectionData.chapters.map((chapter) => ({
  ...chapter,
  audience: 'Intern faglig og redaksjonell gjennomgang',
  status: 'Intern syntese – avventer beslutning',
  subtitle: chapter.number === '0'
    ? 'Statuskoder, tillatt bruk og kildehenvisninger'
    : '',
}))

const legacyAliases: Record<string, string> = {
  'kort-til-jan-thomas': '1-ledersyntese',
  'nordisk-sirkularitet': '8-sirkularitet-matsvinn-og-material-npk-strommer',
  fokusomraader: '10-fem-overgangslevere-som-kan-testes',
}

export function getChapterBySlug(slug: string): Chapter | undefined {
  const canonicalSlug = legacyAliases[slug] ?? slug
  return chapters.find((chapter) => chapter.slug === canonicalSlug)
}

export function getAdjacentChapters(slug: string): {
  prev?: Chapter
  next?: Chapter
} {
  const chapter = getChapterBySlug(slug)
  if (!chapter) return {}
  const i = chapters.findIndex((candidate) => candidate.slug === chapter.slug)
  if (i === -1) return {}
  return {
    prev: i > 0 ? chapters[i - 1] : undefined,
    next: i < chapters.length - 1 ? chapters[i + 1] : undefined,
  }
}

export function getStaticChapterSlugs(): string[] {
  return [...chapters.map(({ slug }) => slug), ...Object.keys(legacyAliases)]
}
