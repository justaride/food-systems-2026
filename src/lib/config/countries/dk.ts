import type { CountryConfig } from '../countries'

export const denmarkConfig: CountryConfig = {
  code: 'dk',
  name: 'Danmark',
  center: [56, 10],
  zoom: 7,
  selfSufficiency: 3.0,
  municipalityIdProp: 'kommunekode',
  municipalityNameProp: 'kommunenavn',
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
