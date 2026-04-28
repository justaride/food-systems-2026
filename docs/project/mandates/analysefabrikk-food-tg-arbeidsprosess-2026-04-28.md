---
tittel: "Food TG analysefabrikk - master/worker arbeidsprosess"
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Bruk masterprompten til å starte master session og workerpromptene til parallelle analyseøkter.
relaterte_filer:
  - docs/project/mandates/underlagsgjennomgang-food-tg-2026-04-28.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
---

# Food TG analysefabrikk - master/worker arbeidsprosess

## 1. Formål

Denne prosessen beskriver hvordan flere samtidige Codex-/subagent-sessions kan jobbe parallelt med underlagsanalyse, mens én master session samler, kvalitetssikrer og skriver funn inn i de kanoniske Food TG-dokumentene.

Målet er å få høy gjennomstrømming uten å miste kontroll på:

- hva som er kildebelagt
- hva som bare er hypotese
- hva som er siterbart eksternt
- hvilke claims som endres
- hva som må valideres med aktører

## 2. Prinsipp

Analysefabrikken har én master og flere workers.

| Rolle | Ansvar | Kan redigere |
|---|---|---|
| Master session | styrer kø, fordeler arbeid, leser worker-handoffs, konsoliderer EV/CL/Insight Pack | canonical docs etter kontroll |
| Worker session | leser avgrenset kildebatch, lager source cards, foreslår claim-/EV-effekt | kun egen handoff-fil eller bare chat-output |
| Verification session | spot-sjekker sitater, sidetall, URL, om kilden faktisk støtter claim | egen verifikasjonsrapport |

Hovedregel: Workers skal ikke redigere `evidence-matrix`, `claim-register`, `decision-memo`, `track-briefs` eller `Insight Pack`. De leverer rå analyse. Master integrerer.

## 3. Arbeidsflyt

```text
Master session
  -> definerer batcher og prompts
  -> starter/ber bruker starte workers i parallelle sessions
  -> mottar handoff per worker
  -> normaliserer source_id, EV-ID, CL-ID og status
  -> oppdaterer canonical dokumenter
  -> lager syntese og neste kø

Worker sessions
  -> leser bare tildelt scope
  -> fyller source cards / lettscoret manifest
  -> flagger claims, usikkerhet og valideringsspørsmål
  -> leverer handoff
```

## 4. Fil- og navnekonvensjon

Hvis workers skriver filer, skal de bare skrive under egen handoff-sti:

```text
docs/project/mandates/analysefabrikk-handoffs/
```

Filnavn:

```text
YYYY-MM-DD-worker-<spor>-<kort-scope>.md
```

Eksempler:

```text
2026-04-28-worker-a-feed-source-cards.md
2026-04-28-worker-b-sidestream-source-cards.md
2026-04-28-worker-c-adoption-source-cards.md
2026-04-28-worker-bred-triage-forskningsrunde-r2.md
2026-04-28-verification-citations-batch-1.md
```

Hvis sessions ikke skal skrive filer, kopieres handoff-teksten tilbake til master session.

## 5. Statusverdier

Alle workers må bruke disse statusene:

| Status | Betydning |
|---|---|
| `triagert` | sett raskt, scoret, ikke dyplest |
| `source-card` | vurdert med source-card-mal |
| `citation-ready` | sterk kilde, sitat/side/URL kontrollert |
| `needs-primary-check` | relevant, men må tilbake til primærkilde |
| `needs-actor-validation` | krever ekstern aktørrespons |
| `reject/archive` | lav relevans eller for svak kilde |

For claims brukes:

| Claim-effekt | Betydning |
|---|---|
| `styrker` | kilden støtter eksisterende claim |
| `svekker` | kilden motsier eller undergraver claim |
| `nyanserer` | claim bør presiseres |
| `ny claim` | ny påstand bør opprettes |
| `ikke egnet` | kilden bør ikke kobles til claim |

## 6. Master session ansvar

Master session skal:

