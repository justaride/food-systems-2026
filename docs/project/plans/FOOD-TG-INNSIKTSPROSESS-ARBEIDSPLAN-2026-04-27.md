# Food TG innsiktsprosess - detaljert arbeidsplan

**Dato:** 27.04.2026  
**Status:** Operativ arbeidsplan v0.1  
**Formål:** Beskrive hvordan innsiktsarbeidet for Food Transition Group skal gjennomføres nå: prosesser, leveranser, verktøy, kvalitetskriterier, roller og milepæler.  
**Koblet styringsnotat:** `docs/project/plans/FOOD-TG-STATUS-ARBEIDSPLAN-2026-04-27.md`

## 1. Arbeidsmålet nå

Neste fase skal ikke være mer generell research. Den skal gjøre eksisterende kunnskap beslutningsklar og prosessklar.

Målet er å produsere **Food TG Insight Pack v0.1**, som skal gjøre tre ting:

1. Gi internt team et tydelig beslutningsgrunnlag for scope.
2. Klargjøre første aktørdialoger uten å overselge uvalidert innsikt.
3. Bygge bro fra innsikt til pilotspor, finansiering og roadmap.

Dette er intern analyse og prosessforberedelse. Det teller ikke som ekstern validering før aktører faktisk har respondert.

## 2. Prosessgrenser

| Arbeidsrom | Hva skjer her | Statusmerking | Primær eier |
|---|---|---|---|
| Gabriel + Codex | Analyse, syntese, kildeutvalg, arbeidsdokumenter, beslutningsgrunnlag | Utført internt | Gabriel |
| Intern NCH/Natural State | Scopevalg, mandatavklaringer, prioriteringer, godkjenninger | Besluttet internt | Jan Thomas/Einar/Cathrine/Martin |
| Ekstern aktørdialog | Intervjuer, validering, commitment, workshopdeltakelse | Validert eksternt / Forpliktet eksternt | Jan Thomas/Cathrine/Thea |
| Offentlig leveranse | Roadmap, event, publisering, kommunikasjon | Publisert/levert | Thea/Martin/NCH |

Alle leveranser skal merkes med en av disse statusene:

| Status | Brukes når |
|---|---|
| Utført internt | Det finnes analyse, utkast, notat eller struktur i repoet |
| Besluttet internt | NCH/Natural State har tatt en faktisk beslutning |
| Validert eksternt | En ekstern aktør har gitt konkret respons |
| Forpliktet eksternt | En aktør har sagt ja til rolle, workshop, data, pilot eller finansiering |
| Publisert/levert | Leveransen er sendt, publisert eller presentert |

## 3. Sluttleveranse for denne fasen

**Food TG Insight Pack v0.1** bør bestå av disse delene:

| Del | Formål | Foreslått fil | Status |
|---|---|---|---|
| Insight synthesis | 5-8 sider med hovedfunn, usikkerheter og anbefalt scope | `docs/project/mandates/food-tg-insight-pack-v0.1.md` | Mangler |
| Claim register | Påstander, hypoteser, evidens og valideringsbehov | `docs/project/mandates/claim-register-food-tg.md` | Mangler |
| Evidence matrix | Kildegrunnlag sortert etter spor, kvalitet og beslutningsverdi | `docs/project/mandates/evidence-matrix-food-tg.md` | Mangler |
| Sporbrief A | Sirkulært fôr og importavhengighet | `docs/project/mandates/track-brief-a-feed-import.md` | Mangler |
| Sporbrief B | Sidestrømmer, matsvinnkvalitet og næringsstoffløkker | `docs/project/mandates/track-brief-b-sidestreams-nutrients.md` | Mangler |
| Sporbrief C | Adoption mechanisms for circular food | `docs/project/mandates/track-brief-c-adoption.md` | Mangler |
| Actor validation pack | Aktørprioritering, ask, intervjuguide og outreach-logg | `docs/project/mandates/actor-validation-pack-food-tg.md` | Mangler |
| Decision memo | Anbefaling om scope, første aktører og neste sprint | `docs/project/mandates/decision-memo-food-tg-scope.md` | Mangler |

