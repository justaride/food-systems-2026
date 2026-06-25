---
tittel: Food TG — Research runde 4: dybdekampanje (iscenesatt prompt-pakke)
status: Aktiv intern arbeidsordre (utkast v0.1)
eier: Gabriel
dato: 2026-06-18
scope: >
  Iscenesatt research-kampanje som svarer på dybdeauditen 18.06: løft kunnskaps- og innsiktslaget på JTs fokusfelt fra «solid» mot «dypt», avdekk nye aspekter og kryss-koblinger, og dokumentér de epistemiske fraværene som funn. Bevisst frikoblet fra valideringslaget: kampanjen styrkes IKKE av å vente på aktørsvar — den jobber det desk-/primærkildebare rommet maksimalt, og lar aktørgatene (type B) ligge der de ligger.
bruksregel: >
  Ingen claim åpnes av denne filen. Datasøk-output går gjennom samme kontrollstack som all annen Deep Research (mottakslogg → SRC/PCQ → claim-lock → casestatus). Forståelsesprompt-output merkes «forståelse — ikke faktastemme» og importeres ALDRI som fakta. Alt her er desk/primærkilde — ingen aktørkontakt. Wageningen-guardrail (Møte 9) gjelder: WUR-score/Moerman brukes aldri som nordisk bevis. Kampanjen forutsetter at overclaim-P0 fra auditen (§0) ryddes parallelt, så batchene bygger på en fersk base.
relaterte_filer:
  - docs/project/analysis/food-tg-dybdeaudit-jt-fokusfelt-2026-06-18.md
  - docs/project/mandates/food-tg-research-runde2-promptpack-2026-06-16.md
  - docs/project/mandates/food-tg-deep-research-prompter-runde3-KLARE-2026-06-16.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - research/CITABLE-KNOWLEDGE-BASE-STATUS.md
  - src/lib/data/casestatus.ts
---

# Research runde 4 — dybdekampanje

## 1. Hva jeg tenker (anbefaling først)

Dybdeauditen 18.06 fant at dekningen er bimodal: noen få felt er genuint dype, flertallet er «solide orienteringer» — gode tall, men sekundærkilde-tunge og uten den primærverifikasjonen som gjør de dype feltene siterbare. Den fant også at den gjenstående avstanden deler seg i tre — reelle skrivebordshull (A), bevisst gatede aktørspørsmål (B), og epistemisk umulige tall (C) — og at **bare A-laget er «ikke dekket så godt som mulig ennå».**

Denne kampanjen jobber A-laget systematisk og lar B-laget ligge. Det er hele poenget med frikoblingen du ba om: valideringslaget (vent-på-aktør) skal ikke sette taket for research-ambisjonen. Tre føringer ligger under:

**(1) Volum gir bare verdi når det er arkitekturert.** 25–30 spissede prompts er kraftig — men 25–30 brede søk er støy («alt blir like viktig», som 09.06 advarte mot). Derfor er hver prompt i §4 knyttet til et *navngitt åpent aspekt* fra auditen, med kildemål og et konkret spørsmål den skal svare ut. Antallet følger av aspektene, ikke omvendt.

**(2) Primærkilde-først, ellers senker vi snittet.** Prosjektets styrke er primær + claim-lock. Prompts som drar inn mer sekundær/NGO-materiale (typisk Vest-Afrika) styrker *ikke* underlaget — de hoper opp anslag vi ikke kan låse. Hver datasøk-prompt krever derfor primærkilde eller datasett, og rapporterer tomme celler eksplisitt.

**(3) Skill «dypere innsikt» fra «citerbar påstand».** Kampanjen løfter kunnskapslaget mye. Den gjør ikke i seg selv gatede påstander eksternt siterbare — det krever fortsatt primær re-pull eller aktørsvar. Begge lag er verdifulle; ikke forveksle dem i mottak.

**Iscenesettelsen du ba om:** kampanjen er fem batcher. Mellom hver batch er det et **prosesseringssteg** (mottak → claim-lock → ferskhets-avstemming mot casestatus) og et **oppfølgingsvedtak** (løft status / eskalér til aktørgate / lukk som dokumentert fravær). Ikke kjør alt på én gang — batch, prosessér, lær, juster neste batch.

