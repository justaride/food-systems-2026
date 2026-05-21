# Food TG Figure and Model Note Audit 2026-05

**Status:** Intern kontroll for synlige flater og modeller
**Dato:** 2026-05-21
**Scope-status:** Kan utføres uten scope-vedtak. Ekstern bruk krever claim-lock og kilde-/modellnote.
**Primærregel:** Ingen graf, score, matrise, Sankey, KPI eller nettverksflate skal leses som effektbevis, komplett materialflyt, aktørcommitment eller pilotklarhet uten eksplisitt dokumentasjon.

Denne auditfilen er Food-parallellen til Circular Cities sin figurnote-disiplin. Formålet er å hindre at gode arbeidsmodeller blir overtolket når de vises i deck, rapport, nettside eller whitepaper.

## Overordnet modellkontrakt

| Modelltype | Kan brukes til | Kan ikke brukes til | Standardnote |
|---|---|---|---|
| Nettverk/graf | Navigere mellom aktører, selskaper, personer, dokumenter, innsikt og relasjoner. | Bevise forankring, partnerskap, kausal effekt eller komplett verdikjede. | "Grafen viser registrerte og kuraterte koblinger i kunnskapsbasen. Den er ikke dokumentasjon på aktørcommitment eller full markedsdekning." |
| Sankey/flyt | Illustrere struktur, retning, registrerte flows og datadekning. | Full materialbalanse, tonnasje, klimaeffekt eller komplett nordisk flow. | "Flyten er en arbeidsmodell basert på registrerte kilder og proxyer. Den skal ikke leses som full material- eller utslippsregnskap." |
| KPI/score | Vise datagate, målebehov og indikatorfamilier. | Måloppnåelse, effekt eller sammenlignbar rangering uten dataeier og systemgrense. | "KPI-er er styrings- og datakrav inntil definisjon, år, geografi, enhet, kilde, dataeier og frekvens er låst." |
| Benchmark/casekort | Strukturere læring fra eksterne cases. | Overføre effekt, modenhet eller pilotklarhet til Food TG. | "Benchmark viser mulig læring og designkrav, ikke at caset er kopierbart eller pilotklart." |
| Reader journey-side | Kommunisere status og prioritering. | Erstatte claim-register, evidence matrix eller actor-validation. | "Siden er en presentasjonsflate. Publiserbar faktastemme styres av claim-lock, evidence matrix og valideringslogg." |

## Synlige Food-flater

