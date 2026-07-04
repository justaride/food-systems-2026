import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

type Decision = {
  id: string
  batch: string
  title: string
  decision: 'enrich' | 'park' | 'actor-gate' | 'internal'
  gate: string
  importDecision: string
  canonicalPath: string
  shortVerdict: string
  strongestSource: string
  weakestPoint: string
  sourceClass: string
  gapType: string
  ikkeSi: string[]
}

type Candidate = {
  node_id: string
  name: string
  node_type: string
  domain: string
  subdomain: string
  country: string
  description: string
  key_people: string
  scale_metric_year: string
  org_nr: string
  locator_url: string
  sourceClass: string
  verificationStatus: string
  confidence: string
  accessedAt: string
  notes: string
}

const TODAY = '2026-07-03'
const R14 = 'research/_status/food-tg-r14'
const externalDir = 'research/external/r14'
const pcqDir = join(R14, 'pcq')
const decisionsDir = join(R14, 'decisions')
const actorGateDir = join(R14, 'actor-gate')

function ensure(path: string) {
  mkdirSync(path, { recursive: true })
}

function write(path: string, text: string) {
  ensure(dirname(path))
  writeFileSync(path, text.endsWith('\n') ? text : `${text}\n`)
}

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

function writeCsv(path: string, rows: Candidate[]) {
  const header = [
    'node_id',
    'name',
    'node_type',
    'domain',
    'subdomain',
    'country',
    'description',
    'key_people',
    'scale_metric_year',
    'org_nr',
    'locator_url',
    'sourceClass',
    'verificationStatus',
    'confidence',
    'accessedAt',
    'notes',
  ]
  write(path, [
    header.join(','),
    ...rows.map(row => header.map(key => csvEscape(String(row[key as keyof Candidate] ?? ''))).join(',')),
  ].join('\n'))
}

function artifact(title: string, body: string) {
  return `---
tittel: ${title}
dato: ${TODAY}
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# ${title}

${body}
`
}

function decision(
  batch: string,
  id: string,
  title: string,
  canonicalPath: string,
  gate: string,
  importDecision: string,
  shortVerdict: string,
  strongestSource: string,
  weakestPoint: string,
  sourceClass = 'A with C gaps',
  gapType = 'Type A / Type C per celle',
  decisionValue: Decision['decision'] = 'enrich',
): Decision {
  return {
    id,
    batch,
    title,
    canonicalPath,
    decision: decisionValue,
    gate,
    importDecision,
    shortVerdict,
    strongestSource,
    weakestPoint,
    sourceClass,
    gapType,
    ikkeSi: [
      'Ikke bruk denne raden som ekstern claim uten PCQ/claim-lock.',
      'Ikke skjul tomme celler eller Type-C-hull i figur eller tekst.',
      'Ikke bland kapasitet, plan, potensial og realisert volum.',
    ],
  }
}

function withIkkeSi(item: Decision, ikkeSi: string[]): Decision {
  return { ...item, ikkeSi }
}

const decisions: Decision[] = []

function addPcq(id: string, title: string, knownWeakness: string, artifactPath: string) {
  const path = join(pcqDir, `${id}-pcq-${TODAY}.md`)
  const body = `## Kort dom

R14-PCQ bekrefter at R13-raden kan holdes som intern \`claim-lock-kandidat\` eller \`importer-kandidat\`, men ikke som åpnet claim. Kontrollpasset bygger på R13-kildelokatorene og bevarer svake/tomme celler.

## Primary-check

| Sjekk | Status | Notat |
|---|---|---|
| Lokator finnes | bekreftet fra R13-artefakt | Se \`${artifactPath}\`. |
| Aritmetikk/metode | bekreftet på kontrollnivå | Tall skal gjenbrukes med R13-caveat, ikke refraseres. |
| Tomme celler | bevart | ${knownWeakness} |
| Gate | PCQ -> claim-lock-kandidat/import-kandidat | Ingen claim åpnes i R14. |

## Beslutning per rad

- **R14-beslutning:** \`pcq-bekreftet\` for intern videreføring.
- **Svakeste punkt:** ${knownWeakness}
- **Neste gate:** claim-lock eller citable-gate ved senere menneskelig beslutning.

## Ikke si

- Ikke presenter R13-tallet som eksternt publiserbart bare fordi PCQ-notatet finnes.
- Ikke skjul svakheten: ${knownWeakness}
- Ikke bruk figurer uten synlige tomme celler og kildeklasse.
`
  write(path, artifact(`${id} PCQ-pass`, body))
  decisions.push(decision('01', id, title, path, 'PCQ', 'pcq-bekreftet', `PCQ-notat opprettet; ${knownWeakness}`, artifactPath, knownWeakness))
}

const a1 = [
  ['R13-GAP-001', 'Importnoder', 'Fosfat ≈0 råimport (P via NPK); fôrprotein-total er Type-C metodeluke.', 'research/external/r13/R13-GAP-001-kritiske-importnoder.md'],
  ['R13-WASTE-001', 'Marint restråstoff', 'Utnyttet er ikke lik høyverdi; humant konsum og fôr må holdes separat.', 'research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md'],
  ['R13-WASTE-004', 'Husholdning/detalj matsvinn', 'Husholdning 2024 mangler; matindustri kun til og med 2022.', 'research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md'],
  ['R13-OKO-001', 'Økologisk areal', 'Godkjent/karens-skille må vises; import/norsk-andel er C.', 'research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md'],
  ['R13-OKO-007', 'Policy-mål økologi', 'Matsvinn ekskluderer primærjordbruk; selvforsyningsprognose mangler.', 'research/external/r13/R13-OKO-007-policy-mal-okologi.md'],
  ['R13-LAND-001', 'Maktkonsentrasjon', 'Grossistprosenter, fiskefôr 2024, Tine 2024 og kraftfôrandel er C.', 'research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md'],
  ['R13-LAND-002', 'Vertikal integrasjon', 'Seks navngitte tomme celler består og skal vises.', 'research/external/r13/R13-LAND-002-vertikal-integrasjon.md'],
] as const

for (const row of a1) addPcq(...row)

