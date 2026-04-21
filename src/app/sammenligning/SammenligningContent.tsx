'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { COUNTRY_LIST } from '@/lib/config/countries'
import { useChartMetrics } from '@/lib/hooks/useChartMetrics'
import { ComparisonBarChart } from '@/components/charts/ComparisonBarChart'
import type { CountryCode } from '@/lib/config/countries'
import type { CountryChartDataSet } from '@/lib/queries/country-metrics'

type SammenligningContentProps = {
  countryChartData: Record<string, CountryChartDataSet | null>
}

const CHART_COUNTRIES = ['no', 'se', 'dk', 'fi'] as const
const countries = COUNTRY_LIST.filter(c => (CHART_COUNTRIES as readonly string[]).includes(c.code))

type ValueChainData = {
  country: string
  steps: Array<{
    id: string
    waste_tonnes?: number | null
    waste_per_capita_kg?: number | null
    circularity?: {
      biogas_gwh?: number | null
      biogas_target_gwh?: number | null
      biogas_plants?: number | null
    } | null
    breakdown?: {
      grain_tonnes?: number | null
      [key: string]: unknown
    } | null
    emv_share_pct?: number | null
    employees?: number | null
    co2e_mt?: number | null
    production_value_bn?: number | null
    employment?: {
      agriculture_nace01?: number | null
      food_manufacturing_nace10?: number | null
      beverages_nace11?: number | null
      fisheries_aquaculture_nace03?: number | null
    } | null
  }>
  selfSufficiency?: { caloric_pct?: number | null }
  population?: number
}

const EMV_FALLBACK_PCT: Record<string, number> = {
  no: 33,
  dk: 35,
}

function useValueChainData() {
  const [data, setData] = useState<Record<string, ValueChainData | null>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all(
      CHART_COUNTRIES.map((code) =>
        fetch(`/data/food-systems/${code}/value-chain.json`)
          .then((r) => r.json())
          .then((d: ValueChainData) => [code, d] as const)
          .catch(() => [code, null] as const)
      )
    ).then((results) => {
      setData(Object.fromEntries(results))
      setLoading(false)
    })
  }, [])

  return { data, loading }
}

const CALORIE_KEYS = ['Kalorier', 'Kalorit']

function getSelfSufficiency(code: CountryCode, data: Record<string, CountryChartDataSet | null>): number {
  const entries = data[code]?.selfSufficiency?.data ?? []
  const match = entries.find(e => CALORIE_KEYS.includes(e.name))
  return match?.value ?? 0
}

function getCR3(data: Array<{ value: number }>): number {
  return data
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .reduce((sum, d) => sum + d.value, 0)
}

