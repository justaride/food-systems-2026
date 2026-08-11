---
tittel: Food Systems 2026 — prosjektvurdering og faseberedskap
dato: 2026-08-11
status: kontrollert intern beslutningsstøtte
gate: internal
scope: prosjektmodenhet, informasjonsgap, drift, produkt og videre faser
kanonisk_status: food-systems-completion-register-2026-07-15.md
gapregister: ../../../research/_status/information-gap-register-2026-08-11.jsonl
operativ_plan: ../mandates/gap-closure-operating-plan-2026-08-11.md
---

# Food Systems 2026 — prosjektvurdering og faseberedskap

## 1. Beslutningsdom

**Prosjektet er klart for en kontrollert validerings- og prioriteringsfase, men
ikke for å opptre som et fullt eksternt nordisk matsystemobservatorium.**

| Bruk | Dom 2026-08-11 | Begrunnelse |
|---|---|---|
| Intern beslutningsstøtte, porteføljevalg og målrettet research | **GO** | Kunnskapsbase, kildegater, app, prosjektlandskap og produksjonsdrift gir et reelt arbeidsgrunnlag. |
| Kontrollert appraisal, intervjupilot, partnerreadback og datadyping | **BETINGET GO** | Arbeidspakkene er klare, men eier, rettigheter og reviewere må navngis før menneske- og produksjonsgater åpnes. |
| Ekstern publisering av brede fakta-, person-, effekt- eller partnerpåstander | **NO-GO** | Publiseringspolicy, appraisal, egne stemmer, uavhengig evaluering og juridisk gate er ikke lukket. |
| Automatisk oppdatering, produksjonsmigrering av kunnskapslaget og observatoriumsdrift | **NO-GO** | Ekstern backup og restore er bevist i GabiBFree Estate, men RPO/RTO/eier, migrasjonsreconciliation, minste privilegium og operativ `LibraryAnalysisRecord` mangler. |
| Pilot-, effekt- eller finansieringscommitment | **NO-GO** | Dossierer og funding-match er ikke pilot, partnercommitment eller finansiering. |

Denne rapporten oppretter ikke et parallelt sannhetsregister. Flytting av
status skjer bare i
[completion-registeret](./food-systems-completion-register-2026-07-15.md),
etter reglene der. Det maskinlesbare
[gapregisteret](../../../research/_status/information-gap-register-2026-08-11.jsonl)
er arbeidskø under completion-registeret.

[Grensen mot GabiBFree Dashboard](./cross-project-control-boundary-2026-08-11.md)
fastsetter at Food Systems eier faglig status og arbeidskø, mens GabiBFree
Estate eier infrastruktur-, backup- og restorestatus. Et porteføljesammendrag
kan peke hit, men skal ikke kopiere gaprader eller prosjektoppgaver.

## 2. Hva prosjektet konkret har blitt

Arbeidet har ledet til fire sammenhengende kapabiliteter:

1. **En produksjonssatt, styrt kunnskapsapp.** Appen og kjernedatabasen svarer,
   sentrale sideporter er grønne, og `/prosjektlandskap` viser det nye
   beslutningsgrunnlaget.
2. **En fail-closed evidensmaskin.** Claims, kilder, locatorer, feltkoblinger,
   readiness og stoppregler er implementert. Systemet kan synlig la et hull
   stå åpent i stedet for å fylle det med en proxy.
3. **Et bredt innsamlet og bearbeidet kunnskapsgrunnlag.** Norge-laget er rikt
   på aktører, selskaper, dokumenter og struktur. Augustinntaket har lagt til
   ferske kilder og claim-koblede citations.
4. **Et kvalitativt og nordisk prosjektlandskap.** 40 sammenlignbare profiler
   gjør metode, geografi, kvalitative praksiser, rettigheter og evidenskvalitet
   synlig uten å blande strategisk relevans og bevisstyrke.

Det viktigste nye funnet er derfor ikke at prosjektet trenger «mest mulig mer
data». Det trenger en kontrollert overgang fra **samlet materiale** til
**menneskelig vurdert, rettighetsklar, uavhengig corroborert og vedlikeholdt
kunnskap**.

