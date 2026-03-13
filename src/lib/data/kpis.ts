import type { KPI } from '../types'

export const kpis: KPI[] = [
  {
    id: 'coalition-power',
    name: 'Coalition Power',
    description: '"Must-win stakeholders" aktivt engasjert',
    current: '3',
    target: '8',
  },
  {
    id: 'decisions-taken',
    name: 'Decisions Taken',
    description: 'Formelle beslutninger logget',
    current: '2',
    target: '10',
  },
  {
    id: 'pilots-in-motion',
    name: 'Pilots in Motion',
    description: 'Piloter startet/fullfort/skalert',
    current: '0',
    target: '3',
  },
  {
    id: 'adoption-mechanisms',
    name: 'Adoption Mechanisms',
    description: 'Innkjopskrav/standarder/policy aktivert',
    current: '0',
    target: '2',
  },
  {
    id: 'capital-mobilised',
    name: 'Capital Mobilised',
    description: 'Finansiering/investeringer utlost',
    current: '0 NOK',
    target: '5M NOK',
  },
]
