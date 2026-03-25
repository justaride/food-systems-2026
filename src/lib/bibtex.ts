import type { Thesis as ThesisRow, Report as ReportRow } from '@/generated/prisma/client'

const BIBTEX_SPECIAL = /[&%$#_{}~^]/g
const SPECIAL_MAP: Record<string, string> = {
  '&': '\\&',
  '%': '\\%',
  '$': '\\$',
  '#': '\\#',
  '_': '\\_',
  '{': '\\{',
  '}': '\\}',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}',
}

function escapeBibtex(str: string): string {
  return str.replace(BIBTEX_SPECIAL, (ch) => SPECIAL_MAP[ch] ?? ch)
}

function isStandardDoi(doi: string | null | undefined): boolean {
  return doi != null && doi.startsWith('10.')
}

function formatField(name: string, value: string | null | undefined): string {
  if (!value) return ''
  return `  ${name} = {${value}},\n`
}

function resolveNonStandardId(doi: string): string {
  if (doi.startsWith('hdl:')) return `https://hdl.handle.net/${doi.slice(4)}`
  if (doi.startsWith('diva2:')) return `https://www.diva-portal.org/smash/record.jsf?pid=${doi}`
  if (doi.startsWith('slu:')) return `https://stud.epsilon.slu.se/${doi.slice(4)}`
  if (doi.startsWith('URN:')) return `https://urn.fi/${doi}`
  return doi
}

export function thesisToBibtex(t: ThesisRow): string {
  const entryType = t.degree === 'phd' ? 'phdthesis' : 'mastersthesis'
  const author = escapeBibtex(t.authors)
  const title = escapeBibtex(t.title)
  const school = t.publisher || t.institution
  const doi = isStandardDoi(t.doi) ? t.doi : null
  const url = t.url

  let note: string | null = null
  if (t.doi && !isStandardDoi(t.doi)) {
    note = `Identifier: ${resolveNonStandardId(t.doi)}`
  }

  let entry = `@${entryType}{${t.id},\n`
  entry += formatField('author', author)
  entry += formatField('title', title)
  entry += formatField('school', school ? escapeBibtex(school) : null)
  entry += formatField('year', String(t.year))
  entry += formatField('url', url)
  entry += formatField('doi', doi)
  entry += formatField('note', note ? escapeBibtex(note) : null)
  entry += '}\n'
  return entry
}

export function reportToBibtex(r: ReportRow): string {
  const entryType = r.isbn ? 'book' : 'techreport'
  const author = r.author ? escapeBibtex(r.author) : null
  const institution = r.institution ? escapeBibtex(r.institution) : null
  const title = escapeBibtex(r.title)
  const doi = isStandardDoi(r.doi) ? r.doi : null

  let note: string | null = null
  if (r.doi && !isStandardDoi(r.doi)) {
    note = `Identifier: ${resolveNonStandardId(r.doi)}`
  }

  let entry = `@${entryType}{${r.id},\n`
  entry += formatField('author', author ?? institution)
  entry += formatField('title', title)
  const orgField = entryType === 'book' ? 'publisher' : 'institution'
  entry += formatField(orgField, institution ?? (r.publisher ? escapeBibtex(r.publisher) : null))
  entry += formatField('year', r.year ? String(r.year) : null)
  entry += formatField('url', r.sourceUrl)
  entry += formatField('doi', doi)
  entry += formatField('isbn', r.isbn)
  entry += formatField('note', note ? escapeBibtex(note) : null)
  entry += '}\n'
  return entry
}

export function generateBibtexFile(theses: ThesisRow[], reports: ReportRow[]): string {
  const now = new Date().toISOString()
  const header = [
    '% Food Systems 2026 --- Bibliography',
    `% Generated ${now}`,
    `% Entries: ${theses.length} theses, ${reports.length} reports`,
    '',
  ].join('\n')

  const thesisEntries = theses.map(thesisToBibtex).join('\n')
  const reportEntries = reports.map(reportToBibtex).join('\n')

  return header + '\n' + thesisEntries + (thesisEntries && reportEntries ? '\n' : '') + reportEntries
}
