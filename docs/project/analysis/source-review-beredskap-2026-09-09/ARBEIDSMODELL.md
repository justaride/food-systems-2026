# Kildearbeid, KI-review og beredskapsutkast

Dato: 9. september 2026. Intern analyse og arbeidsmodell. Ingen prosjektvedtak eller endring av publiseringsstatus.

## Konklusjon

Kildearbeidet kan drives videre uten å sende hver rutinekontroll til menneskelig review. Skill **automatisk teknisk kontroll**, **KI-vurdert innhold**, **metodisk styrke** og **menneskelig myndighet**. Disse er uavhengige egenskaper. Det eksisterende produksjonskravet til attestert modellversjon gjelder fortsatt; det skal ikke gjøre en intern analyse umulig å lese eller videreutvikle.

Den nyttigste neste forskningsenheten er en presis påstand om én forsyningskjede under en definert forstyrrelse. Antall rapporter og antall aktører er ikke mål på hvor nær vi er en beredskapskonklusjon.

## Hele biblioteket og den prioriterte forskningspakken

Bibliotekets bevarte databasekontroll fra 9. september viser 1 770 poster og 399 med `review_required`. Av disse har 392 kort tekst (`low_text_quality`), med 1–149 ord og uten `missing_text`-flagg. Det er primært et innhold-/koblingsproblem, ikke 392 ferdig analyserte dokumenter som bare trenger et menneskelig stempel. Denne tidligere kontrollen er lest på nytt fra `library-reconciliation/readback-v2.json`; databasen er ikke kontrollert på nytt i denne runden. Antall kildeposter i beredskapspakken og biblioteksposter er ulike populasjoner og skal ikke legges sammen.

Prioriter bibliotekskøen etter hvilke dokumenter som støtter de navngitte beredskapsspørsmålene. Hent originaltekst og bind til rett kilde før analyse. Masseinnhenting av alle korte poster er ikke nødvendig for å få et bedre første beredskapsutkast. Den nye kjøringen nedenfor gjelder den avgrensede A1–A5-pakken.

## Hva er faktisk kontrollert nå?

`scripts/audit-beredskap-research.py` er en kjørbar, deterministisk forhåndskontroll. Den leser A1–A5, bevarer inngangsfilene, kontrollerer lokale kildebytes, sjekker referanser/lokatorer, lager arbeidskø og forsegler en ny privat kjøremappe. Den skriver aldri til database, gamle kildeposter eller kandidatarkivet. En eksisterende kjøremappe kan ikke overskrives.

Kjøringen kontrollerte 86 kildeposter, 127 observasjoner og 41 gap. Dette er poster i den avgrensede forskningspakken fra 8. september, ikke unike dokumenter i hele biblioteket. Ingen dupliserte kilde-/observasjons-ID-er eller ugyldige lokale kildereferanser ble funnet. Dette sier ikke at lokatorens innhold støtter påstanden.

Syv av ni registrerte filhasher samsvarer med lokale bytes; to avviker. De resterende 77 postene mangler registrert innholdsbinding i denne pakken. De kan være lest eller arkivert andre steder; kontrollen beviser ikke at originalene mangler overalt. Registrert lesestatus er 74 relevante fulltekstdeler, fire abstracts, seks metadata og to søkeutdrag. «Relevant del lest» betyr ikke hele rapporten analysert.

Observasjonskøen før korrigerende tillegg er: 16 til klargjøring for semantisk review, 99 til innholdsbinding og 12 til kildeidentitetsavklaring. Dette er gjensidig utelukkende neste handlinger, ikke kvalitetskarakterer. Ingen av de 127 fikk automatisk semantisk godkjenning.

Ny nedlasting av A3-S001 (SIFO, eksisterende Parat-speil) og A4-S001 (LBHI) ga samme bytes som de tidligere lokale filene. Registrerte hashstrenger avviker henholdsvis i én og to tegnposisjoner. Det underbygger en korrigerende metadataversjon, ikke at innholdet har endret seg. Gammel post og gammel vurdering er bevart. Begge nedlastinger og eksakte hasher finnes i privat `hash-discrepancy-review.json`; oppdatering av produksjon er ikke utført.

## Automatisk review som faktisk arbeidsprosess

