import { getDocumentCatalogPage } from '@/lib/queries/catalog-pages'
import { BibliotekContent } from './BibliotekContent'
export default async function BibliotekPage() {
  return <BibliotekContent initial={await getDocumentCatalogPage()} />
}
