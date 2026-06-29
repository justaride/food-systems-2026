---
tittel: Food TG R13 — Batchrapport 11
dato: 2026-06-28
goal: Food TG Research OS Runde 13 (autonom)
batch: 11
prompter: R13-OKO-004, R13-OKO-005, R13-OKO-006, R13-OKO-007
regel: Ingen DB-skriving, ingen claims, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme
status: Intern mottaksrapport — ikke faktastemme
---

# Batchrapport 11 — Food TG R13

## Oppsummering

Sterkeste batch hittil i R13 — alle 4 prompter returnerte `importDecision: importer` med `valueTier: high`. Det betyr solide A-kildedekkede funn med synlige tomme celler, klare til PCQ-import. Batch 11 er en rendyrket OKO-batch (biodiversitet, merkeordninger, beite, policy).

| Beslutning | Antall | IDer |
|---|---:|---|
| enrich | 4 | R13-OKO-004, R13-OKO-005, R13-OKO-006, R13-OKO-007 |
| park | 0 | — |
| aktørspørsmål | 0 | — |
| importer | 4 | alle fire |

## Mottaksrad-tabell (8 kolonner)

| ID | Tittel | Beslutning | Gate | Kildeklasse | Sterkeste kilde | Svakeste punkt | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-OKO-004 | Biodiversitet i jordbrukslandskap | enrich | source-shortlist | A (NIBIO 3Q, Naturindeks 2025, Artsdatabanken, ASO); B (PECBMS); C (insektbiomasse, FBI-tallserie) | NIBIO 3Q — Pedersen & Alemu 2026, DOI 10.21350/1v8m-rb02 | Pollinatortrend for kort (serie fra 2021); insektbiomasse uovervåket | **importer** |
| R13-OKO-005 | Sertifiserings- og merkeordninger | enrich | source-shortlist | A (Debio, Mattilsynet, Lovdata, kravsett); B (SNL, pressemelding); C (Debio avgift, USDA-ekvivalens, BOB-liste) | Debio statistikkhefte 2025 + Nyt Norge kravsett v.01.01.2025 | Nyt Norge-kontroll via egenrevisjon; ikke offentlig tilsynsorgan | **importer** |
| R13-OKO-006 | Beite, utmark og husdyr-økologi | enrich | source-shortlist | A (SSB, NID 2025/UNFCCC, Landbruksdirektoratet, NIBIO beitestatistikk); B (Animalia); C (SOC-endring utmark, gjengroing/år) | SSB tabell 12660 + Norway NID 2025 UNFCCC | SOC i utmark utenfor klimainventaret; GWP AR5/AR6-harmonisering mangler | **importer** |
| R13-OKO-007 | Policy-mål for økologi og bærekraft | enrich | PCQ | A (Riksrevisjonen, Stortingsvedtak, Meld.St., Lovdata); B (Matvett, EEA); C (pollinatorbestandsmål, selvforsyningsprognose) | Riksrevisjonen Dok. 3:13 (2024–2025), 05.06.2025 | Matsvinn ekskluderer primærjordbruk; selvforsyningsprognose mangler | **importer** |

## Per-target outcome

### R13-OKO-004 — Biodiversitet i jordbrukslandskap

**Beslutning:** enrich → source-shortlist (**importer**)

**Nøkkelfunn:**
- **Fugler (3Q/NIBIO, 2026):** 22 kulturlandskapsfuglearter overvåket 2000–2023 på 130 nasjonalt representative flater. Samlet bestand ned ~25 % siden år 2000 (DOI: 10.21350/1v8m-rb02, A-klasse). Sterkest ned: gråtrost –56 %, tårnseiler –50 %, gulspurv –50 %, buskskvett –50 %. Eneste markert positiv: stillits +54 %.
- **Naturindeks 2025 (Miljødirektoratet/NINA, nov. 2025):** Åpent lavland = 0,445 — lavest av alle 7 norske økosystemer, og nedgang siden 2000. Alle naturtyper tilknyttet tradisjonell landbruksdrift er nå rødlistet.
- **Semi-naturlig eng (ASO, NIBIO 2021–2025):** Første nasjonale arealrepresentative kartlegging: 60 % av 713 registrerte enger i gjengroing/ute av aktiv bruk. Totalestimert areal: 2 200–4 500 km². Naturtype: kritisk truet (CR) på Norsk rødliste for naturtyper 2025.
- **Pollinatorer (Artsdatabanken 2021):** 17 % av villbier/humler truet; 30,6 % på rødlista. 3Q pollinatortransekter startet 2021 — for kort serie for trendpåstand. Ingen norsk nasjonal Farmland Bird Index-tallserie hentet fra PxWeb (C).
- **Insektbiomasse:** Ikke overvåket nasjonalt i åkerlandskap. Strukturelt C-gap.

