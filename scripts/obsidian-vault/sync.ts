import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'
import { parseCsvRecords } from '../../src/lib/csv'
import {
  applyManagedSection,
  buildGraphSettings,
  buildM2DraftSections,
  buildMeetingTranscriptArtifacts,
  buildRegisterArtifact,
  buildStakeholderArtifacts,
  buildVaultExportArtifacts,
  mergeGeneratedNote,
  noteFileName,
  normalizeExistingNote,
  validateVault,
} from '../../src/lib/obsidian-vault'

const repoRoot = process.cwd()
const vaultPath = join(repoRoot, 'Food Systems Obsidian')
const checkOnly = process.argv.includes('--check')

if (!existsSync(vaultPath)) {
  console.error(`Vault not found: ${relative(repoRoot, vaultPath)}`)
  process.exit(1)
}

if (!checkOnly) {
  const migrated = migrateNestedManagedNotes()
  if (migrated > 0) {
    console.log(`vault:sync migrated nested managed notes=${migrated}`)
  }

  const markdownFiles = walkVaultMarkdown(vaultPath)
  let changed = 0

  for (const file of markdownFiles) {
    const before = readFileSync(file, 'utf8')
    const after = normalizeExistingNote(before, relative(vaultPath, file))
    if (after !== before) {
      writeFileSync(file, after)
      changed += 1
    }
  }

  console.log(`vault:sync normalized ${markdownFiles.length} notes (${changed} changed)`)
  syncGraphSettings()
  syncDataviewMocs()
  syncMeetingTranscriptSources()
  syncStakeholderSources()
  syncVaultExport()
  syncM2DraftSections()
  syncTopologyRegisters()
}

function migrateNestedManagedNotes(): number {
  const roots = [
    join(vaultPath, '10 Innsiktskart', 'Looper'),
    join(vaultPath, '10 Innsiktskart', 'Gaps'),
    join(vaultPath, '10 Innsiktskart', 'Innsikter'),
    join(vaultPath, '11 Maktkart', 'Selskaper'),
    join(vaultPath, '11 Maktkart', 'Personer'),
  ]
  const replacements: Array<{ oldTarget: string; newTarget: string }> = []
  let migrated = 0

  for (const root of roots) {
    if (!existsSync(root)) continue
    for (const file of walkFiles(root)) {
      if (!file.endsWith('.md')) continue
      const relFromRoot = relative(root, file)
      if (relFromRoot.startsWith(`Register/`)) continue
      if (!relFromRoot.includes('/')) continue

      const title = noteTitleFromFile(file)
      const target = join(root, noteFileName(title))
      if (target === file || existsSync(target)) continue

      mkdirSync(dirname(target), { recursive: true })
      renameSync(file, target)
      replacements.push({
        oldTarget: relative(vaultPath, file).replace(/\.md$/i, ''),
        newTarget: relative(vaultPath, target).replace(/\.md$/i, ''),
      })
      replacements.push({
        oldTarget: title,
        newTarget: noteFileName(title).replace(/\.md$/i, ''),
      })
      migrated += 1
    }
    removeEmptyDirectories(root)
  }

  if (replacements.length > 0) {
    rewriteWikiLinkTargets(replacements)
  }

  return migrated
}

function rewriteWikiLinkTargets(replacements: Array<{ oldTarget: string; newTarget: string }>) {
  for (const file of walkFiles(vaultPath)) {
    if (!file.endsWith('.md') && !file.endsWith('.canvas')) continue
    let source = readFileSync(file, 'utf8')
    const before = source
    for (const { oldTarget, newTarget } of replacements) {
      const oldFileTarget = `${oldTarget}.md`
      const newFileTarget = `${newTarget}.md`
      source = source
        .split(`[[${oldTarget}|`)
        .join(`[[${newTarget}|`)
        .split(`[[${oldTarget}]]`)
        .join(`[[${newTarget}]]`)
        .split(oldFileTarget)
        .join(newFileTarget)
    }
    if (source !== before) {
      writeFileSync(file, source)
    }
  }
}

