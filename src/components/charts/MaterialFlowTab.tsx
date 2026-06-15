'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { NetworkMap, type NetworkTypeConfig } from '@/components/network/NetworkMap'
import { FlowSankey } from '@/components/charts/FlowSankey'
import { toNetwork, toSankey } from '@/lib/flows/adapter'
import { summarizeVerdikjede } from '@/lib/flows/value-chain-axis'
import type { MaterialFlowsFile } from '@/lib/flows/types'
import type { NetworkPreset } from '@/lib/network-map'

const TYPE_CONFIG: Record<string, NetworkTypeConfig> = {
  actor: { label: 'Aktør', color: '#0ea5e9', size: 7 },
  company: { label: 'Selskap', color: '#78716c', size: 7 },
  location: { label: 'Sted', color: '#8b5cf6', size: 6 },
  category: { label: 'Kategori', color: '#a8a29e', size: 6 },
  process: { label: 'Prosess', color: '#f59e0b', size: 6 },
}

const EVIDENCE_COLORS: Record<string, string> = {
  observed: '#059669',
  estimated: '#d97706',
  proxy: '#0284c7',
  illustrative: '#a8a29e',
}

const PRESETS: NetworkPreset[] = [
  {
    id: 'all',
    label: 'Alle strømmer',
    description: 'Alle materialstrømmer, farget etter evidensgrad.',
    edgeTypes: ['observed', 'estimated', 'proxy', 'illustrative'],
    showIsolated: true,
  },
]

export function MaterialFlowTab() {
  const [file, setFile] = useState<MaterialFlowsFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loopId, setLoopId] = useState<string>('all')

  useEffect(() => {
    fetch('/data/food-systems/material-flows.json')
      .then((r) => r.json())
      .then((data) => { setFile(data); setLoading(false) })
      .catch(() => { setFile(null); setLoading(false) })
  }, [])

  const selectedLoops = useMemo(() => {
    if (!file) return []
    return loopId === 'all' ? file.loops : file.loops.filter((l) => l.loopId === loopId)
  }, [file, loopId])

  const network = useMemo(() => toNetwork(selectedLoops), [selectedLoops])
  const sankey = useMemo(() => toSankey(selectedLoops), [selectedLoops])
  const verdikjede = useMemo(() => summarizeVerdikjede(selectedLoops), [selectedLoops])

  if (loading) {
    return <EmptyState message="Laster materialstrømmer..." />
  }
  if (!file || file.loops.length === 0) {
    return <EmptyState message="Ingen materialstrømmer registrert ennå." />
  }

  return (
    <div className="space-y-4">
      <Card className="bg-emerald-50/50 border-emerald-100">
        <p className="text-xs text-stone-700 leading-relaxed max-w-2xl">
          <strong>Hva dette er:</strong> et røntgenbilde av matsystemets registrerte materialstrømmer fra
          åpne kilder. Det sier ikke hvor mye (volum) eller hvor verdifullt (verdi) noe er. Den viktigste
          lesningen er ikke hva som er der, men hva som <strong>mangler eller er ubearbeidet</strong> — det
          peker mot handlingssonen: hvilke sidestrømmer bør utnyttes, bearbeides eller jobbes videre med.
        </p>
      </Card>

      <Card className="bg-stone-50 border-stone-200">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
            Strukturerte materialstrømmer per loop. Kant-farge = evidensgrad
            <span className="text-emerald-700"> observed</span>,
            <span className="text-amber-700"> estimated</span>,
            <span className="text-sky-700"> proxy</span>,
            <span className="text-stone-500"> illustrative</span>. Sankey viser kun kvantifiserte strømmer.
            <br />
            <span className="text-stone-400">
              Registrert = en kilde/dokument som omtaler strømmen, ikke en målt materialbevegelse.
            </span>
          </p>
          <select
            value={loopId}
            onChange={(e) => setLoopId(e.target.value)}
            className="text-xs border border-stone-300 rounded-lg px-2 py-1 bg-white"
          >
            <option value="all">Alle looper ({file.loops.length})</option>
            {file.loops.map((l) => (
              <option key={l.loopId} value={l.loopId}>{l.loopId}</option>
            ))}
          </select>
        </div>
      </Card>

      {verdikjede.total > 0 && (
        <Card className="bg-white border-stone-200">
          <p className="text-xs font-semibold text-stone-700 mb-1">
            Verdikjede-akse{' '}
            <span className="font-normal text-stone-400">(avledet fra verdikjedesteg, ikke målt)</span>
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-600">
            <span><strong>{verdikjede.raastoff}</strong> råstoff · <strong>{verdikjede.bearbeidet}</strong> bearbeidet</span>
            <span><strong>{verdikjede.oppstroem}</strong> oppstrøm · <strong>{verdikjede.avfallsside}</strong> avfallsside</span>
            <span className="text-stone-400">av {verdikjede.total} strømmer</span>
          </div>
        </Card>
      )}

      <Card className="!p-0 overflow-hidden">
        <div className="h-[480px]">
          <NetworkMap
            nodes={network.nodes}
            edges={network.edges}
            presets={PRESETS}
            defaultPresetId="all"
            typeConfig={TYPE_CONFIG}
            edgeColors={EVIDENCE_COLORS}
            maxRenderNodes={500}
            inspectorLinkLabel="Åpne side"
            emptyTitle="Ingen strømmer"
            emptyMessage="Velg en annen loop, eller kjør bootstrap-scriptet."
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-2">Kvantifiserte strømmer (Sankey)</h3>
        {loopId === 'all' ? (
          <EmptyState message="Velg én loop for å se kvantifiserte strømmer som Sankey" />
        ) : (
          <FlowSankey data={sankey} />
        )}
      </Card>
    </div>
  )
}
