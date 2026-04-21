<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Identifiser de 20 mest operative KPI-ene for å måle sirkularitetsgrad i matsystemer, organisert etter R9-nivå. For hver KPI:

>
> 1. Navn og definisjon
> 2. Datakilde (SSB, Eurostat, bransjerapportering, forskning)
> 3. Tilgjengelighet per nordisk land (NO/SE/DK/FI/IS)
> 4. Siste tilgjengelige datapunkt med verdi
> 5. Gap: eksisterer KPI-en konseptuelt men måles ikke i praksis?
>
> Prioriter KPI-er som fanger «verditrapp»-logikken (mat → fôr → materialer → energi → avfall) og som kan sammenlignes på tvers av nordiske land.
>
> Kilder: EU CE Monitoring Framework, JRC Sustainable Product Policy, SSB nasjonalregnskap, Eurostat env_wasgen, Naturvårdsverket etappmål, Luke (FI) maatalouslaskenta.

Det finnes i dag ikke et etablert «Nordic 20-KPI-sett» for sirkularitet i matsystemer, men vi kan bygge et operativt forslag ved å kombinere EU/Eurostat-indikatorer, CE‑rammeverk for mat og tilgjengelig nordisk statistikk.  Nedenfor foreslår jeg 20 KPI‑er fordelt langs verditrappa og R‑hierarkiet, med kort status på datakilder, nordisk dekning, siste typiske datapunkt og om indikatoren primært er «konseptuell» eller reelt målt.[^1][^2][^3][^4][^5]

**Viktig forbehold:** Tallverdier og «siste datapunkt» er illustrerende EU-/landtall der slike finnes lett tilgjengelig; for en presis nordisk tabell må du inn i hvert enkelt SSB/SCB/Statistics Denmark/Statistics Finland/Statistics Iceland–datasett, Luke, Naturvårdsverket m.fl.  Mange av KPI-ene under er derfor mer et operativt design enn en ferdig talltabell.[^3][^5][^1]

***

## Ramme: verditrapp + R‑nivå

Jeg bruker følgende verditrapp og kobler til typiske R‑strategier fra R+ til R8:[^5][^1]

- Mat (direkte humant konsum) – R0 Refuse, R1 Rethink, R2 Reduce
- Fôr – R3 Reuse (som fôr), R4 Repair er lite relevant for mat
- Materialer (biobaserte materialstrømmer) – R3/R5 Recycle (materialgjenvinning)
- Energi – R7 Recover (energi), R8 Re-mine
- Avfall – residualstrømmer ut av verditrappa

***

## KPI-er på matnivå (R0–R2: Refuse/Rethink/Reduce)

### 1. Andel matsvinn i forhold til mattilførsel (Food Waste Index, total)

1. **Navn/definisjon**
Prosentandel av total mattilførsel (kg per innbygger) som ender som matsvinn i hele kjeden (primærproduksjon, prosessering, retail, servering, husholdninger), i tråd med SDG 12.3 og Eurostat/EU food waste‑indikatoren.[^6][^7][^3]
2. **Datakilde**
Eurostat env_wasfw/cei_pc035, EU Food Waste reporting, nasjonale matsvinnsprosjekter (Matvett, Norsus, Naturvårdsverket, Miljøstyrelsen, Luke).[^2][^8][^9][^3]
3. **Tilgjengelighet NO/SE/DK/FI/IS**
    - NO/SE/DK/FI: rapporterer til Eurostat, har egne nasjonale estimater.[^9][^3][^6]
    - IS: mer fragmentert; dekning via Eurostat er svakere, men konseptuelt likt.[^3]
4. **Siste datapunkt (illustrasjon)**
EU: 132 kg matsvinn per innbygger i 2022 (≈10% av mattilførsel til sluttleddene).[^3]
EU 2023: 130 kg per innbygger.[^10]
5. **Gap**
KPI er fullt operasjonalisert i EU/EØS, men metodedekningen i tid/rom varierer; usikkerhet særlig i primærledd og husholdninger.[^9][^3]

