import 'dotenv/config'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { phases } from '../src/lib/data/phases'
import { team } from '../src/lib/data/team'
import { sources } from '../src/lib/data/sources'
import { insights } from '../src/lib/data/insights'
import { theses } from '../src/lib/data/theses'
import { applications } from '../src/lib/data/applications'
import { kpis } from '../src/lib/data/kpis'
import { evidencePack } from '../src/lib/data/evidence-pack'
import { tenSteps } from '../src/lib/data/ten-step-start'
import { meetings, type Meeting } from '../src/lib/data/meetings'
import { communications } from '../src/lib/data/communications'
import { researchPrompts } from '../src/lib/data/research-prompts'
import {
  mediaThemes,
  mediaTimeline,
  mediaCountryProfiles,
} from '../src/lib/data/media-landscape'
import {
  mediaOutlets,
  mediaEntries,
  mediaEntryCodings,
} from '../src/lib/data/media-corpus'
import { countryChartData } from '../src/lib/data/country-chart-data'
import { reports } from '../src/lib/data/reports'
import type { ReportSupportingSource } from '../src/lib/types'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function extractYear(value: string): number | null {
  const match = value.match(/\b(19|20)\d{2}\b/)
  return match ? Number(match[0]) : null
}

function buildMeetingDocument(meeting: Meeting) {
  const filePath = `generated/meetings/${meeting.id}.md`
  const slug = `meeting-${meeting.id}`
  const relatedSources = (meeting.sources ?? []).map(source => {
    const detailParts = [source.note, source.url].filter(Boolean)
    return detailParts.length
      ? `- ${source.label}: ${detailParts.join(' | ')}`
      : `- ${source.label}`
  })

  const content = [
    `# ${meeting.title}`,
    '',
    `- Mote-ID: ${meeting.id}`,
    `- Dato: ${meeting.date}`,
    `- Deltakere: ${meeting.participants.join(', ')}`,
    `- Primarunderlag: ${meeting.source}`,
    '',
    '## Sammendrag',
    meeting.summary,
    '',
    '## Beslutninger',
    ...meeting.keyDecisions.map(item => `- ${item}`),
    '',
    '## Aksjonspunkter',
    ...meeting.actionItems.map(item => `- ${item}`),
    '',
    '## Nokkelfunn',
    ...meeting.keyInsights.map(item => `- ${item}`),
    '',
    '## Kildegrunnlag',
    `- Primarunderlag: ${meeting.source}`,
    ...relatedSources,
  ].join('\n')

  return {
    filePath,
    slug,
    content,
    wordCount: content.split(/\s+/).filter(Boolean).length,
    year: extractYear(meeting.date),
  }
}

async function importPhases() {
  console.log('Importing phases...')
  for (const p of phases) {
    await prisma.phase.upsert({
      where: { id: p.id },
      update: { name: p.name, weeks: p.weeks, items: p.items, status: p.status },
      create: { id: p.id, name: p.name, weeks: p.weeks, items: p.items, status: p.status },
    })
  }
  console.log(`  ${phases.length} phases imported`)
}

async function importTeam() {
  console.log('Importing team members...')
  for (const t of team) {
    await prisma.teamMember.upsert({
      where: { id: t.id },
      update: { name: t.name, role: t.role, title: t.title, organization: t.organization },
      create: { id: t.id, name: t.name, role: t.role, title: t.title, organization: t.organization },
    })
  }
  console.log(`  ${team.length} team members imported`)
}

async function importSources() {
  console.log('Importing sources...')
  for (const s of sources) {
    await prisma.sourceDoc.upsert({
      where: { id: s.id },
      update: {
        filename: s.filename,
        title: s.title ?? null,
        author: s.author ?? null,
        year: s.year != null ? String(s.year) : null,
        sourceType: s.type,
        description: s.description,
        relevance: s.relevance,
        url: s.url ?? null,
        isDuplicate: s.isDuplicate ?? false,
        doi: s.doi ?? null,
        publisher: s.publisher ?? null,
      },
      create: {
        id: s.id,
        filename: s.filename,
        title: s.title ?? null,
        author: s.author ?? null,
        year: s.year != null ? String(s.year) : null,
        sourceType: s.type,
        description: s.description,
        relevance: s.relevance,
        url: s.url ?? null,
        isDuplicate: s.isDuplicate ?? false,
        doi: s.doi ?? null,
        publisher: s.publisher ?? null,
      },
    })
  }
  console.log(`  ${sources.length} sources imported`)
}

