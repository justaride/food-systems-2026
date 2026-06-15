---
tittel: Food TG — Brønnøysund-triage (222 avvik fra validate:brreg, 2026-06-15)
status: Triage-notat — kategorisering + rotårsak + tiltak. Avvik = «DB ≠ register», ikke autosannhet.
eier: Gabriel
dato: 2026-06-15
kilde: research/BRREG-VALIDATION-AUDIT.md + research/brreg-validation-audit.json (auto-generert 2026-06-15T18:01Z av scripts/validate-against-brreg.ts mot data.brreg.no)
relaterte_filer:
  - research/BRREG-VALIDATION-AUDIT.md
  - research/brreg-validation-audit.json
  - research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json
  - docs/project/status/food-tg-statusoppdatering-2026-06-15.md
---

# Brønnøysund-triage — de 222 avvikene

## 1. Hovedkonklusjon

De 222 avvikene er **overveiende kosmetiske** og reduserer til fire mekaniske klasser. Den klart største årsaken er **navneform-mismatch**: DB lagrer ø/æ/å som oe/ae/aa og dropper ofte mellom-/pikenavn, så samme styremedlem får en annen `personKey` enn registeret og dukker opp **både** som «mangler i DB» og «kun i DB». Av 432 medlemsliste-avvik kollapser **203 personpar (~406 linjer) til samme person**.

**Ingen av avvikene rører maktkart-påstanden.** De gjelder navneform, rolletittel og styre-vintage — ikke om interlock-strukturen mellom toppkonsernene finnes. CL-MAKTKART-001 (`citable_with_note`) står uendret. Auditens egen advarsel gjelder: «registeret kan henge etter, og motsatt».

**Reelle tiltak er små:** 6 orgnr-/entitetssaker (2 ikke-funnet + 4 slettet) for neste import, og ≤5 mulige ekte styre-endringer å øyne-sjekke. Resten er normaliseringsregler, ikke datakorreksjoner.

## 2. Tallgrunnlag

Validert totalt **254**: 26 OK, **222 avvik**, 2 ikke-funnet, 4 slettet (35 hoppet over: SA/research/ikke-norsk).

Avvik på elementnivå (kan være flere per selskap):

| Type | Antall | Tolkning |
|---|---:|---|
| `roleMismatch` (rolleavvik) | 543 | Rolletittel DB vs register |
| `staleInDb` (kun i DB) | 222 | DB-styrerad uten register-match |
| `missingInDb` (i register, ikke DB) | 210 | Register-styrerad uten DB-match |
| `fieldDiffs` (selskapsfelt) | 26 | Alle av type «navn» (selskapsnavn-form) |

118 av 222 selskap har flere avvikstyper samtidig; 86 kun rolleavvik; 17 kun medlemsliste; 1 kun felt.

## 3. Rotårsak — bevist

### 3.1 Medlemsliste (432 linjer → 203 personpar)

En robust paring (Unicode-folding av ø/æ/å + match på første+siste navneledd) parer **203 av avvikene som samme person under ulik navneform**. **107 av 124 berørte selskap er da fullt forklart** som navnevarianter.

Eksempel **TINE SA** (7 «mangler» / 7 «kun i DB» — samme sju personer):

| Register (mangler i DB) | DB (kun i DB) |
|---|---|
| Elin Johanne **Husby** Aarvik | Elin Johanne Aarvik |
| Hans Olav **Hallan** Minsås | Hans Olav Minsås |
| Ingunn Helene **Skauen** Ruud | Ingunn Helene Ruud |
| Lise **Kaldahl** Skreddernes | Lise Skreddernes |
| Anne **Saltrø** Polden | Anne Polden |
| Kåre Ivar Stormoen | Kåre Ivar Stormoen *(personKey `…stormon` vs `…stormoen`)* |
| Thomas Motrøen *(styremedlem)* | Thomas Motrøen *(`motron`; rolle vara vs styre)* |

Mønsteret er systematisk: registeret bærer fulle mellom-/pikenavn og ekte ø/æ/å; DB bærer kortform og oe/ae/aa-translitterasjon. Samme menneske, to nøkler.

**Residual etter paring:** 7 register-medlemmer og 19 DB-rader uten automatisk match — men nær sagt alle disse er òg ø/oe-varianter paringen så vidt bommet på (f.eks. 4Service: register «Tor Rønhovde» vs DB «Tor Roenhovde»; Lerøy: «Arne Møgster» vs «Arne Moegster»; Mowi: «Kjersti Helen Krokeide Hobøl» vs «Kjersti Hoeboel»). Reelt mulige ekte endringer: **≤5** (f.eks. Norgesfor: «Arne Bjørgen» i register vs «Ebbe Maurtvedt» i DB — ulike navn, sjekkes).

### 3.2 Rolleavvik (543)

| Klasse | Antall | Tolkning |
|---|---:|---|
| EN↔NO samme rolle (CEO = daglig leder, chair = styreleder) | 147 | Ren merkelapp; ikke et avvik |
| styremedlem ↔ varamedlem | 349 | Register-autoritativt; DB merker noen vara som fullt medlem el. omvendt |
| Strukturell (styre-rolle vs daglig leder) | 47 | Mest eier-ledere som er **både** styre/leder og daglig leder |

De 47 strukturelle er gjennomgående eier-ledere: Odd Reitan (Reitan AS), Johan Johannson (JOH Johannson Invest), Kjell Åge Stokbakken (Rema Industrier) m.fl. — registeret rapporterer «daglig leder», DB styre-rollen. Lav innsats; ingen endrer at interlocken finnes.