***

### 2. Husholdningsmatsvinn per innbygger (R2 Reduce)

1. **Navn/definisjon**
kg matsvinn fra husholdninger per innbygger per år, målt som «fresh mass» i Eurostat‑metodikken.[^4][^3]
2. **Datakilde**
Eurostat env_wasfw delindikator, nasjonale studier (Matvett/ForMat i NO, Naturvårdsverket i SE, Miljøstyrelsen i DK, Luke i FI).[^11][^9][^3]
3. **Tilgjengelighet**
NO/SE/DK/FI: ja, med relativt god tidsserie.[^11][^9][^3]
IS: begrenset, punktstudier.
4. **Siste datapunkt (illustrasjon)**
EU gjennomsnitt 2022: 72 kg husholdningsmatsvinn per innbygger.[^3]
Norge: rundt 75 kg mat per person per år ble anslått som matsvinn (industri + husholdninger samlet); husholdningsandel ca. 52%.[^11][^9]
5. **Gap**
Operasjonell, men husholdningsmålinger er avhengig av periodiske kampanjestudier; ikke alltid årlig for alle nordiske land.[^9][^3]

***

### 3. Matsvinn i verdikjede før husholdning (R2 Reduce)

1. **Navn/definisjon**
kg matsvinn per innbygger fordelt på primærproduksjon, industri, retail og servering, i tråd med Eurostat‑sektorinndelingen.[^8][^4][^3]
2. **Datakilde**
Eurostat env_wasfw (NACE‑spesifikk), nasjonale rapporter (Norsus, Naturvårdsverket, Matvett etc.).[^8][^9][^3]
3. **Tilgjengelighet**
NO/SE/DK/FI: delvis, men sektordekning varierer.[^8][^3]
IS: svakt dekket.
4. **Siste datapunkt (illustrasjon)**
EU 2022: ca. 10 kg (primær), 25 kg (industri), 10 kg (retail), 14 kg (servering) per innbygger.[^3]
5. **Gap**
Konseptuelt etablert; i praksis er primærproduksjon og servering ofte underestimert i nasjonale datasett.[^9][^3]

***

### 4. Andel matsvinn som høyverdig redistribuert til mennesker (R1 Rethink)

1. **Navn/definisjon**
Prosentandel av potensielt spiselig matsvinn fra industri/retail/servering som redistribueres via matbanker, sosiale aktører eller rabatterte «too-good-to-go»‑løsninger.
2. **Datakilde**
Bransjerapportering (matbanker, Too Good To Go, dagligvarekjeder), enkelte forskningsprosjekter.[^5]
3. **Tilgjengelighet**
NO/SE/DK/FI/IS: fragmentert; ofte prosjektbaserte data, ikke standardisert i SSB/Eurostat.[^5]
4. **Siste datapunkt**
Typisk rapportert som tonn redistribuert per år nasjonalt, men ikke harmonisert nordisk.[^5]
5. **Gap**
KPI er konseptuelt klar og samsvarer med verditrappa (mat → mennesker), men måles ufullstendig og ikke sammenlignbart på tvers av land.[^5]

***

### 5. Andel kosthold med lavt material‑ og karbonfotavtrykk (R0 Refuse/R1 Rethink)

1. **Navn/definisjon**
Andel av befolkningens kaloriinntak eller kostholdsmønster som kommer fra lav‑avtrykk produkter (plantebasert, lavt kjøttforbruk) i tråd med nasjonale kostråd og klimascenarier.[^1]
2. **Datakilde**
Nasjonale kostholdsundersøkelser koblet med LCA‑baserte produktavtrykk (JRC Product Environmental Footprint, nasjonale LCA‑databaser).[^12][^1]
3. **Tilgjengelighet**
NO/SE/DK/FI: kostholdsdata finnes, men koblingen til sirkularitetsindikatorer er sjelden gjort eksplisitt.[^1]
IS: mer begrenset.
4. **Siste datapunkt**
Eksempel fra Belgia viser fordeling av kalorier, material‑ og karbonfotavtrykk for ulike matvarer; tilsvarende ramme kan bygges for nordiske land.[^1]
5. **Gap**
Konseptuelt moden (brukes i scenariostudier), men ikke operasjonalisert som offisiell KPI i CE‑monitorer.[^12][^1][^5]