## 3. Verifisert nåtilstand

Kontrollen kombinerer repoet på `origin/main`, produksjonsendepunkter og siste
produksjonskvitteringer. Tall under er interne drifts-/registertall, ikke nye
matsystemclaims.

| Kontrollflate | Verifisert resultat | Bruksgrense |
|---|---|---|
| Repo | `origin/main` = `a15eec5`; eneste delta etter live funksjonell SHA er Coolify-snapshotet `research/_status/coolify-snapshots/2026-08-11.json`. | Snapshot-commit er ikke runtimefunksjon. |
| Produksjonsversjon | `/api/version` = `67b13ac`, bygget 2026-08-11 06:27 UTC. Coolify SHA Sync-run 31433594409 er grønn. | Dette beviser deployet appkode, ikke alle menneske-/data-/publiseringsporter. |
| Produksjonshelse | `/api/data-status` = HTTP 200, `dbOk=true`, `pageGatesOk=true`; blant annet 1 460 dokumenter, 205 aktører, 186 selskaper og 60 310 leveransevolumrader. | Baseline- og sideterskler er ikke evidenskvalitetsmål. |
| Kunnskaps-/appraisalflate | `/api/library-analysis/status` = HTTP 503, `total=0`, `readinessPct=0`. | Produksjonens `LibraryAnalysisRecord`-lag er ikke operativt. |
| Augustinntak | Dagens filreadback gir 135 staged filer, 128 ekstraksjonsposter, 125 unike ikke-tomme URL-er og 335 finding-poster. 1 ekstraksjonspost mangler URL-lokator; én register-URL forekommer i tre poster. Siste rensede prod-run 31022133733 registrerte 55 `SourceDoc` og 91 `SourceCitation`, med 90 `citable_external` og 1 `internal_context`. | Commit-overskriftens eldre 165/279-oppsummering er ikke kanonisk. Staged, importert, citation-ready, appraised og publiserbar er ulike nivåer. |
| Prosjektlandskap | 40 hovedprofiler, 22 kandidat-/disposisjonsrader og 100 kilder; 20 kilder klassifisert uavhengige, 17 profiler med kvalitativ/etnografisk/deltakende metode. | 0 uavhengig evaluerte kvalitative funn; eierutfall er fortsatt rapporterte. |
| Produksjonsdrift og recovery | Hyppige DB-watcher-runs er grønne. GabiBFree Estate har separat backup-, restore- og offsite-bevis for `coolify:l0s8o8oo00c8gossw0gksswk`; fullkjøringen 11. august bandt artefakt og restore til samme SHA-256. | Coolifys egne 0 backupplaner er ikke backupfasit. RPO/RTO, eier, uovervåket kadens og fersk pre-migration-kvittering står fortsatt åpne i `IG-003`. |
| Åpen integrasjonsflate | Draft-PR #342 er grønn i PR-CI, men dokumenterer schema-/migrasjonsdrift og manglende produksjonsforutsetninger. | PR-en er med rette NO-GO for merge til minst privilegert credential, ledger/schema-reconciliation, fersk releasebackup og runtimeporter er lukket. |

## 4. Modenhetsvurdering

Skalaen er intern og beslutningsorientert: 0 = ikke etablert, 1 = skissert, 2 =
delvis operativt, 3 = operativt med tydelige avgrensninger, 4 = kontrollert og
reproduserbart, 5 = vedlikeholdt og uavhengig validert i faktisk bruk. En høy
teknisk score overstyrer aldri en rød gate.

