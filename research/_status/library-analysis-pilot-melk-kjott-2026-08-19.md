# Pilot: KI-analyse av melk/kjøtt-kilder

- **Dato:** 2026-08-19
- **runId:** `pilot-melk-kjott-2026-08-19`
- **Modell:** `claude-opus-5` (Claude Code-agent, ikke API-kall)
- **promptVersion:** `library-analysis-v1`
- **Analyser:** `library-analysis-pilot-melk-kjott-2026-08-19.json`
- **Status:** Lokal evidens. Ikke importert til produksjon, ikke menneskelig gjennomgått.

## Kilder

| Kilde | Ord | Påstander | Risikoflagg |
|---|---:|---:|---:|
| `sirkularitet/lca-norsk-mat-database-2025.md` | 233 | 3 | 2 |
| `nordisk/future-nordic-diets-tn2017-566.md` | 649 | 3 | 1 |
| `forskningsrunde-2026-04-20-r2/p21-plantemelk-industri-norden` | 2 085 | 2 | 3 |
| `forskningsrunde-2026-04-20-r2/p44-nordisk-massebalanse` | 2 014 | 2 | 2 |
| `forskningsrunde-2026-04-20-r2/p03-biomassehierarki-wur-norden` | 2 678 | 3 | 2 |

13 påstander totalt. Alle med sitert grunnlag og lokator.

## Resultat

- 5 av 5 analyser passerte akseptansporten.
- 13 av 13 sitater ble verifisert ordrett mot kildefilen.
- 5 kjøringsrader skrevet til `LibraryAnalysisRun`.
- `LibraryAnalysisRecord`, `SourceCitation` og `Insight`: 0 rader. Ingen kanonisk
  eller siterbar flate ble berørt.
- `npm run db:audit`: alle håndhevede integritetssjekker passerte.

## Faglige funn verdt å merke seg

- Kjøtt og melk behandles ulikt i det nordiske faggrunnlaget. TemaNord 2017:566
  krever 81–90 % reduksjon i kjøttforbruk, men melk reduseres til «litt under
  halvparten» i det strengeste scenariet og er «omtrent likt» i det andre.
- Norsk melk ligger under EU-snittet i klimaavtrykk mens norsk storfekjøtt ligger
  over, begrunnet med lang innefôringssesong.
- Meierisidestrømmene ligger allerede høyt i biomassehierarkiet: av TINEs ca. 640
  mill. liter myse går ca. 540 mill. til proteinpulver, ikke til energi.
- Regelverket for melkebetegnelser (EU C-422/16) er en dokumenterbar strukturell
  fordel for meierisektoren, uavhengig av de usikre markedsandelstallene.

## Begrensninger

- Tre av fem kilder er KI-genererte syntesenotater som selv flagger at tall er
  anslag. Analysene registrerer dette som risikoflagg og gap, men det betyr at
  påstandene derfra ikke kan bli eksternt siterbare uten å gå til primærkilden.
- LCA-notatet har ufullstendig DOI. Tallene må verifiseres mot den publiserte
  artikkelen før bruk.
- Kjørt mot en lokal pilotdatabase seedet med de fem dokumentene, fordi dette
  repoet ikke har en lokal utviklingsdatabase med korpuset.
- Ingen av påstandene har menneskelig godkjenning. Ingen er siterbare.