## 4. Prosessarkitektur

Arbeidet bør kjøres i åtte prosesser. P0-P5 er Gabriel + Codex-dominert. P6-P8 krever interne beslutninger og ekstern aktørkontakt.

| ID | Prosess | Hovedoutput | Kritisk for |
|---|---|---|---|
| P0 | Oppsett og styring | Mappe, maler, statusfelt, møterytme | Kontroll |
| P1 | Kildeinventar | Prioritert kildeliste | Evidens |
| P2 | Evidens- og kvalitetsvurdering | Evidence matrix | Siterbarhet |
| P3 | Claim og hypoteser | Claim register | Beslutninger |
| P4 | Tre sporbriefs | A/B/C briefs | Scopevalg |
| P5 | Aktørdialogforberedelse | Actor validation pack | M13/M15 |
| P6 | Intern scopebeslutning | Decision memo | Mandatlås |
| P7 | Ekstern validering | Intervjunotater og justert register | Legitimitet |
| P8 | Roadmap-konvertering | Pilot-, adoption- og finance-notater | M16-M18 |

## 5. P0 - Oppsett og styring

**Mål:** Etablere arbeidsrytme, filstruktur og statuslogikk før innsikten bearbeides.

| Punkt | Beskrivelse |
|---|---|
| Input | Mandat, møteoversikt, statusanalyse, eksisterende research-mapper |
| Verktøy | Markdown, repoet, `rg`, `git status`, beslutningslogg |
| Output | Filmaler, statusfelt, ukentlig rytme, owner-liste |
| Eier | Gabriel, med beslutninger fra Jan Thomas/Cathrine/Einar |
| Frist | 29.04.2026 |

Arbeidssteg:

1. Opprett dokumentpakken i `docs/project/mandates/`.
2. Bruk samme statusfelt i alle dokumenter: `Utført internt`, `Besluttet internt`, `Validert eksternt`, `Forpliktet eksternt`, `Publisert/levert`.
3. Sett ukentlig rytme:
   - Mandag: kilde- og claim-arbeid.
   - Tirsdag: internt beslutningsmøte.
   - Onsdag: oppdater brief/actor pack.
   - Torsdag: aktørdialog/validering.
   - Fredag: status, gap og neste uke.
4. Speil viktige Notion-oppgaver i repoet hvis Notion brukes operativt.

Akseptkriterier:

- Alle nye leveranser har eier, status, frist og neste handling.
- Det finnes et klart skille mellom intern analyse og ekstern validering.
- Beslutninger ligger i en decision log, ikke bare i løpende møtenotater.

## 6. P1 - Kildeinventar

**Mål:** Velge hvilke kilder som faktisk skal bære innsiktsarbeidet, slik at vi ikke drukner i hele korpuset.

Primære kildemapper og filer:

| Kildeområde | Bruk |
|---|---|
| `docs/project/mandates/` | Mandat, TG-prosess og styringskrav |
| `docs/meetings/` og `MØTEOVERSIKT.md` | Beslutningshistorikk og oppgavehistorikk |
| `research/DATA-READINESS-SLUTTRAPPORT.md` | Datagrunnlag, proveniens og dekningsstatus |
| `research/KI-PRIORITY.md` | Høyprioriterte rapporter/avhandlinger |
| `research/PLATTFORM-KOBLING.md` | Kobling mellom seed-data og lokale filer |
| `research/RESEARCH-MISSIONS.md` | Gjennomførte research-spor og åpne gaps |
| `research/VERDIKJEDE-KARTLEGGING-PLAN.md` | Verdikjedeankeret |
| `research/norden/verdikjede/` | Systemkart, sirkularitet og verdikjedegaps |
| `research/bibliotek/sirkularitet/` | Sirkulær mat, matsvinn, LCA, regenerativt |
| `research/perplexity-20-04-26/` | Dype spørsmål om fôr, svartvann, okara, biorest, matsvinn |
| `research/bibliotek/forskningsrunde-2026-04-20-r2/` | R9, fôr, nordiske case, policy, barrierer |
| `src/lib/data/circularity-questions.ts` | Operasjonelle sirkularitetsspørsmål |
| `src/lib/data/evidence-pack.ts` | Evidence Pack-struktur |
| `src/lib/data/actors.ts` | Aktørgrunnlag |
| `src/lib/data/kpis.ts` | Mulige måleparametre |

