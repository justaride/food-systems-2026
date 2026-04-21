import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const BASE = 'https://api.fiskeridir.no/aqua-portal-api-public/api/v1'

type ApplicationSummary = {
  applicationNo: string
  createdAt?: string
  submittedAt?: string
  withdrawnAt?: string
  status?: string
  applicantOrganisationNumber?: string
  applicantOrganisationName?: string
  type?: string
  title?: string
}

type EvaluationResponse = {
  applicationNo?: string
  result?: string
  evaluationFinishedAt?: string
}

type PagedApplications = {
  content?: ApplicationSummary[]
  totalElements?: number
  totalPages?: number
  number?: number
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`)
  return (await res.json()) as T
}

async function fetchAllApplicationsForOrgNr(orgNr: string) {
  const results: ApplicationSummary[] = []
  let page = 0
  while (true) {
    const url = `${BASE}/applications?applicantOrganisationNumber=${orgNr}&page=${page}&size=50&sort=createdAt,desc`
    const data = await fetchJson<PagedApplications>(url).catch(() => null)
    if (!data) break
    const content = data.content ?? []
    results.push(...content)
    if (content.length < 50 || page >= (data.totalPages ?? 1) - 1) break
    page++
  }
  return results
}

async function fetchEvaluation(applicationNo: string): Promise<EvaluationResponse | null> {
  try {
    return await fetchJson<EvaluationResponse>(`${BASE}/evaluation/${applicationNo}`)
  } catch {
    return null
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const stageArg = process.argv.find(a => a.startsWith('--stage='))
  const stage = stageArg ? stageArg.split('=')[1] : 'seafood'
  const skipEvaluations = process.argv.includes('--skip-evaluations')

  const companies = await prisma.company.findMany({
    where: { valueChainStage: stage, country: 'NO' },
    select: { id: true, orgNr: true, name: true },
  })

  console.log(
    `[soknader] pulling applications for ${companies.length} companies${dryRun ? ' (DRY RUN)' : ''}`
  )

  let totalApps = 0
  let totalWritten = 0

  for (const company of companies) {
    const apps = await fetchAllApplicationsForOrgNr(company.orgNr)
    if (apps.length === 0) continue
    totalApps += apps.length
    console.log(`[soknader] ${company.name}: ${apps.length} applications`)

    if (dryRun) continue

    for (const app of apps) {
      const evaluation = skipEvaluations ? null : await fetchEvaluation(app.applicationNo)
      await prisma.aquacultureApplication.upsert({
        where: { applicationNo: app.applicationNo },
        create: {
          applicationNo: app.applicationNo,
          companyId: company.id,
          applicantOrgNr: app.applicantOrganisationNumber ?? company.orgNr,
          applicantName: app.applicantOrganisationName,
          applicationType: app.type,
          title: app.title,
          status: app.status,
          result: evaluation?.result,
          submittedAt: app.submittedAt ? new Date(app.submittedAt) : undefined,
          createdAt: app.createdAt ? new Date(app.createdAt) : undefined,
          withdrawnAt: app.withdrawnAt ? new Date(app.withdrawnAt) : undefined,
          evaluationFinishedAt: evaluation?.evaluationFinishedAt
            ? new Date(evaluation.evaluationFinishedAt)
            : undefined,
          source: 'Fiskeridirektoratet aqua-portal',
          metadata: { raw: JSON.parse(JSON.stringify(app)) } as any,
        },
        update: {
          companyId: company.id,
          status: app.status,
          result: evaluation?.result,
          withdrawnAt: app.withdrawnAt ? new Date(app.withdrawnAt) : undefined,
          evaluationFinishedAt: evaluation?.evaluationFinishedAt
            ? new Date(evaluation.evaluationFinishedAt)
            : undefined,
          metadata: { raw: JSON.parse(JSON.stringify(app)) } as any,
        },
      })
      totalWritten++
    }
  }

  console.log(`[soknader] done: totalApps=${totalApps} written=${totalWritten}`)
}

main()
  .catch(err => {
    console.error('[soknader] import failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
