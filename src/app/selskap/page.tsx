import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { getCompanies } from '@/lib/queries/companies'

export default async function SelskaperPage() {
  const companies = await getCompanies()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Selskaper</h1>
        <p className="text-sm text-stone-400 mt-1">
          Eksisterende selskapsdata som kan kobles inn i det bredere aktorkartet.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companies.map(company => {
          const latestFinancial = company.financials[0]

          return (
            <Card key={company.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/selskap/${company.id}`} className="text-lg font-semibold text-stone-900 hover:text-emerald-700">
                    {company.name}
                  </Link>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mt-1">
                    {company.valueChainStage ?? 'ukjent ledd'}
                    {company.ownershipType ? ` · ${company.ownershipType}` : ''}
                  </p>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <div>{company.orgNr}</div>
                  {company.hqCity && <div>{company.hqCity}</div>}
                </div>
              </div>

              {company.naceDescription && (
                <p className="mt-3 text-sm text-stone-700 leading-relaxed">{company.naceDescription}</p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                  <div className="text-[11px] uppercase tracking-wider text-stone-400">Omsetning</div>
                  <div className="mt-1 font-semibold text-stone-900">
                    {latestFinancial?.revenueNok ? `${(Number(latestFinancial.revenueNok) / 1e9).toFixed(1)} mrd` : '—'}
                  </div>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                  <div className="text-[11px] uppercase tracking-wider text-stone-400">Ansatte</div>
                  <div className="mt-1 font-semibold text-stone-900">
                    {latestFinancial?.groupEmployees?.toLocaleString() ?? company.employees?.toLocaleString() ?? '—'}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-stone-500">
                {company.shareholders[0] ? `Kontrollerende eier: ${company.shareholders[0].name}` : 'Ingen eierinfo'}
              </div>
              <div className="mt-1 text-xs text-stone-500">
                {company._count.boardMembers} styremedlemmer · {company._count.subsidies} tilskuddsoppforinger
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
