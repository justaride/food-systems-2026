---
tittel: "Handoff til neste session — nordisk sirkularitetsrapport v1.2"
status: aktiv
eier: Gabriel
dato: 2026-04-30
fra_versjon: v1.1 (komplett)
til_versjon: v1.2 (under arbeid)
viktig: "Bruker har sagt: ingen touchpoints med Jan Thomas eller Cathrine. Vi jobber selvstendig fram til ferdig rapport."
---

# Handoff — fortsett v1.2 i ny session

## Status etter denne sesjonen (2026-04-30)

### Komplett:
- ✅ **v1.0**: HTML-rapport + MD-appendiks bygget fra plan → baseline → batches → innsiktsmotor → syntese → skriving (5 faser)
- ✅ **v1.1**: A1-A5 research lukket, APA7-light kildebibliotek, soya-laundering nedgradert, FI-fôr verifisert som Valio-soya-fase-ut
- ✅ **Teaser** til Jan Thomas skrevet (men IKKE sendt — bruker sa ingen touchpoints)

### Filer levert (sti relativ til repo):
| Fil | Status |
|---|---|
| `public/reports/nordisk-sirkularitetsrapport-2026-05.html` | v1.1, 47 KB, 8 seksjoner, 4 145 ord |
| `docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md` | v1.1, 30 KB, kildebibliotek inkludert |
| `teaser-jan-thomas-2026-04-30.md` | Skrevet men IKKE sendt |
| `research/norden/sirkularitet-sprint-2026-05/` | 14 filer (3 baselines + 8 batches + innsiktsmotor + syntese + plan + handoff) |
| `research/v1-1/` | A1-A5 research-notater |

## Bruker-instruks for neste session

> "Vi skal fortsette i neste session og jobbe videre og gjennomarbeide hele rapporten **uten touchpoints med Jan Thomas eller Cathrine**, og gjøre ferdig rapporten med de nødvendige sessione det krever."

**Tolkning:**
- Ikke send teaser eller rapport eksternt før eksplisitt godkjent
- Jobb selvstendig fram til ferdig produkt
- Kvalitet > fart
- Antagelig flere sessions før ferdig

## v1.2 arbeidsplan (10 faser)

### Phase 1: Reverifisering av høy-risiko-påstander (task #16)
- Audit hver påstand i HTML-rapport mot primærkilde
- Marker: ✅ direkte primær, 🟡 sekundær men sjekkbar, 🔴 svak/manglende
- Output: `research/v1-2/claim-audit.md` + appendiks-tabell

### Phase 2: Tre kritiske primærsjekker fra A5 (task #17)
Åpne valideringspunkter fra A5-soya-laundering:
- (a) IFRO/KU 2025 — eksakt tittel, side, DOI eller URL for "DK 6% sporbarhet"-tallet
- (b) EUR-Lex Regulation (EU) 2023/1115 Annex I — bekreft direkte at akvakultur ikke er inkludert (kritisk for CD-3)
- (c) Stortingsproposisjon-status — er soya-unntaket fra delvis EØS-implementering vedtatt etter 2026-01-09-høringen?

Disse tre sjekkene er **must-have** for å holde CD-3-formuleringen i v1.2.

### Phase 3: A6 Forbruksbasert matfotavtrykk (task #18)
- Eurostat consumption footprint per nordisk land
- EXIOBASE-baserte studier (Aalto, Chalmers)
- Springmann et al. EAT-Lancet-data
- Lukk Vision 2030-indikator 1.1.2
- Output: `research/v1-2/A6-matfotavtrykk.md` + integrere i §6 og §2

### Phase 4: A7 Marine indikatorer (task #19)
- HELCOM HEAT-indeks for Østersjø-eutrofiering
- ICES Arctic/Barents fiskebestander
- Havforskningsinstituttet (NO)
- Lukk Vision 2030-indikatorer 1.5.2 og 1.5.3
- Sandbox tillater www.hi.no — bruk denne

