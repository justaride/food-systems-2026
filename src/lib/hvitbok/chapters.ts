export type Chapter = {
  slug: string
  number: string
  title: string
  subtitle?: string
  filePath: string
  audience?: string
  status?: string
}

export const chapters: Chapter[] = [
  {
    slug: 'kort-til-jan-thomas',
    number: '1',
    title: 'Kort til Jan Thomas',
    subtitle: 'De funnene som oftest overrasker',
    filePath: 'content/hvitbok/01-kort-til-jan-thomas.md',
    audience: 'Jan Thomas, transition group',
    status: 'Utkast',
  },
  {
    slug: 'nordisk-sirkularitet',
    number: '2',
    title: 'Nordisk sirkularitet',
    subtitle: 'Sporbarhet og EUDR-asymmetri',
    filePath: 'content/hvitbok/02-nordisk-sirkularitet.md',
    audience: 'Transition group',
    status: 'Utkast',
  },
  {
    slug: 'fokusomraader',
    number: '3',
    title: 'Fokusområder',
    subtitle: 'Fem foreslåtte satsinger',
    filePath: 'content/hvitbok/03-fokusomraader.md',
    audience: 'Transition group',
    status: 'Utkast',
  },
]

export function getChapterBySlug(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug)
}

export function getAdjacentChapters(slug: string): {
  prev?: Chapter
  next?: Chapter
} {
  const i = chapters.findIndex((c) => c.slug === slug)
  if (i === -1) return {}
  return {
    prev: i > 0 ? chapters[i - 1] : undefined,
    next: i < chapters.length - 1 ? chapters[i + 1] : undefined,
  }
}
