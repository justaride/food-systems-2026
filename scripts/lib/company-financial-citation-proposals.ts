export type CompanyFinancialCitationCandidate = {
  companyName: string
  years: number[]
  documentPath: string
  note?: string
}

export type ProposalDocument = {
  id: string
  title: string
  filePath: string | null
  url: string | null
}

export type ProposalFinancial = {
  id: string
  companyName: string
  orgNr: string
  year: number
  revenueNok: string | null
  operatingResult: string | null
  ebitda: string | null
  source: string | null
}

export type CompanyFinancialCitationProposalRow = {
  status: 'proposal_requires_human_value_check' | 'skipped_document_not_unique' | 'skipped_financial_not_unique'
  companyName: string
  orgNr: string
  year: number
  financialId: string
  documentId: string
  documentPath: string
  documentUrl: string
  source: string
  revenueNok: string
  operatingResult: string
  ebitda: string
  note: string
}

const CSV_HEADERS: Array<keyof CompanyFinancialCitationProposalRow> = [
  'status',
  'companyName',
  'orgNr',
  'year',
  'financialId',
  'documentId',
  'documentPath',
  'documentUrl',
  'source',
  'revenueNok',
  'operatingResult',
  'ebitda',
  'note',
]

export function buildCompanyFinancialCitationProposalRows(input: {
  candidates: CompanyFinancialCitationCandidate[]
  documents: ProposalDocument[]
  financials: ProposalFinancial[]
}): CompanyFinancialCitationProposalRow[] {
  const rows: CompanyFinancialCitationProposalRow[] = []

  for (const candidate of input.candidates) {
    const documents = input.documents.filter(document => document.filePath === candidate.documentPath)

    for (const year of candidate.years) {
      if (documents.length !== 1) {
        rows.push(emptySkippedRow(
          'skipped_document_not_unique',
          candidate,
          year,
          `Expected exactly one local document for candidate path; found ${documents.length}`,
        ))
        continue
      }

      const financials = input.financials.filter(financial =>
        financial.companyName === candidate.companyName && financial.year === year,
      )
      if (financials.length !== 1) {
        rows.push(emptySkippedRow(
          'skipped_financial_not_unique',
          candidate,
          year,
          `Expected exactly one CompanyFinancial row; found ${financials.length}`,
        ))
        continue
      }

      const financial = financials[0]
      const document = documents[0]
      rows.push({
        status: 'proposal_requires_human_value_check',
        companyName: candidate.companyName,
        orgNr: financial.orgNr,
        year,
        financialId: financial.id,
        documentId: document.id,
        documentPath: document.filePath ?? '',
        documentUrl: document.url ?? '',
        source: financial.source ?? '',
        revenueNok: financial.revenueNok ?? '',
        operatingResult: financial.operatingResult ?? '',
        ebitda: financial.ebitda ?? '',
        note: candidate.note ?? 'Verify exact value and table/page before creating SourceCitation/FieldCitation.',
      })
    }
  }

  return rows
}

export function formatCompanyFinancialCitationProposalCsv(rows: CompanyFinancialCitationProposalRow[]): string {
  return [
    CSV_HEADERS.join(','),
    ...rows.map(row => CSV_HEADERS.map(header => csvCell(row[header])).join(',')),
  ].join('\n')
}

function emptySkippedRow(
  status: CompanyFinancialCitationProposalRow['status'],
  candidate: CompanyFinancialCitationCandidate,
  year: number,
  note: string,
): CompanyFinancialCitationProposalRow {
  return {
    status,
    companyName: candidate.companyName,
    orgNr: '',
    year,
    financialId: '',
    documentId: '',
    documentPath: candidate.documentPath,
    documentUrl: '',
    source: '',
    revenueNok: '',
    operatingResult: '',
    ebitda: '',
    note,
  }
}

function csvCell(value: string | number): string {
  const text = String(value)
  if (!/[",\n]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}
