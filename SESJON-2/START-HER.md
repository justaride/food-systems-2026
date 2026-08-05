# Sesjon 2 — START HER (v2)

**Nytt siden v1:** Gabriel har vedtatt `AUTONOMIPOLICY-2026-08-04.md`. Den endrer hva agentene kan avgjøre selv, og legger til ett spor. Les policyen før noe annet.

## Gjeldende gjennomføringsstatus — 2026-08-04

Agentarbeidet i S2-A, S2-B, S2-C og S2-E er gjennomført og dokumentert. Den
uavhengige S2-E-målingen har 25/25 leverte rader, men bare 6/9 rolletreff på
`high` og 12/25 totalt. Derfor er bulk-skriving av de 268 faktiske
rollekvitteringene fortsatt stengt. S2-B og S2-C er integrert i canonical
(`462bb2f`, `e8ad258`, `4f38830`), verifisert databasefritt, men
produksjons-`apply` er med hensikt fortsatt låst.

Se:

- `SESJON-2/COMPLETION-AUDIT-2026-08-04.md` — samlet lukkeaudit
- `SESJON-2/KALIBRERING-2026-08-04.md` — blind og uavhengig S2-E-måling
- `SESJON-2/RAPPORT-S2-B.md` og `SESJON-2/RAPPORT-S2-C.md` — mekanismebevis
- `SESJON-2/EIERBESLUTNINGER-FOR-LUKKING.md` — beslutninger som fortsatt krever eier

Sesjonen er ikke komplett lukket før de to Nord-beslutningene er eksplisitt
håndtert. Bulkporten er dokumentert stengt etter
S2-E-målingen, og alle worktrees er bevart i tråd med briefens eksplisitte
regel. S2-C har nå uavhengig
review av den databasefrie grensen; produksjons-`apply` er fortsatt en separat
owner-bestilt endring og skal ikke åpnes av denne sesjonen.

De private korpusrøttene er kontrollert via den innebygde, entydige
root-discoveryen og lagt i gitignorerte `.env.local`-filer for canonical og
hovedutsjekken. Tre private read-only-kontroller er grønne; verdiene er ikke
skrevet i rapporter eller commits. Capture-verifikasjon bekrefter 23/23 og
24/24 sider, men begge Nord-identitetene står fortsatt som
`blocked_legacy_alias_scope_mismatch`; et blindt, enstemmig scope-panel anbefaler
`indirect_context` for Nord 2024:023 og `out_of_scope` for Nord 2025:010. Rights
og eventuell repository-restore krever fortsatt eierbeslutning; ingen automatisk
promotion er gjort. De offentlige Nord-PDF-ene er i tillegg kontrollert
read-only med samsvarende 23/24 sider og titler. Nordisk ministerråds egen
veiledning bekrefter samtidig at Open Access ikke opphever copyright; `Nord`
publikasjoner er oppgitt som `© All rights reserved`. Rights-statusen er derfor
fortsatt `pending_not_cleared`. Et separat offentlig-kildepanel gjentok scope-
konklusjonene enstemmig med høy konfidens.

Fem spor. Fire kan gis til agenter; ett er ditt.

| Spor | Innhold | Hvem | Tid |
|---|---|---|---|
| **S2-A** | Diagnostikk: F8 schema-drift, F9 snapshot-avvik, 76 manglende køfiler | Agent | 1–2 t |
| **S2-E** | **Kalibrering** — måler konfidensskalaen før noe skrives i bulk | Agent | 1 t |
| **S2-B** | Rolle-kvitteringsmekanismen, bygget for `decidedBy` fra dag én | Agent | 3–5 t |
| **S2-C** | Pålitelig startmekanisme (den parkerte AP-5) | Agent | 4–8 t |
| **S2-D** | Signatur, Nord-beslutninger, worktree-rester | **Du** | 30 min |

**Rekkefølge og porter:**

```
S2-A  ──┐
        ├──> S2-B ──> (bulk-skriving venter på S2-E)
S2-E  ──┘
S2-C  (parallelt, men vent hvis S2-A finner reell integritetsfeil)
S2-D  (når som helst)
```

**S2-E er en port, ikke en øvelse.** Policyens §6 sier at `high`-terskelen skal måles før den brukes til bulk-skriving. S2-B kan bygge mekanismen uansett — men de 268 kvitteringene skrives ikke før S2-E har levert et tall.

Alle sesjoner startes her:

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
```

---

## Først: fjern det lille hinderet

De private korpusrøttene er ikke en ekte port — de er bare en hemmelighet ingen har lagt et sted agentene kan lese. Fem minutter, én gang:

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026'
cat >> .env.local <<'EOF'
FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT=<din primære private rot>
FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT=<din replika>
EOF
grep -n '^\.env' .gitignore     # bekreft at .env.local er ignorert
```

