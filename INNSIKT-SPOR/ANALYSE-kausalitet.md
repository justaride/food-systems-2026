# Kausalitet: hva materialet faktisk sier

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Kjernekilder (felt `kausalitet`):** 63 i manifestet — alle 63 lest (26 fulltekst, 37 delvis). 25 kilder ga minst ett eksplisitt `kausalitet`-merket finding.
**Skrevet på nytt fra ekstraktene:** 2026-08-05 (runde 2)
**Grunnlag:** 36 `kausalitet`-merkede findings fra `INNSIKT-SPOR/ekstrakt/kjerne-skive-*.jsonl`.

## 1. Kortversjonen

Runde 1 konkluderte at kausalitet «primært er et metodisk Type C-hull, ikke et hull som kan lukkes med flere policytekster». Primærkildene nyanserer dette kraftig, og på ett punkt motsier de det.

Det finnes faktisk **identifisert kausalevidens i korpuset** — men den ligger et annet sted enn der prosjektet leter. Den er akademisk og eksperimentell, ikke policy-forankret:

- **Dagligvarekonsentrasjon** har flere norske økonometriske studier med eksplisitt identifikasjonsdesign (OLS + instrumentvariabel, 2SLS): liberal kommunal regulering → lavere lokal konsentrasjon (Fretheim & Rodnova 2020), importvern ↔ leverandørkonsentrasjon (Martens & Norum 2020), restriktive servitutter ↔ lokal HHI (Nguyen & Hartmann 2024).
- **Offentlig grønt innkjøp** har en svensk PhD med FGLS-paneldesign 2003–2016 som finner signifikant positiv effekt på økologisk areal nasjonalt, men null lokalt (Lindström 2021).
- **Jordhelse** har ett fagfellevurdert feltforsøk (Hiis et al., *Nature* 2024) som måler en isolert årsakseffekt: digestat med en N2O-respirerende bakterie kutter lystgassutslipp 50–95 %.
- **Pris-overvelting** har en NHH-masterutredning med økonometrisk pass-through-modell (Nilsen & Paulsen 2025).

Der kausalevidensen svikter, er nettopp de påstandene prosjektet bryr seg mest om: lokalmat- og beredskapsrobusthet, effekten av 30-prosentkravet i offentlige anskaffelser, nasjonal effekt av matsvinnvirkemidler, og årsak bak konkursene i alternativprotein. For disse finnes ingen prespesifisert baseline, kontrollgruppe eller kontrafaktisk. Der er Type C-diagnosen fra runde 1 fortsatt riktig.

Så den presise dommen er: **kausalitet er ikke ett hull, men to regimer.** Der en akademisk identifikasjonsdesign allerede finnes (konsentrasjon, GPP-på-øko-areal, N2O-bakterie), kan vi sitere en identifisert effekt med forbehold. Der bare policytekst og aktørcase finnes (transisjonspåstandene), står vi igjen med mekanisme og korrelasjon, aldri effekt.

## 2. Hva materialet dokumenterer

**Identifiserte effekter med kausalt design.** Fire studier bruker eksplisitt identifikasjonsdesign. Fretheim & Rodnova (NHH 2020) kjører OLS og instrumentvariabelanalyse på samtlige norske kommuner 2015–2018 og finner en kausal negativ sammenheng mellom liberal kommunal byggesaksregulering og lokal markedskonsentrasjon (HHI). [Kilde: `research/evidence-pack/akademia/fretheim-rodnova-2020.pdf`, Sammendrag + resultatkapittel; basis: modellert.] Lindström (Umeå PhD 2021) bruker FGLS-panel på svenske kommuner 2003–2016 og finner at offentlig økologisk matinnkjøp har signifikant positiv effekt på økologisk jordbruksareal på aggregert nasjonalt nivå, men null/liten lokal effekt innen egen region. [Kilde: `research/evidence-pack/akademia/lindstrom-phd-2021.pdf`, s. 9–10 (Paper I); basis: modellert.] Nguyen & Hartmann (NHH 2024) bruker 2SLS/OLS og finner at flere restriktive servitutter er assosiert med høyere lokal HHI, men kan ikke konkludere om effekt på butikk-til-konkurrent-avstand. [Kilde: `research/evidence-pack/akademia/nguyen-hartmann-2024.pdf`, Abstract, kap. 5; basis: modellert.]

