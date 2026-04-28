---
tittel: "Research Red Team Food TG v0.1"
status: Utført internt
eier: Gabriel
dato: 2026-04-28
dypdykk: "4G - red-team og svakhetsanalyse"
neste_handling: Brukes som negativ kontroll før opportunity radar, claim strength report og decision memo v0.3.
relaterte_filer:
  - docs/project/mandates/research-plan-food-tg-triangulation-runde-4-2026-04-28.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-3.md
  - docs/project/mandates/decision-memo-food-tg-scope-v0.2.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
---

# Research Red Team Food TG v0.1

Dette dypdykket leter aktivt etter svakheter i Food TG-underlaget per 2026-04-28. Det bekrefter ikke planen. Hovedkonklusjonen er at A+B med C som gate fortsatt er et rimelig internt scope, men bare dersom det formuleres som valideringssprint og ikke som pilotportefølje, effektfortelling eller finansierbar roadmap.

## 1. Kort konklusjon

1. Den største overclaim-risikoen er å gjøre "teknisk mulig", "siterbar baseline", "svensk benchmark" eller "policyretning" om til "pilotklart tiltak".
2. `CL-A-020`, `CL-A-021`, `CL-B-021`, `CL-B-022`, `CL-B-023`, `CL-C-011` og `CL-C-015` bør være røde flagg i alle uttak: bruk dem som hypoteser eller gates, ikke som konklusjoner.
3. A-sporet er sterkt som strategisk problemfelt, men svakt som rask pilot før kost, LCA, lovlig substrat, fôrkrav og kjøperkrav er validert.
4. B-sporet er sterkest som praktisk pilotspråk, men kandidatene er heterogene: okara/BSG, matsvinnkvalitet, marint restråstoff og svartvann/næringsløkker kan ikke behandles som én type case.
5. C-sporet er nødvendig som adoption-gate, men blir svakt hvis det presenteres som bred policyagenda. Det må knyttes til konkrete go/no-go-krav for A og B.
6. Den mest troverdige leveransen nå er en "claim strength + validation gate" for Jan Thomas/Cathrine, ikke en ferdig pilot- eller effektroadmap.
7. Eksterne aktører kan med rette utfordre databruk, representativitet, juridisk presisjon, pilotøkonomi, råvareeierskap, off-taker, KPI-målbarhet og hvem som faktisk eier endring.

## 2. Weak Claim List

