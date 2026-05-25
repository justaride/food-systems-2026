import { writeFileSync } from 'fs'
import { join } from 'path'
import { reports } from '../prisma/seed-data/reports'
import { theses } from '../prisma/seed-data/theses'
import type {
  Report,
  Thesis,
  ReportProvenanceType,
  ReportCategory,
  ThesisDegree,
} from '../src/lib/types'

const REPORT_CATEGORY_WEIGHT: Record<ReportCategory, number> = {
  nou: 5,
  konkurransetilsyn: 5,
  juridisk: 4.5,
  akademia: 4,
  konsulentrapport: 4,
  offentlig: 4,
  bransje: 3.5,
  beredskap: 3.5,
  sirkularitet: 3.5,
  tenketank: 3,
  oversikt: 2.5,
}

const PROVENANCE_WEIGHT: Record<ReportProvenanceType, number> = {
  external_report: 5,
  external_article: 4,
  composite_source: 3.5,
  internal_synthesis: 2.5,
  internal_register: 2,
  blocked_source: 0.5,
}

const DEGREE_WEIGHT: Record<ThesisDegree, number> = {
  phd: 5,
  master: 4,
}

function recencyBonus(year: number | null | undefined): number {
  if (!year) return -0.5
  if (year >= 2024) return 0.5
  if (year >= 2022) return 0.3
  if (year >= 2020) return 0.1
  if (year >= 2015) return 0
  return -0.3
}

function clamp1to5(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value * 2) / 2))
}

type ScoredRow = {
  type: 'report' | 'thesis'
  id: string
  score: number
  year: number | null
  category: string
  provenance: string
  hasUrl: boolean
  title: string
  signals: string
}

function scoreReport(r: Report): ScoredRow {
  const provenance: ReportProvenanceType = r.provenanceType ?? 'external_report'

  if (provenance === 'blocked_source') {
    return {
      type: 'report',
      id: r.id,
      score: 1.0,
      year: r.year ?? null,
      category: r.reportCategory,
      provenance,
      hasUrl: Boolean(r.sourceUrl),
      title: r.title,
      signals: 'override=blocked_source (ekskludert fra KI-bruk uten manuell vurdering)',
    }
  }

  const provWeight = PROVENANCE_WEIGHT[provenance]
  const catWeight = REPORT_CATEGORY_WEIGHT[r.reportCategory] ?? 3
  const rec = recencyBonus(r.year)

  const expectsExternalUrl =
    provenance === 'external_report' || provenance === 'external_article'
  const urlPenalty = !r.sourceUrl && expectsExternalUrl ? -0.5 : 0

  const supBonus = (r.supportingSources?.length ?? 0) > 0 ? 0.2 : 0
  const tagBonus = (r.tags?.length ?? 0) >= 3 ? 0.2 : 0
  const raw =
    (provWeight + catWeight) / 2 + rec + urlPenalty + supBonus + tagBonus
  const score = clamp1to5(raw)

  return {
    type: 'report',
    id: r.id,
    score,
    year: r.year ?? null,
    category: r.reportCategory,
    provenance,
    hasUrl: Boolean(r.sourceUrl),
    title: r.title,
    signals: `cat=${catWeight}, prov=${provWeight}, rec=${rec}, url=${urlPenalty}, sup=${supBonus}, tag=${tagBonus}, raw=${raw.toFixed(2)}`,
  }
}

