import type { CountryConfig } from '../countries'

export const icelandConfig: CountryConfig = {
  code: 'is',
  name: 'Island',
  center: [65, -18],
  zoom: 6,
  selfSufficiency: 0.50,
  municipalityIdProp: 'sveitarfelagsnumer',
  municipalityNameProp: 'sveitarfelagsnafn',
  chains: {
    bonus: { id: 'bonus', name: 'Bónus', color: '#E3000B', type: 'discount', parent: 'Hagar' },
    hagkaup: { id: 'hagkaup', name: 'Hagkaup', color: '#E3000B', type: 'hypermarket', parent: 'Hagar' },
    kronan: { id: 'kronan', name: 'Krónan', color: '#00529B', type: 'supermarket', parent: 'Festi' },
    netto: { id: 'netto', name: 'Nettó', color: '#00843D', type: 'discount', parent: 'Samkaup' },
    'k-s': { id: 'k-s', name: 'KS', color: '#00843D', type: 'supermarket', parent: 'Samkaup' },
    'kostnadarverslun': { id: 'kostnadarverslun', name: 'Kostnað.verslun', color: '#00843D', type: 'discount', parent: 'Samkaup' },
  },
  chainParents: {
    'b-nus': 'Hagar',
    hagkaup: 'Hagar',
    '10-11': 'Hagar',
    'kr-nan': 'Festi',
    'kj-rb-in': 'Festi',
    n1: 'Festi',
    nett: 'Samkaup',
    kramb: 'Samkaup',
  },
  parentColors: {
    Hagar: '#E3000B',
    Festi: '#00529B',
    Samkaup: '#00843D',
  },
  processingCompanies: [],
  dataFiles: {
    stores: 'stores.json',
    municipalities: 'municipalities.json',
    boundaries: 'municipalities.geojson',
  },
  dataSources: [
    {
      layer: 'Butikker',
      file: 'stores.json',
      records: 'OSM Overpass',
      source: 'OpenStreetMap',
      updated: '2026-03',
      limitations: 'OSM-dekning varierer, kan mangle enkelte butikker på Island',
    },
  ],
}
