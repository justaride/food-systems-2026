# RAPPORT — Skive B3_eiendom_distr (Innhentingssesjon 2026-08-05)

**Tema:** eiendom / etableringshindre + alt-distribusjon. **Rader i manifest:** 16.
**Resultat:** 12 hentet (full/partial/metadata) · 3 paywall · 1 død/uten lokaliserbar URL · **26 findings**.

## Hentet (12 kilder → ekstrakt/innhenting-B3_eiendom_distr.jsonl)

Eiendomsmakt / etableringshindre:
- **NorgesGruppen credit research 2015** (DNB Markets, PDF): >800 000 sqm / >200 eiendommer; 49 % Scala Retail Property; 39,9 % markedsandel 2014; topp-3 = 96,4 %; marked 160,1 mrd NOK; overtok 50 ICA-butikker.
- **NG Annual Review 2015 (eng, PDF):** 185 konsern-eide eiendommer på 170 AS (6 kjøpesentre, 128 «other», m.m.); ~40 % av handelsareal leid ut eksternt.
- **NG Annual & Sustainability Report 2023 (PDF, 27 MB):** 27 % markedsandel av matmarked ~360 mrd; NG Eiendom omsetning 497 MNOK; Scala Eiendom 24 kjøpesentre (19 heleid), NG-andel 37,5 %.
- **Coop Midt-Norge Eiendom (coopmn.com):** 320 000 m² eiendomsmasse, ~320 eksterne utleieforhold, Mo i Rana–Røros; 139 butikker/28 kommuner (substitutt for årsrapport-PDF som ikke ble funnet på direkte URL).
- **Cibus Nordic (press):** 12 dagligvareeiendommer NOK 471,2M / ~23 100 sqm (tenants REMA 1000 x9, Kiwi, Spar, Bunnpris). DATO/EUR-uklarhet flagget.
- **NREP Logicenters (press):** 84 800 m² Coop-distribusjonssenter ved Oslo lufthavn (press datert 2020, ikke 2024).
- **ICA/IPE Real Assets 2016 (partial):** ICA Eiendom Norge solgt til Union Eiendomskapital for EUR 224M (antall eiendommer ikke bekreftet i preview).
- **CMA Groceries Controlled Land Order 2010 (UK):** primær lovtekst — best-endeavours-frigjøring av negative servitutter, 5-års eksklusivitetstak, 10-min-kjøretid/≥60 %-test; 7 utpekte kjeder. UK-komparator til norsk servitutt-forbud.

Alt-distribusjon:
- **NIBIO Troms/Finnmark 2023** (Statsforvalteren-kopi, presentasjon): 11 produsenter + 4 salgskanal-repr.; salgskanaler (REKO, gårdsutsalg, Bondens Marked, digital, direkte til dagligvare); utfordringer incl. innpass i dagligvare.
- **NHH / Prof. Leif Hem 2016:** 3 kjeder; private label 13–14 % (opptil 30 % i ferskvare); argument for direkte-salg (marked.no).
- **NMBU PhD Hersleth 2023** (metadata_only, abstract via NVA API): lokalmat-omsetning 11,5 mrd NOK 2022; REKO/gårdsutsalg/market-driving micro-businesses.
- **USCS Norway distribution (partial):** tynn; dagligvare er én av få bransjer med landsdekkende kjeder.

## Paywall / død (→ OPPDAGET-KØ.jsonl)
- **E24** «Coop frykter … butikklokaler til NorgesGruppen» — ingen URL i manifest, E24 betalingsmur → paywalled.
- **Estate Nyheter** «Coop selger stort til Union» (2015) — (+) betalingsmur; søkeutdrag nevner Grorud 52 300 sqm / 650–700 MNOK, IKKE lest i kilde, ikke registrert som finding → paywalled.
- **Emerald QMR** «mundane consumer resistance i REKO» (2021) — journal_gated → paywalled.
- **NHH/NTNU masteroppgave «restrictive covenants»** (2024) — ingen URL i manifest, ikke lokalisert → dead_link. Primær-erstattere (Konkurransetilsynets dagligvarerapport; Forskrift 2023-12-11-2037 om negative servitutter) lagt i OPPDAGET-KØ.

## Notater om proveniens / integritet
- To Brage-URLer (NIBIO, NMBU) var døde — domenet `*.brage.unit.no` er avviklet og migrert til NVA (nva.sikt.no). Løst via `hdl.handle.net` → NVA-API. NMBU-fulltekst ligger bak NVA-auth (kun metadata/abstract hentet).
- Alle volum-/andelstall fra selskaps-/pressekilder er merket `basis: aktoropplysning` med `systemBoundary`. Cibus (dato/EUR) og NREP (år) har flaggede avvik mot manifest — se `limitations` i hver post.
- Ingen skriving til corpus/register/DB. Alt provisorisk i `research/innhenting-2026-08-05/`.
