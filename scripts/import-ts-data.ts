import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { phases } from '../src/lib/data/phases'
import { team } from '../src/lib/data/team'
import { sources } from '../src/lib/data/sources'
import { insights } from '../src/lib/data/insights'
import { theses } from '../src/lib/data/theses'
import { applications } from '../src/lib/data/applications'
import { tasks } from '../src/lib/data/tasks'
import { kpis } from '../src/lib/data/kpis'
import { deliverables } from '../src/lib/data/deliverables'
import { evidencePack } from '../src/lib/data/evidence-pack'
import { tenSteps } from '../src/lib/data/ten-step-start'
import { meetings } from '../src/lib/data/meetings'
import { communications } from '../src/lib/data/communications'
import { researchPrompts } from '../src/lib/data/research-prompts'
import {
  mediaThemes,
  mediaTimeline,
  mediaCountryProfiles,
} from '../src/lib/data/media-landscape'
import { countryChartData } from '../src/lib/data/country-chart-data'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

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

async function importTasks() {
  console.log('Importing tasks...')
  for (const t of tasks) {
    await prisma.projectTask.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        source: t.source,
        status: t.status,
        priority: t.priority,
        phaseId: t.phase ?? null,
      },
      create: {
        id: t.id,
        title: t.title,
        source: t.source,
        status: t.status,
        priority: t.priority,
        phaseId: t.phase ?? null,
      },
    })
  }
  console.log(`  ${tasks.length} tasks imported`)
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

async function importDeliverables() {
  console.log('Importing deliverables...')
  for (const d of deliverables) {
    await prisma.deliverable.upsert({
      where: { id: d.id },
      update: { name: d.name, deadline: d.deadline, status: d.status },
      create: { id: d.id, name: d.name, deadline: d.deadline, status: d.status },
    })
  }
  console.log(`  ${deliverables.length} deliverables imported`)
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
      update: { theme: s.theme, output: s.output, status: s.status },
      create: { step: s.step, theme: s.theme, output: s.output, status: s.status },
    })
  }
  console.log(`  ${tenSteps.length} ten steps imported`)
}

async function importMeetings() {
  console.log('Importing meetings...')
  for (const m of meetings) {
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

    if (m.sources) {
      for (const sr of m.sources) {
        const existing = await prisma.sourceRef.findFirst({
          where: { meetingId: m.id, label: sr.label },
        })
        if (!existing) {
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
    }
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
      },
      create: {
        id: rp.id,
        category: rp.category,
        title: rp.title,
        prompt: rp.prompt,
        model: rp.model,
        expectedOutput: rp.expectedOutput,
        language: rp.language,
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
  await importTasks()
  await importKPIs()
  await importDeliverables()
  await importEvidencePack()
  await importTenSteps()
  await importMeetings()
  await importCommunications()
  await importResearchPrompts()
  await importMediaLandscape()
  await importCountryMetrics()

  console.log('\nAll data imported successfully!')
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
