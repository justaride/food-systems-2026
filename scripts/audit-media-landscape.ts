import 'dotenv/config'
import { accessSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { COUNTRY_LIST } from '../src/lib/config/countries'
import {
  mediaCountryProfiles,
  mediaInternalSources,
  mediaThemes,
  mediaTimeline,
  mediaYears,
} from '../src/lib/data/media-landscape'
import {
  mediaEntries,
  mediaEntryCodings,
  mediaOutlets,
} from '../src/lib/data/media-corpus'
import { sources } from '../src/lib/data/sources'

type Check = {
  ok: boolean
  message: string
}

function pass(message: string): Check {
  return { ok: true, message }
}

function fail(message: string): Check {
  return { ok: false, message }
}

function printSection(title: string) {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))
}

function printChecks(checks: Check[]) {
  for (const check of checks) {
    console.log(`  ${check.ok ? 'OK ' : 'FAIL'} ${check.message}`)
  }
}

function arraysEqual<T>(left: T[], right: T[]) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function extractAccentKeys(pageText: string) {
  const match = pageText.match(/const countryAccentClass:[\s\S]*?=\s*\{([\s\S]*?)\}\n/m)
  if (!match) return []
  return [...match[1].matchAll(/\b([A-Z]{2})\s*:/g)].map(entry => entry[1])
}

function collectSourceIds(value: unknown, found = new Set<string>()) {
  if (Array.isArray(value)) {
    for (const item of value) collectSourceIds(item, found)
    return found
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.sourceId === 'string') found.add(record.sourceId)
    for (const child of Object.values(record)) collectSourceIds(child, found)
  }

  return found
}

