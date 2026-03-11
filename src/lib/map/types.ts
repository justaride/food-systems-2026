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

export type MapLayer = 'stores' | 'boundaries'

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
}

export type ChainConfig = {
  id: ChainId
  name: string
  color: string
  type: StoreType
  parent: string
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
