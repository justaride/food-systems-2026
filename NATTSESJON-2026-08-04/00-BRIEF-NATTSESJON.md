# Nattsesjon 4. august 2026 — hovedbrief for agenter (v2)

**Prosjekt:** Food Systems 2026 — nordisk matsystem-kunnskapsbase
**Utgangspunkt:** Godkjent pausepunkt på grenen `codex/nordic-knowledge-canonical-v1`
**Grunnlagsdokumenter:** `QA-VALIDERING-CODEX-PAUSEPUNKT-2026-08-03.md` (prosjektroten) og `knowledge/corpus/FOOD-SYSTEMS-KNOWLEDGE-HANDOFF-2026-08-03.md` (i worktreet)
**Mandat gitt av eier (Gabriel):** full framdrift innenfor stoppreglene i §3

> **Endret fra v1.** Den første versjonen av denne briefen slo fast at databasen ikke var tilgjengelig, og at alt innholdsarbeid derfor måtte vente. **Begge deler var feil.** `DATABASE_URL` ligger i `.env` og peker på `localhost:5432/foodsystems` — den er lesbar for enhver agent som kjører lokalt på maskinen. Og 1 438 av 1 467 fulltekstenheter har bytene liggende på disk akkurat nå. Natten er derfor lagt om fra husarbeid til gjennomstrømning. De tre erstattede pakkene ligger i `PARKERT/`.

---

## 0. Les dette først

Dette er en **avlevering**, ikke en oppgaveliste. Du overtar en arbeidslinje bygget på én bærende idé:

> En fil er ikke kunnskap. En hash er ikke tillit. En KI-oppsummering er ikke analyse. Ingenting flyttes framover uten konkret, etterprøvbart bevis for at flyttingen er lovlig.

Systemet er *fail-closed*: når noe er uklart, stopper det. Det er designet, ikke en feil. Møter du en sperre du ikke forstår, er standardsvaret **ikke** å omgå den, men å dokumentere den og gå videre.

### Det avgjørende skillet i natt

Sperrene beskytter mot **å publisere en påstand som ikke er bevist.** De hindrer ikke **å lese.**

| | Status i natt |
|---|---|
| Skrive de 10 nye kildene til databasen | **Stengt** — krever Gabriels Ed25519-signatur |
| Publisere kunnskapspåstander gjennom hendelseslinjen | **Stengt** — krever ekstern tillitsrot, som kommer etter registrering |
| **Lese** databasen | **Åpen** |
| **Lese** de 511 primærkildene | **Åpen** — filene ligger på disk |
| Foreslå rolleklassifisering og prioritering | **Åpen** — køene venter på *underlag*, ikke på en port |

Alt du produserer i natt er **beslutningsunderlag**. Det lagres utenfor korpusregisteret, det bærer ingen påstand om at noe er «analysert», og det gjør ingen kilde «ferdig». Det gjør noe annet, som er verdt mer akkurat nå: det gjør 1 555 ventende eierbeslutninger mulige å ta.

---

## 1. Øyeblikksbildet du overtar

| Forhold | Verdi |
|---|---|
| Kanonisk arbeidskopi | `/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1` |
| Arbeidsgren | `codex/nordic-knowledge-canonical-v1` |
| HEAD ved pause | `3fd9849` (rapportkontrollpost) |
| Siste implementasjonskontrollpost | `63a6f2b` — `feat(knowledge): finalize trusted event checkpoints` |
| Avstand til `origin/main` | 37 foran, 0 bak (målt før siste `git fetch`) |
| Pushet / merget | Nei — grenen finnes **kun lokalt** |
| Kontrollpakke | 282 tester / 5 suiter, grønn på maskinen |
| Database | `localhost:5432/foodsystems` — **lesbar**, sealet mål `127.0.0.1/32` |
| Hendelser i livssykluslogg | **0** |
| Åpne PDF-blokkeringer | 12 = 10 `database_registration_required` + 2 `legacy_alias_scope_mismatch` |
| Remote | `origin` → `https://github.com/justaride/food-systems-2026.git` |

**Om repo-roten:** hovedutsjekken (`/Users/gabrielfreeman/Documents/Food Systems 2026`) står på en *annen* gren — `codex/visual-system-atlas-v1` — med mange ukommitterte endringer. Den er **ikke** din. Ikke commit der, ikke bytt gren der.

---

## 2. Hva korpuset faktisk består av

Dette er det viktigste tallet i briefen, og det står ingen andre steder. «1 555 kilder» overdriver den eksterne kildemassen omtrent tre ganger:

| Rolle | Antall | Hva det er |
|---|---|---|
| `internal_synthesis` | 634 | Prosjektets **egne** notater, Obsidian-sider, genererte sammendrag |
| `primary_evidence` | 538 | Ekte eksterne kilder — **dette er materialet** |
| `operational_control` | 177 | Indeksfiler, `ARKIV-INDEX.md`, administrativt |
| `unknown` | 123 | Uklassifisert |
| `generated_projection` | 5 | Avledede projeksjoner |

Av de 538 har **511 filer liggende på disk**. Det er nattens lesejobb:

- 511 enheter
- 98 PDF-er på til sammen **8 155 sider**
- 413 tekstfiler
- ca. **3,89 millioner ord** totalt (tekstdelen eksakt talt, PDF-delen estimert til 350 ord per side)

Fordelt på 20 skiver blir det ca. 26 enheter og 194 000 ord per agent. Skiveinndelingen er allerede regnet ut og ligger i `triage-manifest.jsonl` — se AP-8.

**En advarsel om maskinrollene:** de 1 431 provisoriske klassifiseringene er gjettet på filnavn. Se selv:

```json
"classificationStatus": "machine_rule_provisional",
"ruleId": "control_path_or_filename",
"reasons": ["canonicalPath=arkiv-index.md"]
```

Det betyr at rolletabellen over er *omtrentlig*. En agent som faktisk åpner fila kan gjøre det langt bedre — og det er nettopp jobben.

---

## 3. Ufravikelige stoppregler

Absolutte. De gjelder uansett hvor logisk et unntak virker klokken 03:00.

1. **Ingen databaseskriving. Aldri.** Lesing er tillatt og oppmuntret. Enhver `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER` eller Prisma-mutasjon er forbudt — via ethvert verktøy, inkludert MCP. Bruk read-only-transaksjoner der skriptet tilbyr det.
2. **Ingen `--apply`. Ikke omgå karantenen.** `APPLY_TRUSTED_ENTRYPOINT_REQUIRED` og `REHEARSAL_TRUSTED_ENTRYPOINT_REQUIRED` skal fortsatt utløses når natten er over.
3. **Ingen merge til `main`. Ingen deploy. Ingen Coolify.** Push kun av arbeidsgrenen, kun som backup (AP-2). Aldri `--force`.
4. **Ikke skriv til korpusregisteret eller køene.** Ikke `corpus-processing-register.v1.jsonl`, ikke noen `*-queue.v1.jsonl`. Ikke kjør `knowledge:corpus:generate` — kun `:check`.
5. **Ikke løs opp køer merket `owner_review_required` eller `decisionReceiptRequired: true`.** Du foreslår; Gabriel avgjør.
6. **Ingen hemmeligheter noe sted.** Ikke `DATABASE_URL`-verdien, ikke private absolutte stier, ikke nøkkelbytes — verken i filer, commits, logger eller rapporter. Kontraktene forbyr dette eksplisitt.
7. **Ikke endre `research/evidence-pack/`.** Lesing er greit. Endring, flytting eller omdøping er det ikke.
8. **Ingen påstand om at noe er analysert.** Alt du produserer er merket som provisorisk beslutningsunderlag. Se §5.
9. **Aldri forankre den gamle, tomme 1 555-genesisen eksternt.**
10. **Én arbeidspakke = én gren = ett worktree.** Se §6.
11. **Ved tvil: stopp pakken, skriv hvorfor, gå videre.** En blokkert pakke med god dokumentasjon er et godt resultat. En pakke som ble «løst» ved å omgå en sperre er et dårlig et.

---

## 4. Arbeidspakkene

| Pakke | Innhold | Type | Estimat | Avhenger av |
|---|---|---|---|---|
| **AP-1** | Startkontroll + fiks `package-lock.json` (F1) | Kode, liten | 20–40 min | — |
| **AP-2** | Push arbeidsgrenen som backup (F2) | Drift | 5 min | AP-1 |
| **AP-6** | Hygiene og opprydding (F3, F4, F5) | Drift | 30–60 min | AP-2 |
| **AP-7** | Live databaseverifisering, read-only | Verifisering | 1–2 t | AP-1 |
| **AP-8** | Kildelesing og klassifisering — 20 parallelle agenter | Innhold | 4–8 t | AP-1 |
| **AP-9** | DATAGAP-prioritering og syntese | Analyse | 2–3 t | AP-8 |
| **AP-10** | Locatorjakt og ukjente roller | Research | 2–3 t | AP-1 |

**Parkert fra v1:** AP-3 (Unicode-stiduplikater), AP-4 (Nord-aliasene), AP-5 (pålitelig startmekanisme). De ligger uendret i `PARKERT/` og er fortsatt gyldige — de er utsatt, ikke forkastet. AP-4s substans er foldet inn i AP-9, siden Nord-aliasene er et omfangsspørsmål av nøyaktig samme type som resten av triagen.