async function importInsights() {
  console.log('Importing insights...')
  for (const i of insights) {
    await prisma.insight.upsert({
      where: { id: i.id },
      update: {
        title: i.title,
        description: i.description,
        insightType: i.type,
        source: i.source,
        phaseId: i.phase ?? null,
        tags: i.tags ?? [],
        url: i.url ?? null,
        date: i.date,
      },
      create: {
        id: i.id,
        title: i.title,
        description: i.description,
        insightType: i.type,
        source: i.source,
        phaseId: i.phase ?? null,
        tags: i.tags ?? [],
        url: i.url ?? null,
        date: i.date,
      },
    })

    if (i.sources) {
      for (const sr of i.sources) {
        const existing = await prisma.sourceRef.findFirst({
          where: {
            insightId: i.id,
            label: sr.label,
            sourceDocId: sr.sourceId ?? null,
          },
        })
        if (!existing) {
          await prisma.sourceRef.create({
            data: {
              sourceDocId: sr.sourceId ?? null,
              label: sr.label,
              url: sr.url ?? null,
              note: sr.note ?? null,
              insightId: i.id,
            },
          })
        }
      }
    }
  }
  console.log(`  ${insights.length} insights imported`)
}

async function importTheses() {
  console.log('Importing theses...')
  for (const t of theses) {
    await prisma.thesis.upsert({
      where: { id: t.id },
      update: {
        authors: t.authors,
        institution: t.institution,
        year: t.year,
        title: t.title,
        titleNo: t.titleNo ?? null,
        url: t.url,
        synthesis: t.synthesis,
        keyFindings: t.keyFindings,
        tags: t.tags,
        takeaways: t.takeaways,
        method: t.method ?? null,
        awardWinning: t.awardWinning ?? false,
        degree: t.degree,
        doi: t.doi ?? null,
        isbn: t.isbn ?? null,
        publisher: t.publisher ?? null,
        accessDate: t.accessDate ?? null,
      },
      create: {
        id: t.id,
        authors: t.authors,
        institution: t.institution,
        year: t.year,
        title: t.title,
        titleNo: t.titleNo ?? null,
        url: t.url,
        synthesis: t.synthesis,
        keyFindings: t.keyFindings,
        tags: t.tags,
        takeaways: t.takeaways,
        method: t.method ?? null,
        awardWinning: t.awardWinning ?? false,
        degree: t.degree,
        doi: t.doi ?? null,
        isbn: t.isbn ?? null,
        publisher: t.publisher ?? null,
        accessDate: t.accessDate ?? null,
      },
    })
  }
  console.log(`  ${theses.length} theses imported`)
}

async function importApplications() {
  console.log('Importing applications...')
  for (const a of applications) {
    await prisma.application.upsert({
      where: { id: a.id },
      update: {
        title: a.title,
        year: a.year,
        status: a.status,
        budget: a.budget,
        partners: a.partners,
        phases: a.phases as unknown as Record<string, unknown>[],
        scope: a.scope,
      },
      create: {
        id: a.id,
        title: a.title,
        year: a.year,
        status: a.status,
        budget: a.budget,
        partners: a.partners,
        phases: a.phases as unknown as Record<string, unknown>[],
        scope: a.scope,
      },
    })
  }
  console.log(`  ${applications.length} applications imported`)
}

async function importKPIs() {
  console.log('Importing KPIs...')
  for (const k of kpis) {
    await prisma.kPI.upsert({
      where: { id: k.id },
      update: {
        name: k.name,
        description: k.description,
        current: k.current ?? null,
        target: k.target ?? null,
      },
      create: {
        id: k.id,
        name: k.name,
        description: k.description,
        current: k.current ?? null,
        target: k.target ?? null,
      },
    })
  }
  console.log(`  ${kpis.length} KPIs imported`)
}

async function importEvidencePack() {
  console.log('Importing evidence docs...')
  for (const e of evidencePack) {
    await prisma.evidenceDoc.upsert({
      where: { id: e.id },
      update: { name: e.name, status: e.status },
      create: { id: e.id, name: e.name, status: e.status },
    })
  }
  console.log(`  ${evidencePack.length} evidence docs imported`)
}

async function importTenSteps() {
  console.log('Importing ten steps...')
  for (const s of tenSteps) {
    await prisma.tenStep.upsert({
      where: { step: s.step },
      update: { theme: s.theme, output: s.output, status: s.status, methodology: s.methodology ?? null, description: s.description ?? null },
      create: { step: s.step, theme: s.theme, output: s.output, status: s.status, methodology: s.methodology ?? null, description: s.description ?? null },
    })
  }
  console.log(`  ${tenSteps.length} ten steps imported`)
}