***

## KPI-er på fôr‑nivå (R3 Reuse som fôr)

### 6. Andel av fôr fra restråstoff og biprodukter

1. **Navn/definisjon**
Prosentandel av total sammensatt fôrvolum (tonn tørrstoff) som stammer fra reststrømmer og biprodukter (fra matindustri, slakterier, kornindustri, etc.).[^1]
2. **Datakilde**
Fôrindustriforeninger, nasjonal fôrstatistikk, Luke (FI) maatalouslaskenta, forskningsprosjekter på bioøkonomi.[^13][^1]
3. **Tilgjengelighet**
FI: relativt god statistikk via Luke.[^13]
NO/SE/DK: bransjetall finnes, men ofte ikke offentlig granulert.
IS: begrenset.
4. **Siste datapunkt**
Belgia/Flanders: utvikling i andel restmaterialer i sammensatt fôr 2011–2019 er vist som eksempel; tilsvarende indikator kan bygges i Norden.[^1]
5. **Gap**
Konseptuelt etablert; operasjonell i noen land/regioner, men ikke harmonisert nordisk/norsk på offisiell statistikk‑nivå.[^1]

***

### 7. Andel animalsk restråstoff brukt til fôr

1. **Navn/definisjon**
Prosentandel av spiselig og ikke‑spiselig animalsk restråstoff (skrotterester, bein, innmat) fra kjøtt og sjømat som går til fôrproduksjon (f.eks. fiskemel, kjæledyrfôr), ikke til energi/avfall.[^1]
2. **Datakilde**
Slakteri‑ og sjømatindustriens rapportering, bransjestatistikk, enkelte nasjonale CE‑studier (f.eks. lakseoppdretts‑KPIer).[^14][^1]
3. **Tilgjengelighet**
NO/DK/SE: betydelige sjømat‑ og kjøttsektorer har interne tall; offentlig statistikk begrenset.[^14][^1]
FI/IS: mer fragmentert.
4. **Siste datapunkt**
Typisk prosjekt‑/selskapsspesifikt (f.eks. andel av lakserestråstoff til fôr i enkeltstudier).[^14][^1]
5. **Gap**
Tydelig «verditrapp»-KPI (mat → fôr), men lite standardisert, ikke rapportert i SSB/Eurostat.[^14][^1]

***

### 8. Andel matspesifikke restråstoff som går til fôr vs. lavere trinn

1. **Navn/definisjon**
For matrelaterte biomasser som er uegnet til direkte humant konsum: andel som går til fôr sammenlignet med andel som går direkte til energi eller avfall, målt i tonn tørrstoff.[^5][^1]
2. **Datakilde**
Kombinasjon av avfallsstatistikk (Eurostat env_wasgen/env_wasfw) og sektorstudier om biomasseutnyttelse.[^15][^16][^5]
3. **Tilgjengelighet**
NO/SE/DK/FI: delvis; krever kobling av flere datasett.[^16][^5]
IS: svakt.
4. **Siste datapunkt**
Flemish‑studien viser en «valorisation and cascade index» for organiske reststrømmer per sektor; denne logikken kan overføres.[^1]
5. **Gap**
Konseptuelt sterk indikator for verditrapp, men ikke standard i CE‑monitorer; krever modellering og antagelser.[^5][^1]

***

## KPI-er på materialnivå (R3/R5: Reuse/Recycle)

### 9. Fosfor‑ og nitrogen‑gjenvinning til jord fra matrelaterte strømmer