Kontrakten forbyr private stier i **sporede artefakter, output og revisjonsspor**. En gitignorert lokal env-fil er ingen av delene — det er nøyaktig slik `DATABASE_URL` allerede håndteres. Agentene leser dem derfra og maskerer dem som `<privat-rot>` i alt de skriver.

Etter dette kan `--plan-only` (punkt 3 av 12) kjøres av en agent i stedet for av deg.

---

## S2-A — Diagnostikk (kjør først)

> **Lim inn:**
>
> Les `/Users/gabrielfreeman/Documents/Food Systems 2026/AUTONOMIPOLICY-2026-08-04.md` og `NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md` §3.
>
> Ren diagnostikk. **Ingen skriving til database, register, køer eller `research/evidence-pack/`. Ingen `--apply`.** Skriv til `SESJON-2/RAPPORT-S2-A.md`.
>
> **1 — Er schema-driften (F8) ny eller gammel?**
> `db:check-drift` viser at `Document`, `Insight`, `Report` og `Thesis` har `search_vector`-indekser og genererte defaults i databasen som ikke står i `prisma/schema.prisma`. Hypotese: dette er forventet og langvarig, fordi `prisma/migrations/20260719_fts_generated_columns_contract/migration.sql` oppretter dem via rå SQL og Prismas skjemaspråk ikke kan uttrykke dem.
> Test den: kjør samme diff mot eldre commits av `schema.prisma` og sammenlign outputen ordrett. Identisk hele veien = konstant drift, ikke ny bevegelse. Sjekk også om apply-kontraktens katalog-v2-hash dekker objektene — kontrakten sier den binder definisjonene av `immutable_to_tsvector_no(text)` og `immutable_array_to_string(text[])`.
> **Konkluder: blokkerer F8 signering, ja eller nei?**
>
> **2 — Hva er snapshot-avviket (F9)?**
> `knowledge:health:check` feiler med «Immutable source snapshot set `health.snapshot_set.2026-08-03.006986f7` already exists with different content». Les `scripts/knowledge/generate-corpus-health.ts`, finn ut hva som hashes inn, hvor det lagres og hva som sammenlignes. Avgjør hvilken av tre årsaker som gjelder: ikke-deterministisk generator, flyttede arbeidskopiartefakter, eller endret databaseinnhold. Kontrollen har trolig aldri vært kjørt i verifikasjonssammenheng før.
> **Konkluder: reell integritetsfeil eller kontrollartefakt?**
>
> **3 — Hvorfor mangler 76 filer?**
> AP-10 fant at 76 av 124 uklassifiserte rader i `corpus-role-classification-queue.v1.jsonl` peker på stier som ikke finnes i worktreet, mens `corpus-missing-files-queue.v1.jsonl` bare kjenner 29. Avklar diskrepansen, og utvid til hele registeret: hvor mange av de 1 555 har en `present`-sti som ikke finnes på disk? Hash-kontrollen 3. august fant 0 blant de 1 526 `present`-radene, så svaret bør være 0 — men de 76 må forklares.
> **Konkluder: registerhull eller forventet kategoriforskjell?**
>
> Avslutt med én tabell: funn, alvorlighet, blokkerer signering, hva som må gjøres.

---

## S2-E — Kalibrering (porten foran bulk-skriving)

Dette sporet finnes fordi policyens §6 krever det: en umålt konfidensskala er en uprøvd påstand, og prosjektet skriver ikke uprøvde påstander.

> **Lim inn:**
>
> Les `/Users/gabrielfreeman/Documents/Food Systems 2026/AUTONOMIPOLICY-2026-08-04.md`, spesielt §2 og §6.
>
> **Oppgave:** mål hvor pålitelig triagens konfidensskala er, slik at `high`-terskelen kan brukes — eller justeres — på grunnlag av data.
>
> **Metode:**
> 1. Trekk 25 identiteter tilfeldig fra `NATTSESJON-2026-08-04/triage/`, stratifisert slik at både `high`, `medium` og `low` er representert. Bruk et fast frø og oppgi det.
> 2. For hver: start en **ny agent uten tilgang til den opprinnelige triage-posten**. Den skal kun få filstien og skjemaet fra `AP-8-kildelesing-fanout.md`, og lese kilden fra bunnen av.
> 3. Sammenlign blindt mot originalen på `proposedRole`, `verdictForOwner`, `datagapRelevance` og `readState`.
>
> **Rapporter:**
> - samsvarsrate per felt, brutt ned på konfidensnivå
> - samsvarsraten for `high`-konfidens `proposedRole` spesielt — det er tallet som avgjør om terskelen holder
> - retningen på uenighetene: går de i trygg eller farlig retning etter policyens §2?
> - en anbefalt terskel, begrunnet i tallene
>
> **Verdifullt tilleggsmateriale:** `triage/triage-recovery-skive-19.superseded.jsonl` og `triage/triage-replacement-skive-13.superseded.jsonl` inneholder 11 kilder som allerede ble lest to ganger utilsiktet. Alle elleve parene er uenige på minst ett felt. Ta dem med som ekstra datapunkter, men behandle dem separat — de skivene ble kjørt på nytt fordi noe feilet, så spriket kan skyldes feilen og ikke ordinær variasjon.
>
> Skriv til `SESJON-2/KALIBRERING-2026-08-04.md` og `SESJON-2/RAPPORT-S2-E.md`.
> Ingen skriving til køer, register eller database.

