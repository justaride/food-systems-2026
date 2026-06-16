---
tittel: Food TG — Klare Deep Research-prompter (lim rett inn i ChatGPT)
status: Klar til bruk
eier: Gabriel
dato: 2026-06-16
scope: Fullstendige, selvstendige prompter for de seks underdekkede feltene. Hver prompt er komplett (rolle + datamodus + oppgave + format + guardrails) og kan limes rett inn i ChatGPT Deep Research uten å sette sammen noe.
bruksregel: Slå på Deep Research. Lim inn ÉN prompt per tråd (ikke flere felt i samme tråd). Lagre outputen. Output er IKKE faktastemme — den skal gjennom mottak/claim-lock før den brukes i deck, rapport eller ekstern tekst. Forståelses-promptene (Del 2) er bakgrunn/orientering og skal aldri brukes som kilde.
---

# Klare Deep Research-prompter

**Slik bruker du dem:** Åpne ChatGPT, slå på **Deep Research**, lim inn én prompt fra Del 1, kjør. Én prompt = én tråd. Lagre svaret som `deep-research-r2-<felt>-2026-06-16.md`. Før noe brukes utad, kjør det gjennom mottak → source-shortlist → PCQ → claim-lock som vanlig.

**Del 1 = datasøk** (det du ba om: kjør deep research). **Del 2 = forståelse** (overhengende kunnskap — kjør hvis/når du vil bygge feltforståelse; output er bakgrunn, ikke fakta).

---

# DEL 1 — DATASØK-PROMPTER (Deep Research)

## 1. Fisk-bacalhau Norge–Brasil

```text
Du er researchanalytiker for et prosjekt om sirkulære nordiske matsystemer. Du skal gjøre Deep Research og bygge et avgrenset datagrunnlag — ikke skrive et essay.

ARBEIDSREGLER:
- Prioriter primærkilder: offentlig statistikk/myndigheter, regelverk, datasett, aktørenes egne årsrapporter, fagfellevurdert forskning. Sekundærkilder kun som spor til primærkilde eller tydelig merket kontekst.
- Skill alltid mellom (1) dokumentert fakta, (2) plausibel inferens, (3) sekundær omtale, (4) ikke funnet, (5) motbevist/svekket.
- Rapporter negative funn eksplisitt. Tomme dataceller er et hovedfunn, ikke noe du fyller med generisk tekst.
- Ikke konkluder sterkere enn kildene tillater.

DATAMODUS (all kvantitativ output i tabell):
- Minimumsfelt per rad: verdi | enhet | år/periode | geografi | definisjon/metode | kildeeier | kilde-URL | locator (side/tabell/celle) | datakvalitet (observert/estimert/modellert/illustrativ).
- Aldri bland år eller geografier i samme celle. Aldri summer tall med ulik definisjon uten å si det. Spriker to kilder, oppgi begge med avvik og årsak. Tall som bare finnes sekundært merkes «sekundær — finn primær».
- Oppgi for hver tabell hvilken offisiell statistikkilde som er autoritativ, og om dataen finnes som nedlastbart datasett (API/CSV) eller bare i rapport.

CASE: Den bilaterale mat-handelsaksen Norge–Brasil — soya/fôrråvarer INN til Norge fra Brasil, og klippfisk/saltfisk/tørrfisk (bacalhau) UT fra Norge til Brasil, som to motstrømmer i samme akse.

Hent per år 2015–nyeste tilgjengelige år (oppgi året):
1. Import til Norge fra Brasil: soyabønner (HS 1201), soyamel/SPC (HS 2304 + relevante underkoder), andre fôrråvarer (oppgi kodene du bruker). Tonn og verdi.
2. Total norsk import av samme varegrupper fra ALLE land, så Brasil-andelen kan beregnes.
3. Eksport fra Norge til Brasil: klippfisk/saltfisk/tørrfisk (HS 0305-koder), tonn og verdi. Beregn Brasils andel av total norsk klippfiskeksport.
4. Hvilke ledd/aktører importerer fôret (fôrprodusenter) — kun fra offentlige kilder eller aktørenes egne årsrapporter, ikke estimat.
5. Dokumenterte restråstoff-/sidestrøms-tap i klippfiskproduksjon (avskjær, salt, lake) — med kilde.
6. Finnes det primærkilde som kobler de to strømmene (soya-avhengighet + bacalhau-eksport) i samme analyse?

KONTROLL: Sammenlign SSB-tall mot UN Comtrade speiltall (Brasils rapporterte eksport til Norge) for minst ett år, og rapporter avviket.
Autoritative kilder: SSB utenrikshandel, UN Comtrade, Eurostat Comext, brasiliansk Comex Stat. Sjømatrådet kun som kontekst.

SØKESTRENGER (NO/EN/PT): SSB utenrikshandel statistikkbank HS 1201 Brasil; UN Comtrade Norway Brazil 1201 2304 0305; "Comex Stat" Brazil soybeans exports Norway; SSB klippfisk saltfisk eksport Brasil; "bacalhau" Noruega exportação volume; Norwegian klippfisk export Brazil tonnes value.

LEVERANSEFORMAT:
1. Kort dom: kan aksen brukes som A-spor-case nå, eller mangler data?
2. Datatabeller per punkt 1–5 (datamodus-format), pluss en kildetabell som sier om hver serie kan hentes via API/CSV (SSB-tabellnummer, Comtrade-spørring, Comex Stat-uttrekk).
3. Kildeledger.
4. «Ikke si»-liste.
5. Neste 5 handlinger rangert.
Ikke koble til EUDR-vurdering her. Ikke forklar HVORFOR strømmene er som de er — kun datagrunnlag. Bruk statusord: deckklart internt / needs-primary-check / needs-data / benchmark-only / parkert.
```

