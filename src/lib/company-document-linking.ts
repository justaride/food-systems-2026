function normalizeText(value: string): string {
  return value
    .replace(/[ÆÄ]/g, 'A')
    .replace(/[æä]/g, 'a')
    .replace(/[ØÖ]/g, 'O')
    .replace(/[øö]/g, 'o')
    .replace(/[Å]/g, 'A')
    .replace(/[å]/g, 'a')
    .replace(/[Ü]/g, 'U')
    .replace(/[ü]/g, 'u')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
}

function normalizeSearch(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export type CompanyDocumentCandidate = {
  title: string
  filePath: string | null
}

const INTERNAL_ARTIFACT_PATTERNS = [
  'arkiv indeks',
  'archive index',
  'research corpus audit',
  'critical project review',
  'company extraction audit',
  'claim audit',
  'research missions',
  'desk research plan',
  'importplan',
  'prompt pack',
  'promptpack',
  'research prompts',
  'jeg trenger',
  'kilderegister',
  'plattform kobling',
  'koblingskandidater',
  'link review',
  'promotion candidates',
  'promotion preview',
  'file coverage',
  'pdf katalog',
  'ki priority',
  'remediation backlog',
  'download queue',
  'download backlog',
  'data readiness',
  'source gap',
  'strict source gap',
  'orphan review',
  'control report',
]

export function isCompanyDocumentEvidenceCandidate(doc: CompanyDocumentCandidate): boolean {
  const marker = normalizeSearch(`${doc.title} ${doc.filePath ?? ''}`)

  return !INTERNAL_ARTIFACT_PATTERNS.some((pattern) => marker.includes(pattern))
}
