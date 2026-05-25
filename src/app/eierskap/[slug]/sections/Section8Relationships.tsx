import Link from 'next/link'
import type { KonsernRelationships } from '@/lib/queries/konsern'
import { RELATIONSHIP_TYPE_LABEL } from './labels'

function RelationshipList({
  items,
  direction,
}: {
  items: Array<{ counterpartyName: string; counterpartyId: string | null; relationshipType: string; description: string | null }>
  direction: 'outgoing' | 'incoming'
}) {
  if (items.length === 0) return <p className="text-sm text-stone-400 italic">Ingen</p>
  return (
    <ul className="space-y-2">
      {items.map((rel, i) => (
        <li key={i} className="flex flex-col gap-0.5 px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded border ${
              direction === 'outgoing'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {RELATIONSHIP_TYPE_LABEL[rel.relationshipType] ?? rel.relationshipType}
            </span>
            {rel.counterpartyId ? (
              <Link
                href={`/selskap/${rel.counterpartyId}`}
                className="font-medium text-emerald-700 hover:underline"
              >
                {rel.counterpartyName}
              </Link>
            ) : (
              <span className="font-medium text-stone-800">{rel.counterpartyName}</span>
            )}
          </div>
          {rel.description && (
            <p className="text-stone-500 text-xs">{rel.description}</p>
          )}
        </li>
      ))}
    </ul>
  )
}

export function Section8Relationships({ relationships }: { relationships: KonsernRelationships }) {
  const { outgoingExternal, incomingExternal, intraKonsern } = relationships
  const hasAny = outgoingExternal.length > 0 || incomingExternal.length > 0 || intraKonsern.length > 0

  if (!hasAny) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Forretningsrelasjoner</h2>
        <p className="text-sm text-stone-400 italic">Ingen forretningsrelasjoner registrert</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-3">Forretningsrelasjoner</h2>
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">
            Utgående til eksterne aktører ({outgoingExternal.length})
          </h3>
          <RelationshipList items={outgoingExternal} direction="outgoing" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">
            Innkommende fra eksterne ({incomingExternal.length})
          </h3>
          <RelationshipList items={incomingExternal} direction="incoming" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
            Innenfor konsernet ({intraKonsern.length})
            {intraKonsern.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200">
                markedsmakt-relevant
              </span>
            )}
          </h3>
          {intraKonsern.length === 0 ? (
            <p className="text-sm text-stone-400 italic">Ingen</p>
          ) : (
            <ul className="space-y-2">
              {intraKonsern.map((rel, i) => (
                <li key={i} className="flex flex-col gap-0.5 px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-1.5 py-0.5 rounded border bg-rose-100 text-rose-700 border-rose-200">
                      {RELATIONSHIP_TYPE_LABEL[rel.relationshipType] ?? rel.relationshipType}
                    </span>
                    <span className="text-stone-700">
                      <span className="font-medium">{rel.fromCompanyName}</span>
                      <span className="text-stone-400 mx-1">&rarr;</span>
                      <span className="font-medium">{rel.toCompanyName}</span>
                    </span>
                  </div>
                  {rel.description && (
                    <p className="text-rose-600 text-xs">{rel.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
