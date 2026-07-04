# Import Nodes And Resilience Evidence

Export date: 2026-07-04
Packet type: evidence
Status label: mixed PCQ/source-shortlist
Allowed use: Use only according to the status label. Keep caveats and missing cells visible.

## What This Source Is For

Curated evidence packet for import nodes and resilience evidence.

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
- research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md

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

### research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md

````markdown
# R13-GAP-003 — Transport-, havn-, lager- og kaldkjede-sårbarheter for mat (Norden)

Bygger videre på R12-RES-005 (transport, lager og kaldkjede). Denne runden henter inn de overordnede beredskaps-/myndighetskildene som R12 manglet (Totalberedskapskommisjonen NOU 2023:17, Riksrevisjonen 2023–2024, DSB strømrasjonering 2023, Meld. St. 9 (2024–2025), Kystverket, Livsmedelsverket NIL/SOU 2024:8) og snevrer inn til KUN matrelevante noder. Volum- og kapasitetstall per node er fortsatt nesten gjennomgående tomme/C-celler — i tråd med R12.

## Kort dom

Det finnes solid, åpent myndighetsmateriale som kobler transport/havn/lager/kaldkjede til matforsyning i Norden, men det er overveiende kvalitativt og strukturelt. De sterkeste matspesifikke, tallfestede funnene er: (1) Norges importavhengighet — ~60 % av maten er importert eller produsert med importert fôr, og fôrjustert selvforsyning ligger på 34–40 % (Riksrevisjonen 2023–2024); (2) norsk beredskapslager for matkorn bygges til 82 500 tonn innen 2029, tilsvarende ~3 måneders kornforbruk (Landbruksdirektoratet / Meld. St. 9); (3) kaldkjede er strøm-eksponert — DSB beskriver at matforsyning blir betydelig påvirket ved strømrasjonering, og Livsmedelsverket påpeker at kjøl/frys-svikt ved strømbrudd øker matsvinn. Konkrete, åpne tall for dagsdekning per sentrallager, tonnasje i kjøl-/fryselager og havners matandel er fortsatt ikke publisert (beredskaps-/forretningssensitivt). Sverige har den klareste matberedskapsstrukturen (SOU 2024:8, Jordbruksverket, Livsmedelsverket), inkl. eksplisitt sårbarhet for de fire nordligste länen som er avhengige av transport fra sør.

## Sterkeste kilde

Riksrevisjonen, `Matsikkerhet og beredskap på landbruksområdet` (Dokument 3, 2023–2024) — primær myndighetsrevisjon med tallfestede, matspesifikke funn (importandel, fôrjustert selvforsyning, mangel på beredskapsplaner). Supplert av Totalberedskapskommisjonen NOU 2023:17 (kap. om matforsyning/transport), DSB risikoanalyse strømrasjonering (2023), Meld. St. 9 (2024–2025) Totalberedskapsmeldingen, Kystverket Status 2024 (fiskerihavner), og på svensk side SOU 2024:8 + Livsmedelsverket NIL 2025. Lokatorer i ## Hentede kilder.

## Svakeste punkt

Selve sårbarhetstallene per node (havnekapasitet, tonnasje i kjøl/frys, dagers dekning i grossist-/sentrallager, havners matandel) er ikke åpent publisert — de er enten beredskapssensitive, forretningssensitive eller ikke målt. Mange koblinger transport→mat er strukturelle (sektoransvar, "fungerende transport forutsettes") og ikke en målt, matspesifikk sårbarhet. Flere underliggende PDF-er (DSB strømrasjonering, FFI-rapport, Livsmedelsverket kartläggning) lot seg ikke tekstuttrekke i denne sesjonen (binær/komprimert) — disse funnene står derfor på søketreff-nivå / sekundærgjengivelse (markert B der det gjelder).

## Risikotabell