async function runDbChecks() {
  if (!process.env.DATABASE_URL) {
    return [fail('DATABASE_URL mangler; hopper over DB-verifikasjon')]
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const [dbThemes, dbTimeline, dbProfiles, dbOutlets, dbEntries, dbCodings] = await Promise.all([
      prisma.mediaTheme.findMany({ orderBy: { id: 'asc' }, select: { id: true } }),
      prisma.mediaTimelineEntry.findMany({ orderBy: { year: 'asc' }, select: { year: true } }),
      prisma.mediaCountryProfile.findMany({ orderBy: { id: 'asc' }, select: { id: true, iso: true, yearlySignal: true } }),
      prisma.mediaOutlet.findMany({ orderBy: { id: 'asc' }, select: { id: true } }),
      prisma.mediaEntry.findMany({ orderBy: { id: 'asc' }, select: { id: true, country: true } }),
      prisma.mediaEntryCoding.findMany({ orderBy: { entryId: 'asc' }, select: { entryId: true, primaryTheme: true, tone: true, frame: true } }),
    ])

    const checks: Check[] = []
    checks.push(
      arraysEqual(
        dbThemes.map(item => item.id),
        mediaThemes.map(item => item.id).sort(),
      )
        ? pass(`DB themes matcher seed (${dbThemes.length})`)
        : fail('DB themes avviker fra seed'),
    )

    checks.push(
      arraysEqual(
        dbTimeline.map(item => item.year),
        mediaTimeline.map(item => item.year),
      )
        ? pass(`DB timeline matcher seed (${dbTimeline.length} aar)`)
        : fail('DB timeline avviker fra seed'),
    )

    checks.push(
      arraysEqual(
        dbProfiles.map(item => item.id),
        mediaCountryProfiles.map(item => item.id).sort(),
      )
        ? pass(`DB country profiles matcher seed (${dbProfiles.length} land)`)
        : fail('DB country profiles avviker fra seed'),
    )

    checks.push(
      arraysEqual(
        dbOutlets.map(item => item.id),
        mediaOutlets.map(item => item.id).sort(),
      )
        ? pass(`DB media outlets matcher seed (${dbOutlets.length})`)
        : fail('DB media outlets avviker fra seed'),
    )

    checks.push(
      arraysEqual(
        dbEntries.map(item => item.id),
        mediaEntries.map(item => item.id).sort(),
      )
        ? pass(`DB media entries matcher seed (${dbEntries.length})`)
        : fail('DB media entries avviker fra seed'),
    )

    checks.push(
      arraysEqual(
        dbCodings.map(item => `${item.entryId}:${item.primaryTheme}:${item.tone}:${item.frame}`),
        mediaEntryCodings
          .map(item => `${item.entryId}:${item.primaryTheme}:${item.tone}:${item.frame}`)
          .sort(),
      )
        ? pass(`DB media codings matcher seed (${dbCodings.length})`)
        : fail('DB media codings avviker fra seed'),
    )

    for (const profile of dbProfiles) {
      if (profile.yearlySignal.length !== mediaYears.length) {
        checks.push(
          fail(`DB-profil ${profile.id} har ${profile.yearlySignal.length} datapunkter, forventet ${mediaYears.length}`),
        )
      }
    }

    return checks
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  const checks: Check[] = []
  const definedSourceIds = new Set(sources.map(source => source.id))
  const referencedSourceIds = [...collectSourceIds([mediaThemes, mediaTimeline, mediaCountryProfiles, mediaEntries])].sort()
  const missingSourceIds = referencedSourceIds.filter(id => !definedSourceIds.has(id))

  printSection('Static checks')

  checks.push(
    mediaTimeline.length === mediaYears.length
      ? pass(`mediaTimeline dekker hele periodevinduet (${mediaYears[0]}-${mediaYears[mediaYears.length - 1]})`)
      : fail(`mediaTimeline har ${mediaTimeline.length} entries, men mediaYears har ${mediaYears.length}`),
  )

  for (const profile of mediaCountryProfiles) {
    checks.push(
      profile.yearlySignal.length === mediaYears.length
        ? pass(`${profile.id}: yearlySignal har ${mediaYears.length} punkter`)
        : fail(`${profile.id}: yearlySignal har ${profile.yearlySignal.length} punkter, forventet ${mediaYears.length}`),
    )
  }

  checks.push(
    missingSourceIds.length === 0
      ? pass(`Alle ${referencedSourceIds.length} media sourceId-er finnes i src/lib/data/sources.ts`)
      : fail(`Manglende sourceId-er: ${missingSourceIds.join(', ')}`),
  )

  const mediaCountryIds = new Set(mediaCountryProfiles.map(profile => profile.id))
  const projectCountryIds = COUNTRY_LIST.map(country => country.code)
  const missingCountries = projectCountryIds.filter(code => !mediaCountryIds.has(code))
  const extraCountries = [...mediaCountryIds].filter(code => !projectCountryIds.includes(code as typeof projectCountryIds[number]))

  checks.push(
    missingCountries.length === 0
      ? pass('Media-profilene dekker alle land i COUNTRY_LIST')
      : fail(`Media-profilene mangler land fra COUNTRY_LIST: ${missingCountries.join(', ')}`),
  )
  checks.push(
    extraCountries.length === 0
      ? pass('Media-profilene har ingen ukjente landkoder')
      : fail(`Media-profilene har ukjente landkoder: ${extraCountries.join(', ')}`),
  )

  for (const relativePath of mediaInternalSources) {
    try {
      accessSync(join(process.cwd(), relativePath))
      checks.push(pass(`Intern kilde finnes: ${relativePath}`))
    } catch {
      checks.push(fail(`Intern kilde mangler: ${relativePath}`))
    }
  }

  const mediaCorpusCountryIds = new Set(mediaEntries.map(entry => entry.country))
  const missingCorpusCountries = projectCountryIds.filter(code => !mediaCorpusCountryIds.has(code))

  checks.push(
    missingCorpusCountries.length === 0
      ? pass('Media-korpuset har minst ett entry for alle land i COUNTRY_LIST')
      : fail(`Media-korpuset mangler land: ${missingCorpusCountries.join(', ')}`),
  )

  for (const entry of mediaEntries) {
    if (!mediaOutlets.find(outlet => outlet.id === entry.outletId)) {
      checks.push(fail(`Media entry ${entry.id} peker til ukjent outletId ${entry.outletId}`))
    }
  }

  for (const coding of mediaEntryCodings) {
    if (!mediaEntries.find(entry => entry.id === coding.entryId)) {
      checks.push(fail(`Media coding ${coding.entryId}/${coding.primaryTheme} peker til ukjent entryId`))
    }
  }

  printChecks(checks)

  printSection('Page parity checks')

  const pageText = readFileSync(join(process.cwd(), 'src/app/media/page.tsx'), 'utf8')
  const accentKeys = extractAccentKeys(pageText).sort()
  const profileIsos = [...new Set(mediaCountryProfiles.map(profile => profile.iso))].sort()

  const parityChecks: Check[] = [
    pageText.includes("from '@/lib/data/media-landscape'")
      ? pass('page.tsx importerer felles media-consts fra data-laget')
      : fail('page.tsx ser ikke ut til aa importere felles media-consts'),
    profileIsos.every(iso => accentKeys.includes(iso))
      ? pass('countryAccentClass dekker alle ISO-koder i mediaCountryProfiles')
      : fail(`countryAccentClass mangler ISO-koder: ${profileIsos.filter(iso => !accentKeys.includes(iso)).join(', ')}`),
  ]

  printChecks(parityChecks)

  printSection('DB checks')
  printChecks(await runDbChecks())
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
