import type { CountryConfig } from '../countries'

export const swedenConfig: CountryConfig = {
  code: 'se',
  name: 'Sverige',
  center: [63, 16],
  zoom: 5,
  selfSufficiency: 0.50,
  municipalityIdProp: 'kommunkod',
  municipalityNameProp: 'kommunnamn',
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
