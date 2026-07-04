# R13-AKTOR-002 — Andelslandbruk aktiv status per gård

**ID:** R13-AKTOR-002
**Prioritet:** P1
**Tema:** Aktørkartlegging
**Geo:** NO
**Output-type:** actor status list
**Dato:** 2026-06-28
**Kontrollert:** 2026-07-02
**Anbefalt gate:** actor-gate

---

## Sammendrag-tabell

| Felt | Svar |
|---|---|
| Kort dom | Økologisk Norge oppgir 90 aktive andelslandbruk per januar 2026 (aktør-rapportert, B-klasse). Brreg bekrefter minst 21 distinkte SA/ENK-enheter med CSA-formål registrert og aktive (ingen konkurs/avvikling). Økoguiden-kartet (categoryId=8467) er ikke maskinlesbart uten JavaScript-kjøring, og gir ikke verifisert per-gård aktiv status. Det foreligger ingen offentlig, komplett, maskinlesbar liste over alle 90 gårder med verifisert aktiv status for 2025/2026. |
| Sterkeste kilde | Økologisk Norge, «Om andelslandbruk», oppdatert 26.01.2026 — https://okologisknorge.no/vaart-arbeid/andelslandbruk/om-andelslandbruk/ |
| Svakeste punkt | Økoguiden-kartet (den eneste samlede kilden per gård) er kun tilgjengelig via JavaScript-rendering; ingen maskinlesbar per-gård-liste ble hentet. Brreg-søk fanger kun enheter med «andelslandbruk»/«andelsgård» i firmanavnet — mange gårder driver CSA under andre juridiske navn. |
| Aktørledger | Se under — 21 Brreg-bekreftede enheter, 2 statussignaler (Spiren: usikker; Øverland: aktiv 2026) |
| Tomme celler | Se under |
| Ikke si | Se under |
| Anbefalt gate | actor-gate |

---

## Aggregerte tall

| Kilde | Tall | År | Kildeklasse | Caveat |
|---|---|---|---|---|
| Økologisk Norge, «Om andelslandbruk» (oppdatert 26.01.2026) | 90 aktive andelslandbruk, 10 000+ andelshavere | 2026 | B | Aktør-rapportert, selvoppgitt, ikke uavhengig verifisert per gård |
| R13-GAP-005 (batch-01 anker) — Økoguiden/Øk.Norge | 93 aktive andelslandbruk | 2023 | B | Aktør-rapportert, talt fra Økoguiden-kartet; metodikk ikke dokumentert |
| Brreg, søk på «andelslandbruk» | 18 enheter, 0 under avvikling/konkurs | 2026-06-28 | A | Kun enheter med «andelslandbruk» i firmanavnet; underrepresenterer totalbildet |
| Brreg, søk på «andelsgård»/«andelsgard» | 6 relevante CSA-enheter (SA) + 2 ENK | 2026-06-28 | A | Mange CSA-gårder driver under gårdsnavnet uten CSA-term i firmanavn |
| Økoguiden kart, categoryId=8467 | Ikke maskinlesbart (krever JS) | 2026-06-28 | — | Epistemic gap: antall oppføringer ukjent fra denne kilden uten JS |

---

## Aktørliste — andelslandbruk (Brreg-bekreftede CSA-enheter)

Alle enheter er hentet fra Brreg 2026-06-28. Ingen er registrert som konkurs, under avvikling eller tvangsoppløsning. Status «aktiv (Brreg)» betyr at enheten er registrert aktiv i Enhetsregisteret — det er ikke det samme som verifisert operasjonell aktivitet for inneværende sesong.

