# Marine And Food Waste Evidence

Export date: 2026-07-04
Packet type: evidence
Status label: mixed PCQ/source-shortlist
Allowed use: Use only according to the status label. Keep caveats and missing cells visible.

## What This Source Is For

Curated evidence packet for marine and food waste evidence.

## Core Claims Or Working Propositions

- Use the included excerpts as source-grounded context, not as permission to upgrade claims.
- Preserve source labels, method distinctions and explicit gaps.
- If the source says wait, parked, actor-gated or do-not-visualize-yet, keep that boundary.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Included source excerpts | Give NotebookLM retrieval surface. | Excerpted for quality; source file remains canonical. |
| Status label | Controls allowed use. | Do not upgrade without separate verification. |
| Known gaps | Useful for decisions and actor questions. | Missing values must stay visible. |

## Known Caveats

- This packet may combine sources with different evidence levels.
- Do not create external deck claims without checking the strictest status among the supporting sources.

## Deck Angles

- Use as evidence spine for a slide or appendix section.
- Phrase as "what the evidence supports" plus "what remains blocked".

## Bad Generic Framing To Avoid

- Do not remove the source label.
- Do not turn a candidate or shortlist into a completed finding.

## Source Paths Included

- research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md
- research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md
- research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md

## Source Excerpts

### research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md

````markdown
## Kort dom