## 2. Akvaponikk / oppdrettsslam / nutrient loops

```text
Du er researchanalytiker for et prosjekt om sirkulære nordiske matsystemer. Du skal gjøre Deep Research og bygge et avgrenset datagrunnlag — ikke skrive et essay.

ARBEIDSREGLER:
- Prioriter primærkilder: offentlig statistikk/myndigheter, regelverk, datasett, aktørenes egne rapporter, fagfellevurdert forskning. Sekundærkilder kun som spor eller merket kontekst.
- Skill (1) fakta, (2) inferens, (3) sekundær omtale, (4) ikke funnet, (5) motbevist. Rapporter negative funn eksplisitt — tomme celler er hovedfunn.
- Ikke konkluder sterkere enn kildene tillater.

DATAMODUS: All kvantitativ output i tabell med felt: verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet (observert/estimert/modellert/illustrativ). Aldri bland år/geografi i samme celle. Aldri summer N og P. Spriker kilder, oppgi begge med avvik. Oppgi autoritativ statistikkilde per tabell og om data finnes som API/CSV.

CASE: Næringsstoffløkker — kan næringsstrømmer fra oppdrett (slam/fekalier/fôrspill) og urbant avløp lukkes og brukes i planteproduksjon (akvaponikk, hydroponi, gjødsel)? Merk: mye norsk grønnsaksproduksjon er allerede hydroponisk — poenget er om NÆRINGSSTRØMMENE kan gjøres sirkulære, ikke om hydroponi er nytt.

Tre delfelt:
DELFELT A — oppdrett: Hvilke primærkilder kvantifiserer næringsstofftap fra norsk havbruk (fôrspill + fekalier), per år, som andel av tilført fôr eller i tonn N/P? Hva finnes om slamoppsamling i lukkede/semilukkede anlegg (oppsamlingsgrad, og bruk: gjødsel/biogass/eksport)? Hvilke regulatoriske krav gjelder?
DELFELT B — svartvann/urbane løkker: Dokumentér Helsingborg RecoLab/Oceanhamnen med primærkilder: omfang (boliger/personekvivalenter), separasjonsgrad, gjenvunnet N/P/K i tonn per år, driftsstatus nå, eier, publiserte evalueringer — OG lokasjon (sted/koordinat) så strømmen kan legges på kart. Finnes tilsvarende nordiske anlegg?
DELFELT C — akvaponikk/hydroponi: Dokumenterte nordiske anlegg der oppdretts-/avløpsnæring faktisk brukes i planteproduksjon — aktør, lokasjon, driftsstatus, og hva som hindrer trygg/effektiv bruk (hygiene, regelverk, økonomi).

Autoritative kilder: SINTEF, NIBIO, RISE, Miljødirektoratet, Fiskeridirektoratet, RecoLab/Helsingborg stad, fagfellevurdert forskning.

SØKESTRENGER (NO/EN/SE): oppdrettsslam næringsstoff gjenvinning Norge SINTEF; aquaculture sludge nutrient recovery Norway nitrogen phosphorus; Helsingborg RecoLab Oceanhamnen nutrient recovery evaluation; akvaponikk Norge anlegg næringsstoff drift; blackwater source separation nutrient recovery Nordic tonnes.

LEVERANSEFORMAT: per delfelt datatabell + kildeledger; delfelt B med lokasjonsfelt. Deretter: kort dom, «ikke si»-liste, neste 5 handlinger.
Ikke bruk «70 % av fôret går i fjorden» som fakta — finn hva forskningen faktisk oppgir, med spennvidde og metode. Skill potensial fra realisert gjenvinning. Statusord: deckklart internt / needs-primary-check / needs-data / benchmark-only / parkert.
```

