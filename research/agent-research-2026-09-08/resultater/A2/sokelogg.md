# A2 – søkelogg

Dato: 2026-09-08
Arbeidssted: `/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/beredskap-kunnskapsgrunnlag-2026-09-07`
Råfiler: Ingen råfiler lastet ned eller arkivert lokalt. En `curl`-kontroll mot blokkert PDF skrev kun til `/dev/null`.

## Søk og åpning av original-/primærkilder

### A2-L001 – oppdatert Aass-operatørdata

- Spørsmål: Q1, årsspesifikt volum, målemetode og mottakerbilde.
- Målrettede søk:
  - `site:aass.no bærekraftsrapport 2025 mask`
  - `site:aass.no/media bærekraftsrapport Aass 2025`
  - `site:aass.no "2025" "mask" "Aass"`
  - `site:aass.no "Ringvirkningsrapport 2025"`
  - `site:aass.no "lokale bønder" mask 2025`
- Åpnet:
  - Aass’ bærekraftsside: <https://www.aass.no/samfunnsansvar/baerekraft>
  - Aass’ rapportside: <https://www.aass.no/media/x42aij04/baerekraftrapport-2025.pdf>
- Resultat: 2025-rapport funnet og åpnet. Den oppgir 7,7 millioner liter mask, 100 % dyrefôr og lokale bønder. Rapporten oppgir ikke operatørregister, mottakertall eller måleprotokoll.
- Status: fulltekst relevant del.
- Leveransebruk: A2-S004, observasjoner O-Q1-2025 og gap A2-G001.

### A2-L002 – historisk Aass-serie

- Spørsmål: Q1, oppdatere startpunktets 2023/2024-tall.
- Målrettet åpning:
  - 2022: <https://www.aass.no/media/355ea3wi/baerekraftsrapport-2022.pdf>
  - 2023: <https://www.aass.no/media/02kniv4h/aass-bryggeri-baerekraftsrapport-2023.pdf>
  - 2024: <https://www.aass.no/media/kluhaao1/baerekraftrapport-aass-bryggeri-as-2024.pdf>
- Resultat: åpne PDF-er med årstallene 8,3, 7,9 og 7,8 millioner liter. 2023/2024-rapportene sier 100 % dyrefôr; 2022-rapporten beskriver lokal henting og dyrefôr.
- Status: fulltekst relevant del.
- Leveransebruk: A2-S001–S003 og serien i `funn.md`/`data.json`.

### A2-L003 – aktuell Aass-side om landbruket

- Spørsmål: Q1/Q5, faktisk flyt og aktuell formulering.
- Søk: `site:aass.no mask dyrefôr Aass bryggeri`, `"Aass" mask dyrefôr`.
- Åpnet: <https://www.aass.no/samfunnsansvar/baerekraft/samarbeid-med-landbruket>
- Resultat: Aass beskriver mask som maltrest, rør til hente-/utleveringspunkt, lokale bønder og dyrefôr. Siden sier «over 8 millioner liter» årlig. Den gir ikke år, målemetode eller mottakerfordeling.
- Status: fulltekst relevant del.
- Avvik: formuleringen «over 8 millioner» er ikke lik den årsspesifikke 2025-rapportens 7,7 millioner liter. Loggført som gap A2-G006, ikke harmonisert.

### A2-L004 – Aass-spesifikke fôranalyser

- Spørsmål: Q2/Q3, tørrstoff, råprotein, fiber, tetthet, rasjon og substitusjon.
- Målrettede søk:
  - `site:aass.no mask tørrstoff råprotein fiber analyse`
  - `site:aass.no Aass mask analyse tørrstoff`
  - `site:aass.no mask silo holdbarhet bønder leveringsintervall`
  - `Aass brewery spent grain dry matter protein fiber farmers Drammen`
- Åpnet:
  - <https://aass.no/om-aass/olbrygging/>
  - <https://aass.no/om-aass/laboratoriet>
  - <https://www.aass.no/samfunnsansvar/baerekraft/samarbeid-med-landbruket>
- Resultat: Aass beskriver mask som fiberrik/næringsrik og prosessflyten, men ingen Aass-spesifikke tall for tørrstoff, protein, fiber, tetthet, variasjon, lagring eller mottakerrasjon ble funnet. Lab-siden gjelder primært ølkvalitet.
- Status: fulltekst relevant del; negativt søk innen avgrensede Aass-sider.
- Leveransebruk: A2-G002 og A2-G003.

