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
const sourceShortlistDir = join(R14, 'source-shortlist')
const datareviewDir = join(R14, 'datareview')

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

function artifact(title: string, body: string, date = TODAY) {
  return `---
tittel: ${title}
dato: ${date}
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

const i27P23Mapping = `P2.3 bekrefter at I28, I29, I30, I32, I33 og I35 fortsatt er parkerte. Ingen nye I-noter genereres i denne runden. Dette er en portvakt, ikke ny innsiktspublisering.

I29-datareview 2026-07-04 ligger i \`research/_status/food-tg-r14/datareview/I29-nodekonsentrasjon-datareview-2026-07-04.md\`. Den konkluderer med at I29 fortsatt skal stå parkert: AP-2 nodekonsentrasjon er nyttig som metode-/lensecaveat, men ikke som egen innsiktsnode eller møtefigur.

I30-datareview 2026-07-04 ligger i \`research/_status/food-tg-r14/datareview/I30-tilskuddskonsentrasjon-datareview-2026-07-04.md\`. Den konkluderer med at AP-3 består kilde-/nevnerreview for intern beslutning, men at ny I30-node fortsatt krever eksplisitt menneskelig godkjenning.

I32-datareview 2026-07-04 ligger i \`research/_status/food-tg-r14/datareview/I32-havbrukskonsentrasjon-datareview-2026-07-04.md\`. Den konkluderer med at AP-6 har eksplisitt havbruksunivers og MTB-nevner nok til intern beslutning, men at ny I32-node og ekstern figurbruk krever eksplisitt menneskelig beslutning og claim-lock.

I33-datareview 2026-07-04 ligger i \`research/_status/food-tg-r14/datareview/I33-prisasymmetri-datareview-2026-07-04.md\`. Den konkluderer med at AP-7 er et nyttig internt prisatferdsfunn for laks→foredling, men at I33 fortsatt skal stå parkert til valutakontroll, kategoriavgrensning og native/prisserie-PCQ er gjort.

I35-source-shortlist 2026-07-04 ligger i \`research/_status/food-tg-r14/source-shortlist/I35-soya-eudr-source-shortlist-2026-07-04.md\`. Den samler import-/EUDR-kilder for fôr/soya-sporet, men åpner ikke I35 som innsiktsnode eller møtefigur.

| ID | Beslutning | Gate før ny node | Stopplinje |
|---|---|---|---|
| I28 | Behold som maktkart-observasjon, ikke egen innsiktsnode. | AP-1 claim-lock med metode, dekningsgrad og node-/brodefinisjon. | Ikke si at BAMA/ASKO er "maktens knutepunkt" uten å vise at dette er intern styregraf og ikke komplett verdikjedeunivers. |
| I29 | Parkert etter datareview; ikke generer egen I-node. | Ny beslutning + AP-2 claim-lock hvis den skal brukes utenfor I37/metodecaveat. | Ikke oversett intern node-/inntekts-HHI til markedsmakt, grafsentralitet eller kontrollclaim. |
| I30 | Datareviewet; klar til menneskelig I-node-beslutning, men ikke generert. | Eksplisitt beslutning + claim-lock hvis den skal brukes utenfor intern cockpit. | Ikke bruk tilskuddskonsentrasjon som enkelaktørkritikk eller samlet landbruksstøtteclaim. |
| I32 | Datareviewet; klar til menneskelig I-node-/claim-lock-beslutning, men ikke generert. | Eksplisitt beslutning + claim-lock med havbruksunivers, MTB-nevner, rollup-forbehold og restråstoffgrense. | Ikke blande havbrukskonsentrasjon med dagligvaretriopol-claim, slaktevolum eller målt restråstoffkontroll. |
| I33 | Datareviewet; fortsatt parkert til prisserie-/valuta-PCQ. | Valutakontroll, SNN102 kategoriavgrensning og native fôr-/prisseriesjekk før ny I-node eller ekstern figur. | Ikke bruke proxy-test eller laks→foredling-PPI som dokumentert fôr→oppdrett-asymmetri, marginclaim eller intensjon. |
| I35 | Source-shortlistet; fortsatt parkert til menneskelig I-node-/claim-lock-beslutning. | Eksplisitt formulering + EUDR-, SSB- og aktørscope claim-lock. | Ikke si at EUDR automatisk gjør norsk fôr/import til dokumentert sårbarhetsakse. |`

const i29DatareviewBody = `## Kort dom

I29 skal fortsatt være parkert. AP-2 nodekonsentrasjon er verdifull som metode-/lensecaveat: den viser hvorfor n-følsom intern inntekts-HHI ikke kan brukes som markedsmakt-ranking. Det er ikke grunnlag for egen I29-innsiktsnode eller møtefigur nå.

## Reviewgrunnlag

| Kilde | Rolle i review |
|---|---|
| \`docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md\` | Viser at intern inntekts-HHI er n-følsom og ikke sammenlignbar på tvers av noder. |
| \`research/analyse/ap2-nodekonsentrasjon.json\` | Råaggregat for den interne AP-2-kjøringen. |
| \`docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md\` | Senere markeds-HHI-runde som skiller ekte markedskonsentrasjon fra AP-2s interne inntekts-HHI. |
| \`Food Systems Obsidian/10 Innsiktskart/Innsikter/I37 Maktkartet må leses gjennom fire linser.md\` | Tryggere hjem for lensepoenget uten ny I29-node. |

## Datareview

| Kriterium | Status | Konsekvens |
|---|---|---|
| Graf-/nodeunivers eksplisitt | Delvis. AP-2 oppgir 173/275 med inntekt og 66/275 med eierdata. | Bruk som intern deknings- og metodeindikator, ikke som komplett univers. |
| Terskel definert | Ikke egnet for nodeinntekts-HHI på tvers. DOJ/FTC-lignende HHI-terskler gjelder marked, ikke denne interne populasjonen. | Ikke klassifiser noder som "mest konsentrert" fra AP-2. |
| Reproduserbar beregning | Ja, via \`scripts/analyze-node-concentration.ts\` og tester. | Reproduserbarhet er nok for intern audit, ikke for ekstern claim. |
| Publiserbar formulering | Nei som I29. Ja som caveat: "lensen avgjør hva du ser". | Bruk i I37/maktkart-metode, ikke ny innsiktsnode. |

## Beslutning

- I29 forblir parkert.
- Ingen \`Food Systems Obsidian/10 Innsiktskart/Innsikter/I29 ...\` skal genereres i denne runden.
- AP-2 kan siteres internt som metodecaveat i I37/maktkartet.
- En senere I29 kan bare åpnes etter eksplisitt ny beslutning og AP-2 claim-lock med tydelig univers, nevner, år og markeds-/inntekts-HHI-skille.

## Ikke si

- Ikke si at nodekonsentrasjon viser hvor "makt ligger" som ekstern påstand.
- Ikke oversett AP-2s interne inntekts-HHI til markedskonsentrasjon.
- Ikke bruk små-n-noder som ranking.
- Ikke generer I29 uten ny menneskelig beslutning.
`

const i30DatareviewBody = `## Kort dom

I30 består AP-3 source review for intern beslutning: kilde, ordningsnevner, mottakerpopulasjon, år og stoppspråk er eksplisitt nok til at menneskelig beslutningseier kan vurdere en intern I30-node. Det skal likevel ikke genereres ny innsiktsnote automatisk i denne runden.

## Reviewgrunnlag

| Kilde | Rolle i review |
|---|---|
| \`docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md\` | Hovedfunn og claim-lock-utkast for AP-3. |
| \`research/analyse/ap3-tilskuddskonsentrasjon.json\` | Råaggregat for Gini, Lorenz, toppandel og ordningsfordeling. |
| \`scripts/analyze-subsidy-concentration.ts\` | Reproduserbar beregning og kolonneresolver for 2024-fiksen. |
| \`tests/scripts/analyze-subsidy-concentration.test.ts\` | Enhetstester for Gini/Lorenz/toppandel og 2024-prosaalias. |
| \`Food Systems Obsidian/10 Innsiktskart/Innsikter/I37 Maktkartet må leses gjennom fire linser.md\` | Trygg eksisterende plass for AP-3 som én av fire linser. |

## Datareview

| Kriterium | Status | Konsekvens |
|---|---|---|
| Ordningsnevner eksplisitt | Ja. Gjelder produksjons- og avløsertilskudd, ikke samlet landbruksstøtte. | Kan ikke brukes som total støtte- eller fordelingspolitikkclaim. |
| Mottakerpopulasjon eksplisitt | Ja. Sum per orgnr/år på mottakernivå. | Ikke les som transaksjoner, persondata eller direkte gårdsstørrelse. |
| År og kompletthet | Ja for 2022-2024 etter 2024-kolonnefiks. | 2024 kan brukes internt med fikscaveat, men ikke som dramatisk trend. |
| Geografisk caveat | Ja. Kommune-Gini er jevnere enn mottaker-Gini. | Ikke si at pengene geografisk er like konsentrert som mottakere. |
| Publiserbar formulering | Delvis. Internt: "moderat, strukturdrevet konsentrasjon". Eksternt: claim-lock først. | I30 kan bli intern beslutningsnode, men ikke ekstern figur uten ny gate. |

## Beslutning

- I30 er datareviewet og klar for eksplisitt menneskelig I-node-beslutning.
- Ingen \`Food Systems Obsidian/10 Innsiktskart/Innsikter/I30 ...\` skal genereres automatisk i denne runden.
- AP-3 kan fortsatt brukes i I37 som én linse i maktkartet.
- En senere I30 bør bare åpnes som intern cockpit-node eller claim-locket AP-3-uttak med synlig ordningsnevner, mottakerpopulasjon, år og strukturforbehold.

## Ikke si

- Ikke si at tilskudd er "kapret av de store".
- Ikke bruk AP-3 som enkelaktørkritikk.
- Ikke presenter produksjons- og avløsertilskudd som samlet landbruksstøtte.
- Ikke skjul at konsentrasjonen delvis følger gårdsstruktur og ordningsdesign.
- Ikke generer I30 uten eksplisitt menneskelig beslutning.
`

const i32DatareviewBody = `## Kort dom

I32 er datareviewet og kan gå til eksplisitt menneskelig I-node-/claim-lock-beslutning. AP-6 er sterkere enn en ren proxy fordi havbruksunivers, kilde, MTB-nevner og stopplinjer er eksplisitte. Det skal likevel ikke genereres ny I32-innsiktsnote automatisk, og ekstern bruk krever claim-lock med tydelig univers, dato, kilde, nevner og restforbehold.

## Reviewgrunnlag

| Kilde | Rolle i review |
|---|---|
| \`docs/project/analysis/food-tg-ap6-havbrukskonsentrasjon-funn-2026-06-14.md\` | Hovedanalyse, tallgrunnlag og claim-lock-utkast for havbrukskonsentrasjon. |
| \`scripts/import-akvakulturregister.ts\` | Kanonisk importsti for Fiskeridirektoratets Akvakulturregister. |
| \`public/data/food-systems/no/aquaculture_sites.geojson\` | Lokalitetsunivers; nyttig som dekning, men uten operatørfelt. |
| \`docs/project/figures/food-tg-2026-06-15/fig-ap6-havbruk-konsentrasjon.svg\` | Intern figurflate for AP-6; ikke ekstern uten claim-lock. |
| \`docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md\` | Kontrast som viser at AP-6 ikke må blandes med AP-2s interne node-HHI. |

## Datareview

| Kriterium | Status | Konsekvens |
|---|---|---|
| Havbruksunivers eksplisitt | Ja. Gjelder norsk laks-/ørretoppdrett, kommersiell matfisk og særskilt sjø/hav-basert MTB. | Kan brukes som havbruksspesifikk beslutningsflate, ikke som generell matmakt- eller dagligvaretriopol-claim. |
| Nevner eksplisitt | Ja. MTB er maksimalt tillatt biomasse, ikke slaktevolum, omsetning eller lokalitetstelling. | Claim kan handle om strukturell kapasitet/posisjon, ikke målt produksjon eller markedssalg. |
| Land-RAS/offshore skille | Ja. AP-6 viser at total-MTB inkl. land/offshore kan fortynne sjøbasert konsentrasjon. | Bruk skillet som metodepoeng; ikke merk land/offshore-tillatelser som inaktive uten refresh. |
| Eier-/konsernrollup | Delvis. Brreg-stikkprøve bekrefter aktive enheter og navn-rollup, men ikke eierandels-% eller ultimat eierskap. | Ikke si Aksjonærregister-bekreftet; AP-5/Aksjonærregister trengs før eierandelsclaim. |
| Restråstoffkobling | Delvis. Nasjonalt/akvakulturvolum er delvis kildebelagt, men per-aktør restråstofftonnasje er \`needs-data\`. | Ikke gjør CR4 MTB til kildebelagt CR4 for restråstoffvolum; kall det strukturell inferens hvis det brukes. |
| Publiserbar formulering | Delvis. Internt: sjøbasert MTB er mer konsentrert enn total-MTB. Eksternt: claim-lock først. | I32 kan bli intern cockpit-node eller claim-locket AP-6-uttak, ikke automatisk innsiktsnote. |

## Beslutning

- I32 er datareviewet og klar til eksplisitt menneskelig I-node-/claim-lock-beslutning.
- Ingen \`Food Systems Obsidian/10 Innsiktskart/Innsikter/I32 ...\` skal genereres automatisk i denne runden.
- AP-6 kan vurderes som intern cockpit-node fordi univers, kilde og MTB-nevner er tydelige.
- Ekstern bruk må claim-locke nøyaktig formulering, dato, Fiskeridirektoratet-kilde, sjøbasert/total-MTB-skille, Brreg-rollup-forbehold og restråstoffgrense.

## Ikke si

- Ikke bland havbrukskonsentrasjon med dagligvaretriopol-claim.
- Ikke si at MTB er faktisk slaktevolum, omsetning eller restråstofftonn.
- Ikke behandle lokalitetstelling, MTB og restråstoffvolum som samme metric.
- Ikke si at fire aktører kontrollerer 57 % av restråstoffvolumet som kildebelagt faktum; det er høyst en flagget strukturell inferens uten per-aktør data.
- Ikke si at eierskapsprosent eller ultimate owner er Aksjonærregister-bekreftet.
- Ikke generer I32 uten eksplisitt menneskelig beslutning.`

const i33DatareviewBody = `## Kort dom

I33 skal fortsatt være parkert etter datareview. AP-7 er et nyttig internt prisatferdsfunn for laks→foredling, med eksplisitte SSB-serier og klar metodepresedens. Men det er ikke nok til ny I33-innsiktsnode eller ekstern møtefigur: valuta er ikke kontrollert, nedstrømsserien er bredere enn laks, og det opprinnelige fôr→oppdrett-leddet mangler native månedlig fôr-/prisserie.

## Reviewgrunnlag

| Kilde | Rolle i review |
|---|---|
| \`docs/project/analysis/food-tg-ap7-prisasymmetri-funn-2026-06-14.md\` | Hovedanalyse, claim-lock-utkast, valuta-/kategori-forbehold og needs-data for fôr→oppdrett. |
| \`research/norge/kvantitativ-dybdeanalyse.md\` | Metodepresedens for asymmetri-testen, brukt som intern sammenligningsramme. |
| SSB 03024, \`https://data.ssb.no/api/v0/no/table/03024/\` | Oppstrøms laks, eksport av oppalen laks, kilopris. |
| SSB 12462, \`https://data.ssb.no/api/v0/no/table/12462/\` | Nedstrøms PPI SNN102 for bearbeiding fisk, skalldyr og bløtdyr. |
| \`docs/project/figures/food-tg-2026-06-15/fig-ap7-pris-asymmetri.svg\` | Intern figurflate; ikke ekstern uten claim-lock og valutakontroll. |

## Datareview

| Kriterium | Status | Konsekvens |
|---|---|---|
| Testet domene eksplisitt | Ja. AP-7 tester laks→foredling for 2019M01-2025M12. | Kan ikke generaliseres til grønt, dagligvare, fôr→oppdrett eller hele havbruksøkonomien. |
| Serietilpasning | Delvis. Oppstrøms er laksespesifikk, nedstrøms er SNN102 for all fisk/skall/bløtdyr. | Ikke les funnet som ren laksespesifikk margin- eller markedsmaktclaim. |
| Valutakontroll | Ikke lukket. AP-7 sier eksplisitt at NOK-svekkelse kan løfte eksport-PPI. | Ekstern bruk krever valutadeflatering, USD/EUR-kontroll eller separat hjemmemarkedsserie. |
| Native fôr-/prisseriesjekk | Ikke lukket. Norsk månedlig fôr-PPI finnes ikke i SSB-underlaget; fôr→oppdrett er proxy-testbart, men ikke native tilfredsstilt. | I33 må ikke bli fôr/import- eller fôrkost-asymmetri-node uten ny PCQ. |
| Metode/reproduserbarhet | Delvis. NARDL/distribuert-lag er subagent-beregnet og internt dokumentert; 2025-illustrasjonen er enklere å etterprøve. | Bruk internt som metode-/prisatferdsindikator; reproduser beregning før ekstern claim. |
| Publiserbar formulering | Nei som I33 nå. Ja som caveat: "AP-7 peker på asymmetrisk prisatferd, men svakeste punkt styrer gate." | Behold i researchkø/claim-lock, ikke ny Obsidian-node eller møtefigur. |

## Beslutning

- I33 forblir parkert etter datareview.
- Ingen \`Food Systems Obsidian/10 Innsiktskart/Innsikter/I33 ...\` skal genereres i denne runden.
- AP-7 kan brukes internt som prisatferds-/metodecaveat, men ikke som ekstern margin-, intensjons- eller fôr→oppdrett-claim.
- En senere I33 kan bare åpnes etter eksplisitt ny beslutning og PCQ/claim-lock som lukker valuta, SNN102-kategori, metode-reproduksjon og native/proxy-seriegrense.

## Ikke si

- Ikke si at proxy-testen dokumenterer fôr→oppdrett-prisasymmetri.
- Ikke si at stigende foredlings-PPI mens råpris faller beviser marginbygging, intensjon eller misbruk av markedsmakt.
- Ikke behandle SNN102 som en ren lakseforedlingsserie.
- Ikke generaliser AP-7 til dagligvare, grønt, fôrkjede eller andre domener.
- Ikke bruke AP-7 eksternt uten valutakontroll, kategoriavgrensning og claim-lock.
- Ikke generer I33 uten eksplisitt menneskelig beslutning.`

const i35SourceShortlistBody = `## Kort dom

I35 skal fortsatt være parkert. Repoet har nok kildegrunnlag til å lage en trygg import-/EUDR source-shortlist for fôr/soya-sporet, men ikke nok til å generere en ny I35-innsiktsnode eller møtefigur automatisk. Neste menneskelige beslutning må velge presis formulering, varestrøm og aktørscope før claim-lock.

## Kontrollgrunnlag

| Kilde | Rolle i I35 | Status | Caveat |
|---|---|---|---|
| \`content/hvitbok/02-nordisk-sirkularitet.md\` | Syntese for soya-sporbarhet, EUDR, Norge/EU-asymmetri og Norge-Brasil-aksen. | Brukbar som intern syntese. | Må ikke bli primærkilde alene. |
| \`research/v1-2/phase2-primaersjekker.md\` | Primærsjekk av IFRO/KU 6 %-tall, EUDR Annex I og norsk gjennomføringsstatus. | Sterkt repo-anker. | Dato- og regelverksstatus må refreshes før ekstern bruk. |
| \`research/v1-2/phase8-T3-ekstern-vs-intern-diff.md\` | Viser hvorfor CD-3 ble strammet fra "soya-laundering" til EU-norsk asymmetri/kundekrav-arbitrasje. | Godt stoppspråk. | Ikke bruk som ekstern kilde. |
| EU-kommisjonen, \`https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en\` | Offisiell EUDR-tidslinje. | Live-sjekket 2026-07-04: store/mellomstore aktører 2026-12-30, små/mikro 2027-06-30. | Frister varierer med aktørstørrelse; dette er EU-regel, ikke norsk gjennomføring. |
| EUR-Lex, \`https://eur-lex.europa.eu/eli/reg/2025/2650/oj/eng\` | Juridisk endringsanker for 2025-forenklinger/fristendringer. | Offisiell lovkilde. | Må brukes sammen med konsolidert Regulation (EU) 2023/1115. |
| Landbruksdirektoratet, \`https://www.landbruksdirektoratet.no/nb/skogbruk/eus-avskogingsforordning-eudr\` | Norsk gjennomføringsstatus og EØS-avgrensning. | Live-sjekket 2026-07-04: norsk gjennomføring holder jordbruksvarer som soya/storfe utenfor. | Må refreshes før ekstern publisering. |
| Regjeringen, \`https://www.regjeringen.no/no/aktuelt/eu-regler-for-redusert-avskoging-sendes-na-pa-horing/id3116303/\` | Hørings-/forskriftsanker for delvis norsk gjennomføring. | Offisiell myndighetskilde. | Høring er prosesskilde, ikke endelig forskriftsvedtak alene. |
| \`public/data/food-systems/handelsakse-norge-brasil.json\` og \`src/lib/row-source-locators.ts\` | SSB 08801/HS-anker for norsk soyabønneimport og Brasil-andel. | Sterk vareimportkilde. | HS-kode viser vareimport, ikke sluttbruk, fôrandel eller leverandørsporbarhet. |
| \`research/_status/food-tg-r13/pcq/R13-GAP-001-importnode-extraction-sheet-2026-06-25.md\` | PCQ for kritiske importnoder. | Brukbar metodeflate for SSB 08801. | Fôrprotein-total og sluttbruk er Type C. |
| \`research/_status/food-tg-r13/r13-intake-index-2026-06-25.md\` / R13-PROT-006 | Fôr-/SPC-anker og mangel på nyere full ressursregnskap. | Nyttig gap-anker. | Ikke fremskriv 2020-fôrregnskap uten ny primærkilde. |

## Source-shortlist

| Delclaim | Minimum kildepakke | Mangler før claim-lock | Stopplinje |
|---|---|---|---|
| Danmark har fysisk sporbarhetsgap for sertifisert soya. | IFRO/KU 2025 via \`research/v1-2/phase2-primaersjekker.md\`. | Avklar at tallet gjelder sertifisert dansk soya, ikke total nordisk/norsk soya. | Ikke overfør 6 %-tallet til Norge eller Norden. |
| EUDR skjerper krav til råvarer som soya på EU-markedet. | EU-kommisjonen + EUR-Lex. | Operatørtype, varekode og markedsplassering må spesifiseres. | Ikke si "EUDR dekker alt fôr" eller "all laks". |
| Norge har delvis EØS-gjennomføring med soya/storfe holdt utenfor. | Landbruksdirektoratet + Regjeringen. | Siste norsk forskrifts-/stortingsstatus må refreshes ved publisering. | Ikke si at Norge er permanent utenfor EUDR-systemet. |
| Norsk soyaimport har Brasil-akse. | SSB 08801/handelsakse-data. | Sluttbruk, leverandørkjede og fôrsegment må kobles med aktør-/bransjekilde. | Ikke si at SSB 08801 beviser fiskefôr eller avskogingsrisiko. |
| Fôr/import kan være sårbarhetsakse. | Kombinasjon av SSB, Nofima/FHF/R13-PROT-006 og aktørdata. | Velg scope: soyabønner, SPC, fiskefôr, husdyrfôr eller hele fôrprotein-totalen. | Ikke gjør "fôr/import" til én samlet dokumentert akse. |

## Beslutning

- I35 er source-shortlistet, men fortsatt parkert.
- Ingen \`Food Systems Obsidian/10 Innsiktskart/Innsikter/I35 ...\` skal genereres i denne runden.
- En senere I35 må velge én presis claim: EU-regel, norsk EØS-avgrensning, norsk vareimport/Brasil-akse eller aktørspesifikk fôrkjede.
- Hver ekstern formulering krever citable/claim-lock med år, varekode, land, aktørtype og tydelig systemgrense.

## Ikke si

- Ikke si at EUDR automatisk gjør norsk fôr/import til dokumentert sårbarhetsakse.
- Ikke si at laks som ferdigprodukt er EUDR-pliktig bare fordi fôret kan inneholde soya.
- Ikke bruk "soya-laundering" som hovedclaim; repoets tryggere formulering er EU-norsk asymmetri og eventuelt kundekrav-/sporbarhetspress.
- Ikke overfør dansk 6 %-sporbarhet til norsk eller nordisk total.
- Ikke bruk SSB 08801 som bevis for sluttbruk i fiskefôr, husdyrfôr eller leverandørsporbarhet.
- Ikke les foreløpige 2025-importtall som trend uten revisjonscaveat.
`

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

P2.2 follow-up 2026-07-04 ligger i \`research/_status/food-tg-r14/source-shortlist/VK4-GAP-007-npk-source-shortlist.md\`. Den er en primærkildekø per strøm og næringsstoff, ikke en claim-åpning.

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

write(join(sourceShortlistDir, 'VK4-GAP-007-npk-source-shortlist.md'), artifact('VK4-GAP-007 N/P/K source-shortlist',
`## Formål

Dette er P2.2 follow-up etter Obsidian-briefing-piloten 2026-07-04. Målet er å gjøre VK4-GAP-007 mer claim-lockbar ved å sortere primærkildekøen per strøm og næringsstoff. Notatet åpner ingen ekstern claim og erstatter ikke claim-lock-tabellen.

## Bruksregel

- Hver celle må merkes som \`realisert\`, \`modellert\`, \`potensial/plan\` eller \`mangler\`.
- N, P og K skal ikke summeres til én prosent eller én KPI.
- Biogassvolum kan bare brukes som aktivitetskontekst, ikke som bevis på næringsretur.
- Svakeste celle styrer gate for hele figuren eller formuleringen.

## Kildekø per strøm

| Prioritet | Strøm | Nåstatus | Primærkildekø | Avklaringsspørsmål | Stopplinje | Neste gate |
|---:|---|---|---|---|---|---|
| 1 | Mineralgjødsel-referanse | Referansegrunnlag for N/P/K, ikke importerstattbar prosent alene. | CL-B-024 / DRO-R4-23 og primær statistikk for mineralgjødsel-N/P/K. | Hvilket år, geografi og enhet skal brukes som denominator? | Ikke kall dette "gjenvinningspotensial". | claim-lock for denominator-tekst |
| 2 | Norsk biorest/digestat | P delvis; samlet realisert N/K-retur mangler. | Landbruksdirektoratet biogasstatistikk 2022, Biogass Norge, anleggs-/bransjerapporter, gjødselvare-/produktdata. | Finnes tonn produkt, N/P/K-innhold og faktisk spredt/solgt mengde i samme systemgrense? | Ikke bruk biogassvolum som næringsretur. | source-shortlist -> PCQ |
| 3 | Oppdrettsslam/fiskeslam | Modellert tap/potensial finnes; nasjonalt realisert aggregat mangler. | NIBIO fiskeslam-notat, Bioretur, HØST/Grønn Vekst/Terramarine/IVAR, Norske utslipp, anleggsrapporter. | Finnes nasjonal serie for samlet innsamlet slam, sluttbruk og N/P/K? | Ikke presenter potensial eller TRL som realisert innsamling. | actor-gate/source-shortlist |
| 4 | Svartvann/avløp/Recolab | Små case-tall for N/P; K ikke produkt. | NSVA/Recolab 2024, SSB kommunalt avløp, NIBIO avløpsslam, VEAS, HIAS. | Er tallene produktmengde, næringsinnhold eller avledet beregning? | Ikke skalere case direkte til Norge. | case-PCQ |
| 5 | Husdyrgjødsel | Stor masse, men plantetilgjengelighet, tap og regionalitet styrer. | NIBIO/Miljødirektoratet gjødsel- og utslippsgrunnlag, jordbruksstatistikk, regionale balanser. | Hvilken andel er faktisk tilgjengelig som substitutt i relevant region og sesong? | Ikke gjør total masse til sirkulær tilgjengelighet. | research mission |
| 6 | Matavfall/forbrenning | Modellnode; K mangler. | SSB avfall, Miljødirektoratet, behandlingsanlegg, forbrennings-/biogassanlegg. | Skill matavfall til biogass, kompost, forbrenning og restfraksjoner. | Ikke bland behandlet volum med N/P/K-retur. | source-shortlist |
| 7 | Svensk digestat/SPCR 120 | Sterk realisert benchmark, ikke norsk nivå. | R12 digestat-notat, SPCR 120 / Avfall Sverige-kilder. | Hvilke metodefelt kan kopieres som måleregime for Norge? | Ikke importer svensk nivå som norsk claim. | benchmark/metode |

## Minimum felt per celle

| Felt | Krav |
|---|---|
| strøm | Mineralgjødsel, norsk biorest/digestat, oppdrettsslam, svartvann/avløp, husdyrgjødsel, matavfall/forbrenning eller benchmark. |
| næringsstoff | N, P eller K. |
| mengde og enhet | Tonn, kg eller konsentrasjon med tydelig omregning. |
| år og geografi | Må være eksplisitt; manglende år/geografi gjør cellen Type C. |
| kildeeier og lokator | Primærkilde foretrekkes; repo-notat kan bare være peker. |
| datastatus | \`realisert\`, \`modellert\`, \`potensial/plan\` eller \`mangler\`. |
| systemgrense | Produktmengde, innsamlet mengde, behandlet mengde, utslipp/tap eller solgt/spredt mengde. |
| agronomisk caveat | Plantetilgjengelighet, forurensning, regelverk og regional matching der relevant. |
| ikke-si | Konkret stopplinje for cellen. |

## Arbeidsrekkefølge

1. Lås mineralgjødsel-referansen som denominator-språk, uten importerstattbar prosent.
2. Finn om norsk biorest/digestat har primær N/K-retur, eller lås cellene som \`mangler\`.
3. Avklar om oppdrettsslam har nasjonalt realisert aggregat; hvis ikke, behold aktør-/anleggsrader internt.
4. Behandle Recolab/avløp som case og metode, ikke skaleringsclaim.
5. Før husdyrgjødsel og matavfall som research missions til regionalitet, plantetilgjengelighet og systemgrense er dokumentert.

## Ikke si

- Ikke si at 25-30 % næringsstoffgap er dokumentert norsk realisert gjenvinningspotensial.
- Ikke summer N, P og K til én prosent eller én KPI.
- Ikke bruk biogassvolum som bevis på næringsretur uten dokumentert digestat-/produktretur.
- Ikke skjul \`mangler\`-celler i figur eller briefing.
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
  decision('02', 'VK4-GAP-007', 'Næringsstoff-gap N/P/K', join(sourceShortlistDir, 'VK4-GAP-007-npk-source-shortlist.md'), 'claim-lock', 'vent', '25-30 %-påstanden er nedgradert til N/P/K-arbeidsmatrise; P2.2 follow-up oppretter primærkildekø per strøm og næringsstoff.', 'DRO-R4-23 + nutrient-loop-realiserte-tonn + fiskeslam-census + gap-node + P2.2 source-shortlist', 'Mangler samlet primær norsk massebalanse for N/P/K, særlig realisert digestat-N/K og nasjonalt oppdrettsslam-aggregat.'),
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
  ['E1-I27-parkerte-mapping.md', 'E1 I27+ parkerte mapping', i27P23Mapping],
  ['E2-M6-konverteringsevne-scoring.md', 'E2 M6 konverteringsevne scoring', 'R13-INNO-004 og R13-INNO-005 kan brukes til intern score per case: skalert, pilot, konkurs/avviklet, eller lab. Score er intern og skal ikke visualiseres eksternt uten case-PCQ.'],
  ['E3-M3-M7-metodenotat.md', 'E3 M3 true-cost og M7 Nexus metode', 'Metoden holdes bak G3: skyggepris-tilnærming, datakrav og valideringsplan kan beskrives internt; tall og anbefalinger brukes ikke eksternt før metodevalidering.'],
]

for (const [file, title, body] of deskDocs) {
  const path = join(externalDir, file)
  const weakestPoint = file === 'E1-I27-parkerte-mapping.md'
    ? 'Svakeste punkt er at hver kandidat blander intern graf-/proxyverdi med mulig ekstern claim. Raden holdes internt til riktig AP/PCQ/claim-lock-gate er lukket.'
    : 'Svakeste punkt er ikke løst til ekstern bruk i R14; raden holdes internt, source-shortlist eller actor-gate etter mandatet.'
  const notToSay = [
    '- Ikke presenter dette som åpnet claim.',
    '- Ikke anta at fravær av offentlig data betyr null-verdi eller null-aktivitet.',
    '- Ikke sende aktørspørsmål før G1.',
    ...(file === 'E1-I27-parkerte-mapping.md' ? ['- Ikke generer I28, I29, I30, I32, I33 eller I35 uten eksplisitt ny beslutning.'] : []),
  ].join('\n')
  write(path, artifact(title, `## Kort dom\n\n${body}\n\n## Sterkeste kilde\n\nRepoets R13-artifact og R14-mandat.\n\n## Svakeste punkt\n\n${weakestPoint}\n\n## Ikke si\n\n${notToSay}`))
}

