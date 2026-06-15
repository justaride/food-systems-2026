---
tittel: Food TG JT-tema — research-prosesser med modellkobling og Deep Research-prompter
status: Aktiv intern
eier: Gabriel
dato: 2026-06-10
scope: Data- og modellrettede researchprosesser (RP-serien) for temaene Jan Thomas har løftet på tvers av møtene, med prompter for ChatGPT Deep Research og definert import-skjema per modell.
relaterte_filer:
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md
  - docs/project/mandates/food-tg-casekort-og-research-mottak-2026-06-10.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
  - docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md
---

# JT-tema: research-prosesser, modellkobling og fremstilling

## 0. Forhold til prompt pack v1

Prompt-pakken fra 10.06 (v1) validerer *case*: finnes MOU-en, stemmer hypotesen, hva er status. Denne pakken (RP-serien) gjør noe annet: den henter *strukturert data* vi kan skaffe selv — uten aktørkontakt — og definerer på forhånd hvilken modell dataen mates inn i og hvordan den fremstilles. Masterprompten og valideringsprompten fra v1 gjelder fortsatt; RP-promptene under legges *etter* masterprompten i samme kjøring, sammen med datamodus-tillegget i kap. 2.

Alle utfall følger samme kontrollstack som v1: mottakslogg → casekort/research-mottak → source-shortlist → PCQ → claim-lock. Ingen RP-kjøring åpner claims eller ekstern faktastemme.

## 1. JT-temaene som styrer pakken

| # | Tema | Hvor JT sa det | RP |
|---|---|---|---|
| 1 | «Sett foten ned ved verdikjedestrukturen — hvor maten flyter og hvor den kastes»; verdikjedeoversikt per nordisk land med volum, avtrykk, sårbarhet | Møte 6 (13.04) | RP-01 |
| 2 | Importavhengighet og fôr som nøkkel til selvforsyning; soya/Brasil; bacalhau-motstrømmen | Møte 6, 7, 10 | RP-02 |
| 3 | R9-rammeverket per verdikjedeledd; 7–10 nøkkelspørsmål for sirkularitet i mat | Møte 7 (20.04) | RP-03 |
| 4 | Matsvinnkvalitet: grønne poser kontaminerer, biorest full av mikroplast, matavfall som ikke kan bli fôr | Møte 7 | RP-04 |
| 5 | Næringsstoffløkker: svartvann/Helsingborg, fôrineffektivitet i oppdrett (~70 % i fjorden), biogass/gjødselgjenvinning, kunstgjødsel/Yara | Møte 7, 10 | RP-05 |
| 6 | Hva har lykkes og feilet, og hvorfor: havremelk-avfall, Restaurant Rest, potetlefser, Too Good To Go, Volare, Axfoundation | Møte 5, 7 | RP-06 |
| 7 | Medienarrativer per land: DK eksport/duopol, FI beredskap, NO prispress, SE selvforsyning | Møte 6 | RP-07 |
| 8 | Spillvarme/drivhus/akvaponikk som lokal produksjon | Møte 10 | RP-08 (datadelen; caseside dekkes av v1 prompt 5) |

## 2. Datamodus-tillegg til masterprompten

Lim dette inn rett etter masterprompten fra v1 i hver RP-kjøring. Det tvinger outputen inn i import-klare skjema:

```text
DATAMODUS — tilleggsregler for denne kjøringen:

Målet er strukturert data som kan importeres i en database, ikke prosa. All kvantitativ output skal leveres i tabellform med disse minimumsfeltene per rad: verdi, enhet, år/periode, geografi, definisjon/metode, kildeeier, kilde-URL, locator (side/tabell/celle), og en datakvalitetsmarkering med ett av: observert (målt/rapportert av kildeeier), estimert (beregnet av kilde med oppgitt metode), modellert (scenario/fremskrivning), illustrativ (retning uten tall).

Strenge regler:
- Aldri bland år eller geografier i samme celle.
- Aldri summer tall fra kilder med ulik definisjon uten å si det.
- Hvis to kilder oppgir ulike tall for samme størrelse, rapporter begge med avvik og årsak.
- Hvis et tall bare finnes som sekundær gjengivelse, merk raden "sekundær — finn primær" i stedet for å oppgi tallet som fakta.
- Rapporter eksplisitt hvilke celler i tabellen du IKKE fant data for. Tomme celler er et hovedfunn.
- Oppgi for hver tabell: hvilken offisiell statistikkilde som er autoritativ for feltet (f.eks. SSB, Eurostat, FAOSTAT, Tulli, Danmarks Statistik, Jordbruksverket, Hagstofa Íslands), og om dataen kan lastes ned som datasett (API/CSV) eller bare finnes i rapportform.
```

