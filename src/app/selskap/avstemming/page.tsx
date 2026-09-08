import Link from 'next/link'
import { prisma } from '@/lib/db'
import { compareCompanyAttachments } from '@/lib/company-reconciliation'
import { COMPANY_IDENTITY_ALIASES } from '@/lib/company-identities'
export const dynamic = 'force-dynamic'
export default async function CompanyReconciliationPage() {
  const companies = await prisma.company.findMany({ select: { id: true, name: true, orgNr: true, _count: { select: { financials: true, boardMembers: true, documentRefs: true } } }, orderBy: { name: 'asc' } })
  const byOrg = new Map(companies.map(c => [c.orgNr, c]))
  const attachmentRows = await prisma.company.findMany({
    where: { orgNr: { in: [...Object.keys(COMPANY_IDENTITY_ALIASES), ...Object.values(COMPANY_IDENTITY_ALIASES)] } },
    select: { id: true, orgNr: true,
      financials: { orderBy: { year: 'desc' }, select: { year: true, revenueNok: true, operatingResult: true, source: true, unitScale: true, amountCurrency: true } },
      boardMembers: { select: { personKey: true, personName: true, role: true } },
      documentRefs: { select: { documentId: true, context: true, document: { select: { slug: true, title: true } } } },
      _count: { select: { relationshipsFrom: true, relationshipsTo: true, parentOf: true, childOf: true, shareholders: true, subsidies: true, ownedProperties: true } },
    },
  })
  const attachments = new Map(attachmentRows.map(c => [c.orgNr, c]))
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
    {aliases.map(c => { const targetOrg = COMPANY_IDENTITY_ALIASES[c.orgNr]; const target = byOrg.get(targetOrg); const retained = attachments.get(c.orgNr)!; const comparison = compareCompanyAttachments(retained, attachments.get(targetOrg)); return <article className="rounded-lg border p-4" key={c.id}><h2 className="font-semibold">{c.name}</h2><p className="mt-1 text-sm">Eldre identitet: {c.orgNr} → {targetOrg}</p><p className="mt-1 text-xs text-stone-500">Bevart på eldre rad: {c._count.financials} regnskap · {c._count.boardMembers} verv · {c._count.documentRefs} dokumentkoblinger.</p>{target ? <Link className="mt-2 inline-block text-sm text-emerald-800 underline" href={`/selskap/${target.id}`}>Åpne registeridentiteten →</Link> : <p className="mt-2 text-sm text-amber-800">Målidentiteten mangler i denne databasen. Kildekontroll og import må fullføres.</p>}<details className="mt-3 rounded border border-stone-200 p-3"><summary className="cursor-pointer text-sm font-medium">Avstemt innhold: {comparison.conflictYears} regnskapskonflikter · {comparison.uniqueFinancialYears} unike år · {comparison.uniqueBoardRoles.length} unike verv · {comparison.uniqueDocumentRefs.length} unike dokumentkoblinger</summary>
      <p className="mt-2 text-xs text-stone-500">Sammenligningen gjelder lagrede felt og koblinger. Den bekrefter ikke juridisk identitet, historisk rolle eller kildeinnhold.</p>
      {comparison.financials.map(f => <div key={f.year} className="mt-2 rounded bg-stone-50 p-2 text-xs"><strong>{f.year}: {f.status === 'same' ? 'Like lagrede felt' : f.status === 'unique' ? 'Året finnes bare på eldre rad' : 'Ulike lagrede felt'}</strong><p>Eldre rad: omsetning {f.legacy.revenue ?? '—'} · resultat {f.legacy.result ?? '—'} · skala {f.legacy.scale} · {f.legacy.currency ?? 'uavstemt valuta'}. {f.legacy.source}</p>{f.target && <p>Registeridentitet: omsetning {f.target.revenue ?? '—'} · resultat {f.target.result ?? '—'} · skala {f.target.scale} · {f.target.currency ?? 'uavstemt valuta'}. {f.target.source}</p>}</div>)}
      {comparison.uniqueBoardRoles.map((b, i) => <p className="mt-2 text-xs" key={`${b.personKey}-${b.role}-${i}`}>Verv bare på eldre rad: {b.personName} · {b.role}</p>)}
      {comparison.uniqueDocumentRefs.map((d, i) => <p className="mt-2 text-xs" key={`${d.documentId}-${i}`}><Link className="text-emerald-800 underline" href={`/bibliotek/${d.document.slug}`}>{d.document.title}</Link> · {d.context ?? 'uten koblingsnotat'}</p>)}
      <p className="mt-3 text-xs">Andre bevarte koblinger som må vurderes: {retained._count.relationshipsFrom + retained._count.relationshipsTo} relasjoner · {retained._count.parentOf + retained._count.childOf} eierskapskoblinger · {retained._count.shareholders} aksjonærer · {retained._count.subsidies} tilskudd · {retained._count.ownedProperties} eiendommer.</p>
      </details><p className="mt-2 text-sm">Neste handling: dataansvarlig kontrollerer eventuelt unikt underlag på eldre rad før noen relasjoner flyttes.</p></article> })}
    <section className="rounded-lg border border-amber-200 p-4"><h2 className="font-semibold">Liknende navn som krever egen vurdering ({ambiguous.length})</h2><p className="mt-1 text-sm">Ulike juridiske enheter, blant annet utenlandske selskaper og norske filialer, kan ha samme navn. Navnelikhet er ikke grunnlag for sammenslåing.</p>{ambiguous.map(group => <ul key={group[0].id} className="mt-3 list-disc pl-5 text-sm">{group.map(c => <li key={c.id}><Link className="underline" href={`/selskap/${c.id}`}>{c.name} · {c.orgNr}</Link></li>)}</ul>)}</section>
  </div>
}