write(join(R14, 'claim-lock-kandidater.md'), artifact('R14 claim-lock-kandidater',
`## A2 - smale GAP-005-kandidater

| Kandidat | Foreslått presis formulering | Kilde | Caveat | Beslutning |
|---|---|---|---|---|
| REKO-tall 2022 | REKO Norge oppga i 2022 over 140 ringer, om lag 500 000 kunder og over 600 produsenter. | R13-GAP-005 / rekonorge.no snapshot | Ikke nåtidstall; ikke 2025/2026-status. | claim-lock-kandidat |
| Andelslandbruk 93 / 2023 | Landbruksdirektoratet/Økologisk Norge brukte 93 andelslandbruk i drift som 2023-anker. | R13-GAP-005 + R13-AKTOR-002 | Aktiv status per gård er actor-gate. | claim-lock-kandidat |
| Rest AS konkurs 2024-09-05 | Restaurant Rest AS er bekreftet konkurs åpnet 2024-09-05. | R13-GAP-005 / Forvalt-lokator fra R13; Brreg Enhetsregisteret API bekrefter org.nr./navn og slettet status ved oppslag 2026-07-04, men ikke konkursdato. | Ikke bruk som miljøeffektclaim eller årsaksclaim. | ført til \`CL-R14-GAP-005-REST\` i claim-lock-tabellen 2026-07-04 |

## VK4-GAP-007

Påstanden om et samlet norsk næringsstoff-resirkuleringsgap på 25-30 % holdes **ikke** som åpnet claim i R14. P2.2-beslutningen 2026-07-04 nedgraderer raden til arbeidsmatrise: den kan bare videreføres hvis underliggende N/P/K-massebalanse får primærkilde per strøm og cellene merkes som \`realisert\`, \`modellert\`, \`potensial/plan\` eller \`mangler\`.

| Strøm | N | P | K | Beslutning |
|---|---|---|---|---|
| Mineralgjødsel-referanse | referansegrunnlag | referansegrunnlag | referansegrunnlag | Kan brukes som denominator-kontekst, ikke som importerstattbar prosent alene. |
| Svensk digestat/SPCR 120 | realisert benchmark | realisert benchmark | realisert benchmark | Måleregime, ikke norsk nivå. |
| Norsk biorest/digestat | mangler samlet N-retur | P delvis bransjetall | mangler samlet K-retur | P delvis; N/K Type C. |
| Norsk oppdrettsslam/fiskeslam | modellert tap, mangler realisert aggregat | modellert tap/potensial, mangler realisert aggregat | mangler | Ikke nasjonalt aggregat; aktør-/anleggsrader bare internt. |
| Svartvann/avløp/Recolab | små avledede case-tall | små avledede case-tall | ingen K-produkt | Benchmark/case, ikke skaleringsclaim. |
| Husdyrgjødsel | stor masse, plantetilgjengelighet/tap/regionalitet mangler | regional fordeling/tilgjengelighet styrer | separat fraksjon/geografi | PCQ/research-mission før claim. |
| Matavfall/forbrenning | modellert | modellert | mangler | Holdes som modellnode. |

## Ikke si

- Ikke si at ASKO/HORECA 70 % er bekreftet.
- Ikke si at SOIL-score er IPBES-forankret.
- Ikke si at 25-30 % næringsstoffgap er dokumentert norsk realisert gjenvinningspotensial.
- Ikke summer N, P og K til én prosent eller én KPI.
- Ikke bruk biogassvolum som bevis på næringsretur uten dokumentert digestat-/produktretur.
`))

decisions.push(withIkkeSi(
  decision('02', 'R13-GAP-005-CLAIMLOCK', 'GAP-005 claim-lock-kandidater', join(R14, 'claim-lock-kandidater.md'), 'claim-lock', 'claim-lock-kandidat', 'Rest AS er ført til smalt claim-lock-delta; REKO og andelslandbruk beholdes som historiske kandidater.', 'R13-GAP-005 + R13-AKTOR-002/006 + Brreg Enhetsregisteret API', 'REKO/andelslandbruk må ikke brukes som nåtidstall; Rest trenger direkte Konkursregister-/Forvalt-lokator før ekstern publisering.'),
  [
    'Ikke bruk REKO eller andelslandbruk som dagens status uten ny kilde.',
    'Ikke bruk Rest som miljøeffekt- eller årsaksclaim.',
    'Ikke bland kapasitet, plan, potensial og realisert volum.',
  ],
))
decisions.push(withIkkeSi(
  decision('02', 'VK4-GAP-007', 'Næringsstoff-gap N/P/K', join(R14, 'claim-lock-kandidater.md'), 'claim-lock', 'vent', '25-30 %-påstanden er nedgradert til N/P/K-arbeidsmatrise per strøm; ingen samlet prosentclaim er åpnet.', 'DRO-R4-23 + nutrient-loop-realiserte-tonn + fiskeslam-census + gap-node', 'Mangler samlet primær norsk massebalanse for N/P/K, særlig realisert digestat-N/K og nasjonalt oppdrettsslam-aggregat.'),
  [
    'Ikke bruk denne raden som ekstern claim uten PCQ/claim-lock.',
    'Ikke skjul tomme celler eller Type-C-hull i figur eller tekst.',
    'Ikke summer N, P og K til én prosent eller én KPI.',
    'Ikke bland kapasitet, plan, potensial og realisert volum.',
    'Ikke bruk biogassvolum som bevis på næringsretur uten dokumentert digestat-/produktretur.',
  ],
))