---

## 2. Prinsipper og to-lags modell (uendret fra runde 2/3)

**Lag A — Forståelsesprompt:** orientering, ikke faktastemme. Lagres `research/forstaelse/`, merkes, importeres aldri som fakta. Brukes der et felt trenger bedre mental modell før datajakt (her: kryss-koblings-batchen §4.3 og governance-feltet).

**Lag B — Datasøk-prompt:** masterprompt v1 + datamodus-tillegg + selve prompten. Output → `research/external/r4/deep-research-r4-<id>-YYYY-MM-DD.md` → valideringsprompt → mottak → SRC/PCQ → claim-lock → casestatus. ID-serie `DRO-R4-<id>` så runde 4 ikke blandes med R2/R3/0906.

**Tre hull-typer styrer hva en prompt kan oppnå** (fra auditen): **A** = tettbar nå (kampanjens hovedmål) · **B** = aktørgate (kampanjen rører den ikke; markeres for DASK/AASK) · **C** = epistemisk umulig (kampanjen *dokumenterer fraværet*, batch 5).

---

## 0. Forprosessering (parallell rydding — IKKE prompts, men forutsetning)

Auditens overclaim-register (§6) må ryddes før/parallelt, ellers bygger batchene på en utdatert base. Disse er edits i datafilen, ikke research:

- **P0a** Korriger kaffe-formuleringen «innlemmet i den norske EUDR-gjennomføringen» (casestatus.ts l.70) → «EØS-relevant, gjennomføring pågår» (Lbdir 05.05.2026).
- **P0b** Frisk opp soya/fôr-figurene: erstatt «94 % Brasil (2015-data)» med det ferske SSB-08801-tallet (Brasil 69,8 %, 2024 revidert).
- **P0c** Merk `research/bibliotek/sirkularitet/sirkularitet-dyp.md` (mars) som «superseded — potensial/modellert; se runde 2/3 for realiserte tall».
- **P0d** Synkroniser bacalhau-status oppover (SSB-serien finnes; `deep-research-r2-01` sier fortsatt needs-primary-check).

> Disse kan gjøres som én liten commit før batch 1. De er ikke en del av prompt-budsjettet.

---

## 3. Kampanjens form — fem batcher

| Batch | Tema | Type | Hva den løfter | Gate |
|---|---|---|---|---|
| **1** | Fordype primær | Datasøk | Allerede-spesifiserte, uutførte prompts → løfter Solid-felt mot Dyp | Ingen — start nå |
| **2** | Nye aspekter | Datasøk (+ forståelse der nytt) | Aspekter vi aldri har rørt | Etter batch 1-prosessering |
| **3** | Kryss-koblinger / andreordens innsikt | Forståelse → analyse | Sammenhenger på tvers av felt (der den reelle *innsikten* sitter) | Etter batch 2 |
| **4** | Nordisk komparativ | Datasøk | Tetter granularitetshullene per land | Parallelt m/ batch 2–3 |
| **5** | Dokumentér fraværet | Notat | Gjør type-C-hull til funn, ikke opplevd mangel | Etter batchene som rører hvert felt |

Regel: én kjøring per Deep Research-tråd; forståelse og datasøk blandes aldri.

---

## 4. Prompts per batch

> Format per prompt: **ID · felt · hull-type · svarer ut.** Datasøk-prompts kjøres med masterprompt v1 + datamodus foran. Alle krever leveranseformat: datatabell (metrikk | verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet) + kildeledger, og «rapportér tomme celler eksplisitt».

### 4.1 BATCH 1 — Fordype primær (løft Solid → Dyp)

