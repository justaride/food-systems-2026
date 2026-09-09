# C1: produktkvalitet og Furusets endrede mottak — runde 006

**Gjeldende fullstendige bulkspesifikasjoner og mottakskompatibilitet er fortsatt ikke bekreftet. Runde 006 finner samtidig konkret dokumentasjon om flytting av Furusets melsiloer.** Før kjeden brukes operativt, må dataeier dokumentere både dagens mottak og hva som faktisk bakes på stedet etter ombyggingen.

Dette er kandidatbasert, intern analyse per 9. september 2026, på gren `codex/beredskap-round-006` fra `44e34c60df69c686633008bb11524b91310e7f9a`. Runde 003–005 er bevart. Releasen av disse rundene gjentas ikke. Ingen kontakt, fysisk test, DB-skriving, human review, kanonisk promotering eller readiness-endring inngår.

## Produktene: nøyaktige bulkvarer funnet, Q1 mangler fortsatt grenser

| Kontroll | Regal standard, bulk 160105 | Bagarns Manitoba, bulk 160585 | Betydning for Q1 |
|---|---|---|---|
| Direkte produsentside | Identifiserer bulk 160105 | Identifiserer bulk 160585 og EAN 7310130013386 | Riktig katalogidentitet, ikke bestilling eller frigitt parti |
| Protein i næringsdeklarasjon | 13 g/100 g | 12 g/100 g | Ingen av verdiene er en batchmåling eller mottakerens min/maks |
| Ingredienser | Siktet hvete og askorbinsyre | Hvete og askorbinsyre | Ingredienslikhet dokumenterer ikke bakefunksjon eller full allergen-/krysskontaktkontroll |
| Bakeegenskaper | Kvalitative beskrivelser av gluten, falltall og deigtoleranse | Kvalitative beskrivelser av protein, deigtoleranse og volum | Tallfestede akseptgrenser og analysemetoder mangler |
| Utmaling | Tomt felt på dagens bulkside; 78 % i februar 2021-katalogen | Ikke oppgitt i kontrollert produktmateriale | Ingen målt nåværende massebalanse |
| Versjon | Udokumentert revisjonsdato på nettsiden | Udokumentert revisjonsdato på nettsiden | Innhentingstid og SHA256 fryser det leste innholdet; de gir ingen gyldighetsgodkjenning |