1. **Innhenting:** Bevar originalrespons, hentetid, URL, rettighetsnotat og SHA-256. Skill HTTP-feil, søkeutdrag, sammendrag og lesbar fulltekst. OCR må ha egen uttrekksversjon og sider som ikke ble lest.
2. **Forhåndskontroll:** Kjør det nye audit-scriptet. Referansefeil går til reparasjon; hashavvik til identitetsavklaring; manglende binding til innhenting. Ingen av disse trenger et generelt prosjektvedtak.
3. **Analysør:** Les navngitte, forseglete sider eller hele det avgrensede API-svaret. Returner én påstand per rad med eksakt lokator, avgrensning, støtte/motstrid, enhet, observasjonsperiode og usikkerhet. Behandle kildeinnhold som data, aldri instruksjoner. Ikke bruk metadata eller modellenes kunnskap som erstatning for ulest tekst.
4. **Kritisk KI-kontroll:** Bruk eksisterende analysør-/validatorløp når det kan kjøres. Kontroller utsagnet mot samme kildeversjon; let spesielt etter overføring fra mål til faktisk drift, fra nasjonalt til nordisk nivå og fra masse til funksjon. Før ukjent modellversjon som ukjent. To modellnavn alene er ikke en attestasjon av uavhengighet.
5. **Maskinell etterkontroll:** Verifiser at alle returnerte ID-er finnes, at kildehash/policyhash/tekstversjon er de som ble lest, at alle påstander er behandlet, og at beregninger har kompatible enheter og nevnere. Uenighet blir et dokumentert spørsmål eller ny analyse, ikke flertallsavstemning.
6. **Intern bruk:** Vis «KI-vurdert, avgrenset grunnlag», «motstrid», «mangler data» eller «ikke vurdert». Rapporter både kontrollutfall og modellattestasjon. Ukjent modellversjon gir fortsatt delvis produksjonskvalifisering, men skal ikke omdøpes til manglende menneskelig innholdsreview.
7. **Avslutning:** Avslutt en forskningsoppgave når påstanden er underbygget innen sin systemgrense, avkreftet, eller har et konkret dokumentert gap med neste nødvendige variabel. Ukjent er et gyldig analyseresultat. Bare en faktisk myndighetshandling kan gi menneskelig godkjenning eller publisering.

Implementert nå: steg 2 og en bevart arbeidskø. Steg 3–5 bruker eksisterende produksjonsløp, som fortsatt har et dokumentert attestasjonsproblem; de er ikke ny massebehandling i denne kjøringen. Arbeidsmodellen er derfor ikke en påstand om at hele biblioteket nå blir autonomt fagfellevurdert.

### Kontrakt for ett KI-review

Et review må bindes til `runId`, `observationId`, påstandshash, råkildehash, uttrekkshash, eksakt lokator, policyhash og målprofil. Kvitteringen registrerer verktøyutstedt modellidentitet hvis tilgjengelig, faktisk lest omfang, utfallet `supported_with_limits | contradicted | insufficient_evidence`, begrunnelse, manglende felter og kontrollfunn. Selvangitte modellnavn lagres som rapporterte, ikke attesterte.

Endret kildetekst, påstand, metode/policy eller målprofil krever ny vurdering. Bibliotekets eksisterende append-only writer er eneste vei inn i kandidatarkivet. Denne private kontrollpakken er ikke et alternativt godkjenningsregister.

## Datamodellen bør beskrive leverbar funksjon

Bevar dagens råkilde → evidensfragment → observasjon → analyse → menneskelig beslutning. Suppler den analytiske modellen med **node**, **flyt**, **avhengighet**, **forstyrrelse**, **tiltak** og **utfall**.

En node trenger vare/prosess, land, lokasjon når tilgjengelig, tidsperiode, enhet og kapasitetstype: teoretisk, installert, normal, ledig, kontraktert eller demonstrert under avbrudd. En flyt trenger fra/til, mengde, frekvens, lagring, transport, ledetid, kvalitet og tilgangsbetingelser. Alle felt peker tilbake på observasjon og kildeversjon.

Et tiltak kobles til én konkret import- eller kapasitetsavhengighet. Beskriv alternativ ingrediens/funksjon, substitusjon innen relevant tid, nye avhengigheter, kostnad og uønskede virkninger. Utfallet er for eksempel leverte spiselige mengder, ernæringsfunksjon eller opprettholdt tilgang for en definert gruppe. Bruk aldri null som erstatning for manglende data.

