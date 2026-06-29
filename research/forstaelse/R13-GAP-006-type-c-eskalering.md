---
tittel: R13-GAP-006 — Type-C-eskalering og actor-gate-kø
id: R13-GAP-006
dato: 2026-06-27
status: "Internt arbeidskart — ikke faktastemme"
gate: forstaelse
priority: P1
geo: NO
sourceClass: C (intern R12-triagesyntese)
---

# R13-GAP-006 — Type-C-eskalering og actor-gate-kø

## Kort dom

R12 sine type-C-hull er ikke én feiltype. Etter reklassifisering deler de seg i tre:
**Type A** (desk-researchbar — locator finnes allerede, det gjenstår uttrekk fra SSB-kode, tabell, PDF, lov eller åpent register), **Type B** (actor-gate — krever aktør-, kontrakt-, avregnings-, kunde- eller aktiv-statusdata som ikke kan deskhentes), og **ekte Type C** (strukturelt fravær — ikke målt, ikke harmonisert, klassifisert eller ikke offentlig; skal bevares som funn, ikke "nesten lukket research").

De fleste «C»-merkede hullene i R12 er i praksis **blandet**: en deskbar A-kjerne (importserie, struktur, organisering, metodekilde) rundt en hard B- eller C-rest (sluttbruk, realisert volum, per-kg-margin, aktiv status, harmonisert nordisk serie). Disiplinen er å lukke A-laget, sende B-laget til actor-gate-kø, og merke C-laget som funn.

## Metode (hvordan reklassifisert)

1. Leste R12 intake-/triageindeks (`research/_status/food-tg-r12/r12-intake-index-2026-06-24.md`) i sin helhet og hentet hver dokumenterte C-/parkert-/actor-gate-rest fra `Kort dom`, `Triagebeslutning` og `Stoppliste`.
2. Per hull stilte jeg tre spørsmål: (a) Finnes det allerede en navngitt offentlig locator som lukker hullet ved uttrekk? → A. (b) Krever hullet aktør-, kontrakt-, avregnings- eller aktiv-statusdata? → B. (c) Er størrelsen strukturelt ikke målt/harmonisert/offentlig? → C.
3. **Lette, målrettede web-sjekker** kun for å bekrefte om en konkret locator finnes (ikke for å hente fakta). Logget under `## Loggede kilder`.
4. Overclaim-vakt: Type C er funn. Ingen C ble løftet til A uten at en konkret ny locator faktisk ble identifisert. Der locator ble funnet (ASKO-Dagligvarerapport, REKO ringtall) er hullet eksplisitt merket «A *etter* uttrekk/PCQ», ikke lukket her.
5. Reklassifiseringen er intern arbeidssyntese, ikke ny primærforskning. Hvert A-kall må bekreftes ved faktisk uttrekk i R13 (slik R13-GAP-001 gjorde med SSB 08801).

## Eskaleringstabell