Verktøy:

| Verktøy | Bruk |
|---|---|
| `rg --files` | Finne relevante filer raskt |
| `rg "term"` | Søke etter temaer som fôr, okara, svartvann, matsvinn, R9 |
| `npm run compute-ki-priority` | Oppdatere prioritering av rapporter hvis korpuset endres |
| `npm run inventory-urls` | URL- og kildeoversikt |
| `npm run compute-file-coverage` | Sjekke hvor godt seed-data peker til lokale filer |
| `npm run check-pdf-quality` | Avdekke svake PDF-er før sitering |
| `npm run build-remediation-backlog` | Lage ryddeliste for manglende/dårlige kilder |

Arbeidssteg:

1. Lag en kortliste med 30-50 kilder som er relevante for spor A, B og C.
2. Merk hver kilde med ett eller flere spor: `A-feed`, `B-sidestream`, `C-adoption`, `baseline`, `actor`, `finance`, `policy`.
3. Merk kildekvalitet: `primærkilde`, `sekundærkilde`, `intern syntese`, `uvalidert researchnotat`.
4. Skille kilder som kan siteres direkte fra kilder som bare bør brukes som pekere.
5. Identifiser 5-10 kilder som må sjekkes manuelt før ekstern bruk.

Akseptkriterier:

- Minst 10 sterke kilder per hovedspor eller eksplisitt notert kildegap.
- Ingen viktig påstand i Insight Pack står uten kilde eller valideringsbehov.
- Interne notater brukes ikke som eneste grunnlag for eksterne fakta.

## 7. P2 - Evidens- og kvalitetsvurdering

**Mål:** Gjøre kildene beslutningsklare, ikke bare tilgjengelige.

Evidence matrix bør ha disse feltene:

| Felt | Beskrivelse |
|---|---|
| ID | Kort unik ID, f.eks. `EV-A-001` |
| Spor | A, B, C, baseline, actor, finance eller policy |
| Kilde | Filsti eller ekstern referanse |
| Kildetype | Primær, sekundær, intern syntese, datasett, møte |
| Hovedfunn | 1-3 setninger |
| Støtter claim | Claim-ID-er som kilden støtter |
| Svekkelse/usikkerhet | Hva kilden ikke beviser |
| Siterbarhet | Høy, medium, lav |
| Kvalitet | 1-5 |
| Neste handling | Bruk, sjekk, erstatt, valider med aktør |

Kvalitetsskala:

| Score | Betydning |
|---|---|
| 5 | Primærkilde, fersk, direkte relevant, kan siteres |
| 4 | Solid sekundærkilde eller fagrapport, relevant |
| 3 | Nyttig, men indirekte eller delvis utdatert |
| 2 | Intern syntese eller ufullstendig kilde |
| 1 | Hypotese/indikasjon, må ikke brukes uten validering |

Akseptkriterier:

- Hver anbefaling i decision memo peker til minst 3 kilder eller er merket som hypotese.
- Alle tall og sterke faktapåstander har kilde med siterbarhet `høy` eller `medium`.
- Alle usikre antakelser er synlige i matrisen.

## 8. P3 - Claim og hypoteser

