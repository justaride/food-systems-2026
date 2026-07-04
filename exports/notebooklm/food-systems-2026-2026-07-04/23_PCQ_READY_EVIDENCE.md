# PCQ-Ready Evidence Packet

Export date: 2026-07-04
Packet type: evidence
Status label: PCQ; check before external use
Allowed use: Use only according to the status label. Keep caveats and missing cells visible.

## What This Source Is For

Curated evidence packet for pcq-ready evidence packet.

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

- research/external/r13/R13-GAP-001-kritiske-importnoder.md
- research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md
- research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md
- research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md

## Source Excerpts

### research/external/r13/R13-GAP-001-kritiske-importnoder.md

````markdown
## Kort dom

For soya (HS 1201), fiskeolje (HS 1504), kaffe (HS 0901) og kakao (HS 1801/1803/1804/1805) finnes komplett primær tidsserie 2020–2024 i SSB tabell 08801 med både volum og verdi — disse er Type A og utfylt. Fosfat-importen, som var tom celle i R12, er nå kartlagt: import av fosfatmineral/råfosfat (HS 2510) er tilnærmet null (≈22 tonn i 2024), og fosfor kommer i praksis inn via sammensatt NPK/PK-gjødsel (HS 3105, ≈34 968 tonn i 2024) og via fôr-mineraltilsetninger som ikke fanges av disse HS-kodene. «Fôrprotein-total» lar seg ikke avlese som ett enkelt HS-nummer i 08801 — den krever desaggregering på komponenter (HS 2301/2304/2306/2309) supplert med Landbruksdirektoratets kraftfôrstatistikk, og forblir derfor delvis en metodisk/Type C-luke. Comtrade ble forsøkt som speil men kunne ikke hentes uten abonnementsnøkkel; ingen speiltall er ført inn.

## Sterkeste kilde

SSB statistikkbanken, tabell **08801 «External trade in goods, by commodity number (HS), imports/exports, country, contents and year»**, oppdatert 2026-05-15. Uttak via PxWeb v1 API (POST) 2026-06-27, importstrøm (ImpEks=1), aggregert over alle land, med separate innholdskoder for mengde (Mengde1, hovedsakelig kg) og verdi (Verdi, NOK). Dette er offisiell, primær norsk utenrikshandelsstatistikk på 8-sifret varenummer.

## Svakeste punkt

1. **Fôrprotein-total** er ikke en målbar enkeltnode. Proteinråvarer fordeler seg på flere HS-kapitler (fiskemel 2301, soyakake/-mel 2304, annen oljekake/rapsmel 2306, fôrblandinger 2309) der 2309 også inneholder kjæledyrfôr, og soyaproteinkonsentrat (SPC) til fiskefôr kan tariffereres ulikt. Summering på tvers gir dobbelttelling og overtelling. Et rent «total»-tall vil ikke overleve ekstern bruk uten eksplisitt avgrensning.
2. **Fosfor-avhengighet undervurderes** av HS 2510/3103 alene, fordi fosfor importeres innbakt i ferdig NPK-gjødsel (3105) og i fôr-fosfat/mineraltilskudd. Råfosfat-import ≈0 betyr *ikke* lav fosforavhengighet.
3. SSB-noten: verdi = 0 kan bety enten ingen handel *eller* konfidensialitet; konfidensielle varenumre aggregeres under kode 9999.99.99 og forsvinner fra den spesifikke noden.
4. 08801 måler **realisert importvolum/-verdi**, ikke kapasitet, plan eller forbruk/sluttbruk. Re-eksport, transitt og videreforedling skilles ikke ut her.

## Funn-tabell

Felles lokator-mal: SSB tab. 08801, ImpEks=1 (Imports), aggregert over alle land, ContentsCode Mengde1 (kg) + Verdi (NOK), PxWeb v1 POST-uttak 2026-06-27. Volum oppgitt i tonn (Mengde1/1000); verdi i mill. NOK. Volum og verdi holdt i separate kolonner.

### Fosfat

