---
tittel: Food TG R13 — Batchrapport 06
dato: 2026-06-28
goal: Food TG Research OS Runde 13 (autonom)
batch: 06
prompter: R13-PROT-005, R13-AKTOR-001, R13-AKTOR-002, R13-AKTOR-003
regel: Ingen DB-skriving, ingen claims, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme
status: Intern mottaksrapport — ikke faktastemme
---

# Batchrapport 06 — Food TG R13

## Oppsummering

| Beslutning | Antall | IDer |
|---|---:|---|
| enrich | 4 | R13-PROT-005, R13-AKTOR-001, R13-AKTOR-002, R13-AKTOR-003 |
| park | 0 | — |
| actor-gate | 2 | R13-AKTOR-001, R13-AKTOR-002 |

## Mottaksrad-tabell (8 kolonner)

| ID | Tittel | Beslutning | Gate | Kildeklasse | Sterkeste kilde | Svakeste punkt | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-PROT-005 | Presisjonsfermentering og dyrket kjøtt | enrich | forstaelse | A (EFSA, Nofima, SINTEF, Vinnova, Lovdata) + B (selskapspressemeldinger, GFI-rapporter) + C (Mattilsynets stilling) | EFSA novel food topic page, 2026-05-06 | Mattilsynets eksplisitte norske posisjon om dyrket kjøtt ikke funnet; ingen norske presisjonsfermentering-selskaper identifisert | vent |
| R13-AKTOR-001 | Markedshager fra kandidat til verifisert | enrich | actor-gate | A (Brreg-verifiserte foretak); C (populasjonsestimat og organisasjonsmedlemskap) | Brreg Enhetsregisteret API, 2026-06-28 | Ingen av de to nye bransjeorganisasjonene har publisert nettside eller medlemsliste | vent |
| R13-AKTOR-002 | Andelslandbruk aktiv status per gård | enrich | actor-gate | B (aggregert telling), A (Brreg entity-level), C (Økoguiden per-gård) | Økologisk Norge, Om andelslandbruk, oppdatert 26.01.2026 | Økoguiden JavaScript-drevet — per-gård-liste for alle 90 gårder ikke hentet | vent |
| R13-AKTOR-003 | REKO-ringer oppdaterte tall | enrich | source-shortlist | B/C — alle tall aktørrapporterte eller avledet; ingen A-kilde med oppdatert statistikk | rekonorge.no/hva-er-reko, feb. 2022 (aktørrapportert) | Ingen REKO-spesifikk statistikk etter feb. 2022; REKO Norge (jan. 2025) ingen årsmelding publisert | vent |

## Per-target outcome

### R13-PROT-005 — Presisjonsfermentering og dyrket kjøtt

**Beslutning:** enrich → forstaelse (vent)

**Nøkkelfunn:**
- Realisert kommersielt volum for dyrket kjøtt og presisjonsfermenteringsproteiner (myse, kasein, ovalbumin) i EU og Norge er **null** per juni 2026.
- EU Novel Food: ingen godkjenninger for animalske proteiner via presisjonsfermentering. Gourmeys (FR) andekjøtt-søknad er eneste aktive EFSA-vurdering for dyrket kjøtt.
- Regulatorisk vei: Novel Food Regulation (EC 2015/2283) krever EFSA sikkerhetsgjennomgang. Tidshorisont 3–5+ år for eventuelle godkjenninger.
- Nordisk FoU-aktivitet reell men pre-kommersiell: Nofima ARRIVAL (norsk, celle-basert), SINTEF tare-til-dyrket-kjøtt, Re:meat (SE, Vinnova 2024), Melt&Marble (SE, fettpresisjonsfermentering), Onego Bio (FI, egg hvite ovalbumin via presisjonsfermentering). Alle rettet mot US-marked som første kommersiell inngang eller i laboratorium/demonstrasjonsfase.
- BioCraft Pet Nutrition (EU-godkjenning for dyrket kjøtt til kjæledyrfôr, okt. 2025) er eneste realiserte EU-inngangspunkt for dyrket kjøtt — men til kjæledyr, ikke human konsum.
- NoMy (NO, mycelium) og ENIFER (FI, PEKILO) er sopp-/gjærbasert, ikke presisjonsfermentering i tradisjonell forstand.
- Lovdata: Ny norsk forskrift om nye næringsmidler (2025-10-27-2133) gjennomfører EU Novel Food i norsk rett. Mattilsynets eksplisitte stilling til dyrket kjøtt er ikke offentliggjort.

**Ikke si:** presisjonsfermentering er godkjent i EU, dyrket kjøtt er nær EU-godkjenning, Re:meat/Melt&Marble produserer for salg, Singapore-godkjenning gjelder i EU/Norge.

---

### R13-AKTOR-001 — Markedshager fra kandidat til verifisert

**Beslutning:** enrich → actor-gate (vent)

