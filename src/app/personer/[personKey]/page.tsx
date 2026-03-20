import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { getPersonByKey } from '@/lib/queries/persons'
import { RoleTimeline } from '@/components/charts/RoleTimeline'

export default async function PersonPage({ params }: { params: Promise<{ personKey: string }> }) {
  const { personKey } = await params
  const person = await getPersonByKey(personKey)
  if (!person) return notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-lg font-bold text-stone-500 shrink-0">
          {person.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{person.name}</h1>
          <p className="text-sm text-stone-400 mt-1">{person.roles.length} roller</p>
          {person.linkedInUrl && (
            <a href={person.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-700 hover:underline mt-1 inline-block">
              LinkedIn &rarr;
            </a>
          )}
        </div>
      </div>

      {person.biography && (
        <Card title="Biografi">
          <p className="text-sm text-stone-700 leading-relaxed">{person.biography}</p>
        </Card>
      )}

      <Card title="Roller">
        <RoleTimeline roles={person.roles} />
        <div className="mt-4 space-y-2">
          {person.roles.map((role, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
              <div>
                <Link href={`/selskap/${role.companyId}`} className="text-sm font-medium text-emerald-700 hover:underline">
                  {role.companyName}
                </Link>
                <span className="ml-2 text-xs text-stone-400">{role.role}</span>
              </div>
              <span className="text-xs text-stone-400 tabular-nums">
                {role.fromYear ?? '?'}&ndash;{role.toYear ?? 'na'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {person.affiliations.length > 0 && (
        <Card title="Tilknytninger">
          <div className="flex flex-wrap gap-2">
            {person.affiliations.map(a => (
              <span key={a} className="text-xs px-2 py-1 rounded-lg bg-stone-100 text-stone-600 border border-stone-200">{a}</span>
            ))}
          </div>
        </Card>
      )}

      {person.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {person.tags.map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}