1. **Navn/definisjon**
Prosentandel av N og P i matrelaterte reststrømmer (husdyrgjødsel, matavfall, avløpsslam, digestat) som tilbakeføres til jordbruk som gjødsel, i stedet for å gå tapt til miljø eller energi uten næringsretur.[^1]
2. **Datakilde**
Nasjonale gjødsel‑ og næringsbalanser (SSB miljøregnskap, Naturvårdsverket, Luke), vannforvaltning, jordhelseprogrammer.[^17][^18][^1]
3. **Tilgjengelighet**
NO/SE/DK/FI: gode N/P‑balanser finnes, men ikke alltid eksplisitt koblet til «mat‑CE».[^1]
IS: mindre omfattende.
4. **Siste datapunkt**
Flanders‑studien viser utvikling i produksjon/bruk av husdyrgjødsel, næringsinnhold i jord, osv. som eksempel.[^1]
5. **Gap**
Delvis operasjonell (N/P‑balanser), men sirkularitetsvinklingen og koblingen til matsystemet er ofte analytisk, ikke offisiell KPI.[^5][^1]

***

### 10. Andel organisk matavfall til materialgjenvinning (kompost/biogjødsel)

1. **Navn/definisjon**
Prosentandel av innsamlet organisk matavfall og VFK (vegetabilsk/fruit/kjøkken) fra husholdninger og næring som går til kompostering eller biogass med etterfølgende bruk av kompost/digestat på jord.[^1]
2. **Datakilde**
Avfallsstatistikk: Eurostat env_wasgen/municipal waste, nasjonale avfallsregistre (SSB avfallsregnskap, Naturvårdsverket, Miljøstyrelsen).[^16][^1]
3. **Tilgjengelighet**
NO/SE/DK/FI: relativt god data om behandlingsmetoder; må ofte estimeres for mat‑andel.[^16][^1]
IS: mer begrenset.
4. **Siste datapunkt**
Flanders‑eksempel viser utvikling i organisk input til kompost/fermentering og andel husholdningskjøkkenavfall; tilsvarende tall finnes i nordiske avfallsrapporter.[^1]
5. **Gap**
Operasjonell på avfallsnivå, men kobling til matsystemet krever fraksjonering.[^5][^1]

***

### 11. Andel biobaserte emballasjematerialer som materialgjenvinnes

1. **Navn/definisjon**
Prosentandel av matrelatert emballasje (papir/kartong, plast, bioplast) som materialgjenvinnes, relativt til total mengde satt på markedet.[^1]
2. **Datakilde**
Produsentansvarsselskaper (Fost Plus‑type aktører, Grønt Punkt Norge, mfl.), Eurostat packaging waste‑statistikk.[^1]
3. **Tilgjengelighet**
NO/SE/DK/FI/IS: ja for total emballasje; matandel må estimeres ut fra varegrupper/COICOP.[^1]
4. **Siste datapunkt**
Belgia/Flanders: rapporterer detaljert utvikling i selektiv innsamling og materialgjenvinningsgrader for emballasje; lik struktur i nordiske land.[^1]
5. **Gap**
Emballasjestatistikk er operasjonell; mat‑spesifikk utskilling og kobling til matsystem‑CE er ikke standard.[^5][^1]

***

### 12. Landbruksareal brukt til regenerative/praksiser med høy sirkularitet

1. **Navn/definisjon**
Andel av jordbruksareal knyttet til matproduksjon som drives etter regenerative eller agroøkologiske prinsipper (variert vekstskifte, jordhelse, lav innsats), som indikator på «R+ Restore».[^1]
2. **Datakilde**
Landbruksstatistikk (areal etter driftsform, økologisk jordbruk, miljøtiltak i CAP/CSP), miljøprogrammer.[^19][^13][^1]
3. **Tilgjengelighet**
NO/SE/DK/FI/IS: areal for økologisk jordbruk er godt dekket; spesifikt «regenerativt» mindre klart.[^19][^13]
4. **Siste datapunkt**
Eksempler på landbruksarealbruk og jordhelsestatistikk finnes i flere land; Flanders‑rapporten illustrerer utvikling i markkvalitet og arealbruk.[^1]
5. **Gap**
Øko‑areal og noen miljøtiltak er målt; eksplisitt «regenerative CE‑arealer» er konseptuell KPI.[^13][^1]