**Nøkkelfunn:**
- Ingen nasjonal offentlig database over markedshager eksisterer i Norge. "Markedshager Norge" som organisasjon finnes ikke.
- **Småskala Grønt Norge** (org.nr. 937612265, FLI) ble registrert i Brreg 25. april 2026 med stiftelsesdato 25. mars 2026 — en helt ny nasjonal bransjeorganisasjon for småskala grøntprodusenter. Ingen nettside eller medlemsliste publisert per juni 2026.
- **Markedshager Vestland** (org.nr. 937119283, FLI) ble registrert i Brreg mai 2025 — regionalt nettverk for Vestland fylke. Ingen nettside funnet.
- Brreg-søk på "markedshage" gir 18 aktive foretak (A-klasse), spredt over alle regioner. Flertallet er enkeltpersonforetak (EPF). Én feil: Ål Markedshage Medgard (926452215) har NACE 74.110 (motedesign) — ikke en grøntprodusent til tross for navn.
- NLR har rådgivingstjenester for grønnsaker men ingen produsentliste. Matmerk mangler markedshage som produkt-/produksjonstype-kategori.
- Epistemisk gap: mange markedshager bruker ikke "markedshage" i foretaksnavnet → navnesøk undervurderer populasjonen.

**Ikke si:** Markedshager Norge er etablert, det finnes X markedshager i Norge (ukjent), Ål Markedshage Medgard er grøntprodusent.

---

### R13-AKTOR-002 — Andelslandbruk aktiv status per gård

**Beslutning:** enrich → actor-gate (vent)

**Nøkkelfunn:**
- **Økologisk Norge** oppgir 90 aktive andelslandbruk per januar 2026 (B-klasse, aktørrapportert), ned fra 93 i 2023. Eneste offentlig tilgjengelige aggregattall.
- **Brreg-søk** ("andelslandbruk" + "andelsgård"): 25 distinkte enheter uten konkurs/avvikling bekreftet (A-klasse). Brreg-søk fanger ~25–30 % av total populasjon — mange CSA-gårder er registrert under annet foretaksnavn.
- **Økoguiden** (Debio, categoryId=8467): JavaScript-drevet kart som ikke returnerer data uten nettleser-rendering. Eneste samlede per-gård-kilde er dermed utilgjengelig via API/statisk henting. Utgjør et strukturelt epistemisk gap.
- **andelslandbruk.no**: ikke aktiv/ikke funnet som separat nettsted — Økologisk Norge er primærkanal.
- Konkrete gårder verifisert via Brreg: Overlandel Andelslandbruk (Ås), Linderud Gård, Solborg Camphill, Høgseth Gård m.fl. 25 gårder med A-status via Brreg.
- Trend: antall ned fra 93 (2023) til 90 (2026-01) — B-klasse men konsistent.

**Ikke si:** det er 90/93 aktive andelslandbruk (uten B-klasse-forbehold), Brreg gir totalbilde, Økoguiden bekrefter aktiv status per navngitt gård.

---

### R13-AKTOR-003 — REKO-ringer oppdaterte tall

**Beslutning:** enrich → source-shortlist (vent)

**Nøkkelfunn:**
- **2022 er siste verifiserte ankerpunkt.** Primærkilden rekonorge.no/hva-er-reko oppgir (datert februar 2022): over 140 ringer, ~500 000 kunder, over 600 produsenter — alle aktørrapporterte B-kilde.
- **REKO Norge** (org.nr. 935 472 350) ble stiftet 12. januar 2025 som selvstendig nasjonal organisasjon. Første ordinære årsmøte var planlagt mars 2026. Ingen årsmelding eller oppdatert statistikk publisert per juni 2026.
- Forsideoppdatering på rekonorge.no sier "over 130 ringer" (uten dato) — mulig nedgang eller bare utdatert tekst. Kan ikke avgjøres.
- **Regjeringens Lokalmatrapport 2024** (Reiler Consulting): 725 mill. NOK samlet direktesalg av lokalmat 2023/2024 — aggregerer REKO + gårdsbutikker + bondens marked. Ingen REKO-spesifikk andel.
- **DIGIFOOD-prosjektet** (USN, prosjektslutt 2024): kan ha publisert sluttrapport med oppdaterte tall, men ikke funnet offentlig per juni 2026.
- Qualitativ indikator: en REKO-bonde sitert i Nationen (feb. 2025) melder om vekst i salg — men ingen kvantifisert statistikk.

**Ikke si:** REKO har 140 ringer i 2025, REKO har 500 000 kunder (som nåtidsfaktum), REKO omsetter X millioner kr, REKO vokste i 2024 (ingen statistikk).

---

## Oppfølgingspunkter

- **PROT-005**: Følg EFSA Novel Food-køen (Gourmey andekjøtt, eventuelle presisjonsfermentering-søknader). Kontakt Mattilsynet for stilling til dyrket kjøtt i norsk rett. Følg Teknologirådet-oppdatering (cellebasert landbruk rapport 2024). Ingen visualisering mulig.
- **AKTOR-001**: Kontakt Småskala Grønt Norge (org.nr. 937612265) for medlemsliste — er definitivt aktørspørsmål. NLR Rogaland og NLR Trøndelag kan gi regionale oversikter.
- **AKTOR-002**: Bruk en JavaScript-kjørende browser (Claude in Chrome eller Playwright) for å hente Økoguiden-kartet (categoryId=8467) og få per-gård-data. Kontakt Debio for produsentliste hvis API-løsning feiler.
- **AKTOR-003**: Kontakt REKO Norge (org.nr. 935 472 350) direkte for årsmelding/statistikk 2025. Sjekk USN DIGIFOOD-sluttrapport. Frem til da er 2022-tallene eneste tilgjengelige anker.
- Ingen av batch-06-outputene åpner ekstern claim, visualisering eller whitepaper-stemme.
