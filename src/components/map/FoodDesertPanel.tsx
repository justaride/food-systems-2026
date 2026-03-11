'use client'

import { useMemo } from 'react'
import { useMapContext } from '@/lib/map/MapContext'

export default function FoodDesertPanel() {
  const { activeLayers, stores, municipalities, municipalityMetrics, selectedMunicipality } = useMapContext()

  const stats = useMemo(() => {
    if (!Object.keys(municipalityMetrics).length) return null

    const totalMunis = Object.keys(municipalities).length
    const munisWithNoStores = Object.entries(municipalityMetrics)
      .filter(([, m]) => m.storeCount === 0).length
    const totalPop = Object.values(municipalities).reduce((s, m) => s + (m.population || 0), 0)
    const totalArea = Object.values(municipalities).reduce((s, m) => s + (m.area || 0), 0)
    const storeCount = stores.length
    const coverageEstimate = Math.min(100, Math.round((storeCount * Math.PI * 25) / totalArea * 100 * 10) / 10)

    return { totalMunis, munisWithNoStores, totalPop, totalArea, storeCount, coverageEstimate }
  }, [stores, municipalities, municipalityMetrics])

  if (!activeLayers.includes('desert') || !stats) return null

  const selectedMuni = selectedMunicipality ? municipalities[selectedMunicipality] : null
  const selectedMetrics = selectedMunicipality ? municipalityMetrics[selectedMunicipality] : null

  return (
    <div className="absolute top-4 right-4 z-[1000] w-64 bg-white rounded-xl border border-stone-200/80 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-stone-100">
        <h3 className="text-sm font-semibold text-stone-800">Mat&oslash;rkenanalyse</h3>
        <p className="text-xs text-stone-400 mt-0.5">5 km dekningsradius per butikk</p>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-lg p-2">
            <p className="text-lg font-bold text-stone-800">{stats.storeCount.toLocaleString()}</p>
            <p className="text-[10px] text-stone-500">Butikker totalt</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-2">
            <p className="text-lg font-bold text-emerald-600">~{stats.coverageEstimate}%</p>
            <p className="text-[10px] text-stone-500">Arealdekning (est.)</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-2">
            <p className="text-lg font-bold text-amber-600">{stats.munisWithNoStores}</p>
            <p className="text-[10px] text-stone-500">Kommuner uten butikk</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-2">
            <p className="text-lg font-bold text-stone-800">{stats.totalMunis}</p>
            <p className="text-[10px] text-stone-500">Kommuner totalt</p>
          </div>
        </div>

        <p className="text-[10px] text-stone-400">
          Gr&oslash;nne sirkler viser 5 km dekningsomr&aring;de rundt hver butikk. Omr&aring;der uten dekning er potensielle mat&oslash;rkener.
        </p>

        {selectedMuni && selectedMetrics && (
          <div className="border-t border-stone-100 pt-3">
            <p className="text-xs font-semibold text-stone-700 mb-1">{selectedMuni.name}</p>
            <div className="space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Butikker</span>
                <span className="font-medium">{selectedMetrics.storeCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Innbyggere</span>
                <span className="font-medium">{selectedMuni.population?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Per 1000 innb.</span>
                <span className="font-medium">{selectedMetrics.storesPerCapita}</span>
              </div>
              <div className="flex justify-between">
                <span>Areal</span>
                <span className="font-medium">{selectedMuni.area?.toLocaleString()} km&sup2;</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