### A2-L005 – offentlig mottaker-/leveringscase

- Spørsmål: Q1/Q3, finnes det operatørdata utover årsrapportene?
- Søk: `Aass brewery spent grain farmers weekly pickup`, samt norsk/engelsk søk på Aass og mask.
- Åpnet: Science Norway, <https://www.sciencenorway.no/waste/leftovers-from-beer-can-be-turned-into-cow-feed-leather-milk-and-heat/2490458>
- Resultat: reportasje publisert 24.06.2025 beskriver én navngitt melkebonde som henter rester fra Aass én gang i uken og kjører dem til gården. Dette er ett offentlig case, ikke et representativt mottakerregister.
- Status: fulltekst relevant sekundærkilde.
- Leveransebruk: A2-S009, observasjon O-Q1-case.

### A2-L006 – originalforsøk på våt mask og storfe

- Spørsmål: Q3/Q4, rasjon, dose, substitusjon og utfôringseffekt.
- Målrettede søk:
  - `"Wet Brewers Grains for Lactating Dairy Cows During Hot, Humid Weather" PubMed full text`
  - `"Production Response of Lactating Cows Fed Dried Versus Wet Brewers' Grain" full text`
  - `"wet brewers grains" dairy cattle soybean meal corn silage original trial open access`
  - `"Effect of feeding wet brewers grains to beef heifers" pdf`
- Åpnet som primær/fulltekst:
  - Hatungimana et al. 2020, <https://academic.oup.com/tas/article/4/3/txaa079/5855081>
  - Hatungimana et al. 2020, <https://academic.oup.com/jas/article/99/1/skaa393/6031832>
- Resultat: første forsøk gir dose- og næringsdata for 30 Holstein-kviger; andre gir lagrings-/saltforsøk med åtte Holstein-kviger. Begge har metode, sammensetning og avgrensninger åpnet i fulltekst.
- Status: fulltekst relevant del.
- Leveransebruk: A2-S010–S011, O-Q2-heifer, O-Q3-storage og O-Q4 trials.

### A2-L007 – West et al. 1994: direkte fulltekstforsøk

- Spørsmål: Q4, våt mask i laktasjonsforsøk.
- Søk:
  - `"Wet Brewers Grains for Lactating Dairy Cows During Hot, Humid Weather" pdf West Ely Martin`
  - `"Wet Brewers Grains for Lactating Dairy Cows" 1994 pdf`
- Forsøkt åpnet:
  - <https://www.journalofdairyscience.org/article/S0022-0302(94)76942-3/fulltext>
  - Original journal/PDF via DOI: <https://doi.org/10.3168/jds.S0022-0302(94)76942-3>
- Resultat: originaljournalen svarte med robots-/tilgangsfeil; en `curl -L`-kontroll til PDF ble også avvist med 403 og skrev ikke fil lokalt. Det indekserte original-abstractet kunne leses via søkeresultat: 20 Jersey-kyr, 0/15/30 % våt mask og 30 % + flytende gjær.
- Status: abstrakt; fulltekst utilgjengelig.
- Leveransebruk: A2-S012 og Q4-tabellen. Fulltekstblokkering er registrert som tilgangsblokk, ikke som manglende studie.

### A2-L008 – Dhiman et al. 2003: våt vs. tørket mask

- Spørsmål: Q3/Q4, våt/tørr, laktasjon og 15 % dose.
- Søk: `"Production Response of Lactating Cows Fed Dried Versus Wet Brewers' Grain" full text pdf`.
- Forsøkt åpnet: <https://www.journalofdairyscience.org/article/S0022-0302(03)73888-0/fulltext>
- Resultat: direkte journalåpning svarte med 403. Det indekserte original-abstractet kunne leses: 24 Holstein-Friesian, tidlig laktasjon, Latin square og 15 % av rasjonens tørrstoff; våt/tørket mask ga likt tørrstoffinntak og fettkorrigert melk i balanserte rasjoner.
- Status: abstrakt; fulltekst utilgjengelig.
- Leveransebruk: A2-S013 og Q4-tabellen. Ikke brukt som Aass- eller norsk lagringsmåling.

### A2-L009 – lagring, temperatur og tørrstofftap

- Spørsmål: Q3/Q5, holdbarhet og avhengigheter.
- Søk:
  - `"Effects of Storage Duration and Temperature on the Chemical Composition" full text`
  - `"wet brewers grains" dairy cattle storage spoilage dry matter loss original research`