async function importMeetings() {
  console.log('Importing meetings...')
  for (const m of meetings) {
    const document = buildMeetingDocument(m)

    await prisma.meeting.upsert({
      where: { id: m.id },
      update: {
        date: m.date,
        title: m.title,
        participants: m.participants,
        source: m.source,
        summary: m.summary,
        keyDecisions: m.keyDecisions,
        actionItems: m.actionItems,
        keyInsights: m.keyInsights,
      },
      create: {
        id: m.id,
        date: m.date,
        title: m.title,
        participants: m.participants,
        source: m.source,
        summary: m.summary,
        keyDecisions: m.keyDecisions,
        actionItems: m.actionItems,
        keyInsights: m.keyInsights,
      },
    })

    await prisma.sourceRef.deleteMany({
      where: { meetingId: m.id },
    })

    if (m.sources) {
      for (const sr of m.sources) {
        await prisma.sourceRef.create({
          data: {
            sourceDocId: sr.sourceId ?? null,
            label: sr.label,
            url: sr.url ?? null,
            note: sr.note ?? null,
            meetingId: m.id,
          },
        })
      }
    }

    await prisma.document.upsert({
      where: { filePath: document.filePath },
      update: {
        slug: document.slug,
        title: m.title,
        author: m.participants.join(', '),
        year: document.year,
        documentType: 'meeting-summary',
        category: 'meetings',
        subcategory: 'generated',
        country: null,
        content: document.content,
        summary: m.summary,
        wordCount: document.wordCount,
        tags: ['meeting', 'meeting-summary', m.id],
        metadata: {
          meetingId: m.id,
          source: m.source,
          participants: m.participants,
          generatedFrom: 'src/lib/data/meetings.ts',
        },
      },
      create: {
        slug: document.slug,
        filePath: document.filePath,
        title: m.title,
        author: m.participants.join(', '),
        year: document.year,
        documentType: 'meeting-summary',
        category: 'meetings',
        subcategory: 'generated',
        country: null,
        content: document.content,
        summary: m.summary,
        wordCount: document.wordCount,
        tags: ['meeting', 'meeting-summary', m.id],
        metadata: {
          meetingId: m.id,
          source: m.source,
          participants: m.participants,
          generatedFrom: 'src/lib/data/meetings.ts',
        },
      },
    })
  }
  console.log(`  ${meetings.length} meetings imported`)
}

async function importCommunications() {
  console.log('Importing communications...')
  for (const c of communications) {
    const to = Array.isArray(c.to) ? c.to : [c.to]
    await prisma.communication.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        summary: c.summary,
        commType: c.type,
        sender: c.from,
        recipients: to,
        date: c.date,
        tags: c.tags ?? [],
      },
      create: {
        id: c.id,
        title: c.title,
        summary: c.summary,
        commType: c.type,
        sender: c.from,
        recipients: to,
        date: c.date,
        tags: c.tags ?? [],
      },
    })
  }
  console.log(`  ${communications.length} communications imported`)
}

async function importResearchPrompts() {
  console.log('Importing research prompts...')
  for (const rp of researchPrompts) {
    await prisma.researchPrompt.upsert({
      where: { id: rp.id },
      update: {
        category: rp.category,
        title: rp.title,
        prompt: rp.prompt,
        model: rp.model,
        expectedOutput: rp.expectedOutput,
        language: rp.language,
        status: rp.status,
      },
      create: {
        id: rp.id,
        category: rp.category,
        title: rp.title,
        prompt: rp.prompt,
        model: rp.model,
        expectedOutput: rp.expectedOutput,
        language: rp.language,
        status: rp.status,
      },
    })
  }
  console.log(`  ${researchPrompts.length} research prompts imported`)
}