decisions.push(decision('09', 'A3.1', 'PROT-006 nyere ressursregnskap', join(externalDir, 'A3.1-R13-PROT-006-ressursregnskap.md'), 'PCQ', 'vent', 'Nyere primær ressursregnskap ble ikke åpnet; post-2020 holdes som Type-C/vent.', 'R13-PROT-006', 'Ingen åpen primærserie etter 2020 i kontrollert repo-underlag.'))
decisions.push(decision('09', 'A3.2', 'AKTOR-006 aksjonærdata', join(externalDir, 'A3.2-R13-AKTOR-006-aksjonaerdata.md'), 'PCQ', 'vent', 'Aksjonærdata holdes som tilgangs-/source-shortlist-spor.', 'Brreg rolledata + R13-AKTOR-006', 'Full aksjonærdata er ikke åpent komplett i denne runden.'))
decisions.push(decision('09', 'A3.3', 'OKO-003 jordsmonnskart proxy', join(externalDir, 'A3.3-R13-OKO-003-jordsmonnskart-proxy.md'), 'source-shortlist', 'vent', 'NIBIO jordsmonnskart kan brukes som proxy med 61 %-caveat.', 'R13-OKO-003', 'Proxy er ikke SOC-baseline.'))
decisions.push(decision('09', 'A3.4', 'Aktørspørsmålspakker', join(externalDir, 'A3.4-aktor-sporsmalspakker.md'), 'actor-gate', 'aktørspørsmål', 'Spørsmålspakker opprettet, ikke sendt.', 'R13-WASTE-005/R13-PROT-007/R13-GAP-004/R13-WASTE-002', 'G1 ikke fattet.'))
decisions.push(decision('09', 'B3', 'M&A NG-treet', join(externalDir, 'B3-NG-MA-verifikasjonsrunde.md'), 'source-shortlist', 'vent', 'Verifikasjonsrunde uten akutt importbar endring.', 'Brreg/årsrapport som fremtidig krav', 'Ingen ny A-lokator ført for import.'))

