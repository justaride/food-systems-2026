# Konkrete beslutningspakker etter FS-29

Dette er utvidet underlag for de tre pakkene i `DECISIONS.md`. Det registrerer ingen beslutning, endrer ingen H-port og tildeler ingen person ansvar. Faktiske vedtak skal dateres og føres i `docs/project/mandates/decision-log-food-tg.md`.

## H-navnerom

Alle `H-`-referanser nedenfor er **prosjektets kanoniske H-porter** i `docs/project/status/food-systems-completion-register-2026-07-15.md`: `H-01` stakeholderintervjuer, `H-02` nordisk partnervalidering, `H-03` charter, scope og leveransetolkning, `H-05` pilot- og fundingforankring, og `H-07` personvern, publisering og juridisk risiko.

Hvitbok v2 bruker et annet H-navnerom. En hvitbokreferanse som «H-03» betyr derfor ikke prosjektets `H-03` og kan ikke lukke en prosjektport.

## Pakke A — mandat og videreføring (prosjekt-H-03)

**Beslutningsspørsmål:** Skal leveransen bevares, videreføres som vedlikeholdt intern forskningsplattform, eller få en senere observatorium/pilotstøtte-retning? Beslutningen må samtidig avgrense mottaker, geografisk scope, leveranse, organisatorisk hjem, finansiering og den ansvarlige eieren.

| Valg som må stå eksplisitt | Underlag som allerede finnes | Konsekvens / stopplinje |
|---|---|---|
| Bevaring | `continuation-plan-food-tg-2026.md` §1, §3 og §10; roadmap v0.2 draft | Kontrollerte materialer og integritet beholdes, men ingen aktiv oppdatering, partnerforpliktelse eller publiseringsløfte følger. |
| Vedlikeholdt intern forskningsplattform | Samme continuation plan, inkl. roller, kostnadsmodell og porter | Krever faktisk hjem, eier, kapasitet, kostnadsramme og reviewdato før aktiv drift. Mangler ett av disse, er bevaring fallback. |
| Observatorium/pilotstøtte som senere retning | Samme continuation plan §1 og §7 | Krever egen finansiering, partner- og publiseringsporter. Dette valget etablerer ikke pilot, ekstern tjeneste eller publisering. |

**Minimum som må loggføres:** dato, valgt retning, mottaker/scope, organisatorisk hjem, ansvarlig eier med myndighet, leveransegrense, finansierings-/kostnadsramme, start- og reviewdato samt stopplinje. Uten disse opplysningene er `H-03` fortsatt åpen.

## Pakke B — intervjuer, nordisk validering og én pilot (prosjekt-H-01/H-02/H-05)

**Beslutningsspørsmål:** Hvilken av de fem eksisterende pilotbriefene skal være én konkret avgrenset pilotforberedelse, og hvilke faktiske parter skal inviteres til hvilken rolle?

| Før eventuell gjennomføring | Hvilket portkrav det svarer på | Hva underlaget ikke dokumenterer |
|---|---|---|
| Velg én brief med problem, målgruppe, systemgrense og avgrenset hypotese. | H-05 | En brief er ikke en valgt pilot eller finansiering. |
| Avtal faktisk partner, pilot-eier, dataeier, off-taker, budsjett, tidsrom og måleplan. | H-05 | Ingen partnercommitment, dataavtale eller observert effekt er opprettet her. |
| Avtal intervjuformål, samtykke, bruksrett og godkjenning av eventuelle sitater. | H-01 | Sekundærkilder blir ikke stakeholderstemmer. |
| Velg land-/temascope og innhent datert respons fra faktiske svenske, danske, finske og/eller islandske partnere der det er relevant. | H-02 | Intern sammenligning er ikke nordisk partnergodkjenning. |

**Sekvensering:** Pakke A må først avklare mandat/scope. Hvert intervju krever sitt dokumenterte samtykke og sin bruksrett under `H-01`; `H-07` må avklare relevant ramme før bred deling av person- eller publiseringsfølsomt materiale. Først deretter kan avtalte aktiviteter gi empirisk eller partnerbundet bevis.

## Pakke C — regnskapskandidater og deling (prosjekt-H-07 + kandidatkontroll)

**Beslutningsspørsmål:** Hvordan behandles de få konkrete regnskapskandidatene, og hvilket delingsnivå gjelder for person-, styre- og andre publiseringsfølsomme data?

| Konkrete avklaringer | Nåværende underlag | Avgrensning |
|---|---|---|
| Nofima 2023: godkjenn eller avvis kandidat etter kontroll mot de to originale rapportene. | `FINANCIAL-RECONCILIATION.md` | KI kan ikke registrere human review eller promotere kandidaten. |
| Holdbart 2024: velg håndtering av dokumentert 1-kronesavvik eller hent ny offisiell forklaring/kopi. | `FINANCIAL-RECONCILIATION.md` | Ingen av de to oppstillingene skal fremstilles som avgjort før behandling. |
| Austevoll/Axfood: hold valuta, resultatdefinisjon og scope atskilt i eksisterende kandidater. | `FINANCIAL-RECONCILIATION.md`; tidligere hashbundne kandidater | Ingen bred normalisering eller terskelregel erstatter individuell kilde-/identitetskontroll. |
| Fastsett delingsnivå, rettingsprosess og juridisk/personvernmessig ramme per dataklasse. | completion-registerets H-07 og continuation plan | Ingen bred offentlig personflate, sitatbruk eller partnerdeling før policy og kvalifisert vurdering foreligger. |

En framtidig teknisk datamutasjon er en egen operativ handling: den krever reviewbar kandidat, eksakte input-hasher, fersk preflight og separat produksjons-/runtime-bevis. En beslutning i denne pakken er ikke i seg selv en databasekjøring eller publiseringsautorisasjon.

## Driftsunderlag som ikke er et H-vedtak

`OPERATIONS.md` har en hashbundet Estate-backupkvittering og skiller den fra Coolify-diagnostikk. Dette støtter trygg drift, men fyller ikke `H-03`, `H-05` eller `H-07`. RPO/RTO, retensjon, systemeier og neste restore-test følger den separate continuation-/driftsporten og må ikke oppdiktes som del av disse beslutningspakkene.