| Navn | Org.nr. | Region | Status | Kilde | År | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|---|
| Øverland Andelslandbruk SA | 990331847 | Bærum, Akershus | Aktiv | Brreg + egen nettside (2026-andeler til salgs) | 2026 | A | Sterkest bekreftet; 5 ansatte registrert 2026-02; MVA-registrert 2025; sist årsregnskap 2024 |
| Dysterjordet Andelslandbruk SA | 914747996 | Ås, Akershus | Aktiv (Brreg) | Brreg | 2026 | A | Ansatte registrert 2026-02; ingen årsregnskap innsendt |
| Kirkeby Andelslandbruk SA | 997293770 | Oslo (Maridalen) | Aktiv (Brreg) | Brreg | 2024 | A/B | Sist årsregnskap 2024; ansatte registrert 2023; tidligere navn Solbakken Økologiske Samvirkeforetak |
| Tveten Andelsgård SA | 922791368 | Oslo (Bøler) | Aktiv (Brreg) | Brreg | 2025 | A | Sist årsregnskap 2025; ansatte registrert 2024 |
| Linderud Andelsgård SA | 924576774 | Oslo (Groruddalen) | Aktiv (Brreg) | Brreg | 2024 | A | Ansatte registrert 2024; på Linderud gård |
| Husebyjordet Andelslandbruk SA | 915306128 | Lillestrøm, Akershus | Aktiv (Brreg) | Brreg | 2023 | A/B | Ingen årsregnskap; vedtekter oppdatert 2023; ingen ansatte registrert |
| Kirkerud Andelsgård SA | 916323034 | Asker, Akershus | Aktiv (Brreg) | Brreg | 2021 | A/B | Ansatte registrert 2021; ingen nyere signal; vedtekter 2015 |
| Hadeland Andelslandbruk SA | 917148430 | Jevnaker, Viken | Aktiv (Brreg) | Brreg | 2023 | A/B | Vedtekter oppdatert 2023; ingen ansatte registrert |
| Vestern Andelslandbruk SA | 928084604 | Ringerike, Viken | Aktiv (Brreg) | Brreg | 2024 | A/B | Vedtekter oppdatert 2024; ingen årsregnskap |
| Bamble Andelsgård SA | 916876416 | Bamble, Telemark | Aktiv (Brreg) | Brreg | 2024 | A | Ansatte registrert 2024 |
| Bodø Andelslandbruk SA | 911798778 | Bodø, Nordland | Aktiv (Brreg) | Brreg | 2025 | A | Vedtekter oppdatert 2025-02; ingen ansatte registrert |
| Reppe Andelslandbruk SA | 920061869 | Trondheim (Ranheim), Trøndelag | Aktiv (Brreg) | Brreg | 2018 | A/B | Ingen ansatte, ingen årsregnskap; bare grunnregistrering; usikker aktiv sesongdrift |
| Mære Andelslandbruk SA | 917296278 | Steinkjer, Trøndelag | Aktiv (Brreg) | Brreg | 2017 | A/B | Ingen ansatte, ingen årsregnskap; knyttet til Mære landbruksskole |
| Øver-Bakken Andelslandbruk SA | 917539537 | Inderøy, Trøndelag | Aktiv (Brreg) | Brreg | 2016 | A/B | Ingen ansatte, ingen årsregnskap; svakt aktivitetssignal |
| Skjølberg Søndre Andelslandbruk SA | 917201366 | Orkland, Trøndelag | Aktiv (Brreg) | Brreg | 2016 | A/B | Ingen ansatte, ingen årsregnskap; svakt aktivitetssignal |
| Vikhammer Andelsgård SA | 916835973 | Malvik, Trøndelag | Aktiv (Brreg) | Brreg | 2024 | A | Ansatte registrert 2020; årsregnskap 2024 |
| Kristiansand Andelslandbruk SA | 919446749 | Kristiansand, Agder | Aktiv (Brreg) | Brreg | 2023 | A/B | Vedtekter oppdatert 2023; ingen ansatte |
| Moland Andelslandbruk SA | 918122788 | Arendal, Agder | Aktiv (Brreg) | Brreg | 2020 | A/B | Vedtekter 2020; ingen ansatte, ingen årsregnskap |
| Vegårshei Andelslandbruk SA | 931464906 | Vegårshei, Agder | Aktiv (Brreg) | Brreg | 2023 | A/B | Nyetablert 2023; ingen ansatte |
| Vie Andelslandbruk SA | 916688350 | Sunnfjord, Vestland | Aktiv (Brreg) | Brreg | 2025 | A | Vedtekter oppdatert 2025-02; ingen ansatte |
| Ørsta Andelsgard SA | 917650497 | Ørsta, Møre og Romsdal | Aktiv (Brreg) | Brreg | 2018 | A/B | Vedtekter 2018; ingen ansatte; WordPress-side registrert |
| Røst Andelslandbruk SA | 925002925 | Røst, Nordland | Aktiv (Brreg) | Brreg | 2020 | A/B | Etablert 2020; ingen ansatte, ingen årsregnskap; øy-lokalisering |
| Spiren Andelslandbruk SA | 913886100 | Sykkylven, Møre og Romsdal | Usikker | Brreg | 2021 | A/B | Siste årsregnskap 2021 — gap på 3 år; tidl. Velledalen Andelslandbruk; ingen ansatte |
| Anda Andelsgard (Tormod Bø, ENK) | 985253463 | Klepp, Rogaland | Aktiv (Brreg) | Brreg | 2026 | A | Ansatte registrert 2026-06 (nylig); MVA-registrert 2021 |
| Korshavn Andelsgård (Kjølholt, ENK) | 936524508 | Hvaler, Østfold | Aktiv (Brreg) | Brreg | 2025 | A/B | Nyregistrert 2025-11; ingen årsregnskap ennå |
| Kaupang Andelslandbruk (ENK) | 916858620 | Larvik, Vestfold | Usikker | Brreg | 2016 | B | ENK med næringskode snekkerarbeid (43.320) — mulig feilregistrering eller omdanning; ikke MVA-aktiv |

