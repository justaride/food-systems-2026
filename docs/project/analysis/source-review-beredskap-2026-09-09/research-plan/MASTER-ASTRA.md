# M-ASTRA — avsluttende mastervalidering

Kopier oppdraget under inn i en egen sesjon konfigurert med **gpt-6-astra** etter at koordinator har fryst inntaket. Modellvalget er brukerens krav. Denne filen starter ingen sesjon, og planen er ikke en gjennomført Astra-vurdering.

---

Du skal utføre den avsluttende interne mastervalideringen av Food Systems 2026 sitt beredskapsprogram. Bruk modellen `gpt-6-astra`. Les `AGENTS.md`, `research-plan/FELLES-KONTRAKT.md`, `work-packages.json`, `coverage.json`, `input-manifest.json` og det tildelte `master-intake.json`. Alle disse ligger under `docs/project/analysis/source-review-beredskap-2026-09-09/`, med unntak av rotens AGENTS og kjøringens masterinntak.

## Inngangsgate

Koordinator skal ha tildelt programRunId, masterRunId, plan-commit og et uforanderlig inntak med terminal retur fra B01–B20. B09 skal bruke identifiserte returer fra B07/B08, og B20 fra B01–B19. En terminal retur kan dokumentere et uløst gap. Mangler en pakke, kan du lage en merket delkontroll, men ikke erklære masterrunden komplett.

Registrer forespurt modell, rapportert modell og tilgjengelig verktøyattestasjon. Hvis modellen faktisk er en annen, stopp M-ASTRA-arbeidet og be koordinator om korrekt sesjon. Hvis attestasjon er utilgjengelig, registrer `model_attestation_unverified`; ikke dikt den opp og ikke kall Astra-kravet verifisert. Faglig vurdering kan leveres foreløpig med denne begrensningen.

Verifiser Git-/planreferanse, inputhash, alle leveransehash, kandidat-/evidenshash, kildebytes og målprofil-/policyhash. Kontroller at hver kilde er tilgjengelig med rettigheter til den tiltenkte interne bruken. Dokumenter skillet mellom kildefunn, faktisk åpnet dokument og lest relevant passasje. Sett hashavvik, manglende fil eller uleselig evidens i karantene før semantisk vurdering. Ikke reparer en arbeiders historiske leveranse. Gi returoppdrag for en ny kjøring.

## Full vurdering, påstand for påstand

1. Frys en fullstendig liste over innkomne kandidat-ID-er. Kontroller alle; ikke bruk utvalg og rapporter dette som full dekning. Les de relevante passasjene i de eksakte kildeversjonene selv. Arbeidernes sammendrag er ikke selvstendig kildebevis.
2. For hver kandidat: etterprøv om kilden faktisk støtter formuleringen for rett sted, dato, enhet, vare, mottaker og populasjon. Skill vedtak, plan, søknad, søkers melding, myndighetsbekreftelse og målt drift. Skill historisk årsvolum, fysisk lager, allokering, uttaksrett, gjennomstrømning og levert mengde.
3. Rekjør relevante beregninger med frosne input. Etterprøv nevner, fuktbasis, revisjon, vekting, utvalg, usikkerhet og sammenlignbarhet. Kontroller ressurs-/batch-/lager-ID-er for dobbeltelling og felles svikt mellom alternativer.
4. Finn kildekonflikter og uavhengighet. To agenter eller modeller som siterer samme kilde gir ikke to bevis. Bevar motsigelser; forklar hvorfor ett bevis eventuelt er mer relevant. Manglende kilde er ikke bevis på fravær.
5. Vurder C1–C5 mot samme eksplisitte mottaker, behov, kvalitet, sjokk og frist. Ingen påstand om nordisk beredskapsgevinst hvis et nødvendig ledd mangler. B20s syntese er en kandidat på lik linje med andre leveranser.
6. Etterprøv alle 92 historiske gap-ID-er og deres eierskap/overlapp, de fem formålene og disponeringen av 15 kapitler. Tell historiske referanser separat fra unike kunnskapshull og innkomne kandidater. Ikke gjør 92-ID-listen til en prosentvis beredskapsscore. FS-01–30 er en historisk avgrensningsliste; drift/implementering er ikke verifisert gjennom research.

## Utfall og leveranse

Gi hver kandidat nøyaktig ett faglig utfall: `supported_with_limits`, `contradicted`, `insufficient_evidence` eller `needs_revision`. Registrer kandidat-, kilde-, evidens-, policy- og målprofilhash, kontrollerte lokatorer, begrunnelse og materielle begrensninger. Manglende kilde/attestasjon fremgår separat fra faglig utfall. `supported_with_limits` er intern KI-validering; sett alltid `human_verified: false`.

Lever i en ny mastermappe under programmets `research-runs/<programRunId>/M-ASTRA/<masterRunId>/`:

- `master-review.json`: fullstendig påstandstabell og status med struktur fra malen.
- `MASTER-RAPPORT.md`: dokumenterte funn, betingede slutninger, ukjente ledd og konkrete menneskelige beslutningspunkter. Skill fullført forskningskontroll fra kilde-/eier-/metodestopp.
- `conflicts.json`: motsigelser, felles kildeavhengighet, dobbeltelling og håndtering.
- `coverage.json`: alle innkomne kandidat-ID-er, alle gap-ID-er med terminal disposisjon, formål og kapitler. Oppgi teller, nevner og mangler eksplisitt.
- `verification.json`: faktisk utførte integritets-, kilde- og beregningskontroller med evidens. En lokal verifikasjon sier ingenting om CI/deploy/UI.
- `NESTE-SESJON.md`: presise returoppdrag og uavklarte eier-/menneskeporter.
- `handoff.json`: frosne input, modellmetadata og hashmanifest for alle øvrige masterfiler. Koordinator kan hashe dette uten selvreferanse.

En masterkontroll kan være faglig ferdig med åpne gap når alle kandidater og gap har et begrunnet utfall. Rapporter separat `intakeComplete`, `reviewComplete`, `modelRequirementVerified` og `readinessChanged: false`. Ikke skriv en samlet grønn status hvis en av de nødvendige kontrollene mangler. Modellkravet er verifisert bare med tilgjengelig sesjons-/verktøyevidens for `gpt-6-astra`.

Returoppdrag skal angi pakke, kandidat, eksakt feil, ønsket dokument/korrigering og hva som vil bli kontrollert igjen. Nye leveranser får nye run-ID-er; frys et nytt inntak som refererer til det forrige. Enhver endring i kandidat, evidens, kildebytes, policy eller målprofil ugyldiggjør vurdering av den endrede kandidaten og alle berørte avhengige påstander. Uendrede vurderinger kan bare gjenbrukes ved identiske bindinger. Ikke bruk konsensus, tillitsskår eller modellnavn som menneskelig godkjenning.

Ikke registrer menneskelig review, promoter kanonisk innhold, endre coverage readiness, publiser, send henvendelser eller skriv til app/databasen. Lever eventuelle hvitbokendringer som et separat kandidattillegg. Brukeren avgjør videre autoritet og publisering.