| HS-kode | År | Volum (tonn) | Verdi (mill NOK) | Lokator | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|
| 2510 (råfosfat/fosfatmineral) | 2020 | 0 | 0,0 | 08801 HS 2510 | A | Tilnærmet null import |
| 2510 | 2021 | 0 | 0,0 | 08801 HS 2510 | A | |
| 2510 | 2022 | 0,5 | ~0,0 | 08801 HS 2510 | A | |
| 2510 | 2023 | 1 | ~0,0 | 08801 HS 2510 | A | |
| 2510 | 2024 | 22 | 0,2 | 08801 HS 2510 | A | Råfosfat-import er marginal i hele perioden |
| 3103 (fosfatgjødsel) | 2020 | 255 | 1,3 | 08801 HS 3103 | A | Liten, volatil |
| 3103 | 2021 | 249 | 2,2 | 08801 HS 3103 | A | |
| 3103 | 2022 | 84 | 1,3 | 08801 HS 3103 | A | |
| 3103 | 2023 | 0,4 | ~0,0 | 08801 HS 3103 | A | |
| 3103 | 2024 | 297 | 2,3 | 08801 HS 3103 | A | |
| 3105 (NPK/PK sammensatt gjødsel) | 2020 | 91 487 | 414,9 | 08801 HS 3105 | A | Hovedvei for importert fosfor |
| 3105 | 2021 | 107 541 | 552,3 | 08801 HS 3105 | A | |
| 3105 | 2022 | 48 994 | 589,1 | 08801 HS 3105 | A | Volum ned, verdi opp (prishopp) |
| 3105 | 2023 | 32 737 | 380,1 | 08801 HS 3105 | A | |
| 3105 | 2024 | 34 968 | 367,7 | 08801 HS 3105 | A | 3105 inneholder også N og K — ikke rent fosfat-mål |

### Fôrprotein

«Total» kan ikke avleses som ett HS-nummer (se Tomme celler). Tabellen viser komponent-HS (Type A hver for seg) pluss Landbruksdirektoratets kraftfôr-aggregat (Type A, men annen avgrensning: kun husdyrfôr).

| HS-kode | År | Volum (tonn) | Verdi (mill NOK) | Lokator | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|
| 2301 (mel/pellets av fisk og kjøtt) | 2022 | 221 506 | 4 224,3 | 08801 HS 2301 | A | Inkl. fiskemel; viktig fiskefôr-protein |
| 2301 | 2023 | 228 876 | 5 072,5 | 08801 HS 2301 | A | |
| 2301 | 2024 | 220 254 | 4 751,2 | 08801 HS 2301 | A | |
| 2304 (soyakake/-mel) | 2022 | 6 299 | 75,8 | 08801 HS 2304 | A | Lav — mye soyaprotein importeres som SPC/bønner, ikke som 2304 |
| 2304 | 2023 | 1 953 | 18,8 | 08801 HS 2304 | A | |
| 2304 | 2024 | 4 814 | 45,5 | 08801 HS 2304 | A | |
| 2306 (annen oljekake, bl.a. rapsmel) | 2022 | 298 221 | 1 368,4 | 08801 HS 2306 | A | Rapsmel har passert soyamel i norsk kraftfôr |
| 2306 | 2023 | 268 699 | 1 322,7 | 08801 HS 2306 | A | |
| 2306 | 2024 | 283 112 | 1 226,0 | 08801 HS 2306 | A | |
| 2309 (fôrblandinger) | 2022 | 619 073 | 10 522,6 | 08801 HS 2309 | A | Inkl. kjæledyrfôr og ferdigfôr — IKKE rent proteinmål |
| 2309 | 2023 | 543 024 | 9 442,8 | 08801 HS 2309 | A | |
| 2309 | 2024 | 566 900 | 9 830,3 | 08801 HS 2309 | A | |
| (Landbr.dir. kraftfôr, proteinråvarer import, husdyrfôr) | 2025 | 415 970 | | Landbr.dir. kraftfôrstatistikk | A | ≈95 % av proteinråvarer i husdyr-kraftfôr er importert; ekskl. fiskefôr |
| (Landbr.dir. soyamel i kraftfôr) | 2022 | 113 283 | | Landbr.dir. nyhetssak 2024 | A | Ned fra «over 200 000» i 2013 |

### Fiskeolje

