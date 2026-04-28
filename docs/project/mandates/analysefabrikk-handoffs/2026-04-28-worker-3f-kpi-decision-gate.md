---
tittel: "Worker 3F handoff - KPI-minimum og decision-memo gate"
status: Utført internt
eier: Worker 3F
dato: 2026-04-28
scope:
  - PCQ-C-002
  - decision memo v0.2 gate
  - claims som må holdes tilbake
canonical_docs_redigert: false
grunnlag:
  - docs/project/mandates/analysefabrikk-runde-3-prompts-2026-04-28.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
  - docs/project/mandates/decision-memo-food-tg-scope.md
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3a-eudr-norge.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3b-ssb-hs-importdata.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3c-foraktor-kryssjekk.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3d-okara-bsg-hygiene.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3e-marint-restrastoff.md
---

# Worker 3F handoff - KPI og decision-memo gate

Dette notatet definerer et minimum av KPI-er som kan brukes til intern styring etter runde 3, og en gate for hva `decision memo v0.2` kan si før ekstern validering. Ingen claims skal markeres `Validert eksternt` på grunnlag av dette notatet. KPI-er skal brukes som datakrav og styringslogikk, ikke som eksterne effektpåstander, før dataeier, metode og rapporteringsrutine er bekreftet.

## 1. KPI-minimum