---

## Økoguiden-status

Økoguiden-kartet på `https://okologisknorge.no/oekoguiden/?act=search&categoryId=8467` er den primære samlede kilden for andelslandbruk-oppføringer. Kartet krever JavaScript-kjøring for å laste oppføringene. Alle fetch-forsøk mot kartsiden, liste-siden og API-endepunkter returnerte tomme svar. Antall og navn på gårder i Økoguiden for 2025/2026 er dermed et **epistemic gap** i dette oppdraget.

Caveaten fra oppdraget gjelder: en oppføring i Økoguiden er ikke verifisert aktiv status — Økoguiden er aktør-administrert og oppdateres ved innmelding.

---

## andelslandbruk.no

Domenet www.andelslandbruk.no returnerte tomt svar. Referert til i en bildetekst på okologisknorge.no som kart over andelslandbruk på Østlandet (mulig historisk referanse fra Andelslandbrukprosjektet). Ikke tilgjengelig per 2026-06-28.

---

## Tomme celler

- **Per-gård aktiv status 2025/2026 for ~65–70 gårder:** Økoguiden-lista er ikke tilgjengelig uten JavaScript-kjøring. Bare ~25 gårder er Brreg-identifisert.
- **Antall andelshavere per gård:** Ikke offentlig tilgjengelig. Aggregat (10 000+) er aktør-rapportert fra Øk.Norge.
- **Geografisk fordeling per fylke:** Ikke kartlagt fullstendig. Brreg-utvalget overrepresenterer Østlandet.
- **Gjennomsnittlig andelslagsstørrelse (antall andelshavere):** Ikke kjent per gård.
- **CSA-gårder som opererer uten SA-registrering i Brreg:** Antall ukjent. Mange gårder kan drive CSA som del av ordinær gårdsdrift (ENK) uten eget CSA-foretak.
- **Økoguiden-oppføring per gård:** Hvilke av de 90 som er i Økoguiden vs. kun på Facebook/lokale nettsteder — ikke kartlagt.
- **Debio-sertifiseringsstatus per CSA-gård:** Ikke sjekket. Finnoko.debio.no er JavaScript-drevet.
- **Nedlagte gårder siden 2023:** Ingen nedlegginger identifisert i Brreg, men Brreg-status skiller ikke mellom inaktiv og operasjonell.

---

## Ikke si

