import { getProducers, getProducerCount } from '@/lib/queries/producers'
import { ProdusenterContent } from './ProdusenterContent'

export const metadata = { title: 'Produsentregister - Food Systems 2026' }

export default async function ProdusenterPage() {
  const [producers, total] = await Promise.all([getProducers({ take: 100 }), getProducerCount()])
  return <ProdusenterContent producers={producers} total={total} />
}