***

## KPI-er på energinivå (R7 Recover)

### 13. Andel matrelaterte organiske reststrømmer til biogass/energi

1. **Navn/definisjon**
Prosentandel av matavfall og andre matrelaterte organiske reststrømmer (inkl. husdyrgjødsel når aktuelt) som går til biogass/energiutnytting.[^1]
2. **Datakilde**
Avfalls‑ og biogassstatistikk, energistatistikk (fornybar energi etter kilde).[^1]
3. **Tilgjengelighet**
NO/SE/DK/FI: biogass‑volumer og substratsammensetning rapporteres delvis; matandel må ofte estimeres.
IS: begrenset, men noen biogassanlegg.
4. **Siste datapunkt**
Flanders‑rapporten viser utvikling i input til kompost/fermentering og bruk av digestat; nordiske biogassrapporter har tilsvarende tall.[^1]
5. **Gap**
Energiutnytting rapporteres, men kobling spesifikt til «matsystemets» reststrømmer er ikke standardisert.[^5][^1]

***

### 14. Energiutnyttelsesgrad for matrelaterte reststrømmer

1. **Navn/definisjon**
utnyttet energi (GWh) per tonn organisk matrelatert reststrøm som går inn i energiutnytting (biogass, forbrenning med energiutnytting).
2. **Datakilde**
Anleggsrapportering, nasjonale energiregnskap og avfallsstatistikk.[^1]
3. **Tilgjengelighet**
NO/SE/DK/FI: mulig via sammenstilling, men ikke ferdig KPI; IS: svakt.
4. **Siste datapunkt**
Ikke direkte publisert i CE‑rammeverk, men kan utledes nasjonalt; Flanders‑studien viser fordelt input og output for organisk avfall.[^1]
5. **Gap**
Hovedsakelig konseptuell i CE‑kontekst; fordrer modellering av energinnhold og anleggsvirkningsgrader.[^5][^1]

***

## KPI-er på avfallsnivå (R8/lineært avfall)

### 15. Matrelatert avfall til deponi eller forbrenning uten energiutnytting

1. **Navn/definisjon**
Prosentandel av matrelatert organisk avfall som ender i deponi eller lean forbrenning uten energiutnytting, som «laveste trinn» i verditrappa.[^5][^1]
2. **Datakilde**
Avfallsstatistikk etter behandlingsmåte (Eurostat env_wasgen, nasjonale avfallsregnskap).[^16][^1]
3. **Tilgjengelighet**
NO/SE/DK/FI: god oversikt over behandlingsformer; matandel krever fraksjons‑estimat.[^16]
IS: deponi‑dominerte systemer har enklere volumdata, men mindre fraksjonsdata.
4. **Siste datapunkt**
EU‑ og nasjonale avfallsdata rapporteres årlig; Flanders‑studien viser utvikling i kjøkkenavfall i restavfall; tilsvarende tall finnes i nordiske SOER‑rapporter.[^1]
5. **Gap**
Operasjonell for total avfall; matspesifikk CE‑indikator krever ekstra estimering.[^5][^1]

***

### 16. Total «material footprint» av matsystemet per innbygger

1. **Navn/definisjon**
Material Footprint (MF) knyttet til matforbruk per innbygger (tonn per år), inkludert biomasse, innsatsfaktorer og indirekte ressurser, i tråd med CE‑monitorrammeverk.[^1]
2. **Datakilde**
Nasjonale materialstrømsregnskap (SSB miljøregnskap, Eurostat material flow accounts) koblet til COICOP «Food»; JRC/IO‑modeller.[^18][^17][^1]
3. **Tilgjengelighet**
NO/SE/DK/FI: material footprint finnes samlet, men mat‑spesifikk MF er oftest i forskningsrapporter, ikke i offisiell KPI‑tabell.[^1]
IS: begrenset.
4. **Siste datapunkt**
Flanders‑rapporten viser MF og CF for matforbruk i 2010; Eurostat publiserer lignende makro‑indikatorer for CE.[^20][^1]
5. **Gap**
Konseptet er etablert i CE‑rammeverk; matsystem‑MF som egen tidsserie er hovedsakelig forskningsbasert.[^20][^5][^1]