**Rekkefølge:** AP-1 → AP-2 seriell først. Deretter alt annet parallelt, unntatt AP-9 som venter på AP-8.

---

## 5. Regelen som gjør fart trygt

Alt innholdsarbeid i natt følger disse fem punktene. De er ikke formaliteter — de er grunnen til at vi kan gå fort uten å ødelegge det som gjør prosjektet troverdig.

1. **Ingenting skrives til korpuset.** Alle utdata går til `NATTSESJON-2026-08-04/`, aldri til `knowledge/corpus/`.
2. **Hver post er merket provisorisk.** Feltet `provisional: true` og `producedBy: "nattsesjon-2026-08-04"` er obligatorisk i hver eneste triage-post.
3. **Ingen påstand promoteres.** Du skriver hva en kilde *sier*, ikke at det er sant. «Rapporten oppgir X på side 12» — ikke «X er tilfellet».
4. **Usikkerhet skrives ned, ikke bort.** Hvert felt du er usikker på får `low`-konfidens og en begrunnelse. Et ærlig «vet ikke» er en gyldig verdi.
5. **Ingen sammenslåing av identiteter.** Ser to enheter like ut, noterer du mistanken i `duplicateSuspicion`. Du fletter ingenting.

Dette er også nøyaktig hva QA-rapporten ba om: *«definer eksplisitt hvor «godt nok» gjelder for bulk-behandlingen, ellers blir gjennomløpstakten svært lav.»* Godt nok er definert over.

---

## 6. Isolasjonsregler

**Steg 1 — seriell, på den kanoniske grenen:** AP-1 → AP-2 i det eksisterende worktreet. Ingen andre agenter rører det treet imens.

**Steg 2 — parallelt:**

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
git worktree add ../nattsesjon-ap6-hygiene -b codex/nattsesjon-ap6-hygiene
git worktree add ../nattsesjon-ap10-locator -b codex/nattsesjon-ap10-locator
```

**AP-7, AP-8 og AP-9 trenger ikke egne worktrees** — de er rene leseoppgaver og skriver kun til `NATTSESJON-2026-08-04/`. De kan alle lese fra det kanoniske treet samtidig. Lesing kolliderer ikke.

**AP-8s tjue agenter** deler samme lesekilde og skriver hver til sin egen filnavngitte skive. Ingen felles skrivefil — det ville kollidert.

Om `node_modules` i nye worktrees: de arver ikke installasjonen. Kjør `npm install` først. Det er en av grunnene til at AP-1 må være ferdig først.

**Ikke slett noen worktrees.** Gabriel gjennomgår dem om morgenen.

---

## 7. Kommandoreferanse

Filbaserte kontroller, fra roten av ditt worktree:

```bash
git status --short --branch
git log -5 --oneline
git fetch origin

npm run knowledge:processing-contracts:check    # 282 tester, 5 suiter
npm run knowledge:corpus:check                  # KUN --check, aldri :generate
npm run knowledge:pdf-pages:check
npm run knowledge:source-analysis-input:check
npm run knowledge:validate
npx tsc --noEmit
```

Databasekontroller — **alle read-only**, se AP-7:

```bash
npm run knowledge:health:check
npm run knowledge:library-history:check
npm run knowledge:corpus:check:live
npm run db:check-drift
```

Nyttig for PDF-lesing (begge finnes på maskinen):

```bash
pdfinfo <fil>            # sideantall, metadata
pdftotext <fil> -        # tekst til stdout
```

---

## 8. Rapporteringsformat

Hver agent skriver **én** fil til
`/Users/gabrielfreeman/Documents/Food Systems 2026/NATTSESJON-2026-08-04/RAPPORT-AP-<n>.md`

AP-8s tjue agenter skriver til `RAPPORT-AP-8-skive-<NN>.md`. Ikke skriv til hverandres filer.

```markdown
# Rapport AP-<n>: <tittel>

**Status:** FULLFØRT | DELVIS | BLOKKERT
**Agent:** <navn/modell>
**Tidsrom:** <start>–<slutt>
**Gren / worktree:** <navn, eller «kun lesing»>
**Commits laget:** <sha-er, eller «ingen»>