function removeEmptyDirectories(root: string) {
  for (const entry of readdirSync(root)) {
    const fullPath = join(root, entry)
    if (!statSync(fullPath).isDirectory()) continue
    removeEmptyDirectories(fullPath)
    if (readdirSync(fullPath).length === 0) {
      rmSync(fullPath, { recursive: true, force: true })
    }
  }
}

const result = validateVault(vaultPath, {
  requirePresentationAssets: true,
  requireGapMissions: true,
  requireVaultExport: existsSync(join(repoRoot, 'data', 'vault-export', 'manifest.json')),
  requireNoOrphans: true,
  allowedOrphanPaths: ['Welcome.md', '0 Kart/HUB – Kunnskapsdatabasen.md', '0 Kart/Oppsett.md'],
  requirePersonUsageRule: true,
  requireMetadataOnlySources: true,
  requireInsightCandidateGate: true,
})

if (result.issues.length > 0) {
  for (const issue of result.issues) {
    console.error(`${issue.file}: ${issue.message}`)
  }
  console.error(`vault:check failed with ${result.issues.length} issue(s)`)
  process.exit(1)
}

console.log('vault:check ok')

function syncMeetingTranscriptSources() {
  const sources = [
    ...collectSourceFiles(join(repoRoot, 'docs', 'meetings'), (file) =>
      ['.md', '.html'].some((extension) => file.endsWith(extension)),
    ).map((file) => ({ file, kind: 'meeting' as const })),
    ...collectSourceFiles(join(repoRoot, 'research', 'landbrukarena_transcripts'), (file) =>
      file.endsWith('.txt'),
    ).map((file) => ({ file, kind: 'transcript' as const })),
  ].map(({ file, kind }) => ({
    sourcePath: relative(repoRoot, file),
    kind,
    byteLength: statSync(file).size,
  }))

  if (sources.length === 0) return

  const result = buildMeetingTranscriptArtifacts(sources)
  let changed = 0

  for (const file of result.files) {
    const target = join(vaultPath, file.path)
    mkdirSync(dirname(target), { recursive: true })
    const before = existsSync(target) ? readFileSync(target, 'utf8') : undefined
    const after = mergeGeneratedNote(file.content, before)
    if (after !== before) {
      writeFileSync(target, after)
      changed += 1
    }
  }

  console.log(`${result.summaryLine} changed=${changed}`)
}

function syncGraphSettings() {
  const target = join(vaultPath, '.obsidian', 'graph.json')
  mkdirSync(dirname(target), { recursive: true })
  const before = existsSync(target) ? readFileSync(target, 'utf8') : undefined
  const after = buildGraphSettings()
  const changed = after !== before ? 1 : 0
  if (changed) {
    writeFileSync(target, after)
  }
  console.log(`vault:sync graph-settings changed=${changed}`)
}

