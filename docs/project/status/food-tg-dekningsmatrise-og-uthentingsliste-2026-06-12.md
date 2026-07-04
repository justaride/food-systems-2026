---
tittel: Food TG Dekningsmatrise og Uthentingsliste 2026-06-12
status: Aktiv intern
eier: Gabriel
dato: 2026-06-12
scope: Ærlig status per caseanker på research, analyse, visualisering, presentasjon og plattformsynlighet, pluss samlet liste over dokumenter som ikke er hentet inn - delt i "kan hentes nå" og "venter på intern eier/aktør".
relaterte_filer:
  - docs/project/status/statusrapport-siden-jt-0906-2026-06-12.html
  - docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md
  - src/lib/data/casestatus.ts
---

# Food TG Dekningsmatrise og Uthentingsliste 2026-06-12

Dette dokumentet svarer på tre spørsmål statusrapporten 12.06 ikke svarer på direkte:

1. Hvor grundig er hvert caseanker faktisk dekket - fra research via analyse til visualisering, presentasjon og plattform?
2. Hvilke dokumenter/kilder som omtales er ikke hentet inn, og hva er prosessen for å få tak i dem?
3. Hvilke videre research-prosesser bør gjøres for å sikre bred forståelse og nok dybde?

Hovedpoenget: usikkerhetene i statusrapporten gjelder *ekstern bruk av påstander* (claim-lock/gates), ikke innsiktsarbeidet. Mesteparten av dypdykk, analyse og visualisering kan gjøres nå, uavhengig av JT-beslutningene.

## 1. Dekningsmatrise per caseanker

Skala: **God** (kan brukes som grunnlag nå) / **Delvis** (finnes, men hull) / **Tynn** (påbegynt) / **Mangler** (ikke produsert).

| Caseanker | Research | Analyse | Visualisering | Presentasjon | Plattform | Hovedhull |
|---|---|---|---|---|---|---|
| Kaffe/Brasil | **God** - DRR-0906-001 (122 linjer) + Comtrade 2022-2025 kvantifisert (Brasil 45-48 % av import; 15,6 mill. kg 2025) + 6-8 bibliotekfiler (p32/p33/p34) | **Delvis** - importtall låst, men ingen samlet EUDR-eksponeringsanalyse for norsk kaffe | **Mangler** | **Tynn** - inngår i deck v0.1 | **God** - casestatus.ts med nøkkeltall og kildelokator | Relasjonsdelen (MOU) er L0-blokkert; EUDR-eksponering kan analyseres/visualiseres nå |
| Kakao/Elfenbenskysten | **God** - DRR-0906-002 (278 linjer); direkteimport CI→Norden motbevist (Comtrade 2024); EU-omveien identifisert | **Delvis** - omverdiveien (EU-prosessering/merkevarer) er identifisert men ikke kartlagt aktør for aktør | **Mangler** | **Tynn** | **God** | Indirekte eksponeringskart (hvilke merkevarer/prosessorer bærer CI-kakao inn i Norden) kan bygges fra åpne kilder |
| Valio/Finland | **God** - DRR-0906-003 + 004 er duplikatpar i samme casegrunnlag; soyaforbud dokumentert med primærkilder; finsk importramme tallfestet (rapsmel ~216 000 t/år; soyamel 87-144 000 t/år) | **Delvis** - governance-historien er sterk; fôrkurv-sammenligning Norge/Finland ikke gjort | **Mangler** | **Tynn** | **God** | Valios interne fôrkurv er aktørdata (L2); alt annet kan analyseres nå, inkl. norsk parallell (SSB 08801) |
| Distribusjon/adopsjon | **God** - DRR-0906-005 (213 linjer); strukturanalyse; regulatorisk vindu korrigert (KT overtok god handelsskikk 30.04.2026; innkjøpsbetingelsesforslaget lagt bort 03.10.2025; presiseringshøringen under behandling) | **Delvis** - strukturen beskrevet, men adopsjonsbarriere-rammeverket (kanal/logistikk/pris/regelverk) er ikke operasjonalisert mot konkrete produkteksempler | **Mangler** | **Tynn** | **God** | Aktørdata (BAMA-vilkår) er L2-blokkert; presiseringshøring/KT-føringer kan analyseres nå |
| Spillvarme/oppdrett | **God** - DRR-0906-006 (209 linjer); Hima operativ (1,75 MW testet), Frövi benchmark (35 GWh/år, 8 000 t tomater), Enova-side for Wiig-piloten bekreftet (50-70 °C, 4 MW), men ikke drift | **Delvis** - case-ledger finnes; ingen energi-/arealregnestykker eller overførbarhetsanalyse for Norge | **Mangler** | **Tynn** | **God** | Wiig-ferdigattest hentes via Klepp byggesak/postliste; juni 2026-godkjenningen gjelder ikke Wiig-piloten; Hima driftsdata er aktørask |
| 100% Fish/Island | **God** - DRR-0906-007 (219 linjer); SJA09114 er trukket til CSV; SJA09110/SJA04903 gjenstår; prisskille kvantifisert; "100 %"-claimet svekket av Matís | **Delvis** - SJA09114 gir islandsk utvikling, men metodebro mot norsk SINTEF/FHF og de to andre tabellene gjenstår | **Mangler** | **Tynn** | **God** | SJA09110/SJA04903-uttrekk er neste rene desk-jobb; SJA09114-blokkeren er lukket |
| Skottland/Polen | **God** - DRR-0906-008 (233 linjer); ZWS-rapport fulltekstkontrollert med dateringskorreksjon (Enscape 31.03.2020, 2019-survey); Polen kill-testet til watchlist | **Delvis** - Skottland-volumer ekstrahert; ingen sammenligning mot norske tall | **Mangler** | **Tynn** | **God** | SBMT/IBioIC er nice-to-have, ikke blocker; Polen full kill-test (GUS XLS, EMFAF-base) er deprioritert med vilje |

