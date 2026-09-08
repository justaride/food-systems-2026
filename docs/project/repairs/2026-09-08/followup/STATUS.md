# Oppfølging av restlisten, 8. september 2026

Denne pakken følger opp restlisten etter PR #397/#398. Produktrettingene nedenfor er implementert og kontrollert lokalt. CI, produksjons-SHA og innlogget kontroll dokumenteres i leveransens separate releasebevis; lokal kontroll beviser ikke produksjon.

| Restpunkt | Gjennomført i pakken | Det som fortsatt kreves |
|---|---|---|
| Regnskapsenheter og valuta | Felles eksplisitt skala og lagringsvaluta i selskap, økonomi, konsern og styrevisninger. Allerede NOK-konverterte beløp omregnes ikke igjen. Importører skriver enhet sammen med beløp. | Originalkilde og konsolideringsomfang er ikke fullt kontrollert for alle historiske rader. Ti produksjonsrader har uavklart lagring; Nofima 2023 har et særskilt kildeavvik. |
| KI-kunnskap | Nytt skrivebeskyttet uttrekk av alle 1770 klassifiseringer og en hashbundet inputpopulasjon. 1610 har lesbart, hashbundet input; 160 har inputhindre. Eldre pilot ferdigstilt med ti bevarte validatorsvar, terminalkvittering og filaudit. | Pilotresultatet er 7 karantene / 3 delvise, med 30 rettingsfunn. Ny avgrenset KI-reparasjon og kildebinding kreves før skalering; produksjonens kandidat- og vedtakstabeller er urørt. Se SOURCE-WORK.md. |
| Eldre selskapsidentiteter | Avstemmingssiden viser konflikter per regnskapsår, unike verv og dokumentkoblinger, samt øvrige bevarte relasjoner. | Juridisk og historisk kontroll av de 25 eldre identitetene før eventuell flytting. Ingen automatisk sammenslåing. |
| Dokumenterte kjøpere | Produksjonsuttrekk og spesifikasjon for nødvendig kjøperunderlag. | 60 310 leveranser mangler fortsatt kildebelagt kjøper. Samlet produsentvolum kan ikke tilordnes en antatt kjøper. |
| C2 og C3 | Alle 40 hull eksportert med faktisk ID, land, år, strøm, systemgrense og dokumentasjonskrav. Eksisterende kildemateriale vurdert mot avgrensningen. | Realiserte mengder innen samme systemgrense. Modeller, kapasitet, andre år og total oppstått matavfall fyller ikke de gjeldende hullene. |
| Arbeidskø | 68 aktøroppfølginger eksportert med registrert ansvar, handling og dato; mangler flagget uten å endre status. | 23 mangler ansvarlig, 28 neste handling, 68 dokumentert kontrolldato. Formelle beslutninger og utpeking av ansvarlige gjenstår. |
| Semantisk søk | Fersk kontroll av konfigurasjon og indeks; nøkkelordsøk og dokumentavgrenset fulltekst kontrollert. | OPENAI_API_KEY mangler og 0 av 1615 produksjonsdokumenter har embeddings. Nøkkel og kontrollert indeksering kreves. |
| Store lister | Serverfiltrering og avgrenset levering av 50 rader for bibliotek, aktører og kilder. Laste-/feiltilstand, avbrudd av foreldede forespørsler og nytt sidevalg ved filterskifte. | Kildeforeningen av database/dokument/backlog beregnes fortsatt på serveren. Fulltekstsøk viser maksimalt 50 treff og sier dette eksplisitt. |
| Store konserntrær | Lesbar grunnstørrelse, zoom 75–200 %, rulling og valg av enkeltgren. Fullt navn tilgjengelig, tabell bevart. | Ingen kjente åpne feil i de kontrollerte interaksjonene. |
| Mobilkart | Overskrift og land-/flytvalg flyttet til egen rad. Analysepaneler får tilgjengelig plass og rulling, fri zoomkontroll og en kartlagmeny som forblir klikkbar. Ekstra mobiloverløp på kildesiden rettet. | Kontrollert ved faktisk 390 CSS-piksler; øvrige enheter må fortsatt vurderes ved større designendringer. |
| Mac-forsegling | Eksakt avvik isolert til llhttp-aliaset. Forseglingen er bevart. | Kontrollert ny runtime og ny autorisert forsegling. Det gamle manifestet forventer llhttp 9.4.2, mens maskinen peker på 9.4.3. |

