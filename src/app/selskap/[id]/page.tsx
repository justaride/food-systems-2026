import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getCompanyById } from '@/lib/queries/companies'

export default async function SelskapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const company = await getCompanyById(id)
  if (!company) return notFound()

  const latestFinancial = company.financials[0]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-stone-900">{company.name}</h1>
          {company.ownershipType && (
            <StatusBadge status={company.ownershipType} />
          )}
        </div>
        <div className="flex gap-3 mt-1 text-sm text-stone-400">
          <span>Org.nr: {company.orgNr}</span>
          {company.hqCity && <span>· {company.hqCity}</span>}
          {company.founded && <span>· Stiftet {company.founded}</span>}
        </div>
        {company.naceDescription && (
          <p className="text-sm text-stone-500 mt-2">{company.naceDescription}</p>
        )}
      </div>

      {latestFinancial && (
        <Card title="Regnskap">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Omsetning</p>
              <p className="text-lg font-bold text-stone-900">
                {latestFinancial.revenueNok ? `${(Number(latestFinancial.revenueNok) / 1e9).toFixed(1)} mrd` : '\u2014'}
              </p>
              <p className="text-xs text-stone-400">{latestFinancial.year}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Driftsresultat</p>
              <p className="text-lg font-bold text-stone-900">
                {latestFinancial.operatingResult ? `${(Number(latestFinancial.operatingResult) / 1e6).toFixed(0)} MNOK` : '\u2014'}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Driftsmargin</p>
              <p className="text-lg font-bold text-stone-900">
                {latestFinancial.operatingMargin ? `${Number(latestFinancial.operatingMargin)}%` : '\u2014'}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Ansatte</p>
              <p className="text-lg font-bold text-stone-900">
                {latestFinancial.groupEmployees?.toLocaleString() ?? company.employees?.toLocaleString() ?? '\u2014'}
              </p>
            </div>
          </div>

          {company.financials.length > 1 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2 text-stone-400">Ar</th>
                    <th className="text-right py-2 text-stone-400">Omsetning</th>
                    <th className="text-right py-2 text-stone-400">Driftsresultat</th>
                    <th className="text-right py-2 text-stone-400">Margin</th>
                    <th className="text-right py-2 text-stone-400">Ansatte</th>
                  </tr>
                </thead>
                <tbody>
                  {company.financials.map(f => (
                    <tr key={f.id} className="border-b border-stone-100">
                      <td className="py-2 text-stone-700">{f.year}</td>
                      <td className="text-right py-2 text-stone-700 tabular-nums">
                        {f.revenueNok ? `${(Number(f.revenueNok) / 1e9).toFixed(1)} mrd` : '\u2014'}
                      </td>
                      <td className="text-right py-2 text-stone-700 tabular-nums">
                        {f.operatingResult ? `${(Number(f.operatingResult) / 1e6).toFixed(0)} M` : '\u2014'}
                      </td>
                      <td className="text-right py-2 text-stone-700 tabular-nums">
                        {f.operatingMargin ? `${Number(f.operatingMargin)}%` : '\u2014'}
                      </td>
                      <td className="text-right py-2 text-stone-700 tabular-nums">
                        {f.groupEmployees?.toLocaleString() ?? '\u2014'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {company.shareholders.length > 0 && (
        <Card title="Aksjonaerer">
          <div className="space-y-2">
            {company.shareholders.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div>
                  <span className="text-sm text-stone-700">{s.name}</span>
                  {s.shareholderType && (
                    <span className="ml-2 text-xs text-stone-400">({s.shareholderType})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {s.ownershipPct && (
                    <span className="text-sm font-medium text-stone-700">{Number(s.ownershipPct)}%</span>
                  )}
                  {s.isControlling && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Kontrollerende
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {company.boardMembers.length > 0 && (
        <Card title="Styre">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {company.boardMembers.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 bg-stone-50/50">
                <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500">
                  {m.personName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">{m.personName}</p>
                  <p className="text-xs text-stone-400">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {company.subsidies.length > 0 && (
        <Card title="Tilskudd">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 text-stone-400">Type</th>
                  <th className="text-left py-2 text-stone-400">Prosjekt</th>
                  <th className="text-right py-2 text-stone-400">Belop</th>
                  <th className="text-right py-2 text-stone-400">Ar</th>
                </tr>
              </thead>
              <tbody>
                {company.subsidies.map(s => (
                  <tr key={s.id} className="border-b border-stone-100">
                    <td className="py-2 text-stone-700">{s.subsidyType}</td>
                    <td className="py-2 text-stone-700">{s.project ?? '\u2014'}</td>
                    <td className="text-right py-2 text-stone-700 tabular-nums">
                      {s.amountNok ? `${(Number(s.amountNok) / 1e3).toFixed(0)}k` : '\u2014'}
                    </td>
                    <td className="text-right py-2 text-stone-700">{s.year ?? '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {company.documentRefs.length > 0 && (
        <Card title="Relaterte dokumenter">
          <div className="space-y-2">
            {company.documentRefs.map(ref => (
              <div key={ref.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <a href={`/forskning/${ref.document.slug}`} className="text-sm text-emerald-700 hover:underline">
                  {ref.document.title}
                </a>
                {ref.context && <span className="text-xs text-stone-400">{ref.context}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