## 3. Fremstillingskatalog: modeller dataen mates inn i

| Modell/flate | Status i repo | Tar imot | Fremstilling |
|---|---|---|---|
| Flytmodell (FlowEdge/LoopFlows, evidensgradert, R-ladder-koblet) | Bygget 29.05 | Materialstrømmer: fra-node, til-node, materiale, volum, enhet, år, kilde, evidensstatus | Sankey + nettverkskart med evidensfarger, materialflyt-fane |
| Romlig flytmodell | Bygget 29.05 (Kalundborg første case) | Strømmer med lokasjon (koordinater/sted) | Kart med observerte strømmer |
| Kunnskapsgraf | I drift | Aktører, eierskap, relasjoner med proveniens | Graf, interlocks, sentralitet |
| CoverageProfile/overclaim-gate | Bygget 29.05 | Datasett-metadata: temporal/geografisk/verifikasjonsdekning | Coverage-badges, /kilder-oversikt, proveniens-appendix |
| R-ladder (kanonisk Potting 2017) | Justert 29.05 | Klassifisering av tiltak/strøm per R-strategi | Brukes i flytmodell og innsikt |
| Verdikjede-/forsyningskjedeflater | I drift | Ledd-data per land | /verdikjede, /forsyningskjede |
| Handelsdata-tidsserier | Planlagt (utviklingsplan, arbeidsstrøm 3) | Varenummer-serier per år/land | Tidsserie-grafer |
| Casestatus-flate + claim-trakt | Planlagt (utviklingsplan, arbeidsstrøm 2) | Casekort-/claimstatus | Styringsvisning |

Nye fremstillinger som RP-serien skal gjøre mulige (bygges først når data finnes):

| Ny fremstilling | Beskrivelse | Trigger |
|---|---|---|
| **R9 ledd-matrise** | Matrise verdikjedeledd × R-strategi per land: hvor i kjeden skjer refuse/reduce/reuse/…/recover i dag, med evidensfarge per celle | RP-03 |
| **Handelsakse-visning** | Bilateral akse (f.eks. Norge↔Brasil): strømmer begge veier (soya/SPC inn, klippfisk ut) som parvis Sankey med tidsserie | RP-02 |
| **Kvalitetsdimensjon i nutrient-flyt** | Flytkant med kvalitetsattributt (ren/kontaminert/mikroplast) slik at samme strøm kan vises som tapt høyverdi-mulighet | RP-04/RP-05 |
| **Suksess/fiasko-ledger** | Strukturert taksonomi over hvorfor sirkulære matinitiativ lykkes/feiler, koblet til C-gate-barrierene | RP-06 |
| **Narrativ × land-matrise** | Medienarrativ per land over tid på /media-flaten | RP-07 |

## 4. RP-serien

### RP-01: Nordisk verdikjedekart med volumdata

**JT-bestilling:** verdikjedeoversikt per nordisk land — volum, avtrykk, sårbarhet (møte 6, aldri fullført som datasett).
**Hva vi kan gjøre selv:** alt. Dette er offentlig statistikk: SSB, Eurostat (food balance), FAOSTAT (Food Balance Sheets), Landbruksdirektoratet, nasjonale statistikkbyråer.
**Modellkobling:** flytmodellen (én LoopFlow per land: produksjon → import → prosessering → grossist → retail/HORECA → forbruk → avfall) + verdikjedeflatene. CoverageProfile registreres per datasett fra dag én.
**Fremstilling:** Sankey per land + nordisk sammenligningsside; senere R9 ledd-matrise oppå samme struktur.

