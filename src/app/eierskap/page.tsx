import { getOwnershipMap } from '@/lib/queries/ownership'
import { EierskapContent } from './EierskapContent'

export default async function EierskapPage() {
  const data = await getOwnershipMap()
  return <EierskapContent data={data} />
}
