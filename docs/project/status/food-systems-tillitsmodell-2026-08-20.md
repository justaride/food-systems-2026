---
tittel: Food Systems 2026 — tillitsmodell for KI-generert kunnskap
dato: 2026-08-20
status: kontrollert intern styringsnote
gate: internal
scope: hvordan menneskelig kontroll skaleres uten per-element-validering
kanonisk_status: food-systems-completion-register-2026-07-15.md
gapregister: ../../../research/_status/information-gap-register-2026-08-11.jsonl
relatert: food-systems-phase-readiness-2026-08-11.md
---

# Food Systems 2026 — tillitsmodell for KI-generert kunnskap

## 1. Formål og premiss

Plattformens formål er at KI samler, organiserer og analyserer store mengder
matsystemdata, slik at mennesker etter hvert kan bruke uttakene med bred
forståelse — i dette prosjektet og forhåpentligvis videre. Det følger to
konsekvenser for kontrollarbeidet:

1. **Menneskelig validering per element skalerer ikke og er ikke målet.**
   Korpuset (1 615 dokumenter, 1 770 analyserader, 247 000+ feltkoblinger)
   skal ikke leses og godkjennes én rad om gangen.
2. **Tillit bygges i stedet gjennom tre ting:** sporbarhet (hver påstand har
   kilde og locator), målt pålitelighet (kjent feilrate for KI-pipelinen per
   dataklasse) og ansvar (navngitt eier for juss, rettigheter og publisering).

Hovedrisikoen kontrollapparatet retter seg mot er **KI-feil og
hallusinasjoner**: gale ekstraksjoner, feilkoblinger mellom claim og kilde,
oppdiktede tall og stille utfylling av hull. Sekundærrisikoen er juridisk og
etisk: personopplysninger, rettigheter og publiseringsgrunnlag.

## 2. Hva plattformen allerede garanterer maskinelt

Disse mekanismene er implementert, fail-closed og løper uten menneskelig
inngripen per element:

- **Claim-lock og source-locator:** ingen påstand uten kilde og locator;
  brudd stopper gaten i stedet for å slippe påstanden gjennom.
- **Feltkoblinger:** FieldCitation binder enkeltfelt til kilder og gjør
  stikkprøver og revisjon presise.
- **Statusnivåer:** `citable_external` / `citable_with_note` /
  `internal_context` / `blocked_unsourced` merker hva hver rad kan brukes
  til; ukildede rader er fail-closed blokkert.
- **True-C-disiplin:** hull bevares synlig som hull og fylles aldri med
  proxyer for å få en komplett figur.
- **Runtime-attestasjon:** import- og mutasjonsløp kjører bare på en
  verifisert, forseglet runtime, slik at uttakene er reproduserbare og
  manipulasjon feiler fail-closed.

Dette er anti-hallusinasjonsarkitekturen. Menneskelig innsats skal rettes dit
maskinene ikke rekker: å måle hvor pipelinen faktisk feiler, og å eie de
juridiske og etiske grensene.

## 3. Tillitsmodellen: tre nivåer

### Nivå 1 — Ansvar og juss (engangs- og klassevedtak, ikke datavalidering)

`IG-001` (eier/hjem), `IG-002` (mandat/closeout), `IG-003` (recovery-
governance) og `IG-005` (personvern-, rettighets- og publiseringspolicy) er
beslutninger, ikke gjennomgangsarbeid. De fattes én gang per klasse og
vedlikeholdes ved endring. `IG-005` er allerede klassebasert («publiseringsnivå
per dataklasse er vedtatt») og krever ikke per-element-review — med ett
unntak: ekstern publisering av person- og effektpåstander, som er lovregulert
uavhengig av KI-kvalitet.

### Nivå 2 — Kalibrering (utvalgsbasert måling, erstatter uttømmende appraisal)

`IG-006` og review-køen i library-analysis leses som **kalibrering**, ikke som
krav om at et menneske vurderer alle 417 dokumenter eller alle 399 køposter:

- Navngitt reviewer godkjenner tre pilotdisposisjoner og fastsetter
  inter-reviewer-regler (uendret fra gjeldende plan).
- Deretter trekkes et **stratifisert utvalg** (per kildetype og dataklasse),
  og KI-pipelinens feilrate måles mot fulltekst.
- Feilraten **publiseres som tillitsmetadata** i statusflaten, slik at
  brukere ser hvor pålitelig hver dataklasse er og kan kontrollere kilden
  selv.
- Review-køen triageres maskinelt: bare høyrisikoklasser (nivå 3) og
  utvalgsposter går til menneske; resten rir på kildeføring + målt feilrate
  med synlig merking.
- Kalibreringen gjentas når pipelinen endres vesentlig (ny modell, ny
  ekstraksjonslogikk, ny kildetype).

### Nivå 3 — Per-element-review kun for høyrisikoklasser

Menneskelig vurdering per element kreves bare der feil har juridisk eller
faglig alvorlig konsekvens:

- personpåstander og maktkart ved ekstern publisering (GDPR/rettigheter);
- kausal-, helse- og «forskningen viser»-påstander;
- oppgradering av en rad til `citable_external`.

Alt annet publiseres med nivåmerking og målt feilrate i stedet for
menneskelig signatur.

## 4. Hva denne noten endrer — og ikke endrer

**Endrer:**

- Metoden i `IG-006`: fra implisitt uttømmende appraisal til pilot +
  stratifisert kalibrering + topp-50 avgrenset til høyrisikoklassene.
- Lesingen av review-køen: triage etter risikoklasse, ikke «les alt».
- Suksesskriteriet for tillit: «målt og synlig pålitelighet» erstatter
  «menneskegodkjent per element» for alt under nivå 3.

**Endrer ikke:**

- Completion-registeret som eneste kanoniske statusflate; denne noten flytter
  ingen gap-status og oppretter ikke et parallelt sannhetsregister.
- NO-GO for bred ekstern publisering av person-, effekt- og partnerpåstander
  før `IG-005` er lukket.
- Kravet om navngitt, datert menneskereview for `externalReady` i
  library-analysis — men kravet gjelder kalibrerings- og
  høyrisikoreviewene, ikke alle 1 770 rader.
- Oppdateringsregelen i registeret: human-gated flyttes fortsatt ikke fordi
  et utkast finnes.

## 5. Operasjonalisering

Neste konkrete artefakter, i rekkefølge:

1. **Utvalgsplan** (under `research/_plans/`): strata, utvalgsstørrelse per
   dataklasse, feilratedefinisjon og stoppregler. Lages sammen med navngitt
   reviewer i `IG-006`-piloten.
2. **Tillitsmetadata i statusflaten:** feilrate per dataklasse eksponeres i
   `/api/library-analysis/status` og på relevante sider når første
   kalibreringsrunde er gjennomført.
3. **Triage-regler for review-køen:** maskinell klassifisering av de 399
   køpostene i nivå 2/nivå 3, dokumentert i library-analysis-kontrakten.

Kontroll for denne noten: `npm run phase:validate` og `git diff --check`.
