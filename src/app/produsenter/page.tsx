import {
  getLandbruksregisterCompanyCount,
  getProducers,
  getProducerCount,
} from '@/lib/queries/producers'
import { ProdusenterContent } from './ProdusenterContent'

export const metadata = { title: 'Produsentregister - Food Systems 2026' }

export default async function ProdusenterPage() {
  const [producers, total, landbruksregisterCompanyCount] = await Promise.all([
    getProducers({ take: 100 }),
    getProducerCount(),
    getLandbruksregisterCompanyCount(),
  ])

  return (
    <ProdusenterContent
      producers={producers}
      total={total}
      landbruksregisterCompanyCount={landbruksregisterCompanyCount}
    />
  )
}