**Mål:** Skille hva vi vet, hva vi tror, og hva aktører må validere.

Claim register bør ha disse feltene:

| Felt | Beskrivelse |
|---|---|
| Claim-ID | `CL-A-001`, `CL-B-001`, `CL-C-001` |
| Påstand/hypotese | Kort formulering |
| Type | Fakta, analyse, hypotese, beslutningsforslag |
| Spor | A, B eller C |
| Evidens | EV-ID-er eller filstier |
| Konfidens | Høy, medium, lav |
| Risiko hvis feil | Hva beslutningen kan bomme på |
| Valideringsbehov | Hvem eller hva må bekrefte/avkrefte |
| Status | Utført internt, validert eksternt osv. |
| Neste handling | Konkret neste steg |

Prioriterte claim-kategorier:

| Kategori | Eksempel |
|---|---|
| Problemclaim | Importavhengighet i fôr skaper sårbarhet og sirkularitetsmulighet |
| Ressursclaim | Sidestrømmer finnes, men kvalitet/logistikk begrenser høyverdig bruk |
| Barrierclaim | Regulering, innkjøp og markedsmakt hindrer skalering |
| Aktørclaim | Bestemte aktører kan validere eller bære et pilotspor |
| Pilotclaim | Et konkret case kan bli finansierbart innen roadmap-perioden |
| Adoptionclaim | En mekanisme kan endre praksis raskere enn ny teknologi alene |

Akseptkriterier:

- Minst 5 kildeunderbygde claims per spor.
- Minst 2 usikre hypoteser per spor er merket for aktørvalidering.
- Ingen claim merkes som validert uten ekstern respons eller intern beslutning.

## 9. P4 - Tre sporbriefs

**Mål:** Lage beslutningsklare briefs for de tre anbefalte sporene.

### Spor A: Sirkulært fôr og importavhengighet

Briefen skal svare på:

1. Hvilken importavhengighet eller ressursavhengighet adresseres?
2. Hvilke nordiske sidestrømmer/ressurser kan inngå i fôr?
3. Hvilke regulatoriske og markedsmessige barrierer må løses?
4. Hvilke aktører må validere dette?
5. Hvilken pilot kan være realistisk i 2026-2029?

Første kildespor:

- `research/perplexity-20-04-26/alt-for-ingredienser-bsf-encelleprotein.md`
- `research/perplexity-20-04-26/alt-for-kommersialisert-norden-2025.md`
- `research/perplexity-20-04-26/alt-protein-for-barrierer-systematisk.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p07-alt-fiskefor-aktorkart-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p13-ax-framtidens-foder-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p17-volare-selskapsdossier-2026-04-20.md`

### Spor B: Sidestrømmer, matsvinnkvalitet og næringsstoffløkker

Briefen skal svare på:

1. Hvor oppstår de viktigste sidestrømmene og kvalitetstapene?
2. Hva hindrer høyverdig bruk før biogass/kompost?
3. Hvilke data, standarder eller logistikkløsninger mangler?
4. Hvordan kobles matsvinn, svartvann, biorest og næringsstoffløkker?
5. Hvilke case kan brukes som nordiske referanser?

Første kildespor:

- `research/norden/verdikjede/06-matsvinn-sirkulaer.md`
- `research/perplexity-20-04-26/havre-okara-sidestroemmer-dybdeanalyse.md`
- `research/perplexity-20-04-26/sidestroemmer-plantebasert-norden.md`
- `research/perplexity-20-04-26/npk-tap-svartvann-norden.md`
- `research/perplexity-20-04-26/mikroplast-biorest-norske-anlegg.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md`

### Spor C: Adoption mechanisms for circular food

Briefen skal svare på:

