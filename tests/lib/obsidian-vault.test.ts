import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import {
  applyManagedSection,
  buildGraphSettings,
  buildMeetingTranscriptArtifacts,
  buildRegisterArtifact,
  buildStakeholderArtifacts,
  buildVaultExportArtifacts,
  buildGeneratedNote,
  buildM2DraftSections,
  mergeGeneratedNote,
  noteFileName,
  validateInsightCandidateApprovalGate,
  validateMasterplanFrontmatterLinks,
  validateReferencedPaths,
  validateReviewCloseout,
  validateReviewPackageFrontmatterLinks,
  validateReviewProtocolDecisionGate,
  validateReviewSamples,
  validateVault,
} from '../../src/lib/obsidian-vault'

const ACTIVE_OBSIDIAN_MASTERPLAN_PATH =
  'docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md'

const REQUIRED_V3_MASTERPLAN_RELATED_FILES = [
  'scripts/obsidian-vault/sync.ts',
  'scripts/obsidian-vault/review-preflight.ts',
  'scripts/obsidian-vault/review-closeout.ts',
  'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
  'docs/miro-kart-kunnskapsgrunnlag-blueprint.md',
] as const

function writeSupportFiles(repo: string, files: readonly string[]) {
  for (const file of files) {
    mkdirSync(join(repo, ...file.split('/').slice(0, -1)), { recursive: true })
    writeFileSync(join(repo, file), '')
  }
}

function buildV3MasterplanFixture(options: {
  bruksregel?: string
  relatedFiles?: readonly string[]
  omitSection?: string
  omitContractText?: string
} = {}) {
  const relatedFiles = options.relatedFiles ?? REQUIRED_V3_MASTERPLAN_RELATED_FILES
  const sections = [
    '## 0. Goal-prompt (lim inn i Codex)',
    '## 1. Kritisk analyse av V2-leveransen (PR #228)',
    '## 2. Målbilde',
    '## 3. Arbeidspakker',
    '### M0 — Se V2 og lås baseline (MENNESKE — Gabriel, ~45 min, gjøres først)',
    '### M1 — Oversiktslaget: signal over støy (CODEX — kjernefasen)',
    '### M2 — Innholdsløft der det betyr noe (CODEX foreslår → MENNESKE godkjenner)',
    '### M3 — Visningsflaten (CODEX + menneskelig QA)',
    '### M4 — Slank prosessmaskineriet (CODEX)',
    '### M5 — VK-5 menneskelig review og closeout (MENNESKE — Gabriel + evt. Cathrine)',
    '### M6 — Levende drift (løpende)',
    '## 4. Rekkefølge og avhengigheter',
    '## 5. Vernede invarianter (uendret fra V2, gjelder alle faser)',
    '## 6. Suksesskriterier for hele V3',
  ].filter((section) => section !== options.omitSection)
  const contractText = [
    '**Akseptanse:** PR #228 merget til main; du har sett V2-grafen med plugins aktive; beslutning bekreftet om at M1-M4 kjøres.',
    '**Akseptanse:** `vault:sync && vault:check` grønn; kjerne-graf ≤ ~180 noder med filter aktivt; ingen note-titler avkuttet av slash-mapper; Oversiktskart.canvas finnes og Welcome peker dit; diff viser kun M1-endringer.',
    '**Akseptanse:** ingen kravliste finnes i mer enn ett dokument; alle antall i styringsdokumentene kan spores til kanonisk kilde; gates fortsatt grønne/røde som før (closeout feiler fortsatt før M5).',
    '**Akseptanse:** closeout grønn; kartet kan kalles ferdig internt arbeidskart + godkjent visningsflate.',
    '1. Menneskelig innhold under `## Notater` overlever alltid sync — også gjennom M1-flyttingene (flytt = git mv + lenkeoppdatering, aldri regenerering av notedelen).',
    '2. Vault-endringer rører aldri app-kode, DB eller committede dataartefakter (enveis repo → vault; unntak `data/vault-export/` som sync-input).',
    '3. Alle datagenererte noter bærer kilde-referanse og siterbarhetsmarkering; AP-1-bruksregelen står ordrett på personnoter.',
    '4. `vault:check` grønn før hver fase merges; bygget avhenger aldri av vaulten.',
    '5. Ingen nye claims eksternt uten claim-lock/siterbarhets-gate — kartets lesbarhet endrer ikke publiserbarhet.',
  ].filter((text) => text !== options.omitContractText)

  return [
    '---',
    'tittel: Masterplan V3 — Fra komplett vault til lesbart kart (Obsidian)',
    'status: utkast-til-godkjenning',
    'eier: Gabriel',
    'dato: 2026-07-02',
    'arbeidsflate: Food Systems Obsidian/ (vault i repo-roten)',
    `bruksregel: ${options.bruksregel ?? 'Internt arbeidskart. Ekstern bruk av tall/claims krever claim-lock/siterbarhets-gate (.claude/source-attribution-policy.md).'}`,
    'relaterte_filer:',
    ...relatedFiles.map((file) => `  - ${file}`),
    '---',
    '# Masterplan V3: Fra komplett vault til lesbart kart',
    ...sections,
    ...contractText,
    '',
  ].join('\n')
}

function writeV3MasterplanFixture(repo: string, options?: Parameters<typeof buildV3MasterplanFixture>[0]) {
  mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
  writeFileSync(join(repo, ACTIVE_OBSIDIAN_MASTERPLAN_PATH), buildV3MasterplanFixture(options))
}

