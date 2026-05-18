export type OrgNrFormat = 'bronnoysund' | 'nordic_prefix' | 'research_construct' | 'unknown'

export type CompanyRegistryStatus = {
  isResearchConstruct: boolean
  orgNrFormat: OrgNrFormat
  registrySource: string | null
}

const NORWEGIAN_ORGNR_PATTERN = /^[0-9]{9}$/
const NORDIC_PREFIX_PATTERN = /^(SE|DK|FI|IS)-.+/
const RESEARCH_CONSTRUCT_PATTERN = /^NO-.+/

export function classifyCompanyRegistryStatus(orgNr: string | null | undefined, _country: string | null | undefined): CompanyRegistryStatus {
  const normalized = orgNr?.trim() ?? ''

  if (NORWEGIAN_ORGNR_PATTERN.test(normalized)) {
    return {
      isResearchConstruct: false,
      orgNrFormat: 'bronnoysund',
      registrySource: null,
    }
  }

  if (NORDIC_PREFIX_PATTERN.test(normalized)) {
    return {
      isResearchConstruct: false,
      orgNrFormat: 'nordic_prefix',
      registrySource: null,
    }
  }

  if (RESEARCH_CONSTRUCT_PATTERN.test(normalized)) {
    return {
      isResearchConstruct: true,
      orgNrFormat: 'research_construct',
      registrySource: null,
    }
  }

  return {
    isResearchConstruct: false,
    orgNrFormat: 'unknown',
    registrySource: null,
  }
}