| Hull | Domene | Opprinnelig type | Ny vurdert type (A/B/C) | Begrunnelse | Neste steg |
|---|---|---|---|---|---|
| R12-RES-003 kritiske importnoder (tonn per node) | RES/import | C/B (manglende primæruttrekk) | A delvis + C-rest | SSB 08801 lukker HS-serier per node ved uttrekk; sluttbruk og fôrprotein-total ligger ikke direkte i koden. | Bruk R13-GAP-001 (08801-uttak); behold sluttbruk/total som C. |
| R12-FEED-001 fiskeolje art/fiskeri/sluttbruk | FEED | C (art/sluttbruk mangler) | A (importserie) + C/B-rest | SSB 08801 lukker HS 1504-import fra Mauritania; råstoffart, fiskeri og fôr-sluttbruk er ikke i varekoden. | Tolltarifftekst desk-lukkes; art/sluttbruk → actor-gate (importør/fôrprodusent). |
| R12-FEED-002 fôrimportavhengighet per produksjon | FEED | C (per-produksjon ikke claimbar) | A delvis + B-rest | Landbruksdir. kraftfôrvolum + FHF/Nofima ressursregnskap er deskbare ankre; per-art importandel krever metodekobling/aktørdata. | Importer ankre med metodefelt; per-art-andel → PCQ/actor-gate. |
| R12-FEED-003 alternative nordiske fôrproteiner (realisert volum) | FEED | C (realisert volum mangler) | B (+ A for kapasitet/plan) | Annonsert kapasitet/plan kan desk-verifiseres; realisert fôr-grade årsvolum per aktør er ikke offentlig. | Kapasitet → source-shortlist; realisert volum → actor-gate per aktør. |
| R12-FEED-005 musling/tang/tare kommersielt fôrvolum | FEED | C (ingen åpen volumserie) | C/B | Prosjekt/potensial deskbart; kommersielt realisert nordisk fôrvolum finnes ikke som åpen serie. | Source-shortlist m/ pilot-/potensial-merke; volum → actor-gate. |
| R12-WASTE-001 marint restråstoff R-stige-mapping | WASTE | C (R-stige krever uttrekk) | A | SINTEF/FHF 2024-rapport finnes; R-stige-mapping er tabelluttrekk fra kjent kilde. | PCQ tabelluttrekk; ingen figur før celler vises. |
| R12-WASTE-002 oppdrettsslam nasjonal massestrøm | WASTE | C (innsamlet volumserie mangler) | C (m/ A-metodekilder) + B | Web-sjekk bekrefter: Fiskeridir/Miljødir publiserer miljøtilsyn/-tilstand, ikke harmonisert innsamlet-slam-tonnasje. Metodeproblem er deskdokumentert. | PCQ som datagap; operatør-/anleggsvolum → actor-gate. |
| R12-WASTE-003 digestat nordisk N/P/K-retur | WASTE | C (nordisk serie mangler) | A (SE) + C (harmonisering) | Sverige har SPCR 120-serie (deskbar); felles nordisk harmonisert metode finnes ikke. | Importer SE som A; nordisk sammenligning = C, ingen rangering. |
| R12-WASTE-004 kaffegrut massestrøm/biogass | WASTE | C (ikke egen avfallsfraksjon) | A (import/estimatspenn) + B/C (disponering) | SSB-kaffeimport + SCG-faktor gir deskbart estimatspenn; faktisk disponering krever avfalls-/aktørdata; ikke egen offentlig fraksjon. | Estimatspenn m/ metode; faktisk masseflyt → actor-gate/datagap. |
| R12-WASTE-005 prevention-tiltak effekt | WASTE | C (effekt/baseline mangler) | A (tiltakskatalog) + C (effekt) | Tiltakskatalog deskbar; målt effekt uten baseline/scope per tiltak er ikke-målt. | Source-shortlist; effekt → PCQ m/ baseline-krav. |
| R12-DIST-001 ASKO/HORECA 70 % storhusholdning | DIST | parkert (uavhengig andel mangler) | B (A *etter* locator-PCQ) | Web-sjekk: Konkurransetilsynets Dagligvarerapport 2024-25 finnes som ny locator-kandidat, men bekrefter ikke åpent 70 %-tallet; eldre bransjetall er B/C. | PCQ Dagligvarerapport 2024-25; hold 70 % parkert til tall faktisk leses. |
| R12-DIST-002 offentlige matkontrakter regionalt | DIST | C (ingen nasjonal andel) | A (regional ledger) + C (nasjonal andel) | Doffin gir regional kontrakt-ledger ved CPV/value-uttrekk; nasjonal markedsandel/lokalmatkanal er ikke avledbar. | Importer regional tabell; nasjonal andel = C. |
| R12-DIST-003 EMV/leverandørmakt DK/IS | DIST | C (DK eldre, IS hull) | B/C (A for NO/SE/FI) | NO/SE/FI har myndighetsnære ankre (deskbare); DK eldre = B; IS er ekte C i denne batchen. | Importer NO/SE/FI; DK/IS som synlige hull til ny primærkilde. |
| R12-DIST-004 grossistgate frukt/grønt (nekt/tilgang) | DIST | C (ikke bevist nekt) | C/B | Struktur/kanalspor deskbart; bevist nekt/komplett kjedetilgang krever aktør-/avtaledata, ikke deskbart. | Evidens-ledger; nekt-/tilgangsclaim → actor-gate. |
| R12-DIST-005 leaseback eksklusjon | DIST | C (mekanisme delvis belagt) | A (mekanisme-memo) + B (bevist eksklusjon) | KT 2025 dokumenterer servitutter/eksklusivklausuler/eiendomserverv (deskbart); bevist ulovlig eksklusjon krever sak/aktørdata. | Mekanisme-memo; eksklusjonsclaim → actor-gate. |
| R12-VALUE-001 ledd-profil import (sluttbruk/aktør/lager) | VALUE | C-hull eksplisitt | A (kode/mengde/verdi) + B/C (sluttbruk/lager) | SSB 08801 + Landbruksdir. lukker varekode/mengde/verdi; sluttbruk, aktørledd, lager, sårbarhet er B/C. | Datakontrakt m/ synlige C-celler. |
| R12-VALUE-002/003/004 ledd-profil prim./foredling/dist. | VALUE | C (kapasitet/råvare/HORECA) | A (struktur) + B/C (kapasitet/volum) | Struktur og offentlige serier deskbare; kapasitet, importert råvareandel, waste, HORECA-andel, avropsvolum er ikke åpent lukket. | Profil-kandidater m/ B/C-celler eksplisitt. |
| R12-VALUE-005 nordisk ledd-sammenligning | VALUE | C (ingen harmonisert matrise) | C (+ A nasjonale kilder) | Nasjonale kilder deskbare hver for seg; harmonisert nordisk matrise for rangering finnes ikke. | Source-shortlist/datakontrakt; ingen nordisk rangering. |
| R12-RES-001 forkorrigert selvforsyning Norden | RES | C (nordisk serie mangler) | A (NO) + C (nordisk) | NO har A-kilde (Helsedir/NIBIO); harmonisert nordisk forkorrigert serie finnes ikke i batch. | Importer NO; nordisk = C, ingen rangeringsfigur. |
| R12-RES-002 beredskapslager korn/gjødsel tonnasje | RES | C/klassifisert | C (m/ A for mål/rammeavtale) | Mål/oppbygging/rammeavtale ofte deskbart; faktisk tonnasje/plassering er klassifisert eller ikke åpent. | Matrise m/ mål vs. faktisk-celle; faktisk = C/actor-gate. |
| R12-RES-005 transport/lager/kaldkjede tall | RES | C (ikke-publisert kapasitet) | C (+ A for kvalitative noder) | Kvalitative sårbarhetsnoder (ØA 60-2023) deskbare; dagsdekning/kjølekapasitet/havneandel er forretnings-/beredskapssensitivt. | Kvalitativ matrise; tallfesting → actor-gate/datakilde. |
| R12-ACTOR-001 markedshager aktiv status | ACTOR | actor-gate | B | Kart/lister er kandidatflate; aktiv 2025/2026-drift per produsent krever primærlocator/aktørbekreftelse. | R13-AKTOR-001 actor-gate. |
| R12-ACTOR-002 REKO ring-/produsent-/kundetall | ACTOR | parkert/source-shortlist | A (ringtall) + B (produsent/kunde) | Web-sjekk: ringtall (>130) er åpent deskbart; produsent-/kundetelling er dateres/uoppdatert (Feb 2022) og krever årsmelding/dedupe. | Ringtall via PCQ; produsent/kunde → actor-gate (R13-AKTOR-003). |
| R12-ACTOR-003 andelslandbruk aktiv status etter 2023 | ACTOR | actor-gate | B | Økoguiden-API/kart er kandidatflate (71/78 treff ≠ aktivtelling); aktiv drift per gård må bekreftes. | R13-AKTOR-002 actor-gate. |
| R12-ACTOR-004 regenerative praktikere/gårdslister | ACTOR | actor-gate | B/C | Åpne nettverkslister er kandidater; komplett aktiv praksis-/effektregister finnes ikke. | R13-AKTOR-004 actor-gate. |
| R12-ACTOR-005 nordisk frø/genressurs/permakultur | ACTOR | actor-gate | B/C | Node-roller klare; accession/sort/volum/tilgang og verifisert produsentregister mangler. | R13-AKTOR-005/007 actor-gate. |
| R12-FARM-002 per-kg bondemargin | FARM | actor-gate/parkert | B | Pris-/avregningslogikk deskbar; faktisk per-kg-margin krever produsentavregning, kontrakt, kostnadsgrunnlag. | Actor-gate/DASK; ingen desk-tall. |
| R12-FARM-004 samvirke per-kg margin | FARM | source-shortlist | A (struktur) + B (margin) | Samvirkestruktur deskbar; netto per-kg-margin krever avregning/etterbetaling/kostnad. | Struktur-memo; margin → actor-gate. |
| R12-TRUE-001 Edinburgh/NMBU-person | TRUE | parkert | B/C | Eksakt person ikke trygt identifisert; Merkle er kandidat. Krever ekstern bekreftelse/CV-locator, ikke ren desk-avledning. | Hold parkert; shortlist kandidatkilder. |
| R12-TRUE-004 SOIL-score | TRUE | parkert | C | Web/DOI-sjekk i R12 fant ikke score i IPBES/Nexus; kan være internt eller annen kilde. Ingen locator. | Hold parkert til primærlocator finnes. |
| R12-TRUE-002/003/005 true-cost / sufficiency / helse-output | TRUE | source-shortlist/forstaelse | A (metode/begrep) + C (norsk kronefesting) | Metode-/begrepsankre (TEEBAgriFood, IPCC, FHI) deskbare; ferdig norsk kronefestet true-cost-modell finnes ikke. | Metode-memo; kronefesting = C. |
| R12-GOV-004 Plantagon/Rest case | GOV | parkert | A (register) + C (effektclaim) | Foretaksregister/konkursstatus deskbart; «teknologien feiler» kan ikke avledes av konkurs alene. | R13-INNO-004 register-uttrekk; effektclaim = C. |
| R12-VIZ-001 ledd-profil datakontrakt | VIZ | internal | A/B/C blandet | Flere celler desk-lukkes; aktør/stock/sluttbruk står igjen som B/C. | Intern datakontrakt m/ source_class per celle. |
| R12-VIZ-003 kausalkart L1-L5 målt effekt | VIZ | forstaelse | C | Struktur/piler dokumenterbart; målt kausal effekt mangler. | Forståelse/hypotesekart, ikke faktastemme. |
| R12-VIZ-004 datagap-figur scope | VIZ | internal | A (figurunderlag) + C (full systemrevisjon) | Gaplisten er batchbasert figurunderlag (deskbart); komplett universell systemrevisjon er C. | R13-LAND-004 figurunderlag m/ scope-caveat. |

