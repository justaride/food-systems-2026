# Punkt 1 og 2 — reparasjoner og akseptanse

Dato: 8. september 2026. Dette er en lokal implementasjons- og kontrollrapport, ikke produksjonsbevis eller faglig godkjenning.

Arbeidet bygger på gjennomgangen i `project-audit-2026-09-08`. Base er `76b8d43c4e23f35b9afc10b16e64256c8668028c`, gren `codex/project-repair-2026-09-08`. Original checkout og annet pågående arbeid er bevart.

## Resultat

De fire kritiske visningsfeilene har konkrete sperrer eller korrigeringer. Kart, mobilmeny, register- og kildesøk fungerer i den lokale nettleserkontrollen. En samlet arbeidskø binder sammen eksisterende prosjektgap, case, prioriterte aktører, kildevurdering og selskapsavstemming.

Teknisk retting er ikke det samme som ferdig kunnskapsgrunnlag: manglende kjøperbevis, innsamlingsmålinger, avstemte konsernregnskap, kildevurderinger og menneskelige beslutninger står fortsatt åpne.

| Funn | Implementert atferd | Kontroll / gjenstående |
|---|---|---|
| FS-01 | Den kjente syntetiske oppgaven får blokkert identitet i dokument-API, bibliotek, søk, AI-kø, kandidatprojeksjon og MCP. Syntetisk forfatter, fulltekst og siteringsmetadata skjules. Oppgaven utelates fra akademia, BibTeX og positive graf-/policyutvalg. | Nettleserreise AI-kø → dokument, regresjonstest og databaseprøve passerer. Historiske rader er bevart; den beskyttede identitetsmigrasjonen er ikke kjørt. |
| FS-02 | Varetype avgjør ikke lenger kjøper. Ny verifiseringsstatus er `unverified` som standard. Kjøperfordeling krever `source_verified` og kildelenke. Gamle importantakelser fjernes av migrasjonen og bevares som avvist metadata. | Migrasjon og lesemodell prøvd på isolert database. 14 varegrupper vises uten oppdiktede mottakere. |
| FS-03 | Matsvinnets oppståtte mengde brukes ikke som målt kommunal innsamling. C3 viser 20 eksplisitte hull. Opprinnelig verdi og tolkning beholdes i metadata. | Migrasjonsprøve, C2/C3-tester, produksjonsverifikatorens kontrakt og lokal databasekontroll passerer. Reelle måleserier mangler fortsatt. |
| FS-04 | Eksplisitte eldre selskapsidentiteter holdes utenfor sammenligning. Eldre profil-ID peker til kjent registeridentitet når den finnes. Avstemmingssiden viser bevart underlag og uavklarte navnelikheter. Total omsetning på tvers av konsern/datterselskap presenteres ikke som markedsstørrelse. | 16 eldre rader i lokal snapshot; 253 selskaper med regnskap i gjeldende utvalg. Ingen regnskap eller relasjoner er flyttet i databasen. Faglig avstemming av unikt eldre underlag og konsolidering gjenstår. |
| FS-05 | De tre kartkomponentene deler fungerende bakgrunnslag, synlig attribusjon og feilmelding. Kartlag kan foldes inn på mobil, og zoom er flyttet fri av laget. | Mobilkart har 10 lastede fliser i kontrollen. Intet horisontalt overløp. |
| FS-06 | Mobil- og skrivebordsmeny bruker samme navigasjonsregister. Mobilmenyen kan rulles, lenker lukker den, Escape lukker og returnerer fokus. | 40 destinasjoner inklusiv ny arbeidskø; meny og tastaturlukking prøvd. |
| FS-07 | HHI/CR3 bygger på antall, ikke avrundede andeler. Ukjent eier gjør indikatoren ikke beregnbar; ukjente butikker blir ikke ett konsern. | NO 3440 i butikkregisteret. Fire land får eksplisitt manglende indikator og ingen innbyrdes rangering. Genererte metrikker og FSD-krysskobling er regenerert gjennom navngitte skript. |
| FS-08 | Kryssstyrer krever ulike selskaper med registrerte styreverv innenfor datointervallet. Samme selskap med flere roller telles én gang. Kjente identitetsaliaser løses i lesevisningen; gammel filter-tag beregnes på nytt. | Regresjonsprøver og 1642 lokale personprofiler kontrollerer samsvar mellom tag og opptelling. Udaterte verv er registrerte, ikke bekreftet aktive. |
| FS-09 | Konsernrøtter løses via org.nr. i aktuell database. Økonomi viser rotens regnskapsrad, uten å legge til datterselskapenes tall. Ferskhet beregnes fra faktisk registerdato; dekningssnapshot får sin egen dato. | Alle 13 konsernrøtter er gyldige. Oversikt og dossier har samme rot og omsetningsverdi. Regnskapets konsolideringsomfang må fortsatt kildekontrolleres. |
| FS-10 / FS-22 | `/arbeidsko` samler 18 gap, 8 case og 68 aktøroppfølginger fra eksisterende underlag. En lukket oppføring forblir lukket. Filter, ansvar, neste handling, datoforbehold og underlagslenker gjør oppfølgingen søkbar. | 94 oppføringer totalt i lokal snapshot, 93 gjenstående. Testet søk etter gap og konkret DLF-oppfølging med registrert ansvar Gabriel. Ingen nye eiere eller godkjenninger er oppdiktet. |
| FS-11 / FS-21 | Hele AI-vurderingskøen kan søkes og filtreres på serveren, med 100 per side. Kildelenker, risikoflagg, bruksregel og neste handling følger raden. Automatiske kjøringer og eldre policyklassifisering vises som ulike statuser. Akademia sier «Med analyseutkast». | 1627 lokale vurderingsrader; globalt søk og karantenefilter kontrollert. Kandidatkjøringer, full kildeavstemming og faktisk menneskelig review gjenstår. Køen gjør dette arbeidet tilgjengelig, den utfører ikke godkjenningen. |
| FS-12 | Produsentsøk går mot hele registeret, med samme filter for antall og resultater, stabil sortering og sideinndeling. | Treff bekreftet for en produsent hentet utenfor de første 50 100 radene i et register på 55 371. |
| FS-13 | Semantisk/hybrid søk er deaktivert når nødvendige tjenester ikke er konfigurert; nøkkelordsøk og søkelenker fungerer. | Yara-søk gir én kjent gjeldende selskapsidentitet. Dette er ikke bevis for aktiv semantisk tjeneste. |
| FS-14 | Kilder, bibliotek og aktører rendrer 50 rader per side. Filter søker hele den innlastede listen og tilbakestiller siden. | Bibliotek side 2 → nytt filter → side 1 bekreftet. Omtrent 1200–2400 DOM-elementer i de tre kontrollerte registervisningene. Dataoverføringen er fortsatt hele listen på disse klientflatene. |

