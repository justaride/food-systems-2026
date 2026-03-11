# Source scouting: prioriterte datakilder for Food Systems 2026

**Dato:** 10. mars 2026  
**Formål:** Bygge en konkret kilde-backlog for whitepaperet og neste analysefase.  
**Prinsipp:** Prioriter offisielle eller primære kilder som kan lastes ned, reproduseres og oppdateres.

---

## 1. Hva vi trenger data til

Prosjektets tydeligste databehov akkurat nå er:

1. **Lang tidsserie for markedsmakt**  
   Revenue shares, butikkstruktur, eierskap og lokal konsentrasjon.
2. **Pris og verdikjede**  
   KPI/PPI, prisnivåer, importkostnader og eventuelt grossistledd.
3. **Selvforsyning og sårbarhet**  
   Produksjon, importavhengighet, beredskap og handelsstrømmer.
4. **Geografi og tilgang**  
   Kommunevis butikkdekning, reiseavstand, "food desert"-analyse.
5. **Sirkularitet**  
   Matsvinn, sidestrømmer, avfall, akvakultur, jordbruk og urbane ressurser.
6. **Nordisk sammenligning**  
   Sammenliknbare indikatorer for Norge, Sverige, Danmark og Finland.

---

## 2. Prioritet A: kilder som bør hentes først