### Phase 5: Subsidier per land (task #20)
- NO PSE 59% er kjent (OECD 2025)
- SE/DK/FI/IS-tall + struktur trengs
- EU CAP-data: https://agriculture.ec.europa.eu/
- Nordregio
- Spesielt **øko-spesifikke subsidier** (kobler tilbake til CD-1 og Foregangsområde 5)

### Phase 6: Substansutbygging Foregangsområde 1-5 (task #21)
Hver av de 5 foregangsområdene utvides med:
- (a) Hvem leder i hvert nordisk land (institusjonell ansvar)
- (b) Hvilke regulatoriske/politiske hindre
- (c) Tre konkrete første-skritt-forslag
- (d) Utfallsmål 2027 (KPI hvor mulig)

Output: oppdatert HTML §5 med dypere "implementeringssti" per område.

### Phase 7: Selvkritikk-seksjon (task #22)
Ny §9 i HTML "Selvkritikk":
- Hva rapporten IKKE klarer å si
- Hvor vi er svake (NO-overrepresentasjon i CD; IS-svak data; ekstern-validering ikke gjort)
- Hvor tolkningen kan være partisk
- Hvordan en kritisk leser bør vurdere våre påstander
- Tre kontroversielle aspekter eksplisitt adressert

### Phase 8: T3 ekstern-vs-intern diff (task #23)
- Kjør samme spørsmål som rapporten besvarer mot frittstående LLM (uten plattform-data)
- Sammenlign systematisk
- Identifiser hvor vår plattform gir avvikende/mer presise/mer kontroversielle svar
- Demonstrerer plattform-verdien (det Jan Thomas etterlyste — "formen på prosjektet")
- Output: `research/v1-2/T3-ekstern-vs-intern.md` + appendiks-seksjon

### Phase 9: Visualiseringer og lesbarhet (task #24)
HTML-forbedringer:
- Bedre visuelt hierarki
- Inline grafikk for cross-tab og score-tabeller (SVG eller CSS-baserte)
- Sticky-nav med fremdrifts-indikator
- Print-CSS-optimalisering
- Executive summary-lenke øverst

### Phase 10: Sluttrevisjon og v1.2-publisering (task #25)
- Endelig redaksjonell pass
- Kontroll mot alle akseptkriterier i v1.1-plan-og-kildestandard.md
- Spot-check 20 tilfeldige påstander
- Versjonsnummer v1.1 → v1.2
- Klart for ekstern publisering uten touchpoint

## Tasks-system