1. Hvilke mekanismer kan flytte praksis raskt: innkjøp, standarder, data, regulering, tilgang?
2. Hvor hindrer markedsstruktur og logistikk sirkulær skalering?
3. Hva kan offentlige innkjøp, dagligvare, HORECA eller sjømataktører gjøre?
4. Hva må være policyanbefaling, og hva må være pilot?
5. Hvilke adoption metrics skal inn i roadmap?

Første kildespor:

- `research/norden/regulatory-policy-landscape-nordic.md`
- `research/analyse/offentlig-innkjop-nordisk.md`
- `research/norden/nordisk-markedsstruktur-data-2026.md`
- `research/whitepaper/executive-brief.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p42-barriereanalyse-sirkulaer-mat-2026-04-20.md`
- `src/lib/data/kpis.ts`

Felles brief-mal:

| Seksjon | Innhold |
|---|---|
| Problem | Hva er systemproblemet? |
| Hvorfor nå | Hvorfor er dette relevant for TG og 2026-2029? |
| Hva vi vet | 5-8 kildeunderbygde funn |
| Hva vi tror | 2-4 hypoteser som må valideres |
| Barrierer | Regulering, marked, teknologi, data, logistikk |
| Aktører | Hvem må med, hvem må høres, hvem kan eie tiltak? |
| Pilotmuligheter | 1-3 mulige piloter |
| Adoption/funding | Hva kan skape gjennomføring? |
| Decision ask | Hva må internt team beslutte? |

Akseptkriterier:

- Hver brief kan leses på under 10 minutter.
- Hver brief har tydelig anbefaling: `gå videre`, `hold som støttespor` eller `parkér`.
- Hver brief har minst ett konkret aktørspørsmål.

## 10. P5 - Aktørdialogforberedelse

**Mål:** Gjøre ekstern dialog presis nok til å validere, ikke bare informere.

Actor validation pack bør bestå av:

| Del | Innhold |
|---|---|
| Aktørliste | Navn, organisasjon, land, kategori, relasjon, prioritet |
| Ask | Hva vi konkret ber aktøren om |
| Hypotese | Hvilken claim/hypotese aktøren kan validere |
| Intervjuguide | 6-8 spørsmål for 30 minutter |
| Outreach-logg | Kontaktet, respons, møtebooket, gjennomført, oppfølging |
| Consent/notatstandard | Hvordan notater kan brukes internt/eksternt |

Aktørkategorier:

| Kategori | Eksempler på relevans |
|---|---|
| Do-tanks/stiftelser | AX Foundation, Rethink Food, Foodstudio |
| Verdikjedeaktører | Fôr, sjømat, HORECA, dagligvare, foredling |
| Offentlig/kommunal | Innkjøp, avfall, næringsstoff, by/region |
| Akademia/forskning | NMBU, nordiske forskningsmiljøer, R9/circularity |
| Finansiering | Nordic Innovation, Interreg, Horizon, stiftelser |
| Case-eiere | Volare, 100% Fish, Helsingborg/Recolab, Too Good To Go |

Foreslått intervjuguide:

1. Hvilket sirkulært matsystemproblem mener du er mest modent for nordisk samarbeid nå?
2. Hvilke av sporene A/B/C virker mest relevante fra ditt ståsted?
3. Hvilke claims i briefen er riktige, feil eller mangler nyanser?
4. Hvilke barrierer stopper skalering: regulering, marked, data, logistikk, finansiering eller tillit?
5. Hvilke aktører må være med for at dette ikke bare blir analyse?
6. Hvilken pilot eller demonstrator ville du prioritert?
7. Hva må et roadmap inneholde for at det skal være nyttig for dere?
8. Er det aktuelt å delta i workshop, gi innspill eller bidra i et videre prosjekt?

Akseptkriterier:

- Minst 10 prioriterte aktører med tydelig `ask`.
- Første 3-5 samtaler er valgt ut før bredere outreach.
- Hver samtale kobles til konkrete claim-ID-er og ikke bare generelle temaer.

## 11. P6 - Intern scopebeslutning