## Actor-gate-kø (Type B-hull samlet)

Disse sendes til actor-gate. Felles manglende lag: **datert aktiv-status per aktør/site**, deretter volum/utfall, dedupe og kontrakter. Ikke desk-research disse i hjel.

| Kø-post | Hvorfor actor-gate | Aktør/data som kreves (første eier-/datakrav) |
|---|---|---|
| Alternative fôrproteiner (FEED-003) + musling/tang/tare (FEED-005) | Realisert solgt fôr-grade volum ikke offentlig per aktør | Årsvolum, produktform, kunder/fôrbruk, godkjenning per produsent |
| Fiskeolje art/sluttbruk (FEED-001) | Varekode viser ikke art/fôrsluttbruk | Importør/fôrprodusent: råstoffart, fiskeri, sluttbruksplit |
| Fôrimportavhengighet per art (FEED-002) | Per-art importandel ikke i offentlig datasett | Aktør-/metodekobling kraftfôr→art |
| REKO produsent-/kundetall (ACTOR-002) | Aktive produsenter/kunder/omsetning krever nettverks-/ringdata | Årsmelding, ringliste, produsenttelling, deduplisert kundemål |
| Andelslandbruk aktiv status (ACTOR-003) | Aktiv drift etter 2023 må bekreftes per gård | Primærlocator/egen side, sesongstatus, andelshavere |
| Markedshager/regenerative praktikere (ACTOR-001/004) | Kart/lister er kandidater, ikke verifisert drift | Produsentlocator, aktiv status, produksjons-/praksisfelt |
| Nordisk frø/genressurs (ACTOR-005) | Accession/sort/volum/tilgang ikke lukket | Institusjonsrolle, accession-tall, tilgangs-/delingsregler |
| Oppdrettsslam volum (WASTE-002) | Faktisk innsamlet/behandlet volum per anlegg ikke åpen serie | Operatørdata, avfalls-/behandlingsrapport, tørrstoff/N/P |
| Kaffegrut disponering (WASTE-004) | Faktisk masseflyt/biogass krever avfalls-/aktørdata | Avfallsmottak/biogassanlegg: faktisk mottatt volum |
| Per-kg bondemargin (FARM-002/004) | Avregning, kontrakter, kjøperpris er aktørdata | Avtaledata, produksjonstype, periode, prisgrunnlag, etterbetaling |
| Kaldkjede/lager tall (RES-005) + beredskapslager (RES-002) | Dagsdekning/kapasitet/plassering er forretnings-/beredskapssensitivt | Dataeier, aggregeringsnivå, sikkerhets-/graderingsvurdering |
| Grossistgate nekt/tilgang (DIST-004) + leaseback eksklusjon (DIST-005) | Bevist nekt/eksklusjon krever sak-/avtaledata | Kontrakt/avtale/saksdokument, aktørbekreftelse |
| ASKO/HORECA 70 % (DIST-001) | Uavhengig andel ikke åpent bekreftet | Markedsrapport (Dagligvarerapport 2024-25 PCQ) ellers aktørdata |
| EMV DK/IS (DIST-003) | Eldre/manglende primærkilde | Oppdatert myndighets-/markedskilde per land |

