# M-ASTRA: full avgrenset masterkontroll av wave1

Alle 20 frosne returer er gjennomgått. Alle 127 kandidater har ett begrunnet utfall: **120 supported_with_limits og 7 needs_revision**. Alle 92 historiske gapreferanser, fem formål og 15 kapitler er disponert. Ingen effekt for C1–C5 er dokumentert gjennom en fullstendig, sammenlignbar mottakerkjede.

Dette er en gjennomført intern KI-kontroll av det avtalte inntaket. Modellkonfigurasjonen er rapportert som `gpt-6-astra` fra foreldreoppgavens eksplisitte verktøykonfigurasjon, men separat backend-attestasjon er ikke tilgjengelig. Derfor er `modelRequirementVerified: false` og `model_attestation_unverified` beholdt. `intakeComplete: true`, `reviewComplete: true`, `readinessChanged: false`; ingen menneskelig vurdering, publisering eller kanonisk oppgradering er registrert.

## Omfang og kontrollgrunnlag

- Program: `20260909-beredskap-wave1`.
- Master: `M-ASTRA-20260909-status-audit-001`.
- Plancommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`.
- Frosset inntak: `../master-intake.json`, SHA-256 `c396993b0e0ef148c533731e615579986b08452eb0142e54aece753a66af0383`.
- Alle 127 kandidat- og evidenshasher er rekalkulert, alle policy-/målprofiler kontrollert og alle 337 konkrete kildebindingers forventede rå-/tekstbytes funnet.
- 212 kildeposter inngår; gjentatt kildebruk er markert som avhengighet. 21 grupper deler råhash. To returer som leser samme rapport gir ikke to uavhengige bevis.
- 1 293 grunnkontroller ga 1 291 treff og to formelle filstifeil; 36 ekstra lokator-/beregnings-/manifestkontroller bestod. De to stifeilene gjelder mappehenvisninger med filhash, ikke tapte råkilder.
- 28 rekjørte beregningskontroller omfatter åtte P/A-varsler, ni illustrative massebalanser, FI2018-celler og intervaller, svenske komponenter, kontraktsum, NORSØK, Hias, Hylte-dato, Holdbart, FAOSTAT og StatFin.

Kandidatene er vurdert mot egne lesninger av relevante passasjer i de eksakte versjonene. Tabellen i `master-review.json` angir kildehasher, løste stier, kontrollerte lokatorer, begrunnelse og begrensninger for hver kandidat. PDF-figurer/tabeller for SIFO, NORSØK, Aass og Holdbart er i tillegg lest visuelt. Dette er ikke en helbibliotekkontroll eller en påstand om full lesning av hver side i alle dokumenter. Negative søkefunn er begrenset til de navngitte åpnete kildene; mislykket tilgang er ikke bevis på fravær.

## De sju kandidatene som må revideres

| Kandidat | Påvist feil | Presis rettelse |
|---|---|---|
| B04-C04 | To deluttrekks linjenumre brukes mot fullteksthash. | Bind fulltekstlinjer 512–545 og 1403–1412, eller korrekt separat deluttrekk. Tallene er lest i fullteksten. |
| B08-C01 | R4-NO-S003 mangler i arbeiderens kilderegister. | Registrer de eksakte SSB-rå-/tekstfilene og lokator 634–664. Bytes er gjenfunnet og lest av master. |
| B08-C02 | «Production-weighted P/A» er feil betegnelse; METH-S09 mangler. | Skriv total produksjon / total areal, altså arealvektet avling; registrer SCB-kilden. |
| B08-C03 | DKFI-S002 mangler i kilderegisteret. | Registrer eksakt DK-data.csv med hash og relevante celler. |
| B08-C04 | R4-NO-S003 og METH-S09 mangler. | Fullfør registreringene; behold de uløste definisjonsforskjellene. |
| B13-C02 | Tabell 2-1 er fysisk side 13, trykt side 11; lokator og deluttrekk sier fysisk 11–12. | Nytt uttrekk av fysisk side 13. Totale N er kontrollert; gruppenes N/CI er fortsatt ikke oppgitt. |
| B20-C12 | Gap-ID-er brukes som JSON Pointer mot en array. | Bind eksplisitte indekser eller en dokumentert ID-selektor, og riktig filsti for inngangshashen. |

B14 peker i `handoff.inputs` på en mappe med hash for `raw-manifest.json`. B20 peker på en mappe med hash for `synthesis-notes.json`. Begge skal bruke de faktiske filstiene. B14s alternative katalog-/FSD-filer er allerede deklarert med stier og hasher i `exactLocators`; de er tilgjengelige og lest. En foreløpig mistanke om manglende katalogkilder ble dermed avkreftet i fullkontrollen.

B19s nye modellattestasjonsgap har dessuten `originalGapId: FS-03`, mens historisk FS-03 gjelder matsvinn som feilaktig oppgraderes til målt innsamlingsflyt. Dette er en feil gapkobling som må håndteres i en ny retur; historikken skal ikke omskrives. De 92 historiske gapenes primære pakkeeierskap er ellers kontrollert og alle har terminal retur.

## Faglige funn som står etter kontrollen

**Korn og mottaker:** 30 000 tonn ved utgangen av 2025 og 82 500 tonn i kontraktsvolumer er ulike størrelser og tidspunkter. Historisk ledig lagerplass, nominell møllekapasitet og ordinære tollåpningstider fyller ikke inn dagens beholdning, kvalitetsfrigivelse, uttaksrett, kundebindinger eller faktisk levering til Furuset. Produktnumrene 160105 og 160585 er identifiserte, men gjeldende spesifikasjon, Q1-aksept, as-built siloanlegg og mottakerens nettobehov mangler.

**Sammenlignbarhet:** Alle åtte P/A-varsler er rekjørt fra de frosne Eurostat-cellene og beholdt. FI2018-residualene er 6,90 kt og 17,09 kt; én felles multiplikativ korreksjon forklarer ikke begge innen den oppgitte avrundingsrammen. Dette identifiserer ikke den virkelige fukt-/revisjonsårsaken. Svensk total P/A er cirka 7,2132 t/ha og må betegnes korrekt som total P/A/arealvektet avling. Underliggende råserier og offisielt rapportert avling skal ikke overskrives med diagnostikken.

**Sirkularitet:** Aass-rapportene gir årsspesifikke liter, mens en udateret nettside sier over åtte millioner liter. Mengde, tørrstoff, sammensetning, mottakerrasjon og erstattet ingrediens er ikke sammenbundet. Liter kan derfor ikke bli soyatonn. NORSØK-tabellen gir 240→410 kg tørrstoff/daa, omtrent 70,833 prosent økning, mens diskusjonen sier 130 prosent. Også doseenheten er inkonsistent. Rapporten må ikke brukes som avklart effektstørrelse. Hias' 29 850 kg produkt ved 12 prosent P gir 3 582 kg P, omtrent 6,885 prosent av tilført P; dette er årsstrøm, ikke lager eller planteopptak. Deklarasjonens tørrstoffbasis gir en annen konsentrasjon, og slam/struvitt må inngå i samme massebalanse.

**Måltider og økonomisk tilgang:** Hyltes øvelsesomtale dokumenterer rapportert mobilisering og tilberedning, men ikke spist ernæringsmessig egnet mat over flere måltider under samme sjokk. «Tirsdag 16. april 2025» er en kildekonflikt. SIFO-appendiksets spørsmål og skåring er visuelt kontrollert. Fafo oppgir eksplisitt at representativitet og svarandeler for mottakerne ikke kan beregnes. Direkte FAOSTAT-uttrekk gir 150 nordiske treårsverdier/CI-rader for 210091 og ingen 210090-rader. De 15 StatFin-cellene er identiske. Ingen av disse resultatene etablerer en harmonisert nordisk mattilgangsrangering eller fysisk beredskapseffekt.

**Island, avtaler og marked:** Forslag, utredninger, lisenskategorier, produktannonser og oppgitte bufferlagre er ulike bevisledd. De gir ikke én aktuell islandsk reserve-til-mottakerkjede. Norge–Finland-traktatens historiske tekst er lest, men matprotokoll, nåværende status, allokering og levering er ikke dokumentert samlet. MoU-datohenvisningen må avklares, og Åland-deklarasjonen er uttrykkelig ikke bindende. Eierrelasjoner og KPI/PPI-forskjeller gir ikke i seg selv markedsmakt, samordning eller kjedemargin. Holdbarts én-krones regnskapskonflikt er bekreftet i selve PDF-en og aritmetikken; den menneskelige presisjonsbeslutningen står åpen.

## C1–C5 og gapenes disponering

For hver sammenligning må nasjonal A, nordisk B og kombinert C ha samme eksplisitte mottaker, nettobehov, kvalitet, sjokk og frist. Furuset er navngitt for C1, men nødvendige måleverdier mangler. C2 mangler navngitt fôrmottaker og rasjon, C3 felt/parti/sesong og mineralbaseline, C4 kjøkken-/måltidslogg, og C5 aktiverings-/allokerings-/leveringskjede. Utfall og nordisk tillegg er derfor `null`, ikke null effekt og ikke positiv gevinst. Ulike funksjoner på tvers av C1–C5 summeres ikke.

Alle 92 historiske referanser har terminal disposisjon i `coverage.json`. De er foreldre og presiseringer av overlappende spørsmål, ikke 92 uavhengige ukjente eller en prosentvis readiness-score. De 129 returnerte gapregistreringene beholdes separat. Ingen semantiske gap er lukket. Fem formål er faglig behandlet med disse grensene. Kapittel 1–14 kan få kandidattillegg; kapittel 15 er en menneskeport. FS-01–30 er bare den historiske avgrensningslisten i denne kontrollen, uten ny driftsverifikasjon.

## Videre håndtering

De konkrete returoppdragene står i `return-requests.json` og `NESTE-SESJON.md`. Nye kandidat-/evidens-/kilde-/policy-/målprofilbindinger krever ny kontroll; berørte avhengigheter skal bindes på nytt. Uendrede vurderinger kan bare gjenbrukes ved identiske bindinger. Eierinntak, metodevalg, forsøksbeslutninger og menneskelig godkjenning er fortsatt separate porter.

Råfiler, kildeuttrekk og bilder ligger privat utenfor Git i masterens oppgitte evidensmappe. Bare kontrollresultater, metadata og script inngår i leveransen. Ingen kontakt, databasemutasjon, publisering eller autoritetsendring er utført.
