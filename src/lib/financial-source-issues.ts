type StoredFinancial = { year: number; revenueNok: unknown; operatingResult: unknown; source: string | null }

// A negative display projection, bound to the old stored row. This neither replaces
// the source amounts nor approves a corrected candidate for canonical use.
export function financialSourceIssue(orgNr: string, row: StoredFinancial): string | null {
  if (orgNr === '989278835' && row.year === 2023 && row.source === 'Nofima Årsrapport 2023'
    && Number(row.revenueNok) === 725 && Number(row.operatingResult) === -18) {
    return 'Historiske 2023-tall avviker fra Nofimas årsregnskap 2024, resultatregnskap side 2 (PDF-side 11). Beløp og margin er utelatt i påvente av kildeavstemming.'
  }
  return null
}