| Claim | Svakhet | Risiko | Anbefalt formulering |
|---|---|---|---|
| `CL-A-001` metanotroft bakterieprotein kan erstatte betydelig soyaprotein i forsøk | Forsøksresultat kan bli lest som kommersiell modenhet | Roadmap lover skala, pris eller adoption som kilden ikke støtter | "Forsøk viser teknisk mulighet under definerte betingelser; kommersiell skala, kost, LCA og regulatorisk vei må valideres." |
| `CL-A-002` gjær-/encelleprotein er relevant importsubstitusjon | Relevans er bredere enn pilotbarhet | FoU-spor får pilotstatus uten industriell kjøper eller kostbane | "Gjær- og encelleprotein er relevante scoping-spor for importsubstitusjon, ikke pilotvalg før modenhet og demand-side er bekreftet." |
| `CL-A-003` Norge svakere enn DK/SE på alternativ-protein-investeringer | Bygger på sekundær økosystemkilde og kan være ufullstendig | Norsk kapasitet eller nye programmer undervurderes | "Tilgjengelig sekundærgrunnlag indikerer sterkere tyngdepunkter i Danmark/Sverige, men norsk posisjon må oppdateres mot aktive programmer og investeringer." |
| `CL-A-011` TSE/ABP/fôrregelverk som legal gate | Kan bli for generell og gi falsk trygghet | Grønn/gul/rød substratliste blir juridisk feil | "Regelverket gjør substratvalg til legal gate; hvert konkret substrat må vurderes mot gjeldende Mattilsynet/EU/EØS-grunnlag." |
| `CL-A-020` encelle-/gjærprotein som pilotspor | Blander handelsstatistikk, actor-data, fôrsammensetning, FoU og policy | Importvolum kan feilaktig brukes som substitusjonseffekt | "Bruk som strategisk scopingpilot; tallene viser kontekst og databehov, ikke dokumentert erstatningsvolum." |
| `CL-A-021` insektprotein på godkjente sidestrømmer | "Godkjente" er ikke låst per substrat; actor-kapasitet er uvalidert | Pilot strander på ulovlig substrat, kontaminanter, pris eller manglende kjøper | "Aktuell A/B-kandidat etter substratgate, risikovurdering, insektaktør og fôr-/sjømatkjøper." |
| `CL-A-022` Axfoundation/Framtidens foder som benchmark | Lavt validert prosjektstatus/resultatgrunnlag | Benchmark brukes som effektbevis eller kopierbar modell | "Bruk som mulig governance- og finansieringsbenchmark, ikke som bevis for skalerbar effekt." |
| `CL-B-008` kaskade/LCA-rangering | LCA-rangering er fraksjons- og systemgrenseavhengig | Redistribusjon/fôr fremstilles som universelt bedre uansett lokal kontekst | "Kaskadeprinsippet bør brukes som beslutningsrekkefølge, med fraksjon, lovlig sluttbruk og lokale systemgrenser som forbehold." |
| `CL-B-014` okara/BSG som høyverdi-kandidater | Svenske benchmarkdata kan forveksles med norsk/nordisk volum og pilotklarhet | Feil prioritering av for liten, ustabil eller allerede bundet strøm | "Okara og BSG er konkrete benchmarkkandidater; norsk/nordisk pilotbarhet krever produsentdata, hygiene, logistikk og off-taker." |
| `CL-B-016` RecoLab/Helsingborg som referansecase | Relative effekter og pilotstatus kan bli overført til generelle N/P/K-påstander | Infrastrukturcase virker mer replikerbart og modent enn det er | "RecoLab er et benchmark for design og governance; absolutte massebalanser, produktstatus og overføringsverdi må valideres." |
| `CL-B-021` ren prosess-sidestrøm som første B-pilot | Forutsetter råvareeier, kvalitet, holdbarhet og lovlig sluttbruk som ikke er bekreftet | Første pilot blir valgt på fortellingsverdi, ikke gjennomførbarhet | "Første B-kandidat hvis en konkret strøm passerer minimumskrav for volum, kvalitet, hygiene, logistikk, off-taker og lovlig bruk." |
| `CL-B-022` matsvinnkvalitet i butikk/HORECA | Kan bli kommunikasjonstiltak uten målbar endring | Fallback-pilot blir for myk eller utydelig | "Lavterskel adoption-kandidat hvis baseline, rutineendring, målepunkt og driftsaktør er klare." |
| `CL-B-023` næringsstoffløkker/avløp/biogjødsel | Tung infrastruktur, regelverk og aksept; ulike dataenheter | Blir for stor og langsom som første TG-pilot | "Bruk som benchmark og sekundær læringsarena før eventuell pilot." |
| `CL-C-001` adoption som regulering, håndheving og markedsstruktur | Kausaliteten kan overdrives | Markedsstruktur får skylden uten aktørbevis | "Markedsstruktur og håndheving er relevante adoption-gates; konkrete barrierer må bekreftes i aktørintervjuer." |
| `CL-C-002` offentlige innkjøp som etterspørselsmotor | Effekt og kapasitet er uvalidert | Innkjøp får større rolle enn kjøkken, kontrakter og budsjett tåler | "Offentlige innkjøp er mulig demand-side hvis kontrakt, kompetanse, kjøkkenpraksis og dataansvar er på plass." |
| `CL-C-006` handelsskikk/UTP/håndheving påvirker adoption | Rettsramme er ikke det samme som faktisk endret praksis | Policyclaim fremstår som empirisk adoption-bevis | "Regulering kan redusere adoption-barrierer bare hvis håndheving, rapporteringsvern og faktisk bruk fungerer." |
| `CL-C-011` EUDR for soya/fôr | EU-scope, norsk/EØS-status, varekoder og actor-praksis er lett å blande | Feil Norge-claim eller feil compliance-press i fôrsporet | "EUDR gjør soya til EU-sporbarhetstema; norsk/EØS-status og praktiske krav for norske aktører må formuleres separat." |
| `CL-C-015` KPI-er for sirkulær mat | KPI-er kan bli styringsillusjon uten dataeier | Roadmap måler det som er tilgjengelig, ikke det som er sant eller beslutningsrelevant | "KPI-er er en intern datagate til definisjon, dataeier, frekvens og rapporteringssystem er bekreftet." |

