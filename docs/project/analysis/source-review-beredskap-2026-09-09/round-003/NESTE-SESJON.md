# Fortsett fra avsluttet runde003

Start med [README](README.md), [whitepaper-tillegg](WHITEPAPER-TILLEGG.md), [operativ restliste](operational-restlist.json), [nye gap](gap-intake.json) og [kontrollkvittering](verification.json). Branch: `codex/beredskap-round-003`, startet fra `1cb624a19d08058efaacf4013e53c102c384982c`. Kontroller faktisk HEAD/status før videre arbeid. Ingen push, PR eller ny release inngår.

Runde003 er gjennomført: 21 nye avgrensede vurderinger, 17 kildeversjoner, 8 analytiske kjeder, 15 kapittelstatusrader og fem testoppdrag. Fire fôrartikler har fortsatt konkrete fulltekstgap. 58 relevante Python-tester og køkjøringen for den nye pakken består. Ingen menneskelig review, DB, kanonisk data eller readiness er endret.

Den neste interne oppgaven er CLIM-G01: hent et avgrenset, harmoniserbart historisk datasett rundt2018 fra den identifiserte originalstudiens datavedlegg eller offisielle statistikk. Lag region×år×vekst med avling, areal, systemgrense, observasjonsperiode og missingness. Matkvalitet, egenbehov og eksportabel mengde skal stå ukjent når de ikke finnes. Ikke beregn nordisk tillegg fra arealandeler eller vannføringsstasjoner. Alternativt kan én mottakerbundet fosfor- eller måltidsmålepakke forberedes; faktisk drift/partnerkontakt er ikke utført eller bestilt.

Private originaler og alle kjøringer:

`/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a084fe-a36c-7fb1-86c2-4387109e3c36/round-003`

- `consolidated-v2/review-packet.json`: de21 nye vurderingene med hele originale observasjonsobjekter i baseline. `consolidated/` er bevart tidligere genereringsresultat.
- `round003-queue.json` og `review-queue-current-001/`: den nye pakkens faktiske kontroll; dokumentasjonsjobben er en overlappende delmengde.
- `review-queue-run-003/`: siste runnerkontroll av forrige rundes127 vurderinger. Ingen ny semantisk helgjennomgang implisert.
- `documentation/`: StatFin-forespørsel, metadata og originalrespons; SIFO- og Finlex-PDF-er. `statfin-metadata.raw` er et bevart400-svar; riktig metadatafil er `statfin-metadata-short.raw`.
- `consolidate-round003-v2.py`: navngitt generator for ny modell, reviewregister, kapittelstatus og oppdrag. Den ble kjørt lokalt med private filer tilgjengelig. Opprett ny runde og output ved ny analyse; ikke overskriv de forseglede pakkene.

Viktige korrigeringer: S004/95/2006 gjelder folkeregistrering; riktig Norge–Finland-tekst er55/2006. Avtalens artikkel1 avgrenser situasjonene og er ikke automatisk hjemmel for klimaavbrudd. SIFO-utgiverkopien er samme dokument som A3-S001. De15 StatFin-cellene stemmer, men metodebrudd2022 og generell økonomisk proxy består. NORSØK, Hylte og Bakke har eksplisitte kildeavvik som ikke skal repareres med antakelser.

Bevar alle historiske corpus-health-bytes, gamle kildeposter, private originaler og releasearkivet. Kandidatinnføring krever eksisterende append-writer. Prosjekt-/partneravklaringer stopper ikke intern analyse, men skal aldri registreres som gjort av KI.