**Mål:** Ta et tydelig internt valg før prosjektet bruker mye tid på ekstern dialog.

Decision memo bør legge frem:

| Beslutning | Mulige valg | Anbefalt form |
|---|---|---|
| Hovedscope | A alene, B alene, C som støtte, A+B, A+B+C | Velg 2 hovedspor + C som adoption-lag |
| Minimumsland | 3, 4 eller 5 nordiske land | Minst 3 for minimum, 4 for legitimitet |
| Første aktører | Relasjonelle aktører, strategiske systemaktører, begge | Start relasjonelt + 2 strategiske sonderinger |
| Workshopformat | Stor workshop, liten scoping session, intervjuserie | Liten scoping session + intervjuer |
| Roadmapformat | Whitepaper, roadmap, slide deck, nettside | Roadmap som leveranse, whitepaper som backing |

Akseptkriterier:

- Beslutningen er logget med dato, eier og begrunnelse.
- Scope er smalt nok til at hver valgt retning kan få brief, aktører, pilot og funding.
- Det er tydelig hva som ikke prioriteres nå.

## 12. P7 - Ekstern validering

**Mål:** Teste om våre interne hypoteser tåler møte med aktører.

Dette starter først når P4-P6 har gitt et minimum av beslutningsgrunnlag.

Arbeidssteg:

1. Send kort pre-read til aktøren: maks 1 side eller 5 bullets.
2. Gjennomfør 30 minutter samtale med to roller: én leder samtalen, én noterer.
3. Noter eksplisitt:
   - Hva bekreftes?
   - Hva avkreftes?
   - Hva er nytt?
   - Hva er aktørens mulige rolle?
   - Hvilken oppfølging trengs?
4. Oppdater claim register samme dag.
5. Merk aktørstatus: `kontaktet`, `respons`, `møte`, `validert`, `commitment`.

Akseptkriterier:

- Minst 3 eksterne samtaler før workshop 1.
- Minst én aktørrespons per valgt hovedspor.
- Alle endringer i scope etter dialog er sporbare til notat eller beslutning.

## 13. P8 - Roadmap-konvertering

**Mål:** Gjøre innsikt til mandatleveranser: pilot briefs, adoption note, finance note og roadmap.

Konverteringslogikk:

| Innsiktsprodukt | Blir til |
|---|---|
| Evidence matrix | Baseline og systemkart |
| Claim register | Roadmap-begrunnelse og risikologg |
| Sporbriefs | Pilot briefs og adoption note |
| Actor validation pack | Commitment map |
| Decision memo | TG Charter og roadmap-scope |
| Intervjunotater | Workshopdesign og ekstern valideringsseksjon |

Roadmap må inneholde:

1. North Star og scope.
2. Baseline og systembarrierer.
3. 2-3 prioriterte intervensjonspunkter.
4. Pilotportefølje med eiere eller eierbehov.
5. Adoption mechanisms: policy, standarder, innkjøp, data eller markedspraksis.
6. Funding-spor for minst to prosjektmuligheter.
7. KPI-er for ernæring, klima, biodiversitet, sirkularitet og coalition power.
8. Milepæler 2026-2029.
9. Hva som er validert, og hva som fortsatt er hypotese.

Akseptkriterier:

- Roadmap skiller tydelig mellom foreslått, besluttet, validert og forpliktet.
- Minst to prosjektspor har reell funding-logikk.
- Det finnes en tydelig M18-plan for videre arbeid etter publisering.

## 14. Verktøystack

### Lokale analyseverktøy

| Verktøy | Bruk |
|---|---|
| `rg` / `rg --files` | Raskt søk i repoet |
| `sed` | Lese relevante utdrag |
| `jq` | Strukturert lesing av JSON-data |
| `shasum -a 256` | Dokumentkontroll og filidentitet |
| `pdftotext` / `pdfinfo` | PDF-ekstraksjon og metadata hvis installert |
| `git status` | Skille nye prosjektendringer fra eksisterende endringer |