1. Lese styringsdokumentene.
2. Velge batcher som er uavhengige.
3. Sikre at ingen workers har overlappende write-scope.
4. Holde en aktiv kø over batcher.
5. Kreve standard handoff-format.
6. Integrere bare funn som har tydelig kilde, status og claim-effekt.
7. Flytte tvilsomme funn til gap-/valideringsliste.
8. Oppdatere canonical dokumenter først etter konsolidering.

Master session skal ikke:

- dyplese alt selv
- blande worker-funn direkte inn uten kontroll
- markere noe `Validert eksternt` uten faktisk ekstern respons
- la interne synteser bli primærbevis

## 7. Worker session regler

Worker session skal:

1. Holde seg til tildelt scope.
2. Bruke `rg` og lese relevante filer direkte.
3. Ikke endre canonical dokumenter.
4. Ikke lage brede nye teorier uten kilde.
5. Ikke bruke Perplexity-/arbeidsnotater som siterbar evidens.
6. Alltid skille mellom `funn`, `tolkning`, `usikkerhet` og `neste handling`.
7. Returnere konkret handoff.

Worker session skal stoppe og flagge hvis:

- kilden mangler
- PDF/MD-versjon er uklar
- samme kilde finnes i duplikat
- claimet virker sterkere enn kilden tåler
- juridisk/regulatorisk tolkning krever manuell sjekk

## 8. Standard worker-handoff

Alle workers returnerer dette formatet:

```markdown
# Worker handoff - <scope>

## 1. Scope

- Tildelt batch:
- Filer/mapper lest:
- Filer ikke funnet:
- Arbeidstype: source-card / lett triage / verifikasjon

## 2. Kort konklusjon

3-6 punkt om hva master bør vite.

## 3. Source cards / triage rows

### <source_id eller foreslått source_id> - <tittel>

| Felt | Verdi |
|---|---|
| Filsti |  |
| Arkivlag | L1/L2/L3/L4/L5/L6 |
| Spor | A/B/C/baseline/actor/finance/policy |
| Kildetype | primær/sekundær/intern syntese/uvalidert/data/møte |
| Relevansscore | 1-5 |
| Evidensscore | 1-5 |
| Siterbarhet | Høy/Medium/Lav |
| Status | triagert/source-card/citation-ready/needs-primary-check/needs-actor-validation/reject |
| Neste handling |  |

### Beslutningsfunn

1. ...
2. ...
3. ...

### Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-X-000 | styrker/svekker/nyanserer/ny claim |  |

### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall |  |  |
| Case |  |  |
| Aktør |  |  |
| Regulering |  |  |
| KPI |  |  |
| Sitat/side |  |  |

### Usikkerhet

- ...

### Valideringsspørsmål

- ...

## 4. Nye kandidater til masterkø

| Kilde | Hvorfor |
|---|---|
|  |  |

## 5. Røde flagg

- ...
```

## 9. Master merge-protokoll

Når en worker er ferdig:

1. Master sjekker at scope er fulgt.
2. Master skiller funn i tre bunker:
   - `integrer nå`
   - `valider/sjekk først`
   - `arkiver`
3. Master kobler source cards til eksisterende `SRC-*`, `EV-*` og `CL-*`.
4. Master oppretter nye IDs bare hvis eksisterende struktur ikke dekker funnet.
5. Master oppdaterer først en endringsliste, deretter canonical docs.
6. Master lager kort changelog: hva ble lagt til, hva ble avvist, hva krever validering.

Canonical dokumenter som master kan oppdatere:

| Dokument | Når oppdateres |
|---|---|
| `source-shortlist-food-tg.md` | nye kilder løftes inn eller gamle kilder nedgraderes |
| `evidence-matrix-food-tg.md` | source card er godt nok til EV-rad |
| `claim-register-food-tg.md` | claim styrkes/svekkes/endres |
| `actor-validation-pack-food-tg.md` | funn krever ekstern aktørrespons |
| `decision-memo-food-tg-scope.md` | funn påvirker scope eller valideringsgate |
| `food-tg-insight-pack-v0.1.md` | funn er modent nok for syntese |

