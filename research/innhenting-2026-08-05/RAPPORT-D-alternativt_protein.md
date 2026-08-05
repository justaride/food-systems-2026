# RAPPORT — Oppdager D: alternativt_protein (2026-08-05)

Hull fra R2: tynneste feltet (14 kjernekilder); hele §3-volumtabellen strøket fordi tall (Solar Foods 160 t, Innovafeed >15 000 t, Calysseo 20 000 t m.fl.) manglet ekstern primærkilde og de fleste var *designkapasitet/plan*, ikke målt produksjon.

## Hentet (4 kilder, i staging/ + ekstrakt/innhenting-D-alternativt_protein.jsonl)

1. **Solar Foods Oyj — Financial statements release 2025 (unaudited)** + Board-report-PDF. `primary_evidence`, børsnotert (Nasdaq First North Helsinki).
   - Nøkkelfunn som løser R2-tvilen direkte: Factory 01 "achieved its **design capacity** of 160 tonnes per year" — altså nameplate nådd, IKKE oppgitt faktisk produsert tonnasje. `systemBoundary=DESIGN capacity`.
   - Kontekst: **Revenue EUR 0,1 mill.** for regnskapsåret (31.12.2025), `basis=maalt` → faktisk kommersielt volum er nær null tross 160 t kapasitet.
   - 6,4 kt (Factory 02) + 6,5–7,65 kt MoU = **planlagt**, ikke produsert.

2. **Ryba, R. (2024). Offshoring insect farms may jeopardize Europe's food sovereignty.** *Global Sustainability* 7, e31. DOI 10.1017/sus.2024.35. **Fagfellevurdert, åpen tilgang (CC-BY).** `primary_evidence`.
   - **9 500 t** insekt-fôr produsert av IPIFF-medlemmer 2022 (`aktoropplysning`, gjengitt i peer-review) — kontrastert mot projeksjon **1 mill. t (2025) / 3 mill. t (2030)** (`modellert`). Kvantifiserer papirkapasitet-vs-faktisk-gapet eksplisitt.

3. **IPIFF (2025) — The state of the European insect food production sector.** Bransjeundersøkelse (19 EU-selskaper). `primary_evidence`/dataset, `aktoropplysning`.
   - Insekt til **humant konsum 2023 = 802,65 t** (opp fra 2022). NB: intern inkonsistens for 2022 (328,27 t i §II vs "over 474,38 t" i §IV) — flagget i posten.

4. **ENORM BioFactory A/S — dansk regnskap (CVR 38847147) via proff.dk.** `secondary` (aggregator av lovpålagt regnskap).
   - Årsresultat **−31,3 mDKK (2023)**, `maalt`; **omsetning ikke oppgitt** i regnskapet → faktisk produksjonsverdi kan ikke leses ut. De ~**10 000 t/år** er **designkapasitet**, ikke målt volum. Bekrefter R2-bekymringen for Enorm.

**Findings totalt: 12** (fordelt på de 4 postene).

## Køet (6 spor, OPPDAGET-KØ.jsonl) — funnet men ikke hentet
- Enorm FY2024-årsrapport (Virk, første produksjonsår — krever regnskap-distribusjons-API) — `manual`
- Mycorena AB konkursbo / siste årsredovisning (Bolagsverket) — `manual`
- Ÿnsect SAS liquidation/comptabilité (Evry/Infogreffe) — `manual`
- InnovaFeed Nesle: faktisk volum vs >15 000 t kapasitet — `unknown`
- Calysseo/Calysta 20 000 t faktisk output — `unknown`
- Volare Oy (Finland) faktisk BSF-volum — `unknown`

## Vurdering
Kjernen i R2-gapet — å kunne skille designkapasitet fra faktisk produsert volum — er nå belagt: Solar Foods-regnskapet viser 160 t = kapasitet nådd men EUR 0,1 mill. i faktisk omsetning; Ryba (peer-review) og IPIFF gir sektorens faktiske tonnasje (9 500 t fôr 2022 / 802,65 t mat 2023) mot projeksjoner i millionklassen. Selskapsspesifikke *målte* volum (Enorm, Ÿnsect, Innovafeed, Mycorena, Calysseo) finnes trolig kun i regnskaps-/konkursdokumenter som krever manuell/portal-tilgang — køet, ikke gjettet.

Alt provisorisk, kun i `research/innhenting-2026-08-05/`. Ingen skriving til knowledge/corpus, register, køer eller DB.