| HS-kode | År | Volum (tonn) | Verdi (mill NOK) | Lokator | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|
| 1504 (alle fisk-/marine oljer) | 2020 | 213 449 | 4 443,8 | 08801 HS 1504 | A | Inkl. fiskeleverolje (150410) og sjøpattedyr (150430) |
| 1504 | 2021 | 219 027 | 3 986,5 | 08801 HS 1504 | A | |
| 1504 | 2022 | 204 508 | 5 819,6 | 08801 HS 1504 | A | |
| 1504 | 2023 | 193 949 | 9 762,4 | 08801 HS 1504 | A | Kraftig verdiøkning ved fallende volum (prishopp) |
| 1504 | 2024 | 184 647 | 11 000,8 | 08801 HS 1504 | A | |
| 1504.20 (fett/oljer av fisk, ekskl. lever) | 2022 | 204 372 | 5 811,2 | 08801 HS 150420 | A | Utgjør ~99,9 % av 1504 — den fôr-relevante delen |
| 1504.20 | 2023 | 193 800 | 9 748,7 | 08801 HS 150420 | A | |
| 1504.20 | 2024 | 184 380 | 10 972,1 | 08801 HS 150420 | A | Norge er også stor produsent/eksportør — dette er kun import |

### Soya

| HS-kode | År | Volum (tonn) | Verdi (mill NOK) | Lokator | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|
| 1201 (soyabønner) | 2020 | 412 135 | 1 720,7 | 08801 HS 1201 | A | Hovedsakelig til knusing (Denofa) → olje + mel/SPC |
| 1201 | 2021 | 461 363 | 2 619,9 | 08801 HS 1201 | A | |
| 1201 | 2022 | 308 431 | 2 435,0 | 08801 HS 1201 | A | |
| 1201 | 2023 | 362 788 | 2 606,9 | 08801 HS 1201 | A | |
| 1201 | 2024 | 347 191 | 2 091,9 | 08801 HS 1201 | A | Norge stor kjøper av GMO-fri soya (Landbr.dir.) |
| 2304 (soyakake/-mel) | 2024 | 4 814 | 45,5 | 08801 HS 2304 | A | Se fôrprotein-tabell |
| 1507 (soyaolje) | 2020 | 8 027 | 69,4 | 08801 HS 1507 | A | |
| 1507 | 2022 | 4 776 | 69,2 | 08801 HS 1507 | A | |
| 1507 | 2024 | 952 | 15,7 | 08801 HS 1507 | A | Lav netto-import (Denofa produserer soyaolje innenlands) |

### Kaffe

| HS-kode | År | Volum (tonn) | Verdi (mill NOK) | Lokator | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|
| 0901 (kaffe, alle) | 2020 | 43 767 | 1 805,4 | 08801 HS 0901 | A | Inkl. brent/koffeinfri |
| 0901 | 2022 | 38 906 | 2 593,3 | 08801 HS 0901 | A | |
| 0901 | 2023 | 37 778 | 2 619,3 | 08801 HS 0901 | A | |
| 0901 | 2024 | 35 668 | 2 615,0 | 08801 HS 0901 | A | Volum ned, verdi flat (prisøkning) |
| 0901.11 (grønn/rå kaffe) | 2022 | 31 019 | 1 752,0 | 08801 HS 090111 | A | Råvarenoden — det meste importeres grønt og brennes i Norge |
| 0901.11 | 2023 | 29 117 | 1 577,3 | 08801 HS 090111 | A | |
| 0901.11 | 2024 | 25 854 | 1 494,9 | 08801 HS 090111 | A | |

### Kakao

| HS-kode | År | Volum (tonn) | Verdi (mill NOK) | Lokator | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|
| 1801 (kakaobønner) | 2022 | 19 | 1,7 | 08801 HS 1801 | A | Svært lav — Norge importerer i hovedsak bearbeidet kakao, ikke bønner |
| 1801 | 2023 | 22 | 2,2 | 08801 HS 1801 | A | |
| 1801 | 2024 | 27 | 4,1 | 08801 HS 1801 | A | Verdi/kg sterkt opp (kakaoprisrekord 2024) |
| 1803 (kakaomasse) | 2022 | 3 417 | 124,9 | 08801 HS 1803 | A | |
| 1803 | 2024 | 3 428 | 355,0 | 08801 HS 1803 | A | Flatt volum, verdi nær 3x (prishopp) |
| 1804 (kakaosmør) | 2022 | 4 962 | 228,2 | 08801 HS 1804 | A | |
| 1804 | 2024 | 5 418 | 788,7 | 08801 HS 1804 | A | Verdi ~3,5x 2022 (prishopp) |
| 1805 (kakaopulver) | 2022 | 2 585 | 78,4 | 08801 HS 1805 | A | |
| 1805 | 2024 | 2 838 | 136,2 | 08801 HS 1805 | A | |