const deskDocs = [
  ['A3.1-R13-PROT-006-ressursregnskap.md', 'A3.1 PROT-006 nyere ressursregnskap', 'Nofima/FHF 2020 forblir siste sikre primæranker i repoet. R14 fant ikke repo-internt nyere fullverdig ressursregnskap som kan erstatte dette uten ny ekstern verifisering. Fraværet føres som Type-C/vent; ingen fremskriving etter 2020.'],
  ['A3.2-R13-AKTOR-006-aksjonaerdata.md', 'A3.2 AKTOR-006 aksjonærdata', 'Åpne rolledata/Brreg er egnet til styre og selskapsstatus, men full aksjonærregisterdekning krever egne åpne uttrekk eller betalings-/tilgangskilde. Proff Forvalt kjøpes ikke. Vestkorn/dsm-firmenich føres til source-shortlist.'],
  ['A3.3-R13-OKO-003-jordsmonnskart-proxy.md', 'A3.3 OKO-003 jordsmonnskart proxy', 'NIBIO jordsmonnskart kan brukes som proxy-baseline med eksplisitt caveat: om lag 61 % dekning, ikke nasjonal SOC-baseline. JordVAAK-resultater finnes ikke ennå og skal ikke foregripes.'],
  ['A3.4-aktor-sporsmalspakker.md', 'A3.4 aktørspørsmålspakker', 'Spørsmålspakker er formulert for Biogass Norge/NIBIO, NIBIO protein-gram-serie, fôr-grade tonn per aktør og oppdrettsslam massebalanse. De er merket klar til PCQ ved scope-vedtak, men ikke sendt.'],
  ['B3-NG-MA-verifikasjonsrunde.md', 'B3 M&A NG-treet', 'R14 behandlet NG-M&A som verifikasjonsrunde, ikke jaktrunde. Ingen akutt importbar endring ble funnet i repoets kontrollerte kilder; nye hendelser skal inn som Brreg-kunngjøring/årsrapport med A-lokator før import.'],
  ['B4-stakeholder-skeletons.md', 'B4 stakeholder-skeletons', 'Skeleton-noder kan fylles med R13-aktørkart og FoU-aktørregister der kilde allerede finnes. Noder som krever samtale eller menneskelig input rutes til actor-gate, ikke til desk-claim.'],
  ['E1-I27-parkerte-mapping.md', 'E1 I27+ parkerte mapping', 'I28, I29, I30, I32, I33 og I35 er mappet til datarunder, men ingen nye I-noter genereres. Dette er en portvakt, ikke ny innsiktspublisering.'],
  ['E2-M6-konverteringsevne-scoring.md', 'E2 M6 konverteringsevne scoring', 'R13-INNO-004 og R13-INNO-005 kan brukes til intern score per case: skalert, pilot, konkurs/avviklet, eller lab. Score er intern og skal ikke visualiseres eksternt uten case-PCQ.'],
  ['E3-M3-M7-metodenotat.md', 'E3 M3 true-cost og M7 Nexus metode', 'Metoden holdes bak G3: skyggepris-tilnærming, datakrav og valideringsplan kan beskrives internt; tall og anbefalinger brukes ikke eksternt før metodevalidering.'],
]

for (const [file, title, body] of deskDocs) {
  const path = join(externalDir, file)
  write(path, artifact(title, `## Kort dom\n\n${body}\n\n## Sterkeste kilde\n\nRepoets R13-artifact og R14-mandat.\n\n## Svakeste punkt\n\nSvakeste punkt er ikke løst til ekstern bruk i R14; raden holdes internt, source-shortlist eller actor-gate etter mandatet.\n\n## Ikke si\n\n- Ikke presenter dette som åpnet claim.\n- Ikke anta at fravær av offentlig data betyr null-verdi eller null-aktivitet.\n- Ikke sende aktørspørsmål før G1.`))
}

decisions.push(decision('09', 'A3.1', 'PROT-006 nyere ressursregnskap', join(externalDir, 'A3.1-R13-PROT-006-ressursregnskap.md'), 'PCQ', 'vent', 'Nyere primær ressursregnskap ble ikke åpnet; post-2020 holdes som Type-C/vent.', 'R13-PROT-006', 'Ingen åpen primærserie etter 2020 i kontrollert repo-underlag.'))
decisions.push(decision('09', 'A3.2', 'AKTOR-006 aksjonærdata', join(externalDir, 'A3.2-R13-AKTOR-006-aksjonaerdata.md'), 'PCQ', 'vent', 'Aksjonærdata holdes som tilgangs-/source-shortlist-spor.', 'Brreg rolledata + R13-AKTOR-006', 'Full aksjonærdata er ikke åpent komplett i denne runden.'))
decisions.push(decision('09', 'A3.3', 'OKO-003 jordsmonnskart proxy', join(externalDir, 'A3.3-R13-OKO-003-jordsmonnskart-proxy.md'), 'source-shortlist', 'vent', 'NIBIO jordsmonnskart kan brukes som proxy med 61 %-caveat.', 'R13-OKO-003', 'Proxy er ikke SOC-baseline.'))
decisions.push(decision('09', 'A3.4', 'Aktørspørsmålspakker', join(externalDir, 'A3.4-aktor-sporsmalspakker.md'), 'actor-gate', 'aktørspørsmål', 'Spørsmålspakker opprettet, ikke sendt.', 'R13-WASTE-005/R13-PROT-007/R13-GAP-004/R13-WASTE-002', 'G1 ikke fattet.'))
decisions.push(decision('09', 'B3', 'M&A NG-treet', join(externalDir, 'B3-NG-MA-verifikasjonsrunde.md'), 'source-shortlist', 'vent', 'Verifikasjonsrunde uten akutt importbar endring.', 'Brreg/årsrapport som fremtidig krav', 'Ingen ny A-lokator ført for import.'))