## 3. Kunstgjødsel / Yara / Haber-Bosch / biogass

```text
Du er researchanalytiker for et prosjekt om sirkulære nordiske matsystemer. Du skal gjøre Deep Research og bygge et avgrenset datagrunnlag — ikke skrive et essay.

ARBEIDSREGLER:
- Prioriter primærkilder (offentlig statistikk, regelverk, datasett, aktørrapporter, fagfellevurdert forskning). Sekundærkilder kun som spor/merket kontekst.
- Skill (1) fakta, (2) inferens, (3) sekundær omtale, (4) ikke funnet, (5) motbevist. Rapporter negative funn eksplisitt — tomme celler er hovedfunn. Ikke overkonkluder.

DATAMODUS: All kvantitativ output i tabell: verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet (observert/estimert/modellert/illustrativ). Aldri bland år/geografi i samme celle. Aldri summer N og P. Spriker kilder, oppgi begge med avvik. Oppgi autoritativ kilde per tabell + API/CSV-tilgjengelighet.

CASE: Mineralgjødsel og næringsstoffenes industrielle kretsløp — kan gjenvunnet næring (biogass-digestat/biorest, husdyrgjødsel, oppdrettsslam) erstatte virgin mineralgjødsel, og med hvilken mengde, kvalitet og barriere?

Hent mot primærkilder:
1. Mineralgjødselforbruk i Norden (N, P, K hver for seg), nyeste år, tonn, per land. Autoritativ kilde (SSB, Eurostat, nasjonal gjødselstatistikk).
2. Energi/avhengighet i nitrogenbasert gjødsel (Haber-Bosch): hva primærkilder oppgir om energiintensitet og fossil gass per tonn N.
3. Biogass i Norden fra husdyrgjødsel/matavfall: antall anlegg, produsert energimengde, digestatmengde, og dokumentert bruk av digestat som gjødsel (andel, kvalitet).
4. Potensial i gjenvunnet næring (biorest + slam + husdyrgjødsel) vs. mineralgjødselforbruk — med tall, år og metode.
5. Kvalitetsbarriere: plast-/mikroplastforurensning i biorest (målinger: konsentrasjon, metode, anlegg, år; grenseverdier; regelverk for fôr/gjødsel/animalske biprodukter kat. 3).

Autoritative kilder: SSB, Eurostat, NIBIO, RISE, Miljødirektoratet, Energistyrelsen (DK), biogass-bransjeorganisasjoner. Yara kun som industrikontekst.

SØKESTRENGER (NO/EN): mineralgjødsel forbruk Norge SSB nitrogen fosfor kalium; nitrogen fertilizer energy intensity Haber-Bosch natural gas; biogass husdyrgjødsel digestat bruk gjødsel Norge anlegg; biorest mikroplast måling biogassanlegg konsentrasjon; recovered nutrients potential vs mineral fertilizer Nordic.

LEVERANSEFORMAT: regelverkstabell + datatabeller (punkt 1–4) + måletabell (punkt 5) + kildeledger. Deretter kort dom, «ikke si»-liste, neste 5 handlinger.
Skill energiutnyttelse (forbrenning/biogass UTEN næringsretur) fra ekte næringssirkularitet; ikke klassifiser energiutnytting høyere enn «recover». Skill potensial fra realisert gjenvinning. Statusord: deckklart internt / needs-primary-check / needs-data / parkert.
```

