import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import { Card } from '@/components/ui/Card'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { CASESTATUS_RULE, CASESTATUS_UPDATED, caseAnchors } from '@/lib/data/casestatus'
import type { CaseAnchor } from '@/lib/data/casestatus'
import { MATURITY_LABELS, STATUS_STYLES } from '../status-display'

export const dynamicParams = false

const CASE_AVSJEKK_DIR = path.join(process.cwd(), 'docs', 'project', 'analysis', 'case-avsjekk')

type Props = {
  params: Promise<{ anchor: string }>
}

function getAnchor(id: string): CaseAnchor | undefined {
  return caseAnchors.find(a => a.id === id)
}

/** Skiller enkel YAML-frontmatter fra brødteksten. Listefelt (innrykk) ignoreres bevisst. */
function splitFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  if (!raw.startsWith('---')) return { meta: {}, body: raw }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { meta: {}, body: raw }

  const block = raw.slice(3, end).trim()
  const body = raw.slice(end + 4).replace(/^\s*\n/, '')
  const meta: Record<string, string> = {}
  for (const line of block.split('\n')) {
    const m = line.match(/^([a-zA-Z_æøåÆØÅ]+):\s*(.+)$/)
    if (m) meta[m[1]] = m[2].trim()
  }
  return { meta, body }
}

function loadAvsjekk(anchor: CaseAnchor): { meta: Record<string, string>; html: string } {
  const raw = readFileSync(path.join(CASE_AVSJEKK_DIR, path.basename(anchor.caseAvsjekk)), 'utf8')
  const { meta, body } = splitFrontmatter(raw)
  const html = marked(body, { gfm: true }) as string
  return { meta, html }
}

export function generateStaticParams() {
  return caseAnchors.map(a => ({ anchor: a.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { anchor: id } = await params
  const anchor = getAnchor(id)
  if (!anchor) return { title: 'Casestatus — Food Systems 2026' }
  return {
    title: `${anchor.title} — Casestatus`,
    description: `Dybde-avsjekk og intern modenhetsstatus for caseankeret ${anchor.title}.`,
  }
}

export default async function CaseAnchorPage({ params }: Props) {
  const { anchor: id } = await params
  const anchor = getAnchor(id)
  if (!anchor) notFound()

  const { meta, html } = loadAvsjekk(anchor)
  const docFilename = anchor.caseAvsjekk.split('/').pop() ?? anchor.caseAvsjekk

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/casestatus" className="hover:text-emerald-700">Casestatus</Link>
        <span>/</span>
        <span className="font-medium text-stone-700">{anchor.title}</span>
      </nav>

      <InternalBanner note={CASESTATUS_RULE} />

      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{anchor.title}</h1>
            <p className="text-sm text-stone-400 mt-1">
              Spor {anchor.tracks.join('/')} · {MATURITY_LABELS[anchor.maturity]} · oppdatert {CASESTATUS_UPDATED}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5 max-w-[55%]">
            {anchor.statuses.map(status => (
              <span
                key={status}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[status]}`}
              >
                {status}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 mb-1">Go/no-go-retning</p>
          <p className="text-sm font-medium text-stone-700">{anchor.goNoGo}</p>
          <p className="text-sm text-stone-600 leading-relaxed mt-2">{anchor.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">Nøkkeltall</h2>
          <ul className="space-y-2">
            {anchor.keyFigures.map(fig => (
              <li key={fig.label} className="text-xs text-stone-600">
                <span className="font-semibold text-stone-800">{fig.value}</span>
                {' — '}
                {fig.label}
                <span className="block text-[11px] text-stone-400 mt-0.5">{fig.source}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h2 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">Blokkere</h2>
            <ul className="space-y-1.5">
              {anchor.blockers.map(blocker => (
                <li key={blocker} className="flex items-start gap-2 text-xs text-stone-600">
                  <span className="text-amber-500 mt-0.5 shrink-0">-</span>
                  {blocker}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h2 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">Neste handling</h2>
            <ul className="space-y-1.5">
              {anchor.nextActions.map(action => (
                <li key={action} className="flex items-start gap-2 text-xs text-stone-600">
                  <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
        <h2 className="text-xs text-rose-500 uppercase tracking-wider font-medium mb-2">Ikke si</h2>
        <ul className="space-y-1">
          {anchor.notSay.map(item => (
            <li key={item} className="text-xs text-rose-900">{item}</li>
          ))}
        </ul>
      </div>

      <Card title="Dybde-avsjekk">
        <p className="text-xs text-stone-400 mb-3">
          Full intern case-avsjekk ({docFilename})
          {meta.status ? ` · ${meta.status}` : ''}
          {meta.dato ? ` · ${meta.dato}` : ''}. Gjengitt verbatim fra underlaget — følger claim-lock, ingen ekstern faktastemme.
        </p>
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
      </Card>

      <Card title="Underlag / videre lesing">
        <ul className="space-y-1.5">
          {[anchor.caseAvsjekk, ...anchor.docRefs].map(ref => (
            <li key={ref} className="text-[11px] text-stone-500 font-mono break-all">
              {ref}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