async function importMediaLandscape() {
  console.log('Importing media landscape...')

  for (const mt of mediaThemes) {
    await prisma.mediaTheme.upsert({
      where: { id: mt.id },
      update: { name: mt.name, description: mt.description, sources: mt.sources ?? null },
      create: { id: mt.id, name: mt.name, description: mt.description, sources: mt.sources ?? null },
    })
  }
  console.log(`  ${mediaThemes.length} media themes imported`)

  for (const te of mediaTimeline) {
    await prisma.mediaTimelineEntry.upsert({
      where: { year: te.year },
      update: { intensity: te.intensity, label: te.label, note: te.note, sources: te.sources ?? null },
      create: { year: te.year, intensity: te.intensity, label: te.label, note: te.note, sources: te.sources ?? null },
    })
  }
  console.log(`  ${mediaTimeline.length} media timeline entries imported`)

  for (const cp of mediaCountryProfiles) {
    await prisma.mediaCountryProfile.upsert({
      where: { id: cp.id },
      update: {
        name: cp.name,
        iso: cp.iso,
        dominantNarrative: cp.dominantNarrative,
        summary: cp.summary,
        strongestPeriod: cp.strongestPeriod,
        keyQuestion: cp.keyQuestion,
        yearlySignal: cp.yearlySignal,
        focusLevels: cp.focusLevels as Record<string, string>,
        triggerMoments: cp.triggerMoments as unknown as Record<string, unknown>[],
        sources: cp.sources ?? null,
      },
      create: {
        id: cp.id,
        name: cp.name,
        iso: cp.iso,
        dominantNarrative: cp.dominantNarrative,
        summary: cp.summary,
        strongestPeriod: cp.strongestPeriod,
        keyQuestion: cp.keyQuestion,
        yearlySignal: cp.yearlySignal,
        focusLevels: cp.focusLevels as Record<string, string>,
        triggerMoments: cp.triggerMoments as unknown as Record<string, unknown>[],
        sources: cp.sources ?? null,
      },
    })
  }
  console.log(`  ${mediaCountryProfiles.length} media country profiles imported`)
}

async function importMediaCorpus() {
  console.log('Importing media evidence corpus...')

  for (const outlet of mediaOutlets) {
    await prisma.mediaOutlet.upsert({
      where: { id: outlet.id },
      update: {
        name: outlet.name,
        country: outlet.country,
        outletType: outlet.outletType,
        language: outlet.language ?? null,
        url: outlet.url ?? null,
        notes: outlet.notes ?? null,
      },
      create: {
        id: outlet.id,
        name: outlet.name,
        country: outlet.country,
        outletType: outlet.outletType,
        language: outlet.language ?? null,
        url: outlet.url ?? null,
        notes: outlet.notes ?? null,
      },
    })
  }
  console.log(`  ${mediaOutlets.length} media outlets imported`)

  for (const entry of mediaEntries) {
    await prisma.mediaEntry.upsert({
      where: { id: entry.id },
      update: {
        outletId: entry.outletId,
        country: entry.country,
        publishedYear: entry.publishedYear,
        publishedMonth: entry.publishedMonth ?? null,
        publishedDay: entry.publishedDay ?? null,
        datePrecision: entry.datePrecision,
        title: entry.title,
        summary: entry.summary,
        url: entry.url ?? null,
        recordType: entry.recordType,
        verificationLevel: entry.verificationLevel,
        triggerLabel: entry.triggerLabel ?? null,
        sourceDocId: entry.sourceDocId ?? null,
        sourceRefs: entry.sourceRefs ?? null,
      },
      create: {
        id: entry.id,
        outletId: entry.outletId,
        country: entry.country,
        publishedYear: entry.publishedYear,
        publishedMonth: entry.publishedMonth ?? null,
        publishedDay: entry.publishedDay ?? null,
        datePrecision: entry.datePrecision,
        title: entry.title,
        summary: entry.summary,
        url: entry.url ?? null,
        recordType: entry.recordType,
        verificationLevel: entry.verificationLevel,
        triggerLabel: entry.triggerLabel ?? null,
        sourceDocId: entry.sourceDocId ?? null,
        sourceRefs: entry.sourceRefs ?? null,
      },
    })
  }
  console.log(`  ${mediaEntries.length} media entries imported`)

  for (const coding of mediaEntryCodings) {
    await prisma.mediaEntryCoding.upsert({
      where: {
        entryId_primaryTheme_tone_frame: {
          entryId: coding.entryId,
          primaryTheme: coding.primaryTheme,
          tone: coding.tone,
          frame: coding.frame,
        },
      },
      update: {
        country: coding.country,
        secondaryThemes: coding.secondaryThemes,
        geography: coding.geography,
        actorTargets: coding.actorTargets,
        confidence: coding.confidence,
        triggerLabel: coding.triggerLabel ?? null,
        evidenceNote: coding.evidenceNote ?? null,
        codedBy: coding.codedBy,
      },
      create: {
        entryId: coding.entryId,
        country: coding.country,
        primaryTheme: coding.primaryTheme,
        secondaryThemes: coding.secondaryThemes,
        tone: coding.tone,
        frame: coding.frame,
        geography: coding.geography,
        actorTargets: coding.actorTargets,
        confidence: coding.confidence,
        triggerLabel: coding.triggerLabel ?? null,
        evidenceNote: coding.evidenceNote ?? null,
        codedBy: coding.codedBy,
      },
    })
  }
  console.log(`  ${mediaEntryCodings.length} media entry codings imported`)
}