| Spor | KPI | Definisjon | Enhet | Datakilde | Dataeier | Frekvens | Status |
|---|---|---|---|---|---|---|---|
| A - fôr/import | Soyaimport per varekode | Import til Norge av soyabønner, soyabønnemel, soyakaker/reststoff og soyaolje, separat per SSB-varenummer og år. Skal ikke summeres til "total soya" uten metodeforklaring. | tonn/år og MNOK/år | SSB 08801, varekodene `1201`, `120810`, `230400`, `1507` | SSB / master dataansvar | årlig | kan brukes internt |
| A - fôr/import | Oppdrettsfôr totalt | Omsetning av fôr i norsk oppdrettsnæring. Definisjonen er oppdrettsfôr totalt, ikke bare laksefôr og ikke import. | tonn/år | Fiskeridirektoratet/Sjømat Norge tabell 43 | Fiskeridirektoratet / Sjømat Norge | årlig | kan brukes internt |
| A - fôr/import | Fiskemel/fiskepellets import | Import til Norge av mel og pelleter av fisk/akvatiske dyr utjenlig til menneskeføde, målt per SSB-kode. Faktisk bruk i norsk fôr må valideres separat. | tonn/år og MNOK/år | SSB 08801, `23012010/90` | SSB / master dataansvar | årlig | kan brukes internt |
| A - fôr/import | SPC-andel per fôraktør | Soyaproteinkonsentrat som andel av gjennomsnittlig fôrsammensetning hos navngitt fôraktør. Skal ikke behandles som bransjesnitt uten flere aktører eller aggregert bransjekilde. | prosent av ferdig fôr, ev. tonn/år hvis volum deles | Skretting offentlig rapport; BioMar/Cargill/Mowi/Sjømat Norge ved svar | Hver fôraktør / Sjømat Norge ved aggregat | årlig | needs-actor-validation |
| A/C - sporbarhet | Soya-/fôrråvare-sporbarhetsdekning | Andel relevant råvarevolum der opprinnelsesland, sertifisering, leverandør-/batchsporbarhet og eventuell EUDR/DDS-referanse eller kunde-dokumentasjon er dokumentert. | prosent av volum og datakompletthet | Denofa, fôraktører, Landbruksdirektoratet/Miljødirektoratet, EUDR Information System/Traces der relevant | Råvareimportør/fôraktør; myndighetsstatus hos direktorat | kvartalsvis/årlig | needs-actor-validation |
| A - fôr/import | Nasjonalt SPC-volum | Nasjonal SPC-import eller SPC-bruk i norsk lakse-/oppdrettsfôr. SSB `210610` er ikke soyaspesifikk, og `23099040` kan ikke kalles SPC uten metode- og aktørsjekk. | tonn/år | SSB/Tolletaten/fôraktører, metode ikke låst | Ikke avklart | ikke fastsatt | ikke bruk |
| B - prosess-sidestrøm | Ren prosess-sidestrøm per anlegg | Tonn våt og tørrstoffkorrigert okara, bryggerimask eller annen ren prosess-sidestrøm per produsent/anlegg, med batchfrekvens, temperatur, fukt/tørrstoff og nåværende destinasjon. | tonn/år, kg/batch, prosent tørrstoff | Oatly/The Green Dairy/Fazer/Valio; bryggerier; RISE/Axfoundation som benchmark | Råvareeier/produsent | månedlig/årlig | needs-actor-validation |
| B - prosess-sidestrøm | Høyverdiandel for valgt strøm | Andel av valgt strøm som går til mat/ingrediens eller annen dokumentert høyere verdi før fôr, biogass, gjødsel, kompost eller restbehandling. Må defineres per fraksjon og lovlig sluttbruk. | prosent av volum og tonn/år | Produsent, ingrediensaktør, Mattilsynet/fagekspert, logistikk-/mottaksaktør | Råvareeier + off-taker | månedlig/årlig | needs-actor-validation |
| B - prosess-sidestrøm | Batchkvalitet oppfylt | Andel batcher som oppfyller minimumskrav for tid/temperatur, fukt/tørrstoff, mikrobiologi, fremmedlegemer, allergen-/kontaminantstatus, sporbarhet og holdbarhet for valgt sluttbruk. | prosent av batcher | Produsent-QA, ingrediensaktør, Mattilsynet/fagekspert | Råvareeier / QA-ansvarlig | per batch/månedlig | needs-actor-validation |
| B - marint restråstoff | Marint restråstoff utnyttelsesgrad | Utnyttet marint restråstoff delt på tilgjengelig marint restråstoff, separat for fiskeri/havbruk og sektor. Må ikke tolkes som høyverdiandel. | prosent og kt/år | SINTEF/FHF/Kontali `Analyse marint restråstoff 2024` | SINTEF/FHF/Kontali | årlig | kan brukes internt |
| B - marint restråstoff | Sluttbruk for marint restråstoff | Fordeling av marint restråstoff til humant konsum, fôrprodukter, biogass/energi og ikke utnyttet. Skill råstoffvekt fra produktvekt. | kt/år og prosent, med vektdefinisjon | SINTEF/FHF/Kontali, `marintrestrastoff.no`, aktører for fraksjonssplitt | SINTEF/FHF/Kontali; aktører ved fraksjon | årlig | needs-primary-check |
| B/C - matsvinn | Matsvinnmengde per sektor | Mengde matsvinn fordelt på sektor/verdikjedeledd, med definisjon av matsvinn, målepunkt, geografi og metode. | tonn/år, kg/innbygger/år eller kg/enhet | Matvett/NORSUS/SSB/Eurostat/Matsvinnutvalget | Matvett/NORSUS/SSB eller relevant myndighet | årlig | needs-primary-check |
| B/C - matsvinn | Redistribusjons- og nedprisingsandel | Andel egnet overskuddsvare/ferskvare som redistribueres, doneres, selges nedpriset eller flyttes til høyere kaskadetrinn før restfraksjon. | prosent av egnet volum/verdi | Matvett, Too Good To Go, dagligvare/HORECA, offentlig kjøkken | Driftsaktør/dataleverandør | ukentlig/månedlig | needs-actor-validation |
| B/C - næringsstoffløkker | N/P/K-gjenvinningsgrad | Mengde nitrogen, fosfor og kalium som gjenvinnes til dokumentert produkt/sluttbruk delt på relevant inngående N/P/K-strøm. Produktstatus og regelverk må være avklart. | kg eller tonn N/P/K per år; prosent | RecoLab/NSVA, VEAS, HIAS, Den Magiske Fabrikken, gjødsel-/avløpsmyndigheter | Anleggseier / myndighet / master dataansvar | årlig | needs-primary-check |
| C - adoption/governance | Datakompletthet per claim/KPI | Andel tall- og KPI-rader som har definisjon, år, geografi, enhet, kilde, dataeier, frekvens og status. Brukes som intern kvalitetsgate før memo/roadmap. | prosent av rader | Claim register, evidence matrix, PCQ, KPI appendix | Master session | per sprint | kan brukes internt |
| C - adoption/governance | Valideringsstatus per claim | Antall og andel claims klassifisert som `integrer nå`, `needs-primary-check`, `needs-actor-validation` eller `archive/reject`. Ingen rad kan bli `Validert eksternt` uten dokumentert respons. | antall og prosent | Claim register, handoffs, actor validation logg | Master session | per sprint | kan brukes internt |
| B - prosess-sidestrøm | Nordisk total for okara/BSG fra L4-estimat | L4-/Perplexity-estimat for nordisk okara eller bryggerimask uten produsent-/statistikkgrunnlag. Skal ikke brukes som KPI eller baseline. | tonn/år | L4-/Perplexity-notater | Ikke avklart | ikke fastsatt | ikke bruk |

