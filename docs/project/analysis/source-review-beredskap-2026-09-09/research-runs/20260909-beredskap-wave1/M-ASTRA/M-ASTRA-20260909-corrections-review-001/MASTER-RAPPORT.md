# Rettelsesreview av siste inntak corrections-002

De påviste returfeilene er rettet i siste inntak. **47 endrede kandidater er vurdert på nytt, og 80 er videreført med identiske kandidat-, evidens-, policy- og målprofilbindinger.** Samlet gjeldende kandidatdisposisjon er 127 `supported_with_limits`. Dette er en avgrenset etterkontroll med eksplisitt gjenbruk av den fullførte originalmasteren, ikke 127 nye uavhengige kildelesninger.

`intakeComplete: true`, `reviewComplete: true`, `modelRequirementVerified: false`, `readinessChanged: false`. Rapportert verktøykonfigurasjon er gpt-6-astra; backend-attestasjon er fortsatt utilgjengelig. Ingen menneskelig vurdering, kanonisk oppgradering, publisering eller driftsport er utført.

## Frosset kjede

| Trinn | SHA-256 |
|---|---|
| Originalt inntak | c396993b0e0ef148c533731e615579986b08452eb0142e54aece753a66af0383 |
| Rettelsesinntak 001 | 4f6fbdef16989a355d25f1a881e6ac55e15953ccd70969c8f641064997d20450 |
| Gjeldende rettelsesinntak 002 | 8e9ef8513def0646dbb81083d3f6e091b0ba653d252c8a90ad2e67cead12b606 |
| Originalmaster handoff | f3a30484f270c50687b1b78fd69ad8b2c6deedb6cfc7015204f452b01d9d4833 |

Begge lenker mellom inntakene er kontrollert. Originalmasterens samtlige leveransefiler og handoff er identiske. `corrections-002` inneholder siste B19-rettelse og B20 correction-002; correction-001 er et bevart mellomtrinn.

## Hva rettelsene endrer

| Område | Etterkontroll og utfall |
|---|---|
| B04-C04 | Fulltekstlinjer 512–545 og 1403–1412 er lest. Begge utvalgte passasjehashene er identiske med det historiske belegget. Lokatorfeilen er lukket. |
| B08-C01–04 | R4-NO-S003, METH-S09 og DKFI-S002 er eksplisitt registrert med riktige uendrede rå-/tekstbytes. SSB-passasjen, SCB-cellene og DST-radene er kontrollert. |
| B08-C02 | Total P/A og arealvekter er rekalkulert. 7,213200743 t/ha er total produksjon / total areal. Arealvektet gjennomsnitt av de **avrundede publiserte** komponentavlingene blir 7,215575347; dette er en annen beregning. Offisielt 7,22 står fortsatt separat. |
| B13-C02 | Ny kilde peker til fysisk side 13 / trykt side 11. Uttrekket er lest og regenerert byteidentisk med `pdftotext`. De fem totale N-verdiene stemmer med den visuelt kontrollerte PDF-tabellen. Gruppens N/CI er fortsatt ukjent. |
| B14/B20 input | Alle inputstier peker nå til faktiske filer. Hashene identifiserer henholdsvis raw-manifest.json og synthesis-notes.json. |
| B20-C12 | Tre JSON-arraypekere løser til CLIM-G03, R4-G004 og R5-G10. Alle 19 forgjengerreturer samsvarer med siste inntak; statusmixen er fortsatt 11/4/4. |
| B19-gap | Feil foreldrekobling til FS-03 er fjernet. Attestasjonsgapet står selvstendig, og eksplisitt referenceCorrection/intake-overlay bevarer den historiske betydningen av FS-03. |
| Avhengigheter | B09 er bundet til korrigert B08; B20 til alle gjeldende B01–B19. Alle 21 avhengighetshasher er kontrollert. |

1 315 grunnkontroller og 14 ekstra kontroller bestod. Alle 339 kildebindinger kan løses til forventede eksakte bytes, og alle har nå kildeposter. Alle 92 historiske gapreferansers kilde-/posthasher og ansvarlige returer er bekreftet. Ingen nye blokkerende rettelsesfeil er funnet.

De 47 nye kandidathashene omfatter også kandidater der bare kjøringsidentiteten eller målprofilens eksplisitte sti er endret. Hver av disse har en ny vurderingsrad; de telles ikke som nye forskningsfunn. De 80 videreførte radene har identisk kandidat og identiske autoritetsrelevante bindinger med peker til den gamle vurderingen. Kildelesning fra den samme eksakte versjonen i originalmasteren er oppgitt eksplisitt, og endrete passasjer/bindinger er kontrollert i etterrunden.

Nested `runId` på kopierte gapobjekter beholder historisk opprinnelse. Den nye containerens `runId`, `correctionProvenance` og `referenceCorrection` dokumenterer rettelsen. Dette er et proveniensforbehold, ikke en påstand om ny innhenting i den gamle kjøringen.

## Hva som fortsatt er åpent

Rettelsene gjør forskningsreturene sporbare; de tilfører ikke nye eierdata, måledata eller bekreftede effekter. Alle 92 semantiske gap er fortsatt åpne. De fem formålene og 15 kapitlene har samme avgrensede disposisjon som før. C1–C5 har fortsatt ingen fullført sammenlignbar nasjonal/nordisk mottakerkjede eller beregnet tilleggseffekt.

Kildekonfliktene om NORSØK-prosent/dose, Aass-perioder, Hylte-dato, Holdbart-kronen, SIFO-historisk hash, traktatreferanse, statistiske definisjoner og Hias-konsentrasjonsbasis er bevart. Eierinntak, metodevalg, forsøk, finansiering, eventuell kanonisk behandling og menneskelig godkjenning må håndteres separat. Modellkravet er fortsatt ikke attestert.

Se `master-review.json` for alle gjeldende utfall og gjenbruksgrunnlag, `verification.json` for de faktiske kontrollene og `coverage.json` for full gap-/formåls-/kapitteldisposisjon. Originalmasteren er ikke endret.