**Ett målt eksperiment.** Hiis et al. (*Nature* 630, 2024, NMBU/IIASA/Veas) er den eneste kilden i korpuset som måler en isolert årsakseffekt eksperimentelt: gjødsling med biogass-digestat der bakterien *Cloacibacterium* sp. CB-01 hadde vokst, reduserte N2O-utslipp med 50–95 % avhengig av jordtype i feltforsøk. Europeisk oppskalering (5–20 % nasjonal reduksjon) er derimot en modellert projeksjon, ikke en realisert effekt. [Kilde: `research/evidence-pack/akademia/pubmed/hiis-eg-2024-unlocking-bacterial-potential-to-reduce.pdf`, Abstract / s. 421; basis: målt (felt) hhv. modellert (oppskalering).]

**Mekanisme og korrelasjon uten identifisert effekt.** Konkurransetilsynets prisjusteringsvindu-rapport dokumenterer at KPI-tall 2013–2021 viser faste gjentakende topper rundt vinduene (1. feb / 1. juli) og at forbrukerpriser historisk har økt mer enn leverandørpriser rundt vinduene, i motsetning til jevnere utvikling i Sverige og Danmark — men tilsynets egen dom er at systemet «sannsynligvis» har vært konkurransebegrensende, uten kausal identifikasjon utover KPI-korrelasjon. [Kilde: `research/evidence-pack/tilsyn/prisjusteringsvinduer-2023.pdf`, Sammendrag s. 3–5; basis: målt (KPI-mønster) hhv. ikke_oppgitt (samlet vurdering).] Nilsen & Paulsen (NHH 2025) estimerer at kakaoprisøkninger sannsynligvis overveltes fullstendig (full/>100 % pass-through) på forbruker på lang sikt, med treghet fullført etter ca. 1–3 måneder — men data er kun fra NorgesGruppen (Meny/Kiwi), og de skiller ikke årsak i markedsmakt fra kostnad for kategoriene uten pass-through. [Kilde: `research/evidence-pack/akademia/nilsen-paulsen-2025.pdf`, Sammendrag s. i–ii; basis: modellert.]

**Case og aktørhendelse uten årsak.** Konkursbølgen i insektprotein dokumenteres som strukturell og sektorovergripende (Ÿnsect i likvidasjon etter >600 MEUR reist; Agronutris, Enorm, Aspire, Innovafeed med tap) — men kilden er advocacy-journalistikk (ONEI) uten systematisk sektordatasett, og tallene er selskapsrapporterte. Det dokumenterer hendelser og en økonomisk skjørhet (insektmel 2–10× dyrere enn fiske-/soyamel), ikke en isolert årsak. [Kilde: `research/evidence-pack/sirkular-konkurser/_benchmarks/ynsect-onei.md`, avsnitt «A fragile economic model» / «A case that is not isolated»; basis: aktoropplysning hhv. ikke_oppgitt.]

## 3. Tallene

Hvert tall sporer til et `kausalitet`-merket ekstrakt-finding med lokator og `basis`. Tabellen er delt: **A** = tall som stammer fra et kausalt identifikasjonsdesign (identifisert effekt), **B** = beskrivende/kontekst-tall som ofte feiltolkes som effekt. Alt merket `modellert` hviler på en modell, ikke en måling.

### A. Identifiserte effekter (kausalt design)

| Størrelse | Verdi | År | Kilde (primær) | Lokator | Basis |
|---|---:|---:|---|---|---|
| Liberal kommunal regulering → lokal HHI | kausal negativ sammenheng | 2015–2018 | Fretheim & Rodnova (NHH) | Sammendrag + resultatkap. | **modellert** (OLS + IV) |
| Offentlig øko-innkjøp → øko-areal | signifikant positiv (nasjonalt); null (lokalt) | 2003–2016 | Lindström (Umeå PhD) | s. 9–10 (Paper I) | **modellert** (FGLS-panel) |
| Restriktive servitutter ↔ lokal HHI | positiv assosiasjon | 2024 | Nguyen & Hartmann (NHH) | Abstract, kap. 5 | **modellert** (2SLS/OLS) |
| Importvern ↔ leverandørkonsentrasjon | positiv sammenheng | 2019 | Martens & Norum (NHH) | Sammendrag + Vedlegg 4–5 | **modellert** |
| Digestat m/ CB-01 → N2O-utslipp (felt) | −50–95 % | 2024 | Hiis et al., *Nature* 630 | Abstract / s. 421 | målt (feltforsøk) |
| Kakaopris → forbrukerpris (lang sikt) | full / >100 % pass-through | 2025 | Nilsen & Paulsen (NHH) | Sammendrag s. i–ii | **modellert** (økonometrisk) |
| Pass-through-forsinkelse | 1–3 måneder | 2025 | Nilsen & Paulsen (NHH) | Sammendrag s. ii | **modellert** |
| ML-etterspørselsprognose → serveringssvinn | −16 % (opptil −46 %) | 2024 | Mattila (LUT) | Abstract | målt (pilot, ett selskap) |