## Tomme celler

- **Fosfat HS 2510 / 3103 (2020–2023):** ikke «ikke funnet» — verdiene ER hentet og er tilnærmet null. Registrert som dokumentert fravær (ingen reell råfosfat-import). Type A.
- **Fosfor-importens reelle størrelse:** ikke målbar fra 08801. Fosfor innbakt i 3105-gjødsel og i fôr-fosfat/mineraltilskudd (HS 2835 m.fl., samt deklarert P-innhold) er ikke kartlagt her. Type A (desk-researchbar fra Yara/Mattilsynet/gjødseldeklarasjoner) — ikke hentet.
- **Fôrprotein-total (ett tall):** ikke funnet som enkelt HS-node i 08801; metodisk ikke avlesbar uten avgrensning. Komponenter (2301/2304/2306/2309) er Type A og hentet, men summering gir dobbelttelling (2309 inkl. kjæledyrfôr/ferdigfôr). Kanonisk norsk kilde er **Landbruksdirektoratets kraftfôrstatistikk** (husdyrfôr) — delvis hentet (2025: 415 970 t importerte proteinråvarer) — men fiskefôr-protein dekkes der ikke. Aggregert «fôrprotein-total» = Type C (krever metodevalg).
- **SPC (soyaproteinkonsentrat) til fiskefôr:** egen mengde ikke isolert; tarifferingen er uklar (kan ligge i 2304/2106/3504). Type C i 08801-uttaket — ikke hentet.
- **Verdi for Landbruksdirektoratet-radene:** ikke oppgitt (kraftfôrstatistikken fører mengde, ikke importverdi). Tom celle — Type A men annen kilde for verdi (08801) må kobles.
- **Comtrade speiltall:** ikke hentet — preview-API returnerte 0 rader uten abonnementsnøkkel. Ingen B-tall ført inn (bevisst; speil skal ikke bli primær).
- **2025-tall:** bevisst utelatt fra 08801-tabellene (foreløpige; SSB publiserer endelig t+2).

## Ikke si

- Ikke si at «Norge importerer X tonn fosfat» — råfosfat-import (2510) er ≈0; fosfor kommer via sammensatt gjødsel og fôrtilsetninger som ikke er kvantifisert her.
- Ikke si at «Norge importerer Y tonn fôrprotein» som om det var ett målt tall — det er en sum av overlappende HS-kategorier med ulik avgrensning.
- Ikke summer 2301 + 2304 + 2306 + 2309 til ett «fôrprotein»-tall — 2309 inneholder kjæledyrfôr og ferdige fôrblandinger; det blir overtelling.
- Ikke bland import med forbruk eller med sluttbruk (husdyr vs fisk) — 08801 sier ingenting om hvor varen brukes.
- Ikke tolk verdivekst (f.eks. kakao/fiskeolje 2023→2024) som volumvekst — det er i hovedsak prishopp; volum falt.
- Ikke presenter HS 1504 som «fôr-fiskeolje» uten forbehold — det inkluderer leverolje og sjøpattedyrolje (selv om 150420 dominerer).
- Ikke kall 08801-tallene «forbruk» eller «innenlandsk tilgang» — re-eksport/transitt/foredling er ikke trukket fra.
- Ikke bruk Comtrade-tall som primær — ingen er hentet, og speil skal uansett kun bekrefte, ikke erstatte.

## Anbefalt gate: PCQ

Hoveddelen (soya, fiskeolje, kaffe, kakao, fosfat-utfylling) er Type A primær SSB-data og holder PCQ. Svakeste punkt — fôrprotein-total og reell fosfor-avhengighet — styrer en intern nedgradering: disse to nodene bør behandles som **Type A med C-luker** og ikke løftes til claim uten metodevalg/avgrensning. Samlet gate: PCQ, med node-spesifikk advarsel på fôrprotein-total og fosfor-total.

## Hentede kilder