***

### 17. Klimafotavtrykk (CF) av matsystemet per innbygger

1. **Navn/definisjon**
CO₂‑ekvivalent utslipp fra matsystemet per innbygger (tonn CO₂‑ekv/år), fra vugge til grav for maten som konsumeres nasjonalt.[^12][^1]
2. **Datakilde**
Nasjonale utslippsregnskap etter forbruk (konsum‑baserte utslipp), LCA‑studier, JRC/PEF, IO‑modeller.[^12][^1]
3. **Tilgjengelighet**
NO/SE/DK/FI: konsum‑baserte klimafotavtrykk er beregnet i flere studier, men ikke alltid offisiell KPI per matsystem.[^12][^1]
IS: begrenset.
4. **Siste datapunkt**
Flanders‑rapporten viser CF per sektor og type utslipp for matforbruk i 2010; lignende tall finnes i nordiske klimabudsjett‑studier.[^12][^1]
5. **Gap**
Velutviklet i forskning; mangler standardisering som CE‑indikator på EU‑nivå for mat.[^20][^12][^1]

***

## Tverrgående «cascade»‑ og CE‑spesifikke KPI-er

### 18. «Cascade index» for organiske reststrømmer i matsystemet

1. **Navn/definisjon**
Indeks (0–1) som måler hvor høyt i verditrappa organiske reststrømmer havner, basert på vektet sum av andeler til mat, fôr, material, energi, avfall (f.eks. mat=1, fôr=0,8, material=0,6, energi=0,3, avfall=0).[^5][^1]
2. **Datakilde**
Avfalls‑ og biomassesstatistikk kombinert med sektorstudier; konsept hentet direkte fra CE‑rapporten for matsystemet.[^5][^1]
3. **Tilgjengelighet**
Kan beregnes for NO/SE/DK/FI/IS dersom del‑indikatorene over eksisterer; ikke offisielt rapportert.[^1]
4. **Siste datapunkt**
Flanders‑rapporten beregner en «valorisation and cascade index» for organisk reststrøm per sektor (2015); dette er nær identisk KPI‑idé.[^1]
5. **Gap**
Konseptuelt godt definert i forskning, men ikke operasjonell i offisiell statistikk; vil kreve modellering for alle nordiske land.[^5][^1]

***

### 19. Sirkularitetsgrad for nasjonalt matsystem (andel sekundære ressurser)

1. **Navn/definisjon**
Andel av totale materialinnsatsfaktorer i matsystemet (inkl. innsats i landbruk, industri og emballasje) som kommer fra sekundære/resirkulerte kilder (f.eks. resirkulert fosfor, organiske gjødselressurser, resirkulert emballasje).[^17][^20][^1]
2. **Datakilde**
Materialstrømsregnskap, avfallsstatistikk, næringsbalanser, emballasjestatistikk.[^18][^17][^20][^1]
3. **Tilgjengelighet**
NO/SE/DK/FI: datakomponentene finnes, men ikke integrert til én matsystem‑KPI.[^17][^18][^1]
IS: mer fragmentert.
4. **Siste datapunkt**
EU/Eurostat har makroindikator for sirkulær materialbruk (CRM‑rate), men ikke spesifikt for matsystemet; Flanders‑rapporten peker på materialfotavtrykk og reststrømmers utnyttelse som byggesteiner.[^20][^1]
5. **Gap**
Sterkt konseptuell, strategisk KPI; krever utvikling av MRIO‑ og LCA‑modellering for matsystemet i hvert land.[^20][^5][^1]

