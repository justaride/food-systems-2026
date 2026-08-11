---
tittel: Food Systems 2026 — operativ plan for gaplukking og faseovergang
dato: 2026-08-11
status: kjørbar intern arbeidsplan; åpner ingen eksterne porter
eier: prosjektledelsen inntil ansvarlig langsiktig eier er vedtatt
kanonisk_status: ../status/food-systems-completion-register-2026-07-15.md
gapregister: ../../../research/_status/information-gap-register-2026-08-11.jsonl
readiness_rapport: ../status/food-systems-phase-readiness-2026-08-11.md
---

# Operativ plan for gaplukking og faseovergang

## 1. Formål og myndighetsgrense

Planen gjør informasjonsgapene kjørbare. Den autoriserer ikke ekstern kontakt,
databaseapply, migrasjon, publisering, pilot, finansieringssøknad eller
langsiktig drift. Slik handling krever den eksplisitte eier-/rettighets-/release-
porten som er angitt per gap.

Completion-registeret er kanonisk. Gapregisteret er kø. Readiness-rapporten er
beslutningsanalyse. Ingen av de to siste kan alene flytte en completion-status.

## 2. Statusmodell for hvert gap

| Status | Betydning | Tillatt handling |
|---|---|---|
| `blocked_external` | Neste reelle handling krever vedtak, credential, rettighet eller ekstern/kvalifisert aktør. | Forbered pakke og stopplinje; ikke simuler lukking. |
| `ready_to_execute` | Metode, input, eierrolle og exitkriterier er definert. | Start etter at angitte avhengigheter er lukket. |
| `monitoring` | Hullet er kontrollert og overvåkes etter kadens. | Datert recheck; ingen tvangslukking. |
| `parked` | Senere fase eller mangler valgt driftsnivå. | Bevar design og startbetingelse. |
| `open` | Gapet er kjent, men arbeidskontrakten er ufullstendig. | Fullfør kontrakten før research. |

Et gap er ikke lukket når et dokument er skrevet. Det er lukket når alle
`exitCriteria` i JSONL-posten er oppfylt, valideringen er kjørt, kvitteringen er
lagret og completion-registeret er oppdatert.

## 3. Arbeidsbaner

### Bane A — styring, recovery og release

**Gap:** `IG-001`, `IG-002`, `IG-003`, `IG-004`, `IG-005`.

Rekkefølge:

1. Vedta hjem, eier og driftsnivå.
2. Avklar closeout og videreføringsmandat.
3. Vedta data-/person-/publiseringsansvar.
4. Etabler og test off-node restore.
5. Reconcile schema og migrasjonsledger med minste privilegium.
6. Deploy bare via PR, grønn CI, eksakt merged SHA og runtime-readback.

**Stopplinje:** PR #342 forblir draft inntil alle fire releasegrenser i PR-en
og `IG-003`/`IG-004` er lukket med kvitteringer.

### Bane B — faglig evidens og varig kildegrunnlag

**Gap:** `IG-006`, `IG-008`, `IG-015`, `IG-018`.

Rekkefølge:

1. Tre fulltekstpiloter får navngitt appraisal.
2. Reviewere kalibrerer studiedesign, risk of bias og anvendbarhet.
3. Outcome-claims prioriteres etter beslutningsverdi og risiko.
4. Uavhengige evalueringer søkes claim-for-claim.
5. Publiseringskritiske locatorer arkiveres lovlig og hashkontrolleres.
6. Staging, import, citation readiness, appraisal og publiserbarhet avstemmes i
   én datert readback.

**Stopplinje:** mange eierkilder, teknisk citation readiness eller maskinelt
sammendrag er ikke appraisal eller uavhengig effektevidens.

### Bane C — menneskelig og kvalitativt lag

**Gap:** `IG-007`, med avhengigheter til `IG-005` og senere `IG-014`/`IG-016`.

Minimumspilot:

| Rolle | Kunnskapshull | Minimum |
|---|---|---:|
| Produsent/bonde | faktisk handlingsrom, risiko og overgangsbarrierer | 1 |
| Uavhengig leverandør/foredler | makt, avtaler, marginpress og innovasjon | 1 |
| REKO-/lokalmatadministrator | sosial infrastruktur, drift og kanaldata | 1 |
| Offentlig innkjøper/beredskapsrolle | implementering, data og ansvar | 1 |
| Gründer/sirkulær aktør | finansiering, skalering, feil og utilsiktede effekter | 1 |

