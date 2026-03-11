export type TeamRole = 'lead' | 'ceo' | 'project-leader' | 'partner' | 'team'

export type ApplicationStatus = 'avslatt' | 'innvilget' | 'pagaende'

export type StepStatus = 'ikke-startet' | 'pagar' | 'fullfort'

export type DocStatus = 'ikke-startet' | 'utkast' | 'ferdig'

export type TaskPriority = 'hoy' | 'middels' | 'lav'

export type TaskStatus = 'ikke-startet' | 'pagar' | 'fullfort'

export type SourceType = 
  | 'soknad' 
  | 'notat' 
  | 'transkripsjon' 
  | 'strategi' 
  | 'epost' 
  | 'arbeidsdok' 
  | 'duplikat'
  | 'nou'
  | 'rapport'
  | 'masteroppgave'
  | 'statistikk'
  | 'lovverk'
  | 'analyse'
  | 'årsrapport'

export type PhaseStatus = 'ikke-startet' | 'pagar' | 'fullfort'

export type TeamMember = {
  id: string
  name: string
  role: TeamRole
  title: string
  organization: string
}

export type ApplicationPhase = {
  name: string
  months: string
}

export type Application = {
  id: string
  title: string
  year: number
  status: ApplicationStatus
  budget: string
  partners: string[]
  phases: ApplicationPhase[]
  scope: string
}

export type TenStep = {
  step: number
  theme: string
  output: string
  status: StepStatus
}

export type KPI = {
  id: string
  name: string
  description: string
  current?: string
  target?: string
}

export type EvidenceDoc = {
  id: string
  name: string
  status: DocStatus
}

export type Deliverable = {
  id: string
  name: string
  deadline: string
  status: TaskStatus
}

export type ProjectTask = {
  id: string
  title: string
  source: string
  status: TaskStatus
  priority: TaskPriority
  phase?: string
}

export type SourceDoc = {
  id: string
  filename: string
  title?: string
  author?: string
  year?: number | string
  type: SourceType
  description: string
  relevance: string
  url?: string
  isDuplicate?: boolean
}

export type Phase = {
  id: string
  name: string
  weeks: string
  items: string[]
  status: PhaseStatus
}