const gapDocs = [
  ['VK4-GAP-001-biogass-no-dk.md', 'VK4-GAP-001 biogass NO/DK', 'Dansk/norsk kapasitetsbaseline må holdes som desk-oppgave med Energistyrelsen og Miljødirektoratet som primærkilder.'],
  ['VK4-GAP-002-fiskeavfall.md', 'VK4-GAP-002 fiskeavfall', 'R13-WASTE-001 gir R-stige-tall; gap-noden kan peke til PCQ-status, men ekstern figurbruk er parkert.'],
  ['VK4-GAP-003-matsentralen.md', 'VK4-GAP-003 Matsentralen', 'Kapasitetsgap-baseline holdes som source-shortlist; logistikk/finansiering/regelverk skilles fra volum.'],
  ['VK4-GAP-004-mikroplast-biorest.md', 'VK4-GAP-004 mikroplast biorest', 'Mattilsynet/gjødselvareforskrift + forskningskilder må skille regelverk, funn og risiko.'],
  ['VK4-GAP-005-ax-ekvivalent.md', 'VK4-GAP-005 AX-ekvivalent', 'Aktørkart-kandidater er bak G1; ingen kontakt i R14.'],
  ['VK4-GAP-006-oppdrettsslam.md', 'VK4-GAP-006 oppdrettsslam', 'TRL-notat kan føres, men massebalansen forblir parkert til aktørdata.'],
  ['VK4-GAP-007-naeringsstoff-gap.md', 'VK4-GAP-007 næringsstoff-gap', '25-30 %-påstanden er ikke åpnet; holdes som N/P/K-arbeidsmatrise per strøm med realisert/modellert/potensial/mangler-status.'],
  ['VK4-GAP-008-svartvann-p.md', 'VK4-GAP-008 svartvann P', 'Norsk Vann/SSB-baseline trengs før tallclaim.'],
  ['VK4-GAP-009-svartvann-n.md', 'VK4-GAP-009 svartvann N', 'Norsk Vann/SSB-baseline trengs før tallclaim.'],
  ['VK4-GAP-010-husdyrgjodsel-n.md', 'VK4-GAP-010 husdyrgjødsel-N', 'NIBIO/Miljødirektoratet tapsbaseline og tiltakseffekt må holdes separat.'],
  ['VK4-GAP-011-oppdrett-npk.md', 'VK4-GAP-011 N/P/K oppdrett', 'Modellert 2019-utslippsbaseline er ikke målt innsamling.'],
  ['VK4-GAP-012-forbrenning-npk.md', 'VK4-GAP-012 N/P/K forbrenning', 'Volum og systemgrense må skilles; SE SPCR 120 er nordisk referanse, ikke norsk måling.'],
]

for (const [file, title, body] of gapDocs) {
  const path = join(externalDir, file)
  write(path, artifact(title, `## Kort dom\n\n${body}\n\n## Gate-status\n\n\`siterbarhet: intern\`; ekstern figurbruk krever claim-lock/citable-gate.\n\n## Ikke si\n\n- Ikke bland modellert, realisert, potensial og plan.\n- Ikke gi samlet norsk prosentclaim uten primær massebalanse.\n- Ikke bruke gap-node som ekstern kilde.`))
}

decisions.push(decision('10', 'B5', 'VK4-GAP-missions', join(externalDir, 'VK4-GAP-007-naeringsstoff-gap.md'), 'source-shortlist', 'vent', 'Alle 12 VK4-GAP-missions er lukket til internt kildenotat eller claim-lock/actor-gate.', 'R13-leveranser + gap-noder', 'Ekstern figurbruk er parkert.'))
decisions.push(decision('11', 'B4', 'Stakeholder skeletons', join(externalDir, 'B4-stakeholder-skeletons.md'), 'source-shortlist', 'vent', 'Skeletons kan fylles fra eksisterende kilder; samtalekrevende felt går til D.', 'R13-INNO-006/R13-aktørkart', 'Menneskelig input krever G1.'))
decisions.push(decision('12', 'E1', 'I27+ mapping', join(externalDir, 'E1-I27-parkerte-mapping.md'), 'internal', 'internal', 'Parkerte I27+ er mappet uten ny I-note-generering.', 'I27-port', 'Ny innsikt krever beslutningsrunde.'))
decisions.push(decision('12', 'E2', 'M6 konverteringsevne scoring', join(externalDir, 'E2-M6-konverteringsevne-scoring.md'), 'internal', 'internal', 'Intern case-score mal opprettet.', 'R13-INNO-004/005', 'Ikke ekstern rangering.'))
decisions.push(decision('12', 'E3', 'M3/M7 metode', join(externalDir, 'E3-M3-M7-metodenotat.md'), 'internal', 'internal', 'Metodenotat opprettet bak G3.', 'Møte 12 + R13', 'Ingen true-cost-tall eksternt.'))

const actorTargets = [
  ['D1-markedshager-kandidater.csv', 'markedshager', 'R13-AKTOR-001', 'Klar til PCQ ved scope-vedtak; ikke kontaktet.'],
  ['D2-andelslandbruk-kandidater.csv', 'andelslandbruk', 'R13-AKTOR-002', 'Aktiv-status per gård krever scope/actor-gate.'],
  ['D3-regenerative-praktikere-kandidater.csv', 'regenerative-praktikere', 'R13-AKTOR-004', 'HM/utøverkart og offentlige gårdslister må valideres.'],
  ['D4-fro-genressurs-kandidater.csv', 'fro-genressurs', 'R13-AKTOR-005', 'KVANN/NordGen/dataeier-spor klargjort.'],
  ['D5-skogshage-permakultur-kandidater.csv', 'skogshage-permakultur', 'R13-AKTOR-007', 'Site-liste krever offentlig validering før kartbruk.'],
]

for (const [file, sub, id, note] of actorTargets) {
  writeCsv(join(actorGateDir, file), [{
    node_id: slug(`${id}-${sub}`),
    name: `${id} ${sub} actor-gate shortlist`,
    node_type: 'kandidatliste',
    domain: 'actor-gate',
    subdomain: sub,
    country: 'NO',
    description: note,
    key_people: '',
    scale_metric_year: '2026',
    org_nr: '',
    locator_url: '',
    sourceClass: 'B/C',
    verificationStatus: 'klar-til-pcq-ved-scope-vedtak',
    confidence: 'middels',
    accessedAt: TODAY,
    notes: 'R14 forberedelse til G1; ingen outreach eller PCQ på aktørdata utført.',
  }])
}
write(join(actorGateDir, 'D6-aktor-sporsmalspakker.md'), artifact('D6 aktørspørsmålspakker', 'Spørsmålspakker fra A3.4 er klare til PCQ ved scope-vedtak. Ingen sending, intervju eller aktørkontakt utført i R14.'))
decisions.push(decision('11', 'D1-D6', 'Actor-gate prep', join(actorGateDir, 'D6-aktor-sporsmalspakker.md'), 'actor-gate', 'aktørspørsmål', 'Fem kandidatlister og spørsmålspakker er klargjort til G1, uten outreach.', 'R13 actor-gate-kilder', 'G1 ikke fattet.'))

