// Fargekategorier og labels for valueChainStage pa Company.
// Brukes som node-farger i interlock-grafen og som filter-pillerSektorer
// pa /styremedlemmer.

export type SectorKey =
  | 'retail'
  | 'processing'
  | 'seafood'
  | 'inputs'
  | 'logistics'
  | 'foodservice'
  | 'production'
  | 'circular'
  | 'research'
  | 'export-promotion'
  | 'unknown'

export type SectorMeta = {
  key: SectorKey
  label: string
  // hex color used by ForceGraph2D for the company nodes.
  nodeColor: string
  // Tailwind classes for the filter pill (active state).
  badgeClass: string
}

export const SECTORS: Record<SectorKey, SectorMeta> = {
  retail: {
    key: 'retail',
    label: 'Dagligvare',
    nodeColor: '#10b981', // emerald-500
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
  processing: {
    key: 'processing',
    label: 'Foredling',
    nodeColor: '#3b82f6', // blue-500
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
  },
  seafood: {
    key: 'seafood',
    label: 'Havbruk',
    nodeColor: '#06b6d4', // cyan-500
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-200',
  },
  inputs: {
    key: 'inputs',
    label: 'Innsatsvarer',
    nodeColor: '#f59e0b', // amber-500
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  logistics: {
    key: 'logistics',
    label: 'Logistikk',
    nodeColor: '#8b5cf6', // violet-500
    badgeClass: 'bg-violet-100 text-violet-900 border-violet-200',
  },
  foodservice: {
    key: 'foodservice',
    label: 'HoReCa',
    nodeColor: '#ec4899', // pink-500
    badgeClass: 'bg-pink-100 text-pink-900 border-pink-200',
  },
  production: {
    key: 'production',
    label: 'Produksjon',
    nodeColor: '#84cc16', // lime-500
    badgeClass: 'bg-lime-100 text-lime-900 border-lime-200',
  },
  circular: {
    key: 'circular',
    label: 'Sirkulaert',
    nodeColor: '#14b8a6', // teal-500
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-200',
  },
  research: {
    key: 'research',
    label: 'Forskning',
    nodeColor: '#64748b', // slate-500
    badgeClass: 'bg-slate-100 text-slate-900 border-slate-200',
  },
  'export-promotion': {
    key: 'export-promotion',
    label: 'Eksport',
    nodeColor: '#f97316', // orange-500
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-200',
  },
  unknown: {
    key: 'unknown',
    label: 'Uklassifisert',
    nodeColor: '#a8a29e', // stone-400
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
  },
}

export const SECTOR_ORDER: SectorKey[] = [
  'retail',
  'processing',
  'seafood',
  'inputs',
  'logistics',
  'foodservice',
  'production',
  'circular',
  'research',
  'export-promotion',
  'unknown',
]

export function sectorFromValueChainStage(stage: string | null | undefined): SectorKey {
  if (!stage) return 'unknown'
  const trimmed = stage.toLowerCase().trim()
  if (trimmed in SECTORS) return trimmed as SectorKey
  return 'unknown'
}