```text
Oppgave: Bygg et kvantitativt verdikjedekart for matsystemet i [LAND: Norge/Sverige/Danmark/Finland/Island — kjør ett land per tråd].

Hent nyeste tilgjengelige år (oppgi året eksplisitt) for:
1. Total matproduksjon per hovedkategori (korn, grønnsaker/frukt, melk/meieri, kjøtt per dyreslag, fisk/sjømat villfanget og oppdrett), i tonn.
2. Import og eksport per samme kategorier, i tonn og verdi.
3. Selvforsyningsgrad slik nasjonale myndigheter selv definerer og publiserer den — oppgi definisjonen (med/uten fôrkorreksjon).
4. Matsvinn/matavfall per verdikjedeledd (primærproduksjon, industri, grossist/distribusjon, dagligvare, HORECA, husholdning), i tonn, med kildeeiers metodikk.
5. Hvor avfalls-/reststrømmene går i dag: andel til fôr, biogass, kompost, forbrenning, deponi — hvis dette finnes fordelt.

Leveranseformat: én radbasert strømtabell egnet for import, med kolonnene:
fra_ledd | til_ledd | materiale/kategori | verdi | enhet | år | geografi | datakvalitet (observert/estimert/modellert/illustrativ) | kildeeier | URL | locator | definisjonsnotat

Tomme celler rapporteres i egen "mangler data"-tabell med forslag til hvor dataen kan finnes (byrå, register, rapport).
Autoritative kilder først: nasjonalt statistikkbyrå, Eurostat, FAOSTAT, landbruks-/fiskerimyndigheter, miljømyndigheter (for avfall). Bransjerapporter kun som spor.
Ikke regn om mellom enheter uten å vise omregningen. Ikke fyll hull med nordiske gjennomsnitt.
```

**Gate:** hver tabell inn som datasett-kandidat i source-shortlist med `needs-data`-felt for tomme celler; ingen strøm settes høyere enn `estimert` uten primærkilde per celle.

### RP-02: Fôrimport-tidsserie og handelsaksen Norge↔Brasil

**JT-tema:** importert fôr som nøkkel til selvforsyning og Scope 3; soya inn / bacalhau ut (møte 6, 10).
**Hva vi kan gjøre selv:** handelsstatistikk er åpen: SSB utenrikshandel, UN Comtrade, Eurostat Comext, brasilianske Comex Stat.
**Modellkobling:** handelsdata-tidsserier (utviklingsplanens arbeidsstrøm 3) + ny handelsakse-visning; soyastrømmen kobles som opprinnelseslag på eksisterende A-spor-flyt.
**Fremstilling:** tidsserie 2015–2025 + parvis Sankey for aksen.

```text
Oppgave: Bygg tidsseriegrunnlag for handelsaksen Norge–Brasil i matsystemet, 2015–nyeste år.

Serier som skal hentes (per år, med varenummer/HS-kode eksplisitt oppgitt):
1. Import til Norge fra Brasil: soyabønner (HS 1201), soyamel/SPC (HS 2304 og relevante underkoder), andre fôrråvarer (oppgi koder du bruker).
2. Total norsk import av samme varegrupper fra alle land, slik at Brasil-andelen kan beregnes.
3. Eksport fra Norge til Brasil: klippfisk/saltfisk/tørrfisk (HS 0305-koder), oppgi både tonn og verdi.
4. Hvis tilgjengelig: hvilke ledd som importerer (fôrprodusenter) — kun fra offentlige kilder eller aktørenes egne årsrapporter, ikke estimater.

Leveranseformat: én tabell per serie med kolonnene år | HS-kode | vare | verdi_tonn | verdi_NOK | kilde | URL | locator | datakvalitet. Pluss en kildetabell som oppgir om serien kan hentes via API/CSV (SSB tabellnummer, Comtrade-spørring, Comex Stat-uttrekk) — det er viktigere enn å gjengi alle tallene i svaret.

Kontroll: sammenlign SSB-tall og Comtrade-speiltall (Brasils eksport til Norge) for minst ett år og rapporter avviket.
Ikke si noe om hvorfor strømmene er som de er. Ikke koble til EUDR-vurderinger i denne kjøringen — kun datagrunnlag.
```