---

## S2-B — Rolle-kvitteringsmekanismen

288 maskinrollefeil er materialisert i AP-9-underlaget og har ingen lovlig vei
inn uten kvittering. Eierkontrollkøen for alle 1 555 identiteter står blokkert
på `source_role_owner_confirmation_missing`. Policyens separate bulkunderlag
for S2-B er fortsatt 268 beslutninger.

> **Lim inn:**
>
> Les `/Users/gabrielfreeman/Documents/Food Systems 2026/AUTONOMIPOLICY-2026-08-04.md` i sin helhet — den definerer hva mekanismen din skal kunne uttrykke. Les deretter `GJENNOMGANG-NATTSESJON-2026-08-04.md` §4.
>
> Eget worktree:
> ```
> cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
> git worktree add ../sesjon2-rollekvittering -b codex/sesjon2-role-classification-receipts
> cd ../sesjon2-rollekvittering && npm install
> ```
>
> **Oppgave:** bygg kvitteringsmekanismen for korpusrolle-klassifisering. Køen krever «issue an owner role-classification receipt», men ingen slik mekanisme finnes i `scripts/`, `knowledge/` eller `package.json`.
>
> **Modellen:** `scripts/knowledge/field08-human-review.ts` med kommandoene `knowledge:field08:review:write`, `:check`, `:validate`, `:status:write`, `:status:check`. Les den først og speil disiplinen.
>
> **Krav — merk at dette er utvidet siden v1:**
> - Kvitteringsskjema i `knowledge/schema/` som bærer **hele `decidedBy`-blokken fra policyens §5**: `decidedBy` (`ai` / `ai_panel` / `owner`), `decidedByDetail`, `decidedAt`, `confidence`, `reasoning`, `queueRowSha256`, `policyVersion`
> - `queueRowSha256` binder køraden slik den var. Endres raden, ugyldiggjøres kvitteringen automatisk
> - **Håndhev asymmetriregelen i koden:** en kvittering som flytter en identitet **inn i** `primary_evidence` med `decidedBy: "ai"` skal avvises fail-closed. Bare `ai_panel` eller `owner` er gyldig der. Dette er policyens §2 gjort maskinlesbart — ikke en kommentar i dokumentasjonen
> - `ai_panel` krever tre bevarte stemmer og enstemmighet; uenighet gir avvisning med eskaleringsmelding
> - `--write-templates`, `--validate-receipts` (fail-closed på ukjent identitet, ugyldig rolle, manglende begrunnelse, køraddrift, brudd på asymmetriregelen), `--check-status`
> - Bulk-støtte: 268 beslutninger i én operasjon
> - Databasefrie tester i `tests/lib/` som dekker godkjent kvittering og **hvert** avvisningstilfelle — særlig asymmetribruddet
> - Kontraktsdokument i `knowledge/corpus/` i husets stil, med henvisning til policyen
>
> **Absolutt forbudt:**
> - å skrive til `corpus-role-classification-queue.v1.jsonl` eller noen annen kø
> - å skrive faktiske kvitteringer med de 268 bulkbeslutningene — **det venter på at S2-E har levert et kalibreringstall.** Du bygger og tester mekanismen; bulk-kjøringen er et eget, senere steg
> - å legge de nye testene inn i `knowledge:processing-contracts:check` (hashbundet i `codeBindings` — foreslå det i rapporten)
>
> Bruk `NATTSESJON-2026-08-04/PRIORITERING-2026-08-04.md` §6 som realistiske testdata for maler og validering.
>
> Rapport til `SESJON-2/RAPPORT-S2-B.md` + gjennomgangsunderlag.

---

## S2-C — Pålitelig startmekanisme (den parkerte AP-5)

Punkt 1 i den anbefalte fortsettelsesrekkefølgen. Uendret.