## 4. Danmark / animalsk (svin & meieri) — benchmark

```text
Du er researchanalytiker for et prosjekt om sirkulære nordiske matsystemer. Du skal gjøre Deep Research og bygge et avgrenset datagrunnlag — ikke skrive et essay. Dette er strikt BENCHMARK — ikke norsk pilotbevis.

ARBEIDSREGLER:
- Prioriter primærkilder (offentlig statistikk, regelverk/lovtekst, aktørrapporter, fagfellevurdert forskning). Sekundærkilder kun som spor/merket kontekst.
- Skill (1) fakta, (2) inferens, (3) sekundær omtale, (4) ikke funnet, (5) motbevist. Rapporter negative funn eksplisitt. Ikke overkonkluder. Skill VEDTATT politikk fra FORESLÅTT.

DATAMODUS: All kvantitativ output i tabell: verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet. Aldri bland år/geografi. Spriker kilder, oppgi begge. Oppgi autoritativ kilde + API/CSV.

CASE: Dansk animalsk produksjon (svin + meieri) som benchmark for nordisk sirkularitet og politikkvirkemidler.

Hent mot primærkilder:
1. Skala: dansk svine- og melkeproduksjon nyeste år (antall dyr, slaktevolum tonn, melkevolum tonn, eksportandel %), med definisjon/varekode. Kilde: Danmarks Statistik, Landbrug & Fødevarer.
2. Miljø/areal/nitrogen: hva sier danske primærkilder (Miljøstyrelsen, Aarhus DCE, lovtekst) om nitrogen-/arealregulering, «grøn trepart»-avtalen og CO2-afgift på landbruk — vedtatt tekst, ikrafttredelsesdato, omfang? Skill vedtatt fra foreslått.
3. Eventuell nedskalering av svineproduksjon: hva er faktisk dokumentert (tall, vedtak, frivillig vs. regulatorisk) vs. bare medieomtale?
4. Fôr-governance: Arlas soya-/fôrkrav (egne rapporter) — soyafri/avskogingsfri policy, dokumentert omfang. Skill «soyafri» fra «importfri».
5. Husdyrgjødsel → biogass: dansk biogass fra husdyrgjødsel (andel, anlegg, digestat-bruk som gjødsel). Kilde: Energistyrelsen/bransje.

SØKESTRENGER (DK/EN): "Danmarks Statistik" svineproduktion mælkeproduktion eksport; "grøn trepart" landbrug kvælstof aftale lovtekst; CO2-afgift landbrug Danmark 2030 ikrafttræden; Arla soy deforestation-free feed report; biogas husdyrgødsel digestat Danmark Energistyrelsen.

LEVERANSEFORMAT: datatabell per punkt + kildeledger. Deretter kort dom, «ikke si»-liste, og en KORT overførbarhetsmerknad (hva Norge/Norden kan lære vs. hva som ikke er overførbart pga. struktur/klima/eksportmodell).
Ikke si at Danmark er en norsk pilot. Ikke bland vedtatt politikk med forslag. Rapporter tomme celler eksplisitt. Statusord: benchmark-only / needs-primary-check / needs-data / watchlist.
```

## 5. Offentlig innkjøp (Danmark/København)