**D4-01 · Valio finsk forbruks-/importstatistikk · A · «hva er den faktiske finske fôrproteinmiksen, fra offentlig statistikk?»**
```text
Hent finsk offentlig statistikk for fôrråvare-forbruk og -import som omgir Valio-caset. Mål: erstatte Comtrade-preview med primær finsk kilde. (a) Ruokavirasto fôrstatistikk: innenlandsk produksjon og bruk av rapsmel, soyamel, fôrproteiner (tonn/år, nyeste 3 år). (b) Tulli/Uljas importserie HS 2304/230641 (soyamel, rapsmel) for Finland, opprinnelsesland. (c) Luke/NESA selvforsyningstall for supplerende planteprotein — metode bak 15 %/~20 %-tallene. Skill «soyafri» fra «importfri». Kilder: ruokavirasto.fi, uljas.tulli.fi, luke.fi.
```

**D4-02 · Valio SE/DK soyafri-symmetri · A · «er soyafri melkefôr et finsk særtilfelle eller nordisk mønster?»**
```text
Kartlegg om Sverige og Danmark har tilsvarende soyafri/avskogingsfri fôr-governance i melkekjeden som finske Valio (fra 1.3.2018). Søk primærkilder: Arla (SE/DK) soya-/fôrpolicy med dokumentert omfang og ikrafttid; svensk Arla/Skånemejerier; danske meierivedtak. Skill vedtatt policy fra intensjon, og «soyafri» fra «importfri». Lever sammenligningstabell NO-irrelevant/FI/SE/DK med vedtaksdato, scope og kildeeier.
```

**D4-03 · Kaffe importserie (autorisert SSB-08801) · A · «hva er Brasil-andelen av norsk kaffeimport på primærnivå, ikke Comtrade-preview?»**
```text
Kjør autorisert SSB-uttrekk (statbank 08801 / UTV) for norsk import av råkaffe HS 0901 (0901.11/0901.21), tidsserie 2015–nyeste, mengde (kg) + verdi (NOK) per opprinnelsesland, med Brasil-andel. Speil mot Comtrade og NKI-tabell (kryssverifikasjon som soya/bacalhau fikk). Dette løfter kaffe-importleddet fra preview til primær. Rapportér enhetspris-serien og prisøkningen separat.
```

**D4-04 · Marint restråstoff fraksjon-til-marked + metodebro · A · «hva er den faktiske verdifordelingen, og holder Island–Norge-sammenligningen metodisk?»**
```text
(P-FISH-1) Hent norsk eksportstatistikk per varenummer for marine biprodukt-fraksjoner (mel, olje, hydrolysat, ensilasje) — SSB/Sjømatrådet per HS-kode, volum + pris, nyeste 3 år, for å tallfeste høyverdi- vs. lavverdiandelen som i dag bare er kvalitativt «lite». (P-FISH-2) Hent og les fulltekst Strand et al. 2024 (Resources, Environment and Sustainability 16:100157) for å validere metodebroen Island↔Norge. Skill «utnyttet» fra «høyverdiutnyttet» eksplisitt.
```

**D4-05 · Island mineralgjødsel N/P/K 2024 · A · «fyller siste hull i den nordiske gjødseltabellen»**
```text
Hent islandsk mineralgjødselforbruk/-import N/P/K 2024 fra Hagstofa Íslands (PxWeb — bruk POST-kapabelt uttrekk; ferdig spørring ligger i r3-01-island-gjodsel). Avklar basis (element vs. P2O5/K2O) mot Hagstofa-årbok-konflikten. Lever på element-basis sammenlignbart med NO/SE/DK/FI-tallene fra runde 2.
```

**D4-06 · Spillvarme normalisert energi/areal + NVE-hjemmel · A · «kan spillvarme-til-mat normaliseres og overføres, og hva er den regulatoriske driveren?»**
```text
(P-VARME-2) Hent normaliserte nøkkeltall for veksthus-varmebehov og spillvarme-utnyttelse: kWh/m²/år for nordisk veksthusdrift (NIBIO/SINTEF/Gartnerhallen), GWh/tonn for relevante kulturer, og en overførbarhetsvurdering Frövi→norsk kontekst. (P-VARME-3) Dokumentér NVE-kravets hjemmel: paragraf/forskrift for kost-nytteanalyse for datasentre >2 MW (i kraft 01.04.2025), og faktisk praksis. Primærkilder: NVE, NIBIO, regelverk.
```

