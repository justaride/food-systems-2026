# Presise definisjonsrester — 9. september 2026

**Finland er fortsatt ikke avstemt. Alle åtte avlingsvarsler består.** Denne runden har prøvd konkrete nasjonale kildeinnganger og avgrenset hva de kan forklare. Den endrer ikke tidligere tall eller vurderinger. Reproduserbare verdier og eksakte cellelokatorer står i [calculations.json](calculations.json), med originalbytes i [input-manifest.json](input-manifest.json).

## Finland 2018: historisk nasjonal publisering og metode

Lukes publisering fra 14. mars 2019 oppgir 495 millionerkg hvete og 1 336 millionerkg bygg. Dette er forenlig med avrunding av 494,7 og 1 336,1 i det bevarte nasjonale API-uttrekket. Det beviser ikke identisk kildeversjon; heller ikke at en nyere nasjonal revisjon forklarer Eurostat-avviket. [Luke, Sato ja viljasadon laatu 2018](https://www.luke.fi/fi/tilastot/satotilasto/sato-ja-viljasadon-laatu-2018) (R5-S08, tekstlinjer 427–437).

| Serie 2018 | Luke, tusen tonn | Eurostat, tusen tonn | Rest EU−Luke |
|---|---:|---:|---:|
| Hvete | 494,70 | 501,60 | +6,90 |
| Bygg | 1 336,10 | 1 353,19 | +17,09 |

Ved en ren fuktforklaring måtte EU/nasjonal-forholdet vært samme faktor hvis samme nasjonale standardfukt gjaldt begge vekster. Faktorene er 1,013948 og 1,012791. Med konservativ ±0,05 tusen tonn på begge kilders verdier overlapper ikke forholdsintervallene. Dermed er **én felles faktor alene utilstrekkelig innen denne kontrollen**. Vekstspesifikk fukt, ulike varegrenser og kildeversjoner er ikke utelukket. Baklengs beregnede fuktverdier er kun diagnostikk og registreres aldri som målt nasjonal fukt. Avrundingsintervallet er ikke statistisk usikkerhet eller konfidensintervall.

Den finske metodesiden beskriver høstet areal, tørket korn og separate arealer for tørt/ferskt korn. Delingen gjelder blant annet vårhvete og bygg fra 2007; for høsthvete og rug beskrives start fra 2021. Fra 2016 erstatter utvalgsestimert høsteareal den tidligere beregningen dyrket areal minus totalskadet areal. Dette skjerper avgrensningen, men gir ingen kvantitativ 2018-bro. [Luke, §§1.2 og 2.1](https://www.luke.fi/fi/tilastot/satotilasto/satotilaston-laatuseloste) (R5-S09, tekstlinjer 439–446 og 461–464).

Nasjonal Eurostat-metadata beskriver særskilt C0000/G9100-grensen for korn høstet før modning. Den oppgir ikke hvor mye av de aktuelle 2018-differansene som eventuelt tilhører dette skillet. [Finlands Eurostat-metadata, §3.3](https://ec.europa.eu/eurostat/cache/metadata/EN/apro_cp_esqrscn2_fi.htm) (DKFI-S008, bevart tekstlinjer 223–257).

**Stopp R4-G001:** Det mangler det daterte 2018-overføringsgrunnlaget til Eurostat med versjons-/revisjonslogg, standardfukt per vare og en kvantitativ avstemming av C1100/C1300 mot nasjonale tørr-/ferskkornklasser. Behold begge tallserier. Neste konkrete kilde er dette overføringsgrunnlaget eller et offentliggjort tilsvarende avstemmingsvedlegg. Ingen kontakt er gjort, og brede søk gjentas ikke.

## De åtte avlingsvarslene

Residualen er rapportert Eurostat-avling minus Eurostats produksjon/areal, i kg/ha. Dette er samme panel og samme varselutvalg som i runde 004, ikke et nytt tilfeldig søk etter avvik.

| Land og kode | År | Rapportert t/ha | P/A t/ha | Rest kg/ha | Konkret kontroll og stopp |
|---|---:|---:|---:|---:|---|
| NO C1110 | 2015 | 5,530 | 5,704429 | −174,429 | SSB04610: 577 kg/daa; betinget 15→14 gir 5,702907 t/ha. Forklarer ikke 5,53. Eksakt overføringsversjon mangler. |
| NO C1110 | 2016 | 4,600 | 4,579751 | +20,249 | SSB: 463 kg/daa →4,576163. Ingen full bro. |
| NO C1110 | 2017 | 5,240 | 5,225479 | +14,521 | SSB: 529 kg/daa →5,228488. Ingen full bro. |
| NO C1300 | 2017 | 4,220 | 4,207326 | +12,674 | SSB: 426 kg/daa →4,210465. Ingen full bro. |
| SE C1100 | 2015 | 7,220 | 7,213201 | +6,799 | SCB-uttrekket har vinter-/vårhvete separat, med 7 570/5 000 kg/ha og 2 984 800/315 600 tonn. Uavrundede arealvekter og Eurostats aggregatmetode mangler. Ikke bruk enkelt gjennomsnitt. |
| DK C1300 | 2015 | 6,030 | 6,039873 | −9,873 | HST77 har 631,3 tusen ha i vintersum/vårsum mot 631,0 i Eurostat. Nasjonal P/A ved 14 prosent er 6,037007.2018-avstemmingen løser ikke 2015. |
| FI C1100 | 2020 | 3,460 | 3,453823 | +6,177 | Luke: 677,4 tusen tonn,198,8 tusen ha,3 410 kg/ha. Nasjonal fukt-/varebro mangler; ingen omregnet fasit. |
| FI C1300 | 2016 | 3,680 | 3,672677 | +7,323 | Luke: 1 580,7 tusen tonn,435,9 tusen ha,3 630 kg/ha. Samme bro mangler; året krysser også arealmetodeendringen. |

Kildene er [SSB04610](https://www.ssb.no/statbank/table/04610/) (R5-S17/18, nytt sekscellersuttak), [SSB04607](https://www.ssb.no/statbank/table/04607/) og [04609](https://www.ssb.no/statbank/table/04609/) (bevarte originaler), SCB SkordarL2 (METH-S09), [HST77](https://www.statbank.dk/HST77) (DKFI-S002) og [Luke 0100_sattil](https://statdb.luke.fi/PxWeb/pxweb/en/LUKE/LUKE__maa__sattil/0100_sattil.px/) (DKFI-S004). JSON-peker/CSV-linje og forespørsler er bundet i beregningsfilen og kildepakken.

**Stopp R4-G002:** Åtte av 48 avlingsposter har fortsatt varsel; dansk hvete 2015 mangler fortsatt rapportert avling. For Norge trengs datert oversendelsesversjon og beregningsregel for rapportert avling; for Sverige uavrundede komponentarealer/vekter; for Danmark forklaring på 2015-areal-/avlingsversjonen; for Finland samme vare-/fuktbro som ovenfor. Ikke rett de rapporterte verdiene til P/A eller fyll den manglende cellen med en beregnet verdi under samme navn.

## Historiske systemgrenser

Norsk C1110 holdes gjennom hele serien, mens de andre landene bruker C1100. SSBs nasjonale «Hvete» likestilles ikke automatisk med noen av disse. SSBs leveranseregister utelater eget bruk; justert fukt fjerner ikke denne grensen. [SSBs metode](https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/korn-og-oljevekster-areal-og-avlinger) (R4-NO-S003, bevart kilde).

Danmarks 2018-metode beskriver standardfukt 15 prosent og dyrket areal. Disse opplysningene gjør betingede omregninger mulige, men dokumenterer ikke full historisk likehet med Eurostats arealnevner eller C1100-varegrense (DKFI-S005, tekstlinjer 39–43,128–156). Finlands nye presiseringer ovenfor er et datert tillegg, ikke en omskriving av serien. **R4-G003 er delvis belyst, ikke lukket.** Ingen 2025-definisjon påføres 2015–2020 med tilbakevirkende kraft.
