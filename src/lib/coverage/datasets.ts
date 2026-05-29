import type { DatasetSpec } from './types'

export const DATASETS: DatasetSpec[] = [
  {
    id: 'produksjonstilskudd',
    label: 'Produksjonstilskudd (Landbruksdirektoratet)',
    model: 'subsidy',
    presentedAs: 'no',
    fixedCountries: ['NO'],
  },
  {
    id: 'leveransedata',
    label: 'Leveransevolum (Landbruksdirektoratet)',
    model: 'deliveryVolume',
    presentedAs: 'no',
    fixedCountries: ['NO'],
  },
  {
    id: 'selskaps-finanser',
    label: 'Selskapsfinanser (kuratert graf)',
    model: 'companyFinancial',
    presentedAs: 'no',
    fixedCountries: ['NO'],
  },
  {
    id: 'selvforsyning-nordisk',
    label: 'Selvforsyningsgrad (presentert nordisk)',
    model: 'countryMetric',
    metricType: 'selfSufficiency',
    presentedAs: 'nordic',
  },
  {
    id: 'soya-sporbarhet-dk',
    label: 'Soya-sporbarhet (IFRO, Danmark)',
    model: 'countryMetric',
    metricType: 'feedImportTraceability',
    presentedAs: 'no',
  },
]
