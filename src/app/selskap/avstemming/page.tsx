import Link from 'next/link'
import { prisma } from '@/lib/db'
import { COMPANY_IDENTITY_ALIASES } from '@/lib/company-identities'
export const dynamic = 'force-dynamic'
export default async function CompanyReconciliationPage() {
  const companies = await prisma.company.findMany({ select: { id: true, name: true, orgNr: true, _count: { select: { financials: true, boardMembers: true, documentRefs: true } } }, orderBy: { name: 'asc' } })
  const byOrg = new Map(companies.map(c => [c.orgNr, c]))
  const aliases = companies.filter(c => COMPANY_IDENTITY_ALIASES[c.orgNr])
  const groups = new Map<string, typeof companies>()
  for (const c of companies.filter(c => !COMPANY_IDENTITY_ALIASES[c.orgNr])) {
    const key = c.name.toLocaleLowerCase('nb-NO').trim()
    groups.set(key, [...(groups.get(key) ?? []), c])
  }
  const ambiguous = [...groups.values()].filter(group => group.length > 1)
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Selskapsavstemming</h1>
    <p className="text-sm text-stone-600">{aliases.length} kjente eldre identiteter holdes utenfor selskapslisten og økonomisammenligningen. Historikk og relasjoner er bevart. Ingen kilder, regnskap eller verv flyttes automatisk mellom juridiske enheter.</p>
    <p className="text-sm"><Link className="text-emerald-800 underline" href="/selskap">Til selskapsregisteret</Link> · <Link className="text-emerald-800 underline" href="/arbeidsko">Til arbeidskøen</Link></p>
    {aliases.map(c => { const targetOrg = COMPANY_IDENTITY_ALIASES[c.orgNr]; const target = byOrg.get(targetOrg); return <article className="rounded-lg border p-4" key={c.id}><h2 className="font-semibold">{c.name}</h2><p className="mt-1 text-sm">Eldre identitet: {c.orgNr} → {targetOrg}</p><p className="mt-1 text-xs text-stone-500">Bevart på eldre rad: {c._count.financials} regnskap · {c._count.boardMembers} verv · {c._count.documentRefs} dokumentkoblinger.</p>{target ? <Link className="mt-2 inline-block text-sm text-emerald-800 underline" href={`/selskap/${target.id}`}>Åpne registeridentiteten →</Link> : <p className="mt-2 text-sm text-amber-800">Målidentiteten mangler i denne databasen. Kildekontroll og import må fullføres.</p>}<p className="mt-2 text-sm">Neste handling: dataansvarlig kontrollerer eventuelt unikt underlag på eldre rad før noen relasjoner flyttes.</p></article> })}
    <section className="rounded-lg border border-amber-200 p-4"><h2 className="font-semibold">Liknende navn som krever egen vurdering ({ambiguous.length})</h2><p className="mt-1 text-sm">Ulike juridiske enheter, blant annet utenlandske selskaper og norske filialer, kan ha samme navn. Navnelikhet er ikke grunnlag for sammenslåing.</p>{ambiguous.map(group => <ul key={group[0].id} className="mt-3 list-disc pl-5 text-sm">{group.map(c => <li key={c.id}><Link className="underline" href={`/selskap/${c.id}`}>{c.name} · {c.orgNr}</Link></li>)}</ul>)}</section>
  </div>
}
