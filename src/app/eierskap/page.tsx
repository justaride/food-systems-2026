export const metadata = { title: 'Eierskap og konsernstrukturer — Food Systems 2026' }

import { getKonsernIndex } from '@/lib/queries/ownership'
import { EierskapContent } from './EierskapContent'

export default async function EierskapPage() {
  const konserner = await getKonsernIndex()
  return <EierskapContent konserner={konserner} />
}
