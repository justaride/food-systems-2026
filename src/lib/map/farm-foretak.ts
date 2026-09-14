export type ForetakRow = { orgnr: string; komnr: string }

const unquote = (value: string) => value.trim().replace(/^"(.*)"$/, '$1')

/** Parse Landbruksdirektoratet's semicolon-separated foretak CSV (ORGNR, KOMNR, …). */
export function parseForetakCsv(text: string): ForetakRow[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim())
  const header = lines[0].split(';').map(h => unquote(h).toUpperCase())
  const orgIdx = header.indexOf('ORGNR')
  const komIdx = header.indexOf('KOMNR')
  if (orgIdx < 0 || komIdx < 0) throw new Error('Foretak-CSV mangler kolonnene ORGNR og KOMNR')

  return lines.slice(1).map(line => {
    const cells = line.split(';').map(unquote)
    return { orgnr: cells[orgIdx] ?? '', komnr: cells[komIdx] ?? '' }
  })
}

/**
 * Count unique foretak per kommune. A foretak listed on several properties in
 * different kommuner is counted once, in the kommune where it first appears.
 * Only counts leave this function: the register rows identify sole proprietors.
 */
export function countForetakByKommune(rows: ForetakRow[]): Map<string, number> {
  const seen = new Set<string>()
  const counts = new Map<string, number>()
  for (const { orgnr, komnr } of rows) {
    if (!orgnr || !komnr || seen.has(orgnr)) continue
    seen.add(orgnr)
    counts.set(komnr, (counts.get(komnr) ?? 0) + 1)
  }
  return counts
}