```text
Du er researchanalytiker for et prosjekt om sirkulære nordiske matsystemer. Du skal gjøre Deep Research og bygge et avgrenset datagrunnlag — ikke skrive et essay.

ARBEIDSREGLER:
- Prioriter primærkilder (lovtekst/veiledere, offentlig statistikk, kommune-/aktørrapporter, fagfellevurdert forskning). Sekundærkilder kun som spor/merket kontekst.
- Skill (1) fakta, (2) inferens, (3) sekundær omtale, (4) ikke funnet, (5) motbevist. Rapporter negative funn eksplisitt. Ikke overkonkluder. Skill EU-rett, dansk praksis og norsk hjemmel skarpt.

DATAMODUS: All kvantitativ output i tabell: verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet. Aldri bland år/geografi. Oppgi autoritativ kilde + API/CSV.

CASE: Offentlig innkjøp som etterspørselsmotor for sirkulære/bærekraftige matverdikjeder, med Danmark/København som benchmark og norsk overførbarhet.

Hent mot primærkilder:
1. Regelverk: hva tillater EU-/EØS- og norsk anskaffelsesrett når det gjelder å stille bærekraft-/økologi-/sesong-/lokalkrav i offentlig matinnkjøp? Primær lovtekst/veileder.
2. København/Danmark: økologisk andel i offentlige måltider over tid (%, år), og HVILKET virkemiddel som drev omleggingen (budsjett vs. menyomlegging/sesong vs. innkjøpskrav). Kilde: Københavns Madhus/House of Food, danske kommuner.
3. Norske sammenlignbare tall: økologisk-/bærekraft-andel i offentlige måltider (Oslo og andre kommuner; Landbruksdirektoratet/Debio-data hvis det finnes).
4. Eksempler: konkrete offentlige innkjøps-/kantine-/skolemåltidsordninger som har skalert sirkulære eller lokale verdikjeder — aktør, omfang, resultat.
5. Barrierer, klassifisert: marked, distribusjon, pris, regulering, kapasitet, data.

SØKESTRENGER (DK/NO/EN): Københavns Madhus økologi offentlige måltider andel; House of Food Copenhagen organic conversion mechanism; offentlige anskaffelser mat bærekraftskrav EØS veileder; Oslo kommune økologisk mat kantine skole andel; public procurement organic food Denmark 90 percent how.

LEVERANSEFORMAT: regelverkstabell + markedstabell (DK + NO) + eksempeltabell + barrieretabell + kildeledger. Deretter kort dom, «ikke si»-liste, neste 5 handlinger.
Ikke fremstill København som norsk fasit uten overførbarhetsmerknad. Skill mekanisme (hvordan de fikk det til) fra resultat (andel). Statusord: deckklart internt / needs-primary-check / needs-data / benchmark-only.
```

## 6. Nederland — benchmark (Wageningen-guardrail)

```text
Du er researchanalytiker for et prosjekt om sirkulære nordiske matsystemer. Du skal gjøre Deep Research og bygge et avgrenset datagrunnlag — ikke skrive et essay. Dette er strikt BENCHMARK/INSPIRASJON — ikke nordisk bevis. VIKTIG: Wageningen (WUR), Moerman-stigen og WUR-score skal KUN omtales som rammeverk, ALDRI brukes som effektbevis eller pilotmodenhet.

ARBEIDSREGLER:
- Prioriter primærkilder (offentlig statistikk, regjeringsdokument/lovtekst, institusjons-/aktørrapporter, fagfellevurdert forskning). Sekundærkilder kun som spor/merket kontekst.
- Skill (1) fakta, (2) inferens, (3) sekundær omtale, (4) ikke funnet, (5) motbevist. Rapporter negative funn eksplisitt. Ikke overkonkluder.

DATAMODUS: All kvantitativ output i tabell: verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet. Aldri bland år/geografi. Oppgi autoritativ kilde (CBS/Eurostat) + API/CSV.

CASE: Nederland som benchmark for sirkulær bioøkonomi og høyintensiv matproduksjon — hva kan vi LÆRE (mekanisme), ikke kopiere.

Hent mot primærkilder:
1. Kringlooplandbouw: den nederlandske sirkulærlandbruks-visjonen mot 2030 konkret (mål, virkemidler, status). Kilde: Ministerie van LNV / Rijksoverheid primærdokument.
2. Glastuinbouw (veksthus): energikilde-miks (geotermi, CHP, restvarme), CO2-gjenbruk fra industri, areal og dokumentert ressurseffektivitet. Kilde: CBS, Glastuinbouw Nederland, Topsector AgriFood.
3. Cascading/bioraffinering: konkrete nederlandske eksempler på høyverdi-valorisering av matsidestrømmer — aktør, lokasjon, output. Ikke generiske påstander.
4. Stikstof (nitrogen): kort — hva er nitrogenkrisen, og hvilke regulatoriske grep er faktisk vedtatt, som strukturell driver for sirkulær omlegging.
5. Overførbarhet: kort merknad om hva som er nordisk-relevant mekanisme vs. hva som er unikt nederlandsk (klima, intensitet, eksportmodell, arealpress).

SØKESTRENGER (NL/EN): Kringlooplandbouw 2030 LNV visie; Nederland glastuinbouw geothermie CO2 hergebruk CBS; circular bioeconomy Netherlands food side streams valorisation; stikstofcrisis maatregelen overheid vastgesteld.

LEVERANSEFORMAT: datatabell per punkt + kildeledger. Deretter kort dom, «ikke si»-liste, og overførbarhetsmerknaden.
Ikke bruk WUR-score/Moerman som bevis. Ikke fremstill nederlandsk høyintensitet som nordisk mal. Rapporter tomme celler eksplisitt. Statusord: benchmark-only / needs-primary-check / needs-data / watchlist.
```