## Regnskapskontroll

Migrasjonen endrer bare `amountCurrency` og eksplisitt `unitScale`. Beløp, kildetekst, kildevaluta, valutakurs og autoritetsfelt bevares. Den matches mot importkontrakter; generiske kildeord og beløpets størrelse brukes ikke til å gjette enhet.

Prøven mot alle **186 produksjonsrader** avstemte lagringen for **176**. **10** ble stående uavklart: ni eldre identitetsrader og Austevoll 2024, hvor omsetning og driftsresultat har blandet lagringsskala. Uavklarte beløp utelates fra NOK-visning. Regnskaps- og autoritetsfingeravtrykk var identiske før og etter prøven i midlertidige tabeller.

| Kontrollrad | Forventet teknisk visning | Kildeavgrensning |
|---|---:|---|
| Axfood 2025 | 94 397 690 000 NOK | Lagret MNOK er allerede konvertert fra SEK. Originalrapportens 89 152 MSEK og den registrerte gjennomsnittskursen er avstemt; kursen skal ikke brukes to ganger. |
| Holdbart 2024 | 579 000 000 NOK | MNOK-intensjonen er bevist i importkoden. Den åpne Brreg-responsen gir nå bare 2025; den verifiserer ikke historiske 2024-beløp. |
| Nofima 2024 | 736 000 000 NOK | Grovt avrundet lagret omsetning. Originalens 735 592 tusen NOK støtter størrelsesorden, men ikke mer presisjon i den lagrede raden. |
| Nofima 2023 | Beløp og margin utelatt | Lagret 725/-18 MNOK avviker fra originalrapportens sammenligningstall. Avviksprojeksjonen gjelder bare denne eksakte gamle raden og endrer ikke databasen. |

## Lokal validering

- Full testkjøring før siste avvikstest: 2611 tester, 2594 bestått, 16 kjente Mac-runtimeavvisninger, 1 hoppet over. Ny avvikstest og de fokuserte tester bestått separat.
- TypeScript, ESLint og produksjonsbygg bestått. Migrasjonsgeneratorens `--check` bestått.
- 15 HTTP-kontroller av de tre katalogene: første/neste/siste side, tomt og kjent søk. Hver respons leverer maksimalt 50 rader; første og andre side overlapper ikke.
- Nettleser: sidebytte og filterskifte i bibliotek/kilder/aktører, tomtilstand, dokumentavgrenset fulltekst, konsernzoom/gren/nullstilling, kildeavvik, detaljavstemming og mobilkart. En gammel Prisma-klient i utviklingsprosessen krevde omstart etter skjemagenerering; kontrollene ble kjørt på nytt etterpå.
- Lokal klone og produksjon har forskjellige populasjoner. Lokale katalogtall brukes ikke som produksjonstall.

## Reproduserbare kontroller

`scripts/verify-project-followup.mjs` lager et skrivebeskyttet uttrekk uten å skrive ut nøkler eller originaltekster. `scripts/build-followup-workpack.ts` bygger populasjon, inputhindringer og CSV-er for aktører og strømmer fra dette uttrekket. Ingen av dem oppdaterer review, kildestatus eller arbeidskø.

`profiling.ipynb` inneholder kjørte kontroller av uttrekk og migrasjonsprøve. Sett `FOOD_FOLLOWUP_EVIDENCE` dersom bevismappen flyttes. Migrasjonsprøven utføres med `scripts/verify-financial-storage-migration.ts`; den bruker midlertidige tabeller og ruller alltid tilbake.

Bevismappe på arbeidsmaskinen: `~/.codex/visualizations/2026/09/08/01a08185-e2dc-73e2-a8d8-7d54a2bbe507/followup-2026-09-08/`. Uttrekket er internt og rå kildefiler legges ikke i Git.
