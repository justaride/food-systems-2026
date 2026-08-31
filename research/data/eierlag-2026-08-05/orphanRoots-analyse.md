# OrphanRoots-analyse — eier- og grunnleggerlag

> Reconciliation status (2026-08-29): preserved as dated internal research. Claims remain subject to current source, locator, rights, and publication gates. Draft requests are unsent; subscription recommendations do not authorize purchase.

Dato: 2026-08-05. Grunnlag: `data/konsern-coverage.json` (generert 2026-07-03) med 18 orphanRoots,
krysset mot `data/vault-export/companies.json`. Metode: åpne kilder (Brønnøysund Enhetsregisteret åpne API,
proff.no fritt browsbare aksjonærsider, aksjegrafen.com, selskapenes egne sider, presse). Ingen DB-skriving.

**Viktig funn om ID-kvalitet:** 7 av 18 orphanRoots har feil eller konstruerte register-ID-er i
coverage-filen. Korrigerte ID-er er verifisert direkte mot registrene (Brreg/PRH/Virk-deriverte tjenester):

| Navn i coverage | ID i coverage | Korrekt ID | Verifisert mot |
|---|---|---|---|
| Kesko Oyj | FI-0110456-8 | **0109862-8** | PRH avoindata API (live-oppslag) |
| SOK (S Group) | FI-0116323-9 | **0116323-1** | PRH avoindata API (live-oppslag, navnesøk) |
| ISS A/S | DK-28316745 | **28504799** | cvrapi.dk / proff.dk |
| NorgesGruppen Eiendom Holding AS | NO-961483584-EIEH | **997747054** | Brreg enhetsregisteret |
| Joh Johannson Invest AS | NO-JJ-INV | **918293477** | Brreg enhetsregisteret |
| REITAN AS | NO-REITAN-HOLD | **912609987** | Brreg enhetsregisteret |
| Cheffelo AB | SE-CHEFFELO | **559021-1263** | cheffelo.com (IR-side) |
| Avisomo AS | NO-AVISOMO | **920937659** | Brreg enhetsregisteret |

(961483584 ga null treff i Enhetsregisteret — nummeret i coverage er konstruert/feil.)

---

## Norske rotter