SINTEF/FHFs årlige "Analyse marint restråstoff" er en sterk, sammenhengende primærkilde (rapportserie #12+ siden 2013) som tallfester totalt restråstoff, utnyttelsesgrad og fordeling på humant konsum / fôr / biogass-energi. Siste utgave (2024-data, rapport 2025:00517, publisert 2025-06-02) er hentet i fulltekst og gir hele R-stigen. Hovedfunn 2024: ca. 1,1 mill. tonn tilgjengelig restråstoff, ca. 976 000 tonn (89 %) "utnyttet" — men kun ca. 15 % av produktvolumet går til humant konsum, mens fôr (66 %) og biogass/energi (19 %) dominerer. Høy utnyttelsesgrad er altså IKKE det samme som høyverdianvendelse; rapporten sier selv at "lite av det norske restråstoffet utnyttes inn i høyere betalende markeder" (kosttilskudd/kosmetikk/farmasi).

## Sterkeste kilde

**SINTEF Ocean AS / Kontali Analyse AS:** *Analyse marint restråstoff 2024 — Tilgjengelighet og anvendelse av marint restråstoff fra norsk fiskeri- og havbruksnæring.* Rapportnr **2025:00517**, ISBN 978-82-14-07469-7, gradering Åpen, datert **2025-06-02**, 33+11 sider. Forfattere: Magnus Myhre, Roger Richardsen (SINTEF Ocean), Gunn Strandheim, Ragnar Nystøyl (Kontali Analyse). Oppdragsgiver: FHF (prosjekt 901844 / 302007613). Lokator: fulltekst i repo `research/external/dro-1206/downloads/sintef-fhf-analyse-marint-restrastoff-2024.txt`; SINTEF-publikasjonsside og NVA-arkiv (se Hentede kilder). Dette er rapport #12+ i en årlig serie; foregående utgave (2023-data, rapport **2024:00583**, ISBN 978-82-14-07214-3, datert 2024-06-14, samme forfattergruppe) er også hentet i fulltekst og brukes som korroborerende foregående år.

Kildeklasse: **A** (primær, fulltekst-tilgang, begge utgaver).

## Svakeste punkt

- **"Eksport" finnes ikke som en ren R-stige-kategori i rapporten.** Eksport er en destinasjon som krysser alle anvendelsesnivåer (konsumprodukter til Asia, biogass-substrat til Danmark, fiskemel/-olje globalt). Rapporten rapporterer eksport som *verdi* (NOK), ikke som rent volum per R-nivå — derfor er eksport-volumceller i tabellen under bevisst tomme.
- **Biogass-volumet i tonn for 2024 er ikke skrevet ut eksplisitt i teksten** (kun andel 19 % av ~476 000 t produktvolum i Figur 1/31). Tonnverdien under er derfor avledet (≈ 90 000 t) og merket B; 2023-verdien er derimot eksplisitt oppgitt (103 000 t).
- **Datagrunnlaget bygger delvis på personlig kommunikasjon fra industriaktører** (priser og enkelte volumstrømmer fra "spesialindustri marint restråstoff", N≈45), ikke utelukkende offentlig statistikk. SINTEF selv flagger beregningsrevisjoner mellom årganger (f.eks. dobbelttelling av ~15 000 t i 2022-tallet; revidert ombordprodusert ensilasje fra havgående flåte i 2024).
- **Konsum vs. fôr-grensen er glidende:** humant konsum brytes ned i direkte sjømatprodukter (~14 %) og indirekte (tran/proteinekstrakter, ~1 %); "high-value" farmasi/kosmetikk er volummessig marginalt og ikke skilt ut med egne tonnverdier.

## R-stige-tabell

R-nivå rangert etter verdihierarki: **humant konsum > fôr > energi/biogass**. Eksport er en destinasjon (kryssende), ikke et R-nivå. Tall er 2024 (rapport 2025:00517) om ikke annet er oppgitt. "Produktvolum" = produktvekt ut av industrileddet (~476 000 t totalt i 2024); "restråstoff-volum" = råstoffvekt inn.

| Fraksjon/anvendelse | Volum (tonn) | R-nivå (humant konsum / fôr / energi / eksport) | År | Lokator | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|
| Totalt tilgjengelig restråstoff | 1 094 000 | (ramme) | 2024 | 2025:00517, Tabell 1 | A | Ned 4 % fra 2023 (1 135 000 t) |
| Herav utnyttet | 976 000 (89 %) | (ramme) | 2024 | 2025:00517, Tabell 1 / kap. 5.9 | A | "Utnyttet" ≠ høyverdi — se Ikke si |
| Herav ikke-utnyttet | 118 000 | gap (R0) | 2024 | 2025:00517, kap. 1.1 | A | Hovedsakelig hvitfisk; sløyd/prosessert om bord, ikke ilandført |
| Produkter produsert av utnyttet restråstoff | ~476 000 (produktvekt) | (sum) | 2024 | 2025:00517, kap. 1.2/5.9.3 | A | 2023: ~485 000 t |
| **Humant konsum (totalt)** | ~70 000 (15 %) | humant konsum | 2024 | 2025:00517, kap. 1.2 / Figur 1 | A | Nest høyeste registrert; 2023: 68 000 t / 14 % |
| — direkte sjømatprodukter (hoder, lever, rogn, tunger, buklist) | ~14 % av produktvolum | humant konsum (direkte) | 2024 | 2025:00517, kap. 1.2/5.9.4 | A | Hvitfisk ~46 %/32 200 t + havbruk laks ~42 %/29 500 t av direkte konsum |
| — indirekte (tran, proteinekstrakter, kosttilskudd, farmasi) | ~1 % av produktvolum | humant konsum (indirekte) | 2024 | 2025:00517, kap. 1.2/5.9.4 | A | "High-value" farmasi/kosmetikk volummessig marginalt; ikke egen tonnverdi |
| **Fôr (totalt: fiskefôr, husdyrfôr, kjæledyrfôr, pelsdyrfôr)** | ~312 000 (66 %) | fôr | 2024 | 2025:00517, kap. 5.9.4 | A | Største anvendelse; 2023: 312 000 t / 64 % |
| — pet-food (kjæledyrfôr) | ~48 000 | fôr | 2023 | 2024:00583, kap. 5.9.4 | A | Vokst fra ~39 000 t (2019); 2024-tall ikke separat hentet |
| — husdyrfôr | < ~40 000 | fôr | 2024 | 2025:00517, kap. 5.9.4 | A | Falt fra ~70 000 t pga. K3→K2-skift på lakserestråstoff |
| — pelsdyrfôr | (synkende) |  | 2024 | 2025:00517, kap. 5.9.4 | B | Norsk pelsdyrforbud fra 2025; volum nær null, ikke tallfestet |
| **Biogass / energi / gjødsel** | ~90 000 (19 %, avledet) | energi (laveste R-nivå) | 2024 | 2025:00517, Figur 1/31 | B | Avledet = 19 % av ~476 000 t; 2023 eksplisitt: 103 000 t / 21 % |
| Biogass — K2 dødfisk laks | (delmengde) | energi | 2024 | 2025:00517, kap. 5.9.4 | A | Kategori-2-materiale; regelverk begrenser anvendelse; ned i 2024 pga. mindre dødfisk |
| Ensilering (1. prosessledd, ikke sluttanvendelse) | ~52 % av samlet restråstoff |  | 2024 | 2025:00517, kap. 1.2 | A | Mellomledd inn til fôr/biogass — IKKE et eget R-nivå; 2023: 51 % |
| Fiskemel og -olje (tradisjonell, pelagisk-drevet) | ~18 % av restråstoff |  | 2023 | 2024:00583, kap. 5.9.2 | A | Produksjon ned 12 % 2023→2024 |
| Fersk prosessering laks (lakseolje, FPH, FPC) | 183 000 (restråstoff inn) | fôr (mest) / konsum (FoU) | 2023 | 2024:00583, kap. 5.9.2 | A | Tredje største anvendelse; majoritet til fôr |
| Marine oljer (produktgruppe) | ~128 000 (produktvekt) | konsum/fôr (blandet) | 2023 | 2024:00583, kap. 5.9.3 | A | 2024-tall ikke separat hentet |
| FPC + FPH (produktgruppe) | ~117 000 (produktvekt) | fôr (mest) | 2023 | 2024:00583, kap. 5.9.3 | A | 2024-tall ikke separat hentet |
| Ombordprodusert havgående flåte (fiskemel/olje/ensilasje) | ~4 300 t mel + 990 t olje + ensilasje | fôr | 2023 | 2024:00583, kap. 5.2.2 / Tabell 5-3 | A | Datarevisjon i 2024 hevet utnyttelse fra havgående flåte til >40 % |
| **Eksport (destinasjon, kryssende)** | (ikke rapportert som rent volum per R-nivå) | eksport | 2024 | 2025:00517, kap. 5.10 | A med C-gap | Rapportert som verdi, ikke volum; tom celle bevart |
| — Eksportverdi (førstehånd restråstoff) | 4,8 mrd NOK | eksport (verdi) | 2024 | 2025:00517, kap. 5.10.1 | A | +6 % fra 2023 (4,5 mrd) |
| — Brutto omsetningsverdi (m/ verdiøkning) | 7,8 mrd NOK | eksport (verdi) | 2024 | 2025:00517, kap. 5.10.1 | A | 2023: 8,3 mrd; ned tross høyere førstehåndsverdi |
| Biogass-substrat eksportert til Danmark | (ikke tallfestet) | energi / eksport | 2024 | 2025:00517, kap. 5.9.4 | A med C-gap | "Signifikant andel" — volum ikke oppgitt; tom celle bevart |

### Sektorvis ramme (Tabell 1, 2024-data, rapport 2025:00517)

| Sektor | Råstoffgrunnlag (tonn) | Tilgj. restråstoff (tonn) | Utnyttet (tonn) | Utnyttelsesgrad |
|---|---|---|---|---|
| Hvitfisk (inkl. havbruk torsk) | 549 000 | 245 000 | 176 000 | 72 % |
| Pelagisk (sild, makrell, lodde) | 890 000 | 285 000 | 285 000 | 100 % |
| Havbruk (laksefisk) | 1 637 000 | 543 000 | 509 000 | 94 % |
| Skalldyr | 90 000 | 21 000 | 5 600 | 27 % |
| **Total** | **3 166 000** | **1 094 000** | **976 000** | **89 %** |

(Foregående år, 2023-data rapport 2024:00583: total 3 233 000 / 1 135 000 / 1 002 000 / 88 %.)

## Tomme celler (datagap, eksplisitt)

- **Eksportvolum per R-nivå:** ikke rapportert som rent tonn-tall — kun verdi (NOK). Tom celle bevart.
- **Biogass-volum 2024 i tonn:** ikke skrevet eksplisitt (kun 19 %); avledet ≈ 90 000 t, merket B.
- **Biogass eksportert til Danmark:** kun kvalitativt ("signifikant andel"), ingen tonnverdi.
- **Fritt blod fra havbruk med laksefisk:** 34 300 t (2024) / 33 300 t (2023) tilgjengelig, men *utnyttes ikke i særlig grad* — behandles som prosessvann i slakteriene. Ikke i utnyttet-volumet; reell datagap/tapt fraksjon.
- **Ikke-utnyttet restråstoff 118 000 t (2024):** ikke fraksjonert på art/anvendelse utover "hovedsakelig hvitfisk, sløyd om bord".
- **Pelsdyrfôr-volum:** ikke tallfestet (synkende mot null pga. forbud 2025).
- **High-value-fraksjoner (farmasi/kosmetikk/kosttilskudd):** anerkjent som volummessig marginale, men ikke gitt egne tonn- eller verdital.
- **Pris-/volumdata delvis fra personlig kommunikasjon** (industriaktører) — ikke fullt etterprøvbar offentlig statistikk; merk som B der det gjelder.

## Ikke si

- **Ikke si at "utnyttet" = høyverdi.** 89 % utnyttelsesgrad betyr at restråstoffet brukes til *noe*, men kun ~15 % av produktvolumet går til humant konsum; 66 % går til fôr og ~19 % til biogass/energi (laveste R-nivå). SINTEF: "lite av det norske restråstoffet utnyttes inn i høyere betalende markeder."
- Ikke si at høy utnyttelsesgrad betyr lav kaskade-tap — biogass/energi er nyttiggjøring på lavt verdinivå.
- Ikke si at all utnyttelse foredles i Norge — fersk restråstoff/skinn eksporteres betydelig uforedlet; betydelig fiskeskinn importeres til norsk kollagenproduksjon.
- Ikke si at restråstoffet er "fullt utnyttet" — 118 000 t (2024) er ikke-utnyttet, pluss 34 300 t fritt laksblod som i praksis går tapt som prosessvann.
- Ikke oppgi biogass-tonnasje 2024 som primærtall — det er avledet (B).
- Ikke presenter eksportverdi (mrd NOK) som volum eller som et R-nivå — det er en kryssende destinasjon.
- Ikke ekstrapoler 2023-produktgruppetall (marine oljer 128 000 t, FPC/FPH 117 000 t) som 2024-tall uten verifikasjon.

## Anbefalt gate: PCQ

Primærkilde i fulltekst, internt etterprøvbar tabell, klar R-stige-distinksjon med bevarte tomme celler. Klar for Primary-Citation-Quality-gate. Importbeslutning: **importer** som internt underlag; eksterne claims om "utnyttet = sirkulært/høyverdi" må ikke avledes herfra uten R-stige-distinksjonen.

## Hentede kilder

| URL / lokator | accessedAt | sourceClass |
|---|---|---|
| https://www.sintef.no/publikasjoner/publikasjon/019cb816e9d8-613672ba-42ff-40f5-8c4a-d11bcb98a574/ (Analyse marint restråstoff 2024, 2025:00517) | 2026-06-27 | primary |
| research/external/dro-1206/downloads/sintef-fhf-analyse-marint-restrastoff-2024.txt (fulltekst 2025:00517, i repo) | 2026-06-27 | primary |
| https://www.sintef.no/contentassets/f87ee6b4a78846888459395cc020262e/analyse-marint-restrastoff-2023-1.pdf (Analyse marint restråstoff 2023, 2024:00583, fulltekst hentet) | 2026-06-27 | primary |
| https://www.fhf.no/prosjekter/prosjektbasen/901844/ (FHF prosjekt 901844, Restråstoffanalyser 2023–2025) | 2026-06-27 | primary |
| https://www.marintrestrastoff.no/ (SINTEF/Kontali visningsverktøy, referert i rapporten) | 2026-06-27 | secondary |
| https://nva.sikt.no/registration/019cb816e9d8-613672ba-42ff-40f5-8c4a-d11bcb98a574 (Nasjonalt vitenarkiv-oppføring) | 2026-06-27 | public-filing |
````

### research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md

````markdown
# R13-WASTE-004 — Husholdnings- og detaljmatsvinn

**ID:** R13-WASTE-004
**Prioritet:** P1
**Tema:** Food waste
**Geo:** NO
**Output-type:** waste baseline memo
**Dato:** 2026-06-27
**Anbefalt gate:** PCQ

---

## Sammendrag-tabell

| Felt | Svar |
|---|---|
| Kort dom | Norsk husholdningsmatsvinn er godt dokumentert gjennom NORSUS/Matvett-faktaark basert på kommunale plukkanalyser og SSB-avfallsstatistikk. Baseline 2016: 222 300 tonn (42,6 kg/innbygger); siste målte år 2023: 193 200 tonn (35,0 kg/innbygger), en reduksjon på 18 %. Dagligvareleddet har redusert mer dramatisk (–47 % siden 2015). Tallene for ulike ledd er ikke direkte sammenlignbare da de bygger på ulike målemetoder og tidspunkter. |
| Sterkeste kilde | NORSUS/Matvett, Faktaark om matsvinn i husholdningene 2023 (OR.16.24, Stensgård 2024), og Faktaark om matsvinn i dagligvarehandelen 2024 (OR.28.25, Plataniti 2025). Begge er åpne oppdragsrapporter med metodereferanser. |
| Svakeste punkt | Husholdningstallene er sist målt for 2023 (ikke oppdatert for 2024); plukkanalysene dekker bare 42 % av befolkningen i 2023-beregningen. Dagligvaretallene er aktørrapporterte (frivillig rapportering) og oppskalert fra markedsandeler. Ingen uavhengig SSB-statistikk for matsvinn separat — SSB leverer bare rådata til avfallsstatistikk som NORSUS tolker. |
| Funn-tabell | se under |
| Tomme celler | se under |
| Ikke si | se under |
| Anbefalt gate | PCQ |

---

## Funn-tabell

| Ledd | Mengde (tonn/år) | År | Metode | Lokator | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|
| Husholdning — baseline | 222 300 tonn | 2016 | Plukkanalyser (kommuner/IKS) + SSB avfallsstat. + SSBs befolkningsstat. Dekker 42 % av bef. for 2023 | NORSUS/Matvett OR.16.24 (Stensgård 2024). URL: https://www.matvett.no/uploads/documents/OR.16.24-Faktaark-om-matsvinn-i-husholdningene.pdf | A | Plukkanalyser oppskalert nasjonalt; metode fra Syversen et al. (2018) og Hanssen et al. (2013) |
| Husholdning | 216 100 tonn / 40,3 kg per innb. | 2020 | Plukkanalyser + SSB avfallsstat. | NORSUS/Matvett OR.16.24 | A | Samme metodikk; –6 % fra 2016 |
| Husholdning — siste måling | 193 200 tonn / 35,0 kg per innb. | 2023 | Plukkanalyser + SSB avfallsstat.; dekker 42 % av bef. | NORSUS/Matvett OR.16.24 (Stensgård 2024) | A | –18 % fra 2016 til 2023 (kg/innb.); 2024-tall under bearbeiding pr. rapportdato |
| Husholdning (klimaavtrykk) | 415 200 tonn CO₂-ekv | 2023 | LCA-basert, beregnet av NORSUS | NORSUS/Matvett OR.16.24 | A | Ikke sammenlignbart med mengde-tall i tonn mat |
| Husholdning (økon. tap) | 12,4 mrd NOK | 2023 | NORSUS-beregning | NORSUS/Matvett OR.16.24 | A | –14 % fra 2016; vekter pris-effekter |
| Dagligvare — baseline | 77 200 tonn / 14,9 kg per innb. | 2015 | Aktørrapportering (NOK og kg) fra kjeder; oppskalert via markedsandeler. 8 kjeder dekker >99 % av omsetning i tradisjonell dagligvare | NORSUS/Matvett OR.28.25 (Plataniti 2025). URL: https://www.matvett.no/uploads/documents/Faktaark-om-matsvinn-i-Norge-2024-alle-sektorer.pdf | A/B | B-element: aktørrapportert og oppskalert; NORSUS kvalitetssikrer |
| Dagligvare | 43 600 tonn / 7,9 kg per innb. | 2024 | Aktørrapportering (NOK og kg) fra 8 kjeder; oppskalert. Inkl. NorgesGruppen, COOP, REMA 1000, Bunnpris, Oda, Foodora Market, Oluf Lorentzen | NORSUS/Matvett OR.28.25 (Plataniti 2025) | A/B | –47 % kg/innb. siden 2015; –44 % i tonn (lavere pga befolkningsvekst). Netthandel ca. 85 % dekket |
| Grossist | 7 100 tonn / 1,3 kg per innb. | 2024 | Aktørrapportering (NOK+tonn) fra 11 grossister; oppskalert via markedsandeler (65–85 % av omsetn. avh. av varegruppe) | NORSUS/Matvett OR.25.25 (Plataniti 2025) | A/B | –19 % kg/innb. fra 2015; volatile 2020–2023 pga logistikkendringer frukt/grønt |
| Matindustri (rapporterende bedr.) | 41 900 tonn | 2024 | Bedriftsrapportering (tonn) fra 52 bedrifter som repr. >70 % av omsetning i matindustrien. IKKE oppskalert til nasjonal stat. | NORSUS/Matvett OR.24.25 (Plataniti 2025) | A/B | IKKE nasjonal statistikk — kun rapporterende bedrifter. Oppskalert nasjonalt tall: brukes 2022-data i 2024-rapport (13 % av totalsvinn i OR.27.25) |
| Serveringsbransjen | ≈17 882 tonn / 3,2 kg per innb. | 2024 | Gram/gjest fra rapporterende bed.; oppskalert via omsetning. 64 bedrifter: ~25 % hotell, ~51 % kantine, ~7 % restaurant | NORSUS/Matvett OR.30.25 (Van de Glind 2025) | B | Hotell-tall spesielt usikre (gjestmåltider vs. gjestenetter); restaurant-dekn. lav |
| KBS (kiosk/bensin/service) | 2 700 tonn / 0,49 kg per innb. | 2024 | Aktørrapportering av økon. svinn; omregnet via kgpris fra dagligvare. Ca. 30 % av bransjeomsetning repr. | NORSUS/Matvett OR.26.25 (Plataniti 2025) | B | Eksplisitt merknad i rapport: «må kun anses som et estimat» |
| TOTALT Norge (alle ledd kartlagt) | ≈407 100 tonn / 73,4 kg per innb. | 2024* | Sammenstilling; husholdning og jordbruk/sjømat er 2023-tall i 2024-rapporten | NORSUS/Matvett OR.27.25 (Plataniti & Van de Glind 2025) | A/B | *Husholdning er 2023-data, matindustri er 2022-data — blandede basisår |
| Bransjeavtale — mål | 50 % reduksjon vs. 2015-baseline | 2030 | Politisk avtale; delmål: –15 % innen 2020, –30 % innen 2025 | Regjeringen.no / LMD 2017, oppdatert 2025-01-02. URL: https://www.regjeringen.no/no/tema/mat-fiske-og-landbruk/mat-og-ernaring/matsvinn/bransjeavtale-om-matsvinn-reduksjon/id2891198/ | A | Frivillig avtale mellom 5 dep. og 12 bransjeorg.; 145 bedrifter tilsluttet (pr. 2024) |
| Bransjeavtale — 2025-delmål status | –24 % (eks. jordbruk) fra 2015 | 2024 | Aggregert NORSUS-beregning | NORSUS/Matvett OR.27.25 | A | Delmålet er 30 %; husholdning og sjømat henger etter (<20 %) |
| Matsvinnloven | Lov vedtatt 20.06.2025; ikrafttredelse etter forskrift | 2025/2026 | Lovvedtak | Lovdata ISL 2025-06-02-68 / Prop. 130 L (2024–2025) | A | Forskrifter under utarbeidelse; forventede krav: due diligence, rapporteringsplikt, prisreduksjon på kortdatert mat |

---

## Metodenote

Tallene i funn-tabellen bygger på **tre ulike metodespor** som ikke er direkte sammenlignbare:

1. **Husholdning:** Plukkanalyser (fysisk sortering av restavfall i utvalgte kommuner) + SSB avfallsstatistikk → oppskalert nasjonalt. Usikkerhet: kun 42 % av befolkningen dekket i 2023-analysen.
2. **Mat- og serveringsbransje (dagligvare, grossist, matindustri, KBS, servering):** Frivillig aktørrapportering av mengde og/eller økon. svinn → oppskalert via markedsandeler. Ulike basisår per sektor i 2024-rapporten.
3. **Matsvinnloven (fra 2026+):** Vil innføre harmonisert, obligatorisk rapportering, men data finnes ikke ennå.

Baseline-år varierer: husholdning bruker 2016, bransje bruker 2015. Reduksjonsprosentene er ikke direkte sammenlignbare mellom ledd.

---

## Tomme celler

- **Husholdning 2024:** Data under bearbeiding per tidspunkt for OR.27.25 (2025). Tallene fra 2023 brukes som proxy i 2024-totalbildet.
- **Matindustri nasjonalt 2023–2024:** Siste oppskalerte nasjonale tall er fra 2022. OR.24.25 inneholder kun tall fra rapporterende bedrifter (ikke nasjonal statistikk).
- **Undervisnings- og omsorgssektoren 2023–2024:** Siste oppskalerte tall fra 2022.
- **Jordbruk (primærproduksjon):** Inkludert i totalbildet men holdes utenfor endringsberegninger pga. inkonsistente definisjoner og datagrunnlag mellom år. NORSUS/Landbruksdirektoratet oppgir 2023-tall i 2024-rapporten.
- **Sjømatindustri 2024:** Tall under bearbeiding; 2023-data fra SINTEF Ocean (Carvajal 2024) brukes i OR.27.25.
- **Geografisk fordeling** innen Norge: ikke tilgjengelig i faktaarkene.
- **Usolgt mat donert til Matsentralen** — underrapportert særlig i dagligvare (eksplisitt erkjent i OR.28.25).
- **Sammenlignbare tall for matsvinn per produktkategori på tvers av alle ledd**: Finnes per ledd, men ikke aggregert i én felles tabell i kildematerialet.

---

## Ikke si

- "Norsk matsvinn er redusert med X prosent" uten å spesifisere: fra hvilken baseline (2015 vs. 2016 avhengig av ledd), inkludert eller ekskludert jordbruk, og hvilke ledd som inngår.
- "Husholdningene kaster X tonn i 2024" — siste målte data er fra 2023 (193 200 tonn); 2024-tall er ikke publisert per 2026-06.
- At dagligvare og husholdning kan summeres rett frem — metodene er ulike og dubletter kan forekomme ved aggregering.
- At bransjeavtalen er juridisk bindende — den er frivillig.
- At matsvinnloven er i kraft — den er vedtatt men avventer forskrift (forventet 2026).
- At matindustri-tallene i OR.24.25 er nasjonal statistikk — de er kun rapporterende bedrifter, eksplisitt ikke oppskalert.
- At KBS-tallene er presise — rapporten selv merker dem som «kun estimat» pga. lav dekningsgrad (30 %).
- At serveringstallene for hotell er pålitelige uten forbehold — usikkerhet erkjent i OR.30.25.
- At 24 % reduksjon fra 2015 til 2024 betyr at delmålet om –30 % innen 2025 er nær — husholdning (-19 %) og sjømat (-7 %) henger langt etter.

---

## Kildeoversikt

| Kilde | År | Tilgang | Kildeklasse | URL |
|---|---|---|---|---|
| NORSUS/Matvett OR.16.24 — Faktaark husholdning 2023 | 2024 (data: 2023) | Åpen PDF | Primær | https://www.matvett.no/uploads/documents/OR.16.24-Faktaark-om-matsvinn-i-husholdningene.pdf |
| NORSUS/Matvett OR.27.25 — Faktaark alle sektorer 2024 | 2025 (data: 2024*) | Åpen PDF | Primær | https://norsus.no/wp-content/uploads/7.-OR.27.25-Faktark-om-matsvinn-i-Norge-2024-1.pdf |
| NORSUS/Matvett OR.28.25 — Faktaark dagligvare 2024 | 2025 (data: 2024) | Åpen PDF (inkl. i alle-sektorer-PDF) | Primær | https://www.matvett.no/uploads/documents/Faktaark-om-matsvinn-i-Norge-2024-alle-sektorer.pdf |
| NORSUS/Matvett OR.25.25 — Faktaark grossist 2024 | 2025 (data: 2024) | Åpen PDF (inkl. i alle-sektorer-PDF) | Primær | https://www.matvett.no/uploads/documents/Faktaark-om-matsvinn-i-Norge-2024-alle-sektorer.pdf |
| NORSUS/Matvett OR.24.25 — Faktaark matindustri 2024 | 2025 (data: 2024) | Åpen PDF (inkl. i alle-sektorer-PDF) | Primær | https://www.matvett.no/uploads/documents/Faktaark-om-matsvinn-i-Norge-2024-alle-sektorer.pdf |
| NORSUS/Matvett OR.30.25 — Faktaark serveringsbransjen 2024 | 2025 (data: 2024) | Åpen PDF (inkl. i alle-sektorer-PDF) | Primær | https://www.matvett.no/uploads/documents/Faktaark-om-matsvinn-i-Norge-2024-alle-sektorer.pdf |
| NORSUS/Matvett OR.26.25 — Faktaark KBS 2024 | 2025 (data: 2024) | Åpen PDF (inkl. i alle-sektorer-PDF) | Primær | https://www.matvett.no/uploads/documents/Faktaark-om-matsvinn-i-Norge-2024-alle-sektorer.pdf |
| Regjeringen.no / LMD — Bransjeavtale om reduksjon av matsvinn | 2017, oppdatert 2025-01-02 | Åpen HTML | Primær | https://www.regjeringen.no/no/tema/mat-fiske-og-landbruk/mat-og-ernaring/matsvinn/bransjeavtale-om-matsvinn-reduksjon/id2891198/ |
| Lovdata — Lov om forebygging og reduksjon av matsvinn (matsvinnloven) | 2025-06-02 | Åpen | Primær | https://lovdata.no/dokument/ISL/isl/2025-06-02-68 |
| SSB avfallsstatistikk | Løpende | Åpen | Primær (rådata, tolket av NORSUS) | https://www.ssb.no/statbank/table/13136 |

*Alle kilder hentet 2026-06-27.*

---

## Anbefalt gate: PCQ

Datagrunnlaget er godt for en intern baseline, men før ekstern bruk bør følgende avklares:

1. **P (Presisjon):** Hvilke ledd og basisår skal inngå i prosjektets matsvinn-baseline? (Husholdning alene, eller alle ledd?)
2. **C (Completeness):** Er 2023-husholdningstall akseptabelt som proxy for 2024, eller avventer vi oppdatering?
3. **Q (Kvalitet):** Skal aktørrapporterte dagligvaretall brukes direkte, eller merkes som B-klasse?

---DECISION-JSONL---
{"id":"R13-WASTE-004","decision":"enrich","valueTier":"high","title":"Husholdnings- og detaljmatsvinn","canonicalPath":"research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md","shortVerdict":"Solid primærdokumentasjon finnes for husholdning (NORSUS/Matvett OR.16.24, data 2023: 193 200 tonn) og dagligvare (OR.28.25, 2024: 43 600 tonn). Bransjeavtalen og matsvinnloven er primærkilder for policy-rammeverk. Hoveddeltene er A-klasse med B-elementer (aktørrapportering i bransjeledd). Husholdning mangler 2024-oppdatering; matindustri nasjonalt er bare målt t.o.m. 2022. Tallene er ikke direkte sammenlignbare på tvers av ledd pga. ulike metoder og basisår.","strongestSource":"NORSUS/Matvett OR.16.24 (Stensgård 2024) + OR.28.25 (Plataniti 2025), åpne PDF-rapporter med full metodedokumentasjon","weakestPoint":"Husholdning er sist målt 2023 (plukkanalyser, 42 % befolkningsdekning); matindustri nasjonal statistikk kun t.o.m. 2022; KBS-tall eksplisitt merket som estimat (30 % dekningsgrad)","sourceClass":"A with C gaps","gapType":"temporal (husholdning 2024 mangler), metodologisk (ulike basisår og målemetoder per ledd), coverage (42 % befolkning for husholdning; 30 % for KBS)","gate":"PCQ","importDecision":"importer","ikkeSi":["at husholdningene kaster X tonn i 2024 (siste data er 2023)","at tallene for ulike ledd kan summeres direkte (ulike metoder og basisår)","at bransjeavtalen er juridisk bindende (den er frivillig)","at matsvinnloven er i kraft (vedtatt 2025-06-20, avventer forskrift)","at matindustri-tallene i OR.24.25 er nasjonal statistikk (kun rapporterende bedrifter)","at KBS-tallene er presise (eksplisitt estimat i kilden)","at 24 % reduksjon betyr at 30 %-delmålet er nær nådd for alle ledd"],"fetchedSources":[{"url":"https://www.matvett.no/uploads/documents/OR.16.24-Faktaark-om-matsvinn-i-husholdningene.pdf","accessedAt":"2026-06-27","sourceClass":"primary"},{"url":"https://norsus.no/wp-content/uploads/7.-OR.27.25-Faktark-om-matsvinn-i-Norge-2024-1.pdf?v=1","accessedAt":"2026-06-27","sourceClass":"primary"},{"url":"https://www.matvett.no/uploads/documents/Faktaark-om-matsvinn-i-Norge-2024-alle-sektorer.pdf","accessedAt":"2026-06-27","sourceClass":"primary"},{"url":"https://www.regjeringen.no/no/tema/mat-fiske-og-landbruk/mat-og-ernaring/matsvinn/bransjeavtale-om-matsvinn-reduksjon/id2891198/","accessedAt":"2026-06-27","sourceClass":"primary"},{"url":"https://lovdata.no/dokument/ISL/isl/2025-06-02-68","accessedAt":"2026-06-27","sourceClass":"primary"}],"fileEdited":true}
````

### research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md

````markdown
# R13-WASTE-007 — Industrielle næringssidestrømmer (bryggeri, meieri, slakteri)

**ID:** R13-WASTE-007  
**Prioritet:** P1  
**Tema:** Food waste / Side-stream ledger  
**Geo:** NO  
**Dato:** 2026-06-27  
**Status:** Intern research-artefakt — ikke whitepaper, ikke citerbar uten videre gate

---

## Overordnet tabell

| Felt | Svar |
|---|---|
| Kort dom | Nofima-rapport 67/2016 (Lindberg m.fl.) er den beste samlede norske kartleggingen av industrielle sidestrømmer fra bryggeri, kjøtt og meieri. Volum-tall for bryggeri og slakteri er primærkilder fra 2016 og er ikke systematisk oppdatert. Meieri-data (myse) er sterkere dekket via TINE-kommunikasjon. Fraksjonsnivå-detaljer er i stor grad mangelfulle eller sekundærestimater. |
| Sterkeste kilde | Nofima-rapport 67/2016 (Lindberg m.fl., «Kartlegging av restråstoff fra jordbruket»), nofima.com/publication/1439134/, aksessert 2026-06-27 |
| Svakeste punkt | Per-fraksjon volum fra slakteri (blod, bein, fett, innmat separat) — ingen offentlig tilgjengelig norsk primærkilde gir detaljert fraksjonstabell med oppdaterte tall. Bryggeri: mask-tall er 2016-data fra Nofima; BMLF/Bryggeri- og drikkevareforeningen (BROD) publiserer ingen fraksjonert oversikt. |
| Funn-tabell | Se under |
| Tomme celler | Se under |
| Ikke si | Se under |
| Anbefalt gate | source-shortlist |

---

## Side-stream ledger

| Sektor | Fraksjon | Volum (tonn/år) | Dagens bruk | R-stige-nivå | År | Lokator | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|---|---|
| Bryggeri | Mask (bryggerimask / spent grain) | ~17 000 (bransjestall NO) | Primært dyrefôr (storfe/gris). Noe til bakst (småskala). Pågående FoU: laksefôr-ingrediens (HI/FHF, 2025) | R2 (fôr). Potensial R4 (mat), R5 (biokjemikalier/hydrolysat) | 2016 (volum); 2025 (FoU) | Nofima-rapport 67/2016; Nofima BarleyNOR-prosjekt 2025; HI/FHF MaskLaks-prosjekt 2025 | B — bransjestimert volum i Nofima-rapport, ikke primær bransjerapport fra BROD | Volum basert på 2016-tall. Import av malt dominerer (~40 000 tonn/år); norskprodusert malt er lite. Faktisk mask-volum fra norske bryggerier ikke verifisert mot nyere bransjekilde. |
| Bryggeri | Gjær (overskuddsgjær) | C — ikke kartlagt for NO separat | Tradisjonelt dyrefôr. FoU-stadium: mulig proteinkilde for laks (HI/Nofima-referanser) | R2 (fôr). Potensial R4/R5 | — | Nofima BarleyNOR 2025 (nevnt, ikke kvantifisert) | C | Ikke kvantifisert i norsk kilde. Globalt er bryggerijær anerkjent sidestrøm; norsk volum ukjent. |
| Bryggeri | CO₂ (fra gjæring) | ~1 000 tonn/år (ett bryggeri: Mack) | Tradisjonelt sluppet ut. Mack: karbonfangst til egne kullsyreholige drikker (pilotprosjekt fra 2022) | R4/R5 (intern gjenbruk) | 2022 | Folkebladet 2022-01-23 (Mack-pressemelding) | B — aktørrapportert, ett bryggeri | Representerer ett bryggeri (Mack). Sektordekning ukjent. Verken SSB eller BROD publiserer aggregert CO₂-tall fra bryggerinæringen. |
| Meieri | Myse (flytende, hvitost-produksjon) | ~450 000–640 mill. liter/år (råvolumet i liter; ca. 450 000 tonn vann+tørrstoff) | Frem til ~2012: dyrefôr (gris/storfe). Fra 2012+: ca. 540 mill. liter til WPC80 (myseproteinpulver) og laktosepermeatpulver (Jæren + Verdal). Resten (~100 mill. liter) til brunost og prim. | R4 (humant konsum via mysepulver/brunost). Historisk R2 (fôr) | 2012 (omstillingstidspunkt); Ruralis 2018 (640 mill. liter-tall) | TINE BA pressemeldinger 2008/2012; Ruralis 2018-06-25; Aftenbladet 2012-11-06 | B — TINE-kommunikasjon og journalistiske sekundærkilder; ingen TINE-årsrapport med verifiserbare tall | Volum i liter, ikke tonn tørrstoff. «640 mill. liter» er Ruralis/journalistisk kilde fra 2018 (aktørrapportert via TINE). Tørrstoffinnhold i myse varierer (~6–7 % TS). Reelt tørrstoff-volum: ~27 000–45 000 tonn/år — men dette er avledet estimat (B). |
| Meieri | WPC80 (myseproteinkonsentrat) | ~3 000 tonn/år (Tine Verdal + Jæren, 2012-planer) | Humant konsum (kosttilskudd, næringsmiddelindustri). Eksport til 48 land (Verdal 2022). | R4 (humant konsum) | 2012 (plan); 2022 (drift verifisert) | Aftenbladet 2012; T-A 2022-10-26 | B — journalistisk/aktørrapportert; faktisk produksjonsvolum ikke offentlig | Volumtall (3 000 tonn) er fra 2012 prosjekteringsplan, ikke realisert målt produksjon. Kan ha endret seg. |
| Meieri | Laktosepermeat (mysepermeat) | ~21 000 tonn pulver/år (plan 2012) | Humant konsum (næringsmiddelingrediens). Eksport. | R4 (humant konsum) | 2012 (plan) | Aftenbladet 2012 | B — aktørrapportert plan, ikke realisert-tall | Samme caveat som WPC80: tallene er fra planfasen, ikke verifisert produksjonstall. |
| Meieri | Meierislam (separator-slam, prosessavfall) | C — ikke kvantifisert offentlig for NO | FoU: testet som substrat i biogassproduksjon (lav gassutnyttelse på grunn av høyt vanninnhold) | R1 (energi/biogass — FoU-stadium) | 2021 (NIBIO-rapport) | NIBIO Rapport 7/167, 2021 (Tine Verdal-slam i labforsøk) | B — FoU-rapport, ikke sektorvolum | Kun labskalaforsøk. Ingen nasjonal kartlegging av meierislam-volum funnet. |
| Slakteri | Kjøttsidestrøm totalt (alle biprodukter, inkl. spiselig innmat, blod, bein, fett) | ~264 000 tonn/år (samlet, 2016) | Varierer per fraksjon: spiselig innmat → humant konsum (synkende; 1,3 kg/pers 2024), eksport, dyrefôr. Ikke-spiselig: Biosirk → proteinmel, beinmel, fett (energi/fôr). | Blandet R4→R1 avh. fraksjon | 2016 (samlet), 2024 (spiselig innmat-forbruk) | Nofima-rapport 67/2016; Animalia statistikk 2024/2025 | A (overordnet volum, Nofima); B (fraksjonsnivå) | 264 000 tonn er totalt restråstoff fra kjøttsektor (2016). Netto kjøttproduksjon 2023: 362 400 tonn slakt (Animalia). Biproduktvolumet er ikke re-kartlagt siden 2016. |
| Slakteri | Animalsk fett (overskudd/sidestrøm) | ~27 300 tonn/år (2016) | Primært: kraftfôr til svin/fjørfe. Kategori 1/2-fett: biodiesel/energi (Biosirk). Økt volum ventet da kjøttproduktene fettsennkes. | R2 (fôr) / R1 (energi). Potensial R5 (emulgatorer) | 2016 | Nofima-rapport 67/2016; Nofima 2022-prosjekt (biobaserte emulgatorer) | B — Nofima-estimat fra 2016, ikke primær industrikilde | Volumet er ikke oppdatert etter 2016. Pågående prosjekt (Nofima/Nortura/Norilia, 2022–2025) undersøker R5-oppgradering. |
| Slakteri | Spiselige kjøttbiprodukter (innmat: lever, hjerte, nyre, tunge, blod, kjakekjøtt m.m.) | C — totalt volum ikke offentliggjort. Forbruksdata: 1,3 kg/pers/år (2024) → ~6 900 tonn/år konsum | Humant konsum (synkende trend). Eksport (Afrika, Øst-Europa, økt 2023→2024). Dyrefôr. Biosirk. | R4 (humant konsum), R2 (fôr) | 2024 (forbrukstall) | Animalia 2024/2025 statistikksider | B — forbruksdata, ikke produksjonsvolum-data | Forbrukstall konvertert til volum via innbyggertall er avledet estimat. Produksjonsvolumet av spiselig innmat er ikke offentlig per fraksjon. |
| Slakteri | Ikke-spiselig biprodukt (kat. 1+2+3, til Biosirk) | ~12 000 tonn slakteavfall til biogass (2019, SSB) | Kat. 1+2: beinmel (energi, sement), fett (biodiesel/energi). Kat. 3: proteinmel (fôr, kjæledyrfôr, gjødsel). | R1 (energi) / R2 (fôr) | 2019 | NORSUS OR-06.23 (2023), kilde SSB 2022b | B — SSB-tall om «slakteavfall til biogass», ikke total ikke-spiselig strøm | 12 000 tonn er det som gikk til biogass, ikke total ikke-spiselig-mengde. Totalt kat. 1+2+3 volum er ukjent fra åpne norske kilder. |
| Slakteri | Ull | ~2 898 tonn/år (klassifisert, 2025) | Tekstil, eksport. Ullstasjoner: Norilia/Nortura (8), Fatland (2), Lofoten Wool (1). | R4 (materiale/tekstil) | 2025 | Animalia statistikk «Ull og biprodukter» 2025 | A — Animalia primærdata | Vollstendig ull, ikke sidestrøm i snever forstand. Inkludert fordi Animalia behandler det som plussprodukter fra slakt. |
| Slakteri | Huder og skinn | C — volum ikke kvantifisert i åpne norske kilder | Eksport til lærproduksjon (bl.a. luksusmerker, nevnt av Animalia). | R4 (materiale) | — | Animalia: plussprodukter-side (2024) | C | Animalia nevner det som ressurs, men gir ikke volum. |
| Slakteri | Blod | C — separat volum ikke funnet | Tradisjonelt: blodpølse/mat. I dag: primært til Biosirk (proteinmel/gjødsel) eller biogass. | R4→R2→R1 | — | Animalia (liste over biprodukter) | C | Inkludert i den aggregerte «264 000 tonn» fra Nofima, men ikke fraksjonert. |

---

## Tomme celler (dokumenterte fravær)

1. **Bryggeri — mask-volum etter 2016**: Ingen oppdatert norsk bransjekilde (BROD/BMLF) med aggregert volum funnet. Nofima BarleyNOR-prosjektet (2025) bekrefter at biprodukter fra brygging «brukes til fôr», men kvantifiserer ikke volum.
2. **Bryggeri — gjærvolum (NO)**: Ikke kartlagt i noen tilgjengelig norsk kilde.
3. **Bryggeri — CO₂-volum (sektornivå)**: Kun ett bryggeri (Mack) har offentliggjort estimat (~1 000 tonn/år). Sektortall mangler.
4. **Meieri — myse tørrstoffvolum**: Ingen TINE-årsrapport med verifisert tonn TS-produksjon funnet. Alle tall er journalistisk/aktørformidlet.
5. **Meieri — WPC80/permeat realisert produksjon**: 3 000/21 000 tonn-tallene er fra 2012 prosjekteringsplan; ingen offentlig realisert produksjonsstatistikk funnet.
6. **Meieri — meierislam-volum (sektornivå)**: Ikke kartlagt.
7. **Slakteri — biprodukter per fraksjon (blod, bein, fett, innmat separat) med oppdatert volum**: Nofima-rapporten fra 2016 er den eneste samlekilden. Fraksjonerte tall er ikke offentlig tilgjengelig fra Animalia eller Nortura.
8. **Slakteri — ikke-spiselig biprodukt totalvolum**: SSB-tall fra 2019 dekker kun andelen som gikk til biogass (12 000 tonn). Total mengde kat. 1+2+3 ikke funnet.
9. **Slakteri — huder/skinn-volum**: Nevnt av Animalia men ikke kvantifisert.
10. **Slakteri — blod separat volum**: Ikke fraksjonert i åpne norske kilder.

---

## Ikke si (overclaim-liste)

- **Ikke si** at bryggeri-mask-volumet er ~17 000 tonn som et nåtidstall — det er et 2016-estimat fra en Nofima-rapport, ikke verifisert mot bransjestatistikk eller oppdaterte tall.
- **Ikke si** at TINE produserer 640 mill. liter myse «i dag» — tallet stammer fra 2018 og er aktørrapportert via journalistiske kilder; ingen verifisert årsrapport-kilde.
- **Ikke si** at 3 000 tonn WPC80 og 21 000 tonn permeat er realisert produksjon — det er 2012-planer.
- **Ikke si** at 264 000 tonn kjøttsektor-restråstoff er et nåtidstall — det er en 2016-Nofima-kartlegging; slaktevolumet har endret seg siden (362 400 tonn slakt i 2023 mot trolig lavere i 2016).
- **Ikke si** at animalsk fett (27 300 tonn) kun er «lite verdsatt» — nyere prosjekter (Nofima 2022–2025) jobber med oppgradering til R5, og noe går allerede til fôr med kommersiell verdi.
- **Ikke si** at mask «går til avfall» generelt — den primære bruken er dyrefôr (R2), ikke deponering.
- **Ikke si** at meierislam er en etablert biogasskilde — labforsøk (NIBIO 2021) viste lavt gassutnyttelse; ingen operasjonell norsk biogass-anvendelse av meierislam er dokumentert.
- **Ikke si** at blod, bein og huder/skinn har spesifikke volum per fraksjon — disse er ikke separert i tilgjengelige norske primærkilder.
- **Ikke si** at Biosirk-volum (kat. 1+2+3) er kjent i detalj — Animalia beskriver systemet men oppgir ikke totalvolum i åpne kilder.
- **Ikke si** at bryggeri-CO₂ fanges på sektornivå — kun Macks pilotprosjekt er dokumentert.

---

## R-stige-definisjon (brukt i tabellen)

- **R1** = Energigjenvinning (forbrenning, biogass, biodiesel)
- **R2** = Dyrefôr
- **R3** = Kompost/jordforbedring
- **R4** = Humant konsum / høyverdi materialgjenvinning (tekstil, lær)
- **R5** = Biokjemikalier / høyverdi-ingredienser (hydrolysat, enzymer, bioaktive stoffer, emulgatorer)

*Hierarki: R5 > R4 > R3 > R2 > R1 (høyere tall = høyere ressursutnyttelse)*

---

## Kildelogg

| URL | Aksessert | Kildeklasse |
|---|---|---|
| https://nofima.com/publication/1439134/ | 2026-06-27 | Primær (Nofima-rapport 67/2016, Lindberg m.fl.) |
| https://www.forskning.no/landbruk-nofima-partner/magrere-kjottprodukter-gir-mer-fett-til-overs--hva-kan-det-brukes-til/351368 | 2026-06-27 | Sekundær (populærvitenskapelig formidling av Nofima 67/2016) |
| https://nofima.no/prosjekt/norsk-bygg-fra-jord-til-bord/ | 2026-06-27 | Primær (Nofima BarleyNOR-prosjektside, 2025) |
| https://animalia.no/no/samfunn/kjottforbruk/spiselige-kjottbiprodukter/ | 2026-06-27 | Primær (Animalia statistikk, 2024/2025) |
| https://www.animalia.no/no/statistikk/ull_og_biprodukter/ | 2026-06-27 | Primær (Animalia statistikk, 2025) |
| https://animalia.no/contentassets/c4e4de8870ca423582602d78f5fb004a/kap-5-slakt-kjott-og-eggkvalitet.pdf | 2026-06-27 | Primær (Animalia «Kjøttets tilstand» kap. 5, 2023) |
| https://www.tine.no/bærekraft/matsvinn/500-000-tonn-myse-til-mat-for-å-redusere-matsvinn | 2026-06-27 | Sekundær (TINE-nettside, aktørformidlet) |
| https://ruralis.no/2018/06/25/store-verdier-i-biprodukt-fra-ost/ | 2026-06-27 | Sekundær (Ruralis 2018, aktørintervju) |
| https://www.aftenbladet.no/lokalt/i/XEqpb/tine-lager-folke-foede-av-grisemat | 2026-06-27 | Sekundær (journalistisk, 2012) |
| https://news.cision.com/no/tine-ba/r/tine-vil-bruke-myse-i-naeringsmidler,c428646 | 2026-06-27 | Sekundær (TINE pressmelding, 2008/2009) |
| https://norsus.no/wp-content/uploads/OR-06.23-Mulighetsrommet-for-produksjon-av-biogass-i-Norge.pdf | 2026-06-27 | Primær (NORSUS/Carbon Limits 2023, men SSB-tall er kilde for slakteavfall) |
| https://orgprints.org/id/eprint/43747/1/NIBIO_RAPPORT_2021_7_167.pdf | 2026-06-27 | Primær (NIBIO Rapport 7/167, 2021 — meierislam biogass) |
| https://www.kyst.no/forskning-fr-havforskningsinstituttet/her-spiser-laksen-olrester/1979284 | 2026-06-27 | Sekundær (Kyst.no, HI/FHF MaskLaks, 2025) |
| https://www.fhf.no/nyheter-og-arrangementer/nyheter-fra-fhf/rester-fra-oel-og-kyllingbein-kan-bli-fremtidens-laksemat/ | 2026-06-27 | Primær (FHF prosjektbeskrivelse, 2025) |
| https://www.folkebladet.no/nyheter/i/k61P8j/mack-vil-bruke-co2-fra-oelbrygging-i-brus-og-flaskevann | 2026-06-27 | Sekundær (journalistisk, Mack-pilotprosjekt CO₂, 2022) |
| https://norsus.no/wp-content/uploads/1.-OR.24.25-Faktaark-om-matsvinn-i-matindustrien-2024.pdf | 2026-06-27 | Primær (NORSUS/Matvett 2024 — matsvinn, ikke sidestrøm spesifikt) |

---

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

