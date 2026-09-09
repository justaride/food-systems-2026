# Korn rundt 2018 — analyserunde 004

Åtte produksjonsserier i Norge, Sverige, Danmark og Finland ligger lavere i 2018 enn eget gjennomsnitt for 2015–2017. Dette gir et konkret historisk scenario for å undersøke sårbarhet i alternative forsyningsland. Det dokumenterer ikke klimaets kausale bidrag, manglende eksportmulighet eller ekstra beredskapseffekt av samarbeid.

| Land | Hveteserien, produksjon | Bygg, produksjon |
|---|---:|---:|
| Norge | −65,7 % | −23,1 % |
| Sverige | −48,5 % | −32,2 % |
| Danmark | −43,4 % | −11,4 % |
| Finland | −43,3 % | −13,0 % |

Referansen er forhåndsvalgt årsgjennomsnitt 2015–2017, ikke forventet produksjon uten tørke. Norsk hvete er **C1110, vanlig hvete og spelt**; øvrige land har **C1100, hvete og spelt**. Norsk C1100 mangler i 2018–2020. Kodene er ikke skjøtt sammen, og ingen samlet nordisk hvetemengde beregnes. Tallene er egne beregninger fra det bevarte [Eurostat-uttrekket](https://doi.org/10.2908/APRO_CPSH1), ved 14 prosent vanninnhold.

## Leveransen

- [Analyse og eksakte cellelokatorer](analysis.json): 48 land–vekst–år-poster, 24 sammenligninger for 2018–2020. Produksjon, areal, rapportert avling og beregnet produksjon/areal holdes atskilt.
- [Kjørbart følgehefte](analysis.ipynb), [rapportens SQL-kontroll](report-query.sql) og [sensitivitetskontroller](sensitivity.json).
- [Norge](norway/README.md), [Danmark og Finland](dk-fi/README.md), [studienes metode og svensk originalserie](method/README.md), [svensk avstemming](sweden-crosscheck.json).
- [Whitepaper-tillegg](WHITEPAPER-TILLEGG.md), [daterte formåls- og gapendringer](status-delta.json), [26 avgrensede observasjoner](observations.json), [kildebindinger](source-bindings.json) og [kontrollkvittering](verification.json).
- [Kritisk kode- og tallkontroll](method/ANALYSE-KONTROLL.md) og [rettelseskontroll](method/ANALYSE-RETTELSESKONTROLL.md). [Neste sesjon](NESTE-SESJON.md) har private kjørings- og rapportpaths.

En selvstendig HTML-rapport med figur og tabeller er generert privat. Originale API-svar, PDF-er, vedlegg og råtekst ligger utenfor repository. Reportens innhold er en avgrenset snapshot, ikke en levende datakobling.

## Hva kontrollene avklarer

Sverige samsvarer numerisk i alle tolv produksjonssammenligninger. Danmark samsvarer i 2018 etter omregning fra 15 til 14 prosent vann. Norsk bygg har en rest på 43,26 tonn etter samme justering; vanlig nærmesteavrunding kan forklare forskjellen, men årsaken er ikke bevist. Nasjonale kilder og Eurostat er beslektede rapporteringsstrømmer, ikke uavhengige empiriske replikasjoner.

Finland er ikke fullt avstemt: Eurostat ligger 6,90 tusen tonn høyere for hvete og 17,09 tusen tonn høyere for bygg i 2018 enn Luke. Eksakt finsk nasjonal fuktprosent er ikke dokumentert i det leste materialet. Den finske arealmetoden endres fra 2016; et beskrevet avvik i klassifisering av umodent korn er et mulig spor, ikke en kvantitativ forklaring på differansen.

Alle åtte produksjonsfall består med 2016–2017 som alternativ førperiode. De finske nasjonale produksjonsseriene viser også fall: −43,31 prosent hvete og −13,05 prosent bygg. Det støtter retningen, uten å løse nivå- og definisjonsforskjellene.

Panelet inneholder 191 av 192 etterspurte måleceller, inklusive 48 fuktverdier. Rapportert dansk hveteavling mangler i 2015. Åtte rapporterte avlingstall ligger utenfor den eksplisitte avrundingskontrollen; de er bevart, ikke rettet. Avvikskontrollen er ikke et statistisk konfidensintervall. Beregnet avling er P/A for hvert år; referansen er gjennomsnittet av disse årsforholdstallene. Prosentendringene for produksjon, areal og avling skal ikke summeres eller forventes å gi en eksakt dekomponering rundt separate årsgjennomsnitt.

## Bruksgrense

Dette er en avgrenset deskriptiv kildeanalyse. Det er ikke en replikasjon av Beillouin eller Tootoonchi. Matkvalitet, eget behov, eksportabel mengde og leverbar kapasitet står eksplisitt som ukjent. SSBs beskrevne kornleveranser utelater korn til eget bruk. Dagens generiske Eurostat-etikett for areal skal ikke påføre 2025-definisjonen på 2015–2020.

26 interne KI-kvitteringer er bundet til 24 kildeidentiteter med 23 ulike råhashverdier; én Eurostat-respons forekommer under to dokumenterte aliaser. Ingen av disse er menneskelig review. Tidligere runders observasjoner, gap og historiske summer er uendret. Lokal kontroll sier ikke at CI, migrasjon, deployment eller autentisert produksjons-UI er kontrollert i denne runden.

64 lokale kontrollpunkter, 14 enhetstester og separat kontroll av 72 prosentverdier består. Rapportleseren er kontrollert ved 1440 og 390 pikslers bredde. Følgeheftets kodeceller er kjørt sekvensielt i CPython; en Jupyter-kernelkjøring er ikke utført. Alle ikke-tomme kildeflagg holder berørte sammenligninger tilbake ved gjenbruk av analyseskriptet.