| Flate | Modell/komponent | Hva den faktisk viser | Hva den ikke beviser | Statusnote før ekstern bruk | Neste handling |
|---|---|---|---|---|---|
| `/graf` | `KnowledgeGraph`, `getFullGraph`, data quality panel | Koblede noder og kanter mellom dokumenter, innsikt, masteroppgaver, selskaper, aktører, personer og eiendommer. Viser også isolerte noder, brutte kanter og konfidensdekning. | Komplett kunnskapsbase, komplett relasjonsnettverk, partnerstatus, bruksrett eller at alle kanter er like sterke. | "Kunnskapsgrafen er navigasjon og datakvalitetsflate. Relasjoner må sjekkes mot kilde og claim-lock før de brukes eksternt." | Legg inn/hold synlig note om at isolerte noder er holdt utenfor canvas av lesbarhetsgrunner. |
| `/forsyningskjede` | `SupplyChainGraph`, `DataQualityStrip`, primærflyt, import, returstrømmer | Norske primærleveranser, kuraterte relasjoner, importproxy, infrastruktur og returstrømskandidater med ulike evidensnivåer. | Nordisk paritet, komplett vareflyt, komplett materialbalanse, aktørcommitment eller at proxyer kan sammenlignes direkte. | "Forsyningskjede viser flere datalag med ulik dekning. NO-observerte leveranser, kuraterte relasjoner, importproxy og returstrømmer må ikke blandes." | Behold separate figurnoter per seksjon: primærflyt, maktrelasjoner, import, infrastruktur, returstrømmer. |
| `/verdikjede` | `FeedCompositionTimeseries`, `FoodFlowSankey`, dekningstabeller | Verdikjedeledd, landdekning, kildereferanser, kjent matsvinn, flow-skisser og fôrsammensetning. | Full nordisk total, full svinntotal, direkte pilotgrunnlag eller at alle land er sammenlignbare. | "Verdikjede er en deknings- og strukturflate. Tall fra land, varegrupper og år må harmoniseres før sammenligning." | Merk `Kjent matsvinn` som sum av felt som finnes, ikke nordisk total. |
| `/sirkularitet` | `RLadderMatrix`, `RLadderMaturityOverview`, `R9KpiCatalog`, `NutrientFlowsView` | R-nivåer, modenhet, spørsmål, eksisterende looper, gap, aktørscases og N/P/K-tema. | Dokumentert sirkulær effekt, komplett gapkart, pilotklarhet eller at KPI-er er operative. | "Sirkularitetssiden viser metode, cases og åpne spørsmål. Den er ikke effektbevis eller pilotcommitment." | Knytt alle casekort til case/pilot-to-claim-indeksen. |
| `/innsikt` | Insight cards, `FoodFlowSankey`, kildechips | Innsikter, kildeankre, leserinnganger og utvalgte visualiseringer. | At alle innsikter er eksternt siterbare eller validerte. | "Innsikter må leses med readiness-status og kildeanker. Intern syntese er ikke ekstern dokumentasjon." | Kryssjekk at `citationReadiness` og kildechips vises tydelig for eksterne flater. |
| `/sammenligning` | `ChartFrame`, `BolkSection`, policy-/country panels | Nordiske sammenligninger på marked, selvforsyning, sirkularitet, matsvinn og policy. | Harmonisert nordisk statistikk for alle felt eller direkte rangering uten metodeforbehold. | "Sammenligning er en synteseflate med ulik landdekning. Landrangering krever felles definisjon, år og kildegrunnlag." | Bruk `ChartFrame`-kontrakter aktivt for alle nye sammenligninger. |
| `/eierskap` og `/selskap/[id]` | selskapsdata, eierskap, relasjoner, finansielle nøkkeltall | Register-/DB-data, selskapsprofiler, aksjonærer, relasjoner og regnskapsrader. | Full eierkontrollanalyse, faktisk maktutøvelse, markedsatferd eller siterbar årsakssammenheng uten kilde. | "Selskaps- og eierskapsdata er register-/analysegrunnlag. Bruk årsrapport/BRREG/kilde før eksterne claims." | Behold note om at regnskapsrader/resolver må kontrolleres før sitatbruk. |
| `/mandat` | Food TG mandate cards og validation lanes | Intern mandatstatus, scopeanbefaling, decision docs og valideringsbaner. | At scope er endelig eller eksternt forankret. | "Mandatflaten viser intern status. Scope er ikke formelt låst før beslutningslogg er oppdatert." | Synk med `food-tg-scope-decision-request-2026-05-21.md`. |

## Hovedkomponenter og figurnoter