> **Lim inn:**
>
> Les `/Users/gabrielfreeman/Documents/Food Systems 2026/AUTONOMIPOLICY-2026-08-04.md`, deretter `NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md` i sin helhet, deretter `knowledge/corpus/SOURCE-REGISTRATION-APPLY-CONTRACT.md` i sin helhet.
>
> Utfør `NATTSESJON-2026-08-04/PARKERT/AP-5-paalitelig-startmekanisme.md` i sin helhet. Den er fortsatt gyldig.
>
> Eget worktree:
> ```
> git worktree add ../sesjon2-launcher -b codex/sesjon2-trusted-launcher
> cd ../sesjon2-launcher && npm install
> ```
>
> Hovedregelen står: **du bygger nøkkelen, du låser ikke opp.** `--apply` skal fortsatt returnere `APPLY_TRUSTED_ENTRYPOINT_REQUIRED` når du er ferdig.
>
> **Tillegg etter policyen:** ta med i gjennomgangsunderlaget hva som skal til for at forberedelsen til den første mutasjonen — backup-v2, restore-kvittering, clone-rehearsal, autorisasjonspakken — kan gjøres komplett av agenter, slik at eierens del reduseres til én kommando og én signatur. Beskriv det; ikke bygg det ennå.
>
> Rapport til `SESJON-2/RAPPORT-S2-C.md` + `GJENNOMGANGSUNDERLAG-S2-C.md`.

**Merk:** finner S2-A en reell integritetsfeil i F8 eller F9, bør S2-C vente. Lite poeng i å bygge inngangsporten før rommet innenfor er som forventet.

---

## S2-D — Din del

Kortere enn i v1, fordi env-fila fjernet punkt 1.

### 1. De to Nord-publikasjonene

Page-map-artifaktene er `privateStorageOnly` — sidene bærer bare hash og lagringspeker. Derfor kunne AP-9 ikke lese dem, og notatet nektet med rette å dikte innhold.

Med tilgang til det private arkivet tar det ti minutter:

| Alias | Faktisk publikasjon | Identitet |
|---|---|---|
| `Nord 2024:023` | *UNESCO Biosphere Reserves* | `document:cmppajyvb0012njvmnphhze07` |
| `Nord 2025:010` | *Beyond Zero — Nordic Architecture* | `document:cmppajyve0013njvmw7zok4yr` |

`NOTAT-NORD-BESLUTNINGER.md` har alternativene klare. To avgjørelser fjerner 2 av 12 blokkeringer.

**Merk:** den ekte Karlstad-deklarasjonen finnes separat som `research/bibliotek/nordisk/karlstad-deklarasjonen-matberedskap-2024.md` med egen identitet. Ikke koble den til UNESCO-PDF-en.

*Etter policyen kan omfangsvurderingen i prinsippet tas av et KI-panel — men disse to har rettighetsdimensjon (`pending_not_cleared`), og rettigheter er eierbeslutning etter §3.3.*

### 2. Tre worktree-rester

- `/private/tmp/food-systems-corpus-phase1.x4ABYO` — lever fortsatt med en checkout. Din, eller kan den ryddes?
- `validate-ftg` og `validate-ftg1` — låst med markeringen `initializing`. Vet du hva de var?

### 3. Hovedutsjekken

`codex/visual-system-atlas-v1` har 132 modifiserte og 213 usporede stier, pluss to stash-poster. Blir ikke ryddigere av å vente.

---

## Rettelser i nattsesjonens leveranser

1. **`PRIORITERING-2026-08-04.md` linje 13** er korrigert til **fire semantiske duplikatpar** (8 poster / 9 identiteter), i samsvar med §7 og `RAPPORT-AP-9`.
2. **Korreksjonstallet er avstemt til 288**: `PRIORITERING-2026-08-04.md`, `RAPPORT-AP-9.md` og de 511 ordinære triagepostene teller alle 288 `machineRoleWasCorrect: false`. Tallet 286/287 var en foreldet mellomversjon. S2-Bs 268 er den separate bulkbeslutningsmengden og skal ikke blandes med råfeiltellingen.
3. **`triage/triage-recovery-skive-19.superseded.jsonl` og `triage/triage-replacement-skive-13.superseded.jsonl`** er foreldede mellomversjoner. AP-9 valgte riktig versjon, og filene er nå flyttet ut av ordinær `triage-skive-*.jsonl`-glob etter at S2-E brukte dem som kalibreringsdata. De skal fortsatt behandles separat.

---

## Hva som blir mulig etter sesjon 2

| Etter | Blir mulig |
|---|---|
| S2-A | Å vite om signeringssporet er åpent |
| S2-E | Å skrive KI-beslutninger med en målt, oppgibar feilmargin |
| S2-B + S2-E | 268 rollekvitteringer skrevet av KI — som løsner eierkontrollkøen for alle 1 555 |
| S2-C + uavhengig gjennomgang | Punkt 1 og 2 av 12 lukket |
| Env-fila | Punkt 3 av 12 lukket, av en agent |
| S2-D punkt 1 | 2 av 12 PDF-blokkeringer fjernet |

Da gjenstår punkt 4 til 12. Etter policyen skal de forberedes komplett av agenter, slik at din del er én kommando og én signatur.
