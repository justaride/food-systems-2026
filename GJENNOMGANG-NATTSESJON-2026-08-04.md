# Gjennomgang av nattsesjonen 4. august 2026

**Gjennomgått av:** Claude, uavhengig etterkontroll mot faktisk filtilstand
**Omfang:** alle leveranser i `NATTSESJON-2026-08-04/`, git-tilstand, køfiler, databasekontrollene og de rapporterte DELVIS-gatene

**Etterkontrolloppdatering 2026-08-04:** Den første health-feilen ble
reprodusert med feil runtime-layout. Etter bytebevarende ekstern/symlinket
runtime-layout passerer `knowledge:health:check` med 6 immutable assessments,
og den FTS-aware schema-verifieren passerer. AP-7s låste plan er fortsatt åpen
på stale source-analysis-manifest-pin.

---

## 0. Hovedkonklusjon

**Nattsesjonen holdt seg innenfor stoppreglene, og de sentrale påstandene stemmer.** Jeg kontrollerte dem mot filene i stedet for å ta rapportene på ordet:

| Påstand | Kontroll | Resultat |
|---|---|---|
| 511/511 kilder dekket | Diff av `identityKey` mot manifestet | ✅ 0 manglende, 0 utenfor manifest |
| 0 skjemafeil | JSON-parsing av alle 22 filer | ✅ 0 ugyldige linjer |
| Commit pushet og verifisert | Lokal ref mot `refs/remotes/origin/…` | ✅ Identisk: `733ad965c99022825efbf63e746df57d4663383c` |
| Ingen kø- eller registerendring | mtime på alle 11 køfiler | ✅ Uendret siden 3. august |
| `evidence-pack` urørt | `find -newermt "2026-08-04"` | ✅ Ingen treff |
| Ingen databaseskriving | AP-7s egen kommandologg + `ControlledMutationAudit` = 0 | ✅ Bekreftet |
| Kontrollpakken fortsatt grønn | AP-6 kjørte den etter README-endringen | ✅ 282/282 |
| Karantenen intakt | Ingen endring i launcher-koden | ✅ |

**Kvaliteten på arbeidet er høy, og disiplinen er reell.** Tre agenter utløste stoppbetingelser og stoppet i stedet for å improvisere — AP-6 på en levende worktree, AP-7 på manglende private røtter, AP-9 på utilgjengelig sidetekst. Det er akkurat den oppførselen systemet er bygget for.

Jeg fant **to nye funn** og **tre presiseringer** som ikke står i noen nattrapport.

---

## 1. Nye funn

### F8 — Schema-drift mot `prisma/schema.prisma` (AP-7 fant den; jeg har trolig forklaringen)

`db:check-drift` viser at `Document`, `Insight`, `Report` og `Thesis` alle har `search_vector`-indekser og genererte defaults i databasen som **ikke** er beskrevet i `schema.prisma`.

AP-7 anbefalte å stoppe signering til avviket er forklart. Det var riktig å flagge — men forklaringen er trolig udramatisk:

1. Migrasjonen `prisma/migrations/20260719_fts_generated_columns_contract/migration.sql` finnes og oppretter nettopp disse via rå SQL.
2. Prismas skjemaspråk kan ikke uttrykke `GENERATED ALWAYS AS (tsvector …)` eller GIN-indeksen. `migrate diff` vil derfor **alltid** rapportere dette avviket.
3. Apply-kontrakten vet det allerede. Den sier eksplisitt at ettersammenligningen inkluderer *«the Prisma-unsupported `embedding` value and the stored generated `search_vector` value; neither can be silently omitted by the ORM»*, og at katalog-v2-hashen binder definisjonene av `immutable_to_tsvector_no(text)` og `immutable_array_to_string(text[])`.

Retningen på diffen støtter dette: den sier «removed index» og «default → None», altså hva som må fjernes for å gå *fra* databasen *til* schema.prisma. Databasen har mer enn skjemaet beskriver — ikke mindre.

**Dette er sannsynligvis forventet, langvarig drift, ikke ny bevegelse.** Det avgjøres med én kommando: kjør samme diff mot en eldre commit av `schema.prisma` og se om outputen er identisk. Er den det, er saken lukket. Se S2-A.

### F9 — `knowledge:health:check` feiler på et immutable snapshot-set

```
Immutable source snapshot set health.snapshot_set.2026-08-03.006986f7
already exists with different content
```