## 10. Første anbefalte batcher

Start med fire parallelle sessions:

| Session | Scope | Output |
|---|---|---|
| Worker A | A-feed: Foods of Norway, protein shift, mattrygghet, HI, EUDR, innsatsvarer | 6-8 source cards og A-claim-effekt |
| Worker B | B-sidestream: matsvinnrapport, Matsvinnutvalget, Albizzati, Eriksson, waste-to-nutrition, Stoknes | 6-8 source cards og B-pilotspørsmål |
| Worker C | C-adoption: Farm to Fork, UTP, UTP-evaluering, PPWR, Szulecka, Lehtokunnas, regulatory landscape | 6-8 source cards og adoption-gate |
| Worker D | Bred triage: `research/bibliotek/forskningsrunde-2026-04-20-r2/` og `research/perplexity-20-04-26/` | 50-100 lettscorede kandidater, ingen eksterne claims |

Deretter:

| Session | Scope | Output |
|---|---|---|
| Verification 1 | sitatbarhet og sidetall for de beste L1/L2-kildene | external-safe source list |
| Worker E | actor/funding: aktorkart, finance-note, funding-map, AX/Volare/RecoLab dossiers | actor validation queue |
| Worker F | sirkular-konkurser/adoption-risk | læring fra mislykkede case og risiko for TG-piloter |

## 11. Master startprompt

Bruk denne når du starter master session:

```markdown
Du er master session for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les først:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/underlagsgjennomgang-food-tg-2026-04-28.md
- docs/project/mandates/source-shortlist-food-tg.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Din jobb:
1. Hold masterkøen.
2. Lag worker prompts for uavhengige batcher.
3. Ikke dyples alt selv.
4. Når worker-handoffs kommer tilbake, normaliser funnene til source_id, EV-ID, CL-ID og status.
5. Oppdater canonical dokumenter bare etter kvalitetssjekk.
6. Hold statusene Utført internt / Validert eksternt strengt adskilt.

Start med å foreslå 4 parallelle worker sessions og hva hver skal levere.
```

## 12. Worker prompt - A-feed

```markdown
Du er worker session A-feed for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/underlagsgjennomgang-food-tg-2026-04-28.md
- docs/project/mandates/track-brief-a-feed-import.md
- docs/project/mandates/claim-register-food-tg.md
- docs/project/mandates/evidence-matrix-food-tg.md

Scope:
- research/bibliotek/akademia/nmbu/foods-of-norway-novel-feed-2024.md
- research/bibliotek/akademia/internasjonalt/nordic-protein-shift-research-2024.md
- research/bibliotek/akademia/pubmed/van-der-fels-klerx-hj-2024-framework-for-evaluation-of-food.md
- research/bibliotek/akademia/pubmed/van-leeuwen-spj-2024-a-novel-approach-to-identify.md
- research/evidence-pack/forskningsinstitutt/hi-risikorapport-fiskeoppdrett-2025.md
- research/regulatory/eu-eudr-avskogingsforordningen-2025.md
- research/norden/verdikjede/04-innsatsvarer.md

Ikke rediger canonical dokumenter.

Lever worker-handoff med:
1. source cards
2. A-claims som styrkes/svekkes/nyanseres
3. tall/case/regulering/KPI
4. usikkerhet og valideringsspørsmål
5. hvilke funn master kan integrere nå vs. må sjekke først
```

## 13. Worker prompt - B-sidestream

