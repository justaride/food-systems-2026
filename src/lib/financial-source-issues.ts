type StoredFinancial = { year: number; revenueNok: unknown; operatingResult: unknown; source: string | null }

// A negative display projection, bound to the old stored row. This neither replaces
// the source amounts nor approves a corrected candidate for canonical use.
export function financialSourceIssue(orgNr: string, row: StoredFinancial): string | null {
  if (orgNr === '989278835' && row.year === 2023 && row.source === 'Nofima Årsrapport 2023'
    && Number(row.revenueNok) === 725 && Number(row.operatingResult) === -18) {
    return 'Historiske 2023-tall avviker fra Nofimas årsregnskap 2024, resultatregnskap side 2 (PDF-side 11). Beløp og margin er utelatt i påvente av kildeavstemming.'
  }
  if (orgNr === '929975200' && row.source === `Austevoll Seafood Årsrapport ${row.year}`) {
    const known2023Row = row.year === 2023 && Number(row.revenueNok) === 28900 && row.operatingResult == null
    const known2024Row = row.year === 2024 && Number(row.revenueNok) === 30600 && Number(row.operatingResult) === 4200000000
    if (known2023Row || known2024Row) {
      return `Historiske ${row.year}-tall avviker fra konsernregnskapet i Austevolls årsrapport 2024, side 103. Rapporten skiller driftsresultat fra alternative resultatmål (note 28). Beløp og margin er utelatt i påvente av kildeavstemming.`
    }
  }
  return null
}
