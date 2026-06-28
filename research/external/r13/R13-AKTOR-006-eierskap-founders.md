# R13-AKTOR-006 — Eierskap og founders i sirkulær/altprotein/CEA

**ID:** R13-AKTOR-006
**Prioritet:** P1
**Tema:** Aktørkartlegging
**Geo:** NO
**Output-type:** ownership ledger
**Dato:** 2026-06-28
**Anbefalt gate:** PCQ

---

## Sammendrag-tabell

| Felt | Svar |
|---|---|
| Kort dom | Åtte norske aktører kartlagt via Brreg rolledata (Brreg API 2026-06-28). Rolledata (daglig leder, styreleder, styremedlemmer) er tilgjengelig for alle aktive selskaper. Fullstendig aksjonærregister er ikke offentlig tilgjengelig via API — eierstruktur utover styreroller er et systematisk epistemisk gap for alle selskapene. Restaurant Rest AS er bekreftet slettet (slettedato 2025-06-18, konkurs 2024-09-05). Gruten AS er ikke identifisert i Brreg under det navnet. Vestkorn Milling AS-tilknytning til dsm-firmenich ikke bekreftet via Brreg-data alene. |
| Sterkeste kilde | Brreg Enhetsregisteret API, data.brreg.no, tilgang 2026-06-28 (kildeklasse A — primærregister) |
| Svakeste punkt | Aksjonærregister (hvem eier aksjene) er ikke offentlig tilgjengelig via Brreg API eller Skatteetaten uten betalt tilgang. Eierstruktur er en systematisk C-celle for alle selskapene. Founders-identifikasjon er kun tilgjengelig der stiftelsesdato og daglig leder/styreleder samsvarer med oppstart — ingen kausal kobling kan bekreftes uten sekundærkilder. |
| Eierskapsledger | se under |
| Tomme celler | se under |
| Ikke si | se under |
| Anbefalt gate | PCQ |

---

## Eierskapsledger

### Sektor: Sirkulær

| Selskap | Org.nr | Sektor | Founders/eiere (Brreg-roller) | Kapital (registrert) | Registerdato | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|---|
| Restaurant Rest AS | 919 972 696 | Sirkulær (matsvinn-til-gourmet, nå insolvent) | Daglig leder: ikke tilgjengelig via API (slettet enhet). Stifter: ikke registrert i tilgjengelig rolledata. Founder Jimmy Øien bekreftet via sekundærkilder (Aftenposten/Vink 2024, DN 2024, Horecanytt 2024) — ikke via Brreg. | Ikke tilgjengelig (slettet) | Registrert: ikke tilgjengelig (SlettetEnhet-respons). Konkurs åpnet: 2024-09-05. Slettedato: 2025-06-18 | A (konkursregistrering, Brreg SlettetEnhet) / B (founder-identifikasjon fra presse) | Brreg-API returnerer kun SlettetEnhet med slettedato. Rolledata ikke tilgjengelig. Founder-identifikasjon fra sekundærkilder; ikke verifisert via Brreg. Konkursårsak (covid/likviditet/strøm) er aktørrapportert. |
| Gruten AS | Ikke identifisert | Sirkulær (kaffegrut-upcycling, soppdyrking) | Daglig leder Siri Mittet er navngitt i sekundærkilder (DN 2017, kaffegeek.no 2021) — ikke bekreftet via Brreg-søk. Brreg-søk på "gruten as" gir ingen treff for matrelatert virksomhet. | Ikke tilgjengelig | Ikke funnet i Brreg-søk 2026-06-28 | C (ikke funnet i primærregister) | Gruten AS er dokumentert i sekundærkilder (kaffegeek.no, DN, norgesvel.no) som opererende ca. 2017–2021 i Oslo. Kan drives som ENK, under annet foretaksnavn, eller være slettet. Ingen org.nr bekreftet. Drift-status ukjent per 2026. |

### Sektor: Altprotein