Dette er første gang kontrollen er kjørt i verifikasjonssammenheng — QA-en 3. august måtte hoppe over den fordi den krever database. Feilen kan derfor ha stått der en stund uten at noen har sett den.

Meldingen sier at et sett som skal være uforanderlig, har annet innhold enn registrert. Det kan bety tre ting med svært ulik alvorlighet: at generatoren er ikke-deterministisk, at arbeidskopiens artefakter har flyttet seg, eller at databaseinnholdet har endret seg. **AP-7 var korrekt tilbakeholden med å tolke det.** Rotårsaken må finnes før noe signeres — men den er billig å finne.

---

## 2. Presiseringer

### 2.1 «288 rollekorreksjoner» er avstemt

Den tidligere etterkontrollen hevdet 286 ved å sammenligne to rollefelt som ikke
finnes i dagens ordinære triageposter. En ny direkte kontroll av de 20 ordinære
triagefilene viser **288 av 511** med `machineRoleWasCorrect: false`, i samsvar
med `PRIORITERING-2026-08-04.md`, `RAPPORT-AP-9.md` og `SESJON-2/START-HER.md`.

Dette er flaggtallet fra triagen, ikke en eiergodkjent rolleendring. Det skal
fortsatt ikke skrives til kø, register eller database uten gyldig kvittering.

### 2.2 Duplikatpar er avstemt til fire

Den tidligere etterkontrollen fant at `PRIORITERING`-sammendraget forvekslet
poster med par. Dette er nå rettet: sammendraget sier **fire semantiske
duplikatpar** (8 poster / 9 identiteter), i samsvar med §7 og
`RAPPORT-AP-9`.

### 2.3 Commit-SHA-en i statusmeldingen din er avkortet

Du skrev `733ad965c99022825efbf63e7463383c` (32 tegn). Faktisk SHA er `733ad965c99022825efbf63e746df57d4663383c` (40 tegn) — `46df57d46` mangler på midten. Selve pushen er verifisert korrekt; det er kun transkripsjonen i statusmeldingen som er skjev.

---

## 3. Et funn i selve metoden: de 11 dobbeltleste kildene

`triage/`-katalogen inneholder to superseded-filer utover de tjue ordinære
skivene: `triage-recovery-skive-19.superseded.jsonl` (6 poster) og
`triage-replacement-skive-13.superseded.jsonl` (5 poster). Skive 13 og 19 måtte
altså kjøres på nytt, og de er nå eksplisitt holdt utenfor ordinær glob etter
kalibreringen.

AP-9 håndterte dette riktig — den dedupliserte og valgte den nyeste versjonen, som er den korrekte (hovedfilene ble skrevet etter recovery-filene). Dekningen er reelt 511 unike.

**Men de 11 parene er en utilsiktet dobbeltlesing av samme dokument, og alle elleve er uenige med seg selv.**

| Felt | Antall par som avviker |
|---|---|
| `datagapFields` | 11 av 11 |
| `datagapRelevance` | 5 |
| `verdictForOwner` | 3 |
| `readState` | 3 |
| `proposedRole` | 2 |
| `machineRoleWasCorrect` | 2 |

De skarpeste:

- `cmp8xymyn00gd…` — `primary_evidence` / `lav` mot `unknown` / `ut_av_omfang`
- `cmp8xynmv00ik…` — `primary_evidence` / `standard` mot `unknown` / `ut_av_omfang`
- `cmp8xyo7r00ju…` — `prioriter` mot `standard`

**Hva dette betyr.** To agenter som leser samme dokument lander ulikt i alle elleve tilfellene, på rolle i to og på eierdom i tre. Det er en kalibreringsindikasjon for de 500 andre postene, som bare er lest én gang.

**Hva det ikke betyr.** Utvalget er 11, ikke 511. Og viktigere: disse skivene ble kjørt på nytt *fordi noe feilet*, så en del av spriket skyldes trolig den feilen og ikke ordinær variasjon mellom lesere. Man kan ikke lese en feilrate på 18 % ut av dette.

**Anbefaling.** Behandle triagen som det den er merket som — `provisional` — og la den styre *rekkefølge*, ikke *innhold*. Skal en enkeltkilde brukes som grunnlag for en påstand, leses den på nytt i den gatede analyselinjen. Det er nøyaktig slik systemet allerede er tenkt, og natten bryter ikke med det.

Vil du ha et reelt kalibreringstall, koster det lite: la 25 tilfeldige kilder leses av en ny agent uten tilgang til den første posten, og mål samsvaret. Det er en time og gir en ærlig feilmargin å oppgi når materialet siteres.

