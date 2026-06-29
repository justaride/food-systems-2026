// Shared, pure transform for Fiskeridirektoratet pub-aqua aquaculture sites.
// Used by both the importer (import-akvakulturregister.ts) and the read-only
// reconciliation audit (audit-aquaculture-reconcile.ts) so the field logic that
// is written to the DB and the logic that verifies it can never drift apart.

export type SiteSummary = {
  siteId?: number
  siteNr?: string
  siteName?: string
  status?: string
  statusValue?: string
  siteCapacity?: number
  siteCapacityUnitType?: string
  sitePlacement?: {
    municipalityCode?: string
    municipalityName?: string
    countyCode?: string
    countyName?: string
  }
  connections?: Array<{
    openLegalEntityNr?: string
    productionStageValue?: string
  }>
}

export type SiteDetail = {
  siteId: number
  siteNr: number
  name?: string
  placementType?: string
  placementTypeValue?: string
  waterType?: string
  waterTypeValue?: string
  latitude?: number
  longitude?: number
  capacity?: number
  tempCapacity?: number
  capacityUnitType?: string
  placement?: {
    municipalityCode?: string
    municipalityName?: string
    countyCode?: string
    countyName?: string
  }
  speciesType?: string | null
  speciesTypeValue?: string | null
  speciesTypes?: string[] | null
  speciesLimitations?: Array<{ name?: string }>
  connections?: Array<{
    licenseNr?: string
    openLegalEntityNr?: string
    productionStageValue?: string
    statusValue?: string
  }>
  statusValue?: string
}

// pub-aqua speciesTypes enum -> Norwegian label. Unknown codes fall back to a
// humanized form so no species value is ever silently dropped.
export const SPECIES_LABELS: Record<string, string> = {
  SALMON: 'Laks',
  TROUT: 'Ørret',
  RAINBOW_TROUT: 'Regnbueørret',
  CHAR: 'Røye',
  COD: 'Torsk',
  HALIBUT: 'Kveite',
  CLEANER_FISH: 'Rensefisk',
  SHELL_FISH: 'Skalldyr',
  CRUSTACEAN: 'Krepsdyr',
  ALGAE: 'Alger',
  OTHER_FISH: 'Annen fisk',
  OTHER_SPECIES: 'Andre arter',
}

export function speciesLabel(code: string): string {
  const key = code.trim().toUpperCase()
  return (
    SPECIES_LABELS[key] ??
    key
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/^\w/, c => c.toUpperCase())
  )
}

export type SitePayload = {
  siteName: string | null
  municipality: string | null
  municipalityNo: string | null
  county: string | null
  country: string
  lat: number | null
  lng: number | null
  licenseStatus: string | null
  placement: string | null
  waterType: string | null
  capacityTonnes: number | null
  capacityUnit: string | null
  species: string[]
  productionTypes: string[]
}

function firstPositive(...vals: Array<number | null | undefined>): number | null {
  for (const v of vals) {
    if (typeof v === 'number' && v > 0) return v
  }
  return null
}

// Build the canonical set of DB fields for a site from its summary + detail.
export function buildSitePayload(
  summary: SiteSummary,
  detail: SiteDetail | null
): SitePayload {
  const species = (detail?.speciesLimitations ?? [])
    .map(s => s?.name)
    .filter((x): x is string => Boolean(x))
  if (detail?.speciesTypeValue) species.push(detail.speciesTypeValue)
  // Primary source of species is the `speciesTypes` code array
  // (e.g. ["SALMON", "OTHER_FISH"]); the singular fields above are usually empty.
  for (const code of detail?.speciesTypes ?? []) {
    if (code) species.push(speciesLabel(code))
  }

  // Placement only exists in the site detail (SJØ/LAND/HAV). It must NOT fall
  // back to a connection's productionStageValue ("Stamfisk"/"Matfisk"), which
  // is a production stage, not a placement.
  const placement = detail?.placementTypeValue ?? null
  const waterType = detail?.waterTypeValue ?? null

  // Capacity is the site MTB. The detail endpoint returns 0 (not null) for many
  // land sites, so treat 0 as "missing" and prefer any positive value.
  const capacity = firstPositive(detail?.capacity, summary.siteCapacity)
  const capacityUnit =
    detail?.capacityUnitType ?? summary.siteCapacityUnitType ?? 'TN'

  const siteName = detail?.name ?? summary.siteName ?? null
  const municipality =
    detail?.placement?.municipalityName ?? summary.sitePlacement?.municipalityName ?? null
  const municipalityNo =
    detail?.placement?.municipalityCode ?? summary.sitePlacement?.municipalityCode ?? null
  const county = detail?.placement?.countyName ?? summary.sitePlacement?.countyName ?? null
  const licenseStatus =
    (detail?.statusValue ?? summary.statusValue ?? summary.status ?? '').toLowerCase() || null

  return {
    siteName,
    municipality,
    municipalityNo,
    county,
    country: 'NO',
    lat: detail?.latitude ?? null,
    lng: detail?.longitude ?? null,
    licenseStatus,
    placement,
    waterType,
    capacityTonnes: capacity,
    capacityUnit,
    species: Array.from(new Set(species)),
    productionTypes: Array.from(
      new Set(
        (summary.connections ?? [])
          .map(c => c.productionStageValue)
          .filter((x): x is string => Boolean(x))
      )
    ),
  }
}

export function localityNumber(summary: SiteSummary): string {
  return String(summary.siteNr ?? summary.siteId)
}