## 3. Hvor Datatyper Er Blandet

| Tema | Datatyper som blandes | Hvorfor det er svakt | Riktig skille |
|---|---|---|---|
| Soya/fôrimport | SSB HS-statistikk, Denofa actor-data, Skretting fôrsammensetning, Fiskeridirektoratets oppdrettsfôrvolum, EUDR-policy | Tallene måler ulike ting: vareimport, én aktørs råvare, én fôrprodusents miks, total fôromsetning og juridiske krav | Bruk tallregister med definisjon, år, geografi, enhet, varekode/aktør og bruksstatus |
| SPC/prepared fish feed | HS-koder, råvarekategori, fôrprodukt, laksefôr | `210610` er ikke soyaspesifikk, `23099040` er prepared fish feed og ikke automatisk SPC/laksefôr | Hold SPC i primary-check til SSB/Tolletaten/fôraktører avklarer metode |
| Encelle-/gjærprotein | Forskningsforsøk, kommersiell skala, LCA, regulatorisk aksept, pilotøkonomi | Forsøksresultat dokumenterer mekanisme, ikke industriell implementering | Skill "teknisk mulighet" fra "roadmap-klar pilot" |
| Insektprotein | Mattrygghetslitteratur, Mattilsynet-regler, Volare actor-dossier, sidestrømsvolum, fôrkjøperkrav | At insekter kan brukes i fôr betyr ikke at ønskede substrater er lovlige eller økonomiske | Lag substratliste med grønn/gul/rød, risikokrav og kjøperkrav |
| Okara/BSG | Svenske prosjektdata, volumestimater, hygiene, produsent-QA, Novel Food/matgrade, off-taker | Benchmark gir kandidat, ikke norsk pilot | Behandle Axfoundation/RISE som benchmark og produsentintervju som pilotgate |
| Marint restråstoff | Råstoffvekt, produktvekt, fraksjoner, sluttbruk, høyverdi, plantebasert B-spor | Sterk norsk baseline kan feilaktig brukes som første prosess-sidestrømspilot | Hold som sjømat-/fraksjonsbenchmark og egen actor-learning track |
| RecoLab/næringsstoffløkker | Infrastrukturcase, relative effekter, absolutte N/P/K-tall, gjødselregelverk, 2026 driftsskala | Pilotdesign og massebalanse er ulike bevis | Bruk som benchmark til N/P/K, sluttprodukt og regelverk er validert |
| Matsvinnkaskade | LCA-rangering, policytiltak, butikkdrift, husholdningsadferd, redistribusjon, biogass | LCA kan ikke alene velge operativ pilot | Koble LCA til konkret fraksjon, beslutningspunkt og driftsaktør |
| Offentlig innkjøp | DFØ-veiledning, politiske mål, kjøkkenkapasitet, kontrakter, leverandørmarked | Veiledning dokumenterer mulighet, ikke effekt | Bruk som demand-side gate med innkjøper- og leverandørvalidering |
| KPI-er | Policyindikatorer, råstoffstrømmer, actor-rapportering, pilotmåling, LCA-effekter | KPI-er kan sammenligne epler og pærer | Alle KPI-er må ha dataeier, enhet, frekvens, systemgrense og beslutningsbruk |

## 4. Pilotkandidater Som Kan Falle Bort

