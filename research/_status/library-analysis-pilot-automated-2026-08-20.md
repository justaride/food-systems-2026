# IG-006: automatisk tre-kilders pilot

Dato: 2026-08-20

Profil: `automatedOnly=true`

Ekstern status: `externalReady=false`
Persistens: `candidate_plan_only_not_applied`

## Resultat

De tre sporede fulltekstene er lest fra repository, kontrollert mot sine eksakte SHA-256-hasher og kjørt gjennom de forseglete analyse- og valideringsadapterne. Alle tre fikk terminal disposisjon `partial` og `candidate_only`.

Dette skyldes kontrollert konservatisme: analyse og validator brukte samme navngitte KI-runtime med to forskjellige, hashbundne prompts. Separasjonsnivået er derfor `same_model_distinct_prompt`, ikke uavhengig verifikasjon. Ingen av pilotene er merket som gjenbrukbar intern KI-kontekst i denne kjøringen.

| Kilde | Analyse | Validering | Disposisjon |
| --- | --- | --- | --- |
| `document:cmp11sflk0008zq0dfczax8mp` | `run:library-analysis:e4a8…022b1` | `run:library-validation:e9d7…63a15` | `partial / candidate_only` |
| `document:cmp11sfln0009zq0d3lmqruhq` | `run:library-analysis:52f3…0ef2` | `run:library-validation:e8ad…6e7d` | `partial / candidate_only` |
| `document:cmp11sfn7000mzq0dx4h670du` | `run:library-analysis:1dc8…126` | `run:library-validation:f809…a2f4` | `partial / candidate_only` |

Populasjonen er forseglet som:

- snapshot: `library-analysis-population:187667dd2fef5ef14ee27b2e2b35670f5c41afa170f29ce90184e6547653ddb3`
- hash: `187667dd2fef5ef14ee27b2e2b35670f5c41afa170f29ce90184e6547653ddb3`
- totalt: 3
- lesbart input: 3
- blokkert input: 0

## Negative regresjoner

To kjente, utilstrekkelige evidensutdrag er låst som negative tester:

1. Påstanden inneholder både `3.1 million litres` og `28 percent`, mens evidensen bare inneholder volumet. Den deterministiske tallgaten klassifiserer dette som F3 og karantenesetter resultatet.
2. Påstanden forklarer hvem som samlet inn data og hva de brukes som grunnlag for, mens evidensen bare sier `retail groups.`. Den separate semantiske kontrollen klassifiserer dette som F3 og karantenesetter resultatet.

Begge testene må forbli utenfor `reusable_for_ai_context`.

## Bevisgrense

Dette er en lokal, reproducerbar kandidatplan. Det er ikke utført databaseimport, rolleaktivering, produksjonsmigrasjon, deploy eller autentisert runtime-readback. JSON-kvitteringen inneholder komplette hashes og kjørings-ID-er: `research/_status/library-analysis-pilot-automated-2026-08-20.json`.

Ingen del av piloten gir menneskelig review, rettighetsgodkjenning, ekstern claim-godkjenning eller publiseringsautoritet.