***

### 20. Nasjonal indikator for matsystemets CE i CE‑monitorrammeverk

1. **Navn/definisjon**
Syntetisk indikator (eventuelt kompositt) som beskriver matsystemets bidrag til nasjonale CE‑indikatorer (produksjon/forbruk, avfall, sekundære råvarer, global bærekraft) innenfor EU CE Monitoring Framework.[^18][^20][^1]
2. **Datakilde**
Eurostat CE‑monitor (11 indikatorer), nasjonale CE‑rapporter (SSB «Nasjonale indikatorer for sirkulær økonomi», Naturvårdsverkets etappmål etc.), sektorspesifikke matdata.[^21][^22][^18][^20]
3. **Tilgjengelighet**
NO: SSB har CE‑indikatorer, men matsektoren er ikke skilt ut eksplisitt.[^22][^17][^18]
SE/DK/FI/IS: tilsvarende – CE‑indikatorer finnes, men uten eksplisitt matsystemkomponent.
4. **Siste datapunkt**
SSB‑rapporten gir fem nasjonale CE‑indikatorer og sammenligninger med EU og nordiske land (publisert 2025).[^22][^18]
5. **Gap**
CE‑monitorrammeverket er etablert, men «drill‑down» til matsystemet er i stor grad konseptuell og overlatt til forskningsprosjekter som Flanders‑studien.[^18][^20][^5][^1]

***

## Grov oversikt: datatilgjengelighet per land

| KPI nr | Kortnavn | NO | SE | DK | FI | IS |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | Totalt matsvinn (%) | ● | ● | ● | ● | ○ |
| 2 | Husholdningsmatsvinn | ● | ● | ● | ● | ○ |
| 3 | Matsvinn pr. ledd | ● | ● | ● | ● | ○ |
| 4 | Redistribuert matsvinn | ○ | ○ | ○ | ○ | ○ |
| 5 | Lav‑avtrykk kosthold | △ | △ | △ | △ | ○ |
| 6 | Fôr fra reststrømmer | △ | △ | △ | △● | ○ |
| 7 | Animalsk restråstoff til fôr | △ | △ | △ | △ | ○ |
| 8 | Matrest til fôr vs. lavere trinn | △ | △ | △ | △ | ○ |
| 9 | N/P‑gjenvinning til jord | △● | △● | △● | △● | ○ |
| 10 | Matavfall til kompost/biogjødsel | ● | ● | ● | ● | △ |
| 11 | Emballasje‑materialgjenvinning (matandel) | △● | △● | △● | △● | △ |
| 12 | Regenerativt/øko areal | ● | ● | ● | ● | △ |
| 13 | Matrest til biogass/energi | △ | △ | △ | △ | ○ |
| 14 | Energiutnyttelsesgrad | ○ | ○ | ○ | ○ | ○ |
| 15 | Matrelatert avfall til deponi/uten energi | △● | △● | △● | △● | △ |
| 16 | Material footprint mat | △ | △ | △ | △ | ○ |
| 17 | Klimafotavtrykk mat | △ | △ | △ | △ | ○ |
| 18 | Cascade index (verditrapp) | ○ | ○ | ○ | ○ | ○ |
| 19 | Sirkularitetsgrad matsystem | ○ | ○ | ○ | ○ | ○ |
| 20 | CE‑indikator for matsystem i nasjonal ramme | △ | △ | △ | △ | ○ |

● = måles operasjonelt; △ = delvis/utledbar; ○ = hovedsakelig konseptuell.

***

For at dette skal bli nyttig i ditt arbeid: ønsker du at vi neste steg fokuserer på ett land (f.eks. Norge) og ett ledd (f.eks. fôr/materialer) og faktisk henter frem konkrete tall og tabeller for 5–7 av KPI‑ene?
<span style="display:none">[^23][^24][^25][^26][^27][^28][^29][^30]</span>

<div align="center">⁂</div>

