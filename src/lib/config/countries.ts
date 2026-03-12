import type { StoreType } from '@/lib/map/types'

export type CountryCode = 'no' | 'se' | 'dk' | 'fi' | 'is'

export type ChainConfig = {
  id: string
  name: string
  color: string
  type: StoreType
  parent: string
}

export type DataSource = {
  layer: string
  file: string
  records: string
  source: string
  sourceUrl?: string
  updated: string
  limitations: string
  reproduce?: string
}

export type CountryConfig = {
  code: CountryCode
  name: string
  center: [number, number]
  zoom: number
  selfSufficiency: number
  municipalityIdProp: string
  municipalityNameProp: string
  chains: Record<string, ChainConfig>
  chainParents: Record<string, string>
  parentColors: Record<string, string>
  processingCompanies: string[]
  dataSources: DataSource[]
  dataFiles: {
    stores: string
    municipalities: string
    boundaries: string
    aquaculture?: string
    processing?: string
    ports?: string
    logistics?: string
  }
}

export { norwayConfig } from './countries/no'

const configs: Record<CountryCode, () => Promise<{ default: CountryConfig }>> = {
  no: () => import('./countries/no').then(m => ({ default: m.norwayConfig })),
  se: () => import('./countries/se').then(m => ({ default: m.swedenConfig })),
  dk: () => import('./countries/dk').then(m => ({ default: m.denmarkConfig })),
  fi: () => import('./countries/fi').then(m => ({ default: m.finlandConfig })),
  is: () => import('./countries/is').then(m => ({ default: m.icelandConfig })),
}

export async function getCountryConfig(code: CountryCode): Promise<CountryConfig> {
  const loader = configs[code]
  if (!loader) throw new Error(`Unknown country code: ${code}`)
  const mod = await loader()
  return mod.default
}

export function isValidCountryCode(code: string): code is CountryCode {
  return ['no', 'se', 'dk', 'fi', 'is'].includes(code)
}

export const COUNTRY_LIST: { code: CountryCode; name: string; flag: string }[] = [
  { code: 'no', name: 'Norge', flag: '🇳🇴' },
  { code: 'se', name: 'Sverige', flag: '🇸🇪' },
  { code: 'dk', name: 'Danmark', flag: '🇩🇰' },
  { code: 'fi', name: 'Finland', flag: '🇫🇮' },
  { code: 'is', name: 'Island', flag: '🇮🇸' },
]
