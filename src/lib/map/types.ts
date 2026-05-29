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
}

export type ProcessingPlantType = 'dairy' | 'meat' | 'seafood' | 'produce' | 'grain' | 'beverage'

export type ProcessingPlant = {
  id: string
  name: string
  company: string
  type: ProcessingPlantType
  coordinates: [number, number]
  capacity?: string
  products?: string[]
  employees?: number
}

export type PortType = 'fishing' | 'cargo' | 'mixed' | 'aquaculture'

export type Port = {
  id: string
  name: string
  type: PortType
  coordinates: [number, number]
  annualTonnage?: number
  primaryCatch?: string[]
  facilities?: string[]
  region: string
}

export type LogisticsHub = {
  id: string
  name: string
  owner: string
  type: string
  capacity?: string
  role: string
  storesServed?: number
  city: string
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

export type FarmType = 'grain' | 'vegetables' | 'dairy' | 'livestock' | 'mixed' | 'other'

export type Farm = {
  id: string
  municipalityCode: string
  type: FarmType
  productionArea?: number
  products: string[]
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
  fishing: '#2563EB',
  cargo: '#6B7280',
  mixed: '#14B8A6',
  aquaculture: '#0D9488',
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

export const FARM_COLORS: Record<FarmType, string> = {
  grain: '#CA8A04',
  vegetables: '#65A30D',
  dairy: '#0EA5E9',
  livestock: '#B45309',
  mixed: '#4D7C0F',
  other: '#6B7280',
}