### Lesning av matrisen

- **Research-kolonnen er grønn over hele linjen.** syv unike caserapporter (åtte filer) (~1 750 linjer), desk-research-runde fullført 12.06, source-shortlist med 12.06-spor1-tillegg, 932 filer i research-korpuset. Påstanden "vi må researche mer i bredden" stemmer ikke - DRR-008s egen konklusjon ("mer åpen web-research løser ikke relasjonsspørsmålene") gjelder kun relasjonscasene.
- **Analyse er halvgjort.** Tall er låst, men det mangler tverrgående syntese: hva casene samlet sier om nordiske matsystemer, og sammenligninger mot norsk grunnlinje (restråstoff, fôrimport, distribusjon).
- **Visualisering er det reelle hullet.** Null case-spesifikke visualiseringer er produsert, til tross for at tallgrunnlaget for minst fire av dem (kaffe-import, kakao-strømmer, finsk fôrimport, Skottland-prisskille) allerede er ferdig kvantifisert.
- **Presentasjon: ett deck-utkast (10 slides, v0.1)** dekker alt - tynt målt mot underlaget.
- **Plattform: /casestatus er god og oppdatert 12.06.** QA-testen `tests/lib/casestatus-data.test.ts` finnes og passerer (verifisert 12.06: 4/4, inkl. docRefs-eksistens og claim-safety-sjekk).

## 2. Uthentingsliste

### Spor 1 - kan hentes nå, uten å vente på noen beslutning

Alle disse er L1 (offentlige/institusjonelle kilder). Ingen aktørkontakt, ingen outreach-gate.

| # | Hva | Case | Prosess | Estimat |
|---|---|---|---|---|
| 1 | Statistics Iceland-uttrekk SJA09110/04903 (SJA09114 er trukket) | 100% Fish | Bruk samme POST-metode som `uttak-01`; lagre CSV i research/external/ | Timer |
| 2 | SINTEF/FHF restråstoffanalyse (norsk fraksjon-til-sluttbruk, 2024-rapporten) | 100% Fish / B-spor | Last ned publisert rapport fra sintef.no/fhf.no; ekstraher fraksjon, volum, sluttbruk; logg i source-shortlist som primær | Timer |
| 3 | Wiig/Green Horizon ferdigattest og byggesaksstatus | Spillvarme | eInnsyn-søk mot Klepp kommune (byggesak); be om innsyn hvis ikke åpent | Dager (innsynsfrist) |
| 4 | Valios offentlige fôr-/bærekraftsdokumentasjon (årsrapport, soyafri-policy, Luke/MMM-kilder) | Valio | Systematisk gjennomgang av valio.fi/luke.fi/mmm.fi; skill governance-claims fra datapunkter; logg det som *ikke* finnes offentlig som presisering av AASK-0906-003 | Timer |
| 5 | SBMT-datatilgang: vilkår, pris, lisensform (IBioIC) | Skottland | Kun hvis kommunenivå-granularitet trengs; åpne ZWS/Marine Directorate-kilder bærer benchmarken nå | Timer |
| 6 | Presiseringshøringen om god handelsskikk og KT-føringer | Distribusjon | Hent høringsnotater/innspill for § 9 a/§ 9 b og supplerende tildelingsbrev; innkjøpsbetingelsesforslaget er lagt bort 03.10.2025 | Timer |
| 7 | EU-omveien for kakao: identifiser hvilke EU-prosessorer/merkevarer som er dominerende inn mot Norden | Kakao | Åpne kilder (årsrapporter, ICCO, CBI, merkevarenes egne sporbarhetsrapporter); bygger den indirekte eksponeringsfortellingen DRR-002 peker på | Dag |
| 8 | Polen-sporene fra kill-testen: MIR Gdynia, gov.pl EMFAF-PDF, PSPR | Polen | Lav prioritet (watchlist med vilje); kun hvis kapasitet | Dag |