- https://data.ssb.no/api/v0/en/table/08801 — SSB PxWeb v1 API, tabell 08801 (metadata + POST-uttak importstrøm, alle land aggregert, Mengde1+Verdi, Tid 2020–2024) — accessedAt 2026-06-27 — sourceClass: primary
- https://www.ssb.no/en/statbank/table/08801 — SSB statistikkbanken, tabell 08801 (kildedefinisjon, oppdatert 2026-05-15) — accessedAt 2026-06-27 — sourceClass: primary
- https://www.ssb.no/en/utenriksokonomi/varefortegnelse/commodity-list-external-trade — SSB varefortegnelse (HS-/varenummer-validitet) — accessedAt 2026-06-27 — sourceClass: primary
- https://www.landbruksdirektoratet.no/nb/statistikk-og-utviklingstrekk/utvikling-i-jordbruket/kraftforstatistikk — Landbruksdirektoratet kraftfôrstatistikk (proteinråvarer husdyrfôr, 2025) — accessedAt 2026-06-27 — sourceClass: primary
- https://www.landbruksdirektoratet.no/nb/nyhetsrom/nyhetsarkiv/soyamel-til-kraftfor-naer-halvert-siste-ti-ar — Landbruksdirektoratet nyhetssak (soyamel 113 283 t 2022 vs >200 000 t 2013) — accessedAt 2026-06-27 — sourceClass: primary
- https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=578&period=2024&cmdCode=1201&flowCode=M — UN Comtrade preview-API (FORSØKT som speil; returnerte 0 rader, krever abonnementsnøkkel; ingen tall hentet) — accessedAt 2026-06-27 — sourceClass: secondary
````

### research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md

````markdown
# R13-GAP-005 — Verifisering eller nedgradering av 7 parkerte R12-claim

## Kort dom

Av de 7 parkerte tallene kan **3 løftes med caveat** (REKO-tall som 2022-øyeblikksbilde, andelslandbruk 93 i drift 2023, Restaurant Rest-konkursen sept. 2024), **1 fiskeolje-tall delvis løftes** etter kryssjekk mot Nofima-primær, og **3 forblir parkert eller nedgraderes** (ASKO/HORECA «70 %» er et omstridt konkurrent-anslag, ikke et uavhengig primærtall; Plantagon mangler norsk relevans for NO-geo; SOIL-score har uklart proveniens og kunne ikke spores til IPBES eller annen primærkilde). Ingenting i denne raden er løftet til claim — alt går videre til PCQ-gate.

## Sterkeste kilde

Restaurant Rest-konkursen og andelslandbruk-tellingen er sterkest underbygd: konkursen er en offentlig registerhendelse (Restaurant Rest AS, org. 919 972 696, konkurs åpnet 2024-09-05) bekreftet av flere uavhengige redaksjoner (Aftenposten/Vink, DN, Horecanytt), og andelslandbruk-tallet (93 i drift 2023) stammer fra Landbruksdirektoratets prosjektoppfølging via Økologisk Norge.

## Svakeste punkt

ASKO/HORECA «70 %» og SOIL-score. «70 %» er eksplisitt et konkurrent-anslag (Servicegrossistenes daglige leder) under en alternativ markedsavgrensning, mens NorgesGruppen selv oppgir ~36 %; det finnes ingen uavhengig primærmåling som forankrer 70 %. SOIL-score kunne ikke spores til noen publisert kilde (verken IPBES Land Degradation and Restoration Assessment eller annet) — proveniens er ukjent (Type C epistemisk gap).

## Verifiseringsledger