| Dimensjon | 0–5 | Vurdering |
|---|---:|---|
| Teknisk plattform og releasekjede | 4 | App, CI, Coolify, DB-watcher, versjons- og datastatus er operative og verifiserbare. |
| Proveniens, claim-lock og fail-closed kontroll | 4 | Sterkeste egenskap; kilde-/feltkobling og stopplinjer er gjennomgående. |
| Kartleggingsbredde | 4 | Norge-bredden er høy og prosjektlandskapet dekker Norden/Sápmi, men run-floor er ikke census. |
| Faglig evidenskvalitet | 2 | Mange kilder og citations, men appraisal, uavhengig outcome-evidens og arkivdekning er utilstrekkelig. |
| Kvalitativ primærevidens | 1 | Metoder og eksterne referanser er kartlagt; egne samtykkede stemmer mangler. |
| Nordisk sammenlignbar dybde | 2 | Forekomstdekning er bedre; harmoniserte data, FI/IS, MVK og partnerreadback er fortsatt svake. |
| Domene-/aktørdybde og materialstrøm | 2 | Mange navn og strukturer; aktivitet, volum, N/P/K og kausalitet er fortsatt hovedhull. |
| Styring, ansvar og økonomi | 1 | Planene er klare, men hjem, eier, driftsnivå, budsjett og formell closeout er åpne. |
| Drift, backup og recovery | 3 | Runtime, kryptert offsite-kopi og isolert restore er bevist; RPO/RTO, eier, uovervåket kadens og migrasjonsrehearsal er ikke lukket. |
| Produktverdi og ekstern tjeneste | 2 | Intern nytte og produksjonsflate finnes; ekstern bruker-/tjenestemodell er ikke validert. |

**Samlet modenhetsdom:** teknisk og metodisk fundament er på nivå 3–4, mens
institusjonell, faglig og menneskelig readiness er på nivå 1–2. Det er derfor
misvisende å beregne ett samlet gjennomsnitt: fem P0-gater blokkerer neste
eksterne fase uansett teknisk modenhet.

## 5. Informasjonshullene som styrer neste fase

### P0 — må lukkes før aktiv videreføring eller risikofull produksjonsendring

| Gap | Hva mangler | Konkret port |
|---|---|---|
| `IG-001` | Organisatorisk hjem, eier og driftsnivå | Datert vedtak med myndighet, tid, start/review og stopplinje. |
| `IG-002` | Formell closeout og videreføringsmandat | M16–M18 readback og eksplisitt aksept, avvik eller bevaringsmodus. |
| `IG-003` | Recovery-governance | Backup, to offsite-kopier og restore drill er bevist i GabiBFree; RPO/RTO, eier, uovervåket kadens og fersk releasekvittering mangler. |
| `IG-004` | Migrasjonsreconciliation og kunnskapsruntime | Minst privilegert credential, reconcilet ledger/schema og grønt runtime-endepunkt. |
| `IG-005` | Personvern, rettigheter, retting og publiseringspolicy | Kvalifisert review og vedtatt policy per dataklasse. |

### P1 — gjør prosjektet faglig og beslutningsmessig sterkere

| Gap | Nåtilstand | Lukkingsretning |
|---|---|---|
| `IG-006` | 0/417 ferdige appraisal-disposisjoner i siste kontrollerte audit | Tre fulltekstpiloter, kalibrert workflow, deretter prioritert topp-50. |
| `IG-007` | Ingen egen samtykket intervjuserie | Fem-rolle pilot med rettighets- og sitatport. |
| `IG-008` | 0 uavhengig evaluerte prosjektutfall | Claim-for-claim evalueringssøk og dokumenterte nullfunn. |
| `IG-009` | Norden dekkes i forekomst, ikke i jevn dybde | Frosset scope, tre harmoniserte celler og landpartnerreadback. |
| `IG-010` | Registerforekomst uten sikker aktivitet/volum | Aktivitetssignal for sjømat, REKO/CSA og alternativt protein. |
| `IG-011` | Ingen full realisert N/P/K-/massebalanse | Celleledger med målt/modellert/plan/kapasitet og bevarte True-C-hull. |
| `IG-012` | Ingen robust offentlig innkjøps-/lokalmatkanalbaseline | Liten kommunal pilot og avklart taksonomi/nevner. |
| `IG-015` | Stor arkiv-/rettighetsgjeld | Prioritert varig bevaring av publiseringskritiske kilder. |
| `IG-017` | Kandidater, smågeografier og tynne kvalitative tema | Identitetsløs kandidater før nytt breddepass. |
| `IG-018` | Statusflater har ulik vintage og granularitet | Generert readback fra staging via import/appraisal til publiserbarhet. |

