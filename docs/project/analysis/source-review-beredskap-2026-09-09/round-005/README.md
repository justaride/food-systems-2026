# Fra korn til mottatt mel — runde 005, 9. september 2026

**Ett konkret C1-case er avgrenset, men leverbar matmengde er fortsatt ukjent.** Bakehuset Møllhausen Furuset i Oslo er valgt som analytisk mottaker. Bjølsen sammenlignes med Lantmännen Cerealia Malmö for samme referansekvalitet og samme 72-timersfrist. Ingen av aktørene er kontaktet, ingen avtale er inngått, og ingen leveringsprøve er gjennomført.

Dette er et lokalt, internt tillegg til runde 004. De tidligere analysene og råkildene er bevart. Ingen kanoniske data, menneskelige vurderinger eller readiness er endret.

## Hvorfor dette caset

Møllhausen Furuset beskriver produksjon av steinovnsbrød og oppgir adressen Søren Bulls vei 27, Oslo. Det gir en konkret mottakerfunksjon å undersøke. Opplysningene dokumenterer verken melbehov, innkjøpsforhold, resept eller bulktilgang. [Bakehuset, avdeling Furuset](https://www.bakehuset.no/om-oss/bakerier/mollhausen-furuset/) (R5-S01).

Begge møllealternativene har dokumentert produksjon for bakerier. Malmö oppgir også bulkdistribusjon. De er valgt fordi kjedene kan undersøkes fram til samme mottaker, ikke fordi ledig kapasitet eller et eksisterende leverandørforhold er bevist. [Bjølsen](https://www.lantmannencerealia.com/about-lantmannen-cerealia/our-office-and-production-location/oslo/), [Malmö](https://www.lantmannencerealia.com/about-lantmannen-cerealia/our-office-and-production-location/malmo/) (R5-S02–03).

| Sammenligningsledd | Norsk alternativ | Svensk alternativ |
|---|---|---|
| Mølle | Cerealia Bjølsen, Oslo | Cerealia Malmö |
| Produktinngang | Regal Hvetemel standard, bulk 160105 | Nord Mills Bagarns Manitoba, bulk 160585 |
| Felles kvalitetsmål Q1 | Siktet sterkt bakerihvetemel, med Regal-standard som foreløpig referanse | Skal kvalifiseres mot nøyaktig samme Q1 |
| Kvalitetsgrunnlag | Katalog februar 2021, fysisk side 3/trykt side 5 | Aktuell HT 2026-fil, fysisk/trykt side 5 |
| Planlagt transport | Lokal vegkorridor Bjølsen–Furuset | E6 via Göteborg/Svinesund–Furuset |
| Disponibelt lager, mengde og ledetid | Ukjent | Ukjent |
| Godkjent mottatt mel innen fristen | **Ukjent** | **Ukjent** |

De to katalogene beskriver hvete og askorbinsyre, men dette beviser ikke like bakeegenskaper. Tallfestede akseptgrenser, batchprøver og mottakerens godkjenning mangler. Den svenske produktrekken knytter Bagarns Manitoba til Malmö. Mølleland bestemmer ikke opprinnelseslandet til et konkret kornparti. [Norsk produktkatalog](https://www.lantmannencerealia.no/siteassets/3.-produkter/no/b2b_lantmannen_produktkatalog.pdf/), [aktuell svensk kataloginngang](https://www.lantmannencerealia.se/produkter/vara-produktkataloger/) (R5-S04, R5-S14/16; eksakt PDF-URL og hash i kildebindingene).

## Det felles scenarioet

Det analytisk valgte vinduet er **5. oktober 2026 kl. 08 til 8. oktober kl. 08, Europe/Oslo — 72 timer**. Ved begge møllene og bakeriet settes nettstrøm og offentlig vann bort i de første 24 timene. Begge valgte utgående vegkorridorer er stengt i samme 24 timer. Ingen av kjedene får nytt drivstoff i 72 timer. Reservekraft, vann, tilgjengelige kjøretøy og faktisk gjenåpning må dokumenteres før de kan bidra til beregnet kapasitet.

Dette er en designet belastning, ikke en prognose eller en rekonstruksjon av 2018. 2018-panelet begrunner spørsmålet om samtidig sårbarhet; produksjonsfallene er ikke brukt som reduksjonsfaktorer for 2026-lager. Fristen er heller ikke en dokumentert bestillingsfrist fra mottakeren.

Det primære utfallet er Q1-mel som er veid, frigitt og akseptert hos Furuset innen fristen. Bruk i godkjent bakst må måles separat. Mel som ankommer etter at en nødvendig bakeomgang skulle startet, løser ikke dette tidligere behovet. Mottak, vann, ovner, bemanning og øvrige ingredienser kan begrense matfunksjonen selv om melet når fram.

## Hva kildene tillater å beregne

Katalogen fra 2021 oppgir 78 prosent utmaling for den norske referansen. Som **betinget regneeksempel** krever 20 tonn mel dermed 25,641 tonn korn. Med analytiske utbytter på 70 og 85 prosent blir kravet 28,571 og 23,529 tonn. Dette er verken Furusets behov, svensk utbytte eller dokumentert leveranse. Kornets og melets fuktbasis må avklares før forholdstallet brukes i en fysisk massebalanse.

Norske lagerkontrakter og 2029-mål gir ingen disponibel Bjølsen-beholdning ved t0. Nasjonale årstall kan heller ikke bestemme Malmös prioritering mellom egne kunder og Furuset. [Landbruksdirektoratets kontraktsomtale](https://www.landbruksdirektoratet.no/nb/nyhetsrom/nyhetsarkiv/82-500-tonn-matkorn-pa-lager-innen-2029--i-mal-med-kontrakter) og [Jordbruksverkets kildeinngang](https://jordbruksverket.se/mat-och-drycker/handel-och-marknad/priser-och-marknadsinformation-for-livsmedel) (R5-S06/15).

E6-tollpunktet er dokumentert; gjennomført tur, reisetid, kø, lossing og disponibel transportkapasitet er det ikke. [Tolletaten, Svinesund](https://www.toll.no/no/om-oss/kontakt-oss/ekspedisjonssteder/svinesund) (R5-S12).

## Leveransen og kontrollene

- [Case og avgrensninger](case.json), [måleprotokoll](MAALEPROTOKOLL.md) og [ti presise datagap](data-gaps.json).
- [Beregninger](calculations.json), [kjørbart følgehefte](analysis.ipynb) og [inputmanifest](input-manifest.json). Ingen ukjent leveranse er erstattet med null tonn.
- [Definisjonskontroll](DEFINISJONER.md): alle åtte avlingsvarsler vurdert enkeltvis; begge finske 2018-rester holdes åpne.
- [12 interne observasjoner](observations.json), [24 kildebindinger](source-bindings.json), [tilgangslogg](acquisition-log.json) og [kontrollkvittering](verification.json).
- [Whitepaper-tillegg](WHITEPAPER-TILLEGG.md), [daterte statusendringer](status-delta.json) og [neste overlevering](NESTE-SESJON.md).

Alle råkilder, PDF-er, bilder og private kjøringsfiler ligger utenfor repository. Skriptet kontrollerer kildehashverdier og krever ny outputmappe. Kode- og kildekontroll beviser reproduserbarhet og integritet; den etablerer ikke semantisk sannhet, fysisk kapasitet eller menneskelig autoritet. Fullførte lokale kontroller står i kvitteringen. CI, migrasjon, deployment og produksjons-UI inngår ikke.