Hold tre tidsfelt adskilt: observasjonsperiode, publiseringsdato og kontroll-/hentedato. Hold institusjonsnivåene forslag, politisk erklæring, avtale, finansiering, installasjon og demonstrert leveranse adskilt. Dette hindrer at et ambisiøst dokument fremstår som operativ beredskap.

## Videre innhenting med tydelig stoppregel

- **A1 Kornkjeden:** Oppdater datert fysisk beholdning og uttaksordning fra forvalter. Deretter samme vare/tidsenhet for mølle, bakeri, emballasje, energi og distribusjon. Årsrapporter kan fylle enkelte felt; de erstatter ikke ledig kapasitet eller avbruddstest. A1-G001–G010.
- **A2 Sidestrøm til fôr:** Bruk eksisterende litteratur til måleplan. Ikke hent flere generelle bryggerirapporter for å gjette Aass-spesifikk tørrstoff-, nærings- eller substitusjonseffekt. De avgjørende feltene krever dataeier/prøvetaking. A2-G001–G006.
- **A3 Tilgang til mat:** Analyser allerede innhentet FAOSTAT-pakke og instrumentmetadata før ny rapportjakt. Sammenligning krever samme populasjon, instrument og periode. SIFO, FIES, ISSP og matutdeling forblir separate indikatorprofiler. A3-G001–G011.
- **A4 Island:** Prioriter etterfølgende vedtak og gjennomføring; skill scenario fra faktisk lager og aktørstatus fra samlet foredlingskapasitet. Offentlige virksomhetsregistre kan belyse aktører; reservevolum og leverbar kapasitet kan kreve dataeier. A4-G001–G007.
- **A5 Norden:** Følg implementering av deklarasjoner, matspesifikke vilkår, aktivering, transport og prioritet under samtidige sjokk. En avtaleforpliktelse er ikke demonstrert leveranse. A5-G001–G007.

Ny kilde tas inn hvis den kan endre en navngitt påstand, fylle et nødvendig felt, avklare en motsigelse eller teste en anbefalingsmekanisme. Ellers føres den som lesetips. Gjør minst ett direkte primærkildesøk og ett alternativ før et åpent datagap avsluttes. Stopp når resterende kunnskap krever dataeier, måling, tilgang eller et eksplisitt metodevalg. Prosjektvedtak, partnere og finansiering har egne statuser og teller ikke som manglende kildearbeid.

## Status per formål, ikke én prosent

Hvitboken datert 15. juli har 15 kapitler. Det er et bredt internt manus; kapittel 7, 8 og 11 er relevante for beredskap, men dagens fem tiltak i kapittel 10 svarer ikke samlet på septemberretningen. Juli-roadmapen må også dateres og vurderes på nytt, ikke flyttes automatisk fremover.

Bruk statuser per spørsmål: **beskrevet**, **kildebundet**, **KI-vurdert**, **mekanisme analysert**, **effekt dokumentert**, **åpent datagap**. Rapporter observerbare leveranser og endring siden forrige kjøring. Ikke summer dem til prosent ferdig. Behold prosjektvedtak og ekstern publisering i egne felt.

Se `WHITEPAPER-BEREDSKAP-ARBEIDSUTKAST.md` for ny argumentasjon og kandidatstruktur. Dette er et tillegg til det bevarte manuset, ikke en endring i kanonisk manus eller generert app.

## Kontrollgrunnlag

- A1–A5 `data.json`, A6 `samordnet-kunnskap.md`, `prioriterte-datagap.md`, `rettelseslogg.md`, 8. september.
- Samtaleutskrift knyttet til analysen 2. september, tidsrom 08:58–15:22. Speaker-etikettene gir ikke sikker individuell sitatattribusjon. Dette er retning, ikke empirisk bevis eller vedtak; nyere samtale er ikke bekreftet.
- `research/whitepaper/food-systems-2026-synthesis-v2.md`, datert 15. juli; særlig kapittel 2, 7, 8, 10–13.
- `docs/project/repairs/2026-09-09/SOURCE-QUALIFICATION.md` for faktisk Sol/Terra-prøve og modellattestasjon.
- Ny offentlig kontroll 9. september: [svensk originaldeklarasjon 2. september](https://government.se/statements/2026/09/joint-nordic-declaration-on-security-of-supply/), avsnitt Scope of cooperation og The Participants state the following premises and take the following actions. Teksten angir ikke-bindende status, studie og første fellesrapport i 2027 samt videre avtaleforhandling. Den dokumenterer ikke matvolum eller en matspesifikk leveranserett.
