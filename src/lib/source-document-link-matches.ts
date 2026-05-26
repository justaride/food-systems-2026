export type SourceDocLinkMatch = {
  sourceDocId: string
  reason: string
}

const EXACT_SOURCE_DOC_LINKS: Record<string, SourceDocLinkMatch> = {
  'docs/meetings/9, mars 2026 FOOD.md': {
    sourceDocId: 'src-3',
    reason: 'Food Systems oppstartsmøte 9. mars 2026',
  },
  'docs/meetings/Speaker 1.md': {
    sourceDocId: 'src-4',
    reason: 'Strategisamtale om verdikjeder, data og Transition Groups',
  },
  'docs/meetings/Speaker 1 (1).md': {
    sourceDocId: 'src-5',
    reason: 'Dokumentgjennomgang og oppstartssamtale for Food Systems-arbeidet',
  },
  'external/coffee-forest/research_review_eudr.md': {
    sourceDocId: 'src-102',
    reason: 'EUDR research review imported from the Coffee & Forest workspace',
  },
  'external/circular-cities/SA-02-mat-og-biomasse.md': {
    sourceDocId: 'src-123',
    reason: 'Circular Cities food and biomass sector analysis',
  },
  'external/circular-cities/15-nordic-policy-landscape.md': {
    sourceDocId: 'src-124',
    reason: 'Circular Cities Nordic policy landscape synthesis',
  },
  'external/circular-cities/07-horizon-europe-call-analysis.md': {
    sourceDocId: 'src-125',
    reason: 'Circular Cities Horizon Europe Cluster 6 call analysis',
  },
  'external/circular-cities/19-nordic-added-value.md': {
    sourceDocId: 'src-126',
    reason: 'Circular Cities Nordic added value and NCH portfolio synthesis',
  },
  'evidence-pack/download-backlog-2026-04-20.csv': {
    sourceDocId: 'src-153',
    reason: 'Food Research Process source download backlog for the 2026-04-20 research round',
  },
  'docs/meetings/Strategisk ledergruppe Marked 16 mars 2026.md': {
    sourceDocId: 'src-100',
    reason: 'Strategisk ledergruppe Marked meeting transcript',
  },
  'docs/meetings/TRANSITION GROUPS - Møte 13-04-26.md': {
    sourceDocId: 'src-177',
    reason: 'Transition Groups meeting transcript from 13 April 2026',
  },
  'docs/meetings/JT-GABRIEL - Arbeidsmøte 13-04-26.md': {
    sourceDocId: 'src-178',
    reason: 'JT-Gabriel Food TG working meeting transcript from 13 April 2026',
  },
  'docs/meetings/JT-GABRIEL - Arbeidsmøte 20-04-26.md': {
    sourceDocId: 'src-179',
    reason: 'JT-Gabriel Food TG working meeting transcript from 20 April 2026',
  },
  'docs/meetings/TRANSITION GROUPS - Møte 21-04-26.md': {
    sourceDocId: 'src-180',
    reason: 'Transition Groups meeting transcript from 21 April 2026',
  },
}

export function normalizeSourceDocumentPath(filePath: string): string {
  return filePath
    .trim()
    .replaceAll('\\', '/')
    .replace(/^\.?\//, '')
    .replace(/^research\//, '')
}

export function findExactSourceDocLink(filePath: string): SourceDocLinkMatch | null {
  return EXACT_SOURCE_DOC_LINKS[normalizeSourceDocumentPath(filePath)] ?? null
}