---

# DEL 2 — FORSTÅELSE-PROMPTER (orientering, IKKE faktastemme)

> Bruk disse for å bygge feltforståelse. Output er bakgrunn/mentale modeller — **ikke** kilde. Lagre separat og merk «forståelse — ikke faktastemme». Skal aldri inn i deck/claim-lock som fakta.

## 1F. Forståelse — Fisk-bacalhau Norge–Brasil

```text
Du er fagbriefer for et prosjekt om sirkulære nordiske matsystemer. Gi en presis, ærlig ORIENTERING — en mental modell, ikke en faktakilde. Skriv strukturert (ikke essay). Marker påstander som [etablert]/[omstridt]/[anekdotisk], ta med kilde der du kan, men målet er forståelse, ikke kildejakt.

Felt: Den bilaterale mat-handelsaksen Norge–Brasil. Klippfisk/bacalhau UT av Norge til Brasil; soya/fôrråvarer INN til Norge fra Brasil — to motstrømmer i samme akse. Hvorfor relevant: norsk matproduksjon ser nasjonal ut i territorielle regnskap, men er avhengig av importert fôr; samtidig eksporterer vi høyverdi marint protein. Belys Scope 3, importavhengighet, beredskap, og hva soya-avhengigheten betyr for norsk kjøtt/oppdrett.

Lever i denne strukturen:
1. Feltet på 5 setninger.
2. Systemkart: hovedstrømmene og hvor verdien/tapet sitter (tekst-flyt A→B→C).
3. Nøkkelaktører og roller (navngitt, ett ord om rolle): fôrkonsern, sjømateksportører, importører, myndigheter.
4. De 5–8 viktigste årsak-virkning-mekanismene.
5. Hva er omstridt/misforstått (vanlige feilslutninger, tall som gjengis feil).
6. Hvor er gearingen for sirkularitet vs. hvor er det bare symbolikk.
7. Systembarrierer (marked, distribusjon, pris, regulering, kapital, data, kultur).
8. Nordisk/norsk vinkel vs. importert kontekst.
9. Koblinger til våre spor: A (fôr/import), B (sidestrøm/restråstoff), C (distribusjon/adoption).
10. De 8–12 spørsmålene vi bør kunne svare på etter datasøk, rangert etter beslutningsverdi.
11. Ordliste: 10–15 fagbegreper, én linje hver.
12. 5 autoritative innganger for videre fordypning.
Avslutt: «Tre ting vi sannsynligvis tar feil om i dette feltet i dag.»
```

## 2F. Forståelse — Akvaponikk / oppdrettsslam / nutrient loops

