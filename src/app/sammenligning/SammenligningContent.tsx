'use client'

import { Card } from '@/components/ui/Card'
import { COUNTRY_LIST } from '@/lib/config/countries'
import { useChartMetrics } from '@/lib/hooks/useChartMetrics'
import { ComparisonBarChart } from '@/components/charts/ComparisonBarChart'
import type { CountryCode } from '@/lib/config/countries'
import type { CountryChartDataSet } from '@/lib/queries/country-metrics'

type SammenligningContentProps = {
  countryChartData: Record<string, CountryChartDataSet | null>
}

const countries = COUNTRY_LIST.filter(c => c.code !== 'is')

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
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
