import type { Metadata } from 'next'
import Link from 'next/link'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { PageFraming } from '@/components/ui/PageFraming'
import {
  NORDIC_SPINE_COUNTRIES,
  type DisplayCell,
  type FlowMatrixRow,
  type IndicatorMatrixRow,
} from '@/lib/nordic-spine'
import { cellTitle, getNordicSpinePayload } from '@/lib/queries/nordic-spine'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Nordic spine (internal) - Food Systems 2026',
  description: 'Internal C1–C3 Nordic comparison spine with hole labels. Not for external publication.',
}

function DisplayChip({ cell }: { cell: DisplayCell }) {
  if (cell.kind === 'value') {
    return (
      <div className="space-y-0.5">
        <div className="font-medium text-stone-900 tabular-nums">{cell.text}</div>
        <div className="text-[10px] uppercase tracking-wide text-stone-400">{cell.meta}</div>
      </div>
    )
  }
  if (cell.kind === 'hole') {
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
          {cell.text}
        </span>
        <p className="text-[11px] leading-snug text-amber-950/80" title={cell.reason}>
          {cell.reason}
        </p>
      </div>
    )
  }
  return <span className="text-stone-300">—</span>
}

function Counts({ filled, holes, total }: { filled: number; holes: number; total: number }) {
  return (
    <p className="text-xs text-stone-500">
      <span className="font-medium text-stone-700">{filled}</span> filled ·{' '}
      <span className="font-medium text-amber-800">{holes}</span> holes · {total} rows
    </p>
  )
}

function IndicatorTable({ rows }: { rows: IndicatorMatrixRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-stone-50 text-[11px] uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Indicator</th>
            {NORDIC_SPINE_COUNTRIES.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.indicatorId} className="border-t border-stone-100 align-top">
              <td className="px-3 py-2 font-mono text-xs text-stone-600">{row.indicatorId}</td>
              {NORDIC_SPINE_COUNTRIES.map((c) => (
                <td key={c} className="px-3 py-2">
                  <DisplayChip cell={row.cells[c]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FlowTable({ rows }: { rows: FlowMatrixRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-stone-50 text-[11px] uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Edge</th>
            {NORDIC_SPINE_COUNTRIES.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.edge} className="border-t border-stone-100 align-top">
              <td className="px-3 py-2 font-mono text-xs text-stone-600">{row.edge}</td>
              {NORDIC_SPINE_COUNTRIES.map((c) => (
                <td key={c} className="px-3 py-2">
                  <DisplayChip cell={row.cells[c]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function NordicSpinePage() {
  const data = await getNordicSpinePayload()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Nordic spine</h1>
        <p className="mt-1 text-sm text-stone-500">
          Internal C1–C3 comparison matrices with explicit hole labels. Values OR dated holes — no proxies.
        </p>
      </div>

      <InternalBanner
        label="Internal only — gate:internal"
        note="Not for external publication. Partner tables remain blocked on IG-005. Holes are True-C gaps; do not fill with capacity proxies or invented population conversions."
      />

      <PageFraming
        title="What does this page answer?"
        description={[
          'Shows the frozen Nordic spine cells country × indicator/flow for roadmap and phase-0 planning.',
          'Every missing figure is labelled as a hole with reason — fail-closed, no silent blanks as “zero”.',
        ]}
        takeaways={[
          'C1 retail concentration is mostly filled; FI/IS margin tops remain holes.',
          'C2 seafood residue mass-flow edges are all unknown (capacity is ActivitySignal only).',
          'C3 has two measured inlet edges (NO Totalt, SE retail+consumer) and open digestate-loop holes.',
        ]}
        caveat="Internal working surface only. No citable_external upgrade and no Norway actor breadth expansion from this page."
      />

      {!data.available ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Nordic spine tables are unavailable in this environment (DB/schema). Open the utilization brief and
          readbacks under <code className="text-xs">docs/project/plans/</code> and{' '}
          <code className="text-xs">research/_status/</code>.
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">C1</p>
              <Counts {...data.c1.counts} />
            </div>
            <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">C2</p>
              <Counts {...data.c2.counts} />
            </div>
            <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">C3</p>
              <Counts {...data.c3.counts} />
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">C1 — {cellTitle(data, 'retail-concentration')}</h2>
              <p className="text-xs text-stone-500">Core indicators only (HHI / CR3 / margin_top1–3). Banner rows live in DB but are omitted here for scanability.</p>
              <Counts {...data.c1.counts} />
            </div>
            <IndicatorTable rows={data.c1.matrix} />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">C2 — {cellTitle(data, 'seafood-residue-flow')}</h2>
              <p className="text-xs text-stone-500">
                5×4 mass-flow edges. NO aqua licensed capacity is ActivitySignal, not sludge quantity.
              </p>
              <Counts {...data.c2.counts} />
            </div>
            <FlowTable rows={data.c2.matrix} />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">C3 — {cellTitle(data, 'food-waste-digestate')}</h2>
              <p className="text-xs text-stone-500">
                Mass chain only in this pass. SE inlet carries a method caveat (retail+consumer stage, not national Totalt).
              </p>
              <Counts {...data.c3.counts} />
            </div>
            <FlowTable rows={data.c3.matrix} />
          </section>

          <section className="rounded-xl border border-stone-200 bg-white px-4 py-4 space-y-2">
            <h2 className="text-lg font-semibold text-stone-900">ActivitySignal summary</h2>
            <p className="text-sm text-stone-600">
              {data.activity.count} NO seafood signals
              {data.activity.signalType ? ` · ${data.activity.signalType}` : ''}
              {data.activity.year ? ` · ${data.activity.year}` : ''}
              {' · '}
              sum MTB/TN capacity{' '}
              <span className="font-medium tabular-nums text-stone-900">
                {new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(data.activity.sumMtb)} t
              </span>
            </p>
            <p className="text-xs text-amber-900">
              Capacity ≠ sludge throughput. Do not copy these totals into C2 FlowCell quantities.
            </p>
          </section>
        </>
      )}

      <footer className="border-t border-stone-200 pt-4 text-xs text-stone-500 space-y-1">
        <p>
          Brief:{' '}
          <code>docs/project/plans/nordic-spine-utilization-brief-2026-09-04.md</code>
        </p>
        <p>
          Codebook:{' '}
          <Link href="/metodikk" className="text-emerald-700 hover:underline">
            methodology
          </Link>{' '}
          · PR #388 · readbacks under <code>research/_status/nordic-*-2026-09-04.md</code>
        </p>
      </footer>
    </div>
  )
}