- Forsøkt åpnet: Wang et al. 2014 via PMC-lenken i søkeresultatet.
- Resultat: PMC-siden krevde reCAPTCHA og fulltekst ble ikke åpnet. Søkeutdraget oppga fire temperaturer (5/15/25/35 °C) og lagring 0–3 dager, med fall i råprotein/NDF/vannløselige karbohydrater og økt ADF/tørrstofftap med tid/temperatur. Dette er ikke brukt som eneste grunnlag for kvantitative Aass-påstander.
- Status: søkeutdrag; ikke fulltekst.
- Leveransebruk: kun negativ tilgangslogg og støtte til gapet om Aass-spesifikke lagringsdata.

### A2-L010 – lagrings-/saltforsøk, original fulltekst

- Spørsmål: Q3/Q5, lagring, mugg, tap og temperatur.
- Søk: `"Effects of storage of wet brewers grains treated with salt" 2019 Applied Animal Science`, `"Hatungimana" "Erickson" wet brewers grains 2019`.
- Åpnet: <https://academic.oup.com/jas/article/99/1/skaa393/6031832>
- Resultat: åtte Holstein-kviger, 4×4 Latin square, fersk mask hentet ukentlig fra lokalt meieri, 18,3 km transport, 20 % tørrstoffinkludering. Planlagt ukeslagring ble forkortet til fire dager på grunn av rask forringelse ved høy temperatur; total mottak-til-siste-utfôring var 11 dager. Salt reduserte mugg-/vekttapstendens; høyeste saltnivå svekket fordøyelighet.
- Status: fulltekst relevant del.
- Leveransebruk: A2-S011 og gap A2-G003/A2-G005. Ikke overført som Aass-protokoll.

### A2-L011 – generell sekundær lagrings-/fôrveiledning

- Spørsmål: Q2/Q3, vanlig fôrkjemi, holdbarhet og utstyr.
- Søk: `wet brewers grains dry matter protein storage 5 7 days extension cattle`.
- Åpnet: UF/IFAS, <https://ask.ifas.ufl.edu/publication/AN241>
- Resultat: veiledningen oppgir typiske intervaller for tørrstoff/råprotein, kort holdbarhet etter åpning under varme forhold, behov for tørrstoffbasis og representativ prøveanalyse. Den er amerikansk sekundærkilde og ikke Aass-data.
- Status: fulltekst relevant sekundærkilde.
- Leveransebruk: A2-S016, transferability-forbehold og gap A2-G002/A2-G003.

### A2-L012 – Aass’ prosess-, lab- og kapasitetsdata

- Spørsmål: Q2/Q5, hva er dokumentert om prosess og avhengigheter?
- Åpnet:
  - <https://aass.no/om-aass/olbrygging/>
  - <https://aass.no/om-aass/laboratoriet>
  - <https://www.aass.no/en/about-us/who-is-aass-brewery>
  - <https://www.aass.no/samfunnsansvar/baerekraft/energi>
- Resultat: mask går til masksilo og lokale bønder; annen bitter restfraksjon etter koking er ikke fôr. Aass oppgir ca. 30 mill. liter/år, 650 hl per brygg, eget laboratorium, strøm/naturgass og lokalt vann. Ingen reservekapasitet, silo-/kjøretøykapasitet eller kontinuitetsdata ble funnet.
- Status: fulltekst relevant del.
- Leveransebruk: A2-S006–S008 og avhengighetsdelen.

## Mislykkede eller uavklarte søk som skal stå som gap

1. Ingen målrettet Aass-side eller rapport med tørrstoff, råprotein, fiber, tetthet, mineraler eller hygieniske analyser ble funnet.
2. Ingen Aass-/bondelag-register med antall mottakere, mottakertype, kg/liter per henting, leveringstid eller lagring ble funnet.
3. Ingen Aass-spesifikk rasjonsjournal eller målt ingredienssubstitusjon ble funnet.
4. Fulltekst for West 1994 og Dhiman 2003 ble blokkert av robots/403; Wang 2014 fulltekst ble stoppet av reCAPTCHA. Abstract/søkeutdrag er derfor ikke behandlet som fulltekst.
5. Ingen offentlig dokumentasjon av backup for strøm, naturgass eller vann, masksiloens kapasitet, pumpe/rør-redundans, kjøretøy eller alternativ fôrtilgang ble funnet.
