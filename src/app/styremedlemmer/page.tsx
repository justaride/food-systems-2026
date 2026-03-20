import { getInterlockGraph } from '@/lib/queries/interlocks'
import { InterlockContent } from './InterlockContent'

export default async function StyremedlemmerPage() {
  const data = await getInterlockGraph()
  return <InterlockContent data={data} />
}
