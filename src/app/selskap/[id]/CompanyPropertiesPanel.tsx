import Link from 'next/link'

type OwnedProperty = {
  id: string
  propertyType: string
  address: string | null
  municipality: string | null
  county: string | null
  sqMeters: number | null
  selfLeased: boolean
  tenantCompany: { id: string; name: string } | null
}

type TenantProperty = {
  id: string
  propertyType: string
  address: string | null
  municipality: string | null
  county: string | null
  sqMeters: number | null
  selfLeased: boolean
  company: { id: string; name: string }
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  warehouse: 'Lager',
  retail: 'Butikk',
  office: 'Kontor',
  production: 'Produksjon',
  logistics: 'Logistikk',
}

const PROPERTY_TYPE_STYLES: Record<string, string> = {
  warehouse: 'bg-orange-50 text-orange-700 border-orange-200',
  retail: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  office: 'bg-stone-100 text-stone-600 border-stone-200',
  production: 'bg-blue-50 text-blue-700 border-blue-200',
  logistics: 'bg-purple-50 text-purple-700 border-purple-200',
}

function TypePill({ type }: { type: string }) {
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded border ${
        PROPERTY_TYPE_STYLES[type] ?? PROPERTY_TYPE_STYLES.office
      }`}
    >
      {PROPERTY_TYPE_LABELS[type] ?? type}
    </span>
  )
}

function formatSqm(sqm: number | null) {
  if (sqm == null) return '—'
  return `${sqm.toLocaleString('no')} m²`
}

export function CompanyPropertiesPanel({
  owned,
  tenant,
}: {
  owned: OwnedProperty[]
  tenant: TenantProperty[]
}) {
  const ownedSqm = owned.reduce((s, p) => s + (p.sqMeters ?? 0), 0)
  const tenantSqm = tenant.reduce((s, p) => s + (p.sqMeters ?? 0), 0)
  const selfLeasedOwned = owned.filter(p => p.selfLeased).length
  const selfLeasedPct = owned.length > 0 ? (selfLeasedOwned / owned.length) * 100 : 0

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Eier ut</p>
          <p className="text-lg font-bold text-stone-900">{owned.length}</p>
          {ownedSqm > 0 && (
            <p className="text-[10px] text-stone-500 tabular-nums">
              {Math.round(ownedSqm).toLocaleString('no')} m²
            </p>
          )}
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Leier inn</p>
          <p className="text-lg font-bold text-stone-900">{tenant.length}</p>
          {tenantSqm > 0 && (
            <p className="text-[10px] text-stone-500 tabular-nums">
              {Math.round(tenantSqm).toLocaleString('no')} m²
            </p>
          )}
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Selvleie</p>
          <p className="text-lg font-bold text-stone-900">{selfLeasedOwned}</p>
          {owned.length > 0 && (
            <p className="text-[10px] text-stone-500">{selfLeasedPct.toFixed(0)}% av eide</p>
          )}
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Totalt</p>
          <p className="text-lg font-bold text-stone-900">{owned.length + tenant.length}</p>
          <p className="text-[10px] text-stone-500">eiendomsbevegelser</p>
        </div>
      </div>

      {owned.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Eier ut ({owned.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 text-stone-400 font-medium">Type</th>
                  <th className="text-left py-2 text-stone-400 font-medium">Adresse</th>
                  <th className="text-left py-2 text-stone-400 font-medium">Kommune</th>
                  <th className="text-right py-2 text-stone-400 font-medium">Areal</th>
                  <th className="text-left py-2 text-stone-400 font-medium">Leietaker</th>
                  <th className="text-left py-2 text-stone-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {owned.map(p => (
                  <tr key={p.id} className="border-b border-stone-100">
                    <td className="py-2"><TypePill type={p.propertyType} /></td>
                    <td className="py-2 text-stone-700">{p.address ?? '—'}</td>
                    <td className="py-2 text-stone-700">
                      {p.municipality ?? '—'}
                      {p.county ? <span className="text-stone-400 ml-1">({p.county})</span> : null}
                    </td>
                    <td className="text-right py-2 text-stone-700 tabular-nums">
                      {formatSqm(p.sqMeters)}
                    </td>
                    <td className="py-2">
                      {p.tenantCompany ? (
                        <Link
                          href={`/selskap/${p.tenantCompany.id}`}
                          className={p.selfLeased ? 'text-rose-700 hover:underline' : 'text-emerald-700 hover:underline'}
                        >
                          {p.tenantCompany.name}
                        </Link>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      {p.selfLeased ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Selvleie
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
                          Ekstern
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tenant.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Leier inn ({tenant.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 text-stone-400 font-medium">Type</th>
                  <th className="text-left py-2 text-stone-400 font-medium">Adresse</th>
                  <th className="text-left py-2 text-stone-400 font-medium">Kommune</th>
                  <th className="text-right py-2 text-stone-400 font-medium">Areal</th>
                  <th className="text-left py-2 text-stone-400 font-medium">Utleier</th>
                  <th className="text-left py-2 text-stone-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tenant.map(p => (
                  <tr key={p.id} className="border-b border-stone-100">
                    <td className="py-2"><TypePill type={p.propertyType} /></td>
                    <td className="py-2 text-stone-700">{p.address ?? '—'}</td>
                    <td className="py-2 text-stone-700">
                      {p.municipality ?? '—'}
                      {p.county ? <span className="text-stone-400 ml-1">({p.county})</span> : null}
                    </td>
                    <td className="text-right py-2 text-stone-700 tabular-nums">
                      {formatSqm(p.sqMeters)}
                    </td>
                    <td className="py-2">
                      <Link
                        href={`/selskap/${p.company.id}`}
                        className={p.selfLeased ? 'text-rose-700 hover:underline' : 'text-emerald-700 hover:underline'}
                      >
                        {p.company.name}
                      </Link>
                    </td>
                    <td className="py-2">
                      {p.selfLeased ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Selvleie
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
                          Ekstern
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-stone-100">
        <Link
          href="/eiendommer"
          className="text-xs text-emerald-700 hover:underline inline-flex items-center gap-1"
        >
          Se alle eiendommer på tvers av kartlagte selskaper &rarr;
        </Link>
      </div>
    </div>
  )
}
