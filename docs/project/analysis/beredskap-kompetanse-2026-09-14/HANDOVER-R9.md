# Overlevering: fra kontrollert research til sammenstilling (R9)

15. september 2026. Til neste økt, som skal gjennomgå og analysere kunnskapsgrunnlaget om kompetanse og beredskap i nordiske matsystemer.

## Status

| Hva | Status |
|---|---|
| Runde 1 (ChatGPT P1–P6 og Grok G1–G6) | Kontrollert. PR #424, åpen, gren `claude/beredskap-kompetanse-research-c34f2a` |
| Runde 2 (R1–R8 og ekstra oversikt X) | Kontrollert. PR #426, åpen, gren `claude/beredskap-kompetanse-runde2`. Grenen bygger på #424, så diffen viser runde 1 til #424 er merget |
| R9 sammenstilling og analyse | **Ikke gjort.** Gjøres i repoet, ikke i ChatGPT |
| Begge PR-er | Base `main`, mergeable. Merge #424 før #426, og sjekk at #426 fortsatt har `base=main` |

## Tall

| | Kontrollert | Behold | Rett | Forkast | Ikke verifisert |
|---|---:|---:|---:|---:|---:|
| Runde 1 ChatGPT | 314 | 269 | 43 | 0 | 2 |
| Runde 1 Grok | 80 | 57 | 20 | 0 | 1 (+2 intern kilde) |
| Runde 2 (R1–R8, X) | 313 | 206 | 106 | 1 | 0 |

Runde 1 har 22 hovedinnsikter, runde 2 har 30.

## Filer å lese først

1. [KUNNSKAPSGRUNNLAG.md](../../../../research/beredskap-kompetanse-2026-09-15/KUNNSKAPSGRUNNLAG.md) (runde 1)
2. [KUNNSKAPSGRUNNLAG-RUNDE2.md](../../../../research/beredskap-kompetanse-runde2/KUNNSKAPSGRUNNLAG-RUNDE2.md) (runde 2: innsikter, endringer mot runde 1, motstrid, rettelser, hull)
3. [OVERSIKT runde 1](../../../../research/beredskap-kompetanse-2026-09-15/OVERSIKT.md) og [OVERSIKT runde 2](../../../../research/beredskap-kompetanse-runde2/OVERSIKT.md) (metode, tall, grenser)
4. R9-avsnittet nederst i [RUNDE2-R5-R8-PROMPTER.md](RUNDE2-R5-R8-PROMPTER.md) (oppgavebeskrivelsen)

Når en påstand må sjekkes: `kontroll/` i begge mappene har dom, rettelse og URL per ID. `pastander-samlet.csv` i hver mappe har rådataene.

## Ting å vite

- **ID-er:** `A:P2-NO-010` og `G3-SE-003` er runde 1. `R1-SE-002` osv. er rader i CSV-en for runde 2. `R2-TEKST-001`, `R7-012` og `X-024` finnes bare i kontrollfilene, fordi R7 og X kom uten påstandstabell.
- **CSV runde 2:** kolonnen `status` finnes bare for R5 og R8, og `niva` (bruksnivå 1–5) bare for R6.
- **Rettelser gjelder foran rapportene.** Rapportene i `rapporter/`, `chatgpt/` og `grok/` er lagret uendret og inneholder feil som bare er rettet i kontroll- og kunnskapsgrunnlagsfilene.
- **Feil som gikk igjen:** sitater som ikke var ordrette, publiseringsår forvekslet med dataår, «sist oppdatert» lest som publisering, planer og påmeldinger omtalt som gjennomført (TIETO26, norsk drivstoffprioritering), metodebeskrivelser lest som funn (Nordic Food Alert), opphevede lover (finsk 1390/1992), feil nevner (hjemmetjeneste mot matmottakere) og bransjeundersøkelser med gamle data.
- **Ikke kall noen fil `README.md`**, fordi det skaper kollisjon i korpuslokatoren.
- **Verifisering:** `git diff --check`, relative lenker og `npm run audit:research-artifacts -- --base=origin/main` med Homebrew-node på PATH og `LANG=en_US.UTF-8`.
- **Eksisterende lenkefeil (ikke fra denne økten):** `STATUS-OG-FOKUS.md` i denne mappen lenker til en møtefil som ikke finnes i worktreen.
- **Nettkilder:** ft.dk og retsinformation.dk gir ofte 403. Web.archive.org og `retsinformation.dk/api/pdf/…` fungerte. Nettleserpanelet var ikke alltid tilgjengelig for underagenter.

## Neste steg (R9)

1. Gjennomgang: overlapp, motstrid, uklare formuleringer og svake funn (én kilde, selvrapportert, lite utvalg, arrangørens egen vurdering).
2. Analyse på tvers av tema og land, med skillene fra runde 1 (kapasitet, handling og utfall; krav, aktivitet og effekt; antall og erstattbarhet) og K1–K4.
3. Skriv `research/beredskap-kompetanse-sammenstilling/KUNNSKAPSGRUNNLAG-SAMLET.md` og `OVERSIKT.md`, og legg en kort lenke øverst i begge kunnskapsgrunnlagene.
4. Verifiser, commit, push og åpne PR mot `main` som bygger på #426. Ikke merge.

Ingen ny nettresearch, bortsett fra å åpne en kilde når to kontrollerte filer er i motstrid. Materialet er internt; ekstern bruk krever claim-lock og kildepolicy.

## Beslutninger som ligger hos Gabriel

- Rekkefølge og tidspunkt for merge av #424 og #426.
- Valget mellom NordForsk tema 1 og tema 2 (se neste steg i runde 1-oversikten). Det ligger utenfor R9.