| Pilotkandidat | Regulatorisk fallgrunn | Økonomisk fallgrunn | Praktisk fallgrunn | Foreløpig rødt flagg |
|---|---|---|---|---|
| A1 encelle-/gjærprotein i oppdrettsfôr | Manglende godkjenning, dokumentasjonskrav, fôrtrygghet | For høy kost mot SPC/fiskemel, uklar CAPEX, usikker råvare-/energitilgang | Ikke tilstrekkelig pilotpartner, uklare volumterskler, ingen kjøperkrav | Kan bli FoU-dialog, ikke 2026-pilot |
| A2 insektprotein på nordiske sidestrømmer | Substrat ikke lovlig, ABP/TSE, kjøkken-/matavfall/gjødsel/slam stoppes | Høy produksjonskost, lav margin, usikker proteinpris, skaleringskapital | Batchkvalitet, kontaminanter, logistikksvikt, manglende fôrkjøper | Bør parkeres uten grønn/gul/rød substratgate |
| A3 Axfoundation/Framtidens foder benchmark | Ikke regulatorisk pilot i norsk kontekst | Finansieringsmodell kan ikke kopieres | Resultater/status ikke bekreftet, svensk økosystem kan være særtilfelle | Bruk som benchmark, ikke pilot |
| B1 okara til mat/ingrediens | Matgrade, Novel Food, hygiene, allergen/prosesskrav | Liten eller allerede bundet strøm, stabilisering/kjøling dyrt, lav betalingsvilje | Høy fukt, kort holdbarhet, batchvariasjon, ingen off-taker | God kandidat bare med råvareeier og QA-data |
| B1 bryggerimask til mat/ingrediens | Matgrade og hygiene etter bryggeprosess/transport | Tørking/stabilisering kan spise margin | 70-80 % fukt, mikrobiell risiko, raske tidsvinduer | Kan være bedre FoU-/produktcase enn TG-pilot |
| B2 matsvinnkvalitet butikk/HORECA | Ansvar ved donasjon, mattrygghet, datadeling/personvern/kontrakt | Lav direkte betalingsvilje, driftskost ved sortering/rapportering | Krever rutineendring i travel drift, kategoridata, partner | Mest praktisk, men kan bli utydelig uten baseline |
| B3 marint restråstoff | Kategori/fraksjon, mat-/fôrregelverk, K2/dødfisk | Mye er allerede utnyttet; høyverdi krever investering og marked | Logistikk, kvalitet per art/sektor, råstoffvekt vs produktvekt | Sterk benchmark, svak som første generelle B-pilot |
| B4 RecoLab/VA/næringsløkker | Gjødselvare-/slamregelverk, arealbruk, hygienisering, aksept | Tung infrastruktur og lang tidshorisont | Krever kommunal VA-governance og massebalanser | Sekundær benchmark, ikke første pilot |
| C1 offentlig innkjøp som demand-side | Anskaffelsesregelverk, likebehandling, kontraktskrav | Budsjett og leverandørtilgang kan stoppe ambisjon | Kjøkkenkapasitet, kompetanse, datarapportering | Må være støttegate, ikke selvstendig pilot uten konkret kjøkken |
| C2 KPI-/datastandard | Rapporteringsplikt, datadeling, konkurransesensitivitet | Rapportering koster og skaper lav nytte uten insentiv | Data finnes ikke konsistent hos aktører | Bruk som intern gate, ikke ekstern leveranse ennå |

## 5. Counterargument Map

