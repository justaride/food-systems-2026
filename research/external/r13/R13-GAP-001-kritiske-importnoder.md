---
tittel: R13-GAP-001 - Kritiske importnoder
status: Batch 01 research-output - ikke claim
id: R13-GAP-001
priority: P0
theme: gap-closure
geo: NO
gate: PCQ
accessedAt: 2026-06-25
sourceClass: A med C-celler
---

# R13-GAP-001 - Kritiske importnoder

## Kort dom

SSB 08801 lukker hovedhullet fra R12 for flere konkrete importnoder: fiskeolje, soyabonner, soyakaker, kaffe, kakaobonner/kakaoprodukter og fosfat-/gjodselkoder kan trekkes som A-serier fra 2020-2025. Uttaket viser samtidig at "kritisk importnode" ikke er ett datanivaa: fosfat som raafosfat er nesten tomt, mens mineralgjodsel under HS 3105 er stort og bredere enn fosfat alene; fôrprotein-total finnes ikke som én ren HS-node. Resultatet er PCQ-klart som importnode-underlag, men bare per kode/proxy med synlige C-celler for sluttbruk, art, opprinnelig raavare og samlet fôrprotein.

## Sterkeste kilde

SSB, `Import og eksport - alle land og varenummer`, komplette nedlastbare datasett tilsvarende Statistikkbanktabell 08801. Lokator: `https://www.ssb.no/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer`. Uttak brukt: `Tab_08801_2018-2022.zip`, `Tab_08801_2023.zip`, `Tab_08801_2024.zip`, `Tab_08801_2025.zip`. SSB oppgir at `impeks=1` er import, `varenr` er tolltariffens varekode, `obland` er opprinnelsesland for import, `m1_sum` er mengde1 og `v_sum` er verdi i kroner.

## Svakeste punkt

HS-koder beviser import av varer, ikke sluttbruk i norsk matsystem. Soya- og fiskeoljekoder sier ikke om varen gikk til fôr, mat eller industri; kakao under HS 1806 er ferdig-/sammensatt vare, ikke kakaobonneavhengighet; HS 3105 er bred mineral-/kjemisk gjodsel, ikke rent fosfat. Samlet "fôrprotein" er fortsatt en metode-/aktorgate fordi SSB 08801 ikke skiller fôrsluttbruk.

## Funn-tabell

| Node | HS/proxy | 2020 kg | 2021 kg | 2022 kg | 2023 kg | 2024 kg | 2025 kg | Kildeklasse | Caveat |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| Fosfat raavare | `2510` fosfater/kalsiumfosfater | 0 | 0 | 500 | 1 000 | 21 720 | 20 886 | A | Lite/uregelmessig import; ikke total fosforavhengighet. |
| Fosfatgjodsel | `3103` mineral-/kjemisk fosfatgjodsel | 254 605 | 248 934 | 84 183 | 364 | 296 822 | 252 802 | A | Treffer fosfatgjodsel smalere enn 3105, men kan mangle blandingsgjodsel. |
| Mineralgjodsel bred | `3105` mineral-/kjemisk gjodsel med flere næringsstoffer | 91 486 901 | 107 541 029 | 48 994 315 | 32 736 571 | 34 968 296 | 39 659 814 | A/C | Stor serie, men bredere enn fosfat; ikke rent fosfatclaim. |
| Fiskeolje | `1504` fett/oljer fra fisk og marine pattedyr | 213 448 992 | 219 027 110 | 204 507 866 | 193 949 267 | 184 647 362 | 201 434 800 | A | Beviser varekode/opprinnelsesland, ikke art, fiskeri eller sluttbruk. |
| Soya | `1201` soyabonner | 412 135 090 | 461 362 930 | 308 431 021 | 362 788 141 | 347 191 043 | 399 330 489 | A | Beviser soyabonneimport, ikke fordeling mat/fôr/industri. |
| Soya | `2304` oljekaker/andre faste reststoffer av soya | 33 578 982 | 10 092 956 | 6 298 539 | 1 952 770 | 4 813 613 | 13 376 619 | A | Fôrrelevant proxy, men sluttbruk ikke direkte synlig. |
| Kaffe | `0901` kaffe | 43 766 523 | 40 425 605 | 38 905 727 | 37 777 610 | 35 668 403 | 41 992 155 | A | God importnode; skiller ikke alle re-eksport-/bearbeidingsledd. |
| Kakao | `1801` kakaobonner | 12 601 | 17 452 | 19 470 | 21 857 | 27 393 | 36 132 | A | Liten direkte bondeimport; norsk kakaoforbruk ligger trolig i bearbeidede varer. |
| Kakao | `1806` sjokolade og andre kakaoholdige næringsmidler | 30 841 515 | 31 734 666 | 33 128 558 | 34 399 412 | 33 259 151 | 32 998 106 | A | Import av bearbeidet vare, ikke raavare-/opprinnelsesclaim. |
| Fôrprotein proxy | `230120` fiskemel/-pellets | 136 714 290 | 173 549 845 | 221 356 423 | 228 143 410 | 217 991 005 | 245 338 545 | A/C | Fôrprotein-proxy, men ikke total proteinimport og ikke sikkert norsk sluttbruk. |
| Fôrprotein proxy | `2306` oljefrokaker utenom soya | 259 674 787 | 290 377 215 | 298 221 097 | 268 698 973 | 283 111 847 | 302 775 129 | A/C | Relevante proteinravarer, men flere sluttbruk og varer inngar. |
| Fôrprotein proxy | `0713` belgvekster | 233 798 221 | 282 416 309 | 334 023 334 | 334 605 051 | 302 458 393 | 311 501 443 | A/C | Mat/fôr kan ikke skilles i 08801. |

