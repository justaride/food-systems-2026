import type { CountryConfig } from '../countries'

export const finlandConfig: CountryConfig = {
  code: 'fi',
  name: 'Finland',
  center: [64, 26],
  zoom: 5,
  selfSufficiency: 0.80,
  municipalityIdProp: 'kuntanumero',
  municipalityNameProp: 'kuntanimi',
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
