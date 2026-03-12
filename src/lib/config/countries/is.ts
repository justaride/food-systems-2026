import type { CountryConfig } from '../countries'

export const icelandConfig: CountryConfig = {
  code: 'is',
  name: 'Island',
  center: [65, -18],
  zoom: 6,
  selfSufficiency: 0.50,
  municipalityIdProp: 'sveitarfelagsnumer',
  municipalityNameProp: 'sveitarfelagsnafn',
  chains: {},
  chainParents: {},
  parentColors: {},
  processingCompanies: [],
  dataFiles: {
    stores: 'stores.json',
    municipalities: 'municipalities.json',
    boundaries: 'municipalities.geojson',
  },
  dataSources: [],
}
