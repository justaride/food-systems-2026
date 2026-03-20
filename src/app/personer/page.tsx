import { getPersonProfiles } from '@/lib/queries/persons'
import { PersonerContent } from './PersonerContent'

export default async function PersonerPage() {
  const persons = await getPersonProfiles()
  return <PersonerContent persons={persons} />
}
