# Danmark og Finland: nasjonal kontroll av hvete og bygg

Datert tillegg 9. september 2026. Intern analyse. Ett nasjonalt tabellutvalg per land dekker 2015–2020: Danmarks Statistik HST77 og Luke 0100_sattil.px. Originalforespørsler, responser og metadata er bevart privat. [Findings](findings.json) inneholder 24 nasjonale land/vekst/år-poster og eksakte cellereferanser.

| 2018 | Nasjonal produksjon, tusen tonn | Eurostat, tusen tonn ved 14 % vann | Avstemming |
|---|---:|---:|---|
| Danmark, vinter- og vårhvete | 2 654,80 | 2 623,93 | 15→14 % omregning stemmer innen 0,01 tusen tonn |
| Danmark, vinter- og vårbygg | 3 485,70 | 3 445,17 | 15→14 % omregning stemmer innen 0,01 tusen tonn |
| Finland, totalhvete | 494,70 | 501,60 | Uavklart differanse +6,90 tusen tonn |
| Finland, totalbygg | 1 336,10 | 1 353,19 | Uavklart differanse +17,09 tusen tonn |

Tallene kommer fra [HST77](https://www.statbank.dk/HST77), [Luke-tabellen](https://statdb.luke.fi/PxWeb/pxweb/en/LUKE/LUKE__maa__sattil/0100_sattil.px/) og foreldrekjøringens bevarte [Eurostat APRO_CPSH1](https://doi.org/10.2908/APRO_CPSH1). Nasjonale data og Eurostat kan ha felles datalinje; dette er avstemming, ikke uavhengig empirisk bekreftelse.

Danmarks samtidige 2018-kvalitetsdokument angir 15 % vann for korn, fysisk side 7, avsnitt 3.5, visuelt kontrollert. Ved bevart tørrstoffmasse blir faktoren til 14 % vann 85/86. HST77 har ingen totalhvetekode; summen av vinter- og vårhvete må fortsatt kontrolleres mot Eurostats «wheat and spelt», inklusive durum. Metadataspråket omtaler dyrket areal og IACS; en uttrykkelig fratrekksregel for uhøstet kornareal er ikke etablert her.

Finlands 2018-arealer er 177,8 tusen hektar hvete og 405,1 tusen hektar bygg, numerisk identiske i Luke og Eurostat. Luke oppgir henholdsvis 2 780 og 3 300 kg/ha. Tabellen og kvalitetsrapporten beskriver høstet areal: fram til 2015 dyrket minus totalskadet areal, fra 2016 estimert høstet areal. Nasjonal serie krysser dermed en metodeendring. Eksakt finsk standardvannprosent er ikke bekreftet i den leste myndighetsmetadataen; «dried crop yield» er ikke nok til å fylle dette feltet.

Det finske produksjonsavviket holdes åpent. [Finlands nasjonale Eurostat-metadata](https://ec.europa.eu/eurostat/cache/metadata/EN/apro_cp_esqrscn2_fi.htm), avsnitt 3.3, beskriver et reelt klassifikasjonsavvik: korn høstet før modning ligger nasjonalt i G9100, mens Handbook legger det til C0000. Dette er et mulig forklaringsspor. Metadataen gir ingen numerisk bro for 2018 eller grunnlag for å tilordne hele differansen denne mekanismen. Begge serier beholdes.

Ukjent vinterbygg i det finske utvalget er bevart som `null` med status `..`, aldri null produksjon. Areal, produksjon og avling er separat avrundet i tabellene; multiplikasjon kan derfor gi mindre avvik. Ingen av disse størrelsene dokumenterer møllekvalitet, spiselig tilbud eller disponibel krisekapasitet.

Kontroll: 72 danske og 126 finske utvalgsceller, 24 nasjonale totalposter, ni råhash-, fire teksthash- og sju requesthash-bindinger. De danske og finske metodepassasjene er kontrollert visuelt på henholdsvis fysisk side 7 og 19 (finsk trykt side 18). Originalene ligger under `/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a084fe-a36c-7fb1-86c2-4387109e3c36/round-004/dk-fi/`; Eurostat-originalen er beholdt på foreldrekjøringens private sti. Ingen kontakt, DB, kanonisk data, readiness, commit eller publisering er endret.
