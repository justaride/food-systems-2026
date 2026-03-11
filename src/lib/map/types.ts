export type StoreType = 'discount' | 'convenience' | 'supermarket' | 'hypermarket'

export type ChainId =
  | 'rema'
  | 'kiwi'
  | 'extra'
  | 'coop-prix'
  | 'bunnpris'
  | 'joker'
  | 'spar'
  | 'meny'
  | 'coop-mega'
  | 'coop-marked'
  | 'naerbutikken'
  | 'matkroken'
  | 'obs'

export type MapLayer = 'stores' | 'boundaries' | 'aquaculture' | 'processing' | 'ports' | 'desert' | 'vulnerability'

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
  chainId: ChainId
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

export type ChainConfig = {
  id: ChainId
  name: string
  color: string
  type: StoreType
  parent: string
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

export type ProcessingCompany = 'Nortura' | 'Tine' | 'BAMA' | 'Orkla' | 'Lerøy' | 'Mowi' | 'Other'

export type ProcessingPlant = {
  id: string
  name: string
  company: ProcessingCompany
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

export const NORWAY_CENTER: [number, number] = [65, 13]

export const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  rema: { id: 'rema', name: 'Rema 1000', color: '#E30613', type: 'discount', parent: 'Reitangruppen' },
  kiwi: { id: 'kiwi', name: 'Kiwi', color: '#4CAF50', type: 'discount', parent: 'NorgesGruppen' },
  extra: { id: 'extra', name: 'Extra', color: '#FFC107', type: 'discount', parent: 'Coop Norge' },
  'coop-prix': { id: 'coop-prix', name: 'Coop Prix', color: '#00529B', type: 'discount', parent: 'Coop Norge' },
  bunnpris: { id: 'bunnpris', name: 'Bunnpris', color: '#E91E63', type: 'discount', parent: 'Bunnpris AS' },
  joker: { id: 'joker', name: 'Joker', color: '#F44336', type: 'convenience', parent: 'NorgesGruppen' },
  spar: { id: 'spar', name: 'Spar', color: '#2E7D32', type: 'convenience', parent: 'NorgesGruppen' },
  meny: { id: 'meny', name: 'Meny', color: '#1565C0', type: 'supermarket', parent: 'NorgesGruppen' },
  'coop-mega': { id: 'coop-mega', name: 'Coop Mega', color: '#00529B', type: 'supermarket', parent: 'Coop Norge' },
  'coop-marked': { id: 'coop-marked', name: 'Coop Marked', color: '#00529B', type: 'convenience', parent: 'Coop Norge' },
  naerbutikken: { id: 'naerbutikken', name: 'Naerbutikken', color: '#795548', type: 'convenience', parent: 'NorgesGruppen' },
  matkroken: { id: 'matkroken', name: 'Matkroken', color: '#607D8B', type: 'convenience', parent: 'NorgesGruppen' },
  obs: { id: 'obs', name: 'Obs', color: '#00529B', type: 'hypermarket', parent: 'Coop Norge' },
}

export const ALL_CHAINS: ChainId[] = [
  'rema', 'kiwi', 'extra', 'coop-prix', 'bunnpris',
  'joker', 'spar', 'meny', 'coop-mega', 'coop-marked',
  'naerbutikken', 'matkroken', 'obs',
]

export const AQUACULTURE_COLORS: Record<AquacultureProductionType, string> = {
  matfisk: '#0891B2',
  settefisk: '#8B5CF6',
  stamfisk: '#EC4899',
  shellfish: '#F59E0B',
  seaweed: '#10B981',
  other: '#6B7280',
}

export const PROCESSING_COLORS: Record<ProcessingCompany, string> = {
  Nortura: '#DC2626',
  Tine: '#2563EB',
  BAMA: '#16A34A',
  Orkla: '#7C3AED',
  'Lerøy': '#0891B2',
  Mowi: '#0D9488',
  Other: '#6B7280',
}

export const PORT_COLORS: Record<PortType, string> = {
  fishing: '#2563EB',
  cargo: '#6B7280',
  mixed: '#14B8A6',
  aquaculture: '#0D9488',
}
