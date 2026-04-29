import { getSammenligningData } from '@/lib/queries/sammenligning'
import { SammenligningContent } from './SammenligningContent'

export default async function SammenligningPage() {
  const data = await getSammenligningData()
  return <SammenligningContent data={data} />
}
