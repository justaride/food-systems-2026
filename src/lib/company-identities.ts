// Negative read projection. These legacy identifiers are retained for history,
// but are not independent companies in directory/financial comparisons.
// Basis: scripts/archive/cleanup-old-orgnrs.ts, scripts/link-tracked-company-docs.ts,
// .claude/reference/company-registry.md and the corresponding register imports.
export const COMPANY_IDENTITY_ALIASES: Record<string, string> = {
  '911856655': '819731322', '879469062': '936560288', '935174627': '914526647',
  '874560552': '947942638', '956866266': '960514718', '975320637': '975350940',
  '919998919': '986228608', '980358088': '988044113', '929094636': '929228723',
  'NO-ALGINOR': '913422082', 'NO-COOP-MN': '915300219', 'NO-948202063-EIE': '988445177',
  'DK-DAGROFA': 'DK-38714295', 'NO-JJ-INV': '918293477', 'FI-KESPRO': 'FI-0777402-5',
  'SE-MARTIN-SERV': 'SE-556559-1135', 'FI-MEIRA': 'FI-0697627-4', 'SE-MENIGO': 'SE-556424-2537',
  'NO-961483584-VTEIE': '984980744', 'NO-961483584-EIE': '976542223',
  'NO-961483584-EIEH': '997747054', 'NO-961483584-VT': '975960714',
  'NO-REITAN-HOLD': '912609987', 'NO-REITAN-EIE': '915994415', 'NO-SERVICEGR': '933444724',
}
export const LEGACY_COMPANY_ORGNRS = Object.keys(COMPANY_IDENTITY_ALIASES)
export const currentCompanyIdentityWhere = { orgNr: { notIn: LEGACY_COMPANY_ORGNRS } }
export function resolvedCompanyOrgNr(orgNr: string) { return COMPANY_IDENTITY_ALIASES[orgNr] ?? orgNr }
