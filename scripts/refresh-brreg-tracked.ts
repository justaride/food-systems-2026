import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const dryRun = process.argv.includes('--dry-run')
const BRREG_BASE = 'https://data.brreg.no/enhetsregisteret/api/enheter'
const NORWEGIAN_ORGNR_RE = /^\d{9}$/
const DELAY_MS = 100

type BrregAddress = {
  adresse?: string[]
  postnummer?: string
  poststed?: string
}

type BrregEntity = {
  organisasjonsnummer: string
  navn: string
  naeringskode1?: {
    kode?: string
    beskrivelse?: string
  }
  antallAnsatte?: number
  forretningsadresse?: BrregAddress
  konkurs?: boolean
  underAvvikling?: boolean
  slettedato?: string
}

type CompanyUpdate = {
  naceCode?: string
  naceDescription?: string
  hqAddress?: string
  hqCity?: string
  employees?: number
  metadata?: Record<string, unknown>
  lastBrregRefreshAt: Date
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatAddress(addr: BrregAddress): string {
  const parts: string[] = []
  if (addr.adresse && addr.adresse.length > 0) {
    parts.push(addr.adresse.join(', '))
  }
  if (addr.postnummer) parts.push(addr.postnummer)
  if (addr.poststed) parts.push(addr.poststed)
  return parts.join(' ')
}

function deriveStatus(entity: BrregEntity): string | null {
  if (entity.slettedato) return `slettet:${entity.slettedato}`
  if (entity.konkurs) return 'konkurs'
  if (entity.underAvvikling) return 'under-avvikling'
  return null
}

async function fetchBrreg(
  orgNr: string,
): Promise<{ data: BrregEntity | null; status: 'ok' | 'not-found' | 'error'; httpStatus: number }> {
  const url = `${BRREG_BASE}/${orgNr}`
  let resp: Response
  try {
    resp = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'food-systems-2026-brreg-refresh/0.1.0',
      },
    })
  } catch (err) {
    return { data: null, status: 'error', httpStatus: 0 }
  }

  if (resp.status === 404 || resp.status === 410) {
    return { data: null, status: 'not-found', httpStatus: resp.status }
  }

  if (!resp.ok) {
    return { data: null, status: 'error', httpStatus: resp.status }
  }

  try {
    const data = (await resp.json()) as BrregEntity
    return { data, status: 'ok', httpStatus: resp.status }
  } catch {
    return { data: null, status: 'error', httpStatus: resp.status }
  }
}

function buildUpdate(entity: BrregEntity): CompanyUpdate {
  const update: CompanyUpdate = {
    lastBrregRefreshAt: new Date(),
  }

  if (entity.naeringskode1?.kode) {
    update.naceCode = entity.naeringskode1.kode
  }
  if (entity.naeringskode1?.beskrivelse) {
    update.naceDescription = entity.naeringskode1.beskrivelse
  }

  if (entity.forretningsadresse) {
    const addr = entity.forretningsadresse
    update.hqAddress = formatAddress(addr)
    if (addr.poststed) {
      update.hqCity = addr.poststed
    }
  }

  if (typeof entity.antallAnsatte === 'number') {
    update.employees = entity.antallAnsatte
  }

  // Store derived status in metadata since Company has no direct status field
  const derivedStatus = deriveStatus(entity)
  if (derivedStatus) {
    update.metadata = { brregStatus: derivedStatus }
  }

  return update
}

async function main() {
  const companies = await prisma.company.findMany({
    select: { id: true, orgNr: true, name: true },
  })

  const norwegian: typeof companies = []
  const skipped: typeof companies = []

  for (const c of companies) {
    if (NORWEGIAN_ORGNR_RE.test(c.orgNr)) {
      norwegian.push(c)
    } else {
      skipped.push(c)
    }
  }

  console.log(
    `\nBRREG refresh${dryRun ? ' (DRY RUN)' : ''}: ${norwegian.length} Norwegian, ${skipped.length} skipped (non-NO orgnr)\n`,
  )

  let succeeded = 0
  let notFound = 0
  let errors = 0

  for (const company of norwegian) {
    const orgNr = company.orgNr

    const { data, status, httpStatus } = await fetchBrreg(orgNr)

    if (status === 'not-found') {
      console.log(`  [404/${httpStatus}] ${orgNr} – ${company.name} (deregistered/slettet)`)
      if (!dryRun) {
        await prisma.company.update({
          where: { id: company.id },
          data: {
            lastBrregRefreshAt: new Date(),
            metadata: { brregStatus: 'slettet' },
          },
        })
      }
      notFound++
    } else if (status === 'error') {
      console.error(`  [ERROR/${httpStatus}] ${orgNr} – ${company.name}`)
      errors++
    } else if (data) {
      const update = buildUpdate(data)

      if (dryRun) {
        console.log(`  [DRY-RUN] ${orgNr} – ${company.name}`)
        console.log(`    naceCode: ${update.naceCode ?? '—'}`)
        console.log(`    naceDescription: ${update.naceDescription ?? '—'}`)
        console.log(`    hqAddress: ${update.hqAddress ?? '—'}`)
        console.log(`    hqCity: ${update.hqCity ?? '—'}`)
        console.log(`    employees: ${update.employees ?? '—'}`)
        if (update.metadata) {
          console.log(`    metadata: ${JSON.stringify(update.metadata)}`)
        }
      } else {
        await prisma.company.update({
          where: { id: company.id },
          data: update,
        })
        console.log(`  [OK] ${orgNr} – ${company.name}`)
      }
      succeeded++
    }

    await sleep(DELAY_MS)
  }

  console.log(`\n--- Summary ---`)
  console.log(`  Norwegian orgnrs processed: ${norwegian.length}`)
  console.log(`  Succeeded:                  ${succeeded}`)
  console.log(`  Not found (404/410):        ${notFound}`)
  console.log(`  Errors:                     ${errors}`)
  console.log(`  Skipped (non-NO orgnr):     ${skipped.length}`)
  if (dryRun) {
    console.log(`  (dry-run — no DB writes)`)
  }
}

main().finally(() => prisma.$disconnect())