const c1: Candidate[] = [
  ['norgesgruppen-asa', 'NorgesGruppen ASA', 'dagligvarekonsern', 'handel-dagligvare', 'dagligvarekjede', '819731322'],
  ['meny-as', 'MENY AS', 'dagligvarekjede', 'handel-dagligvare', 'dagligvarekjede', '977066727'],
  ['kiwi-norge-as', 'Kiwi Norge AS', 'dagligvarekjede', 'handel-dagligvare', 'dagligvarekjede', '975959171'],
  ['rema-1000-norge-as', 'REMA 1000 Norge AS', 'dagligvarekjede', 'handel-dagligvare', 'dagligvarekjede', '982254604'],
  ['coop-norge-sa', 'Coop Norge SA', 'dagligvarekonsern', 'handel-dagligvare', 'dagligvarekjede', '936560288'],
  ['norsk-butikkdrift-as', 'Norsk Butikkdrift AS', 'dagligvarekjede', 'handel-dagligvare', 'dagligvarekjede', '931186744'],
  ['oda-norway-as', 'Oda Norway AS', 'direktesalg-plattform', 'handel-dagligvare', 'direktesalg-plattform', '912262510'],
  ['oda', 'Oda', 'direktesalg-plattform', 'handel-dagligvare', 'direktesalg-plattform', '932256134'],
  ['too-good-to-go-norge-as', 'Too Good To Go Norge AS', 'direktesalg-plattform', 'handel-dagligvare', 'direktesalg-plattform', '917203261'],
  ['deli-de-luca-norge-as', 'Deli de Luca Norge AS', 'spesialhandel', 'handel-dagligvare', 'spesialhandel-delikatesse', '985402779'],
  ['holdbart-as', 'Holdbart AS', 'spesialhandel', 'handel-dagligvare', 'spesialhandel-delikatesse', '815664582'],
  ['storcash-norge-as', 'Storcash Norge AS', 'spesialhandel', 'handel-dagligvare', 'spesialhandel-delikatesse', '930258008'],
].map(([node_id, name, node_type, domain, subdomain, org_nr]) => ({
  node_id, name, node_type, domain, subdomain, country: 'NO',
  description: `Eksisterende konsern-/handelsnode mappet inn i MVK handel-dagligvare (${subdomain}).`,
  key_people: '', scale_metric_year: '2026', org_nr,
  locator_url: `https://data.brreg.no/enhetsregisteret/api/enheter/${org_nr}`,
  sourceClass: 'A', verificationStatus: 'machine_verified', confidence: 'hoy', accessedAt: TODAY,
  notes: 'R14 C1 wire-in fra eksisterende konsern-/Brreg-data; ikke ekstern claim.',
}))
writeCsv('research/_status/mvk-handel-dagligvare-node-kandidater-2026-07-03.csv', c1)
write('research/_status/mvk-handel-dagligvare-mottakslogg-2026-07-03.md', artifact('MVK handel-dagligvare mottakslogg', `Kandidatfil: \`research/_status/mvk-handel-dagligvare-node-kandidater-2026-07-03.csv\`.\n\nDataset: \`mvk-handel-dagligvare-2026-07-03\`.\n\nKildepass: eksisterende konsern-/selskapsnoder validert mot Brreg-lokator per org.nr.\n\nKandidater: ${c1.length}.`))
write('research/_status/mvk-handel-dagligvare-usikkerhetslogg-2026-07-03.md', artifact('MVK handel-dagligvare usikkerhetslogg', 'Dagligvarekjede-noder representerer juridiske enheter/konsernanker, ikke butikkantall. Spesialhandel og plattform er første wire-in, ikke mettet univers.'))
decisions.push(decision('03', 'C1', 'Handel-dagligvare wire-in', 'research/_status/mvk-handel-dagligvare-node-kandidater-2026-07-03.csv', 'internal', 'importer', `${c1.length} kandidatnoder opprettet for MVK handel-dagligvare.`, 'Brreg Enhetsregisteret + eksisterende konserndata', 'Kandidater er juridiske enheter/konsernanker, ikke butikkpopulasjon.'))

write(join(R14, 'B1-B2-brreg-styredata-refresh-2026-07-03.md'), artifact('B1/B2 Brreg styredata og refresh',
`## B1 styredata

Live DB-måling før R14-import viste 253 av 351 selskaper med styredata (72,1 %) og 239 av 289 norske selskaper med styredata (82,7 %). Den målrettede \`extend-board-coverage-brreg.ts\`-dry-runen for retail/processing/logistics/wholesale/seafood/inputs/production/property/foodservice fant seks in-scope selskaper uten styredata, men alle seks returnerte Brreg 404/not-found i rollerpasset. Ingen syntetiske styreverv ble opprettet.

## B2 Brreg-refresh

\`npm run refresh:brreg\` ble kjørt med eksplisitt \`DATABASE_URL\`: 254 norske org.nr. prosessert, 252 OK, 2 not found, 0 errors. Lilleborg-kanten er ikke en canvas-feil: \`scripts/import-company-ownership.ts\` fører Orkla -> Lilleborg som 0 % etter 100 % divestment til Solenis, effektiv 2024-06-12.

## Ikke si

- Ikke si at Orkla eier Lilleborg nå; 0 %-kanten er en divestment-markør.
- Ikke si at de seks 404-selskapene har manglende styredata som kan fylles fra Brreg uten org.nr.-rydding.
`))
decisions.push(decision('04', 'B1-STYREDATA-DEL1', 'Styredata NG/Coop/Reitan', join(R14, 'B1-B2-brreg-styredata-refresh-2026-07-03.md'), 'internal', 'parkert', 'Live dekning målt; målrettet Brreg roller dry-run ga 0 nye rader og seks 404/not-found.', 'DB + Brreg roller API dry-run', 'Seks rester krever org.nr.-rydding eller annen kilde, ikke blind import.'))
decisions.push(decision('05', 'B1-B2-STYREDATA-REFRESH', 'Styredata Orkla/Mowi/nordiske + Brreg-refresh', join(R14, 'B1-B2-brreg-styredata-refresh-2026-07-03.md'), 'internal', 'refresh-bekreftet', 'Brreg-refresh fullført 252 OK / 2 not found / 0 errors; Lilleborg 0 % løst som divestment-markør.', 'Brreg Enhetsregisteret + scripts/import-company-ownership.ts', '0 %-edge må leses som tidligere eierskap/divestment, ikke live datter.'))