Før kontakt må pakken ha formål, utvalgskriterier, informasjonsbrev, samtykke,
lagring/sletting, sitatgodkjenning, tilbaketrekking, analysemetode og avviksløp.
Samiske kunnskapsbærere og tradisjonell kunnskap krever særskilt rolle-, språk-,
eierskaps- og sitatreview; de inngår ikke automatisk i fem-rolle-piloten.

**Stopplinje:** sekundærkilder og prosjektbeskrivelser blir aldri prosjektets
egne stakeholderstemmer.

### Bane D — nordisk og tematisk dybde

**Gap:** `IG-009`, `IG-010`, `IG-011`, `IG-012`, `IG-017`.

Prioritert rekkefølge:

1. Løs de navngitte prosjektkandidatene før nytt breddepass.
2. Frys tre nordiske sammenligningsceller, periode og definisjoner.
3. Koble åpne aktivitetssignaler for sjømat, REKO/CSA og alternativt protein.
4. Bygg avgrenset N/P/K-ledger med eksplisitte systemgrenser.
5. Kjør én kommunal offentlig-innkjøp/lokalmatkanalpilot.
6. Gjennomfør landpartnerreadback på tabellnivå.

**Stopplinje:** forekomst er ikke aktivitet; kapasitet er ikke realisert volum;
partnerreadback er ikke partnercommitment; True-C er ikke null.

### Bane E — senere produkt og observatorium

**Gap:** `IG-013`, `IG-014`, `IG-016`.

Denne banen åpnes bare dersom Bane A er grønn og Fase 3 får eget vedtak. Første
pilot skal være smal:

- ett bitemporalt kantdomene;
- ett reviewet kausalitetscase;
- én intern/ekstern oppgavepilot på prosjektlandskapet.

Ingen automatisert agent får skrive direkte til publisert sannhet. Agenten
produserer hendelses- eller claim-kandidater til menneskelig triage.

## 4. Fase-0-beslutningsmøte

### Deltakere

- JT/Cathrine/Einar/Gabriel;
- representant for foreslått organisatorisk hjem;
- foreslått data-/teknisk operatør;
- juridisk/personvern-rolle dersom aktiv videreføring vurderes.

### Obligatorisk agenda

1. Velg driftsnivå: bevaring, vedlikeholdt plattform eller observatorium.
2. Utpek ansvarlig eier, dataoperatør, kunnskapsforvalter og juridisk reviewer.
3. Aksepter/avvikshåndter M16–M18 og loggfør geografisk scope.
4. Vedta kontant/in-kind-ramme, runway, RPO/RTO og stopplinje.
5. Velg om PR #342 skal bringes til release etter backup/reconciliation, eller
   om den fortsatt parkeres.
6. Vedta nivå for intern, partnerdelt og offentlig bruk.
7. Godkjenn eller parker Fase 1-arbeidspakkene.

### Kvittering

Møtet er ikke ferdig med «enighet». Det skal produsere daterte rader i
`decision-log-food-tg.md` med beslutning, eier, begrunnelse, lukket gate og
referanse. Manglende beslutning skal loggføres som eksplisitt parkering eller
bevaringsmodus.

## 5. Ukentlig operativ rytme i aktiv fase

| Tidspunkt | Kontroll | Utdata |
|---|---|---|
| Mandag | Prioriter åpne P0/P1 etter avhengighet og beslutningsverdi. | Maks tre aktive gap; navngitt eier og ukesmål. |
| Onsdag | Evidens-/rettighetsreadback. | Nye kilder/findings får status, locator og neste gate. |
| Fredag | Closure review. | Kvittering, avvik eller fortsatt blokkering; ingen muntlig «nesten ferdig». |
| Månedlig | Produksjon, kildehelse, backup, staleness og kost. | Datert driftsreadback og beslutning om videre arbeid. |
| Kvartalsvis | Scope, risiko, brukerbehov og finansiering. | Fase-go/no-go eller bevaringsmodus. |

Work in progress-grensen er tre gap. Minst ett skal være P0 inntil alle P0-gater
er lukket. Ny bred research åpnes bare når en dokumentert celle eller claim har
beviskrav og eier.

## 6. Standard arbeidsflyt per informasjonsgap

1. **Kontrakt:** kopier gap-ID, nåtilstand, impact, eierrolle, avhengigheter og
   exitkriterier fra registeret.
2. **Preflight:** kontroller at kilde-/menneske-/rettighets-/databaseautoritet er
   til stede. Hvis ikke: stopp som `blocked_external`.
3. **Innhenting:** bevar original identitet, publiseringsdato, aksessdato,
   locator, basis, geografi, systemgrense og bruksrett.
4. **Ekstraksjon:** lag claim-/feltkoblede funn; skill kildeutsagn fra intern
   analyse.
