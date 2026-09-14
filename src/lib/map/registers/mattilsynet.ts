import type { ProcessingCategory } from '../types'

export type EstablishmentCategory = ProcessingCategory

/** One approved establishment, merged across the section rows Mattilsynet lists it under. */
export type Establishment = {
  approvalNumber: string
  name: string
  address: string
  postnummer: string
  poststed: string
  sections: number[]
  category: EstablishmentCategory
  activities: string[]
  species: string[]
  orgNr?: string
}

// Factory and freezer vessels have no fixed location on land.
const VESSEL_ACTIVITIES = new Set(['FV', 'ZV'])

/** Minimal RFC 4180 parser: quoted fields may hold commas, quotes and line breaks. */
export function parseCsv(text: string, delimiter = ','): Record<string, string>[] {
  const records: string[][] = []
  let field = ''
  let record: string[] = []
  let quoted = false
  const input = text.replace(/^﻿/, '')

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === delimiter) {
      record.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++
      record.push(field)
      if (record.some(value => value !== '')) records.push(record)
      record = []
      field = ''
    } else {
      field += char
    }
  }
  record.push(field)
  if (record.some(value => value !== '')) records.push(record)

  const [header, ...rows] = records
  if (!header) return []
  return rows.map(values => Object.fromEntries(header.map((key, i) => [key.trim(), (values[i] ?? '').trim()])))
}

/** "Section 8 - Fishery products" → 8 */
export function sectionNumber(label: string): number | null {
  const match = label.match(/section\s+(\d+)/i)
  return match ? Number(match[1]) : null
}

export function categoryForSections(sections: number[]): EstablishmentCategory {
  const has = (...numbers: number[]) => sections.some(s => numbers.includes(s))
  if (has(7, 8)) return 'seafood'
  if (has(9)) return 'dairy'
  if (has(10)) return 'egg'
  if (has(1, 2, 3, 4, 5, 6)) return 'meat'
  if (has(11, 12, 13, 14, 15)) return 'other'
  return 'general'
}

const splitList = (value: string | undefined) =>
  (value ?? '').split(',').map(v => v.trim()).filter(Boolean)

/** Merge section rows by approval number; `orgNrByApproval` comes from the fishery list. */
export function groupEstablishments(
  rows: Record<string, string>[],
  orgNrByApproval: Map<string, string> = new Map()
): Establishment[] {
  const byApproval = new Map<string, Establishment>()

  for (const row of rows) {
    const approvalNumber = row.GODKJENNINGSNUMMER
    if (!approvalNumber) continue
    const existing = byApproval.get(approvalNumber)
    const establishment: Establishment = existing ?? {
      approvalNumber,
      name: row.VIRKSOMHETSNAVN ?? '',
      address: row.ADRESSE ?? '',
      postnummer: row.POSTNR ?? '',
      poststed: row.POSTSTED ?? '',
      sections: [],
      category: 'general',
      activities: [],
      species: [],
      orgNr: orgNrByApproval.get(approvalNumber),
    }

    const section = sectionNumber(row.SEKSJON ?? '')
    if (section !== null && !establishment.sections.includes(section)) establishment.sections.push(section)
    for (const activity of [...splitList(row.PRODUKSJONSFORM), ...splitList(row.ANDRE_PRODFORMER)]) {
      if (!establishment.activities.includes(activity)) establishment.activities.push(activity)
    }
    for (const species of splitList(row.ART)) {
      if (!establishment.species.includes(species)) establishment.species.push(species)
    }
    byApproval.set(approvalNumber, establishment)
  }

  return [...byApproval.values()].map(e => ({
    ...e,
    sections: [...e.sections].sort((a, b) => a - b),
    category: categoryForSections(e.sections),
  }))
}

export function isVesselOnly(establishment: Establishment): boolean {
  return establishment.activities.length > 0 && establishment.activities.every(a => VESSEL_ACTIVITIES.has(a))
}

/** CSV attachment URLs on a Mattilsynet list page (the hash in the URL changes between releases). */
export function extractCsvLinks(html: string): string[] {
  const links = html.match(/https:\/\/[^"'\s]*\/_\/attachment\/[^"'\s]*\.csv/g) ?? []
  return [...new Set(links)]
}
