---
tittel: "Worker 4G - red-team og svakhetsanalyse"
status: Utført internt
eier: Master session
dato: 2026-04-28
worker: 4G
canonical_docs_redigert: false
relaterte_filer:
  - docs/project/mandates/research-plan-food-tg-triangulation-runde-4-2026-04-28.md
  - docs/project/mandates/research-dossiers/research-red-team-food-tg-v0.1.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-3.md
  - docs/project/mandates/opportunity-radar-food-tg-v0.1.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
---

# Worker 4G - red-team og svakhetsanalyse

## 1. Kort konklusjon

1. Største risiko er at teknisk mulighet, siterbar baseline, svensk benchmark eller policyretning blir presentert som pilotklarhet.
2. A+B med C som gate er fortsatt et rimelig internt scope, men bare som valideringssprint, ikke pilotportefølje.
3. `CL-A-020`, `CL-A-021`, `CL-B-021`, `CL-B-022`, `CL-B-023`, `CL-C-011` og `CL-C-015` må være røde flagg i alle uttak.
4. A-sporet er sterkt som strategisk problemfelt, men svakt som rask pilot før kost, LCA, fôrkrav, lovlig substrat og kjøperkrav er validert.
5. B-sporet er mest pilotnært, men okara/BSG, matsvinnkvalitet, marint restråstoff og næringsstoffløkker må ikke behandles som samme type case.
6. C-sporet skal være go/no-go-skjema for A/B: lov, kjøper, data, drift, governance og markedsmakt.
7. Mest troverdig uttak nå er claim-strength, opportunity radar og validation gate for Jan Thomas/Cathrine.

## 2. Weak claim list

| Claim | Svakhet | Risiko | Anbefalt formulering |
|---|---|---|---|
| `CL-A-020` | Blander handelsstatistikk, actor-data, FoU, fôrsammensetning og policy. | Importvolum brukes som substitusjonseffekt. | Encelle-/gjærprotein er et strategisk scoping-spor; tallene viser kontekst og databehov, ikke dokumentert erstatningsvolum. |
| `CL-A-021` | "Godkjente sidestrømmer" er ikke låst per substrat. | Pilot strander på ulovlig substrat, kontaminanter, pris eller manglende fôrkjøper. | Insektprotein er en A/B-kandidat etter substratgate, risikovurdering, insektaktør og fôr-/sjømatkjøper. |
| `CL-B-008` | LCA-rangering er fraksjons- og systemgrenseavhengig. | Kaskaden blir en universell regel per kilo. | Bruk kaskade som beslutningsrekkefølge per fraksjon, lovlig sluttbruk og lokale systemgrenser. |
| `CL-B-014` | Svenske benchmarkdata kan bli lest som norsk/nordisk volum. | Feil prioritering av for liten, ustabil eller allerede bundet strøm. | Okara/BSG er konkrete benchmark; norsk/nordisk pilotbarhet krever produsentdata, hygiene, logistikk og off-taker. |
| `CL-B-016` | RecoLab-effekter og pilotstatus kan overføres ukritisk. | Infrastrukturcase virker mer replikerbart og modent enn det er. | RecoLab er benchmark for design og governance; absolutte massebalanser, produktstatus og overføringsverdi må valideres. |
| `CL-B-021` | Forutsetter råvareeier, kvalitet, holdbarhet og lovlig sluttbruk. | Første pilot velges på fortellingsverdi, ikke gjennomførbarhet. | Ren prosess-sidestrøm kan bli første B-kandidat hvis minimumskrav for volum, kvalitet, hygiene, logistikk, off-taker og lovlig bruk er passert. |
| `CL-B-022` | Kan bli kommunikasjonstiltak uten målbar endring. | Fallback-pilot blir for myk eller utydelig. | Matsvinnkvalitet er lavterskel adoption-kandidat hvis baseline, rutineendring, målepunkt og driftsaktør er klare. |
| `CL-B-023` | Tung infrastruktur, regelverk, produktmarked og aksept. | For stort og sakte som første Food TG-pilot. | Næringsstoffløkker brukes som benchmark og sekundær læringsarena før eventuell pilot. |
| `CL-C-001` | Kausalitet mellom markedsstruktur og konkret pilotbarriere er ikke bevist. | Markedsmakt får skylden uten aktørbevis. | Markedsstruktur og håndheving er adoption-gates; konkrete barrierer må bekreftes i aktørintervjuer. |
| `CL-C-002` | Offentlig innkjøp kan overvurderes. | Kjøkken, kontrakter og budsjett tåler ikke umodne løsninger. | Offentlige innkjøp er demand-side hvis kontrakt, kompetanse, kjøkkenpraksis og dataansvar er på plass. |
| `CL-C-011` | EU-scope, norsk/EØS-status, varekoder og actor-praksis blandes lett. | Feil Norge-claim eller feil compliance-press i fôrsporet. | EUDR gjør soya til EU-sporbarhetstema; norsk/EØS-status og praktiske krav for norske aktører må formuleres separat. |
| `CL-C-015` | KPI-er kan bli styringsillusjon uten dataeier. | Roadmap måler det som er lett tilgjengelig, ikke det som er sant. | KPI-er er intern datagate til definisjon, dataeier, frekvens og rapporteringssystem er bekreftet. |

## 3. Kill criteria