function syncDataviewMocs() {
  const targets = [
    dataviewTarget('0 Kart/HUB – Kunnskapsdatabasen.md', [
      '### Klynger',
      '',
      '```dataview',
      'TABLE rolle, farge, status',
      'FROM ""',
      'WHERE type = "klynge"',
      'SORT file.name ASC',
      '```',
      '',
      '### Utkast og interne gates',
      '',
      '```dataview',
      'TABLE type, status, siterbarhet, kilde',
      'FROM ""',
      'WHERE status = "utkast" OR siterbarhet = "intern"',
      'SORT file.folder ASC, file.name ASC',
      '```',
    ]),
    dataviewTarget('10 Innsiktskart/Innsiktskartet.md', [
      '### Innsikter',
      '',
      '```dataview',
      'TABLE status, siterbarhet, kilde',
      'FROM "10 Innsiktskart/Innsikter"',
      'WHERE type = "innsikt"',
      'SORT file.name ASC',
      '```',
      '',
      '### Gaps med mission-status',
      '',
      '```dataview',
      'TABLE mission, status, kilde',
      'FROM "10 Innsiktskart/Gaps"',
      'WHERE type = "gap"',
      'SORT mission ASC, file.name ASC',
      '```',
    ]),
    dataviewTarget('11 Maktkart/Maktkartet.md', [
      '### DB-genererte selskaper',
      '',
      '```dataview',
      'TABLE orgnr, status, kilde',
      'FROM "11 Maktkart/Selskaper"',
      'WHERE type = "aktor"',
      'SORT file.name ASC',
      '```',
      '',
      '### Interlockere',
      '',
      '```dataview',
      'TABLE verv, status, kilde',
      'FROM "11 Maktkart/Personer"',
      'WHERE type = "person"',
      'SORT verv DESC, file.name ASC',
      '```',
    ]),
    clusterDataviewTarget('1 Oversikt og navigasjon', 'Klynge – Oversikt og navigasjon.md'),
    clusterDataviewTarget('2 Intern', 'Klynge – Intern.md'),
    clusterDataviewTarget('3 Selskap og eierskap', 'Klynge – Selskap og eierskap.md'),
    clusterDataviewTarget('4 Matsystem', 'Klynge – Matsystem.md'),
    clusterDataviewTarget('5 Produsenter og støtte', 'Klynge – Produsenter og støtte.md'),
    clusterDataviewTarget('6 Nordisk', 'Klynge – Nordisk.md'),
    clusterDataviewTarget('7 Kunnskap', 'Klynge – Kunnskap.md'),
    clusterDataviewTarget('8 Bibliotek', 'Klynge – Bibliotek.md'),
  ]
  let changed = 0

  for (const target of targets) {
    const filePath = join(vaultPath, target.relPath)
    if (!existsSync(filePath)) continue
    const before = readFileSync(filePath, 'utf8')
    const after = applyManagedSection(before, '## Dynamiske oversikter', target.body)
    if (after !== before) {
      writeFileSync(filePath, after)
      changed += 1
    }
  }

  console.log(`vault:sync dataview-mocs targets=${targets.length} changed=${changed}`)
}

function syncTopologyRegisters() {
  const loopItems = collectNoteItems(join(vaultPath, '10 Innsiktskart', 'Looper'), (title) =>
    title.startsWith('Loop –'),
  )
  const gapItems = collectSourceFiles(join(vaultPath, '10 Innsiktskart', 'Gaps'), (file) => file.endsWith('.md'))
    .map((file) => {
      const title = noteTitleFromFile(file)
      if (!title.startsWith('Gap –')) return null
      const source = readFileSync(file, 'utf8')
      const mission = frontmatterField(source, 'mission')
      return noteRegisterItem(file, title, mission ? `mission ${mission}` : undefined)
    })
    .filter((item): item is { title: string; target?: string; detail?: string } => item !== null)
  const companyFolderItems = collectNoteItems(join(vaultPath, '11 Maktkart', 'Selskaper'), (title) =>
    title !== 'Selskapsmappe-register',
  )

  const artifacts = [
    buildRegisterArtifact({
      title: 'Loop-register',
      path: join('10 Innsiktskart', 'Looper', 'Loop-register.md'),
      source: 'scripts/obsidian-vault/sync.ts',
      type: 'loop',
      intro: 'Register over loop-noder som gir alle loopene et eksplisitt inngangspunkt i grafen.',
      items: loopItems,
      links: ['Innsiktskartet', 'Aktørcaser – suksess og fiasko'],
    }),
    buildRegisterArtifact({
      title: 'Gap-register',
      path: join('10 Innsiktskart', 'Gaps', 'Gap-register.md'),
      source: 'scripts/obsidian-vault/sync.ts',
      type: 'gap',
      intro: 'Register over gap-noder og tilhørende research-missions.',
      items: gapItems,
      links: ['Innsiktskartet', 'Gap-oversikten – hull i sirkulariteten'],
    }),
    buildRegisterArtifact({
      title: 'Selskapsmappe-register',
      path: join('11 Maktkart', 'Selskaper', 'Selskapsmappe-register.md'),
      source: 'scripts/obsidian-vault/sync.ts',
      type: 'aktor',
      intro: 'Register over alle selskapsnoter som ligger i Selskaper-mappen, inkludert eldre AP-1-noder og DB-genererte noder.',
      items: companyFolderItems,
      links: [
        'Maktkartet',
        ...(existsSync(join(repoRoot, 'data', 'vault-export', 'manifest.json')) ? ['Selskapsregister'] : []),
        'Eierskapsregisteret',
      ],
    }),
  ]
  let changed = 0

  for (const artifact of artifacts) {
    const target = join(vaultPath, artifact.path)
    mkdirSync(dirname(target), { recursive: true })
    const before = existsSync(target) ? readFileSync(target, 'utf8') : undefined
    const after = mergeGeneratedNote(artifact.content, before)
    if (after !== before) {
      writeFileSync(target, after)
      changed += 1
    }
  }

  changed += syncTopologyEntryLinks()

  console.log(
    `vault:sync topology-registers loops=${loopItems.length} gaps=${gapItems.length} companies=${companyFolderItems.length} changed=${changed}`,
  )
}