**Gate:** seriene importeres som datasett med CoverageProfile; Brasil-andelen blir først claim når claim-lock har formulering med år og kode.

### RP-03: R9 per verdikjedeledd og JTs 7–10 sirkularitetsspørsmål

**JT-bestilling:** R9 som teoretisk grunnlag for å vurdere sirkularitetsgrad i hvert ledd; 7–10 nøkkelspørsmål (møte 7 — spørsmålene er aldri ferdigstilt).
**Hva vi kan gjøre selv:** dette er primært syntese av eget materiale + målrettet litteratursøk; R-ladder er allerede kanonisk (Potting 2017) i repoet.
**Modellkobling:** ny R9 ledd-matrise (ledd × R-strategi × land) der hver celle får evidensstatus fra eksisterende klassifiseringer; nøkkelspørsmålene blir styringslag i casestatus-flaten.
**Fremstilling:** matrise med evidensfarger; per-case R9-plassering i casekortene.

```text
Oppgave: Bygg grunnlag for en matrise verdikjedeledd × R-strategi for nordiske matsystemer, etter Potting et al. 2017 (R0 refuse ... R9 recover).

For hvert ledd (primærproduksjon, prosessering, grossist/distribusjon, retail, HORECA, husholdning, avfall/reststrøm):
1. Finn dokumenterte nordiske eksempler per R-strategi — kun eksempler med navngitt aktør/prosjekt, lokasjon, år og kilde. Ett godt eksempel per celle er nok; tomme celler skal rapporteres som tomme.
2. Klassifiser hvert eksempel: operativt / pilot / avsluttet / feilet. Feilede eksempler er like verdifulle.
3. Oppgi hvilken evidens som finnes for effekt (volum, kroner, utslipp) — som regel ingen; si det da.

Deretter: foreslå 7–10 nøkkelspørsmål for sirkularitet i mat, der hvert spørsmål (a) er forankret i et ledd og en R-strategi, (b) kan besvares med data som faktisk finnes eller kan innhentes, og (c) skiller høyverdiutnyttelse fra energiutnyttelse. Oppgi for hvert spørsmål hvilken datakilde som ville besvart det.

Leveranseformat: matrisetabell ledd | R-strategi | eksempel | aktør | land | år | status | effektevidens | kilde | URL, deretter spørsmålslisten med datakilde per spørsmål.
Ikke bruk Wageningen-score eller Moerman-stige som bevisnivå — kun som omtalt rammeverk. Ikke klassifiser energiutnytting (forbrenning/biogass uten næringsretur) høyere enn R9 recover.
```

**Gate:** matrisecellene inn som casekort-/innsiktskandidater; nøkkelspørsmålene legges frem for JT som forslag (det var hans bestilling) før de styrer noe.

### RP-04: Matsvinnkvalitet og kontaminering

**JT-tema:** grønne poser gjør matavfall ubrukelig til fôr; biorest full av mikroplast; kvalitet avgjør om reststrøm kan opp i verdihierarkiet (møte 7).
**Hva vi kan gjøre selv:** Miljødirektoratet, Mattilsynet, Avfall Norge, NIBIO, NMBU-papers (7 ligger alt i biblioteket), svenske/danske tilsvarende etater.
**Modellkobling:** kvalitetsattributt på FlowEdge (ren/kontaminert/ukjent) — liten skjemautvidelse som lar samme Sankey vise *tapt* høyverdipotensial, ikke bare strøm.
**Fremstilling:** flytmodell der kontaminerte strømmer farges/merkes; «kvalitetsgate»-innsikt i B-sporet.

