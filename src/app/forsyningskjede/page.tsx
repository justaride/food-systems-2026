import {
  getSupplyChainGraph,
  getPrimaryProducerDeliveries,
  getSupplyChainDataQuality,
} from '@/lib/queries/supply-chain'
import { ForsyningskjedeContent } from './ForsyningskjedeContent'

export default async function ForsyningskjedePage() {
  const [data, deliveries, quality] = await Promise.all([
    getSupplyChainGraph(),
    getPrimaryProducerDeliveries(),
    getSupplyChainDataQuality(),
  ])
  return <ForsyningskjedeContent data={data} deliveries={deliveries} quality={quality} />
}