5. **Appraisal:** vurder design, bias, relevans, uavhengighet og overførbarhet.
6. **Menneskereview:** navngitt person godkjenner, avviser eller sender tilbake.
7. **Plan/dry-run:** vis nøyaktig DB-/registerdelta og bevar kandidater separat.
8. **Apply:** bare hvis eksplisitt autorisert og med backup/rollback.
9. **Readback:** verifiser database, appflate og eksakt deploy-SHA der relevant.
10. **Propagering:** oppdater completion-registeret og supersession-notat; ikke
    dupliser sannhet i en ny statusrapport.

## 7. Closure receipt

Bruk denne strukturen i et datert statusnotat eller maskinlesbar kvittering:

```yaml
gap_id: IG-000
closed_at: YYYY-MM-DDTHH:MM:SSZ
owner: navn/rolle
previous_status: ready_to_execute
new_status: closed|partially_closed|monitoring|blocked_external|parked
scope_closed: eksakte claims/celler/porter
scope_remaining: eksakte åpne deler
evidence:
  - fil, URL, run eller beslutningsrad
rights_and_ethics: kontroll og resultat
validation:
  commands: []
  readback: []
  reviewer: navn/rolle
completion_register_change: rad/seksjon eller ingen endring med grunn
next_review_at: YYYY-MM-DD
```

Ingen `closed` uten dokumentert eier, bevis og validering. `partially_closed`
skal alltid angi hva som fortsatt er åpent.

## 8. RACI for neste steg

| Arbeid | Accountable | Responsible | Consulted | Informed |
|---|---|---|---|---|
| Hjem, mandat, driftsnivå | Valgt organisatorisk hjem | Prosjektledelsen | TG/NCH | Team/partnere etter vedtak |
| Backup, migrasjon og runtime | Systemeier | Data-/teknisk operatør | Kunnskapsforvalter | Prosjekteier |
| Claim-lock, appraisal og kildearkiv | Prosjekteier/publisher | Kunnskapsforvalter + fagreviewer | Juridisk reviewer | Domeneeiere |
| Intervju og partnerreadback | Prosjekteier | Stakeholderansvarlig | Juridisk/personvern + fagreviewer | Respondenter etter avtale |
| Nordisk/domain-dyping | Program-/produkteier | Nordisk spor-/domeneeier | Landreviewere/dataeiere | Team |
| Ekstern produktpilot | Publisher/produkteier | Produkt-/tjenestedesignansvarlig | Juss, support, fagreview | Brukere/partnere etter vedtak |

En rolle er ikke fylt før person/enhet, myndighet, kapasitet, startdato og
reviewdato er dokumentert.

## 9. Faseporter

### Fase 1 kan åpnes når

- `IG-001`, `IG-003` og `IG-005` er lukket;
- `IG-002` har eksplisitt videreførings- eller bevaringsvedtak;
- `IG-004` er lukket dersom Fase 1 krever produksjonsappraisal/import;
- reviewere og stakeholderansvarlig er navngitt.

### Fase 2 kan åpnes når

- Fase 1-pilotene har godkjent metode og rettigheter;
- tre nordiske/domain-celler er frosset med periode og definisjon;
- domeneeiere har kapasitet og stoppsignal;
- dataapply er eksplisitt autorisert eller arbeidet er avgrenset til filer/dry-run.

### Fase 3 kan åpnes når

- P0 er grønn;
- publiseringskritiske claims har appraisal, locator og varig kopi;
- personvern, retting, support, staleness og serviceeier er vedtatt;
- en oppgavebasert brukerpilot har tydelig verdi og avgrensning;
- produksjon har restore-bevis og eksakt-SHA releasebevis.

### Fase 4 kan åpnes når

- flerårig nordisk hjem og finansiering er vedtatt;
- partnerroller og datarettigheter er avtalefestet;
- vedlikehold er bevist over minst to sykluser;
- uavhengig metode- og sikkerhetsreview er gjennomført.

## 10. Verifikasjon og vedlikehold

```bash
npm run phase:validate
npm run landscape:validate
npm run audit:research-artifacts -- --base=origin/main
git diff --check
```

`phase:validate` kontrollerer registerets eksakte schema/enums, 18 unike gap,
fem P0-gater, ISO-datoer, avhengigheter, lokale evidensreferanser og full
ID-paritet mellom register, readiness-rapport og denne planen.

Ved neste statusdato kopieres ikke registeret ukritisk. Opprett en ny datert
versjon, før supersession-notat i completion-registeret, og bevar denne som
reproduserbar 11. august-baseline.
