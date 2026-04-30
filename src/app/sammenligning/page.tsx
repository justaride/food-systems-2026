import { getSammenligningData } from '@/lib/queries/sammenligning'
import { getNorwayMarketShareTimeSeries } from '@/lib/queries/market-share'
import { SammenligningContent } from './SammenligningContent'

export default async function SammenligningPage() {
  const [data, noMarketShare] = await Promise.all([
    getSammenligningData(),
    getNorwayMarketShareTimeSeries(),
  ])
  return <SammenligningContent data={data} noMarketShare={noMarketShare} />
}
