export type ChapterSegment =
  | { kind: 'markdown'; content: string }
  | { kind: 'token'; tokenType: string; tokenId: string }

const TOKEN_LINE = /^\{\{([a-z]+):([a-z0-9-]+)\}\}$/

export function parseChapter(markdown: string): ChapterSegment[] {
  if (markdown.trim() === '') return []

  const segments: ChapterSegment[] = []
  let buffer: string[] = []

  const flush = () => {
    const content = buffer.join('\n').trim()
    if (content !== '') segments.push({ kind: 'markdown', content })
    buffer = []
  }

  for (const line of markdown.split('\n')) {
    const match = line.trim().match(TOKEN_LINE)
    if (match) {
      flush()
      segments.push({
        kind: 'token',
        tokenType: match[1],
        tokenId: match[2],
      })
    } else {
      buffer.push(line)
    }
  }
  flush()
  return segments
}