### P2 — bygges først når driftsnivå og ekstern ambisjon er vedtatt

- `IG-013`: temporalitet, hendelseslogg og staleness.
- `IG-014`: reviewet kausalitets-/effektcaseklasse.
- `IG-016`: ekstern bruker-, tjenestenivå- og verdimodell.

## 6. Prosessen for å tette hull uten å skape ny kunnskapsgjeld

```text
gap registrert
  → eier og gate klassifisert
  → beviskrav og rettigheter definert
  → kilde/menneske/data innhentet
  → identitet og lokator verifisert
  → ekstraksjon og appraisal
  → claim-/feltkobling
  → navngitt menneskereview
  → kontrollert import/dry-run
  → readback i produksjon
  → completion-register oppdatert
```

Hvert hull skal ende i én av fem ærlige tilstander:

- **lukket:** alle exitkriterier og readback er dokumentert;
- **delvis lukket:** konkrete celler/claims er oppgradert, resten står åpent;
- **human-gated:** neste handling krever vedtak, samtykke eller kvalifisert review;
- **source-gated:** kilde/tilgang mangler eller er uegnet;
- **True-C/future:** hullet er datert, forklart og overvåkes eller er bevisst parkert.

Detaljert rolle-, kadens- og kvitteringsprosess står i
[gap closure operating plan](../mandates/gap-closure-operating-plan-2026-08-11.md).

## 7. Faseplan

| Fase | Formål | Inngangsport | Utgangsbevis | Dom nå |
|---|---|---|---|---|
| Fase 0 — styring og recovery | Gjøre videre arbeid legitimt og reverserbart. | Dagens interne underlag. | `IG-001`–`IG-005` lukket eller eksplisitt bevaringsmodus. | **START NÅ** |
| Fase 1 — kontrollert validering | Gjøre høyverdiinnhold appraised, stemmeforankret og kildevarig. | Eier, rettighetspolicy og trygg drift. | Pilotappraisal, intervjupilot, outcome-evaler og datert statusreadback. | **BETINGET GO** |
| Fase 2 — evidensdybde | Løfte utvalgte nordiske/domain-celler fra forekomst til aktivitet, strøm og mekanisme. | Frosset scope og navngitte domeneeiere. | Harmoniserte landceller, aktivitetssignaler, N/P/K-ledger og kommunal pilot. | **PLAN KLAR** |
| Fase 3 — eksternt produkt | Publisere et avgrenset, rettingsbart og støttet tjenestetilbud. | Faglig/publiserings-/personverngate og brukerbehov. | Tjenestenivå, support, brukerpilot, staleness og ekstern acceptance pack. | **NO-GO** |
| Fase 4 — nordisk observatorium | Vedlikeholdt, temporal og partnerforankret infrastruktur. | Flerårig hjem, finansiering og nordisk styring. | Drift over minst to vedlikeholdssykluser og uavhengig review. | **FUTURE** |

## 8. Prioritert 0–90-dagers rekkefølge

### Dag 0–10: avgjør og sikr

1. Kjør fase-0-beslutningsmøte for `IG-001`, `IG-002` og `IG-005`.
2. Vedta RPO/RTO og eier, bekreft uovervåket GabiBFree-kadens og ta en fersk
   backup/restore-kvittering før migrasjon (`IG-003`).
3. Reconcile produksjonsmigrasjoner og gjør kunnskapsstatus operativ uten blind
   merge av PR #342 (`IG-004`).
4. Oppdater completion-registeret med kvitteringer, ikke muntlig status.

### Dag 10–30: valider det viktigste

1. Navngi fagreviewer og godkjenn tre appraisal-piloter (`IG-006`).
2. Godkjenn intervjuprotokoll; gjennomfør fem-rolle pilot først etter
   rettighetsport (`IG-007`).
