import { getDocumentsList } from '@/lib/queries/documents'
import { BibliotekContent } from './BibliotekContent'

export default async function BibliotekPage() {
  const documents = await getDocumentsList()
  return <BibliotekContent documents={documents} />
}
