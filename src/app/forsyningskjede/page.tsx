import {
  getSupplyChainGraph,
  getPrimaryProducerDeliveries,
} from '@/lib/queries/supply-chain'
import { ForsyningskjedeContent } from './ForsyningskjedeContent'

export default async function ForsyningskjedePage() {
  const [data, deliveries] = await Promise.all([
    getSupplyChainGraph(),
    getPrimaryProducerDeliveries(),
  ])
  return <ForsyningskjedeContent data={data} deliveries={deliveries} />
}