| Selskap | Org.nr | Sektor | Founders/eiere (Brreg-roller) | Kapital (registrert) | Registerdato | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|---|
| Invertapro AS | 917 809 755 | Altprotein (insektprotein — mat og fôr) | Daglig leder: Alexander Solstad Ringheim (f. 1986). Styreleder: Jon Grønsberg (f. 1980). Styremedlemmer: Asgeir Løno (f. 1980, valgt av A-aksjonærene), Jon Ingemar Gjerde (f. 1965), Magni Haugland (f. 1967, A-aksjonærer), Bård Gultvedt (f. 1970, A-aksjonærer). | NOK 4 920 146 (aksjekapital, registrert 2024-04-09; 4 920 146 aksjer) | Stiftet: 2016-09-13. Registrert: 2016-10-06 | A (Brreg rolledata, API 2026-06-28) | Aksjonærregister ikke offentlig — hvem som eier aksjene er ikke tilgjengelig. Kategorien "A-aksjonærer" i styrerepresentasjon antyder aksjeklasser (A/B), men struktur ikke bekreftet. Founder-identifikasjon ikke bekreftet via Brreg. |
| NorInsect AS | 916 325 010 | Altprotein (insektprotein — produksjon og foredling) | Daglig leder: Harald Larsen Espeland (f. 1979). Styreleder: Helge Orten (f. 1966). Styremedlemmer: Hallgeir Sterten (f. 1957), Siri Tømmerås (f. 1984), Bjørn Haukebø (f. 1952), Aslak Lie (f. 1973), Vladimir Wendl Ibarra (f. 1969). | NOK 67 500 (aksjekapital, 67 500 aksjer, registrert 2017-12-28) | Stiftet: 2015-11-18. Registrert: 2015-12-02 | A (Brreg rolledata, API 2026-06-28) | NorInsect AS er del av konsern med NorInsect Holding AS (org. 919 470 372) som holdingselskap. Aksjonærregister ikke offentlig. Revisor: Cedra Norge AS. |
| NorInsect Holding AS | 919 470 372 | Altprotein (holdingselskap for NorInsect-konsern) | Daglig leder: Harald Larsen Espeland (f. 1979). Styreleder: Helge Orten (f. 1966). (Øvrige styremedlemmer ikke hentet i denne runden.) | NOK 6 256 950 (aksjekapital, 625 695 020 aksjer, stiftet 2017-07-28) | Stiftet: 2017-07-28. Registrert: 2017-08-31 | A (Brreg, API 2026-06-28) | Holdingselskap for NorInsect-konsernet. Aksjonærregister ikke offentlig. Konsernet inkluderer også NorInsect Aureosen AS (org. 935 738 393, stiftet 2025-06-16) og Norinsect Frass AS (937 035 276). |
| Vestkorn Milling AS | 994 423 592 | Altprotein (pea protein — erteproduksjon, Tau) | Daglig leder: Ivana Steiro (f. 1978). Styreleder: Ivana Steiro (f. 1978). Styremedlem: Johannes Bindels (f. 1968). Revisor: KPMG AS. | NOK 4 008 000 (aksjekapital, 4 000 aksjer, registrert 2025-02-05) | Stiftet: 2009-08-10. Registrert: 2009-08-18 | A (Brreg rolledata, API 2026-06-28) | 66 ansatte per 2026-06-13. Hjemmeside: vestkorn.no. Kontaktepost: aslak.lie@vestkorn.no. Mulig tilknytning til dsm-firmenich er ikke bekreftet via Brreg-data. Aksjonærregister ikke offentlig. Bindels-etternavn er nederlandsk — kan indikere utenlandsk eiertilknytning, men dette er ikke bekreftbart via Brreg alene. |
| Norwegian Mycelium AS | 925 995 762 | Altprotein (mycel/sopp-protein og bærekraftige materialer) | Daglig leder: Ingrid Dynna (f. ikke hentet). Styreleder: Maren Hjorth Bauer. Styremedlemmer: David Andrew Quist, Ingrid Dynna. | NOK 53 529 (aksjekapital) | Stiftet: 2020-11-20. Registrert: 2020-12-02 | A (Brreg rolledata, API 2026-06-28) | 12 ansatte. Vedtektsfestet formål: forskning og utvikling av bærekraftige materialer og nye kilder til protein. Aktivitet: utvikling av mycel til protein (mat og dyrefôr) og biologisk nedbrytbare materialer. Aksjonærregister ikke offentlig. Selskapet markedsføres også under underbrands "Microlistic". |

### Sektor: CEA (Controlled Environment Agriculture)

