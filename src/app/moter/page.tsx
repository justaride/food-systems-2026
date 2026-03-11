'use client'

import { Card } from '@/components/ui/Card'
import { ExpandableSources } from '@/components/ui/ExpandableSources'
import { meetings } from '@/lib/data/meetings'

export default function MoterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Moter</h1>
        <p className="text-sm text-stone-400 mt-1">Executive summaries fra {meetings.length} moter</p>
      </div>

      <div className="space-y-4">
        {meetings.map(meeting => (
          <Card key={meeting.id}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-stone-800">{meeting.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-stone-500">{meeting.date}</span>
                  <span className="text-xs text-stone-300">|</span>
                  <span className="text-xs text-stone-500">{meeting.participants.join(', ')}</span>
                </div>
              </div>
              <span className="text-xs text-stone-400 font-mono shrink-0">{meeting.source}</span>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              {meeting.summary}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">
                  Beslutninger
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

              <div>
                <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">
                  Aksjonspunkter
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

              <div>
                <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">
                  Nokkelfunn
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

            {meeting.sources?.length ? (
              <ExpandableSources sources={meeting.sources} />
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  )
}