### Spor 2 - venter på intern dokumenteier eller aktør (kan ikke desk-researches)

Disse er grunnen til at DASK/AASK-pakken venter på JT. Viktig presisjon: det er **kun disse** som er blokkert - og selv her kan selve utsendingen til *interne* eiere (L0) argumenteres å være risikofri, siden bruksregelen i DASK-pakken eksplisitt sier at L0 ikke er outreach.

| Ask | Hva mangler | Hvem sitter på det | Konsekvens hvis det ikke finnes |
|---|---|---|---|
| DASK-0906-001 | Brasil-MOU/avtaletekst, partsliste, bruksrett | JT, Cathrine, Einar, NCH/WCEF/Natural State | Kaffe/Brasil nedgraderes til rent importcase (som allerede er sterkt) |
| DASK-0906-002 | LEAD Ivory Coast-dokumentasjon | Samme krets | Kakao beholdes som EUDR-/sporbarhetscase uten relasjonsclaim |
| DASK-0906-003 | Fuglen/kaffeprosjekt-tekst og aktørrolle | Gabriel/Cathrine/JT + prosjekteier | Kaffe får ikke egen casekortlinje utover import |
| DASK-0906-004 → AASK-003 | Valios aggregerte fôrkurv per råvare | Kun Valio | Caset brukes som governance-case (holder godt alene) |
| DASK-0906-005 → AASK-004 | BAMA onboarding-vilkår, produkt-/månedstall | BAMA/Gartnerhallen/tilsyn | Caset forblir strukturelt systemspor uten aktørclaims |
| DASK-0906-006 → AASK-005 | Hima driftsdata (GWh/år, temperatur, økonomi) | Green Mountain/Hima | Hima omtales som "operativ, fase 2 vurderes" uten driftstall |
| DASK-0906-007 → AASK-006 | IOC claim-metode bak "100 % fish" | Icelandic Ocean Cluster | Benchmark brukes med Matís-forbeholdet (allerede innarbeidet) |

### Avvik funnet

- (Korrigert 12.06:) Første gjennomgang meldte at `tests/lib/casestatus-data.test.ts` manglet. Det var feil - testen finnes og passerer (4/4). Ingen brutte lenker i statusrapporten.

## 3. Videre research-prosesser for bredde og dybde

Prioritert etter hva som gir mest innsikt per innsats, og hva som styrker partnersamtaler:

1. **Tverrgående innsiktssyntese (høyest verdi).** Les de syv unike caserapportene samlet og skriv ut mønstrene: (a) EUDR som gjennomgående katalysator i tre av syv case, (b) at de sterkeste casene er *governance*-historier (Valio, Skottland) snarere enn teknologihistorier, (c) at adopsjonsbarrieren er systemisk og går igjen på tvers. Dette er materialet som tas med til partnere.
2. **Norsk grunnlinje per case.** Hvert benchmark-case (Island, Skottland, Finland, Frövi) mangler norsk sammenligningstall ved siden av seg. SSB 08801 (fôr), SINTEF restråstoff, Landbruksdirektoratet og tolldata dekker det meste - desk-arbeid.
3. **Visualiseringssprint.** Fire visualiseringer kan bygges på ferdig kvantifisert grunnlag i dag: kaffeimport Brasil→Norge 2022-2025; kakaostrømmer CI→EU→Norden; finsk vs. norsk proteinfôrimport; Skottland-prisskille restråstoff (£62-173 vs. £250-520/t). Disse løfter både deck og plattformflater.
4. **EUDR-tidslinje og norsk implementering.** Tre case berøres direkte; en samlet EUDR-flate (frister, omfang, norsk tilpasning) gjenbrukes på tvers og er ren policy-research.
5. **Aktørkartlegging uten kontakt.** For kakao-omveien og spillvarme-radaren: kartlegg aktørene fra åpne kilder *før* eventuelle aktørspørsmål sendes - gjør AASK-ene skarpere den dagen de åpnes.

## 4. Konklusjon

Statusrapportens beslutningsfokus er legitimt for JT-møtet, men gir et skjevt bilde av arbeidsstatus: researchen er grundig, gating-apparatet er modent, og kun 7 av ~15 åpne uthentingspunkter er reelt blokkert av beslutninger. Det som faktisk mangler er **analyse-, visualiserings- og syntesearbeidet oppå researchen** - og det kan startes umiddelbart, parallelt med at JT-beslutningene venter på møtet i uke 25.