### B. Beskrivende / kontekst-tall (ikke isolert effekt)

| Størrelse | Verdi | År | Kilde (primær) | Lokator | Basis |
|---|---:|---:|---|---|---|
| N2O-bakterie, EU-oppskalering | −5–20 % nasjonale N2O | 2024 | Hiis et al., *Nature* | Abstract | **modellert** (oppskalering) |
| CO2-effekt av svinnpiloten | −30,5 t CO2e/år (anslag) | 2024 | Mattila (LUT) | Abstract | **modellert** (ekstrapolert) |
| Matinflasjon NO | +11,5 % (des 2021–des 2022) | 2022 | Konkurransetilsynet marginstudie 2024 (SSB/Eurostat) | kap. 1 | målt |
| Matinflasjon SE | ~26 % (feb 2022–mar 2023) | 2023 | Konkurrensverket 2024:5 | kap. 3 s. 19 | målt |
| Overtredelsesgebyr «prisjeger» | 1,3 / 2,3 / 1,3 mrd NOK; >95 % samlet andel | 2024 | Konkurransetilsynet dagligvarerapport 2024 | avsnitt (14–27) | aktoropplysning (vedtak, anket) |
| Norsk selvforsyningsgrad (energibasert, norsk metode på FAO) | 24–25 % | 2021 | NIBIO Rapport 12/46 2026 | kap. 3, Tabell 6 | **modellert** |
| Topp-3 dagligvare SE | >97 % (2000) → ~88 % (2022) | 2022 | Konkurrensverket 2024:4 | kap. 2.2 s. 19 | aktoropplysning |
| SE-kommuner uten lavprisbutikk | 102 av 290 (~1 mill. innb.) | 2022 | Konkurrensverket 2024:4 | Sammanfattning s. 5 | målt |
| «Netto proteinforbruk» laks vs. villfisk | 27 % lavere volum | 2020 | Feedback/Greenpeace (Blue Empire) | avsnitt om ineffektivitet | **modellert** (interessepart) |
| Ÿnsect, kapital reist (kumulativt) | 600 MEUR | 2025 | ONEI | avsnitt «Promising beginnings» | aktoropplysning (advocacy) |
| BSE-overvåking EU | 73 mill. testet; 554 → 2 tilfeller | 2005–2015 | van Leeuwen 2024 / EFSA | s. 4 | målt |
| Helsekostnad dårlig kosthold NO (innsparingspotensial) | ~154 mrd NOK/år | 2019 | Stockholm Resilience/EAT | s. 24 | **modellert** |
| Leverandør-CR3 NO | oftest >80 % | 2010 | NOU 2013:6 (siterer Matkjedeutvalget) | kap. 5.4.2.2 | aktoropplysning |

## 4. Der kildene er uenige

Denne seksjonen var nesten tom i runde 1. Ekstraktenes `contradicts` fyller den nå med seks reelle uenigheter:

1. **Konsentrasjonsgrad — akademi vs. tilsyn.** Steen (NHH FOOD 2024) nedtoner at norsk dagligvare er vesentlig mer konsentrert enn nabolandene; Konkurransetilsynet (vedtak V2024-4) fastholder at markedet er høyt konsentrert (>95 % hos tre aktører) og sårbart for konkurransebegrensning. [Kilde: `prisjeger-saken-2024-offentlig-versjon.pdf`, `contradicts` mot Steen-notatet.]

