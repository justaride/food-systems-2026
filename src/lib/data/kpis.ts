import type { KPI } from '../types'

export const kpis: KPI[] = [
  {
    id: 'coalition-power',
    name: 'Coalition Power',
    description: '"Must-win stakeholders" aktivt engasjert',
  },
  {
    id: 'decisions-taken',
    name: 'Decisions Taken',
    description: 'Formelle beslutninger logget',
  },
  {
    id: 'pilots-in-motion',
    name: 'Pilots in Motion',
    description: 'Piloter startet/fullfort/skalert',
  },
  {
    id: 'adoption-mechanisms',
    name: 'Adoption Mechanisms',
    description: 'Innkjopskrav/standarder/policy aktivert',
  },
  {
    id: 'capital-mobilised',
    name: 'Capital Mobilised',
    description: 'Finansiering/investeringer utlost',
  },
]
