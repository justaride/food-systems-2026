import {
  getSupplyChainGraph,
  getPrimaryProducerDeliveries,
  getSupplyChainDataQuality,
  getImportVulnerabilityData,
  getCircularReturnFlowData,
  getInfrastructureData,
} from '@/lib/queries/supply-chain'
import { ForsyningskjedeContent } from './ForsyningskjedeContent'

export default async function ForsyningskjedePage() {
  const [
    data,
    deliveries,
    quality,
    importVulnerability,
    circularReturnFlows,
    infrastructure,
  ] = await Promise.all([
    getSupplyChainGraph(),
    getPrimaryProducerDeliveries(),
    getSupplyChainDataQuality(),
    getImportVulnerabilityData(),
    getCircularReturnFlowData(),
    getInfrastructureData(),
  ])
  return (
    <ForsyningskjedeContent
      data={data}
      deliveries={deliveries}
      quality={quality}
      importVulnerability={importVulnerability}
      circularReturnFlows={circularReturnFlows}
      infrastructure={infrastructure}
    />
  )
}