2. **Svensk selvforsyningsgrad — metodeavhengig sprik.** SLU-Eriksson (2016) oppgir ~55–60 %; NIBIO (2026, norsk metode på FAO-data) får 47–49 %. Forskjellen skyldes ulik metode/definisjon (kalori/energi vs. produkt/verdi, fôrkorreksjon) — som NIBIO nettopp demonstrerer at gjør «sanne» sammenlignbare tall umulige. [Kilde: `nibio-selvforsyning-2026.pdf`, `contradicts` mot SLU-Eriksson.]

3. **GPP — teori mot empiri.** Teoretisk GPP-litteratur (Lundberg & Marklund 2013; Marron 1997) sier grønt offentlig innkjøp verken er kostnads- eller måleffektivt og under visse forhold kan ha motsatt utslippseffekt — men Lindströms egen empiri finner likevel signifikant positiv effekt på økologisk areal. Uenigheten er intern i samme avhandling. [Kilde: `lindstrom-phd-2021.pdf`, `contradicts`.]

4. **Villfisk-avhengighet — konkurrerende løsningsnarrativ.** Feedback/Greenpeace (Blue Empire) kritiserer laksefôrets villfiskavhengighet; NordicFeed/NMBU fremhever mikrobielt fôr (*P. variotii*) som løsningen. Ikke direkte motstridende tall, men konkurrerende narrativ (trimmings vs. mikrobiell) — og Blue Empire er interessepart med egne modelleringer. [Kilde: `external-feedback-blue-empire-2024.md`, `contradicts`.]

5. **Matsvinn — uforenlige systemgrenser.** Norsk matsvinnutvalg teller kun tap fra høste-/slaktetidspunkt og inkluderer mat til dyrefôr i definisjonen; dansk MST-studie måler kun «avoidable food waste» og ekskluderer primærproduksjonens sammensetning. Tallene er ikke direkte sammenlignbare. [Kilde: `matsvinnutvalget-2024.pdf`, `contradicts` mot dansk MST-studie.]

6. **Lokal konkurranse — uenighet om årsak.** Konkurrensverket (2024:4) dokumenterer at kommuner og kjeder er uenige om hvorvidt begrenset lokal konkurranse først og fremst skyldes kommunal planlegging eller kjedenes egen atferd — rapporten løser det ikke. [Kilde: `konkurrensverket-2024-4-dagligvaruhandelns-etablering.pdf`, `notMeasured`/`contradicts`.]

## 5. Målt kontra modellert

Skillet er skarpere nå. **Målt:** ett feltforsøk (Hiis N2O), én kantinepilot (Mattila serveringssvinn), KPI-serier (matinflasjon NO/SE), tilsynsobservasjoner (innkjøpsprisforskjeller), overvåkingstall (BSE). **Modellert:** alle de økonometriske identifikasjonsstudiene (Fretheim & Rodnova, Lindström, Nguyen & Hartmann, Martens & Norum, Nilsen & Paulsen), N2O-oppskaleringen, selvforsyningsgrad, helsekostnad, CO2-anslag. **Aktøropplysning:** gebyrvedtak, markedsandeler, konkurstall.

Et paradoks er verdt å merke: de eneste tallene som virkelig identifiserer en *effekt* (kolonne A i §3) er nesten alle `modellert`, mens de fleste `målt`-tallene er beskrivende serier uten kontrafaktisk. «Målt» er altså ikke synonymt med «kausalt identifisert» — et modellert IV-estimat kan bære mer kausal vekt enn en målt KPI-serie. Et modellert tall som senere siteres som en måling forblir prosjektets største enkeltrisiko.

## 6. Ferskhet og geografi

Kausalevidensen er nyere og tettere enn runde 1 antok: *Nature*-feltforsøket (2024), fire NHH-utredninger (2020–2025), Umeå-PhD (2021), to Konkurrensverket-rapporter (2024) og NIBIO (2026). Geografisk er den identifiserte kausalevidensen norsk for konsentrasjon (NHH-klyngen), svensk for GPP og markedsstruktur, og norsk/europeisk for N2O. De transisjonspåstandene som mangler kausalitet (lokalmat, beredskap, 30-prosentkravet) er også de mest norske — der er evidensbehovet størst og tilbudet minst. Fersk er ikke sterk: 2026-policy kan være effektløs uten baseline og kontrafaktisk.

## 7. Det ingen måler

