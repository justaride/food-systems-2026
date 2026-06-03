# Nordisk sirkularitetsrapport — v1.3 oppdateringsnotat

**Dato:** 2026-06-03
**Status:** Forslag (diff-liste) — INGEN endringer er gjort i rapporten ennå
**Kilde-rapport:** `public/reports/nordisk-sirkularitetsrapport-2026-05.html` (v1.2, analytisk innhold frosset ~30.04.2026)
**Appendiks:** `docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md`
**Eier / bestiller:** Gabriel B Freeman / Jan Thomas (samtale 29.04.2026), for transition-gruppa for nordisk matsystem (Food TG)

---

## Hvorfor v1.3

Rapportens analytiske innhold er reelt frosset ved sprinten 28.–30.04.2026 (v1.0→v1.1→v1.2, alle samme dato). Git viser kun to senere berøringer av HTML-en: 15.05 (`d5d8671`) og 20.05 (`080b567`), begge små konsistens-/citable-sveip (9 og 5 linjer), ikke ny analyse.

Siden da (~5 uker) har prosjektet fått infrastruktur som direkte berører sirkularitet og som rapporten ikke kunne reflektere:

- **20.05** — citable gates merge: `SourceCitation`/`FieldCitation` (~2,6k + ~244k rader), citation-readiness, overclaim-audit.
- **~29.05 (PR #104–#112)** — sirkulær flytmodell (FlowEdge + evidens-status, `material-flows.json`, Sankey/nettverk, «materialflyt»-tab på `/sirkularitet`), romlig flytmodell/kart (CircularFlowLayer), Kalundborg-symbiose (ekte flyt + observert gips-strøm), **R-ladder kanonisert til Potting 2017 (#111)**, coverage-badges + overclaim-audit + `/kilder`-oversikt.
- **03.06** — import av KS matsystem-veileder + **Re:Source (SE) MFA-metode** (COGS→vekt, SNI) + 6 norske kommune-caser; Food TG prosjektoppdatering 26.05→02.06 + method-transfer QA-closure 28.05.

**Sannhetskilde for v1.3:** plattformens data under `public/data/food-systems/` (`material-flows.json`, `circular-nodes.geojson`, `circularity-loops.json`, `r9-matrix.json`, `r9-kpi-catalog.json`) + `src/lib/citations/` + research-notatene under `research/bibliotek/sirkularitet/`. Rapporten skal ikke innføre tall som ikke står der.

---

## Funn under kartlegging (scope-korreksjoner)

- **Rapporten inneholder ingen R-ladder-/R-tall-klassifisering** (verifisert: grep på `R[0-9]`, `Potting`, `Matsentralen`, `pant`, `ombruk`, `gjenvinning`, `nutrient` traff kun «CR3» og «recycling»). Potting-kanoniseringen (#111) krever derfor **ingen retro-fiks** i rapporten. Punkt **P2** er nedjustert til en framoverlent regel (gjelder kun hvis P4 innfører loop-/R-språk).
- **Rapporten har sitt eget datakvalitetsflagg-system** (`primary_api`, `primary_report`, `primary_estimate`, `actor_data`, `needs_primary_check`; definert §8 linje 1259–1266, brukt inline f.eks. §2 linje 641). Dette er et annet system enn plattformens `SourceCitation`/`FieldCitation`. P3 handler om å **forsone** de to, ikke erstatte.
- **Fire Vision 2030-gap står fortsatt åpne** (§6, uten «lukket»-pill): 1.3.1 Material footprint (linje 1161), 1.4.3 Agricultural bird index (1164), 2.2.2 Bioeconomy employment (1165), 3.3.2 Food affordability (1166).

---

## Prioritert rekkefølge

| # | Punkt | Innsats | Risiko | Verdi |
|---|-------|---------|--------|-------|
| P1 | Datostempel + versjonsstatus | Lav | Lav | Høy |
| P3 | Citable + coverage-kobling (+ lukk SK-7) | Middels | Lav | Høy |
| P7 | Lukk/defer åpne Vision 2030-gap | Lav | Lav | Middels |
| P4 | MFA / material-flyt-kobling | Middels–Høy | Middels | Høy |
| P5 | NO-bias + IS-tynnhet (SK-1/SK-2) | Høy | Middels | Middels |
| P2 | R-ladder (framoverlent, betinget av P4) | Lav | Lav | Lav |
| P6 | Send teaser / lukk loop mot Jan Thomas | Lav | — | Prosess |

**Anbefalt minste-pakke (lav risiko, høy verdi):** P1 + P3 + P7.

---

## Diff-liste

### P1 — Datostempel + versjonsstatus
- **Endring:**
  1. Bump `Versjon: v1.2` → `v1.3` og legg til en eksplisitt rad: `Innholdsdato: 30.04.2026 (analytisk frys) · oppdatert 03.06.2026`.
  2. Legg til én linje i meta-blokken / hero: «Tall gjenspeiler kildebildet pr 30.04.2026. v1.2 er gjeldende; v1.0/v1.1 skal ikke siteres.»
  3. Nytt avsnitt i §8: «v1.2 → v1.3 endringslogg».
- **Hvor:** meta-blokk linje **506–511** (`Versjon` @506, `Datagrunnlag` @510, `Kildestandard` @511); hero-eyebrow @436–437; §8 changelog etter linje **1298** (rett før «T3-merverdi» @1300).
- **Hvorfor:** 2024–2026-tall leses ellers som ferske. SK-6 (§9 linje 1366–1368) sier eksplisitt at v1.0/v1.1 ikke skal siteres — det bør stå synlig i toppen, ikke bare i selvkritikken.

### P2 — R-ladder (framoverlent, betinget)
- **Endring:** *Ingen retro-fiks.* Hvis P4 innfører loop-/sirkularitetsledd-språk, bruk de kanoniske Potting (2017)-klassifiseringene fra `r9-matrix.json` (f.eks. biogass = R9, pant = R3, redistribusjon/Matsentralen = R1, fôr-fra-rest = R7). Valgfritt: én setning i §4/§8 om at plattformens `/sirkularitet` nå bruker kanonisk R9/Potting.
- **Hvor:** kun relevant i nye avsnitt fra P4 (§4 linje 737–799, §5 Foregangsområde 4 «Biogass»).
- **Hvorfor:** unngå at en framtidig v1.3 gjeninnfører ikke-kanoniske R-tall etter at #111 ryddet plattformen. Ikke et problem i dagens tekst.

### P3 — Citable + coverage-kobling (+ lukk SK-7)
- **Endring:**
  1. Kjør rapportens 87 påstander gjennom `src/lib/citations/report-claim-audit.ts` + `citable-acceptance.ts`; map rapportens egne flagg (`primary_api`/`primary_report`/`needs_primary_check` …) mot `SourceCitation`/`FieldCitation`-status.
  2. Legg til en kort note i §8 «Datakvalitetsflagg» (linje 1259–1266) om at flaggene nå har formell backing i plattformens citable-gates, med peker til `/kilder` coverage-oversikt.
  3. Vurder coverage/overclaim-badge på de svakeste påstandene (geo/temporal/verification scope).
  4. **Lukk SK-7:** hent IFRO/KU-PDF-en fysisk (`https://curis.ku.dk/ws/portalfiles/portal/471376644/IFRO_Documentation_2025_01.pdf`) og bytt pressemelding-sitatet for «6 %»-tallet med sidetall-referanse. Sandbox-blokkeringen fra v1.2 gjelder ikke nødvendigvis nå.
- **Hvor:** §8 linje 1259–1266; §9 SK-7 @1372–1374; §2 inline-flagg @641.
- **Hvorfor:** rapporten ble skrevet før citable-infrastrukturen fantes; nå kan «alle påstander har sporbar kildelenke» (footer @1318) gjøres maskinelt etterprøvbart. SK-7 er det eneste gjenstående 🔴-forbeholdet som er trivielt lukkbart.

### P4 — MFA / material-flyt-kobling
- **Endring:**
  1. Der rapporten har kvalitative «loop»-/restråstoff-utsagn (f.eks. CD-5 «NO utnytter 89 % av marint restråstoff — kun 7 % blir mat», §3; biogass-volum i §4/§5), referer den kvantifiserte `material-flows.json` og den nye «materialflyt»-taben på `/sirkularitet`.
  2. Bruk Re:Source MFA-metoden (`research/bibliotek/sirkularitet/resource-regional-ressurskartlegging-metode-2026.md`) der masseflyt kan tallfestes (COGS→vekt, SNI-klassifisering).
  3. Referer Kalundborg-symbiosen (ekte romlig flyt + observert gips-strøm) som case for «observert» evidens-gradering.
  4. Vurder å bygge inn 1 inline-figur (Sankey/kart) eller en lenkeboks per relevant ledd.
- **Hvor:** §3 CD-5 (linje 651–736-blokken), §4 «kopibare modeller»/biogass @737–799, §5 Foregangsområde 4 «Biogass» (i §5 @800–1127).
- **Hvorfor:** rapportens premiss er «hvem leder hva» — MFA gir et faktisk masse-grunnlag for nettopp det, og flytmodellen gjør «utnyttelse vs høyverdi-utnyttelse» (T3-merverdi, §8 @1301) operasjonaliserbart.
- **Avhengighet:** utløser P2 (bruk kanonisk R-klassifisering i ny tekst).

### P5 — NO-bias + IS-tynnhet (SK-1 / SK-2)
- **Endring:** to alternativer (velg ett):
  - **(a) Kalibrering (lett):** styrk SK-1/SK-2-formuleringene og legg en synlig kalibreringsnote øverst i §3 («4 av 7 cases er NO — speiler datadybde, ikke paradoks-tetthet»).
  - **(b) Substans (tungt):** kjør en bevisst SE/FI/DK/IS-runde for å finne 1–2 nye ikke-NO dissonance-cases, og valider IS-tallene mot Hagstofa Íslands + Matvælastofnun.
- **Hvor:** §3 intro (@651), §9 SK-1 @1336–1338 og SK-2 @1342–1344.
- **Hvorfor:** rapportens største metodiske svakhet (egenerklært). (a) er ærlig og billig; (b) fjerner skjevheten reelt.

### P6 — Send teaser / lukk loop mot Jan Thomas
- **Endring:** avklar status på `teaser-jan-thomas-2026-04-30.md` (handoff sa «skrevet, ikke sendt»). Enten send, eller arkiver med begrunnelse. Ikke en rapport-edit, men en del av v1.3-closure.
- **Hvorfor:** unngå at en ferdig v1.3 ligger uformidlet hos bestiller.

### P7 — Lukk eller defer åpne Vision 2030-gap
- **Endring:** for hver av de fire åpne: enten lukk med data, eller merk eksplisitt «deferred v1.3 — [begrunnelse]» med samme pill-mønster som de lukkede.
  - 1.3.1 Material footprint
  - 1.4.3 Agricultural bird index
  - 2.2.2 Bioeconomy employment
  - 3.3.2 Food affordability
- **Hvor:** §6 linje **1161, 1164, 1165, 1166**; speil status i §7 statusmatrise (@1178–1239).
- **Hvorfor:** §6 viser i dag fire bare-tekst-gap uten status — leseren ser ikke om de er bevisst utelatt eller glemt.

---

## Utførelsessekvens (forslag)

1. **P1** (datostempel) — gjør først; rammer inn alt annet.
2. **P3** (citable + SK-7) — høy verdi, lav risiko; gjør rapportens kildepåstand etterprøvbar.
3. **P7** (Vision-gap) — rask opprydding i §6/§7.
4. **P4** (MFA/flyt) → utløser **P2** (kanonisk R i ny tekst).
5. **P5** (NO-bias) — velg (a) eller (b) avhengig av tidsbudsjett.
6. **P6** (teaser) — prosess-closure til slutt.

Etter hver edit-runde: regenerer PDF-en (Chrome headless A4 + `<details open>` + tabell-no-clip + ghostscript-komprimering, som beskrevet i forrige runde) og oppdater `public/reports/nordisk-sirkularitetsrapport-2026-05.pdf`.

---

## Akseptkriterier for v1.3

- [ ] Versjon = v1.3, innholdsdato + currency-note synlig i toppen (P1)
- [ ] v1.2→v1.3 endringslogg i §8 (P1)
- [ ] 87 påstander kjørt mot citable-gates; §8-flagg koblet til `SourceCitation`/`FieldCitation` (P3)
- [ ] SK-7 lukket (IFRO-PDF hentet, sidetall-referanse) ELLER eksplisitt fortsatt åpen med begrunnelse (P3)
- [ ] Alle fire åpne Vision 2030-gap enten lukket eller merket «deferred v1.3» (P7)
- [ ] Eventuell ny loop-/R-tekst bruker kanonisk Potting (2017) (P2/P4)
- [ ] NO-bias/IS adressert via (a) kalibrering eller (b) substans (P5)
- [ ] PDF regenerert og i synk med HTML
- [ ] HTML rendrer feilfritt (tabeller bryter, ingen klipping)

---

*Notatet er en plan, ikke en endring. Ingen filer utenfor dette notatet er rørt.*