## 1. Hva som ble gjort
## 2. Kommandoer og resultat
<kommando + relevant output. Ingen hemmeligheter.>
## 3. Verifikasjon
<hvilke DoD-punkter som er innfridd, med bevis>
## 4. Hva som gjenstår
## 5. Beslutninger Gabriel må ta
<nummerert. Valgene, konsekvensen av hvert, din anbefaling og hvorfor. «Ingen» er gyldig.>
## 6. Risiko og forbehold
<vær ærlig — underdriv heller enn å overdriv>
```

**Om ærlighet:** QA-en fant «ingen overklaiming, snarere systematisk underclaiming» i dette prosjektet. Følg den standarden. Skriv «BLOKKERT» framfor «DELVIS» når du egentlig står fast.

---

## 9. Eskalering — når du skal stoppe helt

- en kontroll som var grønn ved pause blir rød uten åpenbar miljøårsak
- `knowledge:corpus:check` melder om andre avvik enn de to kjente Unicode-variantene
- `git status` viser endringer du ikke selv laget
- databasen viser en tilstand som avviker fra den låste planens forventning (se AP-7 — dette er et **stort** funn, ikke et lite)
- en sperre ber om å bli omgått for at du skal komme videre
- du er i ferd med å skrive til `research/evidence-pack/`, registeret eller en kø

Er kontrollpakken rød allerede ved oppstart i AP-1: **stopp hele nattsesjonen.**

---

## 10. Sluttsjekk før du legger deg

- [ ] `git status --short` er rent i alle worktrees du har rørt
- [ ] Ingen hemmeligheter i noen fil eller commit-melding
- [ ] Ingen skriving til databasen, registeret eller køene
- [ ] Rapportfilen din finnes og følger malen
- [ ] `--apply` er fortsatt karantenert
- [ ] Ingenting er merget til `main`
- [ ] Alle worktrees står igjen

---

## Vedlegg A: DATAGAP-taksonomien

Fra `DATAGAP-ANALYSE-2026-07-06.md`. Brukes i AP-8 og AP-9. Bruk slug-verdiene ordrett.

**De elleve svake feltene:**

| Slug | Felt | Type |
|---|---|---|
| `aktordybde` | Aktørdybde — 1 634 registrerte, nesten ingen verifisert aktive | B |
| `materialstrommer` | Materialstrømmer og næringsstoffregnskap (N-P-K) — største substanshull | A/C |
| `alternativt_protein` | Alternativt protein — kapasitet forveksles med virkelighet | A/B |
| `beredskap_import` | Importavhengighet og beredskap — noder uten kapasitetstall | A/C |
| `lokale_verdikjeder` | Lokale verdikjeder — eksistens uten aktivitet | A/B |
| `okologi_jordhelse` | Økologi, jordhelse og biodiversitet | C |
| `makt_eierskap` | Makt, eierskap og founder-nettverk utenfor konserntrærne | B |
| `nordisk_dybde` | Nordisk dybde — asymmetrien mot Norge | A |
| `kvalitativt_lag` | Kvalitativt og menneskelig lag — null primærdata | B |
| `offentlig_innkjop` | Offentlig innkjøp og forbruksleddet | A/B |
| `kausalitet` | Kausalitet og effekt — tverrgående svakhet | — |

**Hulltypene:**

- **Type A** — kan lukkes med desk research mot eksisterende primærkilder
- **Type B** — krever aktørkontakt eller betalt/lukket kilde
- **Type C** — ingen kjent kilde måler dette; hullet er et funn i seg selv

**De fire kvalitetsdimensjonene:** bredde (mangler vi enheter?), dybde (vet vi hva de gjør, i volum og verdi?), ferskhet (er tallet fra riktig år?), kausalitet (kan vi si *hvorfor*, eller bare *at*?).

---

## Vedlegg B: ordliste

| Begrep | Hva det betyr her |
|---|---|
| **Korpus** | Hele samlingen registrerte kilder — 1 555 aktive identiteter |
| **Identitet** | Én kilde med stabil nøkkel, ikke nødvendigvis én fil |
| **Livssyklushendelse** | Et dokumentert skifte i en kildes tilstand, lenket til bevis |
| **Tofasemodell** | Hendelse skrives først som *ventende*; gjeldende tilstand oppdateres først etter ekstern bekreftelse |
| **Fail-closed** | Ved tvil nektes operasjonen |
| **CAS** | Compare-and-swap — hele databasetilstanden må være identisk med den signerte |
| **FD3/FD4/FD5** | Filbeskrivere for launcher-inode, offentlige pins og hemmelig input. FD5 leses sist. |
| **Karantene** | Bevisst blokkering av `--apply` inntil en gjennomgått startmekanisme finnes |
| **Genesis** | Første kontrollpost i hendelseskjeden |
| **NFC / NFD** | To måter å lagre æ/ø/å på. Ser like ut, ulike bytes. Funn F7. |
| **Triage** | Nattens hovedaktivitet: lese, klassifisere og prioritere — uten å hevde at noe er analysert |