```text
Du er fagbriefer for et prosjekt om sirkulære nordiske matsystemer. Gi en presis, ærlig ORIENTERING — mental modell, ikke faktakilde. Skriv strukturert. Marker [etablert]/[omstridt]/[anekdotisk]. Mål: forståelse, ikke kildejakt.

Felt: Næringsstoffløkker i matproduksjon — kan næringsstrømmer fra oppdrett (slam/fekalier/fôrspill) og urbant avløp gjøres sirkulære og brukes i planteproduksjon? Presiser: mye norsk grønnsaksproduksjon er ALLEREDE hydroponisk/substratbasert — poenget er ikke at hydroponi er nytt, men om NÆRINGSSTRØMMENE kan lukkes. Skill akvaponikk (fisk+plante koblet), hydroponi (substrat+næringsløsning) og vertikal dyrking.

Lever i denne strukturen:
1. Feltet på 5 setninger.
2. Systemkart: næringsstrømmene (N/P/K) fra kilde til bruk, hvor de tapes.
3. Nøkkelaktører/roller (oppdrett, avløp/VA, forskning, gartneri, myndigheter).
4. 5–8 mekanismer (hvorfor tapes næring; hva skal til for trygg gjenbruk).
5. Omstridt/misforstått (f.eks. «70 % av fôret i fjorden», hydroponi=sirkulært).
6. Gearing vs. symbolikk.
7. Systembarrierer (hygiene, regelverk, logistikk, økonomi, data).
8. Nordisk/norsk vinkel vs. importert kontekst.
9. Koblinger til spor A/B/C.
10. 8–12 datasøk-spørsmål rangert.
11. Ordliste 10–15 begreper.
12. 5 autoritative innganger.
Avslutt: «Tre ting vi sannsynligvis tar feil om i dag.»
```

## 3F. Forståelse — Kunstgjødsel / Yara / Haber-Bosch / biogass

```text
Du er fagbriefer for et prosjekt om sirkulære nordiske matsystemer. Gi en presis, ærlig ORIENTERING — mental modell, ikke faktakilde. Skriv strukturert. Marker [etablert]/[omstridt]/[anekdotisk]. Mål: forståelse.

Felt: Mineralgjødsel og næringsstoffenes industrielle kretsløp. Haber-Bosch muliggjorde produktivitetsvekst, men skaper avhengighet av energi/fossil gass, jordforringelse, avrenning og lineære N/P/K-strømmer. Norge har historisk/industriell posisjon via Hydro/Yara. Fokus: kan gjenvunnet næring (biogass-digestat/biorest, husdyrgjødsel, oppdrettsslam) erstatte virgin mineralgjødsel — med hvilken kvalitet, mengde og barriere? Skill energiutnyttelse (forbrenning/biogass uten næringsretur) fra ekte næringssirkularitet.

Lever i strukturen:
1. Feltet på 5 setninger.
2. Systemkart: nitrogen-/fosfor-kretsløpet industrielt vs. sirkulært.
3. Nøkkelaktører/roller (Yara, biogassaktører, landbruk, forskning, myndigheter).
4. 5–8 mekanismer.
5. Omstridt/misforstått.
6. Gearing vs. symbolikk.
7. Systembarrierer (mikroplast/hygiene, logistikk, regelverk, økonomi, data).
8. Nordisk/norsk vinkel.
9. Koblinger til spor A/B/C.
10. 8–12 datasøk-spørsmål rangert.
11. Ordliste 10–15 begreper.
12. 5 autoritative innganger.
Avslutt: «Tre ting vi sannsynligvis tar feil om i dag.»
```

## 4F. Forståelse — Danmark / animalsk (svin & meieri)

```text
Du er fagbriefer for et prosjekt om sirkulære nordiske matsystemer. Gi en presis, ærlig ORIENTERING — mental modell, ikke faktakilde. Skriv strukturert. Marker [etablert]/[omstridt]/[anekdotisk]. Mål: forståelse. Dette er benchmark — hva kan Norden lære, ikke norsk fasit.

Felt: Dansk animalsk produksjon (svin, meieri) som nordisk benchmark — høy produksjon, stor eksport, sterke miljøkonflikter rundt areal, vann, nitrogen og klima. Belys skala/eksport, nitrogen-/arealpolitikk og eventuell nedskalering, CO2-avgift på landbruk, Arla som systemaktør (fôr-governance), og husdyrgjødsel → biogass (DK er biogass-ledende).

Lever i strukturen:
1. Feltet på 5 setninger.
2. Systemkart: dansk animalsk verdikjede og dens miljøtrykk.
3. Nøkkelaktører/roller (Landbrug & Fødevarer, Arla, Danish Crown, myndigheter).
4. 5–8 mekanismer (hvorfor konflikten; hvilke virkemidler brukes).
5. Omstridt/misforstått.
6. Gearing vs. symbolikk.
7. Systembarrierer.
8. Hva er overførbart til Norge/Norden vs. ikke (struktur, klima, eksportmodell).
9. Koblinger til spor A/B/C.
10. 8–12 datasøk-spørsmål rangert.
11. Ordliste 10–15 begreper.
12. 5 autoritative innganger.
Avslutt: «Tre ting vi sannsynligvis tar feil om i dag.»
```

