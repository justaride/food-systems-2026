# Norsk originalkontroll: hvete og bygg 2015–2020

Datert internt kandidattillegg, 9. september 2026. [findings.json](findings.json) binder 24 originalceller fra to SSB-tabeller til forespørsler, responser, metadata, SHA-256 og eksakte JSON-lokatorer. Nasjonalt utsnitt; ingen fylkesgrenser er forutsatt stabile.

| År | Hvete, tonn | Hvete, ha | Beregnet kg/daa | Bygg, tonn | Bygg, ha | Beregnet kg/daa |
|---|---:|---:|---:|---:|---:|---:|
| 2015 | 495 200 | 85 760 | 577.4 | 510 700 | 123 290 | 414.2 |
| 2016 | 309 400 | 66 770 | 463.4 | 634 800 | 137 560 | 461.5 |
| 2017 | 400 500 | 75 750 | 528.7 | 574 100 | 134 860 | 425.7 |
| 2018 | 137 700 | 58 650 | 234.8 | 440 900 | 147 950 | 298.0 |
| 2019 | 450 100 | 80 350 | 560.2 | 565 500 | 130 500 | 433.3 |
| 2020 | 324 400 | 67 670 | 479.4 | 639 500 | 139 220 | 459.3 |

Produksjon: [SSB 04609](https://www.ssb.no/statbank/table/04609/), `Region=0`, `ContentsCode=Kveite/Bygg`. Areal: [SSB 04607](https://www.ssb.no/statbank/table/04607/), `ContentsCode=Hvete/Bygg`. Hvete er vår- og høsthvete samlet. Produksjonen gjelder 15 prosent vanninnhold. Avling per areal er egen divisjon av de to publiserte, avrundede seriene; heltallsavrunding samsvarer med alle 12 avlingstallene vist på SSBs statistikkside.

**Systemgrensen er leveranser for salg.** Korn til eget bruk inngår ikke. Areal kommer fra populasjonen av jordbruksbedrifter; det omdøpes ikke til faktisk høstet areal. SSB rapporterer også til Eurostat, så denne direkte avlesningen er ikke en statistisk uavhengig måling. Se [SSBs metodebeskrivelse](https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/korn-og-oljevekster-areal-og-avlinger), «Produksjon» og «Internasjonal rapportering».

I 2018 mot 2017 falt registrert hveteproduksjon 65,6 prosent og byggproduksjon 23,2 prosent. Samtidig falt hvetearealet og byggarealet økte. Dette er en beskrivende sammenligning; tallene alene identifiserer ikke årsak, matkvalitet eller tilgjengelig nordisk bistand.

For kontroll mot en serie med 14 prosent vann er en separat, betinget normalisering beregnet som `tonn ved 15% × 85/86`. Den bevarer tørrstoffmassen, men løser ikke forskjeller i areal-/produksjonsomfang, inkludering av spelt eller årsbegrep. Originaltallene er beholdt. API-feltene `refperiod=31.07` og `measuringType=Stock` er lagret som definisjonsgap; serien brukes ikke som lagerstatus 31. juli.

Matkvalitet, eksporterbar mengde, eget kornforbruk, nasjonalt behov og leveringskapasitet er uttrykkelig `null` med begrunnelse. Ingen av disse størrelsene kan settes lik registrert produksjon.

**Kontroll:** 39 integritets-, indeks-, enhets- og regnekontroller bestått. Metadata, forespørsler, originalresponser og metode-HTML er bevart privat under `round-004/norway`; ingen kildebytes ligger i denne mappen. Åpent søk er avsluttet ved dokumenterte definisjonsgap. Ingen database, kildehistorikk, readiness eller publiseringsstatus er endret.

## Avgrenset restkontroll mot Eurostat

For bygg i 2018 gir SSBs 440 900 tonn ved 15 prosent vann **435 773,26 tonn ved 14 prosent**, mot Eurostats 435 730 tonn (`C1300`, `HPRD_HUMD_EU_THS_T`, `NO`, `2018`, panelindeks213). Restforskjellen er 43,26 tonn, om lag 0,00993 prosent. Det er ikke et eksakt samsvar.

Ved vanlig nærmeste avrunding kan SSBs opprinnelige presisjon på 0,1 tusen tonn alene romme denne forskjellen. Mulige før-avrunding-intervaller overlapper etter fuktjustering; dette er en regnediagnose, ikke bevis for at avrunding faktisk er årsaken. Ulik revisjonsdato og statistisk omfang er ikke avklart. Arealet er numerisk likt i 2018, og beregnet fuktjustert avling avrundes til Eurostats 2,95 tonn/ha; det etablerer ikke semantisk like arealdefinisjoner.

Eurostat-panelets `C1100` hvete-og-spelt mangler norsk produksjonsverdi for 2018. Den beholdes som manglende og erstattes ikke stilltiende med `C1110`. `externalCrosscheck` i JSON binder de konkrete cellene til det private Eurostat-panelets hash. **Ni ekstra kontroller bestått; ingen ny spørring utført.**
