---
tittel: Food TG — Research OS / Runde 12 masterplan
status: Intern arbeidsplan — åpner ingen claims
eier: Gabriel
dato: 2026-06-24
scope: Uavhengig researchprosess for underlag, kartlegginger, lister og oversikter uten avhengighet til JT-dataunderlag.
bruksregel: Ingen output fra denne planen blir ekstern faktastemme uten mottak, source-shortlist, PCQ, claim-lock og overclaim-vurdering.
relaterte_filer:
  - docs/superpowers/specs/2026-06-24-food-tg-research-os-design.md
  - docs/project/mandates/food-tg-research-runde12-promptpack-2026-06-24.md
  - research/_status/food-tg-research-backlog-2026-06-24.csv
  - docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
---

# Food TG — Research OS / Runde 12 masterplan

## 1. Hvorfor denne runden finnes

Denne runden finnes for å gjøre Food TG i stand til å fortsette researcharbeidet uten å vente på JT-dataunderlag. Formålet er ikke å erstatte aktørdata, men å bygge en styrt prosess for å hente inn offentlige, forskningsbaserte, aktørrapporterte og gap-orienterte underlag som kan sorteres før de brukes.

Arbeidet skal gi oss:

- smale researchprompts som kan kjøres én og én
- kartlegginger, lister og oversikter som kan mottaksføres
- datagap som kan bli egne funn i stedet for usynlige hull
- tydelig skille mellom underlag, analyse, modell, visualisering og claim
- en fast vei fra rå output til source-shortlist, PCQ, claim-lock eller parkering

## 2. Prinsipper

Riktig arbeidsenhet er én smal prompt om gangen. En prompt skal være liten nok til at output kan kontrolleres, kildeklasses og parkeres uten at resten av arbeidet stopper.

Prinsippene er:

1. Primærkilde først, sekundærkilde bare med merking.
2. Tomme celler er funn når de viser hva som ikke måles, ikke er åpent, eller krever aktørtilgang.
3. Realisert volum, kapasitet, plan, potensial og hypotese skal holdes adskilt.
4. Ingen rå prompt-output blir whitepapertekst direkte.
5. Hver output skal ende i en gate: source-shortlist, PCQ, claim-lock, actor-gate, forstaelse eller parkering.
6. Ingen temaer holdes igjen fordi JT-dataunderlag ikke foreligger.

## 3. Temaunivers

Temauniverset består av ti arbeidsområder:

| Tema | Formål |
|---|---|
| Verdikjede per ledd og land | Bygge ledd-profiler for import, primærproduksjon, foredling, distribusjon og nordisk sammenligning. |
| Resiliens og beredskap | Skille forsyningssikkerhet, lagre, importnoder, lokal robusthet og infrastruktur fra generell matsystemkritikk. |
| Fôr og innsatsfaktorer | Kontrollere fôrimport, fiskeolje, soya/SPC, alternative proteiner og råvarestatus. |
| Waste, sidestrøm og R9 | Kartlegge restråstoff, slam, digestat, matavfall og prevention etter R-stige. |
| Aktørkart og praksisfelt | Utvide regenerativ, lokalmat, markedshage, REKO, andelslandbruk, permakultur og nettverk. |
| Distribusjon og offentlige innkjøp | Undersøke grossistledd, HORECA, rammeavtaler, EMV, nye kanaler og eiendomsbarrierer. |
| Bondeøkonomi og margin | Fullføre N11-oppfølging, marginpress, gjødselsjokk, samvirkestruktur og distriktsoutput. |
| True-cost, sufficiency og eksternaliteter | Avklare metodegrunnlag uten å åpne kronefestede true-cost-claims før kildene tåler det. |
| Governance og implementering | Kartlegge virkemidler, ansvar, regulering, barrierer og finansieringsmuligheter. |
| Visualisering og modellering | Lage datakrav for ledd-profiler, radar/spider, kausalkart, datagapfigurer og uttaksoversikt. |

## 4. Prioriteringslogikk

Prioritet settes etter risiko og bruksverdi:

- `P0`: kjent overclaim/freshness-risiko, besluttet blindsone, eller claim-lock-kandidat.
- `P1`: viktig whitepaper/deck-underlag eller høyverdi type-C-funn.
- `P2`: bredde, atlas, senere modellberikelse eller lavere operasjonell hast.

P0 betyr ikke at funnet er viktigst politisk. Det betyr at usikkerheten må håndteres først fordi den kan blokkere språk, figur, modell eller beslutning.