| Selskap | Org.nr | Sektor | Founders/eiere (Brreg-roller) | Kapital (registrert) | Registerdato | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|---|
| Avisomo AS | 920 937 659 | CEA (vertikalt landbruk, hydroponiske systemer, Gjøvik) | Daglig leder: Martin Molenaar (f. 1993). Styreleder: Ole Sverre Spigseth (f. 1964). Styremedlemmer: Lars Rognås (f. 1975), Ellen Elisabeth Altenborg (f. 1967), Ingelin Drøpping (f. 1967). | NOK 72 660 (aksjekapital, 726 600 aksjer, registrert 2023-08-28) | Stiftet: 2018-05-21. Registrert: 2018-06-02 | A (Brreg rolledata, API 2026-06-28) | 17 ansatte. Hjemmeside: avisomo.com. Kontaktepost: martin@avisomo.no. Næringskodemismatch: registrert under NACE 72.100 (forskning/teknikk), men aktivitet er hydroponikk-systemer og salg av grønnsaker. Revisor: Crowe Partner Revisjon AS. Aksjonærregister ikke offentlig. |
| Onna Greens AS | 917 653 135 | CEA (veksthus/vertikal farming, Moss) | Daglig leder: Tobias Eckbo Dager (f. 1987). Styreleder: Arve Heltne (f. 1964). Styremedlemmer: Kristina Braut Kyllingstad (f. 1989), Inger Johanne Solhaug (f. 1969), Are Andenaes Huser (f. 1972), Eirin Skovly (f. 1974), Øivind Moen (f. 1966). | NOK 893 479 (aksjekapital, 21 273 311 aksjer, registrert 2026-06-23) | Stiftet: 2016-08-24. Registrert: 2016-09-02 | A (Brreg rolledata, API 2026-06-28) | 50 ansatte per 2026-06-13. Historiske navn: Athomstart Invest 119 AS (2016–2018), Scandinavian Greenroom AS (2018–2020). Aksjekapital nylig oppdatert (2026-06-23). Aksjonærregister ikke offentlig. |
| Vertical Agri AS | 926 085 611 | CEA (vertical farming-teknologi) | Styreleder: Thomas Apelthun. Ingen daglig leder registrert i rolledata. | NOK 30 000 (aksjekapital) | Stiftet: 2020-11-21. Registrert: 2020-12-02 | A (Brreg rolledata, API 2026-06-28) | Ingen ansatte registrert. Vedtektsfestet formål: bærekraftig teknologiutvikling innen jordbruk og vertical farming. Kun én styrerepresentant i rolledata. Svak aktivitetsprofil — kan være tidligfase eller hvilende. Aksjonærregister ikke offentlig. |

---

## Tomme celler

Følgende eierstruktur-data er ikke offentlig tilgjengelig via Brreg API eller andre åpne kilder og er eksplisitt dokumentert som gap (kildeklasse C):

1. **Aksjonærregister (alle selskaper):** Hvem som eier aksjer, og i hvilke andeler, er ikke tilgjengelig via Brreg API. Skatteetatens aksjonærregister er ikke åpent. Tilgang krever betalt tjeneste (Proff Forvalt, Infotorg) eller Skatteetaten-innsynsbegjæring. Dette gjelder Invertapro AS, NorInsect AS, NorInsect Holding AS, Vestkorn Milling AS, Norwegian Mycelium AS, Avisomo AS, Onna Greens AS, Vertical Agri AS.

2. **Gruten AS — org.nr og status:** Ingen enhet med navn "Gruten AS" er funnet i Brreg (aktive eller slettede) via søk 2026-06-28. Selskapet er dokumentert i sekundærkilder (DN 2017, kaffegeek.no 2021) med aktivitet i Oslo. Kan operere under annet navn, som ENK, eller kan være slettet uten at dette er sporbart via standard Brreg-søk. Org.nr er ikke bekreftet.

3. **Restaurant Rest AS — rolledata:** Brreg returnerer kun SlettetEnhet-respons med slettedato 2025-06-18. Historiske rolledata (daglig leder, styre) er ikke tilgjengelig via API for slettede enheter. Founder Jimmy Øien er kun identifisert via sekundærkilder.

4. **Vestkorn Milling AS — tilknytning til dsm-firmenich:** Ingen Brreg-data bekrefter eierskap eller partnerskap med dsm-firmenich. Johannes Bindels (styremedlem, f. 1968, nederlandsk etternavn) kan indikere tilknytning, men dette er ikke bekreftbart via Brreg alene.

5. **Invertapro AS — aksjeklasser:** Brreg-rolledata viser at tre styremedlemmer er "valgt av A-aksjonærene", noe som indikerer at det finnes minst to aksjeklasser (A og B/andre). Den fulle aksjeklassestrukturen og hvem som tilhører hvilken klasse er ikke offentlig.

6. **NorInsect-konsern — full konsernstruktur:** NorInsect Holding AS har org.nr 919 470 372 og er holdingselskap. Konsernet inkluderer NorInsect AS (916 325 010), NorInsect Aureosen AS (935 738 393), NorInsect Birkeland AS (936 911 358), NorInsect Frass AS (937 035 276). Hvem som eier NorInsect Holding AS (dvs. konsernets ytterste eiere) er ikke tilgjengelig via offentlige kilder.

