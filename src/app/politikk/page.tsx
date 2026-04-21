import type { Metadata } from 'next'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PolitikkContent, type PolicyLandscape } from './PolitikkContent'

export const metadata: Metadata = {
  title: 'Politikk — Food Systems 2026',
  description: 'Nordisk matpolitikk-sammenligning: sirkularitet, matsvinn, CO2-avgift, biogass og selvforsyning',
}

export default function PolitikkPage() {
  const jsonPath = path.join(
    process.cwd(),
    'public',
    'data',
    'food-systems',
    'policy-landscape.json'
  )
  const raw = readFileSync(jsonPath, 'utf-8')
  const data = JSON.parse(raw) as PolicyLandscape

  return <PolitikkContent data={data} />
}