write(join(datareviewDir, 'I29-nodekonsentrasjon-datareview-2026-07-04.md'), artifact('I29 nodekonsentrasjon datareview', i29DatareviewBody, '2026-07-04'))
write(join(datareviewDir, 'I30-tilskuddskonsentrasjon-datareview-2026-07-04.md'), artifact('I30 tilskuddskonsentrasjon datareview', i30DatareviewBody, '2026-07-04'))
write(join(datareviewDir, 'I32-havbrukskonsentrasjon-datareview-2026-07-04.md'), artifact('I32 havbrukskonsentrasjon datareview', i32DatareviewBody, '2026-07-04'))
write(join(datareviewDir, 'I33-prisasymmetri-datareview-2026-07-04.md'), artifact('I33 prisasymmetri datareview', i33DatareviewBody, '2026-07-04'))
write(join(sourceShortlistDir, 'I35-soya-eudr-source-shortlist-2026-07-04.md'), artifact('I35 soya/EUDR source-shortlist', i35SourceShortlistBody, '2026-07-04'))

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
decisions.push(withIkkeSi(
  decision('12', 'E1', 'I27+ mapping', join(externalDir, 'E1-I27-parkerte-mapping.md'), 'internal', 'internal', 'P2.3 holder I28 parkert; I29 og I33 forblir parkert etter datareview, I30 og I32 er datareviewet, og I35 er source-shortlistet uten generering.', 'I27-port + P2.3 datareview + I29/I30/I32/I33 datareview + I35 source-shortlist', 'Hver parkert kandidat trenger egen AP/PCQ/claim-lock-gate før ny innsiktsnode eller møtefigur.'),
  [
    'Ikke generer I28, I29, I30, I32, I33 eller I35 uten eksplisitt ny beslutning.',
    'Ikke oversett intern graf-/proxyverdi til ekstern claim.',
    'Ikke si at EUDR automatisk gjør norsk fôr/import til dokumentert sårbarhetsakse.',
    'Ikke blande havbrukskonsentrasjon med dagligvaretriopol-claim, MTB/slaktevolum eller målt restråstoffkontroll.',
    'Ikke bruke proxy-test eller laks→foredling-PPI som dokumentert fôr→oppdrett-asymmetri, marginclaim eller intensjon.',
    'Ikke bland kapasitet, plan, potensial og realisert volum.',
  ],
))
decisions.push(decision('12', 'E2', 'M6 konverteringsevne scoring', join(externalDir, 'E2-M6-konverteringsevne-scoring.md'), 'internal', 'internal', 'Intern case-score mal opprettet.', 'R13-INNO-004/005', 'Ikke ekstern rangering.'))
decisions.push(decision('12', 'E3', 'M3/M7 metode', join(externalDir, 'E3-M3-M7-metodenotat.md'), 'internal', 'internal', 'Metodenotat opprettet bak G3.', 'Møte 12 + R13', 'Ingen true-cost-tall eksternt.'))

