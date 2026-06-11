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
  | 'forskning'
  | 'datasett'
  | 'initiativ'

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
  methodology?: string
  description?: string
}

export type KPI = {
  id: string
  name: string
  description: string
  current?: string
  target?: string
  secondary?: string
  source?: {
    label: string
    year: string | number
    href: string
    lastVerified: string
    sourceId?: string
  }
  definition?: string
  unit?: string
  geography?: string
  dataOwner?: string
  frequency?: string
  baseline?: string
  systemBoundary?: string
  claimGate?: string
  caveat?: string
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
  doi?: string
  publisher?: string
  // ISO date string for when the URL was last accessed/verified.
  // Aligns with Prisma SourceDoc.accessedAt (DateTime?).
  accessedAt?: string
  // Wayback Machine snapshot URL for the source.
  // Aligns with Prisma SourceDoc.archivedUrl (String?).
  archivedUrl?: string
}

export type PhaseId = 'fase-1' | 'fase-2' | 'fase-3' | 'fase-4'

export type Phase = {
  id: string
  name: string
  weeks: string
  items: string[]
  status: PhaseStatus
}

export type InsightType = 'notat' | 'kartlegging' | 'analyse' | 'funn' | 'lenke'

export type Insight = {
  id: string
  title: string
  description: string
  type: InsightType
  source: string
  phase?: PhaseId
  tags?: string[]
  url?: string
  date: string
  sources?: SourceRef[]
}

export type SourceRef = {
  sourceId?: string
  label: string
  url?: string
  note?: string
}

export type ResearchCategory =
  | 'boker-akademisk'
  | 'forskningsartikler'
  | 'naeringspublikasjoner'
  | 'offentlige-rapporter'
  | 'regulatorisk'
  | 'nordisk-komparativ'
  | 'matsikkerhet'
  | 'matsvinn-sirkulaer'
  | 'logistikk-verdikjede'
  | 'interessenter'
  | 'finansiering'
  | 'mediedebatt'

export type ResearchModel = 'chatgpt-deep-research' | 'gemini-deep-research' | 'perplexity' | 'claude'

export type ResearchPromptStatus = 'aktiv' | 'delvis' | 'arkivert' | 'erstattet'

export type ResearchPrompt = {
  id: string
  category: ResearchCategory
  title: string
  prompt: string
  model: ResearchModel
  expectedOutput: string
  language: 'no' | 'en'
  status: ResearchPromptStatus
}

export type ThesisTheme =
  | 'konsentrasjon' | 'makt' | 'etableringshindringer'
  | 'regulering' | 'verdikjede' | 'prising' | 'emv' | 'nordisk'
  | 'matsvinn' | 'sirkulaer' | 'offentlig-innkjop' | 'atferd' | 'emballasje' | 'okologi'
  | 'beredskap' | 'digital' | 'selvforsyning' | 'klima' | 'protein' | 'logistikk'

export type ThesisDegree = 'master' | 'phd'

export type ThesisProvenanceType =
  | 'external_thesis'
  | 'working_paper'
  | 'conference_paper'
  | 'external_article'

export type Thesis = {
  id: string
  authors: string
  institution: string
  year: number
  title: string
  titleNo?: string
  url: string
  synthesis: string
  keyFindings: string[]
  tags: ThesisTheme[]
  takeaways: string[]
  method?: string
  awardWinning?: boolean
  degree: ThesisDegree
  doi?: string
  isbn?: string
  publisher?: string
  accessDate?: string
  provenanceType?: ThesisProvenanceType
}

export type ReportCategory =
  | 'nou' | 'konkurransetilsyn' | 'bransje' | 'offentlig'
  | 'konsulentrapport' | 'akademia' | 'tenketank'
  | 'juridisk' | 'beredskap' | 'sirkularitet' | 'oversikt'

export type ReportProvenanceType =
  | 'external_report'
  | 'external_article'
  | 'internal_synthesis'
  | 'internal_register'
  | 'composite_source'
  | 'blocked_source'

export type ReportSupportingSource = {
  label: string
  url?: string
  reportId?: string
  documentPath?: string
  note?: string
}

export type Report = {
  id: string
  title: string
  fullTitle?: string
  author?: string
  institution?: string
  date?: string
  year?: number
  sourceUrl?: string
  reportCategory: ReportCategory
  country?: string
  keyFindings: string[]
  recommendations: string[]
  relevance: string
  tags: string[]
  doi?: string
  isbn?: string
  issn?: string
  publisher?: string
  provenanceType?: ReportProvenanceType
  supportingSources?: ReportSupportingSource[]
}

export type CommType = 'epost' | 'melding' | 'brev'

export type Communication = {
  id: string
  title: string
  summary: string
  type: CommType
  from: string
  to: string | string[]
  date: string
  tags?: string[]
}
