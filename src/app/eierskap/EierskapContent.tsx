'use client'

import { Card } from '@/components/ui/Card'
import { OwnershipTreeDiagram } from '@/components/charts/OwnershipTreeDiagram'
import type { OwnershipMapData } from '@/lib/queries/ownership'

type Props = {
  data: OwnershipMapData
}

export function EierskapContent({ data }: Props) {
  const { trees, totalCompanies, totalRelationships } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Eierskap</h1>
        <p className="text-sm text-stone-500 mt-1">Konsernstrukturer og eierskapsforhold</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="card">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Konserntraer</p>
          <p className="text-lg font-bold text-stone-900">{trees.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Selskaper</p>
          <p className="text-lg font-bold text-stone-900">{totalCompanies}</p>
        </div>
        <div className="card">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Eierforhold</p>
          <p className="text-lg font-bold text-stone-900">{totalRelationships}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {trees.map(tree => (
          <Card key={tree.rootId} title={tree.rootName}>
            <OwnershipTreeDiagram tree={tree} />
          </Card>
        ))}
      </div>
    </div>
  )
}
