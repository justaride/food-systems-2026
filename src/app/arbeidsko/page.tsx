import Link from 'next/link'
import { getWorkQueue, GAP_REGISTER_PATH } from '@/lib/queries/work-queue'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Arbeidskø — Food Systems 2026' }
const statusLabels: Record<string, string> = { closed: 'Lukket i kilderegisteret', blocked_external: 'Venter på avklaring', monitoring: 'Til oppfølging', follow_up: 'Caseoppfølging', actor_follow_up: 'Aktøroppfølging', open: 'Åpen', ready_to_execute: 'Klar for avgrenset oppfølging', parked: 'Parkert' }
export default async function WorkQueuePage({ searchParams }: { searchParams: Promise<{ q?: string; kind?: string; status?: string }> }) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim().toLowerCase() : ''
  const all = await getWorkQueue()
  const items = all.filter(item => (params.status === 'all' || item.status !== 'closed') &&
    (!params.kind || params.kind === 'all' || item.kind === params.kind) &&
    (!query || [item.id, item.title, item.owner, item.nextAction].join(' ').toLowerCase().includes(query)))
  return <div className="space-y-6">
    <header><h1 className="text-2xl font-bold">Arbeidskø</h1><p className="mt-2 text-sm text-stone-600">Samlet oppfølging fra prosjektets gapregister, caseunderlag og aktører med P1-prioritet eller registrert forespørsel. Ansvar, kildekontroll og formelle beslutninger følger den enkelte oppføringen.</p></header>
    <div className="grid gap-3 sm:grid-cols-3">
      <Link href="/ai-kunnskap?status=review_required" className="rounded-lg border p-4 text-emerald-800 underline">Gjennomgå kilder i AI-kunnskap →</Link>
      <Link href="/selskap/avstemming" className="rounded-lg border p-4 text-emerald-800 underline">Avstem selskapsidentiteter →</Link>
      <Link href="/casestatus" className="rounded-lg border p-4 text-emerald-800 underline">Åpne caseunderlaget →</Link>
    </div>
    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Datoene nedenfor er siste kontroll i underlaget. Eldre casekort må revideres før nye påstander brukes. Denne køen registrerer ingen godkjenning eller endring i kildestatus.</p>
    <form className="flex flex-wrap gap-2" action="/arbeidsko" method="get">
      <input aria-label="Søk i oppgaver og ansvar" name="q" defaultValue={params.q} placeholder="Oppgave, ansvar eller neste handling" className="min-w-0 flex-1 rounded border p-2" />
      <select aria-label="Oppgavetype" name="kind" defaultValue={params.kind || 'all'} className="rounded border p-2"><option value="all">Alle typer</option><option value="gap">Prosjektgap</option><option value="case">Case</option><option value="actor">Aktør</option></select>
      <select aria-label="Oppgavestatus" name="status" defaultValue={params.status || 'open'} className="rounded border p-2"><option value="open">Gjenstående</option><option value="all">Inkluder lukkede</option></select>
      <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-white">Søk og filtrer</button>
    </form>
    <p className="text-sm text-stone-500">{items.length} {items.length === 1 ? 'oppgave' : 'oppgaver'} · {all.filter(i => i.status === 'closed').length} lukket i underlaget</p>
    {items.length === 0 && <p>Ingen oppgaver matcher filteret. <Link className="underline" href="/arbeidsko">Nullstill</Link></p>}
    {items.map(item => <article key={item.id} id={item.id} className="scroll-mt-20 rounded-lg border bg-white p-4">
      <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">{item.kind === 'gap' ? `${item.id} · ` : ''}{item.title}</h2><span className="text-xs text-stone-600">{item.priority} · {statusLabels[item.status] ?? item.status}</span></div>
      <p className="mt-2 text-sm"><strong>Ansvar:</strong> {item.owner}</p>
      <p className="mt-2 text-sm"><strong>Neste handling:</strong> {item.nextAction}</p>
      <p className="mt-2 text-xs text-stone-500">Sist kontrollert i underlaget: {item.checkedAt}</p>
      {item.kind === 'case' && <Link href={item.href} className="mt-2 inline-block text-sm text-emerald-800 underline">Åpne case og kildegrunnlag →</Link>}
      {item.kind === 'actor' && <Link href={item.href} className="mt-2 inline-block text-sm text-emerald-800 underline">Åpne aktør, forespørsel og underlag →</Link>}
      <details className="mt-3 text-sm"><summary className="cursor-pointer text-emerald-800">Begrunnelse, ferdigkriterier og underlag</summary><p className="mt-2">{item.detail}</p>{item.exitCriteria.length ? <ul className="mt-2 list-disc pl-5">{item.exitCriteria.map(c => <li key={c}>{c}</li>)}</ul> : <p className="mt-2 text-amber-800">Ferdigkriterier er ikke registrert og må avklares av ansvarlig.</p>}<ul className="mt-2 space-y-1">{[...new Set([...(item.kind === 'gap' ? [GAP_REGISTER_PATH] : []), ...item.sourceRefs])].map(ref => <li key={ref}><a className="break-all text-xs text-emerald-800 underline" href={ref.startsWith('https://') || ref.startsWith('/') ? ref : `https://github.com/justaride/food-systems-2026/blob/main/${ref.split('/').map(encodeURIComponent).join('/')}`} target="_blank" rel="noreferrer">{ref}</a></li>)}</ul></details>
    </article>)}
  </div>
}