function normalizeSupportingSources(sources: ReportSupportingSource[] | undefined) {
  if (!sources || sources.length === 0) return Prisma.DbNull

  return sources.map((source) => ({
    label: source.label,
    ...(source.url ? { url: source.url } : {}),
    ...(source.reportId ? { reportId: source.reportId } : {}),
    ...(source.documentPath ? { documentPath: source.documentPath } : {}),
    ...(source.note ? { note: source.note } : {}),
  })) satisfies Prisma.InputJsonValue
}

async function importReports() {
  console.log('Importing reports...')
  for (const r of reports) {
    const supportingSources = normalizeSupportingSources(r.supportingSources)

    await prisma.report.upsert({
      where: { id: r.id },
      update: {
        title: r.title,
        fullTitle: r.fullTitle ?? null,
        author: r.author ?? null,
        institution: r.institution ?? null,
        date: r.date ?? null,
        year: r.year ?? null,
        sourceUrl: r.sourceUrl ?? null,
        reportCategory: r.reportCategory,
        country: r.country ?? 'NO',
        keyFindings: r.keyFindings,
        recommendations: r.recommendations,
        relevance: r.relevance,
        tags: r.tags,
        doi: r.doi ?? null,
        isbn: r.isbn ?? null,
        issn: r.issn ?? null,
        publisher: r.publisher ?? null,
        provenanceType: r.provenanceType ?? null,
        supportingSources,
      },
      create: {
        id: r.id,
        title: r.title,
        fullTitle: r.fullTitle ?? null,
        author: r.author ?? null,
        institution: r.institution ?? null,
        date: r.date ?? null,
        year: r.year ?? null,
        sourceUrl: r.sourceUrl ?? null,
        reportCategory: r.reportCategory,
        country: r.country ?? 'NO',
        keyFindings: r.keyFindings,
        recommendations: r.recommendations,
        relevance: r.relevance,
        tags: r.tags,
        doi: r.doi ?? null,
        isbn: r.isbn ?? null,
        issn: r.issn ?? null,
        publisher: r.publisher ?? null,
        provenanceType: r.provenanceType ?? null,
        supportingSources,
      },
    })
  }
  console.log(`  ${reports.length} reports imported`)
}

async function importCountryMetrics() {
  console.log('Importing country metrics...')
  let count = 0

  for (const [country, data] of Object.entries(countryChartData)) {
    const ss = data.selfSufficiency
    for (const entry of ss.data) {
      await prisma.countryMetric.upsert({
        where: {
          country_metricType_category_year: {
            country,
            metricType: 'selfSufficiency',
            category: entry.name,
            year: ss.year,
          },
        },
        update: { value: entry.value, source: ss.source, subtitle: ss.subtitle },
        create: {
          country,
          metricType: 'selfSufficiency',
          category: entry.name,
          value: entry.value,
          unit: '%',
          year: ss.year,
          source: ss.source,
          subtitle: ss.subtitle,
        },
      })
      count++
    }

    if (data.margins) {
      const m = data.margins
      for (const entry of m.data) {
        await prisma.countryMetric.upsert({
          where: {
            country_metricType_category_year: {
              country,
              metricType: 'margin',
              category: entry.name,
              year: m.year,
            },
          },
          update: { value: entry.margin, source: m.source },
          create: {
            country,
            metricType: 'margin',
            category: entry.name,
            value: entry.margin,
            unit: '%',
            year: m.year,
            source: m.source,
            metadata: { industryAvg: m.industryAvg },
          },
        })
        count++
      }
    }

    if (data.marketShare) {
      const ms = data.marketShare
      for (const entry of ms.data) {
        await prisma.countryMetric.upsert({
          where: {
            country_metricType_category_year: {
              country,
              metricType: 'marketShare',
              category: entry.name,
              year: ms.year,
            },
          },
          update: { value: entry.value, source: ms.source },
          create: {
            country,
            metricType: 'marketShare',
            category: entry.name,
            value: entry.value,
            unit: '%',
            year: ms.year,
            source: ms.source,
          },
        })
        count++
      }
    }
  }
  console.log(`  ${count} country metrics imported`)
}

async function main() {
  console.log('Starting data import...\n')

  await importPhases()
  await importTeam()
  await importSources()
  await importInsights()
  await importTheses()
  await importApplications()
  await importKPIs()
  await importEvidencePack()
  await importTenSteps()
  await importMeetings()
  await importCommunications()
  await importResearchPrompts()
  await importMediaLandscape()
  await importMediaCorpus()
  await importReports()
  await importCountryMetrics()

  console.log('\nAll data imported successfully!')
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
