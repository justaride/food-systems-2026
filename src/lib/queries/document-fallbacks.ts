type FallbackDocument = {
  title: string
  year: number | null
  country: string | null
  summary: string | null
  content: string
  tags: string[]
  updatedAt: Date
}

function stripMarkdown(text: string) {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitIntoSentences(text: string) {
  const normalized = stripMarkdown(text)
  if (!normalized) return []

  return normalized
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function buildSentenceList(text: string | null | undefined, maxItems = 3) {
  if (!text) return []

  return splitIntoSentences(text)
    .slice(0, maxItems)
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
}

export function buildExcerpt(
  primary: string | null | undefined,
  fallback: string | null | undefined,
  maxChars = 240,
) {
  const source = primary && primary.trim() ? primary : fallback ?? ''
  const normalized = stripMarkdown(source)

  if (!normalized) return 'Dokumentet er importert, men mangler fortsatt en strukturert oppsummering.'
  if (normalized.length <= maxChars) return normalized

  return `${normalized.slice(0, maxChars - 1).trimEnd()}…`
}

export function normalizeCountryCode(country: string | null | undefined, fallback = 'NO') {
  if (!country) return fallback

  const normalized = country.trim()
  if (!normalized) return fallback

  const lower = normalized.toLowerCase()
  const aliases: Record<string, string> = {
    no: 'NO',
    norge: 'NO',
    norway: 'NO',
    se: 'SE',
    sverige: 'SE',
    sweden: 'SE',
    dk: 'DK',
    danmark: 'DK',
    denmark: 'DK',
    fi: 'FI',
    finland: 'FI',
    is: 'IS',
    island: 'IS',
    iceland: 'IS',
    nordic: 'NORDIC',
    norden: 'NORDIC',
  }

  return aliases[lower] ?? normalized.toUpperCase()
}

export function buildDocumentDate(doc: Pick<FallbackDocument, 'year' | 'updatedAt'>) {
  if (doc.year) return `${doc.year}-12-31`
  return doc.updatedAt.toISOString().slice(0, 10)
}

export function normalizeMergeKey(...parts: Array<string | number | null | undefined>) {
  return parts
    .map((part) => (part ?? '').toString().trim().toLowerCase())
    .join('::')
}