| Objekt | Beste argument mot | Hvor sterkt er argumentet? | Respons/reparasjon |
|---|---|---|---|
| Spor A: fôr/import | Volumene er store, men det gjør ikke sirkulære alternativer mer pilotklare. A risikerer å bli et "big numbers"-spor med svak kommersiell vei. | Sterkt | Formuler A som strategisk scoping- og compliance-spor. Ikke lov pilot før kost, LCA, regulatorikk, fôrkrav og kjøper er validert. |
| Spor B: sidestrømmer/næringsstoffer | B samler for mange ulike materialstrømmer. Okara, BSG, matsvinn, sjømatrestråstoff, svartvann og biorest har ulike regler, økonomi og eiere. | Sterkt | Del B i kandidatfamilier og velg bare én første pilotgate. Bruk resten som benchmark eller fallback. |
| Spor C: adoption/governance | C kan bli et bredt policyessay uten operativ eier. Det kan forsinke A/B i stedet for å gjøre dem gjennomførbare. | Medium/sterkt | Gjør C til go/no-go-skjema per pilot: lov, kjøper, data, drift, governance, markedsmakt. |
| A1 encelle-/gjærprotein | Dette er FoU, ikke TG-pilot. TG kan ikke løse teknologisk skala, pris og LCA innen kort roadmap. | Sterkt | Bruk som NMBU/fôraktør-scoping. Pilot bare hvis industripartner kan beskrive realistisk demonstrasjon. |
| A2 insektprotein | Sirkularitetslogikken kolliderer med substratregelverket: de mest attraktive avfallsstrømmene kan være ulovlige. | Svært sterkt | Start med Mattilsynet og grønn/gul/rød substratliste. Ingen pilot uten lovlig substrat og fôrkjøper. |
| A3 Axfoundation benchmark | Svensk benchmark kan være god inspirasjon, men ikke norsk implementeringsbevis. | Medium | Intervju Axfoundation for læring, ikke som bevis i decision memo. |
| B1 okara/BSG | Kandidatene ser konkrete ut fordi svenske tall finnes, men norsk/nordisk råvareeier, QA og off-taker mangler. | Sterkt | Krev produsentdata og off-taker før B1 prioriteres som pilot. |
| B2 matsvinnkvalitet | Dette kan ende som workshop/kommunikasjon uten harde resultater. | Medium | Lås kategori, baseline, målepunkt, rutineendring og driftsaktør før det kalles pilot. |
| B3 marint restråstoff | Det meste er allerede utnyttet, og problemet er fraksjon/høyverdi, ikke generell sidestrøm. | Sterkt | Behandle som sjømatspesifikk benchmark og sekundær actor-learning track. |
| B4 RecoLab/næringsstoffløkker | For kapitaltungt, lokalt og tregt for første TG-pilot. | Svært sterkt | Bruk som benchmark for data, governance og regelverk; ikke pilotcommitment. |
| C1 offentlig innkjøp | Offentlig kjøpekraft er ofte overvurdert; kjøkken og kontrakter kan ikke absorbere umodne løsninger. | Medium | Koble til konkrete anskaffelser, kjøkkenpraksis og leverandørkapasitet. |
| C2 KPI/datastandard | KPI-er uten dataeier blir pynt, ikke styring. | Sterkt | Bruk KPI-er som valideringsfilter; ingen målverdier uten dataeier og frekvens. |

## 6. Hva Jan Thomas, Cathrine Og Eksterne Aktører Kan Utfordre

| Utfordrer | Rettmessig utfordring | Hva bør være klart før møte |
|---|---|---|
| Jan Thomas | "Hva er egentlig beslutningen nå: scope, pilot eller outreach?" | Si at beslutningen er scope + valideringssprint, ikke pilotcommitment. |
| Jan Thomas | "Hvorfor A+B, når ingen pilot er validert?" | Svar at A+B er problem- og kandidatspor; C definerer gates som kan avkrefte dem raskt. |
| Jan Thomas | "Hva er nordisk merverdi utover norske data?" | Skill norsk baseline, svensk benchmark, nordisk policy og konkrete actor-spørsmål. |
| Cathrine | "Er dette operativt nok for aktørsamtaler?" | Bruk aktørspørsmål per gate: lov, data, drift, kjøper, eier. |
| Cathrine | "Blir dette for teknisk og lite menneskelig/adoption-orientert?" | Løft B2 matsvinnkvalitet og C-gates som praksisnære innganger. |
| Mattilsynet/fagekspert | "Dere antar lovlighet eller matgrade uten substratspesifikk vurdering." | Ha substratliste og marker ukjent/lovlig/ikke lovlig. |
| Fôr-/sjømataktør | "Skretting/Denofa/SSB-tall representerer ikke vår råvaremiks eller kommersielle krav." | Be eksplisitt om actor-data og sitatsjekk; ikke bruk én aktør som proxy. |
| Offentlig innkjøper | "Dette er ikke anskaffbart innen våre kontrakter, prisrammer eller kjøkkenrutiner." | Formuler innkjøp som gate, ikke ferdig demand-side. |
| Okara/BSG-produsent | "Strømmen er allerede brukt, for våt, for ustabil eller ikke trygg nok." | Bruk dette som kill criterion, ikke som nederlag. |
| Avløps-/biogassaktør | "N/P/K, slam, biorest og struvitt kan ikke summeres på tvers av systemgrenser." | Krev dataordbok og produktspesifikke definisjoner. |
| Konkurranse-/handelsskikkaktør | "Markedsmakt er relevant, men dere har ikke vist årsak til disse pilotbarrierene." | Bruk markedsmakt som hypotesegate og intervjutema, ikke årsaksbevis. |

