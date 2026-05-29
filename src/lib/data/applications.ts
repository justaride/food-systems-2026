import type { Application } from '../types'

export const applications: Application[] = [
  {
    id: 'ni-2024',
    title: 'Unleashing the Potential of Circular Food Systems in the Nordic Region',
    year: 2024,
    status: 'avslatt',
    budget: '4 MNOK (2M NI + 2M egenandel)',
    scope: 'Fullskala nordisk materialstrømanalyse, 10+ sirkulære løsninger, Transition Group med 20+ medlemmer',
    partners: [
      'Natural State (NO)',
      'Center for Cirkulær Økonomi (DK)',
      'Linköping University (SE)',
      'University of Eastern Finland (FI)',
      'Iceland Ocean Cluster (IS)',
      'Nalik Ventures (GL/DK)',
      'Faroese Environment Agency (FO)',
      'Institute of Transition (SE)',
      'NMBU (NO)',
    ],
    phases: [
      { name: 'Mapping og metodeutvikling', months: '1-4' },
      { name: 'Materialstrømanalyser', months: '5-8' },
      { name: 'Syntese og implementering', months: '9-12' },
    ],
  },
  {
    id: 'nch-2025',
    title: 'Nordic Circular Hotspot transition groups 2025-2026 (P25013)',
    year: 2025,
    status: 'innvilget',
    budget: 'NOK 3M totalt (NI 1.5M + konsortium 1.5M in-kind). WP3 Food Systems: NOK 500k (NI 250k + 250k in-kind). Kontrakt 201-2503-P25013, signert 16.10.2025, periode 08.08.2025–31.07.2026',
    scope: 'Fire transition groups: Cities (WP1), Corporate/Business (WP2), Food Systems (WP3, lead Natural State), Textile (WP4). Leveranse per TG: stakeholder-rekruttering, aktivitetsplan, workshops, strategic roadmap, offentlig presentasjon, next-steps-plan. Food Systems 2026 whitepaper er WP3-leveransen.',
    partners: [
      'Nordic Circular Hotspot AS (owner)',
      'Natural State AS (project manager + WP1/WP3 lead)',
      'Cradlenet SE (WP2 lead)',
      'Lifestyle and Design Cluster DK (WP4 lead)',
    ],
    phases: [
      { name: 'M1 Recruit and engage stakeholders', months: '1-2' },
      { name: 'M2 Define contextual activity plan', months: '2-4' },
      { name: 'M3 Execute workshops', months: '3-8' },
      { name: 'M4 Write strategic roadmap', months: '6-10' },
      { name: 'M5 Publish roadmap + public event', months: '10-11' },
      { name: 'M6 Next steps and plan for further action', months: '11-12' },
    ],
  },
  {
    id: 'oslo-2025',
    title: 'Fagmiljø og entreprenørskapsarena for innovative urbane matsystemer (Oslo)',
    year: 2025,
    status: 'pagaende',
    budget: '1M tilskudd (2M totalt med egenandel)',
    scope: 'Lokalt/urbant sirkulært matsystem i Gamlebyen, Oslo',
    partners: [
      'Natural State',
      'Gamlebyen Loft',
    ],
    phases: [],
  },
]
