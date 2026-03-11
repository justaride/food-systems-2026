'use client'

import { useMapContext } from '@/lib/map/MapContext'
import { CHAIN_CONFIGS, type ChainId, type MapLayer } from '@/lib/map/types'

type LayerGroup = {
  label: string
  layers: { id: MapLayer; label: string }[]
}

const LAYER_GROUPS: LayerGroup[] = [
  {
    label: 'Kartlag',
    layers: [
      { id: 'stores', label: 'Butikker' },
      { id: 'boundaries', label: 'Kommunegrenser' },
    ],
  },
  {
    label: 'Verdikjede',
    layers: [
      { id: 'aquaculture', label: 'Akvakultur' },
      { id: 'processing', label: 'Foredlingsanlegg' },
      { id: 'ports', label: 'Havner' },
    ],
  },
  {
    label: 'Analyse',
    layers: [
      { id: 'desert', label: 'Mat\u00F8rken' },
      { id: 'vulnerability', label: 'S\u00E5rbarhet' },
    ],
  },
]

export default function LayerPanel() {
  const { activeLayers, toggleLayer, activeChains, toggleChain, stores, isLoading, aquacultureSites, processingPlants, ports } = useMapContext()

  const storeCount = stores.length
  const visibleCount = stores.filter(s => activeChains.includes(s.chainId as ChainId)).length

  return (
    <div className="absolute top-4 left-4 z-[1000] w-56 bg-white rounded-xl border border-stone-200/80 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-stone-100">
        <h3 className="text-sm font-semibold text-stone-800">Kartlag</h3>
        {isLoading && (
          <p className="text-xs text-stone-400 mt-1">Laster data...</p>
        )}
        {!isLoading && (
          <p className="text-xs text-stone-400 mt-1">
            {visibleCount.toLocaleString()} av {storeCount.toLocaleString()} butikker
            {aquacultureSites.length > 0 && ` \u00B7 ${aquacultureSites.length} akvakultur`}
            {processingPlants.length > 0 && ` \u00B7 ${processingPlants.length} anlegg`}
            {ports.length > 0 && ` \u00B7 ${ports.length} havner`}
          </p>
        )}
      </div>

      <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {LAYER_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-1.5">{group.label}</p>
            <div className="space-y-1.5">
              {group.layers.map(({ id, label }) => {
                const active = activeLayers.includes(id)
                return (
                  <label key={id} className="flex items-center gap-2.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleLayer(id)}
                      className="w-3.5 h-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={active ? 'text-stone-800' : 'text-stone-500'}>{label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}

        {activeLayers.includes('stores') && (
          <>
            <div className="border-t border-stone-100" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Kjeder</p>
              <div className="space-y-1 max-h-[280px] overflow-y-auto">
                {Object.entries(CHAIN_CONFIGS).map(([chainId, cfg]) => {
                  const active = activeChains.includes(chainId as ChainId)
                  return (
                    <label key={chainId} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleChain(chainId as ChainId)}
                        className="w-3 h-3 rounded border-stone-300"
                        style={{ accentColor: cfg.color }}
                      />
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <span className={`text-xs ${active ? 'text-stone-700' : 'text-stone-400'}`}>
                        {cfg.name}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
