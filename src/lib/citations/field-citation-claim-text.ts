export type CompanyNaceClaimInput = {
  name?: string | null
  naceCode?: string | null
  naceDescription?: string | null
}

function cleanText(value: string | null | undefined) {
  const text = value?.trim()
  return text && text.length > 0 ? text : null
}

export function buildCompanyNaceClaimText(company: CompanyNaceClaimInput) {
  const name = cleanText(company.name)
  const description = cleanText(company.naceDescription)
  if (!name || !description) return null

  const code = cleanText(company.naceCode)
  return `${name} NACE${code ? ` ${code}` : ''}: ${description}`
}