```text
Oppgave: Dokumenter kvalitets- og kontamineringsdimensjonen i nordisk matavfall, med Norge først.

Hypoteser å teste mot primærkilder:
1. Plastkontaminering (inkl. bioplast-/poserester) begrenser bruk av kildesortert matavfall til fôr eller høyverdig gjenvinning — hva sier regelverk (fôrhygiene, animalske biprodukter kat. 3) og tilsynsrapporter faktisk?
2. Biorest fra biogassanlegg inneholder mikroplast — finnes målinger (konsentrasjon, metode, anlegg, år), grenseverdier eller bransjekrav?
3. Hvilke renhetskrav gjelder for at en matreststrøm kan bli fôringrediens i Norge/EU, og hvilke strømmer diskvalifiseres i praksis?
4. Finnes kvantifisering av hvor mye matavfall som nedklassifiseres fra potensiell fôr-/materialbruk til energi pga. kvalitet?

Leveranseformat:
- Regelverkstabell: krav | hjemmel/forskrift | hva det betyr for reststrøm | kilde | URL | locator.
- Måletabell: hva målt | verdi | enhet | anlegg/sted | år | metode | kilde | URL | datakvalitet.
- Strømtabell for kvalitet: strøm | dagens sluttbruk | kvalitetsbarriere | mulig høyverdibruk hvis ren | kilde.
Skill skarpt mellom norsk forskrift, EU-rett og bransjepraksis. Ikke oppgi mikroplast-funn uten metode og år. Rapporter eksplisitt hvis kvantifisering ikke finnes — det definerer datagapet vårt.
```

**Gate:** regelverksrader kan bli `deckklart internt` raskt (lov/forskrift er primærkilde); måledata inn i PCQ til metode er sjekket.

### RP-05: Næringsstoffløkker — fosfor, nitrogen, slam og svartvann

**JT-tema:** Helsingborg/svartvann, ~70 % av fôret rett i fjorden, gjødselgjenvinning, kunstgjødsel/Yara/biogass (møte 7, 10).
**Hva vi kan gjøre selv:** forskningsrapporter (SINTEF, NIBIO, RISE), Helsingborg/RecoLab-dokumentasjon, Miljødirektoratet om oppdrettsslam, uten aktørkontakt.
**Modellkobling:** romlig flytmodell — Helsingborg/RecoLab er en naturlig kandidat nr. 2 etter Kalundborg; næringsstoffstrømmer (P/N/K) som egne FlowEdges med kvalitetsattributt fra RP-04.
**Fremstilling:** kart + massebalanse-Sankey for næringsstoff (ikke bare masse) — det er den fremstillingen som gjør «70 % i fjorden» kontrollerbar i stedet for anekdotisk.

```text
Oppgave: Bygg kildegrunnlag for nordiske næringsstoffløkker (fosfor, nitrogen, kalium) i matsystemet, med tre delfelt.

Delfelt A — oppdrett: Hvilke primærkilder kvantifiserer næringsstofftap fra norsk havbruk (fôrspill + fekalier), per år, som andel av tilført fôr eller i tonn N/P? Hva finnes om slamoppsamling i lukkede/semilukkede anlegg, oppsamlingsgrad og bruk av slammet (gjødsel, biogass, eksport)? Hvilke regulatoriske krav gjelder?
Delfelt B — svartvann/urbane løkker: Dokumentér Helsingborg RecoLab/Oceanhamnen med primærkilder: omfang (boliger/pe), separasjonsgrad, gjenvunnet N/P/K i tonn per år, driftsstatus nå, eier, og publiserte evalueringer. Finnes tilsvarende nordiske anlegg?
Delfelt C — gjødselkobling: Hvilke primærkilder beskriver forholdet mellom mineralgjødselforbruk i Norden og potensialet i gjenvunnet næring fra biorest, slam og husdyrgjødsel — med tall, år og metode?

Leveranseformat: per delfelt en datatabell (metrikk | verdi | enhet | år | geografi/anlegg | metode | kilde | URL | locator | datakvalitet) og en kildeledger. For delfelt B også lokasjonsfelt (sted/koordinat) slik at strømmen kan legges på kart.
Ikke bruk "70 % av fôret går i fjorden" som fakta — finn hva forskningen faktisk oppgir, med spennvidde og metode. Ikke summer N og P. Skill potensial fra realisert gjenvinning.
```

**Gate:** delfelt B kan bli romlig case etter samme mal som Kalundborg (kun observerte strømmer på kart); A og C inn i PCQ-B-sporet.

### RP-06: Suksess/fiasko-ledger for sirkulære matinitiativ