## 5. Rundeformat

Runden kjøres som små batcher:

1. Velg 3-7 prompts fra backloggen.
2. Kjør én prompt av gangen.
3. Lagre rå output i `next_artifact`.
4. Skriv mottaksrad med kildeklasse, hulltype, gate og importbeslutning.
5. Løft bare modne funn til source-shortlist, PCQ eller claim-lock.
6. Parker funn som ikke tåler neste gate ennå.

Dette gjør prosessen restartbar og kontrollerbar, også når enkelte kilder ikke finnes eller krever aktørkontakt.

## 6. Output-typer

Output-typene er:

- `datasok`: kilde- og datainnhenting med tabell, lokator og status per celle.
- `forstaelse`: konsept, metode, mekanisme eller kausalt resonnement som må holdes nær analyse før claim.
- `kartlegging`: aktør-, nettverk-, tiltak-, case- eller landoversikt.
- `datagap`: strukturert registrering av hva som ikke måles, ikke finnes åpent eller krever aktørtilgang.
- `visualiseringsunderlag`: datakontrakt, figurkandidat, modellfelt eller evidens per visualisering.

## 7. Tema-for-tema arbeidskart

| Tema | Første spørsmål | Typisk output | Første gate |
|---|---|---|---|
| Verdikjede per ledd og land | Hvilke ledd kan beskrives med primærdata, og hvor oppstår hull? | ledd-profil table | PCQ |
| Resiliens og beredskap | Hvilke konkrete noder, lagre og importavhengigheter kan belegges? | beredskapsmatrise | PCQ |
| Fôr og innsatsfaktorer | Hva kan bevises om fôrimport og marine råvarer uten speilkilder? | råvare- og kodeledger | PCQ |
| Waste, sidestrøm og R9 | Hva er faktisk utnyttet, høyverdi og bare modellert? | R-stige-tabell | PCQ |
| Aktørkart og praksisfelt | Hvilke aktører finnes, og hvilke er bare kandidatstubber? | actor CSV / nettverksnotat | actor-gate |
| Distribusjon og offentlige innkjøp | Hvilke kanaler kan gi alternativ markedsadgang? | kontrakt- og gateledger | PCQ |
| Bondeøkonomi og margin | Hvilke marginer er desk-researchbare, og hva krever aktørdata? | margin pressure table | PCQ / actor-gate |
| True-cost, sufficiency og eksternaliteter | Hvilke metoder er relevante uten at vi tallfester for tidlig? | metodenotat | source-shortlist |
| Governance og implementering | Hvilke virkemidler finnes, og hvor stopper implementeringen? | ansvarsmatrise / sløyfenotat | forstaelse |
| Visualisering og modellering | Hvilke felt må finnes før vi lager figur eller score? | datakontrakt | internal / forstaelse |

## 8. Første kjørerekkefølge

Første anbefalte kjørerekkefølge er:

1. P0 freshness/overclaim cleanup prompts.
2. N11 / bondeøkonomi follow-ups.
3. ledd-profile prompts for import and sidestrøm.
4. actor/practitioner mapping prompts.
5. true-cost and visualization prompts.

Rekkefølgen skal revideres når P0-risikoer er lukket, eller når nye type-C-hull viser at en gren må bli actor-gate i stedet for desk research.

## 9. Stop-regler

Stopp eller parker prompt-output når:

- sterkeste kilde bare er sekundær og funnet er claim-nært
- data blander verdi, volum, kapasitet og potensial uten å kunne skilles
- output gjør aktørintensjon av en strukturindikator
- funnet krever lukket aktørdata eller beslutningstilgang
- en figur ville skjule tomme celler
- prompten åpner et nytt claim før source-shortlist eller PCQ
- output antyder avhengighet til JT-dataunderlag i stedet for å registrere hullet

## 10. Ferdigkriterier

Runde 12 er ferdig nok til første bruk når:

- alle 50 prompts finnes i promptpack og backlogg med samme ID-rekkefølge
- alle ti temaer har minst fem smale prompts
- hvert prompt har prioritet, output-type, gate, caveat og lagringsmål
- mottaksprotokollen kan klassifisere A/B/C kildeklasse og Type A/B/C hull
- ingen output fra prosessen kan bli whitepaper- eller deck-stemme uten mottak og gate
- arbeidet kan starte uten JT-dataunderlag