**Ikke si:** biodiversiteten er i fri fall (upresist); 25 % færre fugler siden 1980 (norsk serie fra 2000); pollinatorene er i sterk tilbakegang (trenddata mangler); 3Q dokumenterer årsaken til nedgangen; Naturindeks 0,445 betyr 55 % ødelagt.

---

### R13-OKO-005 — Sertifiserings- og merkeordninger

**Beslutning:** enrich → source-shortlist (**importer**)

**Nøkkelfunn:**
- **Debio / Ø-merket:** EØS-innlemmet gjennom forordning (EU) 2018/848, norsk Økologiforskrift. 3 018 godkjente virksomheter per 2025 (Debio, A). Debio er eneste kontrollorgan, delegert fra Mattilsynet. Alle virksomheter kontrollert årlig, min. 10 % uanmeldte besøk. Sertifiseringskrav: 2 års omleggingstid (karens) for jord. Internasjonal ekvivalens: EU og Sveits bekreftet; USDA NOP ikke bekreftet for EØS-land.
- **Nyt Norge / Stiftelsen Norsk Mat:** Opprinnelsesmerke — IKKE kvalitets- eller miljømerke. Krav: uforedlet = 100 % norsk; foredlet = min. 75 % norsk (vektprosent). Ca. 6 100 produkter, 138 virksomheter, omsetning 42,9 mrd. NOK 2024 (+10,5 %), 33 % markedsandel i merkbare kategorier. Sjømat inkludert fra jan. 2026. Stiftelsen Norsk Mat er privat stiftelse — ikke offentlig tilsynsorgan. Kontroll: egenrevisjon + ekstern revisjon hvert 3. år. KSL (Kvalitetssystem i Landbruket): 6 603 revisjoner i 2023, primært egenrevisjon. Aftenpostens "Landbrukets skyggeside" (jan. 2025) satte kontrollkvaliteten under lupen.
- **Beskyttede Betegnelser (BOB/BGB/TSG):** 32 godkjent per 2024-inngangen (SNL). Mattilsynet godkjenner, Stiftelsen Norsk Mat har administrativt ansvar. Spesialitet: 581 produkter per 2024.
- **Gap (C):** Debio avgiftsstruktur ikke offentlig; komplett BOB/BGB/TSG-liste per 2025 ikke funnet; USDA NOP-ekvivalens ikke bekreftet; volum norskprodusert vs. importert økovare ikke skilt.

**Ikke si:** Nyt Norge garanterer kvalitet; Ø-merket bekrefter miljøvennlig produksjon; alle Nyt Norge-bønder er kontrollert; Debio og Nyt Norge er offentlige tilsynsorganer.

---

### R13-OKO-006 — Beite, utmark og husdyr-økologi

**Beslutning:** enrich → source-shortlist (**importer**)

**Nøkkelfunn:**
- **Utmarksbeite 2025:** 1 296 316 sau/lam + ca. 270 000 storfe + 63 000 geit (SSB tabell 12660, A). Sau på nedadgående trend fra ~1,93 mill. (2019) til ~1,30 mill. (2025). Geit kraftig ned.
- **Arealressurser:** 137 000 km² nyttbart beite (NIBIO/Yngve Rekdal); bare ~45 % av dette er faktisk utnyttet. Potensial for mer enn dobling i faktisk beiteutnyttelse.
- **Metan / klimainventar (NID 2025):** Enterisk fermentering = 48,5 % av jordbrukssektorens klimagassutslipp. Jordbruk totalt: 4,45 mill. tonn CO2-ekv. (2023), ned ~10 % siden 1990. Metode: Tier 2, GWP100 AR5 (CH4=28). AR6 (CH4=27,9) ikke implementert i NID 2025.
- **SOC i utmark — kritisk C-gap:** Karbonlagring i utmarksbeite er IKKE inkludert i norsk klimainventar. NIBIO startet nasjonal SOC-overvåking i 2023 (300 prøveflater, skog + beite). Endringsdata ikke tilgjengelig før 2033.
- **Rovdyrtap 2024:** 68 575 dyr tapt (5,4 % av sluppet sau). Jerv dominerer erstatning (40 %). Kausalitet til nedgang i utmarksbeitebruk: ikke entydig primærkildebelagt.
- **Semi-naturlig beitemarks-effekt:** Alle semi-naturlige naturtyper (kystlynghei, slåttemark, rikmyr) trues av gjengroing ved redusert beitebruk — primærkilde Naturindeks 2025 og ASO.

