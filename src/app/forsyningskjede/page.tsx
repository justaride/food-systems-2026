import { getSupplyChainGraph } from '@/lib/queries/supply-chain'
import { ForsyningskjedeContent } from './ForsyningskjedeContent'

export default async function ForsyningskjedePage() {
  const data = await getSupplyChainGraph()
  return <ForsyningskjedeContent data={data} />
}