**JT-tema:** kartlegg hva som har lykkes/feilet og hvorfor (møte 7); Einars Rest-eksempel (møte 5); havremelk-avfall, potetlefser, TGTG (møte 7).
**Hva vi kan gjøre selv:** konkursregistre, årsrapporter, omtaler, aktørenes egne kanaler — full dokumentjakt uten kontakt.
**Modellkobling:** **ny modell** — initiativ-ledger med feilårsakstaksonomi koblet til C-gatens barrierekategorier (marked, distribusjon, pris, regulering, data, kjøper). Dette er den mest direkte empiriske testen av C-sporets hovedtese: at adoption-barrierer, ikke teknologi, avgjør.
**Fremstilling:** matrise initiativ × barrierekategori; senere innsiktsside «hvorfor sirkulære matløsninger stopper».

```text
Oppgave: Bygg en strukturert ledger over nordiske sirkulære matinitiativ som har lykkes, stagnert eller feilet, for å teste hvilke barrierer som faktisk avgjør.

Startliste (utvid gjerne med 10-15 flere dokumenterbare): Restaurant Rest (Oslo, konkurs 2024), Too Good To Go, Volare (FI), Axfoundation Framtidens Fisk (SE), havremelk-sidestrøm-initiativ, potetlefse-uten-skall (Sørlandet), Matsentralen, Holdbart, Fjong/utgåtte konsepter innen redistribusjon.

Per initiativ, kun med kilde:
1. Hva var løsningen, hvilket verdikjedeledd og hvilken R-strategi (Potting 2017)?
2. Status: operativ/skalert/stagnert/avviklet/konkurs — med dato og kilde (konkursregister, årsregnskap, egen kunngjøring).
3. Dokumentert årsak til utfall: hva sier primærkilder (styre, gründer, bobestyrer, årsberetning) selv? Skill dokumentert årsak fra medias forklaring.
4. Klassifiser årsaken(e) i: marked/etterspørsel, distribusjon/hylleplass, pris/marginer, regulering, kapital, drift/kvalitet, eierskap/strategi — flere mulig, men hver må ha kildebelegg.
5. Hva ville initiativet trengt (offentlig innkjøp, distribusjonsavtale, prisvirkemiddel) — kun hvis kilden selv sier det.

Leveranseformat: ledger-tabell initiativ | land | ledd | R-strategi | status | dato | dokumentert årsak | barrierekategori | kilde | URL | locator, pluss en oppsummeringstabell barrierekategori × antall initiativ.
Ikke spekuler i årsaker uten kilde. Ikke bruk enkeltcase som bevis for systemtese — ledgeren skal vise fordeling, ikke konklusjon. Konkurs er ikke i seg selv bevis på at sirkulær mat ikke virker; noter motfortellinger.
```

**Gate:** hele ledgeren er internt arbeidsmateriale; enkeltinitiativ-årsaker er aktørsensitive og går i claim-lock som `hold-tilbake` til kildene er primærsjekket.

### RP-07: Medienarrativ per land

**JT-tema:** narrativene DK eksport/duopol, FI beredskap, NO prispress, SE selvforsyning (møte 6); Einar etterlyste mediekartlegging (møte 5).
**Hva vi kan gjøre selv:** systematisk mediesøk; /media-flaten finnes allerede og er oversatt.
**Modellkobling:** /media + narrativ × land-matrise; narrativene brukes som *kontekstlag* i casekort (hvilket narrativ et case spiller med eller mot), aldri som evidens.
**Fremstilling:** matrise land × narrativ med eksempelsaker og tidsstempel.