**D4-07 · Offentlig innkjøp — strukturell test · A · «går norske offentlige matkontrakter gjennom de samme integrerte grossistene?»**
```text
(Elevér P-DIST-2.) Hent: (a) norsk offentlig matinnkjøpsvolum i kroner/år (DFØ/SSB/KS), (b) faktiske rammeavtaleleverandører for offentlige storkjøkken (Doffin-eksempler — hvem vinner; er det ASKO/Servicegrossistene?), (c) København-mekanismen tallfestet (øko-andel over tid, virkemiddel = menyomlegging vs. budsjett, Københavns Madhus), (d) hva som juridisk er mulig under norsk/EØS-anskaffelsesrett (lokalmat-/klimakrav). Skill EU-rett, dansk praksis og norsk hjemmel.
```

**D4-08 · Skottland aktualitet · A (forventet C-funn) · «finnes nyere biproduktkvantifisering enn 2019?»**
```text
(P-SKOT-1) Søk om det finnes nyere skotsk sjømat-biproduktkvantifisering enn ZWS/Enscape 2019-survey: Marine Directorate Fish Farm Production Survey (nyeste), SEPA avfallsdata, Seafood Scotland/Scottish Ocean Cluster prosjektarkiv. Hvis ingen nyere finnes: rapportér det eksplisitt som funn («2019 forblir eneste kvantifisering») — det er et resultat, ikke en blank.
```

**D4-09 · Soya SPC-rens + 1201-splitt · A/C · «hva er det faktiske soyaproteinkonsentrat-volumet, renskåret fra HS 2304?»**
```text
(a) Rens SPC-koden: hvordan skiller HS 2304 (soyamel/-kake) seg fra soyaproteinkonsentrat (SPC) i tollnomenklaturen; finnes egen kode/definisjon (USDA FAS / Skretting / Denofa metode)? (b) Forsøk Landbruksdirektoratets råvare-workbook (1201/Protein-arket) for fôr/husdyr/mat-splitten av soyaimport. Rapportér eksplisitt hvis samlet offentlig splitt ikke finnes (sannsynlig C).
```

### 4.2 BATCH 2 — Nye aspekter (ikke rørt før)

**D4-10 · Soya↔bacalhau koblingskilde · A→C · «finnes det en primærkilde som kobler fôravhengighet og bacalhau-eksport i samme analyse?»**
```text
Søk eksplisitt etter primær-/forskningskilde som analyserer Norge–Brasil-aksen som to motstrømmer (soya/fôr inn + klippfisk ut) i samme arbeid. Hvis ingen finnes (auditen indikerer det), skriv et kort «koblingskilde ikke funnet»-memo som dokumentert negativt funn — det er selv en innsikt (vi eier syntesen). Ikke fabrikkér koblingen; dokumentér fraværet.
```

**D4-11 · ILUC / avskoging Brasil-soya til norsk fôr · A/C · «kan den indirekte landskapseffekten tallfestes?»**
```text
Forsøk å tallfeste indirekte arealbruksendring (ILUC) og avskogingseksponering for brasiliansk soya til norsk fôr. Primær-/datasettkilder: Trase.earth (Brasil soy supply chain), MapBiomas, EU-JRC, ProTerra-dokumentasjon. Skill «100 % avskogingsfri SPC (sertifisert)» fra «ILUC-/systemrisiko vedvarer». Lever det som kan tallfestes; merk eksplisitt hva som forblir kvalitativt.
```

**D4-12 · Governance flernivå-ansvarsmatrise (NO) · A · «hvem eier norsk matsikkerhetspolitikk på tvers av kommune/fylke/stat?»** (forståelse + datasøk)
```text
Bygg en norsk ansvars-/eierskapsmatrise for matsikkerhet og -beredskap per forvaltningsnivå: stat (Mattilsynet, Landbruksdir., DSB, Helsedir., NFD, LMD), fylkeskommune (regional matpolitikk, beredskap), kommune (reguleringsplaner, offentlige innkjøp, kantinedrift, Merkur). Per nivå: hjemmel, ansvar, virkemiddel. Primærkilder: regjeringen.no, lovdata, DSB, Stortingsmelding totalberedskap (jan. 2025). Dette tetter et reelt hull JT løftet.
```