const actorTargets = [
  ['D1-markedshager-kandidater.csv', 'markedshager', 'R13-AKTOR-001', 'Klar til PCQ ved scope-vedtak; ikke kontaktet.'],
  ['D2-andelslandbruk-kandidater.csv', 'andelslandbruk', 'R13-AKTOR-002', 'Aktiv-status per gård krever scope/actor-gate.'],
  ['D3-regenerative-praktikere-kandidater.csv', 'regenerative-praktikere', 'R13-AKTOR-004', 'HM/utøverkart og offentlige gårdslister må valideres.'],
  ['D4-fro-genressurs-kandidater.csv', 'fro-genressurs', 'R13-AKTOR-005', 'KVANN/NordGen/dataeier-spor klargjort.'],
  ['D5-skogshage-permakultur-kandidater.csv', 'skogshage-permakultur', 'R13-AKTOR-007', 'Site-liste krever offentlig validering før kartbruk.'],
]

const actorGateP24Body = `Spørsmålspakker fra A3.4 er klare til PCQ ved scope-vedtak. Ingen sending, intervju eller aktørkontakt utført i R14.

## P2.4 prioritering 2026-07-04

P2.4 velger rekkefølge for actor-gate uten å gjennomføre outreach. Første ask skal være den som låser flest stoppede claims i kartet med lavest tolkningsrisiko.

| Prioritet | Pakke | Første mottakerrolle | Spørsmål før outreach | Stopplinje |
|---:|---|---|---|---|
| 1 | D2 andelslandbruk | Datavokter for aktiv andelslandbruksliste, primært Landbruksdirektoratet/Økologisk Norge-sporet. | Finnes det en aktiv 2026-liste per gård med status, organisasjonsform, start/slutt og offentlig lokator? | Ikke bruk 93 fra 2023 eller eldre R13-rader som nåtidstall. |
| 2 | D4 frø/genressurs | Dataeier/koordinator for KVANN/NordGen-sporet. | Hvilke norske aktører, lokasjoner og bevaringsroller kan bekreftes offentlig uten person-/medlemsdata? | Ikke gjør medlems-/nettverksliste til aktørkart uten kilde- og personvernavklaring. |
| 3 | D1/D3/D5 lokal/regenerativ praksis | Kildeholder for markedshager, regenerative praktikere eller skogshage/permakultur-lister. | Hvilken offentlig liste er mest dekkende, når er den oppdatert, og hva betyr aktiv status? | Ikke map enkeltgårder eller praksisfelt som validerte før listeeier eller primærkilde bekrefter universet. |

## P2.4 til G1

G1-D2 beslutningspakken ligger i \`research/_status/food-tg-r14/actor-gate/G1-D2-andelslandbruk-outreach-beslutningspakke-2026-07-04.md\`. Den gir menneskelig ja/nei/vent-beslutning for D2 først, men åpner ikke outreach alene.

G1-D4 beslutningspakken ligger i \`research/_status/food-tg-r14/actor-gate/G1-D4-fro-genressurs-outreach-beslutningspakke-2026-07-04.md\`. Den gir samme ja/nei/vent-beslutning for frø/genressurs-sporet, men stopper før kontakt og før aktørkart.

G1-D1-D3-D5 beslutningspakken ligger i \`research/_status/food-tg-r14/actor-gate/G1-D1-D3-D5-lokal-regenerativ-outreach-beslutningspakke-2026-07-04.md\`. Den gir samlet ja/nei/vent-beslutning for markedshager, regenerative praktikere og skogshage/permakultur, men stopper før kontakt og før lokalt praksiskart.

## Klar-til-G1 spørsmålspakke

1. Kan dere bekrefte at listen er aktiv per 2026, og hva som er siste oppdateringsdato?
2. Hvilke felt kan deles offentlig: navn, sted, organisasjonsnummer, produksjons-/praksistype, status og kilde-URL?
3. Hvilke rader skal ikke publiseres, enten av personvern-, medlems- eller metodehensyn?
4. Hvilken presis formulering tåler ekstern bruk: "aktiv", "registrert", "historisk", "pilot" eller "ukjent"?
5. Hvem kan godkjenne at dataene brukes i Obsidian/app/briefing, og med hvilken caveat?

## Ikke sendt

- Ingen e-post, intervju, skjema eller annen outreach er gjennomført i P2.4.
- Listen er en prioriterings- og forberedelsesflate, ikke en validering.
- Actor-gate kan bare lukkes etter G1/scope-vedtak og dokumentert svar eller primærkilde.`

