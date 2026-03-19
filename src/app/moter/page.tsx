import { Card } from '@/components/ui/Card'
import { ExpandableSources } from '@/components/ui/ExpandableSources'
import { getMeetings } from '@/lib/queries/meetings'

export default async function MoterPage() {
  const meetings = await getMeetings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Moter</h1>
        <p className="text-sm text-stone-400 mt-1">
          Kuraterte motesammendrag fra {meetings.length} moter. Primarunderlag holdes i egne notater,
          transkripsjoner og analyser.
        </p>
      </div>

      <div className="space-y-4">
        {meetings.map(meeting => (
          <Card key={meeting.id}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-stone-800">{meeting.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="text-xs text-stone-500">{meeting.date}</span>
                  <span className="text-xs text-stone-300">|</span>
                  <span className="text-xs text-stone-500">{meeting.participants.length} deltakere</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">{meeting.participants.join(', ')}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">Primarunderlag</p>
                <p className="text-xs text-stone-500 font-mono mt-1 max-w-[18rem] break-all">{meeting.source}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                {meeting.keyDecisions.length} avklaringer
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                {meeting.actionItems.length} oppfolginger
              </span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
                {meeting.keyInsights.length} fokuspunkt
              </span>
            </div>

            <div className="mb-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 mb-2">Kort oppsummert</p>
              <p className="text-sm text-stone-700 leading-relaxed">
                {meeting.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">
                  Avklart i motet
                </h4>
                <ul className="space-y-1.5">
                  {meeting.keyDecisions.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                      <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">
                  Oppfolging
                </h4>
                <ul className="space-y-1.5">
                  {meeting.actionItems.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                      <span className="text-amber-500 mt-0.5 shrink-0">-</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">
                  Fokus og nokkelfunn
                </h4>
                <ul className="space-y-1.5">
                  {meeting.keyInsights.map((ins, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                      <span className="text-sky-500 mt-0.5 shrink-0">*</span>
                      {ins}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {meeting.sourceRefs?.length ? (
              <ExpandableSources sources={meeting.sourceRefs.map(s => ({ label: s.label, url: s.url ?? undefined, note: s.note ?? undefined }))} />
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  )
}