## Ekte Type C (strukturelt fravær — behold som funn)

Disse er ikke «research-gjeld». De er funn om hva systemet ikke måler/publiserer åpent:

- **Sluttbruk** der varekode/rapport bare viser import eller produksjon (FEED-001, RES-003, VALUE-001).
- **Harmoniserte nordiske serier** der landene måler ulikt (RES-001 forkorrigert selvforsyning, WASTE-003 digestat-harmonisering, VALUE-005 ledd-matrise).
- **Realisert volum** i felt dominert av annonsert kapasitet/plan (FEED-003, FEED-005).
- **Nasjonal innsamlet/behandlet massestrøm** uten åpen serie (WASTE-002 oppdrettsslam — web-bekreftet fravær).
- **Beredskaps-/lagerdata** som er klassifisert eller ikke offentlig (RES-002 tonnasje/plassering, RES-005 kaldkjedekapasitet).
- **Målt kausal effekt** der kilden bare viser struktur, tiltak eller kapasitet (VIZ-003 kausalkart, WASTE-005 prevention-effekt, TRUE-005 helse-true-cost).
- **Norsk kronefestet true-cost-modell** (TRUE-002/005) — metode finnes, kronefesting gjør ikke.
- **SOIL-score** (TRUE-004) — ingen primærlocator funnet; ekte C inntil locator dukker opp.
- **Islandsk EMV/leverandørmakt** (DIST-003 IS) — strukturelt hull i denne batchen.