| # | Parkert claim | Nåværende formulering | Sterkeste uavhengige kilde (navn, år, lokator) | Vurdering | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|
| 1 | ASKO/HORECA 70 % | ASKO har ~70 % andel av storhusholdnings-/HORECA-grossistmarkedet i Norge | Ingen uavhengig primær funnet. «70 %» er konkurrent-anslag (Servicegrossistene) under alternativ markedsavgrensning; NorgesGruppen oppgir selv ~36 % (NHO Reiseliv «Konkurranseforholdene i verdikjeden for mat og drikke», 2018) | **Nedgrader / fortsatt parkert** | C (omstridt; aktør-rapportert B i begge retninger) | To uforenlige aktørtall (36 % vs 70 %) avhengig av markedsdefinisjon; ingen KT-primærmåling lokalisert. Ikke bruk noe enkelttall uten å oppgi markedsavgrensning og kilde |
| 2 | REKO-tall | REKO-ringen i Norge: antall ringer / produsenter / kunder | REKO Norge, «Hva er REKO», rekonorge.no, tall per feb. 2022: >140 ringer, ~500 000 kunder, >600 produsenter | **Løft som 2022-øyeblikksbilde** (ikke som «dagens»/2025-tall) | B (aktør-rapportert primær fra organisasjonen) | Tall er fra feb. 2022; «500 000 kunder» er FB-gruppemedlemskap, ikke unike/betalende kunder; REKO Norge (stiftelse) ble først dannet jan. 2025 og hadde ingen vedtatt årsmelding med ferske tall ved uthenting |
| 3 | Andelslandbruk aktiv-telling | Antall aktive andelslandbruk (CSA) i Norge | Økologisk Norge / Landbruksdirektoratet «Andelslandbruk i Norge 2022»: 93 andelslandbruk i drift registrert 2023 | **Løft som 2023-tall** | B (aktør + direktorat-prosjekt) | Etter 2023 ingen systematisk telling; Økologisk Norge anslår «80–90 aktive»; >120 etablert totalt, ikke alle i drift. Ikke presenter som 2025/2026-tall |
| 4 | SOIL-score | En «SOIL-score» (jordhelse-/jordkvalitetsindeks) | Ingen kilde lokalisert. IPBES Land Degradation and Restoration Assessment (2018) finnes, men definerer ingen «SOIL-score»; proveniens ukjent | **Fortsatt parkert** | C (epistemisk gap / proveniens ukjent) | Trolig prosjektintern eller misforstått metrikk; må ikke siteres til IPBES uten eksplisitt sidehenvisning. Avklar opprinnelig kilde internt før evt. ny verifisering |
| 5 | Fiskeolje art/sluttbruk | Fiskeoljens art/opprinnelse og sluttbruk (fôr/omega-3) | Sekundær: fiskeolje fra villfanget fisk + restråstoff (laks, ørret, sild, lever fra hvitfisk); fôrandel i laks ~30 % (2000) → ~10 % (2020). Primær mangler i denne runden (Nofima fôr-ressursrapporter, Ytrestøyl/Aas, ikke direkte verifisert) | **Delvis løft etter kryssjekk mot Nofima-primær** | B (sekundær/aktør; primær ikke verifisert her) | «30 %→10 %»-tallet er fôrinklusjon i laksefôr, ikke totalt sluttbruk; må kryssjekkes mot Nofima/Mowi fôr-ressursoppgjør før løft. Skill art (opprinnelse) fra sluttbruk (fôr vs humant omega-3) |
| 6 | Plantagon-case | Plantagon som vertikal-landbruk-/sirkulær-case | Plantagon International AB (Sverige), konkurs erklært 2019-02-15 (Agritecture 2019, Wikipedia, hortidaily); primær ville vært svensk Bolagsverket/tingsrätt | **Nedgrader for NO-geo / park** | B (sekundær internasjonal presse) | Svensk selskap; ingen norsk avdeling/drift funnet. Konkursen er faktisk, men casen har lav NO-relevans (denne raden er Geo NO). Bruk evt. kun som internasjonalt advarsels-case, ikke norsk |
| 7 | Rest-case | Restaurant Rest (matsvinn-til-gourmet) som case | Restaurant Rest AS, org. 919 972 696, konkurs åpnet 2024-09-05 (Proff/Forvalt konkursoppføring; Aftenposten/Vink, DN, Horecanytt 2024); grunnlegger Jimmy Øien, Michelin grønn stjerne | **Løft (faktisk hendelse)** | B / offentlig registeroppføring (konkursregister) | Org.nr. bør bekreftes direkte i Brønnøysund/konkursregisteret før claim; «matsvinn-til-gourmet» er konseptbeskrivelse, ikke kvantifisert miljøeffekt. Konkursårsak (covid/likviditet/strøm) er aktør-forklart |

## Tomme celler

- ASKO/HORECA: ingen Konkurransetilsynet-primærmåling av storhusholdnings-markedsandel lokalisert (KT ASKO–Konsum-Gruppen-fusjonsdok. og dagligvarerapporter ikke verifisert for dette spesifikke tallet i denne runden).
- REKO: ingen vedtatt 2025/2026-årsmelding med oppdaterte tall tilgjengelig (handlingsplan skulle legges fram mars 2026).
- Andelslandbruk: ingen samlet medlems-/deltakertelling; kun «>10 000 deltakere»-anslag fra Økologisk Norge uten år.
- SOIL-score: hele proveniensen er tom — ingen definisjon, metode eller kilde funnet.
- Fiskeolje: ingen direkte Nofima/Fiskeridirektoratet-primærtabell hentet for art-fordeling og total sluttbruksfordeling.
- Plantagon: ingen norsk Brreg-enhet eller norsk drift bekreftet.