```markdown
Du er worker session B-sidestream for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/underlagsgjennomgang-food-tg-2026-04-28.md
- docs/project/mandates/track-brief-b-sidestreams-nutrients.md
- docs/project/mandates/claim-register-food-tg.md
- docs/project/mandates/evidence-matrix-food-tg.md

Scope:
- research/norden/verdikjede/06-matsvinn-sirkulaer.md
- research/bibliotek/sirkularitet/nordisk-matsvinn-rapport-2024.md
- research/evidence-pack/offentlig/matsvinnutvalget-2024.pdf
- research/bibliotek/sirkularitet/matsvinn-tidsserier-norden.md
- research/bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md
- research/bibliotek/akademia/masteroppgaver/eriksson-phd-2015.md
- research/bibliotek/akademia/pubmed/javourez-u-2021-waste-to-nutrition-a-review.md
- research/bibliotek/akademia/pubmed/stoknes-k-2016-efficiency-of-a-novel-food.md
- research/bibliotek/akademia/pubmed/falch-e-2026-maximizing-the-utilization-of-seafood.md

Ikke rediger canonical dokumenter.

Lever worker-handoff med:
1. source cards
2. B-claims som styrkes/svekkes/nyanseres
3. pilotspørsmål for prosess-sidestrøm, butikk/HORECA og svartvann/næringsløkker
4. tall/case/KPI/usikkerhet
5. hvilke funn master kan integrere nå vs. må sjekke først
```

## 14. Worker prompt - C-adoption

```markdown
Du er worker session C-adoption for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/underlagsgjennomgang-food-tg-2026-04-28.md
- docs/project/mandates/track-brief-c-adoption.md
- docs/project/mandates/claim-register-food-tg.md
- docs/project/mandates/evidence-matrix-food-tg.md

Scope:
- research/regulatory/eu-farm-to-fork-strategy-2020.md
- research/regulatory/eu-utp-directive-2019-633.md
- research/regulatory/eu-utp-evaluering-desember-2025.md
- research/regulatory/eu-ppwr-emballasjeforordningen-2025.md
- research/bibliotek/akademia/pubmed/szulecka-j-2024-food-waste-governance-architectures-in.md
- research/bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md
- research/norden/regulatory-policy-landscape-nordic.md

Ikke rediger canonical dokumenter.

Lever worker-handoff med:
1. source cards
2. C-claims som styrkes/svekkes/nyanseres
3. adoption-gate for A og B
4. regulatoriske krav, håndheving, datakrav, innkjøp og governance
5. hvilke funn master kan integrere nå vs. må sjekke først
```

## 15. Worker prompt - bred triage

```markdown
Du er worker session bred triage for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/underlagsgjennomgang-food-tg-2026-04-28.md

Scope:
- research/bibliotek/forskningsrunde-2026-04-20-r2/
- research/perplexity-20-04-26/

Ikke rediger canonical dokumenter.
Ikke behandle disse som siterbare kilder.

Lever:
1. 50-100 lettscorede kandidater
2. spor, tema, relevansscore, siterbarhet og neste handling
3. hvilke kandidater bør løftes til dypgjennomgang
4. hvilke kandidater bør bare brukes som intervjuspørsmål/kildejakt
5. hvilke kandidater bør avvises eller arkiveres
```

## 16. Kvalitetsgate før integrering

Master kan bare integrere et funn i canonical docs hvis:

- kilde er identifisert med filsti eller URL
- status er klar
- claim-effekt er eksplisitt
- siterbarhet er vurdert
- usikkerhet er nevnt
- neste handling er konkret

Hvis ikke, skal funnet inn i gap-/valideringslisten, ikke inn i evidence matrix.

## 17. Praktisk rytme

| Tidspunkt | Master | Workers |
|---|---|---|
| Start | definerer batcher og sender prompts | starter parallelt |
| +30 min | sjekker om noen er blokkert | leser, søker, lager notes |
| +60-90 min | mottar første handoffs | leverer handoffs |
| +120 min | konsoliderer source cards | eventuelt andre batch |
| Slutt | oppdaterer canonical docs og neste kø | ingen videre handling |

## 18. Done-kriterier for én analysefabrikk-runde

En runde er ferdig når:

- hver worker har levert handoff
- master har klassifisert alle funn i `integrer`, `sjekk`, `valider`, `arkiver`
- nye source cards er koblet til EV/CL eller parkert
- røde flagg er synlige
- neste batch er definert