const g1D2DecisionPackBody = `## Formål

Dette er en G1-beslutningspakke for D2 andelslandbruk. Den skal gjøre det lett for menneskelig beslutningseier å godkjenne, avvise eller utsette første actor-gate-outreach uten å åpne nye claims.

## Beslutning som trengs

| Valg | Hva det betyr | Når riktig | Neste handling |
|---|---|---|---|
| Godkjenn D2 | D2 kan gå fra forberedelse til kontrollert outreach/PCQ-forberedelse. | Teamet har scope-/G1-vedtak og vil avklare aktiv andelslandbruksliste før ny figur. | Send bare D2-asken, logg svar og bruksrett samme dag. |
| Avvis D2 nå | D2 holdes som historisk/parkert kandidat. | Teamet vil ikke bruke andelslandbruk som nær aktørdata i kommende briefing/figur. | Behold 93/2023 kun som historisk anker med caveat. |
| Vent | Ingen kontakt; mer offentlig kildejakt først. | Det mangler beslutningseier, mottaker eller kildegrunnlag for trygg ask. | Finn offentlig 2026-liste eller tydelig dataeier før ny G1-runde. |

## Anbefalt default

Vent eller godkjenn D2 med smal scope. D2 bør bare åpnes hvis beslutningseier aksepterer at dette er datakvalitetsavklaring, ikke ekstern fortelling, og at svaret kan bli "kan ikke deles".

## Foreslått D2-ask

1. Finnes det en aktiv 2026-liste over andelslandbruk per gård?
2. Hva betyr statusfeltet: aktiv, registrert, historisk, pilot, ukjent eller avviklet?
3. Hvilke felt kan brukes offentlig: navn, kommune/sted, organisasjonsform, eventuell org.nr., start/slutt, status og kilde-URL?
4. Hvilke rader eller felt skal ikke brukes av personvern-, medlems- eller metodehensyn?
5. Hvem kan godkjenne bruken i intern Obsidian/app/briefing, og hvilken caveat må følge?

## Mottakerrolle og avsenderkrav

| Felt | Krav før sending |
|---|---|
| Mottakerrolle | Datavokter for aktiv andelslandbruksliste, primært Landbruksdirektoratet/Økologisk Norge-sporet. |
| Avsender | Menneskelig prosjektansvarlig, ikke automatisert agent. |
| Beslutningslogg | G1-vedtak, dato, beslutningseier og scope må stå i prosjektlogg før sending. |
| Responslogg | Svar, kilde-URL, bruksrett, datostempel, caveat og neste gate logges samme dag. |
| Publiserbarhet | Ingen ekstern bruk før PCQ/claim-lock/citable-gate. |

## Stopplinjer

- Ikke send noe uten eksplisitt G1/scope-vedtak.
- Ikke bruk 93 fra 2023 eller eldre R13-rader som nåtidstall.
- Ikke behandle manglende svar som null funn eller null aktivitet.
- Ikke publiser gårds-/person-/medlemsdata uten eksplisitt offentlig lokator og bruksrett.
- Ikke merk actor-gate som validert før dokumentert svar eller primærkilde finnes.

## Etter svar

| Svarutfall | Gate |
|---|---|
| Offentlig 2026-liste med lokator og bruksrett | PCQ først, deretter eventuell claim-lock for presis formulering. |
| Delvis liste eller metodeforklaring | Intern source-shortlist/PCQ med synlige hull. |
| Nei/kan ikke deles | D2 blir parkert; bruk historisk 2023-anker kun med caveat. |
| Ingen svar | Fortsetter som actor-gate, ikke som validert aktørkart. |
`