function scoreThesis(t: Thesis): ScoredRow {
  const provWeight = PROVENANCE_WEIGHT.external_report
  const catWeight = DEGREE_WEIGHT[t.degree] ?? 4
  const rec = recencyBonus(t.year)
  const urlPenalty = t.url ? 0 : -0.5
  const tagBonus = (t.tags?.length ?? 0) >= 3 ? 0.2 : 0
  const doiBonus = t.doi ? 0.1 : 0
  const awardBonus = t.awardWinning ? 0.2 : 0
  const raw =
    (provWeight + catWeight) / 2 +
    rec +
    urlPenalty +
    tagBonus +
    doiBonus +
    awardBonus
  const score = clamp1to5(raw)

  return {
    type: 'thesis',
    id: t.id,
    score,
    year: t.year ?? null,
    category: t.degree,
    provenance: 'external_report',
    hasUrl: Boolean(t.url),
    title: t.title,
    signals: `cat=${catWeight}, prov=${provWeight}, rec=${rec}, url=${urlPenalty}, tag=${tagBonus}, doi=${doiBonus}, award=${awardBonus}, raw=${raw.toFixed(2)}`,
  }
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function main(): void {
  const scored: ScoredRow[] = [
    ...reports.map(scoreReport),
    ...theses.map(scoreThesis),
  ]

  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    return (b.year ?? 0) - (a.year ?? 0)
  })

  const csvLines = [
    'type,id,score,year,category,provenance,hasUrl,title,signals',
    ...scored.map((s) =>
      [
        s.type,
        s.id,
        s.score.toFixed(1),
        s.year ?? '',
        s.category,
        s.provenance,
        s.hasUrl ? 'yes' : 'no',
        csvEscape(s.title),
        csvEscape(s.signals),
      ].join(','),
    ),
  ]

  const root = process.cwd()
  writeFileSync(
    join(root, 'research', 'KI-PRIORITY.csv'),
    csvLines.join('\n') + '\n',
  )

  const dist = new Map<string, { reports: number; theses: number }>()
  for (const s of scored) {
    const bucket = s.score.toFixed(1)
    const entry = dist.get(bucket) ?? { reports: 0, theses: 0 }
    if (s.type === 'report') entry.reports += 1
    else entry.theses += 1
    dist.set(bucket, entry)
  }

  const top = scored.slice(0, 30)
  const bottom = scored.slice(-15).reverse()

  const mdLines = [
    '# KI-priority — Reports + Theses',
    '',
    '> Auto-generert av `scripts/compute-ki-priority.ts` — ikke rediger manuelt.',
    `> Generert: ${new Date().toISOString()}`,
    `> Totalt: **${scored.length}** poster (${reports.length} rapporter + ${theses.length} avhandlinger)`,
    '',
    '## Score-distribusjon',
    '',
    '| Score | Reports | Theses | Sum |',
    '|---|---:|---:|---:|',
    ...Array.from(dist.entries())
      .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
      .map(
        ([bucket, counts]) =>
          `| ${bucket} | ${counts.reports} | ${counts.theses} | ${counts.reports + counts.theses} |`,
      ),
    '',
    '## Topp 30',
    '',
    '| # | Score | Type | Kategori | Provenance | År | Tittel |',
    '|---:|---|---|---|---|---|---|',
    ...top.map(
      (s, i) =>
        `| ${i + 1} | ${s.score.toFixed(1)} | ${s.type} | ${s.category} | ${s.provenance} | ${s.year ?? ''} | ${s.title.slice(0, 80)} |`,
    ),
    '',
    '## Bunn 15 (deprioritert i KI-bruk)',
    '',
    '| Score | Type | Kategori | Provenance | År | Tittel |',
    '|---|---|---|---|---|---|',
    ...bottom.map(
      (s) =>
        `| ${s.score.toFixed(1)} | ${s.type} | ${s.category} | ${s.provenance} | ${s.year ?? ''} | ${s.title.slice(0, 80)} |`,
    ),
    '',
    '## Tolkning av score',
    '',
    '| Score | Bruk i KI |',
    '|---|---|',
    '| 5.0 | Primærkilde — bruk direkte for sitat og analyse |',
    '| 4.5–4.0 | Solid kilde — bruk for sitat med kontekstvurdering |',
    '| 3.5–3.0 | Underlag — bruk som bakgrunn, vurder før direkte sitat |',
    '| 2.5–2.0 | Begrenset — bruk varsomt, sjekk kontekst |',
    '| 1.5–1.0 | Ekskludert eller svak — ikke bruk uten manuell vurdering |',
    '',
    '## Score-formel',
    '',
    'Score = clamp((`provenance` + `category`) / 2 + `recency` + `urlPenalty` + andre bonuser, 1, 5).',
    '',
    'Avrundet til nærmeste 0.5.',
    '',
    '### Vekter',
    '',
    '**Report category:**',
    ...Object.entries(REPORT_CATEGORY_WEIGHT).map(
      ([k, v]) => `- \`${k}\`: ${v}`,
    ),
    '',
    '**Provenance type:**',
    ...Object.entries(PROVENANCE_WEIGHT).map(([k, v]) => `- \`${k}\`: ${v}`),
    '',
    '**Thesis degree:**',
    ...Object.entries(DEGREE_WEIGHT).map(([k, v]) => `- \`${k}\`: ${v}`),
    '',
    '**Recency:** ≥2024 +0.5, ≥2022 +0.3, ≥2020 +0.1, ≥2015 0, <2015 -0.3, ukjent -0.5',
    '',
    '**Andre signaler:**',
    '- `urlPenalty` for external_report/external_article uten sourceUrl: -0.5',
    '- `urlPenalty` for thesis uten url: -0.5',
    '- `supportingSources` (Report) ≥ 1: +0.2',
    '- `tags` ≥ 3: +0.2',
    '- `doi` (Thesis): +0.1',
    '- `awardWinning` (Thesis): +0.2',
    '',
    '**Hard override:** `blocked_source` settes alltid til score 1.0 (ekskludert fra KI-bruk uten manuell vurdering), uavhengig av andre signaler.',
  ]
  writeFileSync(
    join(root, 'research', 'KI-PRIORITY.md'),
    mdLines.join('\n') + '\n',
  )

  console.log(`KI-priority computed for ${scored.length} entities`)
  console.log(`  ${reports.length} reports + ${theses.length} theses`)
  console.log('')
  console.log('Score distribution:')
  for (const [bucket, counts] of Array.from(dist.entries()).sort(
    ([a], [b]) => parseFloat(b) - parseFloat(a),
  )) {
    console.log(
      `  ${bucket}: ${counts.reports + counts.theses} (${counts.reports}R + ${counts.theses}T)`,
    )
  }
  console.log('')
  console.log('Output: research/KI-PRIORITY.csv + research/KI-PRIORITY.md')
}

main()