## 7. Mest Troverdige Uttak Nå, Og Hva Bør Vente

### Mest troverdig nå

| Uttak | Hvorfor det er troverdig | Forbehold |
|---|---|---|
| Scope-anbefaling: A+B med C som gate | Støttes av runde 3, track briefs og claim-register | Må kalles foreløpig og internt |
| Claim strength report | Direkte nyttig for statusdisiplin og videre syntese | Må ikke markere ekstern validering |
| Validation gate per pilot | Reduserer overclaim og gjør outreach konkret | Må ha eier per gate |
| Tallregister for A | SSB/Denofa/Skretting/Fiskeridirektoratet kan ryddes som datatyper | Ikke bruk til substitusjonseffekt |
| Weak claim list | Høy verdi før Jan Thomas/Cathrine-review | Må oppdateres etter 4A-4F |
| Actor outreach pack med red-team-spørsmål | Bygger direkte på svakhetene | Krever svarlogg med dato og bruksrett |

### Bør vente

| Uttak | Hvorfor det bør vente | Hva må reparere det |
|---|---|---|
| Ekstern roadmap-effekt | Ingen pilot har validert volum, kost eller effect pathway | Aktørdata, metode, baseline og pilotdesign |
| Pilotportefølje med rangering | Kandidatene er ikke sammenlignbare ennå | Opportunity radar etter 4A-4F og valideringsgate |
| Finansierbarhetsclaim | Funding-note er intern og tidsfølsom | Programscreening, eligibility, partnerfit |
| EUDR-Norge-konklusjon | Norsk/EØS-status og varekoder er ikke lukket | Juridisk primary-check |
| KPI-målverdier | Dataeiere og rapporteringsfrekvens ikke bekreftet | KPI-dataskjema med aktørrespons |
| Okara/BSG som første pilot | Mangler råvareeierdata, hygiene og off-taker | Produsent-QA, Mattilsynet/fagekspert og kjøper |
| RecoLab/næringsløkke som pilot | For tungt og datakrevende | Massebalanse, sluttprodukt, regelverk, lokal eier |

## 8. Kill Criteria

### Tverrgående kill criteria

| Kriterium | Parker hvis | Kan reaktiveres når |
|---|---|---|
| Lovlighet | Substrat/sluttbruk er ulovlig eller ikke avklarbar innen beslutningsvinduet | Myndighet/fagekspert gir tydelig grønn/gul vei |
| Mattrygghet | Risiko krever tester eller prosesskontroll ingen aktør vil eie | QA-plan og ansvarlig aktør finnes |
| Materialitet | Strømmen er for liten, ustabil eller allerede høyverdig utnyttet | Data viser beslutningsrelevant volum eller læringsverdi |
| Økonomi | Stabilisering, transport eller prosess gjør pilot urealistisk uten høy subsidiering | Off-taker eller funding logikk er konkret |
| Demand-side | Ingen kjøper, bruker eller offentlig driftsaktør kan beskrive krav | Minst én demand-side aktør bekrefter interesse og krav |
| Data | Baseline, enhet, systemgrense eller dataeier mangler | Tallregister/KPI-skjema er komplett |
| Eierskap | Ingen kan eie drift, risiko, data eller rapportering | Navngitt piloteier eller eksplisitt eierbehov er etablert |
| Nordisk merverdi | Caset er kun lokalt og ikke lærbart for andre nordiske aktører | Benchmarklogikk eller komparativ verdi er tydelig |