function syncTopologyEntryLinks(): number {
  const targets = [
    {
      relPath: '10 Innsiktskart/Innsiktskartet.md',
      heading: '## Sirkularitet',
      body: [
        '- [[Loop-register]] — alle loop-noder i `Looper/`',
        '- [[Gap-register]] — alle gap-noder i `Gaps/`',
        '- [[Gap-oversikten – hull i sirkulariteten]]',
        '- [[Aktørcaser – suksess og fiasko]]',
      ],
    },
    {
      relPath: '11 Maktkart/Maktkartet.md',
      heading: '## Registre',
      body: [
        '- [[Eierskapsregisteret]] — alle eierkanter med kilder og M&A-avtaler',
        ...(existsSync(join(repoRoot, 'data', 'vault-export', 'manifest.json'))
          ? ['- [[Selskapsregister]] — alle DB-eksporterte selskapsnoder']
          : []),
        '- [[Selskapsmappe-register]] — alle noter under `Selskaper/`, inkludert eldre AP-1-noder',
        '- [[Personregister]] — interlockere med minst to styreverv',
      ],
    },
  ]
  let changed = 0

  for (const target of targets) {
    const filePath = join(vaultPath, target.relPath)
    if (!existsSync(filePath)) continue
    const before = readFileSync(filePath, 'utf8')
    const after = applyManagedSection(before, target.heading, target.body)
    if (after !== before) {
      writeFileSync(filePath, after)
      changed += 1
    }
  }

  return changed
}

function syncStakeholderSources() {
  const seedPath = join(repoRoot, 'research', 'interviews', 'landbrukarena-aktor-seed-2026-03-19.csv')
  if (!existsSync(seedPath)) return

  const rows = parseCsvRecords(readFileSync(seedPath, 'utf8')).map((record) => ({
    actor: record.actor,
    actorType: record.actor_type,
    whyRelevantForMapping: record.why_relevant_for_mapping,
    priority: record.priority,
    suggestedAsk: record.suggested_ask,
    sourceBasis: record.source_basis,
  }))
  const actorNoteTitles = new Set(
    collectSourceFiles(join(vaultPath, '10 Innsiktskart', 'Aktører'), (file) => file.endsWith('.md')).map(
      (file) => basename(file, '.md'),
    ),
  )
  const actorNoteAliases = buildActorNoteAliases(rows.map((row) => row.actor), actorNoteTitles)
  const result = buildStakeholderArtifacts(rows, actorNoteTitles, actorNoteAliases)
  let changed = 0

  for (const file of result.files) {
    const target = join(vaultPath, file.path)
    mkdirSync(dirname(target), { recursive: true })
    const before = existsSync(target) ? readFileSync(target, 'utf8') : undefined
    const after = mergeGeneratedNote(file.content, before)
    if (after !== before) {
      writeFileSync(target, after)
      changed += 1
    }
  }

  console.log(`${result.summaryLine} changed=${changed}`)
}