### Repo- og dataverktøy

| Kommando | Når brukes den |
|---|---|
| `npm run compute-ki-priority` | Når nye rapporter må prioriteres for KI/lesing |
| `npm run inventory-urls` | Når URL-status og kildeoversikt må oppdateres |
| `npm run compute-file-coverage` | Når vi må sjekke dekning mellom data og lokale filer |
| `npm run check-pdf-quality` | Før PDF-er brukes i siterbart grunnlag |
| `npm run build-remediation-backlog` | Når manglende eller svake kilder må ryddes |
| `npm run db:audit` | Når databaseintegritet må sjekkes |
| `npm run db:verify` | Når produksjonstall/importstatus må verifiseres |
| `npm run db:import:docs` | Når dokumentkorpus skal inn i databasen |
| `npm run db:import:actors` | Når aktørgrunnlaget skal oppdateres |
| `npm run dev` | Når dashboard/app skal brukes i presentasjon eller kontroll |

### Prosessverktøy

| Verktøy | Bruk |
|---|---|
| Decision Log | Formelle valg, dato, eier og begrunnelse |
| Claim Register | Påstander, hypoteser, evidens og valideringsbehov |
| Evidence Matrix | Kildekvalitet og beslutningsverdi |
| Commitment Map | Aktører, asks, land, relasjon, status |
| Interview Guide | Standardisert 30-minutters validering |
| Workshop Run-of-Show | Agenda, øvelser, beslutninger og output |
| Roadmap Kanban | M13-M18 og Evidence Pack-status |

### Eksterne arbeidsflater

| Flate | Bruk | Krav |
|---|---|---|
| Notion | Praktisk oppgave- og møtestyring hvis teamet bruker det | Beslutninger må speiles i repoet |
| Google Docs/Slides | Deling med team/aktører | Sluttversjon eller eksport bør arkiveres i repoet |
| E-post/kalender | Outreach og møtebooking | Respons og commitments må logges |
| NCH-kanaler | Publisering/event | Først etter scope og validering |

## 15. Detaljert 10-dagers arbeidsplan

| Dag | Dato | Fokus | Output | Eier |
|---|---|---|---|---|
| 1 | 27.04 | Opprette prosessplan og avklare arbeidsmåte | Dette dokumentet | Gabriel + Codex |
| 2 | 28.04 | Kildeinventar for A/B/C | Kildekortliste | Gabriel + Codex |
| 3 | 29.04 | Evidence matrix v0.1 | 30-50 vurderte kilder | Gabriel + Codex |
| 4 | 30.04 | Claim register v0.1 | Claims og hypoteser per spor | Gabriel + Codex |
| 5 | 01.05 | Sporbrief A og B | Utkast | Gabriel + Codex |
| 6 | 04.05 | Sporbrief C og decision memo | Utkast | Gabriel + Codex |
| 7 | 05.05 | Intern scopebeslutning | Beslutning logget | Jan Thomas/Cathrine/Einar/Gabriel |
| 8 | 06.05 | Actor validation pack | Prioritert aktørliste og asks | Thea/Cathrine/Gabriel |
| 9 | 07.05 | Intervjuguide og første outreach | 3-5 forespørsler | Jan Thomas/Cathrine/Thea |
| 10 | 08.05 | Oppdatert Insight Pack v0.1 | Pakke klar for aktørsamtaler | Gabriel |

## 16. Milepæler og gates