- «Det er 90 aktive andelslandbruk i Norge i 2026» som et faktum — dette er Økologisk Norges eget tall, aktør-rapportert, ikke uavhengig verifisert. Si: «Økologisk Norge oppgir 90 aktive andelslandbruk per januar 2026.»
- «Det er 93 aktive andelslandbruk» (fra R13-GAP-005) som oppdatert tall — dette var 2023-tallet. Nå-tallet er 90 iflg. Øk.Norge.
- «Brreg viser at det er [N] andelslandbruk» som totalbilde — Brreg-søket fanger kun enheter med CSA-term i firmanavn, anslagsvis 20–30 % av faktiske andelslandbruk.
- «Økoguiden bekrefter aktiv status» for noen gård — Økoguiden er aktør-administrert og ikke verifisert per sesong.
- «Spiren Andelslandbruk er nedlagt» — siste årsregnskap 2021 er et varselsignal, men ingen formell avvikling er registrert i Brreg.
- «Kaupang Andelslandbruk er et aktivt andelslandbruk» — næringskode snekkerarbeid og manglende MVA-aktivitet gjør status uklar.
- «andelslandbruk.no er ressursnettstedet for sektoren» — nettstedet er ikke tilgjengelig.

---

## Anbefalt gate

**actor-gate** — Begrunnelse: Aggregattallet (90 aktive) er B-klasse (aktør-rapportert). Per-gård-lista for hele sektoren er ikke tilgjengelig uten JavaScript-kjøring av Økoguiden. Brreg-verifiserte enheter (25 identifisert) dekker anslagsvis 25–30 % av total populasjon. Ingen enkelt A-klasse kilde gir komplett per-gård aktiv status. Eventuelle fremstillinger av navngitte enkeltgårder som «aktive» krever individuell verifisering mot gårdens egne kanaler (nettside, sosiale medier, sesongopptak).

## Kontroll 2026-07-02

Kontrollert som actor-gate-flate mot `research/_status/food-tg-r13/actor-gate/R13-AKTOR-002-andelslandbruk-public-validation-2026-06-25.md`. Økologisk Norge-aggregatet og Brreg-utvalget kan brukes som datert kandidatgrunnlag, men ikke som uavhengig komplett aktivtelling. Status etter kontroll: `actor-gate-controlled`; raden er desk-dokumentert, men actor-gaten står til Økologisk Norge/andelslandbruk.no eller enkeltgårdene kan gi publiserbar aktiv 2025/2026-liste med dedupe-regel.

---

## Kilder sjekket

| URL | Kildetype | Kildeklasse | Tilgangsdato |
|---|---|---|---|
| https://okologisknorge.no/vaart-arbeid/andelslandbruk/om-andelslandbruk/ | Organisasjonsside (aktør) | B | 2026-06-28 |
| https://okologisknorge.no/vaart-arbeid/andelslandbruk/ | Organisasjonsside (aktør) | B | 2026-06-28 |
| https://okologisknorge.no/oekoguiden/?act=search&categoryId=8467 | Karttjeneste (aktør, JS-drevet) | B/C | 2026-06-28 |
| https://okologisknorge.no/oekoguiden/liste/?categoryId=8467 | Listetjeneste (aktør, JS-drevet) | B/C | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter?navn=andelslandbruk&size=50 | Offentlig register (primær) | A | 2026-06-28 |
| https://data.brreg.no/enhetsregisteret/api/enheter?navn=andelsgård&size=50 | Offentlig register (primær) | A | 2026-06-28 |
| https://www.overlandel.no | Enkeltgård nettside (aktør) | B | 2026-06-28 |
| https://www.debio.no | Sertifiseringsorgan (primær) | A | 2026-06-28 |
| https://finnoko.debio.no | Produsentregister (JS-drevet) | A/C | 2026-06-28 |
| https://www.andelslandbruk.no | Sektornettverk | C | 2026-06-28 (ikke tilgjengelig) |
| https://okologisknorge.no/umbraco/surface/ecoguide/GetMarkers?categoryIds=8467 | API-endepunkt (ikke tilgjengelig) | C | 2026-06-28 |
| https://okologisknorge.no/vaart-arbeid/andelslandbruk/bli-andelshaver/ | Organisasjonsside | B | 2026-06-28 |
