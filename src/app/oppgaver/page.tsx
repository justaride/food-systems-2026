import { getTasks } from '@/lib/queries/project'
import { OppgaverContent } from './OppgaverContent'

export default async function OppgaverPage() {
  const tasks = await getTasks()
  return <OppgaverContent tasks={tasks} />
}