Kilder: [Regal bulk](https://www.lantmannencerealia.no/produkter/alle-produkter/hvetemel-standard2/) (R6-S01, tekstlinjer 172–204) og [Manitoba bulk](https://www.lantmannencerealia.se/produkter/alla-produkter/bagarns-manitoba/) (R6-S02, 170–206). Begge sidene tar forbehold om avvik fra emballasjen. En bulkspesifikasjon må derfor også avklare hvilket dokument som faktisk gjelder leveransen.

Den separate [25 kg-varen 140898](https://www.lantmannencerealia.no/produkter/alle-produkter/hvetemel-standard/) oppgir 78 % utmaling. Den brukes bare som identitetskontroll, og fyller ikke det tomme feltet på bulkvaren. Den [fortsatt lenkede norske katalogen](https://www.lantmannencerealia.no/produkter/vare-produktkataloger/) er datert februar 2021; fysisk PDF-side 3/trykt side 5 viser 160105. [Svensk kataloginngang](https://www.lantmannencerealia.se/produkter/vara-produktkataloger/) lenker HT2026-filen. Side 5 knytter produktrekken til Malmö og angir 12 måneders holdbarhet i en rad med både sekk og bulk. Dette avklarer ikke lagringsvilkår eller restholdbarhet for et konkret bulkparti. Katalogene er identiske med de frosne runde 005-filene; dagens nettproduktdata er et eget tillegg.

[Q1-sammenligningen](q1-comparison.json) behandler også fukt, falltall, glutenfunksjon, aske, granulometri, allergener, holdbarhet, prøvebakst og mottak. Alle mottakerens akseptgrenser og alle batchresultater står som `null`. Forskjellen i deklarert protein kan verken kvalifisere eller diskvalifisere svensk mel mot Q1 uten de manglende kravene og en sammenlignbar funksjonsprøve.

## Furuset: historiske siloer og en dokumentert ombygging

[Bakehusets avdelingsside](https://www.bakehuset.no/om-oss/bakerier/mollhausen-furuset/) omtaler fortsatt steinovnsbrød på Søren Bulls vei 27 (R6-S03, 18–26). Den gir ingen plan for melbehov eller teknisk mottak.

Den konkrete byggesaken gir mer informasjon. [F-02 Følgebrev til rammesøknad](https://innsyn.pbe.oslo.kommune.no/saksinnsyn/showfile.asp?jno=2025522835&fileid=11779000), utarbeidet av Studio Fyr på vegne av Bakehuset, beskriver melsiloanlegget på østfasaden og planlagt ombygging av silorommet til fryserom etter flytting. Side 2 beskriver demontering/flytting av siloene for en CO2-kjølerigg. Side 3 sier at deler av bakeriet flyttes til Økern, mens bakeri og konditori blir igjen. Dette er søknadens beskrivelse; den dokumenterer ikke hvor siloene eventuelt er satt opp igjen eller deres nåværende kapasitet. R6-S17, sider 1–3, tekstlinjer 12–24, 38–47, 78–88 og 112–119.

[Rammetillatelsen 12. juni 2025](https://innsyn.pbe.oslo.kommune.no/saksinnsyn/showfile.asp?jno=2025546983&fileid=11872367) omtaler videreført fabrikkdrift (R6-S16, side 2). [Midlertidig brukstillatelse 17. april 2026](https://innsyn.pbe.oslo.kommune.no/saksinnsyn/showfile.asp?jno=2026040022&fileid=901032973) unntar løfteplattformen og lister gjenstående tekniske arbeider. [Søkers følgebrev 13. august 2026](https://innsyn.pbe.oslo.kommune.no/saksinnsyn/showfile.asp?jno=2026082083&fileid=901326573) oppgir ferdigstillelse av tiltaket og løfteplattformen og ber om ferdigattest. **Et utsagn fra søker er ikke kommunens ferdigattest eller en driftsprøve.** Dokumentene gir heller ikke oppgitt lossekapasitet, slangekobling, tilgjengelig Q1-silo eller energireserve. R6-S13–14, side 1.

Dette gir et presist nytt stopp: krev dagens produksjonsplan og et datert «som bygget»-grunnlag for mottaket etter ombygging. Historisk siloeksistens kan ikke gjenbrukes som dagens bulkaksept. Dokumentene beviser heller ikke at alt bulkmottak eller all baking har opphørt. Mottakeren byttes ikke til Økern i denne runden.

## Leveranse og neste dokument

- [13 hashbundne kandidatobservasjoner](observations.json), [17 kildeversjoner](source-bindings.json) og [eksakte evidensbindinger](evidence-bindings.json).
- [Ni presiserte datagap](data-gaps.json), koblet til de tidligere ti gapene; de er ikke ni nye, uavhengige systemgap.
- [Internt, usendt inntaksskjema](INNTAK-USENDT.md) med [70 maskinlesbare datafelt](intake-template.json). Ingen felter er besvart eller sendt til noen.
- [Statusdelta](status-delta.json), [avgrenset tilgangs-/søkelogg](access-review.json), [verifikasjon](verification.json) og [neste overlevering](NESTE-SESJON.md).

Behov, lagerallokering, faktisk levering, mottakskompatibilitet og nordisk tilleggseffekt er fortsatt ukjent. De 26 operative mengdefeltene fra runde 005 er videreført som `null`. Samme designede 72-timersscenario og foreløpige Q1 gjelder. Finland-restene og alle åtte avlingsvarsler er uendret; ingen brede søk i disse sporene er gjentatt. Beredskapsanalysens C1-melkjede holdes atskilt fra `/nordic`-sidens C1 om dagligvarekonsentrasjon.
