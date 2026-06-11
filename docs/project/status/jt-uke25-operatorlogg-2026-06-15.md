---
tittel: JT uke 25 operatorlogg
status: Klar til utfylling
eier: Gabriel
dato: 2026-06-15
opprettet: 2026-06-11
scope: Operativ logg for møtebooking, DASK-utsending, Port E/Thea-aktivering og vedtaksføring i uke 25.
bruksregel: Ikke ekstern outreach. Ingen rad under gjør at noe er sendt, vedtatt, publisert eller eksternt godkjent. Fyll først etter faktisk handling eller skriftlig/møtebasert beslutning.
relaterte_filer:
  - docs/project/status/jt-uke25-sendepakke-2026-06-15.md
  - docs/project/status/jt-moteinvitasjon-uke-25-2026-06-15.md
  - docs/project/status/jt-statusnotat-uke-25-2026-06-15.md
  - docs/project/status/port-e-event-go-uke-25-2026-06-15.md
  - docs/project/status/food-tg-start-her-2026-06-15.md
  - docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md
  - docs/project/mandates/decision-log-food-tg.md
  - docs/meetings/MØTEOVERSIKT.md
---

# JT uke 25 operatorlogg

Denne loggen er broen mellom sendepakken og faktisk gjennomføring. Den skal gjøre det mulig å se om møtebooking, vedlegg, DASK-0906-001/002, Port E, Thea-aktivering og beslutningslogging er gjort - uten å late som at noe er gjort før det faktisk er gjort.

## 1. Status akkurat nå

| Arbeidssteg | Status | Eier | Bevis som kreves før status løftes |
|---|---|---|---|
| Møtebooking JT/Einar/Thea | ikke sendt | Gabriel | Sendetidspunkt, mottakere og foreslåtte slots. |
| Vedlegg/pre-read | ikke sendt | Gabriel | Lenker eller filer som faktisk ble delt. |
| Minimumsvedtak | ikke vedtatt | JT/TG | Ja/endring/nei i møte eller skriftlig. |
| H1/H2 | ikke vedtatt | JT/Einar | Bekreftet leveransetolkning eller eksplisitt endring. |
| Port E | ikke vedtatt | JT/Einar/Thea | Valg A/B/C, dato/uke, format, vertskap og Thea-aktivering. |
| DASK-0906-001 | ikke sendt | Gabriel | Godkjenning fra Sak 4 og sendeloggrad. |
| DASK-0906-002 | ikke sendt | Gabriel | Godkjenning fra Sak 4 og sendeloggrad. |
| PR #159 | PR #159 holdes draft | Gabriel | G-06/G-10/G-11 eksplisitt godkjent eller endret. |

## 2. Sendeloggen

Fyll én rad per faktisk sending. DASK er intern dokumentinnhenting, ikke ekstern outreach. Hvis samme e-post dekker flere handlinger, lag likevel egne rader for sporbarhet.

| Logg-ID | Handling | Planlagt mottaker | Faktisk mottaker | Sendt dato/tid | Vedlegg/lenker | Status | Neste handling |
|---|---|---|---|---|---|---|---|
| SEND-W25-001 | Møtebooking JT/Einar/Thea | JT, Einar, Thea |  |  | `docs/project/status/jt-moteinvitasjon-uke-25-2026-06-15.md`; `docs/project/status/jt-uke25-sendepakke-2026-06-15.md` | ikke sendt | Send eller velg skriftlig beslutningsløp. |
| SEND-W25-002 | Pre-read | JT, Einar, Thea |  |  | `docs/project/status/jt-statusnotat-uke-25-2026-06-15.md`; `docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md`; `docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.md`; `docs/project/status/port-e-event-go-uke-25-2026-06-15.md` | ikke sendt | Send sammen med møtebooking eller som separat oppfølging. |
| SEND-W25-003 | DASK-0906-001 | JT/Cathrine/Einar/NCH/WCEF/Natural State-dokumenteier |  |  | DASK-0906-001 tekst i `docs/project/status/jt-uke25-sendepakke-2026-06-15.md` | ikke sendt | Send bare etter Sak 4-godkjenning. |
| SEND-W25-004 | DASK-0906-002 | JT/Cathrine/Einar/NCH/WCEF/Natural State-dokumenteier |  |  | DASK-0906-002 tekst i `docs/project/status/jt-uke25-sendepakke-2026-06-15.md` | ikke sendt | Send bare etter Sak 4-godkjenning. |

## 3. Vedtak som skal føres

Når vedtak foreligger, logg samme dag i `decision-log-food-tg.md`. Hvis vedtaket skjer i møte, legg også inn møtereferat eller rad i `MØTEOVERSIKT` innen 48 timer.

| Vedtak | Status | Foreslått eier | Føringssted | Må inneholde |
|---|---|---|---|---|
| Minimumsvedtak casekort | ikke vedtatt | JT/TG | `decision-log-food-tg.md` | Valgt alternativ A/B/C/D og eventuelle avgrensninger. |
| H1/H2 | ikke vedtatt | JT/Einar | `decision-log-food-tg.md` | Om H1-programleveranse innen 31.07.2026 bekreftes eller endres. |
| Port E | ikke vedtatt | JT/Einar/Thea | `decision-log-food-tg.md`; `docs/project/status/port-e-event-go-uke-25-2026-06-15.md` | Valg A/B/C, uke/dato, format, vertskap, språk, Thea-aktivering og fallback. |
| DASK-0906-001/002 | ikke vedtatt | JT/Gabriel | `decision-log-food-tg.md`; responslogg under | Om intern dokumentask er godkjent. Ikke ekstern outreach. |
| G-06/G-10/G-11 | ikke vedtatt | Gabriel | PR #159 review / `decision-log-food-tg.md` | Godkjent eller endret før PR #159 tas ut av draft. |

## 4. Responslogg for DASK

Ikke oppdater casekort, PCQ, source-shortlist eller claim-lock uten en utfylt responsrad. RESP-0906-001 og RESP-0906-002 er reservert for de to uke 25-askene.

| Respons-ID | Ask-ID | Dato | Svar fra | Rolle | Dokument/kilde | Status | Bruksrett | Påvirker | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| RESP-0906-001 | DASK-0906-001 |  |  |  |  | Bekrefter / delvis / avkrefter / ukjent / kan ikke deles | Intern / ekstern omtale / sitat / bakgrunn / ikke bruk | DRO-0906-001 / SRC-0906-001 / PCQ-0906-001 / claim-lock |  |
| RESP-0906-002 | DASK-0906-002 |  |  |  |  | Bekrefter / delvis / avkrefter / ukjent / kan ikke deles | Intern / ekstern omtale / sitat / bakgrunn / ikke bruk | DRO-0906-002 / SRC-0906-002 / PCQ-0906-002 / claim-lock |  |

## 5. Stoppsignaler

1. Hvis møtebooking ikke får uke 25-slot, eskaler til skriftlig beslutningsløp med samme fire saker.
2. Hvis møtet blir orientering uten ja/endring/nei, behold alle vedtak som `ikke vedtatt`.
3. DASK-0906-001 og DASK-0906-002 sendes ikke før Sak 4 er godkjent.
4. AASK-spørsmål sendes ikke før minimumsvedtak eller egen outreach-gate.
5. Ingen eventtekst, påmelding, opptak eller publisert oppsummering brukes eksternt før Port F, claim-lock, citable_external-filter, operatorsekvens, prod-data og deploy er kontrollert.
6. PR #159 holdes draft til G-06/G-10/G-11 er eksplisitt godkjent eller endret.