## Ikke si

- Ikke si at et Type-C-hull «bare mangler litt research» — det er funn til en ny locator faktisk er identifisert.
- Ikke gjør actor-gate-data (per-kg-margin, realisert fôrvolum, aktiv produsentstatus, slamvolum, kaldkjedekapasitet) til desk-claim.
- Ikke fyll tomme celler med estimat fordi en figur trenger tall.
- Ikke si at ASKO har 70 % HORECA/storhusholdning — locator-kandidat (Dagligvarerapport 2024-25) er ikke lest/bekreftet.
- Ikke kall REKO-, andelslandbruk-, markedshage- eller frønettverk-kart et komplett nasjonalt aktivt register.
- Ikke si at Plantagon/Rest-konkurs beviser at teknologien feiler.
- Ikke behandle denne interne synteseen som primærkilde eller faktastemme.

## Anbefalt gate: forstaelse / actor-gate

**Forståelse** for selve eskaleringskartet (intern prioriteringslogikk for R13, ikke siterbar). **Actor-gate** for hele B-køen over: hold den utenfor desk-claims til datert per-aktøridentitet og aktiv status, deretter volum/kontrakt/dedupe, faktisk er innhentet. A-omklassifiserte hull går til PCQ med locator og synlige C-celler; ekte-C-listen bevares som funn.

## Loggede kilder (web-sjekk, accessedAt 2026-06-27)

- Fiskeridirektoratet/SSB/Miljødirektoratet akvakultur-statistikk — bekreftet at det ikke finnes åpen harmonisert innsamlet-oppdrettsslam-tonnasjeserie (kun miljøtilsyn/-tilstand). https://www.fiskeridir.no/statistikk-tall-og-analyse/data-og-statistikk-om-akvakultur , https://www.miljodirektoratet.no/ansvarsomrader/forurensning/akvakultur/akvakultur-forvaltning/
- Konkurransetilsynets Dagligvarerapport 2024-25 — eksisterer som locator-kandidat for grossist-/storhusholdningsstruktur; bekrefter ikke åpent 70 %-ASKO-tall. https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf
- REKO Norge — ringtall (>130 ringer) åpent tilgjengelig; produsent-/kundetall dateres (Feb 2022), krever oppdatert årsmelding. https://www.rekonorge.no/hva-er-reko