function syncVaultExport() {
  const exportDir = join(repoRoot, 'data', 'vault-export')
  if (!existsSync(join(exportDir, 'manifest.json'))) return
  const ap1BridgeNames = readAp1BridgeNames()
  const m2DraftSectionsByPath = new Map(buildM2DraftSections().map((section) => [section.relPath, section]))

  const result = buildVaultExportArtifacts({
    manifest: readJson(join(exportDir, 'manifest.json')),
    companies: readJson(join(exportDir, 'companies.json')),
    ownershipEdges: readJson(join(exportDir, 'ownership-edges.json')),
    boardMembers: readJson(join(exportDir, 'board-members.json')),
    businessRelationships: readJson(join(exportDir, 'business-relationships.json')),
    properties: readJson(join(exportDir, 'properties.json')),
    ownershipForest: readJson(join(exportDir, 'ownership-forest.json')),
    coreCompanyIds: readCoreCompanyIds(),
    coreCompanyNames: ap1BridgeNames.companyNames,
    corePersonNames: ap1BridgeNames.personNames,
  })
  let changed = 0
  const expectedPaths = new Set(result.files.map((file) => file.path))

  for (const file of result.files) {
    const target = join(vaultPath, file.path)
    mkdirSync(dirname(target), { recursive: true })
    const before = existsSync(target) ? readFileSync(target, 'utf8') : undefined
    let after = file.path.endsWith('.md') ? mergeGeneratedNote(file.content, before) : file.content
    const m2DraftSection = m2DraftSectionsByPath.get(file.path)
    if (m2DraftSection && file.path.endsWith('.md')) {
      after = applyManagedSection(after, m2DraftSection.heading, m2DraftSection.body)
    }
    if (after !== before) {
      writeFileSync(target, after)
      changed += 1
    }
  }
  const staleRemoved = removeStaleExportArtifacts(expectedPaths)

  console.log(`${result.summaryLine} changed=${changed} staleRemoved=${staleRemoved}`)
}

function syncM2DraftSections() {
  const sections = buildM2DraftSections()
  let changed = 0
  let skipped = 0

  for (const section of sections) {
    const filePath = join(vaultPath, section.relPath)
    if (!existsSync(filePath)) {
      skipped += 1
      continue
    }
    const before = readFileSync(filePath, 'utf8')
    const after = applyManagedSection(before, section.heading, section.body)
    if (after !== before) {
      writeFileSync(filePath, after)
      changed += 1
    }
  }

  console.log(`vault:sync m2-drafts targets=${sections.length} changed=${changed} skipped=${skipped}`)
}

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function readCoreCompanyIds(): string[] {
  const coveragePath = join(repoRoot, 'data', 'konsern-coverage.json')
  if (!existsSync(coveragePath)) return []
  const coverage = readJson(coveragePath) as { entries?: Array<{ rootCompanyId?: string }> }
  return (coverage.entries ?? []).map((entry) => entry.rootCompanyId).filter((id): id is string => Boolean(id))
}

function readAp1BridgeNames(): { companyNames: string[]; personNames: string[] } {
  const ap1Path = join(repoRoot, 'research', 'analyse', 'ap1-styreoverlapp-active-only.json')
  if (!existsSync(ap1Path)) return { companyNames: [], personNames: [] }
  const ap1 = readJson(ap1Path) as { topBridges?: Array<{ name?: string; companies?: string[] }> }
  const personNames = new Set<string>()
  const companyNames = new Set<string>()
  for (const bridge of ap1.topBridges ?? []) {
    if (bridge.name) personNames.add(bridge.name)
    for (const company of bridge.companies ?? []) {
      companyNames.add(company)
    }
  }
  return { companyNames: [...companyNames], personNames: [...personNames] }
}

