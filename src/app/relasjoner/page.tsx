import type { Metadata } from 'next'
import {
  getBusinessRelationships,
  getBusinessRelationshipStats,
} from '@/lib/queries/relationships'
import { RelasjonerContent } from './RelasjonerContent'

export const metadata: Metadata = {
  title: 'Relasjoner — Food Systems 2026',
  description: 'Leverandørkjeder og forretningsforbindelser mellom selskaper',
}

export default async function RelasjonerPage() {
  const [relationships, stats] = await Promise.all([
    getBusinessRelationships(),
    getBusinessRelationshipStats(),
  ])

  const rows = relationships.map(r => ({
    id: r.id,
    relationshipType: r.relationshipType,
    description: r.description,
    sector: r.sector,
    estimatedValue: r.estimatedValue,
    source: r.source,
    fromCompany: {
      id: r.fromCompany.id,
      name: r.fromCompany.name,
    },
    toCompany: {
      id: r.toCompany.id,
      name: r.toCompany.name,
    },
    selfDealing:
      r.relationshipType === 'self-dealing' || r.fromCompanyId === r.toCompanyId,
  }))

  return <RelasjonerContent relationships={rows} stats={stats} />
}