7. **Norwegian Mycelium AS — kapital og skalering:** Aksjekapital på NOK 53 529 er svært lav og kan indikere at selskapet har hatt emisjoner uten kapitalforhøyelse i aksjeregister, eller at det er tidligfase. Faktisk innhentet kapital (venture, grants) er ikke kartlagt.

8. **Onna Greens AS — historisk eierskap under andre navn:** Selskapet het "Athomstart Invest 119 AS" ved oppstart i 2016, noe som kan indikere at det ble etablert som et shell-selskap og senere overtatt. Opprinnelig eier/founder er ikke identifisert via Brreg.

---

## Ikke si

- Ikke si at eierskap er kjent for noen av disse selskapene — aksjonærregister er ikke offentlig, og rolledata gir styresammensetning, ikke eierforhold.
- Ikke si at daglig leder eller styreleder er "founder" — Brreg registrerer roller, ikke hvem som stiftet selskapet eller betalte inn kapital ved oppstart. Registreringsdato er ikke lik stiftelseshistorie.
- Ikke si at Vestkorn Milling AS er eid av eller kontrollert av dsm-firmenich — dette er ikke bekreftet via tilgjengelige offentlige kilder.
- Ikke si at Gruten AS er i drift, har driftsopphør, eller har konkurs — ingen registerbekreftelse tilgjengelig.
- Ikke si at NorInsect er eid av Helge Orten — han er styreleder, ikke nødvendigvis aksjonær.
- Ikke si at Restaurant Rest AS "gikk konkurs på grunn av covid/likviditet/strøm" — dette er aktørrapporterte årsaker, ikke registrerte fakta.
- Ikke si at Onna Greens AS er "i vekst" basert på nylig kapitalforhøyelse (2026-06-23) — kapitalforhøyelse betyr ikke nødvendigvis lønnsomhet eller vekst.
- Ikke si at Norwegian Mycelium AS er et altprotein-selskap i kommersiell skala — vedtektsfestet formål er FoU, og aktiviteten er begrenset (12 ansatte, lav kapital).
- Ikke bruk betegnelsen "founders" for personer identifisert via Brreg-rolledata — kun registrerte roller, ikke bekreftede gründerforhold.

---

## Anbefalt gate

PCQ — Eierstruktur-data (aksjonærregister) er systematisk ikke-offentlig for alle kartlagte selskaper. Claims om hvem som eier disse selskapene kan ikke underbygges med kildeklasse A eller B uten tilgang til Skatteetatens aksjonærregister (betalt) eller innsynsbegjæring. Rolledata (daglig leder, styre) er kildeklasse A, men representerer ikke eierstruktur. Gruten AS og Restaurant Rest AS har ytterligere identifikasjonsgap. Ingen av disse funnene er klare for ekstern publisering uten PCQ-gjennomgang.

---

## Kilder sjekket

| URL | Kildetype | Kildeklasse | Tilgangsdato |
|---|---|---|---|
| https://data.brreg.no/enhetsregisteret/api/enheter/917809755 | Primærregister (Brreg Enhetsregisteret API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/917809755/roller | Primærregister (Brreg rolledata API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/916325010 | Primærregister (Brreg Enhetsregisteret API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/916325010/roller | Primærregister (Brreg rolledata API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/919470372 | Primærregister (Brreg Enhetsregisteret API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/919470372/roller | Primærregister (Brreg rolledata API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/994423592 | Primærregister (Brreg Enhetsregisteret API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/994423592/roller | Primærregister (Brreg rolledata API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/925995762 | Primærregister (Brreg Enhetsregisteret API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/925995762/roller | Primærregister (Brreg rolledata API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/920937659 | Primærregister (Brreg Enhetsregisteret API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/920937659/roller | Primærregister (Brreg rolledata API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/917653135 | Primærregister (Brreg Enhetsregisteret API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/917653135/roller | Primærregister (Brreg rolledata API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/926085611 | Primærregister (Brreg Enhetsregisteret API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/926085611/roller | Primærregister (Brreg rolledata API) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter/919972696 | Primærregister (Brreg — SlettetEnhet) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter?navn=gruten | Primærregister (Brreg søk) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter?navn=norinsect | Primærregister (Brreg søk) | A | 2026-06-28 |
| /research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md | Intern forskningsfil (sekundær — forrige runde) | B | 2026-06-28 |
| /research/external/r13/R13-WASTE-006-kaffegrut-urbane-sidestrommer.md | Intern forskningsfil (sekundær — forrige runde) | B | 2026-06-28 |