## Kontroller

- `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npm run audit:citable-reports` og `git diff --check`.
- Hele testsuiten er kjørt lokalt: 2604 tester, 2587 bestått, 16 feil, 1 hoppet over. Den kjente Mac-feilgruppen gjelder den forseglede Node-runtimekontrollen: llhttp-aliaset peker nå på 9.4.3, mens den autoriserte beskrivelsen binder 9.4.2. Kontrollen avviser dette som den skal. Ingen runtimeforsegling eller global symlink er endret for å få grønn test.
- Målrettede reparasjons- og FSD-tester: 18/18. C2/C3-plan og produksjonsverifikator er også dekket i hele testsuiten.
- `npx tsx scripts/verify-project-repair.ts` er en skrivebeskyttet akseptanseprøve for full-registersøk, karantene/eksport, kjøpere, C3, konsernrøtter, kryssstyretags og bevart aktøransvar.
- Migrasjonens eksakte SQL er også kjørt mot midlertidige tabeller med gamle kjøper- og C3-verdier, med assertions og `ROLLBACK`.
- Nettleserkontroll bruker lokal app på port 3015. Se [browser-checks.json](browser-checks.json), [journey-checks.json](journey-checks.json) og [skjermbilder](screenshots/). Mobilkartets faktiske CSS-visning var 433 × 937 på grunn av nettleserens eksisterende zoom; dette er ikke et komplett sett med mobilstørrelser.
- Bygget regenererer ikke tidsstempler når metrikken er uendret. Den regenererte FSD-krysskoblingen kontrolleres mot faktiske kildehasher.

Eksakte sluttresultater og kontroll-logger ligger i `checks/`. Ingen nettleserkontroll her er produksjonsbevis.

## Database og migrasjon

Lokal databasen `foodsystems` ble kopiert til en egen arbeidsdatabase, `foodsystems_repair_20260908_v2`. Originaldatabasen og produksjon er ikke mutert. `.env` og databasekopien skal ikke committes.

Kopien hadde allerede hele Nordic-spine-skjemaet, men manglet tilsvarende migrasjonskvittering. En schema-diff ble kontrollert før **bare kopiens** `20260904_nordic_systems_spine` ble avstemt i Prisma-ledgeren. Dette er ingen instruks om å gjøre samme avstemming i produksjon.

Deretter ble `20260908180000_repair_inferred_flow_semantics` anvendt, og den navngitte C2/C3-backfillen kjørt mot kopien. Flow-backfill bevarer eksisterende metadata slik at avvist tolkning ikke går tapt ved senere kjøringer. Ingen kandidat- eller reviewhistorikk er skrevet om.

## Neste leveranseport

PR og CI må vurderes på aktuell SHA. Før utrulling: kontroller produksjonens migrasjonsledger og backup-/restore-underlag; bruk den eksisterende migrasjonsinngangen med separat migrasjonsrolle. Appkode og migrasjon hører sammen fordi appen forventer de nye kjøperfeltene.

Etter utrulling må akseptanseprøven kjøres mot målbasen, eksakt runtime-SHA verifiseres, og en innlogget brukerreise gjentas for karantenekilde, leveranser, økonomi, kart, mobilmeny, produsentsøk, AI-kø og arbeidskø.

Ved en eventuell tilbakeføring beholdes de nye kolonnene og historikkmetadata. Ikke gjeninnfør gamle kjøperantakelser eller tolk matsvinnstatistikk som målt innsamling. En teknisk kode-rollback må derfor vurderes opp mot disse datakorrigeringene.

Repoets `AGENTS.md` sier: «KI may not record human review, promote canonical data, publish, or change coverage readiness.» Denne leveransen endrer ingen menneskelig godkjenning eller coverage readiness. Publisering og faktisk review er fortsatt egne porter.