| Kriterium | Parker hvis | Kan reaktiveres når |
|---|---|---|
| Lovlighet | Substrat eller sluttbruk er ulovlig eller ikke avklarbar innen beslutningsvinduet. | Myndighet/fagekspert gir tydelig grønn/gul vei. |
| Mattrygghet | Risiko krever tester eller prosesskontroll ingen aktør vil eie. | QA-plan og ansvarlig aktør finnes. |
| Materialitet | Strømmen er for liten, ustabil eller allerede høyverdig utnyttet. | Data viser beslutningsrelevant volum eller læringsverdi. |
| Økonomi | Stabilisering, transport eller prosess gjør pilot urealistisk uten høy subsidiering. | Off-taker eller fundinglogikk er konkret. |
| Demand-side | Ingen kjøper, bruker eller driftsaktør kan beskrive krav. | Minst én demand-side aktør bekrefter interesse og krav. |
| Data | Baseline, enhet, systemgrense eller dataeier mangler. | Tallregister/KPI-skjema er komplett. |
| Eierskap | Ingen kan eie drift, risiko, data eller rapportering. | Navngitt piloteier eller eksplisitt eierbehov er etablert. |
| Nordisk merverdi | Caset er bare lokalt og lite lærbart. | Benchmarklogikk eller komparativ verdi er tydelig. |

## 4. Counterargument map

| Objekt | Beste argument mot | Styrke | Reparasjon |
|---|---|---|---|
| Spor A fôr/import | Store volum gjør ikke sirkulære alternativer pilotklare. | Sterk | Formuler A som strategisk scoping- og compliance-spor til kost, LCA, regulatorikk, fôrkrav og kjøper er validert. |
| Spor B sidestrømmer | B samler for ulike materialstrømmer med ulike regler og eiere. | Sterk | Del B i kandidatfamilier og velg én første pilotgate; resten blir benchmark/fallback. |
| Spor C adoption | C kan bli policyessay uten operativ eier. | Medium/høy | Gjør C til go/no-go-skjema per pilot. |
| Encelle-/gjærprotein | FoU-spor, ikke TG-pilot. | Sterk | NMBU/fôraktør-scoping; pilot bare hvis industripartner beskriver realistisk demonstrasjon. |
| Insektprotein | Sirkularitetslogikk kolliderer med substratregelverk. | Svært sterk | Mattilsynet og grønn/gul/rød substratliste først. |
| Okara/BSG | Konkrete svenske tall skjuler manglende norsk råvareeier, QA og off-taker. | Sterk | Produsentdata og off-taker før pilotstatus. |
| Matsvinnkvalitet | Kan ende som PR og "måltider reddet". | Medium | Lås kategori, baseline, rutineendring, alternativ behandling og driftsaktør. |
| Marint restråstoff | Mye er allerede utnyttet; problemet er fraksjon/høyverdi. | Sterk | Behandle som sjømatspesifikk benchmark og sekundær actor-learning. |
| RecoLab/næringsstoffløkker | Kapitaltungt, lokalt og tregt. | Svært sterk | Bruk som benchmark for data, governance og regelverk. |
| Offentlig innkjøp | Kjøpekraft kan være svakere enn kontrakter, pris og kjøkkenkapasitet. | Medium | Koble til konkret anskaffelse, kjøkkenpraksis og leverandørkapasitet. |
| KPI/datastandard | KPI uten dataeier blir pynt. | Sterk | Ingen målverdier uten dataeier og frekvens. |

## 5. Repair actions

| Svakhet | Repair action | Eier/kilde | Output |
|---|---|---|---|
| SSB/actor/fôrdata blandes | Tallregister med én rad per tall, datakilde og bruksstatus. | 4A + SSB/Tolletaten/fôraktører | A-feed tallregister |
| EUDR-Norge uklar | Juridisk primary-check mot regjeringen, EFTA/EØS, Lovdata og direktorater. | 4A/4E | Avklart formulering med absolutte datoer |
| Encelle-/gjærprotein overclaims | NMBU/Foods of Norway-intervju om modenhet, kost, LCA og regulatorikk. | P1 outreach | Modenhetsnotat og sitatgodkjenning |
| Insektprotein usikker lovlighet | Grønn/gul/rød substratliste med Mattilsynet/fagekspert. | P1 outreach | Substratgate for `CL-A-021` |
| Okara/BSG pilotklarhet uvalidert | Produsentintervju + QA-data + off-taker-sjekk. | 4B/P1 | Kandidatmatrise med go/no-go |
| Matsvinnkvalitet for vag | Velg produktkategori, driftsaktør, baseline og rutineendring. | 4C/P2 | Pilotcanvas for `CL-B-022` |
| Marint restråstoff for generelt | SINTEF/FHF dataordbok og aktørintervju per fraksjon. | 4D/P2 | Fraksjonskart og benchmarkstatus |
| RecoLab overføres ukritisk | RecoLab/NSVA/Eawag + norsk VA-case-sammenligning. | 4D | Benchmarkkart, ikke pilotclaim |
| Offentlig innkjøp overdrives | Intervju innkjøper/kjøkken om kontrakt, pris, meny og data. | 4E/P2 | Demand-side gate |
| Markedsmakt kausalitet for svak | Intervju leverandør/kjøper/tilsyn om konkrete barrierer. | 4E | Policy-to-practice map |
| KPI-er mangler dataeier | KPI-dataskjema per indikator. | 4E/4F | Internt KPI-appendix med status |

## 6. Anbefaling til master

1. Integrer 4G som negativ kontroll i master merge og claim strength report.
2. Ikke oppdater canonical docs før 4A-4F er lest og mini-verifikasjon er gjort.
3. Bytt språk fra "pilotprioritering" til "valideringsprioritering" der gates ikke er lukket.
4. Gi høy opportunity-score til spor med både siterbart grunnlag og lav repair-cost; gi lavere score til kapitaltunge eller juridisk uklare spor selv om fortellingsverdien er høy.
5. Før Jan Thomas/Cathrine-review bør hoveduttaket være: dette kan vi si nå, dette må vente, dette kan drepe hvert spor.
