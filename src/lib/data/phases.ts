import type { Phase } from '../types'

export const phases: Phase[] = [
  {
    id: 'fase-1',
    name: 'Mandat og struktur',
    weeks: 'Sprint 0',
    items: [
      'TG Charter v0.1',
      'Decision Log',
      'Mandatstruktur for Food Systems TG',
      'Arbeidsgrunnlag for scope-møte',
    ],
    status: 'fullfort',
  },
  {
    id: 'fase-2',
    name: 'Evidence og claims',
    weeks: 'Uke 1-3',
    items: [
      'Source Shortlist v0.1',
      'Evidence Matrix v0.1',
      'Claim Register v0.1',
      'Nordisk kontekst og kildespor',
    ],
    status: 'fullfort',
  },
  {
    id: 'fase-3',
    name: 'Scope og pilotvalg',
    weeks: 'Uke 4-5',
    items: [
      'Sporbrief A/B/C',
      'Pilotclaims for A og B',
      'Decision memo Food TG scope v0.1',
      'Aktører som må validere for scope-lock',
    ],
    status: 'pagar',
  },
  {
    id: 'fase-4',
    name: 'Aktortesting og roadmap',
    weeks: 'Mai-juni 2026',
    items: [
      'Teste 1-2 pilotspor med relevante aktorer',
      'Validere datakrav og regulatoriske barrierer',
      'Lage roadmap 2026-2029',
      'Insight Pack v0.1 til scope-mote',
    ],
    status: 'ikke-startet',
  },
]