| Node | Type sårbarhet | Matrelevans | Kilde, år | Lokator | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|
| Importavhengighet (NO): ~60 % av maten importert eller produsert med importert fôr | Strukturell forsyningsrisiko | Direkte — hele matvolumet | Riksrevisjonen, 2023–2024 | rapport-side, sitat "60 prosent av all maten vi spiser er enten importert eller produsert med importerte fôrråvarer" | A | Andel, ikke nodespesifikk. Kobler import→transport/havn-eksponering. |
| Fôrjustert selvforsyning (NO) 34–40 % i flere år | Lav nasjonal buffer ved importbrudd | Direkte | Riksrevisjonen, 2023–2024 | rapport-side, sitat "ligget på 34–40 prosent" | A | Måltall for selvforsyning, ikke et transport-/lagertall. |
| Manglende beredskapsplaner for omlegging av produksjon/forbruk (NO) | Plan-/styringssvikt | Direkte (mat) | Riksrevisjonen, 2023–2024 | rapport-side, sitat om at LMD/NFD "ikke noen beredskapsplaner eller strategier" | A | Systemkritikk, ikke en fysisk node. Ramme. |
| Beredskapslager matkorn (NO): 82 500 t innen 2029 ≈ 3 mnd kornforbruk; oppbygging 15 000 t/år fra høst 2024 | Tynn, men kvantifisert lager-buffer | Direkte (matkorn) | Landbruksdirektoratet 2022 / Meld. St. 9 (2024–2025) | beredskapslagring-rapport; nettavisen-gjengivelse av kontrakter | A (tall), B (medieg jengivelse av status) | Gjelder kun matkorn (bakeri/industri/husholdning), ikke fôr/øvrig mat. |
| Strømrasjonering → matforsyning betydelig påvirket (NO) | Kaldkjede-/produksjon-/distribusjon-eksponering ved el-bortfall | Direkte | DSB risikoanalyse strømrasjonering, 2023 | DSB AKS 2023, scenario 30 % redusert kraft Sør-Vestlandet | A (kilde), B (sitat fra søketreff, PDF ikke tekstuttrekt) | Generelt el-scenario; matkobling oppgitt i kilden, men kaldkjede-tonnasje ikke tallfestet. Nødstrøm beskrevet som utilstrekkelig. |
| Kjøl/frys-svikt ved strømbrudd → økt matsvinn/forderv (SE) | Kaldkjede-svikt | Direkte | Livsmedelsverket NIL 2025 | NIL 2025-rapport, "matsvinnet kan öka ... om kyl och frys inte fungerar på grund av elavbrott" | A (kilde), B (søketreff-sitat) | Kvalitativt; ingen tonnasje/tidstall. Gjelder også for NO-kontekst analogt. |
| Cyber-/fysiske angrep på tekniske systemer → forstyrrelser i produksjon, distribusjon og handel med mat (SE) | Digital/fysisk infrastruktur | Direkte | Livsmedelsverket, 2024–2025 | Livsmedelsverkets beredskap (samhällsviktig) | A | Vurdering/risiko, ikke realisert hendelse. |
| Fiskerihavner som kritisk infrastruktur for sjømat/matforsyning langs kysten (NO) | Geografisk konsentrasjon / eksponering for maritime hendelser | Direkte (sjømat) | Kystverket Status 2024 | "Fiskerihavnenes rolle i et samfunnssikkerhetsperspektiv"; Kjøllefjord/Vardø "nasjonal betydning" | A | Kvalitativt; ingen landings-/tonnasjetall i fetchet utdrag. |
| Nord-Norge / Nord-Sverige avhengig av langtransport fra sør for matforsyning | Lange forsyningslinjer, ett-retnings avhengighet | Direkte | Livsmedelsverket NIL 2025 (SE); R12 (NO, lageroppbyggingsplaner Nord-Norge) | NIL 2025: fire nordligste län "beroende av transporter från södra Sverige" | A | SE eksplisitt; NO-side fra R12 (planer, ikke målt dekning). |
| Drivstoff-til-distribusjon: matvaredistributører i drivstoffberedskapsråd (NO) | Drivstoffavhengig matdistribusjon | Direkte (distribusjon) | OE-rapport 60/2023 (NFD) via R12 | OE-rapport 60-2023, beredskapsstruktur | A | Institusjonell kobling, ikke målt sårbarhet. Bærer fra R12. |
| Drivstoffberedskap (SE) 90 dagers nettoimport (IEA/EU-direktiv); hovedoljeflyt via Göteborg ~9 mill. t råolje/år | Drivstofflager → distribusjonsevne | Indirekte (drivstoff for mattransport) | Global Politics / IEA-EU-ramme, NIL-kontekst | søketreff; Göteborg "transitlager for vidareexport" | B | Drivstoff, ikke mat direkte; matrelevans via distribusjonsevne. Göteborg-tall er olje-transit, ikke matandel. |
| Sverige: selvforsynt i praksis kun på gulrot, korn, sukker, (egg); import ~2 920 kcal/person/dag | Strukturell importavhengighet | Direkte | Livsmedelsverket NIL 2025 | NIL 2025; SOU 2024:8 | A | Andels-/kcal-tall, ikke nodespesifikt transporttall. |
| Sverige beredskapslager spannmål 3–6 mnd planlagt; husholdning 7 dagers egenberedskap (MSB) | Lager-buffer (plan) | Direkte (korn) | Jordbruksverket / MSB | Jordbruksverket "beredskapslager av spannmål"; SOU 2024:8 | A | Plan/anbefaling, ikke realisert beholdning per i dag. |
| Rotterdam som hovedhavn for store deler av varetransport til NO; all soya til kraftfôr sjøveien via Fredrikstad | Havne-/enkeltpunkt-konsentrasjon | Direkte (mat/fôr) | OE-rapport 60/2023 (NFD) via R12 | OE-rapport 60-2023, kap. 15.2.1 | A | Kvalitativ/intervjubasert; ingen andel/tonn. Bærer fra R12. |
| Åpne tallfestede dagsdekning/kapasitet per havn, sentrallager og kjøl-/fryselager | Ukjent buffer | Direkte | Norden, løpende | ikke funnet åpent | C | Beredskaps-/forretningssensitivt. Skal ikke estimeres. |