| Komponent | Bruksnivå | Standard figurnote | Må ikke brukes som |
|---|---|---|---|
| `KnowledgeGraph` | Intern/leserflate med datakvalitetsindikatorer. | "Viser registrerte koblinger i kunnskapsbasen. Konfidens og kilde må vurderes per kant." | Aktørforankring, partnerskap, komplett nettverk. |
| `SupplyChainGraph` | Arbeidsmodell for relasjoner og maktlag. | "Kuraterte relasjoner, ikke komplett vareflyt. Bruk med metodeforbehold." | Måling av faktisk volum eller full markedskontroll. |
| `FoodFlowSankey` | Flow-skisse for struktur og dekning. | "Flytskissen bygger på value-chain-filer og viser ikke komplett materialbalanse." | Tonnasje, klimaeffekt, komplett matflyt. |
| `FeedCompositionTimeseries` | Tidsserie for fôrkomposisjon/retning. | "Fôrdata må leses med kilde, art, år og aktør-/bransjeavgrensning." | Direkte substitusjonseffekt, SPC-metode uten sjekk. |
| `NutrientFlowsView` | N/P/K og nutrient-loop arbeidsflate. | "Næringsflyt er et benchmark-/datakravslag. Massebalanse og produktstatus må låses før tallclaims." | Komplett N/P/K-regnskap eller pilotklar VA/biogass-løsning. |
| `RLadderMatrix` | Plassering av cases/tiltak per R-nivå og verdikjedeledd. | "Matriseplassering viser analytisk klassifisering, ikke effekt eller modenhet." | Bevis på implementert sirkularitet. |
| `RLadderMaturityOverview` | Modenhetsoversikt. | "Modenhet er intern klassifisering og krever kilde/aktør før ekstern bruk." | Markedsmodenhet eller investeringsklarhet. |
| `R9KpiCatalog` | KPI-katalog og datakrav. | "KPI-er er forslag til målekrav. De er ikke resultatmål før dataeier og baseline finnes." | Effekt, måloppnåelse, rangering. |
| `ChartFrame` | Kontrakt for tittel, spørsmål, enhet, periode, evidensstatus og kilder. | "ChartFrame skal alltid ha `coverageNote` og `sourceRefs` for eksternt relevante figurer." | Publikasjonsfigur uten kilde-/dekningsnotat. |
| `DataQualityStrip` | Statusstriper for datalag. | "Statusstripen forklarer datalagets rolle og begrensning." | Erstatning for claim-lock eller kildebevis. |

## Figurkontrakt som skal brukes før nye uttak

Alle nye figurer i decision pack, deck eller whitepaper skal ha:

| Felt | Krav |
|---|---|
| Spørsmål | Hvilket spørsmål figuren besvarer. |
| Enhet | Tonn, prosent, relasjon, score, casecount, datadekning osv. |
| Periode | År, intervall eller "arbeidsmodell per dato". |
| Kilde | EV-/SRC-ID, URL/path, fil, tabell/celle/side der mulig. |
| Readiness | `citable_external`, `citable_with_note`, `internal_context` eller `blocked_unsourced`. |
| Dekningsnote | Hva figuren dekker og ikke dekker. |
| Claimkobling | Hvilke claim-IDer figuren kan støtte. |
| Ikke-bevis | Hvilke tolkninger figuren ikke støtter. |
| Publikasjonsstatus | Intern, kontrollert ekstern, eller hold tilbake. |

## Konkrete reparasjonspunkter

| Risiko | Hvor | Reparasjon |
|---|---|---|
| Datalag blandes | `/forsyningskjede`, `/verdikjede`, `/sammenligning` | Skill SSB/HS, actor-data, total fôrvolum, importproxy, primærleveranser og kuraterte relasjoner. |
| Proxy blir effekt | `/sirkularitet`, `/forsyningskjede` | Skriv eksplisitt at proxyer peker på mulighet/sårbarhet, ikke effekt. |
| Benchmark blir pilotbevis | `/sirkularitet`, `/innsikt`, decision pack | Koble alle benchmark til case/pilot-to-claim-indeks. |
| Kunnskapsgraf blir forankringsbevis | `/graf`, `/selskap/[id]` | Marker at grafen viser registrerte koblinger, ikke commitment eller bruksrett. |
| KPI blir resultat | `/sirkularitet`, roadmap | Krev definisjon, år, geografi, enhet, kilde, dataeier, frekvens, baseline og systemgrense. |
| Landrangering blir for sterk | `/sammenligning` | Krev felles definisjon, år og landdekning før rangering. |

## Stop-regler

- Ingen figur uten kilde- og dekningsnote i ekstern pakke.
- Ingen Sankey/flow omtales som materialbalanse uten faktisk balansegrunnlag.
- Ingen graf omtales som forankring uten aktørrespons.
- Ingen case omtales som pilot uten eier, data, lovlig sluttbruk og off-taker.
- Ingen KPI omtales som effekt uten baseline og dataeier.
- Ingen nordisk sammenligning brukes som rangering uten harmonisert definisjon.

## Neste handling

1. Bruk denne filen som sjekkliste ved reader journey-QA.
2. Legg figurnote inn i `food-tg-public-language-bank-v0.1.md` når den opprettes.
3. Hvis en figur skal inn i decision deck, opprett en rad i claim-lock eller case/pilot-to-claim-indeksen før bruk.