### Kill criteria per spor

| Spor | Parker hvis | Hold hvis |
|---|---|---|
| A | Fôraktører ikke ser realistisk råvare-/pris-/kvalitetsvei, eller Mattilsynet/EU-gate blokkerer substrater | A kan fungere som strategisk import-, compliance- og FoU-scoping |
| B | Ingen konkret strøm passerer volum, hygiene, logistikk og off-taker | B kan snevres til matsvinnkvalitet/adoption eller benchmark |
| C | C blir løs policy uten direkte go/no-go for A/B | C brukes som datagate, regelverksgate og adoption-gate per pilot |

## 9. Repair Actions

| Svakhet | Repair action | Eier/kilde | Output |
|---|---|---|---|
| SSB/actor/fôrdata blandes | Lag tallregister for A med én rad per tall, datakilde og bruksstatus | 4A + SSB/Tolletaten/fôraktører | `A-feed tallregister` |
| EUDR-Norge uklar | Juridisk primary-check mot regjeringen, EFTA/EØS, Lovdata og direktorater | 4A/4E | Avklart formulering med absolutte datoer |
| Encelle-/gjærprotein overclaims | NMBU/Foods of Norway-intervju om modenhet, kost, LCA, regulatorikk | P1 outreach | Modenhetsnotat og sitatgodkjenning |
| Insektprotein usikker lovlighet | Grønn/gul/rød substratliste med Mattilsynet/fagekspert | P1 outreach | Substratgate for `CL-A-021` |
| Okara/BSG pilotklarhet uvalidert | Produsentintervju + QA-data + off-taker-sjekk | 4B/P1 | Kandidatmatrise med go/no-go |
| Matsvinnkvalitet for vag | Velg produktkategori, driftsaktør, baseline og rutineendring | 4C/P2 | Pilotcanvas for B2 |
| Marint restråstoff for generelt | SINTEF/FHF dataordbok og aktørintervju per fraksjon | 4D/P2 | Fraksjonskart og benchmarkstatus |
| RecoLab overføres ukritisk | RecoLab/NSVA/Eawag + norsk VA-case sammenligning | 4D | Benchmarkkart, ikke pilotclaim |
| Offentlig innkjøp overdrives | Intervju innkjøper/kjøkken om kontrakt, pris, meny og data | 4E/P2 | Demand-side gate |
| Markedsmakt kausalitet for svak | Intervju leverandør/kjøper/tilsyn om konkrete barrierer | 4E | Policy-to-practice map |
| KPI-er mangler dataeier | KPI-dataskjema per indikator | 4E/4F | Internt KPI-appendix med status |
| Pilotøkonomi mangler | Enkel unit economics-sjekk per kandidat: råvare, transport, stabilisering, prosess, off-taker | 4F + aktør | Pilotbarhets-score |

## 10. Anbefaling Til Master

1. Integrer 4G som negativ kontroll i claim strength report.
2. Oppdater ikke canonical docs før 4A-4F har levert og mini-verifikasjon har sjekket at svakhetene faktisk er adressert.
3. I decision memo v0.3 bør "pilotprioritering" byttes til "valideringsprioritering" med tydelige kill criteria.
4. Opportunity radar bør gi høy score til muligheter som har både siterbart grunnlag og lav repair-cost. Lav score til kapitaltunge eller juridisk uklare spor, selv om fortellingsverdien er høy.
5. Før Jan Thomas/Cathrine-review bør de få én slide med: "Dette kan vi si nå", "Dette må vente", "Dette kan drepe hvert spor".