Minimumsregel: `decision memo v0.2` kan vise KPI-tabellen som intern måleplan. Den bør ikke vise KPI-resultater som ekstern effekt før status er `kan brukes internt` med siterbar kilde eller senere bekreftet av aktør/primærkilde.

## 2. Decision memo gate

| Tema | Kan brukes i v0.2? | Formulering med forbehold | Hva må vente |
|---|---|---|---|
| Scopevalg A+B med C som tverrgående lag | Ja | "TG bør arbeide videre med Spor A og B som hovedspor, med Spor C som adoption-, governance- og datagate." | Endelig pilotvalg, effektmål og ekstern roadmap før validering. |
| EUDR som EU-driver | Ja | "I EU er soya en EUDR-råvare, og EUDR gjør soyakjeder til et sporbarhets- og dokumentasjonstema." | Ikke si at norsk innenlands soyaimport er omfattet av norsk EUDR-forskrift. Endelig Lovdata/EØS-/praktisk Traces-status må vente. |
| EUDR Norge/EØS | Ja, med tydelig avgrensning | "Norsk høringsgrunnlag peker på delvis EØS-innlemmelse, der soya ikke er foreslått innlemmet; norske fôraktører kan likevel møte EU-kunde- og dokumentasjonskrav." | Endelig EØS-komité/Storting/forskrift, varekoder for SPC/prepared feed og aktørpraksis. |
| SSB/HS soya- og fiskemeldata | Ja | "SSB gir offisielle importserier per varekode for soyabønner, soyabønnemel, soyakaker, soyaolje og fiskemel/fiskepellets." | Nasjonalt SPC-volum, SPC skjult i `23099040`, artsfordelt laksefôr og faktisk fôrbruk per aktør. |
| Denofa og Skretting | Ja, som actor-/benchmarkdata | "Denofa og Skretting gir konkrete actor-tall som viser hvilke data TG bør be markedet om; de er ikke bransjeproxy alene." | Bransjesnitt, total norsk SPC-tonnasje, Denofa kundesplitt og råvarefordeling på tvers av BioMar/Cargill/Mowi. |
| Encelle-/gjærprotein i fôr | Ja, som scopingretning | "Encelle-/gjærprotein er teknisk og strategisk relevant som importsubstitusjonsspor, men må valideres mot modenhet, kost, LCA, råvaretilgang og regelverk." | Pilotcommitment, kommersiell skala, kost/effekt og substitusjonsvolum. |
| Insektprotein på godkjente sidestrømmer | Ja, kun som kandidat | "Insektprotein kan være et integrert A/B-case hvis substratet er lovlig, trygt, stabilt og har demand-side." | Grønn/gul/rød substratliste, Mattilsynet/fagekspert, Volare/Finnprotein eller tilsvarende, fôr-/sjømatkjøper. |
| Okara og bryggerimask | Ja, som svenske benchmark og kandidatstrømmer | "Okara og bryggerimask er konkrete prosess-sidestrømmer med svenske benchmarktall og tydelige hygiene-/logistikkbarrierer." | Norsk/nordisk produsentvolum, food-grade status, holdbarhet, Mattilsynet/Novel Food-vurdering og off-taker. |
| Marint restråstoff | Ja, som norsk benchmark | "SINTEF/FHF gir en sterk norsk sjømatbaseline for utnyttelse og gjenværende gap; dette bør brukes som høyverdi-benchmark, ikke blandes med plantebasert B1-pilot." | Fraksjon-til-sluttbruk, human vs fôr/pet/energi, K2/dødfisk-splitt og actor-validering. |
| Matsvinnkvalitet og redistribusjon | Ja, som adoption-/fallbackspor | "Matsvinnkvalitet kan bli en rask adoption-pilot hvis baseline, målepunkt og driftspartner bekreftes." | Matvett/Too Good To Go/dagligvare/HORECA-data, KPI-er og dokumentert rutineendring. |
| Næringsstoffløkker/Recolab | Ja, som benchmark/sekundærspor | "RecoLab og norske VA-/biogjødselcase er nyttige benchmark for næringsstoffløkker, men tunge som første TG-pilot." | N/P/K-massebalanser, produktstatus, regelverk, norsk overføringsverdi og aktøreierskap. |
| KPI-er | Ja, som appendix og intern gate | "KPI-er bør brukes som datakrav: hvert tall må ha definisjon, år, geografi, enhet, kilde, dataeier, frekvens og status." | Ekstern KPI-effekt, målverdier og sammenligning mellom aktører før datatilgang og rapporteringssystem er bekreftet. |