Fra ekstraktenes `notMeasured` — dette er de eksplisitte fraværene kildene selv oppgir:

- **Samlet prisvirkning av «prisjeger»-samarbeidet** kvantifiseres ikke i vedtaket; partene anførte nettopp at tilsynet ikke har tallfestet virkningen. [`prisjeger-saken-2024`]
- **Faktiske innkjøpspriser og marginer** er forretningshemmelig og unntatt offentlighet — både i prisjusteringsvindu-rapporten og innkjøpspris-kartleggingen (der selve størrelsen holdes tilbake som forretningssensitiv). [`prisjusteringsvinduer-2023`, `innkjopspriser-2017-2023`]
- **Margindekomponering per ledd** og **årsak i markedsmakt vs. kostnad** for kategorier uten pass-through. [`nilsen-paulsen-2025`]
- **Realisert nasjonal N2O-reduksjon** — de 5–20 % er en modellprojeksjon; langtidsvarighet utover feltforsøksvinduet er ikke etablert. [`hiis-2024`]
- **Kausal effekt av restriktive servitutter på butikkavstand** — forfatterne kunne ikke konkludere. [`nguyen-hartmann-2024`]
- **Isolert importvern-effekt** skilt fra andre etableringshindringer (vertikal integrasjon, stordrift) — virker i samspill. [`martens-norum-2020`]
- **Om begrenset lokal konkurranse skyldes kommunal planlegging eller kjedenes atferd** — Konkurrensverket dokumenterer begge og lar uenigheten stå. [`konkurrensverket-2024-4`]
- **Om de beskrevne samarbeidene (koordinerte lanseringsvinduer ICA/Axfood/Coop) er lovlige** — Konkurrensverket studerte bransjen, ikke enkeltatferd. [`konkurrensverket-2024-5`]
- **Overførbarhet av kantinepiloten** til andre kjøkkentyper, og tallerkensvinn/oppstrømssvinn systemvidt. [`mattila-2024`]
- **Kvantifiserte ferske helsekostnader av dårlig kosthold i Norden** — kilden kaller det selv «significant evidence gap». [`stockholm-resilience-2019`]

Det mest presise Type C-funnet står: **ingen prespesifisert evalueringsdesign for transisjonstiltakene.** Ingen før-/etterserie med kontrollgruppe for lokalmat og beredskap, ingen isolert effekt av 30-prosentkravet på øko-/lokalandel, ingen nasjonal effektmåling av matsvinnvirkemidler, ingen primærforankret årsaksforklaring for konkurscasene.

## 8. Hva som ville hevet konfidensen

- **Type A (nytt design):** bygg case- og effektprotokoller med baseline, tiltakstidspunkt, utfall, sammenligningsenhet og registrert usikkerhet — særlig for de tiltakene som i dag bare har mekanisme (lokalmat, beredskap, 30-prosentkravet).
- **Type B (aktørevidens):** intervjuer med leverandør, kommune, grossist, bonde og kontrollmyndighet for å teste mekanismene; marker svar som aktørevidens, ikke effekt.
- **Type C (erkjent fravær):** når kontrollgruppe eller nasjonal måleserie ikke kan etableres, behold påstanden som hypotese og dokumenter hvorfor effekten ikke kan identifiseres.
- **Løft det som allerede finnes:** de fire NHH-/Umeå-studiene og *Nature*-forsøket er faktiske identifikasjonsdesign. Før ekstern bruk må hver leses i fulltekst og risk-of-bias-vurderes (flere er masteroppgaver med data fra NorgesGruppen som interessepart — se §10).

## 9. Hva jeg leste

**Eksakt:** Feltet `kausalitet` har **63 kjernekilder** i `KJERNEKORPUS-MANIFEST.jsonl`. **Alle 63 ble lest** (26 fulltekst, 37 delvis) og har en ekstraksjonspost i `INNSIKT-SPOR/ekstrakt/`. Av disse ga **25 kilder** minst ett eksplisitt `kausalitet`-merket finding (til sammen 36 findings); de øvrige 38 ble lest, men bidro til andre felt eller inneholdt ingen påstand ekstraktørene merket kausalitet.

