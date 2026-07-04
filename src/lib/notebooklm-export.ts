import type { Dirent } from 'node:fs'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

export type NotebookLmExportOptions = {
  sourceRoot: string
  outputRoot: string
  date: string
}

export type NotebookLmExportFile = {
  filename: string
  title: string
  packetType: string
  status: string
  allowedUse: string
  recommendedPrompt: string
  wordCount: number
  bytes: number
}

export type NotebookLmExportResult = {
  exportDir: string
  files: NotebookLmExportFile[]
}

type Packet = {
  filename: string
  title: string
  packetType: string
  status: string
  allowedUse: string
  purpose: string
  coreClaims: string[]
  evidenceRows: string[][]
  caveats: string[]
  deckAngles: string[]
  badGenericFraming: string[]
  sourcePaths: string[]
  recommendedPrompt: string
  extraSections?: Array<{ heading: string; body: string }>
  maxCharsPerSource?: number
}

const SOURCE_LIMIT = 50
const SOURCE_WORD_LIMIT = 500_000
const SOURCE_BYTE_LIMIT = 200 * 1024 * 1024
const DEFAULT_MAX_CHARS_PER_SOURCE = 14_000

function normalizeNewlines(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function stripFrontmatter(value: string) {
  const normalized = normalizeNewlines(value)
  if (!normalized.startsWith('---\n')) return normalized
  const end = normalized.indexOf('\n---\n', 4)
  if (end === -1) return normalized
  return normalized.slice(end + 5).trimStart()
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function csvEscape(value: string | number) {
  const text = String(value)
  if (!/[",\n]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

function clip(value: string, maxChars: number) {
  if (value.length <= maxChars) return value
  const clipped = value.slice(0, maxChars)
  const lastBreak = clipped.lastIndexOf('\n## ')
  const safeClip = lastBreak > maxChars * 0.55 ? clipped.slice(0, lastBreak) : clipped
  return `${safeClip.trim()}\n\n[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]\n`
}

async function maybeRead(root: string, sourcePath: string, maxChars: number) {
  const fullPath = path.join(root, sourcePath)
  try {
    const info = await stat(fullPath)
    if (!info.isFile()) return null
    if (sourcePath.toLowerCase().endsWith('.pdf')) return null
    const text = await readFile(fullPath, 'utf8')
    return {
      sourcePath,
      text: clip(stripFrontmatter(text), maxChars),
    }
  } catch {
    return null
  }
}

async function walkMarkdown(root: string, relativeDir: string, limit: number) {
  const start = path.join(root, relativeDir)
  const out: string[] = []
  async function walkDir(dir: string) {
    let entries: Array<Dirent<string>>
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'no'))) {
      const full = path.join(dir, entry.name)
      const rel = path.relative(root, full)
      if (entry.isDirectory()) {
        await walkDir(full)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        out.push(rel)
        if (out.length >= limit) return
      }
    }
  }
  await walkDir(start)
  return out
}

function mdList(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n')
}

function mdTable(headers: string[], rows: string[][]) {
  const header = `| ${headers.join(' | ')} |`
  const divider = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map((row) => `| ${row.map((cell) => cell.replace(/\n/g, '<br>')).join(' | ')} |`)
  return [header, divider, ...body].join('\n')
}

async function renderPacket(root: string, packet: Packet, date: string) {
  const sourceReads = await Promise.all(
    packet.sourcePaths.map((sourcePath) =>
      maybeRead(root, sourcePath, packet.maxCharsPerSource ?? DEFAULT_MAX_CHARS_PER_SOURCE),
    ),
  )
  const availableSources = sourceReads.filter((source): source is NonNullable<typeof source> => Boolean(source))
  const missingSources = packet.sourcePaths.filter(
    (sourcePath) => !availableSources.some((source) => source.sourcePath === sourcePath),
  )

  const sections = [
    `# ${packet.title}`,
    '',
    `Export date: ${date}`,
    `Packet type: ${packet.packetType}`,
    `Status label: ${packet.status}`,
    `Allowed use: ${packet.allowedUse}`,
    '',
    '## What This Source Is For',
    '',
    packet.purpose,
    '',
    '## Core Claims Or Working Propositions',
    '',
    mdList(packet.coreClaims),
    '',
    '## Evidence Table',
    '',
    mdTable(['Signal', 'Use', 'Boundary'], packet.evidenceRows),
    '',
    '## Known Caveats',
    '',
    mdList(packet.caveats),
    '',
    '## Deck Angles',
    '',
    mdList(packet.deckAngles),
    '',
    '## Bad Generic Framing To Avoid',
    '',
    mdList(packet.badGenericFraming),
    '',
    ...(packet.extraSections ?? []).flatMap((section) => [`## ${section.heading}`, '', section.body, '']),
    '## Source Paths Included',
    '',
    availableSources.length > 0 ? mdList(availableSources.map((source) => source.sourcePath)) : '- No source excerpts available.',
    '',
    ...(missingSources.length > 0
      ? ['## Source Paths Not Found In This Checkout', '', mdList(missingSources), '']
      : []),
    '## Source Excerpts',
    '',
    ...availableSources.flatMap((source) => [
      `### ${source.sourcePath}`,
      '',
      '````markdown',
      source.text.trim(),
      '````',
      '',
    ]),
  ]

  return `${sections.join('\n')}\n`
}

function controlPackets(): Packet[] {
  return [
    {
      filename: '00_START_HERE.md',
      title: 'START HERE - NotebookLM Operating Brief',
      packetType: 'control',
      status: 'internal context',
      allowedUse: 'Use first. This source controls interpretation, tone, labels, and deck behavior.',
      purpose:
        'Orient NotebookLM to Food Systems 2026 as a source-grounded Nordic food-system knowledge base. The goal is sharp, evidence-aware presentation work, not generic sustainability copy.',
      coreClaims: [
        'Food Systems 2026 maps structure, power, supply chains, circular loops, policy and evidence gaps across Norwegian and Nordic food systems.',
        'The Obsidian vault is a navigation layer; the research/status artifacts are the evidence and gate layer.',
        'Never flatten PCQ, source-shortlist, actor-gated, internal-only or do-not-visualize-yet material into external claims.',
        'Use sharp tensions: capacity is not realized volume; utilized is not high-value; local identity is not resilience without mechanism; market concentration is structure, not intent.',
      ],
      evidenceRows: [
        ['citable', 'Can support external-facing statements when the quoted caveat is preserved.', 'Still cite the packet/source and keep method limits visible.'],
        ['PCQ', 'Primary-claim qualification candidate.', 'Do not publish until locator, method and caveat are checked.'],
        ['source-shortlist', 'Use as lead list, method map or source candidate.', 'Not a claim and not a chart basis.'],
        ['actor-gated', 'Use as interview/validation question.', 'Do not answer as desk-research fact.'],
        ['internal context', 'Use for orientation and synthesis.', 'Do not cite externally.'],
        ['do-not-visualize-yet', 'Use as a warning label.', 'Do not make charts, rankings, maps or deck figures from this material.'],
      ],
      caveats: [
        'NotebookLM outputs are source-grounded drafts, not verification.',
        'Generated slide decks and infographics may be factually or visually inaccurate and need human review.',
        'If a source says a claim is parked, blocked or actor-gated, keep it parked, blocked or actor-gated.',
      ],
      deckAngles: [
        'Lead with a specific system tension, then show the evidence and the missing cell.',
        'Use one slide per decision: what we know, why it matters, what remains blocked.',
        'Prefer a limitation-aware claim over broad "circular food systems are important" framing.',
      ],
      badGenericFraming: [
        'Do not write a generic green-transition deck.',
        'Do not imply the project has complete Nordic coverage.',
        'Do not turn capacity, ambition or pilots into realized system outcomes.',
      ],
      sourcePaths: [
        'CLAUDE.md',
        '.claude/source-attribution-policy.md',
        'research/CITABLE-KNOWLEDGE-BASE-STATUS.md',
        'research/_status/food-tg-r13/r13-intake-index-2026-06-25.md',
      ],
      recommendedPrompt:
        'Before answering, restate the relevant source labels and tell me which claims are citable, PCQ, source-shortlist, actor-gated, internal-only or do-not-visualize-yet.',
    },
    {
      filename: '01_DECK_BRIEFING_INSTRUCTIONS.md',
      title: 'Deck And Briefing Instructions For NotebookLM',
      packetType: 'control',
      status: 'internal context',
      allowedUse: 'Use to generate sharper slide decks, presenter decks, infographics, mind maps and briefing docs.',
      purpose:
        'Give NotebookLM explicit artifact prompts so generated presentations cut through instead of becoming broad, generic sustainability material.',
      coreClaims: [
        'A useful deck must have a point of view, evidence, caveat and decision relevance on every slide.',
        'A Food Systems deck should preserve uncertainty as an insight rather than hiding it.',
        'Visual outputs must show empty cells, method labels and gate labels when the underlying source requires them.',
      ],
      evidenceRows: [
        ['Detailed deck', 'Use for read-ahead documents.', 'Must include evidence table and caveat per slide.'],
        ['Presenter slides', 'Use when Gabriel/Cathrine will speak over the material.', 'Keep slide text sparse, put exact evidence in notes.'],
        ['Infographic', 'Use only for citable or explicitly figure-ready material.', 'Never use do-not-visualize-yet rows.'],
        ['Mind map', 'Use for exploratory structure.', 'Mind maps are not evidence of relationships beyond the sources.'],
      ],
      caveats: [
        'NotebookLM slide revisions may not take sources into account, so regenerate from a corrected prompt when source grounding matters.',
        'Any deck must be checked against claim boundaries before external sharing.',
      ],
      deckAngles: [
        'Prompt: Create a 12-slide presenter deck for Nordic food-system decision makers. Each slide must have one sharp claim, one evidence source, one caveat, and one "what to decide next".',
        'Prompt: Create a briefing memo that separates citable facts from PCQ/source-shortlist/actor-gated material.',
        'Prompt: Create an infographic only from packets marked citable or PCQ-ready with visible caveats; exclude do-not-visualize-yet material.',
      ],
      badGenericFraming: [
        'Avoid "innovation will transform the food system" unless the source names the mechanism.',
        'Avoid "Nordic leadership" without country-specific evidence.',
        'Avoid charts that rank actors when the source says coverage is incomplete.',
      ],
      sourcePaths: [
        'research/rammeverk/leveranseplan-wp3-food-systems.md',
        'research/evidence-pack/roadmap.md',
        'docs/project/mandates/R13-LAND-006-figurkandidater.md',
      ],
      recommendedPrompt:
        'Generate a slide deck outline where every slide has: claim, evidence source, caveat, source label, and decision relevance. Exclude do-not-visualize-yet material.',
    },
    {
      filename: '02_CLAIM_BOUNDARIES.md',
      title: 'Claim Boundaries And Source Labels',
      packetType: 'control',
      status: 'internal context',
      allowedUse: 'Use as the hard boundary document for claims, citations, figures and external language.',
      purpose:
        'Prevent NotebookLM from smoothing parked, uncertain or actor-gated research into confident presentation claims.',
      coreClaims: [
        'External claims require source locators, accessed dates and provenance.',
        'Internal synthesis can organize thinking, but it is not a substitute for primary evidence.',
        'The R13 intake index is a triage map, not a fact source.',
        'Do-not-visualize-yet is a blocking label for charts, rankings and deck figures.',
      ],
      evidenceRows: [
        ['primary', 'Original publication, official register, law text, annual report or authority data.', 'Required for central external claims.'],
        ['synthesis', 'Project synthesis of named sources.', 'Not primary proof for finance, ownership, legal or register facts.'],
        ['legacy_unsourced', 'Historical row without sufficient source.', 'Blocked from whitepaper and new imports.'],
        ['PCQ-ready', 'Candidate for primary-claim qualification.', 'Needs locator and method check before external voice.'],
      ],
      caveats: [
        'Do not use internal status counts as if they were current live production facts unless the source itself is current.',
        'Do not cite source-shortlist packets as completed evidence.',
      ],
      deckAngles: [
        'Make the claim boundary visible as a trust feature: "what we know / what is blocked / what must be asked".',
        'Use the stop-list as an appendix for reviewers.',
      ],
      badGenericFraming: [
        'Do not say "verified" unless the source status says verified.',
        'Do not say "complete coverage" when a dashboard or backlog shows gaps.',
        'Do not make actor intent claims from structural market data.',
      ],
      sourcePaths: ['.claude/source-attribution-policy.md', 'research/_status/food-tg-r13/r13-intake-index-2026-06-25.md'],
      recommendedPrompt:
        'Classify each proposed deck claim as citable, PCQ, source-shortlist, actor-gated, internal-only, parked or do-not-visualize-yet before drafting language.',
    },
  ]
}

function thesisPackets(): Packet[] {
  const base = {
    packetType: 'thesis',
    status: 'mixed: citable plus gated/internal context',
    allowedUse: 'Use for narrative structure, but preserve source labels before making external claims.',
    maxCharsPerSource: 12_000,
  }

  return [
    {
      ...base,
      filename: '10_MARKET_POWER_THESIS.md',
      title: 'Market Power Thesis - Structure Before Intent',
      purpose: 'Frame grocery and food-system concentration as a structural condition with evidence boundaries.',
      coreClaims: [
        'Market concentration is a system structure, not by itself proof of intent or misconduct.',
        'The sharp deck angle is the interaction between retail concentration, vertical integration and policy-set price floors.',
        'Claims about monopoly, abuse or causality require stricter evidence than market-share or ownership data alone.',
      ],
      evidenceRows: [
        ['Daily grocery concentration', 'Use as structure signal.', 'Do not call it monopoly without legal/economic support.'],
        ['Vertical integration', 'Use as control map.', 'Do not infer intent from ownership alone.'],
        ['4.9bn competition fine', 'Use as behavior/enforcement example.', 'Do not use it as proof of all current pricing dynamics.'],
      ],
      caveats: [
        'Some historic market-share numbers differ across sources and years.',
        'Grossist and feed concentration cells have documented gaps in R13.',
      ],
      deckAngles: [
        'Slide: "The structure is concentrated before any actor choice enters the story."',
        'Slide: "Policy floor plus private margin is a two-layer price problem."',
      ],
      badGenericFraming: ['Avoid anti-corporate slogans.', 'Avoid "the market is broken" without naming the mechanism.'],
      sourcePaths: [
        'Food Systems Obsidian/10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md',
        'Food Systems Obsidian/10 Innsiktskart/Innsikter/I02 4,9 mrd-boten.md',
        'Food Systems Obsidian/10 Innsiktskart/Innsikter/I24 Syntesen – prisgulv pluss superprofitt.md',
        'research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md',
        'research/external/r13/R13-LAND-002-vertikal-integrasjon.md',
      ],
      recommendedPrompt:
        'Draft a market-power deck section that distinguishes structure, behavior, policy floor and evidence gaps.',
    },
    {
      ...base,
      filename: '11_VALUE_CHAIN_FRAGILITY_THESIS.md',
      title: 'Value-Chain Fragility Thesis - Mechanisms, Not Vibes',
      purpose: 'Frame supply resilience through concrete mechanisms: import nodes, storage, redundancy, logistics and input dependency.',
      coreClaims: [
        'Local or short value chains improve resilience only when a named mechanism is present.',
        'Import dependency must separate volume, value, price effects and missing data cells.',
        'Food-system fragility is strongest when input dependency, logistics chokepoints and concentrated control reinforce one another.',
      ],
      evidenceRows: [
        ['Critical import nodes', 'Use for concrete dependency map.', 'Keep volume/value distinction visible.'],
        ['Local value chains', 'Use as mechanism shortlist.', 'Identity alone is not resilience.'],
        ['Transport/storage vulnerability', 'Use as source map.', 'Open sources are largely qualitative.'],
      ],
      caveats: [
        'Some nodes remain Type-C method gaps.',
        'Do not visualize import rankings without empty cells and method labels.',
      ],
      deckAngles: ['Slide: "A local chain is resilient only if it replaces a vulnerable function."', 'Slide: "The missing metric is part of the finding."'],
      badGenericFraming: ['Avoid "local is always resilient".', 'Avoid conflating value growth with volume growth.'],
      sourcePaths: [
        'Food Systems Obsidian/10 Innsiktskart/Innsikter/I17 Fruktavhengigheten – 96 % import.md',
        'Food Systems Obsidian/10 Innsiktskart/Innsikter/I18 Dobbel sårbarhet.md',
        'research/external/r13/R13-GAP-001-kritiske-importnoder.md',
        'research/external/r13/R13-GAP-002-lokale-verdikjeder-resiliens.md',
        'research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md',
      ],
      recommendedPrompt:
        'Create a briefing on value-chain fragility that names each resilience mechanism and marks missing data cells.',
    },
    {
      ...base,
      filename: '12_CIRCULAR_LOOPS_THESIS.md',
      title: 'Circular Loops Thesis - Utilized Is Not High-Value',
      purpose: 'Separate circularity claims into R-level, volume, value, leakage and missing-data dimensions.',
      coreClaims: [
        'A side stream can be "utilized" while still flowing mostly to low-value uses.',
        'Circular maturity depends on the pathway, not just whether waste is avoided.',
        'The best loops show governance, logistics, quality control and buyer demand, not only technology.',
      ],
      evidenceRows: [
        ['Marine residual raw material', 'Use as proof of utilization vs high-value split.', 'Do not collapse feed/energy/human consumption.'],
        ['Biogas/digestate', 'Use as nutrient-return topic.', 'Norway has data gaps compared with Sweden.'],
        ['Prevention', 'Use for R1 framing.', 'Effect data for single interventions is weak.'],
      ],
      caveats: ['R-stige figures must show empty cells.', 'Do not rank loops without comparable methods.'],
      deckAngles: ['Slide: "The circularity trap: high utilization can still mean low value."', 'Slide: "R1 prevention is better but harder to measure."'],
      badGenericFraming: ['Avoid treating all reuse as equal.', 'Avoid saying "closed loop" unless input/output evidence exists.'],
      sourcePaths: [
        'Food Systems Obsidian/10 Innsiktskart/Looper/Aktørcaser – suksess og fiasko.md',
        'research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md',
        'research/external/r13/R13-WASTE-005-digestat-npk-retur.md',
        'research/external/r13/R13-WASTE-008-prevention-baseline.md',
        'public/data/food-systems/circularity-loops.json',
      ],
      recommendedPrompt:
        'Build a circular-loops narrative that distinguishes R-level, realized volume, value pathway, and missing evidence.',
    },
    {
      ...base,
      filename: '13_NORDIC_COMPARISON_THESIS.md',
      title: 'Nordic Comparison Thesis - Benchmarks With Caveats',
      purpose: 'Use Nordic comparison as a way to expose mechanisms, not as a scoreboard without comparable data.',
      coreClaims: [
        'Nordic comparison is useful when the countries expose different regulatory, market and circularity mechanisms.',
        'Finland, Denmark, Sweden and Iceland are benchmarks only where the underlying method is comparable.',
        'A strong deck uses Nordic contrasts to ask "what mechanism is transferable?"',
      ],
      evidenceRows: [
        ['Finland regulation', 'Use as model candidate.', 'Do not imply direct EEA transfer without legal check.'],
        ['Denmark as counterexample', 'Use as comparative structure.', 'Preserve source/year and market definition.'],
        ['Iceland 100% fish', 'Use as benchmark-only if included.', 'Do not claim audited national 100% outcome without data.'],
      ],
      caveats: ['Nordic financial depth is uneven.', 'CountryMetric cells require method labels.'],
      deckAngles: ['Slide: "The Nordics are not one model; they are a mechanism laboratory."', 'Slide: "Benchmark, do not borrow the headline."'],
      badGenericFraming: ['Avoid "Nordic best practice" without naming country and source.', 'Avoid ranking countries when methods differ.'],
      sourcePaths: [
        'Food Systems Obsidian/10 Innsiktskart/Norden/Norge.md',
        'Food Systems Obsidian/10 Innsiktskart/Norden/Danmark.md',
        'Food Systems Obsidian/10 Innsiktskart/Norden/Sverige.md',
        'Food Systems Obsidian/10 Innsiktskart/Norden/Finland.md',
        'research/rammeverk/leveranseplan-wp3-food-systems.md',
      ],
      recommendedPrompt:
        'Compare Nordic mechanisms without creating a country ranking unless comparable source methods are present.',
    },
    {
      ...base,
      filename: '14_ACTOR_MAP_THESIS.md',
      title: 'Actor Map Thesis - Ecosystem Without False Completeness',
      purpose: 'Frame actors, registries, networks and stakeholder gaps as a controlled map with open cells.',
      coreClaims: [
        'The actor registry is useful as a directional ecosystem map, not a complete census.',
        'Actor-gated rows are questions for validation, not settled claims.',
        'Network ties need source class and relationship type to avoid implying coordination.',
      ],
      evidenceRows: [
        ['Domain actor coverage', 'Use to show open front.', 'Do not imply complete value-chain coverage.'],
        ['CAR registry', 'Use as seed material.', 'Seed registry is not full register.'],
        ['Movement network', 'Use as source-shortlist.', 'Historical/organizational links are not ideological unity.'],
      ],
      caveats: ['No national database exists for several actor classes.', 'Public org pages may be self-reported and unverified.'],
      deckAngles: ['Slide: "The actor map is most valuable where it shows who must be asked next."', 'Slide: "Coverage gaps are operational leads."'],
      badGenericFraming: ['Avoid saying "the ecosystem consists of..." as if complete.', 'Avoid turning associations into coalitions.'],
      sourcePaths: [
        'research/_status/mvk-completeness-dashboard.md',
        'research/_status/domene-dekning-hull-2026-06-27.md',
        'research/_status/circular-food-actor-registry/CAR-final-report.md',
        'research/external/r13/R13-LAND-005-bevegelse-nettverkskart.md',
      ],
      recommendedPrompt:
        'Summarize the actor map as known actors, missing actor classes, and validation questions.',
    },
    {
      ...base,
      filename: '15_POLICY_LEVERS_THESIS.md',
      title: 'Policy Levers Thesis - From Diagnosis To Intervention',
      purpose: 'Connect evidence to policy levers without pretending all levers are validated pilots.',
      coreClaims: [
        'Policy levers should be tied to the failure mode they address: market access, data gap, logistics, procurement, nutrient return or innovation demand.',
        'The roadmap should distinguish desk-evidence from human-gated validation.',
        'Public procurement and regulation are mechanisms only when implementation status is clear.',
      ],
      evidenceRows: [
        ['Policy goals', 'Use as target/misalignment evidence.', 'Preserve "not in route" and preliminary status caveats.'],
        ['Public innovation demand', 'Use as source-shortlist.', 'Do not treat guidance as implemented case.'],
        ['Funding matrix', 'Use for M18 continuation planning.', 'Funding fit is internal orientation unless call terms are checked.'],
      ],
      caveats: ['Human workshops and partner confirmations cannot be simulated.', 'Some policy sources are EU-level and not directly EEA-binding.'],
      deckAngles: ['Slide: "Every intervention should answer: which system bottleneck does this move?"', 'Slide: "Actor validation is not a formality; it is the gate."'],
      badGenericFraming: ['Avoid "policy should support innovation" without naming instrument.', 'Avoid assuming EU strategy binds Norway.'],
      sourcePaths: [
        'research/external/r13/R13-OKO-007-policy-mal-okologi.md',
        'research/external/r13/R13-INNO-007-offentlig-innovasjon.md',
        'research/evidence-pack/roadmap.md',
        'research/RESEARCH-MISSIONS.md',
      ],
      recommendedPrompt:
        'Turn policy evidence into levers, but mark each lever as citable, PCQ, source-shortlist, actor-gated or human-gated.',
    },
    {
      ...base,
      filename: '16_DATA_GAPS_THESIS.md',
      title: 'Data Gaps Thesis - Missing Data Is A Finding',
      purpose: 'Make structural data gaps usable as decision evidence without fabricating missing values.',
      coreClaims: [
        'Type-C gaps are findings when public data does not exist or cannot answer the question.',
        'A good chart can show blank cells, but it must not impute them silently.',
        'The project should use gaps to define actor questions and next data collection missions.',
      ],
      evidenceRows: [
        ['Datagap atlas', 'Use as internal synthesis of gaps.', 'Not citable as a fact source by itself.'],
        ['R13 stop list', 'Use as figure guardrail.', 'Blocks charts until method/empty cells are visible.'],
        ['Remediation backlog', 'Use for data-quality state.', 'Older counts can drift; verify if current status matters.'],
      ],
      caveats: ['Do not convert unknown into zero.', 'Do not convert absence of public data into proof of absence in reality.'],
      deckAngles: ['Slide: "The missing cell tells us who owns the next conversation."', 'Slide: "Fail-closed is a quality feature."'],
      badGenericFraming: ['Avoid "more data is needed" without specifying which decision it blocks.', 'Avoid smoothing caveats out of slide text.'],
      sourcePaths: [
        'docs/project/mandates/R13-LAND-004-datagap-atlas.md',
        'research/REMEDIATION-BACKLOG.md',
        'research/_status/food-tg-r13/r13-intake-index-2026-06-25.md',
        'docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md',
      ],
      recommendedPrompt:
        'Create a data-gap briefing that lists blocked decisions, data owner, and whether the gap is Type A/B/C.',
    },
    {
      ...base,
      filename: '17_ROADMAP_M17_M18_THESIS.md',
      title: 'Roadmap Thesis - M17/M18 From Evidence To Action',
      purpose: 'Connect the knowledge base to July 2026 roadmap/publishing and continuation-plan needs.',
      coreClaims: [
        'The roadmap needs an evidence spine, not a research archive dump.',
        'M17/M18 work should prioritize cite-ready acceptance-pack unblocks, funding matrix, open data retrieval and pilot-brief evidence packs.',
        'Human-gated missions should be prepared but never simulated.',
      ],
      evidenceRows: [
        ['Master research plan', 'Use for execution priority.', 'Does not supersede R13 ledger where named.'],
        ['Citable status', 'Use for external readiness.', 'Counts are dated and should be rerun before final claims.'],
        ['Research missions', 'Use for human-gated scope.', 'Do not invent interview or workshop content.'],
      ],
      caveats: ['The contract period and milestone dates are time-sensitive.', 'NotebookLM cannot verify live repository or DB state.'],
      deckAngles: ['Slide: "From knowledge base to roadmap: what can be said, what must be checked, what must be asked."', 'Slide: "The next phase is not more research; it is gated conversion of evidence into decisions."'],
      badGenericFraming: ['Avoid turning the roadmap into a long activity list.', 'Avoid saying "ready" without naming the gate.'],
      sourcePaths: [
        'research/rammeverk/leveranseplan-wp3-food-systems.md',
        'research/evidence-pack/roadmap.md',
        'research/CITABLE-KNOWLEDGE-BASE-STATUS.md',
      ],
      recommendedPrompt:
        'Draft an M17/M18 roadmap outline where each section names evidence, gate, owner and next action.',
    },
    {
      ...base,
      filename: '18_EVIDENCE_DISCIPLINE_THESIS.md',
      title: 'Evidence Discipline Thesis - Trust Through Gates',
      purpose: 'Make source policy and audit status part of the knowledge product.',
      coreClaims: [
        'The knowledge base is valuable because it refuses to overclaim.',
        'Claim-lock, source locators and fail-closed acceptance tests are the trust architecture.',
        'Decks should show quality status instead of hiding it in footnotes.',
      ],
      evidenceRows: [
        ['Source attribution policy', 'Use as governing rule.', 'Applies especially to external claims.'],
        ['Citable acceptance pack', 'Use as readiness proof.', 'Some answers are intentionally fail-closed.'],
        ['Audit chain', 'Use as verification model.', 'Must be rerun for current state.'],
      ],
      caveats: ['NotebookLM cannot run audits.', 'Older audit counts are evidence of that date, not live proof.'],
      deckAngles: ['Slide: "The boundary is the product."', 'Slide: "What we refuse to say is why the rest is useful."'],
      badGenericFraming: ['Avoid hiding evidence status in appendix only.', 'Avoid claiming source-grounded equals correct.'],
      sourcePaths: [
        '.claude/source-attribution-policy.md',
        'research/CITABLE-ACCEPTANCE-TESTS.md',
        'research/CITABLE-KNOWLEDGE-BASE-STATUS.md',
      ],
      recommendedPrompt:
        'Write a trust-and-evidence section that explains claim gates in plain language for decision makers.',
    },
    {
      ...base,
      filename: '19_PRESENTATION_STRATEGY_THESIS.md',
      title: 'Presentation Strategy Thesis - Cut Through Without Overclaiming',
      purpose: 'Encode the practical presentation style needed to avoid generic NotebookLM decks.',
      coreClaims: [
        'The strongest presentation form is tension -> evidence -> caveat -> decision.',
        'Generic sustainability language should be replaced by concrete system mechanics.',
        'Each slide should contain one sharp claim and one visible boundary.',
      ],
      evidenceRows: [
        ['NotebookLM controls', 'Use to steer artifacts.', 'Prompts must enforce labels.'],
        ['Figure candidates', 'Use as deck seed list.', 'Figure-ready is not publish-ready.'],
        ['R13 stop list', 'Use as visual guardrail.', 'Blocks many tempting charts.'],
      ],
      caveats: ['Slide generation can introduce inaccuracies.', 'Human review remains the final gate.'],
      deckAngles: ['Slide pattern: "claim / proof / caveat / ask".', 'Appendix pattern: "evidence status map".'],
      badGenericFraming: ['Avoid "circular economy is an opportunity".', 'Avoid broad Nordic optimism without mechanism.'],
      sourcePaths: [
        'docs/project/mandates/R13-LAND-006-figurkandidater.md',
        'research/_status/food-tg-r13/r13-intake-index-2026-06-25.md',
      ],
      recommendedPrompt:
        'Create a presenter deck with one sharp system tension per slide and no generic sustainability language.',
    },
  ]
}

function evidencePackets(): Packet[] {
  const base = {
    packetType: 'evidence',
    allowedUse: 'Use as source-backed evidence only within the stated label and caveat.',
    maxCharsPerSource: 18_000,
  }

  return [
    packetEvidence('20_CITABLE_STATUS_EVIDENCE.md', 'Citable Status Evidence', 'citable/status snapshot', [
      'research/CITABLE-KNOWLEDGE-BASE-STATUS.md',
    ]),
    packetEvidence('21_CITABLE_ACCEPTANCE_EVIDENCE.md', 'Citable Acceptance Evidence', 'citable/fail-closed tests', [
      'research/CITABLE-ACCEPTANCE-TESTS.md',
    ]),
    packetEvidence('22_R13_INTAKE_TRIAGE_EVIDENCE.md', 'R13 Intake And Triage Evidence', 'internal triage; not fact voice', [
      'research/_status/food-tg-r13/r13-intake-index-2026-06-25.md',
      'research/_status/food-tg-r13/r13-qc-report-2026-06-25.md',
      'research/_status/food-tg-r13/r13-risk-closeout-2026-06-25.md',
    ]),
    packetEvidence('23_PCQ_READY_EVIDENCE.md', 'PCQ-Ready Evidence Packet', 'PCQ; check before external use', [
      'research/external/r13/R13-GAP-001-kritiske-importnoder.md',
      'research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md',
      'research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md',
      'research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md',
    ]),
    packetEvidence('24_SOURCE_SHORTLIST_EVIDENCE.md', 'Source-Shortlist Evidence Packet', 'source-shortlist; not claims', [
      'research/external/r13/R13-GAP-002-lokale-verdikjeder-resiliens.md',
      'research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md',
      'research/external/r13/R13-WASTE-003-matsvinn-redistribusjon.md',
      'research/external/r13/R13-INNO-006-fou-aktorer.md',
    ]),
    packetEvidence('25_ACTOR_GATE_EVIDENCE.md', 'Actor-Gate Evidence Packet', 'actor-gated; ask, do not assert', [
      'research/_status/food-tg-r13/r13-actor-gate-action-packet-2026-06-25.md',
      'research/_status/food-tg-r13/r13-actor-gate-backlog-2026-06-25.md',
      'research/_status/food-tg-r13/actor-gate/R13-GAP-006-dataeier-per-hull-2026-06-25.md',
    ]),
    packetEvidence('26_DO_NOT_VISUALIZE_REGISTER.md', 'Do-Not-Visualize Register', 'do-not-visualize-yet', [
      'research/_status/food-tg-r13/r13-intake-index-2026-06-25.md',
      'docs/project/mandates/R13-LAND-006-figurkandidater.md',
    ]),
    packetEvidence('27_IMPORT_AND_RESILIENCE_EVIDENCE.md', 'Import Nodes And Resilience Evidence', 'mixed PCQ/source-shortlist', [
      'research/external/r13/R13-GAP-001-kritiske-importnoder.md',
      'research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md',
    ]),
    packetEvidence('28_MARINE_AND_WASTE_EVIDENCE.md', 'Marine And Food Waste Evidence', 'mixed PCQ/source-shortlist', [
      'research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md',
      'research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md',
      'research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md',
    ]),
    packetEvidence('29_PROTEIN_AND_FEED_EVIDENCE.md', 'Protein And Feed Evidence', 'mixed PCQ/source-shortlist', [
      'research/external/r13/R13-PROT-001-insektprotein.md',
      'research/external/r13/R13-PROT-002-single-cell-fermentering.md',
      'research/external/r13/R13-PROT-006-soya-erstatning-for.md',
      'research/external/r13/R13-PROT-007-proteinselvforsyning.md',
    ]),
    packetEvidence('30_ORGANIC_BIODIVERSITY_POLICY_EVIDENCE.md', 'Organic, Biodiversity And Policy Evidence', 'mixed PCQ/source-shortlist', [
      'research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md',
      'research/external/r13/R13-OKO-004-biodiversitet-jordbruk.md',
      'research/external/r13/R13-OKO-007-policy-mal-okologi.md',
    ]),
    packetEvidence('31_OWNERSHIP_AND_INTEGRATION_EVIDENCE.md', 'Ownership And Vertical Integration Evidence', 'PCQ with empty cells', [
      'research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md',
      'research/external/r13/R13-LAND-002-vertikal-integrasjon.md',
      'docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md',
    ]),
    packetEvidence('32_FIGURE_CANDIDATES_EVIDENCE.md', 'Figure Candidates Evidence', 'internal figure candidates; not publish-ready', [
      'docs/project/mandates/R13-LAND-006-figurkandidater.md',
      'research/_status/food-tg-r13/r13-pcq-first-pass-2026-06-25.md',
    ]),
    packetEvidence('33_RESEARCH_PROGRAM_EVIDENCE.md', 'Research Program Evidence', 'program plan; not claim proof', [
      'docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md',
      'research/_status/food-tg-r13/r13-intake-index-2026-06-25.md',
      'research/RESEARCH-MISSIONS.md',
    ]),
    packetEvidence('34_DOMAIN_COVERAGE_EVIDENCE.md', 'Domain Coverage Evidence', 'coverage/gap status', [
      'research/_status/mvk-completeness-dashboard.md',
      'research/_status/domene-dekning-hull-2026-06-27.md',
      'research/_status/domene-sluttrapport-2026-06-25.md',
    ]),
    packetEvidence('35_CAR_REGISTRY_EVIDENCE.md', 'Circular Food Actor Registry Evidence', 'seed registry; not full census', [
      'research/_status/circular-food-actor-registry/CAR-final-report.md',
      'research/_status/circular-food-actor-registry/CAR-coverage-map.md',
      'research/_status/circular-food-actor-registry/CAR-000-schema-and-rules.md',
    ]),
    packetEvidence('36_WHITEPAPER_AND_ROADMAP_EVIDENCE.md', 'Whitepaper And Roadmap Evidence', 'draft/roadmap context', [
      'content/hvitbok/01-kort-til-jan-thomas.md',
      'content/hvitbok/02-nordisk-sirkularitet.md',
      'content/hvitbok/03-fokusomraader.md',
      'research/rammeverk/leveranseplan-wp3-food-systems.md',
    ]),
  ].map((packet) => ({ ...base, ...packet }))
}

function packetEvidence(filename: string, title: string, status: string, sourcePaths: string[]): Packet {
  return {
    filename,
    title,
    packetType: 'evidence',
    status,
    allowedUse: 'Use only according to the status label. Keep caveats and missing cells visible.',
    purpose: `Curated evidence packet for ${title.toLowerCase()}.`,
    coreClaims: [
      'Use the included excerpts as source-grounded context, not as permission to upgrade claims.',
      'Preserve source labels, method distinctions and explicit gaps.',
      'If the source says wait, parked, actor-gated or do-not-visualize-yet, keep that boundary.',
    ],
    evidenceRows: [
      ['Included source excerpts', 'Give NotebookLM retrieval surface.', 'Excerpted for quality; source file remains canonical.'],
      ['Status label', 'Controls allowed use.', 'Do not upgrade without separate verification.'],
      ['Known gaps', 'Useful for decisions and actor questions.', 'Missing values must stay visible.'],
    ],
    caveats: [
      'This packet may combine sources with different evidence levels.',
      'Do not create external deck claims without checking the strictest status among the supporting sources.',
    ],
    deckAngles: [
      'Use as evidence spine for a slide or appendix section.',
      'Phrase as "what the evidence supports" plus "what remains blocked".',
    ],
    badGenericFraming: [
      'Do not remove the source label.',
      'Do not turn a candidate or shortlist into a completed finding.',
    ],
    sourcePaths,
    recommendedPrompt: `Use ${filename} to answer with evidence, caveat, and label. Do not overclaim beyond ${status}.`,
  }
}

async function mapPackets(root: string): Promise<Packet[]> {
  const insightNotes = await walkMarkdown(root, 'Food Systems Obsidian/10 Innsiktskart/Innsikter', 30)
  const actorNotes = await walkMarkdown(root, 'Food Systems Obsidian/10 Innsiktskart/Aktører', 30)
  const loopNotes = await walkMarkdown(root, 'Food Systems Obsidian/10 Innsiktskart/Looper', 30)
  const gapNotes = await walkMarkdown(root, 'Food Systems Obsidian/10 Innsiktskart/Gaps', 30)

  const base = {
    packetType: 'map/index',
    status: 'internal context',
    allowedUse: 'Use as navigation and retrieval map, not as standalone external evidence.',
    maxCharsPerSource: 8_000,
  }

  return [
    packetMap('40_OBSIDIAN_HUB_MAP.md', 'Obsidian Hub Map', ['Food Systems Obsidian/0 Kart/HUB – Kunnskapsdatabasen.md', 'Food Systems Obsidian/Welcome.md']),
    packetMap('41_VAULT_MASTERPLAN_MAP.md', 'Vault Masterplan Map', [
      'docs/project/plans/obsidian-kunnskapskart-masterplan-2026-07-02.md',
      'docs/miro-kart-kunnskapsgrunnlag-blueprint.md',
    ]),
    packetMap('42_RESEARCH_OS_MAP.md', 'Research OS Map', [
      'research/rammeverk/leveranseplan-wp3-food-systems.md',
      'docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md',
      'docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md',
    ]),
    packetMap('43_INSIGHT_CHAIN_MAP.md', 'Insight Chain Map I01-I26', insightNotes),
    packetMap('44_ACTOR_INDEX_MAP.md', 'Actor Index Map', actorNotes),
    packetMap('45_CIRCULAR_LOOP_INDEX_MAP.md', 'Circular Loop Index Map', loopNotes),
    packetMap('46_GAP_INDEX_MAP.md', 'Gap Index Map', gapNotes),
    packetMap('47_DATA_FOUNDATION_MAP.md', 'Data Foundation Map', [
      'Food Systems Obsidian/9 Datafundament/Prisma-database.md',
      'Food Systems Obsidian/9 Datafundament/Strukturerte datasett.md',
      'Food Systems Obsidian/9 Datafundament/Forskningsarkiv.md',
      'public/data/food-systems/DATA-SOURCES.md',
    ]),
    packetMap('48_GLOSSARY_AND_LABELS_MAP.md', 'Glossary And Labels Map', [
      'src/lib/glossary/terms.ts',
      '.claude/source-attribution-policy.md',
      'research/_status/food-tg-r13/r13-intake-index-2026-06-25.md',
    ]),
    {
      ...base,
      filename: '49_UPLOAD_CHECKLIST_AND_SMOKE_TESTS.md',
      title: 'Upload Checklist And NotebookLM Smoke Tests',
      purpose: 'Provide upload order and acceptance prompts for validating that the new NotebookLM project is sharp and boundary-aware.',
      coreClaims: [
        'Upload controls first, thesis packets second, evidence packets third, map packets last.',
        'Reject the NotebookLM setup if it produces generic sustainability language or hides caveats.',
        'The pack is designed for Standard/free 50-source limits.',
      ],
      evidenceRows: [
        ['Pilot smoke test', 'Upload 00, 01, 02, 10, 12, 20, 23 first.', 'Reject if source labels disappear.'],
        ['Full-pack test', 'Ask for five sharpest insights with evidence and caveats.', 'Reject if it visualizes blocked rows.'],
        ['Deck test', 'Ask for 12-slide presenter deck.', 'Each slide needs claim, evidence, caveat and decision relevance.'],
      ],
      caveats: [
        'NotebookLM import behavior can change; check current Google limits before future reruns.',
        'Drive auto-sync does not import Google file footnotes/comments.',
      ],
      deckAngles: [
        'Use this as the operating checklist inside the NotebookLM notebook.',
        'Pin the output as a note if useful, but keep source files as the authoritative context.',
      ],
      badGenericFraming: [
        'Do not upload raw research tree.',
        'Do not upload all PDFs.',
        'Do not skip the control files.',
      ],
      sourcePaths: [],
      recommendedPrompt:
        'Run the full-pack acceptance: identify five sharp insights, each with evidence, caveat, source label and one decision implication.',
      extraSections: [
        {
          heading: 'Recommended Upload Order',
          body: mdList([
            '00_START_HERE.md',
            '01_DECK_BRIEFING_INSTRUCTIONS.md',
            '02_CLAIM_BOUNDARIES.md',
            '10-19 thesis packets',
            '20-36 evidence packets',
            '40-49 map/index packets',
            'SOURCE_INDEX.csv only if you want a tabular companion source',
          ]),
        },
        {
          heading: 'Acceptance Prompts',
          body: mdList([
            'What are the 5 sharpest Food Systems insights, with evidence, caveats, and source labels?',
            'Create a 12-slide presenter deck. Every slide must include claim, evidence source, caveat, source label and decision implication.',
            'Which tempting charts should we not make yet, and why?',
            'Separate citable claims, PCQ candidates, source-shortlist leads and actor-gated questions for a partner briefing.',
          ]),
        },
      ],
    },
  ].map((packet) => ({ ...base, ...packet }))
}

function packetMap(filename: string, title: string, sourcePaths: string[]): Packet {
  return {
    filename,
    title,
    packetType: 'map/index',
    status: 'internal context',
    allowedUse: 'Use for navigation, retrieval and orientation; do not cite as standalone external evidence.',
    purpose: `Navigation and index packet for ${title.toLowerCase()}.`,
    coreClaims: [
      'This packet helps NotebookLM find the right part of the knowledge base.',
      'Map notes point to evidence and status surfaces; they do not replace them.',
      'Use this packet to ask better follow-up questions across sources.',
    ],
    evidenceRows: [
      ['Vault/index notes', 'Improve retrieval and cross-source navigation.', 'Not a claim gate.'],
      ['Source paths', 'Preserve repo provenance.', 'Verify current file before operational use.'],
      ['Labels', 'Keep internal/citable distinction visible.', 'Do not upgrade map text to external evidence.'],
    ],
    caveats: [
      'Some map notes are generated scaffolding.',
      'Canvas files are not included as NotebookLM Markdown sources.',
    ],
    deckAngles: [
      'Use as an appendix map.',
      'Use to select the right evidence packet before drafting claims.',
    ],
    badGenericFraming: [
      'Do not treat a map node as proof.',
      'Do not cite Obsidian scaffolding instead of the underlying source.',
    ],
    sourcePaths,
    recommendedPrompt: `Use ${filename} to navigate to relevant evidence packets before answering.`,
  }
}

async function buildPackets(root: string) {
  return [...controlPackets(), ...thesisPackets(), ...evidencePackets(), ...(await mapPackets(root))]
}

export async function buildNotebookLmExport(options: NotebookLmExportOptions): Promise<NotebookLmExportResult> {
  const sourceRoot = path.resolve(options.sourceRoot)
  const exportDir = path.join(
    path.resolve(options.outputRoot),
    `food-systems-2026-${options.date}`,
  )

  await rm(exportDir, { recursive: true, force: true })
  await mkdir(exportDir, { recursive: true })

  const packets = await buildPackets(sourceRoot)
  if (packets.length > SOURCE_LIMIT) {
    throw new Error(`NotebookLM export has ${packets.length} sources; limit is ${SOURCE_LIMIT}`)
  }

  const files: NotebookLmExportFile[] = []
  for (const packet of packets) {
    const content = await renderPacket(sourceRoot, packet, options.date)
    const bytes = Buffer.byteLength(content)
    const words = wordCount(content)
    if (words >= SOURCE_WORD_LIMIT) {
      throw new Error(`${packet.filename} has ${words} words; limit is ${SOURCE_WORD_LIMIT}`)
    }
    if (bytes >= SOURCE_BYTE_LIMIT) {
      throw new Error(`${packet.filename} has ${bytes} bytes; limit is ${SOURCE_BYTE_LIMIT}`)
    }
    await writeFile(path.join(exportDir, packet.filename), content)
    files.push({
      filename: packet.filename,
      title: packet.title,
      packetType: packet.packetType,
      status: packet.status,
      allowedUse: packet.allowedUse,
      recommendedPrompt: packet.recommendedPrompt,
      wordCount: words,
      bytes,
    })
  }

  const indexHeaders = [
    'upload_order',
    'filename',
    'title',
    'packet_type',
    'status',
    'allowed_use',
    'word_count',
    'bytes',
    'recommended_notebooklm_prompt',
  ]
  const indexRows = files.map((file, index) => [
    index + 1,
    file.filename,
    file.title,
    file.packetType,
    file.status,
    file.allowedUse,
    file.wordCount,
    file.bytes,
    file.recommendedPrompt,
  ])
  await writeFile(
    path.join(exportDir, 'SOURCE_INDEX.csv'),
    [indexHeaders.map(csvEscape).join(','), ...indexRows.map((row) => row.map(csvEscape).join(','))].join('\n') + '\n',
  )

  await writeFile(
    path.join(exportDir, 'MANIFEST.json'),
    JSON.stringify(
      {
        date: options.date,
        sourceRoot,
        sourceCount: files.length,
        limit: SOURCE_LIMIT,
        files,
      },
      null,
      2,
    ) + '\n',
  )

  await writeFile(
    path.join(exportDir, 'README.txt'),
    [
      '# Food Systems 2026 NotebookLM Export',
      '',
      `Generated: ${options.date}`,
      '',
      'Local operator note: do not upload this README. Upload the numbered Markdown files first. `SOURCE_INDEX.csv` is an optional companion source, and `MANIFEST.json` is for local audit/provenance rather than NotebookLM ingestion.',
      '',
      'Recommended first upload sequence:',
      '',
      mdList(['00_START_HERE.md', '01_DECK_BRIEFING_INSTRUCTIONS.md', '02_CLAIM_BOUNDARIES.md', '10-19 thesis packets', '20-36 evidence packets', '40-49 map/index packets']),
      '',
    ].join('\n'),
  )

  return { exportDir, files }
}