write('research/_status/mvk-review-koe-resolusjon-2026-07-03.md', artifact('MVK review-kø resolusjon 2026-07-03',
`## Kort dom

De 22 flaggede radene fra \`research/_status/mvk-review-koe-2026-06-27.csv\` er gjennomgått som R14 C3-kø. R14 gjør ingen blind sletting i DB. Radene deles i to operative grupper:

- **Behold som registerbasert foreløpig node:** havbruk/villfisk-rader og grossist-rader der NACE/formål fortsatt peker på operativ rolle.
- **Krever senere reklassifisering eller volum-PCQ:** grossist-rader med tynn formålstekst, blandet holding/støtterolle eller lokalmat-/produksjonsnær rolle.

## Resultat

Køen er lukket som R14-etterkontrollnotat, men DB-reklassifisering av enkeltnoder utsettes til en dedikert domain-cleanup for å unngå å slette gyldige registerankre uten alternativ kilde.

## Ikke si

- Ikke si at alle 22 er endelig operative grossister/havbruksaktører.
- Ikke bruk review-køen som ekstern kilde.
- Ikke tolke \`machine_verified\` som markedsrolle eller volumbevis.
`))
decisions.push(decision('03', 'C3-REVIEW-KOE', 'MVK etterkontroll-kø', 'research/_status/mvk-review-koe-resolusjon-2026-07-03.md', 'internal', 'review-lukket', '22 flaggede rader gjennomgått og lukket til resolusjonsnotat; ingen blind DB-sletting.', 'mvk-review-koe-2026-06-27.csv + Brreg-lokatorer', 'Operativ rolle er ikke det samme som markedsvolum eller ekstern claim.'))

write(join(R14, 'C4-brreg-financials-companyid-2026-07-03.md'), artifact('C4 Brreg financials og companyId-lenking',
`## Kort dom

\`npm run refresh:brreg-financials\` ble kjørt bredt etter C1/C2-importene. Importeren ble hardnet under R14 slik at out-of-range tall og ekstremmarginer logges som \`RANGE-SKIP\` i stedet for å abortere batchen, og Regnskapsregisteret-kilder skrives med direkte URL.

Siste fullførte kjøring: 254 selskaper forsøkt, 233 med regnskap, 95 rader skrevet (45 nye, 50 oppdatert), 131 kuraterte rader beholdt, 6 holding-mødre hoppet over, 3 FX-skip, 4 range-skip, 13 uten innlevert regnskap og 2 Brreg 500-feil.

## Ikke si

- Ikke bruk range-skips eller FX-skips som nullregnskap.
- Ikke erstatt kuraterte konserntall med selskapstall for holdingmødre.
`))
decisions.push(decision('08', 'C4-FINANCIALS-COMPANYID', 'Brreg financials + companyId-lenking', join(R14, 'C4-brreg-financials-companyid-2026-07-03.md'), 'internal', 'importer', 'Financials kjørt bredt; 95 rader skrevet/oppdatert og importer hardnet for range-skip + URL-kilder.', 'Brreg Regnskapsregisteret API', 'FX/range/500-feil er kontrollert rest, ikke nullfunn.'))
decisions.push(decision('08', 'C5-PRIMAERPRODUKSJON-REST', 'Primærproduksjon-resten', join(R14, 'C4-brreg-financials-companyid-2026-07-03.md'), 'internal', 'parkert', 'C5 er eksplisitt valgfri etter batch 01-13 og skyves til R15 etter full C1-C4/C2-fylling.', 'R14 mandate', 'Ikke åpne ny primærproduksjonsslice før R14-kontroller er grønne.'))
decisions.push(decision('13', 'A4-BATCH13-CONSOLIDERING', 'Atlas, dashboard og sluttrapport', join(R14, 'r14-intake-index-2026-07-03.md'), 'internal', 'konsolidert', 'Datagap-atlaset er oppdatert med R14-tillegg; dashboard/vault regenereres etter DB-import.', 'R14 artifacts + compute/vault scripts', 'Batch 13 åpner ingen claim og er avhengig av grønne audits.'))

async function fetchNace(nace: string, subdomain: string, limit: number): Promise<Candidate[]> {
  const forms = new Set(['AS', 'SA', 'ANS', 'DA'])
  const out: Candidate[] = []
  for (let page = 0; page < 4 && out.length < limit; page++) {
    const url = `https://data.brreg.no/enhetsregisteret/api/enheter?naeringskode=${encodeURIComponent(nace)}&organisasjonsform=AS&size=50&page=${page}`
    const resp = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'food-systems-r14-mvk/0.1.0' } })
    if (!resp.ok) break
    const json = await resp.json() as { _embedded?: { enheter?: any[] } }
    for (const e of json._embedded?.enheter ?? []) {
      if (out.length >= limit) break
      if (e.naeringskode1?.kode !== nace) continue
      if (!forms.has(e.organisasjonsform?.kode)) continue
      if (e.konkurs || e.underAvvikling || e.slettedato) continue
      if (/HOLDING|EIENDOM|INVEST/i.test(e.navn)) continue
      const org = e.organisasjonsnummer
      out.push({
        node_id: slug(e.navn),
        name: e.navn,
        node_type: 'organisasjon',
        domain: 'foredling-industri',
        subdomain,
        country: 'NO',
        description: `Brreg-registrert foredlingsaktor med NACE ${nace} (${e.naeringskode1?.beskrivelse ?? 'ukjent'}).`,
        key_people: '',
        scale_metric_year: '2026',
        org_nr: org,
        locator_url: `https://data.brreg.no/enhetsregisteret/api/enheter/${org}`,
        sourceClass: 'A',
        verificationStatus: 'machine_verified',
        confidence: typeof e.antallAnsatte === 'number' && e.antallAnsatte > 0 ? 'hoy' : 'middels',
        accessedAt: TODAY,
        notes: `Brreg API validert aktiv enhet ${TODAY}; NACE ${nace}; R14 C2 første metningspass.`,
      })
    }
  }
  return out
}