## 5F. Forståelse — Offentlig innkjøp (Danmark/København)

```text
Du er fagbriefer for et prosjekt om sirkulære nordiske matsystemer. Gi en presis, ærlig ORIENTERING — mental modell, ikke faktakilde. Skriv strukturert. Marker [etablert]/[omstridt]/[anekdotisk]. Mål: forståelse.

Felt: Offentlig innkjøp som etterspørselsmotor for sirkulære/bærekraftige matverdikjeder — ikke bare klima-/miljøsymbol. København ligger svært høyt på økologisk andel i offentlige måltider. Spørsmål: hvilke virkemidler driver det; er mekanismen menyomlegging/sesong/innkjøpskrav snarere enn mer penger; kan skolemåltider/kantiner gjøre sirkulære verdikjeder skalerbare; hva er overførbart til Norge/nordisk nivå.

Lever i strukturen:
1. Feltet på 5 setninger.
2. Systemkart: hvordan offentlig innkjøp kobler etterspørsel til produsent.
3. Nøkkelaktører/roller (Københavns Madhus/House of Food, kommuner, EU-anskaffelsesregler, norske motparter).
4. 5–8 mekanismer.
5. Omstridt/misforstått (f.eks. «økologisk = dyrere» vs. menyomlegging).
6. Gearing vs. symbolikk.
7. Systembarrierer (regelverk, kapasitet, distribusjon, pris, kompetanse).
8. Nordisk/norsk vinkel og hva som er juridisk mulig i Norge/EØS.
9. Koblinger til spor A/B/C (særlig C).
10. 8–12 datasøk-spørsmål rangert.
11. Ordliste 10–15 begreper.
12. 5 autoritative innganger.
Avslutt: «Tre ting vi sannsynligvis tar feil om i dag.»
```

## 6F. Forståelse — Nederland

```text
Du er fagbriefer for et prosjekt om sirkulære nordiske matsystemer. Gi en presis, ærlig ORIENTERING — mental modell, ikke faktakilde. Skriv strukturert. Marker [etablert]/[omstridt]/[anekdotisk]. Mål: forståelse. Benchmark/inspirasjon — IKKE nordisk bevis. Wageningen/Moerman/WUR-score skal kun omtales som rammeverk, aldri som bevis.

Felt: Nederland som benchmark for sirkulær bioøkonomi og høyintensiv matproduksjon. Belys Kringlooplandbouw (sirkulærlandbruks-visjon mot 2030), glastuinbouw (veksthus) med geotermi/CHP/CO2-gjenbruk, cascading/bioraffinering, og nitrogenkrisen (stikstofcrisis) som strukturell driver. Nederland er en høyintensiv eksportmodell — kontrast eksplisitt mot nordisk kontekst.

Lever i strukturen:
1. Feltet på 5 setninger.
2. Systemkart: nederlandsk matproduksjon og dens ressurslogikk.
3. Nøkkelaktører/roller (Ministerie LNV, CBS, Topsector AgriFood, glastuinbouw-sektor, havner).
4. 5–8 mekanismer (hva gjør modellen effektiv; hva skaper nitrogenkrisen).
5. Omstridt/misforstått.
6. Gearing vs. symbolikk.
7. Systembarrierer.
8. Hva er overførbar mekanisme vs. unikt nederlandsk (klima, intensitet, areal, eksport).
9. Koblinger til spor A/B/C.
10. 8–12 datasøk-spørsmål rangert.
11. Ordliste 10–15 begreper.
12. 5 autoritative innganger.
Avslutt: «Tre ting vi sannsynligvis tar feil om i dag.»
```

---

*Tips: kjør gjerne forståelsesprompten (Del 2) FØRST for et felt du kjenner dårlig, og bruk de 8–12 spørsmålene den gir til å spisse datasøk-prompten (Del 1) hvis du vil. Men datasøk-promptene står på egne ben og kan kjøres direkte.*