**Ikke si:** utmarksbeite er karbonnøytralt; beite lagrer like mye karbon som det slipper ut; 45 % av landarealet beites aktivt; gjengroing er kvantifisert til X daa/år; rovdyr er hovedårsaken til nedgang; metan fra husdyr er beregnet med GWP20.

---

### R13-OKO-007 — Policy-mål for økologi og bærekraft

**Beslutning:** enrich → PCQ (**importer**)

**Nøkkelfunn:**
- **Klimamål for jordbruket (intensjonsavtale 2019/2021):** Mål 5 mill. tonn CO2-ekv. kutt 2021–2030. **Riksrevisjonen Dok. 3:13 (05.06.2025):** sannsynligvis IKKE i rute. Ikke juridisk bindende. Sterkeste enkeltfunn for "Ikke si"-bruk.
- **Jordvernmål:** Max 2 000 daa/år omdisponering av dyrket mark (Stortinget, jun. 2023). Nådd for første gang i 2025: 1 763 daa (foreløpige tall, Landbruksdirektoratet). Caveat: Ekskluderer frivillig omlegging fra landbruket selv.
- **10 % øko-areal 2032:** Stortingsvedtak 558, feb. 2025 (flertallsvedtak). Nåværende nivå: ~4,6 % (inkl. karens). Krever mer enn dobling.
- **50 % selvforsyning (fôrkorrigert) 2030:** Stortingsvedtak 565, 2024. Nåværende nivå: ~40 %. Ingen offisiell prognose for om målet nås.
- **50 % matsvinnreduksjon 2030 (bransjeavtale + Matsvinnlov 2025):** Bransje er –31 % (2024, delmål ok); nasjonalt ekskl. primærjordbruk: –24 %. Matsvinnloven vedtatt 20.06.2025, men ikrafttreden ikke bekreftet. Gap: primærjordbruk ekskludert fra kartlegging.
- **EU Farm to Fork:** 25 % øko-areal, 50 % pesticidreduksjon, 20 % gjødselreduksjon innen 2030 — **IKKE innlemmet i EØS som helhet.** Norges plantevernmiddelregelverk påvirkes via EØS-direktivet 2009/128/EF, men F2F-pakken som policy er ikke bindende for Norge.
- **Pollinatorstrategi:** Nasjonal tiltaksplan for ville pollinerende insekter 2021–2028 (Statsforvalterne). Ingen kvantitative bestandsmål for pollinatorer operasjonalisert.

**Ikke si:** Norge har forpliktet seg til EU Farm to Fork; klimamålet er i rute; matsvinnmålet er nådd; jordvernmålet er nådd (2025-tall er foreløpige); selvforsyningsgraden er 50 %; EU krever 25 % øko-areal av Norge; matsvinnloven er i kraft.

---

## Oppfølgingspunkter

- **OKO-004**: Hent norsk FBI-tallserie per år fra PxWeb Nordic Statistics direkte. Kontakt NIBIO 3Q for insektbiomasse-status. 3Q-pollinatortransekter — sjekk om 2024-data er publisert.
- **OKO-005**: Hent komplett BOB/BGB/TSG-liste fra Mattilsynet. Sjekk om Debio avgiftsstruktur er tilgjengelig via offentlig innsyn. Verifiser Nyt Norge sjømat-krav fra jan. 2026.
- **OKO-006**: Følg NIBIO SOC-feltkampanje 2023–2032 — første endringsdata 2033. Hent Klimaavtalens regnskap PDF for sist tilgjengelige år. Sjekk Animalia Kjøttets tilstand 2025 for bestandstall.
- **OKO-007**: Riksrevisjonen Dok. 3:13 er den viktigste enkeltkilden i hele R13 for overclaim-vakt mot klimapåstander. Les PDF direkte for spesifikke konklusjoner. Sjekk Stortingsinst. 197 S (2024–25) for selvforsyningsvedtakets presise formulering.
- **Batch 11 er den første der alle 4 prompter returnerte importer** — gjenspeiler at OKO-temaet har godt dokumenterte primærkilder for norsk kontekst.
- Ingen av batch-11-outputene åpner ekstern claim eller whitepaper-stemme.