**D4-13 · HORECA ASKO-andel + innkjøpsfellesskap · A · «kan ASKO ~70 % verifiseres uavhengig, og hvordan virker lock-in?»**
```text
(a) Forsøk uavhengig verifikasjon av ASKO Serverings andel av storhusholdnings-grossistmarkedet (~70 % per egen nettside) — Konkurransetilsynet, Virke, bransjeanalyser. (b) Kartlegg innkjøpsfellesskapene (GRESS, DLVRY, Servicegrossistene) og lock-in-mekanismen i rammeavtalene. Merk eksplisitt hvis 70 %-tallet ikke kan bekreftes mot uavhengig kilde (da ned fra «fakta» til «aktørrapportert»).
```

**D4-14 · Kaffegrut massestrøm (NO) · A · «hvor stor er den norske kaffegrut-strømmen, og gjenbrukes den?»**
```text
Tallfest norsk kaffegrut som sidestrøm: estimert volum (fra forbruk/import), innsamlings-/gjenbruksaktører (Gruten m.fl.), og faktiske bruksveier (biogass, dyrkingssubstrat, ekstrakt). Primær-/aktørrapportkilder. Skill estimert massestrøm fra dokumentert gjenbruksvolum.
```

**D4-15 · CEA-/veksthus-aktørledger (NO) · A · «hvilke norske CEA-aktører har faktisk møtt distribusjonsgaten?»**
```text
(P-DIST-1) Bygg en ledger over norske CEA-/vertikal-/veksthusaktører (Avisomo, og andre via Brønnøysund/Innovasjon Norge-portefølje): aktør, lokasjon, produkt, distribusjonsvei (egen/dagligvare/HORECA), og dokumentert erfaring med markedstilgang. Dette er den direkte empiriske testen av C-gate-tesen som i dag bare hviler på én benchmark (Avisomo/Coop Reindyrka). Ikke påstå blokkering; dokumentér faktiske tilfeller.
```

**D4-16 · Vest-Afrika fiskeolje — norsk importopprinnelse · A/C · «kan norsk fiskeolje-import med Vest-Afrika-opprinnelse isoleres i SSB?»**
```text
Forsøk SSB/Comtrade HS 1504 (fiskeolje/-fett) import til Norge med opprinnelsesfordeling, for å se om Vest-Afrika-opprinnelse kan isoleres på primærnivå (slik soya/bacalhau ble). Sannsynlig delvis C (opprinnelse + sardinella-andel ikke isolerbar). Hvis C: dokumentér at koblingen forblir NGO-modellert, og hold NGO-tallene som estimater med intervall — ikke som hard fakta.
```

### 4.3 BATCH 3 — Kryss-koblinger / andreordens innsikt (her sitter den reelle innsikten)

> Disse starter som **forståelsesprompts** (mental modell + hypotese), og det som krever tall mates videre som målrettet datasøk. De er analyser *over* eksisterende materiale, ikke nye datajakter.

**D4-17 · Konsentrasjon × fôravhengighet · innsikt · «forsterker foredlingsleddets makt importavhengigheten?»**
```text
Analyser sammenhengen mellom maktkartets funn (konsentrasjonen topper i foredling/samvirke) og fôr/import-sporet (>92 % importavhengig fôr). Hypotese å teste mot eget materiale: konsentrerte foredlingsledd (TINE, Nortura, fôrkonsern) er også de som styrer fôr-innkjøpet — så markedsmakt og importsårbarhet er to sider av samme struktur. Bruk AP2/AP5 + fôr-data. Lever som strukturhypotese med evidens, ikke påstand.
```

**D4-18 · Norge–Brasil to-motstrøms-syntese · innsikt · «aksen som ett narrativ med Scope 3»**
```text
Syntetiser Norge–Brasil-aksen: soya/fôr inn (avhengighet) + klippfisk/bacalhau ut (høyverdi-eksport) som to motstrømmer i samme bilaterale akse, med Scope 3- og beredskapsvinkel. Bygg på SSB-seriene (D4-03/soya + bacalhau). Dette er syntesen auditen fant at ingen ekstern kilde har gjort — vi eier den.
```

