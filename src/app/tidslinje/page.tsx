import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getApplications } from '@/lib/queries/project'

export default async function TidslinjePage() {
  const applications = await getApplications()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Tidslinje</h1>
        <p className="text-sm text-stone-400 mt-1">Soknader og nokkelhendelsr</p>
      </div>

      <div className="space-y-4">
        {applications.map(app => (
          <Card key={app.id}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-semibold text-stone-800">{app.title}</h3>
                <p className="text-xs text-stone-400 mt-0.5">{app.year}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Budsjett</p>
                <p className="text-stone-700">{app.budget}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Scope</p>
                <p className="text-stone-700">{app.scope}</p>
              </div>
            </div>

            {app.partners.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Partnere</p>
                <div className="flex flex-wrap gap-1.5">
                  {app.partners.map(p => (
                    <span key={p} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {app.phases.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Faser</p>
                <div className="space-y-1">
                  {app.phases.map((phase, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-stone-400 font-mono w-10">M {phase.months}</span>
                      <span className="text-stone-600">{phase.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card title="De 4 Transition Groups (2026)">
        <div className="grid grid-cols-2 gap-2">
          {[
            'Corporate Transition',
            'Food Systems',
            'Circular Textile',
            'Circular Cities',
          ].map((tg, i) => (
            <div
              key={tg}
              className={`text-sm px-3 py-2 rounded-lg border ${
                i === 1
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 font-medium'
                  : 'border-stone-200 text-stone-500'
              }`}
            >
              {tg}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