Dette er en fullstendig omvending fra runde 1, som leste 12 av 217 og der lokatorene i praksis var prosjektets egne deep-research-notater (`internal_synthesis`). Runde 2 hviler på fagfellevurderte artikler, PhD-/masterutredninger og tilsynsvedtak lest direkte.

De 25 kildene med kausalitet-funn: van Leeuwen 2024 (npj/BSE), Zakeri & Lei 2024, prisjeger-vedtak V2024-4, prisjusteringsvinduer 2023, Nilsen & Paulsen 2025, Blue Empire 2024, Fretheim & Rodnova 2020, Martens & Norum 2020, Mattila 2025, NIBIO selvforsyning 2026, Lindström PhD 2021, Stockholm Resilience 2019, Nguyen & Hartmann 2024, Ÿnsect/ONEI 2025, innkjøpspriser 2017–2023, dagligvarerapport 2024, Hiis et al. 2024, Konkurrensverket 2024:5, Konkurrensverket 2024:4, Selmani & Førre 2023, NOU 2013:6, Mäkelä 2023, Axfood 2024, matsvinnutvalget 2024, marginstudie 2024 Del 2.

## 10. Usikkerhet — og hva som ble strøket fra runde 1

**Strøket fra runde 1 (mangler støtte i kausalitet-ekstraktene):** Hele §3-tabellen i runde 1 bygde på tall som ingen `kausalitet`-merket ekstrakt-finding bærer. De strykes fra kausalitetsanalysen:

1. **«77 landbaserte oppdrettsanlegg kontrollert / 68 av 77 med brudd» (Miljødirektoratet 2024).** Fravær i *hele* korpuset — søk på «Miljødirektoratet», «landbaserte», «oppdrettsslam» og «Lift Up» gir null treff i ekstraktene. Kan ikke bæres.
2. **«Svensk offentlig økoandel 34,2 %» (Ekomatcentrum 2023).** Finnes i korpuset (Ekomatsligan/EMC-rapporter), men kun under feltet `okologi_jordhelse` — ingen `kausalitet`-merket finding. Hører til øko-analysen, ikke her.
3. **«København >90 % i >900 kjøkken» (Fonden Københavns Madhus).** Finnes bare i en White Paper-post, ikke som kausalitet-finding. Kandidatfila (`KAUSALITET-CANDIDATES.md`, T15-CASE-01) markerte den selv som E2-kandidat uten kontrollby eller effektanalyse. Kan ikke bæres som tall.
4. **«REKO ca. 500 000 kunder feb. 2022» (Facebook-proxy).** Ingen kausalitet-finding; var allerede merket aktør-/proxy i runde 1. Strykes.
5. **«Nofima: fiskeoljeandel 30 % → 10 %» (Nofima).** «Nofima» gir null treff i ekstraktene. Kan ikke bæres.
6. **Rammesetningen «kausalitet er *primært* et metodisk Type C-hull».** Nyanseres, ikke slettes: den holder for transisjonspåstandene (lokalmat, beredskap, 30-prosentkravet, konkurser), men er feil som helhetsdom — korpuset inneholder fire økonometriske identifikasjonsstudier og ett fagfellevurdert feltforsøk med identifisert effekt (§1, §2). Erstattet av to-regime-diagnosen.

**Beholdt fra runde 1 (holder fortsatt):** skillet mellom krav og etterlevelse, mål og effekt, mobilisering og dokumentert robusthet, hendelse og årsak; at Type C-hullet for transisjonstiltakene er reelt og ikke lukkes med flere policytekster; at fersk kilde ikke er sterk kilde.

**Gjenstående usikkerhet.** Flere av de sterkeste kausaldesignene er masteroppgaver (Fretheim & Rodnova, Martens & Norum, Nguyen & Hartmann, Nilsen & Paulsen) med datasett helt eller delvis levert av NorgesGruppen — en interessepart for datatilgang. Identifikasjonen hviler på IV-/2SLS-antakelser som må vurderes separat før ekstern bruk. Lindström-PhD-en og *Nature*-forsøket er sterkest i evidenshierarkiet, men gjelder Sverige (GPP) og feltnivå (N2O), ikke de norske transisjonspåstandene. «Kilde med metode» er fortsatt ikke «identifisert effekt for det spørsmålet vi stiller». Alt her er provisorisk og internt; primærstudiene må leses i fulltekst og risk-of-bias-vurderes før noe siteres utad.
