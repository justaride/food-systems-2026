import { getCountryChartData } from '@/lib/queries/country-metrics'
import { SammenligningContent } from './SammenligningContent'

export default async function SammenligningPage() {
  const [no, se, dk, fi, is] = await Promise.all([
    getCountryChartData('no'),
    getCountryChartData('se'),
    getCountryChartData('dk'),
    getCountryChartData('fi'),
    getCountryChartData('is'),
  ])
  return <SammenligningContent countryChartData={{ no, se, dk, fi, is }} />
}