```text
Oppgave: Kartlegg dominerende medienarrativer om matsystem, matpriser, selvforsyning og sirkularitet i Norge, Sverige, Danmark og Finland de siste 18 månedene.

Test disse hypotesene per land (formulert internt, skal testes — ikke bekreftes): Danmark = eksportnæring og duopol/konsolidering; Finland = beredskap og forsyningssikkerhet; Norge = prispress og kjedemakt; Sverige = selvforsyningsgrad og sårbarhet.

Per land:
1. De 5-8 mest dekkede sakene/temaene i riksmedier og fagpresse (landbruks-/sjømat-/dagligvarepresse), med dato og lenke.
2. Hvilke aktører som driver narrativet (myndighet, bransjeorganisasjon, kjede, forskning).
3. Om sirkularitet/reststrøm/fôr i det hele tatt er del av dekningen, eller fraværende — fravær er funn.
4. Avvik fra hypotesen over: hva snakkes det om som vi ikke har antatt?

Leveranseformat: tabell land | narrativ | eksempelsak | medium | dato | URL | drivende aktør | kobling til våre spor (A fôr / B sidestrøm / C adoption / ingen). Maks 40 rader totalt.
Dette er kontekstkartlegging, ikke evidens: ingen mediesak skal brukes som kilde for faktaclaims om aktører. Marker saker som kan være inngang til primærkilder (rapporter, tilsynssaker) i egen kolonne.
```

**Gate:** ren kontekst; importeres til /media-flaten, aldri til claim-register.

### RP-08: Spillvarme-datapakke (supplement til v1 caseprompt 5)

V1 caseprompt 5 dekker casevalideringen. Datadelen som mangler: en *kvantitativ* mini-ledger som kan inn i romlig flytmodell. Kjør v1-prompten med datamodus-tillegget (kap. 2) og dette tilleggskravet:

```text
Tilleggskrav: For hvert anlegg/prosjekt i caseledgeren, lever også lokasjon (sted, kommune, land), varmekilde-node og mottaker-node slik at strømmen kan tegnes på kart, og oppgi eksplisitt om energimengden er (a) kontraktsfestet levert varme, (b) teknisk potensial, eller (c) medieomtalt tall uten kildeunderlag. Kun (a) kvalifiserer som observert strøm.
```

## 5. Kjøreplan og prioritering

| Prioritet | RP | Hvorfor først | Mater |
|---:|---|---|---|
| 1 | RP-01 (ett land om gangen, Norge først) | Innfrir JTs eldste udekkede bestilling; gir skjelettet alle andre strømmer henges på | Flytmodell, verdikjedeflater, R9-matrise |
| 2 | RP-02 | A-sporet er mest modent; handelsdata er raskest å verifisere (API/speiltall) | Tidsserier, handelsakse, Brasil-lag i casekort |
| 3 | RP-06 | Tester C-tesen empirisk; sterkt deck-/whitepaper-materiale; ren dokumentjakt | Ny ledger, C-gate, eventfortelling |
| 4 | RP-04 + RP-05 | Henger sammen (kvalitet avgjør løkkene); gir RecoLab som romlig case nr. 2 | Flytmodell m/kvalitet, kart, B-spor |
| 5 | RP-03 | Krever at RP-01-skjelettet finnes for å bli mer enn teori; leverer JTs nøkkelspørsmål | R9-matrise, casestatus-flate |
| 6 | RP-07 | Kontekstlag, lav risiko, kan kjøres når som helst | /media, casekort-kontekst |
| 7 | RP-08 | Venter på v1-caseprompt 5-utfall i sprintboardet | Romlig flytmodell |

Praktisk: én RP-kjøring per Deep Research-tråd, masterprompt (v1) + datamodus (kap. 2) + RP-prompt. Output lagres som `deep-research-rp<NN>-<tema>-YYYY-MM-DD.md`, valideres med v1-valideringsprompten, og registreres i mottaksloggen med ID-serie `DRO-RP-<NN>` slik at RP-løypene ikke blandes med 0906-caseløypene.

## 6. Hva dette gir JT-dialogen

Når RP-01/02/06 er kjørt og importert, kan neste JT-møte vise: (1) det nordiske verdikjedekartet han ba om i april — som faktisk Sankey med evidensfarger, ikke skisse; (2) Brasil-aksen som tidsserie i stedet for anekdote; (3) en empirisk fordeling av hvorfor sirkulære matinitiativ stopper, koblet til hans egne eksempler. Det flytter samtalen fra «hva bør vi undersøke» til «her er dataen — hvilke celler skal vi prioritere å fylle», som er nøyaktig den styringsrollen sprintboardet og casestatus-flaten er bygget for.