### 1. Kavli Holding AS — orgnr 913344162
- **Kontrollerende eier:** O. Kavli og Knut Kavlis Allmennyttige Fond (Kavlifondet / Kavli Trust),
  orgnr **938503583**, organisasjonsform STI (stiftelse) — verifisert i Enhetsregisteret. Fondet eier 100 % av
  Kavli Holding AS. Kilder: [Q-Meieriene/NTB-pressemelding](https://kommunikasjon.ntb.no/pressemelding/18047106/nyheter-fra-q-meieriene-og-skyrr?publisherId=89709&lang=no)
  («Kavli Holding AS … eies 100% av O. Kavli og Knut Kavlis Almennyttige Fond»),
  [kavlifondet.no](https://www.kavlifondet.no/en/news/kavli-trust-s-60th-anniversary-a-trust-is-born),
  [proff.no – fondet](https://www.proff.no/selskap/o-kavli-og-knut-kavlis-allmennyttige-fond/nesttun/fondlegat/IFIRDZZ10NC).
- **Forslag til festepunkt:** Ekte frittstående rot — stiftelseseid, ingen person-/familieeier over.
  Modelleres som egen type rotnode: `stiftelse` (Kavlifondet) → Kavli Holding AS → Q-Meieriene m.fl.
- **Gjenstående verifisering:** Stiftelsesregisteret (brreg.no/stiftelse) for fondets vedtekter/styre;
  aksjonærregisteruttrekk for formell 100 %-bekreftelse. Proffs aksjonærside for Kavli Holding var betalingsmur­et.

### 2. Odd Reitan Private Holding AS — orgnr 915990487
- **Kontrollerende eier:** Odd Reitan (f. 1951, Trondheim) personlig, **100 %**.
  Kilde: [proff.no aksjonærer](https://www.proff.no/aksjon%C3%A6rer/-/odd-reitan-private-holding-as/915990487).
- Selskapet eier 33,329 % av A-aksjene i Reitan AS og 17,8 % av Reitan Eiendom AS (samme kilde, aksjeposter).
- **Forslag til festepunkt:** Personlig holdingselskap over **REITAN AS** (én av tre like eiere, se pkt. 9).
- **Gjenstående verifisering:** Ingen vesentlig — proff-visningen er Skatteetaten-sourcet.

### 3. Felleskjøpet Rogaland Agder SA — orgnr 915442552
- **Kontrollerende eier:** Samvirkeforetak (SA) eid av **ca. 7 000–8 000 bondemedlemmer**.
  Kilder: [fkra.no om oss](https://www.fkra.no/side/om-oss/about-us-english) («owned by 7000 farmers»),
  [mynewsdesk/FKRA](https://www.mynewsdesk.com/no/fkra) («eid av 8000 bønder»). Brreg: org.form SA, 576 ansatte.
- **Forslag til festepunkt:** Frittstående samvirkerot, som Felleskjøpet Agri og FK Nordmøre og Romsdal —
  tre uavhengige lag under samme Felleskjøpet-merke (jf. [coop.fandom-oversikt](https://coop.fandom.com/wiki/Felleskj%C3%B8pet)).
- **Gjenstående verifisering:** Eksakt medlemstall fra siste årsmelding.

### 4. Kverva AS — orgnr 919818824
- **Kontrollerende eier:** Kvarv AS (orgnr 914719828) eier **92,313 %** av A-aksjene i Kverva AS
  ([proff.no aksjonærer](https://www.proff.no/aksjon%C3%A6rer/-/kverva-as/919818824)). Kvarv AS eies igjen
  **97 % av Gustav Magnar Witzøe** ([proff.no Kvarv](https://www.proff.no/aksjon%C3%A6rer/-/kvarv-as/914719828),
  [mn24.no](https://www.mn24.no/adresseavisen/n/L4jqE9/tar-halv-milliard-i-utbytte),
  [iLaks](https://ilaks.no/witzoes-eierselskap-med-milliardbyks-og-nytt-styremedlem/)).
  Kverva AS eier ~45 % av SalMar ASA (via Kverva, jf. iLaks).
- **Forslag til festepunkt:** Festes **over SalMar-treet**: Gustav Magnar Witzøe → Kvarv AS → Kverva AS → SalMar ASA.
  Coverage oppgir i dag «Gustav Witzøe 41,3 %» som controllingOwner for SalMar — bør oppdateres til kjede via Kverva/Kvarv
  (far Gustav Witzøe kontrollerer fortsatt selskapene ifølge mn24, men aksjemajoriteten er overført til sønnen).
- **Gjenstående verifisering:** Eksakt SalMar-andel per siste årsrapport; aksjonærregisteret for Kvarv-kjeden.

### 5. Laco AS — orgnr 937305354
- **Kontrollerende eier:** Møgster-familien via familieselskaper. Proff viser bl.a. **OR Møgster AS 40 %** og
  **Lafjord AS** (24 000 aksjer) som eiere ([proff.no aksjonærer](https://www.proff.no/aksjon%C3%A6rer/-/laco-as/937305354));
  Helge Møgster eier Laco sammen med sine fire barn ([iLaks](https://ilaks.no/kronar-for-mogster/)).
  Laco eier **55,548 % av Austevoll Seafood ASA** (proff, aksjeposter).
- **Forslag til festepunkt:** Festes **over Austevoll-treet**: Møgster-familieholdings → Laco AS → Austevoll Seafood ASA
  (→ Lerøy 52,7 %). Coverage sier allerede «Laco AS (Møgster-familien) 52,7 %» for Austevoll — kjeden over mangler.
- **Gjenstående verifisering:** Full eierliste for Laco (proff-siden viser delvis; aksjonærregisteret gir komplett bilde
  inkl. barnas holdingselskaper).

### 6. Compass Group Norge AS — orgnr 952507729
- **Kontrollerende eier:** Compass Group PLC (UK) — norsk heleid datterselskap i Compass-konsernet.
  Kilde: [Konkurransetilsynet, fusjonsvedtak Compass Group Norge AS / 4Service (2024)](https://konkurransetilsynet.no/wp-content/uploads/2024/12/2024_633-1-OFF-Compass-Group-Norge-AS-4Service-Gruppen-AS.pdf)
  (dokumenterer konserntilhørighet og heleide datterselskaper). Brreg: 4 667 ansatte, erIKonsern=true.
- **Forslag til festepunkt:** Festes under **ekstern rot Compass Group PLC (London-børs)** — konserntoppen ligger
  utenfor nordisk datasett; marker som «utenlandsk kontrollert» i maktkartet.
- **Gjenstående verifisering:** Mellomliggende holdingselskap (sannsynligvis Compass Group International B.V. e.l.)
  — hentes fra selskapets årsrapport note om konsern.

### 7. NorgesGruppen Eiendom Holding AS — orgnr 997747054 (coverage-ID feil)
- **Kontrollerende eier:** **NorgesGruppen ASA 100 %** ([proff.no aksjonærer](https://www.proff.no/aksjon%C3%A6rer/-/norgesgruppen-eiendom-holding-as/997747054)).
  Eier bl.a. NorgesGruppen Eiendom AS og Norgesgruppen Øst AS 100 %.
- **Forslag til festepunkt:** Rent datterselskap — festes direkte under **NorgesGruppen-treet**. Ikke en orphan.
- **Gjenstående verifisering:** Ingen.

### 8. Joh Johannson Invest AS — orgnr 918293477 (coverage hadde pseudo-ID)
- **Kontrollerende eier:** Johannson-familiens investeringsselskap. Proffs aksjonærside viser de fire
  barnebarns-holdingselskapene med like store poster: **POJ Invest AS, KSJOH Invest AS, KEJOH Invest AS og FHJ Invest AS**
  (hver 14,614 % B-aksjer + 8,908 % C-aksjer), samt Jojoha Invest AS og Joh Holding AS
  ([proff.no aksjonærer](https://www.proff.no/aksjon%C3%A6rer/-/joh-johannson-invest-as/918293477)).
  Selskapet «investerer i eiendom, aksjer og obligasjoner» ([joh.no](https://joh.no/)).
- **Forslag til festepunkt:** Søsken-node til Joh. Johannson Holding AS under familienoden **«Joh. Johannson-familien»**
  som allerede er controllingOwner i NorgesGruppen-treet (74,4 %, jf. [Finansavisen](https://www.finansavisen.no/person/1039/johan-johannson)).
- **Gjenstående verifisering:** Topp av proff-tabellen (A-aksjer/stemmeflertall) var avkuttet — hent full tabell
  eller aksjonærregisteruttrekk; presiser slektskjema (5. generasjon Johannson).

### 9. REITAN AS — orgnr 912609987 (coverage hadde pseudo-ID)
- **Kontrollerende eiere:** Tre like tredjedeler per 31.12.2025:
  **ORR Invest AS 33,3 %** (Ole Robert Reitan), **MVK Capital AS 33,3 %** (Magnus Reitan — 99 % overført til barna
  Kristoffer og Viktoria, jf. [Adressa](https://www.adressa.no/okonomi/i/rr5Mv3/reitan-familien-oekte-utbyttene)),
  **Odd Reitan Private Holding AS 33,3 %** (Odd Reitan). Kilde: [aksjegrafen.com](https://aksjegrafen.com/selskap/912609987),
  bekreftet av [proff](https://www.proff.no/aksjon%C3%A6rer/-/reitan-as/912609987) og [DN](https://www.dn.no/marked/magnus-reitan/reitan/resultater/reitan-arvinger-over-to-milliarder-igjen/2-1-1665623) («en tredjedel hver»).
  Brreg /roller: daglig leder Odd Reitan; styre: Odd, Ole Robert, Magnus, Kristin Genton, Sunniva Reitan.
- Reitan AS eier **Reitan Retail AS 100 %** (proff, aksjeposter).
- **Forslag til festepunkt:** REITAN AS er **den sanne roten over Reitan Retail-treet** — fest treet hit, og legg
  de tre eierholdingselskapene (ORPH allerede orphan) over som person-/familieeierlag.
- **Gjenstående verifisering:** MVK Capitals interne eierskap etter overføringen til Kristoffer/Viktoria (sveitsisk bosted).

### 10. Avisomo AS — orgnr 920937659 (coverage hadde pseudo-ID)
- **Kontrollerende eier:** Ingen. Gründer-/investoreid vertikal-farming-startup: Martin Molenaar 22,3 %,
  Adler Konsult II AS 19,9 %, Jo André Flåseth 18,2 %, egne B-aksjer 16,1 %, Komm-In AS 10,8 % m.fl.
  ([proff.no aksjonærer](https://www.proff.no/aksjon%C3%A6rer/-/avisomo-as/920937659)).
- **Forslag til festepunkt:** Frittstående rot (gründer/investor-spredt).
- **Gjenstående verifisering:** Hvem som står bak Adler Konsult II og Komm-In (sannsynligvis gründernes egne selskaper).

## Utenlandske/nordiske rotter

### 11. ICA Gruppen AB — SE 556048-2837
- **Kontrollerende eier:** **ICA-handlarnas Förbund ~85–87 %**, AMF ~13 %. Tatt av børs 2022 etter
  oppkjøpsbud fra IHF+AMF. Kilder: [icahandlarna.se/om-forbundet](https://www.icahandlarna.se/om-forbundet/)
  («majoritetsägare … 87 procent. AMF äger 13 procent»),
  [IHF årsredovisning 2024](https://www.icahandlarna.se/nyheter/2025/ica-handlarnas-forbunds-arsredovisning-2024/) («drygt 85 procent»),
  [Cision-budmelding 2021](https://news.cision.com/se/murgrona-holding-ab--publ-/r/ica-handlarnas-forbund-tillsammans-med-amf-lamnar-ett-rekommenderat-offentligt-uppkopserbjudande-til,c3450072) (da 54 %).
- **Forslag til festepunkt:** Frittstående rot med eier-type «handlarnas förening (ideell förening)» + AMF.
- **Verifisering:** Eksakt fordeling 85/87 % per siste årsredovisning.

### 12. SOK / S Group — FI 0116323-1 (ID korrigert)
- **Kontrollerende eier:** SOK eies av **S-gruppens regionale samvirkelag (~19)**, som igjen eies av
  kundeeierne (medlemmene). Kilder: [RELEX kundecase](https://www.relexsolutions.com/customers/sok/),
  [Coop Trading](https://www.cooptrading.com/who-we-are/our-partners/), [lobbyfacts](https://www.lobbyfacts.eu/datacard/sok?rid=201839244725-10).
- **Forslag til festepunkt:** Frittstående samvirkerot (norsk Coop-analog).
- **Verifisering:** Liste over regionale lag med stemmevekt fra SOKs årsrapport.

### 13. Kesko Oyj — FI 0109862-8 (ID korrigert)
- **Kontrollerende eier:** Ingen enkelteier. Største: **K-kauppiasliitto ry (K-Kauppiasliitto) 17,54 %** av aksjene,
  Ilmarinen ~10,8 %, BlackRock, Varma m.fl. Kilder: [MarketScreener](https://www.marketscreener.com/quote/stock/KESKO-OYJ-111962277/company-shareholders/),
  [Kesko: nomineringskomité 2024](https://www.kesko.fi/en/media/news-and-releases/stock-exchange-releases/2024/composition-of-keskos-shareholders-nomination-committee2/)
  (to største stemmeberettigede: K-Retailers' Association og Ilmarinen). Merk A/B-aksjestruktur gir
  kjøpmannsorganisasjonen uforholdsmessig stor stemmemakt.
- **Forslag til festepunkt:** Børsnotert frittstående rot; K-kauppiasliitto som «ankeraksjonær».
- **Verifisering:** Stemmeandel (ikke bare kapitalandel) fra Kesko IR-sider.

### 14. Hagar hf — IS 670203-2120
- **Kontrollerende eier:** Ingen. Børsnotert (Nasdaq Iceland); største eiere er pensjonsfond:
  Lífeyrissjóður starfsmanna ríkisins 13,34 %, Lífeyrissjóður verzlunarmanna 11,69 % m.fl.;
  topp 10 eier 77,7 %. Kilder: [MarketScreener](https://www.marketscreener.com/quote/stock/HAGAR-HF-30049613/company/),
  [Hagar Q3 2024/25](https://docs.publicnow.com/viewDoc.aspx?filename=137623%5CEXT%5CDFF77A5779A4CCEB1CC17B5B47EF124C2F26A742_91E2B147ACFAD3A502DA5C35DD4B6BC1D5B34E9C.PDF).
- **Forslag til festepunkt:** Børsnotert frittstående rot.

### 15. Festi hf — IS 540206-2010
- **Kontrollerende eier:** Ingen — svært spredt: Stapi lífeyrissjóður 4,7 %, Birta 3,9 %; 1 142 eiere.
  Kilder: [MarketScreener](https://www.marketscreener.com/quote/stock/FESTI-HF-30049631/company-shareholders/),
  [festi.is hluthafaupplýsingar](https://www.festi.is/en/hluthafaupplysingar).
- **Forslag til festepunkt:** Børsnotert frittstående rot (Krónan, N1, ELKO, Lyfja).

### 16. ISS A/S — DK 28504799 (ID korrigert)
- **Kontrollerende eier:** Ingen. Største enkelteier: **Lind Value II ApS ~10 %** (2024);
  **KIRKBI Invest** solgte seg ned til ~4,1 % (feb 2025). Kilder:
  [Nasdaq major shareholder-melding](https://view.news.eu.nasdaq.com/view?id=b471007c7b9e433dd4957025d31a2b7ac&lang=en&src=listed),
  [KIRKBI-presse](https://www.kirkbi.com/press-releases/2025/kirkbi-s-successful-disposal-of-approximately-50-of-iss-as/),
  [companydata.dk](https://companydata.dk/da/virksomhed/28504799-iss-a-s).
- **Forslag til festepunkt:** Børsnotert frittstående rot. ISS er kantine-/facility-aktør, ikke kjerne matsystem —
  vurder om den i det hele skal ha eget tre.

### 17. Cheffelo AB — SE 559021-1263 (ID korrigert)
- **Kontrollerende eier:** Ingen. Børsnotert Nasdaq First North Premier (tidligere LMK Group);
  blant større eiere: gründer Klaus Nørgaard, Erik Bergman. Kilde: [Simply Wall St ownership](https://simplywall.st/stocks/se/food-beverage-tobacco/sto-chef/cheffelo-shares/ownership),
  [cheffelo.com](https://cheffelo.com/en/about-cheffelo/).
- **Forslag til festepunkt:** Børsnotert frittstående rot.
- **Verifisering:** Topp-10 fra siste årsredovisning (cheffelo.com IR).

### 18. Axel Johnson AB — SE 556223-6959
- **Kontrollerende eier:** **Familien Axel Johnson** (Antonia Ax:son Johnson med familie; 4./5. generasjon —
  Caroline Berg er styreleder). Kilder: [axinter.com/our-owner](https://www.axinter.com/our-owner/)
  («owned by Antonia Ax Johnson and her family»), [axfast.se](https://axfast.se/arsrapport/2017/axel-johnson-gruppen),
  [axfoundation.se](https://www.axfoundation.se/en/staff/antonia-axson-johnson).
- **Forslag til festepunkt:** Familieeid frittstående rot — den svenske matmakt-noden (Axfood ~50 %,
  Martin & Servera, KICKS m.fl.). Må inn som egen familiegren.
- **Verifisering:** Eierandel i Axfood AB per siste årsredovisning; om eierskapet går via Axel Johnson Holding AB.

---

## Oppsummering: foreslåtte festepunkter

| Orphan | Type | Festepunkt |
|---|---|---|
| Kavli Holding | Stiftelseseid | Egen rot under Kavlifondet (STI 938503583) |
| ICA Gruppen | Handlersammenslutning + AMF | Frittstående rot |
| SOK | Samvirke (regionale lag) | Frittstående rot |
| Kesko | Børs, K-kauppiasliitto anker | Frittstående rot |
| Hagar | Børs, pensjonsfond | Frittstående rot |
| Festi | Børs, spredt | Frittstående rot |
| Odd Reitan Private Holding | Personlig holding | Over REITAN AS |
| Felleskjøpet Rogaland Agder | Samvirke | Frittstående rot |
| Kverva AS | Familieholding (Witzøe) | Over SalMar-treet |
| Laco AS | Familieholding (Møgster) | Over Austevoll-treet |
| Compass Group Norge | Utenlandsk datterselskap | Under Compass Group PLC (ekstern) |
| ISS A/S | Børs, ingen kontroll | Frittstående rot (vurder relevans) |
| NorgesGruppen Eiendom Holding | 100 % datterselskap | Under NorgesGruppen-treet |
| Joh Johannson Invest | Familieholding | Søsken under Johannson-familien |
| REITAN AS | Familie (3 tredjedeler) | Rot over Reitan Retail-treet |
| Cheffelo | Børs, gründere | Frittstående rot |
| Avisomo | Gründer/investor-spredt | Frittstående rot |
| Axel Johnson AB | Familie | Frittstående familierot |

## Gjenværende verifisering (samlet)
1. **Skatteetatens aksjonærregister** for de norske AS-ene: Kavli Holding (100 % fond), Laco (familiefordeling),
   Kverva/Kvarv, Joh Johannson Invest (A-aksjer/stemmer), Reitan AS (tredjedeler etter 31.12.2025), Avisomo.
   Se `utkast-innsyn-aksjonarregister.md`.
2. Stiftelsesregisteret: Kavlifondets vedtekter og styre (innsyn via brreg.no/stiftelse).
3. Årsrapporter 2024/2025 for: ICA (IHF/AMF-fordeling), Kesko (stemmeandeler), Cheffelo (topp 10),
   Axel Johnson (Axfood-andel), Compass Group Norge (mellomholding).
4. SA-ene (FKRA): medlemstall fra årsmelding — aksjonærregisteret dekker ikke samvirke.