---

## 4. Den viktigste blokkeringen ingen har nevnt

Natten produserte **288 flaggede rollekorreksjoner klare til godkjenning**. Køen sier hva som kreves:

```json
"decisionReceiptRequired": true,
"requiredDecision": "confirm or correct the provisional corpus source role
                     and issue an owner role-classification receipt"
```

**Den kvitteringsmekanismen finnes ikke.** Jeg søkte gjennom `scripts/`, `knowledge/` og `tests/` — det er ingen skriptbane for `role_classification_receipt`, og ingen `package.json`-kommando for det.

Til sammenligning har Field08-piloten en komplett kjede: `field08:review:write`, `:check`, `:validate`, `:status:write`, `:status:check`. Mønsteret finnes altså — det er bare aldri bygget for korpusroller.

Konsekvensen: du har 288 provisorisk begrunnede beslutninger og ingen lovlig måte å registrere dem på. Det er nå den trangeste flaskehalsen i prosjektet, foran både registreringsporten og analyselinjen — fordi eierkontrollkøen for alle 1 555 identiteter står blokkert på nettopp `source_role_owner_confirmation_missing`.

**Dette er den høyest verdsatte nye oppgaven i sesjon 2.**

---

## 5. De rapporterte DELVIS-gatene — vurdering

| Gate | Rapportert av | Min vurdering |
|---|---|---|
| `--plan-only` ikke kjørt (manglende private røtter) | AP-7 | **Riktig stopp.** Du oppga aldri stiene. 30 min å lukke. |
| Prune ikke kjørt — `/private/tmp/food-systems-corpus-phase1.x4ABYO` lever | AP-6 | **Riktig stopp.** Katalogen finnes fortsatt. Prune ville vært feil. |
| `validate-ftg` / `validate-ftg1` låst med `initializing` | AP-6 | **Riktig stopp.** Låsen er noens beslutning. |
| Hovedutsjekkens 345 endrede stier | AP-6 | **Riktig stopp.** 132 modifiserte + 213 usporede, pluss to stash-poster. Skal ikke røres samlet. |
| Nord-tekst ikke lesbar | AP-9 | **Bekreftet.** Jeg åpnet begge page-maps: `privateStorageOnly` er satt, og sidene bærer kun hash og lagringspeker — ingen tekst. Notatet nektet å dikte innhold. Det er riktig oppførsel. |
| 76 av 124 rollekøfiler mangler på disk | AP-10 | **Nytt og verdt oppfølging.** Missing-files-køen kjenner bare 29. Se S2-A. |
| Rollekøen har 124 ukjente, ikke 123 | AP-10 | Presis observasjon. Mitt tall var fra `provisionalRole`-tellingen; AP-10 leste live kø. AP-10 har rett. |

**Ingen av gatene ble omgått.** Alle sju er dokumentert med årsak og anbefaling.

---

## 6. Det du fikk ut av natten

| | Før | Etter |
|---|---|---|
| Leste eksterne kilder | 0 | 511 |
| Kilder med DATAGAP-kobling | 0 | 511 |
| Rollekorreksjoner klare | 0 | 288 flaggede poster |
| Locators funnet | 0 av 18 | flere sterke, 3 krever oppfølging |
| DB-tilstand verifisert | aldri | kjernetellingene bekreftet, 2 nye funn |
| Nye funn | — | F8, F9, 4 duplikatpar, 76 manglende køfiler |
| Backup av arbeidslinjen | ingen | pushet og verifisert |

Kostnad: 2 t 18 min, 672 001 tokens.

Til sammenligning: kildemassen hadde stått ulest siden prosjektet startet.

---

## 7. En ærlig merknad om hva som fortsatt ikke er sant

Det er nå fristende å si at «511 kilder er gjennomgått». Det er ikke det samme som at de er analysert:

- Ingen kilde har gått gjennom den gatede analyselinjen
- Ingen livssyklushendelse er skrevet — loggen er fortsatt 0 bytes
- Ingen identitet er promotert til intern eller ekstern bruk
- Triagen er `provisional` i hver eneste post, og de 11 dobbeltlesingene viser at det merket er fortjent

Det du har fått er **rekkefølge og oversikt** — hvor du skal begynne, og hva som ikke er verdt tiden. Det var også det som manglet. Men skillet er verdt å holde på når resultatet skal omtales utad.