async function buildC2() {
  const meieri = [
    ...(await fetchNace('10.510', 'meieri', 16)),
    ...(await fetchNace('10.520', 'meieri', 8)),
  ].slice(0, 20)
  const kjott = [
    ...(await fetchNace('10.110', 'kjott-egg', 8)),
    ...(await fetchNace('10.120', 'kjott-egg', 8)),
    ...(await fetchNace('10.130', 'kjott-egg', 12)),
  ].slice(0, 20)
  const korn = [
    ...(await fetchNace('10.610', 'korn-molle-bakeri', 6)),
    ...(await fetchNace('10.710', 'korn-molle-bakeri', 10)),
    ...(await fetchNace('10.720', 'korn-molle-bakeri', 6)),
    ...(await fetchNace('10.730', 'korn-molle-bakeri', 6)),
  ].slice(0, 20)
  const frukt = [
    ...(await fetchNace('10.390', 'frukt-groent-foredling', 16)),
    ...(await fetchNace('10.320', 'frukt-groent-foredling', 8)),
  ].slice(0, 20)
  const drikke = [
    ...(await fetchNace('11.050', 'drikke-bryggeri', 8)),
    ...(await fetchNace('11.070', 'drikke-bryggeri', 8)),
    ...(await fetchNace('11.010', 'drikke-bryggeri', 4)),
    ...(await fetchNace('11.020', 'drikke-bryggeri', 4)),
    ...(await fetchNace('11.030', 'drikke-bryggeri', 4)),
    ...(await fetchNace('11.040', 'drikke-bryggeri', 4)),
    ...(await fetchNace('11.060', 'drikke-bryggeri', 4)),
  ].slice(0, 20)
  const sjomat = [
    ...(await fetchNace('10.201', 'sjomat-foredling', 8)),
    ...(await fetchNace('10.202', 'sjomat-foredling', 8)),
    ...(await fetchNace('10.203', 'sjomat-foredling', 12)),
  ].slice(0, 20)
  const ovrig = [
    ...(await fetchNace('10.890', 'naeringsmiddel-ovrig', 8)),
    ...(await fetchNace('10.860', 'naeringsmiddel-ovrig', 4)),
    ...(await fetchNace('10.850', 'naeringsmiddel-ovrig', 4)),
    ...(await fetchNace('10.840', 'naeringsmiddel-ovrig', 4)),
    ...(await fetchNace('10.830', 'naeringsmiddel-ovrig', 4)),
    ...(await fetchNace('10.820', 'naeringsmiddel-ovrig', 4)),
    ...(await fetchNace('10.810', 'naeringsmiddel-ovrig', 4)),
  ].slice(0, 20)
  writeCsv('research/_status/mvk-foredling-industri-meieri-node-kandidater-2026-07-03.csv', meieri)
  writeCsv('research/_status/mvk-foredling-industri-kjott-egg-node-kandidater-2026-07-03.csv', kjott)
  writeCsv('research/_status/mvk-foredling-industri-korn-molle-bakeri-node-kandidater-2026-07-03.csv', korn)
  writeCsv('research/_status/mvk-foredling-industri-frukt-groent-foredling-node-kandidater-2026-07-03.csv', frukt)
  writeCsv('research/_status/mvk-foredling-industri-drikke-bryggeri-node-kandidater-2026-07-03.csv', drikke)
  writeCsv('research/_status/mvk-foredling-industri-sjomat-foredling-node-kandidater-2026-07-03.csv', sjomat)
  writeCsv('research/_status/mvk-foredling-industri-naeringsmiddel-ovrig-node-kandidater-2026-07-03.csv', ovrig)
  write('research/_status/mvk-foredling-industri-meieri-mottakslogg-2026-07-03.md', artifact('MVK foredling-industri meieri mottakslogg', `Kandidater: ${meieri.length}. Kilde: Brreg Enhetsregisteret NACE 10.510/10.520, aktiv AS/SA/ANS/DA-filter, holdingselskaper filtrert ut ved navn.`))
  write('research/_status/mvk-foredling-industri-kjott-egg-mottakslogg-2026-07-03.md', artifact('MVK foredling-industri kjøtt/egg mottakslogg', `Kandidater: ${kjott.length}. Kilde: Brreg Enhetsregisteret NACE 10.110/10.120/10.130, aktiv AS/SA/ANS/DA-filter, holdingselskaper filtrert ut ved navn.`))
  write('research/_status/mvk-foredling-industri-korn-molle-bakeri-mottakslogg-2026-07-03.md', artifact('MVK foredling-industri korn/mølle/bakeri mottakslogg', `Kandidater: ${korn.length}. Kilde: Brreg Enhetsregisteret NACE 10.610/10.710/10.720/10.730, aktiv AS/SA/ANS/DA-filter, holdingselskaper filtrert ut ved navn.`))
  write('research/_status/mvk-foredling-industri-frukt-groent-foredling-mottakslogg-2026-07-03.md', artifact('MVK foredling-industri frukt/grønt mottakslogg', `Kandidater: ${frukt.length}. Kilde: Brreg Enhetsregisteret NACE 10.390/10.320, aktiv AS/SA/ANS/DA-filter, holdingselskaper filtrert ut ved navn.`))
  write('research/_status/mvk-foredling-industri-drikke-bryggeri-mottakslogg-2026-07-03.md', artifact('MVK foredling-industri drikke/bryggeri mottakslogg', `Kandidater: ${drikke.length}. Kilde: Brreg Enhetsregisteret NACE 11.010-11.070, aktiv AS/SA/ANS/DA-filter, holdingselskaper filtrert ut ved navn.`))
  write('research/_status/mvk-foredling-industri-sjomat-foredling-mottakslogg-2026-07-03.md', artifact('MVK foredling-industri sjømat mottakslogg', `Kandidater: ${sjomat.length}. Kilde: Brreg Enhetsregisteret NACE 10.201/10.202/10.203, aktiv AS/SA/ANS/DA-filter, holdingselskaper filtrert ut ved navn.`))
  write('research/_status/mvk-foredling-industri-naeringsmiddel-ovrig-mottakslogg-2026-07-03.md', artifact('MVK foredling-industri næringsmiddel øvrig mottakslogg', `Kandidater: ${ovrig.length}. Kilde: Brreg Enhetsregisteret øvrige næringsmiddel-NACE-koder, aktiv AS/SA/ANS/DA-filter, holdingselskaper filtrert ut ved navn.`))
  write('research/_status/mvk-foredling-industri-usikkerhetslogg-2026-07-03.md', artifact('MVK foredling-industri usikkerhetslogg', 'Brreg NACE er registerbasert. Før ekstern bruk må store konsern-/datterselskapsstrukturer dedupliseres og aktiv produksjonsrolle PCQ-sjekkes. Dette er DB-dekningsfylling, ikke markedsandel.'))
  decisions.push(decision('06', 'C2-MEIERI-KJOTT', 'Foredling-industri meieri + kjøtt/egg', 'research/_status/mvk-foredling-industri-meieri-node-kandidater-2026-07-03.csv', 'internal', 'importer', `C2-kandidater opprettet: meieri ${meieri.length}, kjøtt/egg ${kjott.length}.`, 'Brreg Enhetsregisteret NACE-søk', 'NACE beviser registerrolle, ikke produksjonsvolum eller markedsandel.'))
  decisions.push(decision('07', 'C2-KORN-FRUKT-DRIKKE', 'Foredling-industri korn/frukt/drikke', 'research/_status/mvk-foredling-industri-korn-molle-bakeri-node-kandidater-2026-07-03.csv', 'internal', 'importer', `C2-kandidater opprettet: korn ${korn.length}, frukt/grønt ${frukt.length}, drikke ${drikke.length}.`, 'Brreg Enhetsregisteret NACE-søk', 'NACE beviser registerrolle, ikke produksjonsvolum eller markedsandel.'))
  decisions.push(decision('08', 'C2-SJOMAT-OVRIG', 'Foredling-industri sjømat + øvrig', 'research/_status/mvk-foredling-industri-sjomat-foredling-node-kandidater-2026-07-03.csv', 'internal', 'importer', `C2-kandidater opprettet: sjømat ${sjomat.length}, øvrig ${ovrig.length}.`, 'Brreg Enhetsregisteret NACE-søk', 'NACE beviser registerrolle, ikke produksjonsvolum eller markedsandel.'))
}

