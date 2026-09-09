# Neste sesjon etter runde 005

Les først README, MAALEPROTOKOLL, DEFINISJONER, WHITEPAPER-TILLEGG, status-delta og verification i denne mappen. Kontroller faktisk Git-root, HEAD, status og worktrees. Runde 005 er bygget på begge analysecommittene `52d410158341cce852be1b7c0e9c17d3629b5633` og `9a4ae7d0d457b0d0c2e0f681b7595f942c40bd1b`, via fast-forward i en ny gren `codex/beredskap-round-005`. Finn runde 005-committen med `git log -1` i denne arbeidsgrenen. Ingen push, PR eller release inngår.

## Ferdig

- Én analytisk mottaker: Bakehuset Møllhausen Furuset. Én Q1-referanse og én 72-timersfrist i et felles, designet energi-/vann-/transportscenario.
- Bjølsen/Regal Hvetemel standard bulk 160105 versus Malmö/Nord Mills Bagarns Manitoba bulk 160585. Produktlikeverdighet og mottakerens bulkmottak er ikke bekreftet.
- Ti datagap med felter, enheter og dataeierroller; protokoll for allokering, partier, tidsfrister, mottak og faktisk bruk i baking.
- Reproduserbare, tydelig illustrative råvarekrav. Ingen reell leveranse, behov eller nordisk tilleggseffekt er tallfestet.
- Finsk nasjonal 2019-publisering og finsk metode lest; nytt SSB04610-uttrekk brukt mot norske avlingsvarsler. Alle åtte varsler og begge finske 2018-restene består.

## Privat kilde- og kjøringsrot

`/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a08531-1139-7b81-a008-7e9ca5eeca4d/round-005`

- `acquisition*.json`: klientkvitteringer; `acquire.py`: hjelp til innhenting. Ikke kjør den ukritisk på nytt: nye kildeversjoner skal ha nye filnavn/hashverdier.
- Originale HTML-/PDF-/API-filer, tekstuttrekk og tre visuelt kontrollerte PDF-sider er bevart her. Ingen råkilder er kopiert inn i Git.
- `analysis-run-003/calculations.json` er den leverte beregningsversjonen. Run 001/002 er tidligere utkast og bevares. Ny kjøring krever ny mappe.
- `predecessor-byte-baseline.json` binder alle 119 filer i forgjengerens private runde 004. Bevar disse byteidentisk.
- `notebook-runtime` er et isolert Python-miljø med nbformat, nbclient og ipykernel. `build-notebook.py` bygger og kjører følgeheftet; `notebook-execution.json` er kernelkvittering. Ingen brukerkernel er installert globalt.

Reproduser fra repository:

```sh
python3 scripts/analyze-beredskap-c1.py --manifest docs/project/analysis/source-review-beredskap-2026-09-09/round-005/input-manifest.json --output /en/ny/privat/outputmappe
python3 scripts/test-analyze-beredskap-c1.py
python3 scripts/test-analyze-beredskap-cereals.py
```

Manifestet har absolutte stier til frosne kilder og caseprofil. Ved flytting: lag en ny manifestkopi med oppdaterte stier og uendrede forventede kildehashverdier. Følgeheftet bruker `C1_REPO_ROOT` og eventuelt `C1_INPUT_MANIFEST`. Ikke presenter en CPython-cellekjøring som kernelkjøring; denne rundens faktiske kjøremåte står i verification.

## Første neste steg og presist stopp

**C1:** Vurder Q1-valget og datafeltene internt. Det første nødvendige eksterne underlaget er Furusets faktiske behovs-/reseptplan, lager og mottakskompatibilitet, sammen med gjeldende spesifikasjoner for de to produktinngangene. Deretter kan lagerallokering og drift i begge kjeder dokumenteres. Ingen bekreftet offentlig kilde i runde 005 gir disse operasjonelle feltene. Ikke erstatt dem med katalogkapasitet eller nasjonale årstall. Ingen kontakter er autorisert her.

**Finland:** Gå bare videre med et konkret datert 2018-overføringsgrunnlag, revisjonslogg eller kvantitativ tørr-/ferskkornbro for C1100/C1300 og G9100. Vekstspesifikk fukt er fortsatt mulig; én felles fuktfaktor alene er utilstrekkelig i kontrollen. Ikke anta at dette beviser en klassifikasjonsforklaring.

**Avlingsvarsler:** Eksakte stopp per rad står i DEFINISJONER. Norsk 2015 hvete er det største residualet. Svensk 2015 trenger uavrundede komponentarealer og aggregatmetode. Dansk 2015-bygg har en arealrest på−0,3 tusen ha EU−nasjonalt. Finnes ikke neste konkrete dokument, behold varselet og stopp. Ikke gjenta brede søk eller avsluttede fôrtilgangsforsøk.

## Grenser

Ingen human review, partneravtale, fysisk test, DB-skriving, kanonisk promotering, readiness-endring, publisering, push, PR, main-merge eller deployment er gjort eller inngår videre uten nytt mandat. C2–C5 og historiske kapittelvurderinger er uendret. Lokale tester og kernelkjøring er ikke CI-, migrasjons-, runtime- eller autentisert UI-bevis. Superpowers er av.