### 3.3 Selskapsnavn (26 `fieldDiffs`)

Alle av type «navn» — casing/juridisk form/ø-oe (f.eks. «Hallvard Leroey» vs «Hallvard Lerøy»). Kosmetisk.

## 4. Reelle tiltak (liten liste)

### 4.1 Orgnr-/entitetssaker for neste `db:import` (D4) — de eneste «harde»

| Selskap | Orgnr | Registerstatus | Handling |
|---|---|---|---|
| **NTS ASA** | 952587687 | ikke funnet | Fusjonert inn i SalMar (2022) — map til etterfølger / merk historisk |
| **Hallvard Leroey AS** | 914353561 | ikke funnet | ø/oe-form + reorganisert under Lerøy — rett navn/orgnr |
| **SalmoNor AS** | 952662813 | slettet | Konsolidert inn i SalMar — merk slettet/etterfølger |
| ASKO Transport AS | 999320600 | slettet | Avviklet enhet — merk slettet |
| Coop Norge Kaffe AS | 882722422 | slettet | Avviklet enhet — merk slettet |
| Uno-X E-Mobility Norge AS | 928211398 | slettet | Avviklet enhet — merk slettet |

De tre øverste er nettopp NTS/SalmoNor/Hallvard Lerøy-trioen som ble flagget i master-handover §3.5 og runbook §5. AP-6 konsern-rollup (SalMar inkl. tidl. NTS/SalmoNor) er allerede stikkprøvet mot Brønnøysund (PR #189), så maktkart-siden er dekket; dette gjelder kun import-hygiene.

### 4.2 Anbefalte normaliseringsfikser (rydder bulk, ikke per-rad-arbeid)

1. **personKey-normalisering** (størst effekt): Unicode-fold ø/æ/å konsist og match på første+siste navneledd i `validate-against-brreg` og/eller board-importen. Forventet effekt: rydder ~203 personpar og ~107 av 124 selskap i én operasjon.
   - **✅ Implementert i validatoren (2026-06-15 kveld):** `loosePersonKey` (kollapser ø/oe + å/aa) + `nameSignature` (fornavn|etternavn) som konservativ to-pass-fallback i `compareCompany`, + 6 enhetstester (15/15 grønne, ESLint ren). Replay mot ekte audit-data: **432 → 42 medlemsliste-linjer**, 195 par kollapset (45 beholdt som rolleavvik), **104/124 selskap ryddet**. De resterende 42 (15 missing / 27 stale i 20 selskap) er de genuint undersøkelsesverdige.
   - **✅ Import-skript alignet (2026-06-15 kveld):** 21 `scripts/import-*.ts` migrert fra lokal NFD-only-normalizer til delt `canonicalPersonKey` (`src/lib/person-key.ts`) — samme nøkkel som dedupe-person-keys og /graf. Validatoren gjenbruker den nå òg. ESLint, Next build og 544/544 tester grønne; `npx tsc --noEmit` har fortsatt pre-eksisterende test-typing-funn utenfor denne endringen. Future-imports produserer dermed kanoniske nøkler ved kilden.
   - **Gjenstår (lokal DB):** kjør `npm run db:import` + `scripts/dedupe-person-keys.ts --commit` så *eksisterende* rader re-nøkles kanonisk, og `enrich-offentligdata` + `pickCanonicalName` backfiller ø/å-visningsnavn til `/styremedlemmer` og `/graf` (jf. §6). Validator- + import-fiksen gjør auditen ærlig og fremtidige imports konsistente; selve DB-/visnings-reconciliasjonen er det gjenstående DB-steget.
2. **Rolle-mapping**: behandle CEO=daglig leder, chair=styreleder som synonymer i validatoren (fjerner 147 «avvik» som ikke er avvik).
3. **styremedlem/varamedlem**: ta registeret som fasit i en batch-pass (349 linjer), eller aksepter eksplisitt som dokumentert restavvik.
4. **≤5 mulige ekte styre-endringer**: øyne-sjekk (start Norgesfor 916329717-klyngen).

## 5. Maktkart-vurdering

Avvikene er navneform (klasse 3.1), rolletittel (3.2) og selskapsnavn-form (3.3) + register-vintage. Ingen rører **eksistensen eller strukturen** av styre-interlockene blant toppkonsernene (NorgesGruppen, Reitan, Coop, TINE, Nortura, Orkla, Mowi, SalMar, Lerøy). Den siterbare påstanden — strukturell posisjon, triangulert AP-1 + AP-5 + kryss-node-HHI — står uendret. Forbeholdet i auditen («triage, ikke autosannhet») er allerede den rette rammen.

## 6. B4-kobling (synlig på plattformen)

Fordi DB og register er uenige om navne**form** for ~203 styremedlemmer, viser `/styremedlemmer` og `/graf` DB-ens kortform/translitterasjon (f.eks. «Arne Moegster» i stedet for «Arne Møgster», «Kjersti Hoeboel» i stedet for «Kjersti Helen Krokeide Hobøl»). Riktige personer, men anglifiserte/forkortede visningsnavn. Vurder å backfille register-navneform for penere visning — samme normaliseringsfiks som 4.2.1 løser begge.

## 7. Verifikasjon

Tall hentet direkte fra `research/brreg-validation-audit.json` (254 results). Paringen brukte Unicode-folding + første/siste-navnematch per selskap; en første telling som leste feil felt (`name` i stedet for `personName` på DB-siden) ble fanget og rettet før konklusjon. Dette notatet dokumenterer triagen; kodeendringene ligger i validatoren og import-skriptene, mens selve DB-rekeyingen gjenstår som eksplisitt lokal operatørhandling.