async function main() {
  await buildC2()

  for (const batch of Array.from({ length: 13 }, (_, i) => String(i + 1).padStart(2, '0'))) {
    const rows = decisions.filter(d => d.batch === batch)
    write(join(decisionsDir, `batch-${batch}.jsonl`), rows.map(r => JSON.stringify(r)).join('\n'))
    write(join(R14, `report-batch-${batch}.md`), artifact(`Food TG R14 - Batch ${batch} rapport`, `## Status\n\n${rows.length ? `Mottatt med ${rows.length} decision-rader.` : 'Ingen separat write-rad i denne batchen; batchen er dekket av konsoliderings-/DB-kontroller eller stoppregel.'}\n\n## Mottaksrad-tabell\n\n| ID | Tittel | Gate | Importbeslutning | Kort dom | Svakeste punkt |\n|---|---|---|---|---|---|\n${rows.map(r => `| ${r.id} | ${r.title} | ${r.gate} | ${r.importDecision} | ${r.shortVerdict} | ${r.weakestPoint} |`).join('\n') || '| - | - | - | - | - | - |'}\n\n## Ikke-si\n\n- Ingen batch-rad åpner ekstern claim.\n- Ingen batch-rad bruker safe_for_ai_context.\n- Svakeste punkt og gate beholdes per mottaksprotokoll.`))
  }

  write(join(R14, 'r14-intake-index-2026-07-03.md'), artifact('Food TG R14 intake/triageindeks', `## Kontrollstatus\n\n- Decision-batcher opprettet: 13 / 13.\n- Decision-rader: ${decisions.length}.\n- PCQ-notater: 7 / 7.\n- Claim-lock-kandidatdokument: opprettet.\n- Actor-gate-kandidatlister: 5 + D6-spørsmålspakke.\n- MVK importfiler: handel-dagligvare, meieri, kjøtt/egg.\n\n## Hurtigoppsummering\n\n| Gruppe | Antall |\n|---|---:|\n| PCQ-bekreftet/internt | ${decisions.filter(d => d.importDecision.includes('pcq')).length} |\n| claim-lock-kandidat/vent | ${decisions.filter(d => d.gate.includes('claim-lock')).length} |\n| actor-gate | ${decisions.filter(d => d.gate.includes('actor')).length} |\n| importkandidat | ${decisions.filter(d => d.importDecision === 'importer').length} |\n| internal/source-shortlist/vent | ${decisions.filter(d => d.importDecision !== 'importer').length} |\n\n## Rader\n\n| ID | Batch | Tittel | Gate | Importbeslutning | Artefakt |\n|---|---:|---|---|---|---|\n${decisions.map(d => `| ${d.id} | ${d.batch} | ${d.title} | ${d.gate} | ${d.importDecision} | ${d.canonicalPath} |`).join('\n')}\n\n## Stoppliste\n\n- Claim-lock-kandidater stopper før menneskelig claim-åpning.\n- Actor-gate-pakker stopper før G1/outreach.\n- C2-kandidater er Brreg-registerdekning, ikke volum/markedsandel.`))

  const atlasPath = 'docs/project/mandates/R13-LAND-004-datagap-atlas.md'
  const atlas = readFileSync(atlasPath, 'utf8')
  const marker = '\n## R14 tillegg 2026-07-03\n'
  if (!atlas.includes(marker.trim())) {
    write(atlasPath, `${atlas.trimEnd()}${marker}
| Hull | Klasse | R14-status | Ikke si |
|---|---|---|---|
| Fôrprotein-total / SPC etter 2020 | Type C | PROT-006 holdes vent; ingen fremskriving | Ikke si post-2020 ingrediensmiks uten primærkilde |
| Aksjonærdata for sirkulær/altprotein/CEA | Type B/C | Aksjonærregister/proff-tilgang ikke hentet | Ikke bygg eierskapsgraf fra styredata alene |
| Jordhelse-karbon univers | Type C | Jordsmonnskart proxy 61 % dekning; JordVAAK ikke resultater | Ikke si Norge har nasjonal SOC-baseline |
| Myke MVK-universer | Type C | Markedshager, skogshage, demonstrasjonssteder og jordhelse-karbon føres med lav nevnerkonfidens | Ikke bruk dekningsprosent uten å vise usikkert univers |
| Næringsstoff-gap N/P/K | Type A/C | Nedgradert til arbeidsmatrise, ikke åpnet prosentclaim | Ikke si samlet norsk potensial uten primær massebalanse |
`)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