**D4-19 · Verdistige på tvers av sidestrømmer · innsikt · «utnyttet vs. høyverdi som felles R-stige»**
```text
Map «utnyttet vs. høyverdiutnyttet» på tvers av sidestrømmene (marint restråstoff, oppdrettsslam, husdyrgjødsel, biogass-digestat) inn i én felles R-stige (Potting 2017). Poeng: høy «utnyttelse» (89 % fisk) skjuler lav høyverdiandel; samme mønster går igjen. Motarbeider eksplisitt konflasjonen restråstoff↔fiskeslam og utnyttet↔høyverdi som auditen flagget.
```

**D4-20 · Konsentrasjon × food desert · innsikt · «henger lokale matørkener sammen med eierskapskonsentrasjonen?»**
```text
Analyser koblingen mellom eierskapskonsentrasjon (maktkart) og food desert-funnet (median postnummer-HHI = monopol; Coop ~½ omsetning i 50 minst befolkede kommuner). Hypotese: høy nasjonal konsentrasjon + distriktsmonopoler er samme fenomen på to skalaer. Bruk food-desert-saarbarhet.md + AP-data.
```

**D4-21 · Offentlig innkjøp × distribusjonsoligopol · innsikt · «kan etterspørselsmakt være motvekt mot C-gaten?»**
```text
Koble offentlig innkjøp (D4-07) til distribusjon/adoption-gaten: kan offentlig etterspørsel (skolemåltider/kantiner) være en kanal som omgår grossistoligopolet og gjør sirkulære/lokale verdikjeder skalerbare — slik København antyder? Lever mekanisme-koblingen C-gate ↔ etterspørselsmakt som strukturhypotese.
```

### 4.4 BATCH 4 — Nordisk komparativ (tett granularitetshullene; kan kjøres parallelt m/ batch 2–3)

**D4-22 · Nordisk selvforsyning korrigert for fôr · A · endelige tall, alle land.**
```text
Hent endelige (ikke foreløpige) selvforsyningstall korrigert for importert fôr for NO/SE/DK/FI/IS: kalorisk selvforsyning rå vs. fôr-korrigert, nyeste år, primærkilder (NIBIO, Jordbruksverket, DST, Luke, Hagstofa). Tallfest fôr-importavhengighet per kjøttslag der mulig.
```

**D4-23 · Nordisk gjødsel + digestat-næringsretur · A/C · fyll Island; SE-modell som mal.**
```text
Komplettér den nordiske mineralgjødsel-tabellen (inkl. Island fra D4-05) og kartlegg realisert N/P/K-retur fra biogass-digestat per land. Bare SE har realiserte tall i dag — bruk SE som mal og dokumentér eksplisitt hvor NO/DK/FI/IS mangler nasjonal måling (C-funn for batch 5).
```

**D4-24 · Nordisk offentlig matinnkjøp · A · volum + virkemiddel per land.**
```text
Sammenlign offentlig matinnkjøp på tvers av Norden: volum (kr/år), økologisk/klima-andel, og virkemiddel (krav vs. menyomlegging vs. budsjett) per land. Primærkilder per land. Bygg på D4-07 (NO/DK).
```

**D4-25 · Nordisk markedskonsentrasjon · A · harmoniser HHI, fyll DK/FI/IS-detalj.**
```text
Harmoniser markedskonsentrasjonstallene: løs den interne inkonsistensen (NO-HHI 3327 vs. 3445; ulike triopol-splitter) ved å feste én primærkilde per land (KT, Konkurrensverket, KFST, KKV), og fyll DK/FI/IS med samme detaljnivå som Norge. Lever én konsistent nordisk konsentrasjonstabell.
```

### 4.5 BATCH 5 — Dokumentér fraværet (gjør type-C til funn)

