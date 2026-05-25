import { getKonsernIndex } from '@/lib/queries/ownership'
import { EierskapContent } from './EierskapContent'

export default async function EierskapPage() {
  const konserner = await getKonsernIndex()
  return <EierskapContent konserner={konserner} />
}