describe('obsidian vault sync helpers', () => {
  it('upserts managed Dataview sections before human notes without touching notes', () => {
    const managedBody = [
      '```dataview',
      'TABLE status, siterbarhet',
      'FROM "10 Innsiktskart/Innsikter"',
      '```',
    ]
    const source = buildGeneratedNote({
      title: 'Klynge – Kunnskap',
      frontmatter: {
        type: 'klynge',
        status: 'generert',
        kilde: 'test',
        siterbarhet: 'intern',
      },
      body: [
        '## Seksjoner',
        '',
        '- [[Innsikt]]',
        '',
        ...managedBody,
        '',
        '## Dynamiske oversikter',
        '',
        ...managedBody,
      ],
    }).replace('_Utvikles gjennom prosjektet._', 'Menneskelig observasjon.')

    const first = applyManagedSection(source, '## Dynamiske oversikter', managedBody)
    const second = applyManagedSection(first, '## Dynamiske oversikter', [
      '```dataview',
      'TABLE status, siterbarhet, kilde',
      'FROM "10 Innsiktskart/Innsikter"',
      '```',
    ])

    assert.ok(first.includes('## Dynamiske oversikter\n\n```dataview'))
    assert.equal((first.match(/```dataview/g) ?? []).length, 1)
    assert.equal((second.match(/## Dynamiske oversikter/g) ?? []).length, 1)
    assert.ok(second.includes('TABLE status, siterbarhet, kilde'))
    assert.ok(second.endsWith('## Notater\n\nMenneskelig observasjon.\n'))
  })

  it('replaces existing managed sections in place instead of moving them to the end', () => {
    const source = buildGeneratedNote({
      title: 'Innsiktskartet',
      frontmatter: {
        type: 'hub',
        status: 'generert',
        kilde: 'test',
        siterbarhet: 'intern',
      },
      body: [
        '## Sirkularitet',
        '',
        '- gammelt',
        '',
        '## Norden',
        '',
        '[[Norge]] · [[Sverige]]',
      ],
    })

    const next = applyManagedSection(source, '## Sirkularitet', ['- [[Loop-register]]', '- [[Gap-register]]'])

    assert.ok(next.indexOf('## Sirkularitet') < next.indexOf('## Norden'))
    assert.ok(next.includes('## Sirkularitet\n\n- [[Loop-register]]\n- [[Gap-register]]\n\n## Norden'))
  })

  it('preserves human-written Notater content byte-for-byte during merge', () => {
    const existing = [
      '---',
      'type: seksjon',
      'status: kuratert',
      'kilde: old',
      'siterbarhet: intern',
      '---',
      '',
      '# Gammel tittel',
      '',
      '## Notater',
      '',
      'Menneskelig tekst med æøå.',
      'Dagrofa A/S aliaset skal leve her.',
      '',
    ].join('\n')
    const generated = buildGeneratedNote({
      title: 'Ny tittel',
      frontmatter: {
        type: 'seksjon',
        status: 'generert',
        kilde: 'docs/source.md',
        siterbarhet: 'intern',
      },
      body: ['Ny maskintekst.'],
    })

    const merged = mergeGeneratedNote(generated, existing)

    assert.match(merged, /^---\ntype: seksjon\nstatus: generert\nkilde: docs\/source\.md\nsiterbarhet: intern/m)
    assert.ok(merged.includes('# Ny tittel'))
    assert.ok(
      merged.endsWith('## Notater\n\nMenneskelig tekst med æøå.\nDagrofa A/S aliaset skal leve her.\n'),
      'content below ## Notater must be preserved exactly',
    )
  })

  it('renders empty frontmatter fields without trailing whitespace', () => {
    const note = buildGeneratedNote({
      title: 'Tom tagg-test',
      frontmatter: {
        type: 'hub',
        status: 'generert',
        kilde: 'test',
        siterbarhet: 'intern',
        tags: '',
      },
      body: ['OK.'],
    })

    assert.ok(note.includes('tags: ""\n'))
    assert.deepEqual(
      note
        .split('\n')
        .filter((line) => /\s$/.test(line)),
      [],
    )
  })

  it('builds M2 draft sections with human approval gates and source-backed numbers', () => {
    const sections = buildM2DraftSections()

    const insightSections = sections.filter((section) =>
      section.relPath.startsWith('10 Innsiktskart/Innsikter/'),
    )
    const actorSections = sections.filter((section) => section.relPath.startsWith('11 Maktkart/Selskaper/'))

    assert.equal(new Set(insightSections.map((section) => section.relPath)).size, 6)
    assert.equal(insightSections.length, 12)
    assert.equal(insightSections.filter((section) => section.heading === '## Tallgrunnlag og forbehold').length, 6)
    assert.equal(
      insightSections.filter((section) => section.heading === '## M2 selvbærende utkast (krever godkjenning)').length,
      6,
    )
    assert.equal(actorSections.length, 31)
    assert.ok(sections.every((section) => section.body.some((line) => line.includes('Krever menneskelig godkjenning'))))

    const i27 = sections.find((section) => section.relPath.endsWith('I27 Styreoverlappet peker på smale broer.md'))
    assert.ok(i27)
    assert.ok(i27.body.join('\n').includes('555 styreverv'))
    assert.ok(i27.body.join('\n').includes('98 av 275 selskaper'))
    assert.ok(
      i27.body
        .join('\n')
        .includes('docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md'),
    )

    const i31 = sections.find((section) => section.relPath.endsWith('I31 Krysseie må leses som kontrollbaner.md'))
    assert.ok(i31)
    assert.ok(i31.body.join('\n').includes('183 av 275'))
    assert.ok(i31.body.join('\n').includes('19 tverrsektorielle kontrollører'))

    const i34 = sections.find((section) => section.relPath.endsWith('I34 Fem fokusområder gjør kartet handlingsrettet.md'))
    assert.ok(i34)
    assert.ok(i34.body.join('\n').includes('11/12'))

    const norgesgruppen = sections.find((section) => section.relPath.endsWith('NorgesGruppen ASA.md'))
    assert.ok(norgesgruppen)
    assert.ok(norgesgruppen.body.join('\n').includes('39 selskaper'))
    assert.ok(norgesgruppen.body.join('\n').includes('Posisjonstekst'))
  })

  it('creates stable note filenames for Nordic letters and slash aliases', () => {
    assert.equal(noteFileName('Dagrofa A/S'), 'Dagrofa A-S.md')
    assert.equal(noteFileName('Nærings- og fiskeridepartementet'), 'Nærings- og fiskeridepartementet.md')
  })

  it('validates frontmatter, wikilinks and canvas JSON', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-ok-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Hub.md'),
      buildGeneratedNote({
        title: 'Hub',
        frontmatter: {
          type: 'hub',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['Se [[Mål]].'],
      }),
    )
    writeFileSync(
      join(vault, '0 Kart', 'Mål.md'),
      buildGeneratedNote({
        title: 'Mål',
        frontmatter: {
          type: 'seksjon',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['OK.'],
      }),
    )
    writeFileSync(join(vault, '0 Kart', 'Kart.canvas'), '{"nodes":[],"edges":[]}\n')

    assert.deepEqual(validateVault(vault).issues, [])
  })

  it('fails validation for broken links, invalid canvas and missing required frontmatter', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-bad-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Hub.md'),
      ['---', 'type: hub', 'status: generert', '---', '', '# Hub', '', '[[Mangler]]', ''].join('\n'),
    )
    writeFileSync(join(vault, '0 Kart', 'Kart.canvas'), '{ikke json')

    const messages = validateVault(vault).issues.map((issue) => issue.message)

    assert.ok(messages.some((message) => message.includes('missing frontmatter field kilde')))
    assert.ok(messages.some((message) => message.includes('broken wikilink [[Mangler]]')))
    assert.ok(messages.some((message) => message.includes('invalid canvas JSON')))
  })

  it('fails validation for canvas file nodes that target missing vault files', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-canvas-targets-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Hub.md'),
      buildGeneratedNote({
        title: 'Hub',
        frontmatter: {
          type: 'hub',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['OK.'],
      }),
    )
    writeFileSync(
      join(vault, '0 Kart', 'Kart.canvas'),
      JSON.stringify(
        {
          nodes: [
            { id: 'existing', type: 'file', file: '0 Kart/Hub.md' },
            { id: 'missing', type: 'file', file: '10 Innsiktskart/Innsikter/I99 Mangler.md' },
          ],
          edges: [],
        },
        null,
        2,
      ),
    )

    const messages = validateVault(vault).issues.map((issue) => `${issue.file}: ${issue.message}`)

    assert.deepEqual(messages, [
      '0 Kart/Kart.canvas: canvas file node targets missing file 10 Innsiktskart/Innsikter/I99 Mangler.md',
    ])
  })

  it('fails validation for overlapping non-group canvas nodes', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-canvas-overlap-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Kart.canvas'),
      `${JSON.stringify({
        nodes: [
          { id: 'group', type: 'group', x: 0, y: 0, width: 400, height: 400 },
          { id: 'a', type: 'text', text: 'A', x: 10, y: 10, width: 100, height: 80 },
          { id: 'b', type: 'text', text: 'B', x: 90, y: 50, width: 100, height: 80 },
        ],
        edges: [],
      })}\n`,
    )

    const messages = validateVault(vault).issues.map((issue) => `${issue.file}: ${issue.message}`)

    assert.deepEqual(messages, ['0 Kart/Kart.canvas: canvas nodes overlap a and b (20x40)'])
  })

  it('fails validation for canvas edges that target missing node ids', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-canvas-edge-targets-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Kart.canvas'),
      `${JSON.stringify({
        nodes: [{ id: 'a', type: 'text', text: 'A', x: 0, y: 0, width: 100, height: 80 }],
        edges: [{ id: 'e-a-missing', fromNode: 'a', toNode: 'missing' }],
      })}\n`,
    )

    const messages = validateVault(vault).issues.map((issue) => `${issue.file}: ${issue.message}`)

    assert.deepEqual(messages, ['0 Kart/Kart.canvas: canvas edge e-a-missing targets missing node missing'])
  })

  it('fails validation for Dataview FROM paths that target missing vault folders', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-dataview-paths-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Hub.md'),
      buildGeneratedNote({
        title: 'Hub',
        frontmatter: {
          type: 'hub',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: [
          '```dataview',
          'TABLE status',
          'FROM "10 Innsiktskart/Innsikter"',
          '```',
        ],
      }),
    )

    const messages = validateVault(vault).issues.map((issue) => `${issue.file}: ${issue.message}`)

    assert.deepEqual(messages, [
      '0 Kart/Hub.md: Dataview FROM targets missing vault folder 10 Innsiktskart/Innsikter',
    ])
  })

  it('fails validation for malformed Dataview code fences', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-dataview-fence-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })
    mkdirSync(join(vault, '10 Innsiktskart', 'Innsikter'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Hub.md'),
      buildGeneratedNote({
        title: 'Hub',
        frontmatter: {
          type: 'hub',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['```dataview', 'TABLE status', 'FROM "10 Innsiktskart/Innsikter"'],
      }),
    )

    const messages = validateVault(vault).issues.map((issue) => `${issue.file}: ${issue.message}`)

    assert.deepEqual(messages, ['0 Kart/Hub.md: Dataview block is missing closing fence'])
  })

  it('fails validation for Dataview blocks without a query type', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-dataview-query-type-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })
    mkdirSync(join(vault, '10 Innsiktskart', 'Innsikter'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Hub.md'),
      buildGeneratedNote({
        title: 'Hub',
        frontmatter: {
          type: 'hub',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['```dataview', 'FROM "10 Innsiktskart/Innsikter"', '```'],
      }),
    )

    const messages = validateVault(vault).issues.map((issue) => `${issue.file}: ${issue.message}`)

    assert.deepEqual(messages, ['0 Kart/Hub.md: Dataview block is missing query type'])
  })

  it('validates repo and vault paths referenced in review documents', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-review-preflight-'))
    mkdirSync(join(repo, 'Food Systems Obsidian', '10 Innsiktskart'), { recursive: true })
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    mkdirSync(join(repo, 'data', 'vault-export'), { recursive: true })
    writeFileSync(join(repo, 'Food Systems Obsidian', '10 Innsiktskart', 'Innsiktskartet.md'), '# OK\n')
    writeFileSync(join(repo, 'data', 'vault-export', 'manifest.json'), '{}\n')
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'review.md'),
      [
        '| Note | Status |',
        '|---|---|',
        '| `10 Innsiktskart/Innsiktskartet.md` | eksisterer i vault |',
        '| `data/vault-export/manifest.json` | eksisterer i repo |',
        '| `11 Maktkart/Mangler.md` | mangler |',
        '',
      ].join('\n'),
    )

    const issues = validateReferencedPaths(repo, ['docs/project/plans/review.md']).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/review.md',
        message: 'missing referenced repo/vault path `11 Maktkart/Mangler.md`',
      },
    ])
  })

  it('validates machine-checkable VK-5 review samples against vault export data', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-samples-'))
    mkdirSync(join(repo, 'data', 'vault-export'), { recursive: true })
    mkdirSync(join(repo, 'docs', 'meetings'), { recursive: true })
    mkdirSync(join(repo, 'research', 'landbrukarena_transcripts'), { recursive: true })
    mkdirSync(join(repo, 'Food Systems Obsidian', '11 Maktkart', 'Selskaper'), { recursive: true })
    mkdirSync(join(repo, 'Food Systems Obsidian', '12 Kilder'), { recursive: true })

    const manifest = {
      generatedAt: '2026-07-02T00:00:00.000Z',
      source: 'scripts/obsidian-vault/export-db.ts',
      counts: {
        companies: 2,
        ownershipEdges: 1,
        boardMembers: 2,
        businessRelationships: 0,
        properties: 0,
      },
    }
    const companies = [
      {
        id: 'ng',
        name: 'NorgesGruppen ASA',
        orgNr: '819731322',
        legalForm: 'ASA',
        country: 'NO',
        valueChainStage: 'retail',
        classification: 'family',
        naceCode: '47.111',
        naceDescription: 'Butikkhandel',
        isResearchConstruct: false,
      },
      {
        id: 'asko',
        name: 'ASKO Norge AS',
        orgNr: '929228723',
        legalForm: 'AS',
        country: 'NO',
        valueChainStage: 'logistics',
        classification: 'family',
        naceCode: null,
        naceDescription: null,
        isResearchConstruct: false,
      },
    ]
    const ownershipEdges = [
      {
        id: 'edge-1',
        parentCompanyId: 'ng',
        parentName: 'NorgesGruppen ASA',
        childCompanyId: 'asko',
        childName: 'ASKO Norge AS',
        ownershipPct: 100,
        ownershipType: 'subsidiary',
        source: 'Brønnøysund',
      },
    ]
    const boardMembers = [
      {
        id: 'board-1',
        companyId: 'ng',
        personName: 'Johan Johannson',
        personKey: 'johan-johannson',
        role: 'styreleder',
        source: 'Brønnøysundregistrene roller i virksomheten',
        verificationStatus: null,
        companyName: 'NorgesGruppen ASA',
      },
      {
        id: 'board-2',
        companyId: 'asko',
        personName: 'Johan Johannson',
        personKey: 'johan-johannson',
        role: 'styremedlem',
        source: 'Brønnøysundregistrene roller i virksomheten',
        verificationStatus: null,
        companyName: 'ASKO Norge AS',
      },
    ]
    writeFileSync(join(repo, 'data', 'vault-export', 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
    writeFileSync(join(repo, 'data', 'vault-export', 'companies.json'), `${JSON.stringify(companies, null, 2)}\n`)
    writeFileSync(
      join(repo, 'data', 'vault-export', 'ownership-edges.json'),
      `${JSON.stringify(ownershipEdges, null, 2)}\n`,
    )
    writeFileSync(
      join(repo, 'data', 'vault-export', 'board-members.json'),
      `${JSON.stringify(boardMembers, null, 2)}\n`,
    )
    writeFileSync(join(repo, 'docs', 'meetings', 'review.md'), '# Review\n')
    writeFileSync(join(repo, 'research', 'landbrukarena_transcripts', 'sample.txt'), 'transcript\n')

    writeFileSync(
      join(repo, 'Food Systems Obsidian', '11 Maktkart', 'Selskaper', 'NorgesGruppen ASA.md'),
      buildGeneratedNote({
        title: 'NorgesGruppen ASA',
        frontmatter: {
          type: 'aktor',
          status: 'generert',
          kilde: 'data/vault-export/companies.json',
          siterbarhet: 'intern',
          orgnr: '819731322',
        },
        body: [
          '## Basisdata',
          '',
          '- Orgnr: 819731322',
          '- NACE: 47.111 — Butikkhandel',
          '',
          '## Eierskap',
          '',
          '- [[ASKO Norge AS]] — 100 % (subsidiary)',
          '',
          '## Styreverv',
          '',
          '- Johan Johannson — styreleder',
        ],
      }),
    )
    writeFileSync(
      join(repo, 'Food Systems Obsidian', '11 Maktkart', 'Eierskapsregisteret.md'),
      buildGeneratedNote({
        title: 'Eierskapsregisteret',
        frontmatter: {
          type: 'seksjon',
          status: 'generert',
          kilde: 'data/vault-export/ownership-edges.json',
          siterbarhet: 'intern',
        },
        body: [
          '## Omfang',
          '',
          '- Selskaper: 2',
          '- Eierskapskanter: 1',
          '',
          '## Kanter',
          '',
          '- [[NorgesGruppen ASA]] → [[ASKO Norge AS]] — 100 % (subsidiary) · kilde: Brønnøysund',
        ],
      }),
    )
    writeFileSync(
      join(repo, 'Food Systems Obsidian', '11 Maktkart', 'Selskapsregister.md'),
      buildGeneratedNote({
        title: 'Selskapsregister',
        frontmatter: {
          type: 'aktor',
          status: 'generert',
          kilde: 'data/vault-export/companies.json',
          siterbarhet: 'intern',
        },
        body: [
          '## Omfang',
          '',
          '- Selskaper: 2',
          '',
          '## Selskaper',
          '',
          '- [[NorgesGruppen ASA]] — retail · family · 819731322',
          '- [[ASKO Norge AS]] — logistics · family · 929228723',
        ],
      }),
    )
    writeFileSync(
      join(repo, 'Food Systems Obsidian', '11 Maktkart', 'Selskaper', 'Selskapsmappe-register.md'),
      buildGeneratedNote({
        title: 'Selskapsmappe-register',
        frontmatter: {
          type: 'aktor',
          status: 'generert',
          kilde: 'scripts/obsidian-vault/sync.ts',
          siterbarhet: 'intern',
        },
        body: ['## Omfang', '', '- Noder: 2', '', '## Noder', '', '- [[NorgesGruppen ASA]]', '- [[ASKO Norge AS]]'],
      }),
    )
    writeFileSync(
      join(repo, 'Food Systems Obsidian', '11 Maktkart', 'Personregister.md'),
      buildGeneratedNote({
        title: 'Personregister',
        frontmatter: {
          type: 'person',
          status: 'generert',
          kilde: 'data/vault-export/board-members.json',
          siterbarhet: 'intern',
        },
        body: [
          '## Interlockere',
          '',
          '- [[Johan Johannson]] — 2 verv',
          '',
          '⚠️ _Bruksregel (fra AP-1): «makt» betyr strukturell posisjon i styregrafen, ikke intensjon, samordning eller ulovlighet. Personnavn er offentlige rolledata, men aktørspesifikke formuleringer går gjennom claim-lock/PCQ før ekstern bruk._',
        ],
      }),
    )
    writeFileSync(
      join(repo, 'Food Systems Obsidian', '12 Kilder', 'Møte- og transkriptregister.md'),
      buildGeneratedNote({
        title: 'Møte- og transkriptregister',
        frontmatter: {
          type: 'mote',
          status: 'generert',
          kilde: 'docs/meetings; research/landbrukarena_transcripts',
          siterbarhet: 'intern',
        },
        body: [
          '> Metadata-register for møter og transkripter. Fulltekst holdes i originalfilene.',
          '',
          '## Omfang',
          '',
          '- Møter: 1',
          '- Transkripter: 1',
          '',
          '## Møter',
          '',
          '- [[review]] — `docs/meetings/review.md`',
          '',
          '## Transkripter',
          '',
          '- [[sample]] — `research/landbrukarena_transcripts/sample.txt`',
        ],
      }),
    )

    assert.deepEqual(validateReviewSamples(repo).issues, [])
  })

  it('reports VK-5 sample drift when a sampled export edge is missing from the vault note', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-sample-drift-'))
    mkdirSync(join(repo, 'data', 'vault-export'), { recursive: true })
    mkdirSync(join(repo, 'Food Systems Obsidian', '11 Maktkart', 'Selskaper'), { recursive: true })
    writeFileSync(
      join(repo, 'data', 'vault-export', 'manifest.json'),
      `${JSON.stringify({
        counts: { companies: 1, ownershipEdges: 1, boardMembers: 0, businessRelationships: 0, properties: 0 },
      })}\n`,
    )
    writeFileSync(
      join(repo, 'data', 'vault-export', 'companies.json'),
      `${JSON.stringify([{ id: 'ng', name: 'NorgesGruppen ASA', orgNr: '819731322' }])}\n`,
    )
    writeFileSync(
      join(repo, 'data', 'vault-export', 'ownership-edges.json'),
      `${JSON.stringify([
        {
          parentCompanyId: 'ng',
          parentName: 'NorgesGruppen ASA',
          childCompanyId: 'asko',
          childName: 'ASKO Norge AS',
          ownershipPct: 100,
          ownershipType: 'subsidiary',
          source: 'Brønnøysund',
        },
      ])}\n`,
    )
    writeFileSync(join(repo, 'data', 'vault-export', 'board-members.json'), '[]\n')
    writeFileSync(join(repo, 'Food Systems Obsidian', '11 Maktkart', 'Selskaper', 'NorgesGruppen ASA.md'), '# NorgesGruppen ASA\n')

    const messages = validateReviewSamples(repo).issues.map((issue) => `${issue.file}: ${issue.message}`)

    assert.ok(
      messages.includes(
        'Food Systems Obsidian/11 Maktkart/Selskaper/NorgesGruppen ASA.md: missing sampled ownership child ASKO Norge AS from data/vault-export/ownership-edges.json',
      ),
    )
  })

  it('validates masterplan frontmatter related file targets', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-masterplan-related-files-'))
    writeSupportFiles(repo, ['scripts/obsidian-vault/sync.ts'])
    writeV3MasterplanFixture(repo, {
      relatedFiles: ['scripts/obsidian-vault/sync.ts', 'docs/project/analysis/mangler.md'],
    })

    const issues = validateMasterplanFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        message: 'missing masterplan related file: docs/project/analysis/mangler.md',
      },
    ])
  })

  it('requires the masterplan to keep every required related file entry', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-masterplan-required-related-files-'))
    const relatedFiles = REQUIRED_V3_MASTERPLAN_RELATED_FILES.filter((file) => file !== 'scripts/obsidian-vault/sync.ts')
    writeSupportFiles(repo, relatedFiles)
    writeV3MasterplanFixture(repo, { relatedFiles })

    const issues = validateMasterplanFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        message: 'missing required masterplan related file entry: scripts/obsidian-vault/sync.ts',
      },
    ])
  })

  it('keeps the masterplan internal-use and claim-lock rule from being weakened', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-masterplan-usage-rule-'))
    writeSupportFiles(repo, REQUIRED_V3_MASTERPLAN_RELATED_FILES)
    writeV3MasterplanFixture(repo, { bruksregel: 'Ekstern bruk er ok.' })

    const issues = validateMasterplanFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        message:
          'invalid masterplan frontmatter bruksregel: Internt arbeidskart. Ekstern bruk av tall/claims krever claim-lock/siterbarhets-gate (.claude/source-attribution-policy.md).',
      },
    ])
  })

  it('requires the masterplan claim-lock policy target to exist', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-masterplan-policy-target-'))
    writeSupportFiles(repo, REQUIRED_V3_MASTERPLAN_RELATED_FILES)
    writeV3MasterplanFixture(repo)

    const issues = validateMasterplanFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        message: 'missing masterplan claim-lock policy target: .claude/source-attribution-policy.md',
      },
    ])
  })

  it('requires the masterplan to keep every VK work package and invariant section', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-masterplan-required-sections-'))
    writeSupportFiles(repo, REQUIRED_V3_MASTERPLAN_RELATED_FILES)
    writeV3MasterplanFixture(repo, { omitSection: '### M3 — Visningsflaten (CODEX + menneskelig QA)' })

    const issues = validateMasterplanFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        message: 'missing masterplan section: ### M3 — Visningsflaten (CODEX + menneskelig QA)',
      },
    ])
  })

  it('requires the masterplan to keep protected acceptance and invariant text', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-masterplan-required-contract-text-'))
    const omittedText = '5. Ingen nye claims eksternt uten claim-lock/siterbarhets-gate — kartets lesbarhet endrer ikke publiserbarhet.'
    writeSupportFiles(repo, REQUIRED_V3_MASTERPLAN_RELATED_FILES)
    writeV3MasterplanFixture(repo, { omitContractText: omittedText })

    const issues = validateMasterplanFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        message: `missing masterplan contract text: ${omittedText}`,
      },
    ])
  })

  it('validates VK-5 status and completion audit frontmatter links as one review package', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-package-links-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans', 'archive'), { recursive: true })
    writeFileSync(join(repo, 'docs', 'project', 'plans', 'archive', 'obsidian-kunnskapskart-masterplan-2026-07-02.md'), '')
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'archive', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      '',
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-status-2026-07-02.md'),
      [
        '---',
        'status: klar-for-menneskelig-review',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        '---',
        '# Status',
        '',
        '- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.',
        '- Notetall kilde: `npm run vault:sync` og `npm run vault:check`.',
        '- DB-univers kilde: `data/vault-export/manifest.json`.',
      ].join('\n'),
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      [
        '---',
        'status: repo-lokalt-klart-ikke-mal-complete',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'statusnotat: docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '# Audit',
        '',
        '- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.',
        '- Notetall kilde: `npm run vault:sync` og `npm run vault:check`.',
        '- DB-univers kilde: `data/vault-export/manifest.json`.',
      ].join('\n'),
    )

    const issues = validateReviewPackageFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        message:
          'missing review package frontmatter vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
      },
    ])
  })

  it('requires VK-5 review package frontmatter links to resolve to existing plan files', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-package-frontmatter-targets-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans', 'archive'), { recursive: true })
    writeFileSync(join(repo, 'docs', 'project', 'plans', 'archive', 'obsidian-kunnskapskart-masterplan-2026-07-02.md'), '')
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'archive', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      '',
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-status-2026-07-02.md'),
      [
        '---',
        'status: klar-for-menneskelig-review',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '# Status',
        '',
        '- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.',
        '- Notetall kilde: `npm run vault:sync` og `npm run vault:check`.',
        '- DB-univers kilde: `data/vault-export/manifest.json`.',
      ].join('\n'),
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      [
        '---',
        'status: repo-lokalt-klart-ikke-mal-complete',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'statusnotat: docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '# Audit',
        '',
        '- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.',
        '- Notetall kilde: `npm run vault:sync` og `npm run vault:check`.',
        '- DB-univers kilde: `data/vault-export/manifest.json`.',
      ].join('\n'),
    )

    const issues = validateReviewPackageFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        message:
          'missing review package frontmatter target plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
      },
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        message:
          'missing review package frontmatter target vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
      },
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        message:
          'missing review package frontmatter target plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
      },
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        message:
          'missing review package frontmatter target vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
      },
    ])
  })

  it('keeps VK-5 status and completion audit frontmatter statuses from overclaiming completion', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-package-status-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans', 'archive'), { recursive: true })
    writeFileSync(join(repo, 'docs', 'project', 'plans', 'archive', 'obsidian-kunnskapskart-masterplan-2026-07-02.md'), '')
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'archive', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      '',
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-status-2026-07-02.md'),
      [
        '---',
        'status: klar-for-menneskelig-review',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '# Status',
        '',
        '- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.',
        '- Notetall kilde: `npm run vault:sync` og `npm run vault:check`.',
        '- DB-univers kilde: `data/vault-export/manifest.json`.',
      ].join('\n'),
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      [
        '---',
        'status: fullfort',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'statusnotat: docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '# Audit',
        '',
        '- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.',
        '- Notetall kilde: `npm run vault:sync` og `npm run vault:check`.',
        '- DB-univers kilde: `data/vault-export/manifest.json`.',
      ].join('\n'),
    )

    const issues = validateReviewPackageFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        message: 'invalid review package frontmatter status: fullfort',
      },
    ])
  })

  it('keeps the long VK-5 review requirement checklist canonical to the protocol', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-package-deduped-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans', 'archive'), { recursive: true })
    writeFileSync(join(repo, 'docs', 'project', 'plans', 'archive', 'obsidian-kunnskapskart-masterplan-2026-07-02.md'), '')
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'archive', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      '',
    )
    writeV3MasterplanFixture(repo)
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      '',
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-status-2026-07-02.md'),
      [
        '---',
        'status: klar-for-menneskelig-review',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '# Status',
        '',
        '- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.',
        '- Notetall kilde: `npm run vault:sync` og `npm run vault:check`.',
        '- DB-univers kilde: `data/vault-export/manifest.json`.',
        'Dette gjentar masterplanens obligatoriske frontmatter og komplett VK-5-reviewradsett.',
        '',
      ].join('\n'),
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      [
        '---',
        'status: repo-lokalt-klart-ikke-mal-complete',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'statusnotat: docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '# Audit',
        '',
        '- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.',
        '- Notetall kilde: `npm run vault:sync` og `npm run vault:check`.',
        '- DB-univers kilde: `data/vault-export/manifest.json`.',
      ].join('\n'),
    )

    const issues = validateReviewPackageFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        message:
          'move duplicated VK-5 review requirement checklist text to docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
      },
    ])
  })

  it('requires archived V2 plan and completion audit plus canonical count-source pointers', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-process-archive-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeV3MasterplanFixture(repo)
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      '',
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-status-2026-07-02.md'),
      [
        '---',
        'status: klar-for-menneskelig-review',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '# Status',
        '',
        '- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.',
        '- DB-univers kilde: `data/vault-export/manifest.json`.',
        '',
      ].join('\n'),
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      [
        '---',
        'status: repo-lokalt-klart-ikke-mal-complete',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'statusnotat: docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '# Audit',
        '',
        '- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.',
        '- Notetall kilde: `npm run vault:sync` og `npm run vault:check`.',
        '- DB-univers kilde: `data/vault-export/manifest.json`.',
        '',
      ].join('\n'),
    )

    const issues = validateReviewPackageFrontmatterLinks(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        message: 'missing canonical note-count source pointer',
      },
      {
        file: 'docs/project/plans/archive/obsidian-kunnskapskart-masterplan-2026-07-02.md',
        message: 'missing archived V2 masterplan',
      },
      {
        file: 'docs/project/plans/archive/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        message: 'missing archived V2 completion audit',
      },
    ])
  })

  it('validates I27+ candidate approval gate completeness and decision status values', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-i27-approval-gate-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      [
        '| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |',
        '|---|---|---|---|---|',
        '| I27 | Kandidat | `docs/source.md` | Test | til godkjenning |',
        '| I28 | Kandidat | `docs/source.md` | Test | godkjenn |',
        '| I29 | Kandidat | `docs/source.md` | Test | kanskje |',
        '',
      ].join('\n'),
    )

    const issues = validateInsightCandidateApprovalGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'invalid I27+ candidate status for I29: kanskje',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate approval row I30',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate approval row I31',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate approval row I32',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate approval row I33',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate approval row I34',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate approval row I35',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate approval row I36',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate approval row I37',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate approval row I38',
      },
    ])
  })

  it('requires every I27+ candidate approval row to keep source basis', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-i27-approval-source-gate-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      [
        '| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |',
        '|---|---|---|---|---|',
        '| I27 | Kandidat |  | Test | til godkjenning |',
        ...Array.from(
          { length: 11 },
          (_, index) => `| I${index + 28} | Kandidat | \`docs/source.md\` | Test | til godkjenning |`,
        ),
        '',
      ].join('\n'),
    )

    const issues = validateInsightCandidateApprovalGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate source basis for I27',
      },
    ])
  })

  it('requires every I27+ candidate approval row to keep a source path reference', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-i27-approval-source-path-gate-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      [
        '| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |',
        '|---|---|---|---|---|',
        '| I27 | Kandidat | source packet | Test | til godkjenning |',
        ...Array.from(
          { length: 11 },
          (_, index) => `| I${index + 28} | Kandidat | \`docs/source.md\` | Test | til godkjenning |`,
        ),
        '',
      ].join('\n'),
    )

    const issues = validateInsightCandidateApprovalGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate source path for I27',
      },
    ])
  })

  it('accepts content paths as I27+ candidate source path references', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-i27-approval-content-source-gate-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeV3MasterplanFixture(repo)
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      '',
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      [
        '---',
        'status: krever menneskelig godkjenning for generering',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |',
        '|---|---|---|---|---|',
        ...Array.from(
          { length: 12 },
          (_, index) =>
            `| I${index + 27} | Kandidat | \`content/hvitbok/03-fokusomraader.md\` | Test | til godkjenning |`,
        ),
        '',
        '## Ikke generer ennå',
        '',
        '- Ingen I27+-noter skal opprettes før denne listen er godkjent.',
        '- Kandidater som inneholder tall, aktørnavn eller årsaksspråk skal gjennom claim-lock før ekstern bruk.',
        '- Etter godkjenning skal hver ny innsiktsnote ha minst én kildenote-lenke og eksplisitt `siterbarhet`.',
        '',
      ].join('\n'),
    )

    const issues = validateInsightCandidateApprovalGate(repo).issues

    assert.deepEqual(issues, [])
  })

  it('requires I27+ candidate approval frontmatter to link back to the masterplan and VK-5 protocol', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-i27-approval-frontmatter-links-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      [
        '---',
        'status: krever menneskelig godkjenning for generering',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        '---',
        '| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |',
        '|---|---|---|---|---|',
        ...Array.from(
          { length: 12 },
          (_, index) => `| I${index + 27} | Kandidat | \`docs/source.md\` | Test | til godkjenning |`,
        ),
        '',
      ].join('\n'),
    )

    const issues = validateInsightCandidateApprovalGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message:
          'missing I27+ candidate approval frontmatter vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
      },
    ])
  })

  it('requires I27+ candidate approval frontmatter links to resolve to existing plan files', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-i27-approval-frontmatter-targets-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      [
        '---',
        'status: krever menneskelig godkjenning for generering',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |',
        '|---|---|---|---|---|',
        ...Array.from(
          { length: 12 },
          (_, index) => `| I${index + 27} | Kandidat | \`docs/source.md\` | Test | til godkjenning |`,
        ),
        '',
        '## Ikke generer ennå',
        '',
        '- Ingen I27+-noter skal opprettes før denne listen er godkjent.',
        '- Kandidater som inneholder tall, aktørnavn eller årsaksspråk skal gjennom claim-lock før ekstern bruk.',
        '- Etter godkjenning skal hver ny innsiktsnote ha minst én kildenote-lenke og eksplisitt `siterbarhet`.',
        '',
      ].join('\n'),
    )

    const issues = validateInsightCandidateApprovalGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message:
          'missing I27+ candidate approval frontmatter target plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message:
          'missing I27+ candidate approval frontmatter target vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
      },
    ])
  })

  it('keeps I27+ candidate approval frontmatter status from overclaiming generation approval', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-i27-approval-frontmatter-status-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      [
        '---',
        'status: generering godkjent',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |',
        '|---|---|---|---|---|',
        ...Array.from(
          { length: 12 },
          (_, index) => `| I${index + 27} | Kandidat | \`docs/source.md\` | Test | til godkjenning |`,
        ),
        '',
      ].join('\n'),
    )

    const issues = validateInsightCandidateApprovalGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'invalid I27+ candidate approval frontmatter status: generering godkjent',
      },
    ])
  })

  it('requires the I27+ candidate approval gate to keep its no-generation stop section', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-i27-approval-stop-section-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      [
        '---',
        'status: krever menneskelig godkjenning for generering',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        '---',
        '| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |',
        '|---|---|---|---|---|',
        ...Array.from(
          { length: 12 },
          (_, index) => `| I${index + 27} | Kandidat | \`docs/source.md\` | Test | til godkjenning |`,
        ),
        '',
        '## Ikke generer ennå',
        '',
        '- Ingen I27+-noter skal opprettes før denne listen er godkjent.',
        '- Etter godkjenning skal hver ny innsiktsnote ha minst én kildenote-lenke og eksplisitt `siterbarhet`.',
        '',
      ].join('\n'),
    )

    const issues = validateInsightCandidateApprovalGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message:
          'missing I27+ candidate approval stop text: Kandidater som inneholder tall, aktørnavn eller årsaksspråk skal gjennom claim-lock før ekstern bruk.',
      },
    ])
  })

  it('requires every I27+ candidate approval row to keep title and rationale', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-i27-approval-content-gate-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      [
        '| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |',
        '|---|---|---|---|---|',
        '| I27 |  | `docs/source.md` | Test | til godkjenning |',
        '| I28 | Kandidat | `docs/source.md` |  | til godkjenning |',
        ...Array.from(
          { length: 10 },
          (_, index) => `| I${index + 29} | Kandidat | \`docs/source.md\` | Test | til godkjenning |`,
        ),
        '',
      ].join('\n'),
    )

    const issues = validateInsightCandidateApprovalGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate title for I27',
      },
      {
        file: 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
        message: 'missing I27+ candidate rationale for I28',
      },
    ])
  })

  it('validates VK-5 review protocol status values before it can be used as gate evidence', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-gate-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        '## 2. Graf-visning i Obsidian',
        '## 3. Canvas-kvalitet',
        '## 4. Dataview og dynamiske MOC-er',
        '## 5. I27+ kandidatport',
        '| Gate | Kommando eller handling | Forventet resultat | Status | Notat |',
        '|---|---|---|---|---|',
        '| Repo-integritet | `npm run vault:sync && npm run vault:check` | ok | ikke sjekket i review | |',
        '| Review-preflight | `npm run vault:review-preflight` | ok | halvveis | |',
        '',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        '| I27 | ikke besluttet | |',
        '| I28 | godkjenn | |',
        '| I29 | kanskje | |',
        ...Array.from({ length: 9 }, (_, index) => `| I${index + 30} | ikke besluttet | |`),
        '## 6. Siterbarhetsstikkprover',
        '## 7. Beslutninger for app/whitepaper',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'invalid VK-5 review status for Review-preflight: halvveis',
      },
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'invalid I27+ review decision for I29: kanskje',
      },
    ])
  })

  it('validates the VK-5 review protocol frontmatter status vocabulary', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-frontmatter-status-'))
    const completeRequiredRows = [
      'Repo-integritet',
      'Review-preflight',
      'Diff-forstaelse',
      'Obsidian apner vault',
      'Plugins',
      '`11 Maktkart/Selskaper/NorgesGruppen ASA.md`',
      '`11 Maktkart/Eierskapsregisteret.md`',
      '`11 Maktkart/Personregister.md`',
      '`11 Maktkart/Selskapsregister.md`',
      '`11 Maktkart/Selskaper/Selskapsmappe-register.md`',
      '`12 Kilder/Møte- og transkriptregister.md`',
      'Standardgraf',
      'Farger',
      'Hull',
      'Stoy',
      'Maktlag',
      '`0 Kart/Kunnskapskart.canvas`',
      '`0 Kart/Verdikjedekart.canvas`',
      '`0 Kart/Maktkart.canvas`',
      '`0 Kart/Temakart/Sirkularitet.canvas`',
      '`0 Kart/Temakart/Norden.canvas`',
      '`0 Kart/Konsern/NorgesGruppen ASA.canvas`',
      '`0 Kart/Konsern/Coop Norge SA.canvas`',
      '`0 Kart/Konsern/Orkla ASA.canvas`',
      '`0 Kart/Konsern/Mowi ASA.canvas`',
      '`0 Kart/Konsern/Kesko Oyj.canvas`',
      '`0 Kart/HUB – Kunnskapsdatabasen.md`',
      '`10 Innsiktskart/Innsiktskartet.md`',
      '`11 Maktkart/Maktkartet.md`',
      'Klyngenoter `1` til `8`',
      '`10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md`',
      '`10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md`',
      '`10 Innsiktskart/Gaps/Gap-register.md`',
      '`12 Kilder/Kilde – narrativ-struktur.md`',
      '`11 Maktkart/Personregister.md`',
      'Vault-graf til `/graf`',
      'Temacanvas Sirkularitet som figur',
      'Temacanvas Norden som figur',
      'Konsern-canvas som intern analysefigur',
      'Gap-register som research-backlog',
      'Styredata-dekning for 13 konserntrær',
      'Brreg-refresh for aldri-refreshede konsern',
      'M&A-events for NG-treet',
      'Stakeholder-utfylling fra skeletons',
      'Norske sirkularitets-gaps',
    ]
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: nesten-ferdig',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        'Beslutning etter diff-gjennomgang:',
        '- [ ] Godkjent',
        '- [ ] Godkjent med endringer',
        '- [ ] Parkert - krever ny sync/datarevisjon',
        '## 2. Graf-visning i Obsidian',
        'Beslutning etter graf-review:',
        '- [ ] Godkjent',
        '- [ ] Juster colorGroups/filtre',
        '- [ ] Parkert - krever ny grafstrategi',
        '## 3. Canvas-kvalitet',
        'Beslutning etter canvas-review:',
        '- [ ] Godkjent',
        '- [ ] Godkjent med liste over konkrete canvas-endringer',
        '- [ ] Parkert - krever layoutpass',
        '## 4. Dataview og dynamiske MOC-er',
        'Beslutning etter Dataview-review:',
        '- [ ] Godkjent',
        '- [ ] Juster Dataview-sporringer',
        '- [ ] Parkert - plugin/oppsett mangler',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        'Beslutning etter I27+-review:',
        '- [ ] Kandidatlisten er godkjent/redigert og kan genereres',
        '- [ ] Kandidatlisten er parkert; ingen I27+-noter genereres',
        '## 6. Siterbarhetsstikkprover',
        'Beslutning etter siterbarhetsreview:',
        '- [ ] Godkjent for intern bruk',
        '- [ ] Krever claim-lock for valgte noter',
        '- [ ] Parkert for ny kilde-/siterbarhetsrunde',
        '## 7. Beslutninger for app/whitepaper',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        'VK-5 kan bare lukkes nar:',
        '1. Alle seksjonene over har beslutning.',
        '2. Eventuelle endringer fra reviewen er gjort i repo/vault.',
        '3. `npm run vault:sync && npm run vault:check` er gronn etter endringene.',
        '4. Denne protokollen oppdateres med endelig status.',
        '',
        '| Rad | Status | Notat |',
        '|---|---|---|',
        ...completeRequiredRows.map((row) => `| ${row} | ikke sjekket | |`),
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'invalid VK-5 review protocol frontmatter status: nesten-ferdig',
      },
    ])
  })

  it('requires the VK-5 review protocol frontmatter to keep the completion audit link', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-frontmatter-links-'))
    const completeRequiredRows = [
      'Repo-integritet',
      'Review-preflight',
      'Diff-forstaelse',
      'Obsidian apner vault',
      'Plugins',
      '`11 Maktkart/Selskaper/NorgesGruppen ASA.md`',
      '`11 Maktkart/Eierskapsregisteret.md`',
      '`11 Maktkart/Personregister.md`',
      '`11 Maktkart/Selskapsregister.md`',
      '`11 Maktkart/Selskaper/Selskapsmappe-register.md`',
      '`12 Kilder/Møte- og transkriptregister.md`',
      'Standardgraf',
      'Farger',
      'Hull',
      'Stoy',
      'Maktlag',
      '`0 Kart/Kunnskapskart.canvas`',
      '`0 Kart/Verdikjedekart.canvas`',
      '`0 Kart/Maktkart.canvas`',
      '`0 Kart/Temakart/Sirkularitet.canvas`',
      '`0 Kart/Temakart/Norden.canvas`',
      '`0 Kart/Konsern/NorgesGruppen ASA.canvas`',
      '`0 Kart/Konsern/Coop Norge SA.canvas`',
      '`0 Kart/Konsern/Orkla ASA.canvas`',
      '`0 Kart/Konsern/Mowi ASA.canvas`',
      '`0 Kart/Konsern/Kesko Oyj.canvas`',
      '`0 Kart/HUB – Kunnskapsdatabasen.md`',
      '`10 Innsiktskart/Innsiktskartet.md`',
      '`11 Maktkart/Maktkartet.md`',
      'Klyngenoter `1` til `8`',
      '`10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md`',
      '`10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md`',
      '`10 Innsiktskart/Gaps/Gap-register.md`',
      '`12 Kilder/Kilde – narrativ-struktur.md`',
      '`11 Maktkart/Personregister.md`',
      'Vault-graf til `/graf`',
      'Temacanvas Sirkularitet som figur',
      'Temacanvas Norden som figur',
      'Konsern-canvas som intern analysefigur',
      'Gap-register som research-backlog',
      'Styredata-dekning for 13 konserntrær',
      'Brreg-refresh for aldri-refreshede konsern',
      'M&A-events for NG-treet',
      'Stakeholder-utfylling fra skeletons',
      'Norske sirkularitets-gaps',
    ]
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        'Beslutning etter diff-gjennomgang:',
        '- [ ] Godkjent',
        '- [ ] Godkjent med endringer',
        '- [ ] Parkert - krever ny sync/datarevisjon',
        '## 2. Graf-visning i Obsidian',
        'Beslutning etter graf-review:',
        '- [ ] Godkjent',
        '- [ ] Juster colorGroups/filtre',
        '- [ ] Parkert - krever ny grafstrategi',
        '## 3. Canvas-kvalitet',
        'Beslutning etter canvas-review:',
        '- [ ] Godkjent',
        '- [ ] Godkjent med liste over konkrete canvas-endringer',
        '- [ ] Parkert - krever layoutpass',
        '## 4. Dataview og dynamiske MOC-er',
        'Beslutning etter Dataview-review:',
        '- [ ] Godkjent',
        '- [ ] Juster Dataview-sporringer',
        '- [ ] Parkert - plugin/oppsett mangler',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        'Beslutning etter I27+-review:',
        '- [ ] Kandidatlisten er godkjent/redigert og kan genereres',
        '- [ ] Kandidatlisten er parkert; ingen I27+-noter genereres',
        '## 6. Siterbarhetsstikkprover',
        'Beslutning etter siterbarhetsreview:',
        '- [ ] Godkjent for intern bruk',
        '- [ ] Krever claim-lock for valgte noter',
        '- [ ] Parkert for ny kilde-/siterbarhetsrunde',
        '## 7. Beslutninger for app/whitepaper',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        'VK-5 kan bare lukkes nar:',
        '1. Alle seksjonene over har beslutning.',
        '2. Eventuelle endringer fra reviewen er gjort i repo/vault.',
        '3. `npm run vault:sync && npm run vault:check` er gronn etter endringene.',
        '4. Denne protokollen oppdateres med endelig status.',
        '',
        '| Rad | Status | Notat |',
        '|---|---|---|',
        ...completeRequiredRows.map((row) => `| ${row} | ikke sjekket | |`),
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message:
          'missing VK-5 review protocol frontmatter completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
      },
    ])
  })

  it('requires the VK-5 review protocol frontmatter links to resolve to existing plan files', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-frontmatter-targets-'))
    const completeRequiredRows = [
      'Repo-integritet',
      'Review-preflight',
      'Diff-forstaelse',
      'Obsidian apner vault',
      'Plugins',
      '`11 Maktkart/Selskaper/NorgesGruppen ASA.md`',
      '`11 Maktkart/Eierskapsregisteret.md`',
      '`11 Maktkart/Personregister.md`',
      '`11 Maktkart/Selskapsregister.md`',
      '`11 Maktkart/Selskaper/Selskapsmappe-register.md`',
      '`12 Kilder/Møte- og transkriptregister.md`',
      'Standardgraf',
      'Farger',
      'Hull',
      'Stoy',
      'Maktlag',
      '`0 Kart/Kunnskapskart.canvas`',
      '`0 Kart/Verdikjedekart.canvas`',
      '`0 Kart/Maktkart.canvas`',
      '`0 Kart/Temakart/Sirkularitet.canvas`',
      '`0 Kart/Temakart/Norden.canvas`',
      '`0 Kart/Konsern/NorgesGruppen ASA.canvas`',
      '`0 Kart/Konsern/Coop Norge SA.canvas`',
      '`0 Kart/Konsern/Orkla ASA.canvas`',
      '`0 Kart/Konsern/Mowi ASA.canvas`',
      '`0 Kart/Konsern/Kesko Oyj.canvas`',
      '`0 Kart/HUB – Kunnskapsdatabasen.md`',
      '`10 Innsiktskart/Innsiktskartet.md`',
      '`11 Maktkart/Maktkartet.md`',
      'Klyngenoter `1` til `8`',
      '`10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md`',
      '`10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md`',
      '`10 Innsiktskart/Gaps/Gap-register.md`',
      '`12 Kilder/Kilde – narrativ-struktur.md`',
      '`11 Maktkart/Personregister.md`',
      'Vault-graf til `/graf`',
      'Temacanvas Sirkularitet som figur',
      'Temacanvas Norden som figur',
      'Konsern-canvas som intern analysefigur',
      'Gap-register som research-backlog',
      'Styredata-dekning for 13 konserntrær',
      'Brreg-refresh for aldri-refreshede konsern',
      'M&A-events for NG-treet',
      'Stakeholder-utfylling fra skeletons',
      'Norske sirkularitets-gaps',
    ]
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        'plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
        'completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        'Beslutning etter diff-gjennomgang:',
        '- [ ] Godkjent',
        '- [ ] Godkjent med endringer',
        '- [ ] Parkert - krever ny sync/datarevisjon',
        '## 2. Graf-visning i Obsidian',
        'Beslutning etter graf-review:',
        '- [ ] Godkjent',
        '- [ ] Juster colorGroups/filtre',
        '- [ ] Parkert - krever ny grafstrategi',
        '## 3. Canvas-kvalitet',
        'Beslutning etter canvas-review:',
        '- [ ] Godkjent',
        '- [ ] Godkjent med liste over konkrete canvas-endringer',
        '- [ ] Parkert - krever layoutpass',
        '## 4. Dataview og dynamiske MOC-er',
        'Beslutning etter Dataview-review:',
        '- [ ] Godkjent',
        '- [ ] Juster Dataview-sporringer',
        '- [ ] Parkert - plugin/oppsett mangler',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        'Beslutning etter I27+-review:',
        '- [ ] Kandidatlisten er godkjent/redigert og kan genereres',
        '- [ ] Kandidatlisten er parkert; ingen I27+-noter genereres',
        '## 6. Siterbarhetsstikkprover',
        'Beslutning etter siterbarhetsreview:',
        '- [ ] Godkjent for intern bruk',
        '- [ ] Krever claim-lock for valgte noter',
        '- [ ] Parkert for ny kilde-/siterbarhetsrunde',
        '## 7. Beslutninger for app/whitepaper',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        'VK-5 kan bare lukkes nar:',
        '1. Alle seksjonene over har beslutning.',
        '2. Eventuelle endringer fra reviewen er gjort i repo/vault.',
        '3. `npm run vault:sync && npm run vault:check` er gronn etter endringene.',
        '4. Denne protokollen oppdateres med endelig status.',
        '',
        '| Rad | Status | Notat |',
        '|---|---|---|',
        ...completeRequiredRows.map((row) => `| ${row} | ikke sjekket | |`),
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message:
          'missing VK-5 review protocol frontmatter target plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md',
      },
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message:
          'missing VK-5 review protocol frontmatter target completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
      },
    ])
  })

  it('requires the VK-5 review protocol to keep a complete I27-I38 decision table', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-completeness-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        '## 2. Graf-visning i Obsidian',
        '## 3. Canvas-kvalitet',
        '## 4. Dataview og dynamiske MOC-er',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 11 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        '## 6. Siterbarhetsstikkprover',
        '## 7. Beslutninger for app/whitepaper',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'missing VK-5 I27+ review row I38',
      },
    ])
  })

  it('validates non-I27 VK-5 review protocol decision values before review closeout', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-decisions-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        '## 2. Graf-visning i Obsidian',
        '## 3. Canvas-kvalitet',
        '## 4. Dataview og dynamiske MOC-er',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        '## 6. Siterbarhetsstikkprover',
        '## 7. Beslutninger for app/whitepaper',
        '| Visning | Beslutning | Begrunnelse |',
        '|---|---|---|',
        '| Vault-graf til `/graf` | kanskje | |',
        '## 8. Neste datainnsamlingsrunde',
        '| Kandidat | Beslutning | Begrunnelse |',
        '|---|---|---|',
        '| Styredata-dekning for 13 konserntrær | ikke besluttet | |',
        '## Sluttstatus for VK-5',
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'invalid VK-5 review decision for Vault-graf til `/graf`: kanskje',
      },
    ])
  })

  it('blocks VK-5 review protocol closeout while review rows are unresolved', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-closeout-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: fullfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        '| Gate | Status | Notat |',
        '|---|---|---|',
        '| Repo-integritet | ikke sjekket i review | |',
        '## 2. Graf-visning i Obsidian',
        '## 3. Canvas-kvalitet',
        '## 4. Dataview og dynamiske MOC-er',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        '| I27 | ikke besluttet | |',
        ...Array.from({ length: 11 }, (_, index) => `| I${index + 28} | parkert | |`),
        '## 6. Siterbarhetsstikkprover',
        '## 7. Beslutninger for app/whitepaper',
        '| Visning | Beslutning | Begrunnelse |',
        '|---|---|---|',
        '| Vault-graf til `/graf` | ikke besluttet | |',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message:
          'VK-5 review protocol cannot be marked fullfort with unresolved review status for Repo-integritet: ikke sjekket i review',
      },
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message:
          'VK-5 review protocol cannot be marked fullfort with unresolved review decision for I27: ikke besluttet',
      },
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message:
          'VK-5 review protocol cannot be marked fullfort with unresolved review decision for Vault-graf til `/graf`: ikke besluttet',
      },
    ])
  })

  it('keeps VK-5 closeout blocked until the review protocol is explicitly closed', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-closeout-open-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeV3MasterplanFixture(repo)
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      '# Audit\n',
    )
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      readFileSync(
        join(process.cwd(), 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
        'utf8',
      ),
    )

    const issues = validateReviewCloseout(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message:
          'VK-5 review closeout requires protocol frontmatter status fullfort/fullført/ferdig/lukket after human Obsidian review',
      },
    ])
  })

  it('allows VK-5 closeout only after protocol status and review rows are resolved', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-closeout-closed-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeV3MasterplanFixture(repo)
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-completion-audit-2026-07-02.md'),
      '# Audit\n',
    )
    const closedProtocol = readFileSync(
      join(process.cwd(), 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      'utf8',
    )
      .replace('status: klar-for-gjennomgang-ikke-utfort', 'status: fullfort')
      .replaceAll('ikke sjekket i review', 'godkjent')
      .replaceAll('ikke sjekket', 'godkjent')
      .replaceAll('ikke besluttet', 'parkert')
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      closedProtocol,
    )

    assert.deepEqual(validateReviewCloseout(repo).issues, [])
  })

  it('requires the VK-5 review protocol to keep every masterplan review section', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-sections-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        '## 2. Graf-visning i Obsidian',
        '## 3. Canvas-kvalitet',
        '## 4. Dataview og dynamiske MOC-er',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        '## 7. Beslutninger for app/whitepaper',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'missing VK-5 review protocol section ## 6. Siterbarhetsstikkprover',
      },
    ])
  })

  it('requires the VK-5 review protocol to keep every masterplan review checklist row', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-rows-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        '| Gate | Status | Notat |',
        '|---|---|---|',
        '| Repo-integritet | ikke sjekket i review | |',
        '| Review-preflight | ikke sjekket i review | |',
        '| Diff-forstaelse | ikke sjekket i review | |',
        '| Obsidian apner vault | ikke sjekket i review | |',
        '| Plugins | ikke sjekket i review | |',
        '',
        '| Stikkprove | Status | Notat |',
        '|---|---|---|',
        '| `11 Maktkart/Selskaper/NorgesGruppen ASA.md` | ikke sjekket | |',
        '| `11 Maktkart/Eierskapsregisteret.md` | ikke sjekket | |',
        '| `11 Maktkart/Personregister.md` | ikke sjekket | |',
        '| `11 Maktkart/Selskapsregister.md` | ikke sjekket | |',
        '| `11 Maktkart/Selskaper/Selskapsmappe-register.md` | ikke sjekket | |',
        '| `12 Kilder/Møte- og transkriptregister.md` | ikke sjekket | |',
        '## 2. Graf-visning i Obsidian',
        '| Sjekk | Status | Notat |',
        '|---|---|---|',
        '| Standardgraf | ikke sjekket | |',
        '| Farger | ikke sjekket | |',
        '| Hull | ikke sjekket | |',
        '| Stoy | ikke sjekket | |',
        '## 3. Canvas-kvalitet',
        '| Canvas | Status | Notat |',
        '|---|---|---|',
        '| `0 Kart/Kunnskapskart.canvas` | ikke sjekket | |',
        '| `0 Kart/Verdikjedekart.canvas` | ikke sjekket | |',
        '| `0 Kart/Maktkart.canvas` | ikke sjekket | |',
        '| `0 Kart/Temakart/Sirkularitet.canvas` | ikke sjekket | |',
        '| `0 Kart/Temakart/Norden.canvas` | ikke sjekket | |',
        '| `0 Kart/Konsern/NorgesGruppen ASA.canvas` | ikke sjekket | |',
        '| `0 Kart/Konsern/Coop Norge SA.canvas` | ikke sjekket | |',
        '| `0 Kart/Konsern/Orkla ASA.canvas` | ikke sjekket | |',
        '| `0 Kart/Konsern/Mowi ASA.canvas` | ikke sjekket | |',
        '| `0 Kart/Konsern/Kesko Oyj.canvas` | ikke sjekket | |',
        '## 4. Dataview og dynamiske MOC-er',
        '| Note | Status | Notat |',
        '|---|---|---|',
        '| `0 Kart/HUB – Kunnskapsdatabasen.md` | ikke sjekket | |',
        '| `10 Innsiktskart/Innsiktskartet.md` | ikke sjekket | |',
        '| `11 Maktkart/Maktkartet.md` | ikke sjekket | |',
        '| Klyngenoter `1` til `8` | ikke sjekket | |',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        '## 6. Siterbarhetsstikkprover',
        '| Stikkprove | Status | Notat |',
        '|---|---|---|',
        '| `10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md` | ikke sjekket | |',
        '| `10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md` | ikke sjekket | |',
        '| `10 Innsiktskart/Gaps/Gap-register.md` | ikke sjekket | |',
        '| `12 Kilder/Kilde – narrativ-struktur.md` | ikke sjekket | |',
        '| `11 Maktkart/Personregister.md` | ikke sjekket | |',
        '## 7. Beslutninger for app/whitepaper',
        '| Visning | Beslutning | Begrunnelse |',
        '|---|---|---|',
        '| Vault-graf til `/graf` | ikke besluttet | |',
        '| Temacanvas Sirkularitet som figur | ikke besluttet | |',
        '| Temacanvas Norden som figur | ikke besluttet | |',
        '| Konsern-canvas som intern analysefigur | ikke besluttet | |',
        '| Gap-register som research-backlog | ikke besluttet | |',
        '## 8. Neste datainnsamlingsrunde',
        '| Kandidat | Beslutning | Begrunnelse |',
        '|---|---|---|',
        '| Styredata-dekning for 13 konserntrær | ikke besluttet | |',
        '| Brreg-refresh for aldri-refreshede konsern | ikke besluttet | |',
        '| M&A-events for NG-treet | ikke besluttet | |',
        '| Stakeholder-utfylling fra skeletons | ikke besluttet | |',
        '| Norske sirkularitets-gaps | ikke besluttet | |',
        '## Sluttstatus for VK-5',
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'missing VK-5 review protocol row Maktlag',
      },
    ])
  })

  it('requires repeated VK-5 review protocol rows to keep every required occurrence', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-row-counts-'))
    const requiredRowsWithOnlyOnePersonRegister = [
      'Repo-integritet',
      'Review-preflight',
      'Diff-forstaelse',
      'Obsidian apner vault',
      'Plugins',
      '`11 Maktkart/Selskaper/NorgesGruppen ASA.md`',
      '`11 Maktkart/Eierskapsregisteret.md`',
      '`11 Maktkart/Personregister.md`',
      '`11 Maktkart/Selskapsregister.md`',
      '`11 Maktkart/Selskaper/Selskapsmappe-register.md`',
      '`12 Kilder/Møte- og transkriptregister.md`',
      'Standardgraf',
      'Farger',
      'Hull',
      'Stoy',
      'Maktlag',
      '`0 Kart/Kunnskapskart.canvas`',
      '`0 Kart/Verdikjedekart.canvas`',
      '`0 Kart/Maktkart.canvas`',
      '`0 Kart/Temakart/Sirkularitet.canvas`',
      '`0 Kart/Temakart/Norden.canvas`',
      '`0 Kart/Konsern/NorgesGruppen ASA.canvas`',
      '`0 Kart/Konsern/Coop Norge SA.canvas`',
      '`0 Kart/Konsern/Orkla ASA.canvas`',
      '`0 Kart/Konsern/Mowi ASA.canvas`',
      '`0 Kart/Konsern/Kesko Oyj.canvas`',
      '`0 Kart/HUB – Kunnskapsdatabasen.md`',
      '`10 Innsiktskart/Innsiktskartet.md`',
      '`11 Maktkart/Maktkartet.md`',
      'Klyngenoter `1` til `8`',
      '`10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md`',
      '`10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md`',
      '`10 Innsiktskart/Gaps/Gap-register.md`',
      '`12 Kilder/Kilde – narrativ-struktur.md`',
      'Vault-graf til `/graf`',
      'Temacanvas Sirkularitet som figur',
      'Temacanvas Norden som figur',
      'Konsern-canvas som intern analysefigur',
      'Gap-register som research-backlog',
      'Styredata-dekning for 13 konserntrær',
      'Brreg-refresh for aldri-refreshede konsern',
      'M&A-events for NG-treet',
      'Stakeholder-utfylling fra skeletons',
      'Norske sirkularitets-gaps',
    ]
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        '## 2. Graf-visning i Obsidian',
        '## 3. Canvas-kvalitet',
        '## 4. Dataview og dynamiske MOC-er',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        '## 6. Siterbarhetsstikkprover',
        '## 7. Beslutninger for app/whitepaper',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        '',
        '| Rad | Status | Notat |',
        '|---|---|---|',
        ...requiredRowsWithOnlyOnePersonRegister.map((row) => `| ${row} | ikke sjekket | |`),
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'missing VK-5 review protocol row `11 Maktkart/Personregister.md` occurrence 2',
      },
    ])
  })

  it('requires the VK-5 review protocol to keep every review decision block', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-decision-blocks-'))
    const completeRequiredRows = [
      'Repo-integritet',
      'Review-preflight',
      'Diff-forstaelse',
      'Obsidian apner vault',
      'Plugins',
      '`11 Maktkart/Selskaper/NorgesGruppen ASA.md`',
      '`11 Maktkart/Eierskapsregisteret.md`',
      '`11 Maktkart/Personregister.md`',
      '`11 Maktkart/Selskapsregister.md`',
      '`11 Maktkart/Selskaper/Selskapsmappe-register.md`',
      '`12 Kilder/Møte- og transkriptregister.md`',
      'Standardgraf',
      'Farger',
      'Hull',
      'Stoy',
      'Maktlag',
      '`0 Kart/Kunnskapskart.canvas`',
      '`0 Kart/Verdikjedekart.canvas`',
      '`0 Kart/Maktkart.canvas`',
      '`0 Kart/Temakart/Sirkularitet.canvas`',
      '`0 Kart/Temakart/Norden.canvas`',
      '`0 Kart/Konsern/NorgesGruppen ASA.canvas`',
      '`0 Kart/Konsern/Coop Norge SA.canvas`',
      '`0 Kart/Konsern/Orkla ASA.canvas`',
      '`0 Kart/Konsern/Mowi ASA.canvas`',
      '`0 Kart/Konsern/Kesko Oyj.canvas`',
      '`0 Kart/HUB – Kunnskapsdatabasen.md`',
      '`10 Innsiktskart/Innsiktskartet.md`',
      '`11 Maktkart/Maktkartet.md`',
      'Klyngenoter `1` til `8`',
      '`10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md`',
      '`10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md`',
      '`10 Innsiktskart/Gaps/Gap-register.md`',
      '`12 Kilder/Kilde – narrativ-struktur.md`',
      '`11 Maktkart/Personregister.md`',
      'Vault-graf til `/graf`',
      'Temacanvas Sirkularitet som figur',
      'Temacanvas Norden som figur',
      'Konsern-canvas som intern analysefigur',
      'Gap-register som research-backlog',
      'Styredata-dekning for 13 konserntrær',
      'Brreg-refresh for aldri-refreshede konsern',
      'M&A-events for NG-treet',
      'Stakeholder-utfylling fra skeletons',
      'Norske sirkularitets-gaps',
    ]
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        'Beslutning etter diff-gjennomgang:',
        '## 2. Graf-visning i Obsidian',
        '## 3. Canvas-kvalitet',
        'Beslutning etter canvas-review:',
        '## 4. Dataview og dynamiske MOC-er',
        'Beslutning etter Dataview-review:',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        'Beslutning etter I27+-review:',
        '## 6. Siterbarhetsstikkprover',
        'Beslutning etter siterbarhetsreview:',
        '## 7. Beslutninger for app/whitepaper',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        '',
        '| Rad | Status | Notat |',
        '|---|---|---|',
        ...completeRequiredRows.map((row) => `| ${row} | ikke sjekket | |`),
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'missing VK-5 review decision block Beslutning etter graf-review:',
      },
    ])
  })

  it('requires the VK-5 review protocol to keep every review decision checkbox option', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-decision-options-'))
    const completeRequiredRows = [
      'Repo-integritet',
      'Review-preflight',
      'Diff-forstaelse',
      'Obsidian apner vault',
      'Plugins',
      '`11 Maktkart/Selskaper/NorgesGruppen ASA.md`',
      '`11 Maktkart/Eierskapsregisteret.md`',
      '`11 Maktkart/Personregister.md`',
      '`11 Maktkart/Selskapsregister.md`',
      '`11 Maktkart/Selskaper/Selskapsmappe-register.md`',
      '`12 Kilder/Møte- og transkriptregister.md`',
      'Standardgraf',
      'Farger',
      'Hull',
      'Stoy',
      'Maktlag',
      '`0 Kart/Kunnskapskart.canvas`',
      '`0 Kart/Verdikjedekart.canvas`',
      '`0 Kart/Maktkart.canvas`',
      '`0 Kart/Temakart/Sirkularitet.canvas`',
      '`0 Kart/Temakart/Norden.canvas`',
      '`0 Kart/Konsern/NorgesGruppen ASA.canvas`',
      '`0 Kart/Konsern/Coop Norge SA.canvas`',
      '`0 Kart/Konsern/Orkla ASA.canvas`',
      '`0 Kart/Konsern/Mowi ASA.canvas`',
      '`0 Kart/Konsern/Kesko Oyj.canvas`',
      '`0 Kart/HUB – Kunnskapsdatabasen.md`',
      '`10 Innsiktskart/Innsiktskartet.md`',
      '`11 Maktkart/Maktkartet.md`',
      'Klyngenoter `1` til `8`',
      '`10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md`',
      '`10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md`',
      '`10 Innsiktskart/Gaps/Gap-register.md`',
      '`12 Kilder/Kilde – narrativ-struktur.md`',
      '`11 Maktkart/Personregister.md`',
      'Vault-graf til `/graf`',
      'Temacanvas Sirkularitet som figur',
      'Temacanvas Norden som figur',
      'Konsern-canvas som intern analysefigur',
      'Gap-register som research-backlog',
      'Styredata-dekning for 13 konserntrær',
      'Brreg-refresh for aldri-refreshede konsern',
      'M&A-events for NG-treet',
      'Stakeholder-utfylling fra skeletons',
      'Norske sirkularitets-gaps',
    ]
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        'Beslutning etter diff-gjennomgang:',
        '- [ ] Godkjent',
        '- [ ] Godkjent med endringer',
        '- [ ] Parkert - krever ny sync/datarevisjon',
        '## 2. Graf-visning i Obsidian',
        'Beslutning etter graf-review:',
        '- [ ] Godkjent',
        '- [ ] Parkert - krever ny grafstrategi',
        '## 3. Canvas-kvalitet',
        'Beslutning etter canvas-review:',
        '- [ ] Godkjent',
        '- [ ] Godkjent med liste over konkrete canvas-endringer',
        '- [ ] Parkert - krever layoutpass',
        '## 4. Dataview og dynamiske MOC-er',
        'Beslutning etter Dataview-review:',
        '- [ ] Godkjent',
        '- [ ] Juster Dataview-sporringer',
        '- [ ] Parkert - plugin/oppsett mangler',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        'Beslutning etter I27+-review:',
        '- [ ] Kandidatlisten er godkjent/redigert og kan genereres',
        '- [ ] Kandidatlisten er parkert; ingen I27+-noter genereres',
        '## 6. Siterbarhetsstikkprover',
        'Beslutning etter siterbarhetsreview:',
        '- [ ] Godkjent for intern bruk',
        '- [ ] Krever claim-lock for valgte noter',
        '- [ ] Parkert for ny kilde-/siterbarhetsrunde',
        '## 7. Beslutninger for app/whitepaper',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        '',
        '| Rad | Status | Notat |',
        '|---|---|---|',
        ...completeRequiredRows.map((row) => `| ${row} | ikke sjekket | |`),
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'missing VK-5 review decision option Juster colorGroups/filtre',
      },
    ])
  })

  it('requires the VK-5 review protocol to keep every closeout checklist item', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-closeout-items-'))
    const completeRequiredRows = [
      'Repo-integritet',
      'Review-preflight',
      'Diff-forstaelse',
      'Obsidian apner vault',
      'Plugins',
      '`11 Maktkart/Selskaper/NorgesGruppen ASA.md`',
      '`11 Maktkart/Eierskapsregisteret.md`',
      '`11 Maktkart/Personregister.md`',
      '`11 Maktkart/Selskapsregister.md`',
      '`11 Maktkart/Selskaper/Selskapsmappe-register.md`',
      '`12 Kilder/Møte- og transkriptregister.md`',
      'Standardgraf',
      'Farger',
      'Hull',
      'Stoy',
      'Maktlag',
      '`0 Kart/Kunnskapskart.canvas`',
      '`0 Kart/Verdikjedekart.canvas`',
      '`0 Kart/Maktkart.canvas`',
      '`0 Kart/Temakart/Sirkularitet.canvas`',
      '`0 Kart/Temakart/Norden.canvas`',
      '`0 Kart/Konsern/NorgesGruppen ASA.canvas`',
      '`0 Kart/Konsern/Coop Norge SA.canvas`',
      '`0 Kart/Konsern/Orkla ASA.canvas`',
      '`0 Kart/Konsern/Mowi ASA.canvas`',
      '`0 Kart/Konsern/Kesko Oyj.canvas`',
      '`0 Kart/HUB – Kunnskapsdatabasen.md`',
      '`10 Innsiktskart/Innsiktskartet.md`',
      '`11 Maktkart/Maktkartet.md`',
      'Klyngenoter `1` til `8`',
      '`10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md`',
      '`10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md`',
      '`10 Innsiktskart/Gaps/Gap-register.md`',
      '`12 Kilder/Kilde – narrativ-struktur.md`',
      '`11 Maktkart/Personregister.md`',
      'Vault-graf til `/graf`',
      'Temacanvas Sirkularitet som figur',
      'Temacanvas Norden som figur',
      'Konsern-canvas som intern analysefigur',
      'Gap-register som research-backlog',
      'Styredata-dekning for 13 konserntrær',
      'Brreg-refresh for aldri-refreshede konsern',
      'M&A-events for NG-treet',
      'Stakeholder-utfylling fra skeletons',
      'Norske sirkularitets-gaps',
    ]
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        'Beslutning etter diff-gjennomgang:',
        '- [ ] Godkjent',
        '- [ ] Godkjent med endringer',
        '- [ ] Parkert - krever ny sync/datarevisjon',
        '## 2. Graf-visning i Obsidian',
        'Beslutning etter graf-review:',
        '- [ ] Godkjent',
        '- [ ] Juster colorGroups/filtre',
        '- [ ] Parkert - krever ny grafstrategi',
        '## 3. Canvas-kvalitet',
        'Beslutning etter canvas-review:',
        '- [ ] Godkjent',
        '- [ ] Godkjent med liste over konkrete canvas-endringer',
        '- [ ] Parkert - krever layoutpass',
        '## 4. Dataview og dynamiske MOC-er',
        'Beslutning etter Dataview-review:',
        '- [ ] Godkjent',
        '- [ ] Juster Dataview-sporringer',
        '- [ ] Parkert - plugin/oppsett mangler',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        'Beslutning etter I27+-review:',
        '- [ ] Kandidatlisten er godkjent/redigert og kan genereres',
        '- [ ] Kandidatlisten er parkert; ingen I27+-noter genereres',
        '## 6. Siterbarhetsstikkprover',
        'Beslutning etter siterbarhetsreview:',
        '- [ ] Godkjent for intern bruk',
        '- [ ] Krever claim-lock for valgte noter',
        '- [ ] Parkert for ny kilde-/siterbarhetsrunde',
        '## 7. Beslutninger for app/whitepaper',
        '## 8. Neste datainnsamlingsrunde',
        '## Sluttstatus for VK-5',
        'VK-5 kan bare lukkes nar:',
        '1. Alle seksjonene over har beslutning.',
        '2. Eventuelle endringer fra reviewen er gjort i repo/vault.',
        '3. Denne protokollen oppdateres med endelig status.',
        '',
        '| Rad | Status | Notat |',
        '|---|---|---|',
        ...completeRequiredRows.map((row) => `| ${row} | ikke sjekket | |`),
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message:
          'missing VK-5 review closeout item `npm run vault:sync && npm run vault:check` er gronn etter endringene.',
      },
    ])
  })

  it('requires the VK-5 review protocol to include the next data-collection prioritization gate', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vk5-review-protocol-next-data-'))
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'),
      [
        '---',
        'status: klar-for-gjennomgang-ikke-utfort',
        '---',
        '## 1. Diff-gjennomgang og kilde-JSON',
        '## 2. Graf-visning i Obsidian',
        '## 3. Canvas-kvalitet',
        '## 4. Dataview og dynamiske MOC-er',
        '## 5. I27+ kandidatport',
        '| ID | Beslutning | Redigert claim eller notat |',
        '|---|---|---|',
        ...Array.from({ length: 12 }, (_, index) => `| I${index + 27} | ikke besluttet | |`),
        '## 6. Siterbarhetsstikkprover',
        '## 7. Beslutninger for app/whitepaper',
        '## Sluttstatus for VK-5',
        '',
      ].join('\n'),
    )

    const issues = validateReviewProtocolDecisionGate(repo).issues

    assert.deepEqual(issues, [
      {
        file: 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        message: 'missing VK-5 review protocol section ## 8. Neste datainnsamlingsrunde',
      },
    ])
  })

  it('can require notes to have inbound links unless explicitly allowed as roots', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-orphans-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Hub.md'),
      buildGeneratedNote({
        title: 'Hub',
        frontmatter: {
          type: 'hub',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['Se [[Lenket]].'],
      }),
    )
    writeFileSync(
      join(vault, '0 Kart', 'Lenket.md'),
      buildGeneratedNote({
        title: 'Lenket',
        frontmatter: {
          type: 'seksjon',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['OK.'],
      }),
    )
    writeFileSync(
      join(vault, '0 Kart', 'Foreldrelos.md'),
      buildGeneratedNote({
        title: 'Foreldrelos',
        frontmatter: {
          type: 'seksjon',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['Ingen peker hit.'],
      }),
    )

    const messages = validateVault(vault, {
      requireNoOrphans: true,
      allowedOrphanPaths: ['0 Kart/Hub.md'],
    }).issues.map((issue) => `${issue.file}: ${issue.message}`)

    assert.ok(messages.some((message) => message.includes('0 Kart/Foreldrelos.md: orphan note has no inbound links')))
    assert.ok(!messages.some((message) => message.includes('0 Kart/Hub.md')))
    assert.ok(!messages.some((message) => message.includes('0 Kart/Lenket.md')))
  })

  it('rejects slash-derived nested notes in managed flat folders', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-path-links-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })
    mkdirSync(join(vault, '10 Innsiktskart', 'Looper', 'Loop – Fiskeavfall til fiskemel'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Hub.md'),
      buildGeneratedNote({
        title: 'Hub',
        frontmatter: {
          type: 'hub',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['Se [[10 Innsiktskart/Looper/Loop – Fiskeavfall til fiskemel/olje (Norge)|fiskeavfall]].'],
      }),
    )
    writeFileSync(
      join(vault, '10 Innsiktskart', 'Looper', 'Loop – Fiskeavfall til fiskemel', 'olje (Norge).md'),
      buildGeneratedNote({
        title: 'Loop – Fiskeavfall til fiskemel/olje (Norge)',
        frontmatter: {
          type: 'loop',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['OK.'],
      }),
    )

    const messages = validateVault(vault, {
      requireNoOrphans: true,
      allowedOrphanPaths: ['0 Kart/Hub.md'],
    }).issues.map((issue) => `${issue.file}: ${issue.message}`)

    assert.deepEqual(messages, [
      '10 Innsiktskart/Looper/Loop – Fiskeavfall til fiskemel/olje (Norge).md: managed folder 10 Innsiktskart/Looper must stay flat',
    ])
  })

  it('builds register artifacts with explicit wikilinks to indexed notes', () => {
    const result = buildRegisterArtifact({
      title: 'Loop-register',
      path: '10 Innsiktskart/Looper/Loop-register.md',
      source: 'scripts/obsidian-vault/sync.ts',
      type: 'loop',
      intro: 'Register over loop-noder.',
      items: [
        { title: 'Loop – Biogass (Sverige)', detail: 'Sverige' },
        {
          title: 'Loop – Dagrofa A/S',
          target: '10 Innsiktskart/Looper/Loop – Dagrofa A/S',
          detail: 'slash-path',
        },
      ],
      links: ['Innsiktskartet'],
    })

    assert.equal(result.path, '10 Innsiktskart/Looper/Loop-register.md')
    assert.match(result.content, /type: loop/)
    assert.ok(result.content.includes('[[Loop – Biogass (Sverige)]] — Sverige'))
    assert.ok(result.content.includes('[[10 Innsiktskart/Looper/Loop – Dagrofa A/S|Loop – Dagrofa A/S]] — slash-path'))
    assert.ok(result.content.includes('[[Innsiktskartet]]'))
  })

  it('requires insight notes to link at least one source note', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-insight-source-'))
    mkdirSync(join(vault, '10 Innsiktskart', 'Innsikter'), { recursive: true })
    writeFileSync(
      join(vault, '10 Innsiktskart', 'Innsikter', 'I27 Test.md'),
      buildGeneratedNote({
        title: 'I27 Test',
        frontmatter: {
          type: 'innsikt',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['Claim uten kildenote.'],
      }),
    )

    const messages = validateVault(vault).issues.map((issue) => issue.message)

    assert.ok(messages.some((message) => message.includes('insight note must link at least one source note')))
  })

  it('requires approved M2 insight notes to be self-contained with key evidence', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-m2-self-contained-'))
    mkdirSync(join(vault, '10 Innsiktskart', 'Innsikter'), { recursive: true })
    mkdirSync(join(vault, '12 Kilder'), { recursive: true })
    writeFileSync(
      join(vault, '12 Kilder', 'Kilde – AP-1 styreoverlapp.md'),
      buildGeneratedNote({
        title: 'Kilde – AP-1 styreoverlapp',
        frontmatter: {
          type: 'kilde',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['OK.'],
      }),
    )
    writeFileSync(
      join(vault, '10 Innsiktskart', 'Innsikter', 'I27 Styreoverlappet peker på smale broer.md'),
      buildGeneratedNote({
        title: 'I27 Styreoverlappet peker på smale broer',
        frontmatter: {
          type: 'innsikt',
          status: 'utkast',
          kilde: 'docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md',
          siterbarhet: 'intern',
        },
        body: [
          'Styreoverlappet peker på smale broer.',
          '',
          '## Kilde',
          '',
          '- [[Kilde – AP-1 styreoverlapp]]',
        ],
      }),
    )

    const messages = validateVault(vault).issues.map((issue) => `${issue.file}: ${issue.message}`)

    assert.deepEqual(messages, [
      '10 Innsiktskart/Innsikter/I27 Styreoverlappet peker på smale broer.md: M2 insight note must include ## Tallgrunnlag og forbehold',
      '10 Innsiktskart/Innsikter/I27 Styreoverlappet peker på smale broer.md: M2 insight note is missing required evidence text: 555 styreverv',
      '10 Innsiktskart/Innsikter/I27 Styreoverlappet peker på smale broer.md: M2 insight note is missing required evidence text: 32 interlockere',
      '10 Innsiktskart/Innsikter/I27 Styreoverlappet peker på smale broer.md: M2 insight note is missing required evidence text: 11 tverrsektorielle broer',
      '10 Innsiktskart/Innsikter/I27 Styreoverlappet peker på smale broer.md: M2 insight note is missing required evidence text: 98 av 275',
    ])
  })

  it('can require pending I27+ candidates to stay out of the vault', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vault-i27-gate-'))
    const vault = join(repo, 'Food Systems Obsidian')
    mkdirSync(join(vault, '10 Innsiktskart', 'Innsikter'), { recursive: true })
    mkdirSync(join(vault, '12 Kilder'), { recursive: true })
    mkdirSync(join(repo, 'docs', 'project', 'plans'), { recursive: true })
    writeFileSync(
      join(repo, 'docs', 'project', 'plans', 'obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      [
        '| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |',
        '|---|---|---|---|---|',
        '| I27 | Kandidat | `docs/source.md` | Skal ikke genereres ennå. | til godkjenning |',
        '',
      ].join('\n'),
    )
    writeFileSync(
      join(vault, '12 Kilder', 'Kilde.md'),
      buildGeneratedNote({
        title: 'Kilde',
        frontmatter: {
          type: 'kilde',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['OK.'],
      }),
    )
    writeFileSync(
      join(vault, '10 Innsiktskart', 'Innsikter', 'I27 Kandidat.md'),
      buildGeneratedNote({
        title: 'I27 Kandidat',
        frontmatter: {
          type: 'innsikt',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['Se [[Kilde]].'],
      }),
    )

    const messages = validateVault(vault, { requireInsightCandidateGate: true }).issues.map(
      (issue) => `${issue.file}: ${issue.message}`,
    )

    assert.deepEqual(messages, [
      '10 Innsiktskart/Innsikter/I27 Kandidat.md: pending insight candidate I27 must not be generated before approval',
    ])
  })

  it('can require presentation assets for the complete vault', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-presentation-assets-'))
    mkdirSync(join(vault, '0 Kart'), { recursive: true })

    const messages = validateVault(vault, { requirePresentationAssets: true }).issues.map(
      (issue) => issue.message,
    )

    assert.ok(messages.some((message) => message.includes('missing presentation asset 0 Kart/Oppsett.md')))
    assert.ok(
      messages.some((message) =>
        message.includes('missing presentation asset .obsidian/snippets/kunnskapskart.css'),
      ),
    )
  })

  it('requires the Obsidian setup note to keep every required plugin recommendation', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-plugin-setup-'))
    mkdirSync(join(vault, '0 Kart', 'Temakart'), { recursive: true })
    mkdirSync(join(vault, '.obsidian', 'snippets'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Oppsett.md'),
      [
        '# Oppsett',
        '',
        '## Plugin-oppsett',
        '',
        '- Dataview — MOC-tabeller.',
        '- Juggl eller 3D Graph — presentasjonsgraf.',
        '- Minimal Theme Settings — roligere canvas-visning.',
        '',
      ].join('\n'),
    )
    writeFileSync(join(vault, '.obsidian', 'graph.json'), JSON.stringify({ colorGroups: [] }))
    writeFileSync(join(vault, '.obsidian', 'snippets', 'kunnskapskart.css'), '/* ok */\n')
    writeFileSync(join(vault, '0 Kart', 'Temakart', 'Sirkularitet.canvas'), '{"nodes":[],"edges":[]}\n')
    writeFileSync(join(vault, '0 Kart', 'Temakart', 'Norden.canvas'), '{"nodes":[],"edges":[]}\n')

    const messages = validateVault(vault, { requirePresentationAssets: true }).issues.map(
      (issue) => `${issue.file}: ${issue.message}`,
    )

    assert.ok(messages.includes('0 Kart/Oppsett.md: missing required Obsidian plugin recommendation Breadcrumbs'))
  })

  it('requires the Obsidian setup note to keep the M3 presentation and export runbook', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-m3-runbook-'))
    mkdirSync(join(vault, '0 Kart', 'Temakart'), { recursive: true })
    mkdirSync(join(vault, '.obsidian', 'snippets'), { recursive: true })
    writeFileSync(
      join(vault, '0 Kart', 'Oppsett.md'),
      [
        '# Oppsett',
        '',
        '## Plugin-oppsett',
        '',
        '- Dataview — MOC-tabeller.',
        '- Breadcrumbs — hierarki.',
        '- Juggl eller 3D Graph — presentasjonsgraf.',
        '- Minimal Theme Settings — roligere canvas-visning.',
        '',
      ].join('\n'),
    )
    writeFileSync(join(vault, '.obsidian', 'graph.json'), JSON.stringify({ colorGroups: [] }))
    writeFileSync(join(vault, '.obsidian', 'snippets', 'kunnskapskart.css'), '/* ok */\n')
    writeFileSync(join(vault, '0 Kart', 'Temakart', 'Sirkularitet.canvas'), '{"nodes":[],"edges":[]}\n')
    writeFileSync(join(vault, '0 Kart', 'Temakart', 'Norden.canvas'), '{"nodes":[],"edges":[]}\n')

    const messages = validateVault(vault, { requirePresentationAssets: true }).issues.map(
      (issue) => `${issue.file}: ${issue.message}`,
    )

    assert.ok(messages.includes('0 Kart/Oppsett.md: missing M3 setup text ## Presentasjonsvisninger'))
    assert.ok(messages.includes('0 Kart/Oppsett.md: missing M3 setup text Beviskjeden'))
    assert.ok(messages.includes('0 Kart/Oppsett.md: missing M3 setup text Styrenettverket (kjerne)'))
    assert.ok(messages.includes('0 Kart/Oppsett.md: missing M3 setup text ## Eksport til leveranser'))
    assert.ok(
      messages.includes(
        '0 Kart/Oppsett.md: missing M3 setup text docs/miro-kart-kunnskapsgrunnlag-blueprint.md',
      ),
    )
    assert.ok(messages.includes('0 Kart/Oppsett.md: missing M3 setup text ## Visnings-QA'))
    assert.ok(messages.includes('0 Kart/Oppsett.md: missing M3 setup text Kunnskapskart.canvas'))
    assert.ok(messages.includes('0 Kart/Oppsett.md: missing M3 setup text Verdikjedekart.canvas'))
    assert.ok(messages.includes('0 Kart/Oppsett.md: missing M3 setup text Maktkart.canvas'))
    assert.ok(messages.includes('0 Kart/Oppsett.md: missing M3 setup text NorgesGruppen ASA.canvas'))
  })

  it('validates the Obsidian CSS snippet syntax when presentation assets are required', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-presentation-css-'))
    mkdirSync(join(vault, '0 Kart', 'Temakart'), { recursive: true })
    mkdirSync(join(vault, '.obsidian', 'snippets'), { recursive: true })
    writeFileSync(join(vault, '0 Kart', 'Oppsett.md'), 'ok\n')
    writeFileSync(join(vault, '.obsidian', 'graph.json'), JSON.stringify({ colorGroups: [] }))
    writeFileSync(join(vault, '.obsidian', 'snippets', 'kunnskapskart.css'), '.tag[href="#gap"] {\n  color: #c2410c;\n')
    writeFileSync(join(vault, '0 Kart', 'Temakart', 'Sirkularitet.canvas'), '{"nodes":[],"edges":[]}\n')
    writeFileSync(join(vault, '0 Kart', 'Temakart', 'Norden.canvas'), '{"nodes":[],"edges":[]}\n')

    const messages = validateVault(vault, { requirePresentationAssets: true }).issues.map(
      (issue) => `${issue.file}: ${issue.message}`,
    )

    assert.ok(
      messages.some((message) =>
        message.includes('.obsidian/snippets/kunnskapskart.css: invalid CSS snippet'),
      ),
    )
  })

  it('can require path-based graph color groups for visible vault layers', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-graph-colors-'))
    mkdirSync(join(vault, '0 Kart', 'Temakart'), { recursive: true })
    mkdirSync(join(vault, '.obsidian', 'snippets'), { recursive: true })
    writeFileSync(join(vault, '0 Kart', 'Oppsett.md'), 'ok\n')
    writeFileSync(join(vault, '.obsidian', 'snippets', 'kunnskapskart.css'), '/* ok */\n')
    writeFileSync(join(vault, '0 Kart', 'Temakart', 'Sirkularitet.canvas'), '{"nodes":[],"edges":[]}\n')
    writeFileSync(join(vault, '0 Kart', 'Temakart', 'Norden.canvas'), '{"nodes":[],"edges":[]}\n')
    writeFileSync(
      join(vault, '.obsidian', 'graph.json'),
      JSON.stringify({
        colorGroups: [
          { query: 'tag:#person', color: { a: 1, rgb: 1 } },
          { query: 'path:"10 Innsiktskart/Aktører"', color: { a: 1, rgb: 2 } },
        ],
      }),
    )

    const messages = validateVault(vault, { requirePresentationAssets: true }).issues.map(
      (issue) => issue.message,
    )

    assert.ok(messages.some((message) => message.includes('missing graph color group path:"10 Innsiktskart/Innsikter"')))
    assert.ok(messages.some((message) => message.includes('missing graph color group path:"11 Maktkart/Personer"')))
  })

  it('builds a default global graph filter for the curated core layer', () => {
    const graph = JSON.parse(buildGraphSettings()) as { search: string; showOrphans: boolean }

    assert.equal(graph.showOrphans, false)
    assert.ok(graph.search.includes('-path:"Selskaper/Register"'))
    assert.ok(graph.search.includes('-path:"Personer/Register"'))
    assert.ok(graph.search.includes('-path:"12 Kilder"'))
    assert.ok(graph.search.includes('-path:"1 Oversikt og navigasjon"'))
    assert.ok(graph.search.includes('-path:"0 Kart/Konsern"'))
    assert.ok(graph.search.includes('-path:"10 Innsiktskart/Stakeholders"'))
  })

  it('requires graph color group path queries to target existing vault folders', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-graph-path-targets-'))
    mkdirSync(join(vault, '0 Kart', 'Temakart'), { recursive: true })
    mkdirSync(join(vault, '.obsidian', 'snippets'), { recursive: true })
    writeFileSync(join(vault, '0 Kart', 'Oppsett.md'), 'ok\n')
    writeFileSync(join(vault, '.obsidian', 'snippets', 'kunnskapskart.css'), '/* ok */\n')
    writeFileSync(join(vault, '0 Kart', 'Temakart', 'Sirkularitet.canvas'), '{"nodes":[],"edges":[]}\n')
    writeFileSync(join(vault, '0 Kart', 'Temakart', 'Norden.canvas'), '{"nodes":[],"edges":[]}\n')
    writeFileSync(
      join(vault, '.obsidian', 'graph.json'),
      `${JSON.stringify({
        colorGroups: [
          { query: 'path:"10 Innsiktskart/Ledd"' },
          { query: 'path:"10 Innsiktskart/Aktører"' },
          { query: 'path:"10 Innsiktskart/Stakeholders"' },
          { query: 'path:"10 Innsiktskart/Innsikter"' },
          { query: 'path:"10 Innsiktskart/Looper"' },
          { query: 'path:"10 Innsiktskart/Gaps"' },
          { query: 'path:"10 Innsiktskart/Norden"' },
          { query: 'path:"11 Maktkart/Selskaper"' },
          { query: 'path:"11 Maktkart/Personer"' },
          { query: 'path:"12 Kilder"' },
        ],
      })}\n`,
    )

    const messages = validateVault(vault, { requirePresentationAssets: true }).issues.map(
      (issue) => `${issue.file}: ${issue.message}`,
    )

    assert.ok(
      messages.some((message) =>
        message.includes('.obsidian/graph.json: graph color group targets missing vault folder 10 Innsiktskart/Ledd'),
      ),
    )
  })

  it('can require Norwegian gap notes to reference a research mission', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-gap-missions-'))
    mkdirSync(join(vault, '10 Innsiktskart', 'Gaps'), { recursive: true })
    writeFileSync(
      join(vault, '10 Innsiktskart', 'Gaps', 'Gap – Test.md'),
      buildGeneratedNote({
        title: 'Gap – Test',
        frontmatter: {
          type: 'gap',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['Gap uten mission.'],
      }),
    )

    const messages = validateVault(vault, { requireGapMissions: true }).issues.map((issue) => issue.message)

    assert.ok(messages.some((message) => message.includes('gap note must reference a research mission')))
  })

  it('requires mission references for gap notes stored in nested slash-derived paths', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-nested-gap-missions-'))
    mkdirSync(join(vault, '10 Innsiktskart', 'Gaps', 'Gap – N'), { recursive: true })
    writeFileSync(
      join(vault, '10 Innsiktskart', 'Gaps', 'Gap – N', 'P K.md'),
      buildGeneratedNote({
        title: 'Gap – N/P/K i matsvinn til forbrenning',
        frontmatter: {
          type: 'gap',
          status: 'generert',
          kilde: 'test',
          siterbarhet: 'intern',
        },
        body: ['Gap uten mission.'],
      }),
    )

    const messages = validateVault(vault, { requireGapMissions: true }).issues.map((issue) => issue.message)

    assert.ok(messages.some((message) => message.includes('gap note must reference a research mission')))
  })

  it('can require person notes to preserve the AP-1 usage rule verbatim', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-person-usage-rule-'))
    mkdirSync(join(vault, '11 Maktkart', 'Personer'), { recursive: true })
    writeFileSync(
      join(vault, '11 Maktkart', 'Personer', 'Ada Nord.md'),
      buildGeneratedNote({
        title: 'Ada Nord',
        frontmatter: {
          type: 'person',
          status: 'generert',
          kilde: 'data/vault-export/board-members.json',
          siterbarhet: 'intern',
        },
        body: ['> Styrenettverk uten AP-1 bruksregel.'],
      }),
    )

    const messages = validateVault(vault, { requirePersonUsageRule: true }).issues.map((issue) => issue.message)

    assert.ok(messages.some((message) => message.includes('person note must preserve AP-1 usage rule')))
  })

  it('can require meeting and transcript source notes to stay metadata-only', () => {
    const vault = mkdtempSync(join(tmpdir(), 'food-vault-metadata-only-sources-'))
    mkdirSync(join(vault, '12 Kilder', 'Transkripter'), { recursive: true })
    writeFileSync(
      join(vault, '12 Kilder', 'Transkripter', 'Transkript.md'),
      buildGeneratedNote({
        title: 'Transkript',
        frontmatter: {
          type: 'mote',
          status: 'generert',
          kilde: 'research/landbrukarena_transcripts/transkript.txt',
          siterbarhet: 'intern',
        },
        body: ['Dette er fulltekst uten metadata-only bruksregel.'],
      }),
    )

    const messages = validateVault(vault, { requireMetadataOnlySources: true }).issues.map(
      (issue) => issue.message,
    )

    assert.ok(messages.some((message) => message.includes('source note must stay metadata-only')))
  })

  it('can require DB-export backed company note counts to match the export manifest', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vault-export-counts-'))
    const vault = join(repo, 'Food Systems Obsidian')
    mkdirSync(join(vault, '11 Maktkart', 'Selskaper'), { recursive: true })
    mkdirSync(join(repo, 'data', 'vault-export'), { recursive: true })
    writeFileSync(
      join(repo, 'data', 'vault-export', 'manifest.json'),
      JSON.stringify({
        counts: {
          companies: 2,
        },
      }),
    )
    writeFileSync(
      join(vault, '11 Maktkart', 'Selskaper', 'A.md'),
      buildGeneratedNote({
        title: 'A',
        frontmatter: {
          type: 'aktor',
          status: 'generert',
          kilde: 'data/vault-export/companies.json',
          siterbarhet: 'intern',
        },
        body: ['En eksportert node.'],
      }),
    )

    const messages = validateVault(vault, { requireVaultExport: true }).issues.map((issue) => issue.message)

    assert.ok(messages.some((message) => message.includes('expected 2 DB company notes, found 1')))
  })

  it('does not count the DB company register as a DB company note', () => {
    const repo = mkdtempSync(join(tmpdir(), 'food-vault-export-register-count-'))
    const vault = join(repo, 'Food Systems Obsidian')
    mkdirSync(join(vault, '11 Maktkart', 'Selskaper'), { recursive: true })
    mkdirSync(join(vault, '11 Maktkart'), { recursive: true })
    mkdirSync(join(repo, 'data', 'vault-export'), { recursive: true })
    writeFileSync(
      join(repo, 'data', 'vault-export', 'manifest.json'),
      JSON.stringify({
        counts: {
          companies: 1,
        },
      }),
    )
    writeFileSync(
      join(vault, '11 Maktkart', 'Selskaper', 'A.md'),
      buildGeneratedNote({
        title: 'A',
        frontmatter: {
          type: 'aktor',
          status: 'generert',
          kilde: 'data/vault-export/companies.json',
          siterbarhet: 'intern',
        },
        body: ['En eksportert node.'],
      }),
    )
    writeFileSync(
      join(vault, '11 Maktkart', 'Selskapsregister.md'),
      buildGeneratedNote({
        title: 'Selskapsregister',
        frontmatter: {
          type: 'aktor',
          status: 'generert',
          kilde: 'data/vault-export/companies.json',
          siterbarhet: 'intern',
        },
        body: ['Register, ikke selskap.'],
      }),
    )

    assert.deepEqual(validateVault(vault, { requireVaultExport: true }).issues, [])
  })

  it('builds meeting and transcript notes as metadata-only source notes', () => {
    const result = buildMeetingTranscriptArtifacts([
      {
        sourcePath: 'docs/meetings/FOOD TRANSITION - Møte 19-06-26.md',
        kind: 'meeting',
        byteLength: 2400,
        preview: 'Dette er møtets fulle interne transkript som ikke skal kopieres inn i vaulten.',
      },
      {
        sourcePath: 'research/landbrukarena_transcripts/01-kari-toft-fullversjon-bred-BOQZvBG_LBw.txt',
        kind: 'transcript',
        byteLength: 50000,
        preview: 'Dette er transkriptets fulle tekst som ikke skal kopieres inn i vaulten.',
      },
    ])

    assert.equal(result.summary.meetings, 1)
    assert.equal(result.summary.transcripts, 1)
    assert.equal(result.files.length, 3)

    const meeting = result.files.find(
      (file) => file.path === '12 Kilder/Møter/FOOD TRANSITION - Møte 19-06-26.md',
    )
    assert.ok(meeting)
    assert.match(meeting.content, /type: mote/)
    assert.match(meeting.content, /kilde: docs\/meetings\/FOOD TRANSITION - Møte 19-06-26\.md/)
    assert.match(meeting.content, /Sammendragslenke/)
    assert.ok(!meeting.content.includes('fulle interne transkript'))

    const transcript = result.files.find(
      (file) =>
        file.path === '12 Kilder/Transkripter/01-kari-toft-fullversjon-bred-BOQZvBG_LBw.md',
    )
    assert.ok(transcript)
    assert.match(transcript.content, /type: mote/)
    assert.match(transcript.content, /Transkriptkilde/)
    assert.ok(!transcript.content.includes('fulle tekst'))

    const index = result.files.find((file) => file.path === '12 Kilder/Møte- og transkriptregister.md')
    assert.ok(index?.content.includes('[[FOOD TRANSITION - Møte 19-06-26]]'))
    assert.ok(index?.content.includes('[[01-kari-toft-fullversjon-bred-BOQZvBG_LBw]]'))
  })

  it('builds stakeholder skeleton notes with ask, priority, relation and actor links', () => {
    const result = buildStakeholderArtifacts(
      [
        {
          actor: 'Nortura',
          actorType: 'cooperative_industry',
          whyRelevantForMapping: 'Markedsregulator for kjøtt og egg.',
          priority: 'high',
          suggestedAsk: 'Hvordan virker markedsreguleringen i praksis?',
          sourceBasis: 'Transcript 19',
        },
        {
          actor: 'Omsetningsraadet',
          actorType: 'regulator',
          whyRelevantForMapping: 'Godkjenner reguleringstiltak.',
          priority: 'medium',
          suggestedAsk: 'Hvordan vurderes balansen mellom pris og konkurranse?',
          sourceBasis: 'Transcript 19',
        },
      ],
      new Set(['Nortura']),
    )

    assert.equal(result.summary.stakeholders, 2)
    assert.ok(result.summaryLine.includes('stakeholders=2'))

    const note = result.files.find((file) => file.path === '10 Innsiktskart/Stakeholders/Stakeholder – Nortura.md')
    assert.ok(note)
    assert.match(note.content, /type: aktor/)
    assert.match(note.content, /status: utkast/)
    assert.match(note.content, /ask: Hvordan virker markedsreguleringen i praksis\?/)
    assert.match(note.content, /prioritet: high/)
    assert.match(note.content, /relasjon: cooperative_industry/)
    assert.ok(note.content.includes('[[Nortura]]'))
    assert.ok(note.content.includes('[[I26 Gaps som krever menneskelig input]]'))

    const unlinked = result.files.find(
      (file) => file.path === '10 Innsiktskart/Stakeholders/Stakeholder – Omsetningsraadet.md',
    )
    assert.ok(unlinked?.content.includes('Aktørnote: ikke opprettet i vaulten'))

    const index = result.files.find((file) => file.path === '10 Innsiktskart/Stakeholders/Stakeholder-register.md')
    assert.ok(index?.content.includes('[[Stakeholder – Nortura]]'))
    assert.ok(index?.content.includes('[[Stakeholder – Omsetningsraadet]]'))
  })

  it('builds DB-export backed company, interlocker and concern canvas artifacts', () => {
    const result = buildVaultExportArtifacts({
      manifest: {
        generatedAt: '2026-07-02T00:00:00.000Z',
        source: 'scripts/obsidian-vault/export-db.ts',
        counts: {
          companies: 3,
          ownershipEdges: 2,
          boardMembers: 4,
          businessRelationships: 1,
          properties: 1,
        },
      },
      companies: [
        {
          id: 'parent',
          name: 'NorgesGruppen ASA',
          orgNr: '912345678',
          legalForm: 'ASA',
          country: 'NO',
          valueChainStage: 'retail',
          classification: 'konsern',
          naceCode: '47.110',
          naceDescription: 'Butikkhandel',
          isResearchConstruct: false,
        },
        {
          id: 'child-a',
          name: 'ASKO Norge AS',
          orgNr: '923456789',
          legalForm: 'AS',
          country: 'NO',
          valueChainStage: 'logistics',
          classification: 'AS',
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
        {
          id: 'child-b',
          name: 'Meny AS',
          orgNr: '934567890',
          legalForm: 'AS',
          country: 'NO',
          valueChainStage: 'retail',
          classification: 'AS',
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
      ],
      ownershipEdges: [
        {
          id: 'edge-1',
          parentCompanyId: 'parent',
          parentName: 'NorgesGruppen ASA',
          childCompanyId: 'child-a',
          childName: 'ASKO Norge AS',
          ownershipPct: 100,
          ownershipType: 'subsidiary',
          source: 'Årsrapport',
        },
        {
          id: 'edge-2',
          parentCompanyId: 'parent',
          parentName: 'NorgesGruppen ASA',
          childCompanyId: 'child-b',
          childName: 'Meny AS',
          ownershipPct: 100,
          ownershipType: 'subsidiary',
          source: 'Årsrapport',
        },
      ],
      boardMembers: [
        {
          id: 'role-1',
          companyId: 'parent',
          personName: 'Ada Nord',
          personKey: 'ada-nord',
          role: 'styreleder',
          source: 'Brønnøysund',
          verificationStatus: 'verified',
          companyName: 'NorgesGruppen ASA',
        },
        {
          id: 'role-2',
          companyId: 'child-a',
          personName: 'Ada Nord',
          personKey: 'ada-nord',
          role: 'styremedlem',
          source: 'Brønnøysund',
          verificationStatus: 'verified',
          companyName: 'ASKO Norge AS',
        },
        {
          id: 'role-3',
          companyId: 'child-b',
          personName: 'Ada Nord',
          personKey: 'ada-nord',
          role: 'styremedlem',
          source: 'Brønnøysund',
          verificationStatus: 'verified',
          companyName: 'Meny AS',
        },
        {
          id: 'role-4',
          companyId: 'child-b',
          personName: 'Enkelt Rolle',
          personKey: 'enkelt-rolle',
          role: 'styremedlem',
          source: 'Brønnøysund',
          verificationStatus: 'verified',
          companyName: 'Meny AS',
        },
      ],
      businessRelationships: [
        {
          id: 'rel-1',
          fromCompanyId: 'child-a',
          toCompanyId: 'child-b',
          relationshipType: 'supplier',
          description: 'Distribuerer varer',
          sector: 'dagligvare',
          estimatedValue: null,
          source: 'Årsrapport',
          verificationStatus: 'verified',
          fromCompanyName: 'ASKO Norge AS',
          toCompanyName: 'Meny AS',
        },
      ],
      properties: [
        {
          id: 'prop-1',
          companyId: 'child-b',
          tenantCompanyId: null,
          propertyType: 'retail',
          address: 'Testgata 1',
          municipality: 'Oslo',
          county: null,
          country: 'NO',
          lat: null,
          lng: null,
          sqMeters: 1200,
          selfLeased: true,
          source: 'Eiendomsregister',
          companyName: 'Meny AS',
          tenantCompanyName: null,
        },
      ],
      ownershipForest: [
        {
          id: 'parent',
          name: 'NorgesGruppen ASA',
          orgNr: '912345678',
          ownershipPct: null,
          children: [
            {
              id: 'child-a',
              name: 'ASKO Norge AS',
              orgNr: '923456789',
              ownershipPct: 100,
              children: [],
            },
            {
              id: 'child-b',
              name: 'Meny AS',
              orgNr: '934567890',
              ownershipPct: 100,
              children: [],
            },
          ],
        },
      ],
      coreCompanyIds: ['parent'],
      coreCompanyNames: ['ASKO Norge AS', 'Meny AS'],
      corePersonNames: ['Ada Nord'],
    })

    assert.equal(result.summary.companies, 3)
    assert.equal(result.summary.personNotes, 1)
    assert.equal(result.summary.concernCanvases, 1)
    assert.ok(result.summaryLine.includes('companies=3'))
    assert.ok(result.summaryLine.includes('personNotes=1'))

    const company = result.files.find((file) => file.path === '11 Maktkart/Selskaper/NorgesGruppen ASA.md')
    assert.ok(company)
    assert.match(company.content, /orgnr: 912345678/)
    assert.match(company.content, /\[\[ASKO Norge AS\]\] — 100 %/)
    assert.match(company.content, /- \[\[ASKO Norge AS\]\] \(100 %\)/)

    const relationshipCompany = result.files.find((file) => file.path === '11 Maktkart/Selskaper/ASKO Norge AS.md')
    assert.ok(relationshipCompany?.content.includes('supplier → [[Meny AS]]'))

    const propertyCompany = result.files.find((file) => file.path === '11 Maktkart/Selskaper/Meny AS.md')
    assert.ok(propertyCompany?.content.includes('retail: Testgata 1, Oslo'))

    const ownershipRegister = result.files.find((file) => file.path === '11 Maktkart/Eierskapsregisteret.md')
    assert.ok(ownershipRegister?.content.includes('## Kanter'))
    assert.ok(ownershipRegister?.content.includes('[[NorgesGruppen ASA]] → [[ASKO Norge AS]] — 100 %'))

    const companyRegister = result.files.find((file) => file.path === '11 Maktkart/Selskapsregister.md')
    assert.ok(companyRegister?.content.includes('[[NorgesGruppen ASA]] — retail · konsern · 912345678'))
    assert.ok(companyRegister?.content.includes('[[ASKO Norge AS]] — logistics · AS · 923456789'))

    assert.ok(result.files.some((file) => file.path === '11 Maktkart/Personregister.md'))
    assert.ok(result.files.some((file) => file.path === '11 Maktkart/Personer/Ada Nord.md'))
    assert.ok(!result.files.some((file) => file.path === '11 Maktkart/Personer/Enkelt Rolle.md'))
    assert.ok(result.files.some((file) => file.path === '0 Kart/Konsern/NorgesGruppen ASA.canvas'))
  })

  it('builds concern canvas nodes without layout overlap across branches', () => {
    const result = buildVaultExportArtifacts({
      manifest: {
        generatedAt: '2026-07-02T00:00:00.000Z',
        source: 'scripts/obsidian-vault/export-db.ts',
        counts: {
          companies: 6,
          ownershipEdges: 5,
          boardMembers: 0,
          businessRelationships: 0,
          properties: 0,
        },
      },
      companies: [
        {
          id: 'root',
          name: 'Root ASA',
          orgNr: '900000001',
          legalForm: 'ASA',
          country: 'NO',
          valueChainStage: 'retail',
          classification: 'konsern',
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
        {
          id: 'child-a',
          name: 'Child A AS',
          orgNr: '900000002',
          legalForm: 'AS',
          country: 'NO',
          valueChainStage: 'logistics',
          classification: null,
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
        {
          id: 'child-b',
          name: 'Child B AS',
          orgNr: '900000003',
          legalForm: 'AS',
          country: 'NO',
          valueChainStage: 'processing',
          classification: null,
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
        {
          id: 'grandchild-a',
          name: 'Grandchild A AS',
          orgNr: '900000004',
          legalForm: 'AS',
          country: 'NO',
          valueChainStage: 'retail',
          classification: null,
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
        {
          id: 'grandchild-b',
          name: 'Grandchild B AS',
          orgNr: '900000005',
          legalForm: 'AS',
          country: 'NO',
          valueChainStage: 'retail',
          classification: null,
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
        {
          id: 'grandchild-a2',
          name: 'Grandchild A2 AS',
          orgNr: '900000006',
          legalForm: 'AS',
          country: 'NO',
          valueChainStage: 'retail',
          classification: null,
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
      ],
      ownershipEdges: [
        {
          id: 'root-child-a',
          parentCompanyId: 'root',
          parentName: 'Root ASA',
          childCompanyId: 'child-a',
          childName: 'Child A AS',
          ownershipPct: 100,
          ownershipType: 'direct',
          source: null,
        },
        {
          id: 'root-child-b',
          parentCompanyId: 'root',
          parentName: 'Root ASA',
          childCompanyId: 'child-b',
          childName: 'Child B AS',
          ownershipPct: 100,
          ownershipType: 'direct',
          source: null,
        },
        {
          id: 'child-a-grandchild-a',
          parentCompanyId: 'child-a',
          parentName: 'Child A AS',
          childCompanyId: 'grandchild-a',
          childName: 'Grandchild A AS',
          ownershipPct: 100,
          ownershipType: 'direct',
          source: null,
        },
        {
          id: 'child-a-grandchild-a2',
          parentCompanyId: 'child-a',
          parentName: 'Child A AS',
          childCompanyId: 'grandchild-a2',
          childName: 'Grandchild A2 AS',
          ownershipPct: 100,
          ownershipType: 'direct',
          source: null,
        },
        {
          id: 'child-b-grandchild-b',
          parentCompanyId: 'child-b',
          parentName: 'Child B AS',
          childCompanyId: 'grandchild-b',
          childName: 'Grandchild B AS',
          ownershipPct: 100,
          ownershipType: 'direct',
          source: null,
        },
      ],
      boardMembers: [],
      businessRelationships: [],
      properties: [],
      ownershipForest: [
        {
          id: 'root',
          name: 'Root ASA',
          ownershipPct: null,
          children: [
            {
              id: 'child-a',
              name: 'Child A AS',
              ownershipPct: 100,
              children: [
                { id: 'grandchild-a', name: 'Grandchild A AS', ownershipPct: 100, children: [] },
                { id: 'grandchild-a2', name: 'Grandchild A2 AS', ownershipPct: 100, children: [] },
              ],
            },
            {
              id: 'child-b',
              name: 'Child B AS',
              ownershipPct: 100,
              children: [{ id: 'grandchild-b', name: 'Grandchild B AS', ownershipPct: 100, children: [] }],
            },
          ],
        },
      ],
    })

    const canvas = result.files.find((file) => file.path === '0 Kart/Konsern/Root ASA.canvas')
    assert.ok(canvas)
    const parsed = JSON.parse(canvas.content) as {
      nodes: Array<{ id: string; x: number; y: number; width: number; height: number }>
    }
    const grandchildA = parsed.nodes.find((node) => node.id === 'grandchild-a')
    const grandchildA2 = parsed.nodes.find((node) => node.id === 'grandchild-a2')
    const grandchildB = parsed.nodes.find((node) => node.id === 'grandchild-b')

    assert.ok(grandchildA)
    assert.ok(grandchildA2)
    assert.ok(grandchildB)
    assert.notEqual(grandchildA.y, grandchildB.y)
    assert.notEqual(grandchildA2.y, grandchildB.y)
  })

  it('aliases DB-export wikilinks when company names contain slashes', () => {
    const result = buildVaultExportArtifacts({
      manifest: {
        generatedAt: '2026-07-02T00:00:00.000Z',
        source: 'scripts/obsidian-vault/export-db.ts',
        counts: {
          companies: 2,
          ownershipEdges: 1,
          boardMembers: 0,
          businessRelationships: 0,
          properties: 0,
        },
      },
      companies: [
        {
          id: 'parent',
          name: 'NorgesGruppen ASA',
          orgNr: '912345678',
          legalForm: 'ASA',
          country: 'NO',
          valueChainStage: 'retail',
          classification: 'konsern',
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
        {
          id: 'child',
          name: 'Dagrofa A/S',
          orgNr: '123456789',
          legalForm: 'A/S',
          country: 'DK',
          valueChainStage: 'retail',
          classification: 'A/S',
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
      ],
      ownershipEdges: [
        {
          id: 'edge',
          parentCompanyId: 'parent',
          parentName: 'NorgesGruppen ASA',
          childCompanyId: 'child',
          childName: 'Dagrofa A/S',
          ownershipPct: 48.9,
          ownershipType: 'minority-stake',
          source: 'Årsrapport',
        },
      ],
      boardMembers: [],
      businessRelationships: [],
      properties: [],
      ownershipForest: [
        {
          id: 'parent',
          name: 'NorgesGruppen ASA',
          orgNr: '912345678',
          ownershipPct: null,
          children: [
            {
              id: 'child',
              name: 'Dagrofa A/S',
              orgNr: '123456789',
              ownershipPct: 48.9,
              children: [],
            },
          ],
        },
      ],
      coreCompanyIds: ['parent'],
    })

    const parent = result.files.find((file) => file.path === '11 Maktkart/Selskaper/NorgesGruppen ASA.md')
    const ownershipRegister = result.files.find((file) => file.path === '11 Maktkart/Eierskapsregisteret.md')

    assert.ok(parent?.content.includes('[[Dagrofa A-S|Dagrofa A/S]]'))
    assert.ok(!parent?.content.includes('[[Dagrofa A/S]]'))
    assert.ok(ownershipRegister?.content.includes('[[Dagrofa A-S|Dagrofa A/S]]'))
    assert.ok(result.files.some((file) => file.path === '11 Maktkart/Selskaper/Register/Dagrofa A-S.md'))
  })

  it('disambiguates DB-export company note paths when names collide by casing', () => {
    const result = buildVaultExportArtifacts({
      manifest: {
        generatedAt: '2026-07-02T00:00:00.000Z',
        source: 'scripts/obsidian-vault/export-db.ts',
        counts: {
          companies: 3,
          ownershipEdges: 1,
          boardMembers: 2,
          businessRelationships: 0,
          properties: 0,
        },
      },
      companies: [
        {
          id: 'parent',
          name: 'Axel Johnson AB',
          orgNr: '111',
          legalForm: 'AB',
          country: 'SE',
          valueChainStage: 'holding',
          classification: 'konsern',
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
        {
          id: 'child-1',
          name: 'MARTIN & SERVERA AB',
          orgNr: '222',
          legalForm: 'AB',
          country: 'SE',
          valueChainStage: 'foodservice',
          classification: 'AB',
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
        {
          id: 'child-2',
          name: 'Martin & Servera AB',
          orgNr: '333',
          legalForm: 'AB',
          country: 'SE',
          valueChainStage: 'foodservice',
          classification: 'AB',
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
      ],
      ownershipEdges: [
        {
          id: 'edge',
          parentCompanyId: 'parent',
          parentName: 'Axel Johnson AB',
          childCompanyId: 'child-2',
          childName: 'Martin & Servera AB',
          ownershipPct: 100,
          ownershipType: 'subsidiary',
          source: 'Årsrapport',
        },
      ],
      boardMembers: [
        {
          id: 'role-parent',
          companyId: 'parent',
          personName: 'Ada Nord',
          personKey: 'ada-nord',
          role: 'styreleder',
          source: 'Brønnøysund',
          verificationStatus: 'verified',
          companyName: 'Axel Johnson AB',
        },
        {
          id: 'role',
          companyId: 'child-2',
          personName: 'Ada Nord',
          personKey: 'ada-nord',
          role: 'styremedlem',
          source: 'Brønnøysund',
          verificationStatus: 'verified',
          companyName: 'Martin & Servera AB',
        },
      ],
      businessRelationships: [],
      properties: [],
      ownershipForest: [],
      coreCompanyIds: ['parent'],
      corePersonNames: ['Ada Nord'],
    })

    assert.ok(result.files.some((file) => file.path === '11 Maktkart/Selskaper/Register/MARTIN & SERVERA AB (222).md'))
    assert.ok(result.files.some((file) => file.path === '11 Maktkart/Selskaper/Register/Martin & Servera AB (333).md'))

    const parent = result.files.find((file) => file.path === '11 Maktkart/Selskaper/Axel Johnson AB.md')
    assert.ok(parent?.content.includes('[[Martin & Servera AB (333)|Martin & Servera AB]]'))

    const person = result.files.find((file) => file.path === '11 Maktkart/Personer/Ada Nord.md')
    assert.ok(person?.content.includes('[[Martin & Servera AB (333)|Martin & Servera AB]]'))
  })
})
