import { getActors } from '@/lib/queries/actors'
import { AktorerContent } from './AktorerContent'

export default async function AktorerPage() {
  const actors = await getActors()
  return <AktorerContent actors={actors} />
}
