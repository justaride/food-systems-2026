type Financial = { year: number; revenueNok: unknown; operatingResult: unknown; source: string | null; unitScale: number; amountCurrency: string | null }
type BoardRole = { personKey: string; personName: string; role: string }
type DocumentRef = { documentId: string; context: string | null; document: { slug: string; title: string } }
type Attachments = { financials: Financial[]; boardMembers: BoardRole[]; documentRefs: DocumentRef[] }
const money = (value: unknown) => value == null ? null : String(value)
/** A comparison packet only. Same-year or same-name records are never automatically merged. */
export function compareCompanyAttachments(legacy: Attachments, target: Attachments | undefined) {
  const financials = legacy.financials.map(f => {
    const other = target?.financials.find(t => t.year === f.year)
    const identical = other && money(f.revenueNok) === money(other.revenueNok) && money(f.operatingResult) === money(other.operatingResult)
      && f.unitScale === other.unitScale && f.amountCurrency === other.amountCurrency && f.source === other.source
    return { year: f.year, status: !other ? 'unique' as const : identical ? 'same' as const : 'conflict' as const,
      legacy: { revenue: money(f.revenueNok), result: money(f.operatingResult), scale: f.unitScale, currency: f.amountCurrency, source: f.source },
      target: other ? { revenue: money(other.revenueNok), result: money(other.operatingResult), scale: other.unitScale, currency: other.amountCurrency, source: other.source } : null }
  })
  const uniqueBoardRoles = legacy.boardMembers.filter(b => !target?.boardMembers.some(t => t.personKey === b.personKey && t.role === b.role))
  const uniqueDocumentRefs = legacy.documentRefs.filter(d => !target?.documentRefs.some(t => t.documentId === d.documentId && t.context === d.context))
  return { financials, uniqueBoardRoles, uniqueDocumentRefs,
    conflictYears: financials.filter(f => f.status === 'conflict').length,
    uniqueFinancialYears: financials.filter(f => f.status === 'unique').length }
}