[^1]: https://agris.fao.org/search/en/providers/125335/records/67bdacdf7a9727816ad37bfb

[^2]: https://ec.europa.eu/eurostat/databrowser/product/page/cei_pc035

[^3]: https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Food_waste_and_food_waste_prevention_-_estimates

[^4]: https://ec.europa.eu/eurostat/databrowser/view/CEI_PC035/default/table

[^5]: https://circulareconomy.europa.eu/platform/sites/default/files/circular_economy_indicators_for_the_food-system.pdf

[^6]: https://ec.europa.eu/eurostat/databrowser/bookmark/76edf586-f138-4a4a-9a18-28ee45cd015b?lang=en

[^7]: https://sdg-indikatoren.de/en/12-3-1/

[^8]: https://ec.europa.eu/eurostat/databrowser/view/env_wasfw/default/table?lang=en

[^9]: https://norsus.no/wp-content/uploads/OR.49.21-Basis-for-new-EU-reporting-on-food-waste.pdf

[^10]: https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251016-2

[^11]: https://ec.europa.eu/food/safety/food_waste/eu-food-loss-waste-prevention-hub/resource/show/6397

[^12]: https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2022.1014228/full

[^13]: https://www.luke.fi/sites/default/files/2023-03/FoodVision2040_0.pdf

[^14]: https://standard.no/globalassets/kurs-arrangement-og-radgiving/standard-morgen-og-andre-arr/ny-internasjonal-standard-for-avfallshandtering-fra-akvakultur/standard-norge-20-mai-2025---bechmann-1.pdf

[^15]: https://ec.europa.eu/eurostat/databrowser/product/view/env_wasfw

[^16]: https://www.rmci.ase.ro/no18vol1/09.pdf

[^17]: https://www.ssb.no/en/natur-og-miljo/miljoregnskap/artikler/national-indicators-for-circular-economy/_/attachment/inline/43b19d5c-368f-43ac-a406-ca6319f336ca:544daaa038ced888f45bd2f6ed274366ca2a27c4/RAPP2025-36.pdf

[^18]: https://www.ssb.no/natur-og-miljo/miljoregnskap/artikler/nasjonale-indikatorer-for-sirkulaer-okonomi

[^19]: https://agriculture.ec.europa.eu/common-agricultural-policy/cap-overview/cmef_en

[^20]: https://circular-cities-and-regions.ec.europa.eu/support-materials/tools-and-methods/eu-ce-monitoring-framework

[^21]: https://www.regjeringen.no/contentassets/1048f3f6a70b44de980dffaf02068ee8/no/pdfs/baerekraft-i-det-norske-matsystemet.pdf

[^22]: https://www.ssb.no/natur-og-miljo/miljoregnskap/artikler/nasjonale-indikatorer-for-sirkulaer-okonomi/_/attachment/inline/43b19d5c-368f-43ac-a406-ca6319f336ca:544daaa038ced888f45bd2f6ed274366ca2a27c4/RAPP2025-36.pdf

[^23]: https://www.regjeringen.no/contentassets/c326b9d2b114473f832b0539034ed772/deloitte_kunnskapsgrunnlag-for-sirkular-okonomi---potensialer.pdf

[^24]: https://www.circularnorway.no/kundehistorier/sirk-indikatorer

[^25]: https://www.circularnorway.no/nyheter/cgr-danmark

[^26]: https://www.compostnetwork.info/eu-commission-includes-new-indicators-in-revised-ce-monitoring-framework/

[^27]: https://www.ssb.no/priser-og-prisindekser/konsumpriser/statistikk/konsumprisindeksen/artikler/kpis-representantvarer

[^28]: https://www.circularnorway.no/nyheter/sirk-indikatorer

[^29]: https://www.leroyseafood.com/no/barekraft/barekraftsbibliotek2021/kpier/kpi-bruk-av-ferskvann/

[^30]: https://www.statista.com/chart/31072/food-wasted-per-capita-in-european-countries/