10 v1.2-tasks satt opp (#16-#25). Tidligere tasks #1-#5 (v1.0) og #6-#15 (v1.1) er completed.

```
TaskList for å se status
TaskUpdate for å markere in_progress og completed
```

## Hvor det er sandbox-rasjonell tilgang

Allerede i sandbox-allowlist (kan bruke direkte):
- statdb.luke.fi, stat.luke.fi, pxdata.stat.fi
- www.landbruksdirektoratet.no, www.regjeringen.no, www.helsedirektoratet.no
- www.anskaffelser.no, www.debio.no, www.matvett.no
- www.hi.no, www.sintef.no, norsus.no
- food.ec.europa.eu, ec.europa.eu, agriculture.ec.europa.eu (sjekk)
- pub.norden.org, pub.epsilon.slu.se, helda.helsinki.fi
- en.kfst.dk, www.skm.dk
- nibio.brage.unit.no, ruralis.no, orbit.dtu.dk

Trenger sandbox-utvidelse hvis:
- HELCOM-data direkte (helcom.fi)
- ICES-data (ices.dk)
- EUR-Lex (eur-lex.europa.eu)
- IFRO/KU originalside (ifro.ku.dk)
- Stortingsproposisjon (stortinget.no)

## Kontroversielle påstander å være årvåken på

Disse må holdes nøye revurdert i v1.2 med primærkilde-sjekk:

1. **CD-1 (NO øko = tilbud-flaskehals)** — sterkt verifisert i A2; ikke endre uten ny data
2. **CD-2 (NO selvforsyning fiksjon)** — bygger på NIBIO 2024 forel. tall; sjekk om endelige tall er publisert
3. **CD-3 (DK 6% sporbarhet + EU-norsk asymmetri)** — krever Phase 2-sjekkene (a), (b), (c)
4. **CD-4 (NOK 4,9 mrd-bot endret ikke struktur)** — sterk; ikke endre
5. **CD-5 (NO 89% restråstoff, 7% til mat)** — sterk SINTEF/FHF; ikke endre
6. **CD-6 (SE øko-leder fallende)** — sterk Jordbruksverket + Ekomatcentrum; ikke endre
7. **CD-7 (FI-DK 6x matsvinn = måling)** — krever harmonisert metode-data; vurder svekkelse hvis ikke sjekkbart

## Anbefalt rekkefølge for neste session

1. **Start med Phase 2** — de tre primærsjekkene fra A5 — siden de kan endre CD-3-formulering tilbake hvis (a)-(c) avslører noe nytt
2. **Phase 1** parallelt — claim-audit kan kjøres som strukturert agent-sjekk
3. **Phase 6** (substansutbygging) — gir mest verdi for "ferdig" rapport
4. **Phase 7** (selvkritikk) — trenger ikke ekstern data, kan gjøres når som helst
5. **Phase 8** (T3 diff) — kan kjøre uavhengig
6. **Phase 3-5** (A6/A7/subsidier) — gir mer dybde, men ikke kritisk for "ferdig"
7. **Phase 9** (visualisering) — siste polering
8. **Phase 10** — sluttrevisjon

## Akseptkriterier for v1.2 (utvidet fra v1.1)

- [ ] Alle påstander har primærkilde dokumentert (fra Phase 1)
- [ ] CD-3 enten verifisert eller reformulert med oppdaterte primær-sjekker
- [ ] Vision 2030-gap lukket eller eksplisitt deferred
- [ ] Selvkritikk-seksjon adresserer NO-overrepresentasjon, IS-svakhet, og kontroversielle påstander
- [ ] T3-diff demonstrerer plattform-merverdi
- [ ] Foregangsområder har konkrete første-skritt + utfallsmål
- [ ] HTML rendrer feilfritt med utvidede visualiseringer
- [ ] APA7-light gjennomført konsekvent
- [ ] Kildebibliotek alfabetisk og komplett

## Memory-notater for neste session

`/Users/gabrielboen/.claude/projects/-Users-gabrielboen-Documents-Food-Systems-2026/memory/project_nordisk_sirkularitetsrapport_2026_05.md` er oppdatert med v1.1-status. Oppdater til v1.2 når Phase 1-10 er ferdige.

## Tidsbruk-estimat

- Phase 1: 2-3 timer
- Phase 2: 1-2 timer (3 målrettede primærsjekker)
- Phase 3: 2-3 timer (Eurostat consumption footprint research)
- Phase 4: 2-3 timer (HELCOM + ICES)
- Phase 5: 2-3 timer (CAP-data per land)
- Phase 6: 3-4 timer (substansutbygging er kompleks)
- Phase 7: 1-2 timer (selvkritikk er korte men gjennomtenkt)
- Phase 8: 1-2 timer (T3-diff)
- Phase 9: 2-3 timer (visualiseringer)
- Phase 10: 1-2 timer (sluttrevisjon)

**Totalt: 17-27 timer** distribuert over flere sessions.

## Neste session — startpunkt

```
1. Les denne handoff-fila først
2. TaskList for å se v1.2-tasks
3. Start med Phase 2 (kritiske primærsjekker) eller Phase 1 (claim-audit) — begge er stortest impact
4. Kjør research-agent eller bash/WebFetch direkte
5. Oppdater HTML + appendiks fortløpende
6. Marker tasks completed underveis
```

Lykke til. Du har 10 tasks, en plan, en kjent baseline, og ingen touchpoint-pliktelser.
