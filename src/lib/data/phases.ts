import type { Phase } from '../types'

export const phases: Phase[] = [
  {
    id: 'fase-1',
    name: 'Orientering',
    weeks: 'Uke 1-2',
    items: [
      'Strukturere alt underlag',
      'Droftingsmote med Cathrine',
      'Definere scope og avgrensning for Food Systems TG',
      'Lage TG Charter (1 side)',
    ],
    status: 'pagar',
  },
  {
    id: 'fase-2',
    name: 'Innsikt og kartlegging',
    weeks: 'Uke 3-6',
    items: [
      'Desk research: nordisk matpolitikk, selvforsyningsgrad, markedsstruktur',
      'Aktorkartlegging med survey',
      'Regulatorisk kartlegging per land',
      'Identifisere parallellprosesser og pagaende initiativer',
    ],
    status: 'ikke-startet',
  },
  {
    id: 'fase-3',
    name: 'Analyse og syntese',
    weeks: 'Uke 7-10',
    items: [
      'Systemkart og flaskehalser',
      'Identifisere transition-levers',
      'Concept note med partnere',
    ],
    status: 'ikke-startet',
  },
  {
    id: 'fase-4',
    name: 'Leveranse',
    weeks: 'Uke 11-14',
    items: [
      'Whitepaper / innsiktsrapport',
      'Executive brief',
      'Roadmap for videre arbeid',
      'Evaluering av nordisk merverdi (juni)',
    ],
    status: 'ikke-startet',
  },
]