3. Søk uavhengig evaluering for de høyest prioriterte prosjektutfallene
   (`IG-008`).
4. Arkiver kildene bak acceptance-claims og planlagte publikasjonsuttrekk
   (`IG-015`).
5. Bygg samlet staging→import→appraisal→publication-readback (`IG-018`).

### Dag 31–60: øk dybden selektivt

1. Harmoniser tre nordiske sammenligningsceller og gjennomfør partnerreadback
   (`IG-009`).
2. Koble aktivitetssignal for sjømat, REKO/CSA og alternativt protein
   (`IG-010`).
3. Bygg avgrenset N/P/K-ledger og bevar True-C-cellene (`IG-011`).
4. Kjør én kommunal innkjøps-/lokalmatkanalpilot (`IG-012`).
5. Løs navngitte landskapskandidater og smågeografi-/temahull (`IG-017`).

### Dag 61–90: ta ny fasebeslutning

Kjør en samlet readback mot alle fase-1/2-kriterier. Bare hvis P0 er grønn og
faglig/juridisk review er dokumentert, tas go/no-go på ekstern produktpilot,
temporalt lag og kausalitetscase (`IG-013`, `IG-014`, `IG-016`). Ellers velges
vedlikeholdt intern plattform eller bevaringsmodus.

## 9. Hva som ikke skal gjøres nå

- Ikke start ny generell aktør- eller verdenscensus.
- Ikke merge/deploy PR #342 før credential-, reconciliation-, fersk
  releasebackup- og runtimeportene er dokumentert lukket.
- Ikke kontakt intervjuobjekter eller samiske kunnskapsbærere før samtykke-,
  lagrings-, rettighets- og sitatporten er godkjent.
- Ikke behandle de 335 staged finding-postene, 91 citations eller 40
  prosjektprofilene som 335/91/40 eksternt validerte resultater.
- Ikke fylle True-C-celler med proxyer for å få en komplett figur.
- Ikke la grønn CI, grønn DB-helse eller en deployet side bli likestilt med
  restore-bevis, faglig readiness eller formell eieraksept. Restore-bevis leses
  fra GabiBFree Estate, ikke fra Coolifys planantall.

## 10. Klargjort beslutningspakke

Prosjektet er nå klargjort med:

- denne rangerte fase- og modenhetsvurderingen;
- et [maskinlesbart gapregister](../../../research/_status/information-gap-register-2026-08-11.jsonl)
  med eierrolle, avhengigheter, etikk, exitkriterier og validering per gap;
- en [operativ lukkingsplan](../mandates/gap-closure-operating-plan-2026-08-11.md)
  med kadens, beslutningsmøte, reviewflyt og kvitteringsmal;
- en validator som sikrer ID-, enum-, evidens-, avhengighets- og
  rapport/plan-paritet: `npm run phase:validate`;
- completion-registeret som fortsatt er eneste kanoniske statusflate.

Klargjort betyr her at arbeidet kan startes uten å gjette prosess, rekkefølge
eller ferdigdefinisjon. Det betyr ikke at menneske-, rettighets-, recovery- eller
publiseringsportene allerede er lukket.

## 11. Reproduserbar kontroll

```bash
npm run phase:validate
npm run landscape:validate
npm run test:landscape
npm test
npm run lint
npm run build
npm run audit:research-artifacts -- --base=origin/main
git diff --check
```

Produksjonsreadback 2026-08-11:

- [appversjon](https://food-systems.naturalstateproject.com/api/version)
- [datastatus](https://food-systems.naturalstateproject.com/api/data-status)
- [kunnskaps-/appraisalstatus](https://food-systems.naturalstateproject.com/api/library-analysis/status)
- [siste rensede augustimport](https://github.com/justaride/food-systems-2026/actions/runs/31022133733)
- [prosjektlandskap-release](https://github.com/justaride/food-systems-2026/actions/runs/31433594409)
- [åpen kunnskaps-/migrasjons-PR](https://github.com/justaride/food-systems-2026/pull/342)
- [grense og datert backupkvittering](./cross-project-control-boundary-2026-08-11.md)