function removeStaleExportArtifacts(expectedPaths: Set<string>): number {
  const roots = [
    join(vaultPath, '11 Maktkart', 'Selskaper'),
    join(vaultPath, '11 Maktkart', 'Personer'),
    join(vaultPath, '0 Kart', 'Konsern'),
  ]
  let removed = 0

  for (const root of roots) {
    for (const file of walkFiles(root)) {
      const rel = relative(vaultPath, file)
      if (expectedPaths.has(rel)) continue
      if (file.endsWith('.canvas') && rel.startsWith(join('0 Kart', 'Konsern'))) {
        unlinkSync(file)
        removed += 1
        continue
      }
      if (!file.endsWith('.md')) continue

      const source = readFileSync(file, 'utf8')
      const isDbGenerated =
        source.includes('kilde: data/vault-export/companies.json') ||
        source.includes('kilde: data/vault-export/board-members.json')
      const hasOnlyPlaceholderNotes = source.endsWith('## Notater\n\n_Utvikles gjennom prosjektet._\n')

      if (isDbGenerated && hasOnlyPlaceholderNotes) {
        unlinkSync(file)
        removed += 1
      }
    }
  }

  return removed
}

function walkFiles(root: string): string[] {
  if (!existsSync(root)) return []

  const files: string[] = []
  for (const entry of readdirSync(root)) {
    const fullPath = join(root, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      files.push(...walkFiles(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

function buildActorNoteAliases(actors: string[], actorNoteTitles: Set<string>): Map<string, string> {
  const aliases = new Map<string, string>()
  const titles = [...actorNoteTitles]

  for (const actor of actors) {
    const actorKey = normalizeActorKey(actor)
    const target = titles.find((title) => {
      const titleKey = normalizeActorKey(title)
      return titleKey === actorKey || titleKey.startsWith(actorKey) || actorKey.startsWith(titleKey)
    })
    if (target) aliases.set(actor, target)
  }

  return aliases
}

function normalizeActorKey(value: string): string {
  return value
    .toLocaleLowerCase('nb')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'a')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function collectNoteItems(
  root: string,
  predicate: (title: string) => boolean,
): Array<{ title: string; target?: string; detail?: string }> {
  return collectSourceFiles(root, (file) => file.endsWith('.md'))
    .map((file) => noteRegisterItem(file, noteTitleFromFile(file)))
    .filter((item) => predicate(item.title))
    .filter((item) => basename(item.target ?? item.title) !== 'Selskapsmappe-register')
    .sort((a, b) => a.title.localeCompare(b.title, 'nb'))
}

function noteRegisterItem(file: string, title: string, detail?: string): { title: string; target?: string; detail?: string } {
  const relTarget = relative(vaultPath, file).replace(/\.md$/i, '')
  const titleTarget = noteFileName(title).replace(/\.md$/i, '')
  return {
    title,
    target: basename(file, '.md') === titleTarget ? undefined : relTarget,
    detail,
  }
}

function noteTitleFromFile(file: string): string {
  const source = readFileSync(file, 'utf8')
  const heading = /^#\s+(.+)$/m.exec(source)
  return heading?.[1]?.trim() ?? basename(file, '.md')
}

function frontmatterField(source: string, field: string): string | undefined {
  const match = new RegExp(`^${field}:\\s*(.+)$`, 'm').exec(source)
  return match?.[1]?.trim()
}

function dataviewTarget(relPath: string, body: string[]): { relPath: string; body: string[] } {
  return { relPath, body }
}

function clusterDataviewTarget(folder: string, noteName: string): { relPath: string; body: string[] } {
  return dataviewTarget(join(folder, noteName), [
    '```dataview',
    'TABLE rute, status, siterbarhet',
    `FROM "${folder}"`,
    'WHERE type = "seksjon"',
    'SORT file.name ASC',
    '```',
  ])
}

function collectSourceFiles(root: string, predicate: (file: string) => boolean): string[] {
  if (!existsSync(root)) return []
  return walkFiles(root).filter(predicate).sort((a, b) => a.localeCompare(b, 'nb'))
}

function walkVaultMarkdown(root: string): string[] {
  const { readdirSync, statSync } = require('node:fs') as typeof import('node:fs')
  const files: string[] = []

  for (const entry of readdirSync(root)) {
    const fullPath = join(root, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      files.push(...walkVaultMarkdown(fullPath))
    } else if (entry.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}