## 3. Claims som må holdes tilbake

Disse claimene bør ikke løftes inn i `decision memo v0.2` annet enn som hypotese, kandidat eller benchmark med eksplisitt status.

| Claim | Hold tilbake som | Hvorfor |
|---|---|---|
| CL-A-002 | FoU-/pilot-hypotese | Gjær-/encelleprotein er relevant, men kost, LCA, råvaretilgang, regulatorisk vei og industrimodenhet er ikke validert. |
| CL-A-006 | Regulatorisk hypotese | Tidligere matvarer, swill og avløpsbaserte ressurser er ikke pilotklare før lovlighet, farer og risikomodeller er dokumentert. |
| CL-A-011 | Juridisk gate, ikke konkret substratfasit | TSE/ABP/fôrregelverk er en sentral gate, men grønn/gul/rød-status per substrat krever Mattilsynet/EU/EØS-sjekk. |
| CL-A-012 | Benchmark-hypotese | Axfoundation/Framtidens foder kan være læringscase, men resultater og overføringsverdi er ikke validert. |
| CL-A-013 | Aktørhypotese | Volare/Finnprotein er relevant valideringsaktør, men kapasitet, kundestatus og regelverksmodenhet er ikke dokumentert som svar. |
| CL-A-020 | Scopingpilot, ikke kommersielt claim | Beslutningsrelevant, men ikke validert for volum, SPC, kost, LCA, aktørandel eller kommersiell skala. |
| CL-A-021 | Pilotkandidat, ikke pilotvalg | Insektprotein på sidestrømmer avhenger av lovlig substrat, QA, aktørkapasitet og demand-side. |
| CL-A-022 | Governance-benchmark | Kan ikke brukes som effektbevis før status, resultater og finansieringsmodell er bekreftet. |
| CL-B-014 | Sidestrømshypotese | Okara/BSG er konkrete kandidater, men norsk/nordisk volum, batchstabilitet, hygiene og nåværende destinasjon mangler. |
| CL-B-016 | Benchmark med overføringsforbehold | RecoLab er relevant, men N/P/K, sluttprodukter, regulatorisk status og norsk overføringsverdi må låses. |
| CL-B-021 | Pilotclaim, bare som kandidat | Ren prosess-sidestrøm kan bli første pilot, men ingen valgt strøm er pilotklar uten produsentdata, Mattilsynet/fagekspert og off-taker. |
| CL-B-022 | Adoption-pilot-hypotese | Matsvinnkvalitet i butikk/HORECA trenger baseline, målepunkt, driftspartner og dataleverandør. |
| CL-B-023 | Sekundærpilot/benchmark | Næringsstoffløkker er relevante, men for tunge og uavklarte som første pilot uten N/P/K- og regelverksdata. |
| CL-C-002 | Demand-side hypotese | Offentlige innkjøp kan være motor, men operativ kapasitet, kontrakter, kjøkkenpraksis og datakrav må valideres. |
| CL-C-011 | EU/Norge-delt compliance-claim | EU-soya-scope kan brukes; norsk/EØS soya-virkeområde, SPC og praktiske krav må ikke overdrives. |
| CL-C-012 | Governance-hypotese | Matsvinnstyring krever hybrid governance, men konkrete virkemidler og lovstatus må primærsjekkes. |
| CL-C-015 | KPI-hypotese | KPI-er kan defineres internt, men effekt, målverdier og ekstern rapportering må vente på datatilgang, dataeier og frekvens. |