| Tema | Kilde | Hva den kan brukes til | Kommentar |
|---|---|---|---|
| Norske matpriser | [SSB tabell 14700](https://www.ssb.no/statbank/table/14700/) | Ny hovedserie for konsumprisindeks, inkl. mat og drikke | Viktig fordi gamle tabell 03013 ble erstattet 10. februar 2026 |
| Historisk KPI-serie | [SSB tabell 03013](https://www.ssb.no/statbank/table/03013) | Bakoverkompatibel historisk sammenlikning | Beholdes for metodetransparens i whitepaperet |
| Produsentpriser | [SSB tabell 12462](https://www.ssb.no/statbank/table/12462/) | PPI for matindustri, grunnlag for pristransmisjon | Kjerneserie for Fig. 1 og Fig. 5 |
| Varehandel/import | [SSB: Utenrikshandel med varer](https://www.ssb.no/utenriksokonomi/utenrikshandel/statistikk/utenrikshandel-med-varer) | Importavhengighet per varegruppe og land | Brukes til frukt, korn, fôr, sjømat og beredskap |
| Selvforsyning | [NIBIO: Selvforsyningsgrad](https://www.nibio.no/tema/mat-og-samfunn/selvforsyning) | Norsk selvforsyningsgrad og metode | Mer presis enn løse sekundærreferanser |
| Matberedskap | [Riksrevisjonen: Matsikkerhet og beredskap i jordbruket](https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-jordbruksomradet/) | Offisiell risikobeskrivelse og svakheter i beredskap | Styrker "double vulnerability"-sporet |
| Foretaks- og enhetsdata | [Brønnøysundregistrene / data.brreg.no](https://www.brreg.no/produkter-og-tjenester/apne-data/) | Underenheter, adresser, orgnr, naeringskode | Kan gi en mer etterprøvbar butikkbase enn ren OSM |
| Grensehandel | [SSB: Grensehandel](https://www.ssb.no/varehandel-og-tjenesteyting/varehandel/statistikk/grensehandel) | Norsk lekkasje til Sverige og prispress | Relevant for norsk/svensk sammenlikning |
| Kommuner/boundaries | [Geonorge kommunegrenser](https://kartkatalog.geonorge.no/metadata/administrative-enheter-kommuner/f8838df0-0686-42e2-b8a6-629c5d293dda) | Kommunegeometri til food-desert og lokal HHI | Kombineres med butikkpunkter |
| Veinett/reisetid | [NVDB API](https://www.vegvesen.no/fag/teknologi/vegdata-og-api-er/nvdb-api/) | Tilgjengelighet og realistisk reiseavstand til butikker | Viktig hvis analysen skal utover luftlinje |

---

## 3. Prioritet B: kilder for nordisk sammenlikning

| Tema | Kilde | Hva den kan brukes til | Kommentar |
|---|---|---|---|
| Europeiske prisnivåer | [Eurostat comparative price levels](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20241219-1) | Faktiske prisnivaforskjeller mellom land | Nyttig for "Norway price premium" |
| Europeisk matprisindeks | [Eurostat HICP](https://ec.europa.eu/eurostat/cache/metadata/en/prc_hicp_esms.htm) | Sammenliknbar inflasjon for mat mellom land | Bedre enn a sammenlikne nasjonale serier ukritisk |
| Matbalanser | [FAOSTAT Food Balances](https://www.fao.org/faostat/en/#data/FBS) | Produksjon, import, eksport, kalorier og selvforsyning | Sterk base for nordisk sammenlikning |
| Danmark statistikk | [StatBank Denmark](https://statbank.dk/) | Priser, jordbruk, handel, detalj | Primarkilde for DK-tabeller |
| Sverige statistikk | [SCB statistikdatabasen](https://www.statistikdatabasen.scb.se/) | KPI, handel, befolkning, foretak | Grunnlag for SE-tidsserier |
| Sverige landbruk | [Jordbruksverket statistik](https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik) | Produksjon, forsyning, jordbruk | Supplerer SCB |
| Finland statistikk | [Luke statistics](https://www.luke.fi/en/statistics) | Landbruk, mat, selvforsyning og produksjon | Beste kilde for FI matsystemdata |
| Finland konkurranse | [FCCA / KKV grocery market rules](https://www.kkv.fi/en/consumer-affairs/food-market-ombudsman/) | Regulering og markedsovervaakning | Relevant for §4a-sporet |
| Sverige konkurranse | [Konkurrensverket rapporter](https://www.konkurrensverket.se/publikationer/) | Markedsrapporter og prisundersokelser | Viktig for planbarriere-sporet |
| Danmark konkurranse | [KFST analyser og vedtak](https://kfst.dk/) | Fusjonskontroll og markedsinngrep | Viktig for dansk kontrastcase |

---

## 4. Prioritet C: kilder for sirkularitet og materialstrommer

| Tema | Kilde | Hva den kan brukes til | Kommentar |
|---|---|---|---|
| Matsvinn / matavfall | [SSB: Avfall fra husholdningene](https://www.ssb.no/natur-og-miljo/forurensning-og-klima/statistikk/avfall-fra-husholdningene) | Mengder, utvikling og kommunal kontekst | Bra for urbant/lokalt spor |
| Matsvinn-avtalen | [Matsvinnutvalget / Matsvett](https://matsvett.no/bransje/matsvinnavtalen/) | Bransjespor for forebygging og sektorfordeling | Ikke offisiell statistikk, men viktig sekundarkilde |
| Akvakultur | [Fiskeridirektoratet kart og data](https://www.fiskeridir.no/Akvakultur/Tall-og-analyse/Akvakulturkart) | Lokaliteter, geografi, produksjonsmønstre | Nyttig for nordisk protein- og kystspor |
| Jordbruksareal | [NIBIO kartdata / AR5](https://www.nibio.no/tema/jord/jordkartlegging/ar5) | Arealbruk, dyrka mark og produksjonspotensial | Viktig for regional matsystemanalyse |
| Miljodata | [Miljodirektoratet statistikk og data](https://www.miljodirektoratet.no/ansvarsomrader/avfall/statistikk-for-avfall-og-gjenvinning/) | Avfall, gjenvinning, utslipp, materialstrommer | Kan kobles til sirkularitet og klima |

---

## 5. Tre raske analysesprint som gir mye verdi

### Sprint 1: Oppdater og sikre prisseriene
- Bytt whitepaperets KPI-referanse fra SSB 03013 til 14700, men behold 03013 som historisk bro.
- Last ned PPI/KPI i et reproduserbart script og dokumenter seriebrudd.
- Legg til Eurostat prisnivadata for a maale hvor dyrt Norge faktisk er mot nabolandene.

### Sprint 2: Bygg en mer robust butikk- og eierskapsdatabase
- Start med eksisterende OSM/BroCode-butikker.
- Kryssjekk mot Brreg-underenheter og kjedenes egne butikkfinnere.
- Kode parent company, kjede, adresse, kommune og koordinater.
- Deretter: beregn kommunevis HHI og butikkdekning.

### Sprint 3: Kvantifiser import- og beredskapssarbarhet
- Hent varegrupper fra SSB utenrikshandel.
- Marker kategorier med hoy importandel: frukt, gront, for, kraftfor, innsatsvarer.
- Koble dette til NIBIO selvforsyning + Riksrevisjonens beredskapskritikk.

---

## 6. Kilder som er gode, men ikke sterke nok alene

- **Statista**: fint for rask orientering, men ikke nok som sluttkilde.
- **OSM alene**: nyttig for kartlegging, men maa kvalitetssikres mot foretaksdata.
- **Avissaker og kronikker**: gode for hypoteser og case, ikke for baseline-statistikk.
- **Bransjeorganisasjoner**: nyttige som supplement, men interesser ma oppgis tydelig.

---

## 7. Arbeidshypotese for neste fase

Den mest fruktbare kombinasjonen ser ut til a vaere:

1. **SSB + Eurostat** for pris og handel  
2. **Brreg + Geonorge + NVDB** for lokal markedsstruktur og tilgjengelighet  
3. **NIBIO + FAOSTAT + nasjonale statistikkbanker** for selvforsyning og nordisk sammenlikning  
4. **Konkurransemyndigheter + arsrapporter** for regulatorisk og selskapsmessig validering

Det gir et datasett som kan belyse baade:
- markedsmakt
- beredskap
- geografi
- sirkularitet
- nordisk merverdi