| Gate | Dato | Må være oppfylt | Hvis ikke |
|---|---|---|---|
| G1 - Kildegrunnlag klart | 29.04 | Kildekortliste og evidence matrix v0.1 | Reduser scope til færre spor |
| G2 - Claims klare | 30.04 | Claim register med hypoteser og gaps | Ikke gå til outreach |
| G3 - Briefs klare | 04.05 | A/B/C briefs med decision ask | Ingen scopebeslutning uten briefs |
| G4 - Scope låst | 05.05 | Beslutning logget | Roadmap-risiko øker |
| G5 - Actor pack klar | 06.05 | Aktører, asks og intervjuguide | Ekstern dialog blir for generell |
| G6 - Første respons | 15.05 | 3-5 samtaler/reaksjoner | Workshop må re-scopes |
| G7 - Workshop 1 | 20.05 | Validert scope og pilotshortlist | M15 svekkes |
| G8 - Roadmap v1 | 08.06 | Struktur, pilots, adoption, finance | M16/M17 i fare |

## 17. RACI for neste fase

| Arbeid | Accountable | Responsible | Consulted | Informed |
|---|---|---|---|---|
| Insight Pack | Gabriel | Gabriel + Codex | Cathrine, Jan Thomas | Einar, Martin |
| Scopebeslutning | Jan Thomas/Einar | Jan Thomas, Cathrine, Gabriel | Martin | Thea |
| Evidence matrix | Gabriel | Gabriel + Codex | Cathrine | Jan Thomas |
| Actor validation pack | Cathrine/Thea | Thea, Cathrine, Gabriel | Jan Thomas | Einar/Martin |
| Outreach | Jan Thomas/Cathrine | Jan Thomas, Cathrine, Thea | Gabriel | Einar/Martin |
| Workshop 1 | Jan Thomas/Cathrine | Cathrine, Thea, Gabriel | Einar/Martin | Aktører |
| Pilot briefs | Cathrine/Gabriel | Gabriel + Codex | Aktører | Jan Thomas/Einar |
| Finance note | Martin/Einar | Gabriel + Martin | Cathrine | Jan Thomas |
| Roadmap | Gabriel/Cathrine | Gabriel + Codex | Jan Thomas/Einar/Martin | NCH |

## 18. Kvalitetsregler

1. Ikke bruk intern syntese som eneste kilde for sterke faktapåstander.
2. Ikke kall noe eksternt validert uten notat fra ekstern respons.
3. Ikke la markedsstruktur overta mandatet; bruk det som barrierelag for sirkulær skalering.
4. Hver valgt retning må ha problem, evidens, aktører, pilotlogikk og funding-logikk.
5. Hver aktørkontakt må ha et konkret `ask`.
6. Hver roadmap-påstand må kunne spores tilbake til claim register eller ekstern validering.
7. Gaps er akseptable hvis de er synlige og knyttet til neste handling.

## 19. Risikoer

| Risiko | Konsekvens | Tiltak |
|---|---|---|
| For bredt scope | Roadmap blir generell og lite gjennomførbar | Velg 2 hovedspor og bruk C som adoption-lag |
| For lite ekstern validering | Mandatet oppfylles svakt | 3-5 korte samtaler før workshop |
| Kildevolum tar over arbeidet | Lite beslutningsfremdrift | Bruk kildekortliste, ikke hele korpuset |
| Aktørdialog starter uten tydelig ask | Høflige samtaler uten commitment | Actor validation pack før outreach |
| Whitepaper blir konkurranserapport | Circular Food-mandatet svekkes | Koble makt/marked til sirkulære barrierer og løsninger |
| Funding kommer for sent | Piloter blir urealistiske | Finance note parallelt med pilotbriefs |
| Beslutninger blir muntlige | Uklar status og ansvar | Decision Log etter hvert møte |

## 20. Neste konkrete handlinger

1. Opprett `evidence-matrix-food-tg.md`.
2. Opprett `claim-register-food-tg.md`.
3. Lag kildekortliste for spor A/B/C.
4. Skriv første sporbrief for sirkulært fôr/importavhengighet.
5. Skriv første aktørvalideringspakke med 10 prioriterte aktører og 3-5 første samtaler.
6. Legg frem decision memo i neste interne møte.
