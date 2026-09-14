export type StoreType = 'discount' | 'convenience' | 'supermarket' | 'hypermarket'

export type MapLayer = 'stores' | 'boundaries' | 'aquaculture' | 'processing' | 'ports' | 'desert' | 'vulnerability' | 'properties' | 'logistics' | 'farms' | 'circular-flows'

export type MunicipalityMetrics = {
  storeCount: number
  storesPerCapita: number
  hhi: number
  dominantChain: string | null
  dominantChainShare: number
}

export type Store = {
  id: string
  osmId: number
  name: string
  chain: string
  chainId: string
  storeType: StoreType
  location: { lat: number; lng: number }
  address: string
  city: string
  postcode: string
  openingHours?: string
  wheelchair?: string
  phone?: string
  website?: string
  organic?: string
}

export type Municipality = {
  code: string
  name: string
  population: number
  area: number
  medianIncome?: number
  households?: number
  ageDistribution?: {
    under18Pct: number
    over65Pct: number
  }
  metrics?: MunicipalityMetrics
}

export type AquacultureProductionType = 'matfisk' | 'settefisk' | 'stamfisk' | 'shellfish' | 'seaweed' | 'other'

export type AquacultureSite = {
  id: number
  name: string
  status: string
  capacity: number
  capacityUnit: string
  placement: 'sea' | 'land'
  waterType: string
  county: string
  municipality: string
  species: string[]
  productionType: AquacultureProductionType
  coordinates: [number, number]
  companyName?: string
  orgNr?: string
}

export type ProcessingCategory = 'meat' | 'seafood' | 'dairy' | 'egg' | 'general' | 'other'

/** Approved food establishment (Mattilsynet), geocoded and resolved to a Brreg organisation. */
export type ProcessingPlant = {
  /** Mattilsynet approval number */
  id: string
  name: string
  category: ProcessingCategory
  activities: string[]
  species: string[]
  address: string
  postnummer: string
  poststed: string
  kommunenummer: string
  precision: 'address' | 'place-name' | 'postnummer'
  orgNr: string
  employees: number | null
  coordinates: [number, number]
}

export const PROCESSING_COLORS: Record<ProcessingCategory, string> = {
  meat: '#DC2626',
  seafood: '#0891B2',
  dairy: '#2563EB',
  egg: '#CA8A04',
  general: '#78716C',
  other: '#7C3AED',
}

export type PortType = 'fishing-harbour' | 'port-facility'

/** Kystverket fishing harbour or ISPS port facility. */
export type Port = {
  id: string
  name: string
  type: PortType
  coordinates: [number, number]
  harbour?: string
  functions: string[]
  ownerType?: string
  /** Only set when the owner is public or has a legal form; see the ports fetch script. */
  owner: string | null
  cruise: boolean
  kommunenavn: string
  poststed: string
  county?: string
}

/** Food wholesale or food-related warehousing site: a Brreg sub-unit geocoded from its street address. */
export type LogisticsHub = {
  /** Sub-unit orgnr */
  id: string
  name: string
  group: 'wholesale' | 'warehousing'
  naceCode: string
  naceDescription: string
  employees: number | null
  parentOrgNr: string
  parentName: string
  address: string
  postnummer: string
  poststed: string
  kommunenummer: string
  precision: 'address' | 'place-name' | 'postnummer'
  coordinates: [number, number]
}

export type FlowEvidenceStatus = 'observed' | 'estimated' | 'proxy' | 'illustrative'

export type FlowConfidence = 'high' | 'medium' | 'low'

export type FlowType =
  | 'production'
  | 'import'
  | 'export'
  | 'processing'
  | 'distribution'
  | 'retail'
  | 'foodservice'
  | 'household'
  | 'waste'
  | 'circular_return'

export type FlowRecord = {
  source: string
  target: string
  value: number
  label?: string
  note?: string
  commodityGroup?: string
  flowType?: FlowType
  observedOrEstimated?: FlowEvidenceStatus
  confidence?: FlowConfidence
  year?: number
  frequency?: string
  sourceRef?: string
  lastVerified?: string
}

export type FlowDatasetStatus = {
  overallEvidenceStatus: FlowEvidenceStatus
  coverage: string
  limitations: string[]
  nextDataNeeds: string[]
}

export type FlowDataset = {
  country: string
  title: string
  description: string
  unit: string
  schemaVersion?: string
  lastUpdated?: string
  decisionReadiness?: 'prototype' | 'internal' | 'decision-ready'
  methodology?: string
  status?: FlowDatasetStatus
  flows: FlowRecord[]
}

/** Registered agricultural foretak counted per kommune (Landbruksdirektoratet). */
export type Farm = {
  municipalityCode: string
  name: string
  foretak: number
  coordinates: [number, number]
}

export const AQUACULTURE_COLORS: Record<AquacultureProductionType, string> = {
  matfisk: '#0891B2',
  settefisk: '#8B5CF6',
  stamfisk: '#EC4899',
  shellfish: '#F59E0B',
  seaweed: '#10B981',
  other: '#6B7280',
}

export const PORT_COLORS: Record<PortType, string> = {
  'fishing-harbour': '#2563EB',
  'port-facility': '#0D9488',
}

export type PropertyType = 'warehouse' | 'retail' | 'office' | 'production' | 'logistics'

export const PROPERTY_COLORS: Record<PropertyType, string> = {
  warehouse: '#F97316',
  retail: '#22C55E',
  production: '#3B82F6',
  logistics: '#A855F7',
  office: '#6B7280',
}

export const LOGISTICS_HUB_COLOR = '#9333EA'

export const FARMS_COLOR = '#65A30D'
