# Food TG Cockpit v0.2 Design

Dato: 2026-05-21

Status: Designspesifikasjon for implementering etter godkjenning

## Formål

Food TG har nå en intern beslutningspakke og et kontrollag for claims, figurer, cases, kilder og validering. Neste plattformsteg er å gjøre dette operativt i applikasjonen, slik at `/mandat` blir styringsflaten der teamet ser hva som er klart, hva som må vente, og hvilke kandidatspor som kan jobbes videre.

Dette er ikke en ekstern presentasjonsflate, ikke et pilotløfte og ikke et roadmap. Cockpiten skal hjelpe prosjektet å holde statusdisiplin mens kunnskapsbasen utvikles videre.

## Beslutning

Vi utvider eksisterende `/mandat` i stedet for å lage en ny Food TG-side først.

Begrunnelse:

- `/mandat` er allerede Food TG-styringsflaten.
- `src/lib/data/food-tg-mandate.ts` har eksisterende datakontrakter for status, spor, dokumenter, claim board, sprint og stoppsignaler.
- En inkrementell utvidelse gir lavere risiko enn å etablere et parallelt produktspor.
- Eksisterende navigasjon, kortkomponenter og statusbadges kan gjenbrukes.

## Scope

Skal implementeres:

- Oppdatert mandatstatus per 2026-05-21.
- Strukturert kontrollpakke med de nye Food TG-dokumentene.
- Beslutningsporter for scope, claim, figur, case, kilde og validering.
- Kandidatkort for A1, A/B, B1, B2 og B3/C-gate.
- Reader journey-liste som viser hvordan `/mandat`, `/innsikt`, `/forsyningskjede`, `/verdikjede`, `/sirkularitet`, `/graf` og `/sammenligning` kan brukes.
- Fail-closed tester som stopper feil statusløft.

Skal ikke implementeres nå:

- Ekstern outreach eller responsregistrering.
- Aktørnavn som om de har gitt commitment.
- `Validert eksternt` for noen claim.
- Pilotbriefs som bruker pilotklar-språk.
- DB-migrasjon eller admin-editor for Food TG-data.
- Ny `/food-tg`-route.

## Styrende kilder

Implementeringen skal forankres i disse dokumentene:

- `docs/project/mandates/food-tg-decision-pack-v0.1.md`
- `docs/project/mandates/insight-pack-outline-food-tg-v0.3.md`
- `docs/project/mandates/food-tg-claim-lock-table-2026-05.md`
- `docs/project/mandates/food-tg-figure-model-note-audit-2026-05.md`
- `docs/project/mandates/food-tg-case-to-claim-index-2026-05.md`
- `docs/project/mandates/food-tg-source-locator-risk-audit-2026-05.md`
- `docs/project/mandates/food-tg-scope-decision-request-2026-05-21.md`
- `docs/project/mandates/food-tg-validation-sprint-log-2026-05.md`
- `docs/project/mandates/food-tg-baseline-freeze-2026-05-21.md`

## Dataarkitektur

Utgangspunktet er `src/lib/data/food-tg-mandate.ts`. Implementeringen kan enten holde alt i denne filen eller splitte nytt kontrollag til `src/lib/data/food-tg-control-layer.ts` hvis filen blir for stor. UI skal importere strukturerte data, ikke hardkode Food TG-innhold i React-komponenten.

Nye eller utvidede datatyper:

### Kontrollstatus

Statusverdier som trengs i tillegg til dagens validation-status:

- `klar`
- `klar-med-forbehold`
- `krever-bekreftelse`
- `maa-harmoniseres`
- `hold-tilbake`
- `venter-minimumsvedtak`
- `ikke-startet`
- `benchmark`
- `hypotese`
- `pilotkandidat`
- `sekundaerspor`

Regel: Ingen statusverdi skal kunne tolkes som ekstern validering uten eksplisitt dokumentert respons og bruksrett.

### Kontroll-dokument

Hvert kontroll-dokument skal ha:

- `id`
- `title`
- `kind`
- `status`
- `path`
- `use`
- `blocks`

`blocks` beskriver hva dokumentet stopper, for eksempel statusløft uten source locator eller figurbruk uten note.

### Beslutningsport

Hver port skal ha:

- `id`
- `title`
- `status`
- `governingDocument`
- `mustBeTrue`
- `blocks`
- `nextAction`

Portene er:

- Scope-port
- Claim-port
- Figur-port
- Case-port
- Kilde-port
- Validerings-port

### Kandidatkort

Hvert kandidatkort skal ha:

- `id`
- `title`
- `track`
- `role`
- `status`
- `claimIds`
- `evidenceIds`
- `sourceIds`
- `canSay`
- `cannotSay`
- `minimumData`
- `sourceGate`
- `actorGate`
- `cGate`
- `stopSignal`
- `nextAction`

Kandidatkortene i v0.2:

| ID | Tittel | Rolle | Statusregel |
|---|---|---|---|
| `A1` | EUDR og fôrdata | Strategisk datagate | `krever-bekreftelse` til EUDR-Norge og metode er sjekket. |
| `A-B` | Alternative fôrproteiner | Roadmap-spor | `klar-med-forbehold`, ikke pilotkandidat. |
| `B1` | Okara/BSG | Teknisk sidestrømskandidat | `hypotese` eller `benchmark` til råvareeier, hygiene og off-taker finnes. |
| `B2` | Matsvinnkvalitet | Adoption-kandidat | `klar-med-forbehold` hvis baseline, kategori og tidsvindu finnes; ellers `hypotese`. |
| `B3-C` | C-gate | Tverrgående gate | `klar-med-forbehold`; stopper A/B uten lov, kjøper, data, drift og governance. |

### Reader journey-flate

