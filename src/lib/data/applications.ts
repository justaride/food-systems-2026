import type { Application } from '../types'

export const applications: Application[] = [
  {
    id: 'ni-2024',
    title: 'Unleashing the Potential of Circular Food Systems in the Nordic Region',
    year: 2024,
    status: 'avslatt',
    budget: '4 MNOK (2M NI + 2M egenandel)',
    scope: 'Fullskala nordisk materialstromanalyse, 10+ sirkulaere losninger, Transition Group med 20+ medlemmer',
    partners: [
      'Natural State (NO)',
      'Center for Cirkulaer Okonomi (DK)',
      'Linkoping University (SE)',
      'University of Eastern Finland (FI)',
      'Iceland Ocean Cluster (IS)',
      'Nalik Ventures (GL/DK)',
      'Faroese Environment Agency (FO)',
      'Institute of Transition (SE)',
      'NMBU (NO)',
    ],
    phases: [
      { name: 'Mapping og metodeutvikling', months: '1-4' },
      { name: 'Materialstromanalyser', months: '5-8' },
      { name: 'Syntese og implementering', months: '9-12' },
    ],
  },
  {
    id: 'nch-2025',
    title: 'NCH 2025 - Forprosjekt',
    year: 2025,
    status: 'innvilget',
    budget: 'Del av NCH 2025-budsjett',
    scope: 'Mulighetsstudie + aktorkartlegging + soknadsklar concept note',
    partners: [
      'Natural State / NCH',
      'Cradlenet (SE)',
      'LDCluster (DK)',
    ],
    phases: [],
  },
  {
    id: 'oslo-2025',
    title: 'Fagmiljo og entreprenorskapsarena for innovative urbane matsystemer (Oslo)',
    year: 2025,
    status: 'pagaende',
    budget: '1M tilskudd (2M totalt med egenandel)',
    scope: 'Lokalt/urbant sirkulaert matsystem i Gamlebyen, Oslo',
    partners: [
      'Natural State',
      'Gamlebyen Loft',
    ],
    phases: [],
  },
]
