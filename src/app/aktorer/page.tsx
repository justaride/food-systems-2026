export const metadata = { title: 'Aktørkart — Food Systems 2026' }

import { getActorCatalogPage } from '@/lib/queries/catalog-pages'
import { AktorerContent } from './AktorerContent'
export default async function AktorerPage() {
  return <AktorerContent initial={await getActorCatalogPage()} />
}