## 2025 opprinnelsesland - topp kg per node

| Node/proxy | Topp opprinnelsesland i 2025 | Caveat |
|---|---|---|
| Fosfat raavare `2510` | NL 20 434 kg, SE 238 kg, DE 200 kg, IN 14 kg | Små volum; ikke total fosforimport. |
| Fosfatgjodsel `3103` | SE 222 000 kg, FI 27 600 kg, FR 3 200 kg | Bare HS 3103, ikke blandingsgjodsel. |
| Mineralgjodsel `3105` | FI 31 203 935 kg, SE 2 888 754 kg, FR 1 192 392 kg, NL 896 089 kg, PL 636 688 kg | Bred gjodselnode. |
| Fiskeolje `1504` | PE 54 732 378 kg, DK 35 435 917 kg, MX 22 878 582 kg, US 20 356 560 kg, CL 19 677 040 kg | Art/sluttbruk ikke synlig. |
| Soyabonner `1201` | BR 167 956 153 kg, CA 151 876 439 kg, RO 31 954 140 kg, US 29 615 985 kg, PL 17 155 328 kg | Fôrandel ikke synlig. |
| Soyakaker `2304` | UA 6 698 960 kg, CN 3 137 603 kg, PL 1 792 386 kg, BR 1 484 580 kg, DK 228 630 kg | Fôrrelevant, men ikke sluttbruk. |
| Kaffe `0901` | BR 16 464 517 kg, CO 10 377 254 kg, SE 3 045 456 kg, DK 2 435 812 kg, GT 1 979 103 kg | SE/DK kan vaere re-eksport/bearbeiding. |
| Kakaobonner `1801` | PE 12 576 kg, DO 3 789 kg, NL 3 501 kg, TZ 2 461 kg, MG 1 725 kg | Små volum. |
| Kakaoprodukter `1806` | SE 7 778 940 kg, DE 4 899 835 kg, BE 3 924 794 kg, LT 3 053 142 kg, NL 2 506 556 kg | Bearbeidet vare. |

## Tomme celler

- Samlet `fôrprotein-total`: ikke én ren SSB-node; krever metodevalg og/eller aktørdata fra fôrprodusenter.
- Sluttbruk per importert vare: SSB 08801 viser varekode og opprinnelsesland, ikke om varen gikk til fôr, mat, industri eller re-eksport.
- Fiskeolje art/fiskeri: HS 1504 dokumenterer import, ikke sardinella, ansjos, lodde, laks eller fangstfelt.
- Fosfatavhengighet: HS 2510/3103/3105 gir proxyer; rent fosforinnhold og agronomisk sluttbruk krever gjodsel-/næringsstoffdata.
- Kakao opprinnelse i bearbeidede varer: HS 1806 gir produksjons-/avsenderland for importvaren, ikke kakaobonnens opprinnelse.

## Ikke si

- Ikke si at `3105` er rent fosfat; det er bred mineral-/kjemisk gjodsel.
- Ikke si at SSB 08801 beviser sluttbruk i norsk fôr eller mat.
- Ikke si at `fôrprotein-total` er lukket; bare utvalgte HS-proxyer er A-lukket.
- Ikke si at fiskeoljeimporten beviser art, fiskeri eller bærekraft.
- Ikke bland kg og kroner uten enhet, og ikke bruk 2025 som endelig serie uten foreløpig-caveat.

## Anbefalt gate

PCQ. Importnode-tabellen kan løftes som kontrollert kildeunderlag per HS/proxy. Ekstern bruk krever at figurer viser kode, år, kg, verdi, opprinnelsesland, foreløpig/endelig status og C-cellene for sluttbruk/metode.