**D4-26 · Datagap-funn-notater · C · «det som ikke måles, dokumentert som leveranse»**
```text
Skriv korte, eksplisitte «datagap-funn»-notater (ett per) for de epistemiske fraværene auditen og batchene bekrefter: (a) nasjonal næringsretur fra digestat/fiskeslam måles ikke (NO/DK/FI/IS), (b) kakao-sporbarhet på produktnivå er strukturelt udokumenterbar (mass balance), (c) sardinella→norsk-fôr-allokering forblir NGO-modellert, (d) skotsk biproduktdata finnes kun for 2019. Hvert notat: hva mangler, hvorfor det ikke finnes, hva som skal til (måleregime/aktør), og hvordan vi formulerer det ærlig utad. Dette gjør «vi vet ikke» til en presis, siterbar innsikt i stedet for et opplevd hull.
```

---

## 5. Prosessering mellom batcher (uendret stack + ferskhets-tillegg)

Etter hver batch, før neste:

1. Output → `research/external/r4/deep-research-r4-<id>-YYYY-MM-DD.md`.
2. Kjør valideringsprompten på hele outputen.
3. Mottaksrad (ID-serie `DRO-R4-<id>`): kort dom, sterkeste kilde, svakeste punkt, claim-effekt, PCQ-effekt, importbeslutning.
4. Nye kilder klassifiseres (primær/sekundær/bakgrunn/aktørgate) → source-shortlist.
5. Nye tall → PCQ (verdi/enhet/år/geografi/metode/kildeeier/URL/locator/datakvalitet).
6. Claim-lock-effekt eksplisitt (åpner ingen / styrker caveat / svekker / krever actor validation / intern m/forbehold).
7. **Ferskhets-avstemming (nytt denne runden):** for hvert felt batchen rører, sjekk om casestatus-flaten viser eldre/løsere tall enn det nye uttrekket. Hvis ja → oppdater figuren (som P0b for soya). Dette holder auditens overclaim-register lukket løpende.
8. Ingen aktørkontakt.

---

## 6. Oppfølgingssløyfe (hva hver batch utløser)

Etter prosessering, fatt ett av tre oppfølgingsvedtak per felt:

- **Løft status** i casestatus (Solid → Dyp) hvis primærkilden nå bærer det. Oppdater dybdescoren i auditen.
- **Eskalér til aktørgate** (DASK/AASK) hvis batchen bekrefter at det gjenstående er type B — men *ikke* som del av denne kampanjen; bare marker det for vedtak.
- **Lukk som dokumentert fravær** (batch 5) hvis batchen bekrefter type C. Da er feltet «så godt som mulig»-dekket, og videre graving stoppes bevisst.

Sløyfa er poenget: kampanjen er ikke «kjør 26 prompts og ferdig», men «batch → lær → løft/eskalér/lukk → neste batch».

---

## 7. Anti-scope-creep- og kvalitetsvakter

1. **Primærkilde-først.** En prompt som bare kan svares med sekundær/NGO-materiale styrker ikke underlaget — den merkes estimat og holdes ute av claim-lock. Gjelder særlig D4-16 (Vest-Afrika).
2. **Forståelse ≠ fakta.** Batch 3 starter som forståelse; alt som skal siteres re-hentes som primærkilde. Ingen forståelsesoutput inn i claim-lock/deck.
3. **Wageningen-guardrail (Møte 9).** WUR-score/Moerman aldri som nordisk bevis (relevant hvis Nederland-tråder dukker opp i batch 3/4).
4. **Ikke nye case-numre.** Kampanjen *fordyper* eksisterende ankre; den oppretter ikke nye avsjekk-IDer uten eget vedtak.
5. **Aktørgater forblir gatet.** Type B rører vi ikke — kampanjens verdi er nettopp å vise hvor mye som kan løftes *uten* å vente på aktør. Men ikke lat som desk-research kan svare et type-B-spørsmål; marker det og gå videre.
6. **Dokumentér C, ikke jag det.** Når en prompt bekrefter at et tall ikke finnes offentlig, er leveransen funn-notatet (batch 5), ikke enda et søk.

---

*Neste handling: rydd §0-overclaim (liten commit), kjør batch 1 (de ni fordype-primær-promptene er alle desk/primær, lav risiko), prosessér, og la oppfølgingsvedtakene styre om batch 2 kjøres bredt eller spisses. Antallet (26) er et utgangspunkt — det følger av de åpne aspektene auditen fant, og kan vokse hvis batch 1 avdekker flere.*