const g1D1D3D5DecisionPackBody = `## Formål

Dette er en G1-beslutningspakke for D1 markedshager, D3 regenerative praktikere og D5 skogshage/permakultur. Den skal gjøre det lett for menneskelig beslutningseier å godkjenne, avvise eller utsette actor-gate-avklaring uten å gjøre enkeltgårder, praksisfelt eller nettverk til et publiserbart kart.

## Beslutning som trengs

| Valg | Hva det betyr | Når riktig | Neste handling |
|---|---|---|---|
| Godkjenn samlet D1/D3/D5 | Lokal/regenerativ-pakken kan gå fra forberedelse til kontrollert kildeeier-avklaring/PCQ-forberedelse. | Teamet trenger ett felles praksisunivers før intern briefing eller figurvalg. | Send bare én samlet listeeier-/metodeask, logg svar, lokator, bruksrett og caveat samme dag. |
| Godkjenn én delpakke | Bare D1, D3 eller D5 åpnes først. | Én listeeier eller datakilde er tydeligere enn resten. | Send smal ask for valgt delpakke; behold de andre som actor-gate-kandidater. |
| Avvis nå | D1/D3/D5 holdes som interne kandidater uten outreach. | Lokal/regenerativ praksis er ikke relevant for neste briefing/figur, eller datarisikoen er for høy. | Behold kandidatlistene som research-kø; ikke bygg praksiskart. |
| Vent | Ingen kontakt; mer offentlig kildejakt først. | Det mangler beslutningseier, mottakerrolle eller offentlig listegrunnlag. | Finn publiserbar listeeier, oppdateringsdato og feltgrense før ny G1-runde. |

## Anbefalt default

Vent eller godkjenn én delpakke først. Samlet D1/D3/D5 bør bare åpnes hvis beslutningseier aksepterer at dette er datakvalitetsavklaring, ikke ekstern fortelling, og at utfallet kan bli "ingen publiserbar liste".

## Foreslått samlet ask

1. Finnes det en offentlig, aktiv 2026-liste for markedshager, regenerative praktikere eller skogshage/permakultur i Norge?
2. Hvilket univers dekker listen: kommersielle aktører, demonstrasjonssteder, nettverksmedlemmer, kurssteder, historiske prosjekter eller ukjent blanding?
3. Hva betyr statusfeltet: aktiv, registrert, historisk, pilot, kurs-/demosted, medlem, ukjent eller avviklet?
4. Hvilke felt kan brukes offentlig: navn, kommune/sted, organisasjonsform, praksistype, eventuell org.nr., status, oppdateringsdato og kilde-URL?
5. Hvilke rader eller felt skal ikke brukes av personvern-, medlems-, lokasjons- eller metodehensyn?
6. Hvem kan godkjenne bruken i intern Obsidian/app/briefing, og hvilken caveat må følge?

## Mottakerrolle og avsenderkrav

| Felt | Krav før sending |
|---|---|
| Mottakerrolle | Listeeier, metodeeier eller koordinator for feltet, ikke tilfeldig enkeltgård eller utøver. |
| Avsender | Menneskelig prosjektansvarlig, ikke automatisert agent. |
| Beslutningslogg | G1-vedtak, dato, beslutningseier, valgt delpakke og scope må stå i prosjektlogg før sending. |
| Responslogg | Svar, kilde-URL, bruksrett, datostempel, caveat og neste gate logges samme dag. |
| Publiserbarhet | Ingen ekstern bruk før PCQ/claim-lock/citable-gate. |

## Stopplinjer

- Ikke send noe uten eksplisitt G1/scope-vedtak.
- Ikke map enkeltgårder, praksissteder eller personer som validerte aktører uten offentlig lokator og bruksrett.
- Ikke behandle medlemskap, kursdeltakelse, nettverkstilknytning eller omtale som aktiv drift.
- Ikke behandle manglende svar som null funn eller null aktivitet.
- Ikke merk actor-gate som validert før dokumentert svar eller primærkilde finnes.

## Etter svar

| Svarutfall | Gate |
|---|---|
| Offentlig liste/lokator med bruksrett, statusfelt og oppdateringsdato | PCQ først, deretter eventuell claim-lock for presis formulering. |
| Delvis liste eller metodeforklaring uten publiserbare rader | Intern source-shortlist/PCQ med synlige hull. |
| Ulike lister med ulike univers | Splitt D1, D3 og D5 før videre bruk. |
| Nei/kan ikke deles | D1/D3/D5 blir parkert; ikke bygg lokal/regenerativt praksiskart. |
| Ingen svar | Fortsetter som actor-gate, ikke som validert aktørkart. |
`

