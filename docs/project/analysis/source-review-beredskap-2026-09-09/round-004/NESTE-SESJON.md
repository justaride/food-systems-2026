# Neste sesjon etter runde 004

Les README, WHITEPAPER-TILLEGG, status-delta og verification først. Arbeidet bygger lokalt på `52d410158341cce852be1b7c0e9c17d3629b5633` på `codex/beredskap-round-003`. Kontroller faktisk HEAD, status og worktrees; ikke skriv over eldre analyse- eller kildehistorikk. Ingen push, PR eller release inngår.

Privat rot:

`/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a084fe-a36c-7fb1-86c2-4387109e3c36/round-004`

- `report.html`: selvstendig rapport. `artifact.json`: fullstendig rapportgrunnlag. Bruk den eksisterende fullversjonen ved senere rapportendring.
- `eurostat/input-manifest.json`: eksakte forespørsler og SHA256-bundne originalresponser. `panel-response.json` og `norway-common-wheat-response.json` er separate kilder.
- `analysis-run-002/analysis.json`: siste beregning. `analysis-run-001` er bevart som tidligere kontrollgrunnlag; ny kjøring må ha en ny outputmappe.
- `review-packet.json`, `review-baseline.json`, `round004-queue.json` og `review-queue-run-001/summary.json`: 26 avgrensede interne kvitteringer. De beviser integritet, ikke semantisk sannhet eller menneskelig review.
- `norway`, `dk-fi`, `method`: nasjonale originaler, metadata, forespørsler og begrenset lesing av studier og vedlegg.
- `sql-crosscheck.json`: separat rekalkulering av 72 prosentverdier. `notebook-execution.json`: nøyaktig hvilken kjøremåte følgeheftet er testet med.

Kjør `python3 scripts/analyze-beredskap-cereals.py --manifest <privat input-manifest.json> --output <ny privat mappe>`. Følgeheftet bruker miljøvariabelen `CEREAL_INPUT_MANIFEST` og kjøres fra repository. Verktøyet henter ikke nettdata. Ved ny kildeversjon: legg til nye bytes, nye kildehashverdier og datert analyse; ikke skriv over denne snapshoten.

Neste avgrensede steg er enten den mottakerbundne C1-prøven eller en presis definisjonsbro for Finland. For C1 trengs varekvalitet, tidsfrist, behov, disponibelt lager, foredling og transport for et norsk og et nordisk alternativ. For Finland trengs kildeversjon/metode som forklarer de to konkrete 2018-differansene. De fire undersøkte fôrartiklene åpnes bare igjen ved en ny konkret fulltekstkanal. En kontinuerlig modellbasert reviewtjeneste er fortsatt en egen oppgave.

Alle opprinnelige mandat-, partner-, finansierings-, menneske- og publiseringsgrenser består. Ingen lokale tester må rapporteres som ny CI-, migrasjons-, runtime- eller UI-verifikasjon.