I tillegg skal disse formuleringene holdes helt ute: L4-total om 550-600 000 tonn norsk soyaimport, nasjonalt SPC-volum fra `210610`/`23099040` uten metode, nordisk okara/BSG-total fra L4-estimat, "EUDR gjelder direkte i Norge for soya", "Skretting er bransjesnitt", og "okara/BSG er matgrade/pilotklar".

## 4. Første innsiktspakke

Forslag til 7 trygge slide-/seksjonsbudskap for intern diskusjon:

| # | Budskap | Status |
|---:|---|---|
| 1 | TG bør snevre scope til A+B som hovedspor og bruke C som adoption-, governance- og datagate. | kan brukes internt |
| 2 | Fôrsporet har bedre baseline etter runde 3: SSB/HS, Fiskeridirektoratet/Sjømat Norge, Denofa og Skretting kan brukes hvis de holdes som separate datatyper. | kan brukes internt |
| 3 | EUDR er en sterk EU-sporbarhetsdriver for soya, men norsk/EØS-status må formuleres presist: delvis innlemmelse, soya ikke foreslått innlemmet i norsk høringsgrunnlag, praktisk aktørpåvirkning uavklart. | needs-primary-check |
| 4 | Okara og bryggerimask er de mest konkrete plantebaserte B-kandidatene, men foreløpig som svenske benchmark og datakrav, ikke som pilotklare råvarer. | needs-actor-validation |
| 5 | Marint restråstoff gir et sterkt norsk høyverdi-benchmark med tydelig utnyttelsesgrad og gap, men skal ikke blandes med første plantebaserte B-pilot. | kan brukes internt |
| 6 | Første pilotvalg må passere fire gates: lovlig sluttbruk/substrat, batchkvalitet/hygiene, demand-side/off-taker og dataeier/KPI-frekvens. | kan brukes internt |
| 7 | KPI-appendix bør være en beslutningsgate, ikke en effektfortelling: ingen tall går inn uten definisjon, år, geografi, enhet, kilde, dataeier, frekvens og status. | kan brukes internt |

## 5. Masteranbefaling

Etter runde 3 bør master lage fire leveranser i denne rekkefølgen:

1. **Decision memo v0.2.** Bruk A+B med C som gate, og løft bare statusmerkede formuleringer. Memoet bør ha en egen "kan sies nå / må vente" seksjon. Ingen claim får `Validert eksternt`.
2. **Actor outreach emails.** Lag korte eposter/intervjuguider for fem første grupper: Landbruksdirektoratet/Miljødirektoratet, Denofa/Skretting/Sjømat Norge, NMBU/Foods of Norway, okara/BSG-produsent + Mattilsynet/fagekspert, og SINTEF/FHF eller marint restråstoffaktør. Bruk spørsmålene fra 3A-3E og krev definisjon, år, geografi, enhet, kilde og sitatstatus i svar.
3. **KPI appendix.** Bruk tabellen over som v0.1. Skill mellom interne kvalitets-KPI-er som kan tas i bruk nå og fag-/aktør-KPI-er som krever primærsjekk eller aktørvalidering.
4. **Ny primary-check queue v0.2.** Lukk rader som runde 3 faktisk har avklart, og opprett/viderefør kø for: endelig EUDR Norge/EØS og varekoder, SPC/prepared fish feed-metode, artsfordelt laksefôr, okara/BSG matgrade og produsentvolum, marint fraksjon-til-sluttbruk, matsvinnbaseline og N/P/K-massebalanser.

Stoppsignal før ekstern beslutningskommunikasjon: EUDR-Norge må være eksplisitt avklart eller merket uavklart, SPC/fôrbaseline må være ryddet som SSB/HS-metode eller actor-/benchmarkdata, første B-pilot må ha minst én råvareeier og ett hygiene-/regelverkssvar, og alle uvaliderte claims må stå som hypoteser.