## Tomme celler

- Åpne, sammenlignbare tall for dagers matforsyning i grossist-/sentrallager per land (klassifisert/forretningssensitivt).
- Tonnasje og lokasjon for kjøl-/fryselager som faktisk bærer matforsyning; kvantifisert kaldkjede-sårbarhet ved strømutfall (kun kvalitativt).
- Havners faktiske matandel (Rotterdam-andel for NO; Fredrikstad-soya-tonn; svenske importhavners matandel).
- Dansk og finsk node-status på samme detaljnivå (Finland dekket strukturelt i R12 via HVK/NESA; ingen ny åpen node-tonnasje funnet denne runden).
- Underliggende PDF-detaljer (DSB strømrasjonering, FFI forsyningssikkerhet, Livsmedelsverket kartläggning av kritiska varor) — ikke tekstuttrekt denne sesjonen; bør hentes manuelt før evt. claim-bruk.

## Ikke si

- Ikke fremstill importandel (60 %) eller selvforsyning (34–40 %) som transport-/lager-tall — det er forsynings-/selvforsyningsmål, brukt her som ramme for transporteksponering.
- Ikke gjør generell transport-/el-beredskap (DSB-scenario, drivstoff-90-dager, Trafikverket/Kystverket sektoransvar) til en matspesifikk sårbarhet uten eksplisitt matkobling i kilden.
- Ikke fremstill 82 500 t korn / 3 mnd som dekning for "all mat" — det gjelder kun matkorn, og er en oppbyggingsplan mot 2029, ikke dagens beholdning.
- Ikke tallfest Rotterdam-andel, Fredrikstad-soya eller havners matandel — kildene er kvalitative/intervjubaserte.
- Ikke fyll tomme dagsdekning-/kapasitetsceller med estimat; beredskapstall er ofte klassifisert og skal stå som C.
- Ikke behandle DSB-/Livsmedelsverket-sitatene som verifiserte primærsitat — flere står på søketreff-/sekundærnivå (B) fordi PDF-ene ikke ble tekstuttrekt; verifiser mot primær-PDF før claim.
- Ikke behandle Göteborg ~9 mill. t som mat — det er råolje-transit; matrelevans er kun indirekte via drivstoff til distribusjon.

## Anbefalt gate: source-shortlist