Hver appflate skal ha:

- `route`
- `title`
- `use`
- `readiness`
- `figureNote`
- `risk`
- `nextAction`

Denne listen skal gjøre det tydelig hva hver eksisterende plattformside kan brukes til, og hva den ikke beviser.

## UI-design

Tone: operativ, tett, rolig og revisjonsegnet. Dette er en intern cockpit for styring og kvalitet, ikke en hero-/marketing-side.

Eksisterende `/mandat` beholdes som én sammenhengende arbeidsflate. Nye seksjoner legges inn i denne rekkefølgen:

1. Oppdatert statusheader
2. Kontroll- og beslutningsporter
3. Kandidatkort
4. Dokumentpakke
5. Reader journey
6. Eksisterende opportunity radar, sprint, claim board og stoppsignaler

### Oppdatert statusheader

Headeren skal vise:

- Dato: 2026-05-21.
- Scope-status: Venter scope- eller minimumsvedtak.
- Ekstern validering: Ingen claims er validert eksternt per 2026-05-21.
- Neste handling: Be om minimumsvedtak før P1-outreach.

### Kontroll- og beslutningsporter

Seksjonen skal være en kompakt grid med seks porter. Hver port skal vise styrende dokument, hva som må være sant, hva porten stopper, og neste handling.

### Kandidatkort

Kortene skal være scanbare og sammenlignbare. Hvert kort skal vise:

- track-pill
- status-pill
- trygg formulering
- formulering som ikke skal brukes
- minimumsdata
- source gate
- actor gate
- C-gate
- stoppsignal
- neste handling

Kortene skal ikke bruke visuell styling som får `hypotese` eller `klar-med-forbehold` til å se ferdig validert ut.

### Dokumentpakke

Eksisterende "Beslutningsgrunnlag" oppdateres til å inkludere de nye dokumentene fra 2026-05-21. Eldre dokumenter kan beholdes hvis de er relevante, men de nye kontrollfilene skal være tydeligere enn gamle v0.2/v0.3-notater.

### Reader journey

Seksjonen skal forklare hvilken plattformflate som støtter hvilken del av decision pack:

- `/mandat`: intern mandatstatus og valideringslogikk
- `/innsikt`: leserinngang til innsikter
- `/forsyningskjede`: datalag for import, relasjoner og returstrømmer
- `/verdikjede`: verdikjededekning og flow-skisse
- `/sirkularitet`: R-stige, KPI og case-/gaplogikk
- `/graf`: navigasjon og datakvalitet
- `/sammenligning`: nordisk kontekst

Alle rader skal ha figurnote eller risikonote.

## Fail-closed-regler

Implementeringen skal gjøre følgende feil vanskelige:

- Ikke vise `Validert eksternt` for Food TG-claims uten responsdato, aktørrolle, kilde og bruksrett.
- Ikke vise `pilotklar`.
- Ikke la kandidatkort mangle stoppsignal.
- Ikke la kandidatkort mangle neste handling.
- Ikke la dokumentpakke mangle filsti.
- Ikke la appflate mangle figurnote eller risikonote.
- Ikke la EUDR, varekoder, actor-data eller benchmark bli fremstilt som direkte effektbevis.

## Teststrategi

Testene skal skrives før produksjonskode.

Første testfil:

- `tests/lib/food-tg-control-layer.test.ts`

Testene skal dekke:

- alle kontroll-dokumenter har id, tittel, status, path, use og blocks
- alle beslutningsporter har governing document, blocks og nextAction
- alle kandidatkort har canSay, cannotSay, minimumData, gates, stopSignal og nextAction
- ingen kandidatkort bruker forbudt status eller pilotklar-språk
- ingen Food TG-flate kan markeres som ekstern-validert uten valideringsbevis
- alle reader journey-rader har route, use, figureNote/risk og nextAction

Etter testene er røde, implementeres datakontrakter og UI. Deretter kjøres minst:

- `npm test -- tests/lib/food-tg-control-layer.test.ts`
- `npm test -- tests/lib/food-tg-mandate-diacritics.test.ts`
- `npm run lint`

Hvis UI-endringen berører build-sensitive imports eller Next-komponenter, kjøres også `npm run build`.

## Implementeringsrekkefølge

1. Skriv failing test for kontrollag og kandidatkort.
2. Implementer eller utvid typed data i `src/lib/data/food-tg-mandate.ts`.
3. Utvid statuslabels og statusstyles for nye statusverdier.
4. Oppdater `/mandat` header med 2026-05-21-status.
5. Legg inn kontrollportseksjon.
6. Legg inn kandidatkortseksjon.
7. Oppdater dokumentpakkeseksjonen.
8. Legg inn reader journey-seksjon.
9. Kjør test/lint/build-verifikasjon.
10. Commit implementeringen separat fra denne designcommiten.

## Akseptansekriterier

Arbeidet er klart når:

- `/mandat` viser Food TG cockpit v0.2 med kontrollporter, kandidatkort, dokumentpakke og reader journey.
- Food TG-status er oppdatert til 2026-05-21.
- Ingen UI-tekst antyder ekstern validering eller pilotklarhet.
- Testene beskytter mot statusløft, manglende stoppsignaler og manglende kilde-/risikonoter.
- Repoet har separat commit for design og separat commit for implementering.

## Risiko og avgrensning

Den største risikoen er at plattformen får materialet til å fremstå mer modent enn dokumentene tillater. Derfor skal UI-stylingen være nøktern, statusene tydelige, og alle kandidatkort må ha både "kan sies" og "skal ikke sies".

DB-backed redigering er bevisst utsatt. Food TG-dataene er fortsatt et kontrollert redaksjonelt lag, ikke en løpende operasjonell CRM.