export function SammenligningContent({ countryChartData }: SammenligningContentProps) {
  const no = useChartMetrics('no')
  const se = useChartMetrics('se')
  const dk = useChartMetrics('dk')
  const fi = useChartMetrics('fi')

  const allMetrics = { no, se, dk, fi }
  const isLoading = no.isLoading || se.isLoading || dk.isLoading || fi.isLoading
  const allLoaded = no.data && se.data && dk.data && fi.data
  const vc = useValueChainData()

  if (isLoading || !allLoaded) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Sammenligning</h1>
          <p className="text-sm text-stone-500 mt-1">Nordisk matmarked pa tvers av land</p>
        </div>
        <div className="py-12 text-center text-sm text-stone-400">Laster data...</div>
      </div>
    )
  }

  const metricsMap = {
    no: no.data!,
    se: se.data!,
    dk: dk.data!,
    fi: fi.data!,
  }

  const hhiData = countries.map(c => ({
    country: c.name,
    flag: c.flag,
    value: metricsMap[c.code as keyof typeof metricsMap].parentCompany.parentHHI,
  }))

  const cr3Data = countries.map(c => {
    const cr3 = getCR3([...metricsMap[c.code as keyof typeof metricsMap].parentCompany.data])
    return {
      country: c.name,
      flag: c.flag,
      value: Math.round(cr3 * 10) / 10,
      label: `${(Math.round(cr3 * 10) / 10).toFixed(1)}%`,
    }
  })

  const giniData = countries.map(c => {
    const gini = metricsMap[c.code as keyof typeof metricsMap].lorenzCurve.gini
    return {
      country: c.name,
      flag: c.flag,
      value: Math.round(gini * 1000) / 1000,
      label: (Math.round(gini * 1000) / 1000).toFixed(3),
    }
  })

  const selfSuffData = countries.map(c => ({
    country: c.name,
    flag: c.flag,
    value: getSelfSufficiency(c.code, countryChartData),
    label: `${getSelfSufficiency(c.code, countryChartData)}%`,
  }))

  const storeData = countries.map(c => ({
    country: c.name,
    flag: c.flag,
    value: metricsMap[c.code as keyof typeof metricsMap].totalStores,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Sammenligning</h1>
        <p className="text-sm text-stone-500 mt-1">Nordisk matmarked pa tvers av land</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComparisonBarChart
          title="HHI per land"
          data={hhiData}
          description="Herfindahl-Hirschman Index for eierkonsentrasjon"
        />
        <ComparisonBarChart
          title="CR3 per land"
          data={cr3Data}
          unit="%"
          description="Markedsandel for de 3 storste aktorene"
        />
        <ComparisonBarChart
          title="Gini per land"
          data={giniData}
          description="Gini-koeffisient for butikkfordeling"
        />
        <ComparisonBarChart
          title="Selvforsyningsgrad"
          data={selfSuffData}
          unit="%"
          description="Kaloribasert selvforsyning"
        />
        <ComparisonBarChart
          title="Antall butikker"
          data={storeData}
          description="Totalt antall dagligvarebutikker"
        />

        {!vc.loading && (() => {
          const biogasData = countries.map(c => {
            const wasteStep = vc.data[c.code]?.steps?.find(s => s.id === 'waste')
            const gwh = wasteStep?.circularity?.biogas_gwh ?? 0
            return { country: c.name, flag: c.flag, value: gwh, label: `${gwh} GWh` }
          })

          const wasteData = countries.map(c => {
            const wasteStep = vc.data[c.code]?.steps?.find(s => s.id === 'waste')
            const kg = (wasteStep as Record<string, number> | undefined)?.waste_per_capita_kg ?? 0
            return { country: c.name, flag: c.flag, value: kg, label: `${kg} kg` }
          })

          const vcSelfSuff = countries.map(c => {
            const pct = vc.data[c.code]?.selfSufficiency?.caloric_pct ?? 0
            return { country: c.name, flag: c.flag, value: Math.min(pct, 150), label: `${pct}%` }
          })

          const biogasPlantsData = countries.map(c => {
            const wasteStep = vc.data[c.code]?.steps?.find(s => s.id === 'waste')
            const plants = wasteStep?.circularity?.biogas_plants ?? 0
            return {
              country: c.name,
              flag: c.flag,
              value: plants,
              label: plants > 0 ? `${plants}` : '—',
            }
          })

          const grainData = countries.map(c => {
            const primary = vc.data[c.code]?.steps?.find(s => s.id === 'primary')
            const tonnes = primary?.breakdown?.grain_tonnes ?? 0
            return {
              country: c.name,
              flag: c.flag,
              value: tonnes,
              label: tonnes > 0 ? `${Math.round(tonnes / 1000).toLocaleString('no')} kt` : '—',
            }
          })

          const emvData = countries.map(c => {
            const processing = vc.data[c.code]?.steps?.find(s => s.id === 'processing')
            const pct = processing?.emv_share_pct ?? EMV_FALLBACK_PCT[c.code] ?? 0
            return {
              country: c.name,
              flag: c.flag,
              value: pct,
              label: pct > 0 ? `${pct}%` : '—',
            }
          })

          const householdWasteData = countries.map(c => {
            const household = vc.data[c.code]?.steps?.find(s => s.id === 'household')
            const kg = (household as Record<string, number> | undefined)?.waste_per_capita_kg ?? 0
            return {
              country: c.name,
              flag: c.flag,
              value: kg,
              label: kg > 0 ? `${kg} kg` : '—',
            }
          })

          const co2Data = countries.map(c => {
            const steps = vc.data[c.code]?.steps ?? []
            const total = steps.reduce((sum, s) => sum + (typeof s.co2e_mt === 'number' ? s.co2e_mt : 0), 0)
            const rounded = Math.round(total * 10) / 10
            return {
              country: c.name,
              flag: c.flag,
              value: rounded,
              label: rounded > 0 ? `${rounded.toFixed(1)} Mt` : '—',
            }
          })

          return (
            <>
              <ComparisonBarChart
                title="Biogassproduksjon"
                data={biogasData}
                unit="GWh"
                description="Arlig biogassproduksjon fra matavfall og manure"
              />
              <ComparisonBarChart
                title="Matsvinn per innbygger"
                data={wasteData}
                unit="kg"
                description="Totalt matsvinn per capita (alle verdikjedeledd)"
              />
              <ComparisonBarChart
                title="Selvforsyningsgrad (verdikjede)"
                data={vcSelfSuff}
                unit="%"
                description="Kaloribasert selvforsyning fra verdikjededata"
              />
              <ComparisonBarChart
                title="Biogassanlegg"
                data={biogasPlantsData}
                description="Antall biogassanlegg i drift"
              />
              <ComparisonBarChart
                title="Kornproduksjon"
                data={grainData}
                unit="kt"
                description="Arlig kornproduksjon (tusen tonn, alle sorter)"
              />
              <ComparisonBarChart
                title="EMV-andel i foredling"
                data={emvData}
                unit="%"
                description="Egen merkevare som andel av næringsmiddel (DK/NO er estimat fra bransjenotater)"
              />
              <ComparisonBarChart
                title="Husholdningsmatsvinn per capita"
                data={householdWasteData}
                unit="kg"
                description="Matsvinn fra husholdninger (kg per innbygger per ar)"
              />
              <ComparisonBarChart
                title="CO2e fra verdikjeden"
                data={co2Data}
                unit="Mt CO2e"
                description="Sum rapporterte utslipp pr. ledd (kun land med tall, f.eks. NO)"
              />
            </>
          )
        })()}

        <Card>
          <h3 className="text-sm font-semibold text-stone-700 mb-3">Oppsummeringstabell</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 pr-3 text-stone-500 font-medium" />
                  {countries.map(c => (
                    <th key={c.code} className="text-right py-2 px-2 text-stone-700 font-semibold">
                      {c.flag} {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="py-2 pr-3 text-stone-500">Butikker</td>
                  {countries.map(c => (
                    <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                      {metricsMap[c.code as keyof typeof metricsMap].totalStores.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-stone-500">HHI</td>
                  {countries.map(c => (
                    <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                      {metricsMap[c.code as keyof typeof metricsMap].parentCompany.parentHHI.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-stone-500">CR3</td>
                  {countries.map(c => {
                    const cr3 = getCR3([...metricsMap[c.code as keyof typeof metricsMap].parentCompany.data])
                    return (
                      <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                        {(Math.round(cr3 * 10) / 10).toFixed(1)}%
                      </td>
                    )
                  })}
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-stone-500">Gini</td>
                  {countries.map(c => (
                    <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                      {metricsMap[c.code as keyof typeof metricsMap].lorenzCurve.gini.toFixed(3)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-stone-500">Selvforsyning</td>
                  {countries.map(c => (
                    <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                      {getSelfSufficiency(c.code, countryChartData)}%
                    </td>
                  ))}
                </tr>
                {!vc.loading && (
                  <>
                    <tr>
                      <td className="py-2 pr-3 text-stone-500">Biogass (GWh)</td>
                      {countries.map(c => {
                        const wasteStep = vc.data[c.code]?.steps?.find(s => s.id === 'waste')
                        const gwh = wasteStep?.circularity?.biogas_gwh ?? 0
                        return (
                          <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                            {gwh.toLocaleString()}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-stone-500">Biogassanlegg</td>
                      {countries.map(c => {
                        const wasteStep = vc.data[c.code]?.steps?.find(s => s.id === 'waste')
                        const plants = wasteStep?.circularity?.biogas_plants ?? null
                        return (
                          <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                            {plants == null ? '—' : plants.toLocaleString()}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-stone-500">Kornproduksjon (kt)</td>
                      {countries.map(c => {
                        const primary = vc.data[c.code]?.steps?.find(s => s.id === 'primary')
                        const tonnes = primary?.breakdown?.grain_tonnes ?? null
                        return (
                          <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                            {tonnes == null ? '—' : Math.round(tonnes / 1000).toLocaleString('no')}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-stone-500">EMV-andel</td>
                      {countries.map(c => {
                        const processing = vc.data[c.code]?.steps?.find(s => s.id === 'processing')
                        const pct = processing?.emv_share_pct ?? EMV_FALLBACK_PCT[c.code] ?? null
                        return (
                          <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                            {pct == null ? '—' : `${pct}%`}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-stone-500">Husholdningssvinn/capita</td>
                      {countries.map(c => {
                        const household = vc.data[c.code]?.steps?.find(s => s.id === 'household')
                        const kg = (household as Record<string, number> | undefined)?.waste_per_capita_kg ?? null
                        return (
                          <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                            {kg == null ? '—' : `${kg} kg`}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-stone-500">Matsvinn totalt/capita</td>
                      {countries.map(c => {
                        const wasteStep = vc.data[c.code]?.steps?.find(s => s.id === 'waste')
                        const kg = (wasteStep as Record<string, number> | undefined)?.waste_per_capita_kg ?? null
                        return (
                          <td key={c.code} className="text-right py-2 px-2 text-stone-700 tabular-nums">
                            {kg == null ? '—' : `${kg} kg`}
                          </td>
                        )
                      })}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