Importer som matrelevant transport/havn/lager/kaldkjede-sårbarhetsmatrise (utvidelse av R12-RES-005) med kolonner for `realisert/kapasitet/plan/potensial/hypotese` og `kildeklasse`. Behold de tallfestede norske nodene (importandel, fôrjustert selvforsyning, 82 500 t matkorn) og de svenske strukturelle nodene (SOU 2024:8, nordlige län, kjøl/frys-svikt) som de sterkeste. Marker DSB-/Livsmedelsverket-sitater som B inntil primær-PDF er verifisert. Hold havne-/kaldkjede-tonnasje som C-celler. Anbefalt videre: aktørspørsmål til DSB/Landbruksdirektoratet/Livsmedelsverket om hvorvidt åpne dagsdekning-/kapasitetstall finnes, før evt. enrich til claim-nivå.

## Hentede kilder

- Totalberedskapskommisjonen, NOU 2023:17 «Nå er det alvor» — https://www.regjeringen.no/no/dokumenter/nou-2023-17/id2982767/ (accessedAt 2026-06-27, primary; kap. matforsyning/transport bekreftet via søk, fulltekst-kapittel ikke tekstuttrekt)
- Riksrevisjonen, «Matsikkerhet og beredskap på landbruksområdet» (Dok. 3, 2023–2024) — https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-landbruksomradet/ (accessedAt 2026-06-27, primary; HTML tekstuttrekt med sitater)
- DSB, «Risikoanalyse av strømrasjonering» (Krisescenarioer 2023) — https://www.dsb.no/siteassets/rapporter-og-publikasjoner/rapporter/risikoanalyse_av_stromrasjonering_2023_publisering.pdf (accessedAt 2026-06-27, primary; PDF binær/ikke tekstuttrekt — funn fra søketreff, B)
- Meld. St. 9 (2024–2025) Totalberedskapsmeldingen — https://www.regjeringen.no/en/documents/meld.-st.-9-20242025/id3082364/ (accessedAt 2026-06-27, primary; landingsside, fulltekst ikke uttrekt)
- Landbruksdirektoratet, «Beredskapslagring av matkorn» (2022) — https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Beredskapslagring%20av%20matkorn%20Endelig%20versjon%202022%20.pdf (accessedAt 2026-06-27, primary)
- Kystverket, «Status 2024: Fiskerihavnenes rolle i et samfunnssikkerhetsperspektiv» — https://www.kystverket.no/sjotransport-og-havn/status/status-2024/status-2024-fiskerihavnenes-rolle-i-et-samfunnssikkerhetsperspektiv/ (accessedAt 2026-06-27, primary; HTML tekstuttrekt)
- Livsmedelsverket, «Livsmedelsförsörjningen i siffror — Nyckeltal och indikatorer (NIL 2025)» — https://www.livsmedelsverket.se/globalassets/publikationsdatabas/rapporter/2025/2025---livsmedelsforsorjningen-i-siffror.pdf (accessedAt 2026-06-27, primary; funn via søketreff)
- Livsmedelsverket, «Kartläggning av kritiska och strategiska varor» (2024) — https://www.livsmedelsverket.se/4991f1/globalassets/publikationsdatabas/rapporter/2024/2024-kartlaggning-av-kritiska-och-strategiska-varor.pdf (accessedAt 2026-06-27, primary; PDF binær/ikke tekstuttrekt)
- SOU 2024:8 «Livsmedelsberedskap för en ny tid» — https://www.regeringen.se/contentassets/fc08dfb51d014b3996b719005beb146f/livsmedelsberedskap-for-en-ny-tid-sou-20248.pdf (accessedAt 2026-06-27, primary; referert via søk)
- Jordbruksverket, «Beredskapslager av spannmål och insatsvaror» — https://jordbruksverket.se/beredskap/sveriges-livsmedelsberedskap/beredskapslager-av-spannmal-och-insatsvaror (accessedAt 2026-06-27, primary; via søk)
- Oslo Economics, OE-rapport 60-2023 for NFD (bærer fra R12-RES-005) — https://www.regjeringen.no/contentassets/2617bce77a8240c784c5b4a1d55c12fd/oe-rapport-60-2023-med-vedlegg.pdf (accessedAt 2026-06-25 i R12)
</content>
</invoke>
````