const g1D4DecisionPackBody = `## Formål

Dette er en G1-beslutningspakke for D4 frø/genressurs. Den skal gjøre det lett for menneskelig beslutningseier å godkjenne, avvise eller utsette første actor-gate-outreach uten å gjøre KVANN/NordGen-sporet til et publiserbart aktørkart.

## Beslutning som trengs

| Valg | Hva det betyr | Når riktig | Neste handling |
|---|---|---|---|
| Godkjenn D4 | D4 kan gå fra forberedelse til kontrollert kildeeier-avklaring/PCQ-forberedelse. | Teamet trenger å vite hvilke norske aktører, lokasjoner og bevaringsroller som kan bekreftes offentlig. | Send bare D4-asken, logg svar, lokator, bruksrett og personvernforbehold samme dag. |
| Avvis D4 nå | D4 holdes som intern kandidat uten outreach. | Frø/genressurs er ikke relevant for neste briefing/figur, eller risikoen for medlems-/persondata er for høy. | Behold D4 som actor-gate-kandidat; ikke bygg aktørkart. |
| Vent | Ingen kontakt; mer offentlig kildejakt først. | Det mangler beslutningseier, mottakerrolle eller avklart personvern-/medlemsdatagrense. | Finn offentlig dataeier, publiserbar liste eller klart mandat før ny G1-runde. |

## Anbefalt default

Vent eller godkjenn D4 med smal kildeeier-scope. D4 bør bare åpnes hvis beslutningseier aksepterer at dette er datakvalitetsavklaring, ikke en kartlegging av medlemmer, nettverk eller enkeltpersoner.

## Foreslått D4-ask

1. Hvilke norske aktører, lokasjoner og bevaringsroller innen frø/genressurs kan bekreftes offentlig?
2. Hvilke felt kan deles uten medlems- eller persondata: organisasjonsnavn, rolle, sted/region, offentlig kilde-URL, oppdateringsdato og kontaktrolle?
3. Hvilke deler av KVANN/NordGen-sporet er nordisk, norsk, medlemsbasert, historisk eller prosjektbasert?
4. Hvilke rader, personer, gårder eller nettverkskoblinger skal ikke brukes av personvern-, medlems- eller metodehensyn?
5. Hvem kan godkjenne at avklarte felt brukes i intern Obsidian/app/briefing, og hvilken caveat må følge?

## Mottakerrolle og avsenderkrav

| Felt | Krav før sending |
|---|---|
| Mottakerrolle | Dataeier eller koordinator for KVANN/NordGen-sporet, ikke tilfeldig medlem eller enkeltaktør. |
| Avsender | Menneskelig prosjektansvarlig, ikke automatisert agent. |
| Beslutningslogg | G1-vedtak, dato, beslutningseier og scope må stå i prosjektlogg før sending. |
| Responslogg | Svar, kilde-URL, bruksrett, datostempel, caveat og neste gate logges samme dag. |
| Publiserbarhet | Ingen ekstern bruk før PCQ/claim-lock/citable-gate. |

## Stopplinjer

- Ikke send noe uten eksplisitt G1/scope-vedtak.
- Ikke gjør medlemsliste, personnettverk eller frøbytter til aktørkart.
- Ikke bruk KVANN/NordGen-navn som validering av norske lokasjoner uten offentlig lokator.
- Ikke behandle manglende svar som null funn eller null aktivitet.
- Ikke merk D4 som validert før dokumentert svar eller primærkilde finnes.

## Etter svar

| Svarutfall | Gate |
|---|---|
| Offentlig liste/lokator med bruksrett og tydelig feltgrense | PCQ først, deretter eventuell claim-lock for presis formulering. |
| Delvis metodeforklaring uten publiserbare rader | Intern source-shortlist/PCQ med synlige hull. |
| Nei/kan ikke deles | D4 blir parkert; ikke bygg frø/genressurs-aktørkart. |
| Ingen svar | Fortsetter som actor-gate, ikke som validert aktørkart. |
`

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
write(join(actorGateDir, 'D6-aktor-sporsmalspakker.md'), artifact('D6 aktørspørsmålspakker', actorGateP24Body))
write(join(actorGateDir, 'G1-D2-andelslandbruk-outreach-beslutningspakke-2026-07-04.md'), artifact('G1-D2 andelslandbruk outreach-beslutningspakke', g1D2DecisionPackBody, '2026-07-04'))
write(join(actorGateDir, 'G1-D4-fro-genressurs-outreach-beslutningspakke-2026-07-04.md'), artifact('G1-D4 frø/genressurs outreach-beslutningspakke', g1D4DecisionPackBody, '2026-07-04'))
write(join(actorGateDir, 'G1-D1-D3-D5-lokal-regenerativ-outreach-beslutningspakke-2026-07-04.md'), artifact('G1-D1-D3-D5 lokal/regenerativ outreach-beslutningspakke', g1D1D3D5DecisionPackBody, '2026-07-04'))
decisions.push(withIkkeSi(
  decision('11', 'D1-D6', 'Actor-gate prep', join(actorGateDir, 'D6-aktor-sporsmalspakker.md'), 'actor-gate', 'aktørspørsmål', 'P2.4 har G1-beslutningspakker for D2, D4 og D1/D3/D5, men ingen outreach er utført.', 'R13 actor-gate-kilder + P2.4 prioritering + G1-D2/D4/D1-D3-D5 beslutningspakker', 'G1/scope-vedtak og dokumentert svar eller primærkilde mangler fortsatt.'),
  [
    'Ikke merk actor-gate som validert før menneskelig svar eller primærkilde.',
    'Ikke bruk eldre kandidatlister som nåtidstall.',
    'Ikke sende aktørspørsmål før G1/scope-vedtak.',
  ],
))

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

  write(join(R14, 'r14-intake-index-2026-07-03.md'), artifact('Food TG R14 intake/triageindeks', `## Kontrollstatus

- Decision-batcher opprettet: 13 / 13.
- Decision-rader: ${decisions.length}.
- PCQ-notater: 7 / 7.
- Claim-lock-kandidatdokument: opprettet.
- I32 datareview: opprettet 2026-07-04 uten I-node-generering.
- I33 datareview: opprettet 2026-07-04 uten I-node-generering.
- I35 source-shortlist: opprettet 2026-07-04 uten I-node-generering.
- Actor-gate-kandidatlister: 5 + D6-spørsmålspakke + G1-D2/G1-D4/G1-D1-D3-D5 beslutningspakker.
- MVK importfiler: handel-dagligvare, meieri, kjøtt/egg.

## Hurtigoppsummering

| Gruppe | Antall |
|---|---:|
| PCQ-bekreftet/internt | ${decisions.filter(d => d.importDecision.includes('pcq')).length} |
| claim-lock-kandidat/vent | ${decisions.filter(d => d.gate.includes('claim-lock')).length} |
| actor-gate | ${decisions.filter(d => d.gate.includes('actor')).length} |
| importkandidat | ${decisions.filter(d => d.importDecision === 'importer').length} |
| internal/source-shortlist/vent | ${decisions.filter(d => d.importDecision !== 'importer').length} |

## Rader

| ID | Batch | Tittel | Gate | Importbeslutning | Artefakt |
|---|---:|---|---|---|---|
${decisions.map(d => `| ${d.id} | ${d.batch} | ${d.title} | ${d.gate} | ${d.importDecision} | ${d.canonicalPath} |`).join('\n')}

## Stoppliste

- Claim-lock-kandidater stopper før menneskelig claim-åpning.
- Actor-gate-pakker stopper før G1/outreach.
- C2-kandidater er Brreg-registerdekning, ikke volum/markedsandel.`))

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
