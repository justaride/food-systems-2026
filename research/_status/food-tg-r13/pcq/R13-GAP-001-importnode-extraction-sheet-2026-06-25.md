# R13-GAP-001 - importnode extraction sheet PCQ control artifact

**Dato:** 2026-06-25
**Status:** PCQ-only, ikke claim-lock
**Kildegrunnlag:** `research/external/r13/R13-GAP-001-kritiske-importnoder.md`, SSB 08801 bulkuttak
**Bruksregel:** Intern kontroll. Ikke figur, deck, whitepaper eller ekstern claim.

## Kort dom

SSB 08801 kan kontrollere import per varekode, år, mengde, verdi og opprinnelsesland. Den kan ikke alene kontrollere sluttbruk, art, samlet fôrprotein eller rent fosfatinnhold. Denne fila er derfor en uttrekksflate for HS/proxy-rader, ikke en ferdig importavhengighetsclaim.

## Radvis uttrekk

| Rad | Kilde | Lokator | År/periode | Klasse | Uttrekk | Enhet | Scope | Metodegap | Tom celle |
|---|---|---|---|---|---|---|---|---|---|
| 1 | SSB 08801 | `varenr=1201` | 2020-2025 | A | Soyabønner, 399 330 489 kg i 2025 | kg | vareimport | sluttbruk mat/fôr/industri ikke synlig | fôrandel |
| 2 | SSB 08801 | `varenr=2304` | 2020-2025 | A | Soyakaker, 13 376 619 kg i 2025 | kg | fôrrelevant proxy | viser ikke faktisk norsk sluttbruk | sluttbruk |
| 3 | SSB 08801 | `varenr=1504` | 2020-2025 | A | Fiskeolje, 201 434 800 kg i 2025 | kg | vareimport | art, fiskeri og anvendelse mangler | art/fôrbruk |
| 4 | SSB 08801 | `varenr=3105` | 2020-2025 | A/C | Bred mineralgjødsel, 39 659 814 kg i 2025 | kg | gjødselproxy | ikke rent fosfat | fosforinnhold |
| 5 | SSB 08801 | `varenr=0901` | 2020-2025 | A | Kaffe, 41 992 155 kg i 2025 | kg | importnode | re-eksport/bearbeiding må merkes | re-eksport |
| 6 | SSB 08801 | `varenr=1806` | 2020-2025 | A/C | Kakaoholdige varer, 32 998 106 kg i 2025 | kg | bearbeidet vare | sier ikke kakaobonnens opprinnelse | råvareopprinnelse |

## Kontrollert intern formulering

- SSB 08801 gir A-underlag for utvalgte importnoder per HS/proxy.
- Importnodene må omtales per varekode, ikke som én samlet kritisk importindeks.
- Sluttbruk og samlet fôrprotein skal bli stående som metode-/actor-gate til det finnes egen kilde.

## Fortsatt ikke claim-lock

| Mangler | Hvorfor det stopper claim/figur |
|---|---|
| Sluttbruk per varekode | Importstatistikk viser vareimport, ikke om varen brukes til mat, fôr, industri eller re-eksport. |
| Fôrprotein-total | Det finnes ikke én ren SSB-node som lukker total proteinimport. |
| Fiskeolje art/fiskeri | HS 1504 skiller ikke art, fangstfelt eller bærekraft. |
| Fosfatinnhold | HS 3105 er bred gjødselnode og kan ikke brukes som rent fosfatclaim. |

## Ikke si

- Ikke si at denne raden er claim-locket.
- Ikke bruk URL-status som bevis for tallinnhold.
- Ikke fyll tomme celler med estimat.
- Ikke si at SSB 08801 beviser sluttbruk i norsk fôr eller mat.
