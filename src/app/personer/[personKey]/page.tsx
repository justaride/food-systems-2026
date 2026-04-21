import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { getPersonByKey } from '@/lib/queries/persons'
import { RoleTimeline } from '@/components/charts/RoleTimeline'
import {
  categorizeRole,
  normalizeRoleLabel,
  ROLE_CATEGORIES,
  type RoleCategory,
} from '@/lib/role-category'

type PersonRole = {
  companyId: string | null
  companyName: string
  role: string
  fromYear: number | null
  toYear: number | null
}

function deriveAutoBio(person: {
  name: string
  roles: PersonRole[]
  affiliations: string[]
}) {
  if (person.roles.length === 0) return null

  const roleCounts = new Map<RoleCategory, number>()
  for (const role of person.roles) {
    const cat = categorizeRole(role.role)
    roleCounts.set(cat, (roleCounts.get(cat) ?? 0) + 1)
  }

  const primary = [...roleCounts.entries()]
    .filter(([key]) => key !== 'annet')
    .sort((a, b) => b[1] - a[1])[0]?.[0]
  const companies = [...new Set(person.roles.map(r => r.companyName))]
  const topCompanies = companies.slice(0, 3).join(', ')
  const rest = companies.length > 3 ? ` og ${companies.length - 3} til` : ''
  const primaryLabel = primary ? ROLE_CATEGORIES[primary].label.toLowerCase() : 'styreverv'

  const years = person.roles
    .map(r => r.fromYear)
    .filter((y): y is number => typeof y === 'number')
  const earliest = years.length ? Math.min(...years) : null

  const pieces: string[] = []
  pieces.push(
    `${person.name} har ${person.roles.length} registrert${person.roles.length === 1 ? '' : 'e'} ${primaryLabel}-verv hos ${topCompanies}${rest}.`
  )
  if (earliest && earliest < 2024) {
    pieces.push(`Eldste registrerte rolle tilbake til ${earliest}.`)
  }
  if (person.affiliations.length > 0) {
    pieces.push(`Tilknyttet ${person.affiliations.slice(0, 3).join(', ')}.`)
  }
  if (person.roles.length > 1) {
    pieces.push('Opptrer som kryssstyremedlem i kartleggingen.')
  }
  return pieces.join(' ')
}

export default async function PersonPage({ params }: { params: Promise<{ personKey: string }> }) {
  const { personKey } = await params
  const person = await getPersonByKey(personKey)
  if (!person) return notFound()

  const autoBio = person.biography ? null : deriveAutoBio(person)

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

      {person.biography ? (
        <Card title="Biografi">
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{person.biography}</p>
        </Card>
      ) : autoBio ? (
        <Card title="Biografi (auto-generert)">
          <p className="text-sm text-stone-700 leading-relaxed">{autoBio}</p>
          <p className="mt-2 text-[11px] text-stone-400">
            Utledet fra registrerte roller — redigerbar biografi kan legges til i PersonProfile-tabellen.
          </p>
        </Card>
      ) : null}

      <Card title="Roller">
        <RoleTimeline roles={person.roles} />
        <div className="mt-4 space-y-2">
          {person.roles.map((role: PersonRole, i) => {
            const meta = ROLE_CATEGORIES[categorizeRole(role.role)]
            return (
              <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 last:border-0">
                <div className="min-w-0 flex-1">
                  {role.companyId ? (
                    <Link href={`/selskap/${role.companyId}`} className="text-sm font-medium text-emerald-700 hover:underline">
                      {role.companyName}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-stone-800">{role.companyName}</span>
                  )}
                  <span className="ml-2 text-xs text-stone-500">{normalizeRoleLabel(role.role)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${meta.badgeClass}`}
                    title={role.role}
                  >
                    {meta.label}
                  </span>
                  <span className="text-xs text-stone-400 tabular-nums">
                    {role.fromYear ?? '?'}&ndash;{role.toYear ?? 'na'}
                  </span>
                </div>
              </div>
            )
          })}
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