## Ikke si

- Ikke si at «ASKO har 70 % av HORECA/storhusholdning» som etablert faktum — det er et omstridt konkurrent-anslag; NorgesGruppen oppgir ~36 %.
- Ikke si at REKO har «500 000 kunder» i dag — tallet er FB-medlemskap per feb. 2022, ikke unike/aktive kunder, og ikke 2025/2026.
- Ikke si at det finnes «X aktive andelslandbruk i 2025/2026» — siste systematiske telling er 93 (2023).
- Ikke si at «SOIL-score» kommer fra IPBES eller er en validert indeks — proveniens er ukjent.
- Ikke si at fiskeolje «utgjør 10 % av sluttbruk» generelt — 10 % gjelder fôrinklusjon i laksefôr (2020), ikke total sluttbruk.
- Ikke si at Plantagon er et norsk/nordisk relevant case for NO-geo — det er et svensk, konkursrammet selskap uten norsk drift.
- Ikke knytt kvantifisert miljø-/matsvinneffekt til Restaurant Rest — kun konkurs-faktum og konsept er belagt.

## Anbefalt gate — per claim

| # | Claim | Anbefalt gate |
|---|---|---|
| 1 | ASKO/HORECA 70 % | Fortsatt parkering (krever KT-primær + markedsdefinisjon) |
| 2 | REKO-tall | PCQ → claim-lock-kandidat KUN som «per feb. 2022»-tall med caveat |
| 3 | Andelslandbruk-telling | PCQ → claim-lock-kandidat som «93 i drift 2023» med caveat |
| 4 | SOIL-score | Fortsatt parkering (proveniens-avklaring kreves) |
| 5 | Fiskeolje art/sluttbruk | PCQ (vent på Nofima-primær før claim-lock) |
| 6 | Plantagon-case | Fortsatt parkering for NO-geo (evt. internasjonalt sidecase) |
| 7 | Rest-case | PCQ → claim-lock-kandidat etter Brreg-bekreftelse av org.nr/dato |

## Hentede kilder

| URL | accessedAt | sourceClass |
|---|---|---|
| https://www.rekonorge.no/hva-er-reko | 2026-06-27 | primary (org-rapportert) |
| https://okologisknorge.no/vaart-arbeid/andelslandbruk/hva-er-andelslandbruk/i-norge/ | 2026-06-27 | primary (org-rapportert) |
| https://www.landbruksdirektoratet.no/nb/prosjektmidler/prosjekter-og-resultater/utviklingstiltak-innen-okologisk-landbruk/andelslandbruk-i-norge-2022 | 2026-06-27 | primary (direktorat) |
| https://www.nhoreiseliv.no/innkjopskjeden/dokument/2018/konkurranseforholdene-i-verdikjeden-for-mat-og-drikke | 2026-06-27 | secondary |
| https://konkurransetilsynet.no/wp-content/uploads/2021/06/2021_0374-1-OFF-ASKO-NORGE-AS-og-Konsum-Gruppen-AS.pdf | 2026-06-27 | public-filing (ikke verifisert for 70 %) |
| https://forvalt.no/Konkurs/Firmadetaljer/919972696/638863 | 2026-06-27 | public-filing (HTTP 410 ved fetch; org.nr. lest fra søkeindeks) |
| https://vink.aftenposten.no/artikkel/3Mqj4d/stjernekokk-jimmy-oeyen-legger-ned-rest | 2026-06-27 | secondary |
| https://www.horecanytt.no/jimmy-oien-oslo-rest/legger-ned-rest/1068354 | 2026-06-27 | secondary |
| https://www.agritecture.com/blog/2019/2/22/swedish-vertical-farming-company-plantagon-international-declares-bankruptcy | 2026-06-27 | secondary |
| https://en.wikipedia.org/wiki/Plantagon | 2026-06-27 | secondary |
| https://www.biomar.com/no-no/innsikt/foropplysningen/hvilke-kilder-til-omega-3-finnes-det | 2026-06-27 | secondary (aktør) |
| https://www.ipbes.net/assessment-reports/ldr | 2026-06-27 | primary (ingen SOIL-score funnet) |
````

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

